import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import Axios from "../utils/Axios";
import { Modal, Tooltip, useTheme } from "@mui/joy";
import { FileText } from "lucide-react";
import { PaymentProvider } from "../store/Context/Payment_History";
import PaymentHistory from "./PaymentHistory";
// import { useGetPaymentsQuery } from "../redux/paymentsSlice";
// import { useGetProjectsQuery } from "../redux/projectsSlice";

const PaymentRequest = forwardRef((props, ref) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  // const [mergedData, setMergedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // const [totalItems, setTotalItems] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const [totalCount, setTotalCount] = useState(10);

  const fetchTableData = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const config = { headers: { "x-auth-token": token } };

      const params = new URLSearchParams();
      params.append("page", page);
      if (searchQuery) {
        params.append("query", searchQuery);
      }

      const response = await Axios.get(
        `/get-pay-sumrY-IT?${params.toString()}`,
        config
      );

      const { data, meta } = response.data;

      setPayments(data);
      setTotalCount(meta?.total || 0);
      setItemsPerPage(meta?.count || 10);

      const uniqueStatuses = [
        ...new Set(data.map((payment) => payment.approved)),
      ].filter(Boolean);
      setStatuses(uniqueStatuses);
    } catch (err) {
      console.error("API Error:", err);
      setError(
        <span style={{ color: "red", textAlign: "center" }}>
          <PermScanWifiIcon />
          <Typography
            fontStyle="italic"
            fontWeight="600"
            sx={{ color: "#0a6bcc" }}
          >
            Hang tight! Internet Connection will be back soon..
          </Typography>
        </span>
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateFilter}
          style={{ width: "200px" }}
        />
      </FormControl>
    </>
  );

  const PaymentID = ({ currentPage, pay_id, p_id }) => {
    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            const page = currentPage;
            const payId = String(pay_id);
            const projectID = Number(p_id);
            localStorage.setItem("pay_summary", payId);
            localStorage.setItem("p_id", projectID);
            navigate(`/pay_summary?page=${page}&pay_id=${payId}`);
          }}
        >
          {pay_id}
        </span>
      </>
    );
  };

  const ItemFetch = ({ paid_for, po_number }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // console.log(po_number);

    return (
      <>
        {paid_for && (
          <Box>
            <span style={{ cursor: "pointer", fontWeight: 400 }}>
              {paid_for}
            </span>
          </Box>
        )}

        {po_number && (
          <Box
            display="flex"
            alignItems="center"
            mt={0.5}
            sx={{ cursor: "pointer" }}
            onClick={handleOpen}
          >
            <FileText size={12} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>PO Number: </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {po_number}
            </Typography>
          </Box>
        )}

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
              minWidth:950
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

  const handleRowSelect = (id, isSelected) => {
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
  };

  // const [FilteredData, setFilteredData] = useState([]);

  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    setSearchQuery(lowerCaseQuery);
    setSearchParams({ page: "1" });
  };

  // const applyFilters = (query = searchQuery, dateValue = selectedDate) => {
  //   const filtered = payments
  //     .filter((payment) => {
  //       const matchesSearchQuery = [
  //         "pay_id",
  //         "vendor",
  //         "approved",
  //         "projectCustomer",
  //         "paid_for",
  //       ].some((key) => payment[key]?.toLowerCase().includes(query));
  //       return matchesSearchQuery;
  //     })
  //     .filter((item) => {
  //       const matchesDate = dateValue
  //         ? new Date(item.dbt_date).toISOString().split("T")[0] === dateValue
  //         : true;
  //       return matchesDate;
  //     });

  //   setFilteredData(filtered);
  // };

  const handleDateFilter = (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
    // applyFilters(searchQuery, dateValue);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
    fetchTableData(page);
  }, [searchParams.toString(), searchQuery]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const generatePageNumbers = (current, total) => {
    const pages = [];

    if (current > 2) pages.push(1);
    if (current > 3) pages.push("...");

    for (
      let i = Math.max(1, current - 1);
      i <= Math.min(total, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    if (current < total - 1) pages.push(total);

    return pages;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: "${dateString}"`);
      return "-";
    }

    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .replace(/ /g, "/");
  };

  // const paginatedPayments = payments;

  const paymentsWithFormattedDate = payments.map((payment) => ({
    ...payment,
    formattedDate: formatDate(payment.dbt_date),
  }));

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: String(page) });
    }
  };

  useImperativeHandle(ref, () => ({
    exportToCSV() {
      console.log("Exporting data to CSV...");
      const headers = [
        "Payment Id",
        "Request Date",
        "Paid To",
        "Paid_for",
        "Client Name",
        "Amount (₹)",
        "Payment Status",
        "UTR",
      ];

      const rows = [payments].map((payment) => [
        payment.pay_id || "-",
        payment.formattedDate || "-",
        payment.vendor || "-",
        payment.paid_for || "-",
        payment.customer_name || "-",
        payment.amount_paid || "-",
        payment.approved || "-",
        payment.utr || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Daily_Payment_Request.csv";
      link.click();
    },
  }));

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Pay ID, Items, Clients Name or Vendor"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "flex", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        {error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : loading ? (
          <Typography textAlign="center">Loading...</Typography>
        ) : (
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  <Checkbox
                    size="sm"
                    checked={
                      selected.length === paymentsWithFormattedDate.length
                    }
                    onChange={(event) =>
                      handleRowSelect("all", event.target.checked)
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paymentsWithFormattedDate.length
                    }
                  />
                </Box>
                {[
                  "Payment Id",
                  "Request Date",
                  "Paid To",
                  "Paid_for",
                  "Client Name",
                  "Amount (₹)",
                  "Payment Status",
                  "UTR",
                  // "",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {paymentsWithFormattedDate.length > 0 ? (
                paymentsWithFormattedDate
                  .slice()
                  .sort((a, b) => new Date(b.dbt_date) - new Date(a.dbt_date))
                  .map((payment, index) => (
                    <Box
                      component="tr"
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        <Checkbox
                          size="sm"
                          checked={selected.includes(payment.pay_id)}
                          onChange={(event) =>
                            handleRowSelect(
                              payment.pay_id,
                              event.target.checked
                            )
                          }
                        />
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {/* {payment.pay_id} */}
                        <Tooltip title="View Summary" arrow>
                          <span>
                            <PaymentID
                              currentPage={currentPage}
                              p_id={payment.p_id}
                              pay_id={payment.pay_id}
                            />
                          </span>
                        </Tooltip>
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {payment.formattedDate}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {payment.vendor}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          minWidth: 200,
                        }}
                      >
                        <ItemFetch
                          paid_for={payment.paid_for}
                          po_number={payment.po_number}
                          p_id={payment.p_id}
                        />
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {payment.customer_name || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {payment.amount_paid}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        <Chip
                          variant="soft"
                          size="sm"
                          startDecorator={
                            {
                              Approved: <CheckRoundedIcon />,
                              Pending: <AutorenewRoundedIcon />,
                              Rejected: <BlockIcon />,
                            }[payment.approved]
                          }
                          color={
                            {
                              Approved: "success",
                              Pending: "neutral",
                              Rejected: "danger",
                            }[payment.approved]
                          }
                        >
                          {payment.approved}
                        </Chip>
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        {payment.utr || "-"}
                      </Box>
                      {/* <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        <RowMenu
                          currentPage={currentPage}
                          pay_id={payment.pay_id}
                          p_id={payment.p_id}
                        />
                      </Box> */}
                    </Box>
                  ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={12}
                    sx={{
                      padding: "8px",
                      textAlign: "left",
                      // fontStyle: "italic",
                      // display:"flex",
                      // flexDirection:"column",
                      // alignItems:"center",
                      // justifyContent:"center"
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
        )}
      </Sheet>

      {/* Pagination */}

      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { xl: "15%", lg: "18%" },
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

        {/* <Box>
          Showing page {currentPage} of {totalPages}
        </Box> */}

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {generatePageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === "number" ? (
              <IconButton
                key={index}
                variant={page === currentPage ? "contained" : "outlined"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            ) : (
              <Typography key={index}>...</Typography>
            )
          )}
        </Box>

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
    </>
  );
});
export default PaymentRequest;
