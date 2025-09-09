import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  Typography,
  IconButton,
  Sheet,
  Skeleton,
} from "@mui/joy";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

/** Theme colors */
const COLOR_A = "#1f487c"; // deep blue
const COLOR_B = "#3366a3"; // lighter blue

/** A little helper to build nice gradients & states */
const cardStyles = (tone = 0) => {
  // tone nudges the lightness so each card is slightly different
  const bg = `linear-gradient(145deg, ${COLOR_A} ${10 + tone}%, ${COLOR_B} 100%)`;
  return {
    position: "relative",
    cursor: "default",
    overflow: "hidden",
    borderRadius: "xl",
    p: 2,
    minHeight: 84,
    bgcolor: "transparent",
    backgroundImage: bg,
    color: "#fff",
    border: "1px solid",
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow:
      "0 1px 1px rgba(0,0,0,0.2), 0 6px 20px rgba(31,72,124,0.35)",
    "&:hover": {
      borderColor: "rgba(255,255,255,0.25)",
      transform: "translateY(-1px)",
      transition: "150ms ease",
    },
  };
};

/** Sparkline background (kept, but recolored to fit the blues) */
function Sparkline({ opacity = 0.35 }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: "inherit",
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 160 48"
        preserveAspectRatio="none"
        style={{ mixBlendMode: "screen", opacity }}
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <polyline
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          points="5,36 25,26 45,30 70,20 95,28 120,18 150,24"
        />
      </svg>
    </Box>
  );
}

/** Single metric card */
function StatCard({ icon, label, value, tone = 0 }) {
  return (
    <Card variant="soft" sx={cardStyles(tone)}>
      <Sparkline />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="sm"
          variant="outlined"
          sx={{
            borderColor: "rgba(255,255,255,0.35)",
            bgcolor: "rgba(255,255,255,0.05)",
            color: "#fff",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.12)",
              borderColor: "rgba(255,255,255,0.6)",
            },
          }}
        >
          {icon}
        </IconButton>

        <Box sx={{ ml: 0.5 }}>
          <Typography level="h4" sx={{ lineHeight: 1, color: "#fff" }}>
            {value}
          </Typography>
          <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.85)" }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

/** Row of four task summary cards */
export default function TaskSummaryCards() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchCounts() {
      try {
        // TODO: replace with your real API
        await new Promise((r) => setTimeout(r, 400));
        if (!isMounted) return;
        setCounts({
          pending: 7,
          inProgress: 12,
          completed: 34,
          cancelled: 2,
        });
      } catch (e) {
        console.error("Failed to load task counts", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Grid container spacing={1.5}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} xs={12} sm={6} md={3}>
            <Card
              sx={{
                ...cardStyles(i * 4),
                backgroundImage: "none",
                bgcolor: `${COLOR_A}`,
              }}
            >
              <Sheet
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  bgcolor: "transparent",
                }}
              >
                <Skeleton variant="circular" width={28} height={28} />
                <Box>
                  <Skeleton width={28} />
                  <Skeleton width={90} />
                </Box>
              </Sheet>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={1.5}>
      <Grid xs={12} sm={6} md={3}>
        <StatCard
          icon={<HourglassTopRoundedIcon />}
          label="Pending Tasks"
          value={counts.pending}
          tone={0} // deepest
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <StatCard
          icon={<AssignmentTurnedInRoundedIcon />}
          label="In Progress"
          value={counts.inProgress}
          tone={6}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <StatCard
          icon={<CheckCircleRoundedIcon />}
          label="Completed"
          value={counts.completed}
          tone={10}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <StatCard
          icon={<CancelRoundedIcon />}
          label="Cancelled"
          value={counts.cancelled}
          tone={14} // lightest
        />
      </Grid>
    </Grid>
  );
}
