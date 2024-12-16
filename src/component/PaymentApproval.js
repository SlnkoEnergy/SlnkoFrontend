import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
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
import axios from "axios";
import * as React from "react";
import Checkbox from "@mui/joy/Checkbox";
import Chip from '@mui/joy/Chip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { useEffect, useState } from "react";


function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 100 }}>
        <MenuItem>
        <Chip
            variant="soft"
            size="sm"
            startDecorator={<CheckRoundedIcon />}
            color="success"
          >
          Approved
        </Chip>
        </MenuItem>
        <MenuItem>
         <Chip
            variant="soft"
            size="sm"
            startDecorator={<BlockIcon />}
            color="danger"
          >
                    Rejected
                </Chip>
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

function PaymentRequest() {
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

 

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>State</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by state"
          // value={stateFilter}
          // onChange={(e) => setStateFilter(e.target.value)}
        >
          <Option value="">All</Option>
          {/* {states.map((state, index) => (
            <Option key={index} value={state}>
              {state}
            </Option>
          ))} */}
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by customer"
          // value={customerFilter}
          // onChange={(e) => setCustomerFilter(e.target.value)}
        >
          <Option value="">All</Option>
          {/* {customers.map((customer, index) => (
            <Option key={index} value={customer}>
              {customer}
            </Option>
          ))} */}
        </Select>
      </FormControl>
    </>
  );

  useEffect(() => {
    const fetchPaymentsAndProjects = async () => {
      setLoading(true);
      try {
        const [paymentResponse, projectResponse] = await Promise.all([
          axios.get("https://backendslnko.onrender.com/v1/get-pay-summary"),
          axios.get("https://backendslnko.onrender.com/v1/get-all-project"),
        ]);
        setPayments(paymentResponse.data);
        console.log("Payment Data are:", paymentResponse.data);
        
        setProjects(projectResponse.data.data);
        console.log("Project Data are:", projectResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPaymentsAndProjects();
  }, []);

  useEffect(() => {
    if (payments.length > 0 && projects.length > 0) {
      const merged = payments.map((payment) => {
        const matchingProject = projects.find(
          (project) => project.p_id === payment.p_id
        );
        return {
          ...payment,
          projectCode: matchingProject?.code || "-", 
          projectName: matchingProject?.name || "-", 
          projectCustomer: matchingProject?.customer || "-", 
          projectGroup: matchingProject?.p_group || "-", 
        };
      });
      setMergedData(merged);
    }
  }, [payments, projects]);
  
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(mergedData.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (id, isSelected) => {
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
  };
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
  const totalPages = Math.ceil(mergedData.length / itemsPerPage);

  
 
  const paginatedPayments = mergedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <Sheet
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
      </Sheet>

      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
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
            placeholder="Search"
            startDecorator={<SearchIcon />}
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
        }}
      >
        {error ? (
        <Typography color="danger" textAlign="center">
          {error}
        </Typography>
      ) : loading ? (
        <Typography textAlign="center">Loading...</Typography>
      ) : (
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
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
                  checked={selected.length === paginatedPayments.length}
                  onChange={(event) => handleRowSelect("all", event.target.checked)}
                  indeterminate={
                    selected.length > 0 && selected.length < paginatedPayments.length
                  }
                />
              </Box>
              {[
                "Payment Id",
                "Request Date",
                "Project Id",
                "Project Name",
                "Client Name",
                "Group Name",
                "Request For",
                "Payment Description",
                "Amount Requested",
                "Client Balance",
                "Group Balance",
                "Action"
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
          {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment,index) => (
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
                        onChange={(event) => handleRowSelect(payment.pay_id, event.target.checked)}
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
                    {payment.dbt_date}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {payment.projectCode}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {payment.projectName || "-"}
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
                    {payment.projectGroup || "-"}
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
                    {payment.comment || "-"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >{new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(payment.amt_for_customer)}
                   
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {payment.clientname|| "-"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {payment.groupname|| "-"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {RowMenu()}
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
export default PaymentRequest;
