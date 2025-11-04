// ActivityFeed.jsx
import DOMPurify from "dompurify";
import { Card, Box, Typography, Avatar, Divider } from "@mui/joy";
export default function ActivityFeed({
  items = [],
  title = "Activity Feed",
  renderHeader,          
  renderEmpty,           
  renderRight,        
  onItemClick,         
  getId = (it, idx) => it.id ?? idx,
  getAvatar = (it) => it.avatar || "",
  getFallbackInitial = (it) => (it.name ? it.name[0] : "?"),
  getTitleLeft = (it) => it.name || "",                       
  getActionVerb = (it) => it.action || "updated",             
  getTitleRight = (it) => it.project || "",             
  getTitleRightSub = (it) => it.task_code || "",              
  getRemarksHtml = (it) => it.remarks || "",                
  getRightText = (it) => it.ago || "",                         
  maxHeight = 500,
  cardSx = {},
  listSx = {},
  rowSx = {},
  sanitizeOptions = {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "s", "del", "span", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["style"],
  },
}) {
  const sanitize = (html) => DOMPurify.sanitize(String(html || ""), sanitizeOptions);

  const Header = () =>
    renderHeader ? (
      renderHeader()
    ) : (
      <Typography level="title-lg">{title}</Typography>
    );

  const Empty = () =>
    renderEmpty ? (
      renderEmpty()
    ) : (
      <Typography level="body-sm" sx={{ color: "text.secondary", p: 2 }}>
        No recent activity.
      </Typography>
    );

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
        maxHeight,
        height: maxHeight,
        ...cardSx,
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
        <Header />
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
          ...listSx,
        }}
      >
        {items.length === 0 ? (
          <Empty />
        ) : (
          items.map((it, idx) => {
            const id = getId(it, idx);
            const avatar = getAvatar(it);
            const initial = getFallbackInitial(it);
            const left = getTitleLeft(it);
            const action = getActionVerb(it);
            const right = getTitleRight(it);
            const rightSub = getTitleRightSub(it);
            const safeRemarks = sanitize(getRemarksHtml(it));

            const Right = () =>
              renderRight ? (
                renderRight(it)
              ) : (
                <Typography
                  fontSize="0.7rem"
                  fontWeight={600}
                  sx={{
                    color: "var(--joy-palette-neutral-500)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getRightText(it)}
                </Typography>
              );

            const handleClick = () => {
              if (onItemClick) onItemClick(it);
            };

            return (
              <Box key={id}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 1,
                    alignItems: "start",
                    p: 0.75,
                    cursor: onItemClick ? "pointer" : "default",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                    ...rowSx,
                  }}
                  onClick={handleClick}
                >
                  <Avatar src={avatar} size="sm">
                    {initial}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    {/* Single-line header with ellipsis */}
                    <Typography
                      level="body-md"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={`${left} ${action} ${right}${
                        rightSub ? ` (${rightSub})` : ""
                      }`}
                    >
                      <b>{left}</b>{" "}
                      <span style={{ opacity: 0.9 }}>{action}</span>{" "}
                      <b style={{ color: "#1e40af" }}>{right}</b>
                      {rightSub ? (
                        <Typography
                          component="span"
                          level="body-sm"
                          sx={{
                            ml: 0.5,
                            color: "text.tertiary",
                            fontWeight: 600,
                          }}
                        >
                          ({rightSub})
                        </Typography>
                      ) : null}
                    </Typography>

                    {/* Sanitized remarks HTML (wraps long content) */}
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

                  <Right />
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
