import { Box, Card, Typography, Button } from "@mui/joy";

export default function CloudStatCard({
  value = 0,
  title = "Title",
  onAction,
  illustration,
  tone = "light",
  accent = "#4f83cc",
  size = "sm", // "sm" | "md"
  sx = {},
}) {
  const isLight = tone === "light";

  // compact vs regular
  const S =
    size === "sm"
      ? {
          radius: 20,
          pad: { xs: 1.5, sm: 2, md: 2 },
          gridRightCol: { xs: "1fr", md: "1fr 140px" },
          valueFs: { xs: 26, sm: 32 },
          titleFs: 18,
          subtitleMt: 0.25,
          subtitleMb: 1.25,
          illoWrapH: 96,
          halo: 120,
          illoW: 100,
          illoH: 76,
          illoRadius: 14,
        }
      : {
          radius: 28,
          pad: { xs: 2, sm: 2.5, md: 3 },
          gridRightCol: { xs: "1fr", md: "1fr 170px" },
          valueFs: { xs: 34, sm: 40 },
          titleFs: 20,
          subtitleMt: 0.5,
          subtitleMb: 1.75,
          illoWrapH: 120,
          halo: 160,
          illoW: 128,
          illoH: 96,
          illoRadius: 16,
        };

  return (
    <Card
      variant="soft"
      onClick={onAction}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: S.radius,
        p: S.pad,
        bgcolor: isLight ? "#fff" : "rgba(255,255,255,0.85)",
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow:
          "0 2px 6px rgba(15,23,42,0.06), 0 18px 32px rgba(15,23,42,0.06)",
        cursor: onAction ? "pointer" : "default",
        transition: "transform .16s ease, box-shadow .16s ease",
        "&:hover": {
          transform: onAction ? "translateY(-2px)" : "none",
          boxShadow:
            "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: S.gridRightCol,
          alignItems: "center",
          gap: { xs: 1.25, md: 1.75 },
          mt: 0.5,
        }}
      >
        {/* left column */}
        <Box>
          <Typography
            level="h1"
            sx={{
              fontSize: S.valueFs,
              lineHeight: 1,
              fontWeight: 800,
              color: "#0f172a",
              mb: 0.75,
            }}
          >
            {value}
          </Typography>

          <Typography
            level="h5"
            sx={{
              color: "#111827",
              fontWeight: 700,
              fontSize: { xs: "1rem", xl: "1.2rem" },
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* right column – illustration */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            height: S.illoWrapH,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: S.halo,
              height: S.halo,
              borderRadius: "50%",
              background: `radial-gradient(circle at 50% 50%, ${accent}22, transparent 60%)`,
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: S.illoW,
              height: S.illoH,
              borderRadius: S.illoRadius,
              bgcolor: "#fff",
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {illustration || null}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
