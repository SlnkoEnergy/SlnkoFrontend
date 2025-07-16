import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  Chip,
  Select,
  Option,
  Textarea,
  Tooltip,
} from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useDeleteTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
} from "../../redux/globalTaskSlice";
import { toast } from "react-toastify";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";

const ViewTaskPage = () => {
  const [status, setStatus] = useState("completed");
  const [note, setNote] = useState("");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("task");
  const { data: getTaskData } = useGetTaskByIdQuery(id);
  const [taskData, setTaskData] = useState(null);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (getTaskData) {
      setTaskData(getTaskData);
    }
  }, [getTaskData]);

  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      if (!id) {
        toast.error("Task ID not found");
        return;
      }

      await deleteTask(id).unwrap();
      toast.success("Task deleted successfully");

      setTimeout(() => {
        navigate("/all_task");
      }, 500);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleSubmit = async () => {
    if (!status) return toast.error("Status is missing");

    try {
      await updateTaskStatus({
        id,
        status,
        remarks: note,
      }).unwrap();

      toast.success("Task updated successfully");

      const userDetails = JSON.parse(
        localStorage.getItem("userDetails") || "{}"
      );

      const newEntry = {
        status,
        remarks: note,
        user_id: {
          name: userDetails?.name || "You",
        },
        updatedAt: new Date().toISOString(),
      };

      setTaskData((prev) => ({
        ...prev,
        current_status: { status },
        status_history: [...(prev?.status_history || []), newEntry],
      }));

      setNote("");
    } catch (error) {
      toast.error("Error updating task");
    }
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

  return (
    <Box
      p={3}
      sx={{
        width: "100%",
        mt: { xs: "0%", lg: "5%" },
        ml: { xs: "auto", lg: "20%", xl: "15%" },
        mx: "auto",
        borderRadius: "lg",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography level="h4">Task Details</Typography>
        <Stack direction="row" spacing={1}>
          <Button color="danger" onClick={handleDelete}>
            Remove Task
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={4} flexWrap="wrap">
        {/* Left Panel: Project & Task Details */}
        <Box borderRadius="md" p={2} border="1px solid #eee" minWidth="300px">
          <Stack spacing={2} alignItems="center">
            {Array.isArray(taskData?.project_id) &&
            taskData.project_id.length > 0 ? (
              <>
                <Avatar src={taskData.project_id[0]?.avatar || ""} size="lg">
                  {taskData.project_id[0]?.name?.charAt(0).toUpperCase() || "P"}
                </Avatar>

                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography level="title-md">
                    {taskData.project_id[0]?.name}
                  </Typography>
                  <Typography level="title-sm" sx={{ color: "#222" }}>
                    {taskData.project_id[0]?.code}
                  </Typography>
                </Box>

                {taskData.project_id.length > 1 && (
                  <Tooltip
                    arrow
                    placement="top"
                    variant="soft"
                    title={
                      <Box sx={{ maxHeight: 200, overflowY: "auto", px: 1 }}>
                        {taskData.project_id.slice(0).map((proj) => (
                          <Box key={proj._id} mb={1}>
                            <Typography
                              fontWeight="md"
                              fontSize="sm"
                              color="inherit"
                            >
                              {proj.name}
                            </Typography>
                            <Typography
                              level="body-sm"
                              fontSize="xs"
                              color="inherit"
                            >
                              {proj.code}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        mt: 1,
                        backgroundColor: "#007bff",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        px: 1,
                        py: 0.3,
                        cursor: "pointer",
                      }}
                    >
                      +{taskData.project_id.length - 1} more
                    </Box>
                  </Tooltip>
                )}
              </>
            ) : (
              <>
                <Avatar size="lg">P</Avatar>
                <Typography level="title-md">-</Typography>
                <Typography level="title-sm" sx={{ color: "#222" }}>
                  -
                </Typography>
              </>
            )}

            {/* Task Metadata */}
            <Stack spacing={2} width="100%">
              <Typography level="body-sm" color="neutral" fontWeight={400}>
                <b>Task Code:</b> {taskData?.taskCode}
              </Typography>

              <Typography level="body-sm" color="neutral" fontWeight={400}>
                <b>Type:</b>{" "}
                <Chip
                  size="sm"
                  color="primary"
                  startDecorator={getTypeData(taskData?.type)?.icon}
                >
                  {getTypeData(taskData?.type)?.label}
                </Chip>
              </Typography>

              <Typography level="body-sm">
                <b>Status:</b>{" "}
                <Chip
                  size="sm"
                  color={
                    taskData?.current_status?.status === "pending"
                      ? "danger"
                      : taskData?.current_status?.status === "draft"
                        ? "primary"
                        : taskData?.current_status?.status === "in progress"
                          ? "warning"
                          : taskData?.current_status?.status === "completed"
                            ? "success"
                            : "neutral"
                  }
                >
                  {taskData?.current_status?.status?.replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  ) || "Status"}
                </Chip>
              </Typography>

              <Typography level="body-sm">
                <b>Priority:</b>{" "}
                <Typography color="warning" component="span">
                  {Array(Number(taskData?.priority) || 0)
                    .fill()
                    .map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                </Typography>
              </Typography>

              <Typography level="body-sm">
                <b>Deadline:</b>{" "}
                {taskData?.deadline
                  ? new Date(taskData.deadline).toLocaleDateString("en-GB")
                  : "N/A"}
              </Typography>

              <Typography level="body-sm">
                <b>Description:</b>{" "}
                <Tooltip
                  title={
                    <Box
                      sx={{
                        whiteSpace: "pre-line",
                        maxWidth: 300,
                        fontSize: 12,
                      }}
                    >
                      {taskData?.description || "N/A"}
                    </Box>
                  }
                  placement="top-start"
                  arrow
                  variant="soft"
                  color="neutral"
                >
                  <Typography
                    component="span"
                    sx={{
                      cursor: "pointer",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      display: "inline-block",
                      maxWidth: "200px",
                      verticalAlign: "bottom",
                    }}
                  >
                    {taskData?.description?.length > 20
                      ? `${taskData.description.slice(0, 20)}...`
                      : taskData?.description || "N/A"}
                  </Typography>
                </Tooltip>
              </Typography>

              <Typography level="body-sm">
                <b>Assignees:</b>{" "}
                {taskData?.assigned_to?.length ? (
                  <Tooltip
                    title={
                      <Box sx={{ px: 1, py: 0.5 }}>
                        <Typography level="body-sm" fontWeight="md" mb={0.5}>
                          Assigned To:
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {taskData.assigned_to.map((a, i) => (
                            <Typography key={i} level="body-sm">
                              • {a.name}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    }
                    variant="soft"
                    placement="top"
                  >
                    <Typography component="span" sx={{ cursor: "pointer" }}>
                      {taskData.assigned_to
                        .slice(0, 3)
                        .map((a) => a.name)
                        .join(", ")}
                      {taskData.assigned_to.length > 3 &&
                        `... (+${taskData.assigned_to.length - 3})`}
                    </Typography>
                  </Tooltip>
                ) : (
                  "N/A"
                )}
              </Typography>

              <Typography level="body-sm">
                <b>Created By:</b>{" "}
                <Chip size="sm" color="warning">
                  {taskData?.createdBy?.name}
                </Chip>
              </Typography>
              <Typography level="body-sm">
                <b>Created At:</b>{" "}
                {taskData?.createdAt
                  ? new Date(taskData.createdAt).toLocaleDateString("en-GB")
                  : "N/A"}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Right Panel: Task Notes */}
        <Box flex={1} borderRadius="md" p={2} border="1px solid #eee">
          <Typography level="title-md" mb={1}>
            Task Activities
          </Typography>
          <Typography level="body-sm" mb={1}>
            Task Notes
          </Typography>

          <Textarea
            placeholder="Add Task Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mb: 1, minHeight: 150, maxHeight: 340 }}
          />

          <Stack direction="row" spacing={1} mb={2}>
            <Select
              value={status}
              onChange={(e, val) => setStatus(val)}
              sx={{ width: 150 }}
              disabled={
                taskData?.current_status?.status?.toLowerCase() === "completed"
              }
            >
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="in progress">In Progress</Option>
            </Select>
            <Button
              disabled={
                taskData?.current_status?.status?.toLowerCase() === "completed"
              }
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>

          <Stack spacing={2} maxHeight={140} overflow={"auto"}>
            {(taskData?.status_history || [])
              .slice()
              .reverse()
              .map((note, index) => (
                <Box key={note._id || index} mb={1}>
                  <Typography
                    level="body-sm"
                    color={
                      note.status === "Completed"
                        ? "success"
                        : note.status === "In Progress"
                          ? "primary"
                          : note.status === "Pending"
                            ? "danger"
                            : "neutral"
                    }
                  >
                    {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                  </Typography>

                  <Typography level="body-xs">
                    By {note?.user_id?.name || "Unknown"} on{" "}
                    {note?.updatedAt
                      ? new Date(note.updatedAt).toLocaleString()
                      : "N/A"}
                  </Typography>

                  <Typography level="body-xs">
                    {note?.remarks || "No remarks"}
                  </Typography>
                </Box>
              ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default ViewTaskPage;
