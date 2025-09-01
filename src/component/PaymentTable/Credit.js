import duration from "dayjs/plugin/duration";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import durationPlugin from "dayjs/plugin/duration";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useMemo, useState } from "react";
import NoData from "../../assets/alert-bell.svg";
import {
  CircularProgress,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Textarea,
  Tooltip,
  useTheme,
} from "@mui/joy";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import {
  useGetPaymentRecordQuery,
  useUpdateRequestExtensionMutation,
} from "../../redux/Accounts";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const CreditRequest = forwardRef(
  ({ searchQuery, perPage, currentPage, status }, ref) => {
    const {
      data: responseData,
      isLoading,
      refetch,
      error,
    } = useGetPaymentRecordQuery({
      tab: "credit",
      search: searchQuery,
      pageSize: perPage,
      page: currentPage,
      status: status,
    });

    const paginatedData = responseData?.data || [];

    const [user, setUser] = useState(null);

    useEffect(() => {
      const userData = getUserData();
      setUser(userData);
    }, []);

    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    };

    // const [updateCreditExtension] = useUpdateCreditExtensionMutation();

    const headerStyle = {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: "primary.softBg",
      fontSize: 14,
      fontWeight: 600,
      padding: "12px 16px",
      textAlign: "left",
      color: "#000",
      borderBottom: "1px soft",
      borderColor: "primary.softBorder",
    };

    const cellStyle = {
      padding: "12px 16px",
      verticalAlign: "top",
      fontSize: 13,
      fontWeight: 400,
      borderBottom: "1px solid",
      borderColor: "divider",
    };

    const labelStyle = {
      fontSize: 13,
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

    dayjs.extend(duration);

    const PaymentID = ({ cr_id, dbt_date, approved }) => {
      const maskCrId = (id) => {
        if (!id) return "N/A";
        if (approved === "Approved") return id;

        const parts = id.split("/");
        const lastIndex = parts.length - 2;

        if (!isNaN(parts[lastIndex])) {
          parts[lastIndex] = parts[lastIndex].replace(/\d{2}$/, "XX");
        }

        return parts.join("/");
      };

      return (
        <>
          {cr_id && (
            <Box>
              <Chip
                variant="solid"
                color={approved === "Approved" ? "success" : "neutral"}
                size="sm"
                sx={{
                  fontWeight: 500,
                  fontFamily: "Inter, Roboto, sans-serif",
                  fontSize: 14,
                  color: "#fff",
                  "&:hover": {
                    boxShadow: "md",
                    opacity: 0.9,
                  },
                }}
              >
                {maskCrId(cr_id)}
              </Chip>
            </Box>
          )}

          {dbt_date && (
            <Box display="flex" alignItems="center" mt={0.5} gap={0.8}>
              <Typography sx={labelStyle}>📅 Created Date:</Typography>
              <Typography sx={valueStyle}>
                {dayjs(dbt_date).format("DD-MM-YYYY")}
              </Typography>
            </Box>
          )}
        </>
      );
    };

    const ItemFetch = ({ paid_for, po_number, vendor }) => {
      const [open, setOpen] = useState(false);

      const handleOpen = () => setOpen(true);
      const handleClose = () => setOpen(false);

      // console.log(po_number);

      return (
        <>
          {paid_for && (
            <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
              <Typography sx={{ ...labelStyle, minWidth: 100 }}>
                📦 Requested For:
              </Typography>
              <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
                {paid_for}
              </Typography>
            </Box>
          )}

          {po_number && (
            <Box
              display="flex"
              alignItems="flex-start"
              gap={1}
              mt={0.5}
              sx={{ cursor: "pointer" }}
              onClick={handleOpen}
            >
              <Typography sx={{ ...labelStyle, minWidth: 100 }}>
                🧾 PO Number:
              </Typography>
              <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
                {po_number}
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
            <Typography sx={{ ...labelStyle, minWidth: 70 }}>
              🏢 Vendor:
            </Typography>
            <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
              {vendor}
            </Typography>
          </Box>

          <Modal open={open} onClose={handleClose}>
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
                backgroundColor: "#fff",
                minWidth: 950,
              }}
            >
              <PaymentProvider po_number={po_number}>
                <PaymentHistory po_number={po_number} />
              </PaymentProvider>
            </Sheet>
          </Modal>
        </>
      );
    };

    dayjs.extend(durationPlugin);

    function fmtDur(ms) {
      if (ms <= 0) return "0s";
      const d = dayjs.duration(ms);
      const parts = [];
      const days = Math.floor(d.asDays());
      const hrs = d.hours();
      const mins = d.minutes();
      if (days) parts.push(`${days}d`);
      if (hrs) parts.push(`${hrs}h`);
      if (mins || parts.length === 0) parts.push(`${mins}m`);
      return parts.join(" ");
    }

    function buildRanges(status_history = [], now = new Date()) {
      const items = [...status_history]
        .filter((x) => x?.timestamp)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const ranges = [];
      for (let i = 0; i < items.length; i++) {
        const cur = items[i];
        const next = items[i + 1];
        const start = new Date(cur.timestamp);
        const end = next ? new Date(next.timestamp) : now;
        const ms = Math.max(0, end - start);
        ranges.push({
          stage: cur.stage || "-",
          start,
          end,
          ms,
          remarks: cur.remarks || "",
          user_id: cur.user_id || null,
        });
      }
      return ranges;
    }

    const colorPool = [
      "#94a3b8",
      "#38bdf8",
      "#34d399",
      "#f59e0b",
      "#f472b6",
      "#60a5fa",
      "#f87171",
    ];

    const MatchRow = ({
      _id,
      approved,
      remaining_days,
      timers,
      amount_paid,
      credit,
      status_history = [],
      user,
    }) => {

       const formatINR = (value) => {
        if (value == null || value === "") return "—";
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      };

      const currentStage = useMemo(() => {
        const last =
          Array.isArray(status_history) && status_history.length
            ? status_history[status_history.length - 1]
            : null;

        if (timers?.draft_frozen_at) return "Frozen";

        return last?.stage || "-";
      }, [status_history, timers?.draft_frozen_at]);

      const now = useMemo(() => new Date(), []);
      const ranges = useMemo(
        () => buildRanges(status_history, now),
        [status_history, now]
      );
      const totalMs = useMemo(
        () => ranges.reduce((s, r) => s + r.ms, 0),
        [ranges]
      );

      const [updateCreditExtension, { isLoading }] =
        useUpdateRequestExtensionMutation();

      const [requested, setRequested] = useState(!!credit?.credit_extension);
      const [open, setOpen] = useState(false);
      const [remarks, setRemarks] = useState("");

      const handleRequestExtension = async () => {
        if (!remarks.trim()) {
          toast.error("Remarks are required");
          return;
        }
        try {
          await updateCreditExtension({
            id: _id,
            credit_remarks: remarks,
          }).unwrap();
          toast.success("Credit extension requested successfully");
          setRequested(true);
          setOpen(false);
        } catch (err) {
          console.error("Failed to request extension", err);
          toast.error("Failed to request credit extension");
        }
      };

      const chipColor =
        {
          Approved: "success",
          Pending: "neutral",
          Rejected: "danger",
          Deleted: "warning",
        }[approved] || "neutral";

      const tooltipContent = (
        <Box sx={{ p: 1, maxWidth: 380 }}>
          <Typography level="title-sm" sx={{ mb: 0.5 }}>
            Stage timeline
          </Typography>

          <Box
            sx={{
              display: "flex",
              width: "100%",
              height: 10,
              borderRadius: 999,
              overflow: "hidden",
              mb: 1,
              border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
            }}
          >
            {ranges.map((r, i) => {
              const widthPct = totalMs ? (r.ms / totalMs) * 100 : 0;
              const active = r.stage === currentStage;
              return (
                <Box
                  key={`${r.stage}-${i}`}
                  sx={{
                    width: `${Math.max(2, widthPct)}%`,
                    background: active
                      ? "var(--joy-palette-primary-solidBg)"
                      : colorPool[i % colorPool.length],
                    opacity: active ? 1 : 0.85,
                    outline: active
                      ? "2px solid var(--joy-palette-primary-700)"
                      : "none",
                  }}
                  title={`${r.stage}: ${fmtDur(r.ms)}`}
                />
              );
            })}
          </Box>

          {/* Rows */}
          <Box sx={{ display: "grid", rowGap: 0.5 }}>
            {ranges.map((r, i) => {
              const active = r.stage === currentStage;
              return (
                <Box
                  key={`row-${r.stage}-${i}`}
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    gap: 1,
                    p: 0.5,
                    borderRadius: 8,
                    backgroundColor: active
                      ? "var(--joy-palette-primary-softBg)"
                      : "transparent",
                  }}
                >
                  <Box
                    sx={{
                      mt: "3px",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: active
                        ? "var(--joy-palette-primary-solidBg)"
                        : colorPool[i % colorPool.length],
                      flex: "0 0 auto",
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      level="body-sm"
                      sx={{ fontWeight: active ? 700 : 500, lineHeight: 1.2 }}
                    >
                      {r.stage} {active && "• current"}
                    </Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.9 }}>
                      {dayjs(r.start).format("DD MMM YYYY, HH:mm")} →{" "}
                      {dayjs(r.end).format("DD MMM YYYY, HH:mm")} (
                      {fmtDur(r.ms)})
                    </Typography>
                    {r.remarks ? (
                      <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                        Remarks: {r.remarks}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );

      return (
        <Box mt={1}>
          {/* Amount */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
            <Typography sx={{ fontWeight: 500 }}>💰 Amount:</Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {formatINR(amount_paid)}
            </Typography>
          </Box>

          {/* Payment Status + hover timeline */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Typography sx={labelStyle}>📑 Payment Status:</Typography>
            <Tooltip
              title={ranges.length ? tooltipContent : "No stage history"}
              variant="soft"
              placement="top-start"
              sx={{ "--Tooltip-radius": "12px", "--Tooltip-offset": "6px" }}
            >
              <span>
                <Chip
                  color={chipColor}
                  variant="solid"
                  size="sm"
                  sx={{ cursor: ranges.length ? "help" : "default" }}
                >
                  {approved || "Not Found"}
                </Chip>
              </span>
            </Tooltip>
          </Box>

          {/* Countdown / Remaining */}
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography sx={labelStyle}>⏰</Typography>

            {timers?.draft_frozen_at ? (
              <Chip size="sm" variant="soft" color="primary">
                ⏸ Frozen
              </Chip>
            ) : (
              <Chip
                size="sm"
                variant="soft"
                color={
                  remaining_days <= 0
                    ? "danger"
                    : remaining_days <= 2
                      ? "warning"
                      : "success"
                }
              >
                {remaining_days <= 0
                  ? "⏱ Expired"
                  : `${remaining_days} day${remaining_days > 1 ? "s" : ""} remaining`}
              </Chip>
            )}

            {/* Request Extension flow (kept as-is, with a small guard) */}
            {user?.department === "SCM" &&
              credit?.credit_extension === false &&
              remaining_days > 0 &&
              approved !== "Approved" &&
              approved !== "Rejected" &&
              !timers?.draft_frozen_at &&
              (requested ? (
                <Chip
                  size="sm"
                  variant="solid"
                  color="success"
                  startDecorator={<CheckRoundedIcon fontSize="sm" />}
                  disabled
                >
                  Requested
                </Chip>
              ) : isLoading ? (
                <Chip size="sm" variant="soft" color="neutral" disabled>
                  <HourglassTopRoundedIcon
                    fontSize="sm"
                    style={{ marginRight: 6 }}
                  />
                  Requesting…
                </Chip>
              ) : (
                <Chip
                  size="sm"
                  variant="solid"
                  color="danger"
                  onClick={() => setOpen(true)}
                  sx={{ cursor: "pointer" }}
                >
                  Request Extension
                </Chip>
              ))}
          </Box>

          {/* Remarks Dialog */}
          <Modal open={open} onClose={() => setOpen(false)}>
            <ModalOverflow>
              <ModalDialog variant="outlined" role="alertdialog">
                <ModalClose />
                <Typography level="h5" mb={1}>
                  Request Credit Extension
                </Typography>
                <Textarea
                  placeholder="Enter remarks"
                  minRows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button variant="plain" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    color="danger"
                    onClick={handleRequestExtension}
                    loading={isLoading}
                  >
                    Submit
                  </Button>
                </Box>
              </ModalDialog>
            </ModalOverflow>
          </Modal>
        </Box>
      );
    };

    const UtrCell = ({ payment, user }) => {
      const department = user?.department;
      const role = user?.role;

      const createdUtr = payment?.utr_history?.find(
        (h) => h.status === "Created"
      )?.utr;

      const displayUtr = payment?.utr ? payment.utr : createdUtr || "-";

      const historyContent = payment?.utr_history?.length ? (
        <Box>
          <Typography
            level="body-sm"
            fontWeight={600}
            mb={0.5}
            sx={{ color: "#fff", textDecoration: "underline" }}
          >
            UTR History
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "1rem", color: "#fff" }}>
            {payment.utr_history.map((h, idx) => (
              <li key={idx}>
                <Typography level="body-sm" sx={{ color: "#fff" }}>
                  {h.utr}{" "}
                  <span style={{ color: "#fff", fontSize: 12 }}>
                    ({h.status})
                  </span>
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      ) : (
        "No UTR history"
      );

      const content = (
        <span style={{ fontSize: 15, fontWeight: 600 }}>{displayUtr}</span>
      );

      return (
        <Box>
          {((department === "SCM" || department === "Accounts") && role === "manager") ||
          department === "admin" ||
          department === "superadmin" ? (
            <Tooltip title={historyContent} arrow placement="top">
              <span>{content}</span>
            </Tooltip>
          ) : (
            content
          )}
        </Box>
      );
    };

    return (
      <>
        {/* Table */}
        <Box
          sx={{
            maxWidth: "100%",
            overflowY: "auto",
            maxHeight: "600px",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.body",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f0f0f0",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#1976d2",
              borderRadius: "8px",
            },
          }}
        >
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <Box component="thead">
              <Box component="tr">
                {/* <Box component="th" sx={headerStyle}>
                <Checkbox
                  size="sm"
                  checked={selected.length === paginatedData.length}
                  onChange={handleSelectAll}
                />
              </Box> */}
                {[
                  "Credit Id",
                  "Paid_for",
                  "Credit Status",
                  "UTR",
                  // "",
                ].map((header, index) => (
                  <Box key={index} component="th" sx={headerStyle}>
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {error ? (
                <Typography color="danger" textAlign="center">
                  {error}
                </Typography>
              ) : isLoading ? (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={5}
                    sx={{
                      py: 2,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <CircularProgress
                        size="sm"
                        sx={{ color: "primary.500" }}
                      />
                      <Typography fontStyle="italic">
                        Loading payments… please hang tight ⏳
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((payment, index) => (
                  <Box
                    component="tr"
                    key={index}
                    sx={{
                      backgroundColor: "background.surface",
                      borderRadius: "8px",
                      boxShadow: "xs",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "neutral.softHoverBg",
                      },
                    }}
                  >
                    {/* <Box component="td" sx={cellStyle}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(payment.pay_id)}
                      onChange={(event) =>
                        handleRowSelect(payment.pay_id, event.target.checked)
                      }
                    />
                  </Box> */}
                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        minWidth: 280,
                        padding: "12px 16px",
                      }}
                    >
                      {/* {payment.pay_id} */}
                      <Tooltip title="View Summary" arrow>
                        <span>
                          <PaymentID
                            currentPage={currentPage}
                            p_id={payment.p_id}
                            cr_id={payment.cr_id}
                            dbt_date={payment.dbt_date}
                            approved={payment?.approved}
                          />
                        </span>
                      </Tooltip>
                    </Box>

                    <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                      <ItemFetch
                        paid_for={payment.paid_for}
                        po_number={payment.po_number}
                        p_id={payment.p_id}
                        vendor={payment.vendor}
                        customer_name={payment.customer_name}
                      />
                    </Box>
                    <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                      <MatchRow
                        _id={payment._id}
                        approved={payment.approved}
                        amount_paid={payment.amount_paid}
                        remaining_days={payment.remaining_days}
                        credit={payment.credit}
                        timers={payment.timers}
                        status_history={
                          payment.status_history ||
                          payment.approval_status?.status_history ||
                          []
                        }
                      />
                    </Box>

                    <Box component="td" sx={{ ...cellStyle, fontSize: 15 }}>
                      <UtrCell payment={payment} user={user} />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={6}
                    sx={{
                      padding: "8px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    <Box
                      sx={{
                        fontStyle: "italic",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={NoData}
                        alt="No data Image"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <Typography fontStyle={"italic"}>
                        No records available
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);
export default CreditRequest;