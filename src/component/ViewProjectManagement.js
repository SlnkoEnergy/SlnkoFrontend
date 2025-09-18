// component/ViewProjectManagement.jsx
import  {
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
} from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Timelapse, Add, Delete } from "@mui/icons-material";
import Snackbar from "@mui/joy/Snackbar";
import {
  useGetProjectActivityByProjectIdQuery,
  useUpdateActivityInProjectMutation,
  useCreateProjectActivityMutation, // <-- NEW
} from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";
import AppSnackbar from "./AppSnackbar";

/* ---------------- helpers (unchanged) ---------------- */
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
const parseDMY = (s) => {
  if (!s) return null;
  const [dd, mm, yyyy] = String(s).split("-").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
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
const diffDaysInclusive = (sIn, eIn) => {
  const s = sIn instanceof Date ? sIn : parseISOAsLocalDate(sIn);
  const e = eIn instanceof Date ? eIn : parseISOAsLocalDate(eIn);
  if (!s || !e) return 0;
  const s0 = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const e0 = new Date(e.getFullYear(), e.getMonth(), e.getDate());
  const ms = e0 - s0;
  return ms < 0 ? 0 : Math.floor(ms / 86400000) + 1;
};
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
const computeTaskRange = () => {
  let min = null,
    max = null;
  gantt.eachTask((t) => {
    const s = t.start_date instanceof Date ? t.start_date : null;
    let e = null;
    if (t._end_dmy) {
      e = parseDMY(t._end_dmy);
    } else if (s && Number(t.duration) > 0) {
      e = gantt.calculateEndDate({
        start_date: s,
        duration: t.duration,
        task: t,
      });
    }
    if (s) min = !min || s < min ? s : min;
    if (e) max = !max || e > max ? e : max;
  });
  return { min, max };
};
const fitViewportToTasks = () => {
  const { min, max } = computeTaskRange();
  if (!min || !max) return;
  const pad = 3; // days
  const s = new Date(min.getFullYear(), min.getMonth(), min.getDate() - pad);
  const e = new Date(max.getFullYear(), max.getMonth(), max.getDate() + pad);
  gantt.config.start_date = s;
  gantt.config.end_date = e;
  gantt.render();
};
const msProjectSort = () => {
  const endOf = (t) => {
    if (t._end_dmy) return parseDMY(t._end_dmy);
    if (t.start_date instanceof Date && Number(t.duration) > 0) {
      return gantt.calculateEndDate({
        start_date: t.start_date,
        duration: t.duration,
        task: t,
      });
    }
    return null;
  };
  gantt.sort((a, b) => {
    const aStart =
      a.start_date instanceof Date && !isNaN(a.start_date)
        ? a.start_date.getTime()
        : Infinity;
    const bStart =
      b.start_date instanceof Date && !isNaN(b.start_date)
        ? b.start_date.getTime()
        : Infinity;
    if (aStart !== bStart) return aStart - bStart;

    const aEnd = endOf(a);
    const bEnd = endOf(b);
    const aEndMs = aEnd ? aEnd.getTime() : Infinity;
    const bEndMs = bEnd ? bEnd.getTime() : Infinity;
    if (aEndMs !== bEndMs) return aEndMs - bEndMs;

    return 0; // no name tiebreaker
  });
};

/* ---------------- dependencies & scheduling (unchanged) ---------------- */
const rebuildLinksForTask = (taskId, preds, succs) => {
  const all = gantt.getLinks();
  const toRemove = all.filter(
    (l) => String(l.target) === String(taskId) || String(l.source) === String(taskId)
  );
  toRemove.forEach((l) => gantt.deleteLink(l.id));
  (preds || []).forEach((r) => {
    const src = String(r.activityId || "");
    if (!src || src === String(taskId)) return;
    const typeCode = labelToType[String((r.type || "FS").toUpperCase())] ?? "0";
    gantt.addLink({
      id: gantt.uid(),
      source: src,
      target: String(taskId),
      type: typeCode,
      lag: Number(r.lag || 0),
    });
  });
  (succs || []).forEach((r) => {
    const trg = String(r.activityId || "");
    if (!trg || trg === String(taskId)) return;
    const typeCode = labelToType[String((r.type || "FS").toUpperCase())] ?? "0";
    gantt.addLink({
      id: gantt.uid(),
      source: String(taskId),
      target: trg,
      type: typeCode,
      lag: Number(r.lag || 0),
    });
  });
};
const scheduleFromPredecessors = (taskId) => {
  const t = gantt.getTask(taskId);
  if (!t) return;
  const incoming = gantt.getLinks().filter((l) => String(l.target) === String(taskId));
  if (!incoming.length) return;

  const dur = Number(t.duration) || 0;
  const start0 = t.start_date instanceof Date ? t.start_date : new Date();
  const end0 = dur > 0 ? gantt.calculateEndDate({ start_date: start0, duration: dur, task: t }) : null;

  let requiredStart = start0;
  let requiredEnd = end0;

  incoming.forEach((l) => {
    const src = gantt.getTask(l.source);
    if (!src) return;
    const srcStart = src.start_date instanceof Date ? src.start_date : null;
    const srcEnd =
      srcStart && Number(src.duration) > 0
        ? gantt.calculateEndDate({ start_date: srcStart, duration: src.duration, task: src })
        : null;
    const lagDays = Number(l.lag || 0);
    const type = String(l.type);

    if (type === "0") {
      // FS
      if (srcEnd) {
        const minStart = gantt.calculateEndDate({ start_date: srcEnd, duration: lagDays });
        if (!requiredStart || minStart > requiredStart) requiredStart = minStart;
      }
    } else if (type === "1") {
      // SS
      if (srcStart) {
        const minStart = gantt.calculateEndDate({ start_date: srcStart, duration: lagDays });
        if (!requiredStart || minStart > requiredStart) requiredStart = minStart;
      }
    } else if (type === "2") {
      // FF
      if (srcEnd) {
        const minEnd = gantt.calculateEndDate({ start_date: srcEnd, duration: lagDays });
        if (!requiredEnd || minEnd > requiredEnd) requiredEnd = minEnd;
      }
    } else if (type === "3") {
      // SF
      if (srcStart) {
        const minEnd = gantt.calculateEndDate({ start_date: srcStart, duration: lagDays });
        if (!requiredEnd || minEnd > requiredEnd) requiredEnd = minEnd;
      }
    }
  });

  if (dur > 0) {
    if (
      requiredEnd &&
      (!requiredStart ||
        requiredEnd > gantt.calculateEndDate({ start_date: requiredStart, duration: dur }))
    ) {
      const newStart = gantt.calculateEndDate({ start_date: requiredEnd, duration: -dur + 1 });
      t.start_date = newStart;
      t._hadStart = true;
      t.end_date = gantt.calculateEndDate({ start_date: newStart, duration: dur, task: t });
      t._end_dmy = toDMY(t.end_date);
    } else if (requiredStart && requiredStart > start0) {
      t.start_date = requiredStart;
      t._hadStart = true;
      t.end_date = gantt.calculateEndDate({ start_date: requiredStart, duration: dur, task: t });
      t._end_dmy = toDMY(t.end_date);
    } else if (requiredEnd && (!end0 || requiredEnd > end0)) {
      t.end_date = requiredEnd;
      t._end_dmy = toDMY(requiredEnd);
      t.start_date = gantt.calculateEndDate({ start_date: requiredEnd, duration: -dur + 1 });
      t._hadStart = true;
    }
  } else {
    if (requiredStart && (!t.start_date || requiredStart > t.start_date)) {
      t.start_date = requiredStart;
      t._hadStart = true;
    }
    if (requiredEnd && !t._end_dmy) {
      t._end_dmy = toDMY(requiredEnd);
      t.end_date = requiredEnd;
    }
  }
};

/* ---------------- right panel row ---------------- */
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
        {["FS", "SS", "FF", "SF"].map((t) => (
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
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project_id");
const [snack, setSnack] = useState({ open: false, msg: "" });
  const { data: apiData } = useGetProjectActivityByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const [updateActivityInProject, { isLoading: isSaving }] =
    useUpdateActivityInProjectMutation();

  const [createProjectActivity, { isLoading: isSavingTemplate }] =
    useCreateProjectActivityMutation(); // <-- NEW

  const paWrapper = apiData?.projectactivity || apiData || {};
  const paList = Array.isArray(paWrapper.activities)
    ? paWrapper.activities
    : Array.isArray(paWrapper)
    ? paWrapper
    : [];
  const projectMeta = paWrapper.project_id || apiData?.project || {};

  const { ganttData, ganttLinks, siToDbId } = useMemo(() => {
    const byMasterToSI = new Map();
    const _siToDbId = new Map();

    const data = paList.map((pa, idx) => {
      const si = String(idx + 1);
      const master = pa.activity_id || pa.master_activity_id || {};
      const masterId = String(master?._id || "");
      if (masterId) byMasterToSI.set(masterId, si);
      if (masterId) _siToDbId.set(si, masterId);

      const text = master?.name || pa.name || pa.activity_name || "—";
      const sISO = pa.planned_start || pa.start_date || pa.start || null;
      const eISO = pa.planned_finish || pa.end_date || pa.end || null;

      const startDateObj = sISO ? parseISOAsLocalDate(sISO) : null;
      const endDateObj = eISO ? parseISOAsLocalDate(eISO) : null;

      let duration = 0;
      if (startDateObj && endDateObj) {
        duration = diffDaysInclusive(startDateObj, endDateObj);
      } else if (Number.isFinite(Number(pa.duration)) && Number(pa.duration) > 0) {
        duration = Number(pa.duration);
      }

      const hadStart = !!startDateObj;
      const unscheduled = !hadStart && !duration;
      const status = pa.current_status?.status || "not started";

      return {
        id: si,
        _si: si,
        _dbId: masterId,
        text,
        start_date: startDateObj || new Date(),
        _end_dmy: endDateObj ? toDMY(endDateObj) : "",
        duration: Number.isFinite(duration) ? duration : 0,
        progress:
          typeof pa.percent_complete === "number"
            ? pa.percent_complete / 100
            : 0,
        open: true,
        _hadStart: hadStart,
        _unscheduled: unscheduled,
        _status: status,
      };
    });

    // links from predecessors
    let lid = 1;
    const links = [];
    paList.forEach((pa, idx) => {
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

    return { ganttData: data, ganttLinks: links, siToDbId: _siToDbId };
  }, [paList]);

  /* ---------- chips ---------- */
  const minStartDMY = useMemo(() => {
    const nums = (ganttData || [])
      .filter((t) => t._hadStart)
      .map((t) => (t.start_date instanceof Date ? t.start_date.getTime() : null))
      .filter((n) => Number.isFinite(n));
    if (!nums.length) return "—";
    return toDMY(new Date(Math.min(...nums)));
  }, [ganttData]);

  const maxEndDMY = useMemo(() => {
    const ends = (ganttData || []).map((t) => {
      if (t._end_dmy) return parseDMY(t._end_dmy);
      if (t._hadStart && Number(t.duration) > 0) {
        const s = t.start_date instanceof Date ? t.start_date : null;
        if (!s) return null;
        return gantt.calculateEndDate({
          start_date: s,
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

  /* ---------- right panel state ---------- */
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    status: "not started",
    start: "",
    end: "",
    duration: "",
    predecessors: [],
    successors: [],
  });

  const activityOptions = useMemo(
    () =>
      (ganttData || []).map((t) => ({
        value: String(t.id),
        label: t.text,
      })),
    [ganttData]
  );

  const loadTaskIntoForm = (taskId) => {
    const task = gantt.getTask(taskId);
    if (!task) return;
    const incoming = gantt.getLinks().filter((l) => String(l.target) === String(taskId));
    const outgoing = gantt.getLinks().filter((l) => String(l.source) === String(taskId));

    setForm({
      status: task._status || "not started",
      start: task.start_date ? gantt.date.date_to_str("%Y-%m-%d")(task.start_date) : "",
      end: task._end_dmy ? task._end_dmy.split("-").reverse().join("-") : "",
      duration: task.duration || "",
      predecessors: incoming.map((l) => ({
        activityId: String(l.source),
        activityName: (gantt.getTask(l.source) || {}).text || "",
        type: typeToLabel[String(l.type)] || "FS",
        lag: Number(l.lag || 0),
      })),
      successors: outgoing.map((l) => ({
        activityId: String(l.target),
        activityName: (gantt.getTask(l.target) || {}).text || "",
        type: typeToLabel[String(l.type)] || "FS",
        lag: Number(l.lag || 0),
      })),
    });
  };

  /* ---------- APPLY (unchanged from your last code) ---------- */
  const applyForm = async () => {
    if (!selectedId) return;
    const task = gantt.getTask(selectedId);
    if (!task) return;

    let startDate = form.start ? parseISOAsLocalDate(form.start) : null;
    let endDate = form.end ? parseISOAsLocalDate(form.end) : null;
    let newDuration = Number(form.duration || 0);

    if (startDate && endDate) {
      newDuration = diffDaysInclusive(startDate, endDate);
    } else if (startDate && newDuration > 0 && !endDate) {
      endDate = gantt.calculateEndDate({ start_date: startDate, duration: newDuration });
    } else if (endDate && newDuration > 0 && !startDate) {
      startDate = gantt.calculateEndDate({ start_date: endDate, duration: -newDuration + 1 });
    }

    task.start_date = startDate || new Date();
    task.duration = Number.isFinite(newDuration) && newDuration > 0 ? newDuration : 0;
    task.end_date =
      endDate ||
      (task.duration > 0
        ? gantt.calculateEndDate({ start_date: task.start_date, duration: task.duration })
        : null);

    task._hadStart = !!startDate;
    task._unscheduled = !startDate && !task.duration;
    task._end_dmy = task.end_date ? toDMY(task.end_date) : "";
    task._status = form.status;
    task.$no_end = !task.end_date;
    task.$calculate_duration = false;

    rebuildLinksForTask(selectedId, form.predecessors, form.successors);
    scheduleFromPredecessors(selectedId);

    gantt.updateTask(selectedId);
    msProjectSort();
    gantt.render();
    fitViewportToTasks();

    try {
      const dbActivityId = task._dbId;
      if (projectId && dbActivityId) {
        const mapSiToDb = (arr = []) =>
          arr
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
          planned_start: startDate ? startDate.toISOString() : null,
          planned_finish: task.end_date ? task.end_date.toISOString() : null,
          duration: Number(task.duration || 0),
          current_status: { status: form.status },
          predecessors: mapSiToDb(form.predecessors),
          successors: mapSiToDb(form.successors),
        };

        await updateActivityInProject({
          projectId,
          activityId: dbActivityId,
          data: payload,
        });
         
      }
    } catch (e) {
       
    }
  };

  /* ---------- SAVE AS TEMPLATE: exposed via ref ---------- */
 /* ---------- SAVE AS TEMPLATE: exposed via ref (accept name/description) ---------- */
useImperativeHandle(ref, () => ({
  saveAsTemplate: async (meta = {}) => {
    const { name, description } = meta || {};

    // gather tasks
    const tasks = [];
    gantt.eachTask((t) => {
      const start = t.start_date instanceof Date ? t.start_date : null;
      const end =
        t._end_dmy
          ? parseDMY(t._end_dmy)
          : start && Number(t.duration) > 0
          ? gantt.calculateEndDate({ start_date: start, duration: t.duration, task: t })
          : null;

      tasks.push({
        si: String(t.id),
        dbId: String(t._dbId || ""),
        start,
        end,
        duration: Number(t.duration || 0),
        percent: Math.round((Number(t.progress || 0)) * 100),
      });
    });

    // index by SI
    const bySi = new Map(tasks.map((x) => [x.si, x]));

    // build predecessors/successors from links
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
          duration: t.duration || (t.start && t.end ? diffDaysInclusive(t.start, t.end) : 0),
          percent_complete: t.percent || 0,
          predecessors: preds,
          successors: succs,
        };
      });

    // ⬅️ include name/description with your existing payload
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


  /* ---------- init gantt ---------- */
  useEffect(() => {
    gantt.config.date_format = "%d-%m-%Y";
    gantt.locale.date.day_short = ["S", "M", "T", "W", "T", "F", "S"];

    gantt.config.readonly = false;
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
    gantt.showLightbox = function () {
      return false;
    };

    gantt.config.columns = [
      { name: "si", label: "SI No", width: 80, align: "left", resize: true, template: (t) => t._si || t.id || "" },
      { name: "text", label: "Activity", tree: true, width: 260, resize: true },
      { name: "duration", label: "Duration", width: 90, align: "left", resize: true, template: durationTemplate },
      { name: "start", label: "Start", width: 120, align: "left", resize: true, template: startCellTemplate },
      { name: "end", label: "End", width: 120, align: "left", resize: true, template: endCellTemplate },
      { name: "pred", label: "Predecessors", width: 180, align: "left", resize: true, template: predecessorTemplate },
    ];

    gantt.templates.task_class = (_, __, task) =>
      task._unscheduled ? "gantt-task-unscheduled" : "";

    gantt.attachEvent("onTaskClick", function (id) {
      setSelectedId(String(id));
      loadTaskIntoForm(String(id));
      return true;
    });

    gantt.init(ganttContainer.current);

    return () => {
      gantt.clearAll();
    };
  }, []);

  /* ---------- feed data ---------- */
  useEffect(() => {
    gantt.clearAll();
    gantt.parse({ data: ganttData, links: ganttLinks });
    msProjectSort();
    fitViewportToTasks();
  }, [ganttData, ganttLinks]);

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

  return (
    <Box
      sx={{
        ml:'0px',
        width:  "100%", 
        p: 0,
      }}
    >
      <style>{`.gantt_task_line.gantt-task-unscheduled{display:none!important;}`}</style>

      {/* Header chips */}
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
            <Chip color="primary" size="sm" variant="solid" sx={{ fontWeight: 700 }}>
              {projectMeta?.code || "—"}
            </Chip>
          </Box>
        </Sheet>

        <Sheet
          variant="outlined"
          sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: "lg", px: 1, py: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Timelapse fontSize="small" color="primary" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Remaining:
            </Typography>
          </Box>
        </Sheet>

        <Sheet
          variant="outlined"
          sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: "lg", px: 1, py: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="success" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Start Date:
            </Typography>
            <Chip color="success" size="sm" variant="soft" sx={{ fontWeight: 600 }}>
              {minStartDMY}
            </Chip>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="danger" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              End Date:
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

      {/* Backdrop animations */}
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.5; }
            to   { transform: translateX(0);     opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}
      </style>

      {/* Right panel */}
      {selectedId && (
        <>
          <Box
            onClick={() => setSelectedId(null)}
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
              <Typography level="title-sm">Edit Activity</Typography>
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

              {/* Successors */}
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
                <Button size="sm" onClick={applyForm} disabled={isSaving}>
                  {isSaving ? "Saving…" : "Apply"}
                </Button>
                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => selectedId && loadTaskIntoForm(selectedId)}
                >
                  Reset
                </Button>
                <Button size="sm" variant="soft" color="neutral" onClick={() => setSelectedId(null)}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </Sheet>
        </>
      )}

      <AppSnackbar
  color={snack.msg.startsWith("Failed") ? "danger" : "success"}
  open={snack.open}
  message={snack.msg}
  onClose={() => setSnack((s) => ({ ...s, open: false }))}
  >
</AppSnackbar>

    </Box>
  );
});

export default View_Project_Management;
