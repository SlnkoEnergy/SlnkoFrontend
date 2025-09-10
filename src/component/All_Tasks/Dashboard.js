import { Box, Grid } from "@mui/joy";
import CloudStatCard from "./TaskDashboardCards";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import TaskStatusList from "./TaskListCard";
import ActivityFeedCard from "./ActivityCard";
import ProjectsWorkedCard from "./Charts/ProjectsDonut";
import TeamLeaderboard from "./TeamLeaderboard";
import TasksByAgingBar from "./Charts/BarChart";
import { useTaskFilters } from "../../store/Context/TaskFilterContext";
import { useGetTaskStatsQuery } from "../../redux/globalTaskSlice";
import { useNavigate } from "react-router-dom";

/** Small pill-style badge for right illustration slot */
const IconBadge = ({ color = "#2563eb", bg = "#eff6ff", icon }) => (
  <div
    style={{
      width: 42,
      height: 26,
      borderRadius: 999,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      fontWeight: 700,
    }}
  >
    {icon}
  </div>
);

const demo = [];
const feed = [];

export default function AllTaskDashboard() {
  const { apiParams } = useTaskFilters();
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetTaskStatsQuery(apiParams);
  const stats = data?.data || {
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  console.log({ apiParams });

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* Row of top stat cards */}
      <Grid container spacing={2}>
        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.active ?? 0}
            title="Active Task"
            subtitle="Task that is still ongoing"
            accent="#6aa3ff"
            illustration={
              <IconBadge
                icon={<HourglassTopRoundedIcon fontSize="small" />}
                color="#1d4ed8"
                bg="#e0f2fe"
              />
            }
            onAction={() => {
              const params = new URLSearchParams(apiParams);
              params.set("page", "1");
              params.set("tab", "In Progress");
              navigate(`/all_task?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.pending ?? 0}
            title="Pending Task"
            subtitle="Tasks waiting to start"
            accent="#9aa7ff"
            illustration={
              <IconBadge
                icon={<HourglassTopRoundedIcon fontSize="small" />}
                color="#0369a1"
                bg="#e0f2fe"
              />
            }
            onAction={() => {
              const params = new URLSearchParams(apiParams);
              params.set("page", "1");
              params.set("tab", "Pending");
              navigate(`/all_task?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.completed ?? 0}
            title="Completed Task"
            subtitle="Tasks finished"
            accent="#9aa7ff"
            illustration={
              <IconBadge
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                color="#16a34a"
                bg="#ecfdf5"
              />
            }
            onAction={() => {
              const params = new URLSearchParams(apiParams);
              params.set("page", "1");
              params.set("tab", "Completed");
              navigate(`/all_task?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.cancelled ?? 0}
            title="Cancelled Task"
            subtitle="Tasks cancelled"
            accent="#fca5a5"
            illustration={
              <IconBadge
                icon={<CancelRoundedIcon fontSize="small" />}
                color="#b91c1c"
                bg="#fee2e2"
              />
            }
            onAction={() => {
              const params = new URLSearchParams(apiParams);
              params.set("page", "1");
              params.set("tab", "Cancelled");
              navigate(`/all_task?${params.toString()}`);
            }}
          />
        </Grid>
      </Grid>

      {/* Rest of your dashboard (unchanged) */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <TaskStatusList
            title="Task Status"
            items={demo}
            activeTab="all"
            onTabChange={(t) => console.log("tab:", t)}
            onSelect={(row) => console.log("select:", row)}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <ActivityFeedCard
            items={feed}
            height={320}
            onSeeAll={() => console.log("See all")}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <TeamLeaderboard />
        </Grid>
        <Grid xs={12} md={4}>
          <ProjectsWorkedCard />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={12}>
          <TasksByAgingBar
            title="Tasks by Resolution Time"
            statsByBucket={{
              0: { completed: 12, pending: 3, cancelled: 1 },
              1: { completed: 9, pending: 2, cancelled: 0 },
              2: { completed: 6, pending: 4, cancelled: 1 },
              3: { completed: 5, pending: 3, cancelled: 0 },
              7: { completed: 3, pending: 7, cancelled: 1 },
              14: { completed: 1, pending: 3, cancelled: 0 },
              30: { completed: 0, pending: 2, cancelled: 0 },
            }}
            defaultMaxDays={7}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
