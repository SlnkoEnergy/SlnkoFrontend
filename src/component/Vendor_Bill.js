import { keyframes } from "@emotion/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  CircularProgress,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Tooltip,
} from "@mui/joy";
import Checkbox from "@mui/joy/Checkbox";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useSnackbar } from "notistack";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExportBillsMutation, useGetAllBillsQuery } from "../redux/billsSlice";
import Axios from "../utils/Axios";
import dayjs from "dayjs";

/* ===========================================
   VendorBillSummary
=========================================== */
const VendorBillSummary = forwardRef((props, ref) => {
  const { onSelectionChange, setSelected } = props;
  useImperativeHandle(ref, () => ({
    handleExport,
    selectedIds,
  }));

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);

  const po_number = searchParams.get("po_number") || "";
  const dateFilterEnd = searchParams.get("to") || "";
  const dateFilterFrom = searchParams.get("from") || "";
  const selectStatus = searchParams.get("status") || "";
  const [selectedIds, setSelectedIds] = useState([]);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const { data: getBill = {}, isLoading } = useGetAllBillsQuery({
    page: currentPage,
    pageSize: perPage,
    po_number: po_number,
    search: searchQuery,
    dateFrom: dateFilterFrom,
    dateEnd: dateFilterEnd,
    status: selectStatus,
  });

  useEffect(() => {
    onSelectionChange?.(selectedIds.length, selectedIds);
  }, [selectedIds, onSelectionChange]);

  const {
    total = 0,
    page = 0,
    pageSize = 0,
    totalPages = 0,
  } = getBill;

  const bills = useMemo(
    () => (Array.isArray(getBill?.data) ? getBill.data : []),
    [getBill]
  );

  const [exportBills, { isLoading: isExporting }] = useExportBillsMutation();

  const handleExport = async () => {
    try {
      const res = await exportBills({ Ids: selectedIds }).unwrap();
      const url = URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bills_export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export bills");
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    setSelected?.([]);
  }, [bills, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Pagination
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(pageNum));
        return next;
      });
    }
  };

  const handlePerPageChange = (newValue) => {
    setPerPage(newValue);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      next.set("pageSize", String(newValue));
      return next;
    });
  };

  const getPaginationRange = () => {
    const siblings = 1;
    const pages = [];
    if (totalPages <= 5 + siblings * 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - siblings, 2);
      const right = Math.min(currentPage + siblings, totalPages - 1);

      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  // Selection handlers
  const allIdsOnPage = useMemo(
    () => bills.map((b) => b._id).filter(Boolean),
    [bills]
  );
  const isAllSelected =
    allIdsOnPage.length > 0 && selectedIds.length === allIdsOnPage.length;
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(allIdsOnPage);
      setSelected?.(allIdsOnPage);
    } else {
      setSelectedIds([]);
      setSelected?.([]);
    }
  };
  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSelected?.((prev) =>
      prev?.includes?.(id) ? prev.filter((x) => x !== id) : [...(prev || []), id]
    );
  };

  // Helpers
  const capitalize = (s = "") =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const fmtINR = (n) => (isFinite(n) ? `₹${Number(n).toFixed(2)}` : "₹0.00");
  const fmtDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-");

  // Components used in columns
  const BillingStatusChip = ({ status, balance }) => {
    const isFullyBilled = status === "fully billed";
    const isPending = status === "waiting bills";
    const rawLabel = isFullyBilled
      ? "Fully Billed"
      : isPending
      ? `${balance} - Waiting Bills`
      : status;
    return (
      <Chip
        variant="soft"
        size="sm"
        startDecorator={
          isFullyBilled ? (
            <CheckRoundedIcon />
          ) : isPending ? (
            <AutorenewRoundedIcon />
          ) : null
        }
        color={isFullyBilled ? "success" : isPending ? "warning" : "neutral"}
      >
        {capitalize(rawLabel)}
      </Chip>
    );
  };

  const BillAcceptance = ({ billNumber, poNumber, approvedBy, currentUser }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isAccepted, setIsAccepted] = useState(Boolean(approvedBy));
    const [loading, setLoading] = useState(false);

    const pickSuccessMessage = (res, fallback) => {
      const d = res?.data;
      return d?.msg || d?.message || fallback;
    };

    const pickErrorMessage = (err) => {
      const d = err?.response?.data;
      return (
        d?.message ||
        d?.msg ||
        (Array.isArray(d?.errors) && d.errors[0]?.msg) ||
        d?.error ||
        err?.response?.statusText ||
        err?.message ||
        "Something went wrong."
      );
    };

    const statusToVariant = (status) => {
      if (status === 409) return "warning";
      if (status === 400 || status === 422) return "warning";
      if (status === 401 || status === 403 || status === 404) return "error";
      if (status >= 500) return "error";
      return "error";
    };

    const firstNonEmpty = (val) => {
      if (Array.isArray(val)) {
        const first = val.find((x) => x && String(x).trim().length > 0);
        return first ? String(first).trim() : "";
      }
      return val ? String(val).trim() : "";
    };

    const handleAcceptance = async () => {
      if (loading || isAccepted) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const po_number = firstNonEmpty(poNumber);
        const bill_number = firstNonEmpty(billNumber);

        if (!po_number) {
          enqueueSnackbar("PO number is missing/empty.", { variant: "warning" });
          return;
        }
        if (!bill_number) {
          enqueueSnackbar("Bill number is missing/empty.", { variant: "warning" });
          return;
        }

        const res = await Axios.put(
          "/accepted-by",
          { po_number, bill_number },
          { headers: { "x-auth-token": token } }
        );

        if (res.status === 200) {
          setIsAccepted(true);
          enqueueSnackbar(
            pickSuccessMessage(
              res,
              `Bill accepted successfully${currentUser?.name ? ` by ${currentUser.name}` : ""}.`
            ),
            { variant: "success" }
          );
        } else {
          enqueueSnackbar("Failed to accept the bill. Please try again.", {
            variant: "error",
          });
        }
      } catch (err) {
        const status = err?.response?.status;
        enqueueSnackbar(pickErrorMessage(err), {
          variant: statusToVariant(status),
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box>
        {isAccepted ? (
          <Tooltip
            title={`Approved by: ${approvedBy || currentUser?.name || "Unknown"}`}
            variant="soft"
          >
            <Typography
              level="body-sm"
              sx={{ color: "#666", fontWeight: 500, mt: 0.5, cursor: "help" }}
            >
              Approved
            </Typography>
          </Tooltip>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAcceptance();
            }}
          >
            <IconButton
              variant="solid"
              color="success"
              onClick={handleAcceptance}
              size="sm"
              disabled={loading}
              sx={{
                boxShadow: "0 2px 6px rgba(0, 128, 0, 0.2)",
                transition: "all .2s",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 10px rgba(0, 128, 0, 0.3)",
                },
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <CheckRoundedIcon />
            </IconButton>
          </form>
        )}
      </Box>
    );
  };

  /* ===============================
     Attachments Preview - Google Docs ONLY
     - images rendered directly
     - docs/pdf via Google viewer with fallback
  ================================ */
  const isImage = (s = "") => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(s);

  const buildGdocUrls = (rawUrl = "") => [
    `https://drive.google.com/viewerng/viewer?embedded=1&url=${encodeURIComponent(rawUrl)}`,
    `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`,
  ];

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewName, setPreviewName] = useState("");
  const [viewerUrls, setViewerUrls] = useState([]); // [primary, fallback]
  const [viewerIdx, setViewerIdx] = useState(0);
  const [loadingViewer, setLoadingViewer] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const previewAttachment = (att) => {
    if (!att) return;
    const url = att.attachment_url || "";
    const name = att.attachment_name || "Attachment";
    if (!url) return;

    setPreviewName(name);

    // images -> render raw
    if (isImage(`${url} ${name}`)) {
      setViewerUrls([url]);
      setViewerIdx(0);
      setPreviewOpen(true);
      setLoadingViewer(false);
      setLoadFailed(false);
      return;
    }

    const candidates = buildGdocUrls(url);
    setViewerUrls(candidates);
    setViewerIdx(0);
    setPreviewOpen(true);
    setLoadingViewer(true);
    setLoadFailed(false);
  };

  const VIEWER_TIMEOUT_MS = 6000;
  useEffect(() => {
    if (!previewOpen) return;
    if (!viewerUrls.length) return;

    setLoadingViewer(true);
    setLoadFailed(false);

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      // fallback once
      if (viewerIdx === 0 && viewerUrls[1]) {
        setViewerIdx(1);
      } else {
        setLoadFailed(true);
        setLoadingViewer(false);
      }
    }, VIEWER_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [previewOpen, viewerIdx, viewerUrls]);

  /* ===============================
     Column Visibility Config
  ================================ */
  const LS_KEY = "billTable.columns.v1";
  const PRESET_ESSENTIAL = ["bill_no", "bill_date", "bill_value", "po_no", "vendor", "po_status", "attachments"];
  const PRESET_FINANCE = ["bill_no", "bill_date", "bill_value", "total_billed", "po_value", "po_status", "created_on"];
  const PRESET_LOGISTICS = ["bill_no", "po_no", "vendor", "delivery_status", "attachments", "created_on"];

  // columns config: id, label, render(row)
  const COLUMN_DEFS = [
    {
      id: "bill_no",
      label: "Bill No.",
      render: (bill) => (
        <Chip
          variant="outlined"
          color="primary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/add_bill?mode=edit&_id=${bill._id}`)}
        >
          {bill.bill_no}
        </Chip>
      ),
    },
    { id: "bill_date", label: "Bill Date", render: (b) => fmtDate(b.bill_date) },
    { id: "bill_value", label: "Bill Value", render: (b) => fmtINR(b.bill_value) },
    { id: "total_billed", label: "Total Billed", render: (b) => fmtINR(b.total_billed) },
    {
      id: "category",
      label: "Category",
      render: (bill) => {
        if (Array.isArray(bill.item) && bill.item.length) {
          const unique = [...new Set(bill.item.map((it) => it?.category_name).filter(Boolean))];
          const first = unique[0];
          const remaining = unique.slice(1);
          return (
            <>
              {first || "-"}
              {remaining.length > 0 && (
                <Tooltip title={remaining.join(", ")} arrow>
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 1,
                      borderRadius: "50%",
                      backgroundColor: "primary.solidBg",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "22px",
                      height: "22px",
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    +{remaining.length}
                  </Box>
                </Tooltip>
              )}
            </>
          );
        }
        return bill.item?.category_name || "-";
      },
    },
    { id: "project_id", label: "Project ID", render: (b) => b.project_id || "-" },
    { id: "po_no", label: "PO No.", render: (b) => b.po_no || "-" },
    { id: "vendor", label: "Vendor", render: (b) => b.vendor || "-" },
    { id: "po_value", label: "PO Value", render: (b) => fmtINR(b.po_value || 0) },
    {
      id: "po_status",
      label: "PO Status",
      render: (b) => (
        <BillingStatusChip
          status={b.po_status}
          balance={(Number(b.po_value || 0) - Number(b.total_billed || 0)).toFixed(2)}
        />
      ),
    },
    {
      id: "delivery_status",
      label: "Delivery Status",
      render: (b) => (
        <Chip
          size="sm"
          variant={b.delivery_status === "delivered" ? "solid" : "soft"}
          color={b.delivery_status === "delivered" ? "success" : "neutral"}
        >
          {b.delivery_status || "-"}
        </Chip>
      ),
    },
    {
      id: "attachments",
      label: "Attachments",
      render: (bill) =>
        Array.isArray(bill.attachments) && bill.attachments.length ? (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {bill.attachments.slice(0, 3).map((att, i) => (
              <Chip
                key={att._id || `${bill._id}-att-${i}`}
                size="sm"
                variant="soft"
                color="primary"
                onClick={() => previewAttachment(att)}
                sx={{
                  cursor: "pointer",
                  maxWidth: 200,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                {att.attachment_name || "Attachment"}
              </Chip>
            ))}
            {bill.attachments.length > 3 && (
              <Chip
                size="sm"
                variant="soft"
                color="neutral"
                onClick={() => previewAttachment(bill.attachments[3])}
                sx={{ cursor: "pointer" }}
              >
                +{bill.attachments.length - 3} more
              </Chip>
            )}
          </Box>
        ) : (
          "—"
        ),
    },
    {
      id: "received",
      label: "Received",
      render: (b) => (
        <BillAcceptance
          billNumber={b.bill_no || []}
          poNumber={b.po_no || []}
          approvedBy={b.approved_by_name}
          currentUser={user}
        />
      ),
    },
    { id: "created_on", label: "Created On", render: (b) => fmtDate(b.created_on) },
  ];

  // presets
  const PRESET_ALL = COLUMN_DEFS.map((c) => c.id);

  const loadVisibility = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) && arr.length ? arr : PRESET_ESSENTIAL;
      }
    } catch {}
    return PRESET_ESSENTIAL;
  };

  const [visibleCols, setVisibleCols] = useState(loadVisibility());
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(visibleCols));
  }, [visibleCols]);

  const applyPreset = (ids) => setVisibleCols(ids);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const handle = () => {
      if (mq.matches) setVisibleCols((prev) => prev.filter((id) => PRESET_ESSENTIAL.includes(id)));
    };
    handle();
    mq.addEventListener?.("change", handle);
    return () => mq.removeEventListener?.("change", handle);
  }, []);

  const [colModalOpen, setColModalOpen] = useState(false);

  /* ===========================================
     RENDER
  =========================================== */
  const visibleDefs = COLUMN_DEFS.filter((c) => visibleCols.includes(c.id));
  const dynamicColSpan = 1 + visibleDefs.length; // checkbox + visible columns

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Search + Columns */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search Project Id, PO Number, Vendor"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setColModalOpen(true)}
          >
            Columns
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            disabled={!selectedIds.length || isExporting}
            onClick={handleExport}
          >
            Export Selected
          </Button>
        </Stack>
      </Box>

      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
          "& table tbody tr:nth-of-type(odd)": {
            backgroundColor: "var(--joy-palette-neutral-softBg)",
          },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
        >
          <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
            <Box component="tr">
              {/* Select-All header cell */}
              <Box
                component="th"
                sx={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  width: 44,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </Box>

              {/* Dynamic headers */}
              {visibleDefs.map((col) => (
                <Box
                  component="th"
                  key={col.id}
                  sx={{
                    position: "sticky",
                    top: 0,
                    background: "#e0e0e0",
                    zIndex: 2,
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={dynamicColSpan}
                  sx={{ py: 5, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography fontStyle="italic">
                      Loading bills… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : bills.length > 0 ? (
              bills.map((bill, idx) => {
                const id = bill._id || `${bill.bill_no}-${idx}`;
                const isChecked = selectedIds.includes(id);

                return (
                  <Box
                    component="tr"
                    key={id}
                    sx={{ borderBottom: "1px solid #ddd" }}
                  >
                    {/* Row checkbox */}
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        width: 44,
                        position: "sticky",
                        left: 0,
                        background: "var(--joy-palette-background-surface)",
                        zIndex: 1,
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={isChecked}
                        onChange={() => toggleRow(id)}
                      />
                    </Box>

                    {/* Dynamic data cells */}
                    {visibleDefs.map((col) => (
                      <Box
                        key={`${id}-${col.id}`}
                        component="td"
                        sx={{ borderBottom: "1px solid #ddd", padding: "8px", verticalAlign: "top" }}
                      >
                        {col.render(bill)}
                      </Box>
                    ))}
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={dynamicColSpan}
                  sx={{ textAlign: "center", p: 2 }}
                >
                  No bills found.
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 1,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Box>
          <Typography level="body-sm">
            Showing {startIndex}–{endIndex} of {total} results
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
          {getPaginationRange()?.map((p, idx) =>
            p === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                ...
              </Box>
            ) : (
              <IconButton
                key={p}
                size="sm"
                variant={p === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(p)}
              >
                {p}
              </IconButton>
            )
          )}
        </Box>

        <FormControl size="sm" sx={{ minWidth: 120 }}>
          <Select value={perPage} onChange={(e, v) => handlePerPageChange(v)}>
            {[10, 30, 60, 100].map((num) => (
              <Option key={num} value={num}>
                {num}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Column Visibility Modal */}
      <Modal open={colModalOpen} onClose={() => setColModalOpen(false)}>
        <ModalDialog sx={{ width: 520 }}>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Visible Columns
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
            <Chip onClick={() => applyPreset(PRESET_ESSENTIAL)} variant="soft">
              Essential
            </Chip>
            <Chip onClick={() => applyPreset(PRESET_FINANCE)} variant="soft">
              Finance
            </Chip>
            <Chip onClick={() => applyPreset(PRESET_LOGISTICS)} variant="soft">
              Logistics
            </Chip>
            <Chip onClick={() => applyPreset(PRESET_ALL)} variant="soft">
              All
            </Chip>
          </Stack>

          <Sheet
            variant="outlined"
            sx={{ p: 1, borderRadius: "sm", maxHeight: 300, overflow: "auto" }}
          >
            <Stack spacing={0.5}>
              {COLUMN_DEFS.map((col) => {
                const checked = visibleCols.includes(col.id);
                return (
                  <Box key={col.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Checkbox
                      size="sm"
                      checked={checked}
                      onChange={(e) => {
                        setVisibleCols((prev) =>
                          e.target.checked ? [...prev, col.id] : prev.filter((x) => x !== col.id)
                        );
                      }}
                    />
                    <Typography level="body-sm">{col.label}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </Sheet>

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
            <Button size="sm" variant="plain" onClick={() => setColModalOpen(false)}>
              Close
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Attachments Viewer Modal (Google Docs only; images raw) */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <ModalDialog
          variant="soft"
          sx={{ width: "min(1000px, 96vw)", maxHeight: "92vh", p: 0, overflow: "hidden" }}
        >
          <Sheet
            sx={{
              px: 2,
              py: 1,
              borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)",
            }}
          >
            <ModalClose />
            <Typography level="title-md" noWrap>
              {previewName}
            </Typography>
          </Sheet>

          <Sheet sx={{ flex: 1, p: 2, backgroundColor: "neutral.softBg" }}>
            {/* Images directly */}
            {viewerUrls.length === 1 && isImage(viewerUrls[0]) ? (
              <img
                src={viewerUrls[0]}
                alt={previewName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                {loadingViewer && !loadFailed && (
                  <Typography level="body-sm">Loading…</Typography>
                )}
                {loadFailed ? (
                  <Typography level="body-sm">
                    Viewer blocked or unavailable. Try opening in a new tab.
                  </Typography>
                ) : (
                  <iframe
                    title={previewName}
                    src={viewerUrls[viewerIdx]}
                    style={{
                      width: "100%",
                      height: "80vh",
                      border: "none",
                      borderRadius: 8,
                      background: "#fff",
                    }}
                    onLoad={() => setLoadingViewer(false)}
                    onError={() => {
                      // fallback once
                      if (viewerIdx === 0 && viewerUrls[1]) {
                        setViewerIdx(1);
                      } else {
                        setLoadFailed(true);
                        setLoadingViewer(false);
                      }
                    }}
                    referrerPolicy="no-referrer"
                  />
                )}
              </>
            )}
          </Sheet>

          <Sheet
            sx={{
              px: 2,
              py: 1,
              borderTop: "1px solid var(--joy-palette-neutral-outlinedBorder)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography level="body-sm" color="neutral">
              View only
            </Typography>
            {!loadFailed && viewerUrls[viewerIdx] && (
              <Chip
                component="a"
                href={viewerUrls[viewerIdx]}
                target="_blank"
                rel="noopener noreferrer"
                variant="soft"
                color="neutral"
              >
                Open in new tab
              </Chip>
            )}
          </Sheet>
        </ModalDialog>
      </Modal>
    </Box>
  );
});

export default VendorBillSummary;
