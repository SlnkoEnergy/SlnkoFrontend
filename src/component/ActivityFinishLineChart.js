// src/components/charts/ActivityFinishLineChart.jsx
import React, { useMemo, useState } from "react";
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RTooltip,
    Legend,
    ResponsiveContainer,
    Scatter,
    Customized,
    Brush,
    ReferenceLine,
} from "recharts";
import { Card, Typography, Box, Select, Option } from "@mui/joy";
import {
    useGetProjectDropdownForDashboardQuery,
    useLazyGetProjectSearchDropdownQuery,
} from "../redux/projectsSlice";
import SearchPickerModal from "./SearchPickerModal";

/** Pretty date formatter */
const fmt = (ms) =>
    ms
        ? new Date(ms).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "-";

/** Dashed vertical span (Actual start → Today) with safe guards */
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

    // center on categorical band
    const xCenterOffset = (xAxis.bandSize || 0) / 2;

    return (
        <g>
            {(data || []).map((d, i) => {
                if (!d?.ongoing || !d?.actual_start_ms) return null;

                const x0 = xScale(d.activity_name);
                if (x0 == null || Number.isNaN(x0)) return null;

                const x = x0 + xCenterOffset;
                const y1 = yScale(d.actual_start_ms);
                const y2 = yScale(nowMs);
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

/** Legend/meta for tooltip + markers (shapes aligned with chart) */
const SERIES = [
    { key: "actual_finish_ms", label: "Actual Finish", color: "#16a34a", shape: "square" },
    { key: "actual_start_ms", label: "Actual Start", color: "#111827", shape: "triangle" },
    { key: "planned_finish_ms", label: "Planned Finish", color: "#0ea5e9", shape: "square" },
    { key: "planned_start_ms", label: "Planned Start", color: "#111827", shape: "dot" },
];

/** Small SVG marker to match shapes used in the chart */
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
    // square (default)
    return (
        <svg width={size} height={size} style={{ flex: "0 0 auto" }}>
            <rect x="1" y="1" width={size - 2} height={size - 2} fill={color} rx="1" ry="1" />
        </svg>
    );
}

/** Custom tooltip: show markers matching each series' shape */
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

export default function ActivityFinishLineChart({
    apiData,                // { data, domain }
    projectId,              // (optional) current project id from parent
    onProjectChange,        // function(id) -> parent updates URL & refetch
    title = "Planned vs Actual (Finish) by Activity",
    height = 500,
}) {
    const rows = apiData?.data ?? [];
    const domain = apiData?.domain ?? {};
    const nowMs = domain.now ?? Date.now();
    // Build chart rows
    const data = useMemo(
        () =>
            rows.map((r) => ({
                activity_name: r.activity_name,
                planned_finish_ms: r.planned_finish_ms ?? null,
                actual_finish_ms: r.actual_finish_ms ?? null,
                planned_start_ms: r.planned_start_ms ?? null,
                actual_start_ms: r.actual_start_ms ?? null,
                ongoing: r.ongoing,
            })),
        [rows]
    );

    const pad = 1000 * 60 * 60 * 24 * 3; // 3 days padding
    const yMin = domain.min ? domain.min - pad : undefined;
    const yMax = domain.max ? Math.max(domain.max, nowMs) + pad : undefined;

    // ---- Project dropdown (first page) ----
    const { data: projectResponse } = useGetProjectDropdownForDashboardQuery({
        page: 1,
        pageSize: 7,
    });

    const projects = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse?.data ?? []; // normalize shape

    // ---- Search modal ----
    const [triggerProjectSearch] = useLazyGetProjectSearchDropdownQuery();
    const [projectCode, setProjectCode] = useState("");
    const [projectName, setProjectName] = useState("");
    const [selectedId, setSelectedId] = useState(projectId || ""); // keep selected id for Select value
    const [projectModalOpen, setProjectModalOpen] = useState(false);

    const IDLE = "__IDLE__";
    const OPEN_MODAL = "__OPEN_MODAL__";

    const fetchProjectsPage = async ({ search = "", page = 1, pageSize = 7 }) => {
        const res = await triggerProjectSearch({ search, page, limit: pageSize }, true);
        const d = res?.data;
        return {
            rows: d?.data || [],
            total: d?.pagination?.total || 0,
            page: d?.pagination?.page || page,
            pageSize: d?.pagination?.pageSize || pageSize,
        };
    };

    const applyPickedProject = (p) => {
        setSelectedId(p?._id || "");
        setProjectCode(p?.code || "");
        setProjectName(p?.name || "");
        onProjectChange?.(p?._id);
    };

    const onPickProject = (row) => {
        if (!row) return;
        setProjectModalOpen(false);
        applyPickedProject(row);
    };

    const handleSelectChange = (_e, v) => {
        if (v === OPEN_MODAL) {
            setProjectModalOpen(true);
            return;
        }
        if (!v || v === IDLE) return;

        // user picked from the first-page dropdown
        const p = projects.find((x) => String(x._id) === String(v));
        applyPickedProject(p || { _id: v, code: "", name: "" });
    };

    const renderSelectValue = () => {
        if (projectCode || projectName)
            return `${projectCode || ""}${projectCode && projectName ? " — " : ""
                }${projectName || ""}`;
        if (selectedId) {
            // If we only know the id (e.g., loaded from URL), try to find in current page
            const p = projects.find((x) => String(x._id) === String(selectedId));
            if (p)
                return `${p.code || ""}${p.code && p.name ? " — " : ""}${p.name || ""}`;
        }
        return "Select Project";
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
                        Hover any dot/triangle/line to see exact dates. Dashed segment shows
                        ongoing (Actual start → Today).
                    </Typography>
                </Box>

                {/* Project selector (first page + "Search more…") */}

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
                            domain={[yMin ?? "auto", yMax ?? "auto"]}
                            tickFormatter={(v) =>
                                new Date(v).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                })
                            }
                        />

                        {/* Custom tooltip that formats only the date series with matching shapes */}
                        <RTooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Today line */}
                        <ReferenceLine
                            y={nowMs}
                            stroke="#94a3b8"
                            strokeDasharray="4 4"
                            label={{ value: "Today", fill: "#475569", position: "right" }}
                        />

                        {/* Finish lines (with dots on line to help focus) */}
                        <Line
                            type="monotone"
                            dataKey="planned_finish_ms"
                            name="Planned Finish"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            dot={{ r: 3, stroke: "#0ea5e9", fill: "#0ea5e9" }}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="actual_finish_ms"
                            name="Actual Finish"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={{ r: 3, stroke: "#16a34a", fill: "#16a34a" }}
                            connectNulls
                        />

                        {/* Start dots */}
                        <Scatter
                            dataKey="planned_start_ms"
                            name="Planned Start"
                            shape="circle"
                            fill="#111827"
                        />
                        <Scatter
                            dataKey="actual_start_ms"
                            name="Actual Start"
                            shape="triangle"
                            fill="#111827"
                        />

                        {/* Ongoing vertical spans */}
                        <Customized component={<OngoingSpans data={data} nowMs={nowMs} />} />

                        {/* Scroll long activity lists */}
                        <Brush
                            dataKey="activity_name"
                            height={20}
                            travellerWidth={10}
                            startIndex={0}
                            endIndex={Math.min(12, data.length - 1)}
                        />
                    </ComposedChart>
                </ResponsiveContainer>

                <SearchPickerModal
                    open={projectModalOpen}
                    onClose={() => setProjectModalOpen(false)}
                    onPick={onPickProject}
                    title="Search: Project"
                    columns={[
                        { key: "name", label: "Project Name", width: 240 },
                        { key: "code", label: "Project Code", width: 200 },
                    ]}
                    fetchPage={fetchProjectsPage}
                    searchKey="name"
                    pageSize={7}
                    backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
                />
            </Box>
        </Card>
    );
}
