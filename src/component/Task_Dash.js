import { AccessTime, CheckCircle, Person, Phone } from "@mui/icons-material";
import {
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
  Grid,
  Modal,
  ModalDialog,
  Sheet,
  Tab,
  Table,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Typography,
} from "@mui/joy";
import { isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../assets/cheer-up.png";
import Img1 from "../assets/follow_up_history.png";
import {
  useGetEntireLeadsQuery,
  useUpdateTaskCommentMutation,
} from "../redux/leadsSlice";
import { useGetLoginsQuery } from "../redux/loginSlice";
import { useGetTasksHistoryQuery, useGetTasksQuery } from "../redux/tasksSlice";

const TaskDashboard = () => {
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

  const CustomPagination = ({
    totalPages,
    currentPage,
    onPageChange = () => {},
  }) => {
    return (
      <Box
        display="flex"
        gap={1}
        justifyContent="center"
        alignItems="center"
        mt={2}
      >
        <Button
          disabled={currentPage === 1}
          onClick={() => onPageChange(null, currentPage - 1)}
        >
          Prev
        </Button>

        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index + 1}
            variant={currentPage === index + 1 ? "solid" : "outlined"}
            onClick={() => onPageChange(null, index + 1)}
          >
            {index + 1}
          </Button>
        ))}

        <Button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(null, currentPage + 1)}
        >
          Next
        </Button>
      </Box>
    );
  };
  const statesOfIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const sourceOptions = {
    "Referred by": ["Directors", "Clients", "Team members", "E-mail"],
    "Social Media": ["Whatsapp", "Instagram", "LinkedIn"],
    Marketing: ["Youtube", "Advertisements"],
    "IVR/My Operator": [],
    Others: [],
  };
  const landTypes = ["Leased", "Owned"];

  const { data: getLead = [] } = useGetEntireLeadsQuery();
  const { data: getTask = [] } = useGetTasksQuery();
  const [updateTask] = useUpdateTaskCommentMutation();
  const { data: getTaskHistory = [], isLoading } = useGetTasksHistoryQuery();
  const { data: usersData = [], isLoading: isFetchingUsers } =
    useGetLoginsQuery();

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

      // Ensure `user.name` is treated as an array and converted to lowercase
      // const userNames = Array.isArray(user.name)
      //   ? user.name.map((name) => name.toLowerCase())
      //   : [user.name.toLowerCase()];

      // Check if any userNames exist in assignedUsers
      return userNames.some((name) => assignedUsers.includes(name));
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

      const associatedTask = getTaskHistoryArray.find(
        (taskHistory) => String(taskHistory.id) === String(task.id)
      );

      if (!associatedLead) return;

      const taskEntry = {
        _id: task._id,
        id: task.id,
        date: task.date || "",
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
        reference: associatedTask?.reference || "",
        comment: associatedTask?.comment || "",
        assigned_user: user?.name || "Unknown User",
        canCheck: canCheck,
        submitted_by: task.submitted_by || "",
      };

      // ✅ Ensure categorizedTasks updates correctly
      if (isBefore(taskDate, now) && !isToday(taskDate)) {
        console.log("📌 Categorized as: PAST");
        categorizedTasks.past.push(taskEntry);
      } else if (isToday(taskDate)) {
        console.log("📌 Categorized as: TODAY");
        categorizedTasks.today.push(taskEntry);
      } else if (isTomorrow(taskDate)) {
        console.log("📌 Categorized as: TOMORROW");
        categorizedTasks.tomorrow.push(taskEntry);
      } else {
        console.log("📌 Categorized as: FUTURE");
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

  const handleCheckboxChange = (task, event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
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

    // Save completed state
    setCompletedTasks((prev) => {
      const updatedTasks = { ...prev, [task._id]: isChecked };

      // Persist in localStorage
      localStorage.setItem("completedTasks", JSON.stringify(updatedTasks));

      return updatedTasks;
    });
  };

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

      const updatedDisabledCards = {
        ...disabledCards,
        [selectedTask._id]: true,
      };

      setDisabledCards(updatedDisabledCards);
      localStorage.setItem(
        "disabledCards",
        JSON.stringify(updatedDisabledCards)
      );

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
    const savedCompletedTasks = localStorage.getItem("completedTasks");
    return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : {};
  });

  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  const getPaginatedTasks = (tasks, currentPage) => {
    const startIndex = (currentPage - 1) * tasksperpage;
    const endIndex = startIndex + tasksperpage;
    return {
      tasks: tasks.slice(startIndex, endIndex),
      totalPages: Math.ceil(tasks.length / tasksperpage),
    };
  };

  const handlePageChange = (category, value) => {
    setCurrentPages((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const { tasks: currentTasksPast, totalPages: totalPagesPast } =
    getPaginatedTasks(categorizedTasks.past, currentPages.past);

  const { tasks: currentTasksToday, totalPages: totalPagesToday } =
    getPaginatedTasks(categorizedTasks.today, currentPages.today);

  const { tasks: currentTasksTomorrow, totalPages: totalPagesTomorrow } =
    getPaginatedTasks(categorizedTasks.tomorrow, currentPages.tomorrow);

  const { tasks: currentTasksFuture, totalPages: totalPagesFuture } =
    getPaginatedTasks(categorizedTasks.future, currentPages.future);

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

  const getDayAfterTomorrowDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const date = new Date();
    date.setDate(date.getDate() + 2);

    return date.toLocaleDateString("en-US", options);
  };

  // const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (task) => {
    if (!task) return;

    setSelectedTask(task);
    setOpenModal(true);
    console.log("Selected Task:", task);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setSelectedTask(null);
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
                <CustomPagination
                  totalPages={totalPagesPast}
                  currentPage={currentPages.past}
                  onPageChange={(e, value) => handlePageChange("past", value)}
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
                      backgroundColor: disabledCards[task._id]
                        ? "#f5f5f5"
                        : "#fff",
                      pointerEvents: disabledCards[task._id] ? "none" : "auto",
                      // opacity: disabledCards[task._id] ? 0.6 : 1,
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid xs={7}>
                          <Typography
                            level="h4"
                            onClick={() => handleOpenModal(task)}
                            style={{ cursor: "pointer", pointerEvents: "auto" }} // Ensures clicking is enabled
                            color={
                              disabledCards[task._id] ? "neutral" : "primary"
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
                          {(user?.name === "IT Team" ||
                            user?.name === "admin" ||
                            user?.name?.toLowerCase() ===
                              task?.submitted_by?.toLowerCase()) && (
                            <Checkbox
                              checked={completedTasks[task._id] || false}
                              onChange={(e) => handleCheckboxChange(task, e)}
                              sx={{
                                "&.Mui-checked": {
                                  color: "white",
                                  backgroundColor: "#4caf50",
                                  borderRadius: "50%",
                                  transition:
                                    "background-color 0.3s ease-in-out",
                                },
                              }}
                            />
                          )}

                          <Chip
                            startDecorator={task.icon}
                            variant="outlined"
                            size="lg"
                          >
                            {task.type}
                          </Chip>
                          <Button
                            variant="plain"
                            onClick={() =>
                              !disabledCards[task._id] && setOpen(true)
                            }
                            disabled={disabledCards[task._id]}
                          >
                            <Typography>
                              {disabledCards[task._id]
                                ? "Comment Added"
                                : "..."}
                            </Typography>
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Typography level="body-lg">No tasks for today.</Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CustomPagination
                totalPages={totalPagesToday}
                currentPage={currentPages.today}
                onPageChange={(e, value) => handlePageChange("today", value)}
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
              <CustomPagination
                totalPages={totalPagesTomorrow}
                currentPage={currentPages.tomorrow}
                onPageChange={(e, value) => handlePageChange("tomorrow", value)}
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
                              {getDayAfterTomorrowDate()}
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
                <CustomPagination
                  totalPages={totalPagesFuture}
                  currentPage={currentPages.future}
                  onPageChange={(e, value) => handlePageChange("future", value)}
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
                <strong>POC:</strong> {selectedTask?.assigned_user || "N/A"}{" "}
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
                  <th>Comments</th>
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
                ) : selectedTask ? (
                  <tr>
                    <td>{selectedTask?.date || "N/A"}</td>
                    <td>{selectedTask?.reference || "N/A"}</td>
                    <td>{selectedTask?.by_whom || "N/A"}</td>
                    <td>{selectedTask?.comment || "N/A"}</td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan="4"
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
