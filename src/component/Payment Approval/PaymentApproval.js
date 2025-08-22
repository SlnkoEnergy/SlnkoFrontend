import duration from "dayjs/plugin/duration";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../../assets/alert-bell.svg";
import { CircularProgress, Modal, Tooltip } from "@mui/joy";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import { useGetPaymentRecordQuery } from "../../redux/Accounts";
import dayjs from "dayjs";

const InstantRequest = forwardRef(
  ({ searchQuery, perPage, currentPage, status }, ref) => {
    const {
      data: responseData,
      isLoading,
      error,
    } = useGetPaymentRecordQuery({
      tab: "instant",
      search: searchQuery,
      pageSize: perPage,
      page: currentPage,
      status: status,
    });

    const paginatedData = responseData?.data || [];

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

    const MatchRow = ({ approval_status, timers, amount_paid, approved }) => {
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

      return (
        <Box mt={1}>
          {/* Amount */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
            <Typography sx={{ fontWeight: 500 }}>💰 Amount:</Typography>
            <Typography sx={{ fontSize: "14px" }}>
              {amount_paid || "—"}
            </Typography>
          </Box>

          {/* Payment Status */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Typography sx={{ fontWeight: 500 }}>📑 Payment Status:</Typography>
            {["Approved", "Pending", "Rejected", "Deleted"].includes(
              approved
            ) ? (
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
              <Typography>{approved || "Not Found"}</Typography>
            )}
          </Box>

          {/* Timer */}
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
                  "Payment Id",
                  "Paid_for",
                  "Payment Status",
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
                            p_id={payment.p_id}
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
                        p_id={payment.p_id}
                        vendor={payment.vendor}
                        customer_name={payment.customer_name}
                      />
                    </Box>
                    <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                      <MatchRow
                        approval_status={payment.approval_status}
                        approved={payment.approved}
                        timers={payment.timers}
                        amount_paid={payment.amount_paid}
                      />
                    </Box>

                    <Box component="td" sx={{ ...cellStyle, fontSize: 15 }}>
                      {payment.utr || "-"}
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
export default InstantRequest;
