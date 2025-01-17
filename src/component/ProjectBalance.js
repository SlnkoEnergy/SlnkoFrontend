import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
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
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Axios from "../utils/Axios";

const ProjectBalances = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [debits, setDebits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [projects, setProjects] = useState([]);
  const [posData, setPoData] = useState([]);
  const [billsData, setBillData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [total_Credit, setTotal_Credit] = useState(0);
  const [aggregate_MW, setAggregate_MW] = useState(0);
  const [total_Debit, setTotal_Debit] = useState(0);
  const [available_Amount, setAvailable_Amount] = useState(0);
  const [balanceSlnko, setTotalBalanceSlnko] = useState(0);
  const [balancePayable, setTotalBalancePayable] = useState(0);
  const [balanceRequired, setTotalBalanceRequired] = useState(0);
  const [customerAdjustmentSum, setCustomerAdjustmentSum] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [totalPoValue, setTotalPoValue] = useState(0);
  const [totalBillValue, setTotalBillValue] = useState(0);
  const [totals, setTotals] = useState({
    totalBalanceSlnko: 0,
    totalBalancePayable: 0,
    totalBalanceRequired: 0,
  });

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
    const fetchAccountsAndData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [
          projectsResponse,
          creditResponse,
          debitResponse,
          poResponse,
          billResponse,
        ] = await Promise.all([
          Axios.get("/get-all-project"),
          Axios.get("/all-bill"),
          Axios.get("/get-subtract-amount"),
          Axios.get("/get-all-po"),
          Axios.get("/get-all-bill"),
        ]);

        // Extract data from responses
        const projectsData = projectsResponse.data.data;
        const creditData = creditResponse.data.bill;
        const debitData = debitResponse.data.data;
        const poData = poResponse.data.data;
        const billData = billResponse.data.data;


            // console.log("Po data are:", poData);
            // console.log("All bills are :", billData);
            

        // Update state with raw data
        setProjects(projectsData);
        setCredits(creditData);
        setDebits(debitData);
        setPoData(poData);
        setBillData(billData);

       
        

        // Calculate aggregated values
        const totalCredit = creditData.reduce(
          (sum, row) => sum + (parseFloat(row.cr_amount) || 0),
          0
        );
        const totalDebit = debitData.reduce(
          (sum, row) => sum + (parseFloat(row.amount_paid) || 0),
          0
        );
        const totalMW = projectsData.reduce(
          (sum, row) => sum + (parseFloat(row.project_kwp) || 0),
          0
        );

        setTotal_Credit(totalCredit.toLocaleString("en-IN"));
        setTotal_Debit(totalDebit.toLocaleString("en-IN"));
        setAggregate_MW(totalMW);

        // Calculate available amount
        const availableAmount = totalCredit - totalDebit;
        setAvailable_Amount(availableAmount.toLocaleString("en-IN"));

      //  const ProjectData =  projectsResponse?.data?.data.map((item) => {
      //     return{
      //       p_id : item.p_id,
      //       code: item.code
      //     }

      //   })
      //   console.log(ProjectData);

        
      //   const Purchase = poData.map((po) => {
      //     if(po.pid === projectsData.code ){
      //       return{
      //         po_number : po.po_number,
      //         advancePaid: parseFloat(po.amount_paid) || 0,
      //         poValue: parseFloat(po.po_value) || 0,
      //     }
      // }})
      //   console.log(Purchase);
        


       
        // const matchingBill = billData.map((bill) => {
        //   const matchingPo = poData.find((po) => po.po_number === bill.po_number);
        //   if (matchingPo) {
        //     return {
        //       billedValue: parseFloat(bill.bill_value) || 0,
        //     };
        //   }
        //   return bill;
        // });
        
        // console.log("Enriched Bill Values: ", matchingBill);
        

        // const totalAmountPaid = Purchase.reduce(
        //   (sum, po) => sum + po.amountPaid,
        //   0
        // );
        // const totalPoValue = Purchase.reduce(
        //   (sum, po) => sum + po.poValue,
        //   0
        // );
        // const totalBillValue = matchingBill.reduce(
        //   (sum, po) => sum + po.billedValue,
        //   0
        // );

      
        // setTotalAmountPaid(totalAmountPaid.toLocaleString("en-IN"));
        // setTotalPoValue(totalPoValue.toLocaleString("en-IN"));
        // setTotalBillValue(totalBillValue.toLocaleString("en-IN"));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndData();
  }, []);

  useEffect(() => {
    if (
      credits.length > 0 &&
      projects.length > 0 &&
      debits.length > 0 &&
      posData.length > 0 &&
      billsData.length > 0
    ) {
      // Group and aggregate data by project ID
      const creditSumMap = credits.reduce((acc, credit) => {
        const projectId = credit.p_id;
        acc[projectId] = (acc[projectId] || 0) + Number(credit.cr_amount);
        return acc;
      }, {});
  
      const debitSumMap = debits.reduce((acc, debit) => {
        const projectId = debit.p_id;
        const amountPaid = Number(debit.amount_paid);
        acc[projectId] =
          (acc[projectId] || 0) + (isNaN(amountPaid) ? 0 : amountPaid);
        return acc;
      }, {});
  
      const customerAdjustmentSumMap = debits.reduce((acc, debit) => {
        const projectId = debit.p_id;
        const amountPaid = Number(debit.amount_paid);
        if (debit.paid_for === "customer adjustment") {
          acc[projectId] =
            (acc[projectId] || 0) + (isNaN(amountPaid) ? 0 : amountPaid);
        }
        return acc;
      }, {});
  
      // Map project codes to project IDs
      const projectCodeMap = projects.reduce((acc, project) => {
        acc[project.code] = project.p_id;
        return acc;
      }, {});
  
      // Aggregate PO data
      const poSumMap = posData.reduce((acc, po) => {
        const projectId = projectCodeMap[po.p_id]; 
        if (projectId) {
          acc[projectId] = (acc[projectId] || 0) + (Number(po.po_value) || 0);
        }
        return acc;
      }, {});
  
      const amountPaidSumMap = posData.reduce((acc, po) => {
        const projectId = projectCodeMap[po.p_id]; 
        const amountPaid = Number(po.amount_paid);
        if (projectId) {
          acc[projectId] = (acc[projectId] || 0) + (isNaN(amountPaid) ? 0 : amountPaid);
        }
        return acc;
      }, {});
  
      
      const billSumMap = posData.reduce((acc, po) => {
        const poNumber = po.po_number;
        const matchingBills = billsData.filter((bill) => bill.po_number === poNumber);
        const totalBillValue = matchingBills.reduce(
          (sum, bill) => sum + (Number(bill.bill_value) || 0),
          0
        );
        const projectId = projectCodeMap[po.p_id];
        if (projectId) {
          acc[projectId] = (acc[projectId] || 0) + totalBillValue;
        }
        return acc;
      }, {});
  
      const merged = projects.map((project) => {
        const projectId = project.p_id;
        const totalCredit = creditSumMap[projectId] || 0;
        const totalDebit = debitSumMap[projectId] || 0;
        const oldAmount = totalCredit - totalDebit || 0;
        const customerAdjustment = customerAdjustmentSumMap[projectId] || 0;
        const totalPoValue = poSumMap[projectId] || 0;
        const totalBillValue = billSumMap[projectId] || 0;
        const advancePaid = amountPaidSumMap[projectId] || 0;
  
        const netBalance = totalCredit - customerAdjustment;
        const balanceSlnko = netBalance - advancePaid;
        const netAdvance = advancePaid - totalBillValue;
        const balancePayable = totalPoValue - totalBillValue - netAdvance;
  
        const tcs =
          netBalance > 5000000 ? Math.round((netBalance - 5000000) * 0.001) : 0;
        const balanceRequired = balanceSlnko - balancePayable - tcs;
  
        return {
          ...project,
          creditAmount: totalCredit,
          debitAmount: totalDebit,
          oldAmount: oldAmount,
          balanceSlnko: Math.round(balanceSlnko),
          balancePayable: Math.round(balancePayable),
          balanceRequired: Math.round(balanceRequired),
        };
      });
  
      setMergedData(merged);
  
      // Calculate total aggregates
      const total = merged.reduce(
        (acc, project) => {
          acc.totalBalanceSlnko += project.balanceSlnko || 0;
          acc.totalBalancePayable += project.balancePayable || 0;
          acc.totalBalanceRequired += project.balanceRequired || 0;
          return acc;
        },
        { totalBalanceSlnko: 0, totalBalancePayable: 0, totalBalanceRequired: 0 }
      );

      setTotals(total);
  
      // Log or set state for totals
      // console.log("Total Balance Slnko:", totals.totalBalanceSlnko);
      // console.log("Total Balance Payable:", totals.totalBalancePayable);
      // console.log("Total Balance Required:", totals.totalBalanceRequired);
  
      // Optional: Update state if you need these totals elsewhere
      // setTotalBalanceSlnko(totals.totalBalanceSlnko);
      // setTotalBalancePayable(totals.totalBalancePayable);
      // setTotalBalanceRequired(totals.totalBalanceRequired);
    }
  }, [credits, projects, debits, posData, billsData]);
  


  const RowMenu = ({ currentPage, p_id }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

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
                const projectId = p_id;
                localStorage.setItem("add_money", projectId);
                // console.log(`/add_money?page=${page}&p_id=${projectId}`);
                navigate(`/add_money?page=${page}&p_id=${projectId}`);
              }}
            >
              {" "}
              <AddCircleOutlineIcon />
              <Typography>Add Money</Typography>
            </MenuItem>
            <Divider sx={{ backgroundColor: "lightblue" }} />
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const projectId = p_id;
                localStorage.setItem("view_detail", projectId);
                navigate(`/view_detail?page=${page}&p_id=${projectId}`);
              }}
            >
              {" "}
              <ContentPasteGoIcon />
              <Typography>View More</Typography>
            </MenuItem>
          </Menu>
        </Dropdown>
      </>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = mergedData
    .filter((project) =>
      ["code", "customer", "name", "p_group"].some((key) =>
        project[key]?.toLowerCase().includes(searchQuery)
      )
    )
    .sort((a, b) => {
      if (a.name?.toLowerCase().includes(searchQuery)) return -1;
      if (b.name?.toLowerCase().includes(searchQuery)) return 1;
      if (a.code?.toLowerCase().includes(searchQuery)) return -1;
      if (b.code?.toLowerCase().includes(searchQuery)) return 1;
      if (a.p_group?.toLowerCase().includes(searchQuery)) return -1;
      if (b.p_group?.toLowerCase().includes(searchQuery)) return 1;
      if (a.customer?.toLowerCase().includes(searchQuery)) return -1;
      if (b.customer?.toLowerCase().includes(searchQuery)) return 1;
      return 0;
    });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(mergedData.map((row) => row.code));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (code, isSelected) => {
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, code]
        : prevSelected.filter((item) => item !== code)
    );
  };
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

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedPayments = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  useImperativeHandle(ref, () => ({
    exportToCSV() {
      console.log("Exporting data to CSV...");
      const headers = [
        "Project Id",
        "Project Name",
        "Client Name",
        "Group Name",
        "Plant Capacity (MW AC)",
        "Total Credit",
        "Total Debit",
        "Amount Amount(Old)",
        "Balance with SLnko",
        "Balance Payable to Vendors",
        "Balance Required",
        "View More",
        "Aggregate Plant Capacity",
        "Aggregate Credit",
        "Aggregate Debit",
        "Aggregate Available(Old)",
        "Aggregate Balance Slnko",
        "Aggregate Balance Payable to Vendors",
        "Balance Required",
      ];

      const rows = mergedData.map((project) => [
        project.code || "-",
        project.name || "-",
        project.customer || "-",
        project.p_group || "-",
        project.project_kwp || "-",
        project.creditAmount || "-",
        project.debitAmount || "-",
        project.oldAmount || "-",
        project.balanceSLnko || "-",
        project.balancePayable || "-",
        project.balanceRequired || "-",
        project.viewMore || "-",
        project.aggregate_MW || "-",
        project.total_Credit || "-",
        project.total_Debit || "-",
        project.available_Amount || "-",
        project.balance_Slnko || "-",
        project.balance_Payable || "-",
        project.balance_Required || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "project_balance.csv";
      link.click();
    },
  }));

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
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Project ID, Customer, or Name"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {/* {renderFilters()} */}
      </Box>

      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%", md: "25%" },
          maxWidth: { xl: "85%" },
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  fontWeight: "bold",
                  backgroundColor: "#e2e2e2",
                  border: "1px solid #ddd",
                }}
              >
                Total Plant Capacity (MW AC)
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Total Credit
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Total Debit
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Available Amount (Old)
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Balance with Slnko
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Balance Payable to Vendors
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Balance Required
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#fff" }}>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {aggregate_MW} MW AC
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {total_Credit}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {total_Debit}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {available_Amount}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {totals.totalBalanceSlnko}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {totals.totalBalancePayable}
              
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                {totals.totalBalanceRequired}
              </td>
            </tr>
          </tbody>
        </table>
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
                    checked={selected.length === mergedData.length}
                    onChange={handleSelectAll}
                  />
                </Box>
                {[
                  "Project Id",
                  "Project Name",
                  "Client Name",
                  "Group Name",
                  "Plant Capacity (MW AC)",
                  "Total Credit",
                  "Total Debit",
                  "Available Amount(Old)",
                  "Balance with SLnko",
                  "Balance Payable to Vendors",
                  "Balance Required",
                  "View More",
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
                paginatedPayments.map((project, index) => (
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
                        checked={selected.includes(project.code)}
                        onChange={(event) =>
                          handleRowSelect(project.code, event.target.checked)
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
                      {project.code}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {project.name || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {project.customer || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {project.p_group || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {project.project_kwp || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.creditAmount || "-")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.debitAmount || "-")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.oldAmount || "-")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.balanceSlnko || "0")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.balancePayable || "0")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(project.balanceRequired || "0")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <RowMenu currentPage={currentPage} p_id={project.p_id} />
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
export default ProjectBalances;
