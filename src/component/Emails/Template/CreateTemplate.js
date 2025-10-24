import { forwardRef, useRef, useState, useEffect } from "react";
import {
  Box,
  Sheet,
  Stack,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Chip,
  Divider,
} from "@mui/joy";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import {
  useCreateEmailTemplateMutation,
  useGetEmailTemplateByIdQuery,
  useUpdateEmailTemplateMutation,
} from "../../../redux/emailSlice";

/* ---------------- sanitize ---------------- */
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
    "img",
  ],
  ALLOWED_ATTR: {
    a: ["href", "name", "target", "rel"],
    span: ["style"],
    div: ["style"],
    p: ["style"],
    img: ["src", "alt", "title", "width", "height", "style"],
  },
};
const linkify = (htmlOrText = "") =>
  String(htmlOrText).replace(
    /(?<!["'=])(https?:\/\/[^\s<]+)/g,
    (m) => `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`
  );
const sanitizeRich = (htmlOrText = "") => {
  let DOMPurify;
  try {
    DOMPurify = require("dompurify");
  } catch {
    return String(htmlOrText || "").trim();
  }
  const linkified = linkify(htmlOrText);
  return DOMPurify.sanitize(linkified, {
    ALLOWED_TAGS: SANITIZE_CFG.ALLOWED_TAGS,
    ALLOWED_ATTR: SANITIZE_CFG.ALLOWED_ATTR,
  }).trim();
};

const CreateTemplate = forwardRef(function CreateTemplate(
  { selectedTemplate, open, onClose },
  ref
) {
  const isEditing = !!selectedTemplate;

  // queries/mutations
  const { data: fetched, isFetching: isFetchingTpl } =
    useGetEmailTemplateByIdQuery(selectedTemplate, { skip: !isEditing });

  const [createEmailTemplate, { isLoading: isSavingTemplate }] =
    useCreateEmailTemplateMutation();

  const [updateEmailTemplate, { isLoading: isUpdatingTemplate }] =
    useUpdateEmailTemplateMutation();

  // editor refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastRangeRef = useRef(null);
  const skipBodyEffectRef = useRef(false);

  // state
  const [formData, setFormData] = useState({
    from: "",
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "",
    body: "",
    attachments: [],
  });

  const [templateMeta, setTemplateMeta] = useState({
    name: "",
    identifier: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const [states, setStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
  });

  /* default paragraph separator */
  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "div");
    } catch {}
  }, []);

  /* place caret */
  const placeCaretAtEnd = (el) => {
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    lastRangeRef.current = range;
  };

  /* mirror body -> contentEditable */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (skipBodyEffectRef.current) {
      skipBodyEffectRef.current = false;
      return;
    }
    if (el.innerHTML !== (formData.body || "")) {
      el.innerHTML = formData.body || "";
      placeCaretAtEnd(el);
    }
  }, [formData.body]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) lastRangeRef.current = sel.getRangeAt(0);
  };
  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    const r = lastRangeRef.current;
    if (sel && r) {
      sel.removeAllRanges();
      sel.addRange(r);
    } else {
      placeCaretAtEnd(el);
    }
  };
  const updateToolbarStates = () => {
    try {
      setStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strike: document.queryCommandState("strikeThrough"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
      });
    } catch {}
  };
  const focusAndApply = (cmd, val = null) => {
    restoreSelection();
    try {
      document.execCommand(cmd, false, val);
    } catch {}
    skipBodyEffectRef.current = true;
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
    updateToolbarStates();
  };
  const onInput = () => {
    skipBodyEffectRef.current = true;
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
  };
  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    restoreSelection();
    try {
      document.execCommand("insertText", false, text);
    } catch {}
    skipBodyEffectRef.current = true;
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
    requestAnimationFrame(() => placeCaretAtEnd(editorRef.current));
  };
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (el.contains(range.startContainer)) {
        saveSelection();
        updateToolbarStates();
      }
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  /* attachments */
  const handleFileSelected = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFormData((p) => ({ ...p, attachments: [...p.attachments, ...mapped] }));
    e.target.value = "";
  };
  const removeAttachment = (i) => {
    setFormData((p) => ({
      ...p,
      attachments: p.attachments.filter((_, idx) => idx !== i),
    }));
  };

  /* tags */
  const addTag = (raw) => {
    const t = String(raw || "").trim();
    if (!t) return;
    setTemplateMeta((meta) =>
      meta.tags.includes(t) ? meta : { ...meta, tags: [...meta.tags, t] }
    );
    setTagInput("");
  };
  const removeTag = (t) =>
    setTemplateMeta((meta) => ({
      ...meta,
      tags: meta.tags.filter((x) => x !== t),
    }));
  const onTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      setTemplateMeta((m) => ({ ...m, tags: m.tags.slice(0, -1) }));
    }
  };

  /* email fields */
  const addEmailField = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));
  const updateEmailField = (key, index, val) =>
    setFormData((p) => {
      const next = [...p[key]];
      next[index] = val;
      return { ...p, [key]: next };
    });
  const removeEmailField = (key, index) =>
    setFormData((p) => {
      if (index === 0) return p;
      const next = [...p[key]];
      next.splice(index, 1);
      return { ...p, [key]: next.length ? next : [""] };
    });

  const showPlaceholder =
    !formData.body ||
    formData.body.replace(/<br\s*\/?>|&nbsp;|<\/?div>|<\/?p>/gi, "").trim() ===
      "";

  const toolBtn = (active = false) => ({
    "--IconButton-size": "36px",
    borderRadius: "8px",
    mx: 0.25,
    ...(active
      ? {
          bgcolor: "neutral.softBg",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }
      : {}),
  });

  /* Prefill on fetch (edit mode) */
  useEffect(() => {
    const tpl = fetched?.data;
    if (!tpl) return;
    setTemplateMeta({
      name: tpl.name || "",
      identifier: tpl.identifier || "",
      tags: Array.isArray(tpl.tags) ? tpl.tags : [],
    });
    setFormData({
      from: Array.isArray(tpl.from) ? tpl.from[0] || "" : tpl.from || "",
      to: tpl.to ? String(tpl.to).split(",").filter(Boolean) : [""],
      cc: Array.isArray(tpl.cc) && tpl.cc.length ? tpl.cc : [""],
      bcc: Array.isArray(tpl.bcc) && tpl.bcc.length ? tpl.bcc : [""],
      subject: tpl.subject || "",
      body: tpl.body || "",
      attachments: Array.isArray(tpl.attachments)
        ? tpl.attachments.map((a) => ({
            name: a.filename || a.fileUrl || "file",
          }))
        : [],
    });
  }, [fetched]);

  /* build payload helper */
  const buildPayload = () => ({
    name: templateMeta.name?.trim(),
    identifier: templateMeta.identifier?.trim(),
    to: (formData.to || []).filter(Boolean).join(","),
    cc: (formData.cc || []).filter(Boolean),
    bcc: (formData.bcc || []).filter(Boolean),
    from: formData.from ? [formData.from] : [],
    subject: formData.subject || "",
    body: sanitizeRich(formData.body || ""),
    bodyFormat: "html",
    attachments: (formData.attachments || []).map((a) => ({
      filename: a.name,
    })),
    tags: templateMeta.tags || [],
    placeholders: [],
    variables: [],
    variablesSchema: {},
  });

  /* save / update */
  const handleSaveTemplate = async () => {
    const payload = buildPayload();
    if (!payload.name || !payload.identifier || !payload.tags)
      return console.warn("Template name, identifier & tags a required");
    if (
      !payload.to ||
      payload.from.length === 0 ||
      !payload.subject ||
      !payload.body
    )
      return console.warn("to, from, subject, body are required");

    try {
      await createEmailTemplate({ data: payload }).unwrap();
      onClose?.();
    } catch (err) {
      console.error("Failed to create email template:", err);
    }
  };

  const handleUpdateTemplate = async () => {
    const payload = buildPayload();
    if (!selectedTemplate) return;
    try {
      await updateEmailTemplate({
        id: selectedTemplate,
        data: { data: payload },
      }).unwrap();
      onClose?.();
    } catch (err) {
      console.error("Failed to update email template:", err);
    }
  };

  return (
    <Sheet
      ref={ref}
      sx={[
        {
          position: "fixed",
          bottom: 0,
          right: 24,
          width: { xs: "100vw", md: 800 },
          borderRadius: "12px 12px 0 0",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "lg",
          backgroundColor: "background.surface",
          p: 1.5,
          zIndex: 1000,
          transition: "transform 0.3s ease",
        },
        open
          ? { transform: "translateY(0)" }
          : { transform: "translateY(100%)" },
      ]}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography level="title-md">
          {isEditing ? "Edit Template" : "New Template"}
        </Typography>
        <IconButton variant="plain" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* Body scroll area */}
      <Box
        sx={{
          maxHeight: { xs: "72vh", md: "70vh" },
          overflowY: "auto",
          pr: 0.5,
        }}
      >
        {/* Template meta */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>TEMPLATE NAME</FormLabel>
            <Input
              size="sm"
              value={templateMeta.name}
              onChange={(e) =>
                setTemplateMeta((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Vendor Payment Reminder"
            />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>IDENTIFIER</FormLabel>
            <Input
              size="sm"
              value={templateMeta.identifier}
              onChange={(e) =>
                setTemplateMeta((p) => ({ ...p, identifier: e.target.value }))
              }
              placeholder="vendor_payment_reminder"
            />
          </FormControl>
        </Stack>

        {/* Tags */}
        <FormControl sx={{ mb: 1 }}>
          <FormLabel>TAGS</FormLabel>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Input
              size="sm"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              placeholder="Type a tag and press Enter"
              sx={{ flex: 1 }}
            />
            <Tooltip title="Add tag" arrow>
              <IconButton
                size="sm"
                variant="outlined"
                onClick={() => addTag(tagInput)}
                sx={{ borderRadius: 10 }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          {!!templateMeta.tags.length && (
            <Stack
              direction="row"
              spacing={0.5}
              mt={0.75}
              sx={{ flexWrap: "wrap" }}
            >
              {templateMeta.tags.map((t) => (
                <Chip
                  key={t}
                  variant="soft"
                  size="sm"
                  slotProps={{
                    endDecorator: { sx: { pointerEvents: "auto" } },
                  }}
                  endDecorator={
                    <IconButton
                      size="sm"
                      variant="plain"
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => removeTag(t)}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  {t}
                </Chip>
              ))}
            </Stack>
          )}
        </FormControl>

        {/* From */}
        <FormControl sx={{ mb: 1 }}>
          <FormLabel>FROM</FormLabel>
          <Input
            size="sm"
            value={formData.from}
            onChange={(e) =>
              setFormData((p) => ({ ...p, from: e.target.value }))
            }
            placeholder="noreply@slnkoenergy.com"
          />
        </FormControl>

        {/* To / CC / BCC */}
        {["to", "cc", "bcc"].map((key) => (
          <FormControl key={key} sx={{ mb: 1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <FormLabel>{key.toUpperCase()}</FormLabel>
              <Tooltip title={`Add another ${key.toUpperCase()}`} arrow>
                <IconButton
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={() => addEmailField(key)}
                  sx={{ borderRadius: 10 }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack spacing={0.75}>
              {formData[key].map((val, idx) => {
                const canDelete = idx > 0;
                return (
                  <Stack
                    key={`${key}-${idx}`}
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                  >
                    <Input
                      fullWidth
                      size="sm"
                      value={val}
                      onChange={(e) =>
                        updateEmailField(key, idx, e.target.value)
                      }
                      placeholder={`${key}@example.com`}
                    />
                    {canDelete && (
                      <Tooltip title="Remove" arrow>
                        <IconButton
                          size="sm"
                          variant="outlined"
                          color="danger"
                          onClick={() => removeEmailField(key, idx)}
                          sx={{ borderRadius: 10 }}
                        >
                          <DeleteForeverRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          </FormControl>
        ))}

        {/* Subject */}
        <FormControl sx={{ mb: 1 }}>
          <FormLabel>SUBJECT</FormLabel>
          <Input
            size="sm"
            value={formData.subject}
            onChange={(e) =>
              setFormData((p) => ({ ...p, subject: e.target.value }))
            }
            placeholder="Enter subject"
          />
        </FormControl>

        {/* Toolbar */}
        <Sheet
          variant="soft"
          sx={{
            borderRadius: "md",
            px: 1,
            py: 0.5,
            mb: 1,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.25,
          }}
        >
          <Tooltip title="Bold (Ctrl/Cmd+B)" arrow>
            <IconButton
              onClick={() => focusAndApply("bold")}
              sx={toolBtn(states.bold)}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic (Ctrl/Cmd+I)" arrow>
            <IconButton
              onClick={() => focusAndApply("italic")}
              sx={toolBtn(states.italic)}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline (Ctrl/Cmd+U)" arrow>
            <IconButton
              onClick={() => focusAndApply("underline")}
              sx={toolBtn(states.underline)}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough" arrow>
            <IconButton
              onClick={() => focusAndApply("strikeThrough")}
              sx={toolBtn(states.strike)}
            >
              <StrikethroughSIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" sx={{ mx: 0.5 }} />

          <Tooltip title="Bulleted list" arrow>
            <IconButton
              onClick={() => focusAndApply("insertUnorderedList")}
              sx={toolBtn(states.ul)}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered list" arrow>
            <IconButton
              onClick={() => focusAndApply("insertOrderedList")}
              sx={toolBtn(states.ol)}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Sheet>

        {/* Editor */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "md",
            minHeight: 180,
            position: "relative",
            overflow: "auto",
            p: 1,
            mb: 1,
          }}
        >
          <Box
            ref={editorRef}
            contentEditable
            onInput={onInput}
            onPaste={onPaste}
            onClick={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            sx={{
              minHeight: 160,
              outline: "none",
              lineHeight: 1.6,
              "& img": { maxWidth: "100%" },
            }}
          />
          {showPlaceholder && (
            <Typography
              level="body-sm"
              sx={{
                pointerEvents: "none",
                color: "text.tertiary",
                position: "absolute",
                top: 12,
                left: 16,
              }}
            >
              Write your message…
            </Typography>
          )}
        </Sheet>

        {/* Attachments */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexWrap: "wrap" }}
        >
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<AttachFileRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Add attachment
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileSelected}
          />
          {formData.attachments.map((att, i) => (
            <Chip
              key={i}
              variant="soft"
              size="sm"
              clickable={false}
              sx={{ "& .chip-close": { pointerEvents: "auto" } }}
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  className="chip-close"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => removeAttachment(i)}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              }
            >
              {att.name}
            </Chip>
          ))}
        </Stack>
      </Box>

      {/* Footer actions */}
      <Stack direction="row" justifyContent="space-between" mt={2}>
        <Button
          variant="solid"
          onClick={isEditing ? handleUpdateTemplate : handleSaveTemplate}
          loading={
            isEditing ? isUpdatingTemplate || isFetchingTpl : isSavingTemplate
          }
          sx={{ backgroundColor: "#3366a3", color: "#fff" }}
        >
          {isEditing ? "Update Template" : "Save as Template"}
        </Button>
      </Stack>
    </Sheet>
  );
});

export default CreateTemplate;
