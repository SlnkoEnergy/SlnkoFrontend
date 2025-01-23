import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
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
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import * as React from "react";
import { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { useNavigate, useSearchParams } from "react-router-dom";



const StandByRequest = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [states, setStates] = useState([]);
  // const [customers, setCustomers] = useState([]);
  // const [stateFilter, setStateFilter] = useState("");
  // const [customerFilter, setCustomerFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
    const [projects, setProjects] = useState([]);
    const [mergedData, setMergedData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await Axios.get("/hold-pay-summary");

        const paymentsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setPayments(paymentsData);
        console.log("Payments Data are :", paymentsData);

        // const uniqueStates = [
        //   ...new Set(paymentsData.map((payment) => payment.state)),
        // ].filter(Boolean);

        // const uniqueCustomers = [
        //   ...new Set(paymentsData.map((payment) => payment.customer)),
        // ].filter(Boolean);

        // setStates(uniqueStates);
        // setCustomers(uniqueCustomers);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

    // useEffect(() => {
    //   if (payments.length > 0 && projects.length > 0) {
    //     const merged = payments.map((payment) => {
    //       const matchingProject = projects.find(
    //         (project) => Number(project.p_id) === Number(payment.p_id)
    //       );
    //       return {
    //         ...payment,
    //         // projectCode: matchingProject?.code || "-",
    //         // projectName: matchingProject?.name || "-",
    //         projectCustomer: matchingProject?.customer || "-",
    //         // projectGroup: matchingProject?.p_group || "-",
    //       };
    //     });
    //     setMergedData(merged);
    //   }
    // }, [payments, projects]);

  // const renderFilters = () => (
  //   <>
  //     <FormControl size="sm">
  //       <FormLabel>State</FormLabel>
  //       <Select
  //         size="sm"
  //         placeholder="Filter by state"
  //         // value={stateFilter}
  //         // onChange={(e) => setStateFilter(e.target.value)}
  //       >
  //         <Option value="">All</Option>
  //         {/* {states.map((state, index) => (
  //           <Option key={index} value={state}>
  //             {state}
  //           </Option>
  //         ))} */}
  //       </Select>
  //     </FormControl>
  //     <FormControl size="sm">
  //       <FormLabel>Customer</FormLabel>
  //       <Select
  //         size="sm"
  //         placeholder="Filter by customer"
  //         // value={customerFilter}
  //         // onChange={(e) => setCustomerFilter(e.target.value)}
  //       >
  //         <Option value="">All</Option>
  //         {/* {customers.map((customer, index) => (
  //           <Option key={index} value={customer}>
  //             {customer}
  //           </Option>
  //         ))} */}
  //       </Select>
  //     </FormControl>
  //   </>
  // );
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPayments.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (id, isSelected) => {
    // console.log("currentPage:", currentPage, "pay_id:", pay_id, "p_id:", p_id);
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
  };

  const RowMenu = ({currentPage, pay_id, p_id }) => {
    return (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
        >
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem
              color="primary"
              onClick={() => {
                const page = currentPage;
                const payId = String(pay_id);
                const projectID = Number(p_id);
                localStorage.setItem("standby_summary", payId);
                localStorage.setItem("p_id", projectID);
                navigate(`/standby_Request?page=${page}&pay_id=${payId}`);
              }}
            >
              <ContentPasteGoIcon />
              <Typography>StandBy summary</Typography>
            </MenuItem>
          <Divider sx={{ backgroundColor: "lightblue" }} />
            <MenuItem color="danger">
            <DeleteIcon />
            <Typography>Delete</Typography>
            </MenuItem>
        </Menu>
      </Dropdown>
    );
  }

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };
  const filteredAndSortedData = payments
  .filter((payment) => {
    const matchesSearchQuery = [
      "pay_id",
      "vendor",
      "approved",
      "projectCustomer",
      "paid_for"
    ].some((key) => payment[key]?.toLowerCase().includes(searchQuery));

    // const matchesDateFilter =
    //   !dateFilter ||
    //   new Date(payment.date).toLocaleDateString() ===
    //     new Date(dateFilter).toLocaleDateString();

    // const matchesStatusFilter =
    //   !statusFilter || payment.approved === statusFilter;
    // console.log("MatchVendors are: ", matchesStatusFilter);

    // const matchesVendorFilter =
    //   !vendorFilter || payment.vendor === vendorFilter;
    // console.log("MatchVendors are: ", matchesVendorFilter);

    return matchesSearchQuery;
  })
  .sort((a, b) => {
    if (a.pay_id?.toLowerCase().includes(searchQuery)) return -1;
    if (b.pay_id?.toLowerCase().includes(searchQuery)) return 1;
    if (a.paid_for?.toLowerCase().includes(searchQuery)) return -1;
    if (b.paid_for?.toLowerCase().includes(searchQuery)) return 1;
    if (a.projectCustomer?.toLowerCase().includes(searchQuery)) return -1;
    if (b.projectCustomer?.toLowerCase().includes(searchQuery)) return 1;
    if (a.vendor?.toLowerCase().includes(searchQuery)) return -1;
    if (b.vendor?.toLowerCase().includes(searchQuery)) return 1;
    if (a.approved?.toLowerCase().includes(searchQuery)) return -1;
    if (b.approved?.toLowerCase().includes(searchQuery)) return 1;
    return 0;
  });


  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(1);
    }

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (currentPage < totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

    useEffect(() => {
      const page = parseInt(searchParams.get("page")) || 1;
      setCurrentPage(page);
    }, [searchParams]);


  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }
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


  const paginatedPayments = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paymentsWithFormattedDate = paginatedPayments.map((payment) => ({
    ...payment,
    formattedDate: formatDate(payment.dbt_date),
  }));
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // if (loading) {
  //   return <Typography>Loading...</Typography>;
  // }

  // if (error) {
  //   return <Typography color="danger">{error}</Typography>;
  // }

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
            startDecorator={<SearchIcon />}
            placeholder="Search by Project ID, Customer, or Name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {/* {renderFilters()} */}
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
                    checked={selected.length === paymentsWithFormattedDate.length}
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
                  "Client Name",
                  "Amount (₹)",
                  // "Payment Status",
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
                paymentsWithFormattedDate.map((payment, index) => (
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
                          handleRowSelect(payment.pay_id, event.target.checked)
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
                      {payment.customer || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {payment.amt_for_customer}
                    </Box>
                    {/* <Box
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
                    </Box> */}
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
                    colSpan={9}
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
          marginLeft: {xl: "15%", md: "25%", lg: "18%" },
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
        {/* <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <IconButton
        key={page}
        size="sm"
        variant={page === currentPage ? "contained" : "outlined"}
        color="neutral"
        onClick={() => handlePageChange(page)}
      >
        {page}
      </IconButton>
    ))}
  </Box> */}

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
}
export default StandByRequest;
