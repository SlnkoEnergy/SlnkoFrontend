import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import Dash_task from "../../component/TaskDashboard";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useExportTasksToCsvMutation,
  useGetAllDeptQuery,
} from "../../redux/globalTaskSlice";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { Add } from "@mui/icons-material";
import Filter, { buildQueryParams } from "../../component/Partials/Filter";

function AllTask() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [open, setOpen] = useState(false);

  const { data: deptApiData, isLoading: isDeptLoading } = useGetAllDeptQuery();
  const deptList = (deptApiData?.data || []).filter(Boolean);

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
      key: "createdAt",
      label: "Filter by Date",
      type: "date",
    },
    {
      key: "deadline",
      label: "Filter by Deadline",
      type: "date",
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
      key: "assignedToName",
      label: "Assigned To (Name)",
      type: "text",
      placeholder: "e.g. Ram",
    },
    {
      key: "createdByName",
      label: "Created By (Name)",
      type: "text",
      placeholder: "e.g. Ramesh",
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
              onClick={() => navigate(`/eng_dash`)}
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
              onClick={() => navigate(`/inspection`)}
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
              onClick={() => navigate("/add_task")}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              Add Task
            </Button>

            {/* 🔽 Reusable Filter in SubHeader */}
            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}
              title="Filters"
              onApply={(values) => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());

                  // clear old filter keys
                  delete merged.status;
                  delete merged.createdAt;
                  delete merged.deadline;
                  delete merged.department;
                  delete merged.assignedToName;
                  delete merged.createdByName;

                  // set new ones
                  return {
                    ...merged,
                    page: "1", // reset pagination
                    ...(values.status && { status: String(values.status) }),
                    ...(values.createdAt && {
                      createdAt: String(values.createdAt),
                    }),
                    ...(values.deadline && {
                      deadline: String(values.deadline),
                    }),
                    ...(values.department && {
                      department: String(values.department),
                    }),
                    ...(values.assignedToName && {
                      assignedToName: String(values.assignedToName),
                    }),
                    ...(values.createdByName && {
                      createdByName: String(values.createdByName),
                    }),
                  };
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  // clear only filter keys, keep pagination/limit/etc.
                  delete merged.status;
                  delete merged.createdAt;
                  delete merged.deadline;
                  delete merged.department;
                  delete merged.assignedToName;
                  delete merged.createdByName;

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
          {/* Dash_task keeps reading everything from URL params, unchanged */}
          <Dash_task
            selected={selectedIds}
            setSelected={setSelectedIds}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default AllTask;
