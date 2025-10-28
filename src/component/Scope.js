import React, { useEffect, useState, Fragment } from "react";
import {
  Box,
  Typography,
  Table,
  Sheet,
  Checkbox,
  Button,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Input,
  Textarea,
  Modal,
  ModalDialog,
  Stack,
  Divider,
  Avatar,
  Dropdown,
  MenuButton,
  ListDivider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  ListItemDecorator,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import {
  useGetScopeByProjectIdQuery,
  useUpdateScopeByProjectIdMutation,
  useUpdateScopeStatusMutation,
  useGenerateScopePdfMutation,
  useUpdateCommitmentDateMutation,
} from "../redux/camsSlice";
import { toast } from "react-toastify";

// ---------------- helpers ----------------
const titlePreserveAcronyms = (s) => {
  if (!s && s !== 0) return "";
  return String(s)
    .split(/(\s+)/)
    .map((tok) => {
      if (!/[A-Za-z]/.test(tok)) return tok;
      if (tok === tok.toUpperCase()) return tok;
      return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase();
    })
    .join("");
};

const prettyStatus = (s) => {
  if (!s) return "";
  const words = String(s).replace(/_/g, " ").trim().split(/\s+/);
  return words
    .map((w) =>
      w.toLowerCase() === "po"
        ? "PO"
        : w === w.toUpperCase()
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
};

const pad2 = (n) => String(n).padStart(2, "0");
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

// -------------- component ----------------
const ScopeDetail = ({ project_id, project_code }) => {
  const {
    data: getScope,
    isLoading,
    error,
    refetch,
  } = useGetScopeByProjectIdQuery({ project_id });

  const [updateScope] = useUpdateScopeByProjectIdMutation();
  const [updateScopeStatus] = useUpdateScopeStatusMutation();
  const [generateScopePdf] = useGenerateScopePdfMutation();
  const [doUpdateCommitmentDate, { isLoading: savingCommitment }] =
    useUpdateCommitmentDateMutation();

  const [itemsState, setItemsState] = useState([]);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);

  // Edit (pencil) modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState({ date: "", remarks: "" });

  // PDF menu state
  const [view, setView] = useState("portrait");
  const [format, setFormat] = useState("A4");

  const rawStatus = getScope?.data?.current_status?.status || "";
  const statusPretty = prettyStatus(rawStatus);
  const isOpen = rawStatus?.toLowerCase() === "open";

  const formats = [
    "Letter",
    "Legal",
    "Tabloid",
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
  ];

  useEffect(() => {
    if (getScope?.data?.items) setItemsState(getScope.data.items);
  }, [getScope]);

  const handleCheckboxChange = (index, checked) => {
    const item = itemsState[index];
    if (!item) return;
    if (item.pr_status && !checked) {
      toast.error("Purchase request has been made for this Item");
      return;
    }
    const updatedScope = checked ? "slnko" : "client";
    const idKey = item.item_id;
    setItemsState((prev) =>
      prev.map((it) =>
        it.item_id === idKey ? { ...it, scope: updatedScope } : it
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        items: itemsState.map((item) => ({
          item_id: item.item_id,
          name: item.name,
          type: item.type,
          category: item.category,
          scope: item.scope || "client",
          quantity: item.quantity || "",
          uom: item.uom || "",
        })),
      };
      await updateScope({ project_id, payload }).unwrap();
      toast.success("Scope updated successfully");
      refetch();
    } catch {
      toast.error("Failed to update scope");
    }
  };

  const handleChipClick = (event) => {
    if (!isOpen) setStatusAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setStatusAnchorEl(null);

  const handleChangeStatus = async (newStatus) => {
    try {
      await updateScopeStatus({
        project_id,
        status: newStatus,
        remarks: " ",
      }).unwrap();
      toast.success(`Status changed to ${prettyStatus(newStatus)}`);
      handleMenuClose();
      refetch();
    } catch {
      toast.error("Failed to change status");
    }
  };

  const handleDownloadPdf = async (v = view, f = format) => {
    try {
      setDownloading(true);
      const blob = await generateScopePdf({
        project_id,
        view: v,
        format: f,
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Scope_${project_code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const openHistory = (item) => {
    setHistoryItem(item || null);
    setHistoryOpen(true);
  };
  const closeHistory = () => {
    setHistoryOpen(false);
    setHistoryItem(null);
  };

  const openEdit = (item) => {
    setEditItem(item || null);
    setEditDraft({ date: "", remarks: "" });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditItem(null);
    setEditDraft({ date: "", remarks: "" });
  };
  const onEditDraftChange = (field, value) => {
    setEditDraft((p) => ({ ...p, [field]: value }));
  };

  const saveEdit = async () => {
    const date = (editDraft.date || "").trim?.() || editDraft.date;
    const remarks = (editDraft.remarks || "").trim();
    if (!editItem) return;
    if (!date || !remarks) {
      toast.error("Please enter both date and remarks.");
      return;
    }
    try {
      await doUpdateCommitmentDate({
        id: getScope?.data?._id,
        item_id: editItem.item_id,
        date,
        remarks,
      }).unwrap();
      toast.success("Commitment date saved.");
      closeEdit();
      await refetch();
    } catch {
      toast.error("Failed to save commitment date.");
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="danger">Error loading scope</Typography>;

  const groupedItems = itemsState.reduce(
    (acc, item) => {
      if (item.type === "supply") acc.supply.push(item);
      else if (item.type === "execution") acc.execution.push(item);
      return acc;
    },
    { supply: [], execution: [] }
  );

  const statusOrder = { po_created: 0, approval_done: 1, approval_pending: 2 };
  const posKey = (p) =>
    `${p.po_number ?? "null"}|${p.status ?? ""}|${p.po_date ?? ""}|${
      p.etd ?? ""
    }|${p.delivered_date ?? ""}`;
  const normalizePos = (item) => {
    const raw = Array.isArray(item?.pos)
      ? item.pos
      : item?.po?.exists
      ? [item.po]
      : [];
    const seen = new Map();
    for (const p of raw) seen.set(posKey(p), p);
    const unique = Array.from(seen.values());
    const enriched = unique.map((p) => ({
      p,
      w: statusOrder[p?.status] ?? 9,
      ts: p?.po_date ? new Date(p.po_date).getTime() : -Infinity,
    }));
    enriched.sort((a, b) => a.w - b.w || b.ts - a.ts);
    return enriched.map((x) => x.p);
  };

  const renderTable = (title, items) => (
    <Box sx={{ mb: 4 }}>
      <Typography
        level="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          borderBottom: "2px solid",
          borderColor: "neutral.outlinedBorder",
          pb: 0.5,
        }}
      >
        {titlePreserveAcronyms(title)}
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          overflow: "auto",
          "& table": { minWidth: 1200 },
        }}
      >
        <Table
          borderAxis="both"
          stickyHeader
          hoverRow
          sx={{
            "& th": {
              backgroundColor: "neutral.plainHoverBg",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            },
            "& td": {
              whiteSpace: "normal",
              wordBreak: "break-word",
              verticalAlign: "top",
            },
          }}
        >
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th style={{ minWidth: 220 }}>Category Name</th>
              <th style={{ textAlign: "left" }}>Scope</th>
              <th style={{ minWidth: 260 }}>Commitment Date</th>
              <th style={{ minWidth: 160 }}>PO Number(s)</th>
              <th>PO Status</th>
              <th>PO Date</th>
              <th>ETD</th>
              <th>Delivered Date</th>
            </tr>
          </thead>
          <tbody>
            {items?.length > 0 ? (
              items.map((item, idx) => {
                const indexInAll = itemsState.findIndex(
                  (it) => it.item_id === item.item_id
                );
                const pos = normalizePos(item);
                const childRows =
                  pos.length > 0
                    ? pos
                    : [
                        {
                          po_number: "Pending",
                          status: "",
                          po_date: null,
                          etd: null,
                          delivered_date: null,
                        },
                      ];
                const current = item?.current_commitment_date;
                const currentRemarks =
                  (current?.remarks || "").trim() || "No remarks";

                return (
                  <Fragment key={item.item_id}>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{titlePreserveAcronyms(item.name || "-")}</td>
                      <td style={{ textAlign: "left" }}>
                        <Checkbox
                          variant="soft"
                          checked={item.scope === "slnko"}
                          disabled={!isOpen}
                          onChange={(e) =>
                            handleCheckboxChange(indexInAll, e.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <Stack spacing={1}>
                          <Tooltip
                            placement="top-start"
                            variant="soft"
                            title={currentRemarks}
                          >
                            <Typography
                              level="body-sm"
                              sx={{
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                cursor: "help",
                              }}
                            >
                              Current:&nbsp;
                              {current?.date ? (
                                formatDate(current.date)
                              ) : (
                                <Chip size="sm" variant="soft" color="warning">
                                  Waiting
                                </Chip>
                              )}
                            </Typography>
                          </Tooltip>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Tooltip
                              title={
                                isOpen
                                  ? "Add/Update Commitment Date"
                                  : "Open to edit"
                              }
                            >
                              <span>
                                <IconButton
                                  size="sm"
                                  variant="soft"
                                  onClick={() => openEdit(item)}
                                  disabled={!isOpen}
                                  sx={{ "--IconButton-size": "26px" }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="View History">
                              <IconButton
                                size="sm"
                                variant="soft"
                                onClick={() => openHistory(item)}
                                sx={{ "--IconButton-size": "26px" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </td>

                      <td>
                        <Typography level="body-sm">
                          {childRows[0]?.po_number || "Pending"}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {prettyStatus(childRows[0]?.status)}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {formatDate(childRows[0]?.po_date)}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {formatDate(childRows[0]?.etd)}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {formatDate(childRows[0]?.delivered_date)}
                        </Typography>
                      </td>
                    </tr>

                    {childRows.slice(1).map((p, i) => (
                      <tr key={`${item.item_id}-po-${i}`}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          <Typography level="body-sm">
                            {p.po_number || "Pending"}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {prettyStatus(p?.status)}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {formatDate(p?.po_date)}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {formatDate(p?.etd)}
                          </Typography>
                        </td>
                        <td>
                          <Typography level="body-sm">
                            {formatDate(p?.delivered_date)}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: "full",
        maxHeight: "60vh",
        overflowY: "auto",
        overflowX: "auto",
        mx: "auto",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        width={"full"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={4}
        mb={2}
      >
        <Box width={"full"} display={"flex"} gap={1} alignItems="center">
          <Typography sx={{ fontSize: "1.2rem" }}>Status</Typography>
          <Chip
            color={isOpen ? "success" : "danger"}
            onClick={handleChipClick}
            sx={{ cursor: isOpen ? "default" : "pointer", userSelect: "none" }}
          >
            {statusPretty || "Closed"}
          </Chip>
          <Menu
            anchorEl={statusAnchorEl}
            open={Boolean(statusAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleChangeStatus("open")}>
              {prettyStatus("open")}
            </MenuItem>
          </Menu>
        </Box>

        {/* Right actions: single PDF menu button */}
        <Box width={"full"} display="flex" justifyContent="flex-end">
          {rawStatus?.toLowerCase() === "closed" && (
            <Dropdown>
              <MenuButton
                size="sm"
                variant="outlined"
                startDecorator={
                  downloading ? (
                    <CircularProgress size="sm" />
                  ) : (
                    <DownloadIcon />
                  )
                }
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "PDF"}
              </MenuButton>

              <Menu placement="bottom-end" sx={{ p: 1, width: 300 }}>
                <FormControl size="sm" sx={{ px: 1, py: 0.5 }}>
                  <FormLabel>View</FormLabel>
                  <RadioGroup
                    orientation="horizontal"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                  >
                    <Radio value="portrait" label="Portrait" />
                    <Radio value="landscape" label="Landscape" />
                  </RadioGroup>
                </FormControl>

                <ListDivider />

                {/* Format as radios to avoid Select-in-Menu popper issues */}
                <FormControl size="sm" sx={{ px: 1, py: 0.5 }}>
                  <FormLabel>Format</FormLabel>
                  <RadioGroup
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
                      rowGap: 0.5,
                      columnGap: 1,
                      maxHeight: 220,
                      overflow: "auto",
                      pr: 0.5,
                    }}
                  >
                    {formats.map((f) => (
                      <Radio key={f} value={f} label={f} />
                    ))}
                  </RadioGroup>
                </FormControl>

                <ListDivider />

                <MenuItem
                  onClick={() => handleDownloadPdf(view, format)}
                  disabled={downloading}
                  sx={{ fontWeight: 600 }}
                >
                  <ListItemDecorator>
                    {downloading ? (
                      <CircularProgress size="sm" />
                    ) : (
                      <DownloadIcon />
                    )}
                  </ListItemDecorator>
                  Download
                </MenuItem>
              </Menu>
            </Dropdown>
          )}
        </Box>
      </Box>

      {/* Tables */}
      <Box>
        {renderTable("Supply Scope", groupedItems.supply)}
        {renderTable("Execution Scope", groupedItems.execution)}
        <Box>{isOpen && <Button onClick={handleSubmit}>Submit</Button>}</Box>
      </Box>

      {/* EDIT MODAL (Pencil) */}
      <Modal open={editOpen} onClose={closeEdit}>
        <ModalDialog sx={{ minWidth: 520 }}>
          <Typography level="title-lg" mb={1.5}>
            {editItem?.name
              ? `Set Commitment Date — ${titlePreserveAcronyms(editItem.name)}`
              : "Set Commitment Date"}
          </Typography>
          <Divider />
          <Stack spacing={1.25} mt={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ minWidth: 120 }}>
                <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                  Current
                </Typography>
              </Box>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                {editItem?.current_commitment_date?.date
                  ? formatDate(editItem.current_commitment_date.date)
                  : "Waiting"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ minWidth: 120 }}>
                <Typography level="body-sm">Date</Typography>
              </Box>
              <Input
                type="date"
                value={editDraft.date}
                onChange={(e) => onEditDraftChange("date", e.target.value)}
                placeholder="dd-mm-yyyy"
                sx={{ maxWidth: 220 }}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ minWidth: 120, mt: 0.6 }}>
                <Typography level="body-sm">Remarks</Typography>
              </Box>
              <Textarea
                minRows={3}
                value={editDraft.remarks}
                onChange={(e) => onEditDraftChange("remarks", e.target.value)}
                placeholder="Enter remarks"
              />
            </Stack>
          </Stack>

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1.25}
            mt={2}
          >
            <Button variant="plain" onClick={closeEdit}>
              Cancel
            </Button>
            <Button
              variant="soft"
              startDecorator={<SaveIcon />}
              onClick={saveEdit}
              disabled={savingCommitment}
            >
              {savingCommitment ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* HISTORY MODAL (Eye) */}
      <Modal open={historyOpen} onClose={closeHistory}>
        <ModalDialog sx={{ minWidth: 560 }}>
          <Typography level="title-lg">
            Commitment Date History{" "}
            <Typography component="span" level="title-sm" sx={{ opacity: 0.9 }}>
              (
              <Tooltip
                title={titlePreserveAcronyms(historyItem?.name || "—")}
                placement="top"
              >
                <Box
                  component="span"
                  sx={{
                    maxWidth: 360,
                    display: "inline-block",
                    verticalAlign: "bottom",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {titlePreserveAcronyms(historyItem?.name || "—")}
                </Box>
              </Tooltip>
              )
            </Typography>
          </Typography>
          <Divider />
          <Box mt={1}>
            {Array.isArray(historyItem?.commitment_date_history) &&
            historyItem.commitment_date_history.length ? (
              <Stack spacing={1.25}>
                {[...historyItem.commitment_date_history]
                  .sort((a, b) => {
                    const at = new Date(a.updatedAt || a.date || 0).getTime();
                    const bt = new Date(b.updatedAt || b.date || 0).getTime();
                    return bt - at;
                  })
                  .map((h, i) => {
                    const u = h?.user_id || {};
                    const avatarSrc = u?.attachment_url || "";
                    const displayName = (u?.name || "").trim() || "—";
                    const whenDate = formatDate(h.date);
                    const whenExact = new Date(
                      h.updatedAt || h.date
                    ).toLocaleString();

                    const initials = displayName
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <Sheet
                        key={i}
                        variant="outlined"
                        sx={{ p: 1.25, borderRadius: "sm" }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={avatarSrc}
                            alt={displayName}
                            sx={{ width: 28, height: 28, fontSize: 12 }}
                          >
                            {initials}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              level="title-sm"
                              sx={{ lineHeight: 1.2 }}
                            >
                              {whenDate}{" "}
                              <Typography
                                level="body-xs"
                                component="span"
                                sx={{ opacity: 0.7 }}
                              >
                                ({whenExact})
                              </Typography>
                            </Typography>
                            <Typography level="body-xs" sx={{ opacity: 0.9 }}>
                              Updated by <strong>{displayName}</strong>
                            </Typography>
                          </Box>
                        </Stack>

                        {h.remarks ? (
                          <Typography
                            level="body-sm"
                            sx={{ whiteSpace: "pre-wrap", mt: 0.75 }}
                          >
                            {h.remarks}
                          </Typography>
                        ) : null}
                      </Sheet>
                    );
                  })}
              </Stack>
            ) : (
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                No history found.
              </Typography>
            )}
          </Box>

          <Stack direction="row" justifyContent="flex-end" mt={2}>
            <Button onClick={closeHistory}>Close</Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default ScopeDetail;
