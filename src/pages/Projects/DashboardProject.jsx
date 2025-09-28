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
import { useGetProjectDetailQuery, useGetProjectStatesFilterQuery, useGetProjectStatusFilterQuery } from "../../redux/projectsSlice";


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
    "#f59e0b", // amber
    "#22c55e", // green
    "#ef4444", // red
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#14b8a6", // teal
    "#e11d48", // rose
    "#84cc16", // lime
    "#f97316", // orange
    "#06b6d4", // cyan

    "#d946ef", // fuchsia
    "#0ea5e9", // sky
    "#65a30d", // olive green
    "#dc2626", // deep red
    "#7c3aed", // purple
    "#10b981", // emerald
    "#ca8a04", // yellow dark
    "#2563eb", // indigo
    "#f43f5e", // pinkish red
    "#0891b2", // teal dark

    "#a16207", // mustard
    "#15803d", // forest green
    "#4f46e5", // indigo dark
    "#ea580c", // burnt orange
    "#db2777", // magenta
    "#047857", // green deep
    "#1d4ed8", // royal blue
    "#9333ea", // deep violet
    "#b91c1c", // dark red
    "#0d9488", // aqua teal
];


function Dash_project() {

    const { data, isLoading, isFetching } = useGetProjectStatusFilterQuery();

    const stats = data?.data || {
        "completed": 0,
        "cancelled": 0,
        "to be started": 0,
        "delayed": 0,
        "pending": 0,
    }

    const {
        data: projectData,
        isLoading: perfLoading,
        isFetching: perfFetching,
    } = useGetProjectDetailQuery();

    const fmtDate = (d) => {
        if (!d) return "-";
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "-";
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    console.log(projectData);

    const ProjectDetailColumns = [
        { key: "code", label: "Project Code" },
        { key: "name", label: "Project Name" },
        { key: "current_activity", label: "Current Activity" },
        { key: "upcoming_activity", label: "Upcoming Activity" },
        { key: "completion_date", label: "Current Activity Completion Date" },
        { key: "project_state", label: "Project State" },
    ];


    const projectDetailRows = useMemo(() => {
        const list = projectData?.data ?? []; // ← your array of 48
        return list.map((p) => {
            const acts = Array.isArray(p.activities) ? p.activities : [];
            console.log(acts);
            // Heuristic:
            // - current = first activity that isn't completed (or missing actual_end_date)
            // - fallback to last activity if all completed or no obvious current
            const current =
                acts.find(
                    (a) =>
                        a?.current_status === "in_progress" ||
                        a?.status === "in_progress" ||
                        !a?.actual_end_date
                ) || acts[acts.length - 1] || null;

            let upcoming = [];
            acts.map((activity) => {

            })

            // upcoming = a declared successor of current if present, else the first not-started activity
            // let upcoming = null;

            if (current?.successors?.length) {
                // sometimes successors are just IDs; sometimes objects—handle both
                const s = current.successors[0];
                upcoming =
                    typeof s === "object" && s !== null
                        ? s
                        : acts.find((a) => a?.activity_id === s) || null;
            }
            if (!upcoming) {
                upcoming =
                    acts.find((a) => !a?.actual_start_date && a?.activity_id !== current?.activity_id) ||
                    null;
            }

            const completion_date = current?.actual_end_date
                ? fmtDate(current.actual_end_date)
                : "-";
            console.log(p.project_code)
            return {
                id: p._id, // stable unique id for the row
                code: p.project_code ?? "NA",
                name: p.project_name ?? "-",
                current_activity: current?.activity_name ?? "-",
                upcoming_activity: upcoming?.activity_name ?? "-",
                completion_date,
                project_state: p.state ?? "-",
            };
        });
    }, [projectData]);


    const {
        data: stateRes,
        isLoading: pbsLoading,
        isFetching: pbsFetching,
    } = useGetProjectStatesFilterQuery();

    const donutData = useMemo(() => {

        const dist = stateRes?.data || [];
        return dist.map((d, i) => ({
            name: d._id,
            value: Number(((d.count / stateRes?.total) * 100).toFixed(2)),
            color: DONUT_COLORS[i % DONUT_COLORS.length],
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
                        rows={perfLoading || perfFetching ? [] : projectDetailRows}
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
                        total={stateRes?.total ?? 0}
                        totalLabel="Projects"
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default Dash_project;