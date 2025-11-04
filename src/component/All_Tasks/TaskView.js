// Dash_task.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/joy/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";
import NoData from "../../assets/alert-bell.svg";
import {
  useGetAllTasksQuery,
  useUpdateTaskStatusMutation,
} from "../../redux/globalTaskSlice";
import { Avatar } from "@mui/joy";

/* ---------- small helper to keep bad URLs from crashing ---------- */
const safeUrl = (u = "") => {
  if (!u) return "";
  try {
    return new URL(u, window.location.origin).href;
  } catch {
    return "";
  }
};

/* ---------- helpers: title + time/diff ---------- */
function toMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const msPerDay = 1000 * 60 * 60 * 24;
function daysBetween(a, b) {
  const A = toMidnight(a).getTime();
  const B = toMidnight(b).getTime();
  return Math.floor((A - B) / msPerDay);
}

const WRAP_TOOLTIP_SLOTPROPS = {
  tooltip: {
    sx: {
      maxWidth: 420,
      p: 1,
      borderRadius: 10,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "anywhere",
      lineHeight: 1.35,
    },
  },
};

function TitleWithTooltip({ title }) {
  const full = title || "-";
  const isLong = full.length > 15;
  const short = isLong ? `${full.slice(0, 15)}…` : full;

  const content = (
    <Typography
      level="body-sm"
      sx={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: 1.35,
      }}
    >
      {full}
    </Typography>
  );

  return isLong ? (
    <Tooltip
      title={content}
      variant="soft"
      placement="top-start"
      slotProps={WRAP_TOOLTIP_SLOTPROPS}
    >
      <Typography fontWeight="lg" sx={{ cursor: "help" }}>
        {short}
      </Typography>
    </Tooltip>
  ) : (
    <Typography fontWeight="lg">{short}</Typography>
  );
}

export default function Dash_task({
  selected,
  setSelected,
  searchParams,
  setSearchParams,
}) {
  const navigate = useNavigate();

  const tabLabel = searchParams.get("tab") || "Pending";
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("limit")) || 10;

  const searchQuery = searchParams.get("search") || "";
  const createdFrom = searchParams.get("from") || "";
  const createdTo = searchParams.get("to") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";
  const department =
    searchParams.get("department") || searchParams.get("departments") || "";
  const assignedTo =
    searchParams.get("assigned_to") || searchParams.get("assignedToId") || "";
  const createdBy =
    searchParams.get("createdBy") || searchParams.get("createdById") || "";
  const priorityFilter = searchParams.get("priorityFilter") || "";

  const statusFromTab =
    {
      "Auto Tasks": "system",
      Pending: "pending",
      "In Progress": "in progress",
      Completed: "completed",
      Cancelled: "cancelled",
      All: "",
    }[tabLabel] ?? "";

  const [prioritySortOrder, setPrioritySortOrder] = useState(null);
  const [rawSearch, setRawSearch] = useState(searchQuery);
  const [selectedTab, setSelectedTab] = useState(tabLabel);

  useEffect(() => setRawSearch(searchQuery), [searchQuery]);
  useEffect(() => setSelectedTab(tabLabel), [tabLabel]);

  // -------- Data ----------
  const { data } = useGetAllTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFromTab,
    from: createdFrom,
    to: createdTo,
    deadlineFrom: deadlineFrom,
    deadlineTo: deadlineTo,
    department,
    limit: itemsPerPage,
    assignedToId: assignedTo,
    createdById: createdBy,
    priorityFilter,
  });

  const patchParams = useCallback(
    (patchObj) => {
      if (!setSearchParams) return;
      setSearchParams((prev) => {
        const merged = Object.fromEntries(prev.entries());
        return { ...merged, ...patchObj };
      });
    },
    [setSearchParams]
  );

  const setParamAndResetPage = useCallback(
    (key, value) => {
      if (!setSearchParams) return;
      setSearchParams((prev) => {
        const merged = Object.fromEntries(prev.entries());
        if (value == null || value === "") delete merged[key];
        else merged[key] = String(value);
        merged.page = "1";
        return merged;
      });
    },
    [setSearchParams]
  );

  // Debounced free-text search -> URL
  const debouncedPushSearch = useCallback(
    debounce((value) => setParamAndResetPage("search", value), 300),
    [setParamAndResetPage]
  );
  const handleSearch = (value) => {
    setRawSearch(value);
    debouncedPushSearch(value);
  };

  const handlePageChange = (page) => {
    const max = data?.totalPages || 1;
    if (page >= 1 && page <= max) patchParams({ page: String(page) });
  };

  const handlePageSize = (_e, newValue) => {
    const n = Number(newValue) || 10;
    setSearchParams((prev) => {
      const merged = Object.fromEntries(prev.entries());
      merged.limit = String(n);
      merged.page = "1";
      return merged;
    });
  };

  // -------- Table shaping ----------
  const tasks = data?.tasks || [];
  const totalCount = data?.totalTasks || 0;
  const totalPages = data?.totalPages || 1;

  const filteredData = useMemo(() => {
    const arr = [...tasks];
    if (prioritySortOrder) {
      arr.sort((a, b) => {
        const A = Number(a.priority) || 0;
        const B = Number(b.priority) || 0;
        return prioritySortOrder === "asc" ? A - B : B - A;
      });
    }
    return arr;
  }, [tasks, prioritySortOrder]);

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? filteredData.map((d) => d._id) : []);
  };
  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getTypeData = (type) => {
    switch (type) {
      case "project":
        return { icon: <WorkOutlineIcon fontSize="small" />, label: "Project" };
      case "internal":
        return { icon: <ApartmentIcon fontSize="small" />, label: "Internal" };
      case "helpdesk":
        return { icon: <BuildIcon fontSize="small" />, label: "Helpdesk" };
      default:
        return { icon: null, label: "-" };
    }
  };

  const stripHtml = (html) =>
    typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

  const timeAgo = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return "just now";
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h ago`;
    const dys = Math.floor(h / 24);
    return `${dys} d ago`;
  };

  const getInitial = (name) =>
    (name || "").trim().charAt(0).toUpperCase() || "?";

  // pick the latest two comments with distinct users
  const lastTwoUniqueUserComments = (comments = []) => {
    const arr = [...comments].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    const seen = new Set();
    const out = [];
    for (const c of arr) {
      const uid = (c.user && c.user._id) || c.user_id || null;
      if (!uid) continue;
      const key = String(uid);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(c);
      }
      if (out.length === 2) break;
    }
    return out;
  };

  /* =========================
     Status modal state + API
     ========================= */
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTaskId, setStatusTaskId] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [statusError, setStatusError] = useState("");

  const [updateTaskStatus, { isLoading: isUpdating }] =
    useUpdateTaskStatusMutation();

  const STATUS_OPTIONS = [
    { val: "pending", label: "Pending" },
    { val: "in progress", label: "In Progress" },
    { val: "completed", label: "Completed" },
    { val: "cancelled", label: "Cancelled" },
  ];

  const openStatusModal = (task) => {
    setStatusTaskId(task._id);
    const curr = task?.current_status?.status || "pending";
    setStatusValue(curr);
    setStatusRemarks("");
    setStatusError("");
    setStatusOpen(true);
  };

  const submitStatus = async () => {
    setStatusError("");
    if (!statusTaskId) return;

    try {
      await updateTaskStatus({
        id: statusTaskId,
        status: statusValue,
        remarks: statusRemarks?.trim() || undefined,
      }).unwrap();
      setStatusOpen(false);
      setStatusTaskId(null);
      setStatusRemarks("");
    } catch (e) {
      setStatusError(
        e?.data?.message ||
        e?.error ||
        "Failed to update status. Please try again."
      );
    }
  };

  const chipColor = (st) =>
    st === "draft"
      ? "primary"
      : st === "pending"
        ? "danger"
        : st === "in progress"
          ? "warning"
          : st === "completed"
            ? "success"
            : "neutral";

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Search + Tabs */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
        <Tabs
          value={selectedTab}
          onChange={(_e, newValue) => {
            setSelectedTab(newValue);
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set("tab", newValue);
              params.set("page", "1");
              return params;
            });
          }}
          indicatorPlacement="none"
          sx={{
            bgcolor: "background.level1",
            borderRadius: "md",
            boxShadow: "sm",
            width: "fit-content",
          }}
        >
          <TabList sx={{ gap: 1 }}>
            {["Auto Tasks", "Pending", "In Progress", "Completed", "Cancelled", "All"].map(
              (label) => (
                <Tab
                  key={label}
                  value={label}
                  disableIndicator
                  sx={{
                    borderRadius: "xl",
                    fontWeight: "md",
                    "&.Mui-selected": {
                      bgcolor: "background.surface",
                      boxShadow: "sm",
                    },
                  }}
                >
                  {label}
                </Tab>
              )
            )}
          </TabList>
        </Tabs>

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
              placeholder="Search by Title"
              startDecorator={<SearchIcon />}
              value={rawSearch}
              onChange={(e) => handleSearch(e.target.value)}
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
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <tr>
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                <Checkbox
                  size="sm"
                  checked={
                    selected.length === filteredData.length &&
                    filteredData.length > 0
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < filteredData.length
                  }
                />
              </th>

              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography level="body-sm">Task Info</Typography>
                  <Tooltip
                    title="Sort by Priority"
                    variant="soft"
                    slotProps={WRAP_TOOLTIP_SLOTPROPS}
                  >
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() =>
                        setPrioritySortOrder((prev) =>
                          prev === "asc"
                            ? "desc"
                            : prev === "desc"
                              ? null
                              : "asc"
                        )
                      }
                    >
                      {prioritySortOrder === "asc" ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : prioritySortOrder === "desc" ? (
                        <ArrowDownwardIcon fontSize="small" />
                      ) : (
                        <ArrowUpwardIcon
                          fontSize="small"
                          sx={{ opacity: 0.3 }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </th>

              {[
                "Title",
                "Project Info",
                "Description",
                "Comments",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: 8,
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((task) => {
                const hasAssignees =
                  Array.isArray(task.assigned_to) &&
                  task.assigned_to.length > 0;

                const assignedTooltip = hasAssignees && (
                  <Box sx={{ px: 0.5, py: 0.5, maxWidth: 320 }}>
                    <Typography level="body-sm" fontWeight="md" mb={0.5}>
                      Assigned To:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                      }}
                    >
                      {task.assigned_to.map((a, i) => (
                        <Typography
                          key={`${a?._id || a?.id || i}`}
                          level="body-sm"
                        >
                          • {a?.name || "-"}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                );

                // timing/late messaging
                const today = toMidnight(new Date());
                const hasDeadline = !!task?.deadline;
                const dln = hasDeadline ? toMidnight(task.deadline) : null;
                const startDate =
                  task?.createdAt ??
                  task?.status_history?.[0]?.updatedAt ??
                  today;

                const completedFromHistory = Array.isArray(task?.status_history)
                  ? task.status_history
                    .slice()
                    .reverse()
                    .find((s) => s?.status === "completed")
                  : null;

                const currentIsCompleted =
                  task?.current_status?.status === "completed";
                const completionDate =
                  completedFromHistory?.updatedAt ??
                  (currentIsCompleted
                    ? task?.current_status?.updatedAt
                    : undefined);

                // 🔸 NEW: locate cancellation timestamp
                const cancelledFromHistory = Array.isArray(task?.status_history)
                  ? task.status_history
                    .slice()
                    .reverse()
                    .find((s) => s?.status === "cancelled")
                  : null;

                const currentIsCancelled =
                  task?.current_status?.status === "cancelled";
                const cancellationDate =
                  cancelledFromHistory?.updatedAt ??
                  (currentIsCancelled
                    ? task?.current_status?.updatedAt
                    : undefined);
                let timingEl = null;

                if (completionDate) {
                  const elapsedDays = daysBetween(completionDate, startDate);
                  if (hasDeadline) {
                    const onOrBefore = toMidnight(completionDate) <= dln;
                    timingEl = onOrBefore ? (
                      <Typography level="body-sm" sx={{ color: "#15803d" }}>
                        Completed in {elapsedDays}{" "}
                        {elapsedDays === 1 ? "day" : "days"} (on time)
                      </Typography>
                    ) : (
                      <Typography level="body-sm" sx={{ color: "#b91c1c" }}>
                        Completed late by {daysBetween(completionDate, dln)}{" "}
                        {daysBetween(completionDate, dln) === 1
                          ? "day"
                          : "days"}{" "}
                        · took {elapsedDays}{" "}
                        {elapsedDays === 1 ? "day" : "days"}
                      </Typography>
                    );
                  } else {
                    timingEl = (
                      <Typography level="body-sm" sx={{ color: "#334155" }}>
                        Completed in {elapsedDays}{" "}
                        {elapsedDays === 1 ? "day" : "days"}
                      </Typography>
                    );
                  }
                }
                // 🔸 NEW: cancelled branch — compute vs createdAt (startDate), not vs deadline
                else if (cancellationDate) {
                  const elapsedDays = daysBetween(cancellationDate, startDate);
                  timingEl = (
                    <Typography level="body-sm" sx={{ color: "#6b7280" }}>
                      Cancelled after {elapsedDays}{" "}
                      {elapsedDays === 1 ? "day" : "days"}
                    </Typography>
                  );
                } else if (hasDeadline) {
                  if (
                    dln < today &&
                    task?.current_status?.status !== "completed"
                  ) {
                    const diffInDays = daysBetween(today, dln);
                    timingEl = (
                      <Typography level="body-sm" sx={{ color: "#b91c1c" }}>
                        Delay: {diffInDays} {diffInDays === 1 ? "day" : "days"}
                      </Typography>
                    );
                  } else {
                    timingEl = (
                      <Typography level="body-sm" sx={{ color: "#15803d" }}>
                        On Time
                      </Typography>
                    );
                  }
                } else {
                  timingEl = (
                    <Typography level="body-sm" sx={{ color: "#334155" }}>
                      No Deadline
                    </Typography>
                  );
                }

                return (
                  <tr key={task._id}>
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(task._id)}
                        onChange={() => handleRowSelect(task._id)}
                      />
                    </td>

                    {/* Task Info */}
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      <Typography
                        fontWeight="lg"
                        sx={{ cursor: "pointer", color: "primary.700" }}
                        onClick={() => navigate(`/view_task?task=${task._id}`)}
                      >
                        {task.taskCode}
                      </Typography>

                      {/* Priority Chip */}
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {(() => {
                          const priorityMap = {
                            1: { label: "High", color: "danger" },
                            2: { label: "Medium", color: "warning" },
                            3: { label: "Low", color: "success" },
                          };
                          const pr = Number(task?.priority || 0);
                          const pm = priorityMap[pr];

                          return pm ? (
                            <Chip
                              size="sm"
                              variant="solid"
                              color={pm.color}
                              title="Priority"
                              sx={{ fontWeight: 600 }}
                            >
                              {pm.label}
                            </Chip>
                          ) : (
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.tertiary" }}
                            >
                              None
                            </Typography>
                          );
                        })()}
                      </Box>

                      <Typography level="body-sm">
                        Created By: {task.createdBy?.name || "-"}
                      </Typography>
                      <Typography level="body-sm">
                        Created At:{" "}
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "-"}
                      </Typography>
                    </td>

                    {/* Title + assignees + deadline + timing */}
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      <TitleWithTooltip title={task.title} />

                      {hasAssignees ? (
                        <Tooltip
                          title={assignedTooltip}
                          variant="soft"
                          placement="top"
                          slotProps={WRAP_TOOLTIP_SLOTPROPS}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              cursor: "pointer",
                              backgroundColor: "#f1f3f5",
                              padding: "2px 6px",
                              borderRadius: "12px",
                              maxWidth: "100%",
                              mt: 0.25,
                            }}
                          >
                            <Typography level="body-sm" noWrap>
                              {task.assigned_to[0].name}
                            </Typography>
                            {task.assigned_to.length > 1 && (
                              <Box
                                sx={{
                                  backgroundColor: "#007bff",
                                  color: "#fff",
                                  borderRadius: "8px",
                                  fontSize: "10px",
                                  fontWeight: 500,
                                  px: 0.8,
                                  lineHeight: 1.2,
                                }}
                              >
                                +{task.assigned_to.length - 1}
                              </Box>
                            )}
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography level="body-sm">-</Typography>
                      )}

                      <Typography level="body-sm" sx={{ mt: 0.25 }}>
                        Deadline:{" "}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          : "-"}
                      </Typography>

                      <Box sx={{ mt: 0.25 }}>{timingEl}</Box>
                    </td>

                    {/* Project Info (type pill) */}
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      {(() => {
                        // Normalize to an array of { id, code, name }
                        let projects = [];

                        if (
                          Array.isArray(task.project_details) &&
                          task.project_details.length > 0
                        ) {
                          projects = task.project_details.map((p) => ({
                            id:
                              p?._id ??
                              p?.projectId ??
                              p?.id ??
                              task.project_id,
                            code: p?.code ?? p?.projectCode ?? "-",
                            name: p?.name ?? p?.projectName ?? "-",
                          }));
                        } else if (
                          task.project &&
                          typeof task.project === "object"
                        ) {
                          projects = [
                            {
                              id:
                                task.project?._id ??
                                task.project?.projectId ??
                                task.project?.id ??
                                task.project_id,
                              code:
                                task.project?.code ??
                                task.project?.projectCode ??
                                "-",
                              name:
                                task.project?.name ??
                                task.project?.projectName ??
                                "-",
                            },
                          ];
                        } else if (
                          task.project_code ||
                          task.project_name ||
                          task.project_id
                        ) {
                          projects = [
                            {
                              id: task.project_id,
                              code: task.project_code ?? "-",
                              name: task.project_name ?? "-",
                            },
                          ];
                        }

                        if (projects.length === 0) {
                          return <Typography fontWeight="lg">N/A</Typography>;
                        }

                        if (projects.length === 1) {
                          const p = projects[0];
                          const canGo = !!p.id;
                          return (
                            <Box
                              onClick={() =>
                                canGo &&
                                navigate(
                                  `/project_detail?page=1&project_id=${p.id}`
                                )
                              }
                              sx={{
                                cursor: canGo ? "pointer" : "default",
                                "&:hover": canGo
                                  ? { bgcolor: "neutral.softBg" }
                                  : undefined,
                                borderRadius: "sm",
                                p: 0.5,
                              }}
                            >
                              <Typography fontWeight="lg">{p.code}</Typography>
                              <Typography
                                level="body-sm"
                                sx={{ color: "#666" }}
                              >
                                {p.name}
                              </Typography>
                            </Box>
                          );
                        }

                        const main = projects[0];
                        const canGoMain = !!main.id;

                        return (
                          <Tooltip
                            title={
                              <Box
                                sx={{
                                  maxHeight: 200,
                                  overflowY: "auto",
                                  pr: 1,
                                }}
                              >
                                {projects.slice(1).map((p, i) => {
                                  const canGo = !!p.id;
                                  return (
                                    <Box
                                      key={`${p.code}-${i}`}
                                      sx={{
                                        mb: 1,
                                        cursor: canGo ? "pointer" : "default",
                                        "&:hover": canGo
                                          ? { bgcolor: "neutral.softBg" }
                                          : undefined,
                                        borderRadius: "sm",
                                        p: 0.5,
                                      }}
                                      onClick={() =>
                                        canGo &&
                                        navigate(
                                          `/project_detail?page=1&project_id=${p.id}`
                                        )
                                      }
                                    >
                                      <Typography
                                        level="body-md"
                                        fontWeight="lg"
                                      >
                                        {p.code}
                                      </Typography>
                                      <Typography
                                        level="body-sm"
                                        sx={{
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                          overflowWrap: "anywhere",
                                        }}
                                      >
                                        {p.name}
                                      </Typography>
                                      {i !== projects.length - 2 && (
                                        <Box
                                          sx={{
                                            height: 1,
                                            bgcolor: "#eee",
                                            my: 1,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  );
                                })}
                              </Box>
                            }
                            arrow
                            placement="top-start"
                            variant="soft"
                            slotProps={{
                              tooltip: {
                                sx: {
                                  maxWidth: 420,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                  p: 1,
                                  borderRadius: 10,
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.2,
                                cursor: canGoMain ? "pointer" : "default",
                                "&:hover .project-count-badge": canGoMain
                                  ? { backgroundColor: "#0056D2" }
                                  : undefined,
                                "&:hover": canGoMain
                                  ? { bgcolor: "neutral.softBg" }
                                  : undefined,
                                borderRadius: "sm",
                                p: 0.5,
                              }}
                              onClick={() =>
                                canGoMain &&
                                navigate(
                                  `/project_detail?page=1&project_id=${main.id}`
                                )
                              }
                            >
                              <Box>
                                <Typography fontWeight="lg">
                                  {main.code}
                                </Typography>
                                <Typography
                                  level="body-sm"
                                  sx={{
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {main.name}
                                </Typography>
                              </Box>
                              <Box
                                className="project-count-badge"
                                sx={{
                                  backgroundColor: "#007BFF",
                                  color: "#fff",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  px: 1,
                                  py: 0.2,
                                  minWidth: 26,
                                  textAlign: "center",
                                  transition: "all 0.2s ease-in-out",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                                }}
                              >
                                +{projects.length - 1}
                              </Box>
                            </Box>
                          </Tooltip>
                        );
                      })()}
                    </td>

                    {/* Description (ellipsis + wrapped tooltip) */}
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      <Tooltip
                        title={
                          <Typography sx={{ whiteSpace: "pre-wrap" }}>
                            {task.description || ""}
                          </Typography>
                        }
                        arrow
                        placement="top-start"
                        variant="soft"
                        color="neutral"
                        slotProps={WRAP_TOOLTIP_SLOTPROPS}
                      >
                        <Typography
                          noWrap
                          sx={{
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            cursor: "default",
                          }}
                        >
                          {task.description || "-"}
                        </Typography>
                      </Tooltip>
                    </td>

                    {/* Comments (last 2 unique users) */}
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        minWidth: 260,
                      }}
                    >
                      {(() => {
                        const two = lastTwoUniqueUserComments(
                          task.comments || []
                        );
                        if (two.length === 0) {
                          return (
                            <Typography
                              level="body-sm"
                              sx={{ color: "text.tertiary" }}
                            >
                              No recent comments
                            </Typography>
                          );
                        }

                        return (
                          <Box sx={{ display: "grid", gap: 0.5 }}>
                            {two.map((c, idx) => {
                              const name = c.user?.name || c.name || "Unknown";
                              const remarkPlain = stripHtml(c.remarks || "");
                              // NEW: avatar image from backend-enriched attachment_url
                              const avatarUrl = safeUrl(
                                c?.user?.attachment_url || ""
                              );

                              return (
                                <Box
                                  key={c._id || idx}
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: "24px 1fr",
                                    alignItems: "start",
                                    gap: 0.75,
                                    p: 0.5,
                                    borderRadius: 12,
                                    border: "1px solid rgba(15,23,42,0.06)",
                                    bgcolor: "#fff",
                                  }}
                                >
                                  <Avatar
                                    sx={{ width: 24, height: 24 }}
                                    size="sm"
                                    src={avatarUrl || undefined}
                                    variant={avatarUrl ? "soft" : "solid"}
                                  >
                                    {!avatarUrl && getInitial(name)}
                                  </Avatar>

                                  <Box sx={{ minWidth: 0 }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                      }}
                                    >
                                      <Typography
                                        level="body-sm"
                                        fontWeight="md"
                                        sx={{ color: "#0f172a" }}
                                      >
                                        {name}
                                      </Typography>
                                      <Typography
                                        level="body-xs"
                                        sx={{
                                          color: "text.tertiary",
                                          fontSize: "0.7rem",
                                        }}
                                      >
                                        {timeAgo(c.updatedAt)}
                                      </Typography>
                                    </Box>

                                    <Tooltip
                                      placement="top-start"
                                      variant="soft"
                                      color="neutral"
                                      title={
                                        <Box
                                          sx={{
                                            maxWidth: 420,
                                            whiteSpace: "normal",
                                            overflowWrap: "anywhere",
                                            wordBreak: "break-word",
                                            lineHeight: 1.35,
                                          }}
                                        >
                                          {remarkPlain || "—"}
                                        </Box>
                                      }
                                      slotProps={{
                                        tooltip: {
                                          sx: {
                                            maxWidth: 420,
                                            whiteSpace: "normal",
                                            overflowWrap: "anywhere",
                                            wordBreak: "break-word",
                                            p: 1,
                                            borderRadius: 10,
                                          },
                                        },
                                      }}
                                    >
                                      <Typography
                                        level="body-sm"
                                        sx={{
                                          color: "#334155",
                                          fontSize: "0.8rem",
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                          whiteSpace: "normal",
                                          overflowWrap: "anywhere",
                                          wordBreak: "break-word",
                                          maxWidth: 360,
                                          cursor: "default",
                                        }}
                                      >
                                        {remarkPlain || "—"}
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })()}
                    </td>

                    {/* Status (clickable -> open modal) */}
                    <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                      <Chip
                        variant="soft"
                        color={chipColor(task.current_status?.status)}
                        size="sm"
                        onClick={() => openStatusModal(task)}
                        sx={{ cursor: "pointer" }}
                      >
                        {task.current_status?.status
                          ? task.current_status.status.charAt(0).toUpperCase() +
                          task.current_status.status.slice(1)
                          : "-"}
                      </Chip>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{ width: 50, marginBottom: 8 }}
                    />
                    <Typography fontStyle="italic">No Tasks Found</Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 1,
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
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Box>
          Page {currentPage} of {totalPages} | Showing {tasks.length || 0} of{" "}
          {totalCount} results
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>
          {currentPage < totalPages && (
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

        <FormControl size="sm">
          <Select
            value={itemsPerPage}
            onChange={handlePageSize}
            sx={{
              height: "32px",
              borderRadius: "6px",
              padding: "0 8px",
              borderColor: "#ccc",
              backgroundColor: "#fff",
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select>
        </FormControl>

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

      {/* =========================
          Update Status Modal
          ========================= */}
      <Modal
        open={statusOpen}
        onClose={() => !isUpdating && setStatusOpen(false)}
      >
        <ModalDialog
          aria-labelledby="update-status-title"
          variant="soft"
          sx={{ minWidth: 420, borderRadius: 16 }}
        >
          <DialogTitle id="update-status-title">Update Status</DialogTitle>
          <DialogContent sx={{ mt: 0.5, color: "text.tertiary" }}>
            Select a new status and add remarks (optional).
          </DialogContent>

          <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
            <FormControl size="sm">
              <Select
                value={statusValue}
                onChange={(_, v) => setStatusValue(v)}
                indicator={null}
                sx={{ borderRadius: 10 }}
              >
                {[
                  { val: "pending", label: "Pending" },
                  { val: "in progress", label: "In Progress" },
                  { val: "completed", label: "Completed" },
                  { val: "cancelled", label: "Cancelled" },
                ].map((o) => (
                  <Option key={o.val} value={o.val}>
                    {o.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <Textarea
              minRows={4}
              placeholder="Write remarks..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              sx={{ borderRadius: 12 }}
            />

            {statusError && (
              <Typography level="body-sm" sx={{ color: "danger.600" }}>
                {statusError}
              </Typography>
            )}
          </Box>

          <DialogActions sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setStatusOpen(false)}
              disabled={isUpdating}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitStatus}
              disabled={isUpdating}
              startDecorator={
                isUpdating ? <CircularProgress size="sm" /> : null
              }
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
              }}
            >
              {isUpdating ? "Saving..." : "Submit"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
