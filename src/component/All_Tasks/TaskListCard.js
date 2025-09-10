// TaskStatusList.jsx
import { useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
  Tooltip,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";

/* ---------- helpers ---------- */
const statusChip = (status) => {
  if (!status || status === "none") return null;
  const key = String(status).toLowerCase();
  const map = {
    "in progress": { label: "In progress", color: "warning" },
    completed: { label: "Completed", color: "success" },
    pending: { label: "Pending", color: "primary" },
    cancelled: { label: "Cancelled", color: "danger" },
  };
  const cfg = map[key] || { label: status, color: "neutral" };

  return (
    <Chip
      size="sm"
      variant="soft"
      color={cfg.color}
      sx={{
        ml: 1,
        fontWeight: 600,
        borderRadius: 999,
        textTransform: "none",
        px: 1.25,
      }}
    >
      {cfg.label}
    </Chip>
  );
};

const firstInitial = (s) =>
  typeof s === "string" && s.trim()
    ? s.trim().charAt(0).toUpperCase()
    : "";

/* Vertical tooltip content: Created by + list of assignees (with avatars) */
const AssigneeTooltipContent = ({ createdBy, assignees = [] }) => (
  <Box sx={{ p: 0.5, maxHeight: 240, overflow: "auto" }}>
    {createdBy ? (
      <Box sx={{ mb: 1 }}>
        <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
          Created by
        </Typography>
        <Typography level="body-sm">{createdBy}</Typography>
      </Box>
    ) : null}

    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
      Assigned to
    </Typography>
    {assignees.length ? (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {assignees.map((u) => (
          <Box
            key={u?._id || u?.id || u?.name}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Avatar src={u?.avatar} size="sm">
              {firstInitial(u?.name)}
            </Avatar>
            <Typography level="body-sm">{u?.name || "—"}</Typography>
          </Box>
        ))}
      </Box>
    ) : (
      <Typography level="body-sm">—</Typography>
    )}
  </Box>
);

/* ---------- row ---------- */
function Row({ item, showDivider }) {
  const chip = useMemo(() => statusChip(item.status), [item.status]);
  const navigate = useNavigate();

  const createdBy =
    item.created_by || item.createdBy?.name || item.createdBy || "—";
  const createdAvatarProps = {};
  if (item.creator?.avatar) createdAvatarProps.src = item.creator.avatar;

  const assignees = Array.isArray(item.assigned_to) ? item.assigned_to : [];

  const goToTask = () => {
    if (item?.id || item?._id) {
      const id = item.id ?? item._id;
      navigate(`/view_task?task=${encodeURIComponent(id)}`);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToTask();
    }
  };

  return (
    <Box sx={{ bgcolor: "#FFF" }}>
      <Box
        role="button"
        tabIndex={0}
        onClick={goToTask}
        onKeyDown={onKey}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 50px 150px", // title | time | creator | assignees
          alignItems: "center",
          px: 2,
          py: 1.25,
          bgcolor: "#FFF",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#FAFAFA" },
          "&:focus-visible": {
            outline: "2px solid rgba(59,130,246,0.6)",
            outlineOffset: "2px",
            borderRadius: 10,
          },
          columnGap: 8,
        }}
      >
        {/* Title + status chip */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Typography
            level="title-sm"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={item.title}
          >
            {item.title}
          </Typography>
          {chip}
        </Box>

        {/* Time */}
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

        {/* Created-by avatar (tooltip shows vertical lists) */}
        <Tooltip
          variant="soft"
          placement="top"
          title={
            <AssigneeTooltipContent
              createdBy={createdBy}
              assignees={assignees}
            />
          }
        >
          <Avatar size="sm" {...createdAvatarProps}>
            {firstInitial(createdBy)}
          </Avatar>
        </Tooltip>

        {/* Assigned-to avatars (up to 3 + "+N"), same vertical tooltip */}
        <Tooltip
          variant="soft"
          placement="top"
          title={
            <AssigneeTooltipContent
              createdBy={createdBy}
              assignees={assignees}
            />
          }
        >
          <AvatarGroup size="sm" sx={{ "--Avatar-size": "28px" }}>
            {assignees.slice(0, 3).map((u) => (
              <Avatar key={u?._id || u?.id || u?.name} src={u?.avatar}>
                {firstInitial(u?.name)}
              </Avatar>
            ))}
            {assignees.length > 3 && (
              <Avatar>+{assignees.length - 3}</Avatar>
            )}
          </AvatarGroup>
        </Tooltip>
      </Box>

      {showDivider && (
        <Divider sx={{ borderColor: "rgba(2,6,23,0.06)" }} />
      )}
    </Box>
  );
}

/* ---------- main card ---------- */
export default function TaskStatusList({
  title = "Task Status",
  items = [],
}) {
  return (
    <Card
      variant="soft"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        p: { xs: 2, sm: 2.5, md: 1.5 },
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
        height:'500px',
        overflowY: "auto",
        gap: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          px: 1,
          py: 0.5,
          bgcolor: "#fff",
        }}
      >
        <Typography level="title-lg" sx={{ ml: 0.5, color: "#0f172a" }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(2,6,23,0.08)" }} />

      {/* Rows */}
      <Box sx={{ bgcolor: "#FFF" }}>
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
              key={it.id ?? it._id ?? idx}
              item={it}
              showDivider={idx < items.length - 1}
            />
          ))
        )}
      </Box>
    </Card>
  );
}
