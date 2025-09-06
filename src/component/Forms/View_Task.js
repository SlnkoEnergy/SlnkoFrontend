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
  TabPanel,
  IconButton,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
} from "@mui/joy";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import { toast } from "react-toastify";
import DOMPurify from "dompurify";

import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
} from "../../redux/globalTaskSlice";

import CommentComposer from ".././Comments";

/* ============================= helpers ============================= */

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

const toPeople = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(toPerson);
  return [toPerson(input)];
};
const toPerson = (u = {}) => {
  if (typeof u === "string") return { id: u, name: u, avatar: "" };
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

const PeopleAvatars = ({ people = [], max = 3, size = "sm" }) => {
  const shown = people.slice(0, max);
  const extra = people.slice(max);
  const ringSx = { boxShadow: "0 0 0 1px var(--joy-palette-background-body)" };
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
                  <Box
                    key={p.id || i}
                    sx={{ mb: i !== extra.length - 1 ? 1 : 0 }}
                  >
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
                      <Typography level="body-sm">
                        {p.name || "User"}
                      </Typography>
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
              sx={{
                ...ringSx,
                ml: "-8px",
                fontSize: 12,
                cursor: "default",
              }}
            >
              +{extra.length}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    </Stack>
  );
};

/* ============================= utils ============================= */

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

const formatBytes = (n) => {
  if (!n || isNaN(n)) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
};

const fileExt = (name = "") => (name.split(".").pop() || "").toLowerCase();
const isImage = (name = "", type = "") => {
  const ext = fileExt(name);
  return (
    type.startsWith?.("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)
  );
};

const iconFor = (name = "", type = "") => {
  const ext = fileExt(name);
  if (type?.includes?.("pdf") || ext === "pdf")
    return <PictureAsPdfOutlinedIcon />;
  if (isImage(name, type)) return <ImageOutlinedIcon />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <TableChartOutlinedIcon />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return <ArchiveOutlinedIcon />;
  if (["doc", "docx", "rtf", "txt", "md"].includes(ext))
    return <DescriptionOutlinedIcon />;
  return <InsertDriveFileOutlinedIcon />;
};

const safeUrl = (u = "") => {
  try {
    const x = new URL(u);
    return x.href;
  } catch {
    return "";
  }
};

/* ============================= timeline ============================= */

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
      (last.status || "").toLowerCase() !==
        (current.status || "").toLowerCase())
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
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{ minWidth: "max-content" }}
      >
        {nodes.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            No status changes yet.
          </Typography>
        ) : (
          nodes.map((n, i) => (
            <Box
              key={`${n.label}-${i}`}
              sx={{ display: "flex", alignItems: "center" }}
            >
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
              {i < nodes.length - 1 && (
                <Connector durationLabel={durations[i]} />
              )}
            </Box>
          ))
        )}
        {!isClosed && nodes.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Connector
              durationLabel={formatDuration(
                Date.now() -
                  (nodes[nodes.length - 1]?.at?.getTime?.() ?? Date.now())
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

/* ============================= normalizers ============================= */

const normalizeAttachment = (a) => {
  if (!a) return null;
  const name =
    a.name ||
    a.fileName ||
    a.originalname ||
    a.filename ||
    (typeof a === "string" ? a.split("/").pop() : "Attachment");
  const url =
    a.url ||
    a.href ||
    a.link ||
    a.blobUrl ||
    a.sasUrl ||
    (typeof a === "string" ? a : "");
  return {
    _id: a._id || a.id || url || name,
    name,
    url,
    type: a.type || a.mimetype || "",
    size: a.size || a.length || a.bytes || 0,
    updatedAt: a.updatedAt || a.createdAt || null,
    user_id: a.user_id || a.uploadedBy || null,
  };
};

const normalizeComment = (c) => {
  const t = c?.updatedAt || c?.createdAt;
  const attRaw = c?.attachments || c?.attachements || c?.files || [];
  const atts = Array.isArray(attRaw)
    ? attRaw.map(normalizeAttachment).filter(Boolean)
    : [];
  return {
    _type: "comment",
    at: t ? new Date(t).getTime() : 0,
    html: c?.remarks || c?.text || "",
    user: c?.user_id,
    attachments: atts,
    raw: c,
  };
};

/* ============================= attachments UI ============================= */

function AttachmentTile({ a }) {
  const name = a?.name || "Attachment";
  const url = safeUrl(a?.url || a?.href || "");
  const size = a?.size ? formatBytes(a.size) : "";
  const isImg = isImage(name, a?.type || "");
  const by = a?.user_id?.name || a?.uploadedBy?.name || a?.by || "";
  const at =
    a?.updatedAt || a?.createdAt
      ? new Date(a.updatedAt || a.createdAt).toLocaleString()
      : "";

  return (
    <Sheet
      variant="soft"
      sx={{
        width: 260,
        borderRadius: "lg",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "background.level1",
        position: "relative",
        "&:hover .dl": { opacity: 1 },
      }}
    >
      <Box
        sx={{
          height: 150,
          borderRadius: "md",
          overflow: "hidden",
          bgcolor: "background.surface",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {isImg && url ? (
          <img
            src={url}
            alt={name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box sx={{ fontSize: 52, opacity: 0.7 }}>
            {iconFor(name, a?.type)}
          </Box>
        )}

        {/* download-on-hover icon */}
        <IconButton
          className="dl"
          size="sm"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 120ms ease",
            backgroundColor: "#eaf1fa",
            "&:hover": { backgroundColor: "#d0e2f7" }, 
          }}
          component="a"
          href={url || "#"}
          download={name}
          disabled={!url}
        >
          <DownloadRoundedIcon sx={{ color: "#3366a3" }} />
        </IconButton>
      </Box>

      <Box sx={{ px: 0.5 }}>
        <Tooltip title={name} variant="plain">
          <Typography
            level="body-sm"
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
        </Tooltip>
        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
          {size || fileExt(name).toUpperCase()}
        </Typography>

        {(by || at) && (
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
            <PersonOutlineRoundedIcon fontSize="small" />
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              {by || "—"} {at ? ` ${at}` : ""}
            </Typography>
          </Stack>
        )}
      </Box>
    </Sheet>
  );
}

function AttachmentGallery({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <Box
      sx={{
        mt: 0.75,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
        gap: 12,
      }}
    >
      {items.map((a, i) => (
        <AttachmentTile key={a?._id || `${a?.url || ""}-${i}`} a={a} />
      ))}
    </Box>
  );
}

/* ============================= main ============================= */

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
  const [attachments, setAttachments] = useState([]); // local pending uploads
  const [openAttachModal, setOpenAttachModal] = useState(false);
  const [attachDocName, setAttachDocName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const filePickerRef = useRef(null);

  const [openAssocProject, setOpenAssocProject] = useState(true);
  const [openTimeline, setOpenTimeline] = useState(true);
  const [openActivity, setOpenActivity] = useState(true);

  const [tabValue, setTabValue] = useState("comments");

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
    if (task?.project)
      return [
        { code: task.project.code ?? "-", name: task.project.name ?? "-" },
      ];
    if (task?.project_code || task?.project_name)
      return [
        { code: task.project_code ?? "-", name: task.project_name ?? "-" },
      ];
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

  /* ------------------- attachments: modal + pick/drop ------------------- */
  const addPickedFiles = (files) => {
    if (!files?.length) return;
    const items = files.map((f) => ({
      name: attachDocName?.trim() || f.name,
      file: f,
      size: f.size,
      type: f.type,
    }));
    setAttachments((prev) => [...prev, ...items]);
  };
  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    addPickedFiles(files);
    e.target.value = "";
  };
  const onDropFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    addPickedFiles(files);
    setIsDragging(false);
  };
  const handleRemoveAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmitComment = async () => {
    const html = (commentText || "").trim();
    const hasFiles = attachments.length > 0;

    if (!html && !hasFiles)
      return toast.error("Type a comment or attach a file.");
    if (!id) return toast.error("Task id missing");

    try {
      if (hasFiles) {
        const form = new FormData();
        form.append(
          "data",
          JSON.stringify({
            comment: html,
            attachmentNames: attachments.map((a) => a.name),
          })
        );
        attachments.forEach((a) => form.append("files", a.file, a.file.name));

        const updated = await updateTask({ id, body: form }).unwrap();
        setTask(updated);
        toast.success("Files uploaded & comment added");
      } else {
        const updated = await updateTask({
          id,
          body: { comment: html },
        }).unwrap();
        setTask(updated);
        toast.success("Comment added");
      }
      setCommentText("");
      setAttachments([]);
    } catch (e) {
      console.error(e);
      toast.error(
        e?.data?.error || e?.data?.message || "Failed to update task"
      );
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

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Field
          label="Created By"
          value={<PeopleAvatars people={toPeople(task?.createdBy)} max={1} />}
        />
        <Field
          label="Created At"
          value={
            task?.createdAt ? new Date(task.createdAt).toLocaleString() : "—"
          }
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

  /* ------------------- ACTIVITY ------------------- */
  const activity = useMemo(() => {
    const statuses = (task?.status_history || []).map((h) => ({
      _type: "status",
      at: h?.updatedAt ? new Date(h.updatedAt).getTime() : 0,
      status: h?.status,
      remarks: h?.remarks,
      user: h?.user_id,
      attachments: [],
      raw: h,
    }));

    const comments = (task?.comments || []).map(normalizeComment);

    const topLevelAttRaw = task?.attachments || task?.attachements || [];
    const topLevelAtt = Array.isArray(topLevelAttRaw)
      ? topLevelAttRaw.map(normalizeAttachment).filter(Boolean)
      : [];

    const filesAsActivity = topLevelAtt.map((a) => ({
      _type: "file",
      at: a?.updatedAt ? new Date(a.updatedAt).getTime() : 0,
      user: a?.user_id,
      attachment: a,
    }));

    return [...statuses, ...comments, ...filesAsActivity].sort(
      (a, b) => b.at - a.at
    );
  }, [task]);

  /* ------------------- DOCUMENTS ------------------- */
  const documents = useMemo(() => {
    const all = [];
    const top = task?.attachments || task?.attachements || [];
    if (Array.isArray(top)) {
      top.forEach((a) => {
        const na = normalizeAttachment(a);
        if (na) all.push(na);
      });
    }
    (task?.comments || []).forEach((c) => {
      const nc = normalizeComment(c);
      nc.attachments.forEach((a) => all.push(a));
    });
    const seen = new Set();
    const uniq = [];
    for (const a of all) {
      const key = a?._id || `${a?.url}|${a?.name}`;
      if (key && !seen.has(key)) {
        seen.add(key);
        uniq.push(a);
      }
    }
    uniq.sort((a, b) => {
      const ta = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });
    return uniq;
  }, [task]);

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* hidden file input for modal Browse */}
      <input
        ref={filePickerRef}
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          addPickedFiles(files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />

      {/* Row 1 */}
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
          <Stack
            direction="column"
            gap={1.5}
            alignItems="flex-start"
            sx={{ minWidth: 0, width: "100%" }}
          >
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
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
              <Typography level="body-sm">
                {typeMeta(task?.type).label}
              </Typography>
            </Stack>

            <Box
              sx={{ maxHeight: 72, overflowY: "auto", width: "100%", pr: 0.5 }}
            >
              <Typography
                level="h4"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {task?.title || (isFetching ? "Loading…" : "Task")}
              </Typography>
            </Box>

            <Box
              sx={{ maxHeight: 180, overflowY: "auto", width: "100%", pr: 0.5 }}
            >
              <Typography
                level="body-sm"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {task?.description || "—"}
              </Typography>
            </Box>
          </Stack>
        </Sheet>

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

      {/* Row 2: project-only */}
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
              {(Array.isArray(task?.project_id) ? task.project_id : []).map(
                (p, i) => (
                  <Box
                    key={`${p.code || p.projectCode || i}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                  >
                    <Avatar size="md">
                      {(p?.name || p?.projectName || "P")[0]}
                    </Avatar>
                    <Box>
                      <Typography level="body-md" fontWeight="lg">
                        {p?.name || p?.projectName || "Project"}
                      </Typography>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.tertiary" }}
                      >
                        {p?.code || p?.projectCode || "—"}
                      </Typography>
                    </Box>
                  </Box>
                )
              )}
            </Sheet>
          </Section>

          <Section
            title="Status Timeline"
            open={openTimeline}
            onToggle={() => setOpenTimeline((v) => !v)}
          >
            <StatusTimeline
              history={task?.status_history || []}
              current={task?.current_status}
            />
          </Section>
        </Box>
      )}

      {/* Row 3: Activity & Documents */}
      <Section
        title="Activity & Notes"
        open={openActivity}
        onToggle={() => setOpenActivity((v) => !v)}
        right={
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<TimelineRoundedIcon />}
          >
            {activity.length} activities
          </Chip>
        }
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ mb: 1 }}
        >
          <TabList>
            <Tab value="comments">Comments</Tab>
            <Tab value="docs">Documents</Tab>
          </TabList>

          {/* COMMENTS TAB */}
          <TabPanel value="comments" sx={{ p: 0, pt: 1 }}>
            <CommentComposer
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              onCancel={() => {
                setCommentText("");
                setAttachments([]);
              }}
              onAttachClick={() => setOpenAttachModal(true)}
              attachments={attachments}
              onRemoveAttachment={handleRemoveAttachment}
            />

            <Divider sx={{ my: 1.5 }} />

            <Typography level="title-sm" sx={{ mb: 1 }}>
              Activity Stream
            </Typography>
            <Box sx={{ maxHeight: 420, overflow: "auto" }}>
              {activity.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No activity yet.
                </Typography>
              ) : (
                activity.map((it, idx) => {
                  const when = it.at ? new Date(it.at).toLocaleString() : "—";

                  if (it._type === "status") {
                    return (
                      <Box key={`st-${idx}`} sx={{ mb: 1.25 }}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={statusColor(it.status)}
                          sx={{ mr: 1 }}
                        >
                          {(it.status || "-")
                            .split(" ")
                            .map((w) => w[0]?.toUpperCase() + w.slice(1))
                            .join(" ")}
                        </Chip>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.tertiary" }}
                        >
                          <PersonOutlineRoundedIcon fontSize="small" />{" "}
                          {it?.user?.name || "Unknown"} on {when}
                        </Typography>
                        {it?.remarks && (
                          <Typography level="body-sm" sx={{ mt: 0.25 }}>
                            {it.remarks}
                          </Typography>
                        )}
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    );
                  }

                  if (it._type === "comment") {
                    return (
                      <Box key={`cm-${idx}`} sx={{ mb: 1.75 }}>
                        {it?.html && (
                          <div
                            className="comment-body"
                            style={{
                              lineHeight: 1.66,
                              wordBreak: "break-word",
                              marginTop: 4,
                            }}
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(it.html),
                            }}
                          />
                        )}
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={0.5}
                          sx={{ mt: 0.5 }}
                        >
                          <PersonOutlineRoundedIcon fontSize="small" />
                          <Typography
                            level="body-xs"
                            sx={{ color: "text.tertiary" }}
                          >
                            {it?.user_id?.name} {when ? `${when}` : ""}
                          </Typography>
                        </Stack>
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    );
                  }

                  if (it._type === "file") {
                    return (
                      <Box key={`fl-${idx}`} sx={{ mb: 1.75 }}>
                        <AttachmentGallery items={[it.attachment]} />
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    );
                  }

                  return null;
                })
              )}
            </Box>
          </TabPanel>

          {/* DOCUMENTS TAB */}
          <TabPanel value="docs" sx={{ p: 0, pt: 1 }}>
            {documents.length === 0 ? (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                No documents yet.
              </Typography>
            ) : (
              <Sheet variant="soft" sx={{ borderRadius: "md", p: 1 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 160px 210px 80px",
                    gap: 12,
                    px: 1,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    fontWeight: 600,
                  }}
                >
                  <Typography level="body-sm">Name</Typography>
                  <Typography level="body-sm">Type/Size</Typography>
                  <Typography level="body-sm">Uploaded By / When</Typography>
                  <Typography level="body-sm" sx={{ textAlign: "right" }}>
                    {/* Actions (hover) */}
                  </Typography>
                </Box>

                {documents.map((a, i) => {
                  const name = a?.name || "Attachment";
                  const url = safeUrl(a?.url || "");
                  const typeOrExt = a?.type || fileExt(name).toUpperCase();
                  const size = a?.size ? formatBytes(a.size) : "";
                  const who = a?.user_id?.name || "—";
                  const when =
                    a?.updatedAt || a?.createdAt
                      ? new Date(a.updatedAt || a.createdAt).toLocaleString()
                      : "";

                  return (
                    <Box
                      key={a?._id || `${url}-${i}`}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 160px 210px 80px",
                        gap: 12,
                        alignItems: "center",
                        px: 1,
                        py: 1,
                        borderBottom:
                          i === documents.length - 1 ? "none" : "1px solid",
                        borderColor: "neutral.outlinedBorder",
                        "&:hover .dl": { opacity: 1 },
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ fontSize: 22, opacity: 0.75 }}>
                          {iconFor(name, a?.type)}
                        </Box>
                        <Tooltip title={name}>
                          <Typography
                            level="body-sm"
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 420,
                              fontWeight: 600,
                            }}
                          >
                            {name}
                          </Typography>
                        </Tooltip>
                      </Stack>

                      <Typography
                        level="body-sm"
                        sx={{ color: "text.tertiary" }}
                      >
                        {typeOrExt}
                        {size ? ` • ${size}` : ""}
                      </Typography>

                      <Typography
                        level="body-sm"
                        sx={{ color: "text.tertiary" }}
                      >
                        {who}
                        {when ? ` • ${when}` : ""}
                      </Typography>

                      <Box sx={{ textAlign: "right" }}>
                        <Tooltip title="Download">
                          <IconButton
                            className="dl"
                            size="sm"
                            variant="solid"
                            sx={{
                              "--Icon-color": "#3366a3",
                              opacity: 0,
                              transition: "opacity 120ms ease",
                              backgroundColor: "#eaf1fa",
                              "&:hover": { backgroundColor: "#d0e2f7" },
                            }}
                            component="a"
                            href={url || "#"}
                            download={name}
                            disabled={!url}
                          >
                            <DownloadRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  );
                })}
              </Sheet>
            )}
          </TabPanel>
        </Tabs>
      </Section>

      {/* Status Update Modal */}
      <Modal open={openStatusModal} onClose={() => setOpenStatusModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 520 }}>
          <DialogTitle>Update Status</DialogTitle>
          <DialogContent>
            Select a new status and add remarks (optional).
          </DialogContent>
          <Stack gap={1.25} sx={{ mt: 1 }}>
            <Select
              value={status}
              onChange={(_, v) => setStatus(v)}
              placeholder="Select Status"
              disabled={isCompleted}
            >
              <Option disabled value="Select Status">
                Select Status
              </Option>
              <Option value="pending">Pending</Option>
              <Option value="in progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Textarea
              minRows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write remarks..."
            />
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

      {/* Attach File Modal */}
      <Modal open={openAttachModal} onClose={() => setOpenAttachModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 560 }}>
          <DialogTitle>Attach file(s)</DialogTitle>
          <DialogContent>
            Give your document a name (optional), then drag files below or
            browse.
          </DialogContent>

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
              onClick={() => filePickerRef.current?.click()}
              sx={{
                p: 3,
                borderRadius: "md",
                textAlign: "center",
                border: "2px dashed",
                borderColor: isDragging
                  ? "primary.outlinedBorder"
                  : "neutral.outlinedBorder",
                bgcolor: isDragging ? "primary.softBg" : "background.level1",
                cursor: "pointer",
              }}
            >
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                justifyContent="center"
              >
                <CloudUploadRoundedIcon />
                <Typography level="body-sm">
                  Drag & drop files here, or <strong>click to browse</strong>
                </Typography>
              </Stack>
            </Box>

            {attachments.length > 0 && (
              <Stack gap={0.75}>
                <Typography level="body-sm">Pending attachments</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {attachments.map((f, i) => (
                    <Chip
                      key={`${f.name}-${i}`}
                      variant="soft"
                      endDecorator={
                        <IconButton
                          size="sm"
                          variant="plain"
                          onClick={() => handleRemoveAttachment(i)}
                          aria-label="Remove"
                        >
                          ✕
                        </IconButton>
                      }
                    >
                      {f.name}
                    </Chip>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          <DialogActions>
            <Button variant="plain" onClick={() => setOpenAttachModal(false)}>
              Close
            </Button>
            <Button onClick={() => setOpenAttachModal(false)}>Done</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
  right = null,
  outlined = true,
}) {
  return (
    <Sheet
      variant={outlined ? "outlined" : "soft"}
      sx={{ p: 2, borderRadius: "md", mb: 2 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton
            size="sm"
            variant="plain"
            onClick={onToggle}
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <KeyboardArrowDownRoundedIcon />
            ) : (
              <KeyboardArrowRightRoundedIcon />
            )}
          </IconButton>
          <Typography level="title-md">{title}</Typography>
        </Stack>
        {right}
      </Stack>
      {open && <Box sx={{ mt: 1.25 }}>{children}</Box>}
    </Sheet>
  );
}
