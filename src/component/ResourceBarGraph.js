// src/components/charts/ResourceBarGraph.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Typography, Box, Stack, Sheet, Button } from "@mui/joy";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DateRange } from "react-date-range";
import { Popper } from "@mui/base/Popper";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
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
function ymd(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function ddMMM(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
function enumerateDaysInclusive(start, end) {
  const out = [];
  let d = startOfDay(start);
  const e = startOfDay(end);
  while (d.getTime() <= e.getTime()) {
    out.push(new Date(d));
    d = addDays(d, 1);
  }
  return out;
}

// Nice default palette (order = resourceTypes order)
const DEFAULT_RESOURCE_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#64748b", // slate
  // if you ever have >8, it will keep going
  "#0ea5e9",
  "#10b981",
  "#d946ef",
  "#84cc16",
];

// Converts "civil engineer" -> "Civil Engineer", "i&c" -> "I&C", etc.
const prettyResource = (s = "") =>
  String(s)
    .split(" ")
    .map((w) => {
      const lw = w.toLowerCase();
      if (lw === "i&c") return "I&C";
      if (lw === "tline") return "Tline"; // or "T-Line"
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(" ");

/**
 * Expected logs shape (same idea as before, but now used per-day aggregation):
 * logs: Array<{ date: string|Date, type: string, count: number }>
 *
 * The chart will render 7 x-axis dates (default today..+6),
 * and for each date, 8 grouped bars (resourceTypes order) with color notation.
 */
export default function ResourceBarGraph({
  title = "Resources by Day",
  subtitle = "Grouped by resource type — hover for counts.",
  resourceTypes = [], // exactly your 8 types; order controls grouping order & color mapping
  logs = [],
  initialRange,
  height = 420,
  barSize = 16, // smaller so 8 bars fit nicely per day
  resourceColors, // optional: string[] same length as resourceTypes
  onBarClick,
  onRangeChange,
}) {
  // ----- default 7-day window: today -> today+6 -----
  const defaultRange = useMemo(() => {
    const s = startOfDay(new Date());
    const e = addDays(s, 6);
    return { startDate: s, endDate: e, key: "selection" };
  }, []);

  // ----- selection state -----
  const safeDefaultSelection = useMemo(() => {
    if (initialRange?.startDate && initialRange?.endDate) {
      const s = startOfDay(new Date(initialRange.startDate));
      const e = startOfDay(new Date(initialRange.endDate));
      return {
        startDate: isValidDate(s) ? s : defaultRange.startDate,
        endDate: isValidDate(e) ? e : defaultRange.endDate,
        key: "selection",
      };
    }
    return defaultRange;
  }, [
    initialRange?.startDate,
    initialRange?.endDate,
    defaultRange.startDate,
    defaultRange.endDate,
  ]);

  const [selection, setSelection] = useState(safeDefaultSelection);

  // keep local selection synced if parent passes new initialRange
  useEffect(() => {
    const nextS = safeDefaultSelection.startDate?.getTime?.() ?? null;
    const nextE = safeDefaultSelection.endDate?.getTime?.() ?? null;
    const curS = selection?.startDate?.getTime?.() ?? null;
    const curE = selection?.endDate?.getTime?.() ?? null;
    if (nextS !== curS || nextE !== curE) setSelection(safeDefaultSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    safeDefaultSelection.startDate?.getTime?.(),
    safeDefaultSelection.endDate?.getTime?.(),
  ]);

  // ----- notify parent ONCE on mount with the default week -----
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!notifiedRef.current && selection?.startDate && selection?.endDate) {
      onRangeChange?.(ymd(selection.startDate), ymd(selection.endDate));
      notifiedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.startDate, selection?.endDate]);

  // ----- Popper for date picker -----
  const [rangeOpen, setRangeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const toggleRange = (e) => {
    setAnchorEl(e.currentTarget);
    setRangeOpen((v) => !v);
  };
  const closeRange = () => setRangeOpen(false);

  // ----- color map by resource type (stable across re-renders) -----
  const colorMap = useMemo(() => {
    const palette =
      Array.isArray(resourceColors) &&
      resourceColors.length >= resourceTypes.length
        ? resourceColors
        : DEFAULT_RESOURCE_COLORS;

    const m = {};
    (resourceTypes || []).forEach((t, i) => {
      m[t] = palette[i % palette.length];
    });
    return m;
  }, [resourceColors, resourceTypes]);

  // ----- Pre-index logs by day & type -----
  //    index: { "YYYY-MM-DD": { [type]: totalCount } }
  const indexByDayType = useMemo(() => {
    const idx = {};
    for (const row of logs || []) {
      const day = ymd(startOfDay(new Date(row.date)));
      const type = row.type;
      const count = Number(row.count) || 0;
      if (!type || !resourceTypes.includes(type)) continue;

      if (!idx[day]) idx[day] = {};
      idx[day][type] = (idx[day][type] || 0) + count;
    }
    return idx;
  }, [logs, resourceTypes]);

  // ----- Build 7-day grouped dataset -----
  // Each data item = { day: 'YYYY-MM-DD', label: '05 Oct', [type1]: n, [type2]: n, ... }
  const groupedData = useMemo(() => {
    const s = selection?.startDate;
    const e = selection?.endDate;
    if (!isValidDate(s) || !isValidDate(e)) return [];

    const days = enumerateDaysInclusive(s, e);
    return days.map((d) => {
      const key = ymd(d);
      const base = { day: key, label: ddMMM(d) };
      for (const t of resourceTypes || []) {
        base[t] = indexByDayType[key]?.[t] ?? 0;
      }
      return base;
    });
  }, [selection?.startDate, selection?.endDate, resourceTypes, indexByDayType]);

  // ----- apply range -> notify parent -----
  const applyRange = () => {
    const s = selection?.startDate;
    const e = selection?.endDate;
    if (!isValidDate(s) || !isValidDate(e)) {
      closeRange();
      return;
    }
    onRangeChange?.(ymd(s), ymd(e));
    closeRange();
  };

  return (
    <Card
      variant="outlined"
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
        height,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography level="title-lg">{title}</Typography>
          {subtitle ? (
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" gap={1} alignItems="center">
          <Button size="sm" variant="soft" onClick={toggleRange}>
            {selection?.startDate && selection?.endDate
              ? `${ymd(selection.startDate)} → ${ymd(selection.endDate)}`
              : "Custom Range"}
          </Button>

          {/* Date picker in a portal to avoid cropping */}
          <Popper
            open={rangeOpen}
            anchorEl={anchorEl}
            placement="bottom-end"
            slotProps={{ root: { style: { zIndex: 1700 } } }}
          >
            <ClickAwayListener onClickAway={closeRange}>
              <Sheet
                variant="outlined"
                sx={{
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
                      startDate: selection?.startDate ?? defaultRange.startDate,
                      endDate: selection?.endDate ?? defaultRange.endDate,
                      key: "selection",
                    },
                  ]}
                  onChange={(r) => {
                    const s = r?.selection?.startDate;
                    const e = r?.selection?.endDate;
                    setSelection((prev) => ({
                      ...(prev || { key: "selection" }),
                      startDate: isValidDate(s)
                        ? startOfDay(s)
                        : defaultRange.startDate,
                      endDate: isValidDate(e)
                        ? startOfDay(e)
                        : defaultRange.endDate,
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
                  <Button size="sm" variant="plain" onClick={closeRange}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applyRange}>
                    Apply
                  </Button>
                </Stack>
              </Sheet>
            </ClickAwayListener>
          </Popper>
        </Stack>
      </Box>

      {/* Chart area */}
      <Box sx={{ height: height - 88, p: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={groupedData}
            margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
            barGap={4}
            barCategoryGap={12}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fontSize: 12 }}
              height={48}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value, name) => [value, prettyResource(name)]}
              labelFormatter={(label, payload) => {
                const day = payload?.[0]?.payload?.day ?? label;
                return `${label} (${day})`;
              }}
            />
            <Legend
              iconType="circle"
              formatter={(v) => prettyResource(v)}
              wrapperStyle={{ fontSize: 12 }}
            />

            {/* Render 1 <Bar> per resource type (8 bars per date) */}
            {(resourceTypes || []).map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={type}
                fill={colorMap[type]}
                barSize={barSize}
                onClick={(payload) => onBarClick?.({ type, payload })}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
