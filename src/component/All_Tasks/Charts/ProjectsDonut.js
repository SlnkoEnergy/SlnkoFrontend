import { Card, Box, Typography } from "@mui/joy";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import * as React from "react";

export default function ProjectsWorkedCard({
  title = "Task State",
  data = [],
  total = 0,
  totalLabel = "Projects",
  sx = {},
}) {
  const chartData = React.useMemo(
    () =>
      (Array.isArray(data) ? data : []).map(d => ({
        name: String(d?.name ?? ""),
        value: Number(d?.value) || 0,
        color: d?.color || "#cbd5e1",
      })),
    [data]
  );

  const totalToShow = Number.isFinite(total)
    ? total
    : chartData.reduce((a, b) => a + (Number(b.value) || 0), 0);

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
        overflow: "auto",
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
        <Box sx={{ width: "100%", height: 180, position: "relative" }}>
          {/* ✅ Explicit width/height so container never measures to 0 */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
                // Optional tweaks to ensure tiny slices still show
                minAngle={1}
                startAngle={90}
                endAngle={-270}
                stroke="#fff"
                strokeWidth={6}
                cornerRadius={10}
                isAnimationActive
              >
                {chartData.map((entry, idx) => (
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
          {chartData.map((d) => (
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
                  width: 8,
                  height: 8,
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
                {typeof d.value === "number" ? `${d.value}%` : d.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
