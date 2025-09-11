// ActivityFeedCard.jsx
import DOMPurify from "dompurify";
import { Card, Box, Typography, Avatar, Link, Divider } from "@mui/joy";
import { useNavigate } from "react-router-dom";

export default function ActivityFeedCard({
  title = "Activity Feed",
  items = [],
  onSeeAll,
  sx = {},
}) {
  const navigate = useNavigate();

  const sanitize = (html) =>
    DOMPurify.sanitize(String(html || ""), {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        "b",
        "strong",
        "i",
        "em",
        "u",
        "s",
        "del",
        "span",
        "br",
        "p",
        "ul",
        "ol",
        "li",
      ],
      ALLOWED_ATTR: ["style"],
    });

  return (
    <Card
      variant="soft"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        p: { xs: 1, sm: 0.5, md: 1.5 },
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
        maxHeight: 500,
        height: 500,
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
        }}
      >
        <Typography level="title-lg">{title}</Typography>
      </Box>

      <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

      {/* Feed list */}
      <Box
        sx={{
          maxHeight: "100%",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.18)",
            borderRadius: 8,
          },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}
      >
        {items.length === 0 ? (
          <Typography level="body-sm" sx={{ color: "text.secondary", p: 2 }}>
            No recent activity.
          </Typography>
        ) : (
          items.map((it, idx) => {
            const safeRemarks = sanitize(it.remarks);
            const goToTask = () =>
              it.task_id &&
              navigate(`/view_task?task=${encodeURIComponent(it.task_id)}`);

            return (
              <Box key={it.id ?? idx}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 1,
                    alignItems: "start",
                    p: 0.75,
                    cursor: it.task_id ? "pointer" : "default",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                  }}
                  onClick={goToTask}
                >
                  <Avatar src={it.avatar} size="sm">
                    {it.name?.[0]}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    {/* Header line (kept single line w/ ellipsis) */}
                    <Typography
                      level="body-md"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={`${it.name} ${it.action || "updated"} ${
                        it.project
                      }${it.task_code ? ` (${it.task_code})` : ""}`}
                    >
                      <b>{it.name}</b>{" "}
                      <span style={{ opacity: 0.9 }}>
                        {it.action || "updated"}
                      </span>{" "}
                      <b style={{ color: "#1e40af" }}>{it.project}</b>
                      {it.task_code ? (
                        <Typography
                          component="span"
                          level="body-sm"
                          sx={{
                            ml: 0.5,
                            color: "text.tertiary",
                            fontWeight: 600,
                          }}
                        >
                          ({it.task_code})
                        </Typography>
                      ) : null}
                    </Typography>

                    {/* Sanitized remarks HTML (WRAPS LONG CONTENT) */}
                    {safeRemarks && (
                      <Box
                        sx={{
                          mt: 0.25,
                          fontSize: "14px",
                          lineHeight: 1.35,
                          color: "text.secondary",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          whiteSpace: "normal",

                          // make inner elements respect the small size
                          "& p, & span, & li": {
                            fontSize: "inherit",
                            lineHeight: "inherit",
                          },
                          "& ol, & ul": { pl: 2, m: 0 },
                          "& li": { mb: 0.25 },
                          "& b, & strong": { fontWeight: 700 },
                          "& i, & em": { fontStyle: "italic" },
                        }}
                        dangerouslySetInnerHTML={{ __html: safeRemarks }}
                      />
                    )}
                  </Box>

                  <Typography
                    fontSize="0.7rem"
                    fontWeight={600}
                    sx={{
                      color: "var(--joy-palette-neutral-500)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {it.ago}
                  </Typography>
                </Box>

                {idx < items.length - 1 && (
                  <Divider sx={{ mx: 0, borderColor: "rgba(0,0,0,0.06)" }} />
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Card>
  );
}
