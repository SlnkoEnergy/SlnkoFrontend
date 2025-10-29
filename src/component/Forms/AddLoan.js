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
} from "@mui/joy";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import SearchPickerModal from "../../component/SearchPickerModal";
import { useLazyGetProjectSearchDropdownQuery } from "../../redux/projectsSlice";

// --- light/white theme ---
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: { body: "#ffffff", surface: "#ffffff" },
      },
    },
  },
  fontFamily: {
    body: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
});

const FIRST_LIMIT = 7;
const MODAL_LIMIT = 7;
const ACCENT = "#3363a3";

/* ---------------------- Small helpers ---------------------- */
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

/* ---------------- Styled, typeable dropdown ---------------- */
function SearchableSelect({
  placeholder = "Type to find a project...",
  valueLabel,
  onChangeLabel,
  options = [],
  onPickRow,
  onSearchMore,
}) {
  const rootRef = React.useRef(null);
  const listRef = React.useRef(null);

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(valueLabel || "");
  const debounced = useDebounce(input, 150);

  React.useEffect(() => {
    setInput(valueLabel || "");
  }, [valueLabel]);

  const filtered = React.useMemo(() => {
    const q = (debounced || "").toLowerCase();
    if (!q) return options;
    return options.filter((r) => labelFromRow(r).toLowerCase().includes(q));
  }, [debounced, options]);

  const [highlight, setHighlight] = React.useState(-1);
  React.useEffect(() => setHighlight(-1), [filtered.length, open]);

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

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length)); // +1 is "Search more..."
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight === filtered.length) {
        onSearchMore?.();
        setOpen(false);
        return;
      }
      if (highlight >= 0 && highlight < filtered.length) {
        choose(filtered[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
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
        onKeyDown={onKeyDown}
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
          ref={listRef}
          variant="outlined"
          sx={{
            position: "absolute",
            zIndex: 10,
            mt: 0.5,
            left: 0,
            right: 0,
            borderRadius: "sm",
            overflow: "hidden",
            // dark popup styling like screenshot
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
            {filtered.map((r, idx) => {
              const lbl = labelFromRow(r);
              const active = idx === highlight;
              return (
                <Box
                  key={String(r?._id ?? lbl)}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseLeave={() => setHighlight(-1)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  sx={{
                    px: 1.25,
                    py: 1,
                    cursor: "pointer",
                    borderBottom: "1px solid black",
                    backgroundColor: active ? "#fff" : "#fff",
                    "&:hover": { backgroundColor: "#fff" },
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Typography level="body-md">{lbl}</Typography>
                </Box>
              );
            })}

            {/* Search more... */}
            <Box
              onMouseEnter={() => setHighlight(filtered.length)}
              onMouseLeave={() => setHighlight(-1)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSearchMore?.();
                setOpen(false);
              }}
              sx={{
                px: 1.25,
                py: 1,
                cursor: "pointer",
                color: ACCENT,
              }}
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

/* ---------------------------- Page ---------------------------- */
export default function AddLoan() {
  const [tab, setTab] = React.useState(0);

  const [header, setHeader] = React.useState({
    orderNumber: "S00001",
    customer: "SlnkoEnergy, Siddharth Singh",
    project: "",
    project_id: "",
    orderDate: "",
    pricelist: "Default (INR)",
    paymentTerms: "21 Days",
    rentalStart: "",
    rentalEnd: "",
    durationDays: 1,
    expectedSanctionDate: "",
    expectedDisbursementDate: "",
  });

  const [docs, setDocs] = React.useState([
    { title: "Booking Fees Receipt", file: null },
  ]);
  const onHeader = (key) => (e, v) => {
    const value = e?.target ? e.target.value : v;
    setHeader((h) => ({ ...h, [key]: value }));
  };
  const addDoc = () => setDocs((d) => [...d, { title: "", file: null }]);
  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));
  const updateDoc = (idx, key, value) =>
    setDocs((d) =>
      d.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(header).forEach(([k, v]) => fd.append(k, v ?? ""));
    docs.forEach((d, i) => {
      fd.append(`documents[${i}][title]`, d.title || "");
      if (d.file) fd.append(`documents[${i}][file]`, d.file);
    });
    console.log("Submitting…");
    for (const [k, v] of fd.entries()) console.log(k, v);
    alert("Form payload logged in console.");
  };

  // ---- Project options (first 7) + modal fetch for more ----
  const [triggerSearch] = useLazyGetProjectSearchDropdownQuery();
  const [projectOptions, setProjectOptions] = React.useState([]);
  const [projectTotal, setProjectTotal] = React.useState(0);
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
        const total =
          payload?.total ??
          Number(res?.meta?.total) ??
          Number(res?.data?.total) ??
          rows.length;

        if (!cancelled) {
          setProjectOptions(rows);
          setProjectTotal(Number(total) || rows.length);
        }
      } catch (e) {
        if (!cancelled) {
          setProjectOptions([]);
          setProjectTotal(0);
        }
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
      const total = payload?.total ?? rows.length;
      setProjectOptions(rows);
      setProjectTotal(Number(total) || rows.length);
    } catch (err) {
      console.error("Initial project fetch failed:", err);
      setProjectOptions([]);
      setProjectTotal(0);
    }
  }, [triggerSearch]);

  React.useEffect(() => {
    loadInitialProjects();
  }, [loadInitialProjects]);

  const fetchProjectsPage = async ({ page, search, pageSize }) => {
    const res = await triggerSearch(
      { search: search || "", page, limit: pageSize },
      true
    );

    // RTK Query lazy trigger returns { data, ... }
    const rows = res?.data?.data ?? [];
    const pg = res?.data?.pagination;
    let total = pg?.total;

    // Fallback: if backend omitted total (shouldn’t in your case), synthesize it
    if (!Number.isFinite(total)) {
      total = page * pageSize + (rows.length === pageSize ? 1 : 0);
    }

    return { rows, total };
  };

  const onPickProject = (row) => {
    if (!row) return;
    setHeader((h) => ({
      ...h,
      project_id: String(row._id || ""),
      project: labelFromRow(row),
    }));
  };

  // “line-like” inputs
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
        {/* Project (top) — styled, typeable dropdown with Search more… */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-md" sx={{ color: "neutral.900", mb: 0.5 }}>
            Project
          </Typography>

          <SearchableSelect
            placeholder="Type to find a project..."
            valueLabel={header.project}
            onChangeLabel={(lbl) => setHeader((h) => ({ ...h, project: lbl }))}
            options={projectOptions}
            onPickRow={(row) => onPickProject(row)}
            onSearchMore={() => setProjectModalOpen(true)}
          />
        </Box>

        {/* Grid of details */}
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
                  <th style={{ width: 360 }}>Received</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {docs.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Input
                        placeholder="e.g., Booking Fees Receipt"
                        value={row.title}
                        onChange={(e) =>
                          updateDoc(idx, "title", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>
                    <td>
                      <Input
                        placeholder="Attach / mark as received"
                        value={row.received || ""}
                        onChange={(e) =>
                          updateDoc(idx, "received", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
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
                  <th style={{ width: 200 }}>State</th>
                  <th style={{ width: 200 }}>IFSC Code</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {docs.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <Input
                        placeholder="Bank Name"
                        value={row.bank_name || ""}
                        onChange={(e) =>
                          updateDoc(idx, "bank_name", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>
                    <td>
                      <Input
                        placeholder="Branch"
                        value={row.branch || ""}
                        onChange={(e) =>
                          updateDoc(idx, "branch", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>
                    <td>
                      <Input
                        placeholder="State"
                        value={row.state || ""}
                        onChange={(e) =>
                          updateDoc(idx, "state", e.target.value)
                        }
                        variant="plain"
                        sx={lineInputSx}
                      />
                    </td>
                    <td>
                      <Input
                        placeholder="IFSC"
                        value={row.ifsc || ""}
                        onChange={(e) => updateDoc(idx, "ifsc", e.target.value)}
                        variant="plain"
                        sx={lineInputSx}
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
          </TabPanel>
        </Tabs>

        <Divider sx={{ my: 2 }} />

        {/* Footer buttons */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            sx={{
              color: "#3366a3",
              borderColor: "#3366a3",
              backgroundColor: "transparent",
              "--Button-hoverBg": "#e0e0e0",
              "--Button-hoverBorderColor": "#3366a3",
              "&:hover": { color: "#3366a3" },
              height: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            sx={{
              backgroundColor: "#3366a3",
              color: "#fff",
              "&:hover": { backgroundColor: "#285680" },
              height: "8px",
            }}
          >
            Save
          </Button>
        </Box>
      </Sheet>

      {/* ---- Search Picker Modal (from “Search more…”) ---- */}
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
          console.log({ payload });
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
