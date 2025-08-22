import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import LinearProgress from "@mui/joy/LinearProgress";
import FormControl from "@mui/joy/FormControl";
import CloseIcon from "@mui/icons-material/Close";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import CheckIcon from "@mui/icons-material/Check";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import Axios from "../utils/Axios";
import { useGetUtrSubmissionQuery } from "../redux/Accounts";
import dayjs from "dayjs";
import { CircularProgress } from "@mui/joy";
import { EditIcon } from "lucide-react";

function UTRPayment() {
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
  } = useGetUtrSubmissionQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  const totalPages = Math.ceil(total / perPage);

  // console.log(paginatedData);

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

  const UTRRow = ({ payId, crId, initialUTR = "", onSuccess }) => {
    const { enqueueSnackbar } = useSnackbar();

    // Prefer CR flow if CR id is present (so overwrite is allowed)
    const preferCr = useMemo(() => Boolean(crId), [crId]);

    const [utr, setUtr] = useState(initialUTR ?? "");
    const [submitted, setSubmitted] = useState(Boolean(initialUTR));
    const [isEditing, setIsEditing] = useState(preferCr && Boolean(initialUTR)); // allow editing by default for CR rows
    const [progressVisible, setProgressVisible] = useState(false);

    const hasPay = Boolean(payId);
    const hasCr = Boolean(crId);

    const callApi = async (useCr, value) => {
      const token = localStorage.getItem("authToken");
      const payload = useCr
        ? { cr_id: crId, utr: value }
        : { pay_id: payId, utr: value };
      return Axios.put("/utr-update", payload, {
        headers: { "x-auth-token": token },
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!hasPay && !hasCr) {
        enqueueSnackbar("Missing pay_id or cr_id.", { variant: "error" });
        return;
      }

      const trimmed = (utr || "").trim();
      if (!trimmed) {
        enqueueSnackbar("Please enter a valid UTR.", { variant: "warning" });
        return;
      }

      setProgressVisible(true);
      try {
        // 1) try with preferred path (CR first if available)
        const firstTryIsCr = preferCr;
        let resp;

        try {
          resp = await callApi(firstTryIsCr, trimmed);
        } catch (err1) {
          const msg1 = err1?.response?.data?.message?.toLowerCase?.() || "";
          const canFallback =
            ((firstTryIsCr && hasPay) || (!firstTryIsCr && hasCr)) &&
            /already|exists/.test(msg1); // generic check to fallback when "already present"

          if (canFallback) {
            // 2) fallback to the other id (e.g., if we hit pay path and got "already present", retry with CR)
            resp = await callApi(!firstTryIsCr, trimmed);
          } else {
            throw err1;
          }
        }

        if (resp?.status === 200) {
          enqueueSnackbar(
            resp?.data?.message || "UTR submitted successfully!",
            { variant: "success" }
          );
          setSubmitted(true);
          setIsEditing(false);
          setUtr(trimmed);
          onSuccess?.(trimmed, resp?.data);
        } else {
          enqueueSnackbar("Submission failed!", { variant: "error" });
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Network error or server not reachable.";
        enqueueSnackbar(msg, { variant: "error" });
      } finally {
        setProgressVisible(false);
      }
    };

    const canEdit =
      submitted &&
      (preferCr || true); /* set false if you never want payId edits */

    return (
      <Sheet
        variant="soft"
        sx={{
          p: 2,
          borderRadius: "md",
          boxShadow: "sm",
          width: 300,
          textAlign: "center",
        }}
      >
        {!submitted || isEditing ? (
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Enter UTR"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              sx={{ mt: 1 }}
              required
            />

            <Box mt={1} display="flex" gap={1}>
              <Button
                type="submit"
                fullWidth
                variant="solid"
                color="primary"
                disabled={progressVisible}
              >
                {progressVisible
                  ? "Submitting..."
                  : submitted
                    ? "Update UTR"
                    : "Submit UTR"}
              </Button>

              {submitted && (
                <Button
                  type="button"
                  variant="outlined"
                  color="neutral"
                  onClick={() => {
                    setIsEditing(false);
                    setUtr(initialUTR || "");
                  }}
                  startDecorator={<CloseIcon fontSize="small" />}
                >
                  Cancel
                </Button>
              )}
            </Box>

            {progressVisible && (
              <LinearProgress
                variant="plain"
                sx={{ mt: 1, borderRadius: "sm", height: 3 }}
              />
            )}
          </form>
        ) : (
          <Box mt={1}>
            <Typography level="body-sm" mb={1}>
              UTR: <b>{utr}</b>
            </Typography>
            <Box
              display="flex"
              gap={1}
              justifyContent="center"
              alignItems="center"
            >
              <Chip
                color="success"
                variant="solid"
                startDecorator={<CheckIcon fontSize="small" />}
              >
                Submitted
              </Chip>
              {canEdit && (
                <IconButton
                  size="sm"
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                  title="Edit UTR"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Sheet>
    );
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

  const MatchRow = ({ accountStatus, requestedAmount }) => (
    <Box mt={1}>
      <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
        <Typography sx={labelStyle}>💰 Amount Requested:</Typography>
        <Typography
          sx={{ ...valueStyle, wordBreak: "break-word", fontSize: "14px" }}
        >
          {requestedAmount || "—"}
        </Typography>
      </Box>

      <Box display="flex" alignItems="flex-start" gap={1}>
        <Typography sx={labelStyle}>📑 Account Verification:</Typography>
        {accountStatus === "matched" ? (
          <Chip
            color="success"
            variant="soft"
            size="sm"
            startDecorator={<CheckIcon fontSize="small" />}
          >
            Matched
          </Chip>
        ) : (
          <Typography sx={{ ...valueStyle, wordBreak: "break-word" }}>
            {accountStatus || "Pending"}
          </Typography>
        )}
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
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
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
                "UTR Submit",
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
                  colSpan={8}
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

                  <Box component="td" sx={{ ...cellStyle, minWidth: 300 }}>
                    <MatchRow
                      accountStatus={payment.accountStatus}
                      requestedAmount={payment.requestedAmount}
                    />
                  </Box>

                  <Box component="td" sx={cellStyle}>
                    <UTRRow
                      key={`${payment?.pay_id ?? ""}-${payment?.cr_id ?? ""}-${payment?.utr ?? ""}`} // ensures remount when data changes
                      payId={payment?.pay_id || undefined}
                      crId={payment?.cr_id || undefined} // ← always pass if available
                      initialUTR={payment?.utr || ""}
                      onSuccess={(newUtr, resp) => {
                        refetch?.();
                      }}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={8}
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
                      No UTR available
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
export default UTRPayment;
