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
} from "@mui/joy";
import { iconButtonClasses } from "@mui/joy/IconButton";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";

// ----- Mock rows (replace with API later) -----
const MOCK_ROWS = [
  {
    _id: "u1-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "52", unit: "M" },      // total
    current_work: { value: "23", unit: "M" },       // completed
    milestones: [3, 14, 6],                         // 25%, 50%, 75% of total (52M)
    deadline: "242025-11-07T12:40:11.956+00:00",
  },
  {
    _id: "u2-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "percentage" }, // total (denom = 45 here)
    current_work: { value: "40", unit: "percentage" },  // completed
    milestones: [11, 15, 10],                     // 25%, 50%, 75% of 45
    deadline: "242025-11-15T12:40:11.956+00:00",
  },
  {
    _id: "u3-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Number" },  // total
    current_work: { value: "23", unit: "Number" },   // completed
    milestones: [11, 22, 34],                          // ~25%, 50%, 75% of 45
    deadline: "242025-11-05T12:40:11.956+00:00",
  },
  {
    _id: "u4-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Kg" },      // total
    current_work: { value: "9", unit: "Kg" },       // completed
    milestones: [11, 22, 34],                          // ~25%, 50%, 75% of 45
    deadline: "242025-10-29T12:40:11.956+00:00",
  },
  {
    _id: "u4-a1",
    project_code: "PRJ/code",
    project_name: "ramlal",
    activity_name: "Module Mounting Structure",
    reporting_tl: { _id: "a1", name: "ganshyam" },
    work_completion: { value: "45", unit: "Kg" },      // total
    current_work: { value: "45", unit: "Kg" },       // completed
    milestones: [11, 22, 34],                          // ~25%, 50%, 75% of 45
    deadline: "242025-10-29T12:40:11.956+00:00",
  },
];


function DPRTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== URL-backed state =====
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSizeFromUrl = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
  const searchFromUrl = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [expandedCard, setExpandedCard] = useState(null);


  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // keep local state in sync with URL nav (back/forward)
  useEffect(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const ps = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const s = searchParams.get("search") || "";
    setCurrentPage(p);
    setRowsPerPage(ps);
    setSearchQuery(s);
  }, [searchParams]);

  // ===== Selection =====
  const [selected, setSelected] = useState([]);
  const options = [1, 5, 10, 20, 50, 100];

  // ===== Data (mock now, API later) =====
  const isLoading = false; // set to true while integrating API
  const allRows = MOCK_ROWS;

  // search filter (case-insensitive on engineer/activity/unit/value)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => {
      const unit = r.work_completion?.unit ?? "";
      const val = String(r.work_completion?.value ?? "");
      return (
        (r.engineer_name || "").toLowerCase().includes(q) ||
        (r.activity_name || "").toLowerCase().includes(q) ||
        unit.toLowerCase().includes(q) ||
        val.includes(q)
      );
    });
  }, [allRows, searchQuery]);

  // pagination
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
      setSelected([]); // reset selection on page change (optional)
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(pageRows.map((r) => r._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]
    );
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



  const diffInDays = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    if (isNaN(d)) return null;
    const now = new Date();
    // ceil so partial days show as 1d
    return Math.ceil((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  };

  const PROGRESS_BANDS = [
    { max: 25, color: "danger", label: "0–25%" },         // red
    { max: 50, color: "neutral", label: "26–50%" },        // amber
    { max: 75, color: "primary", label: "51–75%" },        // blue
    { max: 99, color: "success", label: "76–99%" },        // green
    // Special case for 100%: keep 'success' but make it a bit bolder
    {
      max: 100, color: "success", sx: {
        "--LinearProgress-progressColor": "var(--joy-palette-success-700)"
      }, label: "100%"
    },
  ];

  const getBandFor = (pct) => {
    for (const b of PROGRESS_BANDS) if (pct <= b.max) return b;
    return PROGRESS_BANDS[PROGRESS_BANDS.length - 1];
  };

  const clamp02 = (x) => Math.max(0, Math.min(1, x));

  const renderWorkPercent = (
    wc, tw, deadline, milestones = [], showPercentLabel = true
  ) => {
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

    // Days info (optional)
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
        run += v;                     // accumulate
        if (run < 0) continue;        // skip negatives after accumulate (optional)
        if (run > total) break;       // stop if we exceed total (or use Math.min(run, total))
        cumulative.push(run);
      }

      // convert cumulative absolute values to % positions
      return cumulative.map((m) => Math.round((m / total) * 100));
    })();

    console.log(dotPositions);
    const band = getBandFor(pct100);

    return (
      <Tooltip title={tooltip} arrow variant="soft">
        <Box sx={{ position: "relative", minWidth: 150, pr: showPercentLabel ? 6 : 0 }}>
          <LinearProgress
            determinate
            value={pct100}
            color={band.color}       // switches at 25/50/75/100
            sx={{
              height: 10,
              borderRadius: 999,
              "--LinearProgress-radius": "999px",
              "--LinearProgress-thickness": "10px",
              // optional: make the track a bit lighter & keep dots visible
              "--LinearProgress-trackColor": "var(--joy-palette-neutral-200)",
              ...band.sx, // allow special overrides for specific bands (e.g., 100%)
            }}
          />
          {/* milestone dots */}
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

    // Your bad pattern looks like: "242025-10-29..."
    // We just DROP the leading "24" if it's followed by a 4-digit year + '-' (→ "2025-10-29...")
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

  const DPRCard = ({ currentPage, project_code, project_name }) => {

    return (
      <>
        <Box>
          <span
            style={{ cursor: "pointer", fontWeight: 500 }}
          >
            {project_code || "-"}
          </span>
        </Box>
        <Box display="flex" alignItems="center" mt={0.5}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {project_name || "-"}
          </span>
        </Box>
      </>
    )
  }

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Header row (Search only; no tabs) */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pt={2}
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
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
              placeholder="Search by ProjectId, Customer, Type, or State"
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
                  checked={
                    pageRows.length > 0 && selected.length === pageRows.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < pageRows.length
                  }
                />
              </th>
              {["Project Code", "Activity", "Reporting(TL)", "Work Detail", "Deadline"].map(
                (header) => (
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
                )
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: "8px" }}>
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
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selected.includes(row._id)}
                      onChange={() => handleRowSelect(row._id)}
                    />
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    <Tooltip title={`${row.project_code || ""} — ${row.project_name || ""}`} arrow>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "left", gap: 1, flexWrap: "wrap" }}>
                        <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 700 }}>
                          {row.project_code || "-"}
                        </Chip>
                        <Typography level="body-sm" sx={{ fontWeight: 600, pl: "4px" }}>
                          {row.project_name || "-"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {row.activity_name || "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {row.reporting_tl?.name}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {renderWorkPercent(row.current_work, row.work_completion, row.deadline, row.milestones)}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {DeadlineChip(row.deadline)}
                  </td>


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: "8px", textAlign: "left" }}>
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
      </Sheet >

      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >

        {pageRows.length > 0 ? (
          pageRows.map((row) => {

            return (
              <Card key={row._id} variant="outlined">

                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography level="title-md">
                      <Box
                        sx={{
                          display: "inline",
                          textUnderlineOffset: "2px",
                          textDecorationColor: "#999",
                        }}

                      >
                        <DPRCard
                          currentPage={currentPage}
                          project_code={row.project_code}
                          project_name={row.project_name}
                        />
                      </Box>
                    </Typography>
                    {DeadlineChip(row.deadline)}
                  </Box>

                  <Button
                    size="sm"
                    onClick={() => toggleExpand(row._id)}
                    variant="soft"
                    fullWidth
                  >
                    {expandedCard === row._id ? "Hide Details" : "View Details"}
                  </Button>

                  {expandedCard === row._id && (
                    <Box mt={2} pl={1}>
                      <Typography level="body-sm" >
                        <strong>Activity:</strong> {row.activity_name}
                      </Typography>
                      <Typography level="body-sm" mt={1}>
                        <strong>Work Detail:</strong>
                      </Typography>
                      <Typography level="body-sm" mt={1}>
                        {renderWorkPercent(row.current_work, row.work_completion, row.deadline, row.milestones)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })

        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No data available
          </Typography>
        )}

      </Box>


      {/* <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        {paginatedExpenses.length > 0 ? (
          paginatedExpenses.map((expense) => {
            const requested = Number(expense.total_requested_amount || 0);
            const approved = Number(expense.total_approved_amount || 0);
            const rejected = requested - approved;
            const disbursement = expense.disbursement_date
              ? new Date(expense.disbursement_date).toLocaleDateString("en-GB")
              : "-";
            const status =
              typeof expense.current_status === "string"
                ? expense.current_status
                : expense.current_status?.status || "";

            const remarks =
              expense.current_status?.remarks?.trim() || "No remarks provided";

            const getStatusChip = () => {
              switch (status) {
                case "draft":
                case "submitted":
                  return (
                    <Chip color="warning" variant="soft" size="sm">
                      Pending
                    </Chip>
                  );
                case "manager approval":
                  return (
                    <Chip color="info" variant="soft" size="sm">
                      Manager Approved
                    </Chip>
                  );
                case "hr approval":
                  return (
                    <Chip color="primary" variant="soft" size="sm">
                      HR Approved
                    </Chip>
                  );
                case "final approval":
                  return (
                    <Chip color="success" variant="soft" size="sm">
                      Approved
                    </Chip>
                  );
                case "hold":
                  return (
                    <Chip color="neutral" variant="soft" size="sm">
                      On Hold
                    </Chip>
                  );
                case "rejected":
                  return (
                    <>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        flexWrap="wrap"
                      >
                        <Chip variant="soft" color="danger" size="sm">
                          Rejected
                        </Chip>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => setOpen(true)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Modal open={open} onClose={() => setOpen(false)}>
                        <ModalDialog size="sm" layout="center">
                          <Typography level="title-md" mb={1}>
                            Rejection Reason
                          </Typography>
                          <Typography level="body-sm">{remarks}</Typography>
                        </ModalDialog>
                      </Modal>
                    </>
                  );
                default:
                  return (
                    <Chip variant="outlined" size="sm">
                      -
                    </Chip>
                  );
              }
            };

            return (
              <Card key={expense._id} variant="outlined">
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography level="title-md">
                      <Box
                        sx={{
                          display: "inline",

                          textUnderlineOffset: "2px",
                          textDecorationColor: "#999",
                        }}
                      >
                        <ExpenseCode
                          currentPage={currentPage}
                          expense_code={expense.expense_code}
                          createdAt={expense.createdAt}
                        />
                      </Box>
                    </Typography>
                    {getStatusChip()}
                  </Box>

                  <Button
                    size="sm"
                    onClick={() => toggleExpand(expense._id)}
                    variant="soft"
                    fullWidth
                  >
                    {expandedCard === expense._id
                      ? "Hide Details"
                      : "View Details"}
                  </Button>

                  {expandedCard === expense._id && (
                    <Box mt={1} pl={1}>
                      <Typography level="body-sm">
                        <strong>Requested:</strong> {requested}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Approved:</strong> {approved}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Rejected:</strong>{" "}
                        {isNaN(rejected) ? "0" : rejected}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Disbursement Date:</strong> {disbursement}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Typography textAlign="center" fontStyle="italic">
            No data available
          </Typography>
        )}
      </Box> */}

      {/* Pagination */}
      < Box
        className="Pagination-laptopUp"
        sx={{
          pt: 0.5,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }
        }
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
      </Box >
    </Box >
  );
}

export default DPRTable;
