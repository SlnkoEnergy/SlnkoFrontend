// import * as React from "react";
// import { Box, Card, Typography, IconButton, Divider } from "@mui/joy";
// import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
// import { BarChart } from "@mui/x-charts/BarChart";

// /** Demo dataset (monthly rainfall in mm) */
// const defaultDataset = [
//   { month: "Jan", london: 49,  paris: 53,  newYork: 86,  seoul: 21 },
//   { month: "Feb", london: 38,  paris: 46,  newYork: 74,  seoul: 24 },
//   { month: "Mar", london: 41,  paris: 53,  newYork: 96,  seoul: 45 },
//   { month: "Apr", london: 45,  paris: 51,  newYork: 96,  seoul: 74 },
//   { month: "May", london: 49,  paris: 57,  newYork: 101, seoul: 103 },
//   { month: "Jun", london: 53,  paris: 60,  newYork: 90,  seoul: 133 },
//   { month: "Jul", london: 41,  paris: 43,  newYork: 114, seoul: 369 },
//   { month: "Aug", london: 59,  paris: 56,  newYork: 114, seoul: 348 },
//   { month: "Sep", london: 54,  paris: 55,  newYork: 104, seoul: 169 },
//   { month: "Oct", london: 71,  paris: 62,  newYork: 89,  seoul: 52 },
//   { month: "Nov", london: 64,  paris: 59,  newYork: 97,  seoul: 53 },
//   { month: "Dec", london: 59,  paris: 55,  newYork: 94,  seoul: 25 },
// ];

// const valueFormatter = (v) => `${v} mm`;

// /** Base theme colors (same family as your other cards) */
// const COLOR_A = "#1f487c";
// const COLOR_B = "#3366a3";

// /** Build container styles based on tone ("light" | "dark") */
// const getContainerStyles = (tone = "light") => {
//   const isLight = tone === "light";
//   const gradA = isLight ? "#2b5ea0" : COLOR_A;  // lighter start
//   const gradB = isLight ? "#4a79b5" : COLOR_B;  // lighter end
//   return {
//     position: "relative",
//     overflow: "hidden",
//     borderRadius: "xl",
//     p: 1.5,
//     bgcolor: "transparent",
//     backgroundImage: `linear-gradient(145deg, ${gradA} 10%, ${gradB} 100%)`,
//     color: "#fff",
//     border: "1px solid",
//     borderColor: isLight ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
//     boxShadow: isLight
//       ? "0 2px 10px rgba(20,40,80,0.25), 0 12px 30px rgba(40,90,150,0.28)"
//       : "0 1px 1px rgba(0,0,0,0.2), 0 6px 20px rgba(31,72,124,0.35)",
//     "&::before": {
//       content: '""',
//       position: "absolute",
//       inset: 0,
//       borderRadius: "inherit",
//       pointerEvents: "none",
//       background:
//         "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.06) 100%)",
//       mixBlendMode: "screen",
//     },
//   };
// };

// /** Decorative dotted overlay */
// function Background({ tone = "light" }) {
//   const isLight = tone === "light";
//   return (
//     <Box
//       aria-hidden
//       sx={{
//         position: "absolute",
//         inset: 0,
//         borderRadius: "inherit",
//         pointerEvents: "none",
//         opacity: isLight ? 0.35 : 0.25,
//       }}
//     >
//       <svg width="100%" height="100%" viewBox="0 0 160 48" preserveAspectRatio="none">
//         <defs>
//           <pattern id="dots-chart" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
//             <circle cx="1.5" cy="1.5" r="1.1" fill={isLight ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"} />
//           </pattern>
//         </defs>
//         <rect width="100%" height="100%" fill="url(#dots-chart)" />
//       </svg>
//     </Box>
//   );
// }

// /**
//  * BarsDatasetCard
//  * Props:
//  * - title: string (header text)
//  * - height: number (card height in px)
//  * - chartHeight: number (inner chart height; defaults to 300)
//  * - tone: "light" | "dark"
//  * - data: array (optional dataset override; falls back to defaultDataset)
//  */
// export default function BarsDatasetCard({
//   title = "Monthly Rainfall",
//   height = 380,
//   chartHeight = 300,
//   tone = "light",
//   data, // optional: pass your own dataset
// }) {
//   const dataset = data?.length ? data : defaultDataset;

//   return (
//     <Card sx={{ ...getContainerStyles(tone), height, display: "flex", flexDirection: "column" }}>
//       <Background tone={tone} />

//       {/* Header */}
//       <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//         <IconButton
//           size="sm"
//           variant="outlined"
//           sx={{
//             mr: 1,
//             color: "#fff !important",
//             "& svg": { color: "#fff" },
//             borderColor: "rgba(255,255,255,0.35)",
//             bgcolor: "rgba(255,255,255,0.05)",
//             "&:hover": {
//               bgcolor: "rgba(255,255,255,0.12)",
//               borderColor: "rgba(255,255,255,0.6)",
//             },
//           }}
//         >
//           <WaterDropRoundedIcon />
//         </IconButton>
//         <Typography level="h5" sx={{ color: "#fff" }}>
//           {title}
//         </Typography>
//       </Box>

//       <Divider sx={{ borderColor: "rgba(255,255,255,0.18)", mb: 0.5 }} />

//       {/* Chart */}
//       <Box
//         sx={{
//           flex: 1,
//           minHeight: 0,
//           bgcolor: "rgba(255,255,255,0.06)",
//           borderRadius: "lg",
//           p: 1,
//         }}
//       >
//         <BarChart
//           dataset={dataset}
//           xAxis={[{ dataKey: "month", scaleType: "band" }]}
//           series={[
//             { dataKey: "london", label: "London", valueFormatter },
//             { dataKey: "paris", label: "Paris", valueFormatter },
//             { dataKey: "newYork", label: "New York", valueFormatter },
//             { dataKey: "seoul", label: "Seoul", valueFormatter },
//           ]}
//           yAxis={[{ label: "rainfall (mm)", width: 60 }]}
//           height={chartHeight}
//           colors={["#b9d4ff", "#8fb6ef", "#6f9bdc", "#4b83c4"]}
//           sx={{
//             "& .MuiChartsAxis-tickLabel": { fill: "#fff" },
//             "& .MuiChartsAxis-line": { stroke: "rgba(255,255,255,0.6)" },
//             "& .MuiChartsGrid-line": { stroke: "rgba(255,255,255,0.12)" },
//             "& .MuiLegend-root .MuiTypography-root": { color: "#fff" },
//           }}
//         />
//       </Box>
//     </Card>
//   );
// }
