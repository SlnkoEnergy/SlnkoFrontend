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

/* ---------- utils ---------- */
const safeSrc = (s) => (typeof s === "string" && s.trim() ? s : undefined);

const firstInitial = (s) =>
  typeof s === "string" && s.trim() ? s.trim().charAt(0).toUpperCase() : "";

/* ---------- status chip ---------- */
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

/* ---------- tooltip content ---------- */
const AssigneeTooltipContent = ({ createdBy, assignees = [] }) => {
  const createdByName =
    typeof createdBy === "object"
      ? createdBy?.name || createdBy?.fullName || createdBy?.email || "—"
      : createdBy || "—";

  return (
    <Box sx={{ p: 0.5, maxHeight: 240, overflow: "auto" }}>
      {createdBy && (
        <Box sx={{ mb: 1 }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
            Created by
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              size="sm"
              src={
                typeof createdBy === "object"
                  ? safeSrc(createdBy?.attachment_url)
                  : undefined
              }
            >
              {firstInitial(createdByName)}
            </Avatar>
            <Typography level="body-sm">{createdByName}</Typography>
          </Box>
        </Box>
      )}

      {Array.isArray(assignees) && assignees.length > 0 && (
        <Box>
          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
            Assigned to
          </Typography>
          {assignees.map((u, i) => {
            const nm = u?.name || "—";
            return (
              <Box
                key={u?._id || u?.id || `${nm}-${i}`}
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Avatar src={safeSrc(u?.attachment_url)} size="sm">
                  {firstInitial(nm)}
                </Avatar>
                <Typography level="body-sm">{nm}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

/* ---------- single row ---------- */
function Row({ item, showDivider }) {
  const chip = useMemo(() => statusChip(item.status), [item.status]);
  const navigate = useNavigate();

  const createdByObj = item.createdBy || null;
  const createdByName =
    createdByObj?.name ||
    item.createdBy?.name ||
    (typeof item.createdBy === "string" ? item.createdBy : "") ||
    "—";

  const assignees = Array.isArray(item.assigned_to) ? item.assigned_to : [];

  const goToTask = () => {
    if (item?.id || item?._id) {
      const id = item.id ?? item._id;
      navigate(`/view_task?task=${encodeURIComponent(id)}`);
    }
  };

  return (
    <Box sx={{ bgcolor: "#FFF" }}>
      <Box
        role="button"
        tabIndex={0}
        onClick={goToTask}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 50px 150px",
          alignItems: "center",
          px: 2,
          py: 1.25,
          cursor: "pointer",
          "&:hover": { backgroundColor: "#FAFAFA" },
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
          >
            {item.title}
          </Typography>
          {chip}
        </Box>

        {/* Time */}
        <Typography
          level="title-sm"
          sx={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}
        >
          {item.time || "—"}
        </Typography>

        {/* Created-by avatar */}
        <Tooltip
          variant="soft"
          placement="top"
          title={<AssigneeTooltipContent createdBy={createdByName} />}
        >
          <Avatar src={safeSrc(createdByName?.attachment_url)} size="sm">
            {firstInitial(createdByName)}
          </Avatar>
        </Tooltip>

        {/* Assigned-to avatars */}
        <Tooltip
          variant="soft"
          placement="top"
          title={<AssigneeTooltipContent assignees={assignees} />}
        >
          <AvatarGroup size="sm" sx={{ "--Avatar-size": "28px" }}>
            {assignees.slice(0, 3).map((u, idx) => (
              <Avatar
                key={u?._id || u?.id || idx}
                src={safeSrc(u?.attachment_url)}
              >
                {firstInitial(u?.name)}
              </Avatar>
            ))}
            {assignees.length > 3 && <Avatar>+{assignees.length - 3}</Avatar>}
          </AvatarGroup>
        </Tooltip>
      </Box>

      {showDivider && <Divider sx={{ borderColor: "rgba(2,6,23,0.06)" }} />}
    </Box>
  );
}

/* ---------- main card ---------- */
export default function TaskStatusList({
  title = "Today Task Creation",
  items = [],
}) {
  return (
    <Card
      variant="soft"
      sx={{
        borderRadius: 28,
        bgcolor: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        maxHeight: "500px",
        height: "500px",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          px: 1,
          py: 0.5,
        }}
      >
        <Typography level="title-lg" sx={{ ml: 0.5, color: "#0f172a" }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(2,6,23,0.08)" }} />

      <Box>
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
