import { Player } from "@lottiefiles/react-lottie-player";
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
import { useColorScheme, useTheme } from '@mui/joy/styles';
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../assets/Lotties/animation-loading.json";
import Axios from "../utils/Axios";
import NoData from "../assets/alert-bell.svg";
import Skeleton from "react-loading-skeleton";

const ProjectBalances = forwardRef((props, ref) => {
  const theme = useTheme();
  const { mode } = useColorScheme();
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
  const [paysData, setPayData] = useState([]);
  const [adjustmentsData, setAdjustmentData] = useState([]);
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

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

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
          payResponse,
          adjResponse,
        ] = await Promise.all([
          Axios.get("/get-all-projecT-IT"),
          Axios.get("/all-bilL-IT"),
          Axios.get("/get-subtract-amounT-IT"),
          Axios.get("/get-all-pO-IT"),
          Axios.get("/get-all-bilL-IT"),
          Axios.get("/get-pay-summarY-IT"),
          Axios.get("/get-adjustment-request"),
        ]);

        // Extract data from responses
        const projectsData = projectsResponse.data.data;
        const creditData = creditResponse.data.bill;
        const debitData = debitResponse.data.data;
        const poData = poResponse.data.data;
        const billData = billResponse.data.data;
        const paymentData = payResponse.data.data;
        const adjustmentData = adjResponse.data;

        // console.log("Po data are:", poData);
        // console.log("All bills are :", billData);

        // Update state with raw data
        setProjects(projectsData);
        setCredits(creditData);
        setDebits(debitData);
        setPoData(poData);
        setBillData(billData);
        setPayData(paymentData);
        setAdjustmentData(adjustmentData);

        // Calculate aggregated values
        const totalCredit = creditData.reduce(
          (sum, row) => sum + (parseFloat(row.cr_amount) || "0"),
          0
        );
        const totalDebit = debitData.reduce(
          (sum, row) => sum + (parseFloat(row.amount_paid) || "0"),
          0
        );
        const totalMW = projectsData.reduce(
          (sum, row) => sum + (Math.round(row.project_kwp) || 0),
          0
        );

        setTotal_Credit(totalCredit.toLocaleString("en-IN"));
        setTotal_Debit(totalDebit.toLocaleString("en-IN"));
        setAggregate_MW(totalMW);

        // Calculate available amount
        const availableAmount = totalCredit - totalDebit;
        setAvailable_Amount(availableAmount.toLocaleString("en-IN"));

        const creditAdjustmentTotal = adjustmentData
        .filter((row) => row.adj_type === "Add")
        .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);

        const debitAdjustmentTotal = adjustmentData
        .filter((row) => row.adj_type === "Add")
        .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);
        // console.log(totalDebit);
        

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

    fetchAccountsAndData();
  }, []);

  const filteredProjects = useMemo(() => {
    // Map to get the latest cr_date for each project
    const latestCrDateMap = credits.reduce((acc, credit) => {
      const projectId = credit.p_id;
      const creditDate = new Date(credit.cr_date);
      if (!acc[projectId] || creditDate > new Date(acc[projectId])) {
        acc[projectId] = credit.cr_date;
      }
      return acc;
    }, {});

    return projects
      .filter((project) =>
        ["code", "customer", "name", "p_group"].some((key) =>
          project[key]?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .sort((a, b) => {
        const getCrDate = (item) => new Date(latestCrDateMap[item.p_id] ?? 0);
        const getProjectDate = (item) =>
          new Date(item.updated_on ?? item.createdAt ?? 0);

        const crDateDiff = getCrDate(b) - getCrDate(a);
        if (crDateDiff !== 0) return crDateDiff;

        return getProjectDate(b) - getProjectDate(a);
      });
  }, [searchQuery, projects, credits]);

  //   const filteredProjects = useMemo(() => {
  //   // Create a map for the latest cr_date of each project
  //   const latestCrDateMap = credits.reduce((acc, credit) => {
  //     const projectId = credit.p_id;
  //     const creditDate = new Date(credit.cr_date);
  //     if (!acc[projectId] || creditDate > new Date(acc[projectId])) {
  //       acc[projectId] = credit.cr_date; // Store latest cr_date
  //     }
  //     return acc;
  //   }, {});

  //   return projects
  //     .filter((project) =>
  //       ["code", "customer", "name", "p_group"].some((key) =>
  //         project[key]?.toLowerCase().includes(searchQuery.toLowerCase())
  //       )
  //     )
  //     .sort((a, b) => {
  //       const getCrDate = (item) => new Date(latestCrDateMap[item.p_id] ?? 0);
  //       return getCrDate(b) - getCrDate(a); // Latest cr_date first
  //     });
  // }, [searchQuery, projects, credits]);

  useEffect(() => {
    if (
      credits.length > 0 &&
      projects.length > 0 &&
      filteredProjects.length > 0 &&
      debits.length > 0 &&
      posData.length > 0 &&
      billsData.length > 0 &&
      paysData.length > 0 &&
      adjustmentsData.length > 0
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
        if (debit.paid_for === "Customer Adjustment") {
          acc[projectId] =
            (acc[projectId] || 0) + (isNaN(amountPaid) ? 0 : amountPaid);
        }
        return acc;
      }, {});

      const projectCodeMap = projects.reduce((acc, project) => {
        acc[project.code] = project.p_id;
        return acc;
      }, {});

      const poSumMap = posData.reduce((acc, po) => {
        const projectId = projectCodeMap[po.p_id];
        if (projectId) {
          acc[projectId] = (acc[projectId] || 0) + (Number(po.po_value) || 0);
        }
        return acc;
      }, {});

      // const totalMW = Math.round(
      //   projects.reduce((sum, project) => sum + (project.project_kwp || 0), 0)
      // );

      const amountPaidSumMap = posData.reduce((acc, po) => {
        const poNumber = po.po_number;
        const matchingPayments = paysData.filter(
          (pay) => pay.po_number === poNumber && pay.approved === "Approved"
        );
        const totalPaymentValue = matchingPayments.reduce(
          (sum, pay) => sum + Number(pay.amount_paid || 0),
          0
        );
        const projectId = projectCodeMap[po.p_id] || po.p_id;
        acc[projectId] = (acc[projectId] || 0) + totalPaymentValue;
        return acc;
      }, {});

      const billSumMap = posData.reduce((acc, po) => {
        const poNumber = po.po_number;
        const matchingBills = billsData.filter(
          (bill) => bill.po_number === poNumber
        );

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

      const merged = filteredProjects.map((project) => {
        const projectId = project.p_id;
        const totalCredit = creditSumMap[projectId] || 0;
        const totalDebits = debitSumMap[projectId] || 0;
        const oldAmount = totalCredit - totalDebits || 0;
        const customerAdjustment = customerAdjustmentSumMap[projectId] || 0;
        const totalPoValue = poSumMap[projectId] || 0;
        const totalBillValue = billSumMap[projectId] || 0;
        const advancePaid = amountPaidSumMap[projectId] || 0;
        const projectMW = Number(project.project_kwp) || 0;

        const netBalance = totalCredit - customerAdjustment;
        const balanceSlnko = netBalance - advancePaid;
        const netAdvance = advancePaid - totalBillValue;
        const balancePayable = totalPoValue - totalBillValue - netAdvance;

        const tcs =
          netBalance > 5000000 ? Math.round((netBalance - 5000000) * 0.001) : 0;
        const balanceRequired = balanceSlnko - balancePayable - tcs;

        return {
          ...project,
          projectMW: projectMW,
          creditAmount: Math.round(totalCredit),
          debitAmount: totalDebits,
          oldAmount: oldAmount,
          balanceSlnko: Math.round(balanceSlnko),
          balancePayable: Math.round(balancePayable),
          balanceRequired: Math.round(balanceRequired),
        };
      });

      setMergedData(merged);

      const total = merged.reduce(
        (acc, project) => {
          acc.totalBalanceSlnko += project.balanceSlnko || 0;
          acc.totalBalancePayable += project.balancePayable || 0;
          acc.totalBalanceRequired += project.balanceRequired || 0;
          acc.totalCreditSum += project.creditAmount || 0;
          acc.totalDebitSum += project.debitAmount || 0;
          acc.totalmWSum += project.projectMW || 0;
          return acc;
        },
        {
          totalBalanceSlnko: 0,
          totalBalancePayable: 0,
          totalBalanceRequired: 0,
          totalCreditSum: 0,
          totalDebitSum: 0,
          totalmWSum: 0,
        }
      );

      total.totalAmountAvailable = total.totalCreditSum - total.totalDebitSum;

      setTotals(total);
    }
  }, [
    credits,
    projects,
    filteredProjects,
    debits,
    posData,
    billsData,
    paysData,
  ]);

  const RowMenu = ({ currentPage, p_id }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);
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
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.name === "admin") && (
              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = p_id;
                  localStorage.setItem("add_money", projectId);
                  navigate(`/add_money?page=${page}&p_id=${projectId}`);
                }}
              >
                <AddCircleOutlineIcon />
                <Typography>Add Money</Typography>
              </MenuItem>
            )}

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

  const filteredAndSortedData = useMemo(() => {
    return mergedData.sort((a, b) => {
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
  }, [mergedData, searchQuery]);

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
        // "View More",
        // "Aggregate Plant Capacity",
        // "Aggregate Credit",
        // "Aggregate Debit",
        // "Aggregate Available(Old)",
        // "Aggregate Balance Slnko",
        // "Aggregate Balance Payable to Vendors",
        // "Balance Required",
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
        project.balanceSlnko || "-",
        project.balancePayable || "-",
        project.balanceRequired || "-",
        // project.view_more,
        // project.totalmWSum || "-",
        // project.totalCreditSum || "-",
        // project.totalDebitSum || "-",
        // project.totalAmountAvailable || "-",
        // project.totalBalanceSlnko || "-",
        // project.totalBalancePayable || "-",
        // project.totalBalanceRequired || "-",
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

  const tdStyle = {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
    // color: "#1f2937",
    color: 'text.primary',
    bgcolor: 'background.surface',
  };

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
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
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

      {/* <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%"},
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
                  fontWeight: 800,
                }}
              >
                {totals.totalmWSum?.toLocaleString("en-IN")} MW AC
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalCreditSum?.toLocaleString("en-IN") || 0}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalDebitSum?.toLocaleString("en-IN") || 0}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalAmountAvailable?.toLocaleString("en-IN") || 0}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalBalanceSlnko.toLocaleString("en-IN") || 0}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalBalancePayable.toLocaleString("en-IN") || 0}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: 800,
                }}
              >
                {totals.totalBalanceRequired.toLocaleString("en-IN") || 0}
              </td>
            </tr>
          </tbody>
        </table>
      </Box> */}

      <Box
         sx={{
          marginLeft: { xl: '15%', lg: '18%', xs: '0%' },
          maxWidth: { xl: '85%', xs: '100%' },
          p: 2,
          bgcolor: 'background.surface',
          borderRadius: 'md',
          boxShadow: 'lg',
        }}
      >
        {/* Classic Table View (sm and up) */}
        <Box sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: theme.vars.palette.background.level1 }}>
                {[
                  "Total Plant Capacity (MW AC)",
                  "Total Credit",
                  "Total Debit",
                  "Available Amount (Old)",
                  "Balance with Slnko",
                  "Balance Payable to Vendors",
                  "Balance Required",
                ].map((header, i) => (
                  <th
                  key={i}
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    borderBottom: `1px solid ${theme.vars.palette.divider}`,
                    whiteSpace: 'nowrap',
                    color: theme.vars.palette.text.primary,
                  }}
                >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <td key={i} style={tdStyle}>
                      <Skeleton height={20} />
                    </td>
                  ))}
                </tr>
              ) : (
                <tr>
                  <td style={tdStyle}>
                    {totals.totalmWSum?.toLocaleString("en-IN")} MW AC
                  </td>
                  <td style={tdStyle}>
                    {totals.totalCreditSum?.toLocaleString("en-IN") || 0}
                  </td>
                  <td style={tdStyle}>
                    {totals.totalDebitSum?.toLocaleString("en-IN") || 0}
                  </td>
                  <td style={tdStyle}>
                    {totals.totalAmountAvailable?.toLocaleString("en-IN") || 0}
                  </td>
                  <td style={tdStyle}>
                    {totals.totalBalanceSlnko?.toLocaleString("en-IN") || 0}
                  </td>
                  <td style={tdStyle}>
                    {totals.totalBalancePayable?.toLocaleString("en-IN") || 0}
                  </td>
                  <td style={tdStyle}>
                    {totals.totalBalanceRequired?.toLocaleString("en-IN") || 0}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Mobile Stacked View (xs only) */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}
                >
                  <Skeleton height={20} width="50%" />
                  <Skeleton height={20} width="30%" />
                </Box>
              ))
            : [
                {
                  label: "Total Plant Capacity (MW AC)",
                  value: `${totals.totalmWSum?.toLocaleString("en-IN")} MW AC`,
                },
                {
                  label: "Total Credit",
                  value: totals.totalCreditSum?.toLocaleString("en-IN") || 0,
                },
                {
                  label: "Total Debit",
                  value: totals.totalDebitSum?.toLocaleString("en-IN") || 0,
                },
                {
                  label: "Available Amount (Old)",
                  value:
                    totals.totalAmountAvailable?.toLocaleString("en-IN") || 0,
                },
                {
                  label: "Balance with Slnko",
                  value: totals.totalBalanceSlnko?.toLocaleString("en-IN") || 0,
                },
                {
                  label: "Balance Payable to Vendors",
                  value:
                    totals.totalBalancePayable?.toLocaleString("en-IN") || 0,
                },
                {
                  label: "Balance Required",
                  value:
                    totals.totalBalanceRequired?.toLocaleString("en-IN") || 0,
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <Box sx={{ fontWeight: "bold" }}>{item.label}</Box>
                  <Box>{item.value}</Box>
                </Box>
              ))}
        </Box>
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
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Player
              autoplay
              loop
              src={animationData}
              style={{ height: 100, width: 100 }}
            />

            
          </Box>
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
                paginatedPayments
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((project, index) => (
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
                          fontWeight: "400",
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
                          fontWeight: "400",
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
                          fontWeight: "400",
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
                          fontWeight: "400",
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
                          fontWeight: "400",
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
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.creditAmount || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.debitAmount || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.oldAmount || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.balanceSlnko || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.balancePayable || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(project.balanceRequired || 0)}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                          fontWeight: "400",
                        }}
                      >
                        <RowMenu
                          currentPage={currentPage}
                          p_id={project.p_id}
                        />
                      </Box>

                    </Box>
                  ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={12}
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
                        No Balance available
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
