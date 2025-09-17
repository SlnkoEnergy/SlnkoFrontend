import { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";
import { Box, Chip, Sheet, Typography } from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Timelapse } from "@mui/icons-material";
import { useGetProjectActivityByProjectIdQuery } from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";

const tasks = {
  data: [
    {
      id: 1,
      text: "Testing",
      start_date: "01-09-2025",
      duration: 33,
      progress: 0.6,
      open: true,
    },
    {
      id: 2,
      text: "Testing1",
      start_date: "25-09-2025",
      duration: 2,
      parent: 1,
      progress: 0.4,
    },
    {
      id: 3,
      text: "Testing2",
      start_date: "30-09-2025",
      duration: 1,
      parent: 1,
      progress: 0.8,
    },
    {
      id: 4,
      text: "Testing3",
      start_date: "29-09-2025",
      duration: 1,
      parent: 1,
      progress: 0.8,
    },
    {
      id: 5,
      text: "Testing4",
      start_date: "29-09-2025",
      duration: 1,
      parent: 1,
      progress: 0.8,
    },
    {
      id: 6,
      text: "Testing5",
      start_date: "29-09-2025",
      duration: 1,
      parent: 1,
      progress: 0.8,
    },
    {
      id: 7,
      text: "Testing6",
      start_date: "29-09-2025",
      duration: 1,
      parent: 1,
      progress: 0.8,
    },
  ],
  links: [{ id: 1, source: 2, target: 3, type: "0", lag: 2 }],
};

function RemainingDaysChip({ project }) {
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
    if (!project) return;

    const bd = new Date(project.bd_commitment_date).getTime();
    const comp = new Date(project.completion_date).getTime();
    const projComp = new Date(project.project_completion_date).getTime();
    const end = Math.min(bd, comp, projComp);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [project]);

  return (
    <Chip
      color="danger"
      size="sm"
      variant="solid"
      sx={{
        fontWeight: 700,
        background: "#d32f2f",
        color: "#fff",
        fontSize: 16,
      }}
    >
      {remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m{" "}
      {remainingTime.seconds}s
    </Chip>
  );
}

function fmtDMY(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  // Only show year if not current year
  return year === currentYear ? `${day}-${month}` : `${day}-${month}-${year}`;
}

function parseInternal(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  const [day, month, year] = dateStr.split("-");
  return new Date(year, month - 1, day);
}

const endDateTemplate = (task) => {
  const start = parseInternal(task.start_date);
  if (!start || !task.duration) return "";
  const end = gantt.calculateEndDate({
    start_date: start,
    duration: task.duration,
    task,
  });
  return fmtDMY(end);
};

const typeMap = { 0: "FS", 1: "SS", 2: "FF", 3: "SF" };
const predecessorTemplate = (task) => {
  const incoming = gantt
    .getLinks()
    .filter((l) => String(l.target) === String(task.id));
  if (!incoming.length) return "";
  return incoming
    .map((l) => {
      const label = typeMap[String(l.type)] ?? "FS";
      const lag = Number(l.lag || 0);
      const lagStr = lag === 0 ? "" : lag > 0 ? `+${lag}` : `${lag}`;
      return `${l.source}${label}${lagStr}`;
    })
    .join(", ");
};

const View_Project_Management = ({ viewModeParam = "week" }) => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState(viewModeParam);
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project_id");
  const {
    data: getProjectActivityByProjectId,
    isLoading,
    error,
  } = useGetProjectActivityByProjectIdQuery(projectId);

  const projectActiviy = getProjectActivityByProjectId?.projectactivity;

  useEffect(() => {
    setViewMode(viewModeParam);
  }, [viewModeParam]);

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

    // Set timeline to 2 years before and after today
    const today = new Date();
    const start = new Date(
      today.getFullYear() - 2,
      today.getMonth(),
      today.getDate()
    );
    const end = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );
    gantt.config.start_date = start;
    gantt.config.end_date = end;

    gantt.config.columns = [
      {
        name: "text",
        label: "ACTIVITY",
        tree: true,
        width: 220,
        resize: true,
        editor: { type: "text", map_to: "text" },
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
        name: "start_date",
        label: "Start",
        width: 110,
        align: "left",
        resize: true,
        template: (t) => {
          // Always format using dhtmlx-gantt's date_to_str utility
          const dateToStrWithYear = gantt.date.date_to_str("%d-%m-%Y");
          const dateToStrNoYear = gantt.date.date_to_str("%d-%m");
          let d = t.start_date;
          if (typeof d === "string") {
            const parts = d.split("-");
            d = new Date(parts[2], parts[1] - 1, parts[0]);
          }
          const currentYear = new Date().getFullYear();
          return d.getFullYear() === currentYear ? dateToStrNoYear(d) : dateToStrWithYear(d);
        },
        editor: { type: "date", map_to: "start_date" },
      },
      {
        name: "end",
        label: "End",
        width: 110,
        align: "left",
        resize: true,
        template: endDateTemplate,
      },
      {
        name: "pred",
        label: "Predecessors",
        width: 160,
        align: "left",
        resize: true,
        template: predecessorTemplate,
      },
    ];

    gantt.init(ganttContainer.current);
    gantt.parse(tasks);

    const refresh = () => gantt.refreshData();
    const evts = [
      gantt.attachEvent("onAfterTaskUpdate", refresh),
      gantt.attachEvent("onAfterTaskAdd", refresh),
      gantt.attachEvent("onAfterTaskDrag", refresh),
      gantt.attachEvent("onAfterLinkAdd", refresh),
      gantt.attachEvent("onAfterLinkUpdate", refresh),
      gantt.attachEvent("onAfterLinkDelete", refresh),
    ];

    return () => {
      gantt.clearAll();
    };
  }, []);

  useEffect(() => {
    setGanttScale(viewMode);
    gantt.render();
  }, [viewMode]);

  const setGanttScale = (mode) => {
    const currentYear = new Date().getFullYear();
    if (mode === "day") {
      gantt.config.scale_unit = "day";
      const dateToStrWithYear = gantt.date.date_to_str("%d %M %Y");
      const dateToStrNoYear = gantt.date.date_to_str("%d %M");
      gantt.config.date_scale = function(date) {
        let d = date;
        if (!(d instanceof Date)) d = new Date(d);
        return d.getFullYear() === currentYear
          ? dateToStrNoYear(d)
          : dateToStrWithYear(d);
      };
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (mode === "week") {
      gantt.config.scale_unit = "week";
      const dateToStrWithYear = gantt.date.date_to_str("%d %M %Y");
      const dateToStrNoYear = gantt.date.date_to_str("%d %M");
      gantt.config.date_scale = function(date) {
        let d = date;
        if (!(d instanceof Date)) d = new Date(d);
        return d.getFullYear() === currentYear
          ? dateToStrNoYear(d)
          : dateToStrWithYear(d);
      };
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (mode === "month") {
      gantt.config.scale_unit = "month";
      const dateToStrWithYear = gantt.date.date_to_str("%F %Y");
      const dateToStrNoYear = gantt.date.date_to_str("%F");
      gantt.config.date_scale = function(date) {
        let d = date;
        if (!(d instanceof Date)) d = new Date(d);
        return d.getFullYear() === currentYear
          ? dateToStrNoYear(d)
          : dateToStrWithYear(d);
      };
      gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
    } else if (mode === "year") {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
    }
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        p: 0,
      }}
    >
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
              {projectActiviy?.project_id?.code}
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
            <RemainingDaysChip
              project={{
                bd_commitment_date: "2025-09-29T05:42:23.508Z",
                completion_date: "2025-09-28T05:42:23.508Z",
                project_completion_date: "2025-09-27T05:42:23.508Z",
              }}
            />
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
            ></Chip>
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
            ></Chip>
          </Box>
        </Sheet>
      </Box>
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
            filter: "brightness(0.98) blur(0.2px)",
            transition: "box-shadow 0.2s, top 0.2s",
          }}
        />
      </Box>
    </Box>
  );
};

export default View_Project_Management;
