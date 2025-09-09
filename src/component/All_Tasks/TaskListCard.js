// TaskStatusList.jsx (pure white, same look as top cards)
import { useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Avatar,
  Radio,
  Divider,
  Button,
} from "@mui/joy";

/* ---------- helpers ---------- */
const statusChip = (status) => {
  if (!status || status === "none") return null;
  const map = {
    feedback: { label: "feedback requested", color: "warning", icon: "🗣️" },
    paused: { label: "paused", color: "neutral", icon: "⏸️" },
  };
  const cfg = map[status] || { label: status, color: "neutral", icon: "•" };
  return (
    <Chip
      size="sm"
      variant="soft"
      color={cfg.color}
      sx={{
        ml: 1,
        textTransform: "none",
        fontWeight: 600,
        gap: 0.5,
        borderRadius: 10,
        bgcolor: "#FFF", // keep chip on clean white
        border: "1px solid rgba(2,6,23,0.06)",
      }}
    >
      <span style={{ opacity: 0.9 }}>{cfg.icon}</span> {cfg.label}
    </Chip>
  );
};

function Row({ item, onSelect, showDivider }) {
  const chip = useMemo(() => statusChip(item.status), [item.status]);
  return (
    <Box sx={{ bgcolor: "#FFF" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "28px 1fr 120px 40px",
          alignItems: "center",
          px: 2,
          py: 1.25,
          bgcolor: "#FFF", // row stays white
          "&:hover": { backgroundColor: "#FAFAFA" }, // subtle hover
        }}
      >
        <Radio
          checked={!!item.selected}
          onChange={() => onSelect?.(item)}
          variant="plain"
          sx={{ "--Radio-actionRadius": "20px" }}
        />

        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Typography
            level="title-sm"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </Typography>
          {chip}
        </Box>

        <Typography
          level="title-sm"
          sx={{
            textAlign: "center",
            letterSpacing: 0.3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {item.time || "—"}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Avatar src={item.assignee?.avatar} size="sm">
            {item.assignee?.name?.[0]}
          </Avatar>
        </Box>
      </Box>

      {showDivider && (
        <Divider sx={{ mx: 2, borderColor: "rgba(2,6,23,0.06)" }} />
      )}
    </Box>
  );
}

/* ---------- main card ---------- */
export default function TaskStatusList({
  title = "Task Status",
  items = [],
  activeTab = "all",
  onTabChange,
  onSelect,
  sx = {},
}) {
  return (
   <Card
  variant="soft"
  sx={{
    position: "relative",
    overflow: "hidden",
    borderRadius: 28, 
    p: { xs: 2, sm: 2.5, md: 3 },
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


      {/* header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          px: 1,
          py: 0.5,
          bgcolor: "#fff", // header also white
        }}
      >
        <Typography level="title-lg" sx={{ ml: 0.5, color: "#0f172a" }}>
          {title}
        </Typography>

        {/* segmented buttons */}
        <Box
          sx={{
            display: "inline-flex",
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            backgroundColor: "#F1F5F9", // light gray like mock
          }}
        >
          <Button
            size="sm"
            variant={activeTab === "all" ? "soft" : "plain"}
            sx={{
              px: 1.25,
              borderRadius: 999,
              bgcolor: activeTab === "all" ? "#FFF" : "transparent",
              color: "#0f172a",
              boxShadow:
                activeTab === "all" ? "inset 0 1px 0 rgba(0,0,0,0.04)" : "none",
            }}
            onClick={() => onTabChange?.("all")}
          >
            All Task
          </Button>
          <Button
            size="sm"
            variant={activeTab === "mine" ? "soft" : "plain"}
            sx={{
              px: 1.25,
              borderRadius: 999,
              bgcolor: activeTab === "mine" ? "#FFF" : "transparent",
              color: "#0f172a",
              boxShadow:
                activeTab === "mine"
                  ? "inset 0 1px 0 rgba(0,0,0,0.04)"
                  : "none",
            }}
            onClick={() => onTabChange?.("mine")}
          >
            My tasks
          </Button>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(2,6,23,0.08)", mx: 1, mb: 0.5 }} />

      {/* rows */}
      <Box sx={{ px: 0.5, pb: 0.5, bgcolor: "#FFF" }}>
        {items.length === 0 ? (
          <Typography
            level="body-sm"
            sx={{ px: 2, py: 3, color: "text.secondary" }}
          >
            No tasks.
          </Typography>
        ) : (
          items.map((it, idx) => (
            <Row
              key={it.id ?? idx}
              item={it}
              onSelect={onSelect}
              showDivider={idx < items.length - 1}
            />
          ))
        )}
      </Box>
    </Card>
  );
}
