import { keyframes } from "@emotion/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, Option, Select, Sheet, Tooltip } from "@mui/joy";
import Checkbox from "@mui/joy/Checkbox";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllBillsQuery } from "../redux/billsSlice";
import Axios from "../utils/Axios";
import dayjs from "dayjs";


function VendorBillSummary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // search text & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);

  const po_number = searchParams.get("po_number") || "";
  const dateFilterEnd = searchParams.get("to") || "";
  const dateFilterFrom = searchParams.get("from") || "";
  const selectStatus = searchParams.get("status") || "";
  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Optional user data (kept)
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const { data: getBill = {}, isLoading } = useGetAllBillsQuery({
    page: currentPage,
    pageSize: perPage,
    po_number: po_number,
    search: searchQuery,
    dateFrom: dateFilterFrom,
    dateEnd: dateFilterEnd,
    status: selectStatus,
  });

  const {
    data: billsData = [],
    total = 0,
    count = 0,
    page = 0,
    pageSize = 0,
    totalPages = 0,
  } = getBill;

  const bills = useMemo(
    () => (Array.isArray(getBill?.data) ? getBill.data : []),
    [getBill]
  );

  // const po_number = bills.map(b=>b?.po_no);

  // console.log("All Bills are",bills);

  // console.log("PO Numbers:", po_number);

  useEffect(() => {
    setSelectedIds([]);
  }, [bills, currentPage, perPage]);

  useEffect(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  // Pagination
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(pageNum));
        return next;
      });
    }
  };

  const handlePerPageChange = (newValue) => {
    setPerPage(newValue);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      next.set("pageSize", String(newValue));
      return next;
    });
  };


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

  // Selection handlers
  const allIdsOnPage = useMemo(
    () => bills.map((b) => b._id).filter(Boolean),
    [bills]
  );
  const isAllSelected =
    allIdsOnPage.length > 0 && selectedIds.length === allIdsOnPage.length;
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = (checked) => {
    if (checked) setSelectedIds(allIdsOnPage);
    else setSelectedIds([]);
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const capitalize = (s = "") =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const BillingStatusChip = ({ status, balance }) => {
    const isFullyBilled = status === "fully billed";
    const isPending = status === "waiting bills";
    const rawLabel = isFullyBilled
      ? "Fully Billed"
      : isPending
        ? `${balance} - Waiting Bills`
        : status;
    return (
      <Chip
        variant="soft"
        size="sm"
        startDecorator={
          isFullyBilled ? (
            <CheckRoundedIcon />
          ) : isPending ? (
            <AutorenewRoundedIcon />
          ) : null
        }
        color={isFullyBilled ? "success" : isPending ? "warning" : "neutral"}
      >
        {capitalize(rawLabel)}
      </Chip>
    );
  };

  const BillAcceptance = ({
    billNumber,
    poNumber,
    approvedBy,
    currentUser,
  }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isAccepted, setIsAccepted] = useState(Boolean(approvedBy));
    const [loading, setLoading] = useState(false);

    const pickSuccessMessage = (res, fallback) => {
      const d = res?.data;
      return d?.msg || d?.message || fallback;
    };

    const pickErrorMessage = (err) => {
      const d = err?.response?.data;
      return (
        d?.message ||
        d?.msg ||
        (Array.isArray(d?.errors) && d.errors[0]?.msg) ||
        d?.error ||
        err?.response?.statusText ||
        err?.message ||
        "Something went wrong."
      );
    };

    const statusToVariant = (status) => {
      if (status === 409) return "warning";
      if (status === 400 || status === 422) return "warning";
      if (status === 401 || status === 403 || status === 404) return "error";
      if (status >= 500) return "error";
      return "error";
    };

    // --- normalize array or string -> string
    const firstNonEmpty = (val) => {
      if (Array.isArray(val)) {
        const first = val.find((x) => x && String(x).trim().length > 0);
        return first ? String(first).trim() : "";
      }
      return val ? String(val).trim() : "";
    };

    const handleAcceptance = async () => {
      if (loading || isAccepted) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");

        const po_number = firstNonEmpty(poNumber);
        const bill_number = firstNonEmpty(billNumber);

        if (!po_number) {
          enqueueSnackbar("PO number is missing/empty.", {
            variant: "warning",
          });
          return;
        }
        if (!bill_number) {
          enqueueSnackbar("Bill number is missing/empty.", {
            variant: "warning",
          });
          return;
        }

        const res = await Axios.put(
          "/accepted-by",
          { po_number, bill_number },
          { headers: { "x-auth-token": token } }
        );

        if (res.status === 200) {
          setIsAccepted(true);
          enqueueSnackbar(
            pickSuccessMessage(
              res,
              `Bill accepted successfully${currentUser?.name ? ` by ${currentUser.name}` : ""
              }.`
            ),
            { variant: "success" }
          );
        } else {
          enqueueSnackbar("Failed to accept the bill. Please try again.", {
            variant: "error",
          });
        }
      } catch (err) {
        const status = err?.response?.status;
        enqueueSnackbar(pickErrorMessage(err), {
          variant: statusToVariant(status),
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box>
        {isAccepted ? (
          <Tooltip
            title={`Approved by: ${approvedBy || currentUser?.name || "Unknown"
              }`}
            variant="soft"
          >
            <Typography
              level="body-sm"
              sx={{ color: "#666", fontWeight: 500, mt: 0.5, cursor: "help" }}
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
              disabled={loading}
              sx={{
                boxShadow: "0 2px 6px rgba(0, 128, 0, 0.2)",
                transition: "all .2s",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 10px rgba(0, 128, 0, 0.3)",
                },
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            >
              <CheckRoundedIcon />
            </IconButton>
          </form>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Search only */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search Project Id, PO Number, Vendor"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
        >
          <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
            <Box component="tr">
              {/* Select-All header cell */}
              <Box
                component="th"
                sx={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  width: 44,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </Box>

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
              ].map((h, i) => (
                <Box
                  component="th"
                  key={i}
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
                  {h}
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="tbody">
            {isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={15}
                  sx={{ py: 5, textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
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
              bills.map((bill, idx) => {
                const id = bill._id || `${bill.bill_no}-${idx}`;
                const isChecked = selectedIds.includes(id);

                return (
                  <Box
                    component="tr"
                    key={id}
                    sx={{ borderBottom: "1px solid #ddd" }}
                  >
                    {/* Row checkbox */}
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        width: 44,
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={isChecked}
                        onChange={() => toggleRow(id)}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
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
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {dayjs(bill.bill_date).format("DD/MM/YYYY")}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      ₹{Number(bill.bill_value).toFixed(2)}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      ₹{Number(bill.total_billed).toFixed(2)}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {Array.isArray(bill.item) && bill.item.length
                        ? (() => {
                          const unique = [
                            ...new Set(
                              bill.item
                                .map((it) => it?.category_name)
                                .filter(Boolean)
                            ),
                          ];
                          const first = unique[0];
                          const remaining = unique.slice(1);
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

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {bill.project_id}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "12px" }}
                    >
                      {bill.po_no}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {bill.vendor}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      ₹{Number(bill.po_value || 0).toFixed(2)}
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <BillingStatusChip
                        status={bill.po_status}
                        balance={(bill.po_value - bill.total_billed).toFixed(2)}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <BillAcceptance
                        billNumber={bill.bill_no || []}
                        poNumber={bill.po_no || []}
                        approvedBy={bill.approved_by_name}
                        currentUser={user}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {dayjs(bill.created_on).format("DD/MM/YYYY")}
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={15}
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
          pt: 1,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
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
          <Select value={perPage} onChange={(e, v) => handlePerPageChange(v)}>
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
    </Box>
  );
}

export default VendorBillSummary;
