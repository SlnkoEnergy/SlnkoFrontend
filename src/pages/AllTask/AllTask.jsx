import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import Dash_task from "../../component/All_Tasks/TaskDashboard";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useExportTasksToCsvMutation,
  useGetAllDeptQuery,
  useGetAllUserQuery,
} from "../../redux/globalTaskSlice";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { Add } from "@mui/icons-material";
import Filter from "../../component/Partials/Filter";
import { IconButton, Modal, ModalDialog } from "@mui/joy";
import AddTask from "../../component/All_Tasks/Add_Task";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
function AllTask() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false);

  const [user, setUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [open, setOpen] = useState(false);

  const { data: deptApiData, isLoading: isDeptLoading } = useGetAllDeptQuery();
  const deptList = (deptApiData?.data || []).filter(Boolean);

  const { data: usersResp, isFetching: isUsersLoading } = useGetAllUserQuery({
    department: "",
  });
  const userOptions = (
    Array.isArray(usersResp?.data)
      ? usersResp.data
      : Array.isArray(usersResp)
      ? usersResp
      : []
  )
    .filter(Boolean)
    .map((u) => ({ label: u?.name || "User", value: u?._id || "" }))
    .filter((o) => o.value);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const [exportTasksToCsv] = useExportTasksToCsvMutation();

  const handleExport = async (selectedIds) => {
    try {
      if (!selectedIds?.length) {
        alert("No tasks selected for export.");
        return;
      }
      const response = await exportTasksToCsv(selectedIds).unwrap();
      const blob = new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export tasks to CSV.");
    }
  };

  const fields = [
    {
      key: "priorityFilter",
      label: "Filter By Priority",
      type: "select",
      options: [
        { label: "High", value: "1" },
        { label: "Medium", value: "2" },
        { label: "Low", value: "3" },
      ],
    },
    {
      key: "createdAt",
      label: "Filter by Date",
      type: "daterange",
    },
    {
      key: "deadline",
      label: "Filter by Deadline",
      type: "daterange",
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: isDeptLoading
        ? []
        : deptList.map((d) => ({ label: d, value: d })),
    },
    {
      key: "assigned_to",
      label: "Assigned To",
      type: "select",
      options: isUsersLoading ? [] : userOptions,
    },
    {
      key: "createdBy",
      label: "Created By",
      type: "select",
      options: isUsersLoading ? [] : userOptions,
    },
  ];

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />

        <MainHeader title="Tasks" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/task_dashboard`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Dashboard
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/all_task`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              All Tasks
            </Button>
          </Box>
        </MainHeader>

        <SubHeader title="All Tasks" isBackEnabled={false} sticky>
          <Box display="flex" gap={1} alignItems="center">
            {selectedIds?.length > 0 && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => handleExport(selectedIds)}
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
                Export
              </Button>
            )}

            <Button
              variant="solid"
              size="sm"
              startDecorator={<Add />}
              onClick={() => setOpenAddTaskModal(true)}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              Add Task
            </Button>

            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}
              title="Filters"
              onApply={(values) => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.priorityFilter;
                  delete merged.status;
                  delete merged.department;
                  delete merged.assigned_to;
                  delete merged.createdBy;
                  delete merged.from;
                  delete merged.to;
                  delete merged.deadlineFrom;
                  delete merged.deadlineTo;
                  delete merged.matchMode;

                  const next = {
                    ...merged,
                    page: "1",
                    ...(values.priorityFilter && {
                      priorityFilter: String(values.priorityFilter),
                    }),
                    ...(values.status && { status: String(values.status) }),
                    ...(values.department && {
                      department: String(values.department),
                    }),
                  };

                  // matcher -> matchMode
                  if (values.matcher) {
                    next.matchMode = values.matcher === "OR" ? "any" : "all";
                  }

                  // createdAt range
                  if (values.createdAt?.from)
                    next.from = String(values.createdAt.from);
                  if (values.createdAt?.to)
                    next.to = String(values.createdAt.to);

                  // deadline range
                  if (values.deadline?.from)
                    next.deadlineFrom = String(values.deadline.from);
                  if (values.deadline?.to)
                    next.deadlineTo = String(values.deadline.to);

                  // NEW: user ids
                  if (values.assigned_to)
                    next.assigned_to = String(values.assigned_to);
                  if (values.createdBy)
                    next.createdBy = String(values.createdBy);

                  return next;
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.priorityFilter;
                  delete merged.status;
                  delete merged.department;
                  delete merged.assigned_to;
                  delete merged.createdBy;
                  delete merged.from;
                  delete merged.to;
                  delete merged.deadlineFrom;
                  delete merged.deadlineTo;
                  delete merged.matchMode;
                  return { ...merged, page: "1" };
                });
              }}
            />
          </Box>
        </SubHeader>

        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            p: "16px",
            px: "24px",
          }}
        >
          <Dash_task
            selected={selectedIds}
            setSelected={setSelectedIds}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </Box>

        <Modal
          open={openAddTaskModal}
          onClose={() => setOpenAddTaskModal(false)}
          slotProps={{
            backdrop: {
              sx: {},
            },
          }}
        >
          <ModalDialog
            variant="outlined"
            sx={{
              p: 0,
              borderRadius: "md",
              boxShadow: "lg",
              overflow: "hidden",
              width: "auto",
              height: "auto",
              maxWidth: "unset",
              maxHeight: "unset",
              backgroundColor: "background.surface",
              backdropFilter: "none",
            }}
          >
            <Box
              sx={{
                width: { xs: "95vw", sm: 720 },
                maxHeight: "85vh",
                overflow: "auto",
                position: "relative",
              }}
            >
              <IconButton
                variant="plain"
                color="neutral"
                onClick={() => setOpenAddTaskModal(false)}
                sx={{
                  position: "sticky",
                  top: 8,
                  left: "calc(100% - 40px)",
                  zIndex: 2,
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
              <AddTask />
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </CssVarsProvider>
  );
}

export default AllTask;
