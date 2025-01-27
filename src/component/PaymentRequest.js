import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
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
import * as React from "react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Axios from "../utils/Axios";

const PaymentRequest = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const [paymentResponse, projectResponse] = await Promise.all([
          Axios.get("/get-pay-summary"),
          Axios.get("/get-all-project"),
        ]);
        setPayments(paymentResponse.data.data);
        console.log("Payment Data are:", paymentResponse.data.data);

        setProjects(projectResponse.data.data);
        console.log("Project Data are:", projectResponse.data.data);

        const uniqueVendors = [
          ...new Set(
            paymentResponse.data.data.map((payment) => payment.vendor)
          ),
        ].filter(Boolean);

        // console.log("Vendors are: ", uniqueVendors);
        const uniqueStatuses = [
          ...new Set(
            paymentResponse.data.data.map((payment) => payment.approved)
          ),
        ].filter(Boolean);

        // console.log("Vendors are: ", uniqueVendors);

        setStatuses(uniqueStatuses);
        setVendors(uniqueVendors);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

  useEffect(() => {
    if (payments.length > 0 && projects.length > 0) {
      const merged = payments.map((payment) => {
        const matchingProject = projects.find(
          (project) => Number(project.p_id) === Number(payment.p_id)
        );
        return {
          ...payment,
          // projectCode: matchingProject?.code || "-",
          // projectName: matchingProject?.name || "-",
          projectCustomer: matchingProject?.customer || "-",
          // projectGroup: matchingProject?.p_group || "-",
        };
      });
      setMergedData(merged);
    }
  }, [payments, projects]);

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
      {/* <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Status"
          value={statusFilter}
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Selected State:", selectedValue);
            setStatusFilter(selectedValue);
          }}
        >
          <Option value="">All</Option>
          {statuses.map((status, index) => (
            <Option key={index} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </FormControl> */}
      {/* <FormControl size="sm">
        <FormLabel>Vendor</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by Vendors"
          value={vendorFilter}
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Selected State:", selectedValue);
            setVendorFilter(selectedValue);
          }}
        >
          <Option value="">All</Option>
          {vendors.map((vendor, index) => (
            <Option key={index} value={vendor}>
              {vendor}
            </Option>
          ))}
        </Select>
      </FormControl> */}
    </>
  );
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPayments.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  // const handleDateChange = (e) => {
  //   setDateFilter(e.target.value);
  // };

  const RowMenu = ({ currentPage, pay_id, p_id }) => {
    // console.log("currentPage:", currentPage, "pay_id:", pay_id, "p_id:", p_id);
    return (
      <>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "plain", color: "neutral", size: "sm" },
            }}
          >
            <MoreHorizRoundedIcon />
          </MenuButton>
          <Menu size="sm" sx={{ minWidth: 100 }}>
            <MenuItem
              color="primary"
              onClick={() => {
                const page = currentPage;
                const payId = String(pay_id);
                const projectID = Number(p_id);
                localStorage.setItem("pay_summary", payId);
                localStorage.setItem("p_id", projectID);
                navigate(`/pay_summary?page=${page}&pay_id=${payId}`);
              }}
            >
              <ContentPasteGoIcon />
              <Typography>Pay summary</Typography>
            </MenuItem>

            {/* <MenuItem
              color="primary"
              onClick={() => navigate("/standby_records")}
            >
              <ContentPasteGoIcon />
              <Typography>Pending payments</Typography>
            </MenuItem> */}
            <Divider sx={{ backgroundColor: "lightblue" }} />
            <MenuItem color="danger">
              <DeleteIcon />
              <Typography>Delete</Typography>
            </MenuItem>
          </Menu>
        </Dropdown>
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

  const [FilteredData, setFilteredData] = useState([]);

  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    setSearchQuery(lowerCaseQuery);
    applyFilters(lowerCaseQuery, selectedDate); // Pass the updated search query
  };

  // Apply filters based on search query and date
  const applyFilters = (query = searchQuery, dateValue = selectedDate) => {
    const filteredAndSortedData = mergedData
      .filter((payment) => {
        const matchesSearchQuery = [
          "pay_id",
          "vendor",
          "approved",
          "projectCustomer",
          "paid_for",
        ].some((key) => payment[key]?.toLowerCase().includes(query));

        return matchesSearchQuery;
      })
      .filter((item) => {
        const matchesDate = dateValue
          ? new Date(item.dbt_date).toISOString().split("T")[0] === dateValue
          : true;

        return matchesDate;
      })
      .sort((a, b) => new Date(b.dbt_date) - new Date(a.dbt_date));

    setFilteredData(filteredAndSortedData);
  };

  // Handle date filter input and apply combined filters
  const handleDateFilter = (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
    applyFilters(searchQuery, dateValue);
  };

  // Apply filters based on search query and date
  // const applyFilters = ( dateValue) => {
  //   const filteredData = filteredAndSortedData.filter((item) => {
  //     const matchesDate = dateValue
  //       ? new Date(item.dbt_date).toISOString().split("T")[0] === dateValue
  //       : true;

  //     return matchesDate;
  //   });

  //   setFilteredData(filteredData);
  // };

  // Generate page numbers for pagination
  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) pages.push(1);
    if (currentPage > 3) pages.push("...");

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    if (currentPage < totalPages - 1) pages.push(totalPages);

    return pages;
  };

  // Set current page on component mount or when searchParams change
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);

    // Apply initial filters
    applyFilters();
  }, [searchParams, mergedData]);

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(FilteredData.length / itemsPerPage);

  // Format date safely
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

  // Paginate filtered data
  const paginatedPayments = FilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add formatted date to each payment object
  const paymentsWithFormattedDate = paginatedPayments.map((payment) => ({
    ...payment,
    formattedDate: formatDate(payment.dbt_date),
  }));

  // Handle page changes in pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  // if (loading) {
  //   return <Typography>Loading...</Typography>;
  // }

  // if (error) {
  //   return <Typography color="danger">{error}</Typography>;
  // }
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

      const rows = mergedData.map((payment) => [
        payment.pay_id || "-",
        payment.formattedDate || "-",
        payment.vendor || "-",
        payment.paid_for || "-",
        payment.ProjectCustomer || "-",
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

  // const sortedPayments = [...paymentsWithFormattedDate].sort(
  //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  // );

  return (
    <>
      {/* Mobile Filters */}
      {/* <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: "flex", sm: "none" }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet> */}

      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%", md: "25%" },
          borderRadius: "sm",
          py: 2,
          display: { xs: "none", sm: "flex" },
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
            placeholder="Search by Project ID, Customer, or Name"
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
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", md: "25%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%", md: "75%" },
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
                    textAlign: "center",
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
                  "",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
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
                          textAlign: "center",
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
                          textAlign: "center",
                        }}
                      >
                        {payment.pay_id}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.formattedDate}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.vendor}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.paid_for}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.projectCustomer || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.amount_paid}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
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
                          textAlign: "center",
                        }}
                      >
                        {payment.utr || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        <RowMenu
                          currentPage={currentPage}
                          pay_id={payment.pay_id}
                          p_id={payment.p_id}
                        />
                      </Box>
                    </Box>
                  ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={10}
                    sx={{
                      padding: "8px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    No data available
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
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          marginLeft: { xl: "15%", md: "25%", lg: "18%" },
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
          Showing {paginatedPayments.length} of {FilteredData.length} results
        </Box>
        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {generatePageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === "number" ? (
              <IconButton
                key={index}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            ) : (
              <Typography key={index} sx={{ px: 1, alignSelf: "center" }}>
                {page}
              </Typography>
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
