// AddLoan.jsx
import * as React from "react";
import {
  CssVarsProvider,
  extendTheme,
  Sheet,
  Box,
  Typography,
  Grid,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  Table,
  IconButton,
  Divider,
  Chip,
  Modal,
  ModalDialog,
  Select,
  Option,
} from "@mui/joy";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import SearchPickerModal from "../../component/SearchPickerModal";
import { useLazyGetProjectSearchDropdownQuery } from "../../redux/projectsSlice";
import { useGetDocumentByNameQuery } from "../../redux/documentSlice";

import {
  useGetUniqueBanksQuery,
  useCreateLoanMutation,
} from "../../redux/loanSlice";
import { toast } from "react-toastify";

/* ---------------- Theme ---------------- */
const theme = extendTheme({
  colorSchemes: {
    light: { palette: { background: { body: "#ffffff", surface: "#ffffff" } } },
  },
  fontFamily: {
    body: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
});

const FIRST_LIMIT = 7;
const MODAL_LIMIT = 7;
const ACCENT = "#3363a3";

/** ---------- India States & Union Territories ---------- */
const IN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const IN_UTS = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/* ---------------- Small helpers ---------------- */
function useDebounce(val, delay = 300) {
  const [v, setV] = React.useState(val);
  React.useEffect(() => {
    const id = setTimeout(() => setV(val), delay);
    return () => clearTimeout(id);
  }, [val, delay]);
  return v;
}
const labelFromRow = (r) => {
  const code = r?.code || "";
  return [code].filter(Boolean).join(", ");
};

/* ---------------- Drag & Drop Upload Modal ---------------- */
function UploadModal({ open, onClose, onPick }) {
  const [isOver, setIsOver] = React.useState(false);
  const fileRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onPick(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        layout="center"
        sx={{ p: 2, width: 520, borderRadius: "md", boxShadow: "lg" }}
      >
        <Typography level="title-md" sx={{ mb: 1 }}>
          Upload Document
        </Typography>
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            mt: 1,
            mb: 2,
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: isOver ? "primary.solidBg" : "neutral.outlinedBorder",
            borderRadius: "md",
            bgcolor: isOver ? "primary.softBg" : "neutral.softBg",
            transition: "all .15s",
            cursor: "pointer",
          }}
          onClick={() => fileRef.current?.click()}
        >
          <Typography level="body-sm">
            Drag & drop a file here, or <strong>click to browse</strong>
          </Typography>
          <input
            ref={fileRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

/* ---------------- Searchable project select ---------------- */
function SearchableSelect({
  placeholder = "Type to find a project...",
  valueLabel,
  onChangeLabel,
  options = [],
  onPickRow,
  onSearchMore,
}) {
  const rootRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(valueLabel || "");
  const debounced = useDebounce(input, 150);

  React.useEffect(() => setInput(valueLabel || ""), [valueLabel]);

  const filtered = React.useMemo(() => {
    const q = (debounced || "").toLowerCase();
    if (!q) return options;
    return options.filter((r) => labelFromRow(r).toLowerCase().includes(q));
  }, [debounced, options]);

  React.useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (row) => {
    const label = labelFromRow(row);
    onChangeLabel?.(label);
    onPickRow?.(row);
    setOpen(false);
  };

  return (
    <Box ref={rootRef} sx={{ position: "relative" }}>
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          onChangeLabel?.(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        startDecorator={<SearchRoundedIcon />}
        variant="plain"
        sx={{
          fontSize: 18,
          borderRadius: 0,
          px: 0,
          "--Input-focusedThickness": "0px",
          borderBottom: `2px solid ${ACCENT}`,
          "& input": { pb: 0.5 },
        }}
      />

      {open && (
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            zIndex: 10,
            mt: 0.5,
            left: 0,
            right: 0,
            borderRadius: "sm",
            overflow: "hidden",
            bgcolor: "#fff",
            borderColor: "#fff",
            color: "#fff",
            boxShadow:
              "0px 8px 24px rgba(0,0,0,0.25), 0 1px 0 0 rgba(255,255,255,0.06) inset",
          }}
        >
          <Box
            sx={{
              maxHeight: 240,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {filtered.map((r) => {
              const lbl = labelFromRow(r);
              return (
                <Box
                  key={String(r?._id ?? lbl)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  sx={{
                    px: 1.25,
                    py: 1,
                    cursor: "pointer",
                    borderBottom: "1px solid black",
                    "&:last-of-type": { borderBottom: "none" },
                    "&:hover": { backgroundColor: "#fff" },
                  }}
                >
                  <Typography level="body-md">{lbl}</Typography>
                </Box>
              );
            })}

            <Box
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSearchMore?.();
                setOpen(false);
              }}
              sx={{ px: 1.25, py: 1, cursor: "pointer", color: ACCENT }}
            >
              <Typography level="body-md" sx={{ fontStyle: "italic" }}>
                Search more…
              </Typography>
            </Box>
          </Box>
        </Sheet>
      )}
    </Box>
  );
}

/* ---------------- Doc title cell ---------------- */
function DocTitleCell({ value, onChange, onPickExisting, projectId }) {
  const [input, setInput] = React.useState(value || "");
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const debounced = useDebounce(input, 350);
  const skip = !projectId || !debounced?.trim();
  const { data } = useGetDocumentByNameQuery(
    { projectId, name: debounced },
    { skip }
  );
  const rows = React.useMemo(() => data?.data || [], [data]);

  React.useEffect(() => setInput(value || ""), [value]);

  React.useEffect(() => {
    const onClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (doc) => {
    const filename = (doc?.filename || "").trim();
    onChange?.(filename);
    onPickExisting?.(doc);
    setOpen(false);
  };

  return (
    <Box ref={rootRef} sx={{ position: "relative" }}>
      <Input
        placeholder="Document title (e.g., LOI)"
        value={input}
        onChange={(e) => {
          const v = e.target.value;
          setInput(v);
          onChange?.(v);
        }}
        onFocus={() => setOpen(true)}
        variant="plain"
        sx={{
          fontSize: 16,
          fontWeight: 400,
          width: "100%",
          borderRadius: 0,
          borderBottom: `2px solid ${ACCENT}`,
          "--Input-focusedThickness": "0px",
          px: 0,
          backgroundColor: "transparent",
          "&:hover": { borderBottomColor: "#3363a3" },
          "& input": { paddingBottom: "0px" },
        }}
      />

      {open && rows.length > 0 && (
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            zIndex: 8,
            left: 0,
            right: 0,
            mt: 0.5,
            borderRadius: "sm",
            overflow: "hidden",
            bgcolor: "#fff",
            borderColor: "neutral.outlinedBorder",
            boxShadow:
              "0px 8px 24px rgba(0,0,0,0.12), 0 1px 0 0 rgba(255,255,255,0.06) inset",
          }}
        >
          <Box
            sx={{
              maxHeight: 220,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {rows.map((doc, idx) => (
              <Box
                key={doc?._id || `${doc?.filename || "doc"}-${idx}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(doc)}
                sx={{
                  px: 1.25,
                  py: 1,
                  cursor: "pointer",
                  borderBottom: "1px solid var(--joy-palette-neutral-200)",
                  "&:last-of-type": { borderBottom: "none" },
                  "&:hover": { backgroundColor: "neutral.softBg" },
                }}
              >
                <Typography level="body-sm">
                  {(doc?.filename || "").trim()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Sheet>
      )}
    </Box>
  );
}

/* --------------- Presence/Upload cell ---------------- */
function DocPresenceCell({
  projectId,
  title,
  source,
  file,
  onChangePresence,
  onChangeSource,
  onFilePicked,
  onMaybeSetTitle,
  fileurl,
}) {
  const [openUpload, setOpenUpload] = React.useState(false);
  const debouncedTitle = useDebounce(title || "", 400);
  const skip = !projectId || !debouncedTitle?.trim();
  const { data } = useGetDocumentByNameQuery(
    { projectId, name: debouncedTitle },
    { skip }
  );

  const hits = data?.data || [];
  const firstUrl = fileurl || hits[0]?.fileurl;

  const isExisting = source === "existing" && !!firstUrl;
  const isUploaded = source === "uploaded";

  const handleChipClick = () => {
    if (isExisting) {
      window.open(firstUrl, "_blank", "noopener,noreferrer");
      onChangePresence?.(true);
    } else {
      setOpenUpload(true);
    }
  };

  const handlePick = (picked) => {
    onFilePicked?.(picked);
    onChangeSource?.("uploaded");
    onChangePresence?.(false);
    if (!title?.trim()) onMaybeSetTitle?.(picked?.name || "");
    setOpenUpload(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          size="sm"
          color={isExisting ? "success" : "neutral"}
          variant="soft"
          onClick={handleChipClick}
          sx={{ cursor: "pointer", userSelect: "none" }}
        >
          {isExisting ? "Present" : "Not Present"}
        </Chip>

        {!isExisting && isUploaded && file?.name && (
          <Typography level="body-sm" sx={{ color: "neutral.700" }}>
            {file.name}
          </Typography>
        )}
      </Box>

      <UploadModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onPick={handlePick}
      />
    </>
  );
}

/* ----------- Bank Name with server suggestions ----------- */
function BankNameCell({ value, onPick, accent = "#3363a3" }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(value || "");
  const debounced = useDebounce(input, 250);
  const rootRef = React.useRef(null);

  // live search to backend
  const { data } = useGetUniqueBanksQuery(
    { search: debounced },
    { skip: !debounced }
  );
  const options = React.useMemo(() => data?.data || [], [data]);

  React.useEffect(() => setInput(value || ""), [value]);

  React.useEffect(() => {
    const onClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (b) => {
    onPick?.({
      name: (b?.name || "").toUpperCase(),
      branch: b?.branch || "",
      ifsc_code: (b?.ifsc_code || "").toUpperCase(),
      state: b?.state || "",
    });
    setOpen(false);
  };

  return (
    <Box ref={rootRef} sx={{ position: "relative" }}>
      <Input
        placeholder="Bank Name"
        value={input}
        onChange={(e) => {
          const v = e.target.value;
          setInput(v);
          onPick?.({ name: v });
        }}
        onFocus={() => setOpen(true)}
        variant="plain"
        sx={{
          fontSize: 16,
          borderRadius: 0,
          px: 0,
          "--Input-focusedThickness": "0px",
          borderBottom: `2px solid ${accent}`,
          "& input": { pb: 0.5 },
        }}
      />

      {open && options.length > 0 && (
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            zIndex: 10,
            mt: 0.5,
            left: 0,
            right: 0,
            borderRadius: "sm",
            overflow: "hidden",
            bgcolor: "#fff",
            borderColor: "neutral.outlinedBorder",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Box
            sx={{
              maxHeight: 240,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {options.map((b, idx) => (
              <Box
                key={`${b.name}-${b.ifsc_code}-${idx}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(b)}
                sx={{
                  px: 1.25,
                  py: 1,
                  cursor: "pointer",
                  borderBottom: "1px solid var(--joy-palette-neutral-200)",
                  "&:last-of-type": { borderBottom: "none" },
                  "&:hover": { backgroundColor: "neutral.softBg" },
                }}
              >
                <Typography level="body-sm">
                  {(b.name || "").toUpperCase()} •{" "}
                  {(b.ifsc_code || "").toUpperCase()}
                  {b.branch ? ` • ${b.branch}` : ""}
                  {b.state ? ` • ${b.state}` : ""}
                </Typography>
              </Box>
            ))}
          </Box>
        </Sheet>
      )}
    </Box>
  );
}

/* ---------------------------- Page ---------------------------- */
export default function AddLoan() {
  const [tab, setTab] = React.useState(0);

  const [header, setHeader] = React.useState({
    project: "",
    project_id: "",
    expectedSanctionDate: "",
    expectedDisbursementDate: "",
  });

  const [docs, setDocs] = React.useState([
    { title: "", file: null, present: false, source: null, fileurl: "" },
  ]);

  const [banks, setBanks] = React.useState([
    { name: "", branch: "", ifsc_code: "", state: "" },
  ]);

  const { data: uniqueBanksResp } = useGetUniqueBanksQuery();
  const uniqueBanks = React.useMemo(
    () => uniqueBanksResp?.data || [],
    [uniqueBanksResp]
  );

  const [createLoan, { isLoading: creating }] = useCreateLoanMutation();

  const onHeader = (key) => (e, v) => {
    const value = e?.target ? e.target.value : v;
    setHeader((h) => ({ ...h, [key]: value }));
  };
  const addDoc = () =>
    setDocs((d) => [
      ...d,
      { title: "", file: null, present: false, source: null },
    ]);
  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));
  const updateDoc = (idx, key, value) =>
    setDocs((d) =>
      d.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const addBank = () =>
    setBanks((b) => [...b, { name: "", branch: "", ifsc_code: "", state: "" }]); // 👈 include state
  const removeBank = (idx) => setBanks((b) => b.filter((_, i) => i !== idx));
  const updateBank = (idx, key, value) =>
    setBanks((b) =>
      b.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const submit = async (e) => {
    e.preventDefault();

    if (!header.project_id) {
      toast.error("Pick a project first.");
      return;
    }

    if (!header.expectedSanctionDate || !header.expectedSanctionDate) {
      toast.error("Expected Disburement and Sanctioned Date are required");
      return;
    }

    try {
      const files = [];
      docs.forEach((d) => {
        if (d?.source === "uploaded" && d?.file) {
          files.push({ file: d.file, name: d.title || d.file.name });
        }
      });

      // Build links for existing docs (url + nice name)
      const links = docs
        .filter((d) => d?.source === "existing" && d?.fileurl)
        .map((d) => ({
          url: d.fileurl,
          name:
            d.title ||
            (() => {
              try {
                const seg = decodeURIComponent(
                  new URL(d.fileurl).pathname.split("/").pop() || ""
                );
                return seg || "document";
              } catch {
                return "document";
              }
            })(),
        }));

      const data = {
        expectedSanctionDate: header.expectedSanctionDate || "",
        expectedDisbursementDate: header.expectedDisbursementDate || "",
        documents: docs.map((d) => ({
          title: d.title || "",
          present: !!d.present,
          source: d.source || "",
        })),
        banking_details: banks.map((b) => ({
          name: b.name || "",
          branch: b.branch || "",
          ifsc_code: b.ifsc_code || "",
          state: b.state || "",
        })),
      };
      const res = await createLoan({
        projectId: header.project_id,
        data,
        files,
        links,
      }).unwrap();

      toast.success("Loan created successfully.");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to create loan. Check console."
      );
    }
  };

  /* -------- Projects data (first 7) & modal for more -------- */
  const [triggerSearch] = useLazyGetProjectSearchDropdownQuery();
  const [projectOptions, setProjectOptions] = React.useState([]);
  const [projectModalOpen, setProjectModalOpen] = React.useState(false);
  const debouncedProjectQuery = useDebounce(header.project, 300);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await triggerSearch(
          { search: debouncedProjectQuery || "", page: 1, limit: FIRST_LIMIT },
          true
        );
        const payload = res?.data || {};
        const rows = payload?.data || payload?.rows || [];
        if (!cancelled) setProjectOptions(rows);
      } catch {
        if (!cancelled) setProjectOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedProjectQuery, triggerSearch]);

  const loadInitialProjects = React.useCallback(async () => {
    try {
      const res = await triggerSearch(
        { search: "", page: 1, limit: FIRST_LIMIT },
        true
      );
      const payload = res?.data || {};
      const rows = payload?.data || payload?.rows || [];
      setProjectOptions(rows);
    } catch (err) {
      console.error("Initial project fetch failed:", err);
      setProjectOptions([]);
    }
  }, [triggerSearch]);

  React.useEffect(() => {
    loadInitialProjects();
  }, [loadInitialProjects]);

  const onPickProject = (row) => {
    if (!row) return;
    setHeader((h) => ({
      ...h,
      project_id: String(row._id || ""),
      project: labelFromRow(row),
    }));
  };

  const lineInputSx = {
    fontSize: 16,
    fontWeight: 400,
    width: "100%",
    borderRadius: 0,
    borderBottom: `2px solid ${ACCENT}`,
    "--Input-focusedThickness": "0px",
    px: 0,
    backgroundColor: "transparent",
    "&:hover": { borderBottomColor: "#3363a3" },
    "& input": { paddingBottom: "0px" },
  };

  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <Sheet
        variant="plain"
        sx={{
          mx: "auto",
          my: 1,
          p: 2,
          maxWidth: 1180,
          bgcolor: "#fff",
          borderRadius: "md",
          border: "1px solid var(--joy-palette-neutral-200)",
        }}
      >
        {/* Project (top) */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-md" sx={{ color: "neutral.900", mb: 0.5 }}>
            Project
          </Typography>
          <SearchableSelect
            placeholder="Type to find a project..."
            valueLabel={header.project}
            onChangeLabel={(lbl) => setHeader((h) => ({ ...h, project: lbl }))}
            options={projectOptions}
            onPickRow={onPickProject}
            onSearchMore={() => setProjectModalOpen(true)}
          />
        </Box>

        {/* Dates */}
        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid xs={12} md={6}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                rowGap: 1.5,
                columnGap: 2,
              }}
            >
              <Typography level="body-md" sx={{ color: "neutral.900" }}>
                Expected Sanctioning Date
              </Typography>
              <Input
                type="date"
                value={header.expectedSanctionDate}
                onChange={onHeader("expectedSanctionDate")}
                variant="plain"
                sx={lineInputSx}
              />
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                rowGap: 1.5,
                columnGap: 2,
              }}
            >
              <Typography level="body-md" sx={{ color: "neutral.900" }}>
                Expected Disbursement Date
              </Typography>
              <Input
                type="date"
                value={header.expectedDisbursementDate}
                onChange={onHeader("expectedDisbursementDate")}
                variant="plain"
                sx={lineInputSx}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <TabList variant="plain" sx={{ gap: 1, mb: 1 }}>
            <Tab>Documents Required</Tab>
            <Tab>Banking Details</Tab>
          </TabList>

          {/* Documents Required */}
          <TabPanel value={0} sx={{ p: 0, pt: 1 }}>
            <Table size="sm" sx={{ mb: 1.5 }}>
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Present / Upload</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {docs.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ position: "relative" }}>
                      <DocTitleCell
                        value={row.title}
                        projectId={header.project_id}
                        onChange={(v) => {
                          updateDoc(idx, "title", v);
                          if (!v || !v.trim()) {
                            updateDoc(idx, "present", false);
                            updateDoc(idx, "file", null);
                            updateDoc(idx, "source", null);
                            updateDoc(idx, "fileurl", "");
                          } else {
                            updateDoc(idx, "present", false);
                            if (row.source === "existing") {
                              updateDoc(idx, "source", null);
                              updateDoc(idx, "fileurl", "");
                            }
                          }
                        }}
                        onPickExisting={(doc) => {
                          const pickedName =
                            (doc?.filename || doc?.name || "").trim() ||
                            (doc?.fileurl
                              ? decodeURIComponent(
                                  doc.fileurl.split("/").pop() || ""
                                )
                              : "");
                          updateDoc(idx, "title", pickedName);
                          updateDoc(idx, "present", true);
                          updateDoc(idx, "source", "existing");
                          updateDoc(idx, "file", null);
                          updateDoc(idx, "fileurl", doc?.fileurl || "");
                        }}
                      />
                    </td>

                    <td>
                      <DocPresenceCell
                        projectId={header.project_id}
                        title={row.title}
                        source={row.source}
                        file={row.file}
                        fileurl={row.fileurl}
                        onChangePresence={(p) => updateDoc(idx, "present", p)}
                        onChangeSource={(s) => updateDoc(idx, "source", s)}
                        onFilePicked={(file) => updateDoc(idx, "file", file)}
                        onMaybeSetTitle={(name) =>
                          updateDoc(idx, "title", name)
                        }
                      />
                    </td>

                    <td>
                      <IconButton
                        variant="plain"
                        color="danger"
                        onClick={() => removeDoc(idx)}
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button
              startDecorator={<Add />}
              variant="plain"
              onClick={addDoc}
              sx={{ px: 0, borderRadius: 0 }}
            >
              Add documents
            </Button>
          </TabPanel>

          {/* Banking Details */}
          <TabPanel value={1} sx={{ p: 0, pt: 1 }}>
            <Table size="sm" sx={{ mb: 1.5 }}>
              <thead>
                <tr>
                  <th>Bank Name</th>
                  <th style={{ width: 200 }}>Branch</th>
                  <th style={{ width: 200 }}>IFSC Code</th>
                  <th style={{ width: 220 }}>State</th>
                  {/* 👈 new column */}
                  <th style={{ width: 40 }} />
                </tr>
              </thead>

              <tbody>
                {banks.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <BankNameCell
                        value={row.name || ""}
                        accent={ACCENT}
                        onPick={(picked) => {
                          if (picked.name !== undefined)
                            updateBank(idx, "name", picked.name);
                          if (picked.branch !== undefined)
                            updateBank(idx, "branch", picked.branch);
                          if (picked.ifsc_code !== undefined)
                            updateBank(idx, "ifsc_code", picked.ifsc_code);
                          if (picked.state !== undefined)
                            updateBank(idx, "state", picked.state); // 👈 set state if provided
                        }}
                      />
                    </td>

                    <td>
                      <Input
                        placeholder="Branch"
                        value={row.branch || ""}
                        onChange={(e) =>
                          updateBank(idx, "branch", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>

                    <td>
                      <Input
                        placeholder="IFSC"
                        value={row.ifsc_code || ""}
                        onChange={(e) =>
                          updateBank(idx, "ifsc_code", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>

                    <td>
                      <Select
                        placeholder="Select State"
                        value={row.state || ""}
                        onChange={(_, v) => updateBank(idx, "state", v || "")}
                        slotProps={{ listbox: { sx: { maxHeight: 320 } } }}
                        sx={{
                          minWidth: 200,
                          "--Select-indicatorPadding": "6px",
                          borderRadius: 0,
                          borderBottom: `2px solid ${ACCENT}`,
                          "--Select-focusedThickness": "0px",
                          "& button": { py: 0.5 },
                        }}
                      >
                        <Option value="" disabled>
                          Choose state
                        </Option>
                        {IN_STATES.map((s) => (
                          <Option key={s} value={s}>
                            {s}
                          </Option>
                        ))}
                        <Option value="__divider__" disabled>
                          — Union Territories —
                        </Option>
                        {IN_UTS.map((s) => (
                          <Option key={s} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    </td>

                    <td>
                      <IconButton
                        variant="plain"
                        color="danger"
                        onClick={() => removeBank(idx)}
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button
              startDecorator={<Add />}
              variant="plain"
              onClick={addBank}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
                px: 0,
                borderRadius: 0,
              }}
            >
              Add Banks
            </Button>

            {/* suggestions list (only rendered if we have data) */}
            {uniqueBanks.length > 0 && (
              <datalist id="bank-suggestions">
                {uniqueBanks.map((b, i) => (
                  <option key={`${b.name}-${i}`} value={b.name} />
                ))}
              </datalist>
            )}
          </TabPanel>
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {/* Footer */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            sx={{
              color: "#3363a3",
              borderColor: "#3363a3",
              backgroundColor: "transparent",
              "--Button-hoverBg": "#e0e0e0",
              "--Button-hoverBorderColor": "#3363a3",
              "&:hover": { color: "#3363a3" },
              height: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={creating}
            sx={{
              backgroundColor: "#3363a3",
              color: "#fff",
              "&:hover": { backgroundColor: "#285680" },
              height: "8px",
            }}
          >
            {creating ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Sheet>

      {/* Search Picker Modal */}
      <SearchPickerModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onPick={(row) => {
          onPickProject(row);
          setProjectModalOpen(false);
        }}
        title="Pick Projects"
        columns={[
          { key: "code", label: "Project Code" },
          { key: "name", label: "Project Name" },
        ]}
        fetchPage={async ({ page, search, pageSize }) => {
          const res = await triggerSearch(
            { search: search || "", page, limit: pageSize },
            true
          );
          const payload = res?.data || {};
          const rows = payload?.data ?? [];
          const total = payload?.pagination?.total ?? rows.length;
          return { rows, total };
        }}
        searchKey="name"
        pageSize={MODAL_LIMIT}
        rowKey="_id"
        multi={false}
      />
    </CssVarsProvider>
  );
}
