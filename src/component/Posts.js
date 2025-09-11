// src/components/PostsCard.jsx
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";
import {
  Box,
  Sheet,
  Stack,
  Button,
  IconButton,
  Typography,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Divider,
  Tooltip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Snackbar,
} from "@mui/joy";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CommentComposer from "./Comments";
import { useUpdatePostMutation, useGetPostsQuery } from "../redux/postsSlice";

/* ===================== helpers ===================== */
const fileExt = (name = "") => {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return "";
  return name.slice(dot + 1).toLowerCase();
};
const safeUrl = (url = "") => {
  try {
    const u = new URL(url);
    return u.href;
  } catch {
    return "";
  }
};
const iconFor = (name = "", mime = "") => {
  const ext = fileExt(name);
  if (mime?.includes("pdf") || ext === "pdf")
    return <PictureAsPdfOutlinedIcon />;
  if (
    mime?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)
  ) {
    return <ImageOutlinedIcon />;
  }
  return <DescriptionOutlinedIcon />;
};
const isImage = (name = "", mime = "") => {
  const ext = fileExt(name);
  return (
    (mime && mime.startsWith("image/")) ||
    ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(ext)
  );
};
const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/* -------- sanitize config + helpers (frontend) -------- */
const SANITIZE_CFG = {
  ALLOWED_TAGS: [
    "div",
    "p",
    "br",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "code",
    "pre",
  ],
  ALLOWED_ATTR: {
    a: ["href", "name", "target", "rel"],
    span: ["style"],
    div: ["style"],
    p: ["style"],
  },
};
const linkify = (htmlOrText = "") =>
  String(htmlOrText).replace(
    /(?<!["'=])(https?:\/\/[^\s<]+)/g,
    (m) => `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`
  );
const sanitizeRich = (htmlOrText = "") => {
  const linkified = linkify(htmlOrText);
  return DOMPurify.sanitize(linkified, {
    ALLOWED_TAGS: SANITIZE_CFG.ALLOWED_TAGS,
    ALLOWED_ATTR: SANITIZE_CFG.ALLOWED_ATTR,
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  }).trim();
};

/* --------------- file preview card (activity) --------------- */
function FilePreviewCard({ name, url, type }) {
  const href = safeUrl(url || "");
  const imageLike = isImage(name, type);

  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <Sheet
        variant="soft"
        sx={{
          mt: 0.75,
          borderRadius: "md",
          px: 1,
          py: 1,
          display: "inline-block",
          maxWidth: 280,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 160,
            borderRadius: "sm",
            overflow: "hidden",
            bgcolor: "background.level2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageLike && href ? (
            <img
              src={href}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
          ) : (
            <Box sx={{ fontSize: 48, opacity: 0.5 }}>{iconFor(name, type)}</Box>
          )}
        </Box>

        <Typography
          level="body-sm"
          sx={{
            textAlign: "center",
            mt: 0.75,
            color: "text.secondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 260,
            display: "block",
          }}
          title={name}
        >
          {name}
        </Typography>
      </Sheet>
    </a>
  );
}

/* ---------------- section wrapper ---------------- */
function Section({
  title,
  open = true,
  onToggle,
  children,
  right = null,
  outlined = true,
  collapsible = true,
  contentSx = {},
}) {
  return (
    <Sheet
      variant={outlined ? "outlined" : "soft"}
      sx={{ p: 2, borderRadius: "md", mb: 1, width: "100%" }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          {collapsible ? (
            <IconButton
              size="sm"
              variant="plain"
              onClick={onToggle}
              aria-label={open ? "Collapse" : "Expand"}
            >
              {open ? (
                <KeyboardArrowDownRoundedIcon />
              ) : (
                <KeyboardArrowRightRoundedIcon />
              )}
            </IconButton>
          ) : null}
          <Typography level="title-md">{title}</Typography>
        </Stack>
        {right}
      </Stack>
      {(collapsible ? open : true) && (
        <Box sx={{ mt: 1.25, ...contentSx }}>{children}</Box>
      )}
    </Sheet>
  );
}

/* ======================= MAIN ======================= */
export default function PostsCard({
  projectId,
  initialActivity = [],
  initialDocuments = [],
}) {
  const [updatePost, { isLoading: isSaving }] = useUpdatePostMutation();

  // tabs / sections
  const [openActivity, setOpenActivity] = useState(true);
  const [tabValue, setTabValue] = useState("comments");

  // composer
  const [commentText, setCommentText] = useState("");
  const [attachments, setAttachments] = useState([]); // {name, file}[]
  const filePickerRef = useRef(null);

  // modal
  const [openAttachModal, setOpenAttachModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // toast
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    color: "success",
  });

  // streams
  const [activity, setActivity] = useState(initialActivity);
  const [documents, setDocuments] = useState(initialDocuments);

  const activityCount = useMemo(() => activity?.length || 0, [activity]);

  /* ---------- files pick/drag ---------- */
  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };
  const onPickFiles = () => filePickerRef.current?.click();
  const onFileChange = (e) => {
    const fList = Array.from(e.target.files || []);
    if (!fList.length) return;
    const next = fList.map((f) => ({ name: f.name, file: f }));
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };
  const onDropFiles = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const dt = e.dataTransfer;
      if (!dt?.files?.length) return;
      const fList = Array.from(dt.files || []);
      const next = fList.map((f) => ({ name: f.name, file: f }));
      setAttachments((prev) => [...prev, ...next]);
    },
    [setIsDragging]
  );

  /* ---------- fetch posts for this project ---------- */
  const {
    data: getPosts,
    isFetching,
    isError,
  } = useGetPostsQuery({ project_id: projectId });

  // Map API -> activity & documents
  useEffect(() => {
    if (!getPosts?.data) return;
    const posts = getPosts.data;

    // comments -> activity
    const cItems = posts.flatMap((p) =>
      (p.comments || []).map((c) => ({
        _type: "comment",
        html: sanitizeRich(c.comment || ""),
        user: c.user_id,
        at: c.updatedAt || p.updatedAt || p.createdAt,
        postId: p._id,
        commentId: c._id,
      }))
    );

    // attachments -> documents + activity entries
    const dItems = posts.flatMap((p) =>
      (p.attachment || []).map((a) => ({
        _id: a._id,
        name: a.name,
        url: a.url,
        user_id: a.user_id,
        updatedAt: a.updatedAt,
        createdAt: p.createdAt,
        type: fileExt(a.name).toUpperCase(),
      }))
    );

    const fileActivities = posts.flatMap((p) =>
      (p.attachment || []).map((a) => ({
        _type: "file",
        attachment: {
          name: a.name,
          url: a.url,
          user_id: a.user_id,
          updatedAt: a.updatedAt,
          _id: a._id,
        },
        user: a.user_id,
        at: a.updatedAt || p.updatedAt || p.createdAt,
        postId: p._id,
      }))
    );

    const allActivity = [...cItems, ...fileActivities].sort(
      (a, b) => new Date(b.at) - new Date(a.at)
    );
    const docsSorted = [...dItems].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    );

    setActivity(allActivity);
    setDocuments(docsSorted);
  }, [getPosts]);

  /* ---------- submit comment + files ---------- */
  const handleSubmitComment = async () => {
    const clean = (commentText || "")
      .replace(/<div><br><\/div>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!clean && attachments.length === 0) return;

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        comments: sanitizeRich(clean),
      })
    );
    attachments.forEach(({ file }) => formData.append("files", file));
    try {
      await updatePost({ project_id: projectId, formData }).unwrap();
      setCommentText("");
      setAttachments([]);
      setOpenAttachModal(false);
      setToast({ open: true, msg: "Post updated", color: "success" });
    } catch (e) {
      console.error("Failed to update post:", e);
      setToast({
        open: true,
        msg: "Failed to update post",
        color: "danger",
      });
    }
  };

  return (
    <>
      <input
        ref={filePickerRef}
        onChange={onFileChange}
        type="file"
        multiple
        hidden
        accept="*/*"
      />

      <Section
        title="Activity & Notes"
        open={openActivity}
        onToggle={() => setOpenActivity((v) => !v)}
        right={
          <Chip
            size="sm"
            variant="soft"
            startDecorator={<TimelineRoundedIcon />}
          >
            {activityCount} activities
          </Chip>
        }
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ mb: 1 }}
        >
          <TabList>
            <Tab value="comments">Comments</Tab>
            <Tab value="docs">Documents</Tab>
          </TabList>

          {/* COMMENTS */}
          <TabPanel value="comments" sx={{ p: 0, pt: 1 }}>
            <CommentComposer
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSubmitComment}
              onCancel={() => {
                setCommentText("");
                setAttachments([]);
              }}
              onAttachClick={() => setOpenAttachModal(true)}
              attachments={attachments}
              onRemoveAttachment={handleRemoveAttachment}
              isSubmitting={isSaving}
              editorMinHeight={30}
            />

            <Divider sx={{ my: 1.5 }} />

            <Typography level="title-sm" sx={{ mb: 1 }}>
              Activity Stream
            </Typography>
            <Box sx={{ maxHeight: 240, overflow: "auto" }}>
              {isFetching ? (
                <Typography>Loading...</Typography>
              ) : isError ? (
                <Typography color="danger">Failed to load activity.</Typography>
              ) : activity.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No activity yet.
                </Typography>
              ) : (
                activity.map((it, idx) => {
                  const whenLabel = new Date(it.at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const userName = it.user?.name || "User";

                  return (
                    <Box
                      key={it.commentId || it._id || `${userName}-${idx}`}
                      sx={{ mb: 1.5 }}
                    >
                      <Stack direction="row" gap={1}>
                        <Avatar
                          variant="solid"
                          sx={{ width: 28, height: 28, fontWeight: 700 }}
                        >
                          {userName?.[0]?.toUpperCase() || "U"}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" gap={1} alignItems="baseline">
                            <Typography fontWeight="lg">{userName}</Typography>
                            <Typography
                              level="body-xs"
                              sx={{ color: "text.tertiary" }}
                            >
                              {whenLabel}
                            </Typography>
                          </Stack>

                          {it._type === "comment" ? (
                            <Box
                              sx={{
                                mt: 0.5,
                                "& p": { m: 0 },
                                "& ul, & ol": { m: 0, pl: 2.5 },
                                "& a": { textDecoration: "underline" },
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: it.html || "",
                              }}
                            />
                          ) : (
                            /* file activity — preview card like screenshot */
                            <Box sx={{ mt: 0.5 }}>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                                Uploaded file:{" "}
                                <Typography
                                  component="span"
                                  level="body-sm"
                                  fontWeight="lg"
                                >
                                  {it?.attachment?.name}
                                </Typography>
                              </Typography>

                              <FilePreviewCard
                                name={it?.attachment?.name}
                                url={it?.attachment?.url}
                                type={it?.attachment?.type}
                              />
                            </Box>
                          )}
                        </Box>
                      </Stack>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  );
                })
              )}
            </Box>
          </TabPanel>

          {/* DOCUMENTS */}
          <TabPanel value="docs" sx={{ p: 0, pt: 1 }}>
            {documents.length === 0 ? (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                No documents yet.
              </Typography>
            ) : (
              <Sheet variant="soft" sx={{ borderRadius: "md", p: 0 }}>
                {/* Sticky header */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 160px 210px 80px",
                    gap: 12,
                    px: 1,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    fontWeight: 600,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    bgcolor: "background.body",
                  }}
                >
                  <Typography level="body-sm">Name</Typography>
                  <Typography level="body-sm">Type/Size</Typography>
                  <Typography level="body-sm">Uploaded By / When</Typography>
                  <Typography level="body-sm" sx={{ textAlign: "right" }} />
                </Box>

                {/* Scrollable body */}
                <Box sx={{ maxHeight: 500, overflow: "auto", px: 0, py: 0 }}>
                  {documents.map((a, i) => {
                    const name = a?.name || "Attachment";
                    const url = safeUrl(a?.url || "");
                    const typeOrExt = a?.type || fileExt(name).toUpperCase();
                    const size = a?.size ? formatBytes(a.size) : "";
                    const who = a?.user_id?.name || "—";
                    const when =
                      a?.updatedAt || a?.createdAt
                        ? new Date(a.updatedAt || a.createdAt).toLocaleString()
                        : "";

                    return (
                      <Box
                        key={a?._id || `${url}-${i}`}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 160px 210px 80px",
                          gap: 12,
                          alignItems: "center",
                          px: 1,
                          py: 1,
                          borderBottom:
                            i === documents.length - 1 ? "none" : "1px solid",
                          borderColor: "neutral.outlinedBorder",
                          bgcolor: "transparent",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={1}
                          minWidth={0}
                        >
                          <Box sx={{ fontSize: 22, opacity: 0.75 }}>
                            {iconFor(name, a?.type)}
                          </Box>
                          <Tooltip title={name}>
                            <Typography
                              level="body-sm"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 420,
                                fontWeight: 600,
                              }}
                            >
                              {name}
                            </Typography>
                          </Tooltip>
                        </Stack>

                        <Typography
                          level="body-sm"
                          sx={{ color: "text.tertiary" }}
                        >
                          {typeOrExt}
                          {size ? ` • ${size}` : ""}
                        </Typography>

                        <Typography
                          level="body-sm"
                          sx={{ color: "text.tertiary" }}
                        >
                          {who}
                          {when ? ` • ${when}` : ""}
                        </Typography>

                        <Box sx={{ textAlign: "right" }}>
                          <Tooltip title="Download">
                            <IconButton
                              className="dl"
                              size="sm"
                              variant="solid"
                              sx={{
                                "--Icon-color": "#3366a3",
                                opacity: 1,
                                backgroundColor: "#eaf1fa",
                                "&:hover": { backgroundColor: "#d0e2f7" },
                              }}
                              component="a"
                              href={url || "#"}
                              download={name}
                              disabled={!url}
                            >
                              <DownloadRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Sheet>
            )}
          </TabPanel>
        </Tabs>
      </Section>

      {/* ATTACH FILES MODAL (Done only closes; no submit here) */}
      <Modal open={openAttachModal} onClose={() => setOpenAttachModal(false)}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 560 }}>
          <DialogTitle>Attach file(s)</DialogTitle>
          <DialogContent>
            Drag files below or browse. Click <b>Done</b> to attach them to your
            comment, then press <b>Post</b> to submit.
          </DialogContent>

          <Stack gap={1.25} sx={{ mt: 1 }}>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={onDropFiles}
              onClick={onPickFiles}
              sx={{
                p: 3,
                borderRadius: "md",
                textAlign: "center",
                border: "2px dashed",
                borderColor: isDragging
                  ? "primary.outlinedBorder"
                  : "neutral.outlinedBorder",
                bgcolor: isDragging ? "primary.softBg" : "background.level1",
                cursor: "pointer",
                height: "10vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                justifyContent="center"
              >
                <CloudUploadRoundedIcon />
                <Typography level="body-sm">
                  Drag & drop files here, or <strong>click to browse</strong>
                </Typography>
              </Stack>
            </Box>

            {attachments.length > 0 && (
              <Stack gap={0.75}>
                <Typography level="body-sm">Pending attachments</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {attachments.map((f, i) => (
                    <Sheet
                      key={`${f.name}-${i}`}
                      variant="soft"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: "sm",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography level="body-sm">{f.name}</Typography>
                      <IconButton
                        size="sm"
                        variant="plain"
                        aria-label="Remove"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(i);
                        }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    </Sheet>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>

          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setOpenAttachModal(false)}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
              }}
            >
              Done
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Snackbar / Toast */}
      <Snackbar
        open={toast.open}
        variant="soft"
        color={toast.color}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast.msg}
      </Snackbar>
    </>
  );
}
