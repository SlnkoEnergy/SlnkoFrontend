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
const AccountMatchAndUTR = ({ paymentId, crId, initialAccMatch, onAccountMatchSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [isMatched, setIsMatched] = useState(
    initialAccMatch?.toLowerCase() === "matched"
  );
  const [accountMatch, setAccountMatch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccountMatch = async () => {
    if (!accountMatch.trim()) {
      setError("Account Number required.");
      return;
    }
    if (!paymentId && !crId) {
      setError("Missing identifier: provide pay_id or cr_id.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        acc_number: accountMatch.trim(),
        ifsc: ifsc.trim(), // no validation, send as-is
      };
      if (paymentId) payload.pay_id = String(paymentId).trim();
      if (crId) payload.cr_id = String(crId).trim();

      const response = await Axios.put("/acc-matched", payload, {
        headers: { "x-auth-token": token },
      });

      const doc = response?.data?.data;
      const accMatchValue =
        doc?.acc_match || response?.data?.acc_match || "";

      if (response.status === 200 && String(accMatchValue).toLowerCase() === "matched") {
        setIsMatched(true);
        enqueueSnackbar("Account matched successfully!", { variant: "success" });
        onAccountMatchSuccess?.({ paymentId, crId, doc });
      } else {
        enqueueSnackbar("Could not confirm match from server response.", {
          variant: "warning",
        });
      }
    } catch (err) {
      console.error("Error during account match:", err);

      if (!window.navigator.onLine) {
        enqueueSnackbar("No internet connection. Check your network.", {
          variant: "error",
        });
      } else if (err?.response?.status === 404) {
        enqueueSnackbar("No matching record found. Verify pay_id/cr_id and bank details.", {
          variant: "error",
        });
      } else if (err?.response?.status === 400) {
        enqueueSnackbar(err?.response?.data?.message || "Invalid request.", {
          variant: "error",
        });
      } else if (err?.response?.status === 409) {
        enqueueSnackbar(err?.response?.data?.message || "Already matched/Conflict.", {
          variant: "warning",
        });
      } else {
        enqueueSnackbar("Account match failed. Please recheck details.", {
          variant: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "md",
        border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
        bgcolor: "background.body",
      }}
    >
      {!isMatched ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSubmitting) handleAccountMatch();
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
              onChange={(e) => setIfsc(e.target.value)} // no uppercase enforcement
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
            loading={isSubmitting}
            disabled={isSubmitting || !accountMatch || (!paymentId && !crId)}
          >
            Match Account
          </Button>
        </form>
      ) : (
        <Box mt={1} display="flex" gap={1} alignItems="center">
          <Chip variant="soft" color="success" startDecorator={<CheckIcon />}>
            Account Matched
          </Chip>
        </Box>
      )}
    </Box>
  );
};

  const handleAccountMatchSuccess = ({ paymentId, crId, doc }) => {
  console.log("Account No and Ifsc submission was successful:", paymentId, crId, doc);
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

     <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
            🏢 Vendor:
          </Typography>
          <Chip color="danger" size="sm" variant="solid" sx={{ fontSize: 12 }}>
            {vendor}
          </Chip>
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
                      crId={payment.cr_id}
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
