import { Box, Grid } from "@mui/joy";
import CloudStatCard from "../../component/All_Tasks/TaskDashboardCards";
import { useGetProjectsByStateQuery, useGetTaskStatsQuery, useGetUserPerformanceQuery } from "../../redux/globalTaskSlice";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import TeamLeaderboard from "../../component/All_Tasks/TeamLeaderboard";
import { useMemo } from "react";
import ProjectsWorkedCard from "../../component/All_Tasks/Charts/ProjectsDonut";
import { useGetProjectStatusFilterQuery } from "../../redux/projectsSlice";


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

function Dash_project() {

    const { data, isLoading, isFetching } = useGetProjectStatusFilterQuery();

    const stats = data?.data || {
        "completed": 0,
        "cancelled": 0,
        "to be started" : 0,
        "delayed" : 0,
        "pending" : 0,
    }

    const {
        data: projectData,
        isLoading: perfLoading,
        isFetching: perfFetching,
    } = useGetUserPerformanceQuery();

    const ProjectDetailColumns = [
        {key: "code", label: "Project Code"},
        { key: "name", label: "Project Name"},
        {key: "current_acitivity", label: "Current Activity"},
        {key: "next_activity", label: "Upcoming Acitivity"},
        {key: "current_acitivity_completion_date", label: "Current Activity Completion Date"},
        {key: "project_state", label: "Project State"}
    ]

    const projectDetailRows = useMemo(() => {
        if (!projectData) return [];

        return [
            {
                id: projectData.code,
                name: projectData.name,
                current_activity: projectData.current_activity,
                upcoming_activity: projectData.upcoming_activity,
                completion_date: projectData.completion_date,
                project_state: projectData.project_state,
            }
        ];
    }, [projectData])

    const {
        data: stateRes,
        isLoading: pbsLoading,
        isFetching: pbsFetching,
      } = useGetProjectsByStateQuery();

      const donutData = useMemo(() =>{
        
        const dist = stateRes?.district || [];
        return dist.map((d, i) =>({
            name: d.state,
        }))
      }, [stateRes])


    return (
        <Box
            sx={{
                ml: { xs: 0, lg: "var(--Sidebar-width)" },
                width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
                bgcolor: "background.body",
            }}
        >
            <Grid container spacing={2} columns={15}>
                <Grid xs={15} md={3}>
                    <CloudStatCard
                        loading={isLoading || isFetching}
                        value={stats.pending ?? 0}
                        title="Pending Projects"
                        subtitle="Projects Pending to Start"
                        accent="#f59e0b"
                        illustration={
                            <IconBadge
                                icon={<PendingActionsRoundedIcon fontSize="small" />}
                                color="#b45309"
                                bg="#fffbeb"
                            />
                        }
                    // onAction={() => {
                    //     const params = new URLSearchParams(apiParams);
                    //     params.set("page", "1");
                    //     params.set("tab", "Pending");
                    //     navigate(`/all_task?${params.toString()}`);
                    // }}
                    />
                </Grid>

                <Grid xs={15} md={3}>
                    <CloudStatCard
                        loading={isLoading || isFetching}
                        value={stats["to be started"] ?? 0}
                        title="In Progress Projects"
                        subtitle="Projects that is still ongoing"
                        accent="#60a5fa"
                        illustration={
                            <IconBadge
                                icon={<PlayCircleFilledRoundedIcon fontSize="small" />}
                                color="#1d4ed8" // blue-700
                                bg="#dbeafe" // blue-100
                            />
                        }
                    // onAction={() => {
                    //     const params = new URLSearchParams(apiParams);
                    //     params.set("page", "1");
                    //     params.set("tab", "In Progress");
                    //     navigate(`/all_task?${params.toString()}`);
                    // }}
                    />
                </Grid>

                <Grid xs={15} md={3}>
                    <CloudStatCard
                        loading={isLoading || isFetching}
                        value={stats.completed ?? 0}
                        title="Completed Projects"
                        subtitle="Projects finished"
                        accent="#86efac"
                        illustration={
                            <IconBadge
                                icon={<TaskAltRoundedIcon fontSize="small" />}
                                color="#15803d" // emerald-700
                                bg="#ecfdf5" // emerald-50
                            />
                        }
                    // onAction={() => {
                    //     const params = new URLSearchParams(apiParams);
                    //     params.set("page", "1");
                    //     params.set("tab", "Completed");
                    //     navigate(`/all_task?${params.toString()}`);
                    // }}
                    />
                </Grid>

                <Grid xs={15} md={3}>
                    <CloudStatCard
                        loading={isLoading || isFetching}
                        value={stats.cancelled ?? 0}
                        title="Cancelled Projects"
                        subtitle="Tasks cancelled"
                        accent="#fca5a5"
                        illustration={
                            <IconBadge
                                icon={<DoNotDisturbOnRoundedIcon fontSize="small" />}
                                color="#b91c1c" // red-700
                                bg="#fee2e2" // red-100
                            />
                        }
                    // onAction={() => {
                    //     const params = new URLSearchParams(apiParams);
                    //     params.set("page", "1");
                    //     params.set("tab", "Cancelled");
                    //     navigate(`/all_task?${params.toString()}`);
                    // }}
                    />
                </Grid>
                <Grid xs={15} md={3}>
                    <CloudStatCard
                        loading={isLoading || isFetching}
                        value={stats.delayed ?? 0}
                        title="Delayed Projects"
                        subtitle="Project Delayed"
                        accent="#fca5a5"
                        illustration={
                            <IconBadge
                                icon={<DoNotDisturbOnRoundedIcon fontSize="small" />}
                                color="#b91c1c" // red-700
                                bg="#fee2e2" // red-100
                            />
                        }
                    // onAction={() => {
                    //     const params = new URLSearchParams(apiParams);
                    //     params.set("page", "1");
                    //     params.set("tab", "Cancelled");
                    //     navigate(`/all_task?${params.toString()}`);
                    // }}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid xs={12} md={8}>
                    <TeamLeaderboard
                        rows={
                            perfLoading || perfFetching
                                ? []
                                : projectDetailRows.map((u) => ({
                                    id: projectDetailRows.code,
                                    name: projectDetailRows.name,
                                    current_activity: projectDetailRows.current_activity,
                                    upcoming_activity: projectDetailRows.upcoming_activity,
                                    completion_date: projectDetailRows.completion_date,
                                    project_state: projectDetailRows.project_state,
                                }))
                        }
                        title="Project Detail Dashboard"
                        columns={ProjectDetailColumns}
                    // searchValue={userSearch}
                    // onSearchChange={setUserSearch}
                    />
                </Grid>

                <Grid xs={12} md={4}>
                    <ProjectsWorkedCard
                        title="Projects worked"
                        data={pbsLoading || pbsFetching ? [] : donutData}
                        total={stateRes?.totalProjects ?? 0}
                        totalLabel="Projects"
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Dash_project;