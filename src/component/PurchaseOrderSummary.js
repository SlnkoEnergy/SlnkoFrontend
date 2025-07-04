import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
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
import axios from "axios";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === "desc"
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

const PurchaseOrderSummary = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateFilter, setStateFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [total_Billed, setTotal_Billed] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // const renderFilters = () => (
  //   <>
  //     <FormControl size="sm">
  //       <FormLabel>State</FormLabel>
  //       <Select
  //         size="sm"
  //         placeholder="Filter by state"
  //         onChange={(e) => setStateFilter(e.target.value)}
  //         slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
  //       >
  //         <Option value="">All</Option>
  //         <Option value="A">A</Option>
  //         <Option value="B">B</Option>
  //         <Option value="C">C</Option>
  //         <Option value="D">D</Option>
  //       </Select>
  //     </FormControl>
  //     <FormControl size="sm">
  //       <FormLabel>Customer</FormLabel>
  //       <Select size="sm" placeholder="All">
  //         <Option value="all">All</Option>
  //         <Option value="olivia">Olivia Rhye</Option>
  //         <Option value="steve">Steve Hampton</Option>
  //         <Option value="ciaran">Ciaran Murray</Option>
  //         <Option value="marina">Marina Macdonald</Option>
  //         <Option value="charles">Charles Fulton</Option>
  //         <Option value="jay">Jay Hoper</Option>
  //       </Select>
  //     </FormControl>
  //   </>
  // );

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        console.log(token);

        if (!token) {
          throw new Error("No auth token found in localStorage.");
        }
      
        const [PoResponse, BillResponse, payResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/get-all-pO-IT`, {
            headers: {
              "x-auth-token": token,
            },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/get-all-bilL-IT`, {
            headers: {
              "x-auth-token": token,
            },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/get-pay-summarY-IT`, {
            headers: {
              "x-auth-token": token,
            },
          }),
        ]);
        
        const PoData = PoResponse.data.data || [];
        const BillData = BillResponse.data.data || [];
        const payData = payResponse.data.data || [];

        const updatedPoData = PoData.map((po) => {
          const poBills = BillData.filter(
            (bill) => bill.po_number === po.po_number
          );

          const totalBill = poBills.reduce((sum, bill) => {
            const billValue = parseFloat(bill.bill_value) || 0;
            return sum + billValue;
          }, 0);

          const totalPaidAmount = payData
            .filter(
              (pay) =>
                pay.po_number === po.po_number &&
                pay.approved === "Approved" &&
                pay.utr
            )
            .reduce((sum, pay) => sum + (parseFloat(pay.amount_paid) || 0), 0);

          // Format the total paid amount
          const formattedPaidAmount = totalPaidAmount.toLocaleString("en-IN");

          // Improved logging to show the total paid amount
          // console.log(`PO Number: ${po.po_number}, Total Paid Amount:`, formattedPaidAmount);

          const latestBill = poBills.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )[0];
          const billingTypes = latestBill ? latestBill.type.trim() : "-";

          const formattedTotal = totalBill.toLocaleString("en-IN");

          const billStatus =
            totalBill >= parseFloat(po.po_value)
              ? "Fully Billed"
              : "Bill Pending";

          return {
            ...po,
            totalBill,
            formattedTotal,
            billingTypes,
            bill_status: billStatus,
            paidAmount: formattedPaidAmount,
          };
        });

        console.log("Updated PO Data:", updatedPoData);

        setPos(updatedPoData);
      } catch (err) {
        console.error("Error fetching table data:", err);
        setError(
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "red",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <PermScanWifiIcon />
            <Typography
              fontStyle={"italic"}
              fontWeight={"600"}
              sx={{ color: "#0a6bcc" }}
            >
              Sit Back! Internet Connection will be back soon..
            </Typography>
          </span>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

  const RowMenu = ({ currentPage, po_number }) => {
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

    return (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: { variant: "plain", color: "neutral", size: "sm" },
          }}
        >
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.department === "admin" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Aryan Maheshwari" ||
            user?.name === "Sarthak Sharma" ||
            user?.name === "Naresh Kumar" ||
            user?.name === "Shubham Gupta") && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                localStorage.setItem("po_no", po);
                navigate(`/add_bill?page=${page}&po_number=${po}`);
              }}
            >
              {" "}
              <AddCircleOutlineIcon />
              <Typography>Add Bill</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              const page = currentPage;
              const po = po_number;
              localStorage.setItem("get-po", po);
              navigate(`/bill_history?page=${page}&po_number=${po}`);
            }}
          >
            <HistoryIcon />
            <Typography>Bill History</Typography>
          </MenuItem>
          <Divider sx={{ backgroundColor: "lightblue" }} />
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.department=== "admin" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Aryan Maheshwari" ||
            user?.name === "Sarthak Sharma" ||
            user?.name === "Shubham Gupta" ||
            user?.name === "Naresh Kumar" ||
          user?.name === "Sandeep Yadav" ||
            user?.name === "Som Narayan Jha" ||
            user?.name === "Saresh"
          ) && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                // const ID = _id
                localStorage.setItem("edit-po", po);
                navigate(`/edit_po?page=${page}&po_number=${po}`);
              }}
            >
              <EditNoteIcon />
              <Typography>Edit PO</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              const page = currentPage;
              const po = po_number;
              localStorage.setItem("get-po", po);
              navigate(`/po_history?page=${page}&po_number=${po}`);
            }}
          >
            <HistoryIcon />
            <Typography>PO History</Typography>
          </MenuItem>
          {/* <Divider sx={{ backgroundColor: "lightblue" }} /> */}
          {/* <MenuItem color="primary" style={{ fontWeight: "bold" }}>
            Adjust Bill
          </MenuItem> */}
          {(user?.name === "IT Team" ||
            user?.name === "admin" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Naresh Kumar" ||
            user?.name === "Shubham Gupta") && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                localStorage.setItem("edit_bill", po);
                navigate(`/edit_bill?page=${page}&po_number=${po}`);
              }}
            >
              {" "}
              <EditNoteIcon />
              <Typography>Edit Bill</Typography>
            </MenuItem>
          )}
            {/* <Divider sx={{ backgroundColor: "lightblue" }} />
                      {(user?.name === "IT Team" ||
                        user?.name === "Guddu Rani Dubey" ||
                        user?.name === "Prachi Singh" ||
                        user?.name === "admin") && (
                        <MenuItem
                          color="danger"
                          disabled={selectedProjects.length === 0}
                          onClick={handleDelete}
                        >
                          <DeleteIcon />
                          <Typography>Delete</Typography>
                        </MenuItem>
                      )} */}
        </Menu>
      </Dropdown>
    );
  };

  const BillingStatusChip = ({ status }) => {
    return (
      <Chip
        variant="soft"
        size="sm"
        startDecorator={
          {
            "Fully Billed": <CheckRoundedIcon />,
            "Bill Pending": <AutorenewRoundedIcon />,
          }[status]
        }
        color={
          {
            "Fully Billed": "success",
            "Bill Pending": "warning",
          }[status]
        }
      >
        {status}
      </Chip>
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPo.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = pos
    .filter((po) => {
      const matchesSearchQuery = [
        "p_id",
        "po_number",
        "bill_status",
        "vendor",
      ].some((key) => po[key]?.toLowerCase().includes(searchQuery));
      // Apply the state filter
      // const matchesStateFilter =
      //   !stateFilter || project.state === stateFilter;
      // console.log("MatchStates are: ", matchesStateFilter);

      // Apply the customer filter
      // const matchesCustomerFilter =
      //   !customerFilter || project.customer === customerFilter;

      // Combine all filters
      return matchesSearchQuery;
    })
    .sort((a, b) => {
      if (a.p_id?.toLowerCase().includes(searchQuery)) return -1;
      if (b.p_id?.toLowerCase().includes(searchQuery)) return 1;
      if (a.po_number?.toLowerCase().includes(searchQuery)) return -1;
      if (b.po_number?.toLowerCase().includes(searchQuery)) return 1;
      if (a.bill_status?.toLowerCase().includes(searchQuery)) return -1;
      if (b.bill_status?.toLowerCase().includes(searchQuery)) return 1;
      if (a.vendor?.toLowerCase().includes(searchQuery)) return -1;
      if (b.vendor?.toLowerCase().includes(searchQuery)) return 1;
      return 0;
    });

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

  const paginatedPo = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paymentsWithFormattedDate = paginatedPo.map((po) => ({
    ...po,
    formattedDate: formatDate(po.date),
  }));

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
      // console.log("Exporting data to CSV...");
      const headers = [
        "Project ID",
        "PO Number",
        "PO Date",
        "Partial Billing",
        "Item Name",
        "Vendor",
        "PO Value with GST",
        "Advance Paid",
        "Bill Status",
        "Total Billed",
        // "Action",
      ];

      const rows = pos.map((po) => [
        po.p_id || "-",
        po.po_number || "-",
        po.date || "-",
        po.billingTypes || "-",
        po.item || "-",
        po.vendor || "-",
        po.po_value || "-",
        po.amount_paid || "0",
        po.bill_status || "-",
        po.totalBill || "0",
        // po.action || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "PurchaseOrder_Summary.csv";
      link.click();
    },
  }));

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
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          display: "flex",
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
            placeholder="Search Project Id, PO Number, Vendor"
            startDecorator={<SearchIcon />}
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
                    padding: 1,
                    textAlign: "center",
                    borderBottom: "1px solid",
                    fontWeight: "bold",
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length !== paymentsWithFormattedDate.length
                    }
                    checked={
                      selected.length === paymentsWithFormattedDate.length
                    }
                    onChange={handleSelectAll}
                    color={selected.length > 0 ? "primary" : "neutral"}
                  />
                </Box>
                {[
                  "Project ID",
                  "PO Number",
                  "PO Date",
                  "Partial Billing",
                  "Item Name",
                  "Vendor",
                  "PO Value with GST",
                  "Advance Paid",
                  "Bill Status",
                  "Total Billed",
                  // "Action",
                  "",
                ].map((header) => (
                  <Box
                    component="th"
                    key={header}
                    sx={{
                      padding: 1,
                      textAlign: "center",
                      borderBottom: "1px solid",
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
                paymentsWithFormattedDate.map((po) => (
                  <Box
                    component="tr"
                    key={po.id}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Checkbox
                        checked={selected.includes(po.id)}
                        onChange={(event) =>
                          handleRowSelect(po.id, event.target.checked)
                        }
                        color={selected.includes(po.id) ? "primary" : "neutral"}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.p_id}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.po_number}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.formattedDate}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.billingTypes || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.item === "Other" || po.item === "other"
                        ? po.other
                        : po.item}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.vendor}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(po.po_value)}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {/* {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(po.paidAmount)} */}
                      {po.paidAmount || "0"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      <BillingStatusChip status={po.bill_status} />
                      {/* {po.bill_status || "-"} */}
                      {/* {po.bill_status === "Fully Billed" ? (
                        <Chip
                          label="Fully Billed"
                          color="success"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "green",
                            color: "white",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Bill Pending"
                          color="warning"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "orange",
                            color: "white",
                          }}
                        />
                      )} */}
                    </Box>
                    {/* <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.bill_delay || "-"}
                    </Box> */}
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.formattedTotal || "-"}
                    </Box>
                    {/* <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.action || "-"}
                    </Box> */}
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      <RowMenu
                        currentPage={currentPage}
                        po_number={po.po_number}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={13}
                    sx={{
                      padding: 2,
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
                        No PO available
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

        <Box>
          Showing {paymentsWithFormattedDate.length} of{" "}
          {filteredAndSortedData.length} results
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
});
export default PurchaseOrderSummary;
