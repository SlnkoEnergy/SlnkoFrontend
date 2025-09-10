import React, { useMemo } from "react";
import { Card, Box, Typography, Chip, IconButton } from "@mui/joy";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MoreVertical } from "lucide-react";

export default function ProjectsWorkedCard({
  title = "Projects worked",
  deltaPct = -5,
  data = [
    { name: "Over9k", value: 44, color: "#f59e0b" },
    { name: "MagnumShop", value: 24, color: "#22c55e" },
    { name: "Doctor+", value: 18, color: "#ef4444" },
    { name: "AfterMidnight", value: 14, color: "#3b82f6" },
  ],
  totalLabel = "Projects",
  sx = {},
}) {
  const total = useMemo(
    () => data.reduce((a, b) => a + (Number(b.value) || 0), 0),
    [data]
  );

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
        maxHeight: "500px",
        overflowY: "auto",
        height: "500px",
        gap: 0,
        overflowY: "auto",
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

        <Chip
          size="sm"
          variant="soft"
          color={deltaPct < 0 ? "danger" : "success"}
          sx={{
            fontWeight: 600,
            border: "1px solid rgba(0,0,0,0.08)",
            color: deltaPct < 0 ? "#b91c1c" : "#15803d",
            bgcolor: "#fff",
            mr: 0.5,
          }}
        >
          {deltaPct}%
        </Chip>

        <IconButton variant="plain" color="neutral">
          <MoreVertical size={18} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr" },
          gap: 1,
          alignItems: "center",
        }}
      >
        {/* Donut */}
        <Box sx={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                stroke="#fff" // white background → hides seams
                strokeWidth={6}
                cornerRadius={10}
                isAnimationActive={true}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>

              {/* Center text */}
              <g transform="translate(210,70)">
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fill: "#0f172a", fontSize: 28, fontWeight: 800 }}
                >
                  {data.length}
                </text>
                <text
                  y={18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fill: "rgba(17,24,39,0.6)", fontSize: 12 }}
                >
                  {totalLabel}
                </text>
              </g>
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend */}
        <Box sx={{ pl: { xs: 0, sm: 1 } }}>
          {data.map((d) => (
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
                {d.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
