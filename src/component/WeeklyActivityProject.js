// WeeklyGanttCardDhtmlx.jsx
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
} from "@mui/joy";

import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { gantt } from "dhtmlx-gantt";

/* ---------------- Helpers ---------------- */
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}
function toExclusiveEnd(incEnd) {
  return addDays(new Date(incEnd), 1);
}
function fmtISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isOnOrBefore(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return da.getTime() <= db.getTime();
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { min: today, max: addDays(today, 6) };
  }
  const min = new Date(Math.min(...stamps));
  const max = new Date(Math.max(...stamps));
  min.setHours(0, 0, 0, 0);
  max.setHours(0, 0, 0, 0);
  return { min, max };
}
function buildTasksFromData(data) {
  const tasks = [];
  let id = 1;
  (data || []).forEach((proj) => {
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
    (proj.activities || []).forEach((a) => {
      const parentActivityId = id++;
      tasks.push({
        id: parentActivityId,
        parent: projId,
        text: a.name,
        type: "task",
        open: true,
        readonly: true,
        _rowkind: "activity-label",
      });
      if (a.baselineStart && a.baselineEnd) {
        tasks.push({
          id: id++,
          parent: parentActivityId,
          text: "Baseline",
          start_date: fmtISODate(a.baselineStart),
          end_date: fmtISODate(toExclusiveEnd(a.baselineEnd)),
          readonly: true,
          _rowkind: "baseline",
        });
      }
      const completed =
        String(a.status || "").toLowerCase() === "done" ||
        a.completed === true ||
        (typeof a.progress === "number" && a.progress >= 1);
      const onTime =
        completed &&
        a.end &&
        a.baselineEnd &&
        isOnOrBefore(a.end, a.baselineEnd);

      let actualState = "running";
      if (completed && onTime) actualState = "ontime";
      else if (completed && !onTime) actualState = "late";

      tasks.push({
        id: id++,
        parent: parentActivityId,
        text: "Actual",
        start_date: a.start ? fmtISODate(a.start) : null,
        end_date: a.end ? fmtISODate(toExclusiveEnd(a.end)) : null,
        progress:
          typeof a.progress === "number" ? a.progress : completed ? 1 : 0,
        readonly: true,
        _rowkind: "actual",
        _actual_state: actualState,
      });
    });
  });
  return tasks;
}

/* ---- NEW: v9+ scale builder (no obsolete scale config) ---- */
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
  // 'all'
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
export default function WeeklyGanttCardDhtmlx({
  data = [],
  title = "Calendar",
}) {
  const cardContainerRef = useRef(null);
  const modalContainerRef = useRef(null);

  const [view, setView] = useState("week");
  const [open, setOpen] = useState(false);

  const { min: dataMin, max: dataMax } = useMemo(
    () => getMinMaxFromData(data),
    [data]
  );


  const baseRange = useMemo(() => {
    if (view === "week") {
      const d = new Date(dataMin);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday start
      const start = addDays(d, diff);
      const end = addDays(start, 7);
      return { start, end };
    }
    if (view === "month") {
      const start = new Date(dataMin.getFullYear(), dataMin.getMonth(), 1);
      const end = new Date(dataMax.getFullYear(), dataMax.getMonth() + 1, 1);
      return { start: addDays(start, -1), end: addDays(end, 2) };
    }
    if (view === "year") {
      const start = new Date(dataMin.getFullYear(), 0, 1);
      const end = new Date(dataMax.getFullYear() + 1, 0, 1);
      return { start: addDays(start, -7), end: addDays(end, 7) };
    }
    // 'all'
    return { start: addDays(dataMin, -14), end: addDays(dataMax, 14) };
  }, [view, dataMin, dataMax]);

  // guards for infinite time-axis
  const extendingRef = useRef(false);
  const lastExtendAtRef = useRef(0);

  const STEP_DAYS = (v) =>
    v === "week" ? 14 : v === "month" ? 60 : v === "year" ? 365 * 2 : 90;

  function extendTimeline(direction, currentView) {
    if (extendingRef.current) return;
    extendingRef.current = true;

    const step = STEP_DAYS(currentView);
    const prevStart = gantt.config.start_date;
    const prevEnd = gantt.config.end_date;

    const area = gantt.$task_data;
    if (!area) {
      extendingRef.current = false;
      return;
    }
    const { scrollLeft, scrollTop } = area;

    const posFromDate = (d) => gantt.posFromDate(d);

    if (direction === "left") {
      const newStart = addDays(prevStart, -step);
      const addedPx = posFromDate(prevStart) - posFromDate(newStart);
      gantt.config.start_date = newStart;
      gantt.render();
      area.scrollTo(scrollLeft + addedPx + 40, scrollTop);
    } else {
      gantt.config.end_date = addDays(prevEnd, step);
      gantt.render();
      area.scrollTo(scrollLeft, scrollTop);
    }

    lastExtendAtRef.current = Date.now();
    setTimeout(() => (extendingRef.current = false), 60);
  }

  useEffect(() => {
    const container = open
      ? modalContainerRef.current
      : cardContainerRef.current;
    if (!container) return;

    gantt.clearAll();

    // Core config
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

    // Grid
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

    gantt.config.scales = makeScales(view);

    gantt.config.start_date = new Date(baseRange.start);
    gantt.config.end_date = new Date(baseRange.end);

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
      return `<b>${task.text}</b>`;
    };

    gantt.templates.task_class = (_s, _e, task) => {
      if (task._rowkind === "baseline") return "row-baseline";
      if (task._rowkind === "actual") {
        if (task._actual_state === "ontime")
          return "row-actual row-actual-ontime";
        if (task._actual_state === "late") return "row-actual row-actual-late";
        return "row-actual row-actual-running";
      }
      return "";
    };

    gantt.templates.timeline_cell_class = function (_task, date) {
      return [0, 6].includes(date.getDay()) ? "gantt-weekend" : "";
    };

    gantt.init(container);
    gantt.parse({ data: buildTasksFromData(data) });

    const area = gantt.$task_data;
    const THRESH = 200; 
    const COOL = 150; 

    const onScroll = () => {
      if (!area) return;
      if (extendingRef.current) return;
      if (Date.now() - lastExtendAtRef.current < COOL) return;

      const { scrollLeft, clientWidth, scrollWidth } = area;
      const leftDist = scrollLeft;
      const rightDist = scrollWidth - (scrollLeft + clientWidth);

      if (leftDist < THRESH) {
        extendTimeline("left", view);
      } else if (rightDist < THRESH) {
        extendTimeline("right", view);
      }
    };
    area?.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => gantt.render();
    window.addEventListener("resize", onResize);

    return () => {
      area?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      gantt.clearAll();
    };
  }, [data, view, baseRange, open]);

  return (
    <>
      {/* Card (only expand icon here) */}
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
          >
            <Typography level="title-lg">{title}</Typography>
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => setOpen(true)}
              title="Full screen"
            >
              {/* expand icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H5v4H3V3h6v2Zm12 4h-2V5h-4V3h6v6ZM5 19h4v2H3v-6h2v4Zm12-4h2v4h-4v2h6v-6h-4Z"
                  fill="currentColor"
                />
              </svg>
            </IconButton>
          </Stack>
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

      {/* Fullscreen Overlay */}
      {open && (
        <Sheet
          variant="outlined"
          sx={{
            position: "fixed",
            inset: 12,
            zIndex: 1400,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 12px 48px rgba(0,0,0,.18)",
            border: "1px solid rgba(15,23,42,0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header: legend + view tabs + close */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 1.25, pb: 0.75 }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Typography level="title-md">{title}</Typography>
              <Chip
                size="sm"
                variant="soft"
                color="neutral"
                sx={{ fontWeight: 700 }}
              >
                Baseline
              </Chip>
              <Chip
                size="sm"
                variant="soft"
                color="success"
                sx={{ fontWeight: 700 }}
              >
                Actual (on time)
              </Chip>
              <Chip
                size="sm"
                variant="soft"
                color="danger"
                sx={{ fontWeight: 700 }}
              >
                Actual (late)
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
                {/* close X */}
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

          {/* Gantt body */}
          <Box
            ref={modalContainerRef}
            sx={{
              flex: 1,
              m: 1,
              mt: 0.5,
              borderRadius: 12,
              border: "1px solid rgba(2,6,23,0.08)",
            }}
          />
        </Sheet>
      )}

      {/* Styles */}
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
      `}</style>
    </>
  );
}
