// component/ViewProjectManagement.jsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";
import {
  Box,
  Chip,
  Sheet,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Button,
  IconButton,
  Divider,
  Autocomplete,
  Tooltip,
} from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Timelapse, Add, Delete } from "@mui/icons-material";
import {
  useGetProjectActivityByProjectIdQuery,
  useUpdateActivityInProjectMutation,
  useCreateProjectActivityMutation,
  useGetActivityInProjectQuery,
} from "../redux/projectsSlice";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppSnackbar from "./AppSnackbar";

/* ---------------- helpers ---------------- */
const labelToType = { FS: "0", SS: "1", FF: "2", SF: "3" };
const typeToLabel = { 0: "FS", 1: "SS", 2: "FF", 3: "SF" };

const toDMY = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};
function parseISOAsLocalDate(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v))
    return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 0, 0, 0);
  const d0 = new Date(String(v));
  if (d0 && !Number.isNaN(d0.getTime()))
    return new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 0, 0, 0);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0);
  return null;
}
const startCellTemplate = (task) =>
  task.start_date instanceof Date
    ? gantt.date.date_to_str("%d-%m-%Y")(task.start_date)
    : "";
const endCellTemplate = (task) => {
  if (task._end_dmy) return task._end_dmy;
  if (task.start_date instanceof Date && Number(task.duration) > 0) {
    const e = gantt.calculateEndDate({
      start_date: task.start_date,
      duration: task.duration,
      task,
    });
    return gantt.date.date_to_str("%d-%m-%Y")(e);
  }
  return "";
};
const durationTemplate = (task) =>
  Number(task.duration) > 0 ? String(task.duration) : "";
const predecessorTemplate = (task) => {
  const incoming = gantt
    .getLinks()
    .filter((l) => String(l.target) === String(task.id));
  if (!incoming.length) return "";
  return incoming
    .map((l) => {
      const label = typeToLabel[String(l.type)] ?? "FS";
      const lag = Number(l.lag || 0);
      const lagStr = lag === 0 ? "" : lag > 0 ? `+${lag}` : `${lag}`;
      return `${l.source}${label}${lagStr}`;
    })
    .join(", ");
};
const extractBackendError = (err) => {
  const data = err?.data || err?.response?.data || {};
  const msg = String(
    data.message || err?.message || "Failed to update activity."
  );
  const details = data.details || {};
  const parts = [msg];
  if (details.required_min_start || details.required_min_finish) {
    const reqStart = details.required_min_start
      ? new Date(details.required_min_start)
      : null;
    const reqFinish = details.required_min_finish
      ? new Date(details.required_min_finish)
      : null;
    const tips = [
      reqStart ? `Min Start: ${toDMY(reqStart)}` : null,
      reqFinish ? `Min Finish: ${toDMY(reqFinish)}` : null,
    ]
      .filter(Boolean)
      .join(" • ");
    if (tips) parts.push(tips);
  }
  if (Array.isArray(details.rules) && details.rules.length) {
    parts.push(details.rules.map(String).join(" | "));
  }
  return parts.filter(Boolean).join(" — ");
};

/* ---------- date math helpers (inclusive) ---------- */
function addDays(date, days) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (Number(days) || 0));
  return d;
}
function isAfter(a, b) {
  return a && b && new Date(a).getTime() > new Date(b).getTime();
}
function finishFromStartAndDuration(start, duration) {
  const d = Math.max(1, Number(duration) || 0);
  return addDays(start, d - 1);
}
function durationFromStartFinish(start, finish) {
  if (!start || !finish) return 0;
  const s = new Date(start);
  const f = new Date(finish);
  s.setHours(0, 0, 0, 0);
  f.setHours(0, 0, 0, 0);
  const ms = f.getTime() - s.getTime();
  return ms < 0 ? 0 : Math.floor(ms / 86400000) + 1;
}
function earliestStartGivenConstraints(dur, minStart, minFinish) {
  const d = Math.max(1, Number(dur) || 0);
  const needFromFinish = minFinish ? addDays(minFinish, -(d - 1)) : null;
  if (minStart && needFromFinish) {
    return isAfter(minStart, needFromFinish)
      ? new Date(minStart)
      : new Date(needFromFinish);
  }
  if (minStart) return new Date(minStart);
  if (needFromFinish) return new Date(needFromFinish);
  return null;
}

/* ---------- topo order from predecessors ---------- */
function topoOrder(paList) {
  const ids = new Set();
  const indeg = new Map();
  const adj = new Map();
  const gid = (x) =>
    String(
      x?.activity_id?._id ||
        x?.activity_id ||
        x?.master_activity_id?._id ||
        x?.master_activity_id ||
        ""
    );

  paList.forEach((a) => {
    const id = gid(a);
    if (!id) return;
    ids.add(id);
    indeg.set(id, 0);
    adj.set(id, []);
  });
  paList.forEach((a) => {
    const v = gid(a);
    if (!v) return;
    (a.predecessors || []).forEach((p) => {
      const u = String(p.activity_id?._id || p.activity_id || "");
      if (!ids.has(u)) return;
      adj.get(u).push(v);
      indeg.set(v, (indeg.get(v) || 0) + 1);
    });
  });
  const q = [];
  indeg.forEach((deg, node) => deg === 0 && q.push(node));
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    (adj.get(u) || []).forEach((v) => {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    });
  }
  // If cycle, we still return partial order; projection will do best-effort
  return order.length ? order : Array.from(ids);
}

/* ---------- client-only "Actual" projection (recursive) ---------- */
function projectClientActuals(paList) {
  const norm = paList.map((pa, idx) => {
    const master = pa.activity_id || pa.master_activity_id || {};
    const dbId = String(master?._id || pa.activity_id || "");

    const planned_start =
      pa.planned_start || pa.start_date || pa.planned_start_date || null;
    const planned_finish =
      pa.planned_finish || pa.end_date || pa.planned_end_date || null;

    const actual_start =
      pa.actual_start_date || pa.actual_start || pa.actual_start_dt || null;
    const actual_finish =
      pa.actual_finish_date || pa.actual_finish || pa.actual_end_dt || null;

    let duration = Number.isFinite(Number(pa.duration)) ? Number(pa.duration) : 0;
    if (!duration && planned_start && planned_finish) {
      duration = durationFromStartFinish(planned_start, planned_finish);
    }
    if (!duration) duration = 1;

    return {
      _dbId: dbId,
      planned_start: parseISOAsLocalDate(planned_start),
      planned_finish: parseISOAsLocalDate(planned_finish),
      actual_start: parseISOAsLocalDate(actual_start),
      actual_finish: parseISOAsLocalDate(actual_finish),
      duration,
      preds: Array.isArray(pa.predecessors) ? pa.predecessors : [],
    };
  });

  const map = new Map(norm.map((n) => [n._dbId, n]));
  const order = topoOrder(paList);

  order.forEach((id) => {
    const node = map.get(id);
    if (!node) return;

    // If truly completed, keep the real window.
    if (node.actual_start && node.actual_finish) return;

    let minStart = null;
    let minFinish = null;
    (node.preds || []).forEach((link) => {
      const pred = map.get(String(link.activity_id?._id || link.activity_id || ""));
      if (!pred) return;

      const type = String(link.type || "FS").toUpperCase();
      const lag = Number(link.lag || 0);

      const pStart = pred.actual_start || pred._client_start || pred.planned_start;
      const pFinish =
        pred.actual_finish || pred._client_finish || pred.planned_finish;

      if (type === "FS" && pFinish) {
        const req = addDays(pFinish, lag);
        if (!minStart || isAfter(req, minStart)) minStart = req;
      } else if (type === "SS" && pStart) {
        const req = addDays(pStart, lag);
        if (!minStart || isAfter(req, minStart)) minStart = req;
      } else if (type === "FF" && pFinish) {
        const req = addDays(pFinish, lag);
        if (!minFinish || isAfter(req, minFinish)) minFinish = req;
      }
    });

    // Running task? keep actual_start and project finish
    if (node.actual_start && !node.actual_finish) {
      node._client_start = node.actual_start;
      node._client_finish = finishFromStartAndDuration(
        node.actual_start,
        node.duration
      );
      return;
    }

    // No actuals yet, project from constraints/planned
    const desiredStart =
      earliestStartGivenConstraints(node.duration, minStart, minFinish) ||
      node.planned_start ||
      null;
    const desiredFinish =
      desiredStart && node.duration
        ? finishFromStartAndDuration(desiredStart, node.duration)
        : node.planned_finish || null;

    node._client_start = desiredStart || null;
    node._client_finish = desiredFinish || null;
  });

  // Build output for quick lookup
  const out = new Map();
  map.forEach((n, id) => {
    const start = n.actual_start || n._client_start || n.planned_start || null;
    const finish =
      n.actual_finish || n._client_finish || n.planned_finish || null;

    const isCompleted = !!n.actual_finish;
    const onTime =
      isCompleted && n.planned_finish
        ? !isAfter(n.actual_finish, n.planned_finish)
        : null;

    out.set(id, { start, finish, isCompleted, onTime });
  });
  return out;
}

/* ---------- countdown helpers ---------- */
function pickCountdownTarget(paWrapper, paList) {
  const project = paWrapper?.project_id || paWrapper?.project || {};
  const candidates = [];
  const addCand = (obj, label) => {
    if (!obj) return;
    const vals = [
      ["project_completion_date", obj.project_completion_date],
      ["ppa_expiry_date", obj.ppa_expiry_date],
      ["bd_commitment_date", obj.bd_commitment_date],
    ];
    vals.forEach(([key, v]) => {
      if (!v) return;
      const d = new Date(v);
      if (!isNaN(d)) candidates.push({ key, label: label || key, date: d });
    });
  };
  addCand(project, "project");
  if (Array.isArray(paList)) {
    paList.forEach((pa) =>
      addCand(pa?.activity_id, pa?.activity_id?.name || "activity")
    );
  }
  if (!candidates.length) return { target: null, usedKey: null };
  const prefOrder = [
    "project_completion_date",
    "ppa_expiry_date",
    "bd_commitment_date",
  ];
  const now = Date.now();
  for (const k of prefOrder) {
    const hit = candidates.find((c) => c.key === k && c.date.getTime() > now);
    if (hit) return { target: hit.date, usedKey: hit.key };
  }
  const futures = candidates.filter((c) => c.date.getTime() > now);
  if (futures.length) {
    const soonest = futures.reduce((a, b) => (a.date < b.date ? a : b));
    return { target: soonest.date, usedKey: soonest.key };
  }
  const latestPast = candidates.reduce((a, b) => (a.date > b.date ? a : b));
  return { target: latestPast.date, usedKey: latestPast.key };
}

/* ---------- live countdown chip ---------- */
function RemainingDaysChip({ target, usedKey }) {
  const [text, setText] = useState("—");
  const [color, setColor] = useState("neutral");
  useEffect(() => {
    if (!target) {
      setText("—");
      setColor("neutral");
      return;
    }
    let cancelled = false;
    const tick = () => {
      const now = new Date().getTime();
      const end = new Date(target).getTime();
      const diff = end - now;
      if (diff <= 0) {
        if (!cancelled) {
          setText("Expired");
          setColor("danger");
        }
        return;
      }
      const seconds = Math.floor(diff / 1000);
      const d = Math.floor(seconds / (24 * 3600));
      const h = Math.floor((seconds % (24 * 3600)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      parts.push(`${h}h`, `${m}m`, `${s}s`);
      let c = "success";
      if (d < 10) c = "danger";
      else if (d < 30) c = "warning";
      if (!cancelled) {
        setText(parts.join(" "));
        setColor(c);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [target]);

  const label =
    usedKey === "project_completion_date"
      ? "Project Completion"
      : usedKey === "ppa_expiry_date"
      ? "PPA Expiry"
      : usedKey === "bd_commitment_date"
      ? "BD Commitment"
      : "Target";

  return (
    <Tooltip title={target ? `${label}: ${toDMY(target)}` : "No target date"}>
      <Chip variant="soft" color={color} size="sm" sx={{ fontWeight: 600 }}>
        {text}
      </Chip>
    </Tooltip>
  );
}

/* ---------- row for predecessors/successors ---------- */
function DepRow({ title, options, row, onChange, onRemove }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%" }}>
      <Autocomplete
        placeholder={`${title} activity…`}
        size="sm"
        options={options}
        getOptionLabel={(o) => o?.label || ""}
        value={options.find((o) => o.value === row.activityId) || null}
        onChange={(_, val) =>
          onChange({
            ...row,
            activityId: val?.value || "",
            activityName: val?.label || "",
          })
        }
        sx={{ minWidth: 180, flex: 1 }}
        slotProps={{ listbox: { sx: { zIndex: 1401 } } }}
      />
      <Select
        size="sm"
        value={row.type}
        onChange={(_, v) => onChange({ ...row, type: v || "FS" })}
        sx={{ width: 90 }}
        slotProps={{ listbox: { sx: { zIndex: 1401 } } }}
      >
        {["FS", "SS", "FF"].map((t) => (
          <Option key={t} value={t}>
            {t}
          </Option>
        ))}
      </Select>
      <Input
        size="sm"
        type="number"
        placeholder="Lag"
        value={row.lag}
        onChange={(e) => onChange({ ...row, lag: Number(e.target.value || 0) })}
        sx={{ width: 80 }}
      />
      <IconButton color="danger" size="sm" variant="soft" onClick={onRemove}>
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  );
}

/* ---------------- main component ---------------- */
const View_Project_Management = forwardRef(({ viewModeParam = "week" }, ref) => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState(viewModeParam);
  const [timelineMode, setTimelineMode] = useState("baseline"); // "baseline" | "actual"

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project_id");
  const navigate = useNavigate();

  const [snack, setSnack] = useState({ open: false, msg: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [activeDbId, setActiveDbId] = useState(null);

  // GET ALL
  const { data: apiData, refetch: refetchAll } =
    useGetProjectActivityByProjectIdQuery(projectId, { skip: !projectId });

  // UPDATE + CREATE
  const [updateActivityInProject, { isLoading: isSaving }] =
    useUpdateActivityInProjectMutation();
  const [createProjectActivity] = useCreateProjectActivityMutation();

  // GET SINGLE (when modal opens)
  const {
    data: activityFetch,
    isFetching: isFetchingActivity,
    error: activityFetchError,
  } = useGetActivityInProjectQuery(
    activeDbId && projectId ? { projectId, activityId: activeDbId } : { skip: true },
    { skip: !activeDbId || !projectId }
  );

  const paWrapper = apiData?.projectactivity || apiData || {};
  const paList = Array.isArray(paWrapper.activities)
    ? paWrapper.activities
    : Array.isArray(paWrapper)
    ? paWrapper
    : [];
  const projectMeta = paWrapper.project_id || apiData?.project || {};
  const projectDbId = projectMeta?._id || projectId;

  const { target: countdownTarget, usedKey: countdownKey } = useMemo(
    () => pickCountdownTarget(paWrapper, paList),
    [paWrapper, paList]
  );

  /* ---------- build data (mode-aware) ---------- */
  const buildTasksAndLinks = (mode) => {
    const byMasterToSI = new Map();
    const _siToDbId = new Map();

    // When Actual: compute client-side recursive projection first
    const actualLookup = mode === "actual" ? projectClientActuals(paList) : null;

    const data = (paList || []).map((pa, idx) => {
      const si = String(idx + 1);
      const master = pa.activity_id || pa.master_activity_id || {};
      const masterId = String(master?._id || pa.activity_id || "");
      if (masterId) byMasterToSI.set(masterId, si);
      if (masterId) _siToDbId.set(si, masterId);

      const text = master?.name || pa.name || pa.activity_name || "—";

      let startDateObj = null;
      let endDateObj = null;

      if (mode === "actual") {
        const proj = actualLookup?.get(masterId);
        startDateObj = proj?.start || null;
        endDateObj = proj?.finish || null;
      } else {
        const sISO = pa.planned_start || pa.start_date || null;
        const eISO = pa.planned_finish || pa.end_date || null;
        startDateObj = sISO ? parseISOAsLocalDate(sISO) : null;
        endDateObj = eISO ? parseISOAsLocalDate(eISO) : null;
      }

      let duration = 0;
      if (startDateObj && endDateObj) {
        duration = durationFromStartFinish(startDateObj, endDateObj);
      } else {
        duration = Number.isFinite(Number(pa.duration)) ? Number(pa.duration) : 0;
      }

      // status / progress
      const isCompletedActual =
        mode === "actual" ? !!pa.actual_finish : pa?.current_status?.status === "completed";

      const status =
        pa.current_status?.status ||
        (mode === "actual" && (pa.actual_finish || endDateObj) ? "completed" : "not started");

      // Resources
      const resources =
        pa.resources ?? pa.activity_resources ?? pa.activity_id?.resources ?? null;

      // Actual on-time?
      let onTime = null;
      if (mode === "actual") {
        const plannedFinish =
          pa.planned_finish || pa.end_date ? parseISOAsLocalDate(pa.planned_finish || pa.end_date) : null;
        const realFinish = pa.actual_finish ? parseISOAsLocalDate(pa.actual_finish) : null;
        if (realFinish && plannedFinish) {
          onTime = !isAfter(realFinish, plannedFinish);
        }
      }

      return {
        id: si,
        _si: si,
        _dbId: masterId,
        text,
        start_date: startDateObj || null,
        _end_dmy: endDateObj ? toDMY(endDateObj) : "",
        duration,
        progress:
          typeof pa.percent_complete === "number"
            ? pa.percent_complete / 100
            : mode === "actual" && isCompletedActual
            ? 1
            : 0,
        open: true,
        _unscheduled: !startDateObj && !duration,
        _status: status,
        _mode: mode,
        _resources: resources,
        _actual_completed: mode === "actual" ? !!pa.actual_finish : false,
        _actual_on_time: mode === "actual" ? onTime : null,
      };
    });

    // Links
    let lid = 1;
    const links = [];
    (paList || []).forEach((pa, idx) => {
      const targetSI = String(idx + 1);
      const preds = Array.isArray(pa.predecessors) ? pa.predecessors : [];
      preds.forEach((p) => {
        const srcMaster = String(p.activity_id || p.master_activity_id || "");
        const srcSI = byMasterToSI.get(srcMaster);
        if (srcSI) {
          const typeCode = labelToType[(p.type || "FS").toUpperCase()] ?? "0";
          links.push({
            id: lid++,
            source: String(srcSI),
            target: String(targetSI),
            type: typeCode,
            lag: Number(p.lag || 0),
          });
        }
      });
    });

    const _dbIdToSi = new Map(
      Array.from(_siToDbId.entries()).map(([si, db]) => [db, si])
    );

    return { data, links, siToDbId: _siToDbId, dbIdToSi: _dbIdToSi };
  };

  const { ganttData, ganttLinks, siToDbId, dbIdToSi } = useMemo(() => {
    const result = buildTasksAndLinks(timelineMode);
    return {
      ganttData: Array.isArray(result?.data) ? result.data : [],
      ganttLinks: Array.isArray(result?.links) ? result.links : [],
      siToDbId: result?.siToDbId ?? new Map(),
      dbIdToSi: result?.dbIdToSi ?? new Map(),
    };
  }, [paList, timelineMode]);

  const minStartDMY = useMemo(() => {
    const nums = (ganttData || [])
      .filter((t) => t.start_date instanceof Date && !Number.isNaN(t.start_date))
      .map((t) => t.start_date.getTime());
    if (!nums.length) return "—";
    return toDMY(new Date(Math.min(...nums)));
  }, [ganttData]);
  const maxEndDMY = useMemo(() => {
    const ends = (ganttData || []).map((t) => {
      if (t._end_dmy) {
        const [dd, mm, yyyy] = t._end_dmy.split("-").map(Number);
        return new Date(yyyy, mm - 1, dd);
      }
      if (t.start_date instanceof Date && Number(t.duration) > 0) {
        return gantt.calculateEndDate({
          start_date: t.start_date,
          duration: t.duration,
          task: t,
        });
      }
      return null;
    });
    const nums = ends.map((d) => d?.getTime()).filter((n) => Number.isFinite(n));
    if (!nums.length) return "—";
    return toDMY(new Date(Math.max(...nums)));
  }, [ganttData]);

  const [form, setForm] = useState({
    status: "not started",
    start: "",
    end: "",
    duration: "",
    predecessors: [],
    successors: [],
    resources: "",
  });

  const activityOptions = useMemo(
    () =>
      (ganttData || []).map((t) => ({
        value: String(t.id),
        label: t.text,
      })),
    [ganttData]
  );

  const onOpenModalForTask = (siId) => {
    if (timelineMode === "actual") return; // read-only in actual view
    const task = gantt.getTask(siId);
    setSelectedId(String(siId));
    setActiveDbId(task?._dbId || null);
  };

  useEffect(() => {
    if (!activityFetch || !selectedId) return;
    const act = activityFetch.activity || activityFetch.data || activityFetch;
    const preds = Array.isArray(act?.predecessors) ? act.predecessors : [];
    const succs = Array.isArray(act?.successors) ? act.successors : [];

    const uiPreds = preds
      .map((p) => {
        const db = String(p.activity_id || "");
        const si = dbIdToSi.get(db);
        if (!si) return null;
        const task = gantt.getTask(si);
        return {
          activityId: si,
          activityName: task?.text || "",
          type: String(p.type || "FS").toUpperCase(),
          lag: Number(p.lag || 0),
        };
      })
      .filter(Boolean);

    const uiSuccs = succs
      .map((s) => {
        const db = String(s.activity_id || "");
        const si = dbIdToSi.get(db);
        if (!si) return null;
        const task = gantt.getTask(si);
        return {
          activityId: si,
          activityName: task?.text || "",
          type: String(s.type || "FS").toUpperCase(),
          lag: Number(s.lag || 0),
        };
      })
      .filter(Boolean);

    const startISO = act?.planned_start || act?.start || null;
    const finishISO = act?.planned_finish || act?.end || null;
    const dur = Number.isFinite(Number(act?.duration))
      ? String(Number(act.duration))
      : "";

    const toYMD = (iso) =>
      iso ? gantt.date.date_to_str("%Y-%m-%d")(parseISOAsLocalDate(iso)) : "";

    setForm({
      status: act?.current_status?.status || "not started",
      start: toYMD(startISO),
      end: toYMD(finishISO),
      duration: dur,
      predecessors: uiPreds,
      successors: uiSuccs,
      resources:
        act?.resources !== undefined && act?.resources !== null
          ? String(act.resources)
          : "",
    });
  }, [activityFetch, selectedId, dbIdToSi]);

  useEffect(() => {
    if (activityFetchError) {
      setSnack({ open: true, msg: extractBackendError(activityFetchError) });
    }
  }, [activityFetchError]);

  const saveFromModal = async () => {
    if (!selectedId) return;
    const task = gantt.getTask(selectedId);
    const dbActivityId = task?._dbId;
    if (!projectId || !dbActivityId) return;

    const predsPayload = (form.predecessors || [])
      .map((r) => {
        const si = String(r.activityId || "");
        const dbId = siToDbId.get(si);
        if (!dbId) return null;
        return {
          activity_id: dbId,
          type: String(r.type || "FS").toUpperCase(),
          lag: Number(r.lag || 0),
        };
      })
      .filter(Boolean);

    const payload = {
      planned_start: form.start || null,
      planned_finish: form.end || null,
      duration: Number(form.duration || 0),
      status: form.status,
      predecessors: predsPayload,
      resources:
        form.resources === "" || form.resources === null
          ? null
          : Number.isNaN(Number(form.resources))
          ? form.resources
          : Number(form.resources),
    };

    try {
      const result = await updateActivityInProject({
        projectId,
        activityId: dbActivityId,
        data: payload,
      }).unwrap();

      if (result?.error || result?.data?.error) {
        throw result.error || result.data.error;
      }

      await (refetchAll().unwrap?.() ?? refetchAll());
      setSnack({ open: true, msg: "Activity updated." });
      setSelectedId(null);
      setActiveDbId(null);
    } catch (e) {
      setSnack({ open: true, msg: extractBackendError(e) });
    }
  };

  /* ---------- expose saveAsTemplate ---------- */
  useImperativeHandle(ref, () => ({
    saveAsTemplate: async (meta = {}) => {
      const { name, description } = meta || {};
      const tasks = [];
      const parseDMY = (s) => {
        if (!s) return null;
        const [dd, mm, yyyy] = String(s).split("-").map(Number);
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
      };
      gantt.eachTask((t) => {
        const start = t.start_date instanceof Date ? t.start_date : null;
        const end = t._end_dmy
          ? parseDMY(t._end_dmy)
          : start && Number(t.duration) > 0
          ? gantt.calculateEndDate({
              start_date: start,
              duration: t.duration,
              task: t,
            })
          : null;

        tasks.push({
          si: String(t.id),
          dbId: String(t._dbId || ""),
          start,
          end,
          duration: Number(t.duration || 0),
          percent: Math.round(Number(t.progress || 0) * 100),
        });
      });

      const bySi = new Map(tasks.map((x) => [x.si, x]));
      const predsBySi = new Map();
      const succsBySi = new Map();
      gantt.getLinks().forEach((l) => {
        const src = String(l.source);
        const trg = String(l.target);
        const type = typeToLabel[String(l.type)] || "FS";
        const lag = Number(l.lag || 0);

        if (!predsBySi.has(trg)) predsBySi.set(trg, []);
        predsBySi.get(trg).push({ activityIdSi: src, type, lag });

        if (!succsBySi.has(src)) succsBySi.set(src, []);
        succsBySi.get(src).push({ activityIdSi: trg, type, lag });
      });

      const activities = tasks
        .filter((t) => t.dbId)
        .map((t) => {
          const preds = (predsBySi.get(t.si) || [])
            .map((p) => {
              const src = bySi.get(p.activityIdSi);
              if (!src?.dbId) return null;
              return {
                activity_id: src.dbId,
                type: p.type,
                lag: p.lag,
              };
            })
            .filter(Boolean);

          const succs = (succsBySi.get(t.si) || [])
            .map((s) => {
              const trg = bySi.get(s.activityIdSi);
              if (!trg?.dbId) return null;
              return {
                activity_id: trg.dbId,
                type: s.type,
                lag: s.lag,
              };
            })
            .filter(Boolean);

          return {
            activity_id: t.dbId,
            planned_start: t.start ? t.start.toISOString() : null,
            planned_finish: t.end ? t.end.toISOString() : null,
            duration:
              t.duration ||
              (t.start && t.end
                ? durationFromStartFinish(t.start, t.end)
                : 0),
            percent_complete: t.percent || 0,
            predecessors: preds,
            successors: succs,
          };
        });

      const payload = {
        status: "template",
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        activities,
      };

      try {
        await createProjectActivity(payload).unwrap();
        setSnack({ open: true, msg: "Template saved successfully" });
      } catch (e) {
        setSnack({ open: true, msg: "Failed to save template" });
      }
    },
  }));

  /* ---------- init gantt (once) ---------- */
  useEffect(() => {
    gantt.config.date_format = "%d-%m-%Y";
    gantt.locale.date.day_short = ["S", "M", "T", "W", "T", "F", "S"];
    gantt.config.scroll_on_click = true;
    gantt.config.autoscroll = true;
    gantt.config.preserve_scroll = true;
    gantt.config.show_chart_scroll = true;
    gantt.config.show_grid_scroll = true;
    gantt.config.smart_rendering = true;
    gantt.config.start_on_monday = false;
    gantt.config.limit_view = false;
    gantt.config.fit_tasks = false;
    gantt.config.lightbox = false;

    // disable drag interactions
    gantt.config.readonly = false;
    gantt.config.drag_move = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_progress = false;
    gantt.config.drag_links = false;
    gantt.attachEvent("onBeforeLinkAdd", () => false);
    gantt.attachEvent("onBeforeLinkUpdate", () => false);
    gantt.attachEvent("onBeforeLinkDelete", () => false);
    gantt.attachEvent("onBeforeTaskDrag", () => false);

    gantt.showLightbox = function () {
      return false;
    };
    gantt.config.show_unscheduled = true;

    // grid (with resources)
    gantt.config.columns = [
      { name: "text", label: "Activity", tree: true, width: 260, resize: true },
      {
        name: "duration",
        label: "Duration",
        width: 90,
        align: "left",
        resize: true,
        template: durationTemplate,
      },
      {
        name: "resources",
        label: "Res.",
        width: 80,
        align: "left",
        resize: true,
        template: (task) =>
          task._resources === 0
            ? "0"
            : task._resources
            ? String(task._resources)
            : "",
      },
      {
        name: "start",
        label: "Start",
        width: 120,
        align: "left",
        resize: true,
        template: startCellTemplate,
      },
      {
        name: "end",
        label: "End",
        width: 120,
        align: "left",
        resize: true,
        template: endCellTemplate,
      },
      {
        name: "pred",
        label: "Predecessors",
        width: 180,
        align: "left",
        resize: true,
        template: predecessorTemplate,
      },
    ];

    gantt.templates.task_class = (_, __, task) => {
      const classes = [];
      if (task._unscheduled) classes.push("gantt-task-unscheduled");

      if (task._mode === "actual") {
        // color by on-time/late/completing
        if (task._actual_completed) {
          classes.push(task._actual_on_time ? "gantt-task-ontime" : "gantt-task-late");
        } else {
          classes.push("gantt-task-running");
        }
      } else {
        classes.push("gantt-task-baseline");
      }
      return classes.join(" ");
    };

    gantt.attachEvent("onTaskClick", function (id) {
      onOpenModalForTask(String(id));
      return true;
    });

    if (ganttContainer.current) gantt.init(ganttContainer.current);
    return () => gantt.clearAll();
  }, []); // init once

  /* ---------- defensively parse data ---------- */
  const parseSafe = (payload) => {
    const ok = payload && Array.isArray(payload.data) && Array.isArray(payload.links);
    if (!ok) {
      console.error("Invalid gantt.parse payload", payload);
      gantt.parse({ data: [], links: [] });
      return;
    }
    gantt.parse(payload);
  };

  // feed data whenever dataset or mode changes
  useEffect(() => {
    if (!ganttContainer.current || !gantt.$container) return;

    if (timelineMode === "actual") {
      setSelectedId(null);
      setActiveDbId(null);
    }

    const dataArr = Array.isArray(ganttData) ? ganttData : [];
    const linksArr = Array.isArray(ganttLinks) ? ganttLinks : [];

    gantt.clearAll();
    parseSafe({ data: dataArr, links: linksArr });
  }, [ganttData, ganttLinks, timelineMode]);

  /* ---------- scales ---------- */
  useEffect(() => setViewMode(viewModeParam), [viewModeParam]);
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    gantt.templates.date_scale = null;

    if (viewMode === "day" || viewMode === "week") {
      gantt.config.scale_unit = viewMode;
      gantt.config.date_scale = "%d %M %Y";
      const fmtFull = gantt.date.date_to_str("%d %M %Y");
      const fmtNoY = gantt.date.date_to_str("%d %M");
      gantt.templates.date_scale = (date) =>
        date.getFullYear() === currentYear ? fmtNoY(date) : fmtFull(date);
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (viewMode === "month") {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F %Y";
      const fmtM = gantt.date.date_to_str("%F");
      const fmtMY = gantt.date.date_to_str("%F %Y");
      gantt.templates.date_scale = (date) =>
        date.getFullYear() === currentYear ? fmtM(date) : fmtMY(date);
      gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
    } else {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
    }
    gantt.render();
  }, [viewMode]);

  const safeMsg = String(snack?.msg ?? "");
  const isError = /^(failed|invalid|error|server)/i.test(safeMsg);

  return (
    <Box sx={{ ml: "0px", width: "100%", p: 0 }}>
      <style>{`
        .gantt_task_line.gantt-task-unscheduled{display:none!important;}
        /* Baseline (grey) */
        .gantt_task_line.gantt-task-baseline { background:#9aa3b2; border-color:#9aa3b2; }
        /* Actual: on-time (green), late (red), running (blue) */
        .gantt_task_line.gantt-task-ontime { background:#22c55e; border-color:#22c55e; }
        .gantt_task_line.gantt-task-late { background:#ef4444; border-color:#ef4444; }
        .gantt_task_line.gantt-task-running { background:#3b82f6; border-color:#3b82f6; }
        .gantt_grid_scale, .gantt_task_scale { height: 28px; line-height: 28px; }
      `}</style>

      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
          mt: 1,
        }}
      >
        {/* Left: project code + nav */}
        <Sheet
          variant="outlined"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: "lg",
            px: 1.5,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <DescriptionOutlinedIcon fontSize="small" color="primary" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Project Code:
            </Typography>
            <Chip
              color="primary"
              size="sm"
              variant="solid"
              sx={{ fontWeight: 700, cursor: "pointer" }}
              onClick={() =>
                projectDbId && navigate(`/project_detail?project_id=${projectDbId}`)
              }
              aria-label="Open project detail"
            >
              {projectMeta?.code || "—"}
            </Chip>
          </Box>
        </Sheet>

        {/* Center: Baseline / Actual Toggle */}
        <Sheet
          variant="outlined"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: "lg",
            px: 1,
            py: 0.75,
          }}
        >
          <Typography level="body-sm" sx={{ mr: 1, color: "text.secondary" }}>
            Timeline:
          </Typography>
          <Chip
            variant={timelineMode === "baseline" ? "solid" : "soft"}
            color={timelineMode === "baseline" ? "primary" : "neutral"}
            size="sm"
            sx={{ fontWeight: 700, cursor: "pointer" }}
            onClick={() => setTimelineMode("baseline")}
          >
            Baseline
          </Chip>
          <Chip
            variant={timelineMode === "actual" ? "solid" : "soft"}
            color={timelineMode === "actual" ? "primary" : "neutral"}
            size="sm"
            sx={{ fontWeight: 700, cursor: "pointer" }}
            onClick={() => setTimelineMode("actual")}
          >
            Actual
          </Chip>
        </Sheet>

        {/* Right: countdown + range chips */}
        <Sheet
          variant="outlined"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: "lg",
            px: 1,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Timelapse fontSize="small" color="primary" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Remaining:
            </Typography>
            <RemainingDaysChip target={countdownTarget} usedKey={countdownKey} />
          </Box>
          <Divider orientation="vertical" />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="success" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Start:
            </Typography>
            <Chip color="success" size="sm" variant="soft" sx={{ fontWeight: 600 }}>
              {minStartDMY}
            </Chip>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="danger" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              End:
            </Typography>
            <Chip color="danger" size="sm" variant="soft" sx={{ fontWeight: 600 }}>
              {maxEndDMY}
            </Chip>
          </Box>
        </Sheet>
      </Box>

      {/* Gantt area */}
      <Box style={{ position: "relative", width: "100%", minWidth: 600, height: "80vh" }}>
        <Box
          ref={ganttContainer}
          style={{
            width: "100%",
            height: "100%",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 1,
            position: "relative",
            top: 12,
            transition: "box-shadow 0.2s, top 0.2s",
          }}
        />
      </Box>

      {/* Right panel: only in baseline mode */}
      {selectedId && timelineMode === "baseline" && (
        <>
          <Box
            onClick={() => {
              setSelectedId(null);
              setActiveDbId(null);
            }}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1399,
              backgroundColor: "rgba(0,0,0,0.10)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              animation: "fadeIn 140ms ease-out",
            }}
          />
          <Sheet
            variant="outlined"
            sx={{
              position: "fixed",
              overflow: "auto",
              height: "100%",
              p: 2,
              transition: "width 0.2s",
              zIndex: 1400,
              right: 0,
              top: 0,
              width: "40%",
              animation: "slideInRight 230ms ease-out",
              willChange: "transform, opacity",
            }}
          >
            <Stack spacing={1.5}>
              <Typography level="title-sm">
                Edit Activity {isFetchingActivity ? "(loading…)" : ""}
              </Typography>
              <Divider />

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  size="sm"
                  value={form.status}
                  onChange={(_, v) =>
                    setForm((f) => ({ ...f, status: v || "not started" }))
                  }
                  slotProps={{ listbox: { sx: { zIndex: 1401 } } }}
                >
                  <Option value="not started">Not started</Option>
                  <Option value="in progress">In progress</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Start date</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    value={form.start}
                    onChange={(e) => {
                      const startISO = e.target.value;
                      setForm((f) => {
                        let endISO = f.end;
                        if (startISO && f.duration) {
                          const s = parseISOAsLocalDate(startISO);
                          if (!isNaN(s)) {
                            const eDate = gantt.calculateEndDate({
                              start_date: s,
                              duration: Number(f.duration),
                            });
                            endISO = gantt.date.date_to_str("%Y-%m-%d")(eDate);
                          }
                        }
                        return { ...f, start: startISO, end: endISO };
                      });
                    }}
                  />
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Resources</FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g., 3"
                    value={form.resources}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, resources: e.target.value }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Duration (days)</FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    value={form.duration}
                    onChange={(e) => {
                      const duration = Number(e.target.value) || 0;
                      setForm((f) => {
                        let endISO = f.end;
                        if (f.start && duration > 0) {
                          const s = parseISOAsLocalDate(f.start);
                          if (!isNaN(s)) {
                            const eDate = gantt.calculateEndDate({
                              start_date: s,
                              duration,
                            });
                            endISO = gantt.date.date_to_str("%Y-%m-%d")(eDate);
                          }
                        }
                        return { ...f, duration, end: endISO };
                      });
                    }}
                  />
                </FormControl>
              </Stack>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>End date</FormLabel>
                <Input size="sm" type="date" value={form.end} disabled />
              </FormControl>

              <Divider />

              {/* Predecessors */}
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography level="title-sm">Predecessors</Typography>
                  <Button
                    size="sm"
                    variant="soft"
                    startDecorator={<Add />}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        predecessors: [
                          ...f.predecessors,
                          { activityId: "", activityName: "", type: "FS", lag: 0 },
                        ],
                      }))
                    }
                  >
                    Add
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {form.predecessors.length === 0 && (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      No predecessors
                    </Typography>
                  )}
                  {form.predecessors.map((r, idx) => (
                    <DepRow
                      key={`pred-${idx}`}
                      title="Predecessor"
                      options={activityOptions.filter((o) => o.value !== selectedId)}
                      row={r}
                      onChange={(nr) =>
                        setForm((f) => {
                          const arr = [...f.predecessors];
                          arr[idx] = nr;
                          return { ...f, predecessors: arr };
                        })
                      }
                      onRemove={() =>
                        setForm((f) => {
                          const arr = f.predecessors.slice();
                          arr.splice(idx, 1);
                          return { ...f, predecessors: arr };
                        })
                      }
                    />
                  ))}
                </Stack>
              </Stack>

              <Divider />

              {/* Successors (UI only) */}
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography level="title-sm">Successors</Typography>
                  <Button
                    size="sm"
                    variant="soft"
                    startDecorator={<Add />}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        successors: [
                          ...f.successors,
                          { activityId: "", activityName: "", type: "FS", lag: 0 },
                        ],
                      }))
                    }
                  >
                    Add
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {form.successors.length === 0 && (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      No successors
                    </Typography>
                  )}
                  {form.successors.map((r, idx) => (
                    <DepRow
                      key={`succ-${idx}`}
                      title="Successor"
                      options={activityOptions.filter((o) => o.value !== selectedId)}
                      row={r}
                      onChange={(nr) =>
                        setForm((f) => {
                          const arr = [...f.successors];
                          arr[idx] = nr;
                          return { ...f, successors: arr };
                        })
                      }
                      onRemove={() =>
                        setForm((f) => {
                          const arr = f.successors.slice();
                          arr.splice(idx, 1);
                          return { ...f, successors: arr };
                        })
                      }
                    />
                  ))}
                </Stack>
              </Stack>

              <Divider />

              <Stack direction="row" spacing={1}>
                <Button size="sm" onClick={saveFromModal} disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => {
                    setSelectedId(null);
                    setActiveDbId(null);
                  }}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </Sheet>
        </>
      )}

      <AppSnackbar
        color={isError ? "danger" : "success"}
        open={!!snack.open}
        message={safeMsg}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
});

export default View_Project_Management;
