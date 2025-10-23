import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
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
  Dropdown,
  Menu,
  MenuButton,
  Divider,
} from "@mui/joy";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import InsertPhotoRoundedIcon from "@mui/icons-material/InsertPhotoRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

/* ---------------- sanitizeRich (inline) ---------------- */
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
  // DOMPurify via dynamic import to avoid hard dep here, can be replaced with global
  // If DOMPurify is globally available, you can remove this wrapper and use it directly.
  let DOMPurify;
  try {
    // eslint-disable-next-line global-require
    DOMPurify = require("dompurify");
  } catch {
    // no-op (for environments where require isn't available); simply return as-is
    return String(htmlOrText || "").trim();
  }
  const linkified = linkify(htmlOrText);
  return DOMPurify.sanitize(linkified, {
    ALLOWED_TAGS: SANITIZE_CFG.ALLOWED_TAGS,
    ALLOWED_ATTR: SANITIZE_CFG.ALLOWED_ATTR,
  }).trim();
};

/* ====================================================== */
const WriteEmail = forwardRef(function WriteEmail(
  { open, onClose, onSend },
  ref
) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const inlineImgRef = useRef(null);
  const lastRangeRef = useRef(null);

  // anchor for emoji panel
  const emojiBtnRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });

  const [formData, setFormData] = useState({
    from: "",
    // 🔹 multiple inputs for these fields
    to: [""],
    cc: [""],
    bcc: [""],
    subject: "",
    body: "",
    attachments: [], // [{file, name, size, type}] (unchanged)
  });

  const [states, setStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
  });

  // color swatches (unchanged)
  const swatches = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#cccccc",
    "#efefef",
    "#ffffff",
    "#d32f2f",
    "#ef5350",
    "#ff7043",
    "#ff9800",
    "#ffc107",
    "#cddc39",
    "#8bc34a",
    "#4caf50",
    "#00bcd4",
    "#03a9f4",
    "#2196f3",
    "#5c6bc0",
    "#9c27b0",
  ];

  // nice wide set, like your screenshot vibe
  const emojis = [
    "😀", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "😊", "🙂",
    "😉", "😍", "😘", "🤩", "🥳", "🤗", "👍", "👏", "🙏", "💯",
    "🔥", "✨", "🚀", "🤔", "😎", "😇", "😜", "🤪", "😐", "😴",
    "📌", "📎", "📝", "✅", "❗", "❓", "📷", "📄", "📁", "📦",
  ];

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "div");
    } catch {}
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== (formData.body || "")) el.innerHTML = formData.body;
  }, [formData.body]);

  /* ---------------- Selection and formatting (unchanged) ---------------- */
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
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      lastRangeRef.current = range;
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
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
    updateToolbarStates();
  };

  const onInput = () =>
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));

  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    restoreSelection();
    try {
      document.execCommand("insertText", false, text);
    } catch {}
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
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

  /* ---------------- Attachments (unchanged) ---------------- */
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

  const handleSend = () => {
    const payload = {
      ...formData,
      bodyFormat: "html",
      body: sanitizeRich(formData.body),
    };
    onSend?.(payload);
    onClose?.();
  };

  /* ---------------- Inline image (unchanged) ---------------- */
  const handleInlineImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      restoreSelection();
      const img = document.createElement("img");
      img.src = reader.result;
      img.style.maxWidth = "100%";
      document.execCommand("insertHTML", false, img.outerHTML);
      setFormData((p) => ({
        ...p,
        body: sanitizeRich(editorRef.current?.innerHTML),
      }));
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- NEW: multiple emails + emoji panel ---------------- */
  const addEmailField = (key) =>
    setFormData((p) => ({ ...p, [key]: [...p[key], ""] }));

  const updateEmailField = (key, index, val) =>
    setFormData((p) => {
      const next = [...p[key]];
      next[index] = val;
      return { ...p, [key]: next };
    });

  // emoji panel positioning
  const computeEmojiPos = () => {
    const btn = emojiBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setEmojiPos({ top: r.bottom + 8, left: r.left });
  };

  useLayoutEffect(() => {
    if (!showEmoji) return;
    computeEmojiPos();
    const onScrollOrResize = () => computeEmojiPos();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize, true);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize, true);
    };
  }, [showEmoji]);

  const insertEmoji = (ch) => {
    restoreSelection();
    try {
      document.execCommand("insertText", false, ch);
    } catch {}
    setFormData((p) => ({
      ...p,
      body: sanitizeRich(editorRef.current?.innerHTML),
    }));
  };

  const showPlaceholder =
    !formData.body ||
    formData.body.replace(/<br\s*\/?>|&nbsp;|<\/?div>|<\/?p>/gi, "").trim() === "";

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
        open ? { transform: "translateY(0)" } : { transform: "translateY(100%)" },
      ]}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography level="title-md">New Message</Typography>
        <IconButton variant="plain" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* From */}
      <FormControl sx={{ mb: 1 }}>
        <FormLabel>FROM</FormLabel>
        <Input
          size="sm"
          value={formData.from}
          onChange={(e) => setFormData((p) => ({ ...p, from: e.target.value }))}
          placeholder="noreply@slnkoenergy.com"
        />
      </FormControl>

      {/* To / CC / BCC with ➕ add */}
      {["to", "cc", "bcc"].map((key) => (
        <FormControl key={key} sx={{ mb: 1 }}>
          <FormLabel sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {key.toUpperCase()}
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => addEmailField(key)}
              title={`Add another ${key.toUpperCase()}`}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </FormLabel>

          {formData[key].map((val, idx) => (
            <Input
              key={`${key}-${idx}`}
              size="sm"
              sx={{ mt: 0.5 }}
              value={val}
              onChange={(e) => updateEmailField(key, idx, e.target.value)}
              placeholder={`${key}@example.com`}
            />
          ))}
        </FormControl>
      ))}

      {/* Subject */}
      <FormControl sx={{ mb: 1 }}>
        <FormLabel>SUBJECT</FormLabel>
        <Input
          size="sm"
          value={formData.subject}
          onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
          placeholder="Enter subject"
        />
      </FormControl>

      {/* Toolbar (unchanged except emoji opener) */}
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
          <IconButton onClick={() => focusAndApply("bold")} sx={toolBtn(states.bold)}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl/Cmd+I)" arrow>
          <IconButton onClick={() => focusAndApply("italic")} sx={toolBtn(states.italic)}>
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

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        <Dropdown>
          <Tooltip title="Text color" arrow>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: { variant: "plain", sx: toolBtn(false) },
              }}
            >
              <FormatColorTextIcon fontSize="small" />
            </MenuButton>
          </Tooltip>
          <Menu sx={{ p: 1 }}>
            <ColorGrid
              swatches={swatches}
              onPick={(c) => focusAndApply("foreColor", c)}
            />
          </Menu>
        </Dropdown>

        <Dropdown>
          <Tooltip title="Highlight color" arrow>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: { variant: "plain", sx: toolBtn(false) },
              }}
            >
              <FormatColorFillIcon fontSize="small" />
            </MenuButton>
          </Tooltip>
          <Menu sx={{ p: 1 }}>
            <ColorGrid
              swatches={swatches}
              onPick={(c) => focusAndApply("hiliteColor", c)}
            />
          </Menu>
        </Dropdown>

        {/* NEW: emoji picker opener (no random emoji) */}
        <Tooltip title="Emoji" arrow>
          <IconButton
            ref={emojiBtnRef}
            onClick={() => setShowEmoji((o) => !o)}
            sx={toolBtn(false)}
          >
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Inline image (unchanged) */}
        <Tooltip title="Insert inline image" arrow>
          <IconButton component="label" sx={toolBtn(false)}>
            <InsertPhotoRoundedIcon fontSize="small" />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={inlineImgRef}
              onChange={handleInlineImage}
            />
          </IconButton>
        </Tooltip>
      </Sheet>

      {/* Emoji panel (like your screenshot) */}
      {showEmoji && (
        <Sheet
          variant="outlined"
          sx={{
            position: "fixed",
            top: emojiPos.top,
            left: emojiPos.left,
            zIndex: 1500,
            p: 1,
            borderRadius: "md",
            bgcolor: "background.surface",
            boxShadow: "lg",
            minWidth: 300,
            maxWidth: 420,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}
          >
            <Typography level="title-sm">Emoji</Typography>
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => setShowEmoji(false)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: 0.5,
              p: 0.5,
              maxHeight: 220,
              overflow: "auto",
            }}
          >
            {emojis.map((e, i) => (
              <IconButton
                key={`${e}-${i}`}
                size="sm"
                variant="soft"
                onClick={() => insertEmoji(e)}
                sx={{ borderRadius: 8, fontSize: 18 }}
              >
                {e}
              </IconButton>
            ))}
          </Box>
        </Sheet>
      )}

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

      {/* Attachments (unchanged) */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
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

      {/* Footer actions (unchanged) */}
      <Stack direction="row" justifyContent="flex-end" mt={2}>
        <Button
          variant="solid"
          startDecorator={<SendRoundedIcon />}
          onClick={handleSend}
          sx={{ backgroundColor: "#3366a3", color: "#fff" }}
        >
          Send
        </Button>
      </Stack>
    </Sheet>
  );
});

/* ------------ color grid helper (unchanged) ------------- */
function ColorGrid({ swatches, onPick }) {
  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(8, 20px)", gap: 0.5 }}
    >
      {swatches.map((c, i) => (
        <IconButton
          key={`${c}-${i}`}
          size="sm"
          variant="soft"
          onClick={() => onPick(c)}
          sx={{
            "--IconButton-size": "20px",
            p: 0,
            borderRadius: "4px",
            backgroundColor: c,
            "&:hover": { outline: "2px solid rgba(0,0,0,0.2)" },
          }}
        />
      ))}
    </Box>
  );
}

export default WriteEmail;
