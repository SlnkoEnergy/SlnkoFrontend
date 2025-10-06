// src/components/charts/ActivityFinishLineChart.jsx
import React, { useMemo } from "react";
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RTooltip,
    Legend,
    ResponsiveContainer,
    Customized,
    Brush,
    ReferenceLine,
} from "recharts";
import { Card, Typography, Box } from "@mui/joy";

/* ---------- utils ---------- */
const fmt = (ms) =>
    ms
        ? new Date(ms).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "-";

// normalize epoch (handles seconds vs milliseconds)
const normalizeMs = (v) => {
    if (v == null) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    // if in seconds (e.g., 1,700,000,000), convert to ms
    return n < 1e11 ? n * 1000 : n;
};

// collect min/max from an array of numbers
const minMax = (arr) => {
    let min = Infinity;
    let max = -Infinity;
    for (const v of arr) {
        if (v == null || !Number.isFinite(v)) continue;
        if (v < min) min = v;
        if (v > max) max = v;
    }
    if (min === Infinity || max === -Infinity) return { min: undefined, max: undefined };
    return { min, max };
};

/** Dashed vertical span (Actual start → Today) with guards */
function OngoingSpans({ xAxisMap, yAxisMap, data = [], nowMs = Date.now() }) {
    if (!xAxisMap || !yAxisMap) return null;
    const xKeys = Object.keys(xAxisMap);
    const yKeys = Object.keys(yAxisMap);
    if (!xKeys.length || !yKeys.length) return null;

    const xAxis = xAxisMap[xKeys[0]];
    const yAxis = yAxisMap[yKeys[0]];
    const xScale = xAxis?.scale;
    const yScale = yAxis?.scale;
    if (typeof xScale !== "function" || typeof yScale !== "function") return null;

    const xCenterOffset = (xAxis.bandSize || 0) / 2;
    const now = normalizeMs(nowMs);

    return (
        <g>
            {(data || []).map((d, i) => {
                if (!d?.ongoing || !d?.actual_start_ms) return null;
                const x0 = xScale(d.activity_name);
                if (x0 == null || Number.isNaN(x0)) return null;

                const x = x0 + xCenterOffset;
                const y1 = yScale(d.actual_start_ms);
                const y2 = yScale(now);
                if ([y1, y2].some((v) => v == null || Number.isNaN(v))) return null;

                return (
                    <line
                        key={`ongoing-${i}`}
                        x1={x}
                        x2={x}
                        y1={Math.min(y1, y2)}
                        y2={Math.max(y1, y2)}
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        opacity={0.7}
                    />
                );
            })}
        </g>
    );
}

/** Legend/meta for tooltip + markers */
const SERIES = [
    { key: "actual_finish_ms", label: "Actual Finish", color: "#16a34a", shape: "square" },
    { key: "actual_start_ms", label: "Actual Start", color: "#111827", shape: "triangle" },
    { key: "planned_finish_ms", label: "Planned Finish", color: "#0ea5e9", shape: "square" },
    { key: "planned_start_ms", label: "Planned Start", color: "#111827", shape: "dot" },
];

function Marker({ shape = "square", color = "#000" }) {
    const size = 10;
    if (shape === "dot") {
        return (
            <svg width={size} height={size} style={{ flex: "0 0 auto" }}>
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={color} />
            </svg>
        );
    }
    if (shape === "triangle") {
        return (
            <svg width={size} height={size} viewBox="0 0 10 10" style={{ flex: "0 0 auto" }}>
                <polygon points="5,0 10,10 0,10" fill={color} />
            </svg>
        );
    }
    return (
        <svg width={size} height={size} style={{ flex: "0 0 auto" }}>
            <rect x="1" y="1" width={size - 2} height={size - 2} fill={color} rx="1" ry="1" />
        </svg>
    );
}

function CustomTooltip({ active, label, payload }) {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload || {};
    const items = SERIES.filter((s) => row[s.key] != null);

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,.12)",
                boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 12,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
            {items.map((it) => (
                <div
                    key={it.key}
                    style={{ display: "flex", gap: 8, alignItems: "center", margin: "2px 0" }}
                >
                    <Marker shape={it.shape} color={it.color} />
                    <span style={{ color: "#334155", minWidth: 110 }}>{it.label}</span>
                    <span style={{ color: "#0f172a" }}>{fmt(row[it.key])}</span>
                </div>
            ))}
        </div>
    );
}

/* ---------- custom dot renderers for start markers ---------- */
const DotCircle = (props) => {
    const { cx, cy, payload, fill = "#111827", r = 5 } = props || {};
    if (cx == null || cy == null || payload?.planned_start_ms == null) return null;
    return <circle cx={cx} cy={cy} r={r} fill={fill} />;
};

const DotTriangle = (props) => {
    const { cx, cy, payload, fill = "#111827", size = 10 } = props || {};
    if (cx == null || cy == null || payload?.actual_start_ms == null) return null;
    const h = size;
    const w = size;
    const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy + h / 2} ${cx - w / 2},${cy + h / 2}`;
    return <polygon points={points} fill={fill} />;
};

export default function ActivityFinishLineChart({
    apiData, // { data, domain }
    title = "Planned vs Actual (Finish) by Activity",
    height = 500,
}) {
    const rows = apiData?.data ?? [];
    const domain = apiData?.domain ?? {};

    // Normalize rows to ms + shape for chart
    const data = useMemo(
        () =>
            rows.map((r) => ({
                activity_name: r.activity_name,
                planned_finish_ms: normalizeMs(r.planned_finish_ms),
                actual_finish_ms: normalizeMs(r.actual_finish_ms),
                planned_start_ms: normalizeMs(r.planned_start_ms),
                actual_start_ms: normalizeMs(r.actual_start_ms),
                ongoing: !!r.ongoing,
            })),
        [rows]
    );

    // Aggregate all values to compute a robust domain
    const allVals = useMemo(() => {
        const vals = [];
        for (const d of data) {
            if (d.planned_finish_ms != null) vals.push(d.planned_finish_ms);
            if (d.actual_finish_ms != null) vals.push(d.actual_finish_ms);
            if (d.planned_start_ms != null) vals.push(d.planned_start_ms);
            if (d.actual_start_ms != null) vals.push(d.actual_start_ms);
        }
        return vals;
    }, [data]);

    // Prefer backend domain if valid; otherwise derive from data
    const backendMin = normalizeMs(domain.min);
    const backendMax = normalizeMs(domain.max);
    const { min: dataMin, max: dataMax } = minMax(allVals);

    const pad = 3 * 24 * 60 * 60 * 1000; // 3 days
    const minCandidate = Number.isFinite(backendMin) ? backendMin : dataMin;
    const maxCandidate = Number.isFinite(backendMax) ? backendMax : dataMax;

    const yMin = Number.isFinite(minCandidate) ? minCandidate - pad : undefined;
    const yMax = Number.isFinite(maxCandidate)
        ? Math.max(maxCandidate, normalizeMs(domain.now) ?? Date.now()) + pad
        : undefined;

    const safeDomain = [
        Number.isFinite(yMin) ? yMin : "auto",
        Number.isFinite(yMax) ? yMax : "auto",
    ];

    const nowMs = normalizeMs(domain.now) ?? Date.now();

    // Render guards to avoid empty series & messy legends
    const hasPlannedFinish = useMemo(
        () => data.some((d) => Number.isFinite(d.planned_finish_ms)),
        [data]
    );
    const hasActualFinish = useMemo(
        () => data.some((d) => Number.isFinite(d.actual_finish_ms)),
        [data]
    );
    const hasPlannedStart = useMemo(
        () => data.some((d) => Number.isFinite(d.planned_start_ms)),
        [data]
    );
    const hasActualStart = useMemo(
        () => data.some((d) => Number.isFinite(d.actual_start_ms)),
        [data]
    );

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
                boxShadow: "0 2px 6px rgba(15,23,42,0.06), 0 18px 32px rgba(15,23,42,0.06)",
                transition: "transform .16s ease, box-shadow .16s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
                },
                height,
            }}
        >
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
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        Hover any dot/triangle/line to see exact dates. Dashed segment shows ongoing
                        (Actual start → Today).
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ height: height - 72, p: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="activity_name"
                            interval={0}
                            tick={{ fontSize: 12 }}
                            height={60}
                            angle={-15}
                            textAnchor="end"
                        />
                        <YAxis
                            type="number"
                            scale="time"
                            domain={safeDomain}
                            tickFormatter={(v) =>
                                new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                            }
                        />

                        <RTooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Today line */}
                        <ReferenceLine
                            y={nowMs}
                            stroke="#94a3b8"
                            strokeDasharray="4 4"
                            label={{ value: "Today", fill: "#475569", position: "right" }}
                        />

                        {/* Finish lines */}
                        {hasPlannedFinish && (
                            <Line
                                type="monotone"
                                dataKey="planned_finish_ms"
                                name="Planned Finish"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                dot={{ r: 3, stroke: "#0ea5e9", fill: "#0ea5e9" }}
                                connectNulls
                                isAnimationActive={false}
                            />
                        )}
                        {hasActualFinish && (
                            <Line
                                type="monotone"
                                dataKey="actual_finish_ms"
                                name="Actual Finish"
                                stroke="#16a34a"
                                strokeWidth={2}
                                dot={{ r: 3, stroke: "#16a34a", fill: "#16a34a" }}
                                connectNulls
                                isAnimationActive={false}
                            />
                        )}

                        {/* Start markers as dot-only lines (robust with categorical X + time Y) */}
                        {hasPlannedStart && (
                            <Line
                                type="monotone"
                                dataKey="planned_start_ms"
                                name="Planned Start"
                                stroke="none"
                                dot={<DotCircle fill="#111827" r={5} />}
                                isAnimationActive={false}
                                connectNulls
                            />
                        )}
                        {hasActualStart && (
                            <Line
                                type="monotone"
                                dataKey="actual_start_ms"
                                name="Actual Start"
                                stroke="none"
                                dot={<DotTriangle fill="#111827" size={10} />}
                                isAnimationActive={false}
                                connectNulls
                            />
                        )}

                        {/* Ongoing spans (Actual Start → Today) */}
                        <Customized component={<OngoingSpans data={data} nowMs={nowMs} />} />

                        {/* Scroll for long lists */}
                        <Brush
                            dataKey="activity_name"
                            height={20}
                            travellerWidth={10}
                            startIndex={0}
                            endIndex={Math.max(0, Math.min(12, data.length - 1))}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}
