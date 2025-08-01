import { keyframes } from "@emotion/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, Option, Select, Tooltip } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useExportBillsMutation,
  useGetPaginatedBillsQuery,
} from "../redux/billsSlice";
import Axios from "../utils/Axios";
import dayjs from "dayjs";
import { CalendarSearch } from "lucide-react";

function VendorBillSummary() {
  // const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [selectedbill, setSelectedbill] = useState("");
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [to, setTo] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);

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

  const { data: getBill = [], isLoading } = useGetPaginatedBillsQuery({
    page: currentPage,
    pageSize: perPage,
    status: selectedbill,
    search: searchQuery,
    date: date,
  });

  const [exportBills, { isLoading: isExporting }] = useExportBillsMutation();

  const { data: getBillData = [], total = 0, count = 0 } = getBill;
  const totalPages = Math.ceil(total / perPage);

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  const getPaginationRange = () => {
    const siblings = 1;
    const pages = [];

    if (totalPages <= 5 + siblings * 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - siblings, 2);
      const right = Math.min(currentPage + siblings, totalPages - 1);

      pages.push(1);
      if (left > 2) pages.push("...");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const bills = useMemo(
    () => (Array.isArray(getBill?.data) ? getBill.data : []),
    [getBill]
  );

  const paginatedPayments = bills;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        return {
          ...Object.fromEntries(prev.entries()),
          page: String(page),
        };
      });
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleExport = async (isExportAll) => {
    try {
      const exportFrom = from ? formatDateToDDMMYYYY(from) : null;
      const exportTo = to ? formatDateToDDMMYYYY(to) : null;
      // const exportAll = !from || !to;

      const res = await exportBills({
        from: exportFrom,
        to: exportTo,
        exportAll: isExportAll,
      }).unwrap();

      const url = URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bills_export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export bills");
    }
  };

  const BillAcceptance = ({ billNumber, approvedBy }) => {
    const [isAccepted, setIsAccepted] = useState(Boolean(approvedBy));
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
        const token = localStorage.getItem("authToken");

        if (!token) throw new Error("No auth token found in localStorage.");

        const response = await Axios.put(
          "/accepted-by",
          {
            bill_number: billNumber,
            approved_by: user?.name,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

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
        {isAccepted ? (
          <Tooltip
            title={`Approved by: ${approvedBy || user?.name || "Unknown"}`}
            variant="soft"
          >
            <Typography
              level="body-sm"
              sx={{
                color: "#666",
                fontWeight: 500,
                mt: 0.5,
                display: "flex",
                flexDirection: "column",
                cursor: "help",
              }}
            >
              Approved
            </Typography>
          </Tooltip>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAcceptance();
            }}
          >
            <IconButton
              variant="solid"
              color="success"
              onClick={handleAcceptance}
              size="sm"
              sx={{
                boxShadow: "0 2px 6px rgba(0, 128, 0, 0.2)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 10px rgba(0, 128, 0, 0.3)",
                  backgroundColor: "rgba(76, 175, 80, 0.15)",
                  "& .CheckIcon": {
                    color: "#000",
                  },
                },
                cursor: "pointer",
              }}
            >
              <CheckRoundedIcon className="CheckIcon" />
            </IconButton>
          </form>
        )}
      </Box>
    );
  };

  const BillingStatusChip = ({ status, balance }) => {
    const isFullyBilled = status === "Fully Billed" && balance === 0;
    const isPending = status === "Bill Pending";

    const label = isFullyBilled
      ? "Fully Billed"
      : isPending
        ? `${balance} - Pending`
        : status;

    const icon = isFullyBilled ? (
      <CheckRoundedIcon />
    ) : isPending ? (
      <AutorenewRoundedIcon />
    ) : null;

    const color = isFullyBilled ? "success" : isPending ? "warning" : "neutral";

    return (
      <Chip variant="soft" size="sm" startDecorator={icon} color={color}>
        {label}
      </Chip>
    );
  };

  const renderFilters = () => {
    const bill_status = ["Fully Billed ", "Bill Pending"];

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Bill Status</FormLabel>
          <Select
            value={selectedbill}
            onChange={(e, newValue) => {
              setSelectedbill(newValue);
              setCurrentPage(1);
            }}
            size="sm"
            placeholder="Select Department"
          >
            <Option value="">All status</Option>
            {bill_status.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>From Date</FormLabel>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>To Date</FormLabel>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>
        <Box mt={3} sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="sm"
            color="primary"
            onClick={() => handleExport(false)}
            loading={isExporting}
            disabled={!from || !to}
            startDecorator={<CalendarMonthIcon />}
          >
            Export by Date
          </Button>

          <Button
            variant="soft"
            size="sm"
            color="neutral"
            onClick={() => handleExport(true)}
            startDecorator={<DownloadIcon />}
          >
            Export All
          </Button>
        </Box>
        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>Date Filter</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              const rawDate = e.target.value;
              const formatted = dayjs(rawDate).format("DD/MM/YYYY");
              setDate(formatted);
              setCurrentPage(1);
            }}
          />
        </FormControl>
      </Box>
    );
  };
  const RenderTableCell = ({ cell }) => {
    return (
      <Box component="td" sx={{ padding: 2, fontSize: 14, fontWeight: 600 }}>
        {cell}
      </Box>
    );
  };

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
        {renderFilters()}
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
                // "PO Balance",
                "Received",
                // "Approved By",
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
            {isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={14}
                  sx={{
                    py: 5,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography fontStyle="italic">
                      Loading bills… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : paginatedPayments.length > 0 ? (
              paginatedPayments.map((row, index) =>
                row.bills.map((bill, billIndex) => (
                  <Box
                    component="tr"
                    key={`${index}-${billIndex}`}
                    sx={{
                      backgroundColor:
                        index % 2 === 0 ? "neutral.100" : "neutral.50",
                      "&:hover": {
                        backgroundColor: "neutral.200",
                      },
                    }}
                  >
                    <RenderTableCell cell={row?.p_id} />
                    <Box
                      component="td"
                      sx={{ padding: 2, fontSize: 14, minWidth: 200 }}
                    >
                      {row.po_number}
                    </Box>
                    <Box
                      component="td"
                      sx={{ padding: 2, fontSize: 14, minWidth: 250 }}
                    >
                      {row.vendor}
                    </Box>
                    <Box component="td" sx={{ padding: 2, fontSize: 14 }}>
                      {row.item}
                    </Box>
                    <Box component="td" sx={{ padding: 2, fontSize: 14 }}>
                      {bill.bill_number}
                    </Box>
                    <Box component="td" sx={{ padding: 2, fontSize: 14 }}>
                      {new Date(bill.bill_date).toLocaleDateString()}
                    </Box>
                    <Box
                      component="td"
                      sx={{ padding: 2, fontSize: 14, minWidth: 100 }}
                    >
                      ₹{bill.bill_value}
                    </Box>
                    <Box component="td" sx={{ padding: 2, fontSize: 14 }}>
                      ₹{row.po_value}
                    </Box>
                    <Box
                      component="td"
                      sx={{ padding: 2, fontSize: 14, minWidth: 110 }}
                    >
                      ₹{row.total_billed}
                    </Box>
                    <Box component="td" sx={{ padding: 2, fontSize: 14 }}>
                      <BillingStatusChip
                        status={row.po_status}
                        balance={row.po_balance}
                      />
                    </Box>
                    {/* <Box component="td" sx={{ padding: 2 }}>
                      {row.po_balance}
                    </Box> */}
                    <Box component="td" sx={{ padding: 2 }}>
                      <BillAcceptance
                        billNumber={bill.bill_number}
                        approvedBy={bill.approved_by}
                      />
                    </Box>
                    {/* <Box component="td" sx={{ padding: 2 }}>
                      {bill.approved_by}
                    </Box> */}
                    <Box
                      component="td"
                      sx={{ padding: 2, minWidth: 120, fontSize: 14 }}
                    >
                      {dayjs(bill.created_on).format("DD/MM/YYYY")}
                    </Box>
                  </Box>
                ))
              )
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={14}
                  sx={{ textAlign: "center", p: 2 }}
                >
                  No bills found.
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
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
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
          {/* Showing page {currentPage} of {totalPages} ({total} results) */}
          <Typography level="body-sm">
            Showing {startIndex}–{endIndex} of {total} results
          </Typography>
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {getPaginationRange().map((page, idx) =>
            page === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                ...
              </Box>
            ) : (
              <IconButton
                key={page}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            )
          )}
        </Box>

        <FormControl size="sm" sx={{ minWidth: 120 }}>
          {/* <FormLabel>Per Page</FormLabel> */}
          <Select
            value={perPage}
            onChange={(e, newValue) => {
              setPerPage(newValue);
              setCurrentPage(1);
            }}
          >
            {[10, 30, 60, 100].map((num) => (
              <Option key={num} value={num}>
                {num} perPage
              </Option>
            ))}
          </Select>
        </FormControl>

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
