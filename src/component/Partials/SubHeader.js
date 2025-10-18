// src/components/Header.js
import { useLocation, useNavigate } from "react-router-dom";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";

export default function SubHeader({
  title,
  isBackEnabled = false,
  onBack,
  sticky = true,
  sidebarWidth = { lg: 30, xl: 30 },
  rightSlot = null,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => (onBack ? onBack() : navigate(-1));
  const isProjectsPage = location.pathname === "/view_pm" || "/email";
  return (
    <Sheet
      variant="primary"
      sx={(theme) => ({
        position: "fixed",
        top: "60px",
        zIndex: 100,
        backdropFilter: "saturate(180%) blur(8px)",
        backgroundColor: "#f8f9fa",
        borderBottom: `1px solid ${theme.vars.palette.neutral.outlinedBorder}`,
        boxShadow: "sm",
        width: isProjectsPage
          ? "100%"
          : { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        height: "48px",
        ml: isProjectsPage
          ? "0px"
          : {
              md: "0px",
              lg: "var(--Sidebar-width)",
            },
      })}
    >
      {/* Main row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 2.2 },
          py: { xs: 1, md: 1 },
          height: "100%",
        }}
      >
        <Box display={"flex"} gap={1}>
          {/* Left: Back button */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isBackEnabled ? (
              <IconButton size="sm" onClick={handleBack} aria-label="Go back">
                <ArrowBackIosNewRounded fontSize="small" />
              </IconButton>
            ) : (
              <Box sx={{ display: "none" }} />
            )}
          </Box>

          {/* Center: Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              level="h5"
              sx={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        {/* Right: Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: 0.75, sm: 1 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            maxWidth: "100%",
            overflowX: { xs: "auto", sm: "visible" },
            "& > *": { flexShrink: 0 },
          }}
        >
          {rightSlot || children || null}
        </Box>
      </Box>
    </Sheet>
  );
}
