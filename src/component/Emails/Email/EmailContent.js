import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Snackbar from "@mui/joy/Snackbar";
import AspectRatio from "@mui/joy/AspectRatio";
import Divider from "@mui/joy/Divider";
import Avatar from "@mui/joy/Avatar";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  useGetEmailByIdQuery,
  useUpdateEmailStatusMutation,
} from "../../../redux/emailSlice";

/* ---------- utility to sanitize html ---------- */
const sanitizeHtmlToText = (html = "") => {
  if (typeof html !== "string") return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/?(?:.|\n)*?>/gm, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};

/* ---------- date formatter ---------- */
const formatDateTime = (d) => {
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EmailContent({ selectedEmail }) {
  // snackbar state
  const [snack, setSnack] = useState({
    open: false,
    color: "success",
    msg: "",
  });

  const { data } = useGetEmailByIdQuery(selectedEmail, {
    skip: !selectedEmail,
  });
  const email = data?.data || {};
  const compiled = email.compiled || {};

  const {
    name_to_send = [],
    to = [],
    cc = [],
    bcc = [],
    from = "",
    replyTo = [],
    subject = "",
    body = "",
    attachments = [],
  } = compiled;

  const status = email?.current_status?.status || "queued";
  const createdAt = email?.createdAt ? formatDateTime(email.createdAt) : "";

  // mutation
  const [updateEmailStatus, { isLoading: isUpdating }] =
    useUpdateEmailStatusMutation();

  const handleMoveToTrash = async () => {
    if (!selectedEmail) return;
    try {
      await updateEmailStatus({ id: selectedEmail, status: "trash" }).unwrap();
      setSnack({
        open: true,
        color: "success",
        msg: "Email moved to trash.",
      });
    } catch (err) {
      setSnack({
        open: true,
        color: "danger",
        msg: String(err?.data?.message || err?.message || "Failed to move."),
      });
    }
  };

  const statusChip = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "sent") return { color: "success", label: "Sent" };
    if (s === "draft") return { color: "neutral", label: "Draft" };
    if (s === "trash") return { color: "danger", label: "Trash" };
    return { color: "primary", label: "Queued" };
  };

  const chip = statusChip(status);

  return (
    <Sheet
      variant="outlined"
      sx={{ minHeight: 500, borderRadius: "sm", p: 3, mb: 3 }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar>{String(name_to_send?.[0] || "SE")[0]}</Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography
              level="title-sm"
              textColor="text.primary"
              sx={{ mb: 0.5 }}
            >
              {Array.isArray(name_to_send)
                ? name_to_send.join(", ") || "—"
                : name_to_send || "—"}
            </Typography>
            <Typography level="body-xs" textColor="text.tertiary">
              {createdAt}
            </Typography>
          </Box>
        </Box>

        {/* SINGLE ACTION: Move to Trash */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            size="sm"
            variant="plain"
            color="danger"
            startDecorator={<DeleteRoundedIcon />}
            onClick={handleMoveToTrash}
            disabled={isUpdating || status === "trash"}
          >
            {status === "trash" ? "In Trash" : "Move to Trash"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* SUBJECT + STATUS */}
      <Typography
        level="title-lg"
        textColor="text.primary"
        endDecorator={
          <Chip
            size="sm"
            color={chip.color}
            variant="soft"
            sx={{ textTransform: "capitalize" }}
          >
            {chip.label}
          </Chip>
        }
      >
        {subject || "(No subject)"}
      </Typography>

      {/* RECIPIENTS */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.8 }}>
        <Typography level="body-sm">
          <strong>From:</strong> {from || "—"}
        </Typography>
        <Typography level="body-sm">
          <strong>To:</strong> {to.length ? to.join(", ") : "—"}
        </Typography>
        {cc.length > 0 && (
          <Typography level="body-sm">
            <strong>CC:</strong> {cc.join(", ")}
          </Typography>
        )}
        {bcc.length > 0 && (
          <Typography level="body-sm">
            <strong>BCC:</strong> {bcc.join(", ")}
          </Typography>
        )}
        {replyTo.length > 0 && (
          <Typography level="body-sm">
            <strong>Reply To:</strong> {replyTo.join(", ")}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* BODY */}
      <Typography level="body-sm" sx={{ mt: 1, mb: 2, whiteSpace: "pre-line" }}>
        {sanitizeHtmlToText(body) || "(No content)"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* ATTACHMENTS */}
      {attachments?.length > 0 && (
        <>
          <Typography level="title-sm" sx={{ mb: 1 }}>
            Attachments ({attachments.length})
          </Typography>
          <Box
            sx={(theme) => ({
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              "& > div": {
                boxShadow: "none",
                "--Card-padding": "0px",
                "--Card-radius": theme.vars.radius.sm,
              },
            })}
          >
            {attachments.map((file, i) => (
              <Card
                key={i}
                variant="outlined"
                orientation="horizontal"
                sx={{ cursor: "pointer" }}
                onClick={() => window.open(file.fileUrl, "_blank")}
              >
                <CardOverflow>
                  <AspectRatio
                    ratio="1"
                    sx={{ minWidth: 80, bgcolor: "background.level2" }}
                  >
                    <FolderIcon />
                  </AspectRatio>
                </CardOverflow>
                <Box sx={{ p: 1.5 }}>
                  <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                    {file.filename || `Attachment ${i + 1}`}
                  </Typography>
                  <Typography level="body-xs" textColor="text.tertiary">
                    {file.fileType || "unknown"}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        color={snack.color}
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        startDecorator={<CheckCircleRoundedIcon />}
        endDecorator={
          <Button
            onClick={() => setSnack((s) => ({ ...s, open: false }))}
            size="sm"
            variant="soft"
            color="neutral"
          >
            Dismiss
          </Button>
        }
      >
        {snack.msg}
      </Snackbar>
    </Sheet>
  );
}
