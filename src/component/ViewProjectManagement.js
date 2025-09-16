import { useEffect, useRef, useState } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt/codebase/dhtmlxgantt";
import { Box, Button } from "@mui/joy";

const tasks = {
  data: [
    { id: 1, text: "Testing",  start_date: "01-09-2025", duration: 33, progress: 0.6, open: true },
    { id: 2, text: "Testing1", start_date: "25-09-2025", duration: 2,  parent: 1, progress: 0.4 },
    { id: 3, text: "Testing2", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 4, text: "Testing3", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 5, text: "Testing4", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 6, text: "Testing5", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 },
    { id: 7, text: "Testing6", start_date: "29-09-2025", duration: 1,  parent: 1, progress: 0.8 }
  ],
  links: [
    { id: 1, source: 2, target: 3, type: "0", lag: 2 }, // 2FS+2
  ]
};

const VIEW_MODES = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const typeToLabel = { "0": "FS", "1": "SS", "2": "FF", "3": "SF" };
const labelToType = { FS: "0", SS: "1", FF: "2", SF: "3" };

// Parse "2FS+3, 5SS-1" -> [{source:2,type:"0",lag:3}, ...]
function parsePredecessors(input) {
  if (!input) return [];
  return input
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(token => {
      const m = token.match(/^(\d+)\s*([Ff][Ss]|[Ss][Ss]|[Ff][Ff]|[Ss][Ff])?\s*([+-]\s*\d+)?$/);
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
  const incoming = gantt.getLinks().filter(l => String(l.target) === String(taskId));
  if (!incoming.length) return "";
  return incoming
    .map(l => {
      const label = typeToLabel[String(l.type)] ?? "FS";
      const lag = Number(l.lag || 0);
      const lagStr = lag === 0 ? "" : (lag > 0 ? `+${lag}` : `${lag}`);
      return `${l.source}${label}${lagStr}`;
    })
    .join(", ");
}

const View_Project_Management = () => {
  const ganttContainer = useRef(null);
  const [viewMode, setViewMode] = useState("week");

  const dueDateTemplate = (task) => {
    const start = task.start_date instanceof Date
      ? task.start_date
      : gantt.date.parseDate(task.start_date, gantt.config.date_format);
    if (!start || !task.duration) return "";
    const end = gantt.calculateEndDate({ start_date: start, duration: task.duration, task });
    return gantt.date.date_to_str("%d-%m-%Y")(end);
  };

  const predecessorTemplate = (task) => predecessorsToString(task.id);
 useEffect(() => {
  gantt.config.date_format = "%d-%m-%Y";

  // Override locale for one-letter day names
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

  gantt.init(ganttContainer.current);
  gantt.parse(tasks);

  return () => {
    gantt.clearAll();
  };
}, []);

  useEffect(() => {
    setGanttScale(viewMode);
    gantt.render();
  }, [viewMode]);

  const setGanttScale = (mode) => {
  if (mode === "day") {
    gantt.config.scale_unit = "day";
    gantt.config.date_scale = "%d %M %Y";
    gantt.config.subscales = [
      { unit: "day", step: 1, date: "%D" } // one-letter day names
    ];
  } else if (mode === "week") {
    gantt.config.scale_unit = "week";
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
      { unit: "day", step: 1, date: "%D" } // one-letter day names
    ];
  } else if (mode === "month") {
    gantt.config.scale_unit = "month";
    gantt.config.date_scale = "%F, %Y";
    gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
  } else if (mode === "year") {
    gantt.config.scale_unit = "year";
    gantt.config.date_scale = "%Y";
    gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
  }
};


  return (
    <Box sx={{ ml: { lg: "var(--Sidebar-width)" }, width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box>
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              style={{
                marginRight: 8, padding: "8px 16px", borderRadius: 6,
                border: viewMode === mode.value ? "2px solid #1976d2" : "1px solid #cfd8dc",
                background: viewMode === mode.value ? "#e3f2fd" : "#fff",
                color: viewMode === mode.value ? "#1976d2" : "#333",
                fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {mode.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box style={{ position: "relative", width: "100%", minWidth: 600, height:'80vh' }}>
        <Box
          ref={ganttContainer}
          style={{
            width: "100%", height: "100%", background: "#fff",
            borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 1, position: "relative", top: 12,
            filter: "brightness(0.98) blur(0.2px)", transition: "box-shadow 0.2s, top 0.2s"
          }}
        />
      </Box>
    </Box>
  );
};

export default View_Project_Management;
