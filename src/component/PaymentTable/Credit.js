import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import {
  CircularProgress,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Textarea,
  Tooltip,
  IconButton,
} from "@mui/joy";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Launch from "@mui/icons-material/Launch";

import { forwardRef, useEffect, useMemo, useState, memo } from "react";
import NoData from "../../assets/alert-bell.svg";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import {
  useGetPaymentRecordQuery,
  useUpdateRequestExtensionMutation,
} from "../../redux/Accounts";
import { toast } from "react-toastify";

dayjs.extend(duration);

const formatINR = (value) => {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Label = ({ icon, text, minW = 120 }) => (
  <Box
    display="flex"
    alignItems="center"
    gap={0.75}
    sx={{ minWidth: { xs: 96, sm: minW } }}
  >
    {icon}
    <Typography
      level="body-sm"
      sx={{ fontWeight: 600, color: "text.tertiary" }}
    >
      {text}
    </Typography>
  </Box>
);

const TruncatedText = memo(function TruncatedText({
  text,
  lines = 1,
  sx = {},
  tooltipPlacement = "top",
}) {
  if (!text)
    return (
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        —
      </Typography>
    );
  return (
    <Tooltip title={text} placement={tooltipPlacement} variant="soft">
      <Typography
        level="body-sm"
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-word",
          lineHeight: 1.45,
          color: "text.primary",
          ...sx,
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
});

const InfoRow = ({ icon, label, children, minLabelWidth = 120, mt = 0.25 }) => (
  <Box display="flex" alignItems="flex-start" gap={1.25} mt={mt}>
    <Label icon={icon} text={label} minW={minLabelWidth} />
    <Box flex={1} minWidth={0}>
      {children}
    </Box>
  </Box>
);

const CreditRequest = forwardRef(
  ({ searchQuery, perPage, currentPage, status }, ref) => {
    const {
      data: responseData,
      isLoading,
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
      try {
        const str = localStorage.getItem("userDetails");
        if (str) setUser(JSON.parse(str));
      } catch {}
    }, []);

    /* styles */
    const headerStyle = {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: "neutral.softBg",
      fontSize: 12,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      fontWeight: 700,
      padding: "10px 14px",
      textAlign: "left",
      color: "text.secondary",
      borderBottom: "1px solid",
      borderColor: "divider",
    };

    const cellStyle = {
      padding: "14px 16px",
      verticalAlign: "top",
      fontSize: 13,
      fontWeight: 400,
      borderBottom: "1px solid",
      borderColor: "divider",
    };

    /* left column: Credit Id + Created Date */
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
            <Chip
              variant="solid"
              color={approved === "Approved" ? "success" : "neutral"}
              size="sm"
              sx={{
                fontWeight: 600,
                fontSize: 13,
                color: "#fff",
                letterSpacing: 0.2,
              }}
            >
              {maskCrId(cr_id)}
            </Chip>
          )}

          {dbt_date && (
            <InfoRow
              icon={
                <CalendarMonthOutlined
                  sx={{ fontSize: 16, color: "text.tertiary" }}
                />
              }
              label="Created Date"
              minLabelWidth={110}
              mt={0.75}
            >
              <Typography level="body-sm" sx={{ color: "text.primary" }}>
                {dayjs(dbt_date).format("DD-MM-YYYY")}
              </Typography>
            </InfoRow>
          )}
        </>
      );
    };

    const ItemFetch = ({ paid_for, po_number, vendor }) => {
      const [open, setOpen] = useState(false);
      const handleOpen = () => setOpen(true);
      const handleClose = () => setOpen(false);

      const copy = async (val) => {
        if (!val) return;
        try {
          await navigator.clipboard.writeText(val);
        } catch {}
      };

      return (
        <>
          <InfoRow
            icon={
              <DescriptionOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="Requested For"
            minLabelWidth={120}
          >
            <Tooltip title={paid_for} placement="top" variant="soft">
              <Typography
                level="body-sm"
                sx={{
                  maxWidth: 460,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "text.primary",
                }}
              >
                {paid_for || "—"}
              </Typography>
            </Tooltip>
          </InfoRow>

          <InfoRow
            icon={
              <ReceiptLongOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="PO Number"
            minLabelWidth={120}
          >
            {po_number ? (
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ minWidth: 0, flexWrap: "wrap" }}
              >
                <Tooltip
                  title="View payment history"
                  variant="soft"
                  placement="top"
                >
                  <Chip
                    onClick={handleOpen}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && handleOpen()
                    }
                    tabIndex={0}
                    variant="soft"
                    size="sm"
                    sx={{
                      cursor: "pointer",
                      userSelect: "none",
                      maxWidth: "100%",
                    }}
                    endDecorator={<Launch fontSize="small" />}
                  >
                    <Typography
                      sx={{
                        maxWidth: 360,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "text.primary",
                      }}
                      title={po_number}
                    >
                      {po_number}
                    </Typography>
                  </Chip>
                </Tooltip>

                <Tooltip title="Copy PO number" variant="soft" placement="top">
                  <IconButton
                    size="sm"
                    variant="outlined"
                    onClick={() => copy(po_number)}
                    aria-label="Copy PO number"
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                N/A
              </Typography>
            )}
          </InfoRow>

          <InfoRow
            icon={
              <StorefrontOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="Vendor"
            minLabelWidth={120}
          >
            <TruncatedText text={vendor || "—"} lines={1} />
          </InfoRow>

          <Modal open={open} onClose={handleClose}>
            <Sheet
              variant="outlined"
              sx={{
                mx: "auto",
                mt: { xs: "8vh", md: "10vh" },
                width: { xs: "94%", sm: 720, md: 960 },
                borderRadius: "12px",
                p: 2.5,
                boxShadow: "lg",
                maxHeight: "80vh",
                overflow: "auto",
                bgcolor: "#fff",
              }}
            >
              <ModalClose />
              <PaymentProvider po_number={po_number}>
                <PaymentHistory po_number={po_number} />
              </PaymentProvider>
            </Sheet>
          </Modal>
        </>
      );
    };

    /* timeline utils */
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

    /* middle-right: amount + status + remaining/request */
    const MatchRow = ({
      _id,
      approved,
      remaining_days,
      timers,
      amount_paid,
      credit,
      status_history = [],
    }) => {
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

      const [updateCreditExtension, { isLoading: isReqLoading }] =
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

          {/* Segmented range bar */}
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

          {/* Per-stage rows */}
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
        <Box>
          <InfoRow
            icon={
              <PaymentsOutlined sx={{ fontSize: 16, color: "text.tertiary" }} />
            }
            label="Amount"
            minLabelWidth={110}
            mt={0}
          >
            <Typography level="body-sm" sx={{ color: "text.primary" }}>
              {formatINR(amount_paid)}
            </Typography>
          </InfoRow>

          <InfoRow
            icon={
              <ReceiptLongOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="Credit Status"
            minLabelWidth={110}
            mt={0.5}
          >
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
          </InfoRow>

          <InfoRow
            icon={
              <AccessTimeOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="Timer"
            minLabelWidth={110}
            mt={0.5}
          >
            {timers?.draft_frozen_at ? (
              <Chip size="sm" variant="soft" color="primary">
                Frozen
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
                  ? "Expired"
                  : `${remaining_days} day${remaining_days > 1 ? "s" : ""}`}
              </Chip>
            )}

            {/* Request Extension */}
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
                  sx={{ ml: 1 }}
                >
                  Requested
                </Chip>
              ) : isReqLoading ? (
                <Chip
                  size="sm"
                  variant="soft"
                  color="neutral"
                  disabled
                  sx={{ ml: 1 }}
                >
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
                  sx={{ ml: 1, cursor: "pointer" }}
                >
                  Request Extension
                </Chip>
              ))}

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
                      loading={isReqLoading}
                    >
                      Submit
                    </Button>
                  </Box>
                </ModalDialog>
              </ModalOverflow>
            </Modal>
          </InfoRow>
        </Box>
      );
    };

    /* UTR cell with role-based tooltip */
    const UtrCell = ({ payment, user }) => {
      const department = user?.department;
      const role = user?.role;

      const createdUtr = payment?.utr_history?.find(
        (h) => h.status === "Created"
      )?.utr;
      const displayUtr = payment?.utr ? payment.utr : createdUtr || "—";

      const historyContent = payment?.utr_history?.length ? (
        <Box>
          <Typography level="body-sm" fontWeight={600} mb={0.5}>
            UTR History
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {payment.utr_history.map((h, idx) => (
              <li key={idx}>
                <Typography level="body-sm">
                  {h.utr} <span style={{ fontSize: 12 }}>({h.status})</span>
                </Typography>
              </li>
            ))}
          </ul>
        </Box>
      ) : (
        "No UTR history"
      );

      const content = (
        <Typography
          level="body-sm"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {displayUtr}
        </Typography>
      );

      const canSeeTooltip =
        ((department === "SCM" || department === "Accounts") &&
          role === "manager") ||
        department === "admin" ||
        department === "superadmin";

      return canSeeTooltip ? (
        <Tooltip title={historyContent} arrow placement="top">
          <span>{content}</span>
        </Tooltip>
      ) : (
        content
      );
    };

    /* ---------- render ---------- */
    return (
      <Box
        sx={{
          maxWidth: "100%",
          overflowY: "auto",
          maxHeight: "600px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.body",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            background: "#f6f6f7",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--joy-palette-neutral-400)",
            borderRadius: "8px",
          },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
        >
          <Box component="thead">
            <Box component="tr">
              {["Credit Id", "Paid For", "Credit Status", "UTR"].map(
                (header, index) => (
                  <Box key={index} component="th" sx={headerStyle}>
                    {header}
                  </Box>
                )
              )}
            </Box>
          </Box>

          <Box component="tbody">
            {error ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={5}
                  sx={{ py: 2, textAlign: "center" }}
                >
                  <Typography color="danger">
                    {String(error?.data?.message || error)}
                  </Typography>
                </Box>
              </Box>
            ) : isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={5}
                  sx={{ py: 2, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      Loading credit requests…
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
                    transition: "all 0.18s ease",
                    "&:hover": { backgroundColor: "neutral.softHoverBg" },
                    "&:hover td:first-of-type": {
                      boxShadow: "inset 3px 0 0 var(--joy-palette-primary-400)",
                    },
                  }}
                >
                  <Box component="td" sx={{ ...cellStyle, minWidth: 280 }}>
                    <Tooltip title="View Summary" arrow>
                      <span>
                        <PaymentID
                          cr_id={payment.cr_id}
                          dbt_date={payment.dbt_date}
                          approved={payment?.approved}
                        />
                      </span>
                    </Tooltip>
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 320 }}>
                    <ItemFetch
                      paid_for={payment.paid_for}
                      po_number={payment.po_number}
                      vendor={payment.vendor}
                    />
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 320 }}>
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

                  <Box
                    component="td"
                    sx={{ ...cellStyle, fontSize: 14, color: "text.primary" }}
                  >
                    <UtrCell payment={payment} user={user} />
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={6}
                  sx={{ padding: "16px", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{ width: 52, height: 52, opacity: 0.8 }}
                    />
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      No records available
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default CreditRequest;
