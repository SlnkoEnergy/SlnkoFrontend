import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Axios from "../utils/Axios";

function VendorBillSummary() {
  const [poData, setPoData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [matchingData, setMatchingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Fetch Purchase Order data (get-all-po)
  useEffect(() => {
    async function fetchPoData() {
      try {
        const response = await Axios.get("/get-all-pO-IT");
        // console.log("PO Data:", response.data.data);
        setPoData(response.data.data);
      } catch (error) {
        console.error("Error fetching PO data:", error);
      }
    }
    fetchPoData();
  }, []);

  // Fetch Bill data (get-all-bill)
  useEffect(() => {
    async function fetchBillData() {
      try {
        const response = await Axios.get("/get-all-bilL-IT");
        // console.log("Bill Data:", response.data.data); // Check Bill Data
        setBillData(response.data.data);
      } catch (error) {
        console.error("Error fetching Bill data:", error);
      }
    }
    fetchBillData();
  }, []);

  useEffect(() => {
    if (poData.length && billData.length) {
      const matchedData = poData.flatMap((po) => {
        const matchedBills = billData.filter(
          (bill) => bill.po_number === po.po_number
        );

        if (matchedBills.length > 0) {
          const totalBilled = matchedBills.reduce(
            (sum, b) => sum + parseFloat(b.bill_value || 0),
            0
          );

          return matchedBills.map((bill) => ({
            p_id: po.p_id,
            po_number: po.po_number,
            vendor: po.vendor,
            item: po.item,
            bill_number: bill.bill_number,
            bill_date: bill.bill_date,
            bill_value: bill.bill_value,
            po_value: po.po_value,
            total_billed: totalBilled,
            po_status:
              totalBilled === po.po_value ? "Fully Billed" : "Bill Pending",
            po_balance: po.po_value - totalBilled,
            received: "Pending",
            approved_by: bill.approved_by,
            created_on: bill.created_on,
            updatedAt: bill.updatedAt,
          }));
        }
        return [];
      });

      console.log("Matched Data:", matchedData);
      setMatchingData(matchedData);
    }
  }, [poData, billData]);

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const BillAcceptance = ({ billNumber }) => {
    const [isAccepted, setIsAccepted] = useState(false);
    const [user, setUser] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
      const userData = getUserData();
      setUser(userData);
    }, []);

    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      return userData ? JSON.parse(userData) : null;
    };

    const handleAcceptance = async () => {
      try {
        const response = await Axios.put("/accepted-by", {
          bill_number: billNumber,
          approved_by: user?.name,
        });

        if (response.status === 200) {
          setIsAccepted(true);
          enqueueSnackbar(`Bill accepted successfully by ${user?.name}`, {
            variant: "success",
          });
        } else {
          enqueueSnackbar("Failed to accept the bill. Please try again.", {
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Failed to accept the bill:", error);
        enqueueSnackbar("This bill has already been accepted.", {
          variant: "error",
        });
      }
    };

    return (
      <Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isAccepted) {
              handleAcceptance();
            }
          }}
        >
          <Box>
            <Button
              type="submit"
              disabled={isAccepted}
              sx={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: isAccepted ? "gray" : "#28a745",
                color: "white",
                cursor: isAccepted ? "not-allowed" : "pointer",
                "&:hover": {
                  backgroundColor: isAccepted ? "gray" : "#218838",
                },
              }}
            >
              {isAccepted ? "Accepted" : "Accept"}
            </Button>
          </Box>
        </form>
      </Box>
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

  const filteredAndSortedData = matchingData
    .filter((payment) => {
      const matchesSearchQuery = [
        "bill_number",
        "po_number",
        "approved",
        "projectCustomer",
        "paid_for",
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
      if (a.bill_number?.toLowerCase().includes(searchQuery)) return -1;
      if (b.bill_number?.toLowerCase().includes(searchQuery)) return 1;
      if (a.po_number.toLowerCase().includes(searchQuery)) return -1;
      if (b.po_number.toLowerCase().includes(searchQuery)) return 1;
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

  const paginatedPayments = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //   const paymentsWithFormattedDate = paginatedPayments.map((payment) => ({
  //     ...payment,
  //     formattedDate: formatDate(payment.dbt_date),
  //   }));
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  // const handleAcceptance = (index) => {
  //   setMatchingData((prevData) =>
  //     prevData.map((row, i) =>
  //       i === index ? { ...row, received: "Accepted" } : row
  //     )
  //   );
  // };

  return (
    <>
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

      <Box
        sx={{
          padding: 3,
          maxWidth: "100%",
          overflow: "auto",
          marginLeft: { xl: "15%", lg: "18%", sm: "0%" },
          minHeight: { xs: "100%", md: "0%" },
        }}
      >
        {/* <Typography
        level="h4"
        component="h1"
        sx={{
          marginBottom: 3,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "primary.main",
        }}
      >
        Vendor Bill Summary
      </Typography> */}

        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: "md",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            component="thead"
            sx={{
              backgroundColor: "neutral.300",
              color: "neutral.900",
            }}
          >
            <Box component="tr">
              {[
                "Project ID",
                "PO NO.",
                "Vendor",
                "Item",
                "Bill No.",
                "Bill Date",
                "Bill Value",
                "PO Value",
                "Total Billed",
                "PO Status",
                "PO Balance",
                "Received",
                "Approved By",
                "Created On",
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    padding: 2,
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((row, index) => (
                <Box
                  component="tr"
                  key={index}
                  sx={{
                    backgroundColor:
                      index % 2 === 0 ? "neutral.100" : "neutral.50",
                    "&:hover": {
                      backgroundColor: "neutral.200",
                    },
                  }}
                >
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.p_id}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.po_number}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.vendor}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.item}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.bill_number}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {new Date(row.bill_date).toISOString().slice(0, 10)}
                  </Box>

                  <Box component="td" sx={{ padding: 2 }}>
                    {row.bill_value}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.po_value}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.total_billed}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    <BillingStatusChip status={row.po_status} />
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.po_balance}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    <BillAcceptance billNumber={row.bill_number} />
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.approved_by}
                  </Box>
                  <Box component="td" sx={{ padding: 2 }}>
                    {row.updatedAt || row.created_on}
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={14}
                  sx={{ textAlign: "center", padding: 2 }}
                >
                  No matching data found
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
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
          Showing {paginatedPayments.length} of {matchingData.length} results
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
}

export default VendorBillSummary;
