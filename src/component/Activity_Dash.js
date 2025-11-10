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
import { useParams, useSearchParams } from "react-router-dom";
import ActivityFinishLineChart from "../../src/component/ActivityFinishLineChart";
import { useGetDprStatusCardsByIdQuery } from "../../src/redux/projectsSlice";


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

/* ------------------- data normalizers ------------------- */
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const extractDeadline = (deadline) => {
  if (!deadline) return null;
  if (typeof deadline === "string") return toDate(deadline);
  if (typeof deadline === "object") {
    return toDate(deadline.to || deadline.from || null);
  }
  return null;
};

const sumProgress = (logs = []) =>
  logs.reduce((acc, l) => acc + Number(l?.todays_progress || 0), 0);

function normalizeActivities(rawActivities = []) {
  return rawActivities.map((a, idx) => {
    const deadlineDate = extractDeadline(a?.work_completion?.deadline);
    return {
      _key: a.activity_id || `row-${idx}`,
      activity_name: a.activity_id || `Activity ${idx + 1}`,
      assigned_user: [], // no owners in this payload
      current_status: (a?.current_status?.status || "").toLowerCase(),
      work_completion: {
        unit: a?.work_completion?.unit || null,
        value: Number(a?.work_completion?.value || 0),
        deadline: deadlineDate,
      },
      dpr_logs: (a?.dpr_log || []).map((l) => ({
        today_progress: l?.todays_progress ?? "0",
        date: l?.date ? new Date(l.date) : null,
        remarks: l?.remarks ?? "",
        status: l?.status ?? "",
        user: l?.user ?? null,
        _id: l?._id,
      })),
      planned_start: toDate(a?.planned_start),
      planned_finish: toDate(a?.planned_finish),
      actual_start: toDate(a?.actual_start),
      actualfinsh: toDate(a?.actual_finish),
    };
  });
}

/* ------------------- client calculations ------------------- */
function CalculateWork(activities = []) {
  let actualDone = 0;
  let totalQty = 0;
  activities.forEach((act) => {
    actualDone += sumProgress(act.dpr_logs);
    totalQty += Number(act.work_completion?.value || 0);
  });
  if (totalQty === 0) return 0;
  return (actualDone / totalQty) * 100;
}

function calcActivityPercent(act) {
  const actual = sumProgress(act.dpr_logs);
  const total = Number(act.work_completion?.value || 0);
  if (!total) return 0;
  return (actual / total) * 100;
}

function CalculateAtRisk(activities = []) {
  let count = 0;
  const today = new Date();
  activities.forEach((act) => {
    const deadline = act.work_completion?.deadline || null;
    if (deadline && deadline < today && act.current_status !== "completed")
      count++;
  });
  return count;
}

function CalculateNotStarted(activities = []) {
  let count = 0;
  activities.forEach((act) => {
    count += act.current_status === "not started" ? 1 : 0;
  });
  return count;
}

/* ------------------- engineers (optional; empty if none) ------------------- */
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
        <Avatar>{e.name?.[0] || "?"}</Avatar>
        <Box flex={1}>
          <Typography level="title-sm">{e.name || "Unassigned"}</Typography>
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
    const users = Array.isArray(act.assigned_user) ? act.assigned_user : [];
    if (users.length === 0) {
      const id = "_unassigned";
      if (!map[id]) {
        map[id] = {
          id,
          name: "Unassigned",
          assigned: 0,
          completed: 0,
          totalPlanned: 0,
          totalActual: 0,
        };
      }
      map[id].assigned += 1;
      const actual = sumProgress(act.dpr_logs);
      const planned = Number(act.work_completion?.value || 0);
      map[id].totalActual += actual;
      map[id].totalPlanned += planned;
      if (planned && actual >= planned) map[id].completed += 1;
      return;
    }

    users.forEach((u) => {
      const key = u._id || u.id || u.user_id || u.email || u.name || "unknown";
      if (!map[key]) {
        map[key] = {
          id: key,
          name: u.user_name || u.name || "Engineer",
          assigned: 0,
          completed: 0,
          totalPlanned: 0,
          totalActual: 0,
        };
      }
      map[key].assigned += 1;
      const actual = sumProgress(act.dpr_logs);
      const planned = Number(act.work_completion?.value || 0);
      map[key].totalActual += actual;
      map[key].totalPlanned += planned;
      if (planned && actual >= planned) map[key].completed += 1;
    });
  });

  return Object.values(map).map((e) => {
    const progressPct = e.totalPlanned
      ? (e.totalActual / e.totalPlanned) * 100
      : 0;
    return {
      ...e,
      progressPct,
      status: progressPct >= 90 ? "ok" : progressPct >= 50 ? "warn" : "alert",
    };
  });
}

/* ------------------- main component ------------------- */
export default function DashboardProjectView({ projectId: propProjectId }) {
  // Resolve projectId from: prop -> route param -> query param
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const qsProjectId = searchParams.get("projectId");

  const projectId = propProjectId || routeProjectId || qsProjectId || "";

  const [activityFilter, setActivityFilter] = React.useState("in_progress");

  const { data, isLoading, isError } = useGetDprStatusCardsByIdQuery(
    projectId,
    {
      skip: !projectId, // do not call until we have an id
    }
  );

  const activities = React.useMemo(
    () => normalizeActivities(data?.activities || []),
    [data]
  );

  const ENGINEERS = React.useMemo(
    () => prepareEngineers(activities),
    [activities]
  );

  const filteredActivities = React.useMemo(() => {
    const today = new Date();
    return activities.filter((a) => {
      const status = a.current_status;
      const deadline = a.work_completion?.deadline || null;

      if (activityFilter === "completed") return status === "completed";
      if (activityFilter === "in_progress_risk")
        return status === "in progress" && deadline && deadline < today;
      if (activityFilter === "in_progress") return status === "in progress";
      return true;
    });
  }, [activityFilter, activities]);

  const project_detail = {
    code: data?.project_code || data?.project_id || projectId || "",
    name:
      data?.project_name || `Project ${data?.project_id || projectId || ""}`,
    site_address: "",
    number: "",
    status: "",
    customer: "",
  };

  if (!projectId) {
    return (
      <Box p={2}>
        <Typography level="body-sm" color="warning">
          Missing projectId. Use route like <code>/projects/:projectId</code> or{" "}
          <code>?projectId=...</code>.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={2}>
        <Typography level="body-sm">Loading dashboard…</Typography>
      </Box>
    );
  }
  if (isError) {
    return (
      <Box p={2}>
        <Typography level="body-sm" color="danger">
          Failed to load dashboard.
        </Typography>
      </Box>
    );
  }

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
            value={formatPct(CalculateWork(activities))}
            subtitle="Total progress"
            onClick={() => setActivityFilter("completed")}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <KPIBox
            color="warning"
            icon={AccessTime}
            title="Activities Past Deadline"
            value={`${CalculateAtRisk(activities)} (At Risk)`}
            subtitle="Requires attention"
            onClick={() => setActivityFilter("in_progress_risk")}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <KPIBox
            color="primary"
            icon={TrendingUp}
            title="Remain Work"
            value={` ${CalculateNotStarted(activities)}`}
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
              {project_detail.name}
            </Typography>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={1}
            >
              <Typography level="body-sm">
                <strong>Project Code:</strong> {project_detail.code}
              </Typography>
              <Typography level="body-sm">
                <strong>Customer Name:</strong> {project_detail.customer || "-"}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.75}>
                <LocationOn fontSize="sm" />
                <Typography level="body-sm">
                  {project_detail.site_address || "-"}
                </Typography>
              </Box>
            </Box>

            <ActivityFinishLineChart
              apiData={activities}
              projectId={project_detail.code}
              title={project_detail.name}
              height={350}
            />
          </Card>
        </Grid>

        {/* Assigned Engineers */}
        <Grid xs={12} md={4}>
          <Card
            sx={{
              ...cardSx,
              overflow: "auto",
              maxHeight: "500px",
              minHeight: "500px",
            }}
          >
            <Typography level="title-lg" mb={1}>
              Assigned Engineer
            </Typography>
            {ENGINEERS.length === 0 ? (
              <Typography level="body-sm" color="neutral">
                No assignees found in this response.
              </Typography>
            ) : (
              ENGINEERS.map((e) => <EngineerRow key={e.id} e={e} />)
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Activity Tracking */}
      <Card sx={{ ...cardSx, mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography level="title-lg">
            Activity Tracking
            {activityFilter !== "all"
              ? ` — ${activityFilter.replaceAll("_", " ")}`
              : ""}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Tooltip title="Show all">
              <IconButton
                variant="plain"
                size="sm"
                onClick={() => setActivityFilter("all")}
              >
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
              "--TableCell-headBackground":
                "var(--joy-palette-background-level1)",
              "--TableCell-paddingX": "12px",
              "--TableCell-paddingY": "10px",
              "& th": { fontWeight: 600 },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 320 }}>Activity</th>
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
                const deadline = a.work_completion?.deadline || null;
                const overdue = deadline ? deadline < new Date() : false;
                const lastDate = a.dpr_logs.length
                  ? a.dpr_logs[a.dpr_logs.length - 1].date
                  : null;

                const assignedName =
                  Array.isArray(a.assigned_user) && a.assigned_user.length
                    ? a.assigned_user[0].user_name ||
                      a.assigned_user[0].name ||
                      "Engineer"
                    : "Unassigned";

                const deadlineLabel = deadline
                  ? deadline.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "-";

                const lastUpdateLabel = lastDate
                  ? lastDate.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "-";

                return (
                  <tr key={a._key}>
                    <td>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="sm" />
                        <Typography level="body-sm">
                          {a.activity_name}
                        </Typography>
                      </Box>
                    </td>
                    <td>
                      <Typography level="body-sm">{assignedName}</Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={overdue ? "danger" : "primary"}
                      >
                        {deadlineLabel}
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
                      <Typography level="body-sm">{lastUpdateLabel}</Typography>
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

/* ------------------- shared small components ------------------- */
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
        <Typography
          level="title-sm"
          sx={{ color: `${color}.softColor`, fontWeight: 500 }}
        >
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
