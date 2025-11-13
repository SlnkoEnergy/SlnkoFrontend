import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/joy";

function Dashboard() {
  const FOUNDATION_YEAR = 2018;
  const years = useMemo(() => {
    const y = new Date().getFullYear() - FOUNDATION_YEAR;
    return y > 0 ? y : 0;
  }, []);


  const stats = [
    { label: "Projects Delivered", value: "1.4GW+" },
    { label: "MW Deployed", value: "6000+" },
    { label: "Active ProTrac Users", value: "150+" },
    { label: "Happy Clients", value: "500+" },
  ];


  const STORAGE_KEY = "slnko_foundation_hifives";
  const [hiFives, setHiFives] = useState(0);
  const [bump, setBump] = useState(false);
  const [partyOn, setPartyOn] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
    setHiFives(Number.isFinite(saved) ? saved : 0);
    triggerParty(60, 2500);
  }, []);

  const handleHighFive = () => {
    const next = hiFives + 1;
    setHiFives(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    setBump(true);
    setTimeout(() => setBump(false), 600);
    triggerParty(90, 3200);
  };

  
  const triggerParty = (count = 80, durationMs = 3000) => {
    const colors = ["#06C167", "#FFB703", "#E91E63", "#00B4D8", "#7C4DFF", "#FF7043"];
    const pieces = Array.from({ length: count }).map((_, i) => ({
      id: i + "-" + Math.random().toString(36).slice(2),
      left: Math.random() * 100, 
      size: 6 + Math.random() * 10, 
      rotate: Math.floor(Math.random() * 360),
      duration: 1800 + Math.random() * 2200,
      delay: Math.random() * 300, 
      color: colors[i % colors.length],
      drift: (Math.random() - 0.5) * 40,
    }));
    setConfetti(pieces);
    setPartyOn(true);
    setTimeout(() => {
      setPartyOn(false);
      setConfetti([]);
    }, durationMs);
  };

  return (
    <Box
      sx={{
        ml: { md: 0, lg: "var(--Sidebar-width)" },
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

        // ===== Animations =====
        "@keyframes blink": {
          "0%, 100%": { opacity: 0.25, filter: "drop-shadow(0 0 0px transparent)" },
          "50%": { opacity: 1, filter: "drop-shadow(0 0 10px currentColor)" },
        },
        "@keyframes glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 10px #ffb300)" },
          "50%": { filter: "drop-shadow(0 0 25px #ffc933)" },
        },
        "@keyframes fall": {
          "0%": { transform: "translate3d(0,-100vh,0) rotate(0deg)", opacity: 0 },
          "10%": { opacity: 1 },
          "100%": {
            transform: "translate3d(var(--drift, 0px), 110vh, 0) rotate(720deg)",
            opacity: 0,
          },
        },
        "@keyframes bump": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.12) rotate(-2deg)" },
          "60%": { transform: "scale(1.06) rotate(1.5deg)" },
          "100%": { transform: "scale(1)" },
        },
        "@keyframes bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "@keyframes gradientSlide": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "@keyframes sheen": {
          "0%": { transform: "translateX(-160%) skewX(-20deg)" },
          "60%": { transform: "translateX(160%) skewX(-20deg)" },
          "100%": { transform: "translateX(160%) skewX(-20deg)" },
        },
        "@keyframes pulseRing": {
          "0%": { transform: "scale(0.9)", opacity: 0.6 },
          "70%": { transform: "scale(1.15)", opacity: 0.15 },
          "100%": { transform: "scale(1.2)", opacity: 0 },
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "@keyframes attention": {
          "0%": { transform: "translateZ(0) rotate(0deg)" },
          "3%": { transform: "translateZ(0) rotate(-2deg)" },
          "6%": { transform: "translateZ(0) rotate(2deg)" },
          "9%": { transform: "translateZ(0) rotate(0deg)" },
          "100%": { transform: "translateZ(0) rotate(0deg)" },
        },
      }}
    >
      {/* ===== Top string lights (kept) ===== */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 84,
          mt: { xs: "20px" },
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

      {/* ===== Confetti overlay (party bomber) ===== */}
      {partyOn && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {confetti.map((p) => (
            <Box
              key={p.id}
              sx={{
                position: "absolute",
                top: 0,
                left: `${p.left}vw`,
                width: p.size,
                height: p.size * 0.6,
                borderRadius: "2px",
                backgroundColor: p.color,
                transform: `rotate(${p.rotate}deg)`,
                animation: `fall ${p.duration}ms linear ${p.delay}ms forwards`,
                "--drift": `${p.drift}px`,
                boxShadow: "0 0 2px rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </Box>
      )}

      {/* ===== Hero ===== */}
      <Box
        sx={{
          textAlign: "center",
          mt: 12,
          px: 2,
          maxWidth: 1000,
          position: "relative",
        }}
      >
        {/* Subtle solar “glow” halo */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,215,130,0.45) 0%, rgba(255,215,130,0.2) 40%, transparent 70%)",
            filter: "blur(8px)",
            animation: "glow 2.4s ease-in-out infinite",
          }}
        />

        <Chip
          size="lg"
          variant="soft"
          color="warning"
          sx={{ mb: 2, fontWeight: 700, letterSpacing: 0.6 }}
        >
          Founded {FOUNDATION_YEAR} • {years}+ Years
        </Chip>

        <Typography
          level="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: "0.3px",
            fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem" },
            background:
              "linear-gradient(90deg, #f2b705, #ff7b00 35%, #ffcc33 65%, #ffd77a)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          SLnko Foundation Day
        </Typography>

        <Typography
          level="body-lg"
          sx={{
            color: "#5d4a00",
            mt: 1,
            mb: 3,
            mx: "auto",
            maxWidth: 820,
            fontWeight: 500,
          }}
        >
          Celebrating our journey of building clean-energy projects and the
          ProTrac platform that powers teams, vendors, and customers—every
          single day.
        </Typography>

        {/* ===== Hi-Five (SUPER ATTRACTIVE) ===== */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            mb: 4,
            animation: "attention 8s ease-in-out infinite",
          }}
        >
          {/* Floating celebratory emojis */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -28,
              left: -12,
              fontSize: 22,
              animation: "float 3.6s ease-in-out infinite",
            }}
          >
            ✨
          </Box>
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -22,
              right: -16,
              fontSize: 20,
              animation: "float 3.2s 0.3s ease-in-out infinite",
            }}
          >
            🎊
          </Box>
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              bottom: -24,
              right: -8,
              fontSize: 22,
              animation: "float 3.8s 0.1s ease-in-out infinite",
            }}
          >
            ⚡
          </Box>

          <Button
            size="lg"
            aria-label="Give a High-Five"
            variant="solid"
            onClick={handleHighFive}
            sx={{
              borderRadius: 999,
              px: 3.2,
              py: 1.8,
              fontWeight: 900,
              letterSpacing: 0.6,
              textTransform: "none",
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
              color: "#08130a",
              background:
                "linear-gradient(90deg, #8BE78B, #FFD166, #FF9A62, #8BE78B)",
              backgroundSize: "250% 250%",
              animation: `${bump ? "bump 0.6s ease," : ""} gradientSlide 6s ease infinite`,
              boxShadow:
                "0 8px 18px rgba(6, 193, 103, 0.25), 0 2px 6px rgba(0,0,0,0.06)",
              transform: "translateZ(0)",
              transition:
                "transform 200ms ease, box-shadow 200ms ease, filter 200ms ease",
              "&:hover": {
                transform: "translateY(-2px) scale(1.03) rotate(-0.4deg)",
                boxShadow:
                  "0 12px 24px rgba(6, 193, 103, 0.35), 0 4px 10px rgba(0,0,0,0.12)",
                filter: "saturate(1.05)",
              },
              "&:active": {
                transform: "translateY(0px) scale(0.98)",
              },
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -6,
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.5)",
                filter: "blur(1px)",
                animation: "pulseRing 2.2s ease-out infinite",
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "55%",
                background:
                  "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
                transform: "translateX(-160%) skewX(-20deg)",
                animation: "sheen 3.2s ease-in-out infinite",
                pointerEvents: "none",
                mixBlendMode: "soft-light",
              },
            }}
          >
            🙌 Give a High-Five
          </Button>

          <Chip variant="soft" color="neutral" size="lg" sx={{ fontWeight: 800 }}>
            Hi-Fives so far: {hiFives.toLocaleString()}
          </Chip>
        </Box>

        {/* Stats */}
        <Grid
          container
          spacing={2}
          sx={{
            maxWidth: 980,
            mx: "auto",
            px: { xs: 1, sm: 2 },
          }}
        >
          {stats.map((s, idx) => (
            <Grid xs={12} sm={6} md={3} key={s.label + idx}>
              <Card
                variant="soft"
                sx={{
                  borderRadius: "xl",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                  <Typography
                    level="h2"
                    sx={{
                      fontSize: { xs: "1.8rem", md: "2rem" },
                      fontWeight: 800,
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography level="body-sm" sx={{ mt: 0.5, opacity: 0.8 }}>
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ===== Bottom “party bombers” (subtle, happy look) ===== */}
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
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              fontSize: { xs: "22px", sm: "26px", md: "30px" },
              animation: `bounce ${1.6 + i * 0.08}s ease-in-out infinite`,
            }}
          >
            🎉
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Dashboard;
