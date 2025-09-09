// ViewTaskPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Autocomplete,
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useGetAllUserQuery,
  useCreateSubTaskMutation,
} from "../../redux/globalTaskSlice";

import CommentComposer from ".././Comments";

/* ---------------- meta / utils ---------------- */
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

const safeUrl = (u = "") => {
  try {
    const x = new URL(u);
    return x.href;
  } catch {
    return "";
  }
};
const getAvatarUrl = (u = {}) => safeUrl(u.attachment?.url || "");

const idOf = (u) => u?._id || u?.id || u?.email || u?.name;

const toPerson = (u = {}) => {
  if (typeof u === "string") return { id: u, name: u, avatar: "" };
  return {
    id: idOf(u) || Math.random().toString(36).slice(2),
    name: u.name || u.fullName || u.displayName || u.email || "User",
    avatar: getAvatarUrl(u),
  };
};

const toPeople = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(toPerson);
  return [toPerson(input)];
};

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";
const colorFromName = (name = "") => {
  const palette = ["primary", "success", "info", "warning", "danger", "neutral"];
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
    type?.startsWith?.("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)
  );
};

const iconFor = (name = "", type = "") => {
  const ext = fileExt(name);
  if (type?.includes?.("pdf") || ext === "pdf") return <PictureAsPdfOutlinedIcon />;
  if (isImage(name, type)) return <ImageOutlinedIcon />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <TableChartOutlinedIcon />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <ArchiveOutlinedIcon />;
  if (["doc", "docx", "rtf", "txt", "md"].includes(ext)) return <DescriptionOutlinedIcon />;
  return <InsertDriveFileOutlinedIcon />;
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
    (!last || (last.status || "").toLowerCase() !== (current.status || "").toLowerCase())
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

  const isClosed = ["completed", "cancelled"].includes((current?.status || "").toLowerCase());

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
  const atts = Array.isArray(attRaw) ? attRaw.map(normalizeAttachment).filter(Boolean) : [];
  return {
    _type: "comment",
    at: t ? new Date(t).getTime() : 0,
    html: c?.remarks || c?.text || "",
    user: c?.user_id,
    attachments: atts,
    raw: c,
  };
};

function AttachmentTile({ a }) {
  const name = a?.name || "Attachment";
  const url = safeUrl(a?.url || a?.href || "");
  const size = a?.size ? formatBytes(a.size) : "";
  const isImg = isImage(name, a?.type || "");
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
          <Box sx={{ fontSize: 52, opacity: 0.7 }}>{iconFor(name, a?.type)}</Box>
        )}

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
        {size && (
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {size}
          </Typography>
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

/* ================== MAIN PAGE ================== */
export default function ViewTaskPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("task");

  const { data: taskApi, isFetching } = useGetTaskByIdQuery(id, { skip: !id });

  const [task, setTask] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Select Status");
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [openAttachModal, setOpenAttachModal] = useState(false);
  const [attachDocName, setAttachDocName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const filePickerRef = useRef(null);

  const [openActivity, setOpenActivity] = useState(true);

  const [tabValue, setTabValue] = useState("comments");
  const [openStatusModal, setOpenStatusModal] = useState(false);

  const [updateTaskStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();

  /* ----- Followers modal state ----- */
  const [openFollowers, setOpenFollowers] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState([]); // {_id,name,avatar}
  const [savingFollowers, setSavingFollowers] = useState(false);

  /* ----- Reassign modal state (MULTI SELECT) ----- */
  const [openReassign, setOpenReassign] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]); // [{_id,name,avatar}]
  const [reassignDeadline, setReassignDeadline] = useState(""); // yyyy-MM-ddTHH:mm
  const [savingReassign, setSavingReassign] = useState(false);

  const [createSubTask] = useCreateSubTaskMutation();

  // who am I?
  const meId = useMemo(() => {
    try {
      const raw = localStorage.getItem("userDetails");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.userID) return u.userID;
        if (u?.userId) return u.userId;
        if (u?._id) return u._id;
      }
    } catch (e) {
      console.error("Error parsing user info:", e);
    }
    return "";
  }, []);

  // Users dropdown
  const { data: allUsersResp, isFetching: usersLoading } = useGetAllUserQuery({
    department: "",
  });

  useEffect(() => {
    if (taskApi) setTask(taskApi);
  }, [taskApi]);

  const effectiveCurrentStatus = task?.current_status;

  // Select effective status value into the modal select
  useEffect(() => {
    const s = effectiveCurrentStatus?.status;
    if (!s || s.toLowerCase() === "draft") setStatus("Select Status");
    else setStatus(s.toLowerCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  // followers options (excluding already-following)
  const allUserOptions = useMemo(() => {
    const apiUsers = Array.isArray(allUsersResp)
      ? allUsersResp
      : Array.isArray(allUsersResp?.data)
      ? allUsersResp.data
      : [];

    const followerSet = new Set((task?.followers || []).map((u) => idOf(u)).filter(Boolean));

    const filtered = apiUsers.filter((u) => !followerSet.has(idOf(u)));

    const seen = new Set();
    const out = [];
    for (const u of filtered) {
      const uid = idOf(u);
      if (!uid || seen.has(uid)) continue;
      seen.add(uid);
      out.push({
        _id: uid,
        name: u?.name || "User",
        avatar: getAvatarUrl(u),
      });
    }
    return out;
  }, [allUsersResp, task?.followers]);

  // Sync selectedFollowers with task
  useEffect(() => {
    if (Array.isArray(task?.followers)) {
      setSelectedFollowers(
        task.followers.map((u) => ({
          _id: idOf(u),
          name: u?.name || u?.fullName || u?.displayName || u?.email || "User",
          avatar: getAvatarUrl(u),
        }))
      );
    }
  }, [task]);

  const followerIds = (arr) =>
    (arr || []).map((u) => u?._id || u?.id || u?.email || u?.name).filter(Boolean);

  const handleSaveFollowers = async () => {
    if (!id) return toast.error("Task id missing");
    try {
      setSavingFollowers(true);
      const ids = followerIds(selectedFollowers);
      const updated = await updateTask({
        id,
        body: { followers: ids },
      }).unwrap();
      setTask(updated);
      setOpenFollowers(false);
      toast.success("Followers updated");
    } catch (e) {
      toast.error(e?.data?.error || "Failed updating followers");
    } finally {
      setSavingFollowers(false);
    }
  };

  const projects = useMemo(() => {
    if (Array.isArray(task?.project_id) && task?.project_id?.length) {
      return task.project_id.map((p) => ({
        code: p.code ?? p.projectCode ?? "-",
        name: p.name ?? p.projectName ?? "-",
      }));
    }
    if (task?.project)
      return [{ code: task.project.code ?? "-", name: task.project.name ?? "-" }];
    if (task?.project_code || task?.project_name)
      return [{ code: task.project_code ?? "-", name: task.project_name ?? "-" }];
    return [];
  }, [task]);

  // ----- Subtask-aware view (subtask.assigned_to is now ARRAY) -----
  const subtasks = task?.sub_tasks || [];
  const mySubtask = useMemo(() => {
    return (
      subtasks.find((s) => {
        const arr = Array.isArray(s?.assigned_to)
          ? s.assigned_to
          : s?.assigned_to
          ? [s.assigned_to]
          : [];
        return arr.some((u) => idOf(u) === meId);
      }) || null
    );
  }, [subtasks, meId]);
  const viewIsSubtask = !!mySubtask;

  const effectiveStatusHistory = task?.status_history || [];

  const hasReassign = subtasks.length > 0;

  const handleStatusSubmit = async () => {
    const chosen = status === "Select Status" ? "" : status;
    if (!chosen) return toast.error("Pick a status");
    try {
      await updateTaskStatus({ id, status: chosen, remarks: note }).unwrap();
      setNote("");
      toast.success("Status updated");
      setOpenStatusModal(false);
    } catch (e) {
      toast.error(e?.data?.message || "Failed to update status");
    }
  };

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

    if (!html && !hasFiles) return toast.error("Type a comment or attach a file.");
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
      toast.error(e?.data?.error || e?.data?.message || "Failed to update task");
    }
  };

  const priorityMap = {
    1: { label: "Low", color: "success" },
    2: { label: "Medium", color: "warning" },
    3: { label: "High", color: "danger" },
  };

  const isCompleted = (effectiveCurrentStatus?.status || "").toLowerCase() === "completed";

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

    return [...statuses, ...comments, ...filesAsActivity].sort((a, b) => b.at - a.at);
  }, [task]);

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

  const navigate = useNavigate();

  // Reassign assignee options (exclude already assigned_to, and no user_id field)
  const allAssigneeOptions = useMemo(() => {
    const apiUsers = Array.isArray(allUsersResp)
      ? allUsersResp
      : Array.isArray(allUsersResp?.data)
      ? allUsersResp.data
      : [];

    const assignedIds = new Set((task?.assigned_to || []).map((u) => idOf(u)).filter(Boolean));

    const seen = new Set();
    const out = [];

    for (const u of apiUsers) {
      const _id = idOf(u);
      if (!_id || seen.has(_id)) continue;
      if (assignedIds.has(_id)) continue;

      seen.add(_id);
      out.push({
        _id,
        name: u?.name || u?.fullName || u?.displayName || u?.email || "User",
        avatar: getAvatarUrl(u),
      });
    }

    return out;
  }, [allUsersResp, task?.assigned_to]);

  // --------- MULTI-SELECT submit ---------
  const handleSubmitReassign = async () => {
    if (!id) return toast.error("Task id missing");
    if (!selectedAssignees.length) return toast.error("Pick at least one user");
    try {
      setSavingReassign(true);

      const body = {
        title: `Reassigned to ${selectedAssignees.length} user(s)`,
        remarks: "Task reassigned via ViewTaskPage",
        assigned_to: selectedAssignees.map((u) => u._id), // array of ids
        ...(reassignDeadline ? { deadline: new Date(reassignDeadline).toISOString() } : {}),
      };

      const updated = await createSubTask({ taskId: id, body }).unwrap();

      // If API returns the whole task as { task }, prefer that
      setTask(updated?.task || updated);

      toast.success("Reassignment subtask created");
      setOpenReassign(false);
      setSelectedAssignees([]);
      setReassignDeadline("");
    } catch (e) {
      console.error(e);
      toast.error(e?.data?.message || e?.data?.error || "Failed to create subtask");
    } finally {
      setSavingReassign(false);
    }
  };

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      <input ref={filePickerRef} type="file" multiple onChange={onPickFiles} style={{ display: "none" }} />

      {/* Row 1 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "stretch",
          gridAutoRows: "1fr",
          mb: 2,
          "& > *": { minWidth: 0 },
        }}
      >
        {/* FIRST CARD with Followers button */}
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
            position: "relative",
          }}
        >
          <Tooltip title="Manage followers">
            <IconButton
              size="sm"
              variant="soft"
              onClick={() => setOpenFollowers(true)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                borderRadius: "lg",
              }}
            >
              <GroupOutlinedIcon fontSize="small" />
              <Chip
                size="sm"
                variant="solid"
                color="primary"
                sx={{
                  ml: 0.75,
                  height: 20,
                  minHeight: 20,
                  fontSize: 12,
                  borderRadius: "999px",
                }}
              >
                {(task?.followers?.length ?? 0).toString()}
              </Chip>
            </IconButton>
          </Tooltip>

          <Stack direction="column" gap={1.5} alignItems="flex-start" sx={{ minWidth: 0, width: "100%" }}>
            <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
              {task?.taskCode && (
                <Chip size="sm" variant="soft" color="primary">
                  {task.taskCode}
                </Chip>
              )}
              <Chip
                variant="soft"
                color={statusColor(effectiveCurrentStatus?.status)}
                data-status-modal
                sx={{ cursor: isCompleted ? "not-allowed" : "pointer" }}
                onClick={() => !isCompleted && setOpenStatusModal(true)}
              >
                {effectiveCurrentStatus?.status
                  ? effectiveCurrentStatus.status
                      .split(" ")
                      .map((w) => w[0]?.toUpperCase() + w.slice(1))
                      .join(" ")
                  : "—"}
              </Chip>
              {typeMeta(task?.type).icon}
              <Typography level="body-sm">{typeMeta(task?.type).label}</Typography>
            </Stack>

            <Box sx={{ maxHeight: 72, overflowY: "auto", width: "100%", pr: 0.5 }}>
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

            <Box sx={{ maxHeight: 180, overflowY: "auto", width: "100%", pr: 0.5 }}>
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

        {/* SECOND CARD: Info */}
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
                  <Stack direction="row" alignItems="center" gap={1}>
                    {task?.assigned_to?.length ? (
                      <PeopleAvatars people={toPeople(task.assigned_to)} />
                    ) : (
                      <Typography level="body-sm">None</Typography>
                    )}
                    {!hasReassign && (
                      <Tooltip title="Reassign">
                        <IconButton
                          size="sm"
                          variant="soft"
                          onClick={() => setOpenReassign(true)}
                          aria-label="Reassign"
                          sx={{ ml: 1 }}
                        >
                          <AutorenewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                }
              />

              {/* When subtasks exist, show reassignment details */}
              {hasReassign && (
                <>
                  <Field
                    label="Reassigned To"
                    value={
                      <PeopleAvatars
                        people={toPeople(
                          (function () {
                            const uniq = new Map();
                            (subtasks || []).forEach((s) => {
                              const arr = Array.isArray(s?.assigned_to)
                                ? s.assigned_to
                                : s?.assigned_to
                                ? [s.assigned_to]
                                : [];
                              arr.forEach((u) => {
                                const k = idOf(u);
                                if (k && !uniq.has(k)) uniq.set(k, u);
                              });
                            });
                            return Array.from(uniq.values());
                          })()
                        )}
                      />
                    }
                  />
                  <Field
                    label="Reassigned Deadline"
                    value={
                      mySubtask?.deadline
                        ? new Date(mySubtask.deadline).toLocaleString()
                        : subtasks.length === 1 && subtasks[0]?.deadline
                        ? new Date(subtasks[0].deadline).toLocaleString()
                        : "Multiple"
                    }
                  />
                </>
              )}
              <Field
                label="Priority"
                value={
                  Number(task?.priority) > 0 ? (
                    <Chip size="sm" variant="solid" color={priorityMap[Number(task?.priority)]?.color}>
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
              <Field label="Created By" value={<PeopleAvatars people={toPeople(task?.createdBy)} max={1} />} />
              <Field
                label="Created At"
                value={task?.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
              />
              {!viewIsSubtask && (
                <Field
                  label="Due Date"
                  value={task?.deadline ? new Date(task.deadline).toLocaleDateString("en-GB") : "—"}
                />
              )}

              <Field
                label="Status"
                value={
                  <Chip
                    size="sm"
                    color={statusColor(effectiveCurrentStatus?.status)}
                    onClick={() => !isCompleted && setOpenStatusModal(true)}
                    sx={{ cursor: isCompleted ? "not-allowed" : "pointer" }}
                  >
                    {effectiveCurrentStatus?.status
                      ? effectiveCurrentStatus.status
                          .split(" ")
                          .map((w) => w[0]?.toUpperCase() + w.slice(1))
                          .join(" ")
                      : "—"}
                  </Chip>
                }
              />
            </Box>
          </Sheet>
        </Sheet>
      </Box>

      {/* Row 2: project + timeline */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: task?.type === "project" ? "1fr 1fr" : "1fr",
          },
          gap: 2,
          alignItems: "stretch",
          gridAutoRows: "1fr",
          mb: 2,
          "& > *": { minWidth: 0 },
        }}
      >
        {task?.type === "project" && (
          <Section
            title="Associated Projects"
            outlined={false}
            collapsible={false}
            contentSx={{ height: "100%", overflow: "auto" }}
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
              {(Array.isArray(task?.project_id) ? task.project_id : []).map((p, i) => (
                <Box
                  key={`${p.code || p.projectCode || i}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "neutral.softBg" },
                    borderRadius: "sm",
                    p: 1,
                  }}
                  onClick={() =>
                    navigate(`/project_detail?page=1&project_id=${p?._id || p?.projectId}`)
                  }
                >
                  <Avatar size="md">{(p?.name || p?.projectName || "P")[0]}</Avatar>
                  <Box>
                    <Typography level="body-md" fontWeight="lg">
                      {p?.name || p?.projectName || "Project"}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      {p?.code || p?.projectCode || "—"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Sheet>
          </Section>
        )}

        <Section title="Status Timeline" collapsible={false} contentSx={{ height: "10vh", overflow: "auto" }}>
          <StatusTimeline history={effectiveStatusHistory} current={effectiveCurrentStatus} />
        </Section>
      </Box>

      {/* Activity & Notes */}
      <Section
        title="Activity & Notes"
        open={openActivity}
        onToggle={() => setOpenActivity((v) => !v)}
        right={
          <Chip size="sm" variant="soft" startDecorator={<TimelineRoundedIcon />}>
            {activity.length} activities
          </Chip>
        }
      >
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 1 }}>
          <TabList>
            <Tab value="comments">Comments</Tab>
            <Tab value="docs">Documents</Tab>
          </TabList>

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
                  const user = toPerson(it.user || it.user_id || {});
                  const when = it.at ? new Date(it.at) : null;
                  const whenLabel = when
                    ? when.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—";

                  const isStatus = it._type === "status";
                  const statusLabel = cap(it.status || "-");

                  return (
                    <Box key={`act-${idx}`} sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="flex-start" gap={1.25}>
                        <Avatar
                          src={user.avatar || undefined}
                          variant={user.avatar ? "soft" : "solid"}
                          color={user.avatar ? "neutral" : colorFromName(user.name)}
                          sx={{ width: 36, height: 36, fontWeight: 700 }}
                        >
                          {!user.avatar && initialsOf(user.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="baseline" gap={1}>
                            <Typography level="body-sm" fontWeight="lg" sx={{ whiteSpace: "nowrap" }}>
                              {user.name}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                              {whenLabel}
                            </Typography>
                          </Stack>

                          {it._type === "comment" && it?.html ? (
                            <div
                              style={{
                                marginTop: 2,
                                lineHeight: 1.66,
                                wordBreak: "break-word",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(it.html),
                              }}
                            />
                          ) : isStatus ? (
                            <Stack
                              direction="row"
                              alignItems="center"
                              gap={1}
                              sx={{ mt: 0.25, flexWrap: "wrap" }}
                            >
                              <Chip size="sm" variant="soft" color={statusColor(it.status)}>
                                {statusLabel}
                              </Chip>
                              {it.remarks && (
                                <Typography level="body-sm">{String(it.remarks).trim()}</Typography>
                              )}
                            </Stack>
                          ) : it._type === "file" ? (
                            <Typography level="body-sm" sx={{ mt: 0.25 }}>
                              {`Uploaded file: ${it?.attachment?.name || "Attachment"}`}
                            </Typography>
                          ) : null}

                          {it._type === "file" && it.attachment ? (
                            <Box sx={{ mt: 0.75 }}>
                              <AttachmentGallery items={[it.attachment]} />
                            </Box>
                          ) : null}
                        </Box>
                      </Stack>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  );
                })
              )}
            </Box>
          </TabPanel>

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
                  <Typography level="body-sm" sx={{ textAlign: "right" }} />
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
                        borderBottom: i === documents.length - 1 ? "none" : "1px solid",
                        borderColor: "neutral.outlinedBorder",
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Box sx={{ fontSize: 22, opacity: 0.75 }}>{iconFor(name, a?.type)}</Box>
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

                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        {typeOrExt}
                        {size ? ` • ${size}` : ""}
                      </Typography>

                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
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
                              opacity: 1,
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
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
              }}
              onClick={() => setOpenStatusModal(false)}
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
          <DialogContent>Give your document a name (optional), then drag files below or browse.</DialogContent>

          <Stack gap={1.25} sx={{ mt: 1 }}>
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
                borderColor: isDragging ? "primary.outlinedBorder" : "neutral.outlinedBorder",
                bgcolor: isDragging ? "primary.softBg" : "background.level1",
                cursor: "pointer",
                height: "10vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
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
                      size="sm"
                      clickable={false}
                      sx={{ "& .chip-close": { pointerEvents: "auto" } }}
                      endDecorator={
                        <IconButton
                          size="sm"
                          variant="plain"
                          className="chip-close"
                          aria-label="Remove"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttachment(i);
                          }}
                        >
                          <CloseRoundedIcon fontSize="small" />
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
            <Button
              variant="outlined"
              onClick={() => setOpenAttachModal(false)}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => setOpenAttachModal(false)}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                px: 2.25,
                "&:hover": { backgroundColor: "#285680" },
              }}
            >
              Done
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Followers Manager Modal */}
      <Modal open={openFollowers} onClose={() => setOpenFollowers(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 480 }}>
          <DialogTitle>Add Followers</DialogTitle>
          <DialogContent>Select or remove followers for this task.</DialogContent>

          <Stack gap={1.25} sx={{ mt: 1 }}>
            {/* Current followers as removable chips */}
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {selectedFollowers.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No followers yet.
                </Typography>
              ) : (
                selectedFollowers.map((u, i) => (
                  <Chip
                    key={u._id || i}
                    variant="soft"
                    size="sm"
                    clickable={false}
                    startDecorator={
                      <Avatar
                        size="sm"
                        src={u.avatar || undefined}
                        variant={u.avatar ? "soft" : "solid"}
                        color={u.avatar ? "neutral" : colorFromName(u.name)}
                      >
                        {!u.avatar && initialsOf(u.name)}
                      </Avatar>
                    }
                    endDecorator={
                      <IconButton
                        size="sm"
                        variant="plain"
                        className="chip-close"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFollowers((prev) =>
                            prev.filter((x) => (x._id || x.name) !== (u._id || u.name))
                          );
                        }}
                        aria-label={`Remove ${u.name}`}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{
                      "--Chip-gap": "6px",
                      "& .chip-close": { pointerEvents: "auto" },
                    }}
                  >
                    {u.name}
                  </Chip>
                ))
              )}
            </Stack>

            {/* Add more via Autocomplete */}
            <Autocomplete
              multiple
              placeholder="Search users to add…"
              options={allUserOptions}
              loading={usersLoading}
              value={[]}
              onChange={(_, vals) => {
                const toAdd =
                  (vals || []).filter(
                    (v) =>
                      !selectedFollowers.some((s) => (s._id || s.name) === (v._id || v.name))
                  ) || [];
                if (toAdd.length) {
                  setSelectedFollowers((prev) => [...prev, ...toAdd]);
                }
              }}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) =>
                (o?._id || o?.id || o?.email || o?.name) ===
                (v?._id || v?.id || v?.email || v?.name)
              }
              renderOption={(liProps, option) => (
                <li {...liProps} key={option._id}>
                  <Stack sx={{ cursor: "pointer" }} direction="row" alignItems="center" gap={1}>
                    <Avatar
                      size="sm"
                      src={option.avatar || undefined}
                      variant={option.avatar ? "soft" : "solid"}
                      color={option.avatar ? "neutral" : colorFromName(option.name)}
                    >
                      {!option.avatar && initialsOf(option.name)}
                    </Avatar>
                    <Typography level="body-sm">{option.name}</Typography>
                  </Stack>
                </li>
              )}
              sx={{ "--Listbox-maxHeight": "260px", cursor: "pointer" }}
            />
          </Stack>

          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setOpenFollowers(false)}
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
              onClick={handleSaveFollowers}
              loading={savingFollowers}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
              }}
            >
              Update
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Reassign Modal (MULTI-SELECT) */}
      <Modal open={openReassign} onClose={() => setOpenReassign(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 520 }}>
          <DialogTitle>Reassign Task</DialogTitle>
          <DialogContent>Select users and (optionally) set a deadline for the reassignment subtask.</DialogContent>

          <Stack gap={1.25} sx={{ mt: 1 }}>
            {/* Multi-select users */}
            <Autocomplete
              multiple
              placeholder="Select users…"
              options={allAssigneeOptions}
              loading={usersLoading}
              value={selectedAssignees}
              onChange={(_e, vals) => setSelectedAssignees(vals || [])}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) =>
                (o?._id || o?.id || o?.email || o?.name) ===
                (v?._id || v?.id || v?.email || v?.name)
              }
              renderOption={(liProps, option) => (
                <li {...liProps} key={option._id}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Avatar
                      size="sm"
                      src={option.avatar || undefined}
                      variant={option.avatar ? "soft" : "solid"}
                      color={option.avatar ? "neutral" : colorFromName(option.name)}
                    >
                      {!option.avatar && initialsOf(option.name)}
                    </Avatar>
                    <Typography level="body-sm">{option.name}</Typography>
                  </Stack>
                </li>
              )}
              sx={{ "--Listbox-maxHeight": "260px" }}
            />

            {/* Deadline */}
            <Stack gap={0.5}>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                Deadline (optional)
              </Typography>
              <Input
                type="datetime-local"
                value={reassignDeadline}
                onChange={(e) => setReassignDeadline(e.target.value)}
              />
            </Stack>
          </Stack>

          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setOpenReassign(false)}
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
              onClick={handleSubmitReassign}
              loading={savingReassign}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
              }}
            >
              Create Subtask
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}



/* ---------- Section wrapper ---------- */
function Section({
  title,
  open = true,
  onToggle,
  children,
  right = null,
  outlined = true,
  collapsible = true,
  contentSx = {},
}) {
  return (
    <Sheet
      variant={outlined ? "outlined" : "soft"}
      sx={{ p: 2, borderRadius: "md", mb: 2 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          {collapsible ? (
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
          ) : null}
          <Typography level="title-md">{title}</Typography>
        </Stack>
        {right}
      </Stack>
      {(collapsible ? open : true) && (
        <Box sx={{ mt: 1.25, ...contentSx }}>{children}</Box>
      )}
    </Sheet>
  );
}
