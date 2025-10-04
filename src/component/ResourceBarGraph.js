// src/components/charts/ResourceBarGraph.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Typography,
  Box,
  Stack,
  Sheet,
  Button,
  Select,
  Option,
  Checkbox,
  Chip,
} from "@mui/joy";
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
function ddMMM(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
function parseYMD(s) {
  if (!s) return null;
  const [y, m, d] = String(s).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/* ---- Recharts-friendly keys ---- */
const toSafeKey = (s = "") =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "_");

/* ---- colors ---- */
const DEFAULT_RESOURCE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#64748b",
  "#0ea5e9",
  "#10b981",
  "#d946ef",
  "#84cc16",
];

/* ---- pretty labels ---- */
const prettyResource = (s = "") =>
  String(s)
    .split(" ")
    .map((w) => {
      const lw = w.toLowerCase();
      if (lw === "i&c") return "I&C";
      if (lw === "tline") return "Tline";
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(" ");

/* ---- fixed windows; always 7 ticks ---- */
const PRESETS = [
  { key: "1w", label: "1 Week", days: 7 },
  { key: "2w", label: "2 Weeks", days: 14 },
  { key: "3w", label: "3 Weeks", days: 21 },
  { key: "1m", label: "1 Month", days: 30 },
  { key: "3m", label: "3 Months", days: 90 },
  { key: "6m", label: "6 Months", days: 180 },
];

function buildTicks(end, totalDays) {
  const e = startOfDay(end);
  const s = addDays(e, -(totalDays - 1));
  const stepDays = Math.max(1, Math.floor(totalDays / 7));
  const out = [];
  for (let i = 0; i < 7; i++) out.push(addDays(s, i * stepDays)); // 7 uniform ticks
  return out;
}

export default function ResourceBarGraph({
  title = "Resources by Day",
  subtitle = "Grouped by resource type — hover for counts.",
  resourceTypes = [],
  logs = [],
  initialRange,
  height = 420,
  barSize = 16,
  resourceColors,
  onBarClick,
  onRangeChange,
}) {
  /* ---- window selection ---- */
  const [windowKey, setWindowKey] = useState("1w");
  const windowDays = useMemo(
    () => PRESETS.find((p) => p.key === windowKey)?.days ?? 7,
    [windowKey]
  );

  /* ---- selection (checkboxes) ---- */
  const [selectedTypes, setSelectedTypes] = useState(() => resourceTypes || []);
  useEffect(() => {
    setSelectedTypes((prev) => {
      if (!Array.isArray(resourceTypes)) return [];
      const intersect = prev.filter((t) => resourceTypes.includes(t));
      return intersect.length ? intersect : resourceTypes.slice();
    });
  }, [resourceTypes]);

  /* ---- map types <-> safe keys ---- */
  const { typeToKey, keyToType } = useMemo(() => {
    const t2k = {},
      k2t = {};
    (resourceTypes || []).forEach((t) => {
      const k = toSafeKey(t);
      t2k[t] = k;
      k2t[k] = t;
    });
    return { typeToKey: t2k, keyToType: k2t };
  }, [resourceTypes]);

  /* ---- colors ---- */
  const colorMap = useMemo(() => {
    const palette =
      Array.isArray(resourceColors) && resourceColors.length >= resourceTypes.length
        ? resourceColors
        : DEFAULT_RESOURCE_COLORS;
    const m = {};
    (resourceTypes || []).forEach((t, i) => (m[t] = palette[i % palette.length]));
    return m;
  }, [resourceColors, resourceTypes]);

  /* ---- latest date in logs -> align ticks to data end ---- */
  const logsEnd = useMemo(() => {
    const ds = (logs || [])
      .map((r) =>
        r?.date instanceof Date ? startOfDay(r.date) : parseYMD(r?.date)
      )
      .filter(isValidDate);
    return ds.length
      ? startOfDay(new Date(Math.max(...ds.map((d) => d.getTime()))))
      : startOfDay(new Date());
  }, [logs]);

  /* ---- index logs by YYYY-MM-DD and type ---- */
  const indexByDayType = useMemo(() => {
    const idx = {};
    for (const row of logs || []) {
      const d =
        row?.date instanceof Date ? startOfDay(row.date) : parseYMD(row?.date);
      if (!isValidDate(d)) continue;
      const day = ymd(d);
      const t = row.type;
      const c = Number(row.count) || 0;
      if (!t || !resourceTypes.includes(t)) continue;
      if (!idx[day]) idx[day] = {};
      idx[day][t] = (idx[day][t] || 0) + c;
    }
    return idx;
  }, [logs, resourceTypes]);

  /* ---- 7 rows & 7 ticks ---- */
  const tickDates = useMemo(
    () => buildTicks(logsEnd, windowDays),
    [logsEnd, windowDays]
  );
  const ticks = useMemo(() => tickDates.map(ymd), [tickDates]);

  const data = useMemo(() => {
    return tickDates.map((d) => {
      const dayKey = ymd(d);
      const row = { day: dayKey };
      for (const t of resourceTypes || []) {
        const safe = typeToKey[t];
        row[safe] = indexByDayType[dayKey]?.[t] ?? 0;
      }
      return row;
    });
  }, [tickDates, resourceTypes, typeToKey, indexByDayType]);

  /* ---- notify parent when window changes ---- */
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!notifiedRef.current && initialRange?.startDate && initialRange?.endDate) {
      const s = startOfDay(new Date(initialRange.startDate));
      const e = startOfDay(new Date(initialRange.endDate));
      if (isValidDate(s) && isValidDate(e)) onRangeChange?.(ymd(s), ymd(e));
      notifiedRef.current = true;
    }
  }, [initialRange?.startDate, initialRange?.endDate, onRangeChange]);

  useEffect(() => {
    const end = logsEnd;
    const start = addDays(end, -(windowDays - 1));
    onRangeChange?.(ymd(start), ymd(end));
  }, [windowDays, logsEnd, onRangeChange]);

  /* ---- handlers ---- */
  const toggleType = (t) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  const checkAll = () => setSelectedTypes(resourceTypes.slice());
  const uncheckAll = () => setSelectedTypes([]);

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "visible", // let tooltip extend out of the card
        zIndex: 1200, // lift the whole card
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
          zIndex: 1300,
        },
        height,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          display: "flex",
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

        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Select
            size="sm"
            value={windowKey}
            onChange={(e, v) => v && setWindowKey(v)}
            sx={{ minWidth: 160, position: "relative", zIndex: 1600 }}
            slotProps={{
              // keep dropdown list above everything
              listbox: { sx: { zIndex: 20000 } },
              button: { sx: { position: "relative", zIndex: 1600 } },
            }}
          >
            {PRESETS.map((p) => (
              <Option key={p.key} value={p.key}>
                {p.label}
              </Option>
            ))}
          </Select>

          <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
            <Button size="sm" variant="soft" onClick={checkAll}>
              Check All
            </Button>
            <Button size="sm" variant="plain" onClick={uncheckAll}>
              Uncheck All
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Resource checkboxes */}
      <Sheet
        variant="soft"
        sx={{
          mx: 1.5,
          mb: 1,
          p: 1,
          borderRadius: 14,
          overflowX: "auto",
          display: "flex",
          gap: 1.25,
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        {(resourceTypes || []).map((t) => {
          const checked = selectedTypes.includes(t);
          return (
            <Chip
              key={t}
              variant={checked ? "soft" : "plain"}
              color="neutral"
              sx={{
                borderRadius: "999px",
                "--Chip-decoratorChildSize": "10px",
                pr: 1,
              }}
              startDecorator={
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: colorMap[t],
                  }}
                />
              }
            >
              <Checkbox
                size="sm"
                label={prettyResource(t)}
                checked={checked}
                onChange={() => toggleType(t)}
                overlay
              />
            </Chip>
          );
        })}
      </Sheet>

      {/* Chart area */}
      <Box sx={{ height: height - 140, p: 1, overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data} // 7 rows (tick dates only)
            margin={{ top: 24, right: 24, left: 8, bottom: 8 }}
            barGap={4}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              ticks={ticks}
              interval={0}
              height={48}
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => ddMMM(val)}
            />
            <YAxis allowDecimals={false} domain={[0, "dataMax + 5"]} />
            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }} // let tooltip leave the SVG
              wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }} // above everything; non-blocking
              contentStyle={{
                background: "rgba(255,255,255,0.98)",
                borderRadius: 12,
                border: "1px solid rgba(2,6,23,0.08)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                padding: "10px 12px",
              }}
              labelStyle={{ fontWeight: 700, marginBottom: 6 }}
              itemStyle={{ paddingTop: 2, paddingBottom: 2 }}
              formatter={(value, safeKey) => [
                value,
                prettyResource(keyToType[safeKey] || safeKey),
              ]}
              labelFormatter={(day) => `${ddMMM(day)} (${day})`}
              offset={12}
              cursor={{ fill: "rgba(2,6,23,0.06)" }}
            />
            <Legend
              iconType="circle"
              formatter={(v) => prettyResource(keyToType[v] || v)}
              wrapperStyle={{ fontSize: 12 }}
            />

            {(selectedTypes || []).map((type) => {
              const safe = typeToKey[type];
              return (
                <Bar
                  key={type}
                  dataKey={safe}
                  name={safe}
                  fill={colorMap[type]}
                  maxBarSize={barSize}
                  isAnimationActive={false}
                  onClick={(payload) => onBarClick?.({ type, payload })}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
