// src/pages/tasks/ViewTaskPage.jsx
import { useEffect, useMemo, useState } from "react";
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
  Input,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  IconButton,
} from "@mui/joy";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";
import { toast } from "react-toastify";

// ===== RTKQ hooks you already have =====
import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  // useUpdateTaskFieldsMutation,
  // useAddTaskCommentMutation,
} from "../../redux/globalTaskSlice";

// ---- helpers ----
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
    case "delayed":
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

// Generic collapsible section
function Section({ title, open, onToggle, children, right = null, outlined = true }) {
  return (
    <Sheet variant={outlined ? "outlined" : "soft"} sx={{ p: 2, borderRadius: "md", mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton
            size="sm"
            variant="plain"
            onClick={onToggle}
            aria-label={open ? "Collapse" : "Expand"}
          >
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

export default function ViewTaskPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("task");
  const navigate = useNavigate();

  // queries
  const { data: taskApi, isFetching } = useGetTaskByIdQuery(id, { skip: !id });

  // local state
  const [task, setTask] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Select Status");
  const [editingInfo, setEditingInfo] = useState(false);

  // collapsible toggles
  const [openDescription, setOpenDescription] = useState(true);
  const [openInfo, setOpenInfo] = useState(true);
  const [openAssocProject, setOpenAssocProject] = useState(true);
  const [openActivity, setOpenActivity] = useState(true);

  // mutations
  const [updateTaskStatus, { isLoading: isUpdating }] =
    useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // editable fields
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [duration, setDuration] = useState("");
  const [completion, setCompletion] = useState("");
  const [priority, setPriority] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (taskApi) setTask(taskApi);
  }, [taskApi]);

  // derive status value shown in dropdown
  useEffect(() => {
    const s = task?.current_status?.status;
    if (!s || s.toLowerCase() === "draft") setStatus("Select Status");
    else setStatus(s.toLowerCase());
  }, [task]);

  // hydrate editable fields when entering edit mode or when task changes
  useEffect(() => {
    if (!task) return;
    setOwner(task?.assigned_to?.map((a) => a.name).join(", ") || "");
    setStartDate(task?.startDate ? task.startDate.slice(0, 10) : "");
    setDueDate(task?.deadline ? task.deadline.slice(0, 10) : "");
    setDuration(task?.duration_days ?? task?.duration ?? "");
    setCompletion(task?.completion_percentage ?? task?.completion ?? "");
    setPriority(task?.priority ?? "");
    setTags((task?.tags || []).join(", "));
  }, [task, editingInfo]);

  const projects = useMemo(() => {
    if (Array.isArray(task?.project_id) && task?.project_id?.length) {
      return task.project_id.map((p) => ({
        code: p.code ?? p.projectCode ?? "-",
        name: p.name ?? p.projectName ?? "-",
      }));
    }
    if (task?.project) {
      return [
        {
          code: task.project.code ?? "-",
          name: task.project.name ?? "-",
        },
      ];
    }
    if (task?.project_code || task?.project_name) {
      return [{ code: task.project_code ?? "-", name: task.project_name ?? "-" }];
    }
    return [];
  }, [task]);

  const handleDelete = async () => {
    if (!id) return toast.error("Task ID not found");
    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted");
      navigate("/all_task");
    } catch (e) {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusSubmit = async () => {
    const chosen = status === "Select Status" ? "" : status;
    if (!chosen) return toast.error("Pick a status");
    try {
      await updateTaskStatus({ id, status: chosen, remarks: note }).unwrap();

      // optimistic UI
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
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSaveInfo = async () => {
    setTask((prev) => ({
      ...prev,
      startDate: startDate || prev?.startDate,
      deadline: dueDate || prev?.deadline,
      duration_days: duration || prev?.duration_days,
      completion_percentage: completion || prev?.completion_percentage,
      priority: priority || prev?.priority,
      tags:
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean) || prev?.tags,
      assigned_to:
        owner?.length > 0
          ? owner.split(",").map((name, i) => ({ name: name.trim(), _idx: i }))
          : prev?.assigned_to,
    }));
    setEditingInfo(false);
    toast.success("Updated (local)");
  };

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
      }}
    >
      {/* LHS */}
      <Box>
        <Field label="Owner" value={owner || "None"} decorator={<GroupRoundedIcon />} />
        <Field
          label="Status"
          value={
            <Chip size="sm" color={statusColor(task?.current_status?.status)}>
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
          label="Due Date"
          value={
            task?.deadline
              ? new Date(task.deadline).toLocaleDateString("en-GB")
              : "—"
          }
          decorator={<CalendarMonthRoundedIcon />}
        />
        <Field
          label="Priority"
          value={
            Number(priority) > 0 ? (
              <Typography component="span" color="warning">
                {Array(Number(priority))
                  .fill(0)
                  .map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
              </Typography>
            ) : (
              "None"
            )
          }
          decorator={<PriorityHighRoundedIcon />}
          muted={!(Number(priority) > 0)}
        />
        <Field
          label="Tags"
          value={
            (Array.isArray(task?.tags) && task.tags.length
              ? task.tags.join(", ")
              : tags || "—")
          }
        />
      </Box>

      {/* RHS */}
      <Box>
        <Field
          label="Start Date"
          value={
            task?.startDate
              ? new Date(task.startDate).toLocaleDateString("en-GB")
              : "—"
          }
          decorator={<CalendarMonthRoundedIcon />}
        />
        <Field
          label="Duration"
          value={
            task?.duration_days || task?.duration
              ? `${task.duration_days ?? task.duration} days`
              : "—"
          }
          decorator={<AccessTimeRoundedIcon />}
        />
        <Field
          label="Completion Percentage"
          value={`${task?.completion_percentage ?? task?.completion ?? 0} %`}
          decorator={<PercentRoundedIcon />}
        />
        <Field label="Created By" value={task?.createdBy?.name || "—"} />
        <Field
          label="Created At"
          value={task?.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
        />
      </Box>
    </Sheet>
  );

  const isCompleted = (task?.current_status?.status || "").toLowerCase() === "completed";

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* Top Bar */}
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "md",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          bgcolor: "background.surface",
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="center">
          <Chip size="sm" variant="solid" color="primary">
            Task
          </Chip>
          <Typography level="h4">
            {task?.title || (isFetching ? "Loading…" : "Task")}
          </Typography>
          {task?.taskCode && (
            <Chip size="sm" variant="soft">
              {task.taskCode}
            </Chip>
          )}
        </Stack>

        <Stack direction="row" gap={1}>
          <IconButton
            variant="outlined"
            color="neutral"
            onClick={() => setEditingInfo((v) => !v)}
          >
            {editingInfo ? <CloseRoundedIcon /> : <EditRoundedIcon />}
          </IconButton>
          {editingInfo && (
            <IconButton variant="solid" color="primary" onClick={handleSaveInfo}>
              <SaveRoundedIcon />
            </IconButton>
          )}
          <IconButton
            variant="outlined"
            color="danger"
            loading={isDeleting}
            onClick={handleDelete}
          >
            <DeleteOutlineRoundedIcon />
          </IconButton>
        </Stack>
      </Sheet>

      {/* Normal (non-fixed) Status bar */}
      <Sheet
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: "md",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.level1",
          boxShadow: "sm",
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Chip variant="soft" color={statusColor(task?.current_status?.status)}>
            {(task?.current_status?.status || "Current Status")
              .split(" ")
              .map((w) => w[0]?.toUpperCase() + w.slice(1))
              .join(" ")}
          </Chip>
          {typeMeta(task?.type).icon}
          <Typography level="body-sm">{typeMeta(task?.type).label}</Typography>
        </Stack>

        <Stack direction="row" gap={1} alignItems="center">
          <Select
            value={status}
            onChange={(_, v) => setStatus(v)}
            size="sm"
            sx={{ minWidth: 180 }}
            disabled={isCompleted}
          >
            <Option disabled value="Select Status">
              Select Status
            </Option>
            <Option value="pending">Pending</Option>
            <Option value="in progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="delayed">Delayed</Option>
          </Select>
          <Button
            size="sm"
            onClick={handleStatusSubmit}
            loading={isUpdating}
            disabled={isCompleted}
          >
            Update
          </Button>
        </Stack>
      </Sheet>

      {/* Description (collapsible) */}
      <Section
        title="Description"
        open={openDescription}
        onToggle={() => setOpenDescription((v) => !v)}
      >
        <Typography level="body-sm" sx={{ whiteSpace: "pre-line" }}>
          {task?.description || "—"}
        </Typography>
      </Section>

      {/* Task Information (collapsible with edit mirror) */}
      <Section
        title="Task Information"
        open={openInfo}
        onToggle={() => setOpenInfo((v) => !v)}
      >
        {!editingInfo ? (
          infoGrid
        ) : (
          <Sheet
            variant="soft"
            sx={{
              p: 2,
              borderRadius: "md",
              bgcolor: "background.level1",
              gap: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <Box>
              <Stack gap={1.25}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Owner
                </Typography>
                <Input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Comma separated names"
                  size="sm"
                />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Due Date
                </Typography>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  size="sm"
                />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Priority (0-5)
                </Typography>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  size="sm"
                />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Tags
                </Typography>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2"
                  size="sm"
                />
              </Stack>
            </Box>

            <Box>
              <Stack gap={1.25}>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Start Date
                </Typography>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="sm"
                />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Duration (days)
                </Typography>
                <Input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  size="sm"
                />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Completion (%)
                </Typography>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={completion}
                  onChange={(e) => setCompletion(e.target.value)}
                  size="sm"
                />
              </Stack>
            </Box>
          </Sheet>
        )}
      </Section>

      {/* Associated Project (collapsible) */}
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
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <Avatar size="md">{projects[0]?.name?.[0]?.toUpperCase() || "P"}</Avatar>
          <Box>
            <Typography level="body-md" fontWeight="lg">
              {projects[0]?.name || "Associated Project"}
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {projects[0]?.code || "—"}
            </Typography>
          </Box>

          {projects.length > 1 && (
            <Tooltip
              arrow
              variant="soft"
              placement="top"
              title={
                <Box sx={{ maxHeight: 220, overflowY: "auto", px: 1 }}>
                  {projects.slice(1).map((p, i) => (
                    <Box key={`${p.code}-${i}`} sx={{ mb: 1 }}>
                      <Typography fontWeight="md" level="body-sm">
                        {p.name}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {p.code}
                      </Typography>
                      {i !== projects.length - 2 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Box>
              }
            >
              <Chip size="sm" variant="soft" sx={{ ml: "auto" }}>
                +{projects.length - 1} more
              </Chip>
            </Tooltip>
          )}
        </Sheet>
      </Section>

      {/* Activity area (collapsible) */}
      <Section
        title="Activity & Notes"
        open={openActivity}
        onToggle={() => setOpenActivity((v) => !v)}
      >
        <Tabs defaultValue="comments" sx={{ mb: 1 }}>
          <TabList>
            <Tab value="comments">Comments</Tab>
            <Tab value="subtasks">Subtasks</Tab>
            <Tab value="log">Log Hours</Tab>
            <Tab value="docs">Documents</Tab>
            <Tab value="dependency">Dependency</Tab>
            <Tab value="timeline">Status Timeline</Tab>
            <Tab value="issues">Issues</Tab>
            <Tab value="activity">Activity Stream</Tab>
          </TabList>
        </Tabs>

        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Task Notes
        </Typography>
        <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mb: 1 }}>
          <Textarea
            minRows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a task note (optional)"
            sx={{ flex: 1 }}
          />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography level="title-sm" sx={{ mb: 1 }}>
          Activity Stream
        </Typography>
        <Box sx={{ maxHeight: 240, overflow: "auto" }}>
          {(task?.status_history || [])
            .slice()
            .reverse()
            .map((h, idx) => (
              <Box key={h._id || idx} sx={{ mb: 1.25 }}>
                <Chip
                  size="sm"
                  variant="soft"
                  color={statusColor(h.status)}
                  sx={{ mr: 1 }}
                >
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
    </Box>
  );
}
