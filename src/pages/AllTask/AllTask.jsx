import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import Dash_task from "../../component/TaskDashboard";
import { useNavigate } from "react-router-dom";
import { useExportTasksToCsvMutation } from "../../redux/globalTaskSlice";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { Add } from "@mui/icons-material";
import Filter, { buildQueryParams } from "../../component/Partials/Filter";

function AllTask() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const fields = [
    { key: "createdBy", label: "Reporter", type: "select", getOptions: async () => ["Alice", "Bob"] },
    { key: "assignee", label: "Assignee", type: "multiselect", getOptions: async () => ["Charlie", "Diana"] },
    { key: "deadline", label: "Deadline", type: "daterange" },
    { key: "status", label: "Status", type: "select", options: ["Open", "Closed"] },
  ];
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

  const [exportTasksToCsv] = useExportTasksToCsvMutation();

  const handleExport = async (selectedIds) => {
    try {
      if (!selectedIds || selectedIds.length === 0) {
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
             All Tasks
            </Button>
          </Box>
        </MainHeader>
        <SubHeader title="All Tasks" isBackEnabled={false} sticky>
          <Box display="flex" gap={1}>
            {selectedIds && selectedIds.length > 0 && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => navigate("/add_task")}
                sx={{
                  color: "#3366a3",
                  borderColor: "#3366a3",
                  backgroundColor: "transparent",
                  "--Button-hoverBg": "#e0e0e0",
                  "--Button-hoverBorderColor": "#3366a3",
                  "&:hover": {
                    color: "#3366a3",
                  },
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
                "&:hover": {
                  backgroundColor: "#285680",
                },
              }}
            >
              Add Task
            </Button>

           <Filter
        open={open}
        onOpenChange={setOpen} // 👈 must be a function
        fields={fields}
        onApply={(values) => {
          const qs = buildQueryParams(values, { dateKeys: ["deadline"], arrayKeys: ["assignee"] });
          console.log("querystring:", qs);
          setQuery(qs);
          setOpen(false);
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
          <Dash_task selected={selectedIds} setSelected={setSelectedIds} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default AllTask;
