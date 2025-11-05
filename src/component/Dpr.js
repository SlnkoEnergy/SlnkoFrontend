// pages/DPRTable.jsx
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  Input,
  Option,
  Select,
  Sheet,
  Tooltip,
  Typography,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Modal,
  ModalDialog,
  ModalClose,
  Divider,
  Textarea,
  Grid,
} from "@mui/joy";
import { iconButtonClasses } from "@mui/joy/IconButton";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";

/** ---------- Mock rows (replace with API later) ---------- */
const MOCK_ROWS = [
  {
    _id: "u1-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "52", unit: "M" },           // total planned
    current_work: { value: "23", unit: "M" },              // completed till date
    milestones: [3, 14, 6],                                 // deltas (sum to checkpoints)
    deadline: "242025-11-07T12:40:11.956+00:00",
  },
  {
    _id: "u2-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "percentage" },   // total/denominator = 45
    current_work: { value: "40", unit: "percentage" },      // completed till date
    milestones: [11, 15, 10],
    deadline: "242025-11-15T12:40:11.956+00:00",
  },
  {
    _id: "u3-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Number" },
    current_work: { value: "23", unit: "Number" },
    milestones: [11, 22, 34],
    deadline: "242025-11-05T12:40:11.956+00:00",
  },
  {
    _id: "u4-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Kg" },
    current_work: { value: "9", unit: "Kg" },
    milestones: [11, 22, 34],
    deadline: "242025-10-29T12:40:11.956+00:00",
  },
  {
    _id: "u4-a2", // fixed duplicate id
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Kg" },
    current_work: { value: "45", unit: "Kg" },
    milestones: [11, 22, 34],
    deadline: "242025-10-29T12:40:11.956+00:00",
  },
];

function DPRTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  /** ===== URL-backed state ===== */
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSizeFromUrl = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
  const searchFromUrl = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [expandedCard, setExpandedCard] = useState(null);
  const [actionType, setActionType] = useState("progress"); // "progress" | "idle" | "stop"


  // NEW: make rows stateful so we can update after logging progress
  const [rows, setRows] = useState(MOCK_ROWS);

  const toggleExpand = (id) => setExpandedCard(expandedCard === id ? null : id);

  // keep local state in sync with URL nav (back/forward)
  useEffect(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const ps = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const s = searchParams.get("search") || "";
    setCurrentPage(p);
    setRowsPerPage(ps);
    setSearchQuery(s);
  }, [searchParams]);

  /** ===== Selection ===== */
  const [selected, setSelected] = useState([]);
  const options = [1, 5, 10, 20, 50, 100];

  /** ===== Data (mock now, API later) ===== */
  const isLoading = false; // set to true while integrating API
  const allRows = rows;

  /** ===== Helpers for units & numbers ===== */
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getTotal = (r) => toNum(r?.work_completion?.value);
  const getCompleted = (r) => toNum(r?.current_work?.value);
  const getUnit = (r) => (r?.work_completion?.unit || r?.current_work?.unit || "").toString();

  /** ===== search filter (case-insensitive) ===== */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => {
      const unit = getUnit(r);
      const val = String(r?.work_completion?.value ?? "");
      return (
        (r.engineer_name || "").toLowerCase().includes(q) ||
        (r.activity_name || "").toLowerCase().includes(q) ||
        (r.project_code || "").toLowerCase().includes(q) ||
        (r.project_name || "").toLowerCase().includes(q) ||
        unit.toLowerCase().includes(q) ||
        val.includes(q)
      );
    });
  }, [allRows, searchQuery]);

  /** ===== pagination ===== */
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(startIdx, startIdx + rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("page", String(page));
        p.set("pageSize", String(rowsPerPage));
        p.set("search", searchQuery || "");
        return p;
      });
      setCurrentPage(page);
      setSelected([]);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelected(pageRows.map((r) => r._id));
    else setSelected([]);
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) => (prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]));
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("search", query);
      p.set("page", "1");
      p.set("pageSize", String(rowsPerPage));
      return p;
    });
    setCurrentPage(1);
  };

  /** ===== Dates & Progress UI ===== */
  const diffInDays = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    if (isNaN(d)) return null;
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  };

  const PROGRESS_BANDS = [
    { max: 25, color: "danger", label: "0–25%" },
    { max: 50, color: "neutral", label: "26–50%" },
    { max: 75, color: "primary", label: "51–75%" },
    { max: 99, color: "success", label: "76–99%" },
    { max: 100, color: "success", sx: { "--LinearProgress-progressColor": "var(--joy-palette-success-700)" }, label: "100%" },
  ];

  const getBandFor = (pct) => {
    for (const b of PROGRESS_BANDS) if (pct <= b.max) return b;
    return PROGRESS_BANDS[PROGRESS_BANDS.length - 1];
  };

  const clamp02 = (x) => Math.max(0, Math.min(1, x));

  const renderWorkPercent = (wc, tw, deadline, milestones = [], showPercentLabel = true) => {
    if (!wc || wc.value == null || !tw || tw.value == null) return "-";

    const unit = (tw.unit || wc.unit || "").toString();
    const total = Number(tw.value);
    const completed = Number(wc.value);

    if (!Number.isFinite(total) || total <= 0) {
      return (
        <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 700 }}>
          {completed} {unit || ""}
        </Chip>
      );
    }

    const pct = clamp02(completed / total);
    const pct100 = Math.round(pct * 100);

    const days = diffInDays(deadline);
    const daysText =
      days == null
        ? "No deadline"
        : days > 0
          ? `${days} day${days === 1 ? "" : "s"} left`
          : days === 0
            ? "Due today"
            : `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;

    const tooltip = (
      <Box sx={{ p: 0.5 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
          Progress: {pct100}%
        </Typography>
        <Typography level="body-sm">
          {completed} / {total} {unit || ""}
        </Typography>
        <Typography level="body-sm">{daysText}</Typography>
      </Box>
    );

    const dotPositions = (() => {
      const deltas = Array.isArray(milestones) ? milestones : [];
      let run = 0;
      const cumulative = [];
      for (const x of deltas) {
        const v = Number(x);
        if (!Number.isFinite(v)) continue;
        run += v;
        if (run < 0) continue;
        if (run > total) break;
        cumulative.push(run);
      }
      return cumulative.map((m) => Math.round((m / total) * 100));
    })();

    const band = getBandFor(pct100);

    return (
      <Tooltip title={tooltip} arrow variant="soft">
        <Box sx={{ position: "relative", minWidth: 150, pr: showPercentLabel ? 6 : 0 }}>
          <LinearProgress
            determinate
            value={pct100}
            color={band.color}
            sx={{
              height: 10,
              borderRadius: 999,
              "--LinearProgress-radius": "999px",
              "--LinearProgress-thickness": "10px",
              "--LinearProgress-trackColor": "var(--joy-palette-neutral-200)",
              ...band.sx,
            }}
          />
          {dotPositions.map((leftPct, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                top: "50%",
                left: `calc(${leftPct}% - 4px)`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "neutral.outlinedBorder",
                boxShadow: "0 0 0 2px var(--joy-palette-background-body)",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          ))}
          {showPercentLabel && (
            <Typography
              level="body-xs"
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: 700,
                color: "neutral.plainColor",
                minWidth: 36,
                textAlign: "right",
              }}
            >
              {pct100}%
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  };

  const repairDeadlineString = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^24(?=\d{4}-\d{2}-\d{2}T)/.test(s)) {
      return s.replace(/^24(?=\d{4}-\d{2}-\d{2}T)/, "");
    }
    return s;
  };

  const parseSafeDate = (raw) => {
    const repaired = repairDeadlineString(raw);
    if (!repaired) return null;
    const d = new Date(repaired);
    return isNaN(d.getTime()) ? null : d;
  };

  const fmtAbs = (d) =>
    d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const humanCountdown = (msDiff) => {
    const abs = Math.abs(msDiff);
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;
    const d = Math.floor(abs / day);
    const h = Math.floor((abs % day) / hr);
    const m = Math.floor((abs % hr) / min);

    if (msDiff > 0) {
      if (d >= 2) return { label: `Due in ${d}d`, color: "primary" };
      if (d === 1) return { label: "Due in 1d", color: "warning" };
      if (h >= 2) return { label: `Due in ${h}h ${m}m`, color: "warning" };
      if (h >= 1) return { label: `Due in ${h}h ${m}m`, color: "danger" };
      return { label: `Due in ${m}m`, color: "danger" };
    } else if (msDiff < 0) {
      if (d >= 1) return { label: `Overdue by ${d}d`, color: "danger" };
      if (h >= 1) return { label: `Overdue by ${h}h ${m}m`, color: "danger" };
      return { label: `Overdue by ${m}m`, color: "danger" };
    }
    return { label: "Due now", color: "warning" };
  };

  const DeadlineChip = (deadline, tickMs = 30000) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), tickMs);
      return () => clearInterval(id);
    }, [tickMs]);

    const parsed = useMemo(() => parseSafeDate(deadline), [deadline]);
    if (!parsed) {
      return (
        <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 700 }}>
          -
        </Chip>
      );
    }
    const diff = parsed.getTime() - now;
    const { label, color } = humanCountdown(diff);

    return (
      <Tooltip arrow title={fmtAbs(parsed)}>
        <Chip size="sm" variant="soft" color={color} sx={{ fontWeight: 700 }}>
          {label}
        </Chip>
      </Tooltip>
    );
  };

  const DPRCard = ({ project_code, project_name }) => (
    <>
      <Box>
        <span style={{ cursor: "pointer", fontWeight: 500 }}>{project_code || "-"}</span>
      </Box>
      <Box display="flex" alignItems="center" mt={0.5}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{project_name || "-"}</span>
      </Box>
    </>
  );

  /** ==========================
   *  NEW: Progress Modal state
   *  ========================== */
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressRow, setProgressRow] = useState(null);
  const [progressQty, setProgressQty] = useState("");
  const [progressDate, setProgressDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [progressRemarks, setProgressRemarks] = useState("");

  const openProgressFor = (row) => {
    setProgressRow(row);
    setProgressQty("");
    setProgressDate(new Date().toISOString().slice(0, 10));
    setProgressRemarks("");
    setProgressOpen(true);
  };
  const closeProgress = () => setProgressOpen(false);

  const computedModalNumbers = () => {
    if (!progressRow) return { total: 0, done: 0, remain: 0, unit: "" };
    const total = getTotal(progressRow);
    const done = getCompleted(progressRow);
    const unit = getUnit(progressRow);
    const qty = toNum(progressQty);
    const newDone = done + qty;
    const remain = Math.max(0, total - newDone);
    return { total, done, remain, unit, qty, newDone };
  };

  // const handleSubmitProgress = async () => {
  //   if (!progressRow) return;

  //   const { total, done, unit, qty, newDone } = computedModalNumbers();

  //   if (!Number.isFinite(qty) || qty <= 0) {
  //     alert("Enter a valid progress quantity (> 0).");
  //     return;
  //   }

  //   // If unit is "percentage" but denominator is not 100, we still respect your data model:
  //   // `total` is denominator, so newDone must not exceed total unless you want to allow overshoot.
  //   if (newDone > total) {
  //     const ok = confirm(
  //       `This will exceed the total (${newDone} > ${total} ${unit}). Continue?`
  //     );
  //     if (!ok) return;
  //   }

  //   // --- Build payload for API (replace with your real fields) ---
  //   const payload = {
  //     activity_id: progressRow._id,
  //     project_code: progressRow.project_code,
  //     project_name: progressRow.project_name,
  //     activity_name: progressRow.activity_name,
  //     unit,
  //     total_planned: total,
  //     completed_till_yesterday: done,
  //     today_progress: qty,
  //     new_cumulative: newDone,
  //     date: progressDate, // YYYY-MM-DD
  //     remarks: progressRemarks.trim(),
  //   };

  //   console.log("Submitting progress payload:", payload);

  //   /** Example axios call (uncomment & replace URL + auth)
  //    *
  //    * try {
  //    *   await axios.post("/v1/dpr/log-progress", payload, { headers: { Authorization: `Bearer ${token}` }});
  //    * } catch (err) {
  //    *   console.error(err);
  //    *   return alert(err?.response?.data?.message || "Failed to submit progress");
  //    * }
  //    */

  //   // Update UI locally (until API integration):
  //   setRows((prev) =>
  //     prev.map((r) =>
  //       r._id === progressRow._id
  //         ? {
  //           ...r,
  //           current_work: { ...r.current_work, value: String(newDone) },
  //         }
  //         : r
  //     )
  //   );

  //   closeProgress();
  // };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Header row (Search only; no tabs) */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" pt={2} pb={0.5} flexWrap="wrap" gap={1}>
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by Project Id, Customer, Type, or State"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: "66vh",
          overflowY: "auto",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                  width: 48,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={pageRows.length > 0 && selected.length === pageRows.length}
                  onChange={handleSelectAll}
                  indeterminate={selected.length > 0 && selected.length < pageRows.length}
                />
              </th>
              {["Project Code", "Project Name", "Activity", "Work Detail", "Deadline", "Actions"].map((header) => (
                <th
                  key={header}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#e0e0e0",
                    zIndex: 2,
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: "8px" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ mb: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : pageRows.length > 0 ? (
              pageRows.map((row) => (
                <tr key={row._id}>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(row._id)}
                      onChange={() => handleRowSelect(row._id)}
                    />
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{row.project_code || "-"}</td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{row.project_name || "-"}</td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{row.activity_name || "-"}</td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {renderWorkPercent(row.current_work, row.work_completion, row.deadline, row.milestones)}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>{DeadlineChip(row.deadline)}</td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    <Button size="sm" variant="soft" onClick={() => openProgressFor(row)}>
                      Log Today’s Progress
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "8px", textAlign: "left" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginBottom: "8px",
                      }}
                    />
                    <Typography fontStyle="italic">No DPR entries found</Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Mobile cards */}
      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 2, p: 2 }}>
        {pageRows.length > 0 ? (
          pageRows.map((row) => (
            <Card key={row._id} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography level="title-md">
                    <Box
                      sx={{
                        display: "inline",
                        textUnderlineOffset: "2px",
                        textDecorationColor: "#999",
                      }}
                    >
                      <DPRCard project_code={row.project_code} project_name={row.project_name} />
                    </Box>
                  </Typography>
                  {DeadlineChip(row.deadline)}
                </Box>

                <Button size="sm" onClick={() => toggleExpand(row._id)} variant="soft" fullWidth>
                  {expandedCard === row._id ? "Hide Details" : "View Details"}
                </Button>

                {expandedCard === row._id && (
                  <Box mt={2} pl={1}>
                    <Typography level="body-sm">
                      <strong>Activity:</strong> {row.activity_name}
                    </Typography>
                    <Typography level="body-sm" mt={1}>
                      <strong>Work Detail:</strong>
                    </Typography>
                    <Typography level="body-sm" mt={1}>
                      {renderWorkPercent(row.current_work, row.work_completion, row.deadline, row.milestones)}
                    </Typography>

                    <Box mt={1.5}>
                      <Button size="sm" variant="soft" onClick={() => openProgressFor(row)} fullWidth>
                        Log Today’s Progress
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No data available
          </Typography>
        )}
      </Box>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 0.5,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        <Box>Showing {pageRows.length} results</Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
          {currentPage > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1}
            </IconButton>
          )}

          <IconButton size="sm" variant="solid" color="neutral">
            {currentPage}
          </IconButton>

          {currentPage + 1 <= totalPages && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1}
            </IconButton>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1} sx={{ p: "8px 16px" }}>
          <Select
            value={rowsPerPage}
            onChange={(_, v) => {
              if (v != null) {
                setRowsPerPage(v);
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set("pageSize", String(v));
                  p.set("page", "1");
                  p.set("search", searchQuery || "");
                  return p;
                });
                setCurrentPage(1);
                setSelected([]);
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {options.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Box>

      {/* ==============================
          NEW: Log Progress Modal
         ============================== */}
      <Modal open={progressOpen} onClose={closeProgress}>
        <ModalDialog sx={{ maxWidth: 720, width: "96vw" }}>
          <ModalClose />
          <Typography level="h5" fontWeight="lg">
            Log Today’s Progress
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
            Capture today’s completed quantity with optional remarks.
          </Typography>

          <Divider />

          {/* Summary: project & activity */}
          <Box mt={1}>
            <Grid container spacing={1.5}>
              <Grid xs={12} md={6}>
                <Typography level="title-sm" sx={{ color: "text.secondary" }}>
                  Project
                </Typography>
                <Typography fontWeight="lg">
                  {progressRow?.project_code || "-"} — {progressRow?.project_name || "-"}
                </Typography>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography level="title-sm" sx={{ color: "text.secondary" }}>
                  Activity
                </Typography>
                <Typography fontWeight="lg">{progressRow?.activity_name || "-"}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Past progress chips */}
          <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
            {(() => {
              const total = progressRow ? getTotal(progressRow) : 0;
              const done = progressRow ? getCompleted(progressRow) : 0;
              const unit = progressRow ? getUnit(progressRow) : "";
              const remain = Math.max(0, total - done);
              return (
                <>
                  <Chip variant="soft" color="neutral">
                    Total: <b style={{ marginLeft: 6 }}>{total} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color="primary">
                    Done: <b style={{ marginLeft: 6 }}>{done} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color={remain > 0 ? "warning" : "success"}>
                    Remaining: <b style={{ marginLeft: 6 }}>{remain} {unit}</b>
                  </Chip>
                </>
              );
            })()}
          </Box>

          {/* Form */}
          <Box mt={2} display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={1.5}>
            <FormControl>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Date
              </Typography>
              <Input
                type="date"
                value={progressDate}
                onChange={(e) => setProgressDate(e.target.value)} // will not fire when disabled
                readOnly
                slotProps={{ input: { readOnly: true } }}
                sx={{ "--Input-minHeight": "40px" }}
              />

            </FormControl>

            <FormControl>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Today’s Progress ({progressRow ? getUnit(progressRow) : ""})
              </Typography>
              <Input
                type="number"
                placeholder={`e.g. 30`}
                value={progressQty}
                onChange={(e) => setProgressQty(e.target.value)}
                slotProps={{ input: { min: 0, step: "any" } }}
                sx={{ "--Input-minHeight": "40px" }}
              />
            </FormControl>

            <Grid xs={12}>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Remarks (optional)
              </Typography>
              <Textarea
                minRows={2}
                placeholder="Any notes about today’s work…"
                value={progressRemarks}
                onChange={(e) => setProgressRemarks(e.target.value)}
              />
            </Grid>
          </Box>

          {/* Live computed preview */}
          <Box mt={1.5}>
            {(() => {
              const { total, done, unit, qty, newDone, remain } = computedModalNumbers();
              if (!progressRow) return null;
              return (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "sm",
                    bgcolor: "background.level1",
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Chip variant="soft" color="neutral">
                    Total: <b style={{ marginLeft: 6 }}>{total} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color="primary">
                    Till Yesterday: <b style={{ marginLeft: 6 }}>{done} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color="info">
                    Today: <b style={{ marginLeft: 6 }}>{qty || 0} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color={newDone > total ? "danger" : "success"}>
                    New Cumulative: <b style={{ marginLeft: 6 }}>{newDone} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color={remain > 0 ? "warning" : "success"}>
                    Remaining: <b style={{ marginLeft: 6 }}>{Math.max(0, total - newDone)} {unit}</b>
                  </Chip>
                </Box>
              );
            })()}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box display="flex" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant={actionType === "idle" ? "solid" : "soft"}
                color="warning"
                onClick={() => {
                  setActionType("idle");
                  // handleSubmitProgress("idle");
                }}
              >
                Mark Idle
              </Button>

              <Button
                variant={actionType === "stop" ? "solid" : "soft"}
                color="danger"
                onClick={() => {
                  setActionType("stop");
                  // handleSubmitProgress("stop");
                }}
              >
                Mark Stop
              </Button>
            </Box>

            <Box display="flex" gap={1}>
              <Button variant="plain" onClick={closeProgress}>
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={() => {
                  setActionType("progress");
                  // handleSubmitProgress("progress");
                }}
              >
                Submit Progress
              </Button>
            </Box>
          </Box>

        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default DPRTable;
