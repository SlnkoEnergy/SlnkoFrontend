// LoanOverview.jsx
import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Divider,
  Select,
  Option,
  Textarea,
  Button,
  CircularProgress,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Sheet,
  Tooltip,
  Avatar,
  Stack,
  IconButton,
  Input,
} from "@mui/joy";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import DOMPurify from "dompurify";
import CommentComposer from "./Comments";

import {
  useGetLoanByIdQuery,
  useUpdateLoanStatusMutation,
  useAddCommentMutation,
  useUploadExistingDocumentMutation,
  useAddLoanDocumentMutation,
} from "../redux/loanSlice";

import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

// ---- helpers ----
const STATUS_OPTIONS = [
  "documents pending",
  "documents submitted",
  "under banking process",
  "sanctioned",
  "disbursed",
];

const statusColor = (s) => {
  switch (String(s || "").toLowerCase()) {
    case "documents pending":
      return "danger";
    case "under banking process":
      return "warning";
    case "sanctioned":
      return "primary";
    case "disbursed":
      return "success";
    default:
      return "neutral";
  }
};

const cap = (s) =>
  String(s || "")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");

// Date-only formatter: 31 Oct 2025
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toPerson = (u = {}) => ({
  name: u?.name || "User",
  avatar: u?.attachment_url || "",
  _id: u?._id || null,
});
const initialsOf = (name = "") =>
  name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const colorFromName = () => "primary";
const safeUrl = (u = "") => (typeof u === "string" ? u : "");
const fileExt = (n = "") => (n.includes(".") ? n.split(".").pop() : "");
const formatBytes = (bytes = 0, dp = 1) => {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dp))} ${sizes[i]}`;
};
const iconFor = () => "📄";

const goToProfile = (user) => {
  if (!user?._id) return;
  window.open(`/user_profile?id=${user._id}`, "_blank");
};

export default function LoanOverview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const project_id = searchParams.get("project_id");
  const [uploadExistingDocument, { isLoading: uploading, error: uploadErr }] =
    useUploadExistingDocumentMutation();

  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [uploadDoc, setUploadDoc] = React.useState(null);
  const [uploadFile, setUploadFile] = React.useState(null);
  const [uploadFilename, setUploadFilename] = React.useState("");

  // ----- Add Document (new doc) -----
  const [addDocOpen, setAddDocOpen] = React.useState(false);
  const [addDocFile, setAddDocFile] = React.useState(null);
  const [addDocName, setAddDocName] = React.useState("");

  const [addLoanDocument, { isLoading: addingDoc, error: addDocErr }] =
    useAddLoanDocumentMutation();

  const openAddDoc = () => {
    setAddDocName("");
    setAddDocFile(null);
    setAddDocOpen(true);
  };
  const closeAddDoc = () => {
    setAddDocOpen(false);
    setAddDocName("");
    setAddDocFile(null);
  };

  const onAddDocPick = (e) => {
    const f = e?.target?.files?.[0];
    if (f) {
      setAddDocFile(f);
      if (!addDocName) {
        const base = f.name.replace(/\.[^/.]+$/, "");
        setAddDocName(base);
      }
    }
  };
  const onAddDocDrop = (e) => {
    e.preventDefault();
    const f = e?.dataTransfer?.files?.[0];
    if (f) {
      setAddDocFile(f);
      if (!addDocName) {
        const base = f.name.replace(/\.[^/.]+$/, "");
        setAddDocName(base);
      }
    }
  };
  const onAddDocDragOver = (e) => e.preventDefault();

  const submitAddDoc = async () => {
    if (!project_id || !addDocName.trim()) {
      toast.error("Filename is required");
      return;
    }
    try {
      await addLoanDocument({
        project_id,
        filename: addDocName.trim(),
        file: addDocFile || undefined,
      }).unwrap();
      toast.success("Document added");
      closeAddDoc();
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || e?.error || "Failed to add document");
    }
  };

  const openUploadModal = (doc) => {
    setUploadDoc(doc || null);
    setUploadFile(null);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadDoc(null);
    setUploadFile(null);
  };

  const handleUploadSave = async () => {
    if (!project_id || !uploadDoc?._id) return;

    try {
      if (uploadFile) {
        await uploadExistingDocument({
          project_id,
          document_id: uploadDoc._id,
          file: uploadFile,
        }).unwrap();
      } else {
        return;
      }

      closeUploadModal();
      refetch();
      toast.success("file uploaded successfully");
    } catch (e) {
      toast.error("Failed to upload file");
    }
  };

  const onFilePicked = (e) => {
    const f = e?.target?.files?.[0];
    if (f) {
      setUploadFile(f);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e?.dataTransfer?.files?.[0];
    if (f) {
      setUploadFile(f);
    }
  };
  const onDragOver = (e) => e.preventDefault();

  // ----- Data fetch (loan by project_id) -----
  const {
    data: loanResp,
    isFetching,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetLoanByIdQuery(project_id, { skip: !project_id });

  // Normalize response shape
  const loanData =
    loanResp?.data && !Array.isArray(loanResp?.data)
      ? loanResp.data
      : Array.isArray(loanResp?.data)
      ? loanResp.data[0]
      : loanResp?.loan || null;

  const loan = loanData || {};
  const {
    current_status = {},
    banking_details = [],
    timelines = {},
    status_history = [],
    comments = [],
    documents: loanDocs = [],
  } = loan;

  // ----- Update Status (modal) -----
  const [updateLoanStatus, { isLoading: updating, error: updateErr }] =
    useUpdateLoanStatusMutation();

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [nextStatus, setNextStatus] = React.useState(
    current_status?.status || ""
  );
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    setNextStatus(current_status?.status || "");
  }, [current_status?.status]);

  const openStatusModal = () => setStatusModalOpen(true);
  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setRemarks("");
    setNextStatus(current_status?.status || "");
  };

  const saveStatus = async () => {
    if (!project_id || !nextStatus) return;
    try {
      await updateLoanStatus({
        project_id,
        status: nextStatus,
        remarks: remarks || "",
      }).unwrap();
      closeStatusModal();
      refetch();
    } catch {}
  };

  // ---------- Notes / Activity / Documents ----------
  const [openActivity, setOpenActivity] = React.useState(true);
  const [tabValue, setTabValue] = React.useState("comments");

  const [commentText, setCommentText] = React.useState("");
  const [attachments, setAttachments] = React.useState([]);

  const [addComment, { isLoading: isSaving, error: addCommentErr }] =
    useAddCommentMutation();

  const documents = React.useMemo(
    () =>
      (loanDocs || []).map((d) => ({
        _id: d?._id,
        name: d?.filename || "Attachment",
        url: d?.fileurl || "",
        type: d?.fileType || fileExt(d?.filename || "").toUpperCase(),
        size: d?.size || undefined,
        user_id: d?.createdBy || d?.user_id || {},
        updatedAt: d?.updatedAt || d?.createdAt || undefined,
        createdAt: d?.createdAt || undefined,
      })),
    [loanDocs]
  );

  const activity = React.useMemo(() => {
    const items = [];

    (status_history || []).forEach((s) => {
      items.push({
        _id: s?._id,
        _type: "status",
        status: s.status,
        remarks: s.remarks || "",
        user: s.user_id || {},
        at: s.updatedAt,
      });
    });

    (comments || []).forEach((c) => {
      items.push({
        _id: c?._id,
        _type: "comment",
        html: c.remarks || "",
        user: c.createdBy || {},
        at: c.updatedAt,
      });
    });

    (documents || []).forEach((f) => {
      const url = f?.url || f?.fileurl || "";
      if (!url || url.trim() === "") return;

      items.push({
        _id: f?._id,
        _type: "file",
        attachment: f,
        user: f.user_id || {},
        at: f.updatedAt || f.createdAt,
      });
    });
    return items.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [status_history, comments, documents]);

  const handleSubmitComment = async () => {
    const text = String(commentText || "").trim();
    if (!project_id || !text) return;

    try {
      await addComment({ project_id, remarks: text }).unwrap();
      setCommentText("");
      setAttachments([]);
      refetch();
      toast.success("Notes Added");
    } catch {
      toast.error("Failed to add notes");
    }
  };

  const handleRemoveAttachment = (i) =>
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  const setOpenAttachModal = () => {};

  const projectStatusColor = (s) => {
    switch (String(s || "").toLowerCase()) {
      case "delayed":
        return "danger";
      case "to be started":
        return "warning";
      case "ongoing":
        return "primary";
      case "completed":
        return "success";
      case "on hold":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const capitalizeWords = (s) =>
    String(s || "")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Loading & Error states */}
      {isLoading || isFetching ? (
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">Loading loan…</Typography>
        </Box>
      ) : null}
      {isError ? (
        <Box sx={{ p: 2 }}>
          <Alert color="danger" variant="soft">
            Failed to load loan. {error?.data?.message || error?.error || ""}
          </Alert>
        </Box>
      ) : null}

      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        {/* LEFT card: Project + Status (chip opens modal) */}
        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: "lg", height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/project_detail?project_id=${loanResp?.data?.project_id?._id}`
                    )
                  }
                  size="sm"
                  variant="soft"
                  color="primary"
                >
                  {loanResp?.data?.project_id?.code || "—"}
                </Chip>

                <Chip
                  size="sm"
                  variant="soft"
                  color={statusColor(current_status?.status)}
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { boxShadow: "sm" },
                    "&:active": { transform: "translateY(1px)" },
                  }}
                  onClick={openStatusModal}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openStatusModal();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Change loan status"
                  title="Click to change status"
                >
                  {current_status?.status
                    ? cap(current_status.status)
                    : "Not Submitted"}
                </Chip>
              </Box>

              <Typography my={1} level="body-md" sx={{ color: "neutral.800" }}>
                {loanResp?.data?.project_id?.customer || ""}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="State"
                    value={loanResp?.data?.project_id?.state || "—"}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Contact"
                    value={loanResp?.data?.project_id?.number || "—"}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="AC Capacity"
                    value={
                      loanResp?.data?.project_id?.project_kwp !== undefined &&
                      loanResp?.data?.project_id?.project_kwp !== null
                        ? String(loanResp?.data?.project_id?.project_kwp)
                        : "—"
                    }
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="DC Capacity"
                    value={
                      loanResp?.data?.project_id?.dc_capacity !== undefined &&
                      loanResp?.data?.project_id?.dc_capacity !== null
                        ? String(loanResp?.data?.project_id?.dc_capacity)
                        : "—"
                    }
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="PPA Expiry Date"
                    value={fmtDate(loanResp?.data?.project_id?.ppa_expiry_date)}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="BD Commitment Date"
                    value={fmtDate(
                      loanResp?.data?.project_id?.bd_commitment_date
                    )}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Project Completion Date"
                    value={fmtDate(
                      loanResp?.data?.project_id?.project_completion_date
                    )}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Project Status"
                    value={
                      loanResp?.data?.project_id?.current_status?.status ? (
                        <Chip
                          size="sm"
                          variant="soft"
                          color={projectStatusColor(
                            loanResp.data.project_id.current_status.status
                          )}
                          sx={{ textTransform: "capitalize", fontWeight: 500 }}
                        >
                          {capitalizeWords(
                            loanResp.data.project_id.current_status.status
                          )}
                        </Chip>
                      ) : (
                        "—"
                      )
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT card: Bank & Dates (multiple banks) */}
        <Grid xs={12} md={6}>
          <Card variant="soft" sx={{ borderRadius: "lg", height: "100%" }}>
            <CardContent
              sx={{
                maxHeight: { xs: 520, md: 600 },
                overflow: "auto",
              }}
            >
              <Typography level="title-lg" sx={{ mb: 1.5 }}>
                Loan Information
              </Typography>

              {/* -- Banks list (rows) -- */}
              <Typography level="title-md" sx={{ mb: 0.75 }}>
                Banks
              </Typography>
              <BankList banks={banking_details} />

              <Divider sx={{ my: 1.5 }} />

              {/* -- Dates (timelines) -- */}
              <Typography level="title-md" sx={{ mb: 0.5 }}>
                Dates
              </Typography>
              <Grid container spacing={1.5}>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Expected Sanction"
                    value={fmtDate(timelines?.expected_sanctioned_date)}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Expected Disbursement"
                    value={fmtDate(timelines?.expected_disbursement_date)}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Actual Sanction"
                    value={fmtDate(timelines?.actual_sanctioned_date)}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <LabelValue
                    label="Actual Disbursement"
                    value={fmtDate(timelines?.actual_disbursement_date)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --------- NOTES: Activity + Documents --------- */}
      <Box sx={{ mt: 2 }}>
        <Section
          title="Notes"
          open={openActivity}
          onToggle={() => setOpenActivity((v) => !v)}
          right={
            <Chip
              size="sm"
              variant="soft"
              startDecorator={<TimelineRoundedIcon />}
            >
              {activity.length} activities
            </Chip>
          }
        >
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ mb: 1 }}
          >
            <TabList>
              <Tab value="comments">Notes</Tab>
              <Tab value="docs">Documents</Tab>
            </TabList>

            {/* NOTES / ACTIVITY STREAM */}
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

              {addCommentErr ? (
                <Alert color="danger" variant="soft" sx={{ mt: 1 }}>
                  {addCommentErr?.data?.message ||
                    addCommentErr?.error ||
                    "Failed to add comment."}
                </Alert>
              ) : null}

              <Divider sx={{ my: 1.5 }} />

              <Typography level="title-sm" sx={{ mb: 1 }}>
                Activity Stream
              </Typography>

              <Box sx={{ maxHeight: 420, overflow: "auto" }}>
                {activity.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    No activity yet.
                  </Typography>
                ) : (
                  activity.map((it, idx) => {
                    const user = toPerson(it.user || it.user_id || {});
                    const when = it.at ? new Date(it.at) : null;
                    const whenLabel = when
                      ? when.toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "—";

                    const isStatus = it._type === "status";
                    const statusLabel = cap(it.status || "-");

                    return (
                      <Box key={`act-${idx}`} sx={{ mb: 1.5 }}>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          gap={1.25}
                        >
                          <Avatar
                            role="button"
                            tabIndex={0}
                            onClick={() => goToProfile(user)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              goToProfile(user)
                            }
                            src={user.avatar || undefined}
                            variant={user.avatar ? "soft" : "solid"}
                            color={
                              user.avatar ? "neutral" : colorFromName(user.name)
                            }
                            sx={{
                              width: 36,
                              height: 36,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {!user.avatar && initialsOf(user.name)}
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              alignItems="baseline"
                              gap={1}
                            >
                              <Typography
                                level="body-sm"
                                fontWeight="lg"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                {user.name}
                              </Typography>
                              <Typography
                                level="body-xs"
                                sx={{ color: "text.tertiary" }}
                              >
                                {whenLabel}
                              </Typography>
                            </Stack>

                            {it._type === "comment" && it?.html ? (
                              <div
                                style={{
                                  marginTop: 2,
                                  lineHeight: 1.66,
                                  wordBreak: "break-word",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(it.html),
                                }}
                              />
                            ) : isStatus ? (
                              <Stack
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{ mt: 0.25, flexWrap: "wrap" }}
                              >
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color={statusColor(it.status)}
                                >
                                  {statusLabel}
                                </Chip>
                                {it.remarks && (
                                  <Typography level="body-sm">
                                    {String(it.remarks).trim()}
                                  </Typography>
                                )}
                              </Stack>
                            ) : it._type === "file" ? (
                              <Typography level="body-sm" sx={{ mt: 0.25 }}>
                                {`Uploaded file: ${
                                  it?.attachment?.name || "Attachment"
                                }`}
                              </Typography>
                            ) : null}

                            {it._type === "file" && it.attachment ? (
                              <Box sx={{ mt: 0.75 }}>
                                <AttachmentGallery items={[it.attachment]} />
                              </Box>
                            ) : null}
                          </Box>
                        </Stack>
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    );
                  })
                )}
              </Box>
            </TabPanel>

            {/* DOCUMENTS LIST */}
            <TabPanel value="docs" sx={{ p: 0, pt: 1 }}>
              {documents.length === 0 ? (
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No documents yet.
                </Typography>
              ) : (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                  >
                    <Button size="sm" variant="soft" onClick={openAddDoc}>
                      Add Document
                    </Button>
                  </Box>
                  <Sheet variant="soft" sx={{ borderRadius: "md", p: 1 }}>
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
                      }}
                    >
                      <Typography level="body-sm">Name</Typography>
                      <Typography level="body-sm">Type/Size</Typography>
                      <Typography level="body-sm">
                        Uploaded By / When
                      </Typography>
                      <Typography level="body-sm" sx={{ textAlign: "right" }} />
                    </Box>

                    {documents.map((a, i) => {
                      const name = a?.name || "Attachment";
                      const url = safeUrl(a?.url || "");
                      const typeOrExt = a?.type || fileExt(name).toUpperCase();
                      const size = a?.size ? formatBytes(a.size) : "";
                      const who = a?.user_id?.name || "—";
                      const when =
                        a?.updatedAt || a?.createdAt
                          ? new Date(
                              a.updatedAt || a.createdAt
                            ).toLocaleString()
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
                          }}
                        >
                          <Stack direction="row" alignItems="center" gap={1}>
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
                            {url ? (
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
                                  href={url}
                                  download={name}
                                >
                                  <DownloadRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Upload">
                                <Button
                                  size="sm"
                                  variant="soft"
                                  onClick={() => openUploadModal(a)} // pass the doc row
                                >
                                  Upload
                                </Button>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Sheet>
                </>
              )}
            </TabPanel>
          </Tabs>
        </Section>
      </Box>

      {/* ---------- Upload Document Modal ---------- */}
      <Modal open={uploadModalOpen} onClose={closeUploadModal}>
        <ModalDialog
          aria-labelledby="upload-doc-title"
          variant="outlined"
          sx={{ borderRadius: "lg", minWidth: 520, maxWidth: "92vw" }}
        >
          <ModalClose />
          <DialogTitle id="upload-doc-title">
            {uploadDoc?.name || "Upload Document"}
          </DialogTitle>
          <DialogContent>
            Provide either a file or a direct URL (one is enough).
          </DialogContent>

          <Box sx={{ display: "grid", gap: 1.25 }}>
            {/* Filename (label) */}
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              Filename
            </Typography>
            <Textarea
              minRows={1}
              value={uploadFilename}
              disabled
              sx={{ fontFamily: "monospace" }}
            />
            {/* Drag & drop box + file input */}
            <Box
              onDrop={onDrop}
              onDragOver={onDragOver}
              sx={{
                mt: 1,
                p: 2,
                border: "2px dashed",
                borderColor: "neutral.outlinedBorder",
                borderRadius: "md",
                textAlign: "center",
                bgcolor: "background.level1",
              }}
            >
              <Typography level="body-sm" sx={{ mb: 1 }}>
                Drag & drop a file here, or choose one:
              </Typography>
              <input type="file" onChange={onFilePicked} />
              {uploadFile ? (
                <Typography
                  level="body-xs"
                  sx={{ mt: 1, color: "text.tertiary" }}
                >
                  Selected: {uploadFile.name} (
                  {Math.round(uploadFile.size / 1024)} KB)
                </Typography>
              ) : null}
            </Box>

            {uploadErr ? (
              <Alert color="danger" variant="soft">
                {uploadErr?.data?.message ||
                  uploadErr?.error ||
                  "Upload failed."}
              </Alert>
            ) : null}
          </Box>

          <DialogActions>
            <Button variant="plain" onClick={closeUploadModal}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSave}
              loading={uploading}
              disabled={!uploadFile}
            >
              Save
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* ---------- Status Update Modal ---------- */}
      <Modal open={statusModalOpen} onClose={closeStatusModal}>
        <ModalDialog
          aria-labelledby="loan-status-title"
          variant="outlined"
          sx={{ borderRadius: "lg", minWidth: 420, maxWidth: "90vw" }}
        >
          <ModalClose />
          <DialogTitle id="loan-status-title">Change Loan Status</DialogTitle>
          <DialogContent>
            Select a status and optionally add remarks. This will be recorded in
            the loan status.
          </DialogContent>

          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Select
              value={nextStatus || ""}
              onChange={(_, v) => setNextStatus(v || "")}
              placeholder="Select status"
            >
              {STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>
                  {cap(s)}
                </Option>
              ))}
            </Select>

            <Textarea
              minRows={3}
              placeholder="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            {updateErr ? (
              <Alert color="danger" variant="soft">
                {updateErr?.data?.message ||
                  updateErr?.error ||
                  "Failed to update status."}
              </Alert>
            ) : null}
          </Box>

          <DialogActions>
            <Button variant="plain" onClick={closeStatusModal}>
              Cancel
            </Button>
            <Button
              onClick={saveStatus}
              loading={updating}
              disabled={!project_id || !nextStatus}
            >
              Save
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* ---------- Add Document Modal (new entry) ---------- */}
      <Modal open={addDocOpen} onClose={closeAddDoc}>
        <ModalDialog
          variant="outlined"
          sx={{ borderRadius: "lg", minWidth: 520, maxWidth: "92vw" }}
        >
          <ModalClose />
          <DialogTitle>Add Document</DialogTitle>
          <DialogContent>
            Provide a filename and optionally upload a file.
          </DialogContent>

          <Box sx={{ display: "grid", gap: 1.25 }}>
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              Filename (required)
            </Typography>
            <Input
              value={addDocName}
              onChange={(e) => setAddDocName(e.target.value)}
              placeholder="e.g. Sanction_Letter"
            />

            <Box
              onDrop={onAddDocDrop}
              onDragOver={onAddDocDragOver}
              sx={{
                mt: 1,
                p: 2.5,
                border: "2px dashed",
                borderColor: "neutral.outlinedBorder",
                borderRadius: "md",
                textAlign: "center",
                bgcolor: "background.level1",
                cursor: "pointer",
              }}
              onClick={() =>
                document.getElementById("add-doc-file-input")?.click()
              }
            >
              <Typography level="body-sm">
                Drag & drop files here, or <b>click to browse</b>
              </Typography>
              <input
                id="add-doc-file-input"
                type="file"
                style={{ display: "none" }}
                onChange={onAddDocPick}
              />
              {addDocFile ? (
                <Typography
                  level="body-xs"
                  sx={{ mt: 1, color: "text.tertiary" }}
                >
                  Selected: {addDocFile.name} (
                  {Math.round(addDocFile.size / 1024)} KB)
                </Typography>
              ) : null}
            </Box>

            {addDocErr ? (
              <Alert color="danger" variant="soft">
                {addDocErr?.data?.message ||
                  addDocErr?.error ||
                  "Failed to add document."}
              </Alert>
            ) : null}
          </Box>

          <DialogActions>
            <Button variant="plain" onClick={closeAddDoc}>
              Cancel
            </Button>
            <Button
              onClick={submitAddDoc}
              loading={addingDoc}
              disabled={!addDocName.trim()}
            >
              Save
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

function LabelValue({ label, value }) {
  return (
    <Box>
      <Typography level="body-xs" sx={{ color: "neutral.500" }}>
        {label}
      </Typography>
      <Typography level="body-md" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

function BankList({ banks = [] }) {
  if (!Array.isArray(banks) || banks.length === 0) {
    return (
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        No banking details added.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {banks
        .filter((b) => b?.name && b.name.trim() !== "")
        .map((b, idx) => (
          <Sheet
            key={`${b?.name || "bank"}-${idx}`}
            variant="outlined"
            sx={{ borderRadius: "md", p: 1.25 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Chip size="sm" variant="soft" color="neutral">
                  {`Bank ${idx + 1}`}
                </Chip>
                <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                  {b?.name}
                </Typography>
              </Stack>
            </Stack>

            <Grid container spacing={1.5}>
              <Grid xs={12} sm={6}>
                <LabelValue label="Branch" value={b?.branch || "—"} />
              </Grid>
              <Grid xs={12} sm={6}>
                <LabelValue label="State" value={b?.state || "—"} />
              </Grid>
            </Grid>
          </Sheet>
        ))}
    </Box>
  );
}

/* -------- Attachments UI -------- */
const isImage = (name = "", type = "") => {
  const ext = fileExt(name);
  return (
    type?.startsWith?.("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)
  );
};

function AttachmentTile({ a }) {
  const name = a?.name || "Attachment";
  const url = safeUrl(a?.url || a?.href || "");
  const size = a?.size ? formatBytes(a.size) : "";
  const isImg = isImage(name, a?.type || "");
  return (
    <Sheet
      variant="soft"
      sx={{
        width: 260,
        borderRadius: "lg",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "background.level1",
        position: "relative",
        "&:hover .dl": { opacity: 1 },
      }}
    >
      <Box
        sx={{
          height: 150,
          borderRadius: "md",
          overflow: "hidden",
          bgcolor: "background.surface",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {isImg && url ? (
          <img
            src={url}
            alt={name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box sx={{ fontSize: 52, opacity: 0.7 }}>
            {iconFor(name, a?.type)}
          </Box>
        )}

        <IconButton
          className="dl"
          size="sm"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 120ms ease",
            backgroundColor: "#eaf1fa",
            "&:hover": { backgroundColor: "#d0e2f7" },
          }}
          component="a"
          href={url || "#"}
          download={name}
          disabled={!url}
        >
          <DownloadRoundedIcon sx={{ color: "#3366a3" }} />
        </IconButton>
      </Box>

      <Box sx={{ px: 0.5 }}>
        <Tooltip title={name} variant="plain">
          <Typography
            level="body-sm"
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
        </Tooltip>
        {size && (
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {size}
          </Typography>
        )}
      </Box>
    </Sheet>
  );
}

function AttachmentGallery({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <Box
      sx={{
        mt: 0.75,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
        gap: 12,
      }}
    >
      {items.map((a, i) => (
        <AttachmentTile key={a?._id || `${a?.url || ""}-${i}`} a={a} />
      ))}
    </Box>
  );
}

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
      sx={{ p: 2, borderRadius: "md", mb: 2 }}
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
