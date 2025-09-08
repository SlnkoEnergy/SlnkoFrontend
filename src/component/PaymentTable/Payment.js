import duration from "dayjs/plugin/duration";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Launch from "@mui/icons-material/Launch";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";

import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import {
  CircularProgress,
  Modal,
  Tooltip,
  Skeleton,
  ModalClose,
  IconButton,
} from "@mui/joy";

import { forwardRef, useEffect, useMemo, useRef, useState, memo } from "react";
import NoData from "../../assets/alert-bell.svg";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import { useGetPaymentRecordQuery } from "../../redux/Accounts";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

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

const glassSx = {
  width: "100%",
  height: 16,
  borderRadius: 8,
  backdropFilter: "blur(4px)",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const formatINR = (value) => {
  if (value == null || value === "") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const InstantRequest = forwardRef(
  (
    { searchQuery, perPage, currentPage, status, onLoadMore, totalFromParent },
    ref
  ) => {
    dayjs.extend(duration);
    const navigate = useNavigate();

    const {
      data: responseData,
      isLoading,
      isFetching,
      error,
    } = useGetPaymentRecordQuery({
      tab: "instant",
      search: searchQuery,
      pageSize: perPage,
      page: currentPage,
      status: status,
    });

    const paginatedData = responseData?.data || [];
    const total =
      totalFromParent ?? responseData?.meta?.total ?? responseData?.total ?? 0;

    /** Skeleton rows */
    const renderGlassSkeletonRows = (count = Math.min(perPage || 10, 10)) =>
      Array.from({ length: count }).map((_, i) => (
        <Box
          key={`skeleton-row-${i}`}
          component="tr"
          sx={{
            backgroundColor: "background.surface",
            "&:hover": { backgroundColor: "neutral.softHoverBg" },
          }}
        >
          <Box component="td" sx={{ ...cellStyle, minWidth: 280 }}>
            <Skeleton variant="rectangular" sx={glassSx} />
            <Box mt={1} display="flex" gap={1}>
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 12, width: 120 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 12, width: 90 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, minWidth: 320 }}>
            <Skeleton variant="rectangular" sx={{ ...glassSx, height: 16 }} />
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 12, width: 160 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 12, width: 120 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 12, width: 100 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, minWidth: 320 }}>
            <Box display="flex" gap={1} alignItems="center">
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 20, width: 90 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 20, width: 120 }}
              />
            </Box>
            <Box mt={1}>
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 20, width: 140 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, textAlign: "right" }}>
            <Skeleton
              variant="rectangular"
              sx={{ ...glassSx, height: 12, width: 120, ml: "auto" }}
            />
          </Box>
        </Box>
      ));

    /** Infinite scroll */
    const scrollRef = useRef(null);
    const sentinelRef = useRef(null);
    const loadedCount = (currentPage || 1) * (perPage || 10);
    const hasMore = total > 0 ? loadedCount < total : true;

    useEffect(() => {
      if (!onLoadMore) return;
      const rootEl = scrollRef.current;
      const target = sentinelRef.current;
      if (!rootEl || !target) return;

      const io = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !isFetching && !isLoading) {
            onLoadMore();
          }
        },
        {
          root: rootEl,
          rootMargin: "600px 0px 600px 0px",
          threshold: 0.01,
        }
      );

      io.observe(target);
      return () => io.disconnect();
    }, [
      hasMore,
      isFetching,
      isLoading,
      onLoadMore,
      currentPage,
      perPage,
      total,
    ]);

    /** PaymentId (left column) */
    const PaymentID = ({ pay_id, dbt_date, p_id }) => (
      <>
        {pay_id && (
          <Chip
            variant="solid"
            color="primary"
            size="sm"
            sx={{
              fontWeight: 600,
              fontSize: 13,
              color: "#fff",
              letterSpacing: 0.2,
            }}
            onClick={() =>
                navigate(`/view_detail?page=${currentPage}&p_id=${p_id}`)
              }
          >
            {pay_id || "N/A"}
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
      approval_status,
      timers,
      amount_paid,
      approved,
      status_history = [],
    }) => {
      const [timeLeft, setTimeLeft] = useState("N/A");
      const [timerColor, setTimerColor] = useState("neutral");
      const stage = approval_status?.stage;

      useEffect(() => {
        if (!timers?.draft_started_at) {
          setTimeLeft("N/A");
          setTimerColor("neutral");
          return;
        }
        const isFinal =
          ["Approved", "Rejected", "Deleted"].includes(stage) ||
          !!timers?.draft_frozen_at;

        if (isFinal) {
          if (timers?.draft_frozen_at) {
            setTimeLeft("Frozen");
            setTimerColor("primary");
          } else {
            setTimeLeft("Finalized");
            setTimerColor("success");
          }
          return;
        }

        const interval = setInterval(() => {
          const startedAt = dayjs(timers.draft_started_at);
          const now = dayjs();
          const endTime = startedAt.add(48, "hour");
          const diff = endTime.diff(now);

          if (diff <= 0) {
            setTimeLeft("Hold");
            setTimerColor("danger");
          } else {
            const dur = dayjs.duration(diff);
            const hh = String(Math.floor(dur.asHours())).padStart(2, "0");
            const mm = String(dur.minutes()).padStart(2, "0");
            const ss = String(dur.seconds()).padStart(2, "0");
            setTimeLeft(`${hh}:${mm}:${ss}`);
            const totalSecondsLeft = dur.asSeconds();
            if (totalSecondsLeft <= 3600) setTimerColor("danger");
            else if (totalSecondsLeft <= 7200) setTimerColor("warning");
            else setTimerColor("success");
          }
        }, 1000);

        return () => clearInterval(interval);
      }, [timers?.draft_started_at, timers?.draft_frozen_at, stage]);

      const now = useMemo(() => new Date(), []);
      const ranges = useMemo(
        () => buildRanges(status_history, now),
        [status_history, now]
      );
      const totalMs = useMemo(
        () => ranges.reduce((sum, r) => sum + r.ms, 0),
        [ranges]
      );

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
              const active = r.stage === stage;
              return (
                <Box
                  key={`${r.stage}-${i}`}
                  sx={{
                    width: `${Math.max(2, widthPct)}%`,
                    background: active
                      ? "var(--joy-palette-primary-solidBg)"
                      : colorPool[i % colorPool.length],
                    opacity: active ? 1 : 0.9,
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
              const active = r.stage === stage;
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

      const chipColor =
        {
          Approved: "success",
          Pending: "neutral",
          Rejected: "danger",
          Deleted: "warning",
        }[approved] || "neutral";

      const chipIcon =
        {
          Approved: <CheckIcon fontSize="small" />,
          Pending: <AutorenewIcon fontSize="small" />,
          Rejected: <BlockIcon fontSize="small" />,
          Deleted: <DeleteIcon fontSize="small" />,
        }[approved] || null;

      return (
        <Box>
          {/* Amount */}
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

          {/* Payment status + tooltip timeline */}
          <InfoRow
            icon={
              <ReceiptLongOutlined
                sx={{ fontSize: 16, color: "text.tertiary" }}
              />
            }
            label="Payment Status"
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
                {["Approved", "Pending", "Rejected", "Deleted"].includes(
                  approved
                ) ? (
                  <Chip
                    color={chipColor}
                    variant="solid"
                    size="sm"
                    startDecorator={chipIcon}
                    sx={{ cursor: ranges.length ? "help" : "default" }}
                  >
                    {approved}
                  </Chip>
                ) : (
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    {approved || "Not Found"}
                  </Typography>
                )}
              </span>
            </Tooltip>
          </InfoRow>

          {/* Countdown */}
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
            <Chip size="sm" variant="soft" color={timerColor}>
              {timeLeft}
            </Chip>
          </InfoRow>
        </Box>
      );
    };

    /** Main render */
    return (
      <Box
        ref={scrollRef}
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
              {["Payment Id", "Paid For", "Payment Status", "UTR"].map(
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
            ) : isLoading && paginatedData.length === 0 ? (
              renderGlassSkeletonRows(perPage || 10)
            ) : paginatedData.length > 0 ? (
              <>
                {paginatedData.map((payment, index) => (
                  <Box
                    component="tr"
                    key={`${payment.pay_id || index}`}
                    sx={{
                      backgroundColor: "background.surface",
                      transition: "all 0.18s ease",
                      "&:hover": { backgroundColor: "neutral.softHoverBg" },

                      "&:hover td:first-of-type": {
                        boxShadow:
                          "inset 3px 0 0 var(--joy-palette-primary-400)",
                      },
                    }}
                  >
                    <Box component="td" sx={{ ...cellStyle, minWidth: 280 }}>
                      <span>
                        <PaymentID
                          pay_id={payment.pay_id}
                          dbt_date={payment.dbt_date}
                          p_id={payment.p_id}
                        />
                      </span>
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
                        approval_status={payment.approval_status}
                        approved={payment.approved}
                        timers={payment.timers}
                        amount_paid={payment.amount_paid}
                        status_history={payment.status_history}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        fontSize: 14,
                        textAlign: "right",
                        color: "text.primary",
                      }}
                    >
                      {payment.utr || "—"}
                    </Box>
                  </Box>
                ))}

                {isFetching &&
                  renderGlassSkeletonRows(Math.min(6, perPage || 10))}
              </>
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
                      justifyContent: "center",
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

        <Box ref={sentinelRef} sx={{ height: 12 }} />

        {isFetching && paginatedData.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <CircularProgress size="sm" />
          </Box>
        )}
      </Box>
    );
  }
);

export default InstantRequest;
