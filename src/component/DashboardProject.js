import { Box, Grid } from "@mui/joy";
import CloudStatCard from "./All_Tasks/TaskDashboardCards";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import { PauseCircleRounded } from "@mui/icons-material";
import TeamLeaderboard from "./All_Tasks/TeamLeaderboard";
import { useEffect, useMemo, useState } from "react";
import ProjectsWorkedCard from "./All_Tasks/Charts/ProjectsDonut";
import {
  useGetActivityLineByProjectIdQuery,
  useGetPostsActivityFeedQuery,
  useGetProjectActivityForViewQuery,
  useGetProjectDetailQuery,
  useGetProjectDropdownForDashboardQuery,
  useGetProjectStatesFilterQuery,
  useGetProjectStatusFilterQuery,
  useLazyGetProjectSearchDropdownQuery,
  useGetResourcesQuery,
} from "../redux/projectsSlice";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ActivityFinishLineChart from "./ActivityFinishLineChart";
import WeeklyProjectTimelineCard from "./WeeklyActivityProject";
import ActivityFeedCard from "../component/All_Tasks/ActivityCard";
import SearchPickerModal from "./SearchPickerModal";
import ResourceBarGraph from "./ResourceBarGraph";

/* ---------------- date helpers ---------------- */
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
  const diff = day === 0 ? -6 : 1 - day;
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
const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setHours(0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

function Dash_project({ projectIds }) {
  const navigate = useNavigate();
  const { projectId: paramId } = useParams();
  const [sp] = useSearchParams();

  /* ---------- status cards data ---------- */
  const { data: statusData, isLoading, isFetching } = useGetProjectStatusFilterQuery();
  const stats = statusData?.data || {
    completed: 0,
    cancelled: 0,
    "to be started": 0,
    delayed: 0,
    pending: 0,
  };

  /* ---------- selected projects (multi) ---------- */
  const [selectedIds, setSelectedIds] = useState(projectIds || []);
  useEffect(() => {
    setSelectedIds(projectIds || []);
  }, [projectIds]);

  /* ---------- single "active" project (for some queries) ---------- */
  const searchProjectId = sp.get("project_id") || "";
  const initialProjectId =
    searchProjectId ||
    paramId ||
    (Array.isArray(projectIds) && projectIds.length ? String(projectIds[0]) : "");

  const [projectId, setProjectId] = useState(initialProjectId);
  useEffect(() => {
    if (initialProjectId && initialProjectId !== projectId) {
      setProjectId(initialProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  const handleProjectChangeSingle = (id) => {
    if (!id) return;
    const sId = String(id);
    setProjectId(sId);
    setSelectedIds((prev) => [sId, ...prev.filter((x) => x !== sId)]);
    const params = new URLSearchParams(sp);
    params.set("project_id", sId);
    navigate({ search: params.toString() }, { replace: true });
  };

  /* ---------- team leaderboard: project detail rows ---------- */
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
  } = useGetProjectDetailQuery({ q: debouncedQ });

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const ProjectDetailColumns = [
    { key: "code", label: "Project Code" },
    { key: "name", label: "Project Name" },
    { key: "current_activity", label: "Current Activity" },
    { key: "project_state", label: "Project State" },
  ];

  const projectDetailRows = useMemo(() => {
    const list = projectData?.data ?? [];
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

      let upcoming = null;
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
            (a) => !a?.actual_start_date && a?.activity_id !== current?.activity_id
          ) || null;
      }

      const completion_date = current?.actual_end_date ? fmtDate(current.actual_end_date) : "-";
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

  /* ---------- donut (states distribution) ---------- */
  const DONUT_COLORS = [
    "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#8b5cf6",
    "#14b8a6", "#e11d48", "#84cc16", "#f97316", "#06b6d4",
    "#d946ef", "#0ea5e9", "#65a30d", "#dc2626", "#7c3aed",
    "#10b981", "#ca8a04", "#2563eb", "#f43f5e", "#0891b2",
    "#a16207", "#15803d", "#4f46e5", "#ea580c", "#db2777",
    "#047857", "#1d4ed8", "#9333ea", "#b91c1c", "#0d9488",
  ];
  const { data: stateRes, isLoading: pbsLoading, isFetching: pbsFetching } =
    useGetProjectStatesFilterQuery();
  const donutData = useMemo(() => {
    const dist = stateRes?.data || [];
    return dist.map((d, i) => ({
      name: d._id,
      value: Number(((d.count / stateRes?.total) * 100).toFixed(2)),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [stateRes]);

  /* ---------- activity feed ---------- */
  const { data: feedRes, isLoading: feedLoading, isFetching: feedFetching } =
    useGetPostsActivityFeedQuery();
  const feedItems = Array.isArray(feedRes?.data) ? feedRes.data : [];

  /* ---------- weekly timeline (baseline/actual filters) ---------- */
  const defaultStart = startOfWeek(new Date());
  const defaultEnd = addDays(defaultStart, 6);
  const [range, setRange] = useState({ startDate: defaultStart, endDate: defaultEnd });
  const baselineStart = ymd(range.startDate);
  const baselineEnd = ymd(range.endDate);
  const [paFilter, setPaFilter] = useState("all");
  const apiFilter =
    paFilter === "baseline" || paFilter === "actual_ontime" || paFilter === "actual_late"
      ? paFilter
      : undefined;

  const {
    data: paViewRes,
    isLoading: paLoading,
    isFetching: paFetching,
  } = useGetProjectActivityForViewQuery({
    baselineStart,
    baselineEnd,
    filter: apiFilter,
  });
  const timelineData = useMemo(
    () => (Array.isArray(paViewRes?.data) ? paViewRes.data : []),
    [paViewRes]
  );

  /* ---------- multi project line charts ---------- */
  const {
    data: LineData,
    isLoading: isLoadingLineData,
    isFetching: isFetchingLineData,
  } = useGetActivityLineByProjectIdQuery(selectedIds, {
    skip: selectedIds.length === 0,
  });

  /* ---------- project search / dropdown & labels ---------- */
  const { data: projectResponse } = useGetProjectDropdownForDashboardQuery({
    page: 1,
    pageSize: 7,
  });
  const projects = Array.isArray(projectResponse)
    ? projectResponse
    : projectResponse?.data ?? [];

  const [triggerProjectSearch] = useLazyGetProjectSearchDropdownQuery();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [labelCache, setLabelCache] = useState({});

  const labelFromRow = (row) =>
    row.code
      ? `${row.code}${row.name ? ` - ${row.name}` : ""}`
      : row.name || String(row._id);

  const onPickProject = (row) => {
    if (!row) return;
    setProjectModalOpen(false);
    const id = String(row._id || "");
    if (!id) return;
    setLabelCache((prev) => ({ ...prev, [id]: labelFromRow(row) }));
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const getLabelForId = (id) => {
    if (labelCache[id]) return labelCache[id];
    const p = (projects || []).find((x) => String(x._id) === String(id));
    return p
      ? p.code
        ? `${p.code}${p.name ? ` - ${p.name}` : ""}`
        : p.name || id
      : id;
  };

  const optionRows = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of projects || []) {
      if (!p?._id) continue;
      const id = String(p._id);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
    for (const id of selectedIds) {
      if (seen.has(id)) continue;
      out.push({ _id: id, code: null, name: labelCache[id] || id });
      seen.add(id);
    }
    return out;
  }, [projects, selectedIds, labelCache]);

  const fetchProjectsPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const res = await triggerProjectSearch({ search, page, limit: pageSize }, true);
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  /* ---------- resources (bar chart) ---------- */
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [resRange, setResRange] = useState({
    startDate: today,
    endDate: addDays(today, 6),
  });

  const { data: resourcesRes } = useGetResourcesQuery({
    start: ymd(resRange.startDate),
    end: ymd(resRange.endDate),
    ...(projectId ? { project_id: projectId } : {}),
  });

  const resourceTypesFromApi =
    Array.isArray(resourcesRes?.resource_types) && resourcesRes.resource_types.length
      ? resourcesRes.resource_types
      : RESOURCE_TYPES;

  const resourceLogs = useMemo(() => {
    const series = Array.isArray(resourcesRes?.series) ? resourcesRes.series : [];
    const out = [];
    for (const row of series) {
      const date = row.date; // YYYY-MM-DD from API
      for (const t of resourceTypesFromApi) {
        out.push({
          date,
          type: t,
          count: Number(row?.[t] || 0),
        });
      }
    }
    return out;
  }, [resourcesRes, resourceTypesFromApi]);

  /* ---------- small UI helper ---------- */
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

  return (
    <Box
      sx={{
        ml: { xs: 0, lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        bgcolor: "background.body",
      }}
    >
      {/* ---------- Status Cards ---------- */}
      <Grid container spacing={2} columns={12}>
        <Grid xs={12} md={3}>
          <CloudStatCard
            loading={isLoading || isFetching}
            value={stats.pending ?? 0}
            title="Pending Projects"
            subtitle="Awaiting or in progress"
            accent="#60a5fa"
            illustration={
              <IconBadge
                icon={<PlayCircleFilledRoundedIcon fontSize="small" />}
                color="#1d4ed8"
                bg="#dbeafe"
              />
            }
            onAction={() => {
              const params = new URLSearchParams();
              params.set("page", "1");
              params.set("tab", "Pending");
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
                color="#15803d"
                bg="#ecfdf5"
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
            subtitle="Running behind schedule"
            accent="#fca5a5"
            illustration={
              <IconBadge
                icon={<DoNotDisturbOnRoundedIcon fontSize="small" />}
                color="#b91c1c"
                bg="#fee2e2"
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
            title="On Hold / Cancelled"
            subtitle="Paused or cancelled"
            accent="#fca5a5"
            illustration={
              <IconBadge
                icon={<PauseCircleRounded fontSize="small" />}
                color="#b91c1c"
                bg="#fee2e2"
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

      {/* ---------- Leaderboard & Donut ---------- */}
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
            title="Projects by State"
            data={pbsLoading || pbsFetching ? [] : donutData}
            total={stateRes?.total ?? 0}
            totalLabel="Projects"
          />
        </Grid>
      </Grid>

      {/* ---------- Weekly Timeline & Feed ---------- */}
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
            layerFilter={paFilter}
            onLayerFilterChange={setPaFilter}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <ActivityFeedCard
            title="Recent Notes"
            items={feedItems}
            onItemClick={(it) => {
              if (it.project_id) {
                navigate(`/project_detail?project_id=${encodeURIComponent(it.project_id)}`);
              }
            }}
            renderRight={(it) => (
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>
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

      {/* ---------- Resources Bar Graph ---------- */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12}>
          <ResourceBarGraph
            title="Resources by Type"
            resourceTypes={resourceTypesFromApi}
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
            onBarClick={() => { }}
          />
        </Grid>
      </Grid>

      {/* ---------- Multi Project Finish Line Charts ---------- */}
      {isLoadingLineData || isFetchingLineData ? (
        <div style={{ padding: 12 }}>Loading…</div>
      ) : selectedIds.length > 0 &&
        Array.isArray(LineData?.rows) &&
        LineData.rows.length > 0 ? (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {LineData.rows.map((row) => (
            <Grid key={row.project_id} xs={12}>
              <ActivityFinishLineChart
                apiData={row}
                projectId={row.project_id}
                domain={row.domain}
                title={row.project_name}
                onProjectChange={handleProjectChangeSingle}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      
    </Box>
  );
}

export default Dash_project;
