import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../../assets/alert-bell.svg";
import {
  CircularProgress,
  Modal,
  Option,
  Select,
  Tooltip,
  useTheme,
} from "@mui/joy";
import { FileText } from "lucide-react";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import { useGetPaymentRecordQuery } from "../../redux/Accounts";
import dayjs from "dayjs";

const CreditRequest = forwardRef(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");

  const { data: responseData, isLoading } = useGetPaymentRecordQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
    status,
    tab: "credit",
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  const totalPages = Math.ceil(total / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

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
              <PaymentHistory />
            </PaymentProvider>
          </Sheet>
        </Modal>
      </>
    );
  };

  const MatchRow = ({ approved, remaining_days, amount_paid }) => {
    return (
      <Box mt={1}>
        {/* Amount */}
        <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
          <Typography sx={labelStyle}>💰 Amount:</Typography>
          <Typography sx={{ ...valueStyle, fontSize: "14px" }}>
            {amount_paid || "—"}
          </Typography>
        </Box>

        {/* Payment Status */}
        <Box display="flex" alignItems="flex-start" gap={1}>
          <Typography sx={labelStyle}>📑 Payment Status:</Typography>
          <Chip
            color={
              {
                Approved: "success",
                Pending: "neutral",
                Rejected: "danger",
                Deleted: "warning",
              }[approved] || "neutral"
            }
            variant="solid"
            size="sm"
          >
            {approved}
          </Chip>
        </Box>

        {/* Remaining Days */}
        <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
          <Typography sx={labelStyle}>⏰</Typography>
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
        </Box>
      </Box>
    );
  };

  // const renderFilters = () => {
  //   return (
  //     <Box
  //       sx={{
  //         position: "relative",
  //         display: "flex",
  //         alignItems: "center",
  //         gap: 1.5,
  //       }}
  //     >
  //       <FormControl size="sm" sx={{ minWidth: 150 }}>
  //         <FormLabel>Select Status</FormLabel>
  //         <Select
  //           value={status || ""}
  //           onChange={(e, newValue) => {
  //             setStatus(newValue);
  //             setCurrentPage(1);
  //           }}
  //           placeholder="All"
  //         >
  //           <Option value="">All</Option>
  //           <Option value="Approved">Approved</Option>
  //           <Option value="Pending">Pending</Option>
  //           <Option value="Rejected">Rejected</Option>
  //         </Select>
  //       </FormControl>
  //     </Box>
  //   );
  // };

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
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
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
                      approved={payment.approved}
                      amount_paid={payment.amount_paid}
                      remaining_days={payment.remaining_days}
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
});
export default CreditRequest;
