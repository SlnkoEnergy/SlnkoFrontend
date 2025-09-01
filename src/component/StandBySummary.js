/* TrashRequest.jsx */
import { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import CloseRounded from "@mui/icons-material/CloseRounded";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { CircularProgress, Modal, Option, Select, Tooltip, Button, Textarea } from "@mui/joy";

import { toast } from "react-toastify"; // ✅ snackbar
import NoData from "../assets/alert-bell.svg";
import { PaymentProvider } from "../store/Context/Payment_History";
import PaymentHistory from "./PaymentHistory";
import { useGetTrashRecordQuery, useUpdateRestoreTrashMutation } from "../redux/Accounts";

dayjs.extend(duration);

const TrashRequest = forwardRef(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ----------------------------- paging / filters ---------------------------- */
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const initialPageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);

  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rawSearch, setRawSearch] = useState(searchParams.get("search") || "");
  const [status] = useState(""); // reserved for future use

  // Debounced search (300ms)
  const [searchQuery, setSearchQuery] = useState(rawSearch);
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawSearch.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  // ✅ When search changes, go back to the first page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reflect state to URL
  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(currentPage));
    sp.set("pageSize", String(perPage));
    if (searchQuery) sp.set("search", searchQuery);
    else sp.delete("search");
    setSearchParams(sp, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, searchQuery]);

  /* ---------------------------------- data ---------------------------------- */
  const {
    data: responseData,
    isLoading,
    isFetching,
    error,
    refetch, // ✅ we’ll use this after restore
  } = useGetTrashRecordQuery(
    {
      page: currentPage,
      pageSize: perPage,
      search: searchQuery,
      status,
    },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const paginatedData = responseData?.data ?? [];
  const total = responseData?.total ?? 0;
  const count = responseData?.count ?? paginatedData.length;

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endIndex = total === 0 ? 0 : Math.min(startIndex + count - 1, total);

  // ✅ If current page becomes larger than the available pages after a reload, clamp it
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  /* ---------------------------- restore mutation ----------------------------- */
  const [restoreMutation, { isLoading: isRestoring }] = useUpdateRestoreTrashMutation();
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const pendingRestoreRef = useRef(null); // holds { id }

  const openRemarks = (id) => {
    pendingRestoreRef.current = { id };
    setRemarks("");
    setRemarksOpen(true);
  };

  const closeRemarks = () => {
    pendingRestoreRef.current = null;
    setRemarksOpen(false);
  };

  const handleConfirmRestore = async () => {
    const id = pendingRestoreRef.current?.id;
    if (!id) return;

    try {
      await restoreMutation({
        id,
        remarks: remarks || "Restored from Trash to Draft",
      }).unwrap();

      // ✅ Snackbar + auto reload
      toast.success("Request restored to Draft");
      setRemarksOpen(false);
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Restore failed");
      // keep dialog open so the user can retry or edit remarks
    }
  };

  /* --------------------------------- styles --------------------------------- */
  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "primary.softBg",
    fontSize: 14,
    fontWeight: 700,
    p: "12px 16px",
    textAlign: "left",
    color: "text.primary",
    borderBottom: "1px solid",
    borderColor: "primary.softBorder",
  };

  const cellStyle = {
    p: "12px 16px",
    verticalAlign: "top",
    fontSize: 13,
    fontWeight: 400,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "Inter, Roboto, sans-serif",
    color: "#2C3E50",
  };

  const valueStyle = {
    fontSize: 13,
    fontWeight: 400,
    fontFamily: "Inter, Roboto, sans-serif",
    color: "#34495E",
  };

  /* ------------------------------- subcomponents ------------------------------ */
  const PaymentID = ({ pay_id, dbt_date }) => (
    <>
      {pay_id && (
        <Box>
          <Chip
            variant="solid"
            color="primary"
            size="sm"
            sx={{
              fontWeight: 600,
              fontFamily: "Inter, Roboto, sans-serif",
              fontSize: 13,
              color: "#fff",
              "&:hover": { boxShadow: "md", opacity: 0.95 },
            }}
          >
            {pay_id}
          </Chip>
        </Box>
      )}
      {dbt_date && (
        <Box display="flex" alignItems="center" mt={0.75} gap={0.8}>
          <Typography sx={labelStyle}>📅 Created:</Typography>
          <Typography sx={valueStyle}>{dayjs(dbt_date).format("DD-MM-YYYY")}</Typography>
        </Box>
      )}
    </>
  );

  const ItemFetch = ({ paid_for, po_number, vendor }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        {paid_for && (
          <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
            <Typography sx={{ ...labelStyle, minWidth: 110 }}>📦 Requested For:</Typography>
            <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>{paid_for}</Typography>
          </Box>
        )}
        {po_number && (
          <Box
            display="flex"
            alignItems="flex-start"
            gap={1}
            mt={0.5}
            sx={{ cursor: "pointer" }}
            onClick={() => setOpen(true)}
          >
            <Typography sx={{ ...labelStyle, minWidth: 110 }}>🧾 PO Number:</Typography>
            <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>{po_number}</Typography>
          </Box>
        )}
        <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
          <Typography sx={{ ...labelStyle, minWidth: 110 }}>🏢 Vendor:</Typography>
          <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>{vendor || "—"}</Typography>
        </Box>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Sheet
            variant="outlined"
            sx={{
              mx: "auto",
              mt: "8vh",
              width: { xs: "95%", sm: 600 },
              borderRadius: "12px",
              p: 3,
              boxShadow: "lg",
              maxHeight: "80vh",
              overflow: "auto",
              bgcolor: "#fff",
              minWidth: 950,
            }}
          >
            <PaymentProvider po_number={po_number}>
              <PaymentHistory />
            </PaymentProvider>
          </Sheet>
        </Modal>
      </>
    );
  };

  const MatchRow = ({ approved, timers, amount_paid }) => {
    const [timeLeft, setTimeLeft] = useState("N/A");

    useEffect(() => {
      if (!timers?.trash_started_at) {
        setTimeLeft("N/A");
        return;
      }

      const isFinal =
        ["Approved", "Rejected", "Deleted"].includes(approved) || !!timers?.draft_frozen_at;

      if (isFinal) {
        setTimeLeft("Finalized");
        return;
      }

      const tick = () => {
        const now = dayjs();
        const trashStartedAt = dayjs(timers.trash_started_at);
        const deadline = trashStartedAt.add(15, "day");
        const diffMs = deadline.diff(now);

        if (diffMs <= 0) {
          setTimeLeft("⏱ Expired");
          return;
        }
        const daysLeft = Math.ceil(dayjs.duration(diffMs).asDays());
        setTimeLeft(`${daysLeft} day${daysLeft > 1 ? "s" : ""} remaining`);
      };

      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }, [timers?.trash_started_at, timers?.draft_frozen_at, approved]);

    const chipColor =
      timeLeft === "Finalized"
        ? "success"
        : timeLeft === "⏱ Expired"
        ? "danger"
        : timeLeft === "N/A"
        ? "neutral"
        : "primary";

    return (
      <Box mt={1}>
        <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
          <Typography sx={labelStyle}>💰 Amount:</Typography>
          <Typography sx={{ ...valueStyle, wordBreak: "break-word", fontSize: 14 }}>
            {amount_paid ?? "—"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={labelStyle}>📑 Payment Status:</Typography>
          {["Approved", "Pending", "Rejected", "Deleted"].includes(approved) ? (
            <Chip
              color={
                {
                  Approved: "success",
                  Pending: "neutral",
                  Rejected: "danger",
                  Deleted: "warning",
                }[approved]
              }
              variant="solid"
              size="sm"
              startDecorator={
                {
                  Approved: <CheckIcon fontSize="small" />,
                  Pending: <AutorenewIcon fontSize="small" />,
                  Rejected: <BlockIcon fontSize="small" />,
                  Deleted: <DeleteIcon fontSize="small" />,
                }[approved]
              }
            >
              {approved}
            </Chip>
          ) : (
            <Typography sx={valueStyle}>{approved || "Not Found"}</Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1} mt={0.75}>
          <Typography sx={labelStyle}>⏰</Typography>
          <Chip size="sm" variant="soft" color={chipColor}>
            {timeLeft}
          </Chip>
        </Box>
      </Box>
    );
  };

  /* --------------------------------- render --------------------------------- */
  return (
    <>
      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          px: 1,
          py: 1,
          ml: { xl: "15%", lg: "18%", sm: 0 },
          maxWidth: { lg: "85%", sm: "100%" },
          borderRadius: "md",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box
            className="SearchAndFilters-tabletUp"
            sx={{
              borderRadius: "sm",
              py: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <FormControl sx={{ flex: 1 }} size="sm">
              <FormLabel>Search</FormLabel>
              <Input
                size="sm"
                placeholder="Search by Pay ID, Item, Client or Vendor"
                startDecorator={<SearchIcon />}
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                sx={{
                  width: 350,
                  borderColor: "neutral.outlinedBorder",
                  borderBottom: rawSearch ? "2px solid #1976d2" : "1px solid #ddd",
                  borderRadius: 5,
                  boxShadow: "none",
                  "&:hover": { borderBottom: "2px solid #1976d2" },
                  "&:focus-within": { borderBottom: "2px solid #1976d2" },
                }}
              />
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
          {/* Rows per page */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography level="body-sm">Rows per page:</Typography>
            <Select
              size="sm"
              value={perPage}
              onChange={(_, value) => {
                if (!value) return;
                setPerPage(Number(value));
                setCurrentPage(1); // ✅ reset to first page on size change
              }}
              sx={{ minWidth: 72 }}
            >
              {[10, 25, 50, 100].map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
          </Box>

          {/* Pagination info */}
          <Typography level="body-sm">{`${startIndex}-${endIndex} of ${total}`}</Typography>

          {/* Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
              <KeyboardDoubleArrowLeft />
            </IconButton>
            <IconButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
              <KeyboardDoubleArrowRight />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          overflowY: "auto",
          maxHeight: 600,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          ml: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          bgcolor: "background.body",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { background: "#f0f0f0", borderRadius: 8 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#1976d2", borderRadius: 8 },
        }}
      >
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["Payment Id", "Paid For / PO / Vendor", "Payment Status", "Actions"].map((h, i) => (
                <Box key={i} component="th" sx={headerStyle}>
                  {h}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {error ? (
              <Box component="tr">
                <Box component="td" colSpan={4} sx={{ py: 2, textAlign: "center" }}>
                  <Typography color="danger">
                    Failed to load: {String(error?.data?.message || error?.error || "Error")}
                  </Typography>
                </Box>
              </Box>
            ) : isLoading || isFetching ? (
              <Box component="tr">
                <Box component="td" colSpan={4} sx={{ py: 3, textAlign: "center" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <CircularProgress size="sm" />
                    <Typography fontStyle="italic">Loading trash requests…</Typography>
                  </Box>
                </Box>
              </Box>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((payment, idx) => (
                <Box
                  component="tr"
                  key={payment._id || payment.pay_id || idx}
                  sx={{
                    backgroundColor: "background.surface",
                    transition: "all 0.2s",
                    "&:hover": { backgroundColor: "neutral.softHoverBg" },
                  }}
                >
                  <Box component="td" sx={{ ...cellStyle, minWidth: 260 }}>
                    <Tooltip title="View summary" arrow>
                      <span>
                        <PaymentID pay_id={payment.pay_id} dbt_date={payment.dbt_date} />
                      </span>
                    </Tooltip>
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 320 }}>
                    <ItemFetch paid_for={payment.paid_for} po_number={payment.po_number} vendor={payment.vendor} />
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 280 }}>
                    <MatchRow
                      approved={payment.approved}
                      timers={payment.timers}
                      amount_paid={payment.amount_paid}
                    />
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 120 }}>
                    <Tooltip title="Restore to Draft" arrow>
                      <span>
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="primary"
                          onClick={() => openRemarks(payment._id)}
                          disabled={isRestoring}
                        >
                          <RestoreFromTrashIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box component="td" colSpan={4} sx={{ p: 3, textAlign: "center" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <img src={NoData} alt="No data" style={{ width: 56, height: 56 }} />
                    <Typography fontStyle="italic">No trashes available</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Remarks dialog */}
      <Modal open={remarksOpen} onClose={closeRemarks}>
        <Sheet
          variant="outlined"
          sx={{
            mx: "auto",
            mt: "12vh",
            width: { xs: "92%", sm: 520 },
            borderRadius: "12px",
            p: 2.5,
            boxShadow: "lg",
            bgcolor: "background.body",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography level="title-lg">Restore to Draft</Typography>
            <IconButton variant="plain" size="sm" onClick={closeRemarks}>
              <CloseRounded />
            </IconButton>
          </Box>

          <Typography level="body-sm" sx={{ mb: 1 }}>
            Please add a short remark for restoring this request to <b>Draft</b>.
          </Typography>

          <Textarea
            minRows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., Wrongly trashed, moving back to Draft for corrections."
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={closeRemarks}>
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              loading={isRestoring}
              onClick={handleConfirmRestore}
              disabled={!remarks.trim()}
            >
              Restore
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </>
  );
});

export default TrashRequest;
