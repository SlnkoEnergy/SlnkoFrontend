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
  Typography,
} from "@mui/joy";
import { isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/cheer-up.png";
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

  const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = generatePageNumbers(currentPage, totalPages);

    return (
      <Box display="flex" justifyContent="center" gap={1} mt={2}>
        {pageNumbers.map((number, index) =>
          number === "..." ? (
            <span key={index} style={{ padding: "6px 12px" }}>
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(number)}
              style={{
                padding: "6px 12px",
                backgroundColor: number === currentPage ? "#4caf50" : "#f1f1f1",
                color: number === currentPage ? "#fff" : "#333",
                borderRadius: "4px",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              {number}
            </button>
          )
        )}
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
        categorizedTasks.today.push(taskEntry);
      } else if (isTomorrow(taskDate)) {
        console.log("📅 Categorized as: Tomorrow");
        categorizedTasks.tomorrow.push(taskEntry);
      } else {
        console.log("📅 Categorized as: Future");
        categorizedTasks.future.push(taskEntry);
      }
    });

  // const tasksWithComments = getTaskArray.filter((task) => task.comment);
  // const tasksWithoutComments = getTaskArray.filter((task) => !task.comment);

  // Check if user is IT Team or Admin
  const isAdminOrITTeam =
    userNames.includes("it team") || userNames.includes("admin");

  // ✅ Get all tasks if user is IT Team or Admin
  const allTasks = isAdminOrITTeam
    ? getTaskArray
    : getTaskArray.filter((task) => {
        const assignedUsers = task.by_whom
          ?.split(",")
          .map((name) => name.trim().toLowerCase());
        return userNames.some((name) => assignedUsers?.includes(name));
      });

  // ✅ Correct comments for tasks without comments without mutating the original array
  const updatedTasks = allTasks.map((task) => {
    if (!task.comment) {
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

  // ✅ Split tasks into tasks with and without comments
  const tasksWithComments = updatedTasks.filter(
    (task) => task.comment && task.comment !== "No assigned user or comment."
  );
  const tasksWithoutComments = updatedTasks.filter(
    (task) => task.comment === "No assigned user or comment."
  );

  const [disabledCards, setDisabledCards] = useState(() => {
    const savedState = localStorage.getItem("disabledCards");
    return savedState ? JSON.parse(savedState) : {};
  });

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

      await updateTask(updateData).unwrap();
      toast.success("Comment updated successfully");

      // ✅ Mark the card as disabled after submitting
      const updatedDisabledCards = {
        ...disabledCards,
        [selectedTask._id]: true,
      };

      setDisabledCards(updatedDisabledCards);
      localStorage.setItem(
        "disabledCards",
        JSON.stringify(updatedDisabledCards)
      );

      // ✅ Update completedTasks to ensure it's stored properly
      setCompletedTasks((prev) => ({
        ...prev,
        [selectedTask._id]: true,
      }));

      setOpenDialog(false);
      setComment("");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem("completedTasks");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : {};

      // ✅ Auto-mark tasks with comments as completed
      const initialCompletedTasks = updatedTasks.reduce((acc, task) => {
        if (task.comment && task.comment !== "No assigned user or comment.") {
          acc[task._id] = true; // Pre-check task if it has a comment
        }
        return acc;
      }, parsedTasks);

      return initialCompletedTasks;
    } catch (error) {
      console.error("Error loading completed tasks:", error);
      return {};
    }
  });

  const handleCheckboxChange = (task, event) => {
    const isChecked = event.target.checked || !!task.comment; // ✅ Auto-check if task has comment

    // ✅ Update completedTasks & persist to localStorage
    setCompletedTasks((prev) => {
      const updatedTasks = { ...prev, [task._id]: isChecked };
      localStorage.setItem("completedTasks", JSON.stringify(updatedTasks)); // Save to localStorage
      return updatedTasks;
    });

    // ✅ Open/Close Dialog as needed
    if (isChecked && !task.comment) {
      setSelectedTask({
        ...task,
        _id: task._id,
        id: task.id,
      });
      setOpenDialog(true);
    } else {
      setSelectedTask(null);
      setOpenDialog(false);
    }
  };

  const tasksPerPage = 3;
  // ✅ New function to slice tasks correctly
  const getPaginatedData = (tasks, currentPage) => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;

    return {
      tasks: tasks.slice(startIndex, endIndex),
      totalPages: Math.ceil(tasks.length / tasksPerPage),
    };
  };

  // useEffect(() => {
  //   localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  // }, [completedTasks]);

  // ✅ Function to generate pagination numbers
  const generatePageNumbers = (currentPage, totalPages) => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Max number of pages to show between ellipses

    // Always show first page
    pageNumbers.push(1);

    if (totalPages <= maxVisiblePages) {
      // ✅ Show all pages if less than maxVisiblePages
      for (let i = 2; i <= totalPages - 1; i++) {
        pageNumbers.push(i);
      }
    } else {
      // ✅ Add ellipses before pages if currentPage > 3
      if (currentPage > 3) {
        pageNumbers.push("...");
      }

      // ✅ Add pages before and after current page dynamically
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

      // ✅ Add ellipses after pages if currentPage < totalPages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }
    }

    // ✅ Always show last page if totalPages > 1
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
      // console.error("❌ Invalid Date:", taskDate);
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
      // Ensure the user's name is always present
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

      // ✅ Close modal after success
      handleCloseAddTaskModal(); // ✅ This closes the modal
    } catch (error) {
      console.error("❌ Error adding task:", error?.data || error);
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
      }); // ✅ Correct reset
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
          maxWidth: 800,
          mx: "auto",
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
          }}
        >
          <TabList
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Tab sx={{ flex: 1, textAlign: "left", fontSize: "1.1rem" }}>
              Past
            </Tab>
            <Tab sx={{ flex: 1, textAlign: "center", fontSize: "1.1rem" }}>
              Today's Task
            </Tab>
            <Tab sx={{ flex: 1, textAlign: "right", fontSize: "1.1rem" }}>
              Tomorrow
            </Tab>
            <Tab sx={{ flex: 1, textAlign: "right", fontSize: "1.1rem" }}>
              Future
            </Tab>
          </TabList>

          {/* Past Tab */}
          <TabPanel
            value={0}
            sx={{
              width: { xs: "90%", sm: "70%", md: "60%", lg: "50%" },
              borderRadius: "20px",
            }}
          >
            <Box>
              <Box display="flex" justifyContent="center" gap={2} mb={3}>
                {/* ✅ Tasks with comments */}
                <Chip
                  startDecorator={<CheckCircle color="success" />}
                  variant="soft"
                  size="lg"
                  sx={{
                    backgroundColor: "#e8f5e9", // Light green for success
                    color: "#388e3c", // Dark green text
                  }}
                >
                  {tasksWithComments.length || 0}{" "}
                  {tasksWithComments.length === 1 ? "Meeting" : "Meetings"}{" "}
                  Added
                </Chip>

                {/* ⏰ Tasks without comments */}
                <Chip
                  startDecorator={<AccessTime color="warning" />}
                  variant="soft"
                  size="lg"
                  sx={{
                    backgroundColor: "#fff8e1", // Light yellow for warning
                    color: "#f57c00", // Orange text
                  }}
                >
                  {tasksWithoutComments.length || 0}{" "}
                  {tasksWithoutComments.length === 1
                    ? "Pending Meeting"
                    : "Pending Meetings"}
                </Chip>
              </Box>

              {categorizedTasks.past.length > 0 ? (
                currentTasksPast
                  .filter((task) => {
                    if (!task.by_whom || !user?.name) return false; // Ensure both exist

                    // Normalize `by_whom` list to an array of trimmed, lowercase names
                    const assignedUsers = task.by_whom
                      .split(",")
                      .map((name) => name.trim().toLowerCase());

                    // Ensure user.name is an array and lowercase
                    const userNames = Array.isArray(user.name)
                      ? user.name.map((name) => name.toLowerCase())
                      : [user.name.toLowerCase()];

                    // Allow "IT Team" or "admin" to see all tasks
                    const isMatched =
                      userNames.includes("it team") ||
                      userNames.includes("admin") ||
                      userNames.some((name) => assignedUsers.includes(name));

                    // Debugging logs
                    console.log("----------- DEBUG LOG -----------");
                    console.log("Task ID:", task.id || "N/A");
                    console.log("Task By Whom (Original):", task.by_whom);
                    console.log("Processed Assigned Users:", assignedUsers);
                    console.log("Logged-in User Names:", userNames);
                    console.log("Match Found:", isMatched);
                    console.log("---------------------------------");

                    return isMatched;
                  })
                  .map((task, index) => (
                    <Card
                      key={index}
                      sx={{
                        mb: 3,
                        borderLeft: "6px solid blue",
                        borderRadius: 6,
                        boxShadow: "xl",
                        border: "1px solid #bbb",
                        p: 2,
                        width: "90%",
                        mx: "auto",
                        pointerEvents: completedTasks[task._id]
                          ? "none"
                          : "auto", // Disable if marked completed
                        opacity: completedTasks[task._id] ? 0.6 : 1, // Dim if disabled
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid xs={7}>
                            <Typography
                              level="h4"
                              color="primary"
                              onClick={() => handleOpenModal(task)}
                              style={{
                                cursor: completedTasks[task._id]
                                  ? "not-allowed"
                                  : "pointer",
                              }}
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
                            flexDirection={"column"}
                            alignItems="center"
                            justifyContent="flex-end"
                            gap={2}
                          >
                            <Checkbox
                              checked={!!completedTasks[task._id]}
                              disabled={true}
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
                              size="lg"
                            >
                              {task.type}
                            </Chip>
                            {/* <Button variant="plain" onClick={() => setOpen(true)}>
                            <Typography>...</Typography>
                          </Button> */}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-lg">No Pending Tasks</Typography>
                  <img width={"40px"} height={"30px"} alt="logo" src={logo} />
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <PaginationComponent
                  currentPage={currentPages.past}
                  totalPages={totalPagesPast}
                  onPageChange={(page) => handlePageChange("past", page)}
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Today Tab */}
          <TabPanel
            value={1}
            sx={{ width: { xs: "90%", sm: "70%", md: "60%", lg: "50%" } }}
          >
            <Typography level="h4">Today's Task</Typography>
            <Typography level="body-md" color="neutral">
              {getCurrentDate()}
            </Typography>
            {categorizedTasks.today.length > 0 ? (
              currentTasksToday
                .filter((task) => {
                  if (!task.by_whom || !user?.name) return false; // Ensure both exist

                  // Normalize `by_whom` list to an array of trimmed, lowercase names
                  const assignedUsers = task.by_whom
                    .split(",")
                    .map((name) => name.trim().toLowerCase());

                  // Ensure user.name is an array and lowercase
                  const userNames = Array.isArray(user.name)
                    ? user.name.map((name) => name.toLowerCase())
                    : [user.name.toLowerCase()];

                  // Allow "IT Team" or "admin" to see all tasks
                  const isMatched =
                    userNames.includes("it team") ||
                    userNames.includes("admin") ||
                    userNames.some((name) => assignedUsers.includes(name));

                  // Debugging logs
                  console.log("----------- DEBUG LOG -----------");
                  console.log("Task ID:", task.id || "N/A");
                  console.log("Task By Whom (Original):", task.by_whom);
                  console.log("Processed Assigned Users:", assignedUsers);
                  console.log("Logged-in User Names:", userNames);
                  console.log("Match Found:", isMatched);
                  console.log("---------------------------------");

                  return isMatched;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.updatedAt || a.date);
                  const dateB = new Date(b.updatedAt || b.date);
                  return dateB - dateA;
                })
                .map((task, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 3,
                      borderRadius: 6,
                      boxShadow: "xl",
                      border: "1px solid #bbb",
                      p: 2,
                      width: "100%",
                      mx: "auto",
                      backgroundColor: task.success ? "#d4edda" : "#ffffff", // ✅ Light green if success
                      border: task.success
                        ? "1px solid #c3e6cb"
                        : "1px solid #e0e0e0",
                      transition: "background-color 0.3s ease-in-out",
                      // opacity: disabledCards[task._id] ? 0.6 : 1,
                      pointerEvents: disabledCards[task._id] ? "none" : "auto",
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={7}>
                          <Chip
                            variant="soft"
                            size="lg"
                            sx={{
                              backgroundColor: "#d4edda", // Light green default
                              color: "#155724", // Dark green text
                              fontWeight: "bold",
                              transition:
                                "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                              "&:hover": {
                                backgroundColor: "#155724", // Dark green on hover
                                color: "#ffffff", // White text for contrast
                              },
                              pointerEvents: "auto",
                            }}
                          >
                            <Button
                              variant="plain"
                              onClick={() => handleOpenAddTaskModal(task)}
                              sx={{
                                padding: 0,
                                minWidth: "auto",
                                color: "inherit",
                              }}
                            >
                              <Typography>Reschedule +</Typography>
                            </Button>
                          </Chip>
                          <Modal
                            open={openAddTaskModal}
                            onClose={handleCloseAddTaskModal}
                          >
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
                                    textDecoration:
                                      "underline 2px rgb(243, 182, 39)",
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
                                        onChange={(e) =>
                                          handleChange("name", e.target.value)
                                        }
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
                                        onChange={(e) =>
                                          handleChange("date", e.target.value)
                                        }
                                        sx={{ borderRadius: "8px" }}
                                        slotProps={{
                                          input: {
                                            min: new Date()
                                              .toISOString()
                                              .split("T")[0],
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
                                        <Option value="By Meeting">
                                          By Meeting
                                        </Option>
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
                                            handleChange(
                                              "task_detail",
                                              e.target.value
                                            )
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
                                          getOptionLabel={(option) =>
                                            option.label
                                          }
                                          isOptionEqualToValue={(
                                            option,
                                            value
                                          ) => option.id === value.id}
                                          value={bdMembers.filter((member) =>
                                            formData.by_whom.includes(
                                              member.label
                                            )
                                          )}
                                          onChange={handleByWhomChange}
                                          disableCloseOnSelect
                                          renderOption={(
                                            props,
                                            option,
                                            { selected }
                                          ) => (
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
                                                  color: selected
                                                    ? "#007FFF"
                                                    : "#B0BEC5", // Default gray, blue when selected
                                                  "&.Mui-checked": {
                                                    color: "#007FFF",
                                                  }, // Active color
                                                  "&:hover": {
                                                    backgroundColor:
                                                      "rgba(0, 127, 255, 0.1)",
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
                                            handleChange(
                                              "task_detail",
                                              e.target.value
                                            )
                                          }
                                          sx={{ borderRadius: "8px" }}
                                          required
                                        />
                                      </FormControl>
                                    ) : null}

                                    <Stack
                                      flexDirection="row"
                                      justifyContent="center"
                                    >
                                      <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        sx={{
                                          borderRadius: "8px",
                                          background: isSubmitting
                                            ? "#9e9e9e"
                                            : "#1976d2", // Gray when disabled
                                          color: "white",
                                          "&:hover": {
                                            background: isSubmitting
                                              ? "#9e9e9e"
                                              : "#1565c0",
                                          },
                                        }}
                                      >
                                        {isSubmitting
                                          ? "Submitting..."
                                          : "Submit"}
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

                          <Typography
                            level="h4"
                            onClick={() => handleOpenModal(task)}
                            style={{ cursor: "pointer", pointerEvents: "auto" }}
                            color={
                              disabledCards[task._id] ? "success" : "primary"
                            }
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
                          alignItems="center"
                          justifyContent="flex-end"
                          flexDirection={"column"}
                          gap={1}
                        >
                          <Chip
                            startDecorator={task.icon}
                            variant="outlined"
                            size="lg"
                            sx={{
                              pointerEvents: disabledCards[task._id]
                                ? "none"
                                : "auto", // 🔥 Disable other actions
                            }}
                          >
                            {task.type}
                          </Chip>
                          {(user?.name === "IT Team" ||
                            user?.name === "admin" ||
                            user?.name?.toLowerCase() ===
                              task?.submitted_by?.toLowerCase()) && (
                            <Checkbox
                              checked={
                                !!completedTasks[task._id] || !!task.comment
                              }
                              onChange={(e) => handleCheckboxChange(task, e)}
                              disabled={completedTasks[task._id]}
                              sx={{
                                "&.Mui-checked": {
                                  color: "white",
                                  backgroundColor: "#4caf50",
                                  borderRadius: "50%",
                                  transition:
                                    "background-color 0.3s ease-in-out",
                                },
                                pointerEvents: "auto",
                              }}
                            />
                          )}

                          <Button
                            variant="plain"
                            onClick={() =>
                              !disabledCards[task._id] && setOpen(true)
                            }
                            disabled={disabledCards[task._id]} // Disable button after comment
                            sx={{
                              pointerEvents: disabledCards[task._id]
                                ? "none"
                                : "auto", // Disable interaction
                            }}
                          >
                            <Typography>
                              {disabledCards[task._id]
                                ? "Comment Added"
                                : "..."}
                            </Typography>
                          </Button>
                          {/* <Button variant="plain" onClick={() => setOpen(true)}>
                  <Typography>Add Comment</Typography>
                </Button> */}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Typography level="body-lg">No tasks for today.</Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <PaginationComponent
                currentPage={currentPages.today}
                totalPages={totalPagesToday}
                onPageChange={(page) => handlePageChange("today", page)}
              />
            </Box>
          </TabPanel>

          {/* Tomorrow Tab */}
          <TabPanel
            value={2}
            sx={{ width: { xs: "90%", sm: "70%", md: "60%", lg: "50%" } }}
          >
            <Typography level="h4">Tomorrow's Task</Typography>
            <Typography level="body-md" color="neutral">
              {getTomorrowDate()}
            </Typography>
            {categorizedTasks.tomorrow.length > 0 ? (
              currentTasksTomorrow
                .filter((task) => {
                  if (!task.by_whom || !user?.name) return false; // Ensure both exist

                  // Normalize `by_whom` list to an array of trimmed, lowercase names
                  const assignedUsers = task.by_whom
                    .split(",")
                    .map((name) => name.trim().toLowerCase());

                  // Ensure user.name is an array and lowercase
                  const userNames = Array.isArray(user.name)
                    ? user.name.map((name) => name.toLowerCase())
                    : [user.name.toLowerCase()];

                  // Allow "IT Team" or "admin" to see all tasks
                  const isMatched =
                    userNames.includes("it team") ||
                    userNames.includes("admin") ||
                    userNames.some((name) => assignedUsers.includes(name));

                  // Debugging logs
                  console.log("----------- DEBUG LOG -----------");
                  console.log("Task ID:", task.id || "N/A");
                  console.log("Task By Whom (Original):", task.by_whom);
                  console.log("Processed Assigned Users:", assignedUsers);
                  console.log("Logged-in User Names:", userNames);
                  console.log("Match Found:", isMatched);
                  console.log("---------------------------------");

                  return isMatched;
                })
                .map((task, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 3,
                      borderRadius: 6,
                      boxShadow: "xl",
                      border: "1px solid #bbb",
                      p: 2,
                      width: "90%",
                      mx: "auto",
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={7}>
                          <Typography
                            level="h4"
                            color="primary"
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
                          alignItems="center"
                          justifyContent="flex-end"
                          flexDirection={"column"}
                          gap={1}
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
                          <Button variant="plain" onClick={() => setOpen(true)}>
                            <Typography>...</Typography>
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Typography level="body-lg">No tasks for tomorrow.</Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
              width: { xs: "90%", sm: "70%", md: "60%", lg: "50%" },
              borderRadius: "20px",
            }}
          >
            <Box>
              <Box
                sx={{
                  margin: "10px",
                }}
              >
                <Typography level="h4">Upcoming Task</Typography>
              </Box>
              {categorizedTasks.future.length > 0 ? (
                currentTasksFuture
                  .filter((task) => {
                    if (!task.by_whom || !user?.name) return false; // Ensure both exist

                    // Normalize `by_whom` list to an array of trimmed, lowercase names
                    const assignedUsers = task.by_whom
                      .split(",")
                      .map((name) => name.trim().toLowerCase());

                    // Ensure user.name is an array and lowercase
                    const userNames = Array.isArray(user.name)
                      ? user.name.map((name) => name.toLowerCase())
                      : [user.name.toLowerCase()];

                    // Allow "IT Team" or "admin" to see all tasks
                    const isMatched =
                      userNames.includes("it team") ||
                      userNames.includes("admin") ||
                      userNames.some((name) => assignedUsers.includes(name));

                    // Debugging logs
                    console.log("----------- DEBUG LOG -----------");
                    console.log("Task ID:", task.id || "N/A");
                    console.log("Task By Whom (Original):", task.by_whom);
                    console.log("Processed Assigned Users:", assignedUsers);
                    console.log("Logged-in User Names:", userNames);
                    console.log("Match Found:", isMatched);
                    console.log("---------------------------------");

                    return isMatched;
                  })
                  .map((task, index) => (
                    <Card
                      key={index}
                      sx={{
                        mb: 3,
                        borderLeft: "6px solid blue",
                        borderRadius: 6,
                        boxShadow: "xl",
                        border: "1px solid #bbb",
                        p: 2,
                        width: "90%",
                        mx: "auto",
                      }}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid xs={7}>
                            <Typography
                              level="h4"
                              color="primary"
                              onClick={() => handleOpenModal(task)}
                              style={{ cursor: "pointer" }}
                            >
                              {task.name}
                            </Typography>
                            {/* <Modal open={openModal} onClose={handleCloseModal}>
                            <Box
                              sx={{
                                p: 4,
                                bgcolor: "background.surface",
                                borderRadius: "md",
                                maxWidth: 600,
                                mx: "auto",
                                mt: 10,
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Customer Name</FormLabel>
                                  <Input
                                    name="name"
                                    value={selectedTask?.name ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Company Name</FormLabel>
                                  <Input
                                    name="company"
                                    value={selectedTask?.company ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Group Name</FormLabel>
                                  <Input
                                    name="group"
                                    value={selectedTask?.group ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Source</FormLabel>
                                  <Select
                                    name="source"
                                    value={selectedTask?.source ?? ""}
                                    onChange={(e, newValue) =>
                                      setSelectedTask({
                                        ...selectedTask,
                                        source: newValue,
                                        reffered_by: "",
                                      })
                                    }
                                    fullWidth
                                  >
                                    {Object.keys(sourceOptions).map(
                                      (option) => (
                                        <Option key={option} value={option}>
                                          {option}
                                        </Option>
                                      )
                                    )}
                                  </Select>
                                </Grid>
                                {selectedTask?.source &&
                                  sourceOptions[selectedTask.source]?.length >
                                    0 && (
                                    <Grid xs={12} sm={6}>
                                      <FormLabel>Sub Source</FormLabel>
                                      <Select
                                        name="reffered_by"
                                        value={selectedTask?.reffered_by ?? ""}
                                        readOnly
                                        fullWidth
                                      >
                                        {sourceOptions[selectedTask.source].map(
                                          (option) => (
                                            <Option key={option} value={option}>
                                              {option}
                                            </Option>
                                          )
                                        )}
                                      </Select>
                                    </Grid>
                                  )}
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Email ID</FormLabel>
                                  <Input
                                    name="email"
                                    type="email"
                                    value={selectedTask?.email ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Mobile Number</FormLabel>
                                  <Input
                                    name="mobile"
                                    type="tel"
                                    value={selectedTask?.mobile ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Location</FormLabel>
                                  <Input
                                    name="location"
                                    value={`${selectedTask?.village ?? ""}, ${selectedTask?.district ?? ""}, ${selectedTask?.state ?? ""}`}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Capacity</FormLabel>
                                  <Input
                                    name="capacity"
                                    value={selectedTask?.capacity ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>
                                    Sub Station Distance (KM)
                                  </FormLabel>
                                  <Input
                                    name="distance"
                                    value={selectedTask?.distance ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Tariff (Per Unit)</FormLabel>
                                  <Input
                                    name="tarrif"
                                    value={selectedTask?.tarrif ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Available Land</FormLabel>
                                  <Input
                                    name="available_land"
                                    value={
                                      selectedTask?.land?.available_land ?? ""
                                    }
                                    type="number"
                                    fullWidth
                                    variant="soft"
                                    readOnly
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Creation Date</FormLabel>
                                  <Input
                                    name="entry_date"
                                    type="date"
                                    value={selectedTask?.entry_date ?? ""}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Scheme</FormLabel>
                                  <Select
                                    name="scheme"
                                    value={selectedTask?.scheme ?? ""}
                                    readOnly
                                  >
                                    {["KUSUM A", "KUSUM C", "Other"].map(
                                      (option) => (
                                        <Option key={option} value={option}>
                                          {option}
                                        </Option>
                                      )
                                    )}
                                  </Select>
                                </Grid>
                                <Grid xs={12} sm={6}>
                                  <FormLabel>Land Types</FormLabel>
                                  <Autocomplete
                                    options={landTypes}
                                    value={
                                      selectedTask?.land?.land_type ?? null
                                    }
                                    readOnly
                                    getOptionLabel={(option) => option}
                                    renderInput={(params) => (
                                      <Input
                                        {...params}
                                        placeholder="Land Type"
                                        variant="soft"
                                        required
                                      />
                                    )}
                                    isOptionEqualToValue={(option, value) =>
                                      option === value
                                    }
                                    sx={{ width: "100%" }}
                                  />
                                </Grid>
                                <Grid xs={12}>
                                  <FormLabel>Comments</FormLabel>
                                  <Input
                                    name="comment"
                                    value={selectedTask?.comment ?? ""}
                                    multiline
                                    rows={4}
                                    readOnly
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                              <Box textAlign="center" sx={{ mt: 2 }}>
                                <Button onClick={handleCloseModal}>
                                  Close
                                </Button>
                              </Box>
                            </Box>
                          </Modal> */}
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
                              {/* {getDayAfterTomorrowDate(taskDate)} */}
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
                              onClick={() => setOpen(true)}
                            >
                              <Typography>...</Typography>
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-lg">
                    No Future Tasks Available
                  </Typography>
                  <img width={"40px"} height={"30px"} alt="logo" src={logo} />
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <PaginationComponent
                  currentPage={currentPages.future}
                  totalPages={totalPagesFuture}
                  onPageChange={(page) => handlePageChange("future", page)}
                />
              </Box>
            </Box>
          </TabPanel>
        </Tabs>
      </Sheet>

      {/* Modal for Check Box for comments */}
      <Modal open={openDialog} onClose={() => setOpenDialog(false)}>
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
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
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
          sx={{ maxWidth: 900, p: 3, borderRadius: "12px" }}
        >
          <Box textAlign="center" mb={3}>
            <img src={Img1} alt="Task" style={{ width: 60 }} />
            <Typography
              level="h2"
              sx={{ color: "#D78827", fontWeight: "bold" }}
            >
              Client Details & History
            </Typography>
          </Box>

          {selectedTask ? (
            <Sheet
              variant="soft"
              sx={{
                p: 3,
                mb: 2,
                backgroundColor: "#e3f2fd",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#1976D2",
                }}
              >
                Client Information
              </Typography>
              <Divider />
              <Typography sx={{ fontSize: "1.1rem", color: "#333" }}>
                <strong>POC:</strong> {selectedTask?.submitted_by || "N/A"}{" "}
                &nbsp;| &nbsp;&nbsp;
                <strong>Client Name:</strong> {selectedTask?.name || "N/A"}{" "}
                &nbsp;| &nbsp;&nbsp;
                <strong>Company:</strong> {selectedTask?.company || "N/A"}{" "}
                &nbsp;| &nbsp;&nbsp;
                <strong>Location:</strong>{" "}
                {`${selectedTask?.district || "N/A"}, ${selectedTask?.state || "N/A"}`}
              </Typography>
              <Typography sx={{ fontSize: "1.1rem", color: "#333" }}>
                <strong>Mobile No:</strong> {selectedTask?.mobile || "N/A"}{" "}
                &nbsp;| &nbsp;&nbsp;
                <strong>Capacity:</strong> {selectedTask?.capacity || "N/A"}{" "}
                &nbsp;| &nbsp;&nbsp;
                <strong>Scheme:</strong> {selectedTask?.scheme || "N/A"}
              </Typography>
            </Sheet>
          ) : (
            <Typography textAlign="center" color="error">
              No task data found.
            </Typography>
          )}

          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Table
              borderAxis="both"
              size="lg"
              sx={{
                "& th": {
                  backgroundColor: "#f0f0f0",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                },
                "& td": { fontSize: "1rem" },
              }}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>By Whom</th>
                  <th>Feedback</th>
                  <th>submitted_by</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "10px" }}
                    >
                      Loading history...
                    </td>
                  </tr>
                ) : selectedTask?.history?.length > 0 ? (
                  selectedTask.history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.date}</td>
                      <td>{entry.reference}</td>
                      <td>{entry.by_whom}</td>
                      <td>{entry.comment}</td>
                      <td>{entry.submitted_by}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        fontStyle: "italic",
                      }}
                    >
                      No task history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>

          <Box textAlign="center" mt={3}>
            <Button variant="solid" color="primary" onClick={handleCloseModal}>
              Close
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default TaskDashboard;
