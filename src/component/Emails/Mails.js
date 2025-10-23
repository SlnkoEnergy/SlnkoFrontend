import React, { useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Avatar from "@mui/joy/Avatar";
import List from "@mui/joy/List";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Chip from "@mui/joy/Chip";
import Tooltip from "@mui/joy/Tooltip";
import Skeleton from "@mui/joy/Skeleton";
import { useGetEmailQuery } from "../../redux/emailSlice";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Button } from "@mui/joy";

/* ---------- small utilities ---------- */
const stripHtml = (html = "") =>
  typeof html === "string"
    ? html
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<\/?(?:.|\n)*?>/gm, "")
        .replace(/\s+/g, " ")
        .trim()
    : "";

const formatINR = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

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

const relativeTime = (d) => {
  const now = Date.now();
  const ts = new Date(d).getTime();
  if (!isFinite(ts)) return "";
  const diff = Math.max(1, Math.floor((now - ts) / 1000));
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ];
  for (const [label, sec] of units) {
    if (diff >= sec) {
      const v = Math.floor(diff / sec);
      return `${v}${label} ago`;
    }
  }
  return "just now";
};

const statusChip = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "sent") return { color: "success", label: "Sent" };
  if (s === "failed") return { color: "danger", label: "Failed" };
  if (s === "draft") return { color: "neutral", label: "Draft" };
  return { color: "primary", label: "Queued" };
};

const initials = (name = "") => {
  const nameStr = Array.isArray(name)
    ? name.join(" ").trim()
    : String(name || "").trim();

  if (!nameStr) return "SE";

  return (
    nameStr
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "SE"
  );
};

/* ---------- component ---------- */
export default function EmailList({
  setSelectedEmail,
  selectedEmailId,
  selectedStatus,
}) {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, error } = useGetEmailQuery({
    page: page,
    limit: pageSize,
    status: selectedStatus,
  });

  const emails = useMemo(() => data?.data || [], [data]);
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: pageSize,
  };
  React.useEffect(() => {
    if (selectedEmailId === null && emails.length > 0) {
      setSelectedEmail(emails[0]?._id || String(0));
    }
  }, [selectedEmailId, emails, setSelectedEmail]);

  const handlePrevPage = () => {
    if (pagination.page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) setPage((prev) => prev + 1);
  };

  const handleFirstPage = () => setPage(1);
  const handleLastPage = () => {
    if (pagination.totalPages > 0) setPage(pagination.totalPages);
  };

  if (isLoading) {
    return (
      <List>
        {Array.from({ length: 6 }).map((_, i) => (
          <React.Fragment key={i}>
            <ListItem sx={{ p: 2 }}>
              <ListItemDecorator sx={{ alignSelf: "flex-start" }}>
                <Skeleton variant="circular" width={36} height={36} />
              </ListItemDecorator>
              <Box sx={{ pl: 2, width: "100%" }}>
                <Skeleton variant="text" level="title-sm" width="40%" />
                <Skeleton variant="text" level="body-sm" />
              </Box>
            </ListItem>
            <ListDivider sx={{ m: 0 }} />
          </React.Fragment>
        ))}
      </List>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography level="title-sm" color="danger">
          Failed to load emails
        </Typography>
        <Typography level="body-sm" sx={{ mt: 0.5 }}>
          {String(error?.data?.message || error?.message || "Unknown error")}
        </Typography>
      </Box>
    );
  }

  if (!emails.length) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography level="title-sm">No emails found</Typography>
        <Typography level="body-sm" textColor="text.tertiary">
          Emails will appear here once they are{" "}
          {selectedStatus
            ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)
            : "queued"}
          .
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        [`& .${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]:
          {
            borderLeft: "2px solid",
            borderLeftColor: "var(--joy-palette-primary-outlinedBorder)",
          },
      }}
    >
      {emails.map((item, index) => {
        const payload =
          item?.compiled?.payload ||
          item?.payload ||
          item?.variables_used ||
          {};

        const nameTo = item?.compiled?.name_to_send || "—";
        const subject = item?.compiled?.subject || "(No subject)";
        const bodyPlain = stripHtml(item?.compiled?.body);
        const createdAt = item?.createdAt;
        const s = statusChip(item?.current_status?.status);
        const amount =
          payload?.payment?.amount !== undefined
            ? formatINR(payload.payment.amount)
            : null;
        const project = payload?.project?.name || payload?.project || undefined;

        const id = item?._id || String(index);
        const isSelected = selectedEmailId
          ? selectedEmailId === id
          : index === 0;

        return (
          <React.Fragment key={id}>
            <ListItem>
              <ListItemButton
                selected={isSelected}
                color={isSelected ? "neutral" : undefined}
                sx={{ p: 2, cursor: "pointer" }}
                onClick={() => setSelectedEmail?.(id)} // ← pass _id to parent
              >
                <ListItemDecorator sx={{ alignSelf: "flex-start" }}>
                  <Avatar>{initials(nameTo)}</Avatar>
                </ListItemDecorator>

                <Box sx={{ pl: 2, width: "100%" }}>
                  {/* Top row: Name + status + date */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 0.5,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        level="body-sm"
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 260,
                        }}
                        title={
                          Array.isArray(nameTo) ? nameTo.join(", ") : nameTo
                        }
                      >
                        {Array.isArray(nameTo) ? nameTo.join(", ") : nameTo}
                      </Typography>

                      <Chip
                        size="sm"
                        color={s.color}
                        variant="soft"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {s.label}
                      </Chip>
                    </Box>

                    <Tooltip title={formatDateTime(createdAt)}>
                      <Typography level="body-xs" textColor="text.tertiary">
                        {relativeTime(createdAt)}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Subject */}
                  <Typography
                    level="title-sm"
                    sx={{
                      mb: 0.25,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                    }}
                    title={subject}
                  >
                    {subject}
                  </Typography>

                  {/* Meta row (amount + project) if available */}
                  {(amount || project) && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        mb: 0.25,
                      }}
                    >
                      {amount && (
                        <Chip size="sm" variant="outlined" color="neutral">
                          Amount: {amount}
                        </Chip>
                      )}
                      {project && (
                        <Chip size="sm" variant="outlined" color="primary">
                          Project: {String(project)}
                        </Chip>
                      )}
                    </Box>
                  )}

                  {/* Preview text (HTML stripped) */}
                  <Typography
                    level="body-sm"
                    textColor="text.tertiary"
                    sx={{
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                    title={bodyPlain}
                  >
                    {bodyPlain || "—"}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
            <ListDivider sx={{ m: 0 }} />
          </React.Fragment>
        );
      })}
      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          gap: 1.5,
        }}
      >
        <Box>
          <Typography level="title-sm" textColor="text.tertiary">
            Showing {emails.length} of {pagination.total} emails
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleFirstPage}
            disabled={pagination.page <= 1}
            sx={{ minWidth: 32, px: 0 }}
          >
            <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
          </Button>

          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handlePrevPage}
            disabled={pagination.page <= 1}
            sx={{ minWidth: 32, px: 0 }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </Button>

          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleNextPage}
            disabled={pagination.page >= pagination.totalPages}
            sx={{ minWidth: 32, px: 0 }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </Button>

          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleLastPage}
            disabled={pagination.page >= pagination.totalPages}
            sx={{ minWidth: 32, px: 0 }}
          >
            <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
          </Button>
        </Box>
      </Box>
    </List>
  );
}
