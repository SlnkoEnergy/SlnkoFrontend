import { useEffect, useMemo, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";

import {
  Box, Button, Chip, IconButton, Input, Sheet, Table, Typography
} from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Autocomplete from "@mui/joy/Autocomplete";

// ===== RTK Query hooks (adjust import path to your project) ==================
import {
  useGetAllActivityQuery,
  useCreateActivityMutation,
  useCreateProjectActivityMutation,
  useGetAllProjectActivityQuery,
} from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";
// ============================================================================

// ---- helpers ---------------------------------------------------------------
const labelToType = { FS: "0", SS: "1", FF: "2", SF: "3" };
const typeToLabel = { 0: "FS", 1: "SS", 2: "FF", 3: "SF" };

function parsePredString(input) {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((tok) => {
      const m = tok.match(/^(\d+)\s*([Ff][Ss]|[Ss][Ss]|[Ff][Ff]|[Ss][Ff])?\s*([+-]\s*\d+)?$/);
      if (!m) return null;
      const source = Number(m[1]);
      const tLabel = (m[2] || "FS").toUpperCase();
      const type = labelToType[tLabel] ?? "0";
      const lag = m[3] ? Number(m[3].replace(/\s+/g, "")) : 0;
      return { source, type, lag };
    })
    .filter(Boolean);
}

function predecessorsToString(taskId) {
  const links = gantt.getLinks().filter((l) => String(l.target) === String(taskId));
  if (!links.length) return "";
  return links
    .map((l) => {
      const t = typeToLabel[String(l.type)] ?? "FS";
      const lag = Number(l.lag || 0);
      const lagStr = lag === 0 ? "" : lag > 0 ? `+${lag}` : `${lag}`;
      return `${l.source}${t}${lagStr}`;
    })
    .join(", ");
}

function toISO(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function addDays(startISO, days) {
  if (!startISO) return "";
  const d = new Date(startISO);
  d.setDate(d.getDate() + Number(days || 0) - 1); // inclusive
  return toISO(d);
}
function diffDaysInclusive(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const s = new Date(startISO);
  const e = new Date(endISO);
  const ms = e - s;
  return ms < 0 ? 0 : Math.floor(ms / (24 * 3600 * 1000)) + 1;
}

let uid = 0;
const newRow = () => ({
  _id: `row-${uid++}`,
  master_activity_id: "",
  activity_name: "",
  lag: 0,
  duration: 1,
  start: "",
  end: "",
});

// ============================================================================

const View_Project_Management = ({
  viewModeParam = "week",
}) => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState(viewModeParam);
  const [searchParams] =  useSearchParams();
  // ---- SHEET STATE ---------------------------------------------------------
  const [rows, setRows] = useState([]);
  const { data: actList = [], isLoading: actsLoading } = useGetAllActivityQuery();
  const [createActivity, { isLoading: creatingAct }] = useCreateActivityMutation();
  const projectId = searchParams.get("project_id");
  const {
    data: projectActsResp,
    isFetching: fetchingProjActs,
    refetch: refetchProjActs,
  } = useGetAllProjectActivityQuery(projectId, { skip: !projectId });
  

  const [createProjectActivity, { isLoading: creatingRows }] =
    useCreateProjectActivityMutation();

 const activities = useMemo(() => {
  const raw = Array.isArray(actList) ? actList : actList?.data || [];
  return raw.map((a) => ({ id: a._id || a.id, name: a.name }));
}, [actList]);

  const addRow = () => setRows((r) => [...r, newRow()]);
  const removeRow = (_id) => setRows((r) => r.filter((x) => x._id !== _id));

  const handleActivityChange = async (rowId, value) => {
    // free-solo: if string, create activity
    if (typeof value === "string") {
      const name = value.trim();
      if (!name) return;
      try {
        const res = await createActivity({
          name,
          description: name,
        }).unwrap();
        const newId = res?._id || res?.id;
        setRows((prev) =>
          prev?.map((r) =>
            r._id === rowId
              ? { ...r, master_activity_id: newId, activity_name: name }
              : r
          )
        );
      } catch (e) {
        console.error("createActivity failed", e);
      }
      return;
    }
    if (value && value.id) {
      setRows((prev) =>
        prev?.map((r) =>
          r._id === rowId
            ? { ...r, master_activity_id: value.id, activity_name: value.name }
            : r
        )
      );
    } else {
      setRows((prev) =>
        prev?.map((r) =>
          r._id === rowId ? { ...r, master_activity_id: "", activity_name: "" } : r
        )
      );
    }
  };

  const handleChange = (rowId, field, val) => {
    setRows((prev) =>
      prev?.map((r) => {
        if (r._id !== rowId) return r;
        let next = { ...r, [field]: val };

        if (field === "start" || field === "duration") {
          if (next.start && Number(next.duration) > 0) {
            next.end = addDays(next.start, next.duration);
          } else next.end = "";
        }
        if (field === "end" && next.start && next.end) {
          next.duration = diffDaysInclusive(next.start, next.end) || 1;
        }
        return next;
      })
    );
  };

  const canSubmit =
    rows.length > 0 &&
    rows.every(
      (r) => r.master_activity_id && r.start && r.end && Number(r.duration) > 0
    );

  const submitAll = async () => {
    const payloads = rows?.map((r) => ({
      project_id: projectId,
      master_activity_id: r.master_activity_id,
      planned_start: r.start,
      planned_finish: r.end,
      duration: Number(r.duration) || 1,
      predecessors: [], // extend later if you add predecessor editor
      successors: [],
    }));

    try {
      await Promise.all(payloads?.map((p) => createProjectActivity(p).unwrap()));
      setRows([]);
      await refetchProjActs();
    } catch (e) {
      console.error("createProjectActivity failed", e);
    }
  };

  // ---- GANTT: data from API -----------------------------------------------
const projectActs = useMemo(() => {
  const raw = projectActsResp?.data ?? projectActsResp ?? [];
  return Array.isArray(raw) ? raw : [];
}, [projectActsResp]);

  const ganttData = useMemo(() => {
    // build tasks
    const tasksArr = projectActs?.map((pa) => ({
      id: pa._id,
      text:
        pa.master_activity_id?.name ||
        pa.master_activity_id?.activity_name ||
        "Activity",
      start_date: toISO(pa.planned_start),
      duration: pa.duration || diffDaysInclusive(pa.planned_start, pa.planned_finish) || 1,
      progress: (pa.percent_complete ?? 0) / 100,
      open: true,
    }));

    // map master_activity_id -> project activity id (to build links)
    const byMaster = new Map(
      projectActs.map((pa) => [
        String(pa.master_activity_id?._id || pa.master_activity_id),
        pa._id,
      ])
    );

    let lid = 1;
    const linksArr = [];
    projectActs.forEach((pa) => {
      (pa.predecessors || []).forEach((pred) => {
        const srcId = byMaster.get(String(pred.activity_id));
        if (srcId) {
          linksArr.push({
            id: lid++,
            source: srcId,
            target: pa._id,
            type: labelToType[pred.type] ?? "0",
            lag: pred.lag || 0,
          });
        }
      });
    });

    return { data: tasksArr, links: linksArr };
  }, [projectActs]);

  // ---- GANTT: init/config --------------------------------------------------
  const fmtISO = gantt.date.date_to_str("%Y-%m-%d");
  const parseInternal = (d) =>
    d instanceof Date ? d : gantt.date.parseDate(d, gantt.config.date_format);

  const startDateTemplate = (task) => fmtISO(parseInternal(task.start_date));
  const endDateTemplate = (task) => {
    const s = parseInternal(task.start_date);
    if (!s || !task.duration) return "";
    const e = gantt.calculateEndDate({ start_date: s, duration: task.duration, task });
    return fmtISO(e);
  };

  useEffect(() => {
    // Use ISO for server data interchange
    gantt.config.date_format = "%Y-%m-%d";
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

    // Grid order: Task name | Lag | Duration | Start | End
    gantt.config.columns = [
      { name: "text", label: "Task name", tree: true, width: 200, resize: true,
        editor: { type: "text", map_to: "text" } },
      { name: "lag", label: "Lag", width: 140, align: "left", resize: true,
        template: (t) => predecessorsToString(t.id),
        editor: { type: "text", map_to: "lag" } }, // local-only; parses to links below
      { name: "duration", label: "Duration", width: 90, align: "left", resize: true,
        editor: { type: "number", map_to: "duration" } },
      { name: "start", label: "Start", width: 120, align: "left", resize: true,
        template: startDateTemplate, editor: { type: "date", map_to: "start_date" } },
      { name: "end", label: "End", width: 120, align: "left", resize: true,
        template: endDateTemplate },
    ];

    gantt.init(ganttContainer.current);

    // keep grid synced after edits/drags
    const refresh = () => gantt.refreshData();
    const evts = [
      gantt.attachEvent("onAfterTaskUpdate", refresh),
      gantt.attachEvent("onAfterTaskAdd", refresh),
      gantt.attachEvent("onAfterTaskDrag", refresh),
      gantt.attachEvent("onAfterLinkUpdate", refresh),
      gantt.attachEvent("onAfterLinkAdd", refresh),
      gantt.attachEvent("onAfterLinkDelete", refresh),
    ];

    // Parse "Lag" cell into links (local only)
    gantt.attachEvent("onAfterEditStop", (state, editor) => {
      if (editor && editor.columnName === "lag") {
        const taskId = editor.task.id;
        gantt
          .getLinks()
          .filter((l) => String(l.target) === String(taskId))
          .forEach((l) => gantt.deleteLink(l.id));
        parsePredString(state.value).forEach((p) => {
          if (Number(p.source) !== Number(taskId)) {
            gantt.addLink({ source: p.source, target: taskId, type: p.type, lag: p.lag || 0 });
          }
        });
        gantt.refreshData();
      }
    });

    return () => {
      evts.forEach((id) => gantt.detachEvent(id));
      gantt.clearAll();
    };
  }, []);

  // load/refresh gantt when server data changes
  useEffect(() => {
    gantt.clearAll();
    gantt.parse(ganttData);
  }, [ganttData]);

  // scale changes from parent filter
  useEffect(() => setViewMode(viewModeParam), [viewModeParam]);

  useEffect(() => {
    if (viewMode === "day") {
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "%d %M %Y";
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (viewMode === "week") {
      gantt.config.scale_unit = "week";
      gantt.config.date_scale = "%d %M";
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (viewMode === "month") {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F, %Y";
      gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
    } else {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
    }
    gantt.render();
  }, [viewMode]);

  // ----- computed project window chips (from current sheet entries) ----------
  const minStart = useMemo(() => {
    const dates = rows.filter((r) => r.start).map((r) => +new Date(r.start));
    if (!dates.length) return "—";
    return toISO(new Date(Math.min(...dates)));
  }, [rows]);
  const maxEnd = useMemo(() => {
    const dates = rows.filter((r) => r.end).map((r) => +new Date(r.end));
    if (!dates.length) return "—";
    return toISO(new Date(Math.max(...dates)));
  }, [rows]);

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        p: 0,
      }}
    >
      {/* Header chips (unchanged) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          mt: 1,
        }}
      >
        <Sheet variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: "lg", px: 1.5, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <DescriptionOutlinedIcon fontSize="small" color="primary" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              Project Code:
            </Typography>
            <Chip color="primary" size="sm" variant="solid" sx={{ fontWeight: 700 }}>
              {/* put your code here */}
            </Chip>
          </Box>
        </Sheet>

        <Sheet variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 2, borderRadius: "lg", px: 1, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="success" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>Start Date:</Typography>
            <Chip color="success" size="sm" variant="soft" sx={{ fontWeight: 600 }}>
              {minStart}
            </Chip>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <EventOutlinedIcon fontSize="small" color="danger" />
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>End Date:</Typography>
            <Chip color="danger" size="sm" variant="soft" sx={{ fontWeight: 600 }}>
              {maxEnd}
            </Chip>
          </Box>
        </Sheet>
      </Box>

      {/* Sheet controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Button size="sm" startDecorator={<AddIcon />} onClick={addRow} variant="soft">
          Add row
        </Button>
        <Button size="sm" onClick={submitAll}>
          Submit activities
        </Button>
      </Box>

      {/* Empty state */}
      {rows.length === 0 ? (
        <Sheet variant="outlined" sx={{ borderRadius: "md", p: 3, textAlign: "center", color: "text.tertiary", mb: 1.5 }}>
          No activities yet. Click <b>“Add row”</b> to start.
        </Sheet>
      ) : null}

      {/* Editable sheet */}
      {rows.length > 0 && (
        <Sheet variant="outlined" sx={{ borderRadius: "md", overflow: "hidden", mb: 1.5 }}>
          <Table stickyHeader hoverRow>
            <thead>
              <tr>
                <th style={{ width: 320, padding: 8 }}>Activity</th>
                <th style={{ width: 90, padding: 8 }}>Lag</th>
                <th style={{ width: 110, padding: 8 }}>Duration</th>
                <th style={{ width: 160, padding: 8 }}>Start date</th>
                <th style={{ width: 160, padding: 8 }}>End date</th>
                <th style={{ width: 60, padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td style={{ padding: 8 }}>
                    <Autocomplete
                      placeholder="Select or type to create…"
                      size="sm"
                      clearOnBlur={false}
                      freeSolo
                      options={activities}
                      getOptionLabel={(opt) =>
                        typeof opt === "string" ? opt : opt?.name || ""
                      }
                      value={
                        r.master_activity_id
                          ? activities.find((a) => a.id === r.master_activity_id) || r.activity_name
                          : r.activity_name
                      }
                      onChange={(_, value) => handleActivityChange(r._id, value)}
                      loading={actsLoading || creatingAct}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      size="sm"
                      type="number"
                      value={r.lag}
                      onChange={(e) =>
                        handleChange(r._id, "lag", Number(e.target.value || 0))
                      }
                      slotProps={{ input: { min: 0 } }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      size="sm"
                      type="number"
                      value={r.duration}
                      onChange={(e) =>
                        handleChange(r._id, "duration", Number(e.target.value || 0))
                      }
                      slotProps={{ input: { min: 1 } }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      size="sm"
                      type="date"
                      value={r.start || ""}
                      onChange={(e) => handleChange(r._id, "start", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <Input
                      size="sm"
                      type="date"
                      value={r.end || ""}
                      onChange={(e) => handleChange(r._id, "end", e.target.value)}
                    />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={() => removeRow(r._id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      )}

      {/* Gantt */}
      <Box
        style={{
          position: "relative",
          width: "100%",
          minWidth: 600,
          height: "70vh",
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
            filter: "brightness(0.98) blur(0.2px)",
            transition: "box-shadow 0.2s, top 0.2s",
          }}
        />
      </Box>
    </Box>
  );
};

export default View_Project_Management;
