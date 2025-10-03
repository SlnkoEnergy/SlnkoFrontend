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
  Cell, // ⬅️ NEW: per-bar colors
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

// Nice default palette (loops if there are more bars)
const DEFAULT_BAR_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#64748b", // slate
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#d946ef", // fuchsia
  "#84cc16", // lime
];

// Converts "civil engineer" -> "Civil Engineer", "i&c" -> "I&C", etc.
const prettyResource = (s = "") =>
  String(s)
    .split(" ")
    .map((w) => {
      const lw = w.toLowerCase();
      if (lw === "i&c") return "I&C";
      if (lw === "tline") return "Tline"; // or return "T-Line" if you prefer
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(" ");


/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - resourceTypes: string[] (exactly your 8 types; order controls bar order)
 * - logs: Array<{ date: string|Date, type: string, count: number }>
 * - initialRange?: { startDate: Date, endDate: Date }  // inclusive
 * - height?: number
 * - barSize?: number
 * - barColors?: string[]  // ⬅️ NEW (optional) custom palette
 * - onBarClick?: (payload) => void
 * - onRangeChange?: (startYmd: string, endYmd: string) => void
 */
export default function ResourceBarGraph({
  title = "Resources by Type",
  subtitle = "Hover bars to see exact counts.",
  resourceTypes = [],
  logs = [],
  initialRange,
  height = 360,
  barSize = 40,
  barColors, // ⬅️ NEW
  onBarClick,
  onRangeChange,
}) {
  // ----- default 7-day window: today -> today+6 (independent of logs) -----
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
  }, [safeDefaultSelection.startDate?.getTime?.(), safeDefaultSelection.endDate?.getTime?.()]);

  // ----- notify parent ONCE on mount with the default week -----
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!notifiedRef.current && selection?.startDate && selection?.endDate) {
      onRangeChange?.(ymd(selection.startDate), ymd(selection.endDate));
      notifiedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.startDate, selection?.endDate]);

  // ----- Popper for date picker (prevents cropping) -----
  const [rangeOpen, setRangeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const toggleRange = (e) => {
    setAnchorEl(e.currentTarget);
    setRangeOpen((v) => !v);
  };
  const closeRange = () => setRangeOpen(false);

  // ----- filter + aggregate logs by selected range -> bars -----
  const bars = useMemo(() => {
    const s = selection?.startDate;
    const e = selection?.endDate;
    if (!isValidDate(s) || !isValidDate(e)) return [];

    const sTs = startOfDay(s).getTime();
    const eTs = startOfDay(e).getTime();

    const counts = Object.fromEntries((resourceTypes || []).map((t) => [t, 0]));

    for (const row of logs || []) {
      const dTs = startOfDay(new Date(row.date)).getTime();
      if (Number.isNaN(dTs)) continue;
      if (dTs < sTs || dTs > eTs) continue; // outside range
      if (!resourceTypes.includes(row.type)) continue;

      counts[row.type] += Number(row.count) || 0;
    }

    return (resourceTypes || []).map((t) => ({
      resource: t,
      count: counts[t] ?? 0,
    }));
  }, [logs, resourceTypes, selection?.startDate, selection?.endDate]);

  // choose palette (prop > default)
  const palette = useMemo(
    () => (Array.isArray(barColors) && barColors.length ? barColors : DEFAULT_BAR_COLORS),
    [barColors]
  );

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
        overflow: "hidden", // Popper renders in a portal
        borderRadius: 28,
        p: { xs: 1, sm: 0.5, md: 1.5 },
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: "0 2px 6px rgba(15,23,42,0.06), 0 18px 32px rgba(15,23,42,0.06)",
        transition: "transform .16s ease, box-shadow .16s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
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
                      startDate: isValidDate(s) ? startOfDay(s) : defaultRange.startDate,
                      endDate: isValidDate(e) ? startOfDay(e) : defaultRange.endDate,
                      key: "selection",
                    }));
                  }}
                  moveRangeOnFirstSelection={false}
                  editableDateInputs
                  rangeColors={["#2563eb"]}
                />
                <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 1 }}>
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
      <Box sx={{ height: height - 72, p: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="resource"
              interval={0}
              tick={{ fontSize: 12 }}
              height={60}
              angle={-15}
              textAnchor="end"
              tickFormatter={prettyResource}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
          
            <Bar
              dataKey="count"
              name="Count"
              barSize={barSize}
              onClick={(payload) => onBarClick?.(payload)}
            >
              {/* ⬇️ Color each bar */}
              {(bars || []).map((entry, idx) => (
                <Cell key={`cell-${entry.resource}-${idx}`} fill={palette[idx % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
