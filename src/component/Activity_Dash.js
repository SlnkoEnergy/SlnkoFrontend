// pages/DashboardProjectView.jsx
import * as React from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Chip,
    LinearProgress,
    Button,
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
import InfoOutlined from "@mui/icons-material/InfoOutlined";

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
        name: "rajasthan is the biest place ",
        site_address: "F-62 shyam vihar vatika road sanganer jaipur",
        number: "78877878787",
    },
    acitvities: [
        {
            activity_name: "Pile Marking",
            actualfinsh: "8 Nov",
            assigned_user: [
                {
                    _id: "u1-u2",
                    user_name: "Emily White",
                }
            ],
            dpr_logs: [
                {
                    today_progress: "12",
                    date: "1 NOv",
                    remarks: "work in progress",
                    status: "In Progress",
                },
                {
                    today_progress: "14",
                    date: "3 NOv",
                    remarks: "work in progress 1",
                    status: "In Progress",
                },
                {
                    today_progress: "51",
                    date: "5 Nov",
                    remarks: "work",
                    status: "In Progress",
                }
            ]
        },
        {
            activity_name: "Module",
            actualfinsh: "6 Nov",
            assigned_user: [
                {
                    user_name: "John Chen",
                    _id: "u2-u2",
                }
            ],
            dpr_logs: [
                {
                    today_progress: "1",
                    date: "1 NOv",
                    remarks: "work in progress",
                    status: "In Progress",
                },
                {
                    today_progress: "14",
                    date: "3 NOv",
                    remarks: "work in progress 1",
                    status: "In Progress",
                },
                {
                    today_progress: "45",
                    date: "5 Nov",
                    remarks: "work",
                    status: "In Progress",
                }
            ]
        },
        {
            activity_name: "Module",
            actualfinsh: null,
            planed_finish: "4 NOv",

            assigned_user: [
                {
                    user_name: "John Chen",
                    _id: "u2-u2",
                }
            ],
            dpr_logs: [
                {
                    today_progress: "1",
                    date: "1 NOv",
                    remarks: "work in progress",
                    status: "In Progress",
                },
                {
                    today_progress: "14",
                    date: "3 NOv",
                    remarks: "work in progress 1",
                    status: "In Progress",
                },
                {
                    today_progress: "45",
                    date: "5 Nov",
                    remarks: "work",
                    status: "In Progress",
                }
            ]
        }
    ]
};

/* ------------------- mock data ------------------- */
const PROJECT = {
    code: "PCH-458-A",
    name: "Project: New City Hall Construction",
    customer: "Mr. John Doe",
    address: "123 Main St, Anytown",
    status: "On Track", // On Track / At Risk / Delayed
};

const KPI = {
    workDonePct: 72,
    activitiesAtRisk: 2,
    engineerCapacityAvg: 85,
};

const ENGINEERS = [
    {
        id: "e1",
        name: "John Chen",
        avatar: "",
        assigned: 5,
        completed: 2,
        progressPct: 100,
        status: "ok", // ok | warn | bad
    },
    {
        id: "e2",
        name: "Emily White",
        avatar: "",
        assigned: 4,
        completed: 1,
        progressPct: 40,
        status: "warn",
    },
    {
        id: "e3",
        name: "David Kim",
        avatar: "",
        assigned: 3,
        completed: 0,
        progressPct: 15,
        status: "bad",
    },
    {
        id: "e3",
        name: "David Kim",
        avatar: "",
        assigned: 3,
        completed: 0,
        progressPct: 15,
        status: "bad",
    },
    {
        id: "e3",
        name: "David Kim",
        avatar: "",
        assigned: 3,
        completed: 0,
        progressPct: 15,
        status: "bad",
    },
    {
        id: "e3",
        name: "David Kim",
        avatar: "",
        assigned: 3,
        completed: 0,
        progressPct: 15,
        status: "bad",
    },
    {
        id: "e3",
        name: "David Kim",
        avatar: "",
        assigned: 3,
        completed: 0,
        progressPct: 15,
        status: "bad",
    },
];

const ACTIVITIES = [
    {
        id: "a1",
        name: "Foundation Pour",
        assignee: "John Chen",
        deadlineChip: { text: "NOV 05", variant: "soft", color: "warning" },
        workPct: 100,
        lastUpdate: "2h ago",
        priority: "normal",
    },
    {
        id: "a2",
        name: "Electrical Rough-in",
        assignee: "Emily White",
        deadlineChip: { text: "NOV 05", variant: "soft", color: "warning" },
        workPct: 40,
        lastUpdate: "—",
        priority: "normal",
    },
    {
        id: "a3",
        name: "HVAC Installation",
        assignee: "David Kim",
        deadlineChip: { text: "OCT 28", variant: "soft", color: "danger" },
        workPct: 0,
        lastUpdate: "3d ago",
        priority: "overdue",
    },
];

/* ------------------- small pieces ------------------- */
function KPIBox({ color, icon, title, value, subtitle }) {
    const Icon = icon;
    return (
        <Card sx={{ ...cardSx, minHeight: 100, bgcolor: `${color}.softBg`, padding: 2 }}>
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
                <Typography level="title-sm" sx={{ color: `${color}.softColor`, fontWeight: '500' }}>
                    {title}
                </Typography>
            </Box>
            <Typography level="h2" sx={{ lineHeight: 1, fontSize: '1.5rem' }}>
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


function StatusPill({ status }) {
    if (status === "On Track")
        return <Chip size="sm" variant="soft" color="success">On Track</Chip>;
    if (status === "At Risk")
        return <Chip size="sm" variant="soft" color="warning">At Risk</Chip>;
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
        </Card >
    );
}

/* ------------------- main component ------------------- */
export default function Activity_Dash() {
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
                        value={formatPct(KPI.workDonePct)}
                        subtitle="Total progress"
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <KPIBox
                        color="warning"
                        icon={AccessTime}
                        title="Activities Past Deadline"
                        value={`${KPI.activitiesAtRisk} (At Risk)`}
                        subtitle="Requires attention"
                    />
                </Grid>
                <Grid xs={12} md={4}>
                    <KPIBox
                        color="primary"
                        icon={TrendingUp}
                        title="Engineer Capacity"
                        value={`Avg. ${formatPct(KPI.engineerCapacityAvg)}`}
                        subtitle="Active load factor"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} mt={0.5}>
                {/* Project Details */}
                <Grid xs={12} md={8}>
                    <Card sx={{ ...cardSx, minHeight: "500px" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography level="title-lg">Project Details</Typography>
                            <StatusPill status={PROJECT.status} />
                        </Box>

                        <Typography level="h4" mt={1}>
                            {PROJECT.name}
                        </Typography>

                        <Box mt={1.5} display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1}>
                            <Typography level="body-sm">
                                <strong>Project Code:</strong> {PROJECT.code}
                            </Typography>
                            <Typography level="body-sm">
                                <strong>Customer Name:</strong> {PROJECT.customer}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <LocationOn fontSize="sm" />
                                <Typography level="body-sm">{PROJECT.address}</Typography>
                            </Box>
                        </Box>

                        <Box mt={2} display="flex" gap={1}>
                            <Button size="sm" variant="soft" startDecorator={<InfoOutlined />}>
                                Customer Details
                            </Button>
                            <Button size="sm" variant="plain">Notes</Button>
                        </Box>
                    </Card>
                </Grid>

                {/* Assigned Engineers */}
                <Grid xs={12} md={4}>
                    <Card sx={{ ...cardSx, overflow: "auto", maxHeight: "500px" }}>
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
                    <Typography level="title-lg">Activity Tracking</Typography>
                    <IconButton variant="plain" size="sm">
                        <MoreHoriz />
                    </IconButton>
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
                            {ACTIVITIES.map((a) => {
                                const pct = Math.round(a.workPct || 0);
                                const overdue = a.priority === "overdue";
                                return (
                                    <tr key={a.id}>
                                        <td>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Person fontSize="sm" />
                                                <Typography level="body-sm">{a.name}</Typography>
                                            </Box>
                                        </td>
                                        <td>
                                            <Typography level="body-sm">{a.assignee}</Typography>
                                        </td>
                                        <td>
                                            <Chip
                                                size="sm"
                                                variant={a.deadlineChip.variant}
                                                color={a.deadlineChip.color}
                                                sx={{ fontWeight: 700 }}
                                            >
                                                {a.deadlineChip.text}
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
                                            <Typography
                                                level="body-sm"
                                                sx={{ color: overdue ? "danger.solidBg" : "text.primary" }}
                                            >
                                                {a.lastUpdate}
                                            </Typography>
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
