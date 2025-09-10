import * as React from "react";
import { Card, Box, Typography, Slider } from "@mui/joy";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

const COLORS = {
  completed: "#22c55e",
  pending: "#3b82f6",
  cancelled: "#ef4444",
};

const BUCKET_DEFS = [
  { key: "0", label: "Same day", max: 0 },
  { key: "1", label: "1 day", max: 1 },
  { key: "2", label: "2 days", max: 2 },
  { key: "3", label: "3 days", max: 3 },
  { key: "7", label: "7 days", max: 7 },
  { key: "14", label: "14 days", max: 14 },
  { key: "30", label: "30 days", max: 30 },
];

/**
 * Props:
 *  - statsByBucket: { "0":{completed,pending,cancelled}, ... }
 *  - title?: string
 *  - defaultMaxDays?: 0|1|2|3|7|14|30
 *  - onMaxDaysChange?: (days:number) => void
 */
export default function TasksByAgingBar({
  title = "Tasks by Resolution Time",
  statsByBucket = {
    0: { completed: 10, pending: 4, cancelled: 1 },
    1: { completed: 7, pending: 3, cancelled: 0 },
    2: { completed: 5, pending: 2, cancelled: 1 },
    3: { completed: 3, pending: 4, cancelled: 0 },
    7: { completed: 2, pending: 6, cancelled: 1 },
    14: { completed: 1, pending: 2, cancelled: 0 },
    30: { completed: 0, pending: 1, cancelled: 0 },
  },
  defaultMaxDays = 7,
  onMaxDaysChange,
  sx = {},
}) {
  const [maxDays, setMaxDays] = React.useState(defaultMaxDays);

  // If parent changes default, reset internal (using key is fine too)
  React.useEffect(() => {
    setMaxDays(defaultMaxDays);
  }, [defaultMaxDays]);

  const marks = React.useMemo(
    () =>
      BUCKET_DEFS.map((b) => ({
        value: b.max,
        label: b.max === 0 ? "0" : String(b.max),
      })),
    []
  );

  const chartData = React.useMemo(
    () =>
      BUCKET_DEFS.filter((b) => b.max <= maxDays).map((b) => {
        const s = statsByBucket[b.key] || {};
        return {
          bucket: b.label,
          Completed: Number(s.completed || 0),
          Pending: Number(s.pending || 0),
          Cancelled: Number(s.cancelled || 0),
        };
      }),
    [maxDays, statsByBucket]
  );

  const handleSlider = (_, v) => {
    setMaxDays(v);
    onMaxDaysChange?.(v);
  };

  return (
    <Card
      variant="soft"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        p: { xs: 1, sm: 0.5, md: 3 },
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
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography level="title-md" sx={{ color: "#0f172a" }}>
          {title}
        </Typography>

        <Box sx={{ width: 280, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="body-sm" sx={{ color: "#334155", minWidth: 90 }}>
            Up to (days)
          </Typography>
          <Slider
            size="sm"
            value={maxDays}
            step={null}
            marks={marks}
            min={0}
            max={30}
            onChange={handleSlider}
            sx={{
              flex: 1,
              "--Slider-trackSize": "3px",
              "--Slider-thumbSize": "12px",
            }}
          />
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 340, mt: 1 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, bottom: 24, left: 0 }}
          >
            <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={{ fill: "#334155", fontSize: 12 }}
              axisLine={{ stroke: "rgba(15,23,42,0.12)" }}
              tickLine={{ stroke: "rgba(15,23,42,0.12)" }}
            />
            <YAxis
              tick={{ fill: "#334155", fontSize: 12 }}
              axisLine={{ stroke: "rgba(15,23,42,0.12)" }}
              tickLine={{ stroke: "rgba(15,23,42,0.12)" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(15,23,42,0.04)" }}
              contentStyle={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: 10,
                boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" />
            <Bar
              dataKey="Completed"
              fill={COLORS.completed}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="Pending"
              fill={COLORS.pending}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="Cancelled"
              fill={COLORS.cancelled}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
