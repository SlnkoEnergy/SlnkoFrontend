import React from "react";
import { Box, Typography } from "@mui/joy";

function Dashboard() {
  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: 0,
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        minHeight: "100vh",
        backgroundColor: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        "@keyframes blink": {
          "0%, 100%": {
            opacity: 0.25,
            filter: "drop-shadow(0 0 0px transparent)",
          },
          "50%": { opacity: 1, filter: "drop-shadow(0 0 10px currentColor)" },
        },
        "@keyframes flicker": {
          "0%, 100%": {
            opacity: 0.9,
            filter: "drop-shadow(0 0 6px #ffcc55)",
          },
          "50%": { opacity: 1, filter: "drop-shadow(0 0 12px #ffdd88)" },
        },
        "@keyframes glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 10px #ffb300)" },
          "50%": { filter: "drop-shadow(0 0 25px #ffc933)" },
        },
      }}
    >
      {/* ===== Top string lights (Blinkit-style) ===== */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 84,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 30,
            left: 0,
            right: 0,
            height: 2,
            background:
              "repeating-linear-gradient(90deg, #2e2e2e 0 24px, transparent 24px 28px)",
            opacity: 0.25,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(1100px, 95vw)",
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 2 },
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => {
            const colors = ["#06C167", "#FFB703", "#E91E63", "#00B4D8"];
            const color = colors[i % colors.length];
            return (
              <Box
                key={i}
                sx={{
                  width: { xs: 10, sm: 12 },
                  height: { xs: 14, sm: 16 },
                  borderRadius: "8px 8px 14px 14px",
                  backgroundColor: color,
                  color,
                  transform: "translateY(6px)",
                  animation: `blink 1.1s ${i * 0.08}s infinite`,
                  boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ===== Hero / Heading ===== */}
      <Typography
        level="h1"
        sx={{
          textAlign: "center",
          fontWeight: 900,
          letterSpacing: "0.3px",
          mt: 12,
          fontSize: { xs: "2.1rem", sm: "2.5rem", md: "3rem" },
          background:
            "linear-gradient(90deg, #f2b705, #ff7b00 35%, #ffcc33 65%, #ffd77a)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        🪔 Happy Diwali • शुभ दीपावली 🪔
      </Typography>

      {/* ===== Big glowing diya ===== */}
      <Typography
        level="body-md"
        sx={{
          textAlign: "center",
          color: "#7b5e00",
          mb: 3,
          px: 2,
          maxWidth: 820,
          fontWeight: 500,
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.3rem" },
        }}
      >
        May your projects glow bright and ship on time!
      </Typography>

      <Box
        sx={{
          mt: 2,
          mb: 2,
          fontSize: { xs: "80px", sm: "100px", md: "120px" },
          animation: "glow 1.8s ease-in-out infinite",
          textShadow:
            "0 0 15px rgba(255,180,50,0.6), 0 0 35px rgba(255,220,100,0.4)",
        }}
      >
        🪔
      </Box>

      {/* ===== Center filler ===== */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 880,
          minHeight: { xs: 200, sm: 260, md: 300 },
        }}
      />

      {/* ===== Bottom flickering diyas ===== */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: 14,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: { xs: 10, sm: 16, md: 22 },
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              fontSize: { xs: "22px", sm: "26px", md: "30px" },
              animation: `flicker ${1.6 + i * 0.12}s ease-in-out infinite`,
            }}
          >
            🪔
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Dashboard;
