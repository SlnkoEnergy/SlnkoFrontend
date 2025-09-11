// src/components/Dashboard/AllTaskDashboard.jsx
import * as React from "react";
import { Box, Grid } from "@mui/joy";
import CloudStatCard from "./TaskDashboardCards";
import TaskStatusList from "./TaskListCard";
import ActivityFeedCard from "./ActivityCard";
import ProjectsWorkedCard from "./Charts/ProjectsDonut";
import TeamLeaderboard from "./TeamLeaderboard";
import TasksByAgingBar from "./Charts/BarChart";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import { useTaskFilters } from "../../store/Context/TaskFilterContext";
import {
  useGetTaskStatsQuery,
  useGetMyTasksQuery,
  useGetActivityFeedQuery,
  useGetUserPerformanceQuery,
  useGetProjectsByStateQuery,
  useGetTasksAgingByResolutionQuery,
} from "../../redux/globalTaskSlice";
import { useNavigate } from "react-router-dom";

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
      boxShadow: "0 1px 0 rgba(0,0,0,0.04) inset, 0 6px 14px rgba(2,6,23,0.06)",
      border: "1px solid rgba(2,6,23,0.06)",
    }}
  >
    {icon}
  </div>
);

const DONUT_COLORS = [
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#e11d48",
  "#84cc16",
  "#f97316",
  "#06b6d4",
];

export default function AllTaskDashboard() {
  const { apiParams } = useTaskFilters();
  const navigate = useNavigate();

  /* ---- top stats ---- */
  const { data, isLoading, isFetching } = useGetTaskStatsQuery(apiParams);
  const stats = data?.data || {
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  /* ---- my tasks ---- */
 
  const {
    data: myTasksRes,
    isLoading: myLoading,
    isFetching: myFetching,
  } = useGetMyTasksQuery(apiParams);

  const myTaskItems = (myTasksRes?.data || []).map((t) => ({
    id: t.id ?? t._id,
    title: t.title,
    time: t.time,
    status: t?.current_status?.status || "—",
    assigned_to: t?.assigned_to || [],
    createdBy: { name: t.created_by || "" },
    selected: false,
  }));

  /* ---- activity feed ---- */
  const {
    data: feedRes,
    isLoading: feedLoading,
    isFetching: feedFetching,
  } = useGetActivityFeedQuery();
  const feedItems = Array.isArray(feedRes?.data) ? feedRes.data : [];

  /* ---- leaderboard ---- */
  const [userSearch, setUserSearch] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState(userSearch);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const {
    data: perfRes,
    isLoading: perfLoading,
    isFetching: perfFetching,
  } = useGetUserPerformanceQuery({
    q: debouncedQ,
    from: apiParams?.from ?? "",
    to: apiParams?.to ?? "",
    departments: apiParams?.departments ?? "",
    deadlineFrom: apiParams?.deadlineFrom ?? "",
    deadlineTo: apiParams?.deadlineTo ?? "",
    includeSubtasks: true,
  });

  const leaderboardRows = React.useMemo(() => {
    if (!perfRes) return [];
    if (perfRes.mode === "single" && perfRes.user) {
      const u = perfRes.user,
        s = perfRes.stats || {};
      return [
        {
          id: u._id,
          name: u.name,
          avatar: u.avatar,
          assigned: s.assigned ?? 0,
          completed: s.completed ?? 0,
          delayed: s.delayed ?? 0,
        },
      ];
    }
    return (perfRes.users || []).map((u) => ({
      id: u._id,
      name: u.name,
      avatar: u.avatar,
      assigned: u.stats?.assigned ?? 0,
      completed: u.stats?.completed ?? 0,
      delayed: u.stats?.delayed ?? 0,
    }));
  }, [perfRes]);

  /* ---- projects by state (donut) ---- */
  const {
    data: pbsRes,
    isLoading: pbsLoading,
    isFetching: pbsFetching,
  } = useGetProjectsByStateQuery({
    from: apiParams?.from ?? "",
    to: apiParams?.to ?? "",
    deadlineFrom: apiParams?.deadlineFrom ?? "",
    deadlineTo: apiParams?.deadlineTo ?? "",
    departments: apiParams?.departments ?? "",
  });

  const donutData = React.useMemo(() => {
    const dist = pbsRes?.distribution || [];
    return dist.map((d, i) => ({
      name: d.state,
      value: d.pct,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [pbsRes]);

  const [agingMax, setAgingMax] = React.useState(7);
  const { data: agingRes } = useGetTasksAgingByResolutionQuery({
    from: apiParams?.from ?? "",
    to: apiParams?.to ?? "",
    deadlineFrom: apiParams?.deadlineFrom ?? "",
    deadlineTo: apiParams?.deadlineTo ?? "",
    departments: apiParams?.departments ?? "",
    uptoDays: agingMax,
  });

  console.log({apiParams})

  const agingStats = agingRes?.statsByBucket ?? {
    0: { completed: 0, pending: 0, cancelled: 0 },
    1: { completed: 0, pending: 0, cancelled: 0 },
    2: { completed: 0, pending: 0, cancelled: 0 },
    3: { completed: 0, pending: 0, cancelled: 0 },
    7: { completed: 0, pending: 0, cancelled: 0 },
    14: { completed: 0, pending: 0, cancelled: 0 },
    30: { completed: 0, pending: 0, cancelled: 0 },
  };

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* top cards */}
      <Grid container spacing={2}>
        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.pending ?? 0}
            title="Pending Task"
            subtitle="Tasks waiting to start"
            accent="#f59e0b"
            illustration={
              <IconBadge
                icon={<PendingActionsRoundedIcon fontSize="small" />}
                color="#b45309"
                bg="#fffbeb"
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
            value={stats.active ?? 0}
            title="In Progress Task"
            subtitle="Task that is still ongoing"
            accent="#60a5fa"
            illustration={
              <IconBadge
                icon={<PlayCircleFilledRoundedIcon fontSize="small" />}
                color="#1d4ed8" // blue-700
                bg="#dbeafe" // blue-100
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
            value={stats.completed ?? 0}
            title="Completed Task"
            subtitle="Tasks finished"
            accent="#86efac"
            illustration={
              <IconBadge
                icon={<TaskAltRoundedIcon fontSize="small" />}
                color="#15803d" // emerald-700
                bg="#ecfdf5" // emerald-50
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
                icon={<DoNotDisturbOnRoundedIcon fontSize="small" />}
                color="#b91c1c" // red-700
                bg="#fee2e2" // red-100
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

      {/* lists + feed */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <TaskStatusList
            title="Today Task Creation"
            items={myLoading || myFetching ? [] : myTaskItems}
            activeTab="mine"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <ActivityFeedCard
            items={feedLoading || feedFetching ? [] : feedItems}
            height={320}
            onSeeAll={() => {}}
          />
        </Grid>
      </Grid>

      {/* leaderboard + donut */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <TeamLeaderboard
            rows={
              perfLoading || perfFetching
                ? []
                : leaderboardRows.map((u) => ({
                    name: u.name,
                    avatar: u.avatar,
                    assigned: u.assigned,
                    completed: u.completed,
                    delayed: u.delayed,
                  }))
            }
            title="Team Leaderboard"
            searchValue={userSearch}
            onSearchChange={setUserSearch}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <ProjectsWorkedCard
            title="Projects worked"
            data={pbsLoading || pbsFetching ? [] : donutData}
            total={pbsRes?.totalProjects ?? 0}
            totalLabel="Projects"
          />
        </Grid>
      </Grid>

      {/* aging by resolution (live) */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={12}>
          <TasksByAgingBar
            title="Tasks by Resolution Time (Team)"
            statsByBucket={agingStats}
            defaultMaxDays={agingMax}
            onMaxDaysChange={setAgingMax}
            key={agingMax}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
