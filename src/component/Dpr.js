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
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";

// RTK Query hooks
import {
  useGetAllDprQuery,
  useUpdateDprLogMutation,
} from "../../src/redux/projectsSlice";

/** dd-mm-yyyy -> ISO (UTC midnight) */
const ddmmyyyyToISO = (s) => {
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(s).trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Date.UTC(+yyyy, +mm - 1, +dd, 0, 0, 0)).toISOString();
};

/** Detect coarse pointer (touch) to avoid hover-only UX */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e) => setCoarse(e.matches);
    setCoarse(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return coarse;
}

function DPRTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isTouch = useCoarsePointer();
  /** dd-mm-yyyy -> Date at local midnight */
  const ddmmyyyyToLocalDate = (s) => {
    if (!s) return null;
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(s).trim());
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  };

  const startOfDay = (d) =>
    d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0) : null;

  /** ceil days difference a->b, never negative */
  const daysBetween = (a, b) => {
    if (!a || !b) return 0;
    const A = startOfDay(a);
    const B = startOfDay(b);
    const ms = B.getTime() - A.getTime();
    if (ms <= 0) return 0;
    return Math.ceil(ms / (24 * 60 * 60 * 1000));
  };

  const HEADERS = [
    "Project Code",
    "Project Name",
    "Activity",
    "Work Detail",
    "Deadline",
    "Delay", // NEW COLUMN
    "Status",
    "Actions",
  ];

  // function DPRTable() {
  // const [searchParams, setSearchParams] = useSearchParams();
  const prevQueryRef = useRef(null);

  /** ===== URL-backed state ===== */
  const pageFromUrl = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10)
  );
  const pageSizeFromUrl = Math.max(
    1,
    parseInt(searchParams.get("pageSize") || "10", 10)
  );
  const searchFromUrl = searchParams.get("search") || "";
  const projectIdFromUrl = searchParams.get("projectId") || undefined;
  const fromFromUrl = searchParams.get("from") || undefined;
  const toFromUrl = searchParams.get("to") || undefined;
  const onlyWithDeadlineFromUrl =
    searchParams.get("onlyWithDeadline") || undefined;

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [expandedCard, setExpandedCard] = useState(null);
  const [actionType, setActionType] = useState("progress"); // "progress" | "idle" | "stop"

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

  /** ===== API ===== */
  const { data, isFetching, isLoading, isError, error, refetch } =
    useGetAllDprQuery({
      page: currentPage,
      limit: rowsPerPage,
      search: searchQuery || "",
      projectId: projectIdFromUrl,
      from: fromFromUrl,
      to: toFromUrl,
      onlyWithDeadline: onlyWithDeadlineFromUrl,
    });

  // mutation
  const [updateDprLog, { isLoading: isUpdating, error: updateErr }] =
    useUpdateDprLogMutation();

  /** ===== Normalize rows to match UI ===== */
  const norm = (s) => {
    const x = (s || "").toString().toLowerCase().trim();
    if (x === "completed" || x === "complete") return "completed";
    if (x === "work stopped" || x === "stopped" || x === "stop") return "stop";
    if (x === "in-progress" || x === "progress") return "progress";
    if (x === "idle") return "idle";
    return "progress";
  };

  const pageRows = useMemo(() => {
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    return rows.map((r, idx) => {
      const deadlineStr = r.deadline || null;
      const deadlineISO = deadlineStr ? ddmmyyyyToISO(deadlineStr) : null;

      // totals
      const total = Number(r.value ?? 0);
      const cumulative = Number(r.cumulative_progress ?? 0); // for bar
      const todaysSum = Number(r.todays_progress ?? 0);

      // latest log status from API (string); we also compute lifecycleCompleted
      const apiStatus = (r.dpr_status || r.status || "")
        .toString()
        .toLowerCase();

      const lifecycleCompleted = total > 0 && cumulative >= total;

      const normStatus = lifecycleCompleted
        ? "completed"
        : apiStatus === "in-progress" || apiStatus === "progress"
          ? "progress"
          : apiStatus === "work stopped" ||
            apiStatus === "stopped" ||
            apiStatus === "stop"
            ? "stop"
            : apiStatus === "idle"
              ? "idle"
              : "progress";

      // ids…
      const projectId =
        r.projectId ||
        r.project_id ||
        r.project?._id ||
        r.project?._idProject ||
        null;
      const activityId =
        r.activityId || r.activity_id || r._id || r.activity?._id || null;

      // ===== Delay calculation on FE =====
      const deadlineLocal = ddmmyyyyToLocalDate(deadlineStr);
      const todayLocal = startOfDay(new Date());

      let delayDays = 0;

      if (deadlineLocal) {
        if (normStatus === "idle" || normStatus === "stop") {
          // Not counted in these statuses
          delayDays = 0;
        } else if (normStatus === "completed") {
          // Use the date of completion and keep it fixed
          // We take r.dpr_date (dd-mm-yyyy) as the "last log date", which is when it likely completed.
          const completedStr = r.dpr_date || null;
          const completedLocal = ddmmyyyyToLocalDate(completedStr);
          if (completedLocal && completedLocal > deadlineLocal) {
            delayDays = daysBetween(deadlineLocal, completedLocal);
          } else {
            delayDays = 0;
          }
        } else {
          // In progress: compute live delay vs today
          if (todayLocal > deadlineLocal) {
            delayDays = daysBetween(deadlineLocal, todayLocal);
          }
        }
      }

      const delayText = r.delay ?? null; // optional reason text if backend ever sends

      return {
        _id:
          r._id || `${r.project_code || "p"}|${r.activity_name || "a"}|${idx}`,
        projectId,
        activityId,
        project_code: r.project_code || "-",
        project_name: r.project_name || "-",
        activity_name: r.activity_name || "-",

        // total target:
        work_completion: { value: total ?? null, unit: r.unit ?? "" },

        // cumulative done (for bar & %):
        current_work: { value: cumulative ?? null, unit: r.unit ?? "" },

        // optional: today's sum
        todays_sum: todaysSum,

        // computed delay
        delay_days: delayDays,
        delay_text: delayText,

        milestones: [],
        deadlineISO,
        deadlineStr,

        // keep status for chips & "not counted"
        status: normStatus,
      };
    });
  }, [data]);

  const total = data?.total ?? 0;
  const totalPages =
    data?.totalPages ?? Math.max(1, Math.ceil(total / rowsPerPage));

  /** ===== numbers helpers ===== */
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const getTotal = (r) => toNum(r?.work_completion?.value);
  const getCompleted = (r) => toNum(r?.current_work?.value); // cumulative now
  const getUnit = (r) =>
    (r?.work_completion?.unit || r?.current_work?.unit || "").toString();

  /** ===== search filter (client side) ===== */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pageRows;
    return pageRows.filter((r) => {
      const unit = getUnit(r);
      const val = String(r?.work_completion?.value ?? "");
      return (
        (r.activity_name || "").toLowerCase().includes(q) ||
        (r.project_code || "").toLowerCase().includes(q) ||
        (r.project_name || "").toLowerCase().includes(q) ||
        unit.toLowerCase().includes(q) ||
        val.includes(q)
      );
    });
  }, [pageRows, searchQuery]);

  /** ===== pagination (client-side over filtered) ===== */
  const startIdx = (currentPage - 1) * rowsPerPage;
  const viewRows = filtered.slice(startIdx, startIdx + rowsPerPage);

  const handlePageChange = (page) => {
    const maxPage = totalPages;
    if (page >= 1 && page <= maxPage) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("page", String(page));
        p.set("pageSize", String(rowsPerPage));
        p.set("search", searchQuery || "");
        if (projectIdFromUrl) p.set("projectId", projectIdFromUrl);
        if (fromFromUrl) p.set("from", fromFromUrl);
        if (toFromUrl) p.set("to", toFromUrl);
        if (onlyWithDeadlineFromUrl)
          p.set("onlyWithDeadline", onlyWithDeadlineFromUrl);
        return p;
      });
      setCurrentPage(page);
      setSelected([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(viewRows.map((r) => r._id));
    else setSelected([]);
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
      if (projectIdFromUrl) p.set("projectId", projectIdFromUrl);
      if (fromFromUrl) p.set("from", fromFromUrl);
      if (toFromUrl) p.set("to", toFromUrl);
      if (onlyWithDeadlineFromUrl)
        p.set("onlyWithDeadline", onlyWithDeadlineFromUrl);
      return p;
    });
    setCurrentPage(1);
  };

  /** ===== Progress bar UI ===== */
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
    {
      max: 100,
      color: "success",
      sx: {
        "--LinearProgress-progressColor": "var(--joy-palette-success-700)",
      },
      label: "100%",
    },
  ];
  const getBandFor = (pct) => {
    for (const b of PROGRESS_BANDS) if (pct <= b.max) return b;
    return PROGRESS_BANDS[PROGRESS_BANDS.length - 1];
  };
  const clamp02 = (x) => Math.max(0, Math.min(1, x));

  /** Build the explanatory text used in tooltip/inline */
  const buildWorkDetailText = (completed, total, unit, deadline) => {
    const pct = clamp02(total > 0 ? completed / total : 0);
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

    return {
      pct100,
      summary: `${completed} / ${total} ${unit || ""}`.trim(),
      daysText,
    };
  };

  /**
   * Render progress UI
   * - When inlineDetails === true (mobile), prints details under the bar (no hover)
   * - When inlineDetails === false (desktop), shows details in a hover Tooltip
   */
  const renderStatusChipCell = (s) => {
    const st = norm(s);
    const label =
      st === "completed"
        ? "Completed"
        : st === "idle"
          ? "Idle"
          : st === "stop"
            ? "Work Stopped"
            : "In progress";

    // completed -> green, idle -> grey, in progress -> orange, stop -> red
    const color =
      st === "completed"
        ? "success"
        : st === "idle"
          ? "neutral"
          : st === "stop"
            ? "danger"
            : "warning";

    return (
      <Chip variant="soft" color={color} sx={{ fontWeight: 700 }}>
        {label}
      </Chip>
    );
  };

  const renderDelayCell = (delayDays, delayText, status) => {
    const st = norm(status);
    const showNotCounted = st === "idle" || st === "stop";

    let label = "On time";
    let color = "neutral";

    if (showNotCounted) {
      label = "Not counted";
      color = "neutral";
    } else if (Number(delayDays) > 0) {
      label = `Overdue ${Number(delayDays)}d`;
      color = "danger";
    }

    const tooltip =
      delayText && String(delayText).trim()
        ? `Delay reason: ${String(delayText).trim()}`
        : showNotCounted
          ? "Delay not counted for Idle/Stopped status"
          : Number(delayDays) > 0
            ? "Deadline exceeded"
            : "No delay";

    return (
      <Tooltip title={tooltip} arrow variant="soft">
        <Chip variant="soft" color={color} sx={{ fontWeight: 700 }}>
          {label}
        </Chip>
      </Tooltip>
    );
  };

  const renderWorkPercent = (
    wc,
    tw,
    deadline,
    milestones = [],
    showPercentLabel = true,
    inlineDetails = false
  ) => {
    if (!wc || wc.value == null || !tw || tw.value == null) return "-";

    const unit = (tw.unit || wc.unit || "").toString();
    const total = Number(tw.value);
    const completed = Number(wc.value); // cumulative

    if (!Number.isFinite(total) || total <= 0) {
      return (
        <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 700 }}>
          {completed} {unit || ""}
        </Chip>
      );
    }

    const { pct100, summary, daysText } = buildWorkDetailText(
      completed,
      total,
      unit,
      deadline
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

    const Bar = (
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
    );

    if (inlineDetails) {
      // Mobile/touch: show written details below the bar
      return (
        <Box>
          {Bar}
          <Typography level="body-xs" sx={{ mt: 0.5 }}>
            <b>Progress:</b> {pct100}% &nbsp;•&nbsp; <b>Qty:</b> {summary}
          </Typography>
          <Typography level="body-xs" sx={{ mt: 0.25, color: "text.secondary" }}>
            {daysText}
          </Typography>
        </Box>
      );
    }

    // Desktop/hover: keep tooltip
    const tooltip = (
      <Box sx={{ p: 0.5 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
          Progress: {pct100}%
        </Typography>
        <Typography level="body-sm">{summary}</Typography>
        <Typography level="body-sm">{daysText}</Typography>
      </Box>
    );

    return (
      <Tooltip title={tooltip} arrow variant="soft">
        {Bar}
      </Tooltip>
    );
  };

  /** ===== DeadlineChip (dd-mm-yyyy display) ===== */
  function DeadlineChip({ dateStr, tickMs = 30000 }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), tickMs);
      return () => clearInterval(id);
    }, [tickMs]);

    const parsed = useMemo(() => {
      if (!dateStr) return null;
      const s = String(dateStr).trim();
      const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
      if (!m) return null;
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }, [dateStr]);

    if (!parsed) {
      return (
        <Chip size="sm" variant="soft" color="neutral" sx={{ fontWeight: 700 }}>
          -
        </Chip>
      );
    }

    const diff = parsed.getTime() - now;

    const abs = Math.abs(diff);
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;
    const d = Math.floor(abs / day);
    const h = Math.floor((abs % day) / hr);
    const m = Math.floor((abs % hr) / min);

    let label = "Due now";
    let color = "warning";

    if (diff > 0) {
      if (d >= 2) {
        label = `Due in ${d}d`;
        color = "primary";
      } else if (d === 1) {
        label = "Due in 1d";
        color = "warning";
      } else if (h >= 2) {
        label = `Due in ${h}h ${m}m`;
        color = "warning";
      } else if (h >= 1) {
        label = `Due in ${h}h ${m}m`;
        color = "danger";
      } else {
        label = `Due in ${m}m`;
        color = "danger";
      }
    } else if (diff < 0) {
      if (d >= 1) {
        label = `Overdue by ${d}d`;
        color = "danger";
      } else if (h >= 1) {
        label = `Overdue by ${h}h ${m}m`;
        color = "danger";
      } else {
        label = `Overdue by ${m}m`;
        color = "danger";
      }
    }

    return (
      <Tooltip arrow title={label}>
        <Chip
          size="sm"
          variant="soft"
          color={color}
          sx={{ fontWeight: 700, cursor: "default" }}
        >
          {dateStr}
        </Chip>
      </Tooltip>
    );
  }

  const DPRCard = ({ project_code, project_name }) => (
    <>
      <Box>
        <span style={{ cursor: "pointer", fontWeight: 500 }}>
          {project_code || "-"}
        </span>
      </Box>
      <Box display="flex" alignItems="center" mt={0.5}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {project_name || "-"}
        </span>
      </Box>
    </>
  );

  /** ==========================
   *  Progress Modal state
   *  ========================== */
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressRow, setProgressRow] = useState(null);
  const [progressQty, setProgressQty] = useState("");
  const [progressDate, setProgressDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [progressRemarks, setProgressRemarks] = useState("");

  const openProgressFor = (row) => {
    setProgressRow(row);
    setProgressQty("");
    setProgressDate(new Date().toISOString().slice(0, 10));
    setProgressRemarks("");

    const initial = norm(row?.status);
    setActionType(initial);
    setProgressRow({ ...row, status: initial });

    // snapshot current params so we can restore on close
    prevQueryRef.current = Object.fromEntries(searchParams.entries());

    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (row?.projectId) p.set("projectId", String(row.projectId));
      if (row?.activityId) p.set("activityId", String(row.activityId));
      return p;
    });
    setProgressOpen(true);
  };

  const closeProgress = () => {
    setProgressOpen(false);
    // optional UI resets
    setActionType("progress");
    setProgressRow(null);
    setProgressQty("");
    setProgressRemarks("");

    setSearchParams((prev) => {
      // If we captured a snapshot, restore it
      if (prevQueryRef.current) {
        const restored = new URLSearchParams(prevQueryRef.current);
        prevQueryRef.current = null;
        return restored;
      }
      // Fallback: just delete the IDs
      const p = new URLSearchParams(prev);
      p.delete("projectId");
      p.delete("activityId");
      return p;
    });
  };

  // Optimistic local update helper (cumulative)
  const applyOptimistic = ({ row, addedQty }) => {
    if (!row) return;
    row.current_work = {
      ...row.current_work,
      value: String(toNum(row.current_work?.value) + toNum(addedQty)),
    };
  };

  // input guards
  const onQtyKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  const handleQtyChange = (e) => {
    const v = e.target.value;
    if (v === "" || v == null) {
      setProgressQty("");
      return;
    }
    let n = Number(v);
    if (!Number.isFinite(n)) return;
    if (n < 0) n = 0;
    if (n > remainingCap) n = remainingCap; // hard cap
    setProgressQty(String(n));
  };

  // Main submit
  const submitWith = async (statusOverride) => {
    const row = progressRow;
    if (!row) return;

    const status = statusOverride ?? actionType ?? "progress";

    // qty is only required/used for "progress"
    const qtyNum = status === "progress" ? toNum(progressQty) : 0;

    // validation
    if (!row.projectId || !row.activityId) {
      alert(
        "Missing projectId or activityId for this row. Please check API data mapping."
      );
      return;
    }
    if (status === "progress" && (qtyNum <= 0 || qtyNum > remainingCap)) {
      alert(`Enter a valid progress quantity (0 < qty ≤ ${remainingCap}).`);
      return;
    }

    try {
      const payload = {
        projectId: row.projectId,
        activityId: row.activityId,
        todays_progress: qtyNum, // 0 for idle/stop
        date: progressDate,
        remarks: (progressRemarks || "").trim(),
        status, // "progress" | "idle" | "stop"
      };

      const res = await updateDprLog(payload).unwrap();

      // latest status from backend
      const latestBackendStatus =
        res?.updatedActivity?.dpr_log?.slice(-1)?.[0]?.status;
      const latest = norm(latestBackendStatus) || "progress";

      // update select + modal row + table row
      setActionType(latest);
      setProgressRow((prev) => (prev ? { ...prev, status: latest } : prev));
      row.status = latest;

      if (latest === "progress" && qtyNum > 0) {
        applyOptimistic({ row, addedQty: qtyNum });
      }

      // refresh list
      await refetch();

      closeProgress();
    } catch (e) {
      console.error("Update DPR Log failed:", e);
    }
  };

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

  // Is this activity already fully completed?
  const isFullyDone = useMemo(() => {
    if (!progressRow) return false;
    const total = getTotal(progressRow);
    const done = getCompleted(progressRow);
    return total > 0 && done >= total;
  }, [progressRow]);

  const remainingCap = useMemo(() => {
    if (!progressRow) return 0;
    const total = getTotal(progressRow);
    const done = getCompleted(progressRow);
    return Math.max(0, total - done);
  }, [progressRow]);

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Header row (Search only) */}
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
            <tr>
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
                    viewRows.length > 0 && selected.length === viewRows.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < viewRows.length
                  }
                />
              </th>
              {HEADERS.map((header) => (
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
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={HEADERS.length + 1} style={{ padding: "8px" }}>
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
            ) : isError ? (
              <tr>
                <td colSpan={HEADERS.length + 1} style={{ padding: "8px" }}>
                  <Typography color="danger">
                    {error?.data?.message || "Failed to load DPR data"}
                  </Typography>
                </td>
              </tr>
            ) : viewRows.length > 0 ? (
              viewRows.map((row) => (
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
                    {row.project_code || "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {row.project_name || "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {row.activity_name || "-"}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {renderWorkPercent(
                      row.current_work, // cumulative
                      row.work_completion, // total
                      row.deadlineISO,
                      row.milestones,
                      true, // showPercentLabel
                      false // inlineDetails -> desktop/table stays tooltiped
                    )}
                  </td>

                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                    <DeadlineChip dateStr={row.deadlineStr} />
                  </td>

                  {/* Delay cell (computed on FE) */}
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                    {renderDelayCell(row.delay_days, row.delay_text, row.status)}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {renderStatusChipCell(row.status)}
                  </td>

                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => openProgressFor(row)}
                    >
                      Log Today’s Progress
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={HEADERS.length + 1}
                  style={{ padding: "8px", textAlign: "left" }}
                >
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
                    <Typography fontStyle="italic">
                      No DPR entries found
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Mobile cards */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        {viewRows.length > 0 ? (
          viewRows.map((row) => (
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
                        project_code={row.project_code}
                        project_name={row.project_name}
                      />
                    </Box>
                  </Typography>
                  <DeadlineChip dateStr={row.deadlineStr} />
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
                    <Typography level="body-sm">
                      <strong>Activity:</strong> {row.activity_name}
                    </Typography>
                    <Typography level="body-sm" mt={1}>
                      <strong>Work Detail:</strong>
                    </Typography>

                    {/* On mobile, show written details (no hover) */}
                    <Typography level="body-sm" mt={0.5}>
                      {renderWorkPercent(
                        row.current_work,
                        row.work_completion,
                        row.deadlineISO,
                        row.milestones,
                        true,   // showPercentLabel
                        true    // inlineDetails -> text printed under bar
                      )}
                    </Typography>

                    {/* Delay on mobile */}
                    <Box mt={1}>
                      <Typography level="body-sm" sx={{ mb: 0.5 }}>
                        <strong>Delay:</strong>
                      </Typography>
                      {renderDelayCell(
                        row.delay_days,
                        row.delay_text,
                        row.status
                      )}
                    </Box>

                    <Box mt={1.5}>
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() => openProgressFor(row)}
                        fullWidth
                      >
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
          disabled={currentPage <= 1 || isFetching}
        >
          Previous
        </Button>

        <Box>Showing {viewRows.length} results</Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {currentPage > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={isFetching}
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
              disabled={isFetching}
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
                  if (projectIdFromUrl) p.set("projectId", projectIdFromUrl);
                  if (fromFromUrl) p.set("from", fromFromUrl);
                  if (toFromUrl) p.set("to", toFromUrl);
                  if (onlyWithDeadlineFromUrl)
                    p.set("onlyWithDeadline", onlyWithDeadlineFromUrl);
                  return p;
                });
                setSelected([]);
                setCurrentPage(1);
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
            disabled={isFetching}
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
          disabled={currentPage >= totalPages || isFetching}
        >
          Next
        </Button>
      </Box>

      {/* Modal: responsive (from earlier fix) */}
      <Modal
        open={progressOpen}
        onClose={isUpdating ? undefined : closeProgress}
        keepMounted
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1, sm: 2 },
        }}
      >
        <ModalDialog
          sx={{
            width: { xs: "100%", sm: 720 },
            maxWidth: { xs: "100%", sm: "90vw" },
            maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 64px)" },
            overflowY: "auto",
            boxShadow: { xs: "none", sm: "lg" },
            borderRadius: { xs: 0, sm: "lg" },
            p: { xs: 2, sm: 3 },
          }}
        >
          <ModalClose disabled={isUpdating} />
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
                  {progressRow?.project_code || "-"} —{" "}
                  {progressRow?.project_name || "-"}
                </Typography>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography level="title-sm" sx={{ color: "text.secondary" }}>
                  Activity
                </Typography>
                <Typography fontWeight="lg">
                  {progressRow?.activity_name || "-"}
                </Typography>
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

              const s = norm(progressRow?.status);
              const statusLabel =
                s === "completed"
                  ? "Completed"
                  : s === "idle"
                    ? "Idle"
                    : s === "stop"
                      ? "Work Stopped"
                      : "In progress";
              const statusColor =
                s === "completed"
                  ? "success"
                  : s === "idle"
                    ? "neutral"
                    : s === "stop"
                      ? "danger"
                      : "warning";

              return (
                <>
                  <Chip variant="soft" color="neutral">
                    Total: <b style={{ marginLeft: 6 }}>{total} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color="primary">
                    Done: <b style={{ marginLeft: 6 }}>{done} {unit}</b>
                  </Chip>
                  <Chip
                    variant="soft"
                    color={remain > 0 ? "warning" : "success"}
                  >
                    Remaining: <b style={{ marginLeft: 6 }}>{remain} {unit}</b>
                  </Chip>
                  <Chip variant="soft" color={statusColor}>
                    Status: <b style={{ marginLeft: 6 }}>{statusLabel}</b>
                  </Chip>
                </>
              );
            })()}
          </Box>

          {/* Form */}
          <Box
            mt={2}
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
            gap={1.5}
          >
            <FormControl>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Date
              </Typography>
              <Input
                type="date"
                value={progressDate}
                onChange={(e) => setProgressDate(e.target.value)}
                readOnly
                slotProps={{ input: { readOnly: true } }}
                sx={{ "--Input-minHeight": "40px" }}
                disabled={isUpdating}
              />
            </FormControl>

            <FormControl>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Today’s Progress ({progressRow ? getUnit(progressRow) : ""})
              </Typography>
              <Input
                type="number"
                placeholder={isFullyDone ? "Completed" : `Max ${remainingCap}`}
                value={progressQty}
                onChange={handleQtyChange}
                onKeyDown={onQtyKeyDown}
                slotProps={{
                  input: { min: 0, max: remainingCap, step: "any" },
                }}
                sx={{ "--Input-minHeight": "40px" }}
                disabled={
                  isUpdating ||
                  actionType !== "progress" || // blocks for Idle/Stop
                  isFullyDone ||
                  remainingCap <= 0
                }
              />
              <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
                Max today: {remainingCap}{" "}
                {progressRow ? getUnit(progressRow) : ""}
              </Typography>
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
                disabled={isUpdating}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>
                Status
              </Typography>
              <Select
                value={actionType}
                onChange={(_, v) => v && setActionType(v)}
                disabled={isUpdating}
                sx={{ "--Select-minHeight": "40px" }}
              >
                {/* backend enum: progress | idle | stop */}
                <Option value="progress">In progress</Option>
                <Option value="idle">Idle</Option>
                <Option value="stop">Work Stopped</Option>
              </Select>
            </Grid>
          </Box>

          {/* Live computed preview */}
          <Box mt={1.5}>
            {(() => {
              if (!progressRow) return null;
              const t = getTotal(progressRow);
              const d = getCompleted(progressRow);
              const u = getUnit(progressRow);
              const q = toNum(progressQty);
              const nd = d + q;
              const rm = Math.max(0, t - nd);
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
                    Total: <b style={{ marginLeft: 6 }}>{t} {u}</b>
                  </Chip>
                  <Chip variant="soft" color="primary">
                    Till Yesterday: <b style={{ marginLeft: 6 }}>{d} {u}</b>
                  </Chip>
                  <Chip variant="soft" color="info">
                    Today: <b style={{ marginLeft: 6 }}>{actionType === "progress" ? q || 0 : 0} {u}</b>
                  </Chip>
                  <Chip variant="soft" color={nd > t ? "danger" : "success"}>
                    New Cumulative: <b style={{ marginLeft: 6 }}>{actionType === "progress" ? nd : d} {u}</b>
                  </Chip>
                  <Chip variant="soft" color={rm > 0 ? "warning" : "success"}>
                    Remaining: <b style={{ marginLeft: 6 }}>{actionType === "progress" ? rm : Math.max(0, t - d)} {u}</b>
                  </Chip>
                </Box>
              );
            })()}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {updateErr && (
            <Typography color="danger" sx={{ mb: 1 }}>
              {updateErr?.data?.message || "Failed to submit. Please try again."}
            </Typography>
          )}

          <Box
            display="flex"
            justifyContent="space-between"
            gap={1}
            flexWrap="wrap"
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              "& > *": { width: { xs: "100%", sm: "auto" } },
            }}
          >
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant={actionType === "idle" ? "solid" : "soft"}
                color="warning"
                onClick={() => submitWith("idle")}
                disabled={isUpdating}
              >
                Mark Idle
              </Button>

              <Button
                variant={actionType === "stop" ? "solid" : "soft"}
                color="danger"
                onClick={() => submitWith("stop")}
                disabled={isUpdating}
              >
                Mark Stop
              </Button>
            </Box>

            <Box display="flex" gap={1}>
              <Button variant="plain" onClick={closeProgress} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={() => submitWith()}
                loading={isUpdating}
                disabled={
                  isUpdating ||
                  isFullyDone || // can't add more progress once completed
                  (actionType === "progress" &&
                    (remainingCap <= 0 ||
                      toNum(progressQty) <= 0 ||
                      toNum(progressQty) > remainingCap))
                }
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
