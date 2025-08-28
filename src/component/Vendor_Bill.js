import { keyframes } from "@emotion/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, Option, Select, Sheet, Tooltip } from "@mui/joy";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useExportBillsMutation,
  useGetAllBillsQuery,
} from "../redux/billsSlice";
import Axios from "../utils/Axios";
import dayjs from "dayjs";

function VendorBillSummary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const selectedbill = searchParams.get("status") || "";
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [from, setFrom] = useState("");
  const [date, setDate] = useState("");
  const [to, setTo] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);
  const po_number = searchParams.get("po_number");
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

  const { data: getBill = {}, isLoading } = useGetAllBillsQuery({
    page: currentPage,
    pageSize: perPage,
    status: selectedbill,
    search: searchQuery,
    date: date,
    po_number: po_number,
  });

  const [exportBills, { isLoading: isExporting }] = useExportBillsMutation();
  const {
    data: getBillData = [],
    total = 0,
    count = 0,
    page = 0,
    pageSize = 0,
    totalPages = 0,
  } = getBill;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

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

  const capitalize = (str = "") =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const BillingStatusChip = ({ status, balance }) => {
    const isFullyBilled = status === "fully billed";
    const isPending = status === "waiting bills";

    const rawLabel = isFullyBilled
      ? "Fully Billed"
      : isPending
        ? `${balance} - Waiting Bills`
        : status;

    const label = capitalize(rawLabel);

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

  const handleStatusChange = (newValue) => {
    setSearchParams({
      page: 1,
      pageSize: perPage,
      status: newValue,
    });
  };

  const renderFilters = () => {
    const bill_status = ["fully billed ", "waiting bills"];

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
            onChange={(e, newValue) => handleStatusChange(newValue)}
            size="sm"
            placeholder="Select Bill Status"
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
      <Box
        component="td"
        sx={{
          borderBottom: "1px solid #ddd",
          padding: "8px",
          textAlign: "left",
        }}
      >
        {cell}
      </Box>
    );
  };
  const handlePerPageChange = (newValue) => {
    setPerPage(newValue);
    setSearchParams({
      page: 1,
      pageSize: newValue,
      status: selectedbill,
      search: searchQuery,
      date: date,
    });
  };

  const navigate = useNavigate();
  return (
    <>
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
        {renderFilters()}
      </Box>

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
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <Box
            component="thead"
            sx={{
              backgroundColor: "neutral.softBg",
            }}
          >
            <Box component="tr">
              {[
                "Bill No.",
                "Bill Date",
                "Bill Value",
                "Total Billed",
                "Category",
                "Project ID",
                "PO NO.",
                "Vendor",
                "PO Value",
                "PO Status",
                "Received",
                "Created On",
              ]?.map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    position: "sticky",
                    top: 0,
                    background: "#e0e0e0",
                    zIndex: 2,
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
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography fontStyle="italic">
                      Loading bills… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : bills.length > 0 ? (
              bills.map((bill, index) => (
                <Box
                  component="tr"
                  key={bill.bill_no || index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
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
                    <Chip
                      variant="outlined"
                      color="primary"
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/add_bill?mode=edit&_id=${bill._id}`)
                      }
                    >
                      {bill.bill_no}
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
                    {dayjs(bill.bill_date).format("DD/MM/YYYY")}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    ₹{Number(bill.bill_value).toFixed(2)}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    ₹{Number(bill.total_billed).toFixed(2)}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {Array.isArray(bill.item) && bill.item.length > 0
                      ? (() => {
                          const uniqueNames = [
                            ...new Set(
                              bill.item
                                .map((it) => it?.category_name)
                                .filter(Boolean)
                            ),
                          ];

                          const first = uniqueNames[0];
                          const remaining = uniqueNames.slice(1);

                          return (
                            <>
                              {first}
                              {remaining.length > 0 && (
                                <Tooltip title={remaining.join(", ")} arrow>
                                  <Box
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 1,
                                      borderRadius: "50%",
                                      backgroundColor: "primary.solidBg",
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minWidth: "22px",
                                      height: "22px",
                                      lineHeight: 1,
                                      cursor: "pointer",
                                    }}
                                  >
                                    +{remaining.length}
                                  </Box>
                                </Tooltip>
                              )}
                            </>
                          );
                        })()
                      : bill.item?.category_name || "-"}
                  </Box>

                  <RenderTableCell cell={bill.project_id} />

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "12px",
                      textAlign: "left",
                    }}
                  >
                    {bill.po_no}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {bill.vendor}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    ₹{bill.po_value}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <BillingStatusChip
                      status={bill.po_status}
                      balance={(bill.po_value - bill.total_billed).toFixed(2)}
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
                    <BillAcceptance
                      billNumber={bill.bill_no}
                      approvedBy={bill.approved_by_name}
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
                    {dayjs(bill.created_on).format("DD/MM/YYYY")}
                  </Box>
                </Box>
              ))
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
      </Sheet>

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
          {getPaginationRange()?.map((page, idx) =>
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
          <Select
            value={perPage}
            onChange={(e, newValue) => handlePerPageChange(newValue)}
          >
            {[10, 30, 60, 100].map((num) => (
              <Option key={num} value={num}>
                {num}
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
