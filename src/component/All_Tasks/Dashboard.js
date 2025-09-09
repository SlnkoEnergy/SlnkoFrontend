// AllTaskDashboard.jsx
import { Box, Grid } from "@mui/joy";
import CloudStatCard from "./TaskDashboardCards";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import TaskStatusList from "./TaskListCard";
import ActivityFeedCard from "./ActivityCard";

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

const demo = [
  {
    id: 1,
    title: "Brand Strategy",
    status: "feedback",
    time: "00:25:15",
    assignee: { name: "Alex", avatar: "https://i.pravatar.cc/40?img=3" },
  },
  {
    id: 2,
    title: "Logo Design",
    status: "feedback",
    time: "00:08:15",
    assignee: { name: "Mira", avatar: "https://i.pravatar.cc/40?img=5" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
  {
    id: 3,
    title: "Filllo Design System",
    status: "paused",
    time: "02:23:45",
    assignee: { name: "Ken", avatar: "https://i.pravatar.cc/40?img=8" },
  },
];

const feed = [
  {
    id: 1,
    name: "Marvel Park",
    avatar: "https://i.pravatar.cc/40?img=12",
    action: "update progress on",
    project: "Baros Teams",
    ago: "10 mins ago",
  },
  {
    id: 2,
    name: "Christina",
    avatar: "https://i.pravatar.cc/40?img=16",
    action: "update progress on",
    project: "Rexxo Teams",
    ago: "11 mins ago",
  },
  {
    id: 3,
    name: "Regina Lee",
    avatar: "https://i.pravatar.cc/40?img=5",
    action: "update progress on",
    project: "Arrow Teams",
    ago: "12 mins ago",
  },
  {
    id: 4,
    name: "Jhonny",
    avatar: "https://i.pravatar.cc/40?img=22",
    action: "update progress on",
    project: "Baros Teams",
    ago: "16 mins ago",
  },
];
export default function AllTaskDashboard() {
  // In real app you’ll fetch these counts from API
  const counts = {
    active: 72,
    review: 21,
    completed: 51,
    cancelled: 3,
  };

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
            value={counts.active}
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
            onAction={() => console.log("Active tasks clicked")}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            value={counts.completed}
            title="Completed Task"
            subtitle="Task that is completed"
            accent="#9aa7ff"
            illustration={
              <IconBadge
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                color="#16a34a"
                bg="#ecfdf5"
              />
            }
            onAction={() => console.log("Completed tasks clicked")}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            value={counts.completed}
            title="Completed Task"
            subtitle="Task that is completed"
            accent="#9aa7ff"
            illustration={
              <IconBadge
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                color="#16a34a"
                bg="#ecfdf5"
              />
            }
            onAction={() => console.log("Completed tasks clicked")}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            value={counts.cancelled}
            title="Cancelled"
            subtitle="Task that is cancelled"
            accent="#fca5a5"
            illustration={
              <IconBadge
                icon={<CancelRoundedIcon fontSize="small" />}
                color="#b91c1c"
                bg="#fee2e2"
              />
            }
            onAction={() => console.log("Cancelled tasks clicked")}
          />
        </Grid>
      </Grid>

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
            onSeeAll={() => console.log("See all clicked")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
