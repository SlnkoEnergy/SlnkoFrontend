import { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";
import { Box, Chip, Sheet, Typography } from "@mui/joy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { Timelapse } from "@mui/icons-material";
import { useGetProjectActivityByProjectIdQuery } from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";

// ---------------------------------------------------------------------------
// Demo data (leave while wiring to API)
const tasks = {
  data: [
    { id: 1, text: "Testing",  start_date: "01-09-2025", duration: 33, progress: 0.6, open: true },
    { id: 2, text: "Testing1", start_date: "25-09-2025", duration: 2,  parent: 1, progress: 0.4 },
    { id: 3, text: "Testing2", start_date: "30-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 4, text: "Testing3", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 5, text: "Testing4", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 6, text: "Testing5", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 7, text: "Testing6", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
  ],
  links: [{ id: 1, source: 2, target: 3, type: "0", lag: 2 }],
};

// ---------------------------------------------------------------------------
// Remaining timer — kept as-is
function RemainingDaysChip({ project }) {
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

// ---------------------------------------------------------------------------
// Date helpers + templates
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

// Utility: ensure we always have a Date object
function safeDate(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  const nd = new Date(d);
  return Number.isNaN(nd.getTime()) ? null : nd;
}

// Pre-made formatters from Gantt (functions that accept Date, return string)
const fmtFullDMY  = gantt.date.date_to_str("%d %M %Y");
const fmtNoYearDM = gantt.date.date_to_str("%d %M");
const fmtMonth    = gantt.date.date_to_str("%F");
const fmtMonthY   = gantt.date.date_to_str("%F %Y");

// ---------------------------------------------------------------------------

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

  useEffect(() => setViewMode(viewModeParam), [viewModeParam]);

  useEffect(() => {
    // Your data format (dd-mm-yyyy)
    gantt.config.date_format = "%d-%m-%Y";

    // One-letter weekday names
    gantt.locale.date.day_short = ["S", "M", "T", "W", "T", "F", "S"];

    // Behaviors
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

    // Timeline window: today ± 2 years
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

    // Grid columns: ACTIVITY | Duration | Start | End | Predecessors
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
          // Always format via Gantt's formatters
          const d = parseInternal(t.start_date);
          if (!d) return "";
          const curY = new Date().getFullYear();
          const fmt = d.getFullYear() === curY ? fmtNoYearDM : fmtFullDMY;
          return fmt(d);
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
      evts.forEach((id) => gantt.detachEvent(id));
      gantt.clearAll();
    };
  }, []);

  useEffect(() => {
    // IMPORTANT: Keep date_scale a STRING and customize labels via templates
    const currentYear = new Date().getFullYear();

    // reset old template to avoid stale closures
    gantt.templates.date_scale = null;

    if (viewMode === "day") {
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "%d %M %Y"; // string
      gantt.templates.date_scale = (date) => {
        const d = safeDate(date);
        const fmt = d.getFullYear() === currentYear ? fmtNoYearDM : fmtFullDMY;
        return fmt(d);
      };
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (viewMode === "week") {
      gantt.config.scale_unit = "week";
      gantt.config.date_scale = "%d %M %Y"; // string
      gantt.templates.date_scale = (date) => {
        const d = safeDate(date);
        const fmt = d.getFullYear() === currentYear ? fmtNoYearDM : fmtFullDMY;
        return fmt(d);
      };
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%D" }];
    } else if (viewMode === "month") {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F %Y"; // string
      gantt.templates.date_scale = (date) => {
        const d = safeDate(date);
        const fmt = d.getFullYear() === currentYear ? fmtMonth : fmtMonthY;
        return fmt(d);
      };
      gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
    } else {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y"; // string
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
            />
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
            />
          </Box>
        </Sheet>
      </Box>

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
            filter: "brightness(0.98) blur(0.2px)",
            transition: "box-shadow 0.2s, top 0.2s",
          }}
        />
      </Box>
    </Box>
  );
};

export default View_Project_Management;
