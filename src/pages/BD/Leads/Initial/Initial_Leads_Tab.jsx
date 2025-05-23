import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import { React, useState } from "react";
// import Button from '@mui/joy/Button';
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
// import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Lead_Dead from "../../../../component/Lead Stage/Dead_Lead";
import Lead_FollowUp from "../../../../component/Lead Stage/Follow_Lead";
import Lead_Initial from "../../../../component/Lead Stage/Initial_Lead";
import Lead_Overall from "../../../../component/Lead Stage/Overall_Lead";
import Lead_Warm from "../../../../component/Lead Stage/Warm_Lead";
import Lead_Won from "../../../../component/Lead Stage/Won_Lead";
import Header from "../../../../component/Partials/Header";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "../../../../component/Partials/Sidebar";
import {
  Badge,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
} from "@mui/joy";
import {
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "../../../../redux/tasksSlice";
import { Dialog } from "@mui/material";
import { toast } from "react-toastify";
import { useEffect } from "react";

function InitialLeads() {
  const allLeadRef = useRef();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState("OverAll");

  const leadOptions = [
    "OverAll",
    "Initial",
    "Follow Up",
    "Warm",
    "Won",
    "Dead",
  ];

  const handleExportToCSV = () => {
    if (allLeadRef.current?.exportToCSV) {
      allLeadRef.current.exportToCSV();
    }
  };

  const renderLeadComponent = () => {
    switch (selectedLead) {
      case "Warm":
        return <Lead_Warm ref={allLeadRef} />;
      case "Follow Up":
        return <Lead_FollowUp ref={allLeadRef} />;
      case "Won":
        return <Lead_Won ref={allLeadRef} />;
      case "Dead":
        return <Lead_Dead ref={allLeadRef} />;
      case "Initial":
        return <Lead_Initial ref={allLeadRef} />;
      default:
        return <Lead_Overall ref={allLeadRef} />;
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <LeadPage
        navigate={navigate}
        selectedLead={selectedLead}
        setSelectedLead={setSelectedLead}
        leadOptions={leadOptions}
        renderLeadComponent={renderLeadComponent}
        handleExportToCSV={handleExportToCSV}
      />
    </CssVarsProvider>
  );
}

function NotificationBell() {
  const { data: notifications = [], isLoading, refetch } = useGetTasksQuery();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("userDetails"))?.name;

  const handleToggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleModalOpen = (notification) => {
    setSelectedNotification(notification);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedNotification(null);
  };

  const handleClearOne = async (id) => {
    try {
      await updateTaskStatus(id);
      toast.success("Notification cleared");
      refetch();
    } catch (error) {
      toast.error("Unable to clear notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const clearPromises = userNotifications.map((notif) =>
        updateTaskStatus(notif._id)
      );
      await Promise.all(clearPromises);
      toast.success("All notifications cleared");
      handleModalClose();
      refetch();
    } catch (error) {
      toast.error("Some notifications couldn't be cleared");
    }
  };

  const userNotifications = notifications
    .filter(
      (task) =>
        task.status === "Add" &&
        task.submitted_by !== currentUser &&
        task.by_whom
          ?.split(",")
          .map((name) => name.trim())
          .includes(currentUser) &&
        task.reference?.toLowerCase() === "by meeting"
    )
    .slice(-5)
    .reverse();

  return (
    <>
      <IconButton onClick={handleToggle}>
        <Badge
          badgeContent={userNotifications.length}
          color="danger"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.75rem",
              height: "18px",
              minWidth: "18px",
              backgroundColor:
                userNotifications.length > 0 ? "red" : "transparent",
              color: "white",
            },
          }}
        >
          <NotificationsIcon
            sx={{
              fontSize: "2rem",
              color: userNotifications.length > 0 ? "#FFD700" : "gray",
              animation:
                userNotifications.length > 0 ? "ringBell 1s infinite" : "none",
              transformOrigin: "top center",
              "@keyframes ringBell": {
                "0%": { transform: "rotate(0deg)" },
                "10%": { transform: "rotate(-15deg)" },
                "20%": { transform: "rotate(15deg)" },
                "30%": { transform: "rotate(-10deg)" },
                "40%": { transform: "rotate(10deg)" },
                "50%": { transform: "rotate(-5deg)" },
                "60%": { transform: "rotate(5deg)" },
                "70%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(0deg)" },
              },
            }}
          />
        </Badge>
      </IconButton>

      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        placement="bottom-end"
      >
        {isLoading ? (
          <MenuItem>Loading...</MenuItem>
        ) : userNotifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          <>
            {userNotifications.map((task, index) => {
              const message =
                task.submitted_by === currentUser ? (
                  <>
                    Hi, the task <strong>"{task.name}"</strong> has been
                    assigned to you.
                  </>
                ) : (
                  <>
                    New task <strong>{task.name}</strong> has been assigned to
                    you from <strong>{task.submitted_by}</strong> meeting.
                  </>
                );

              return (
                <MenuItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    onClick={() => {
                      handleModalOpen(task);
                      setAnchorEl(null);
                    }}
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                  >
                    <ListItemDecorator>
                      {/* <AccessTimeIcon fontSize="small" /> */}
                    </ListItemDecorator>
                    <Typography level="body-sm">{message}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearOne(task._id);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </MenuItem>
              );
            })}
            <MenuItem
              onClick={() => {
                handleClearAll();
                setAnchorEl(null);
              }}
              sx={{
                justifyContent: "center",
                fontWeight: "bold",
                color: "red",
              }}
            >
              Clear All
            </MenuItem>
          </>
        )}
      </Menu>

      <Modal open={openModal} onClose={handleModalClose}>
        <ModalDialog variant="outlined" role="alertdialog">
          <Typography level="h4">Task Notification</Typography>
          <Typography>
            {selectedNotification?.reference?.toLowerCase() === "by meeting" ? (
              <>
                New task <strong>{selectedNotification.name}</strong> has been
                assigned to you from{" "}
                <strong>{selectedNotification.submitted_by}</strong> meeting.
              </>
            ) : (
              "You have a new task."
            )}
          </Typography>

          <Sheet
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            }}
          >
            <Button variant="solid" color="danger" onClick={handleClearAll}>
              Clear All
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={() => handleClearOne(selectedNotification._id)}
            >
              Clear
            </Button>
          </Sheet>
        </ModalDialog>
      </Modal>
    </>
  );
}

function LeadPage({
  navigate,
  selectedLead,
  setSelectedLead,
  leadOptions,
  renderLeadComponent,
  handleExportToCSV,
}) {
  const { mode } = useColorScheme();
    const [user, setUser] = useState(null);

    useEffect(() => {
     const userData = getUserData();
     setUser(userData);
   }, []);

   const getUserData = () => {
     const userData = localStorage.getItem("userDetails");
     if (userData) {
       return JSON.parse(userData);
     }
     return null;
   };

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Header />
      <Sidebar />

      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
        }}
      >
        {/* Breadcrumb Navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          <Breadcrumbs
            size="sm"
            aria-label="breadcrumbs"
            separator={<ChevronRightRoundedIcon fontSize="sm" />}
            sx={{ pl: 0, marginTop: { md: "4%", lg: "0%" } }}
          >
            <Link
              underline="none"
              color="neutral"
              sx={{ fontSize: 12, fontWeight: 500 }}
            >
              Business Development
            </Link>
            <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
              Leads
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          <Typography level="h2" component="h1">
            {selectedLead} Leads
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              justifyContent: "center",
            }}
          >
            {(selectedLead === "Won" ||
              selectedLead === "Follow Up" ||
              selectedLead === "Warm") && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/comm_offer")}
              >
                Commercial Offer
              </Button>
            )}

            {(selectedLead === "Initial" || selectedLead === "OverAll") && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/add_lead")}
              >
                Add New Leads +
              </Button>
            )}

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <Dropdown>
                <MenuButton size="sm" color="primary" variant="outlined">
                  More Actions
                </MenuButton>
                <Menu>
                  <MenuItem onClick={() => navigate("/dash_task")}>
                    Task Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleExportToCSV}>Export to CSV</MenuItem>
                </Menu>
              </Dropdown>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
              }}
            >
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/dash_task")}
              >
                Task Dashboard
              </Button>

              {(user?.name === "admin" || user?.name === "IT Team") && (
                <Button
                  color="primary"
                  startDecorator={<DownloadRoundedIcon />}
                  size="sm"
                  onClick={handleExportToCSV}
                >
                  Export to CSV
                </Button>
              )}
            </Box>
            <NotificationBell />
          </Box>
        </Box>

        {/* Lead Filter Tabs */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
            marginLeft: { xl: "15%", lg: "18%" },
          }}
        >
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <Button
              variant={selectedLead === "OverAll" ? "solid" : "outlined"}
              onClick={() => setSelectedLead("OverAll")}
              size="sm"
            >
              Overall
            </Button>

            <Select
              value={selectedLead}
              onChange={(e, value) => value && setSelectedLead(value)}
              size="sm"
              placeholder="Select Lead Type"
              sx={{ minWidth: 150 }}
            >
              {leadOptions
                .filter((lead) => lead !== "OverAll")
                .map((option, index) => (
                  <Option key={index} value={option}>
                    {option}
                  </Option>
                ))}
            </Select>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "row",
              alignItems: "center",
              listStyle: "none",
              padding: 0,
              margin: "10px 0",
              gap: 3,
            }}
          >
            {leadOptions.map((item, index) => (
              <Box
                key={index}
                sx={{
                  padding: "8px 15px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  color:
                    mode === "dark"
                      ? selectedLead === item
                        ? "#007bff"
                        : "#86c3ff"
                      : selectedLead === item
                        ? "#007bff"
                        : "black",
                  borderRadius: "8px",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#007bff",
                    color: "white",
                  },
                  ...(selectedLead === item && {
                    backgroundColor: "#007bff",
                    color: "white",
                  }),
                }}
                onClick={() => setSelectedLead(item)}
              >
                {item}
              </Box>
            ))}
          </Box>
        </Box>

        {renderLeadComponent()}
      </Box>
    </Box>
  );
}

export default InitialLeads;
