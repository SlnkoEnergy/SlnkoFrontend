import duration from "dayjs/plugin/duration";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import durationPlugin from "dayjs/plugin/duration";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { CircularProgress, Modal, Tooltip, Skeleton } from "@mui/joy";
import NoData from "../../assets/alert-bell.svg";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import { useGetPaymentRecordQuery } from "../../redux/Accounts";
import dayjs from "dayjs";

const InstantRequest = forwardRef(
  (
    { searchQuery, perPage, currentPage, status, onLoadMore, totalFromParent },
    ref
  ) => {
    dayjs.extend(duration);

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

    const glassSx = {
      width: "100%",
      height: 18,
      borderRadius: 8,
      backdropFilter: "blur(6px)",
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(0,0,0,0.08)",
    };

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
                sx={{ ...glassSx, height: 14, width: 120 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 14, width: 90 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
            <Skeleton variant="rectangular" sx={{ ...glassSx, height: 18 }} />
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 14, width: 160 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 14, width: 120 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 14, width: 100 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
            <Box display="flex" gap={1} alignItems="center">
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 22, width: 90 }}
              />
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 22, width: 120 }}
              />
            </Box>
            <Box mt={1}>
              <Skeleton
                variant="rectangular"
                sx={{ ...glassSx, height: 22, width: 140 }}
              />
            </Box>
          </Box>
          <Box component="td" sx={{ ...cellStyle, fontSize: 15 }}>
            <Skeleton
              variant="rectangular"
              sx={{ ...glassSx, height: 16, width: 120 }}
            />
          </Box>
        </Box>
      ));

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

    const PaymentID = ({ pay_id, dbt_date }) => (
      <>
        {pay_id && (
          <Box>
            <Chip
              variant="solid"
              color="primary"
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
              {pay_id || "N/A"}
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

    const ItemFetch = ({ paid_for, po_number, vendor }) => {
      const [open, setOpen] = useState(false);
      const handleOpen = () => setOpen(true);
      const handleClose = () => setOpen(false);

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
      approval_status,
      timers,
      amount_paid,
      approved,
      status_history = [],
    }) => {
      const [timeLeft, setTimeLeft] = useState("N/A");
      const [timerColor, setTimerColor] = useState("neutral");
      const stage = approval_status?.stage;

      // ------- countdown logic (unchanged) -------
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
            setTimeLeft("⏸ Frozen");
            setTimerColor("neutral");
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
            setTimeLeft("⏱ Expired");
            setTimerColor("danger");
          } else {
            const dur = dayjs.duration(diff);
            const hh = String(Math.floor(dur.asHours())).padStart(2, "0");
            const mm = String(dur.minutes()).padStart(2, "0");
            const ss = String(dur.seconds()).padStart(2, "0");
            setTimeLeft(`${hh}:${mm}:${ss} remaining`);

            const totalSecondsLeft = dur.asSeconds();
            if (totalSecondsLeft <= 3600) setTimerColor("danger");
            else if (totalSecondsLeft <= 7200) setTimerColor("warning");
            else setTimerColor("success");
          }
        }, 1000);

        return () => clearInterval(interval);
      }, [timers?.draft_started_at, timers?.draft_frozen_at, stage]);

      // ------- timeline (range) data -------
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
              const active = r.stage === stage;
              return (
                <Box
                  key={`${r.stage}-${i}`}
                  sx={{
                    width: `${Math.max(2, widthPct)}%`, // ensure thin ranges still visible
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
        <Box mt={1}>
          {/* Amount */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
            <Typography sx={{ fontWeight: 500 }}>💰 Amount:</Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {amount_paid || "—"}
            </Typography>
          </Box>

          {/* Payment status + tooltip timeline */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Typography sx={{ fontWeight: 500 }}>📑 Payment Status:</Typography>
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
                  <Typography>{approved || "Not Found"}</Typography>
                )}
              </span>
            </Tooltip>
          </Box>

          {/* Countdown */}
          <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
            <Typography sx={{ fontWeight: 500 }}>⏰</Typography>
            <Chip size="sm" variant="soft" color={timerColor}>
              {timeLeft}
            </Chip>
          </Box>
        </Box>
      );
    };

    return (
      <>
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
                {["Payment Id", "Paid_for", "Payment Status", "UTR"].map(
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
                        borderRadius: "8px",
                        boxShadow: "xs",
                        transition: "all 0.2s",
                        "&:hover": { backgroundColor: "neutral.softHoverBg" },
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          ...cellStyle,
                          minWidth: 280,
                          padding: "12px 16px",
                        }}
                      >
                        <Tooltip title="View Summary" arrow>
                          <span>
                            <PaymentID
                              pay_id={payment.pay_id}
                              dbt_date={payment.dbt_date}
                            />
                          </span>
                        </Tooltip>
                      </Box>

                      <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                        <ItemFetch
                          paid_for={payment.paid_for}
                          po_number={payment.po_number}
                          vendor={payment.vendor}
                        />
                      </Box>

                      <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                        <MatchRow
                          approval_status={payment.approval_status}
                          approved={payment.approved}
                          timers={payment.timers}
                          amount_paid={payment.amount_paid}
                          status_history={payment.status_history}
                        />
                      </Box>

                      <Box component="td" sx={{ ...cellStyle, fontSize: 15 }}>
                        {payment.utr || "-"}
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
                    sx={{ padding: "8px", textAlign: "center" }}
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
                        alt="No data"
                        style={{ width: 50, height: 50 }}
                      />
                      <Typography fontStyle="italic">
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
      </>
    );
  }
);

export default InstantRequest;
