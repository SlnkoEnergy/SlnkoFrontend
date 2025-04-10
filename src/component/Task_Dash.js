import { AccessTime, CheckCircle, Person, Phone } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Tab,
  Table,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import logo from "../assets/cheer-up.png";
import Img1 from "../assets/follow_up_history.png";
import {
  useGetEntireLeadsQuery,
  useUpdateTaskCommentMutation,
} from "../redux/leadsSlice";
import { useGetLoginsQuery } from "../redux/loginSlice";
import {
  useAddTasksMutation,
  useGetTasksHistoryQuery,
  useGetTasksQuery,
} from "../redux/tasksSlice";
import { color } from "framer-motion";

const TaskDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  // const [selectedTask, setSelectedTask] = useState({});

  const [comment, setComment] = useState("");
  const [currentPagePast, setCurrentPagePast] = useState(1);
  const [currentPageToday, setCurrentPageToday] = useState(1);
  const [currentPageTomorrow, setCurrentPageTomorrow] = useState(1);
  const [currentPageFuture, setCurrentPageFuture] = useState(1);
  const [open, setOpen] = useState(false);
  const tasksperpage = 3;
  const [selectedTask, setSelectedTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentPages, setCurrentPages] = useState({
    past: 1,
    today: 1,
    tomorrow: 1,
    future: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = generatePageNumbers(currentPage, totalPages);

    const handleEllipsisClick = (direction) => {
      const jump = 3;
      const newPage =
        direction === "left"
          ? Math.max(1, currentPage - jump)
          : Math.min(totalPages, currentPage + jump);
      onPageChange(newPage);
    };

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
        mt={2}
        px={2}
        sx={{
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {/* Left Arrow */}
        <IconButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
          sx={{
            borderRadius: "50%",
            bgcolor: "#e3f2fd", // light blue
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#90caf9", // darker blue on hover
            },
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        {/* Page Numbers */}
        {pageNumbers.map((number, index) =>
          number === "..." ? (
            <Tooltip title="Jump Pages" key={index}>
              <IconButton
                size="sm"
                onClick={() =>
                  handleEllipsisClick(
                    index < pageNumbers.indexOf(currentPage) ? "left" : "right"
                  )
                }
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  bgcolor: "#e3f2fd",
                  "&:hover": {
                    bgcolor: "#90caf9",
                  },
                }}
              >
                ...
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton
              key={index}
              size="sm"
              onClick={() => onPageChange(number)}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "50%",
                fontWeight: "bold",
                fontSize: "0.875rem",
                bgcolor: number === currentPage ? "#42a5f5" : "#e3f2fd", // darker if active
                color: number === currentPage ? "#fff" : "#000",
                "&:hover": {
                  bgcolor: "#90caf9",
                },
                transition: "all 0.2s",
              }}
            >
              {number}
            </IconButton>
          )
        )}

        {/* Right Arrow */}
        <IconButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          sx={{
            borderRadius: "50%",
            bgcolor: "#e3f2fd",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#90caf9",
            },
          }}
        >
          <ChevronRight size={16} />
        </IconButton>
      </Box>
    );
  };

  const { data: getLead = [] } = useGetEntireLeadsQuery();
  const { data: getTask = [] } = useGetTasksQuery();
  const [updateTask] = useUpdateTaskCommentMutation();
  const { data: getTaskHistory = [], isLoading } = useGetTasksHistoryQuery();
  const { data: usersData = [], isLoading: isFetchingUsers } =
    useGetLoginsQuery();
  const [ADDTask] = useAddTasksMutation();

  const getTaskArray = Array.isArray(getTask) ? getTask : getTask?.data || [];
  // console.log("Processed Task Array:", getTaskArray);

  // const getLeadArray = Array.isArray(getLead) ? getLead : getLead?.lead || [];
  // console.log("Processed Leads Array:", getLeadArray);

  const getLeadArray = [
    ...(getLead?.lead?.initialdata || []),
    ...(getLead?.lead?.followupdata || []),
    ...(getLead?.lead?.warmdata || []),
    ...(getLead?.lead?.wondata || []),
    ...(getLead?.lead?.deaddata || []),
  ];
  // console.log("Processed Leads Array:", getLeadArray);
  const getTaskHistoryArray = Array.isArray(getTaskHistory)
    ? getTaskHistory
    : getTaskHistory?.data || [];
  console.log(getTaskHistoryArray);

  const getuserArray = Array.isArray(usersData)
    ? usersData
    : usersData?.data?.data || [];

  console.log(getuserArray);

  // Match tasks to their corresponding leads
  const matchedTasks = getTaskArray.filter((task) =>
    getLeadArray.some((lead) => String(task.id) === String(lead.id))
  );
  // console.log("Matched Tasks:", matchedTasks);
  const matchedTaskHistory = getTaskHistoryArray.filter((taskHistory) =>
    getLeadArray.some((lead) => String(taskHistory.id) === String(lead.id))
  );

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userSessionData = getUserData();
    if (userSessionData && userSessionData.name) {
      setUser(userSessionData);
    }
  }, []);

  const getUserData = () => {
    const userSessionData = localStorage.getItem("userDetails");
    return userSessionData ? JSON.parse(userSessionData) : null;
  };
  console.log("Matched Task History:", matchedTaskHistory);

  const bdMembers = useMemo(() => {
    return (usersData?.data || [])
      .filter((user) => user.department === "BD")
      .map((member) => ({ label: member.name, id: member._id }));
  }, [usersData]);

  const categorizedTasks = {
    past: [],
    today: [],
    tomorrow: [],
    future: [],
  };

  const userNames = Array.isArray(user?.name)
    ? user.name.map((name) => name.toLowerCase())
    : [user?.name?.toLowerCase()];

  matchedTasks
    .filter((task) => {
      if (!task.by_whom || !user?.name) return false;

      // Allow IT Team and Admin to see all tasks
      if (user.name === "IT Team" || user.name === "admin") return true;

      // Convert `by_whom` into a trimmed, lowercase array
      const assignedUsers = task.by_whom
        .split(",")
        .map((name) => name.trim().toLowerCase());

      return assignedUsers.includes(user.name.toLowerCase());
    })
    .forEach((task) => {
      if (!task.date) {
        console.warn("❌ Task missing date:", task);
        return;
      }

      const canCheck =
        task.submitted_by?.toLowerCase() === user?.name?.toLowerCase();

      const taskDate = parseISO(task.date);
      const now = new Date();

      const associatedLead = getLeadArray.find(
        (lead) => String(lead.id) === String(task.id)
      );

      const associatedTaskHistory = getTaskHistoryArray.filter(
        (taskHistory) => String(taskHistory.id) === String(task.id)
      );

      if (!associatedLead) return;

      const taskEntry = {
        _id: task._id,
        id: task.id,
        date: task.date || "",
        comment: task.comment || "",
        task_detail: task.task_detail || "",
        name: associatedLead.c_name || "Unknown",
        company: associatedLead.company || "",
        group: associatedLead.group || "",
        mobile: associatedLead.mobile || "",
        district: associatedLead.district || "",
        state: associatedLead.state || "",
        scheme: associatedLead.scheme || "",
        capacity: associatedLead.capacity || "",
        type: task.reference || "",
        by_whom: task.by_whom || "",
        icon: task.reference === "By Call" ? <Phone /> : <Person />,
        assigned_user: user?.name || "Unknown User",
        canCheck: canCheck,
        submitted_by: task.submitted_by || "",

        // ✅ Store full task history array
        history: associatedTaskHistory.map((history) => ({
          id: history.id || "N/A",
          date: history.date || "N/A",
          reference: history.reference || "N/A",
          by_whom: history.by_whom || "N/A",
          comment: history.comment || "N/A",
          submitted_by: history.submitted_by || "N/A",
        })),
      };

      // ✅ Categorize tasks correctly
      if (isBefore(taskDate, now) && !isToday(taskDate)) {
        console.log("📅 Categorized as: Past");
        categorizedTasks.past.push(taskEntry);
      } else if (isToday(taskDate)) {
        console.log("📅 Categorized as: Today");
        taskEntry.isToday = true;
        categorizedTasks.today.push(taskEntry);
      } else if (isTomorrow(taskDate)) {
        console.log("📅 Categorized as: Tomorrow");
        categorizedTasks.tomorrow.push(taskEntry);
      } else {
        console.log("📅 Categorized as: Future");
        categorizedTasks.future.push(taskEntry);
      }
    });

  // const filteredTask = matchedTasks.find(
  //   (task) => String(task.id) === String(selectedTask?.id)
  // );

  // console.log("🔍 Filtered Task:", filteredTask);

  // const tasksWithComments = getTaskArray.filter((task) => task.comment);
  // const tasksWithoutComments = getTaskArray.filter((task) => !task.comment);

  // Check if user is IT Team or Admin
  const isAdminOrITTeam =
    userNames.includes("it team") || userNames.includes("admin");

  // ✅ Get all tasks if user is IT Team or Admin
  // Step 1: Filter tasks for normal users; admins/IT see all
  const allTasks = isAdminOrITTeam
    ? getTaskArray
    : getTaskArray.filter((task) => {
        const assignedUsers = task.by_whom
          ?.split(",")
          .map((name) => name.trim().toLowerCase());
        return userNames.some((name) => assignedUsers?.includes(name));
      });

  // Step 2: Categorize original tasks based on actual comment values
  const tasksWithoutComments = allTasks.filter(
    (task) => !task.comment || task.comment.trim() === ""
  );

  const tasksWithComments = allTasks.filter(
    (task) => task.comment && task.comment.trim() !== ""
  );

  // Step 3: Enhance comments just for UI rendering, without affecting filtering logic
  const updatedTasks = allTasks.map((task) => {
    if (!task.comment || task.comment.trim() === "") {
      const assignedUsers = task.by_whom
        ?.split(",")
        .map((name) => name.trim().toLowerCase());

      return {
        ...task,
        comment: assignedUsers?.length
          ? `Assigned to ${task.by_whom.trim()}. Comment pending.`
          : "No assigned user or comment.",
      };
    }
    return task;
  });

  const [disabledCards, setDisabledCards] = useState(() => {
    const savedState = localStorage.getItem("disabledCards");
    return savedState ? JSON.parse(savedState) : {};
  });
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const handleSubmit = async () => {
    if (!selectedTask || !selectedTask._id) {
      console.error("No task selected or _id is missing!", selectedTask);
      toast.error("No task selected or _id is missing!");
      return;
    }

    try {
      const updateData = {
        _id: selectedTask._id,
        comment: comment,
      };

      await updateTask(updateData).unwrap(); // Submit to backend
      toast.success("Comment updated successfully");

      setComment(""); // Clear the comment input
      setOpenDialog(false); // Close modal if needed

      // ⏳ Give a short delay, then reload
      setTimeout(() => {
        window.location.reload();
      }, 500); // Allows toast to show
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem("completedTasks");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : {};

      // Ensure tasks with history comments are always marked as completed
      const initialCompletedTasks = updatedTasks.reduce(
        (acc, task) => {
          const historyComments = getTaskHistoryArray.filter(
            (history) =>
              String(history.id) === String(task.id) && history.comment
          );

          if (historyComments.length > 0) {
            acc[task._id] = true;
          }
          return acc;
        },
        { ...parsedTasks }
      );

      return initialCompletedTasks;
    } catch (error) {
      console.error("Error loading completed tasks:", error);
      return {};
    }
  });

  const isTaskCompleted = (task) => {
    return task.comment && task.comment !== "No assigned user or comment.";
  };

  // Handle checkbox change event
  const handleCheckboxChange = (task, event) => {
    if (!isTaskCompleted(task)) {
      setSelectedTask({ ...task, _id: task._id, id: task.id });
      setOpenDialog(true);
    } else {
      setSelectedTask(null);
      setOpenDialog(false);
    }
  };

  const getResponsiveTasksPerPage = () => {
    const width = window.innerWidth;
    if (width < 768) return 3;
    return 6;
  };

  const [tasksPerPage, setTasksPerPage] = useState(getResponsiveTasksPerPage());

  useEffect(() => {
    const handleResize = () => {
      setTasksPerPage(getResponsiveTasksPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const tasksPerPage = 6;
  const getPaginatedData = (tasks, currentPage) => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;

    return {
      tasks: tasks.slice(startIndex, endIndex),
      totalPages: Math.ceil(tasks.length / tasksPerPage),
    };
  };

  const handleDialogCancel = () => {
    if (selectedTask) {
      setCompletedTasks((prev) => {
        const updatedTasks = { ...prev };
        delete updatedTasks[selectedTask._id]; // Remove the task from completedTasks
        localStorage.setItem("completedTasks", JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    }

    setSelectedTask(null);
    setComment(""); // Clear the comment field
    setOpenDialog(false);
  };

  // useEffect(() => {
  //   localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  // }, [completedTasks]);

  // ✅ Function to generate pagination numbers
  const generatePageNumbers = (
    currentPage,
    totalPages,
    maxVisiblePages = 5
  ) => {
    const pageNumbers = [];

    pageNumbers.push(1);

    if (totalPages <= maxVisiblePages) {
      for (let i = 2; i <= totalPages - 1; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) {
        endPage = 3;
      } else if (currentPage === totalPages) {
        startPage = totalPages - 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pageNumbers.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Pagination handlers
  const handlePageChange = (category, value) => {
    setCurrentPages((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const { tasks: currentTasksPast, totalPages: totalPagesPast } =
    getPaginatedData(categorizedTasks.past, currentPages.past);

  const { tasks: currentTasksToday, totalPages: totalPagesToday } =
    getPaginatedData(categorizedTasks.today, currentPages.today);

  const { tasks: currentTasksTomorrow, totalPages: totalPagesTomorrow } =
    getPaginatedData(categorizedTasks.tomorrow, currentPages.tomorrow);

  const { tasks: currentTasksFuture, totalPages: totalPagesFuture } =
    getPaginatedData(categorizedTasks.future, currentPages.future);

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const getTomorrowDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const date = new Date();
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString("en-US", options);
  };

  // const getDayAfterTomorrowDate = (daysAhead = 2) => {
  //   const date = new Date();
  //   date.setDate(date.getDate() + daysAhead); // Add dynamic days

  //   return date.toLocaleDateString("en-US", {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

  // const getDayAfterTomorrowDate = () => {
  //   const options = {
  //     weekday: "long",
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   };

  //   const date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  //   return date.toLocaleDateString("en-US", options);
  // };

  const formatTaskDate = (taskDate) => {
    if (!taskDate) return "Invalid Date";

    const date = new Date(taskDate);

    if (isNaN(date.getTime())) {
      // console.error("Invalid Date:", taskDate);
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (task) => {
    if (!task) return;

    setSelectedTask(task);
    setOpenModal(true);
    console.log("📚 Selected Task:", task);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setSelectedTask(null);
    }, 300);
  };

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    date: "",
    reference: "",
    by_whom: "",
    comment: "",
    task_detail: "",
    submitted_by: "",
  });

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));

    if (field === "reference") {
      if (value === "By Call" && user?.name) {
        setFormData((prevData) => ({ ...prevData, by_whom: user.name }));
      } else if (value === "By Meeting" && user?.name) {
        setFormData((prevData) => ({ ...prevData, by_whom: user.name }));
      } else {
        setFormData((prevData) => ({ ...prevData, by_whom: "" }));
      }
    }
  };

  const handleByWhomChange = (_, newValue = []) => {
    if (formData.reference === "By Meeting" && user?.name) {
      const updatedValue = [
        { label: user.name, id: "user" },
        ...newValue.filter((member) => member.label !== user.name),
      ];
      setFormData((prevData) => ({
        ...prevData,
        by_whom: updatedValue.map((member) => member.label).join(", "),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        by_whom: newValue.map((member) => member.label).join(", "),
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    try {
      const newTask = await ADDTask(formData).unwrap();
      toast.success("🎉 Task added successfully!");

      handleCloseAddTaskModal();
    } catch (error) {
      console.error("Error adding task:", error?.data || error);
      toast.error("Failed to add task.");
    }
  };

  const [openAddTaskModal, setOpenAddTaskModal] = useState(false);

  const handleOpenAddTaskModal = (task = null) => {
    if (task) {
      // Prefill task if editing
      setFormData({
        id: task.id || "",
        name: task.name || "",
        date: task.date || "",
        reference: task.reference || "",
        task_detail: task.task_detail || "",
        by_whom: task.by_whom || "",
        submitted_by: user.name || "",
      });
    } else {
      // Reset to blank form for new task
      setFormData({
        id: "",
        name: "",
        date: "",
        reference: "",
        task_detail: "",
        by_whom: "",
        submitted_by: "",
      });
    }
    setOpenAddTaskModal(true);
    // console.log("Open Add Task Modal", task ? "Editing Task" : "New Task");
  };

  // ✅ Close Add Task Modal and Reset Form
  const handleCloseAddTaskModal = () => {
    setOpenAddTaskModal(false);
    setTimeout(() => {
      setFormData({
        id: "",
        name: "",
        date: "",
        reference: "",
        task_detail: "",
        by_whom: "",
        submitted_by: user.name,
      });
    }, 300);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Sheet
        sx={{
          width: "100%",
          maxWidth: 1000,
          minHeight: 800,
          // mx: "auto",
          margin: { md: "0%", xs: "5%" },
          p: 4,
          textAlign: "center",
          borderRadius: 6,
          boxShadow: "xl",
          border: "2px solid #ccc",
          bgcolor: "background.surface",
        }}
      >
        <Typography level="h2" color="primary">
          Task
        </Typography>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <TabList
            sx={{
              width: "90%",
              backgroundColor: "#f5f5f5",
              borderRadius: "16px",
              p: 1,
              boxShadow: "md",
            }}
          >
            <Tab
              sx={{ flex: 1, fontSize: "1.1rem", textTransform: "capitalize" }}
            >
              Past
            </Tab>
            <Tab
              sx={{ flex: 1, fontSize: "1.1rem", textTransform: "capitalize" }}
            >
              Today's Task
            </Tab>
            <Tab
              sx={{ flex: 1, fontSize: "1.1rem", textTransform: "capitalize" }}
            >
              Tomorrow
            </Tab>
            <Tab
              sx={{ flex: 1, fontSize: "1.1rem", textTransform: "capitalize" }}
            >
              Future
            </Tab>
          </TabList>
          {/*Past Tab */}
          <TabPanel
            value={0}
            sx={{
              width: "100%",
              mt: 3,
            }}
          >
            <Box>
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="center"
                alignItems="center"
                gap={3}
                mb={3}
              >
                <Chip
                  startDecorator={<CheckCircle />}
                  variant="soft"
                  size="lg"
                  color="success"
                >
                  {tasksWithComments.length || 0}{" "}
                  {tasksWithComments.length === 1 ? "Meeting" : "Meetings"}{" "}
                  Attended
                </Chip>

                <Chip
                  startDecorator={<AccessTime />}
                  variant="soft"
                  size="lg"
                  color="warning"
                >
                  {tasksWithoutComments.length || 0}{" "}
                  {tasksWithoutComments.length === 1
                    ? "Pending Meeting"
                    : "Pending Meetings"}
                </Chip>
              </Box>

              {loading ? (
                <Typography level="body-lg" textAlign="center">
                  ⏳ Wait.. Loading...
                </Typography>
              ) : categorizedTasks.past.length > 0 ? (
                <Grid container spacing={3} justifyContent="center" mt={2}>
                  {currentTasksPast
                    .filter((task) => {
                      if (!task.by_whom || !user?.name) return false;
                      const assignedUsers = task.by_whom
                        .split(",")
                        .map((name) => name.trim().toLowerCase());
                      const userNames = Array.isArray(user.name)
                        ? user.name.map((name) => name.toLowerCase())
                        : [user.name.toLowerCase()];
                      const isMatched =
                        userNames.includes("it team") ||
                        userNames.includes("admin") ||
                        userNames.some((name) => assignedUsers.includes(name));
                      return isMatched;
                    })
                    .map((task, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={index}
                        sx={{ display: "flex", flexDirection: "row" }}
                      >
                        <Card
                          key={index}
                          sx={{
                            mb: 3,
                            borderRadius: "20px",
                            boxShadow: "lg",
                            border: "1px solid #e0e0e0",
                            p: 2,
                            width: "100%",
                            backgroundColor: "#fff",
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "xl",
                              transform: "scale(1.01)",
                            },
                            pointerEvents: completedTasks[task._id]
                              ? "none"
                              : "auto",
                            opacity: completedTasks[task._id] ? 0.6 : 1,
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={7}>
                                <Typography
                                  level="h4"
                                  color="secondary"
                                  onClick={() => handleOpenModal(task)}
                                  sx={{
                                    cursor: completedTasks[task._id]
                                      ? "not-allowed"
                                      : "pointer",
                                    
                                  }}
                                >
                                  {task.name}
                                </Typography>

                                <Typography level="body-md" fontWeight="500">
                                  {task.company}
                                </Typography>
                                <Typography level="body-sm" color="neutral">
                                  {`${task?.district ?? ""}, ${task?.state ?? ""}`}
                                </Typography>
                              </Grid>
                              <Grid
                                item
                                xs={5}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="flex-end"
                                gap={1.5}
                              >
                                <Checkbox
                                  checked={isTaskCompleted(task)}
                                  disabled
                                  sx={{
                                    color: task.comment ? "green" : "red",
                                    "&.Mui-checked": {
                                      color: task.comment ? "green" : "red",
                                    },
                                  }}
                                />

                                <Chip
                                  startDecorator={task.icon}
                                  variant="outlined"
                                  color="neutral"
                                  size="md"
                                  sx={{ px: 1.5 }}
                                >
                                  {task.type}
                                </Chip>

                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setOpen(true);
                                  }}
                                  sx={{
                                    fontSize: "1.25rem",
                                    color: "#888",
                                    "&:hover": { color: "#444" },
                                  }}
                                >
                                  &hellip;
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 5,
                  }}
                >
                  <Typography
                    level="h5"
                    color="neutral"
                    textAlign="center"
                    fontStyle="italic"
                    fontWeight="md"
                  >
                    🎉 All caught up! No task for past.
                  </Typography>

                  {/* <img width={"50px"} height={"35px"} alt="logo" src={logo} /> */}
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <PaginationComponent
                  currentPage={currentPages.past}
                  totalPages={totalPagesPast}
                  onPageChange={(page) => handlePageChange("past", page)}
                />
              </Box>
            </Box>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
              <ModalDialog
                variant="outlined"
                sx={{
                  minWidth: 300,
                  maxWidth: 500,
                  p: 3,
                  borderRadius: "lg",
                  textAlign: "center",
                }}
              >
                <Typography level="h4" mb={2}>
                  Task Description
                </Typography>
                <Typography mb={3}>
                  {selectedTask?.task_detail || "No details available"}
                </Typography>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </ModalDialog>
            </Modal>
          </TabPanel>

          {/* Today Tab */}
          <TabPanel
            value={1}
            sx={{
              width: "100%",
              mt: 3,
            }}
          >
            <Box>
              {/* Summary Chips */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="center"
                alignItems="center"
                gap={3}
                mb={3}
              >
                <Chip
                  startDecorator={<CheckCircle />}
                  variant="soft"
                  size="lg"
                  color="success"
                >
                  {tasksWithComments.length || 0}{" "}
                  {tasksWithComments.length === 1 ? "Meeting" : "Meetings"}{" "}
                  Attended
                </Chip>

                <Chip
                  startDecorator={<AccessTime />}
                  variant="soft"
                  size="lg"
                  color="warning"
                >
                  {tasksWithoutComments.length || 0}{" "}
                  {tasksWithoutComments.length === 1
                    ? "Pending Meeting"
                    : "Pending Meetings"}
                </Chip>
              </Box>

              <Typography level="h4" textAlign="center" mb={1}>
                Today's Task
              </Typography>
              <Typography
                level="body-md"
                color="neutral"
                textAlign="center"
                mb={3}
              >
                {getCurrentDate()}
              </Typography>

              {loading ? (
                <Typography level="body-lg" textAlign="center">
                  ⏳ Wait.. Loading...
                </Typography>
              ) : categorizedTasks.today.length > 0 ? (
                <Grid container spacing={3} justifyContent="center" mt={2}>
                  {currentTasksToday
                    .filter((task) => {
                      if (!task.by_whom || !user?.name) return false;
                      const assignedUsers = task.by_whom
                        .split(",")
                        .map((name) => name.trim().toLowerCase());
                      const userNames = Array.isArray(user.name)
                        ? user.name.map((name) => name.toLowerCase())
                        : [user.name.toLowerCase()];
                      const isMatched =
                        userNames.includes("it team") ||
                        userNames.includes("admin") ||
                        userNames.some((name) => assignedUsers.includes(name));
                      return isMatched;
                    })
                    .sort(
                      (a, b) =>
                        new Date(b.updatedAt || b.date) -
                        new Date(a.updatedAt || a.date)
                    )
                    .map((task, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={index}
                        sx={{ display: "flex", flexDirection: "row" }}
                      >
                        <Card
                          sx={{
                            mb: 3,
                            borderRadius: "20px",
                            boxShadow: "lg",
                            border: "1px solid #e0e0e0",
                            p: 2,
                            width: "100%",
                            backgroundColor: task.success
                              ? "#d4edda"
                              : "#ffffff",
                            borderColor: task.success ? "#c3e6cb" : "#e0e0e0",
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "xl",
                              transform: "scale(1.01)",
                            },
                            pointerEvents: disabledCards[task._id]
                              ? "none"
                              : "auto",
                            opacity: disabledCards[task._id] ? 0.6 : 1,
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={7}>
                                {(user?.name === "IT Team" ||
                                  user?.name === "admin" ||
                                  user?.name?.toLowerCase() ===
                                    task?.submitted_by?.toLowerCase()) && (
                                  <Chip
                                    variant="soft"
                                    size="lg"
                                    sx={{
                                      backgroundColor: "#d4edda",
                                      color: "#155724",
                                      fontWeight: "bold",
                                      "&:hover": {
                                        backgroundColor: "#155724",
                                        color: "#ffffff",
                                      },
                                    }}
                                  >
                                    <Button
                                      variant="plain"
                                      onClick={() =>
                                        handleOpenAddTaskModal(task)
                                      }
                                      sx={{
                                        padding: 0,
                                        minWidth: "auto",
                                        color: "inherit",
                                      }}
                                    >
                                      <Typography>Reschedule +</Typography>
                                    </Button>
                                  </Chip>
                                )}

                                <Typography
                                  level="h4"
                                  onClick={() => handleOpenModal(task)}
                                  color={
                                    completedTasks[task._id]
                                      ? "success"
                                      : "primary"
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    pointerEvents: "auto",
                                    
                                  }}
                                >
                                  {task.name}
                                </Typography>

                                <Typography level="body-md" fontWeight="500">
                                  {task.company}
                                </Typography>
                                <Typography level="body-sm" color="neutral">
                                  {`${task?.district ?? ""}, ${task?.state ?? ""}`}
                                </Typography>
                              </Grid>

                              <Grid
                                item
                                xs={5}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="flex-end"
                                gap={1.5}
                              >
                                <Checkbox
                                  checked={isTaskCompleted(task)}
                                  onChange={(event) =>
                                    handleCheckboxChange(task, event)
                                  }
                                  disabled={isTaskCompleted(task)}
                                  sx={{
                                    "&.Mui-checked": {
                                      color: "white",
                                      backgroundColor: "#4caf50",
                                      borderRadius: "50%",
                                    },
                                  }}
                                />

                                <Chip
                                  startDecorator={task.icon}
                                  variant="outlined"
                                  color="neutral"
                                  size="md"
                                  sx={{ px: 1.5 }}
                                >
                                  {task.type}
                                </Chip>

                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setOpen(true);
                                  }}
                                  sx={{
                                    fontSize: "1.25rem",
                                    color: "#888",
                                    "&:hover": { color: "#444" },
                                    pointerEvents: disabledCards[task._id]
                                      ? "none"
                                      : "auto",
                                  }}
                                  disabled={disabledCards[task._id]}
                                >
                                  {disabledCards[task._id]
                                    ? "Comment Added"
                                    : "..."}
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 5,
                  }}
                >
                  <Typography
                    level="h5"
                    color="neutral"
                    textAlign="center"
                    fontStyle="italic"
                    fontWeight="md"
                  >
                    🎉 No tasks for today.
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <PaginationComponent
                  currentPage={currentPages.today}
                  totalPages={totalPagesToday}
                  onPageChange={(page) => handlePageChange("today", page)}
                />
              </Box>
            </Box>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
              <ModalDialog
                variant="outlined"
                sx={{
                  minWidth: 300,
                  maxWidth: 500,
                  p: 3,
                  borderRadius: "lg",
                  textAlign: "center",
                }}
              >
                <Typography level="h4" mb={2}>
                  Task Description
                </Typography>
                <Typography mb={3}>
                  {selectedTask?.task_detail || "No details available"}
                </Typography>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </ModalDialog>
            </Modal>
          </TabPanel>

          {/* Tomorrow Tab */}
          <TabPanel
            value={2}
            sx={{
              width: "100%",
              mt: 3,
            }}
          >
            <Typography level="h4">Tomorrow's Task</Typography>
            <Typography level="body-md" color="neutral">
              {getTomorrowDate()}
            </Typography>

            {loading ? (
              <Typography level="body-md" textColor="neutral">
                ⏳ Wait.. Loading...
              </Typography>
            ) : (
              <>
                {currentTasksTomorrow?.filter((task) => {
                  if (!task.by_whom || !user?.name) return false;

                  const assignedUsers = task.by_whom
                    .split(",")
                    .map((name) => name.trim().toLowerCase());

                  const userNames = Array.isArray(user.name)
                    ? user.name.map((name) => name.toLowerCase())
                    : [user.name.toLowerCase()];

                  return (
                    userNames.includes("it team") ||
                    userNames.includes("admin") ||
                    userNames.some((name) => assignedUsers.includes(name))
                  );
                }).length > 0 ? (
                  <Grid container spacing={3} justifyContent="center" mt={2}>
                    {currentTasksTomorrow
                      .filter((task) => {
                        if (!task.by_whom || !user?.name) return false;

                        const assignedUsers = task.by_whom
                          .split(",")
                          .map((name) => name.trim().toLowerCase());

                        const userNames = Array.isArray(user.name)
                          ? user.name.map((name) => name.toLowerCase())
                          : [user.name.toLowerCase()];

                        return (
                          userNames.includes("it team") ||
                          userNames.includes("admin") ||
                          userNames.some((name) => assignedUsers.includes(name))
                        );
                      })
                      .map((task, index) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          key={index}
                          sx={{ display: "flex", flexDirection: "row" }}
                        >
                          <Card
                            key={index}
                            sx={{
                              mb: 3,
                              borderRadius: "20px",
                              boxShadow: "lg",
                              border: "1px solid #e0e0e0",
                              p: 2,
                              width: "100%",
                              backgroundColor: "#fff",
                              transition: "0.3s",
                              "&:hover": {
                                boxShadow: "xl",
                                transform: "scale(1.01)",
                              },
                              // pointerEvents: completedTasks[task._id]
                              //   ? "none"
                              //   : "auto",
                              // opacity: completedTasks[task._id] ? 0.6 : 1,
                            }}
                          >
                            <CardContent>
                              <Grid container spacing={2} alignItems="center">
                                {/* Left Section */}
                                <Grid item xs={7}>
                                  <Typography
                                    level="h4"
                                    color="danger"
                                    onClick={() => handleOpenModal(task)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {task.name}
                                  </Typography>
                                  <Typography level="body-lg">
                                    {task.company}
                                  </Typography>
                                  <Typography level="body-md" color="neutral">
                                    {`${task?.district ?? ""}, ${task?.state ?? ""}`}
                                  </Typography>
                                </Grid>

                                {/* Right Section */}
                                <Grid
                                  item
                                  xs={5}
                                  display="flex"
                                  flexDirection="column"
                                  alignItems="center"
                                  justifyContent="flex-end"
                                  gap={1.5}
                                >
                                  <Typography level="body-md" textColor="green">
                                    {getTomorrowDate()}
                                  </Typography>
                                  <Chip
                                    startDecorator={task.icon}
                                    variant="outlined"
                                    size="lg"
                                  >
                                    {task.type}
                                  </Chip>
                                  <Button
                                    variant="plain"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setOpen(true);
                                    }}
                                  >
                                    <Typography>...</Typography>
                                  </Button>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 5,
                    }}
                  >
                    <Typography
                      level="h5"
                      color="neutral"
                      textAlign="center"
                      fontStyle="italic"
                      fontWeight="md"
                    >
                      🎉 No tasks for tomorrow.
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
              <ModalDialog>
                <Typography level="h4">Task Description</Typography>
                <Typography>
                  {selectedTask?.task_detail || "No details available"}
                </Typography>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </ModalDialog>
            </Modal>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <PaginationComponent
                currentPage={currentPages.tomorrow}
                totalPages={totalPagesTomorrow}
                onPageChange={(page) => handlePageChange("tomorrow", page)}
              />
            </Box>
          </TabPanel>

          {/* Future Tab */}
          <TabPanel
            value={3}
            sx={{
              width: "100%",
              mt: 3,
            }}
          >
            <Box>
              <Box>
                <Typography level="h4" textAlign="center" mb={1}>
                  Upcoming Task
                </Typography>
              </Box>

              {loading ? (
                <Typography level="body-lg" textAlign="center">
                  ⏳ Wait.. Loading...
                </Typography>
              ) : categorizedTasks.future.length > 0 ? (
                <Grid container spacing={3} justifyContent="center" mt={2}>
                  {currentTasksFuture
                    .filter((task) => {
                      if (!task.by_whom || !user?.name) return false;

                      const assignedUsers = task.by_whom
                        .split(",")
                        .map((name) => name.trim().toLowerCase());

                      const userNames = Array.isArray(user.name)
                        ? user.name.map((name) => name.toLowerCase())
                        : [user.name.toLowerCase()];

                      return (
                        userNames.includes("it team") ||
                        userNames.includes("admin") ||
                        userNames.some((name) => assignedUsers.includes(name))
                      );
                    })
                    .map((task, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={index}
                        sx={{ display: "flex", flexDirection: "row" }}
                      >
                        <Card
                          key={index}
                          sx={{
                            mb: 3,
                            borderRadius: "20px",
                            boxShadow: "lg",
                            border: "1px solid #e0e0e0",
                            p: 2,
                            width: "100%",
                            backgroundColor: "#fff",
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "xl",
                              transform: "scale(1.01)",
                            },
                            // pointerEvents: completedTasks[task._id]
                            //   ? "none"
                            //   : "auto",
                            // opacity: completedTasks[task._id] ? 0.6 : 1,
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid xs={7}>
                                <Typography
                                  level="h4"
                                  color="danger"
                                  onClick={() => handleOpenModal(task)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {task.name}
                                </Typography>
                                <Typography level="body-lg">
                                  {task.company}
                                </Typography>
                                <Typography level="body-md" color="neutral">
                                  {`${task?.district ?? ""}, ${task?.state ?? ""}`}
                                </Typography>
                              </Grid>
                              <Grid
                                xs={5}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="flex-end"
                                gap={1}
                              >
                                <Typography level="body-md" textColor="green">
                                  {formatTaskDate(task.date)}
                                </Typography>
                                <Chip
                                  startDecorator={task.icon}
                                  variant="outlined"
                                  size="lg"
                                >
                                  {task.type}
                                </Chip>
                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setOpen(true);
                                  }}
                                >
                                  <Typography>...</Typography>
                                </Button>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 5,
                  }}
                >
                  <Typography
                    level="h5"
                    color="neutral"
                    textAlign="center"
                    fontStyle="italic"
                    fontWeight="md"
                  >
                    🎉 No Upcoming tasks for Future.
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <PaginationComponent
                  currentPage={currentPages.future}
                  totalPages={totalPagesFuture}
                  onPageChange={(page) => handlePageChange("future", page)}
                />
              </Box>
            </Box>

            {/* Modal placed outside the loop */}
            <Modal open={open} onClose={() => setOpen(false)}>
              <ModalDialog>
                <Typography level="h4">Task Description</Typography>
                <Typography>
                  {selectedTask?.task_detail || "No details available"}
                </Typography>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </ModalDialog>
            </Modal>

            {/* Pagination */}
          </TabPanel>
        </Tabs>
      </Sheet>

      {/* Modal for Check Box for comments */}
      <Modal open={openDialog} onClose={handleDialogCancel}>
        <ModalDialog>
          <DialogTitle>Enter Comments</DialogTitle>
          <DialogContent>
            <Textarea
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comments..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogCancel}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Modal for View Options */}
      {/* <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <Stack spacing={2} mt={1}>
            {/* <Button
              variant="soft"
              onClick={() => {
                // console.log("View Customer Details")
              }}
            >
              View Customer Details
            </Button> *
            <Button
              variant="soft"

              // console.log("View Follow-ups History")
              // onClick={() => handleOpenModal(filteredTasks)}
              // style={{ cursor: "pointer" }}
            >
              View History
            </Button>
          </Stack>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => setOpen(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </ModalDialog>
      </Modal> */}

      {/* Task Details & View History Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <ModalDialog
          size="lg"
          sx={{
            width: "70%",
            p: 4,
            borderRadius: "16px",
            backgroundColor: "#fff",
            boxShadow: "lg",
          }}
        >
          <Box textAlign="center" mb={3}>
            <img src={Img1} alt="Task" style={{ width: 70 }} />
            <Typography
              level="h2"
              sx={{
                color: "#D78827",
                fontWeight: "bold",
                mt: 1,
                fontSize: "1.8rem",
              }}
            >
              Client Details & History
            </Typography>
          </Box>

          {selectedTask ? (
            <Sheet
              variant="soft"
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: "#e3f2fd",
                borderRadius: "12px",
                boxShadow: "sm",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1565C0",
                }}
              >
                🧾 Client Information
              </Typography>
              <Divider />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 2,
                  fontSize: "1.05rem",
                  color: "#333",
                }}
              >
                <Box>
                  <strong>🙋 POC:</strong> {selectedTask.submitted_by || "N/A"}
                </Box>
                <Box>
                  <strong>👤 Client Name:</strong> {selectedTask.name || "N/A"}
                </Box>
                <Box>
                  <strong>🏢 Company:</strong> {selectedTask.company || "N/A"}
                </Box>
                <Box>
                  <strong>📍 Location:</strong>{" "}
                  {`${selectedTask.district || "N/A"}, ${selectedTask.state || "N/A"}`}
                </Box>
                <Box>
                  <strong>📞 Mobile No:</strong> {selectedTask.mobile || "N/A"}
                </Box>
                <Box>
                  <strong>📅 Creation Date:</strong>{" "}
                  {selectedTask.date || "N/A"}
                </Box>
                <Box>
                  <strong>⚡ Capacity:</strong> {selectedTask.capacity || "N/A"}
                </Box>
                <Box>
                  <strong>🛰️ SubStation (km):</strong>{" "}
                  {selectedTask.distance || "N/A"}
                </Box>
                <Box>
                  <strong>🧾 Scheme:</strong> {selectedTask.scheme || "N/A"}
                </Box>
              </Box>
            </Sheet>
          ) : (
            <Typography textAlign="center" color="danger">
              No task data found.
            </Typography>
          )}

          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "12px",
              p: 2,
              overflow: "auto",
              maxHeight: "300px",
              border: "1px solid #ddd",
            }}
          >
            <Table
              borderAxis="both"
              size="md"
              stickyHeader
              sx={{
                "& th": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                  fontSize: "1rem",
                },
                "& td": { fontSize: "0.95rem" },
              }}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>By Whom</th>
                  <th>Feedback</th>
                  <th>Submitted By</th>
                </tr>
              </thead>
              <tbody>
                {/* Only show today's row if comment is empty */}
                {selectedTask?.isToday &&
                  (!selectedTask.comment ||
                    selectedTask.comment.trim() === "") &&
                  selectedTask.submitted_by?.toLowerCase() ===
                    user?.name?.toLowerCase() && (
                    <tr>
                      <td>{selectedTask?.date || "N/A"}</td>
                      <td>{selectedTask?.type || "N/A"}</td>
                      <td>{selectedTask?.by_whom || "N/A"}</td>
                      <td>
                        <Box display="flex" alignItems="center">
                          <Textarea
                            minRows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter comment"
                            sx={{ flex: 1 }}
                          />

                          <Button
                            size="xs"
                            variant="solid"
                            onClick={handleSubmit}
                            sx={{ ml: 1 }}
                          >
                            Submit
                          </Button>
                        </Box>
                        {/* <Button
                          variant="plain"
                          onClick={() => {
                            setSelectedTask(selectedTask); // capture the current task
                            setOpenDialog(true); // open the modal
                          }}
                        >
                          Add Comment
                        </Button> */}
                      </td>
                      <td>{selectedTask?.submitted_by || "N/A"}</td>
                    </tr>
                  )}

                {/* History rows */}
                {selectedTask?.history?.length > 0 ? (
                  selectedTask.history.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date || "N/A"}</td>
                      <td>{item.reference || "N/A"}</td>
                      <td>{item.by_whom || "N/A"}</td>
                      <td
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxWidth: "300px",
                        }}
                      >
                        {item.comment || "N/A"}
                      </td>

                      <td>{item.submitted_by || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      💤 No task history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>

          <Box textAlign="center" mt={3}>
            <Button
              variant="solid"
              color="primary"
              onClick={handleCloseModal}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "xl",
              }}
            >
              Close
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      <Modal open={openAddTaskModal} onClose={handleCloseAddTaskModal}>
        <Grid
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            mt: { md: "5%", xs: "20%" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* <img alt="add" src={plus} /> */}
            <Typography
              level="h4"
              sx={{
                mb: 2,
                textAlign: "center",
                textDecoration: "underline 2px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
              }}
            >
              Add Task
            </Typography>
          </Box>
          <Box>
            <Divider sx={{ width: "50%" }} />
          </Box>

          <Sheet
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: "30px",
              // maxWidth: { xs: "100%", sm: 400 },
              mx: "auto",
              width: { md: "50vw", sm: "50vw" },
              boxShadow: "lg",
            }}
          >
            <form onSubmit={handleSubmitTask}>
              <Stack spacing={2} sx={{ width: "100%" }}>
                <FormControl>
                  <FormLabel>Customer Name</FormLabel>
                  <Input
                    fullWidth
                    placeholder="Customer Name"
                    value={formData.name || "-"}
                    onChange={(e) => handleChange("name", e.target.value)}
                    sx={{ borderRadius: "8px" }}
                    readOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Next FollowUp</FormLabel>
                  <Input
                    fullWidth
                    type="date"
                    placeholder="Next FollowUp"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    sx={{ borderRadius: "8px" }}
                    slotProps={{
                      input: {
                        min: new Date().toISOString().split("T")[0],
                      },
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Reference</FormLabel>
                  <Select
                    value={formData.reference}
                    placeholder="Select References"
                    onChange={(e, newValue) =>
                      handleChange("reference", newValue)
                    }
                    sx={{ borderRadius: "8px" }}
                  >
                    <Option value="By Call">By Call</Option>
                    <Option value="By Meeting">By Meeting</Option>
                  </Select>
                </FormControl>

                {formData.reference === "By Call" ? (
                  <FormControl>
                    <FormLabel>By Whom</FormLabel>
                    <Input
                      fullWidth
                      value={formData.by_whom}
                      disabled
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: "#f0f0f0",
                      }}
                    />
                    <FormLabel sx={{ marginTop: "1%" }}>
                      Task Description
                    </FormLabel>
                    <Input
                      fullWidth
                      placeholder="Task Description"
                      type="text"
                      value={formData.task_detail}
                      onChange={(e) =>
                        handleChange("task_detail", e.target.value)
                      }
                      sx={{ borderRadius: "8px" }}
                      required
                    />
                  </FormControl>
                ) : formData.reference === "By Meeting" ? (
                  <FormControl>
                    <FormLabel>By Whom</FormLabel>
                    <Autocomplete
                      multiple
                      options={bdMembers}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={bdMembers.filter((member) =>
                        formData.by_whom.includes(member.label)
                      )}
                      onChange={handleByWhomChange}
                      disableCloseOnSelect
                      renderOption={(props, option, { selected }) => (
                        <li
                          {...props}
                          key={option.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "5px",
                          }}
                        >
                          <Checkbox
                            checked={selected}
                            sx={{
                              color: selected ? "#007FFF" : "#B0BEC5", // Default gray, blue when selected
                              "&.Mui-checked": {
                                color: "#007FFF",
                              }, // Active color
                              "&:hover": {
                                backgroundColor: "rgba(0, 127, 255, 0.1)",
                              }, // Subtle hover effect
                            }}
                          />
                          {option.label}
                        </li>
                      )}
                      renderInput={(params) => (
                        <Input
                          {...params}
                          placeholder="Select BD Members"
                          sx={{
                            minHeight: "40px",
                            overflowY: "auto",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                    />
                    <FormLabel sx={{ marginTop: "1%" }}>
                      Task Description
                    </FormLabel>
                    <Input
                      fullWidth
                      placeholder="Task Description"
                      type="text"
                      value={formData.task_detail}
                      onChange={(e) =>
                        handleChange("task_detail", e.target.value)
                      }
                      sx={{ borderRadius: "8px" }}
                      required
                    />
                  </FormControl>
                ) : null}

                <Stack flexDirection="row" justifyContent="center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: "8px",
                      background: isSubmitting ? "#9e9e9e" : "#1976d2",
                      color: "white",
                      "&:hover": {
                        background: isSubmitting ? "#9e9e9e" : "#1565c0",
                      },
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    onClick={handleCloseAddTaskModal}
                    sx={{
                      borderRadius: "8px",
                      background: "#f44336",
                      color: "white",
                      "&:hover": { background: "#d32f2f" },
                    }}
                  >
                    Close
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Sheet>
        </Grid>
      </Modal>
    </Box>
  );
};

export default TaskDashboard;
