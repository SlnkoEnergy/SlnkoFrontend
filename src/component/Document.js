// Documents.jsx
import { useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Sheet,
  Table,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Divider,
  LinearProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  ModalDialog,
  Input,
} from "@mui/joy";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import InsertDriveFileRounded from "@mui/icons-material/InsertDriveFileRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import InsertLinkRounded from "@mui/icons-material/InsertLinkRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";

// ---------- helpers ----------
const prettyBytes = (num = 0) => {
  if (!Number.isFinite(num)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = num;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const fmtWhen = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d)) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extFromName = (name = "") => {
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : "";
};

const iconForExt = (ext) => {
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return <ImageRounded fontSize="small" />;
  if (ext === "pdf") return <PictureAsPdfRounded fontSize="small" />;
  if (["doc", "docx"].includes(ext))
    return <DescriptionRounded fontSize="small" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <InsertLinkRounded fontSize="small" />;
  return <InsertDriveFileRounded fontSize="small" />;
};

const Documents = ({
  existingDocs = [],
  onDownload,
  onUpload,
  isUploading = false,
}) => {
  const [stagedFiles, setStagedFiles] = useState([]);
  const totalSize = useMemo(
    () => stagedFiles.reduce((sum, f) => sum + (f.file?.size || 0), 0),
    [stagedFiles]
  );

  // Modal state
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [modalFiles, setModalFiles] = useState([]);

  const handleOpen = () => {
    setOpen(true);
    setModalFiles([]);
  };
  const handleClose = () => {
    setOpen(false);
    setDragActive(false);
    setModalFiles([]);
  };

  const handlePick = () => fileInputRef.current?.click();

  const addToModal = (filesLike) => {
    const list = Array.from(filesLike || []);
    if (!list.length) return;

    setModalFiles((prev) => {
      const existingKey = new Set(
        prev.map((p) => p.file.name + "::" + p.file.size)
      );
      const next = [...prev];

      for (const f of list) {
        const key = f.name + "::" + f.size;
        if (existingKey.has(key)) continue;
        // default name without extension (user can edit)
        const dot = f.name.lastIndexOf(".");
        const base = dot > 0 ? f.name.slice(0, dot) : f.name;
        next.push({ file: f, name: base, error: "" });
      }
      return next;
    });
  };

  const onInputChange = (e) => {
    addToModal(e.target.files);
    e.target.value = "";
  };

  // Drag & drop ONLY inside modal
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addToModal(e.dataTransfer?.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const updateModalName = (idx, name) => {
    setModalFiles((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], name, error: name.trim() ? "" : "Required" };
      return copy;
    });
  };

  const removeModalRow = (idx) => {
    setModalFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const allNamesValid =
    modalFiles.length > 0 &&
    modalFiles.every(
      (m) => typeof m.name === "string" && m.name.trim().length > 0
    );

  const confirmAddToQueue = () => {
    if (!allNamesValid) {
      // mark errors
      setModalFiles((prev) =>
        prev.map((m) => ({
          ...m,
          error: m.name?.trim() ? "" : "Required",
        }))
      );
      return;
    }
    const toStage = modalFiles.map((m) => ({
      file: m.file,
      name: m.name.trim(),
    }));
    setStagedFiles((prev) => {
      const map = new Map(
        prev.map((p) => [p.file.name + "::" + p.file.size, p])
      );
      for (const item of toStage) {
        map.set(item.file.name + "::" + item.file.size, item);
      }
      return Array.from(map.values());
    });
    handleClose();
  };

  const removeStaged = (key) => {
    setStagedFiles((prev) =>
      prev.filter((p) => p.file.name + "::" + p.file.size !== key)
    );
  };

  const handleUpload = async () => {
    if (!stagedFiles.length || !onUpload) return;
    await onUpload(stagedFiles); // pass [{file, name}]
    setStagedFiles([]);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 1, md: 2 },
          borderRadius: "lg",
          gap: 1.5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Typography level="title-md">Documents</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="sm"
              variant="soft"
              startDecorator={<CloudUploadRounded />}
              onClick={handleOpen}
            >
              Add files
            </Button>
          </Box>
        </Box>

        {/* Existing docs table (read-only) */}
        <Sheet
          variant="soft"
          sx={{
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1.25,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "neutral.softBg",
            }}
          >
            <Typography level="title-sm">Existing</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {existingDocs.length} item{existingDocs.length === 1 ? "" : "s"}
            </Typography>
          </Box>

          <Table
            borderAxis="none"
            size="sm"
            stickyHeader
            sx={{
              "--Table-headerUnderlineThickness": "1px",
              "--TableCell-paddingX": "12px",
              "--TableCell-paddingY": "10px",
              "& thead th": { bgcolor: "background.body" },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 44 }} />
                <th>Name</th>
                <th style={{ width: 160 }}>Type/Size</th>
                <th style={{ width: 260 }}>Uploaded By / When</th>
                <th style={{ width: 72, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingDocs.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <Sheet
                      variant="soft"
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: "sm",
                        color: "text.tertiary",
                      }}
                    >
                      No documents uploaded yet.
                    </Sheet>
                  </td>
                </tr>
              )}
              {existingDocs.map((doc) => {
                const ext = extFromName(doc.name);
                return (
                  <tr key={doc.id || doc.url || doc.name}>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color="neutral"
                        startDecorator={iconForExt(ext)}
                      >
                        {ext || "file"}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {doc.name || "Attachment"}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.secondary" }}
                      >
                        {(doc.mime || "ATTACHMENT").toUpperCase()}
                        {doc.size ? ` • ${prettyBytes(doc.size)}` : ""}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.secondary" }}
                      >
                        {doc.uploadedBy || "—"} • {fmtWhen(doc.uploadedAt)}
                      </Typography>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Tooltip title="Download" arrow>
                        <span>
                          <IconButton
                            size="sm"
                            variant="soft"
                            onClick={() => onDownload?.(doc)}
                          >
                            <DownloadRounded />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sheet>

        {/* Staged files table */}
        {stagedFiles.length > 0 && (
          <Sheet
            variant="soft"
            sx={{
              mt: 1.25,
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.25,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "neutral.softBg",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography level="title-sm">Ready to upload</Typography>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                {stagedFiles.length} item{stagedFiles.length === 1 ? "" : "s"} •{" "}
                {prettyBytes(totalSize)}
              </Typography>
            </Box>

            <Table
              borderAxis="none"
              size="sm"
              sx={{
                "--TableCell-paddingX": "12px",
                "--TableCell-paddingY": "10px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 44 }} />
                  <th>File Name (required)</th>
                  <th style={{ width: 160 }}>Type/Size</th>
                  <th style={{ width: 220 }}>When</th>
                  <th style={{ width: 92, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stagedFiles.map((item) => {
                  const ext = extFromName(item.file?.name);
                  const key = item.file.name + "::" + item.file.size;
                  return (
                    <tr key={key}>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          startDecorator={iconForExt(ext)}
                        >
                          {ext || item.file?.type?.split("/")?.[1] || "file"}
                        </Chip>
                      </td>
                      <td>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ color: "text.secondary" }}
                        >
                          {(item.file?.type || "ATTACHMENT").toUpperCase()} •{" "}
                          {prettyBytes(item.file?.size)}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ color: "text.secondary" }}
                        >
                          {fmtWhen(Date.now())}
                        </Typography>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Tooltip title="Remove" arrow>
                          <IconButton
                            size="sm"
                            variant="soft"
                            color="danger"
                            onClick={() => removeStaged(key)}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <Divider />

            <Box
              sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                size="sm"
                variant="plain"
                onClick={() => setStagedFiles([])}
                disabled={isUploading}
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="solid"
                startDecorator={<CloudUploadRounded />}
                onClick={handleUpload}
                loading={isUploading}
              >
                Upload {stagedFiles.length} file
                {stagedFiles.length === 1 ? "" : "s"}
              </Button>
            </Box>
            {isUploading && <LinearProgress sx={{ borderRadius: 0 }} />}
          </Sheet>
        )}
      </Card>

      {/* Modal: add files with drag & drop + required names */}
      <Modal open={open} onClose={handleClose}>
        <ModalDialog
          variant="outlined"
          sx={{ maxWidth: 900, width: "96vw", p: 0 }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography level="title-md">Add files</Typography>
            <IconButton size="sm" variant="plain" onClick={handleClose}>
              <CloseRounded />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              p: { xs: 1.25, md: 2 },
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* Drop zone */}
            <Sheet
              variant={dragActive ? "soft" : "outlined"}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              sx={{
                p: 2,
                borderRadius: "md",
                borderStyle: "dashed",
                textAlign: "center",
                transition: "0.15s ease",
                cursor: "pointer",
                "&:hover": { bgcolor: "neutral.softBg" },
              }}
              onClick={handlePick}
            >
              <CloudUploadRounded />
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                Drag & drop files here, or <b>click to browse</b>
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                Images, PDFs, Docs, Sheets (max 25MB each)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onInputChange}
                style={{ display: "none" }}
              />
            </Sheet>

            {/* Modal files table with required name input */}
            <Sheet
              variant="soft"
              sx={{
                mt: 1,
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "neutral.softBg",
                }}
              >
                <Typography level="title-sm">Selected files</Typography>
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  {modalFiles.length} item{modalFiles.length === 1 ? "" : "s"}
                </Typography>
              </Box>

              <Table
                borderAxis="none"
                size="sm"
                sx={{
                  "--TableCell-paddingX": "12px",
                  "--TableCell-paddingY": "10px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: 80 }} />
                    <th>Original</th>
                    <th style={{ width: 280 }}>File Name (required)</th>
                    <th style={{ width: 160 }}>Type/Size</th>
                    <th style={{ width: 64, textAlign: "right" }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {modalFiles.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <Sheet
                          variant="soft"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            borderRadius: "sm",
                            color: "text.tertiary",
                          }}
                        >
                          No files selected yet.
                        </Sheet>
                      </td>
                    </tr>
                  )}
                  {modalFiles.map((m, idx) => {
                    const ext = extFromName(m.file?.name);
                    return (
                      <tr key={m.file.name + "::" + m.file.size}>
                        <td>
                          <Chip
                            size="sm"
                            variant="soft"
                            startDecorator={iconForExt(ext)}
                          >
                            {ext || m.file?.type?.split("/")?.[1] || "file"}
                          </Chip>
                        </td>
                        <td>
                          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                            {m.file.name}
                          </Typography>
                        </td>
                        <td>
                          <Input
                            size="sm"
                            value={m.name}
                            onChange={(e) =>
                              updateModalName(idx, e.target.value)
                            }
                            placeholder="Enter file name"
                            error={!!m.error}
                            sx={{ minWidth: 240 }}
                          />
                          {m.error && (
                            <Typography
                              level="body-xs"
                              color="danger"
                              sx={{ mt: 0.25 }}
                            >
                              {m.error}
                            </Typography>
                          )}
                        </td>
                        <td>
                          <Typography
                            level="body-sm"
                            sx={{ color: "text.secondary" }}
                          >
                            {(m.file?.type || "ATTACHMENT").toUpperCase()} •{" "}
                            {prettyBytes(m.file?.size)}
                          </Typography>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <IconButton
                            size="sm"
                            variant="soft"
                            color="danger"
                            onClick={() => removeModalRow(idx)}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Sheet>
          </DialogContent>

          <DialogActions
            sx={{
              p: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              justifyContent: "space-between",
            }}
          >
            <Button size="sm" variant="plain" onClick={handleClose}>
              Cancel
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="sm"
                variant="solid"
                startDecorator={<CloudUploadRounded />}
                onClick={confirmAddToQueue}
                disabled={!allNamesValid || modalFiles.length === 0}
              >
                Add to queue
              </Button>
            </Box>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default Documents;
