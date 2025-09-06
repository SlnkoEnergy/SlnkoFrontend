// src/pages/tasks/ViewTaskPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Sheet,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Select,
  Option,
  Avatar,
  Textarea,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  IconButton,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
} from "@mui/joy";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";

import { toast } from "react-toastify";

import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
} from "../../redux/globalTaskSlice";
import CommentComposer from "../Comments";

/* ----------------------- helpers & UI primitives ----------------------- */

const typeMeta = (type) => {
  switch ((type || "").toLowerCase()) {
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

const statusColor = (s) => {
  switch ((s || "").toLowerCase()) {
    case "draft":
      return "primary";
    case "pending":
      return "danger";
    case "in progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "warning";
    default:
      return "neutral";
  }
};

const Field = ({ label, value, decorator, muted }) => (
  <Stack direction="row" alignItems="center" gap={1.5}>
    <Typography level="body-sm" sx={{ minWidth: 160, color: "text.tertiary" }}>
      {label}
    </Typography>
    <Typography
      level="body-sm"
      sx={{ fontWeight: 500, color: muted ? "text.tertiary" : "text.primary" }}
      startDecorator={decorator}
    >
      {value ?? "—"}
    </Typography>
  </Stack>
);

// people helpers
const toPeople = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(toPerson);
  return [toPerson(input)];
};

const toPerson = (u = {}) => {
  if (typeof u === "string") {
    return { id: u, name: u, avatar: "" };
  }
  return {
    id:
      u._id || u.id || u.email || u.name || Math.random().toString(36).slice(2),
    name: u.name || u.fullName || u.displayName || u.email || "User",
    avatar:
      u.avatar ||
      u.photo ||
      u.image ||
      u.profilePic ||
      u.avatar_url ||
      u.picture ||
      "",
  };
};

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";

const colorFromName = (name = "") => {
  const palette = [
    "primary",
    "success",
    "info",
    "warning",
    "danger",
    "neutral",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) % 997;
  return palette[sum % palette.length];
};

/** Overlapping avatars with ring, hover lift, and +N avatar */
const PeopleAvatars = ({ people = [], max = 3, size = "sm" }) => {
  const shown = people.slice(0, max);
  const extra = people.slice(max);

  const ringSx = {
    boxShadow: "0 0 0 1px var(--joy-palette-background-body)",
  };

  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          "& > *": { transition: "transform 120ms ease, z-index 120ms ease" },
          "& > *:not(:first-of-type)": { ml: "-8px" },
          "& > *:hover": { zIndex: 2, transform: "translateY(-2px)" },
        }}
      >
        {shown.map((p, i) => {
          const name = p.name || "User";
          const src = p.avatar || "";
          const initials = initialsOf(name);
          const color = colorFromName(name);
          return (
            <Tooltip key={p.id || i} arrow placement="top" title={name}>
              <Avatar
                size={size}
                src={src || undefined}
                variant={src ? "soft" : "solid"}
                color={src ? "neutral" : color}
                sx={ringSx}
              >
                {!src && initials}
              </Avatar>
            </Tooltip>
          );
        })}

        {extra.length > 0 && (
          <Tooltip
            arrow
            placement="bottom"
            variant="soft"
            title={
              <Box
                sx={{
                  maxHeight: 260,
                  overflowY: "auto",
                  px: 1,
                  py: 0.5,
                  maxWidth: 240,
                }}
              >
                {extra.map((p, i) => (
                  <Box key={p.id || i} sx={{ mb: i !== extra.length - 1 ? 1 : 0 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Avatar
                        size="sm"
                        src={p.avatar || undefined}
                        variant={p.avatar ? "soft" : "solid"}
                        color={p.avatar ? "neutral" : colorFromName(p.name)}
                        sx={ringSx}
                      >
                        {!p.avatar && initialsOf(p.name)}
                      </Avatar>
                      <Typography level="body-sm">{p.name || "User"}</Typography>
                    </Stack>
                    {i !== extra.length - 1 && <Divider sx={{ my: 0.75 }} />}
                  </Box>
                ))}
              </Box>
            }
          >
            <Avatar
              size={size}
              variant="soft"
              color="neutral"
              sx={{ ...ringSx, ml: "-8px", fontSize: 12, cursor: "default" }}
            >
              +{extra.length}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    </Stack>
  );
};

/* ----------------------- status timeline (scrollable) ----------------------- */

const cap = (s = "") =>
  s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

const formatDuration = (ms) => {
  if (!ms || ms < 1000) return "0 secs";
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hrs) parts.push(`${hrs} hr${hrs > 1 ? "s" : ""}`);
  if (mins) parts.push(`${mins} min${mins > 1 ? "s" : ""}`);
  if (secs && !days) parts.push(`${secs} sec${secs > 1 ? "s" : ""}`);
  return parts.join(" ");
};

const Connector = ({ durationLabel = "" }) => (
  <Box sx={{ position: "relative", minWidth: 160, mx: 1 }}>
    {durationLabel && (
      <Typography
        level="body-xs"
        sx={{
          position: "absolute",
          top: -18,
          left: "50%",
          transform: "translateX(-50%)",
          color: "text.tertiary",
          whiteSpace: "nowrap",
        }}
      >
        {durationLabel}
      </Typography>
    )}
    <Box
      sx={{
        borderTop: "2px dashed",
        borderColor: "neutral.outlinedBorder",
        height: 0,
        width: "100%",
        position: "relative",
        mt: 1,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -8,
          top: -6,
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderLeft: "8px solid",
          borderLeftColor: "neutral.outlinedBorder",
        }}
      />
    </Box>
  </Box>
);

const StatusTimeline = ({ history = [], current }) => {
  const steps = (history || [])
    .filter((h) => h?.status)
    .slice()
    .sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));

  const last = steps[steps.length - 1];
  if (
    current?.status &&
    (!last ||
      (last.status || "").toLowerCase() !== (current.status || "").toLowerCase())
  ) {
    steps.push({
      status: current.status,
      updatedAt: current.updatedAt || new Date().toISOString(),
    });
  }

  const nodes = steps.map((s) => ({
    label: cap(s.status || "-"),
    color: statusColor(s.status),
    at: s.updatedAt ? new Date(s.updatedAt) : null,
  }));

  const durations = nodes.map((n, i) => {
    if (i >= nodes.length - 1) return "";
    const a = n.at ? n.at.getTime() : 0;
    const b = nodes[i + 1].at ? nodes[i + 1].at.getTime() : 0;
    return a && b ? formatDuration(b - a) : "";
  });

  const isClosed = ["completed", "cancelled"].includes(
    (current?.status || "").toLowerCase()
  );

  return (
    <Sheet
      variant="soft"
      sx={{
        p: 2,
        borderRadius: "md",
        bgcolor: "background.level1",
        overflowX: "auto",
      }}
    >
      <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: "max-content" }}>
        {nodes.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            No status changes yet.
          </Typography>
        ) : (
          nodes.map((n, i) => (
            <Box key={`${n.label}-${i}`} sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                variant="solid"
                color={n.color}
                sx={{
                  borderRadius: "8px",
                  px: 1.25,
                  py: 0.25,
                  minWidth: 96,
                  justifyContent: "center",
                }}
              >
                {n.label}
              </Chip>
              {i < nodes.length - 1 && <Connector durationLabel={durations[i]} />}
            </Box>
          ))
        )}

        {!isClosed && nodes.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Connector
              durationLabel={formatDuration(
                Date.now() - (nodes[nodes.length - 1]?.at?.getTime?.() ?? Date.now())
              )}
            />
            <Box
              sx={{
                position: "relative",
                px: 1.5,
                py: 0.5,
                bgcolor: "neutral.softBg",
                borderRadius: "999px",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  left: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight: "8px solid var(--joy-palette-neutral-softBg)",
                },
              }}
            >
              <Typography level="body-sm">Yet to close</Typography>
            </Box>
          </Box>
        )}
      </Stack>
    </Sheet>
  );
};

/* --------------------------------- page --------------------------------- */

export default function ViewTaskPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("task");

  const { data: taskApi, isFetching } = useGetTaskByIdQuery(id, { skip: !id });

  const [task, setTask] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Select Status");
  const [openStatusModal, setOpenStatusModal] = useState(false);

  // comment UI state
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState([]); // [{name, file, size, type}]
  const [openAttachModal, setOpenAttachModal] = useState(false);
  const [attachDocName, setAttachDocName] = useState("");
  const [attachFiles, setAttachFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // single hidden file input used everywhere
  const filePickerRef = useRef(null);

  const [openInfo, setOpenInfo] = useState(true);
  const [openAssocProject, setOpenAssocProject] = useState(true);
  const [openTimeline, setOpenTimeline] = useState(true);
  const [openActivity, setOpenActivity] = useState(true);

  const [updateTaskStatus, { isLoading: isUpdating }] =
    useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();

  useEffect(() => {
    if (taskApi) setTask(taskApi);
  }, [taskApi]);

  useEffect(() => {
    const s = task?.current_status?.status;
    if (!s || s.toLowerCase() === "draft") setStatus("Select Status");
    else setStatus(s.toLowerCase());
  }, [task]);

  const projects = useMemo(() => {
    if (Array.isArray(task?.project_id) && task?.project_id?.length) {
      return task.project_id.map((p) => ({
        code: p.code ?? p.projectCode ?? "-",
        name: p.name ?? p.projectName ?? "-",
      }));
    }
    if (task?.project) {
      return [{ code: task.project.code ?? "-", name: task.project.name ?? "-" }];
    }
    if (task?.project_code || task?.project_name) {
      return [{ code: task.project_code ?? "-", name: task.project_name ?? "-" }];
    }
    return [];
  }, [task]);

  const handleStatusSubmit = async () => {
    const chosen = status === "Select Status" ? "" : status;
    if (!chosen) return toast.error("Pick a status");
    try {
      await updateTaskStatus({ id, status: chosen, remarks: note }).unwrap();

      const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
      const entry = {
        status: chosen,
        remarks: note,
        user_id: { name: user?.name || "You" },
        updatedAt: new Date().toISOString(),
      };
      setTask((prev) => ({
        ...prev,
        current_status: { status: chosen, updatedAt: entry.updatedAt },
        status_history: [...(prev?.status_history || []), entry],
      }));
      setNote("");
      setOpenStatusModal(false);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // -------- Comments: local add + persist via updateTask ($push) --------

  const handleAttachClick = () => {
    setAttachDocName("");
    setAttachFiles([]);
    setOpenAttachModal(true);
    setTimeout(() => filePickerRef.current?.click(), 0);
  };

  const onPickFilesFromButton = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAttachFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const onDropFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    setAttachFiles((prev) => [...prev, ...files]);
    setIsDragging(false);
  };

  const handleSaveAttachment = () => {
    if (!attachFiles.length) {
      toast.error("Please drop or pick at least one file.");
      return;
    }
    const items = attachFiles.map((f) => ({
      name: attachDocName?.trim() || f.name,
      file: f,
      size: f.size,
      type: f.type,
    }));
    setAttachments((prev) => [...prev, ...items]);
    setOpenAttachModal(false);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() && attachments.length === 0) {
      toast.error("Type a comment or attach a file.");
      return;
    }
    if (!id) {
      toast.error("Task id missing");
      return;
    }

    const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
    const userId = user?._id || user?.id || user?.user_id;
    const remarks = commentText.trim();

    try {
      // Persist server-side: push a new comment { remarks, user_id }
      await updateTask({
        id,
        body: {
          $push: {
            comments: {
              remarks,
              user_id: userId,
            },
          },
        },
      }).unwrap();

      // Optimistic local UI (keeps your attachments display local)
      const newCommentLocal = {
        text: remarks,
        remarks,
        attachments: attachments.map((a) => ({
          name: a.name,
          size: a.size,
          type: a.type,
        })),
        user_id: { _id: userId, name: user?.name || "You" },
        createdAt: new Date().toISOString(),
      };

      setTask((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), newCommentLocal],
      }));
      setCommentText("");
      setAttachments([]);
      toast.success("Comment added");
    } catch (e) {
      console.error(e);
      toast.error(e?.data?.message || "Failed to add comment");
    }
  };

  const priorityMap = {
    1: { label: "Low", color: "success" },
    2: { label: "Medium", color: "warning" },
    3: { label: "High", color: "danger" },
  };

  const isCompleted =
    (task?.current_status?.status || "").toLowerCase() === "completed";

  const infoGrid = (
    <Sheet
      variant="soft"
      sx={{
        p: 2,
        borderRadius: "md",
        bgcolor: "background.level1",
        gap: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        width: "100%",
      }}
    >
      {/* LHS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Field
          label="Assign"
          value={
            task?.assigned_to?.length ? (
              <PeopleAvatars people={toPeople(task.assigned_to)} />
            ) : (
              "None"
            )
          }
        />
        <Field
          label="Status"
          value={
            <Chip
              size="sm"
              color={statusColor(task?.current_status?.status)}
              onClick={() => !isCompleted && setOpenStatusModal(true)}
              sx={{ cursor: isCompleted ? "not-allowed" : "pointer" }}
            >
              {task?.current_status?.status
                ? task.current_status.status
                    .split(" ")
                    .map((w) => w[0]?.toUpperCase() + w.slice(1))
                    .join(" ")
                : "—"}
            </Chip>
          }
        />
        <Field
          label="Priority"
          value={
            Number(task?.priority) > 0 ? (
              <Chip
                size="sm"
                variant="solid"
                color={priorityMap[Number(task?.priority)]?.color}
              >
                {priorityMap[Number(task?.priority)]?.label}
              </Chip>
            ) : (
              "None"
            )
          }
          muted={!(Number(task?.priority) > 0)}
        />
      </Box>

      {/* RHS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Field
          label="Created By"
          value={<PeopleAvatars people={toPeople(task?.createdBy)} max={1} />}
        />
        <Field
          label="Created At"
          value={task?.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
        />
         <Field
          label="Due Date"
          value={
            task?.deadline
              ? new Date(task.deadline).toLocaleDateString("en-GB")
              : "—"
          }
        />
      </Box>
    </Sheet>
  );

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* Hidden file input used for OS picker (outside + inside modal) */}
      <input
        ref={filePickerRef}
        type="file"
        multiple
        onChange={onPickFilesFromButton}
        style={{ display: "none" }}
      />

      {/* Row 1: Summary (left) + Task Info (right) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
          mb: 2,
          "& > *": { minWidth: 0 },
        }}
      >
        {/* Summary / header */}
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "md",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            mb: 0,
            bgcolor: "background.surface",
            height: "100%",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Stack direction="column" gap={1.5} alignItems="flex-start" sx={{ minWidth: 0, width: "100%" }}>
            <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-start" sx={{ minWidth: 0 }}>
              {task?.taskCode && (
                <Chip size="sm" variant="soft" color="primary">
                  {task.taskCode}
                </Chip>
              )}
              <Chip
                variant="soft"
                color={statusColor(task?.current_status?.status)}
                onClick={() => !isCompleted && setOpenStatusModal(true)}
                sx={{ cursor: isCompleted ? "not-allowed" : "pointer" }}
              >
                {(task?.current_status?.status || "Current Status")
                  .split(" ")
                  .map((w) => w[0]?.toUpperCase() + w.slice(1))
                  .join(" ")}
              </Chip>
              {typeMeta(task?.type).icon}
              <Typography level="body-sm">{typeMeta(task?.type).label}</Typography>
            </Stack>

            {/* Title: wrap + vertical scroll */}
            <Box sx={{ maxHeight: 72, overflowY: "auto", overflowX: "hidden", width: "100%", pr: 0.5 }}>
              <Typography
                level="h4"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  minWidth: 0,
                }}
              >
                {task?.title || (isFetching ? "Loading…" : "Task")}
              </Typography>
            </Box>

            {/* Description: wrap + vertical scroll */}
            <Box sx={{ maxHeight: 180, overflowY: "auto", overflowX: "hidden", width: "100%", pr: 0.5 }}>
              <Typography
                level="body-sm"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  minWidth: 0,
                }}
              >
                {task?.description || "—"}
              </Typography>
            </Box>
          </Stack>
        </Sheet>

        {/* Task Information */}
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "md",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            mb: 0,
            bgcolor: "background.surface",
            height: "100%",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <Typography fontSize={"1rem"} fontWeight={600} mb={1}>
            Task Information
          </Typography>
          {infoGrid}
        </Sheet>
      </Box>

      {/* Row 2: Associated Project (left) + Status Timeline (right) */}
      {task?.type === "project" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
            mb: 2,
            "& > *": { minWidth: 0 },
          }}
        >
          <Section
            title="Associated Project"
            open={openAssocProject}
            onToggle={() => setOpenAssocProject((v) => !v)}
            outlined={false}
          >
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "md",
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {projects.map((p, i) => (
                <Box key={`${p.code}-${i}`} sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Avatar size="md">{p?.name?.[0]?.toUpperCase() || "P"}</Avatar>
                  <Box>
                    <Typography level="body-md" fontWeight="lg">
                      {p?.name || "Associated Project"}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      {p?.code || "—"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Sheet>
          </Section>

          <Section title="Status Timeline" open={openTimeline} onToggle={() => setOpenTimeline((v) => !v)}>
            <StatusTimeline history={task?.status_history || []} current={task?.current_status} />
          </Section>
        </Box>
      )}

      {/* Row 3: Activity & Notes (with comment submit + attach) */}
      <Section title="Activity & Notes" open={openActivity} onToggle={() => setOpenActivity((v) => !v)}>
        <Tabs defaultValue="comments" sx={{ mb: 1 }}>
          <TabList>
            <Tab value="comments">Comments</Tab>
            <Tab value="docs">Documents</Tab>
          </TabList>
        </Tabs>

        {/* Add Comment */}
       <CommentComposer
  value={commentText}
  onChange={setCommentText}
  onSubmit={handleSubmitComment}
  onCancel={() => {
    setCommentText("");
    setAttachments([]);
  }}
  onAttachClick={handleAttachClick}
  attachments={attachments}
/>

        <Divider sx={{ my: 1.5 }} />

        {/* Comments List */}
        {(task?.comments || []).length > 0 && (
          <>
            <Typography level="title-sm" sx={{ mb: 1 }}>
              Comments
            </Typography>
            <Box sx={{ maxHeight: 260, overflow: "auto", mb: 1.5 }}>
              {(task?.comments || [])
                .slice()
                .reverse()
                .map((c, i) => (
                  <Box key={i} sx={{ mb: 1.25 }}>
                    <Typography level="body-xs" sx={{ color: "text.tertiary", mb: 0.25 }}>
                      {c?.user_id?.name || "User"} •{" "}
                      {c?.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </Typography>
                    {(c.remarks || c.text) && (
                      <Typography level="body-sm">{c.remarks || c.text}</Typography>
                    )}
                    {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        {c.attachments.map((a, idx) => (
                          <Chip key={idx} size="sm" variant="soft">
                            {a.name}
                          </Chip>
                        ))}
                      </Stack>
                    )}
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
            </Box>

            <Divider sx={{ my: 1.5 }} />
          </>
        )}

        {/* Activity Stream */}
        <Typography level="title-sm" sx={{ mb: 1 }}>
          Activity Stream
        </Typography>
        <Box sx={{ maxHeight: 240, overflow: "auto" }}>
          {(task?.status_history || [])
            .slice()
            .reverse()
            .map((h, idx) => (
              <Box key={h._id || idx} sx={{ mb: 1.25 }}>
                <Chip size="sm" variant="soft" color={statusColor(h.status)} sx={{ mr: 1 }}>
                  {(h.status || "-")
                    .split(" ")
                    .map((w) => w[0]?.toUpperCase() + w.slice(1))
                    .join(" ")}
                </Chip>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  by {h?.user_id?.name || "Unknown"} on{" "}
                  {h?.updatedAt ? new Date(h.updatedAt).toLocaleString() : "—"}
                </Typography>
                {h?.remarks && (
                  <Typography level="body-sm" sx={{ mt: 0.25 }}>
                    {h.remarks}
                  </Typography>
                )}
                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
        </Box>
      </Section>

      {/* Status Update Modal */}
      <Modal open={openStatusModal} onClose={() => setOpenStatusModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 520 }}>
          <DialogTitle>Update Status</DialogTitle>
          <DialogContent>Select a new status and add remarks (optional).</DialogContent>
          <Stack gap={1.25} sx={{ mt: 1 }}>
            <Select value={status} onChange={(_, v) => setStatus(v)} placeholder="Select Status" disabled={isCompleted}>
              <Option disabled value="Select Status">
                Select Status
              </Option>
              <Option value="pending">Pending</Option>
              <Option value="in progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Textarea minRows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write remarks..." />
          </Stack>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setOpenStatusModal(false)}
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
              onClick={handleStatusSubmit}
              loading={isUpdating}
              disabled={isCompleted}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Attach File Modal (drag & drop + document name) */}
      <Modal open={openAttachModal} onClose={() => setOpenAttachModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 560 }}>
          <DialogTitle>Attach file(s)</DialogTitle>
          <DialogContent>Give your document a name (optional) and drag files below.</DialogContent>

          <Stack gap={1.25} sx={{ mt: 1 }}>
            <Input
              placeholder="Document name (optional)"
              value={attachDocName}
              onChange={(e) => setAttachDocName(e.target.value)}
            />

            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={onDropFiles}
              sx={{
                p: 3,
                borderRadius: "md",
                textAlign: "center",
                border: "2px dashed",
                borderColor: isDragging ? "primary.outlinedBorder" : "neutral.outlinedBorder",
                bgcolor: isDragging ? "primary.softBg" : "background.level1",
                cursor: "pointer",
              }}
            >
              <Typography level="body-sm" sx={{ mb: 1 }}>
                Drag & drop files here
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary", mb: 1 }}>
                or
              </Typography>

              <Button variant="soft" onClick={() => filePickerRef.current?.click()}>
                Browse files
              </Button>
            </Box>

            {attachFiles.length > 0 && (
              <Stack gap={0.75}>
                <Typography level="body-sm">Selected files</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {attachFiles.map((f, i) => (
                    <Chip key={`${f.name}-${i}`} variant="soft">
                      {f.name}
                    </Chip>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          <DialogActions>
            <Button variant="plain" onClick={() => setOpenAttachModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttachment}>Add attachment(s)</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

/* ------------------------------- Section ------------------------------- */

function Section({ title, open, onToggle, children, right = null, outlined = true }) {
  return (
    <Sheet variant={outlined ? "outlined" : "soft"} sx={{ p: 2, borderRadius: "md", mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton size="sm" variant="plain" onClick={onToggle} aria-label={open ? "Collapse" : "Expand"}>
            {open ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
          </IconButton>
          <Typography level="title-md">{title}</Typography>
        </Stack>
        {right}
      </Stack>

      {open && <Box sx={{ mt: 1.25 }}>{children}</Box>}
    </Sheet>
  );
}
