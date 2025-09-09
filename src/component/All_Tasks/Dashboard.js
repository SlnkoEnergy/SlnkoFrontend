// In your dashboard page:
import { Box } from "@mui/joy";
import TaskSummaryCards from "./TaskDashboardCards";

export default function AllTaskDashboard() {
  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      <TaskSummaryCards />
    </Box>
  );
}
