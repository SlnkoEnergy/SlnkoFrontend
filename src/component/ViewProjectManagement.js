// component/ViewProjectManagement.jsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  Suspense,
  lazy,
} from "react";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";
import {
  Box,
  Chip,
  ChipDelete,
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
  Textarea,
} from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import ReactSelect from "react-select";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Timelapse, Add, Delete } from "@mui/icons-material";
import {
  useGetProjectActivityByProjectIdQuery,
  useReorderProjectActivitiesMutation,
  useUpdateActivityInProjectMutation,
  useCreateProjectActivityMutation,
  useGetActivityInProjectQuery,
  useGetAllProjectUserQuery,
} from "../redux/projectsSlice";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppSnackbar from "./AppSnackbar";
import { toast } from "react-toastify";

import enIN from "date-fns/locale/en-IN";
const DateRange = lazy(() =>
  import("react-date-range").then((m) => ({ default: m.DateRange }))
);

/* ---------------- helpers ---------------- */
const labelToType = { FS: "0", SS: "1", FF: "2" };
const typeToLabel = { 0: "FS", 1: "SS", 2: "FF" };

const toDMY = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};
const toYMD = (d) =>
  d instanceof Date && !Number.isNaN(d)
    ? gantt.date.date_to_str("%Y-%m-%d")(d)
    : "";

// Day + short month (e.g., "08 Oct")
const toDM = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mon = dt.toLocaleString("en-GB", { month: "short" });
  return `${dd} ${mon}`;
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

function startOfWeek(d) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // make Monday start
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
}
function startOfMonth(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}
function endOfMonth(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
}
function toYMDLocal(d) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ---------- grid date cells (always baseline) ---------- */
const startCellTemplate = (task) => task._base_start_dm || "-";
const endCellTemplate = (task) => task._base_end_dm || "-";

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
  return order.length ? order : Array.from(ids);
}

/* ---------- client-only "Actual" projection (recursive) ---------- */
function projectClientActuals(paList) {
  const norm = paList.map((pa) => {
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

    let duration = Number.isFinite(Number(pa.duration))
      ? Number(pa.duration)
      : 0;
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

    if (node.actual_start && node.actual_finish) return;

    let minStart = null;
    let minFinish = null;

    (node.preds || []).forEach((link) => {
      const pred = map.get(
        String(link.activity_id?._id || link.activity_id || "")
      );
      if (!pred) return;

      const type = String(link.type || "FS").toUpperCase();
      const lag = Number(link.lag || 0);

      const pStart =
        pred.actual_start || pred._client_start || pred.planned_start;
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

    if (node.actual_start && !node.actual_finish) {
      node._client_start = node.actual_start;
      node._client_finish = finishFromStartAndDuration(
        node.actual_start,
        node.duration
      );
      return;
    }

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

  const out = new Map();
  map.forEach((n, id) => {
    const start = n.actual_start || n._client_start || n.planned_start || null; // real → projected → planned
    const finish =
      n.actual_finish || n._client_finish || n.planned_finish || null; // real → projected → planned

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

/* ---------- resource constants ---------- */
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

/* ---------- row for predecessors ---------- */
function DepRow({ title, options, row, onChange, onRemove, disabled = false }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: "100%" }}
    >
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
        disabled={disabled}
        sx={{ minWidth: 180, flex: 1 }}
        slotProps={{ listbox: { sx: { zIndex: 1401 } } }}
      />
      <Select
        size="sm"
        value={row.type}
        disabled={disabled}
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
        disabled={disabled}
        onChange={(e) => onChange({ ...row, lag: Number(e.target.value || 0) })}
        sx={{ width: 80 }}
      />
      <IconButton
        color="danger"
        size="sm"
        variant="soft"
        disabled={disabled}
        onClick={onRemove}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  );
}

/* ---------- row for resources ---------- */
function ResourceRow({ row, onChange, onRemove, disabled = false }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: "100%" }}
    >
      <Select
        size="sm"
        placeholder="Type"
        value={row.type || ""}
        disabled={disabled}
        onChange={(_, v) => onChange({ ...row, type: v || "" })}
        sx={{ minWidth: "80%" }}
        slotProps={{ listbox: { sx: { zIndex: 1401 } } }}
      >
        {RESOURCE_TYPES.map((t) => (
          <Option key={t} value={t}>
            {t
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </Option>
        ))}
      </Select>

      <Input
        size="sm"
        type="number"
        inputMode="numeric"
        placeholder="Number"
        value={row.number ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange({
            ...row,
            number: Number(e.target.value) > 1 ? Number(e.target.value) : 1,
          })
        }
        sx={{ width: "100%" }}
      />

      <IconButton
        color="danger"
        size="sm"
        variant="soft"
        disabled={disabled}
        onClick={onRemove}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  );
}

/* ---------------- main component ---------------- */
const View_Project_Management = forwardRef(
  ({ viewModeParam = "week", onPlanStatus, onSelectionChange }, ref) => {
    const ganttContainer = useRef(null);
    const [viewMode, setViewMode] = useState(viewModeParam);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    // === Work-completion deadline (calendar selection state) ===

    // read initial params
    const projectId = searchParams.get("project_id");
    const initView = (searchParams.get("type") || "site").toLowerCase();
    const initTimeline = (
      searchParams.get("timeline") || "baseline"
    ).toLowerCase();

    const [timelineMode, setTimelineMode] = useState(
      initTimeline === "actual" ? "actual" : "baseline"
    ); // "baseline" | "actual"
    const [actView, setActView] = useState(
      ["site", "backend", "all"].includes(initView) ? initView : "site"
    ); // site | backend | all

    const [snack, setSnack] = useState({ open: false, msg: "" });
    const [selectedId, setSelectedId] = useState(null);
    const [selectedTaskName, setSelectedTaskName] = useState("");
    const [activeDbId, setActiveDbId] = useState(null);

    const syncURL = (nextType, nextTimeline) => {
      const params = new URLSearchParams(searchParams);
      if (projectId) params.set("project_id", projectId);
      params.set("type", nextType);
      params.set("timeline", nextTimeline);
      setSearchParams(params, { replace: true });
    };

    const rangePresetOptions = [
      { value: "custom", label: "Custom" },
      { value: "today", label: "Today" },
      { value: "next7", label: "Next 7 days" },
      { value: "thisWeek", label: "This week" },
      { value: "thisMonth", label: "This month" },
    ];
    function applyPreset(preset) {
      const now = new Date();
      let from = "",
        to = "";

      switch (preset) {
        case "today": {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          from = toYMDLocal(d);
          to = toYMDLocal(d);
          break;
        }
        case "next7": {
          const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const d2 = new Date(d1);
          d2.setDate(d2.getDate() + 6);
          from = toYMDLocal(d1);
          to = toYMDLocal(d2);
          break;
        }
        case "thisWeek": {
          const d1 = startOfWeek(now);
          const d2 = endOfWeek(now);
          from = toYMDLocal(d1);
          to = toYMDLocal(d2);
          break;
        }
        case "thisMonth": {
          const d1 = startOfMonth(now);
          const d2 = endOfMonth(now);
          from = toYMDLocal(d1);
          to = toYMDLocal(d2);
          break;
        }
        default: // custom
          break;
      }

      setForm((f) => ({
        ...f,
        work_completion_preset: preset,
        ...(from ? { work_completion_deadline_from: from } : {}),
        ...(to ? { work_completion_deadline_to: to } : {}),
      }));
    }

    useEffect(() => {
      // ensure URL reflects initial normalized state on first mount
      syncURL(actView, timelineMode);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [assignPick, setAssignPick] = useState([]);

    const handleAssignPicked = () => {
      if (!assignPick.length) return;

      setForm((f) => {
        const prev = ensureIds(f.assigned_to);
        const next = Array.from(new Set([...prev, ...assignPick]));

        let newStatus = "Assigned";
        if (prev.length && next.length > prev.length) newStatus = "Assigned";
        else if (next.length && next.length !== prev.length)
          newStatus = "Partial";
        else if (!next.length) newStatus = "Removed";

        return {
          ...f,
          assigned_to: next,
          assigned_status: newStatus,
        };
      });

      setAssignPick([]);
      toast.success("Engineer's assigned successfully.");
    };

    const handleRemovePicked = (ids) => {
      const toRemove = Array.isArray(ids) ? ids : assignPick;
      if (!toRemove.length) return;

      setForm((f) => {
        const prev = ensureIds(f.assigned_to);
        const remaining = prev.filter((id) => !toRemove.includes(id));

        let newStatus = "Removed";
        if (remaining.length && remaining.length !== prev.length)
          newStatus = "Partial";

        return {
          ...f,
          assigned_to: remaining,
          assigned_status: newStatus,
        };
      });

      setAssignPick([]);
      toast.info("User(s) removed successfully.");
    };

    function dedupeStatus(arr) {
      const map = new Map();
      arr.forEach((e) => map.set(String(e.user_id), e));
      return Array.from(map.values());
    }

    const { data: apiData, refetch: refetchAll } =
      useGetProjectActivityByProjectIdQuery(projectId, { skip: !projectId });
    const [reorderProjectActivities] = useReorderProjectActivitiesMutation();
    const [updateActivityInProject, { isLoading: isSaving }] =
      useUpdateActivityInProjectMutation();
    const [createProjectActivity] = useCreateProjectActivityMutation();

    const { data: projectUsers = [], isFetching: isFetchingUsers } =
      useGetAllProjectUserQuery();

    const assignOptions = Array.isArray(projectUsers?.data)
      ? projectUsers.data.map((u) => ({
          label: u.name,
          value: u._id,
        }))
      : [];

    const {
      data: activityFetch,
      isFetching: isFetchingActivity,
      error: activityFetchError,
    } = useGetActivityInProjectQuery(
      activeDbId && projectId
        ? { projectId, activityId: activeDbId }
        : { skip: true },
      { skip: !activeDbId || !projectId }
    );

    // Send current plan status to parent (freeze/unfreeze)
    const lastSentRef = useRef("");
    useEffect(() => {
      const statusObj = apiData?.projectactivity?.current_status ?? null;
      if (!statusObj) return;

      const key = JSON.stringify({
        status: statusObj.status ?? null,
        remarks: statusObj.remarks ?? null,
        user_id: statusObj.user_id ?? null,
      });
      if (key === lastSentRef.current) return;

      lastSentRef.current = key;
      onPlanStatus?.(statusObj);
    }, [apiData, activityFetch, onPlanStatus]);

    const initialStatusRef = useRef("");
    const fetchedRemarksRef = useRef("");

    // 👇 add this
    const masterCheckIdRef = useRef(
      `gantt-master-${Math.random().toString(36).slice(2)}`
    );

    // replace notifySelection in ViewProjectManagement.jsx
    const notifySelection = () => {
      try {
        let count = 0;
        const ids = [];
        gantt.eachTask((t) => {
          if (t?.checked) {
            count++;
            // this is the DB id you need to update:
            if (t?._dbId) ids.push(String(t._dbId));
          }
        });
        onSelectionChange?.({ any: count > 0, count, ids });
      } catch {}
    };

    // Local flag for frozen state
    const planStatus =
      apiData?.projectactivity?.current_status?.status ??
      apiData?.current_status?.status ??
      null;
    const isPlanFrozen = String(planStatus || "").toLowerCase() === "freeze";
    const disableEditing = isPlanFrozen || isSaving;

    const paWrapper = apiData?.projectactivity || apiData || {};
    const paListRaw = Array.isArray(paWrapper.activities)
      ? paWrapper.activities
      : Array.isArray(paWrapper)
      ? paWrapper
      : [];
    const projectMeta = paWrapper.project_id || apiData?.project || {};
    const projectDbId = projectMeta?._id || projectId;

    const paList = useMemo(() => {
      const mapType = (pa) =>
        (pa?.activity_id?.type || pa?.type || "").toLowerCase();
      if (actView === "site") {
        return paListRaw.filter((pa) => mapType(pa) === "frontend");
      }
      if (actView === "backend") {
        return paListRaw.filter((pa) => mapType(pa) === "backend");
      }
      return paListRaw;
    }, [paListRaw, actView]);

    const { target: countdownTarget, usedKey: countdownKey } = useMemo(
      () => pickCountdownTarget(paWrapper, paList),
      [paWrapper, paList]
    );

    /* ---------- build data (mode-aware) ---------- */
    const buildTasksAndLinks = (mode, list) => {
      const byMasterToSI = new Map();
      const _siToDbId = new Map();

      const actualLookup = projectClientActuals(list);

      const data = (list || []).map((pa, idx) => {
        const si = String(idx + 1);
        const master = pa.activity_id || pa.master_activity_id || {};
        const masterId = String(master?._id || pa.activity_id || "");
        if (masterId) byMasterToSI.set(masterId, si);
        if (masterId) _siToDbId.set(si, masterId);

        const text = master?.name || pa.name || pa.activity_name || "—";
        const typeLower = String(master?.type || pa?.type || "")
          .toLowerCase()
          .trim();

        // Baseline (planned) dates
        const baseStartISO = pa.planned_start || pa.start_date || null;
        const baseEndISO = pa.planned_finish || pa.end_date || null;
        const baseStartObj = baseStartISO
          ? parseISOAsLocalDate(baseStartISO)
          : null;
        const baseEndObj = baseEndISO ? parseISOAsLocalDate(baseEndISO) : null;

        // Duration (fallback to calc from baseline if needed)
        let duration = 0;
        if (baseStartObj && baseEndObj) {
          duration = durationFromStartFinish(baseStartObj, baseEndObj);
        } else {
          duration = Number.isFinite(Number(pa.duration))
            ? Number(pa.duration)
            : 0;
        }

        // Real actuals from backend
        const aSISO =
          pa.actual_start_date || pa.actual_start || pa.actual_start_dt || null;
        const aFISO =
          pa.actual_finish_date || pa.actual_finish || pa.actual_end_dt || null;
        const aStartObj = aSISO ? parseISOAsLocalDate(aSISO) : null;
        const aEndObj = aFISO ? parseISOAsLocalDate(aFISO) : null;

        // Projected actuals
        const proj = actualLookup?.get(masterId);
        const projActualStartObj = proj?.start || null;
        const projActualEndObj = proj?.finish || null;

        // Grid display: real → projected → planned
        const aStartForDisplay =
          aStartObj || projActualStartObj || baseStartObj || null;
        const aEndForDisplay =
          aEndObj || projActualEndObj || baseEndObj || null;

        const base_start_dm = baseStartObj ? toDM(baseStartObj) : "";
        const base_end_dm = baseEndObj ? toDM(baseEndObj) : "";
        const act_start_dm = aStartForDisplay ? toDM(aStartForDisplay) : "-";
        const act_end_dm = aEndForDisplay ? toDM(aEndForDisplay) : "-";

        // === Decide what the Gantt BAR should draw ===
        let timelineStart = null;
        let timelineEndObj = null;
        let drawDuration = duration;

        if (mode === "actual") {
          if (aStartObj && aEndObj) {
            timelineStart = aStartObj;
            timelineEndObj = aEndObj;
            drawDuration = durationFromStartFinish(aStartObj, aEndObj);
          } else if (aStartObj && !aEndObj) {
            const end = projActualEndObj || baseEndObj || null;
            timelineStart = aStartObj;
            timelineEndObj = end;
            drawDuration = end
              ? durationFromStartFinish(aStartObj, end)
              : Math.max(1, Number(pa.duration) || 1);
          } else {
            timelineStart = projActualStartObj || baseStartObj || null;
            timelineEndObj = projActualEndObj || baseEndObj || null;
            if (!timelineEndObj && timelineStart && Number(drawDuration) > 0) {
              timelineEndObj = gantt.calculateEndDate({
                start_date: timelineStart,
                duration: drawDuration,
                task: {},
              });
            }
          }
        } else {
          timelineStart = baseStartObj || null;
          timelineEndObj = baseEndObj || null;
          if (!timelineEndObj && timelineStart && Number(drawDuration) > 0) {
            timelineEndObj = gantt.calculateEndDate({
              start_date: timelineStart,
              duration: drawDuration,
              task: {},
            });
          }
        }

        // Status flags
        const isCompletedActual =
          !!aEndObj || pa?.current_status?.status === "completed";
        const onTimeFlag =
          aEndObj && baseEndObj ? !isAfter(aEndObj, baseEndObj) : null;
        const status =
          pa.current_status?.status ||
          (isCompletedActual ? "completed" : "not started");

        // Resources
        let resourcesArray = [];
        if (Array.isArray(pa.resources)) {
          resourcesArray = pa.resources.map((r) => ({
            type: r?.type || "",
            number: Number(r?.number) || 0,
          }));
        } else if (Array.isArray(pa.activity_resources)) {
          resourcesArray = pa.activity_resources.map((r) => ({
            type: r?.type || "",
            number: Number(r?.number) || 0,
          }));
        }
        const resourcesTotal = resourcesArray.reduce(
          (sum, r) => sum + (Number(r.number) || 0),
          0
        );

        return {
          id: si,
          _si: si,
          _dbId: masterId,
          text,
          start_date: timelineStart || null,
          _end_obj: timelineEndObj || null,
          duration: drawDuration,
          progress:
            typeof pa.percent_complete === "number"
              ? pa.percent_complete / 100
              : isCompletedActual
              ? 1
              : 0,
          open: true,
          _unscheduled: !timelineStart && !drawDuration,
          _status: status,
          _mode: mode,
          _actual_completed: !!aEndObj,
          _actual_on_time: onTimeFlag,
          _type: typeLower,

          // Baseline (grid)
          _base_start_obj: baseStartObj,
          _base_end_obj: baseEndObj,
          _base_start_dm: base_start_dm,
          _base_end_dm: base_end_dm,

          // Actual display strings (real → projected → planned)
          _a_start_dm: act_start_dm,
          _a_end_dm: act_end_dm,

          // Resources
          _resources_total: resourcesTotal,
          _resources_arr: resourcesArray,
        };
      });

      // Build links
      let lid = 1;
      const links = [];
      (list || []).forEach((pa, idx) => {
        const targetSI = String(idx + 1);
        const preds = Array.isArray(pa.predecessors) ? pa.predecessors : [];
        preds.forEach((p) => {
          const srcMaster = String(p.activity_id || p.master_activity_id || "");
          const srcIndex = (list || []).findIndex((x) => {
            const mid = String(
              x?.activity_id?._id ||
                x?.activity_id ||
                x?.master_activity_id ||
                ""
            );
            return mid === srcMaster;
          });
          const srcSI = srcIndex >= 0 ? String(srcIndex + 1) : null;
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
      const result = buildTasksAndLinks(timelineMode, paList);
      return {
        ganttData: Array.isArray(result?.data) ? result.data : [],
        ganttLinks: Array.isArray(result?.links) ? result.links : [],
        siToDbId: result?.siToDbId ?? new Map(),
        dbIdToSi: result?.dbIdToSi ?? new Map(),
      };
    }, [paList, timelineMode]);

    const minStartDMY = useMemo(() => {
      const nums = (ganttData || [])
        .filter(
          (t) => t.start_date instanceof Date && !Number.isNaN(t.start_date)
        )
        .map((t) => t.start_date.getTime());
      if (!nums.length) return "—";
      return toDMY(new Date(Math.min(...nums)));
    }, [ganttData]);
    const maxEndDMY = useMemo(() => {
      const ends = (ganttData || []).map((t) => {
        const endObj =
          t._end_obj ||
          (t.start_date instanceof Date && Number(t.duration) > 0
            ? gantt.calculateEndDate({
                start_date: t.start_date,
                duration: t.duration,
                task: t,
              })
            : null);
        return endObj || null;
      });
      const nums = ends
        .map((d) => d?.getTime())
        .filter((n) => Number.isFinite(n));
      if (!nums.length) return "—";
      return toDMY(new Date(Math.max(...nums)));
    }, [ganttData]);

    const [form, setForm] = useState({
      status: "not started",
      start: "",
      end: "",
      duration: "",
      predecessors: [],
      resources: [],
      remarks: "",
      assigned_to: [],
      assigned_status: null,
      work_completion_value: "",
      work_completion_unit: "number",
      work_completion_deadline_from: "",
      work_completion_deadline_to: "",
      work_completion_preset: "custom",
    });

    const statusChanged = form.status !== initialStatusRef.current;

    useEffect(() => {
      if (statusChanged) {
        // Clear remarks so the user can type a fresh one for the new status
        if (form.remarks !== "") {
          setForm((f) => ({ ...f, remarks: "" }));
        }
      } else {
        // Status reverted to the original — restore the fetched remarks
        if (form.remarks !== fetchedRemarksRef.current) {
          setForm((f) => ({ ...f, remarks: fetchedRemarksRef.current }));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusChanged]);

    const activityOptions = useMemo(
      () =>
        (ganttData || []).map((t) => ({
          value: String(t.id),
          label: t.text,
        })),
      [ganttData]
    );

    const onOpenModalForTask = (siId) => {
      const task = gantt.getTask(siId);
      setSelectedId(String(siId));
      setSelectedTaskName(task?.text || "");
      setActiveDbId(task?._dbId || null);
    };

    const recomputeDatesFromPredecessors = (predRows, durationDays) => {
      if (!Array.isArray(predRows) || !predRows.length) return null;

      let minStart = null;
      let minFinish = null;

      predRows.forEach((r) => {
        const si = String(r.activityId || "");
        if (!si) return;
        const pt = gantt.getTask(si);
        if (!pt) return;

        const pStart = pt._base_start_obj || null;
        const pEnd = pt._base_end_obj || null;

        if (!pStart && !pEnd) return;

        const type = String(r.type || "FS").toUpperCase();
        const lag = Number(r.lag || 0);

        if (type === "FS" && pEnd) {
          const req = addDays(pEnd, lag);
          if (!minStart || isAfter(req, minStart)) minStart = req;
        } else if (type === "SS" && pStart) {
          const req = addDays(pStart, lag);
          if (!minStart || isAfter(req, minStart)) minStart = req;
        } else if (type === "FF" && pEnd) {
          const req = addDays(pEnd, lag);
          if (!minFinish || isAfter(req, minFinish)) minFinish = req;
        }
      });

      const dur = Math.max(1, Number(durationDays) || 0);
      const start = earliestStartGivenConstraints(dur, minStart, minFinish);
      if (!start) return null;
      const end = finishFromStartAndDuration(start, dur);
      return { start, end };
    };

    // const dbg = (label, obj) => {
    //   console.log(`[ASSIGN-DBG] ${label}`, JSON.parse(JSON.stringify(obj)));
    // };

    useEffect(() => {
      const hasPreds = (form.predecessors || []).length > 0;
      const dur = Number(form.duration || 0);

      if (hasPreds && dur > 0) {
        const res = recomputeDatesFromPredecessors(form.predecessors, dur);
        if (res) {
          const nextStart = toYMD(res.start);
          const nextEnd = toYMD(res.end);
          if (form.start !== nextStart || form.end !== nextEnd) {
            setForm((f) => ({ ...f, start: nextStart, end: nextEnd }));
          }
          return;
        }
      }

      // No predecessors: keep end in sync from manual start + duration
      if (!hasPreds && form.start && dur > 0) {
        const s = parseISOAsLocalDate(form.start);
        if (s && !Number.isNaN(s)) {
          const e = finishFromStartAndDuration(s, dur);
          const nextEnd = toYMD(e);
          if (form.end !== nextEnd) {
            setForm((f) => ({ ...f, end: nextEnd }));
          }
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.predecessors, form.duration, form.start]);

    const toId = (x) => (typeof x === "string" ? x : x?._id || x?.id || "");
    const ensureIds = (arr) =>
      Array.isArray(arr) ? arr.map(toId).filter(Boolean) : [];

    const wcSelection = useMemo(() => {
      const from =
        parseISOAsLocalDate(form.work_completion_deadline_from) || new Date();
      const to = parseISOAsLocalDate(form.work_completion_deadline_to) || from;
      return [{ startDate: from, endDate: to, key: "selection" }];
    }, [form.work_completion_deadline_from, form.work_completion_deadline_to]);

    const handleWcRangeChange = (ranges) => {
      const sel = ranges?.selection || ranges?.ranges?.selection;
      if (!sel) return;
      setForm((f) => ({
        ...f,
        work_completion_deadline_from: toYMD(sel.startDate),
        work_completion_deadline_to: toYMD(sel.endDate),
        work_completion_preset: "custom",
      }));
    };

    useEffect(() => {
      if (!activityFetch || !selectedId) return;

      const act = activityFetch.activity || activityFetch.data || activityFetch;
      const preds = Array.isArray(act?.predecessors) ? act.predecessors : [];

      const fetchedStatus = act?.current_status?.status || "not started";
      initialStatusRef.current = fetchedStatus;
      fetchedRemarksRef.current =
        act?.current_status?.remarks ?? act?.remarks ?? "";

      // ✅ Updated by (status updater)
      const updatedBy = act?.current_status?.user_id ?? act?.user_id ?? {};
      const updatedByName = updatedBy?.name || "";
      const updatedByUrl = updatedBy?.attachment_url || "";

      // ✅ Assigned by (person who assigned users)
      const assignedBy = act?.assigned_by ?? {};
      const assignedByName = assignedBy?.name || "";
      const assignedByUrl = assignedBy?.attachment_url || "";

      const wc = act?.work_completion || {};
      const wcUnit = typeof wc.unit === "string" ? wc.unit : "number";
      const wcValue = Number.isFinite(Number(wc.value)) ? String(wc.value) : "";
      let wcDeadlineFrom = "";
      let wcDeadlineTo = "";
      if (wc?.deadline) {
        const t = typeof wc.deadline;
        if (t === "string" || wc.deadline instanceof Date) {
          // legacy single date → use as both from/to
          const ymd = toYMD(parseISOAsLocalDate(wc.deadline));
          wcDeadlineFrom = ymd || "";
          wcDeadlineTo = ymd || "";
        } else if (t === "object") {
          wcDeadlineFrom = wc.deadline?.from
            ? toYMD(parseISOAsLocalDate(wc.deadline.from))
            : "";
          wcDeadlineTo = wc.deadline?.to
            ? toYMD(parseISOAsLocalDate(wc.deadline.to))
            : "";
        }
      }

      // 🔁 Predecessors for UI
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

      const startISO = act?.planned_start || act?.start || null;
      const finishISO = act?.planned_finish || act?.end || null;
      const durStr = Number.isFinite(Number(act?.duration))
        ? String(Number(act.duration))
        : "";

      // 🔧 Normalize resources for UI
      const resArrRaw = Array.isArray(act?.resources) ? act.resources : [];
      const uiResources = resArrRaw.map((r) => ({
        type: r?.type || "",
        number: Number(r?.number) || 0,
      }));

      const assignedToIds = ensureIds(act?.assigned_to);
      const assignedStatusStr =
        typeof act?.assigned_status === "string" ? act.assigned_status : null;

      // 🧭 Set all values including assigned_by
      setForm({
        status: fetchedStatus,
        start: startISO ? toYMD(parseISOAsLocalDate(startISO)) : "",
        end: finishISO ? toYMD(parseISOAsLocalDate(finishISO)) : "",
        duration: durStr,
        predecessors: uiPreds,
        resources: uiResources,
        remarks: fetchedRemarksRef.current,
        updatedByName,
        updatedByUrl,
        assigned_by: toId(assignedBy), // ✅ store ID if needed for logic
        assignedByName,
        assignedByUrl,
        assigned_to: assignedToIds,
        assigned_status: assignedStatusStr,
        work_completion_value: wcValue,
        work_completion_unit: wcUnit,
        work_completion_deadline_from: wcDeadlineFrom,
        work_completion_deadline_to: wcDeadlineTo,
        work_completion_preset: "custom",
      });

      // 🔁 Optional: recompute dates if predecessors exist
      const durNum = Number(durStr || 0);
      if (uiPreds.length > 0 && durNum > 0) {
        const res = recomputeDatesFromPredecessors(uiPreds, durNum);
        if (res) {
          setForm((f) => ({
            ...f,
            start: toYMD(res.start),
            end: toYMD(res.end),
          }));
        }
      }
    }, [activityFetch, selectedId, dbIdToSi]);

    useEffect(() => {
      if (activityFetchError) {
        setSnack({ open: true, msg: extractBackendError(activityFetchError) });
      }
    }, [activityFetchError]);

    useEffect(() => {
      const from = form.work_completion_deadline_from;
      const to = form.work_completion_deadline_to;
      if (!from || !to) return;

      const df = new Date(from);
      const dt = new Date(to);
      if (!isNaN(df) && !isNaN(dt) && df.getTime() > dt.getTime()) {
        setSnack({
          open: true,
          msg: "Deadline From cannot be after Deadline To.",
        });
      }
    }, [form.work_completion_deadline_from, form.work_completion_deadline_to]);

    const saveFromModal = async () => {
      if (!selectedId) return;
      if (isPlanFrozen) {
        setSnack({
          open: true,
          msg: "Plan is frozen. Unfreeze to edit activities.",
        });
        return;
      }
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

      const resourcesPayload = Array.isArray(form.resources)
        ? form.resources
            .filter((r) => r && r.type)
            .map((r) => ({
              type: String(r.type),
              number: Number(r.number || 1),
            }))
        : [];

      let computedAssignedStatus = form.assigned_status;
      if (Array.isArray(form.assigned_to)) {
        if (form.assigned_to.length === 0) computedAssignedStatus = "Removed";
        else if (
          form.assigned_to.length > 0 &&
          form.assigned_status === "Removed"
        )
          computedAssignedStatus = "Assigned";
      }

      const payload = {
        planned_start: form.start || null,
        planned_finish: form.end || null,
        duration: Math.max(1, Number(form.duration || 0)),
        status: form.status,
        predecessors: predsPayload,
        resources: resourcesPayload,
        remarks: form.remarks || "",
        assigned_to: ensureIds(form.assigned_to),
        assigned_status: computedAssignedStatus || undefined,
      };
      if (
        form.work_completion_value !== "" ||
        form.work_completion_deadline_from ||
        form.work_completion_deadline_to
      ) {
        const deadlineObj =
          form.work_completion_deadline_from || form.work_completion_deadline_to
            ? {
                // send only what user provided; backend supports partial
                ...(form.work_completion_deadline_from
                  ? { from: form.work_completion_deadline_from }
                  : {}),
                ...(form.work_completion_deadline_to
                  ? { to: form.work_completion_deadline_to }
                  : {}),
              }
            : undefined;

        payload.work_completion = {
          unit: form.work_completion_unit || "number",
          value: Number(form.work_completion_value || 0),
          ...(deadlineObj ? { deadline: deadlineObj } : {}),
        };
      }

      console.log("🛰️ Sending update payload:", payload);

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
        setSnack({
          open: true,
          msg: `Activity updated successfully${
            computedAssignedStatus ? ` (${computedAssignedStatus})` : ""
          }.`,
        });
        setSelectedId(null);
        setActiveDbId(null);
        setSelectedTaskName("");
      } catch (e) {
        console.error("❌ Update failed:", e);
        setSnack({ open: true, msg: extractBackendError(e) });
      }
    };

    useImperativeHandle(ref, () => ({
      saveAsTemplate: async (meta = {}) => {
        const { name, description } = meta || {};
        const rows = [];
        const siToDb = new Map();

        /* --- Build lookups from current dataset (backend data) --- */
        const orderByDb = new Map();
        const depByDb = new Map();

        (paList || []).forEach((pa) => {
          const master = pa.activity_id || pa.master_activity_id || {};
          const dbId = String(master?._id || pa.activity_id || "");
          if (!dbId) return;

          // order coming from backend
          const orderNum =
            Number(pa?.order) ||
            Number(pa?.order_no) ||
            Number(pa?.sequence) ||
            null;
          if (Number.isFinite(orderNum)) orderByDb.set(dbId, orderNum);

          // dependency normalization (array, keep as-is keys)
          const depsRaw = Array.isArray(pa.dependency)
            ? pa.dependency
            : Array.isArray(pa.dependencies)
            ? pa.dependencies
            : [];
          const normalized = depsRaw.map((d) => ({
            model: d?.model,
            model_id: d?.model_id,
            model_id_name: d?.model_id_name,
            updatedAt: d?.updatedAt || d?.updated_at,
            updated_by: d?.updated_by,
          }));
          depByDb.set(dbId, normalized);
        });

        // 1) Gather visible tasks in order (current UI order)
        gantt.eachTask((t) => {
          const start = t.start_date instanceof Date ? t.start_date : null;
          const end =
            t._end_obj ||
            (start && Number(t.duration) > 0
              ? gantt.calculateEndDate({
                  start_date: start,
                  duration: t.duration,
                  task: t,
                })
              : null);

          const startISO = start ? start.toISOString() : null;
          const endISO = end ? end.toISOString() : null;

          const order_no = rows.length + 1; // UI order fallback
          const duration =
            Number(t.duration || 0) ||
            (start && end ? durationFromStartFinish(start, end) : 0);

          rows.push({
            si: String(t.id),
            dbId: String(t._dbId || ""),
            order_no,
            name: t.text || "",
            act_type: t._type || null,
            start,
            end,
            start_iso: startISO,
            end_iso: endISO,
            start_ymd: start ? toYMD(start) : null,
            end_ymd: end ? toYMD(end) : null,
            duration,
            // keep array + computed total for export
            resources_arr: Array.isArray(t._resources_arr)
              ? t._resources_arr
              : [],
            resources_total: Array.isArray(t._resources_arr)
              ? t._resources_arr.reduce(
                  (s, r) => s + (Number(r?.number) || 0),
                  0
                )
              : 0,
            status: t._status || null,
            percent_complete:
              typeof t.progress === "number" ? Math.round(t.progress * 100) : 0,
          });

          if (t._dbId) siToDb.set(String(t.id), String(t._dbId));
        });

        // 2) Predecessors/SUCCESSORS based on current links
        const predsBySi = new Map();
        const succsBySi = new Map();

        gantt.getLinks().forEach((l) => {
          const srcSi = String(l.source);
          const trgSi = String(l.target);
          const typeLabel = (typeToLabel[String(l.type)] || "FS").toUpperCase();
          const lag = Number(l.lag || 0);

          const srcDb = siToDb.get(srcSi) || null;
          const trgDb = siToDb.get(trgSi) || null;

          if (!predsBySi.has(trgSi)) predsBySi.set(trgSi, []);
          predsBySi.get(trgSi).push({ srcSi, srcDb, type: typeLabel, lag });

          if (!succsBySi.has(srcSi)) succsBySi.set(srcSi, []);
          succsBySi.get(srcSi).push({ trgSi, trgDb, type: typeLabel, lag });
        });

        // 3) Final activities payload
        const activities = rows
          .filter((r) => r.dbId)
          .map((t) => {
            const predecessors = (predsBySi.get(t.si) || [])
              .map((p) => ({
                activity_id: p.srcDb,
                type: p.type,
                lag: p.lag,
              }))
              .filter((x) => !!x.activity_id);

            const successors = (succsBySi.get(t.si) || [])
              .map((s) => ({
                activity_id: s.trgDb,
                type: s.type,
                lag: s.lag,
              }))
              .filter((x) => !!x.activity_id);

            // Map backend order if available, else fallback to UI order_no
            const mappedOrder =
              (orderByDb.has(t.dbId) ? orderByDb.get(t.dbId) : null) ??
              t.order_no;

            return {
              activity_id: t.dbId,
              order: mappedOrder, // <-- FIX: use backend order if present
              planned_start: t.start_iso || null,
              planned_finish: t.end_iso || null,
              actual_start: null,
              actual_finish: null,
              duration: t.duration,
              percent_complete: Math.max(
                0,
                Math.min(100, Number(t.percent_complete || 0))
              ),
              resources: Array.isArray(t.resources_arr)
                ? t.resources_arr.map((r) => ({
                    type: String(r?.type || ""),
                    number: Number(r?.number) || 0,
                  }))
                : [],
              predecessors,
              successors,
              // ensure dependency is passed exactly as BE expects
              dependency: depByDb.get(t.dbId) || [],
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
      // base config
      gantt.config.date_format = "%d-%m-%Y";
      gantt.locale.date.day_short = ["S", "M", "T", "W", "T", "F", "S"];

      // scrolling via layout scrollbars (turn off built-ins)
      gantt.config.scroll_on_click = true;
      gantt.config.autoscroll = true;
      gantt.config.preserve_scroll = true;
      gantt.config.show_chart_scroll = false;
      gantt.config.show_grid_scroll = false;

      // behavior
      gantt.config.smart_rendering = true;
      gantt.config.start_on_monday = false;
      gantt.config.limit_view = false;
      gantt.config.fit_tasks = false;
      gantt.config.lightbox = false;
      gantt.config.order_branch = true;
      gantt.config.order_branch_free = true;
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_progress = false;
      gantt.config.drag_links = false;
      gantt.attachEvent("onBeforeLinkAdd", () => false);
      gantt.attachEvent("onBeforeLinkUpdate", () => false);
      gantt.attachEvent("onBeforeLinkDelete", () => false);
      gantt.attachEvent("onBeforeTaskDrag", () => false);
      gantt.showLightbox = () => false;
      gantt.config.show_unscheduled = true;

      // layout: separate X for grid/timeline, shared Y, with elastic separator
      gantt.config.layout = {
        css: "gantt_container",
        rows: [
          {
            cols: [
              {
                id: "gridCol",
                rows: [
                  {
                    view: "grid",
                    id: "grid",
                    scrollX: "gridX",
                    scrollY: "vScroll",
                  },
                  { view: "scrollbar", id: "gridX" },
                ],
              },
              { view: "resizer", id: "gridResizer", width: 6 },
              {
                id: "timeCol",
                rows: [
                  {
                    view: "timeline",
                    id: "timeline",
                    scrollX: "timeX",
                    scrollY: "vScroll",
                  },
                  { view: "scrollbar", id: "timeX" },
                ],
              },
              { view: "scrollbar", id: "vScroll" },
            ],
          },
        ],
      };

      // grid sizing/overflow
      gantt.config.grid_elastic_columns = false;
      gantt.config.min_column_width = 60;
      gantt.config.grid_width = 420;

      // === columns (no custom header content here; we'll inject manually)
      gantt.config.columns = [
        {
          name: "check",
          label: "", // header checkbox will be injected manually
          width: 40,
          align: "center",
          template: (task) =>
            `<input type="checkbox" class="gantt-row-checkbox" data-id="${
              task.id
            }" ${task.checked ? "checked" : ""}/>`,
        },
        {
          name: "sno",
          label: "S.No",
          width: 60,
          align: "center",
          template: (t) => String(gantt.getTaskIndex(t.id) + 1),
        },
        // ... keep your other columns here ...
      ];

      // templates / events
      gantt.templates.task_class = () => "";
      gantt.templates.grid_row_class = () => "";
      gantt.attachEvent("onTaskClick", () => true);
      gantt.attachEvent("onTaskDblClick", (id) => {
        onOpenModalForTask(String(id));
        return false;
      });

      // ---------- init FIRST ----------
      if (ganttContainer.current) {
        gantt.init(ganttContainer.current);
      }

      // ---------- helper: sync header checkbox state ----------
      const syncMasterCheckbox = () => {
        const input = document.getElementById(masterCheckIdRef.current);
        if (!input) return;
        let total = 0,
          checked = 0;
        gantt.eachTask((t) => {
          total += 1;
          if (t.checked) checked += 1;
        });
        if (!total) {
          input.checked = false;
          input.indeterminate = false;
          notifySelection();
          return;
        }
        input.checked = checked === total;
        input.indeterminate = checked > 0 && checked < total;
        notifySelection();
      };

      // ---------- inject header checkbox into the 'check' column head ----------
      const injectMasterHeader = () => {
        const container = gantt.$container;
        if (!container) return;

        // find the header cell for the "check" column
        const headCells = container.querySelectorAll(".gantt_grid_head_cell");
        let checkHeadCell = null;
        headCells.forEach((cell) => {
          // cell has a data-column-name attribute in newer builds; fallback to matching first narrow cell
          const colName = cell.getAttribute("data-column-name");
          if (colName === "check") checkHeadCell = cell;
        });

        // Fallback if data attribute not present: take the first head cell (since our "check" is first)
        if (!checkHeadCell && headCells.length) checkHeadCell = headCells[0];

        if (!checkHeadCell) return;

        // If already injected, skip
        if (checkHeadCell.querySelector(`#${masterCheckIdRef.current}`)) {
          syncMasterCheckbox();
          return;
        }

        // Inject the checkbox
        checkHeadCell.innerHTML = `<input type="checkbox" id="${masterCheckIdRef.current}" />`;

        // Wire handler (use capturing on the exact element to avoid delegation races)
        const master = checkHeadCell.querySelector(
          `#${masterCheckIdRef.current}`
        );
        if (master) {
          master.addEventListener("change", onMasterToggle);
        }

        // Make sure state is correct after injection
        setTimeout(syncMasterCheckbox, 0);
      };

      // ---------- master toggle (no gantt.render here) ----------
      const onMasterToggle = (e) => {
        const allChecked = !!e.target.checked;
        gantt.batchUpdate(() => {
          gantt.eachTask((t) => {
            t.checked = allChecked;
            if (gantt.isTaskVisible(t.id)) gantt.refreshTask(t.id);
          });
          gantt.refreshData(); // light refresh; header DOM kept
        });
        syncMasterCheckbox();
        notifySelection();
      };

      // ---------- row checkbox handling via event delegation ----------
      const onChange = (e) => {
        const target = e?.target;
        if (!target) return;

        if (target.classList.contains("gantt-row-checkbox")) {
          const id = target.getAttribute("data-id");
          if (id) {
            const task = gantt.getTask(id);
            task.checked = !!target.checked;
            gantt.updateTask(id); // refresh just this row
            syncMasterCheckbox();
            notifySelection();
          }
        }
      };

      // Wire listeners once container exists
      const container = gantt.$container;
      if (container) container.addEventListener("change", onChange);

      // Inject header checkbox after every possible header rebuild
      const readyId = gantt.attachEvent("onGanttReady", () =>
        setTimeout(injectMasterHeader, 0)
      );
      const onParseId = gantt.attachEvent("onParse", () =>
        setTimeout(injectMasterHeader, 0)
      );
      const onScaleId = gantt.attachEvent("onScaleAdjusted", () =>
        setTimeout(injectMasterHeader, 0)
      );
      const onColResize = gantt.attachEvent("onColumnResizeEnd", () =>
        setTimeout(injectMasterHeader, 0)
      );
      const onColReorder = gantt.attachEvent("onColumnReorder", () =>
        setTimeout(injectMasterHeader, 0)
      );

      // Keep header checkbox state in sync when tasks change
      const onAfterAddId = gantt.attachEvent("onAfterTaskAdd", () =>
        setTimeout(syncMasterCheckbox, 0)
      );
      const onAfterUpdId = gantt.attachEvent("onAfterTaskUpdate", () =>
        setTimeout(syncMasterCheckbox, 0)
      );
      const onAfterDelId = gantt.attachEvent("onAfterTaskDelete", () =>
        setTimeout(syncMasterCheckbox, 0)
      );
      const onAfterDragId = gantt.attachEvent("onAfterTaskDrag", () =>
        setTimeout(syncMasterCheckbox, 0)
      );

      // initial inject + sync
      setTimeout(() => {
        injectMasterHeader();
        syncMasterCheckbox();
      }, 0);

      // ---------- resize ----------
      const handleResize = () => {
        const host = gantt.$container;
        if (!host) return;
        const w = host.clientWidth || 1000;
        gantt.config.grid_width = Math.max(220, Math.floor(w * 0.4));
        gantt.render();
        // header may be rebuilt → re-inject + resync
        setTimeout(() => {
          injectMasterHeader();
          syncMasterCheckbox();
        }, 0);
      };
      window.addEventListener("resize", handleResize);
      handleResize();

      // ---------- cleanup ----------
      return () => {
        window.removeEventListener("resize", handleResize);
        try {
          gantt.$container?.removeEventListener("change", onChange);
        } catch {}
        gantt.detachEvent(readyId);
        gantt.detachEvent(onParseId);
        gantt.detachEvent(onScaleId);
        gantt.detachEvent(onColResize);
        gantt.detachEvent(onColReorder);
        gantt.detachEvent(onAfterAddId);
        gantt.detachEvent(onAfterUpdId);
        gantt.detachEvent(onAfterDelId);
        gantt.detachEvent(onAfterDragId);
        gantt.clearAll();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- S.No helper accessible here too
    const rowIndex = (t) => {
      try {
        return gantt.getTaskIndex(t.id) + 1;
      } catch {
        return "";
      }
    };

    const buildColumns = (mode) => [
      {
        name: "check",
        label: "",
        width: 40,
        align: "center",
        template: (task) =>
          `<input type="checkbox" class="gantt-row-checkbox" data-id="${
            task.id
          }" ${task.checked ? "checked" : ""}/>`,
      },

      {
        name: "sno",
        label: "S.No",
        width: 60,
        align: "center",
        template: (t) => String(rowIndex(t)),
      },
      { name: "text", label: "Activity", tree: true, width: 260, resize: true },
      {
        name: "duration",
        label: mode === "actual" ? "A. Duration" : "Duration",
        width: 90,
        align: "center",
        resize: true,
        template: durationTemplate,
      },
      {
        name: "resources",
        label: "Res.",
        width: 60,
        align: "center",
        resize: true,
        template: (t) =>
          Number(t._resources_total) > 0 ? String(t._resources_total) : "",
      },
      {
        name: "start",
        label: "B.Start",
        width: 100,
        align: "center",
        resize: true,
        template: startCellTemplate,
      },
      {
        name: "end",
        label: "B.End",
        width: 100,
        align: "center",
        resize: true,
        template: endCellTemplate,
      },
      {
        name: "a_start",
        label: "A.Start",
        width: 100,
        align: "center",
        resize: true,
        template: (t) => t._a_start_dm || "-",
      },
      {
        name: "a_end",
        label: "A.End",
        width: 100,
        align: "center",
        resize: true,
        template: (t) => t._a_end_dm || "-",
      },
      {
        name: "pred",
        label: "Pred.",
        width: 120,
        align: "center",
        resize: true,
        template: predecessorTemplate,
      },
    ];

    /* ---------- dim backend when actView === 'all' + COLORS ---------- */
    useEffect(() => {
      gantt.templates.task_class = (_, __, task) => {
        const classes = [];
        if (task._unscheduled) classes.push("gantt-task-unscheduled");

        if (task._mode === "actual") {
          if (task._actual_completed) {
            if (task._actual_on_time === false) {
              classes.push("gantt-task-running");
            } else {
              classes.push("gantt-task-ontime");
            }
          } else {
            classes.push("gantt-task-running");
          }
        } else {
          classes.push("gantt-task-baseline");
        }

        if (actView === "all" && task._type === "backend") {
          classes.push("gantt-task-dim");
        }
        return classes.join(" ");
      };

      gantt.templates.grid_row_class = (start, end, task) => {
        if (actView === "all" && task._type === "backend")
          return "gantt-grid-dim";
        return "";
      };

      gantt.render();
    }, [actView, timelineMode]);

    /* ---------- Task text: late-tail overlay + centered activity name ---------- */
    useEffect(() => {
      gantt.templates.task_text = (start, end, task) => {
        const parts = [];

        if (
          task._mode === "actual" &&
          task._actual_completed &&
          task._actual_on_time === false &&
          task._base_end_obj &&
          (task._end_obj || end)
        ) {
          const baseEnd = task._base_end_obj;
          const actEnd = task._end_obj || end;

          if (actEnd.getTime() > baseEnd.getTime()) {
            const tailStart = addDays(baseEnd, 1);
            const lateDays = durationFromStartFinish(tailStart, actEnd);
            const totalDays = durationFromStartFinish(task.start_date, actEnd);

            if (lateDays > 0 && totalDays > 0) {
              const pct = Math.max(
                0,
                Math.min(100, (lateDays / totalDays) * 100)
              );
              parts.push(
                `<div class="gantt_late_tail_overlay" style="width:${pct}%"></div>`
              );
            }
          }
        }

        const label = task.text ? String(task.text) : "";
        parts.push(
          `<div class="gantt_bar_label" title="${label.replace(
            /"/g,
            "&quot;"
          )}">${label}</div>`
        );

        return parts.join("");
      };

      gantt.render();
    }, [timelineMode]);

    /* ---------- handle drag-drop reorder → API ---------- */
    useEffect(() => {
      if (!gantt.$container) return;

      const handlerId = gantt.attachEvent("onAfterTaskMove", async function () {
        if (isPlanFrozen) {
          setSnack({
            open: true,
            msg: "Plan is frozen. Unfreeze to change order.",
          });
          return;
        }
        try {
          const ordered = [];
          gantt.eachTask((t) => ordered.push(String(t._dbId)));
          const seen = new Set();
          const ordered_activity_ids = ordered.filter(
            (id) => id && !seen.has(id) && seen.add(id)
          );

          if (!projectId || !ordered_activity_ids.length) return;

          await reorderProjectActivities({
            projectId,
            ordered_activity_ids,
          }).unwrap();
          setSnack({ open: true, msg: "Order updated." });
        } catch (e) {
          setSnack({ open: true, msg: "Failed to update order" });
        }
      });

      return () => {
        gantt.detachEvent(handlerId);
      };
    }, [projectId, reorderProjectActivities, isPlanFrozen]);

    useEffect(() => {
      if (!gantt.$container) return;
      gantt.config.columns = buildColumns(timelineMode);
      gantt.render();
    }, [timelineMode]);

    /* ---------- defensively parse data ---------- */
    const parseSafe = (payload) => {
      const ok =
        payload && Array.isArray(payload.data) && Array.isArray(payload.links);
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

      const dataArr = Array.isArray(ganttData) ? ganttData : [];
      const linksArr = Array.isArray(ganttLinks) ? ganttLinks : [];

      gantt.clearAll();
      parseSafe({ data: dataArr, links: linksArr });
      const container = gantt.$container;
      if (container) {
        const master = container.querySelector(`#${masterCheckIdRef.current}`);
        if (master) {
          master.indeterminate = false; // reset transitional state
        }
        notifySelection();
      }
    }, [ganttData, ganttLinks, timelineMode]);

    /* ---------- reset selection when switching tabs ---------- */
    useEffect(() => {
      setSelectedId(null);
      setActiveDbId(null);
      setSelectedTaskName("");
    }, [actView]);

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
        /* Actual: on-time (green), late tail overlay (red), running (blue) */
        .gantt_task_line.gantt-task-ontime { background:#22c55e; border-color:#22c55e; }
        .gantt_task_line.gantt-task-running { background:#3b82f6; border-color:#3b82f6; }

        /* Red overlay for the late portion of completed tasks in Actual mode (drawn inside the bar) */
        .gantt_late_tail_overlay{
          position:absolute;
          right:0;
          top:0;
          height:100%;
          background:#ef4444;
          opacity:0.95;
          border-top-right-radius:4px;
          border-bottom-right-radius:4px;
          pointer-events:none;
          z-index:0;
        }

        /* Centered label printed inside each bar */
        .gantt_bar_label{
          position:absolute;
          left:0; right:0; top:50%;
          transform: translateY(-50%);
          text-align:center;
          font-weight:600;
          color:#fff;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          padding:0 6px;
          pointer-events:none;
          z-index:1;
        }

        .gantt_grid_scale, .gantt_task_scale { height: 28px; line-height: 28px; }

        /* Dim backend in "All" */
        .gantt_task_line.gantt-task-dim { opacity: 0.45; }
        .gantt_grid_data .gantt_row.gantt-grid-dim { opacity: 0.6; }

        /* allow either side to shrink to 0 when dragging the resizer */
        .gantt_grid, .gantt_task { min-width: 0 !important; }

        /* elastic resizer handle */
        .gantt_layout_cell.gantt_resizer { background: transparent; cursor: col-resize; }
        .gantt_layout_cell.gantt_resizer::after {
          content:""; display:block; width:2px; height:100%; margin:0 auto;
          background: var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.15));
          transition: transform .12s ease;
        }
        .gantt_layout_cell.gantt_resizer:hover::after { transform: scaleX(1.6); }
        
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
          {/* LEFT: Tabs (Site/Backend/All) + Project Code */}
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
            {/* Project code */}
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
                  projectDbId &&
                  navigate(`/project_detail?project_id=${projectDbId}`)
                }
                aria-label="Open project detail"
              >
                {projectMeta?.code || "—"}
              </Chip>
            </Box>
          </Sheet>
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
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Chip
                variant={actView === "site" ? "solid" : "soft"}
                color={actView === "site" ? "primary" : "neutral"}
                size="sm"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => {
                  setActView("site");
                  syncURL("site", timelineMode);
                }}
              >
                Site
              </Chip>
              <Chip
                variant={actView === "backend" ? "solid" : "soft"}
                color={actView === "backend" ? "primary" : "neutral"}
                size="sm"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => {
                  setActView("backend");
                  syncURL("backend", timelineMode);
                }}
              >
                Backend
              </Chip>
              <Chip
                variant={actView === "all" ? "solid" : "soft"}
                color={actView === "all" ? "primary" : "neutral"}
                size="sm"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => {
                  setActView("all");
                  syncURL("all", timelineMode);
                }}
              >
                All
              </Chip>
            </Stack>
          </Sheet>

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
              onClick={() => {
                setTimelineMode("baseline");
                syncURL(actView, "baseline");
              }}
            >
              Baseline
            </Chip>
            <Chip
              variant={timelineMode === "actual" ? "solid" : "soft"}
              color={timelineMode === "actual" ? "primary" : "neutral"}
              size="sm"
              sx={{ fontWeight: 700, cursor: "pointer" }}
              onClick={() => {
                setTimelineMode("actual");
                syncURL(actView, "actual");
              }}
            >
              Actual
            </Chip>
          </Sheet>

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
              <RemainingDaysChip
                target={countdownTarget}
                usedKey={countdownKey}
              />
            </Box>
            <Divider orientation="vertical" />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <EventOutlinedIcon fontSize="small" color="success" />
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                Start:
              </Typography>
              <Chip
                color="success"
                size="sm"
                variant="soft"
                sx={{ fontWeight: 600 }}
              >
                {minStartDMY}
              </Chip>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <EventOutlinedIcon fontSize="small" color="danger" />
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                End:
              </Typography>
              <Chip
                color="danger"
                size="sm"
                variant="soft"
                sx={{ fontWeight: 600 }}
              >
                {maxEndDMY}
              </Chip>
            </Box>
          </Sheet>
        </Box>

        {/* Gantt area */}
        <Box
          style={{
            position: "relative",
            width: "100%",
            minWidth: 600,
            height: "80vh",
          }}
        >
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

        {/* Right panel: edit drawer (read-only while frozen) */}
        {selectedId && (
          <>
            <Box
              onClick={() => {
                setSelectedId(null);
                setActiveDbId(null);
                setSelectedTaskName("");
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
                  Edit Activity
                  {selectedTaskName ? ` (${selectedTaskName})` : ""}{" "}
                  {isFetchingActivity ? "(loading…)" : ""}
                </Typography>

                {isPlanFrozen && (
                  <Chip
                    size="sm"
                    color="danger"
                    variant="soft"
                    sx={{ fontWeight: 700 }}
                  >
                    Plan is frozen — read-only
                  </Chip>
                )}

                <Divider />

                {/* ---------- STATUS ---------- */}
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

                {statusChanged && (
                  <FormControl>
                    <FormLabel>
                      Remarks{" "}
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary", ml: 0.5 }}
                      >
                        (optional)
                      </Typography>
                    </FormLabel>
                    <Textarea
                      minRows={3}
                      size="sm"
                      placeholder="Reason for status change (optional)…"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, remarks: e.target.value }))
                      }
                      disabled={disableEditing}
                    />
                  </FormControl>
                )}
                {!statusChanged && form.remarks ? (
                  <FormControl>
                    <FormLabel>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>Last Remarks</span>
                        {(form.updatedByName || form.updatedByUrl) && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Tooltip
                              title={form.updatedByName || "User"}
                              placement="top"
                            >
                              <Avatar
                                size="sm"
                                variant="soft"
                                src={form.updatedByUrl || undefined}
                                alt={form.updatedByName || "User"}
                                onClick={() => navigate("/user_profile")}
                                onMouseDown={(e) => e.preventDefault()}
                                sx={{
                                  cursor: "pointer",
                                  "&:hover": {
                                    opacity: 0.8,
                                    transform: "scale(1.05)",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                              >
                                {!form.updatedByUrl && form.updatedByName
                                  ? form.updatedByName.charAt(0).toUpperCase()
                                  : null}
                              </Avatar>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </FormLabel>
                    <Textarea
                      minRows={3}
                      size="sm"
                      value={form.remarks}
                      disabled
                    />
                  </FormControl>
                ) : null}

                <Divider />

                {/* ---------- PREDECESSORS ---------- */}
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography level="title-sm">Predecessors</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      startDecorator={<Add />}
                      disabled={disableEditing}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          predecessors: [
                            ...f.predecessors,
                            {
                              activityId: "",
                              activityName: "",
                              type: "FS",
                              lag: 0,
                            },
                          ],
                        }))
                      }
                    >
                      Add
                    </Button>
                  </Stack>

                  <Stack spacing={1}>
                    {form.predecessors.length === 0 && (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        No predecessors
                      </Typography>
                    )}
                    {form.predecessors.map((r, idx) => (
                      <DepRow
                        key={`pred-${idx}`}
                        title="Predecessor"
                        options={activityOptions.filter(
                          (o) => o.value !== selectedId
                        )}
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
                        disabled={disableEditing}
                      />
                    ))}
                  </Stack>
                </Stack>

                <Divider />

                {/* ---------- BASELINE DATES ---------- */}
                <Stack direction="row" spacing={1}>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel>
                      B.Start date{" "}
                      {form.predecessors?.length ? (
                        <Typography
                          level="body-xs"
                          sx={{
                            color: "text.tertiary",
                            ml: 0.5,
                            display: "inline",
                          }}
                        >
                          (auto from predecessors)
                        </Typography>
                      ) : null}
                    </FormLabel>
                    <Input
                      size="sm"
                      type="date"
                      value={form.start}
                      disabled={disableEditing || !!form.predecessors?.length}
                      onChange={(e) => {
                        const startISO = e.target.value;
                        setForm((f) => ({ ...f, start: startISO }));
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>B.Duration (days)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      value={form.duration}
                      disabled={disableEditing}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, duration: e.target.value }))
                      }
                    />
                  </FormControl>
                </Stack>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>B.End date</FormLabel>
                  <Input size="sm" type="date" value={form.end} disabled />
                </FormControl>

                <Divider />

                {/* ---------- RESOURCES ---------- */}
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography level="title-sm">Resources</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      startDecorator={<Add />}
                      disabled={disableEditing}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          resources: [...f.resources, { type: "", number: 1 }],
                        }))
                      }
                    >
                      Add
                    </Button>
                  </Stack>

                  <Stack spacing={1}>
                    {(!form.resources || form.resources.length === 0) && (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        No resources
                      </Typography>
                    )}
                    {form.resources?.map((r, idx) => (
                      <ResourceRow
                        key={`res-${idx}`}
                        row={r}
                        onChange={(nr) =>
                          setForm((f) => {
                            const arr = [...f.resources];
                            arr[idx] = nr;
                            return { ...f, resources: arr };
                          })
                        }
                        onRemove={() =>
                          setForm((f) => {
                            const arr = f.resources.slice();
                            arr.splice(idx, 1);
                            return { ...f, resources: arr };
                          })
                        }
                        disabled={disableEditing}
                      />
                    ))}
                  </Stack>
                </Stack>

                <Divider />

                {/* ---------- WORK COMPLETION ---------- */}
                <FormControl>
                  <FormLabel>Work Completion</FormLabel>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    {/* value */}
                    <Input
                      size="sm"
                      type="number"
                      placeholder="Enter value"
                      value={form.work_completion_value || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          work_completion_value: e.target.value,
                        }))
                      }
                      disabled={disableEditing}
                      sx={{ width: { xs: "45%", sm: "34%" } }}
                    />

                    {/* unit */}
                    <Select
                      size="sm"
                      value={form.work_completion_unit || "number"}
                      onChange={(_, v) =>
                        setForm((f) => ({
                          ...f,
                          work_completion_unit: v || "number",
                        }))
                      }
                      disabled={disableEditing}
                      sx={{ width: { xs: "55%", sm: "26%" } }}
                      slotProps={{
                        listbox: {
                          sx: {
                            zIndex: 1700,
                            maxHeight: 240,
                            overflowY: "auto",
                          },
                        },
                        popper: { sx: { zIndex: 1700 } },
                      }}
                    >
                      <Option value="m">m</Option>
                      <Option value="kg">kg</Option>
                      <Option value="percentage">percentage</Option>
                      <Option value="number">number</Option>
                    </Select>

                    {/* preset selector (same as before) */}
                    <Box sx={{ width: { xs: "100%", sm: "40%" } }}>
                      <ReactSelect
                        isSearchable={false}
                        value={
                          rangePresetOptions.find(
                            (o) => o.value === form.work_completion_preset
                          ) || rangePresetOptions[0]
                        }
                        onChange={(opt) => applyPreset(opt?.value || "custom")}
                        options={rangePresetOptions}
                        isDisabled={disableEditing}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 1700 }),
                        }}
                      />
                    </Box>
                  </Stack>

                  {/* calendar (react-date-range) */}
                  <Box
                    sx={{
                      mt: 1,
                      width: "100%",
                      ...(disableEditing && {
                        opacity: 0.6,
                        pointerEvents: "none",
                      }),
                    }}
                  >
                    <Suspense
                      fallback={<Box sx={{ p: 1.5 }}>Loading calendar…</Box>}
                    >
                      <DateRange
                        locale={enIN}
                        ranges={wcSelection}
                        onChange={handleWcRangeChange}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        direction="horizontal"
                        rangeColors={["#3366a3"]}
                      />
                    </Suspense>

                    <Typography
                      level="body-xs"
                      sx={{ color: "text.tertiary", mt: 0.5 }}
                    >
                      {form.work_completion_deadline_from || "—"} →{" "}
                      {form.work_completion_deadline_to || "—"}
                    </Typography>
                  </Box>

                  {/* optional hint */}
                  <Typography
                    level="body-xs"
                    sx={{ color: "text.tertiary", mt: 0.5 }}
                  >
                    You can set either or both dates. If left blank, backend may
                    use defaults (e.g., baseline).
                  </Typography>
                </FormControl>

                <FormControl>
                  <FormLabel>Assigned To (Site Engineers)</FormLabel>
                  <Autocomplete
                    multiple
                    size="sm"
                    placeholder={
                      isFetchingUsers
                        ? "Loading users..."
                        : "Select user(s) to assign"
                    }
                    options={assignOptions}
                    getOptionLabel={(o) => o.label}
                    isOptionEqualToValue={(a, b) => a.value === b.value}
                    value={assignOptions.filter((o) =>
                      assignPick.includes(o.value)
                    )}
                    onChange={(_, values) => {
                      const next = values.map((v) => v.value);
                      setAssignPick(next);
                    }}
                    filterSelectedOptions
                    disableCloseOnSelect
                    disabled={disableEditing || isFetchingUsers}
                    slotProps={{
                      listbox: {
                        sx: { zIndex: 1401, maxHeight: 240, overflowY: "auto" },
                      },
                    }}
                  />

                  <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                    <Button
                      size="sm"
                      color="success"
                      startDecorator={<Add fontSize="small" />}
                      onClick={() => {
                        if (!assignPick.length) {
                          toast.info("Select user(s) first.");
                          return;
                        }
                        handleAssignPicked();
                      }}
                      disabled={!assignPick.length || disableEditing}
                    >
                      Assign
                    </Button>

                    <Button
                      size="sm"
                      color="danger"
                      variant="soft"
                      startDecorator={<Delete fontSize="small" />}
                      onClick={() => {
                        if (!assignPick.length) {
                          toast.info("Select user(s) to remove.");
                          return;
                        }
                        handleRemovePicked();
                      }}
                      disabled={!assignPick.length || disableEditing}
                    >
                      Remove
                    </Button>
                  </Stack>

                  {(form.assigned_to?.length ?? 0) > 0 ? (
                    <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                      <Typography
                        level="body-sm"
                        sx={{ fontWeight: 600, color: "text.secondary" }}
                      >
                        Currently Assigned
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {form.assigned_to.map((id) => {
                          const user = assignOptions.find(
                            (o) => o.value === id
                          );
                          const label = user ? user.label : id;

                          return (
                            <Chip
                              key={id}
                              size="sm"
                              variant="soft"
                              color="primary"
                              sx={{ alignItems: "center" }}
                              endDecorator={
                                <ChipDelete
                                  aria-label={`Remove ${label}`}
                                  variant="plain"
                                  color="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setForm((f) => {
                                      const remaining = f.assigned_to.filter(
                                        (x) => x !== id
                                      );
                                      let newStatus = "Removed";
                                      if (
                                        remaining.length &&
                                        remaining.length !==
                                          f.assigned_to.length
                                      ) {
                                        newStatus = "Partial";
                                      }
                                      return {
                                        ...f,
                                        assigned_to: remaining,
                                        assigned_status: newStatus,
                                      };
                                    });
                                    toast.info(
                                      "Engineer's removed successfully."
                                    );
                                  }}
                                />
                              }
                            >
                              {label}
                            </Chip>
                          );
                        })}
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography
                      level="body-xs"
                      sx={{
                        mt: 1,
                        color: "text.tertiary",
                        fontStyle: "italic",
                      }}
                    >
                      No users currently assigned.
                    </Typography>
                  )}
                </FormControl>

                <Divider />

                {/* ---------- ACTION BUTTONS ---------- */}
                <Stack direction="row" spacing={1}>
                  <Tooltip
                    title={
                      isPlanFrozen ? "Plan is frozen — unfreeze to save" : ""
                    }
                  >
                    <span>
                      <Button
                        size="sm"
                        onClick={saveFromModal}
                        disabled={disableEditing}
                      >
                        {isSaving ? "Saving…" : "Save"}
                      </Button>
                    </span>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    onClick={() => {
                      setSelectedId(null);
                      setActiveDbId(null);
                      setSelectedTaskName("");
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
  }
);

export default View_Project_Management;
