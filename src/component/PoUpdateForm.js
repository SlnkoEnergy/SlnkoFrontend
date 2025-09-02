import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Sheet,
  Textarea,
  Typography,
} from "@mui/joy";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import Close from "@mui/icons-material/Close";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import LocalMallOutlined from "@mui/icons-material/LocalMallOutlined";
import ChangeCircleOutlined from "@mui/icons-material/ChangeCircleOutlined";

function initials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function formatStatusLabel(str = "") {
  return String(str)
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatINR(n) {
  const val = Number(n ?? 0);
  return val.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function formatMoney(n, currency) {
  if (!currency || currency.toUpperCase() === "INR") return formatINR(n);
  const val = Number(n ?? 0);
  try {
    return val.toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `${currency} ${val.toFixed(2)}`;
  }
}
function sameDay(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function dayLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ItemIcon({ kind }) {
  switch (kind) {
    case "amount_change":
      return <ChangeCircleOutlined fontSize="small" color="primary" />;
    case "status":
      return <CheckCircleOutline fontSize="small" color="success" />;
    case "bill":
      return <LocalMallOutlined fontSize="small" color="primary" />;
    case "note":
      return <EditNoteOutlined fontSize="small" color="neutral" />;
    case "created":
      return <EditNoteOutlined fontSize="small" color="primary" />;
    default:
      return <EditNoteOutlined fontSize="small" color="neutral" />;
  }
}

function AmountChangeRow({ from, to, currency = "INR", label, field }) {
  const caption =
    label ||
    (field === "untaxed"
      ? "Untaxed"
      : field === "gst"
      ? "GST"
      : field === "po_value"
      ? "Total"
      : field || "Amount");
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
    >
      <Typography level="body-sm" sx={{ color: "text.tertiary", minWidth: 72 }}>
        {caption}:
      </Typography>
      <Typography level="body-sm">{formatMoney(from, currency)}</Typography>
      <Typography level="body-sm" sx={{ color: "success.700" }}>
        ⟶ {formatMoney(to, currency)}
      </Typography>
    </Box>
  );
}

function StatusRow({ from, to, remark }) {
  const isRejected = String(to) === "approval_rejected";
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
      >
        <Typography level="body-sm">Status:</Typography>
        <Chip size="sm" variant="soft">
          {from ? formatStatusLabel(from) : "—"}
        </Chip>
        <Typography level="body-sm">⟶</Typography>
        <Chip
          size="sm"
          variant="solid"
          color={isRejected ? "danger" : "primary"}
        >
          {formatStatusLabel(to)}
        </Chip>
      </Box>

      {isRejected && remark ? (
        <Typography level="body-sm" sx={{ color: "danger.700" }}>
          Remarks: {remark}
        </Typography>
      ) : null}
    </Box>
  );
}

function FeedItem({ item }) {
  const t = new Date(item.ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isAmount = item.kind === "amount_change";
  const hasList =
    isAmount && Array.isArray(item.changes) && item.changes.length > 0;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 1.25 }}>
      <Avatar
        size="sm"
        src={item?.user?.avatarUrl}
        sx={{ bgcolor: "neutral.softBg", fontSize: 12 }}
      >
        {initials(item?.user?.name || "U")}
      </Avatar>

      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography level="body-sm" fontWeight="lg">
            {item?.user?.name || "User"}
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {t}
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 0.25 }}
        >
          <ItemIcon kind={item.kind} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {isAmount ? (
              <>
                {item.title && (
                  <Typography level="body-sm" sx={{ mb: 0.25 }}>
                    {item.title}
                  </Typography>
                )}
                {hasList ? (
                  <Box sx={{ display: "grid", gap: 0.25 }}>
                    {item.changes.map((c, i) => (
                      <AmountChangeRow
                        key={i}
                        from={c.from}
                        to={c.to}
                        currency={item.currency}
                        label={c.label}
                        field={c.path || c.field}
                      />
                    ))}
                  </Box>
                ) : (
                  <AmountChangeRow
                    from={item.from}
                    to={item.to}
                    currency={item.currency}
                    field={item.field}
                  />
                )}
              </>
            ) : item.kind === "status" ? (
              <StatusRow
                from={item.statusFrom}
                to={item.statusTo}
                remark={item.title}
              />
            ) : item.kind === "note" ? (
              <Box>
                {item.note && (
                  <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
                    {item.note}
                  </Typography>
                )}
                {Array.isArray(item.attachments) &&
                  item.attachments.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {item.attachments.map((att, idx) =>
                        att?.url ? (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#214b7b",
                              fontWeight: 500,
                              display: "block",
                            }}
                          >
                            📎 {att.name}
                          </a>
                        ) : null
                      )}
                    </Box>
                  )}
              </Box>
            ) : (
              <Typography level="body-sm">
                {item.title || "Updated"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function POUpdateFeed({
  items = [],
  onAddNote,
  compact = false,
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const grouped = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    const out = [];
    for (const it of sorted) {
      const last = out[out.length - 1];
      if (!last || !sameDay(last.date, it.ts))
        out.push({ date: it.ts, rows: [it] });
      else last.rows.push(it);
    }
    return out;
  }, [items]);

  const handleAddNote = async () => {
    if (!note.trim() || !onAddNote) return;
    try {
      setSending(true);
      await onAddNote(note.trim());
      setNote("");
      setNoteOpen(false);
    } finally {
      setSending(false);
    }
  };
  return (
    <Sheet
      variant="outlined"
      sx={{
        mt: 2,
        borderRadius: "lg",
        overflow: "hidden",
        bgcolor: "background.surface",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.25,
          py: 1,
          display: "flex",
          gap: 0.75,
          alignItems: "center",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)",
        }}
      >
        <Chip
          variant={noteOpen ? "solid" : "soft"}
          color="primary"
          size="sm"
          startDecorator={<EditNoteOutlined fontSize="small" />}
          onClick={() => setNoteOpen((s) => !s)}
          sx={{ cursor: "pointer", fontWeight: 600 }}
        >
          Log Note
        </Chip>
      </Box>

      {noteOpen && (
        <Box
          sx={{
            p: 1.25,
            borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)",
          }}
        >
          <Sheet variant="soft" sx={{ p: 1.25, borderRadius: "md" }}>
            <Textarea
              minRows={2}
              placeholder="Add an internal note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              endDecorator={
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<Close />}
                    onClick={() => {
                      setNote("");
                      setNoteOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    variant="solid"
                    loading={sending}
                    startDecorator={<EditNoteOutlined />}
                    onClick={handleAddNote}
                  >
                    Log note
                  </Button>
                </Box>
              }
            />
          </Sheet>
        </Box>
      )}

      {/* Feed */}
      <Box
        sx={{
          p: compact ? 1 : 2,
          maxHeight: 400,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "3px",
          },
        }}
      >
        {grouped.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "text.tertiary", px: 0.5 }}>
            No updates yet.
          </Typography>
        ) : (
          grouped.map((g, gi) => (
            <Box key={gi} sx={{ mb: 2.5 }}>
              <Typography
                level="body-xs"
                sx={{ color: "text.tertiary", mb: 1 }}
              >
                {dayLabel(g.date)}
              </Typography>

              <Sheet variant="plain" sx={{ display: "grid", gap: 1.25, p: 0 }}>
                {g.rows.map((row, i) => (
                  <Box key={row.id || i}>
                    <FeedItem item={row} />
                    {i < g.rows.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Sheet>
            </Box>
          ))
        )}
      </Box>
    </Sheet>
  );
}
