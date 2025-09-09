// ActivityFeedCard.jsx
import { Card, Box, Typography, Avatar, Link, Divider, IconButton } from "@mui/joy";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

/** Brand blues */
const COLOR_A = "#1f487c";
const COLOR_B = "#3366a3";

export default function ActivityFeedCard({
  title = "Activity Feed",
  items = [],
  height = 360,
  onSeeAll,
  sx = {},
}) {
  return (
   <Card
  variant="soft"
  sx={{
    position: "relative",
    overflow: "hidden",
    borderRadius: 28, 
    p: { xs: 1, sm: 0.5, md: 1 },
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
  }}
>
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          
        }}
      >
        <Typography level="title-lg" sx={{ color: "#eaf2ff" }}>
          {title}
        </Typography>

        <Link
          component="button"
          onClick={onSeeAll}
          underline="none"
          sx={{
            color: "#b9d4ff",
            fontWeight: 600,
            mr: 0.5,
            "&:hover": { color: "#d4e4ff" },
          }}
        >
          See All
        </Link>

        <IconButton variant="plain" color="neutral">
          <MoreVertRoundedIcon />
        </IconButton>
      </Box>

      <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Feed list */}
      <Box
        sx={{
          maxHeight: height,
          overflowY: "auto",
          // thin scrollbar
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 8,
          },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}
      >
        {items.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.7)", p: 2 }}>
            No recent activity.
          </Typography>
        ) : (
          items.map((it, idx) => (
            <Box key={it.id ?? idx}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent:'flex-start',
                  gap: 1,
                  alignItems: "center",
                  p:1
                }}
              >
                <Avatar src={it.avatar} size="sm">
                  {it.name?.[0]}
                </Avatar>

                <Box sx={{ minWidth: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Typography
                    level="body-md"
                    sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    <b style={{  }}>{it.name}</b>{" "}
                    <span style={{ opacity: 0.9 }}>{it.action || "updated"}</span>{" "}
                    <b style={{ color: "#b9d4ff" }}>{it.project}</b>
                  </Typography>

                  <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    {it.ago}
                  </Typography>
                </Box>

              
              </Box>

              {idx < items.length - 1 && (
                <Divider sx={{ mx: 0, borderColor: "rgba(255,255,255,0.06)" }} />
              )}
            </Box>
          ))
        )}
      </Box>
    </Card>
  );
}
