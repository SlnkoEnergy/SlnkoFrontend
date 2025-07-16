import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Dash_task from "../../component/TaskDashboard";
import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useExportTasksToCsvMutation } from "../../redux/globalTaskSlice";

function AllTask() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
    const response = await exportTasksToCsv(selectedIds ).unwrap();

    const blob = new Blob([response], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks_export.csv';
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
                Tasks
              </Link>

              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                All Task
              </Typography>
            </Breadcrumbs>
          </Box>

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
              All Task
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                p: 2,
                flexWrap: "wrap",

                borderRadius: "lg",

                mb: 2,
              }}
            >
              <Button
  variant="solid"
  color="primary"
  startDecorator={<DownloadRoundedIcon />}
  size="md"
  onClick={() => handleExport(selectedIds)} 
>
  Export to CSV
</Button>

              <Button
                variant="solid"
                color="primary"
                startDecorator={<ViewModuleRoundedIcon />}
                size="md"
                onClick={() => navigate("/add_task")}
              >
                Add Task
              </Button>
            </Box>
          </Box>
          <Dash_task selected={selectedIds} setSelected={setSelectedIds} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default AllTask;
