// src/components/Inspection_Form.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Input,
  Sheet,
  Typography,
  Select as JSelect,
  Option,
  Textarea,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
  IconButton,
  Link,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Select,
} from "@mui/joy";
import { useLocation, useSearchParams } from "react-router-dom";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import OpenInNew from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import AttachFile from "@mui/icons-material/AttachFile";
import UploadFile from "@mui/icons-material/UploadFile";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

import {
  useGetInspectionByIdQuery,
  useUpdateStatusInspectionMutation,
} from "../../redux/inspectionSlice";

const ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
].join(",");
const MAX_FILE_MB = 15;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export default function InspectionForm({
  open = true,
  onClose,
  vendorName = "",
  projectCode = "",
  po_number = "",
  items = [],
  onSubmit,
  defaultMode = "online",
  mode: modeProp,
  id: idProp,
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const inferredMode = modeProp || searchParams.get("mode") || "create";
  const inferredId = idProp || searchParams.get("id") || "";

  const isView = inferredMode === "view";
  const isCreate = inferredMode === "create";

  // Fetch single inspection in VIEW mode
  const {
    data: viewData,
    isFetching: viewLoading,
    refetch: refetchView,
  } = useGetInspectionByIdQuery(
    { id: inferredId },
    { skip: !isView || !inferredId }
  );

  // Local form state (for create; read-only mirror in view)
  const [mode, setMode] = useState(defaultMode);
  const [datetime, setDatetime] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [locationText, setLocationText] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---- Status Modal State (View) ----
  const [openModal, setOpenModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isDragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [updateStatusInspection, { isLoading: isUpdating }] =
    useUpdateStatusInspectionMutation();

  // Expect either {data: {...}} or direct object
  const v = viewData?.data || viewData || null;

  // Items array name in your API is "item"
  const viewItems = Array.isArray(v?.item) ? v.item : [];
  const createItems = Array.isArray(items) ? items : [];

  const currentStatus = v?.current_status || null;
  const history = Array.isArray(v?.status_history) ? v.status_history : [];

  // Flatten attachments from status_history[].attachments[].attachment_url
  const attachments = history.flatMap((h) =>
    Array.isArray(h.attachments)
      ? h.attachments
          .filter((a) => a?.attachment_url)
          .map((a, idx) => ({
            url: a.attachment_url,
            name:
              a.name ||
              a.filename ||
              a.attachment_url?.split("/").pop() ||
              `Attachment ${idx + 1}`,
          }))
      : []
  );

  // Totals
  const rows = isView ? viewItems : createItems;
  const totalQty = useMemo(
    () => rows.reduce((s, r) => s + Number(r.quantity || 0), 0),
    [rows]
  );

  // Prefill from view payload
  useEffect(() => {
    if (isView && v) {
      const dt = v.date ? toDatetimeLocal(v.date) : "";
      setDatetime(dt);
      setMode(v.mode || "online");
      setLocationText(v.location || "");
      setContactPerson(v.vendor_contact || "");
      setMobile(v.vendor_mobile || "");
      setNotes(v.description || "");
      // Prepare modal defaults
      setModalStatus(v?.current_status?.status || "requested");
    }
  }, [isView, v]);

  // ---- Drag & Drop handlers ----
  const addFiles = (list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    const next = [];
    let err = "";

    picked.forEach((f) => {
      if (f.size > MAX_FILE_BYTES) {
        err = `File "${f.name}" exceeds ${MAX_FILE_MB} MB.`;
        return;
      }
      if (!ACCEPT.split(",").includes(f.type)) {
        err = `File "${f.name}" type not allowed.`;
        return;
      }
      next.push(f);
    });

    if (err) setFileError(err);
    setFiles((prev) => [...prev, ...next]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onBrowse = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Submit status+remarks+files ----
  const handleSubmitStatus = async () => {
    if (!inferredId) return;
    try {
      await updateStatusInspection({
        id: inferredId,
        status: modalStatus,
        remarks: modalRemarks,
        files, // File[]
      }).unwrap();
      setOpenModal(false);
      setFiles([]);
      setModalRemarks("");
      setFileError("");
      await refetchView(); // refresh UI
    } catch (err) {
      console.error("Failed to update status:", err);
      setFileError(err?.data?.message || "Failed to update status");
    }
  };

  const handleOpenStatusModal = () => {
    setModalStatus(currentStatus?.status || "requested");
    setModalRemarks("");
    setFiles([]);
    setFileError("");
    setOpenModal(true);
  };
  

  const handleSubmit = async () => {
    if (!datetime) return alert("Inspection date & time is required.");
    if (!contactPerson) return alert("Vendor contact person is required.");
    if (!mobile) return alert("Vendor mobile number is required.");
    if (mode === "offline" && !locationText)
      return alert("Location is required for offline mode.");

    const payload = {
      vendor: vendorName || "",
      project_code: projectCode || "",
      po_number: po_number || "",
      items: createItems.map((it, idx) => ({
        sl: idx + 1,
        category_id: it.productCategoryId || null,
        product_name: it.productName || "",
        description: it.briefDescription || "",
        make: it.makeQ || "",
        uom: it.uom || "",
        quantity: Number(it.quantity || 0),
      })),
      totals: { lines: createItems.length, total_qty: totalQty },
      inspection: {
        datetime, 
        mode,
        location: mode === "offline" ? locationText : "",
        contact_person: contactPerson,
        contact_mobile: mobile,
        notes,
      },
    };

    try {
      setSubmitting(true);
      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      } else {
        console.log("INSPECTION REQUEST PAYLOAD:", payload);
      }
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const headerVendor = isView ? v?.vendor || "" : vendorName || "";
  const headerProjectCode = isView ? v?.project_code || "" : projectCode || "";

  return (
    <Box
      sx={{
        p: 0,
        width: isView ? 1400 : "100%",
        ml: isView ? { xs: 0, lg: "12%", xl: "18%" } : 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)",
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography level="h4" fontWeight="lg">
            {isView ? "Inspection Details" : "Request Inspection"}
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            {isView
              ? "Review inspection request, status, logs and attachments."
              : "Fill the details below and submit to request an inspection."}
          </Typography>
        </Box>

        {isView && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Current Status:
            </Typography>
            <Chip
              variant="soft"
              color={statusColor(currentStatus?.status)}
              size="sm"
              onClick={handleOpenStatusModal}
              sx={{ cursor: "pointer", textTransform: "capitalize" }}
            >
              {currentStatus?.status || "—"}
            </Chip>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Meta / Form fields */}
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 2 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor
              </Typography>
              <Input value={headerVendor} disabled />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Project Code
              </Typography>
              <Input value={headerProjectCode} disabled />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Inspection Date & Time
              </Typography>
              <Input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                disabled={isView}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Mode
              </Typography>
              <JSelect
                value={mode}
                onChange={(_, v) => setMode(v || "online")}
                disabled={isView}
              >
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
              </JSelect>
            </Grid>

            {mode === "offline" && (
              <Grid xs={12}>
                <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                  Location
                </Typography>
                <Input
                  placeholder="Inspection location / site address"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  disabled={isView}
                />
              </Grid>
            )}

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor Contact Person
              </Typography>
              <Input
                placeholder="Full name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                disabled={isView}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor Mobile Number
              </Typography>
              <Input
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={isView}
              />
            </Grid>

            <Grid xs={12}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Notes {isView ? "" : "(optional)"}
              </Typography>
              <Textarea
                minRows={3}
                placeholder="Add any specific instructions, access details, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isView}
              />
            </Grid>
          </Grid>
        </Sheet>

        {/* Items Table */}
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip color="primary" variant="soft" size="sm">
              {isView ? "Items" : "Selected Items"}
            </Chip>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {rows.length} line(s), total qty: {totalQty}
            </Typography>
          </Box>

          <Box
            component="table"
            sx={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& th, & td": {
                borderBottom:
                  "1px solid var(--joy-palette-neutral-outlinedBorder)",
                p: 1,
                textAlign: "left",
                verticalAlign: "top",
              },
              "& th": { fontWeight: 700, bgcolor: "background.level1" },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th style={{ width: "18%" }}>Category</th>
                <th style={{ width: "22%" }}>Product</th>
                <th style={{ width: "25%" }}>Description</th>
                <th style={{ width: "12%" }}>Make</th>
                <th style={{ width: "10%" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      {isView
                        ? r.category_id?.name
                        : r.productCategoryName || "-"}
                    </td>
                    <td>{r.product_name || r.productName || "-"}</td>
                    <td>{r.description || r.briefDescription || "-"}</td>
                    <td>{r.product_make || r.makeQ || r.make || "-"}</td>
                    <td>{Number(r.quantity || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      No items.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Box>
        </Sheet>

        {/* Attachments (from status_history) */}
        {isView && (
          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip variant="soft" size="sm" startDecorator={<AttachFile />}>
                Attachments
              </Chip>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                {attachments.length}
              </Typography>
            </Box>

            {attachments.length ? (
              <List variant="outlined" sx={{ borderRadius: "md" }}>
                {attachments.map((f, i) => (
                  <ListItem key={`${f.url}-${i}`}>
                    <ListItemDecorator>
                      <DescriptionOutlined />
                    </ListItemDecorator>
                    <ListItemContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography level="body-sm">{f.name}</Typography>
                        {f.url && (
                          <IconButton
                            size="sm"
                            variant="plain"
                            component={Link}
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <OpenInNew />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemContent>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                No attachments.
              </Typography>
            )}
          </Sheet>
        )}

        {/* Status History */}
        {isView && (
          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip variant="soft" size="sm" startDecorator={<HistoryIcon />}>
                Status History
              </Chip>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                {history.length} event(s)
              </Typography>
            </Box>

            {history.length ? (
              <List size="sm" sx={{ "--ListItem-minHeight": "40px" }}>
                {history.map((h, idx) => (
                  <ListItem key={idx} sx={{ alignItems: "flex-start" }}>
                    <ListItemDecorator>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={statusColor(h.status)}
                      >
                        {h.status || "—"}
                      </Chip>
                    </ListItemDecorator>
                    <ListItemContent>
                      <Typography level="body-sm" fontWeight="lg">
                        {humanName(h.user_id?.name) || "System"}
                      </Typography>
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        {formatDateTime(h.updatedAt || h.at)}
                      </Typography>
                      {h.remarks && (
                        <Typography level="body-sm" sx={{ mt: 0.5 }}>
                          {h.remarks}
                        </Typography>
                      )}
                    </ListItemContent>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                No status logs available.
              </Typography>
            )}
          </Sheet>
        )}

        {/* Actions */}
        {!isView && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button variant="soft" onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" loading={submitting} onClick={handleSubmit}>
              Send Request
            </Button>
          </Box>
        )}

        {isView && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="soft" onClick={onClose}>
              Close
            </Button>
          </Box>
        )}
      </Box>

      {/* -------- Status Update Modal (View mode) -------- */}
      <Modal open={isView && openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ width: 520, maxWidth: "92vw" }}>
          <ModalClose />
          <Typography level="h5" mb={1.5}>
            Update Inspection Status
          </Typography>

          {/* Status */}
          <FormControl sx={{ mb: 1.5 }}>
            <FormLabel>Status</FormLabel>
            <Select
              value={modalStatus}
              onChange={(_, value) => setModalStatus(value)}
            >
              <Option value="requested">Requested</Option>
              <Option value="approved">Approved</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </FormControl>

          {/* Remarks */}
          <FormControl sx={{ mb: 1.5 }}>
            <FormLabel>Remarks</FormLabel>
            <Textarea
              minRows={3}
              placeholder="Enter remarks..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
            />
          </FormControl>

          {/* Drag & Drop Uploader */}
          <FormControl>
            <FormLabel>Attachments (optional)</FormLabel>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(false);
              }}
              onDrop={onDrop}
              sx={{
                mt: 0.5,
                border: "2px dashed",
                borderColor: isDragging
                  ? "primary.solidBg"
                  : "neutral.outlinedBorder",
                borderRadius: "md",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: isDragging ? "primary.softBg" : "transparent",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadFile fontSize="small" />
              <Typography level="body-sm">
                Drag & drop files here or <strong>browse</strong>
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={onBrowse}
                style={{ display: "none" }}
              />
            </Box>
            <Typography level="body-xs" sx={{ mt: 0.5 }} color="neutral">
              Allowed: PNG, JPG, WEBP, PDF • Max {MAX_FILE_MB} MB each
            </Typography>
          </FormControl>

          {/* Selected Files List */}
          {fileError && (
            <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
              {fileError}
            </Typography>
          )}

          {files.length > 0 && (
            <Sheet
              variant="soft"
              sx={{
                mt: 1.5,
                borderRadius: "sm",
                p: 1,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {files.map((f, idx) => (
                <Box
                  key={`${f.name}-${idx}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 0.75,
                    px: 1,
                    borderBottom: "1px dashed",
                    borderColor: "neutral.outlinedBorder",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level="body-sm" noWrap title={f.name}>
                      {f.name}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {f.type || "unknown"} • {formatBytes(f.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => removeFile(idx)}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Sheet>
          )}

          <Button
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSubmitStatus}
            loading={isUpdating}
            disabled={!modalStatus}
          >
            Update
          </Button>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

/* ------------------ helpers ------------------ */

function toDatetimeLocal(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => `${n}`.padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return "";
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function humanName(user) {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user.name || user.fullname || user.email || user._id || "";
}

function statusColor(status) {
  if (!status) return "neutral";
  const s = String(status).toLowerCase();
  if (["requested"].includes(s)) return "primary";
  if (["approved"].includes(s)) return "success";
  if (["failed"].includes(s)) return "danger";
  return "neutral";
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
