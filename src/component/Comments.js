import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import {
  Box,
  Stack,
  Sheet,
  IconButton,
  Button,
  Typography,
  Chip,
  Divider,
  Tooltip,
  Dropdown,
  Menu,
  MenuButton,
  Input,
} from "@mui/joy";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useLocation } from "react-router-dom";

export default function CommentComposer({
  value,
  onChange,
  onSubmit,
  onCancel,
  onAttachClick,
  onRemoveAttachment,
  attachments = [],
  submitting = false,
  placeholder = "Write a note...",
  disabled = false,
  editorMinHeight = 120,
}) {
  const editorRef = useRef(null);
  const lastRangeRef = useRef(null);
  const location = useLocation();
  const emojiBtnRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });

  const [states, setStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    ul: false,
    ol: false,
  });

  const swatches = useMemo(
    () => [
      "#000000",
      "#434343",
      "#666666",
      "#999999",
      "#cccccc",
      "#efefef",
      "#ffffff",
      "#d32f2f",
      "#ef5350",
      "#f44336",
      "#ff7043",
      "#ff9800",
      "#ffc107",
      "#ffeb3b",
      "#cddc39",
      "#8bc34a",
      "#4caf50",
      "#009688",
      "#00bcd4",
      "#03a9f4",
      "#2196f3",
      "#3f51b5",
      "#5c6bc0",
      "#673ab7",
      "#9c27b0",
    ],
    []
  );

  const emojis = useMemo(
    () => [
      "😀",
      "😄",
      "😁",
      "😆",
      "🥹",
      "😊",
      "😉",
      "😍",
      "😘",
      "😇",
      "🤩",
      "🥳",
      "🤗",
      "👍",
      "👏",
      "🙏",
      "💯",
      "🔥",
      "✨",
      "🚀",
      "😅",
      "😂",
      "🤣",
      "😜",
      "🤪",
      "🤔",
      "🤨",
      "😐",
      "😴",
      "🤝",
      "📌",
      "📎",
      "📝",
      "✅",
      "❗",
      "❓",
      "📷",
      "📄",
      "📁",
      "📦",
    ],
    []
  );

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "div");
    } catch {}
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== (value || "")) el.innerHTML = value || "";
  }, [value]);

  const computeEmojiPos = () => {
    const btn = emojiBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setEmojiPos({ top: rect.bottom + 8, left: rect.left });
  };

  useLayoutEffect(() => {
    if (showEmoji) {
      computeEmojiPos();
      const onScrollOrResize = () => computeEmojiPos();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize, true);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize, true);
      };
    }
  }, [showEmoji]);

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
    if (disabled) return;
    restoreSelection();
    try {
      document.execCommand(cmd, false, val);
    } catch {}
    onChange?.(editorRef.current?.innerHTML || "");
    updateToolbarStates();
  };

  const insertEmoji = (ch) => {
    if (disabled) return;
    restoreSelection();
    try {
      document.execCommand("insertText", false, ch);
    } catch {}
    onChange?.(editorRef.current?.innerHTML || "");
    // keep panel open for multi-insert
  };

  const onInput = () => onChange?.(editorRef.current?.innerHTML || "");
  const onKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (["b", "i", "u"].includes(k)) e.preventDefault();
    if (k === "b") focusAndApply("bold");
    if (k === "i") focusAndApply("italic");
    if (k === "u") focusAndApply("underline");
  };
  const onPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData(
      "text/plain"
    );
    restoreSelection();
    try {
      document.execCommand("insertText", false, text);
    } catch {}
    onChange?.(editorRef.current?.innerHTML || "");
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

  const toolBtn = (active = false) => ({
    "--IconButton-size": "36px",
    borderRadius: "10px",
    mx: 0.25,
    ...(active
      ? {
          bgcolor: "neutral.softBg",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }
      : {}),
  });

  const showPlaceholder =
    !value ||
    value.replace(/<br\s*\/?>|&nbsp;|<\/?div>|<\/?p>/gi, "").trim() === "";

  const hasFiles = Array.isArray(attachments) && attachments.length > 0;
  const primaryBtnLabel = hasFiles
    ? `Upload ${attachments.length > 1 ? "Files" : "File"}`
    : "Add Notes";
  
  const isLoan = location.pathname === "/view_loan"

  return (
    <Sheet
      variant="outlined"
      sx={{ borderRadius: "lg", p: 1.25, bgcolor: "background.surface" }}
    >
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
          position: "relative",
        }}
      >
        <Tooltip title="Bold (Ctrl/Cmd+B)" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("bold")}
            sx={toolBtn(states.bold)}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic (Ctrl/Cmd+I)" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("italic")}
            sx={toolBtn(states.italic)}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline (Ctrl/Cmd+U)" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("underline")}
            sx={toolBtn(states.underline)}
          >
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Strikethrough" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("strikeThrough")}
            sx={toolBtn(states.strike)}
          >
            <StrikethroughSIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        <Tooltip title="Bulleted list" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("insertUnorderedList")}
            sx={toolBtn(states.ul)}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list" arrow>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => focusAndApply("insertOrderedList")}
            sx={toolBtn(states.ol)}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Text Color */}
        <Dropdown>
          <Tooltip title="Text color" arrow>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "plain",
                  color: "neutral",
                  sx: toolBtn(false),
                },
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
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 1 }}
            >
              <Input
                size="sm"
                placeholder="#hex"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim();
                    if (v) focusAndApply("foreColor", v);
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button
                size="sm"
                variant="outlined"
                onClick={() => focusAndApply("foreColor", "#000000")}
              >
                Reset
              </Button>
            </Stack>
          </Menu>
        </Dropdown>

        {/* Highlight Color */}
        <Dropdown>
          <Tooltip title="Highlight color" arrow>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "plain",
                  color: "neutral",
                  sx: toolBtn(false),
                },
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
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mt: 1 }}
            >
              <Input
                size="sm"
                placeholder="#hex"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim();
                    if (v) focusAndApply("hiliteColor", v);
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button
                size="sm"
                variant="outlined"
                onClick={() => focusAndApply("hiliteColor", "#ffff00")}
              >
                Reset
              </Button>
            </Stack>
          </Menu>
        </Dropdown>

        {/* Emoji popover (custom, sticky) */}
        <Tooltip title="Emoji" arrow>
          <IconButton
            ref={emojiBtnRef}
            variant="plain"
            color="neutral"
            onClick={() => setShowEmoji((o) => !o)}
            sx={toolBtn(false)}
          >
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
        </Tooltip>

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
              minWidth: 260,
              maxWidth: 360,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 0.5 }}
            >
              <Typography level="title-sm">Emojis</Typography>
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
      </Sheet>

      {/* Editor + footer */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "12px",
          borderColor: "neutral.outlinedBorder",
          display: "flex",
          flexDirection: "column",
          minHeight: editorMinHeight + 84,
          overflow: "hidden",
          width: "100%",
          maxWidth: { xs: "100%", md: "min(100%, 1200px)", lg: "100%" },
          mx: "auto",
          minWidth: 0,
          position: "relative",
        }}
      >
        <Box
          ref={editorRef}
          contentEditable={!disabled}
          onClick={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          sx={{
            flex: 1,
            p: 1.5,
            lineHeight: 1.66,
            outline: "none",
            bgcolor: "background.body",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            minWidth: 0,
            "&:focus": { boxShadow: "inset 0 0 0 2px rgba(40,86,128,0.35)" },
            "& *::selection, &::selection": {
              background: "#e0e0e0",
              color: "inherit",
            },
            "& img, & table, & video, & iframe": {
              maxWidth: "100%",
              height: "auto",
            },
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
            {placeholder}
          </Typography>
        )}
      </Sheet>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ p: 1, gap: 1, mt: "auto" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexWrap: "wrap" }}
        >
          {!isLoan && (
            <Button
            variant="outlined"
            startDecorator={<CloudUploadRoundedIcon />}
            onClick={onAttachClick}
            sx={{
              color: "#3366a3",
              borderColor: "#3366a3",
              backgroundColor: "transparent",
              "--Button-hoverBg": "#e0e0e0",
              "--Button-hoverBorderColor": "#3366a3",
              "&:hover": { color: "#3366a3" },
            }}
          >
            Attach Files
          </Button>
          )}

          {Array.isArray(attachments) && attachments.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
              {attachments.map((a, idx) => (
                <Chip
                  key={`${a.name}-${idx}`}
                  variant="soft"
                  size="sm"
                  // keep the chip itself non-clickable
                  clickable={false}
                  // make sure the endDecorator remains clickable
                  sx={{ "& .chip-close": { pointerEvents: "auto" } }}
                  endDecorator={
                    onRemoveAttachment ? (
                      <IconButton
                        size="sm"
                        variant="plain"
                        className="chip-close"
                        aria-label="Remove file"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAttachment(idx);
                        }}
                        sx={{ ml: 0.5 }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  }
                >
                  {a.name}
                </Chip>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {!!onCancel && (
            <Button
              variant="outlined"
              startDecorator={<CloseRoundedIcon />}
              onClick={onCancel}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            startDecorator={<SendRoundedIcon />}
            loading={submitting}
            disabled={disabled}
            onClick={onSubmit}
            sx={{
              backgroundColor: "#3366a3",
              color: "#fff",
              px: 2.25,
              "&:hover": { backgroundColor: "#285680" },
            }}
          >
            {primaryBtnLabel}
          </Button>
        </Stack>
      </Stack>
    </Sheet>
  );
}

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
