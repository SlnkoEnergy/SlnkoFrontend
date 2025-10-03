import { Box, Grid } from "@mui/joy";
import CloudStatCard from "./All_Tasks/TaskDashboardCards";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import TeamLeaderboard from "./All_Tasks/TeamLeaderboard";
import { useEffect, useMemo, useState } from "react";
import ProjectsWorkedCard from "./All_Tasks/Charts/ProjectsDonut";
import {
  useGetActivityLineByProjectIdQuery,
  useGetPostsActivityFeedQuery,
  useGetProjectActivityForViewQuery,
  useGetProjectDetailQuery,
  useGetProjectStatesFilterQuery,
  useGetProjectStatusFilterQuery,
  // ⬇️ added
  useGetResourcesQuery,
} from "../redux/projectsSlice";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PauseCircleRounded } from "@mui/icons-material";
import ActivityFinishLineChart from "./ActivityFinishLineChart";
import WeeklyProjectTimelineCard from "./WeeklyActivityProject";
import ActivityFeedCard from "../component/All_Tasks/ActivityCard";
import ResourceBarGraph from "./ResourceBarGraph";

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

const ymd = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  res.setDate(d.getDate() + diff);
  return res;
};
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ADD: resource constants (must match backend enum order)
const RESOURCE_TYPES = [
  "surveyor",
  "civil engineer",
  "civil i&c",
  "electric engineer",
  "electric i&c",
  "soil testing team",
  "tline engineer",
  "tline subcontractor",
];

// ADD: safe local parser for YYYY-MM-DD (prevents timezone shifts)
const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
};


function Dash_project() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetProjectStatusFilterQuery();

  const stats = data?.data || {
    completed: 0,
    cancelled: 0,
    "to be started": 0,
    delayed: 0,
    pending: 0,
  };

  const [userSearch, setUserSearch] = useState("");
   const [debouncedQ, setDebouncedQ] = useState(userSearch);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const {
    data: projectData,
    isLoading: perfLoading,
    isFetching: perfFetching,
  } = useGetProjectDetailQuery({
    q: debouncedQ,
  });

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
    { key: "project_state", label: "Project State" },
  ];

  const projectDetailRows = useMemo(() => {
    const list = projectData?.data ?? []; // ← your array of 48
    return list.map((p) => {
      const acts = Array.isArray(p.activities) ? p.activities : [];

      const current =
        acts.find(
          (a) =>
            a?.current_status === "in_progress" ||
            a?.status === "in_progress" ||
            !a?.actual_end_date
        ) ||
        acts[acts.length - 1] ||
        null;

      let upcoming = [];
      acts.map((activity) => {});

      if (current?.successors?.length) {
        const s = current.successors[0];
        upcoming =
          typeof s === "object" && s !== null
            ? s
            : acts.find((a) => a?.activity_id === s) || null;
      }
      if (!upcoming) {
        upcoming =
          acts.find(
            (a) =>
              !a?.actual_start_date && a?.activity_id !== current?.activity_id
          ) || null;
      }

      const completion_date = current?.actual_end_date
        ? fmtDate(current.actual_end_date)
        : "-";
      return {
        id: p._id,
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
    }));
  }, [stateRes]);

  const {
    data: feedRes,
    isLoading: feedLoading,
    isFetching: feedFetching,
  } = useGetPostsActivityFeedQuery();
  const feedItems = Array.isArray(feedRes?.data) ? feedRes.data : [];

  /* --------- LIFTED RANGE STATE (default: current week) --------- */
  const defaultStart = startOfWeek(new Date());
  const defaultEnd = addDays(defaultStart, 6);
  const [range, setRange] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
  });

  const baselineStart = ymd(range.startDate);
  const baselineEnd = ymd(range.endDate);

  // RTK Query fetch that refires when range changes
  const {
    data: paViewRes,
    isLoading: paLoading,
    isFetching: paFetching,
  } = useGetProjectActivityForViewQuery({ baselineStart, baselineEnd });

  const timelineData = useMemo(
    () => (Array.isArray(paViewRes?.data) ? paViewRes.data : []),
    [paViewRes]
  );

  const { projectId: paramId } = useParams();
  const [sp] = useSearchParams();
  const initialProjectId = sp.get("project_id") || paramId || "";

  const [projectId, setProjectId] = useState(initialProjectId);

  // keep local state in sync when URL changes (back/forward, etc.)
  useEffect(() => {
    if (initialProjectId && initialProjectId !== projectId) {
      setProjectId(initialProjectId);
    }
  }, [initialProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // when child picks a project, update URL + local state
  const handleProjectChange = (id) => {
    setProjectId(id || "");
    const params = new URLSearchParams(sp);
    if (id) params.set("project_id", id);
    else params.delete("project_id");
    navigate({ search: params.toString() }, { replace: true });
  };

  const {
    data: LineData,
    isLoading: isLOadingLineData,
    isFetching: isFetchingLineData,
    error,
  } = useGetActivityLineByProjectIdQuery(projectId, { skip: !projectId });

  /* --------- RESOURCES API (integrated) --------- */
  /* --------- RESOURCES API (integrated) --------- */
// local 7-day window for the resource graph (today → +6)
const today = new Date();
today.setHours(0, 0, 0, 0);
const [resRange, setResRange] = useState({
  startDate: today,
  endDate: addDays(today, 6),
});

// fetch resources whenever the resource graph range or project changes
const { data: resourcesRes } = useGetResourcesQuery({
  start: ymd(resRange.startDate),
  end: ymd(resRange.endDate),
  ...(projectId ? { project_id: projectId } : {}),
  allTypes: "1", // ensure zeros returned for missing types
});

// Map API [{type, number}] -> chart logs [{date, type, count}]
const resourceLogs = useMemo(() => {
  const items = Array.isArray(resourcesRes?.data) ? resourcesRes.data : [];
  const anchor = resourcesRes?.start || ymd(resRange.startDate);
  return items.map((it) => ({
    date: anchor,
    type: String(it.type || "-"),
    count: Number(it.number || 0),
  }));
}, [resourcesRes, resRange.startDate]);


  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      <Grid container spacing={2} columns={12}>
        <Grid xs={12} md={3}>
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
            onAction={() => {
              const params = new URLSearchParams();
              params.set("page", "1");
              params.set("tab", "In Progress");
              navigate(`/project_management?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
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
            onAction={() => {
              const params = new URLSearchParams();
              params.set("page", "1");
              params.set("tab", "Completed");
              navigate(`/project_management?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
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
            onAction={() => {
              const params = new URLSearchParams();
              params.set("page", "1");
              params.set("tab", "Delayed");
              navigate(`/project_management?${params.toString()}`);
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.cancelled ?? 0}
            title="On Hold Projects"
            subtitle="Tasks cancelled"
            accent="#fca5a5"
            illustration={
              <IconBadge
                icon={<PauseCircleRounded fontSize="small" />}
                color="#b91c1c" // red-700
                bg="#fee2e2" // red-100
              />
            }
            onAction={() => {
              const params = new URLSearchParams();
              params.set("page", "1");
              params.set("tab", "On Hold");
              navigate(`/project_management?${params.toString()}`);
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <TeamLeaderboard
            rows={perfLoading || perfFetching ? [] : projectDetailRows}
            title="Project Detail Dashboard"
            columns={ProjectDetailColumns}
            searchValue={userSearch}
            onSearchChange={setUserSearch}
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

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={8}>
          <WeeklyProjectTimelineCard
            data={timelineData}
            loading={paLoading || paFetching}
            title="Calendar — Selected Range"
            range={range}
            onRangeChange={(startDate, endDate) => {
              const s = new Date(startDate);
              const e = new Date(endDate);
              s.setHours(0, 0, 0, 0);
              e.setHours(0, 0, 0, 0);
              setRange({ startDate: s, endDate: e });
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <ActivityFeedCard
            title="Recent Notes"
            items={feedItems}
            onItemClick={(it) => {
              if (it.project_id) {
                navigate(
                  `/project_detail?project_id=${encodeURIComponent(
                    it.project_id
                  )}`
                );
              }
            }}
            renderRight={(it) => (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                {it.ago}
              </span>
            )}
            getAvatar={(it) => it.attachment_url}
            getTitleLeft={(it) => it.name}
            getActionVerb={(it) => it.action}
            getTitleRight={(it) => it.project_name}
            getTitleRightSub={(it) => it.project_code}
            getRemarksHtml={(it) => it.comment}
            getRightText={(it) => it.ago}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={12}>
          <ResourceBarGraph
  title="Resources by Type"
  resourceTypes={RESOURCE_TYPES}
  logs={resourceLogs}
  initialRange={resRange}
  onRangeChange={(startY, endY) => {
    const s = parseYMD(startY);
    const e = parseYMD(endY);
    setResRange({
      startDate: s || resRange.startDate,
      endDate: e || resRange.endDate,
    });
  }}
  onBarClick={() => {}}
/>

        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={12}>
          {error && (
            <div style={{ color: "crimson" }}>
              Failed to load: {error?.data?.message || String(error)}
            </div>
          )}
          {isLOadingLineData || isFetchingLineData ? (
            <div>Loading…</div>
          ) : (
            <ActivityFinishLineChart
              apiData={LineData}
              projectId={projectId}
              onProjectChange={handleProjectChange}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dash_project;
