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
import { useGetProjectSummaryByIdQuery } from "../../src/redux/projectsSlice";

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

function normalizeActivitiesFromSummary(raw = []) {
  return raw.map((a, idx) => {
    // Use planned_finish from API (previously "deadline")
    const plannedFinish = a?.planned_finish ? toDate(a.planned_finish) : null;
    const plannedStart = a?.planned_start ? toDate(a.planned_start) : null;
    const lu = a?.last_update ? toDate(a.last_update) : null;
    return {
      _key: a.activity_id || `row-${idx}`,
      activity_name: a.activity_name || `Activity ${idx + 1}`,
      current_status: String(a?.status || "").toLowerCase(), // "not started" | "in progress" | "completed"
      work_done_percent: Number(a?.work_done_percent || 0),
      planned_start: plannedStart,
      planned_finish: plannedFinish,
      last_update: lu,
      assigned_to: Array.isArray(a?.assigned_to) ? a.assigned_to : [],
    };
  });
}

/* ------------------- engineers panel ------------------- */
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

function prepareEngineersFromSummary(activities = []) {
  const map = new Map();
  activities.forEach((act) => {
    const users = Array.isArray(act.assigned_to) ? act.assigned_to : [];
    const list = users.length
      ? users
      : [{ _id: "_unassigned", name: "Unassigned" }];

    list.forEach((u) => {
      const key = u._id || u.user_id || u.email || u.name || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: u.user_name || u.name || "Engineer",
          assigned: 0,
          completed: 0,
          totalPlanned: 0,
          totalActual: 0,
        });
      }
      const row = map.get(key);
      row.assigned += 1;

      // Approximate contribution using work_done_percent (0–100)
      const pct = Number(act.work_done_percent || 0);
      row.totalPlanned += 100;
      row.totalActual += Math.max(0, Math.min(100, pct));
      if (pct >= 100) row.completed += 1;
    });
  });

  return Array.from(map.values()).map((e) => {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const qsProjectId = searchParams.get("projectId");
  const projectId = propProjectId || routeProjectId || qsProjectId || "";

  // URL-backed activity filter (?af=...)
  const validFilters = new Set([
    "all",
    "completed",
    "in_progress",
    "past_deadline",        // overdue if planned_finish < today && not completed
    "not_started",
    "progress_or_completed",
  ]);
  const initialFilter = (() => {
    // Default to progress_or_completed
    const f = (searchParams.get("af") || "progress_or_completed").toLowerCase();
    return validFilters.has(f) ? f : "progress_or_completed";
  })();
  const [activityFilter, setActivityFilter] = React.useState(initialFilter);

  const setFilter = React.useCallback(
    (f) => {
      const next = validFilters.has(f) ? f : "all";
      setActivityFilter(next);
      const sp = new URLSearchParams(searchParams);
      sp.set("af", next);
      setSearchParams(sp, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  React.useEffect(() => {
    const f = (searchParams.get("af") || "progress_or_completed").toLowerCase();
    if (validFilters.has(f) && f !== activityFilter) setActivityFilter(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data, isLoading, isError } = useGetProjectSummaryByIdQuery(
    projectId,
    {
      skip: !projectId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const activities = React.useMemo(
    () => normalizeActivitiesFromSummary(data?.activities || []),
    [data]
  );

  const ENGINEERS = React.useMemo(
    () => prepareEngineersFromSummary(activities),
    [activities]
  );

  const filteredActivities = React.useMemo(() => {
    const today = new Date();
    return activities.filter((a) => {
      const status = a.current_status; // "not started" | "in progress" | "completed"
      const pf = a.planned_finish || null;

      if (activityFilter === "progress_or_completed")
        return status === "in progress" || status === "completed";
      if (activityFilter === "completed") return status === "completed";
      if (activityFilter === "past_deadline")
        return pf && pf < today && status !== "completed"; // overdue if past planned_finish and not completed
      if (activityFilter === "in_progress") return status === "in progress";
      if (activityFilter === "not_started") return status === "not started";
      return true; // "all"
    });
  }, [activityFilter, activities]);

  const project_detail = {
    code: data?.project_code || data?.project_id || projectId || "",
    name:
      data?.project_name || `Project ${data?.project_id || projectId || ""}`,
    site_address: "",
    number: "",
    status: "",
    customer: data?.customer_name || "",
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
            value={formatPct(Number(data?.work_done_percent || 0))}
            subtitle="Total progress"
            onClick={() => {
              // Remove AF before setting status
              const sp = new URLSearchParams(searchParams);
              sp.delete("af");
              sp.set("status", "in progress,completed"); // reflect both in URL
              setSearchParams(sp, { replace: true });
              setFilter("progress_or_completed");
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <KPIBox
            color="warning"
            icon={AccessTime}
            title="Activities Past Deadline"
            value={`${Number(data?.activities_past_deadline || 0)} (At Risk)`}
            subtitle="Requires attention"
            onClick={() => {
              // Remove status before setting AF
              const sp = new URLSearchParams(searchParams);
              sp.delete("status");
              sp.set("af", "past_deadline");
              setSearchParams(sp, { replace: true });
              setFilter("past_deadline");
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <KPIBox
            color="primary"
            icon={TrendingUp}
            title="Remain Work"
            value={`${Number(data?.not_started_activities || 0)}`}
            subtitle="Not Started Activities"
            onClick={() => {
              // Remove status before setting AF
              const sp = new URLSearchParams(searchParams);
              sp.delete("status");
              sp.set("af", "not_started");
              setSearchParams(sp, { replace: true });
              setFilter("not_started");
            }}
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
  projectId={projectId}             
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
                onClick={() => setFilter("all")}
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
                <th style={{ width: 140 }}>Planned Finish</th>
                <th style={{ width: 120 }}>Delay (days)</th>
                <th style={{ width: 180 }}>Work Done %</th>
                <th style={{ width: 120, textAlign: "right" }}>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((a) => {
                const pct = Number(a.work_done_percent || 0);
                const plannedFinish = a.planned_finish || null;
                const isCompleted = a.current_status === "completed";
                const today = new Date();

                const overdue =
                  plannedFinish ? plannedFinish < today && !isCompleted : false;

                // Delay count in whole days (ceil)
                let delayDays = 0;
                if (overdue) {
                  const ms = today.getTime() - plannedFinish.getTime();
                  delayDays = Math.ceil(ms / (24 * 60 * 60 * 1000));
                }

                const lastDate = a.last_update || null;

                const assignedName =
                  Array.isArray(a.assigned_to) && a.assigned_to.length
                    ? a.assigned_to[0].user_name ||
                      a.assigned_to[0].name ||
                      "Engineer"
                    : "Unassigned";

                const plannedFinishLabel = plannedFinish
                  ? plannedFinish.toLocaleDateString("en-IN", {
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
                        {plannedFinishLabel}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" color={overdue ? "danger" : "neutral"}>
                        {overdue ? `${delayDays}` : "0"}
                      </Typography>
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
