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
} from "@mui/joy";
import {
  useGetScopeByProjectIdQuery,
  useUpdateScopeByProjectIdMutation,
  useUpdateScopeStatusMutation,
  useGenerateScopePdfMutation,
} from "../redux/camsSlice";
import { toast } from "react-toastify";

// --- Capitalization helpers ---
const titlePreserveAcronyms = (s) => {
  if (!s && s !== 0) return "";
  return String(s)
    .split(/(\s+)/) // keep spaces
    .map((tok) => {
      if (!/[A-Za-z]/.test(tok)) return tok;     // numbers/symbols unchanged
      if (tok === tok.toUpperCase()) return tok; // keep ALL-CAPS (PO, AC, LA)
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

  const [itemsState, setItemsState] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const rawStatus = getScope?.data?.current_status?.status || "";
  const statusPretty = prettyStatus(rawStatus);
  const isOpen = rawStatus?.toLowerCase() === "open";

  useEffect(() => {
    if (getScope?.data?.items) setItemsState(getScope.data.items);
  }, [getScope]);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

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
    if (!isOpen) setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

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

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blob = await generateScopePdf({ project_id }).unwrap();
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

  // ---- helpers for multi-PO rendering (sorted + deduped) ----
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

  const MultiCell = ({ children }) => (
    <Typography
      level="body-sm"
      sx={{ lineHeight: 1.3, wordBreak: "break-word" }}
    >
      {children}
    </Typography>
  );

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
          "& table": { minWidth: 1000 },
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
              <th style={{ minWidth: 220 }}>Item Name</th>
              <th style={{ textAlign: "left" }}>Scope</th>
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

                return (
                  <Fragment key={item.item_id}>
                    {/* First row — item info + first PO */}
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
                          // Optionally show label visually hidden / tooltip if needed
                        />
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

                    {/* Remaining POs — no item data */}
                    {childRows.slice(1).map((p, i) => (
                      <tr key={`${item.item_id}-po-${i}`}>
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
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleChangeStatus("open")}>
              {prettyStatus("open")}
            </MenuItem>
          </Menu>
        </Box>

        <Box width={"full"} display="flex" justifyContent="flex-end">
          {rawStatus?.toLowerCase() === "closed" && (
            <Button
              size="sm"
              variant="outlined"
              onClick={handleDownloadPdf}
              disabled={downloading}
              startDecorator={
                downloading ? <CircularProgress size="sm" /> : null
              }
            >
              {downloading ? "Downloading..." : "Download Pdf"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Tables */}
      <Box>
        {renderTable("Supply Scope", groupedItems.supply)}
        {renderTable("Execution Scope", groupedItems.execution)}
        <Box>{isOpen && <Button onClick={handleSubmit}>Submit</Button>}</Box>
      </Box>
    </Box>
  );
};

export default ScopeDetail;
