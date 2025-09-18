import { useEffect, useMemo, useRef, useState } from "react";
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
import { useGetProjectActivityByProjectIdQuery } from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";

/* ============ helpers ============ */
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
const diffDaysInclusiveISO = (sISO, eISO) => {
  const s = parseISOAsLocalDate(sISO);
  const e = parseISOAsLocalDate(eISO);
  if (!s || !e) return 0;
  const ms = e - s;
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

function parseISOAsLocalDate(isoStr) {
  if (!isoStr) return null;
  const [yyyy, mm, dd] = isoStr.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd, 0, 0, 0); // 👈 local midnight
}
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

/* ============ right-panel row component ============ */
function DepRow({ title, options, row, onChange, onRemove }) {
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
          onChange({ ...row, activityId: val?.value || "" })
        }
        sx={{ minWidth: 180, flex: 1 }}
        slotProps={{
          listbox: {
            sx: { zIndex: 1401 },
          },
        }}
      />
      <Select
        size="sm"
        value={row.type}
        onChange={(_, v) => onChange({ ...row, type: v || "FS" })}
        sx={{ width: 90 }}
        slotProps={{
          listbox: {
            sx: { zIndex: 1401 },
          },
        }}
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

/* ============ main component ============ */
const View_Project_Management = ({ viewModeParam = "week" }) => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState(viewModeParam);
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project_id");
  const { data: apiData } = useGetProjectActivityByProjectIdQuery(projectId, {
    skip: !projectId,
  });

  const paWrapper = apiData?.projectactivity || apiData || {};
  const paList = Array.isArray(paWrapper.activities)
    ? paWrapper.activities
    : Array.isArray(paWrapper)
    ? paWrapper
    : [];
  const projectMeta = paWrapper.project_id || apiData?.project || {};

  /* ---------- map API -> gantt payload ---------- */
  const ganttPayload = useMemo(() => {
    const byMasterToPA = new Map();

    const data = paList.map((pa) => {
      const paId = String(pa._id || pa.id || "");
      const master = pa.activity_id || pa.master_activity_id || {};
      const masterId = String(master?._id || master?.id || "");
      if (masterId && paId) byMasterToPA.set(masterId, paId);

      const text = master?.name || pa.name || pa.activity_name || "—";
      const sISO = pa.planned_start || pa.start_date || pa.start || null;
      const eISO = pa.planned_finish || pa.end_date || pa.end || null;

      const startDateObj = sISO ? parseISOAsLocalDate(sISO) : null;
      const endDateObj = eISO ? parseISOAsLocalDate(eISO) : null;

      const duration =
        Number(pa.duration) ||
        (startDateObj && endDateObj
          ? diffDaysInclusiveISO(startDateObj, endDateObj)
          : 0);

      const hadStart = !!startDateObj;
      const unscheduled = !hadStart && !duration;
      const internalStart = hadStart ? startDateObj : new Date();

      // basic status fallback
      const status = pa.current_status?.status || "not started";

      return {
        id: paId || `tmp-${Math.random().toString(36).slice(2)}`,
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
        _end_dmy: endDateObj ? toDMY(endDateObj) : "", // ✅ keep grid in dd-mm-yyyy
        _unscheduled: unscheduled,
        _status: status,
      };
    });

    let lid = 1;
    const links = [];
    paList.forEach((pa) => {
      const preds = Array.isArray(pa.predecessors) ? pa.predecessors : [];
      preds.forEach((p) => {
        const srcMaster = String(p.activity_id || p.master_activity_id || "");
        const srcPaId = byMasterToPA.get(srcMaster);
        const targetPaId = String(pa._id || pa.id || "");
        if (srcPaId && targetPaId) {
          const typeCode = labelToType[(p.type || "FS").toUpperCase()] ?? "0";
          links.push({
            id: lid++,
            source: String(srcPaId),
            target: String(targetPaId),
            type: typeCode,
            lag: Number(p.lag || 0),
          });
        }
      });
    });

    return { data, links };
  }, [paList]);

  /* ---------- header min/max ---------- */
  const minStartDMY = useMemo(() => {
    const nums = (ganttPayload.data || [])
      .filter((t) => t._hadStart)
      .map((t) => (t.start_date instanceof Date ? t.start_date.getTime() : null))
      .filter((n) => Number.isFinite(n));
    if (!nums.length) return "—";
    return toDMY(new Date(Math.min(...nums)));
  }, [ganttPayload]);

 const maxEndDMY = useMemo(() => {
  const ends = (ganttPayload.data || []).map((t) => {
    if (t._end_dmy) return parseDMY(t._end_dmy); // still fine, because _end_dmy is dd-mm-yyyy
    if (t._hadStart && Number(t.duration) > 0) {
      const s = t.start_date instanceof Date ? t.start_date : null; // ✅ use Date directly
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
}, [ganttPayload]);


  /* ---------- RIGHT PANEL STATE ---------- */
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    status: "not started",
    start: "",
    end: "",
    duration: "",
    predecessors: [], // { activityId, type, lag }
    successors: [], // { activityId, type, lag }
  });

  // Options for activity pickers
  const activityOptions = useMemo(
    () =>
      (ganttPayload.data || []).map((t) => ({
        value: String(t.id),
        label: t.text,
      })),
    [ganttPayload]
  );

  // load current task -> form
  const loadTaskIntoForm = (taskId) => {
    const task = gantt.getTask(taskId);
    if (!task) return;
    const incoming = gantt
      .getLinks()
      .filter((l) => String(l.target) === String(taskId));
    const outgoing = gantt
      .getLinks()
      .filter((l) => String(l.source) === String(taskId));

    setForm({
      status: task._status || "not started",
      start: task.start_date
        ? gantt.date.date_to_str("%Y-%m-%d")(task.start_date) // 👈 ISO for input
        : "",
      end: task._end_dmy
        ? task._end_dmy.split("-").reverse().join("-") // dd-mm-yyyy → yyyy-mm-dd
        : "",
      duration: task.duration || "",
      predecessors: incoming.map((l) => ({
        activityId: String(l.source),
        type: typeToLabel[String(l.type)] || "FS",
        lag: Number(l.lag || 0),
      })),
      successors: outgoing.map((l) => ({
        activityId: String(l.target),
        type: typeToLabel[String(l.type)] || "FS",
        lag: Number(l.lag || 0),
      })),
    });
  };

  // Apply form -> gantt
  const applyForm = () => {
    if (!selectedId) return;
    const task = gantt.getTask(selectedId);
    if (!task) return;

    let newDuration = Number(form.duration || 0);
    let startDate = form.start ? parseISOAsLocalDate(form.start) : null;
    let endDate = form.end ? parseISOAsLocalDate(form.end) : null;

    if (startDate && endDate && !newDuration) {
      newDuration = Math.floor((endDate - startDate) / 86400000) + 1;
    } else if (startDate && newDuration && !endDate) {
      endDate = gantt.calculateEndDate({
        start_date: startDate,
        duration: newDuration,
      });
    } else if (endDate && newDuration && !startDate) {
      startDate = gantt.calculateEndDate({
        start_date: endDate,
        duration: -newDuration + 1,
      });
    }

    // ✅ Gantt must always have Date objects
    task.start_date = startDate || new Date();
    task.duration = Number.isFinite(newDuration) ? newDuration : 0;
    task._hadStart = !!startDate;
    task._unscheduled = !startDate && !newDuration;
    task._end_dmy = endDate ? toDMY(endDate) : "";
    task._status = form.status;

    gantt.updateTask(selectedId);
    gantt.render();
  };

  /* ---------- init gantt once ---------- */
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
    const today = new Date();
    gantt.config.start_date = new Date(
      today.getFullYear() - 2,
      today.getMonth(),
      today.getDate()
    );
    gantt.config.end_date = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );

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

    // hide bars for unscheduled rows
    gantt.templates.task_class = (_, __, task) =>
      task._unscheduled ? "gantt-task-unscheduled" : "";

    // select -> open panel
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

  // feed data whenever API changes
  useEffect(() => {
    gantt.clearAll();
    gantt.parse(ganttPayload);
  }, [ganttPayload]);

  // scale / headers
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
        ml: { lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        p: 0,
      }}
    >
      {/* Hide bars for unscheduled rows */}
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
            <Chip
              color="primary"
              size="sm"
              variant="solid"
              sx={{ fontWeight: 700 }}
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
            px: 1,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Timelapse fontSize="small" color="primary" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Remaining:
            </Typography>
            {/* <RemainingDaysChip
              project={{
                bd_commitment_date: projectMeta?.bd_commitment_date,
                completion_date: projectMeta?.completion_date,
                project_completion_date: projectMeta?.project_completion_date,
              }}
            /> */}
          </Box>
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
            <EventOutlinedIcon fontSize="small" color="success" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Start Date:
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
              End Date:
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

      {/* Main area: Gantt (left) + Form (right) */}
      {/* Gantt */}
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

      {/* Right panel */}
      {selectedId && (
        <Sheet
          variant="outlined"
          sx={{
            position: "fixed",
            overflow: "auto",
            height: "80vh",
            p: 2,
            borderRadius: "md",
            transition: "width 0.2s",
            zIndex: 1400,
            right: 16,
            top: 80,
            bottom: 16,
            width: 380,
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
                slotProps={{
                  listbox: {
                    sx: { zIndex: 1401 },
                  },
                }}
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
                    const startISO = e.target.value; // yyyy-mm-dd
                    setForm((f) => {
                      let endISO = f.end;
                      if (startISO && f.duration) {
                        const s = parseISOAsLocalDate(startISO); // ✅ Date object
                        if (!isNaN(s)) {
                          const eDate = gantt.calculateEndDate({
                            start_date: s,
                            duration: Number(f.duration),
                          });
                          endISO = gantt.date.date_to_str("%Y-%m-%d")(eDate); // store as ISO
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
                        const s = parseISOAsLocalDate(f.start); // ✅ Date object
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
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      predecessors: [
                        ...f.predecessors,
                        { activityId: "", type: "FS", lag: 0 },
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
                  />
                ))}
              </Stack>
            </Stack>

            <Divider />

            {/* Successors */}
            <Stack spacing={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
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
                        { activityId: "", type: "FS", lag: 0 },
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
                    options={activityOptions.filter(
                      (o) => o.value !== selectedId
                    )}
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
              <Button size="sm" onClick={applyForm}>
                Apply
              </Button>
              <Button
                size="sm"
                variant="plain"
                onClick={() => selectedId && loadTaskIntoForm(selectedId)}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="soft"
                color="neutral"
                onClick={() => setSelectedId(null)}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </Sheet>
      )}
    </Box>
  );
};

export default View_Project_Management;
