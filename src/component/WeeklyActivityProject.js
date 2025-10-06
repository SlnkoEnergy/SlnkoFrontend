import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardOverflow,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Sheet,
  Button,
} from "@mui/joy";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { gantt } from "dhtmlx-gantt";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/* ---------------- Safe date helpers ---------------- */
const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

function startOfDay(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}
function toExclusiveEnd(incEnd) {
  return addDays(new Date(incEnd), 1);
}
function ymd(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtISODate(date) {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isOnOrBefore(a, b) {
  if (!a || !b) return false;
  const da = startOfDay(a);
  const db = startOfDay(b);
  return da.getTime() <= db.getTime();
}

/** compute duration in days given exclusive end */
function daysBetweenExclusive(start, end) {
  if (!isValidDate(start) || !isValidDate(end)) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  const s = startOfDay(start);
  const e = startOfDay(end);
  const diff = Math.round((e - s) / msPerDay);
  return diff > 0 ? diff : 1;
}

function getMinMaxFromData(data) {
  const stamps = [];
  (data || []).forEach((p) => {
    (p.activities || []).forEach((a) => {
      [a.baselineStart, a.baselineEnd, a.start, a.end]
        .filter(Boolean)
        .forEach((d) => {
          const t = new Date(d).getTime();
          if (!Number.isNaN(t)) stamps.push(t);
        });
    });
  });

  if (!stamps.length) {
    const today = startOfDay(new Date());
    return { min: today, max: addDays(today, 6) };
  }

  const min = startOfDay(new Date(Math.min(...stamps)));
  const max = startOfDay(new Date(Math.max(...stamps)));
  return { min, max };
}

/* -------- Build tasks for dhtmlx-gantt ---------- */
function buildTasksFromData(data) {
  const isArray = Array.isArray(data);
  const looksNested =
    isArray && data.length > 0 && Array.isArray(data[0]?.activities);

  let projects = [];

  if (looksNested) {
    projects = data.map((p) => ({
      project_code: p.project_code ?? "—",
      project_name: p.project_name ?? "",
      activities: Array.isArray(p.activities) ? p.activities : [],
    }));
  } else if (isArray) {
    const byProject = new Map();
    for (const row of data) {
      const pcode = row.project_code ?? "—";
      const pname = row.project_name ?? "";
      const key = `${pcode}::${pname}`;
      if (!byProject.has(key)) {
        byProject.set(key, {
          project_code: pcode,
          project_name: pname,
          activities: [],
        });
      }
      byProject.get(key).activities.push({
        name: row.name ?? row.activity_name ?? "Activity",
        baselineStart: row.baselineStart ?? row.planned_start ?? null,
        baselineEnd: row.baselineEnd ?? row.planned_end ?? null,
        start: row.start ?? row.actual_start ?? null,
        end: row.end ?? row.actual_end ?? null,
        progress:
          typeof row.progress === "number"
            ? row.progress
            : typeof row.percent_complete === "number"
            ? row.percent_complete / 100
            : 0,
        status: row.status ?? row.current_status ?? "",
        completed:
          String(row.status || "").toLowerCase() === "done" ||
          row.completed === true ||
          (typeof row.progress === "number" && row.progress >= 1) ||
          (typeof row.percent_complete === "number" &&
            row.percent_complete >= 100),
      });
    }
    projects = Array.from(byProject.values());
  } else {
    projects = [];
  }

  const tasks = [];
  let id = 1;

  for (const proj of projects) {
    const projId = id++;
    tasks.push({
      id: projId,
      text: proj.project_code,
      type: "project",
      open: true,
      readonly: true,
      _pname: proj.project_name || "",
      _rowkind: "project",
    });

    for (const a of proj.activities) {
      const parentActivityId = id++;

      const bS = a.baselineStart ? new Date(a.baselineStart) : null;
      const bE = a.baselineEnd ? new Date(a.baselineEnd) : null;
      const sA = a.start ? new Date(a.start) : null;
      const eA = a.end ? new Date(a.end) : null;

      const seed =
        (isValidDate(bS) && bS) || (isValidDate(sA) && sA) || new Date();

      const labelStart = seed;
      const labelEnd =
        (isValidDate(bE) && toExclusiveEnd(bE)) ||
        (isValidDate(eA) && toExclusiveEnd(eA)) ||
        addDays(seed, 1);

      tasks.push({
        id: parentActivityId,
        parent: projId,
        text: a.name || "Activity",
        type: "task",
        open: true,
        readonly: true,
        _rowkind: "activity-label",
        start_date: fmtISODate(labelStart),
        end_date: fmtISODate(labelEnd),
      });

      if (isValidDate(bS) && isValidDate(bE)) {
        tasks.push({
          id: id++,
          parent: parentActivityId,
          text: "Baseline",
          start_date: fmtISODate(bS),
          end_date: fmtISODate(toExclusiveEnd(bE)),
          readonly: true,
          _rowkind: "baseline",
        });
      }

      const hasActual = isValidDate(sA) || isValidDate(eA);

      if (hasActual) {
        const completed =
          a.completed === true ||
          (typeof a.progress === "number" && a.progress >= 1) ||
          String(a.status || "").toLowerCase() === "done";
        const onTime =
          completed &&
          isValidDate(eA) &&
          isValidDate(bE) &&
          isOnOrBefore(eA, bE);

        let actualState = "running";
        if (completed && onTime) actualState = "ontime";
        else if (completed && !onTime) actualState = "late";

        tasks.push({
          id: id++,
          parent: parentActivityId,
          text: "Actual",
          start_date: isValidDate(sA) ? fmtISODate(sA) : null,
          end_date: isValidDate(eA) ? fmtISODate(toExclusiveEnd(eA)) : null,
          progress:
            typeof a.progress === "number" ? a.progress : completed ? 1 : 0,
          readonly: true,
          _rowkind: "actual",
          _actual_state: actualState,
        });
      }
    }
  }

  return tasks;
}

/* ------- Filter for fullscreen legend clicks ------- */
function filterTasksByLayer(tasks, layer) {
  if (layer === "all") return tasks;

  // index & parent->children
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const children = new Map();
  for (const t of tasks) {
    if (!t.parent) continue;
    if (!children.has(t.parent)) children.set(t.parent, []);
    children.get(t.parent).push(t);
  }

  const selectedProjects = new Set();
  const selectedLabels = new Set();
  const selectedTasks = new Set();

  const wantActualOnTime = layer === "actual_ontime";
  const wantActualLate = layer === "actual_late";
  const wantBaselineOnly = layer === "baseline";

  for (const label of tasks) {
    if (label._rowkind !== "activity-label") continue;

    const kids = children.get(label.id) || [];
    const baseline = kids.find((k) => k._rowkind === "baseline");
    const actual = kids.find((k) => k._rowkind === "actual");

    let include = false;
    if (wantBaselineOnly && baseline) include = true;
    if (wantActualOnTime && actual && actual._actual_state === "ontime")
      include = true;
    if (wantActualLate && actual && actual._actual_state === "late")
      include = true;

    if (!include) continue;

    selectedLabels.add(label.id);
    const projId = label.parent;
    if (projId) selectedProjects.add(projId);

    if (baseline) selectedTasks.add(baseline.id);
    if (actual) {
      if (
        (!wantBaselineOnly &&
          ((wantActualOnTime && actual._actual_state === "ontime") ||
            (wantActualLate && actual._actual_state === "late"))) ||
        (!wantActualOnTime && !wantActualLate && !wantBaselineOnly)
      ) {
        selectedTasks.add(actual.id);
      }
    }
  }

  const out = [];
  for (const t of tasks) {
    if (t._rowkind === "project") {
      if (selectedProjects.has(t.id)) out.push(t);
      continue;
    }
    if (t._rowkind === "activity-label") {
      if (selectedLabels.has(t.id)) out.push(t);
      continue;
    }
    if (selectedTasks.has(t.id)) out.push(t);
  }
  return out;
}

/* Scales */
function makeScales(view) {
  const yyyy = new Date().getFullYear();
  const fmt = gantt.date.date_to_str;
  if (view === "week") {
    const dayFull = fmt("%d %M %Y");
    const dayNoY = fmt("%d %M");
    return [
      {
        unit: "day",
        step: 1,
        format: (d) => (d.getFullYear() === yyyy ? dayNoY(d) : dayFull(d)),
      },
      { unit: "day", step: 1, format: "%D" },
    ];
  }
  if (view === "month") {
    const m = fmt("%F");
    const my = fmt("%F %Y");
    return [
      {
        unit: "month",
        step: 1,
        format: (d) => (d.getFullYear() === yyyy ? m(d) : my(d)),
      },
      {
        unit: "week",
        step: 1,
        format: (d) => `W${gantt.date.date_to_str("%W")(d)}`,
      },
    ];
  }
  if (view === "year") {
    return [
      { unit: "year", step: 1, format: "%Y" },
      { unit: "month", step: 1, format: "%M" },
    ];
  }
  return [
    { unit: "month", step: 1, format: "%F %Y" },
    {
      unit: "week",
      step: 1,
      format: (d) => `W${gantt.date.date_to_str("%W")(d)}`,
    },
  ];
}

/* ---------------- Component ---------------- */
export default function WeeklyProjectTimelineCard({
  data = [],
  title = "Calendar — Selected Range",
  range, // { start, end } inclusive
  onRangeChange, // (baselineStart, baselineEnd)
  layerFilter: layerFilterProp, // 'all' | 'baseline' | 'actual_ontime' | 'actual_late'
  onLayerFilterChange, // (value) => void
}) {
  const cardContainerRef = useRef(null);
  const modalContainerRef = useRef(null);

  const [view, setView] = useState("week");
  const [open, setOpen] = useState(false);

  const isControlled = typeof layerFilterProp === "string";
  const [layerFilter, setLayerFilter] = useState(layerFilterProp ?? "all");
  useEffect(() => {
    if (isControlled) setLayerFilter(layerFilterProp);
  }, [isControlled, layerFilterProp]);

  const setFilter = (key) => {
    const next = key; // no toggle; explicit pick incl. 'all'
    if (!isControlled) setLayerFilter(next);
    onLayerFilterChange?.(next);
  };

  const { min: dataMin, max: dataMax } = useMemo(
    () => getMinMaxFromData(data),
    [data]
  );

  const safeDefaultSelection = useMemo(() => {
    if (range?.start && range?.end) {
      const s = startOfDay(new Date(range.start));
      const e = startOfDay(new Date(range.end));
      return {
        startDate: isValidDate(s) ? s : dataMin,
        endDate: isValidDate(e) ? e : dataMax,
        key: "selection",
      };
    }
    return { startDate: dataMin, endDate: dataMax, key: "selection" };
  }, [range, dataMin, dataMax]);

  const [rangeOpen, setRangeOpen] = useState(false);
  const [selection, setSelection] = useState(safeDefaultSelection);

  useEffect(() => {
    const nextS = safeDefaultSelection.startDate?.getTime?.() ?? null;
    const nextE = safeDefaultSelection.endDate?.getTime?.() ?? null;
    const curS = selection?.startDate?.getTime?.() ?? null;
    const curE = selection?.endDate?.getTime?.() ?? null;

    if (nextS !== curS || nextE !== curE) {
      setSelection(safeDefaultSelection);
    }
  }, [
    safeDefaultSelection.startDate?.getTime?.(),
    safeDefaultSelection.endDate?.getTime?.(),
  ]);

  const baseRange = useMemo(() => {
    const s = selection?.startDate;
    const e = selection?.endDate;
    const start = isValidDate(s)
      ? startOfDay(s)
      : startOfDay(new Date(dataMin));
    const endInc = isValidDate(e)
      ? startOfDay(e)
      : startOfDay(new Date(dataMax));
    return { start, end: addDays(endInc, 1) };
  }, [selection, dataMin, dataMax]);

  const tasksMemo = useMemo(() => buildTasksFromData(data), [data]);

  const displayTasks = useMemo(() => {
    if (!open) return tasksMemo;
    return filterTasksByLayer(tasksMemo, layerFilter);
  }, [open, tasksMemo, layerFilter]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const initedWithRef = useRef(null);

  useEffect(() => {
    const container = open
      ? modalContainerRef.current
      : cardContainerRef.current;
    if (!container) return;

    const needInit = initedWithRef.current !== container;
    if (needInit) {
      gantt.plugins({ tooltip: true });
      gantt.config.xml_date = "%Y-%m-%d";
      gantt.config.readonly = true;
      gantt.config.drag_move = false;
      gantt.config.drag_progress = false;
      gantt.config.drag_links = false;

      gantt.config.show_chart_scroll = true;
      gantt.config.show_grid_scroll = true;
      gantt.config.smart_rendering = true;
      gantt.config.preserve_scroll = true;
      gantt.config.row_height = 44;
      gantt.config.bar_height = 22;
      gantt.config.open_tree_initially = true;

      gantt.config.columns = [
        {
          name: "text",
          label: "PROJECT / ACTIVITY",
          tree: true,
          width: 260,
          template: (task) => {
            if (task._rowkind === "project") {
              const name = task._pname
                ? `<span style="opacity:.7;font-weight:500;"> ${task._pname}</span>`
                : "";
              return `<span style="font-weight:800;">${task.text}</span>${name}`;
            }
            return task.text;
          },
        },
      ];

      const df = gantt.date.date_to_str("%d/%m/%Y");
      gantt.templates.tooltip_text = (start, end, task) => {
        const endInc = addDays(end, -1);
        if (task._rowkind === "baseline") {
          return `<b>${task.text}</b><br/>${df(start)} – ${df(
            endInc
          )} (baseline)`;
        }
        if (task._rowkind === "actual") {
          const state =
            task._actual_state === "ontime"
              ? "on time"
              : task._actual_state === "late"
              ? "late"
              : "in progress";
          return `<b>${task.text}</b><br/>${df(start)} – ${df(
            endInc
          )} (actual, ${state})`;
        }
        if (task._rowkind === "activity-label") {
          return `<b>${task.text}</b><br/>${df(start)} – ${df(endInc)}`;
        }
        return `<b>${task.text}</b>`;
      };

      gantt.templates.task_text = (start, end, task) => {
        const days = daysBetweenExclusive(start, end);
        const suffix =
          typeof days === "number"
            ? ` (${days} day${days === 1 ? "" : "s"})`
            : "";
        return `${task.text || ""}${suffix}`;
      };

      gantt.templates.task_class = (_s, _e, task) => {
        if (task._rowkind === "baseline") return "row-baseline";
        if (task._rowkind === "actual") {
          if (task._actual_state === "ontime")
            return "row-actual row-actual-ontime";
          if (task._actual_state === "late")
            return "row-actual row-actual-late";
          return "row-actual row-actual-running";
        }
        if (task._rowkind === "activity-label") return "row-activity";
        return "";
      };

      gantt.templates.timeline_cell_class = function (_task, date) {
        return [0, 6].includes(date.getDay()) ? "gantt-weekend" : "";
      };

      gantt.init(container);
      initedWithRef.current = container;
    }

    gantt.batchUpdate(() => {
      gantt.config.scales = makeScales(view);
      gantt.config.start_date = baseRange.start;
      gantt.config.end_date = baseRange.end;

      gantt.clearAll();
      gantt.parse({ data: displayTasks });
    });

    const keepScrollAndRender = () => {
      const area = gantt.$task_data;
      const x = area?.scrollLeft ?? 0;
      const y = area?.scrollTop ?? 0;
      const ps = gantt.config.preserve_scroll;
      gantt.config.preserve_scroll = false;
      gantt.render();
      gantt.config.preserve_scroll = ps;
      area?.scrollTo(x, y);
    };
    const h1 = gantt.attachEvent("onTaskOpened", keepScrollAndRender);
    const h2 = gantt.attachEvent("onTaskClosed", keepScrollAndRender);

    const onResize = () => gantt.render();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      gantt.detachEvent(h1);
      gantt.detachEvent(h2);
    };
  }, [
    displayTasks,
    view,
    baseRange.start?.getTime?.(),
    baseRange.end?.getTime?.(),
    open,
  ]);

  const applyRange = () => {
    const s = selection?.startDate;
    const e = selection?.endDate;
    if (!isValidDate(s) || !isValidDate(e)) {
      setRangeOpen(false);
      return;
    }
    const newStart = startOfDay(s);
    const newEndEx = addDays(startOfDay(e), 1);

    if (
      gantt.$container &&
      (+gantt.config.start_date !== +newStart ||
        +gantt.config.end_date !== +newEndEx)
    ) {
      gantt.batchUpdate(() => {
        const ps = gantt.config.preserve_scroll;
        gantt.config.start_date = newStart;
        gantt.config.end_date = newEndEx;
        gantt.config.preserve_scroll = false;
        gantt.render();
        gantt.config.preserve_scroll = ps;
      });
    }

    onRangeChange?.(ymd(s), ymd(e));
    setRangeOpen(false);
  };

  return (
    <>
      <Card
        variant="soft"
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 28,
          p: { xs: 1, sm: 0.5, md: 1.5 },
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: "rgba(15,23,42,0.08)",
          boxShadow:
            "0 2px 6px rgba(15,23,42,0.06), 0 18px 32px rgba(15,23,42,0.06)",
          transition: "transform .16s ease, box-shadow .16s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
          },
          maxHeight: 500,
        }}
      >
        <CardOverflow sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            flexWrap="wrap"
          >
            <Typography level="title-lg">{title}</Typography>

            {/* Small header chips (also control backend filter) */}
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="sm"
                variant={layerFilter === "baseline" ? "solid" : "soft"}
                color="neutral"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("baseline")}
              >
                Baseline
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "actual_ontime" ? "solid" : "soft"}
                color="success"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("actual_ontime")}
              >
                Actual (on time)
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "actual_late" ? "solid" : "soft"}
                color="danger"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("actual_late")}
              >
                Actual (late)
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "all" ? "solid" : "soft"}
                color="primary"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("all")}
              >
                All
              </Chip>

              <Button
                size="sm"
                variant="soft"
                onClick={() => setRangeOpen((v) => !v)}
              >
                {selection?.startDate && selection?.endDate
                  ? `${ymd(selection.startDate)} → ${ymd(selection.endDate)}`
                  : "Custom Range"}
              </Button>

              <IconButton
                size="sm"
                variant="plain"
                onClick={() => setOpen(true)}
                title="Full screen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H5v4H3V3h6v2Zm12 4h-2V5h-4V3h6v6ZM5 19h4v2H3v-6h2v4Zm12-4h2v4h-4v2h6v-6h-4Z"
                    fill="currentColor"
                  />
                </svg>
              </IconButton>
            </Stack>
          </Stack>

          {rangeOpen && (
            <Sheet
              variant="outlined"
              sx={{
                position: "absolute",
                top: 56,
                right: 16,
                zIndex: 2000,
                borderRadius: 12,
                p: 1,
                bgcolor: "#fff",
                border: "1px solid rgba(2,6,23,0.08)",
                boxShadow: "0 12px 32px rgba(0,0,0,.12)",
              }}
            >
              <DateRange
                ranges={[
                  {
                    startDate: selection?.startDate ?? dataMin,
                    endDate: selection?.endDate ?? dataMax,
                    key: "selection",
                  },
                ]}
                onChange={(r) => {
                  const s = r?.selection?.startDate;
                  const e = r?.selection?.endDate;
                  setSelection((prev) => ({
                    ...(prev || { key: "selection" }),
                    startDate: isValidDate(s) ? startOfDay(s) : dataMin,
                    endDate: isValidDate(e) ? startOfDay(e) : dataMax,
                    key: "selection",
                  }));
                }}
                moveRangeOnFirstSelection={false}
                editableDateInputs
                rangeColors={["#2563eb"]}
              />
              <Stack
                direction="row"
                justifyContent="flex-end"
                gap={1}
                sx={{ mt: 1 }}
              >
                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => setRangeOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={applyRange}>
                  Apply
                </Button>
              </Stack>
            </Sheet>
          )}
        </CardOverflow>

        <CardContent sx={{ p: 0 }}>
          <Box
            ref={cardContainerRef}
            sx={{
              height: 440,
              "& .gantt_grid_header .gantt_grid_head_cell": {
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Fullscreen */}
      {open && (
        <Sheet
          variant="outlined"
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            background: "#fff",
            borderRadius: 0,
            boxShadow: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 1.25, pb: 0.75 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              flexWrap="wrap"
            >
              <Typography level="title-md">{title}</Typography>

              {/* LEGEND CHIPS — fullscreen filtering */}
              <Chip
                size="sm"
                variant={layerFilter === "baseline" ? "solid" : "soft"}
                color="neutral"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("baseline")}
              >
                Baseline
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "actual_ontime" ? "solid" : "soft"}
                color="success"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("actual_ontime")}
              >
                Actual (on time)
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "actual_late" ? "solid" : "soft"}
                color="danger"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("actual_late")}
              >
                Actual (late)
              </Chip>
              <Chip
                size="sm"
                variant={layerFilter === "all" ? "solid" : "soft"}
                color="primary"
                sx={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => setFilter("all")}
              >
                All
              </Chip>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1.25}>
              {["week", "month", "year", "all"].map((v) => (
                <Chip
                  key={v}
                  size="sm"
                  variant={view === v ? "solid" : "soft"}
                  color={view === v ? "primary" : "neutral"}
                  sx={{
                    fontWeight: 700,
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                  onClick={() => setView(v)}
                >
                  {v}
                </Chip>
              ))}

              <IconButton
                size="sm"
                variant="plain"
                onClick={() => setOpen(false)}
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18.3 5.7 12 12m0 0-6.3 6.3M12 12l6.3 6.3M12 12 5.7 5.7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </Stack>
          </Stack>

          <Box ref={modalContainerRef} sx={{ flex: 1 }} />
        </Sheet>
      )}

      <style>{`
        .gantt-weekend { background-color: rgba(15, 23, 42, 0.04); }
        .gantt_task_line.row-baseline {
          height: 22px !important;
          border-radius: 999px !important;
          background: #9AA3B2;
          border: 1px dashed #6B7280;
          color: #fff;
        }
        .gantt_task_line.row-actual {
          height: 22px !important;
          border-radius: 999px !important;
          color: #fff;
          font-weight: 600;
        }
        .gantt_task_line.row-actual-running {
          background: #3B82F6;
          border: 1px solid #1D4ED8;
        }
        .gantt_task_line.row-actual-ontime {
          background: #22C55E;
          border: 1px solid #16A34A;
        }
        .gantt_task_line.row-actual-late {
          background: #EF4444;
          border: 1px solid #B91C1C;
        }
        .gantt_task_line.row-activity {
          background: rgba(37, 99, 235, 0.40) !important;
          border: 1px solid #1D4ED8 !important;
          height: 22px !important;
          border-radius: 999px !important;
        }
        .gantt_task_line.row-activity .gantt_task_content {
          color: #fff !important;
          font-weight: 700;
          text-shadow: 0 1px 0 rgba(0,0,0,0.18);
        }
      `}</style>
    </>
  );
}
