import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import Axios from "../utils/Axios";
import { useGetPaymentApprovedQuery } from "../redux/Accounts";
import { Building2, Calendar, CircleUser, FileText } from "lucide-react";
import { CircularProgress } from "@mui/joy";
import dayjs from "dayjs";

function PaymentRequest() {
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: responseData,
    isLoading,
    refetch,
    error,
  } = useGetPaymentApprovedQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  const totalPages = Math.ceil(total / perPage);

  console.log(paginatedData);

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

  /**Account Match Logic ***/
  const AccountMatchAndUTR = ({ paymentId, onAccountMatchSuccess }) => {
    const { enqueueSnackbar } = useSnackbar();

    // State initialization
    const [isMatched, setIsMatched] = useState(false);
    const [accountMatch, setAccountMatch] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [error, setError] = useState(null);

    // Function to handle account matching
    const handleAccountMatch = async () => {
      if (!accountMatch) {
        setError("Account Number required!!");
        return;
      }

      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        // console.log("Sending account match request...");
        const response = await Axios.put(
          "/acc-matched",
          {
            pay_id: paymentId,
            acc_number: accountMatch,
            ifsc: ifsc,
          },
          {
            headers: { "x-auth-token": token },
          }
        );

        // console.log("Account match response:", response);

        if (response.status === 200) {
          setIsMatched(true);
          enqueueSnackbar("Account matched successfully!", {
            variant: "success",
          });

          if (onAccountMatchSuccess) {
            onAccountMatchSuccess();
          }
        } else {
          enqueueSnackbar("Failed to match account. Please try again.", {
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Error during account match:", error);

        if (!window.navigator.onLine) {
          enqueueSnackbar(
            "No internet connection. Please check your network.",
            {
              variant: "error",
            }
          );
          return;
        }

        if (error.response) {
          const { data } = error.response;

          if (data.message?.includes("account number not matched")) {
            enqueueSnackbar("Account number not matched with our records.", {
              variant: "error",
            });
          } else if (data.message?.includes("ifsc not matched")) {
            enqueueSnackbar("IFSC code not matched with our records.", {
              variant: "error",
            });
          } else {
            enqueueSnackbar("Account match failed. Please check the details.", {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar(
            "An internal error occurred. Please try again later.",
            {
              variant: "error",
            }
          );
        }
      }
    };

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: "md",
          border: "1px solid #d1d5db",
          bgcolor: "#f9fafb",
        }}
      >
        {!isMatched ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAccountMatch();
            }}
          >
            <Typography level="title-md" mb={1}>
              🔒 Account Verification
            </Typography>

            <Tooltip title="Enter the beneficiary's account number">
              <Input
                placeholder="Account Number"
                value={accountMatch}
                onChange={(e) => setAccountMatch(e.target.value)}
                size="sm"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              />
            </Tooltip>

            <Tooltip title="Enter the IFSC code of the bank">
              <Input
                placeholder="IFSC Code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                size="sm"
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
              />
            </Tooltip>

            {error && (
              <Typography level="body-sm" color="danger" mb={1}>
                ⚠️ {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="solid"
              color="primary"
              disabled={isMatched || !accountMatch}
            >
              {isMatched ? "Matched" : "Match Account"}
            </Button>
          </form>
        ) : (
          <Box mt={1}>
            <Chip variant="soft" color="success" startDecorator={<CheckIcon />}>
              Account Matched
            </Chip>
          </Box>
        )}
      </Box>
    );
  };

  const handleAccountMatchSuccess = (paymentId) => {
    console.log("Account No and Ifsc submission was successful:", paymentId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedData.map((row) => row.id));
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

  const renderFilters = () => {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <FormControl size="sm" sx={{ minWidth: 150 }}>
          <FormLabel>Rows Per Page</FormLabel>
          <Select
            value={perPage}
            onChange={(e, newValue) => {
              setPerPage(newValue);
              setCurrentPage(1);
            }}
          >
            {[10, 30, 60, 100].map((num) => (
              <Option key={num} value={num}>
                {num}/Page
              </Option>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "background.surface",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 16px",
    textAlign: "left",
    color: "text.primary",
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const cellStyle = {
    padding: "12px 16px",
    verticalAlign: "top",
    fontSize: 13,
    fontWeight: 400,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Inter, Roboto, sans-serif",
    color: "#2C3E50",
  };

  const valueStyle = {
    fontSize: 13,
    fontWeight: 400,
    fontFamily: "Inter, Roboto, sans-serif",
    color: "#34495E",
  };

  const PaymentID = ({ pay_id, cr_id, createdAt }) => (
    <>
      {(cr_id || pay_id) && (
        <Box>
          <Chip
            variant="solid"
            color="primary"
            size="sm"
            sx={{
              fontWeight: 500,
              fontFamily: "Inter, Roboto, sans-serif",
              fontSize: 14,
              color: "#fff",
              "&:hover": {
                boxShadow: "md",
                opacity: 0.9,
              },
            }}
          >
            {cr_id || pay_id}
          </Chip>
        </Box>
      )}

      {createdAt && (
        <Box display="flex" alignItems="center" mt={0.5} gap={0.8}>
          <Typography sx={labelStyle}>📅 Created Date:</Typography>
          <Typography sx={valueStyle}>
            {dayjs(createdAt).format("DD-MM-YYYY")}
          </Typography>
        </Box>
      )}
    </>
  );

  const ProjectDetail = ({ projectId, projectName }) => (
    <>
      <Box>
        {projectId && (
          <Typography sx={{ ...valueStyle, mb: 0.5 }}>
            📌 {projectId}
          </Typography>
        )}

        {projectName && (
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Typography sx={{ ...labelStyle, minWidth: 110 }}>
              🏗️ Project Name:
            </Typography>
            <Typography
              sx={{ ...valueStyle, wordBreak: "break-word", flex: 1 }}
            >
              {projectName}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );

  const PaymentDetail = ({ requestedFor, paymentDesc, vendor }) => (
    <Box>
      {requestedFor && (
        <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
          <Typography sx={{ ...labelStyle, minWidth: 100 }}>
            📦 Requested For:
          </Typography>
          <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
            {requestedFor}
          </Typography>
        </Box>
      )}

      <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
        <Typography sx={{ ...labelStyle, minWidth: 70 }}>🏢 Vendor:</Typography>
        <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
          {vendor}
        </Typography>
      </Box>

      <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
        <Typography sx={{ ...labelStyle, minWidth: 100 }}>
          🧾 Payment Desc:
        </Typography>
        <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
          {paymentDesc}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          flexWrap: "wrap",
          display: "flex",
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
            placeholder="Search by Pay ID, Customer, or Name"
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
          display: { xs: "flex", sm: "initial" },
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
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ backgroundColor: "neutral.softBg" }}>
              <Box component="th" sx={headerStyle}>
                <Checkbox
                  size="sm"
                  checked={selected.length === paginatedData.length}
                  onChange={handleSelectAll}
                />
              </Box>
              {[
                "Payment Id",
                "Project Id",
                "Requested For",
                "Requested Amount",
                "Bank Detail",
              ].map((label, idx) => (
                <Box key={idx} component="th" sx={headerStyle}>
                  {label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {error ? (
              <Typography color="danger" textAlign="center">
                {error}
              </Typography>
            ) : isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={6}
                  sx={{
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography fontStyle="italic">
                      Loading payments… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((payment, index) => (
                <Box
                  component="tr"
                  key={index}
                  sx={{
                    backgroundColor: "background.surface",
                    borderRadius: "8px",
                    boxShadow: "xs",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "neutral.softHoverBg",
                    },
                  }}
                >
                  <Box component="td" sx={cellStyle}>
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
                      ...cellStyle,
                      minWidth: 280,
                      padding: "12px 16px",
                    }}
                  >
                    <PaymentID
                      pay_id={payment.pay_id}
                      cr_id={payment.cr_id}
                      createdAt={payment.createdAt}
                    />
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      ...cellStyle,
                      minWidth: 280,
                      padding: "12px 16px",
                    }}
                  >
                    <ProjectDetail
                      projectId={payment.projectId}
                      projectName={payment.projectName}
                    />
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                    <PaymentDetail
                      requestedFor={payment.requestedFor}
                      vendor={payment.vendor}
                      paymentDesc={payment.paymentDesc}
                    />
                  </Box>

                  <Box component="td" sx={{ ...cellStyle, minWidth: 250 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      ₹{Number(payment.requestedAmount).toLocaleString("en-IN")}
                    </Typography>
                  </Box>

                  <Box component="td" sx={cellStyle}>
                    <AccountMatchAndUTR
                      paymentId={payment.pay_id}
                      onAccountMatchSuccess={handleAccountMatchSuccess}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={8}
                  sx={{ textAlign: "center", py: 4 }}
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
                      No approved available
                    </Typography>
                  </Box>
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
