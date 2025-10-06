// src/components/All_Tasks/Charts/ProjectsDonut.jsx
import { Card, Box, Typography } from "@mui/joy";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PALETTE = [
  "#f59e0b", "#22c55e", "#ef4444", "#3b82f6", "#8b5cf6",
  "#14b8a6", "#e11d48", "#84cc16", "#f97316", "#06b6d4",
  "#d946ef", "#0ea5e9", "#65a30d", "#dc2626", "#7c3aed",
  "#10b981", "#ca8a04", "#2563eb", "#f43f5e", "#0891b2",
  "#a16207", "#15803d", "#4f46e5", "#ea580c", "#db2777",
  "#047857", "#1d4ed8", "#9333ea", "#b91c1c", "#0d9488",
];

export default function ProjectsWorkedCard({
  title = "Task State",
  data = [],
  total = 0,
  totalLabel = "Projects",
  sx = {},
}) {
  // 1) Normalize data: ensure color & numeric value
  const safeData = (Array.isArray(data) ? data : []).map((d, i) => {
    const raw = Number(d.value);
    const value = Number.isFinite(raw) ? raw : 0;
    const color = d.color || PALETTE[i % PALETTE.length];
    return { name: d.name ?? `Item ${i + 1}`, value, color };
  });

  // 2) If all values are 0, show a single grey slice for empty state
  const allZero = safeData.length > 0 && safeData.every((d) => d.value === 0);
  const pieData = allZero
    ? [{ name: "No Data", value: 1, color: "#e2e8f0" }]
    : safeData;

  // 3) Robust total label (fallback to sum if total is bad)
  const totalToShow = Number.isFinite(total)
    ? total
    : safeData.reduce((a, b) => a + (Number(b.value) || 0), 0);

  return (
    <Card
      variant="soft"
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
        maxHeight: 500,
        height: 500,
        gap: 0,
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography level="title-md" sx={{ color: "#0f172a" }}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr" },
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* Donut + centered text */}
        <Box sx={{ width: "100%", height: 220, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
                startAngle={90}
                endAngle={-270}
                stroke="#fff"
                strokeWidth={6}
                cornerRadius={10}
                isAnimationActive={false}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography level="h3" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {totalToShow}
            </Typography>
            <Typography level="body-xs" sx={{ color: "rgba(17,24,39,0.6)" }}>
              {totalLabel}
            </Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Box sx={{ pl: { xs: 0, sm: 1 } }}>
          {safeData.map((d) => (
            <Box
              key={d.name}
              sx={{
                display: "grid",
                gridTemplateColumns: "18px 1fr auto",
                alignItems: "center",
                py: 0.5,
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: d.color,
                  justifySelf: "center",
                }}
              />
              <Typography level="body-sm" sx={{ color: "#0f172a" }}>
                {d.name}
              </Typography>
              <Typography
                level="body-sm"
                sx={{ color: "#0f172a", fontWeight: 600 }}
              >
                {/* If you're passing percentage values, append %; otherwise show raw */}
                {Number.isFinite(d.value) ? `${d.value}%` : d.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
