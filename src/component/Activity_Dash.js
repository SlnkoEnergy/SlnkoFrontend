// pages/DashboardProjectView.jsx
import * as React from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Chip,
    LinearProgress,
    IconButton,
    Divider,
    Avatar,
    Table,
    Sheet,
    Tooltip,
} from "@mui/joy";
import CheckCircle from "@mui/icons-material/CheckCircle";
import WarningAmber from "@mui/icons-material/WarningAmber";
import AccessTime from "@mui/icons-material/AccessTime";
import TrendingUp from "@mui/icons-material/TrendingUp";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import DoneAll from "@mui/icons-material/DoneAll";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Person from "@mui/icons-material/Person";
import LocationOn from "@mui/icons-material/LocationOn";
import ActivityFinishLineChart from "./ActivityFinishLineChart";

/* ------------------- theme helpers ------------------- */
const cardSx = {
    p: 2,
    borderRadius: "lg",
    boxShadow: "sm",
    bgcolor: "background.surface",
};

const bandColor = (pct) => {
    if (pct <= 25) return "danger";
    if (pct <= 50) return "primary";
    if (pct <= 75) return "warning";
    if (pct < 100) return "success";
    return "success";
};

const formatPct = (v) => `${Math.round(Number(v || 0))}%`;

const data = {
    project_detail: {
        code: "RJK-Ck-45454",
        name: "rajasthan is the best place ",
        site_address: "F-62 shyam vihar vatika road sanganer jaipur",
        number: "78877878787",
        status: "On going",
        customer: "suraj yadav",
    },
    acitvities: [
        {
            activity_name: "Pile Marking",
            actualfinsh: "8 Nov",
            current_status: "not started",
            assigned_user: [{ _id: "u1-u2", user_name: "Emily White" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "51", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
        {
            activity_name: "Module",
            actualfinsh: "6 Nov",
            current_status: "in progress",
            assigned_user: [{ user_name: "John Chen", _id: "u2-u2" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "45", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
        {
            activity_name: "Module",
            actualfinsh: null,
            current_status: "completed",
            planed_finish: "4 NOv",
            assigned_user: [{ user_name: "John Chen", _id: "u2-u2" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "45", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
        {
            activity_name: "Pile Marking",
            actualfinsh: "8 Nov",
            current_status: "not started",
            assigned_user: [{ _id: "u1-u2", user_name: "Emily White" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "51", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
        {
            activity_name: "Module",
            actualfinsh: null,
            current_status: "completed",
            planed_finish: "4 NOv",
            assigned_user: [{ user_name: "John Chen", _id: "u2-u2" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "45", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
        {
            activity_name: "Module",
            actualfinsh: null,
            current_status: "completed",
            planed_finish: "4 NOv",
            assigned_user: [{ user_name: "John Chen", _id: "u2-u2" }],
            dpr_logs: [
                { today_progress: "1", date: "1 NOv", remarks: "work in progress", status: "In Progress" },
                { today_progress: "14", date: "3 NOv", remarks: "work in progress 1", status: "In Progress" },
                { today_progress: "45", date: "5 Nov", remarks: "work", status: "In Progress" },
            ],
            work_completion: { unit: "M", value: "100", deadline: "8 Nov" },
        },
    ],
};

const KPI = { engineerCapacityAvg: 85 };

/* ------------------- small pieces ------------------- */
function KPIBox({ color, icon, title, value, subtitle, onClick }) {
    const Icon = icon;
    const clickable = typeof onClick === "function";
    return (
        <Card
            onClick={onClick}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(e) => {
                if (clickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick();
                }
            }}
            sx={{
                ...cardSx,
                minHeight: 100,
                bgcolor: `${color}.softBg`,
                padding: 2,
                cursor: clickable ? "pointer" : "default",
                transition: "box-shadow .15s ease, transform .05s ease",
                "&:hover": clickable ? { boxShadow: "md" } : undefined,
                "&:active": clickable ? { transform: "scale(0.995)" } : undefined,
            }}
        >
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: "md",
                        bgcolor: `${color}.softColor`,
                        color: `${color}.solidBg`,
                    }}
                >
                    <Icon />
                </Box>
                <Typography level="title-sm" sx={{ color: `${color}.softColor`, fontWeight: 500 }}>
                    {title}
                </Typography>
            </Box>
            <Typography level="h2" sx={{ lineHeight: 1, fontSize: "1.5rem" }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                    {subtitle}
                </Typography>
            )}
        </Card>
    );
}

function CalculateWork(activities = []) {
    let actualDone = 0;
    let totalQty = 0;

    activities.forEach((act) => {
        act.dpr_logs.forEach((dpr) => {
            actualDone += Number(dpr.today_progress || 0);
        });
        totalQty += Number(act.work_completion?.value || 0);
    });

    if (totalQty === 0) return 0;
    return (actualDone / totalQty) * 100;
}

function calcActivityPercent(act) {
    const actual = act.dpr_logs.reduce((a, b) => a + Number(b.today_progress || 0), 0);
    const total = Number(act.work_completion?.value || 0);
    if (!total) return 0;
    return (actual / total) * 100;
}

function CalculateAtRisk(activities = []) {
    let count = 0;
    const today = new Date();

    activities.forEach((act) => {
        const deadline = new Date(act.work_completion?.deadline);
        if (deadline < today) count++;
    });

    return count;
}

function CalculateNotStarted(activities = []) {
    let count = 0;
    activities.forEach((act) => {
        count += act.current_status === "not started" ? 1 : 0;
    })

    return count;
}

function StatusPill({ status }) {
    if (status === "On going") return <Chip size="sm" variant="soft" color="success">In Progress</Chip>;
    if (status === "At Risk") return <Chip size="sm" variant="soft" color="warning">At Risk</Chip>;
    return <Chip size="sm" variant="soft" color="danger">Delayed</Chip>;
}

function EngineerRow({ e }) {
    const statusIcon =
        e.status === "ok" ? (
            <CheckCircle color="success" />
        ) : e.status === "warn" ? (
            <WarningAmber color="warning" />
        ) : (
            <ErrorOutline color="danger" />
        );

    const pct = Math.round(e.progressPct || 0);

    return (
        <Card sx={{ ...cardSx, mb: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar>{e.name?.[0]}</Avatar>
                <Box flex={1}>
                    <Typography level="title-sm">{e.name}</Typography>
                    <Typography level="body-xs" color="neutral">
                        {e.assigned} Assigned / {e.completed} Completed
                    </Typography>
                    <Box mt={1} pr={5} position="relative">
                        <LinearProgress
                            determinate
                            value={pct}
                            color={bandColor(pct)}
                            sx={{
                                "--LinearProgress-thickness": "8px",
                                "--LinearProgress-radius": "999px",
                                borderRadius: 999,
                                height: 8,
                            }}
                        />
                        <Typography
                            level="body-xs"
                            sx={{
                                position: "absolute",
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                fontWeight: 600,
                            }}
                        >
                            {formatPct(pct)}
                        </Typography>
                    </Box>
                </Box>
                {statusIcon}
            </Box>
        </Card>
    );
}

function prepareEngineers(activities = []) {
    const map = {};

    activities.forEach((act) => {
        act.assigned_user.forEach((u) => {
            if (!map[u._id]) {
                map[u._id] = {
                    id: u._id,
                    name: u.user_name,
                    assigned: 0,
                    completed: 0,
                    totalPlanned: 0,
                    totalActual: 0,
                };
            }

            map[u._id].assigned += 1;

            let actual = act.dpr_logs.reduce((a, b) => a + Number(b.today_progress || 0), 0);
            let planned = Number(act.work_completion?.value || 0);

            map[u._id].totalActual += actual;
            map[u._id].totalPlanned += planned;

            if (actual >= planned) map[u._id].completed += 1;
        });
    });

    return Object.values(map).map((e) => ({
        ...e,
        progressPct: e.totalPlanned ? (e.totalActual / e.totalPlanned) * 100 : 0,
        status: e.progressPct >= 90 ? "ok" : e.progressPct >= 50 ? "warn" : "alert",
    }));
}

const ENGINEERS = prepareEngineers(data.acitvities);

/* ------------------- main component ------------------- */
export default function Activity_Dash() {
    // filters: "all" | "completed" | "in_progress" | "in_progress_risk"
    const [activityFilter, setActivityFilter] = React.useState("in_progress");

    const filteredActivities = React.useMemo(() => {
        const today = new Date();
        return data.acitvities.filter((a) => {
            const status = a.current_status?.toLowerCase();
            const deadline = new Date(a.work_completion.deadline);

            if (activityFilter === "completed") return status === "completed";
            if (activityFilter === "in_progress_risk") return status === "in progress" && deadline < today;
            if (activityFilter === "in_progress") return status === "in progress";
            return true; // "all"
        });
    }, [activityFilter]);

    return (
        <Box
            sx={{
                ml: { xs: 0, lg: "var(--Sidebar-width)" },
                width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
                bgcolor: "background.body",
            }}
        >
            {/* KPI Row */}
            <Grid container spacing={2} columns={12}>
                <Grid xs={12} md={4}>
                    <KPIBox
                        color="success"
                        icon={DoneAll}
                        title="Work Done (Project)"
                        value={formatPct(CalculateWork(data.acitvities))}
                        subtitle="Total progress"
                        onClick={() => setActivityFilter("completed")}
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <KPIBox
                        color="warning"
                        icon={AccessTime}
                        title="Activities Past Deadline"
                        value={`${CalculateAtRisk(data.acitvities)} (At Risk)`}
                        subtitle="Requires attention"
                        onClick={() => setActivityFilter("in_progress_risk")}
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <KPIBox
                        color="primary"
                        icon={TrendingUp}
                        title="Remain Work"
                        value={` ${CalculateNotStarted(data.acitvities)}`}
                        subtitle="Not Started Activities"
                        onClick={() => setActivityFilter("not started")}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} mt={0.5}>
                {/* Project Details */}
                <Grid xs={12} md={8}>
                    <Card sx={{ ...cardSx, minHeight: "500px" }}>


                        <Typography level="h4" mt={1}>
                            {data.project_detail.name}
                        </Typography>

                        <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1}>
                            <Typography level="body-sm">
                                <strong>Project Code:</strong> {data.project_detail.code}
                            </Typography>
                            <Typography level="body-sm">
                                <strong>Customer Name:</strong> {data.project_detail.customer}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <LocationOn fontSize="sm" />
                                <Typography level="body-sm">{data.project_detail.site_address}</Typography>
                            </Box>
                        </Box>

                        <ActivityFinishLineChart
                            apiData={data.acitvities}
                            projectId={data.project_detail.code}
                            title={data.project_detail.name}
                            height={350}
                        />
                    </Card>
                </Grid>

                {/* Assigned Engineers */}
                <Grid xs={12} md={4}>
                    <Card sx={{ ...cardSx, overflow: "auto", maxHeight: "500px", minHeight: "500px" }}>
                        <Typography level="title-lg" mb={1}>
                            Assigned Engineer
                        </Typography>
                        {ENGINEERS.map((e) => (
                            <EngineerRow key={e.id} e={e} />
                        ))}
                    </Card>
                </Grid>
            </Grid>

            {/* Activity Tracking */}
            <Card sx={{ ...cardSx, mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography level="title-lg">
                        Activity Tracking{activityFilter !== "all" ? ` — ${activityFilter.replaceAll("_", " ")}` : ""}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        {/* Quick reset */}
                        <Tooltip title="Show all">
                            <IconButton variant="plain" size="sm" onClick={() => setActivityFilter("all")}>
                                <MoreHoriz />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />

                <Sheet variant="soft" sx={{ borderRadius: "md", overflow: "hidden" }}>
                    <Table
                        variant="plain"
                        size="sm"
                        borderAxis="bothBetween"
                        stickyHeader
                        sx={{
                            "--TableCell-headBackground": "var(--joy-palette-background-level1)",
                            "--TableCell-paddingX": "12px",
                            "--TableCell-paddingY": "10px",
                            "& th": { fontWeight: 600 },
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ width: 320 }}>Activity Name</th>
                                <th>Assigned To</th>
                                <th style={{ width: 120 }}>Deadline</th>
                                <th style={{ width: 180 }}>Work Done %</th>
                                <th style={{ width: 120, textAlign: "right" }}>Last Update</th>
                                <th style={{ width: 56 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.map((a) => {
                                const pct = calcActivityPercent(a);
                                const overdue = new Date(a.work_completion.deadline) < new Date();

                                return (
                                    <tr key={a.activity_name}>
                                        <td>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Person fontSize="sm" />
                                                <Typography level="body-sm">{a.activity_name}</Typography>
                                            </Box>
                                        </td>
                                        <td>
                                            <Typography level="body-sm">{a.assigned_user[0].user_name}</Typography>
                                        </td>
                                        <td>
                                            <Chip size="sm" variant="soft" color={overdue ? "danger" : "primary"}>
                                                {a.work_completion.deadline}
                                            </Chip>
                                        </td>
                                        <td>
                                            <Box position="relative" pr={5}>
                                                <LinearProgress
                                                    determinate
                                                    value={pct}
                                                    color={bandColor(pct)}
                                                    sx={{
                                                        "--LinearProgress-thickness": "8px",
                                                        "--LinearProgress-radius": "999px",
                                                        borderRadius: 999,
                                                        height: 8,
                                                    }}
                                                />
                                                <Typography
                                                    level="body-xs"
                                                    sx={{
                                                        position: "absolute",
                                                        right: 0,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {formatPct(pct)}
                                                </Typography>
                                            </Box>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <Typography level="body-sm">{a.dpr_logs[a.dpr_logs.length - 1].date}</Typography>
                                        </td>
                                        <td>
                                            <Tooltip title="Actions">
                                                <IconButton variant="soft" size="sm">
                                                    <MoreHoriz />
                                                </IconButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Sheet>
            </Card>
        </Box>
    );
}
