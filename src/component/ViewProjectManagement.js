import { useEffect, useMemo, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";

import { Box, Chip, Sheet, Typography, Button } from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AddIcon from "@mui/icons-material/Add";

// ===== RTK Query hooks (adjust import path to your project) ==================
import {
  useGetAllActivityQuery,
  useCreateActivityMutation,
  useCreateProjectActivityMutation,
  useGetAllProjectActivityQuery,
  useUpdateProjectActivityMutation, // ensure this exists in your slice
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
  if (isNaN(date)) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function diffDaysInclusive(startISO, endISO) {
  if (!startISO || !endISO) return 0;
  const s = new Date(startISO);
  const e = new Date(endISO);
  const ms = e.getTime() - s.getTime();
  return ms < 0 ? 0 : Math.floor(ms / (24 * 3600 * 1000)) + 1;
}

function endFromStartAndDuration(startISO, duration) {
  if (!startISO || !duration) return "";
  const d = new Date(startISO);
  d.setDate(d.getDate() + Number(duration) - 1);
  return toISO(d);
}

// New small helpers for duplicate-prevention & change detection
const idIsTemp = (id) => String(id || "").startsWith("tmp-");
const norm = (s) => String(s || "").trim().toLowerCase();
const predsToComparable = (preds = []) =>
  preds
    .map((p) => `${p.activity_id}|${p.type}|${Number(p.lag || 0)}`)
    .sort()
    .join(",");

// ============================================================================

const View_Project_Management = ({ viewModeParam = "week" }) => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState(viewModeParam);
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project_id");

  // master activities
  const { data: actList = [] } = useGetAllActivityQuery();
  const [createActivity] = useCreateActivityMutation();

  // project activities
  const {
    data: projectActsResp,
    refetch: refetchProjActs,
  } = useGetAllProjectActivityQuery(projectId, { skip: !projectId });

  const [createProjectActivity] = useCreateProjectActivityMutation();
  const [updateProjectActivity] = useUpdateProjectActivityMutation();

  // map activities (robust against shapes)
  const activities = useMemo(() => {
    const raw = Array.isArray(actList) ? actList : actList?.data || [];
    return raw.map((a) => ({ id: a._id || a.id, name: a.name || a.activity_name || "" }));
  }, [actList]);

  // fast lookup by name/id (case-insensitive by name)
  const actByName = useMemo(() => {
    const m = new Map();
    activities.forEach((a) => m.set(norm(a.name), a));
    return m;
  }, [activities]);

  // ---- GANTT: build data from API -----------------------------------------
  const projectActs = useMemo(() => {
    const raw = projectActsResp?.data ?? projectActsResp ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [projectActsResp]);

  // quick lookup: project activity by PA id
  const paById = useMemo(() => {
    const m = new Map();
    projectActs.forEach((pa) => m.set(String(pa._id), pa));
    return m;
  }, [projectActs]);

  const ganttData = useMemo(() => {
    const tasksArr = projectActs.map((pa) => {
      const name =
        pa.master_activity_id?.name ||
        pa.master_activity_id?.activity_name ||
        pa.activity_name ||
        "Activity";
      const startISO = toISO(pa.planned_start);
      const endISO = toISO(pa.planned_finish);
      const duration = pa.duration || diffDaysInclusive(startISO, endISO) || 1;

      return {
        id: pa._id, // keep server id so updates are PUT/PATCH
        text: name,
        start_date: startISO,
        duration,
        progress: (pa.percent_complete ?? 0) / 100,
        open: true,
      };
    });

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

  // ========================= AUTO-SAVE ENGINE ===============================
  const saveTimers = useRef({});
  const pending = useRef({}); // latest payload per task

  // Resolve/ensure master activity (create only when necessary)
  const ensureMasterActivity = async (desiredName, currentPa) => {
    const name = String(desiredName || "Activity").trim();
    if (!name) return null;

    // If this PA already has a master with the same visible name, reuse it
    const existingMasterId =
      currentPa?.master_activity_id?._id || currentPa?.master_activity_id || null;
    const existingMasterName =
      currentPa?.master_activity_id?.name ||
      currentPa?.master_activity_id?.activity_name ||
      currentPa?.activity_name ||
      "";

    if (existingMasterId && norm(existingMasterName) === norm(name)) {
      return existingMasterId;
    }

    // Try to find in global activity master list
    const hit = actByName.get(norm(name));
    if (hit) return hit.id;

    // Finally, create a new master activity
    const res = await createActivity({ name, description: name }).unwrap();
    return res?._id || res?.id || null;
  };

  const buildPayloadFromTask = async (task) => {
    const currentPa = paById.get(String(task.id)); // undefined for brand-new temp rows

    const name = String(task.text || "Activity").trim() || "Activity";
    const masterId = await ensureMasterActivity(name, currentPa);
    if (!masterId) return null;

    const startISO = toISO(task.start_date);
    const duration = Number(task.duration || 1);
    const endISO = endFromStartAndDuration(startISO, duration);

    // current predecessors in Gantt (source is PA id; backend expects source MASTER id)
    const links = gantt.getLinks().filter((l) => String(l.target) === String(task.id));
    const predecessors = links
      .map((l) => {
        const sourcePa = paById.get(String(l.source));
        const sourceMaster =
          sourcePa?.master_activity_id?._id || sourcePa?.master_activity_id || null;
        return {
          type: typeToLabel[String(l.type)] || "FS",
          lag: Number(l.lag || 0),
          activity_id: sourceMaster,
        };
      })
      .filter((p) => p.activity_id);

    return {
      project_id: projectId,
      master_activity_id: masterId,
      planned_start: startISO,
      planned_finish: endISO,
      duration,
      predecessors,
      successors: [],
    };
  };

  // Compare task+payload vs server state to avoid useless PATCHes
  const isSameAsServer = (task, payload) => {
    const server = paById.get(String(task.id));
    if (!server) return false; // temp/new task -> needs create

    const serverName =
      server.master_activity_id?.name ||
      server.master_activity_id?.activity_name ||
      server.activity_name ||
      "Activity";

    const serverStart = toISO(server.planned_start);
    const serverEnd = toISO(server.planned_finish);
    const serverDur = server.duration || diffDaysInclusive(serverStart, serverEnd) || 1;

    const taskName = String(task.text || "Activity").trim() || "Activity";
    if (norm(serverName) !== norm(taskName)) return false;

    if (toISO(payload.planned_start) !== serverStart) return false;
    if (Number(payload.duration) !== Number(serverDur)) return false;

    const serverPreds = predsToComparable(
      (server.predecessors || []).map((p) => ({
        activity_id: p.activity_id,
        type: p.type,
        lag: Number(p.lag || 0),
      }))
    );

    const payloadPreds = predsToComparable(payload.predecessors || []);
    return serverPreds === payloadPreds;
  };

  // Schedule a debounced save for a given task (create only for tmp-* ids)
  const scheduleSave = (task) => {
    const id = String(task.id || "");
    if (!id) return;

    const isNew = idIsTemp(id);
    pending.current[id] = { task, isNew };

    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      const pack = pending.current[id] || {};
      const latestTask = pack.task;
      const latestIsNew = pack.isNew;
      if (!latestTask) return;

      try {
        const payload = await buildPayloadFromTask(latestTask);
        if (!payload) return;

        if (!latestIsNew && isSameAsServer(latestTask, payload)) {
          // nothing changed; skip network call
          return;
        }

        if (latestIsNew) {
          // CREATE
          const created = await createProjectActivity(payload).unwrap();
          const newServerId = created?._id || created?.id;
          if (newServerId && String(newServerId) !== String(latestTask.id)) {
            const tempId = latestTask.id;
            // Replace temp ID with server ID; fix links that reference it
            gantt.changeTaskId(tempId, newServerId);
            gantt.getLinks().forEach((l) => {
              if (String(l.source) === String(tempId)) l.source = newServerId;
              if (String(l.target) === String(tempId)) l.target = newServerId;
            });
          }
        } else {
          // UPDATE (must be a real server id)
          await updateProjectActivity({
            id: String(latestTask.id),
            body: payload,
          }).unwrap();
        }

        await refetchProjActs();
      } catch (e) {
        // Keep UI responsive, log for debugging
        console.error("Auto-save failed:", e);
      } finally {
        delete pending.current[id];
        clearTimeout(saveTimers.current[id]);
        delete saveTimers.current[id];
      }
    }, 500);
  };

  // ============================ GANTT INIT ==================================
  useEffect(() => {
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

    // Grid columns (inline editing only)
    gantt.config.columns = [
      {
        name: "text",
        label: "Activity",
        tree: true,
        width: 260,
        resize: true,
        editor: { type: "text", map_to: "text" },
      },
      {
        name: "lag",
        label: "Predecessors",
        width: 200,
        align: "left",
        resize: true,
        template: (t) => predecessorsToString(t.id),
        editor: { type: "text", map_to: "lag" }, // parsed into real links
      },
      {
        name: "duration",
        label: "Duration",
        width: 90,
        align: "left",
        resize: true,
        editor: { type: "number", map_to: "duration" },
      },
      {
        name: "start",
        label: "Start",
        width: 120,
        align: "left",
        resize: true,
        template: (task) => toISO(task.start_date),
        editor: { type: "date", map_to: "start_date" },
      },
      {
        name: "end",
        label: "End",
        width: 120,
        align: "left",
        resize: true,
        template: (task) => endFromStartAndDuration(toISO(task.start_date), task.duration),
      },
    ];

    gantt.init(ganttContainer.current);

    // Edit stop (text/start/duration/lag)
    gantt.attachEvent("onAfterEditStop", (state, editor) => {
      const task = editor?.task;
      if (!task) return;

      if (editor.columnName === "lag") {
        // rebuild links from typed string (e.g., "12FS+2, 7SS-1")
        gantt
          .getLinks()
          .filter((l) => String(l.target) === String(task.id))
          .forEach((l) => gantt.deleteLink(l.id));

        parsePredString(state.value).forEach((p) => {
          if (Number(p.source) !== Number(task.id)) {
            gantt.addLink({
              source: p.source,
              target: task.id,
              type: p.type,
              lag: p.lag || 0,
            });
          }
        });
        gantt.refreshData();
        scheduleSave(task);
        return;
      }

      scheduleSave(task);
    });

    // Drag/move/resize
    gantt.attachEvent("onAfterTaskDrag", (id) => {
      const task = gantt.getTask(id);
      scheduleSave(task);
    });

    // Link changes
    ["onAfterLinkAdd", "onAfterLinkUpdate", "onAfterLinkDelete"].forEach((ev) => {
      gantt.attachEvent(ev, () => {
        const all = gantt.getLinks();
        const touched = new Set();
        all.forEach((l) => {
          touched.add(String(l.source));
          touched.add(String(l.target));
        });
        touched.forEach((tid) => {
          const t = gantt.getTask(tid);
          if (t) scheduleSave(t);
        });
      });
    });

    return () => {
      gantt.clearAll();
    };
  }, []);

  // Load/refresh gantt when server data changes
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

  // ----- computed project window chips (from current server data) ----------
  const minStart = useMemo(() => {
    const dates = projectActs
      .map((r) => toISO(r.planned_start))
      .filter(Boolean)
      .map((d) => +new Date(d));
    if (!dates.length) return "—";
    return toISO(new Date(Math.min(...dates)));
  }, [projectActs]);

  const maxEnd = useMemo(() => {
    const dates = projectActs
      .map((r) => toISO(r.planned_finish))
      .filter(Boolean)
      .map((d) => +new Date(d));
    if (!dates.length) return "—";
    return toISO(new Date(Math.max(...dates)));
  }, [projectActs]);

  // Add a blank task; it will be created on first edit (or call scheduleSave immediately)
  const addBlankTask = () => {
    const tempId = `tmp-${Date.now()}`;
    const today = toISO(new Date());
    gantt.addTask(
      {
        id: tempId,
        text: "New Activity",
        start_date: today,
        duration: 1,
        progress: 0,
        open: true,
      },
      null
    );
    // If you want immediate create without waiting for first edit:
    // scheduleSave(gantt.getTask(tempId));
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        p: 0,
      }}
    >
      {/* Header chips */}
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
              {projectId || "—"}
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

      {/* Quick add */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button size="sm" startDecorator={<AddIcon />} variant="soft" onClick={addBlankTask}>
          Add Activity
        </Button>
      </Box>

      {/* Gantt */}
      <Box style={{ position: "relative", width: "100%", minWidth: 600, height: "70vh" }}>
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
