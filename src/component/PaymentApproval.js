import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../assets/alert-bell.svg";
import Axios from "../utils/Axios";
import { useGetPaymentApprovalQuery } from "../redux/Accounts";
import { CircularProgress, Modal, ModalDialog, Stack } from "@mui/joy";
import { Calendar, CircleUser, UsersRound } from "lucide-react";

function PaymentRequest() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState([]);
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pdfPayments, setPdfPayments] = useState([]);

  const {
    data: responseData,
    isLoading,
    refetch,
  } = useGetPaymentApprovalQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  // console.log("Payment Approval Data:", paginatedData);

  const totalPages = Math.ceil(total / perPage);

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

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

  const handleStatusChange = async (_id, newStatus) => {
    // console.log("handleStatusChange got:", _id, newStatus);s
    debugger; // Entry point
    if (!user) {
      toast.error("User not found");
      return;
    }

    if (!_id) {
      toast.error("Mongo Id is required for approval.");
      return;
    }

    const { department, role } = user;
    debugger; // Inspect department & role

    const isCAMManager = department === "CAM" && role === "manager";
    const isSCMOrAccountsManager =
      ["SCM", "Accounts"].includes(department) && role === "manager";

    if (isSCMOrAccountsManager) {
      debugger; // SCM/Accounts Manager path
      const success = await handleApprovalUpdate(_id, newStatus);
      if (success) {
        setSelected((prev) => prev.filter((id) => id !== _id));
      }
    } else if (isCAMManager) {
      debugger; // CAM Manager path

      if (!Array.isArray(paginatedData)) {
        toast.error("Payment data is not available yet.");
        return;
      }
      if (!Array.isArray(selected) || selected.length === 0) {
        toast.warn("Please select at least one payment to approve.");
        return;
      }

      const selectedPayments = paginatedData.filter((p) =>
        selected.includes(String(p._id))
      );

      const poIds = selectedPayments
        .map((p) => p?._id)
        .filter((id) => typeof id === "string" && id.trim().length > 0);

      if (poIds.length === 0) {
        toast.error("No valid PO IDs found for PDF generation.");
        return;
      }

      debugger; // Before checking selectedPayments
      if (!selectedPayments || selectedPayments.length === 0) {
        toast.warn("No matching selected payments found in current page.");
        return;
      }

      debugger; // Just before PDF preview
      setPdfPayments(selectedPayments);
      await handleMultiPDFDownload(selectedPayments);
    }
  };

  // === Generate & Preview PDF ===
  const handleMultiPDFDownload = async (payments) => {
    debugger;
    setIsPdfLoading(true);

    if (!Array.isArray(payments) || payments.length === 0) {
      console.error(
        "Expected payments to be a non-empty array, but got:",
        payments
      );
      toast.error("Unable to generate PDF. No valid payments selected.");
      setIsPdfLoading(false);
      return;
    }

    // 💡 Filter out invalid payments (without _id)
    const validPayments = payments.filter((p) => p && p._id);

    if (validPayments.length === 0) {
      toast.error("No valid payment IDs found to generate PDF.");
      setIsPdfLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(
        "/accounting/po-approve-pdf",
        { poIds: validPayments.map((p) => p._id) },
        {
          headers: {
            "x-auth-token": token,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfBlob(blob);
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // === Single Approval Logic ===
  const handleApprovalUpdate = async (_id, newStatus, remarks = "") => {
  try {
    const token = localStorage.getItem("authToken");

    const payload = { _id, status: newStatus };
    if (newStatus === "Rejected") {
      payload.remarks = remarks || "Rejected by manager";
    }

    const response = await Axios.put("/account-approve", payload, {
      headers: { "x-auth-token": token },
    });

    if (response.status === 200) {
      // Backend returns results for each processed ID
      const result = response.data.results?.find(r => r._id === _id);

      if (result?.status === "success") {
        if (newStatus === "Approved") {
          toast.success("Payment Approved!", { autoClose: 3000 });
        } else if (newStatus === "Rejected") {
          toast.error("Payment Rejected", { autoClose: 2000 });
        } else if (newStatus === "Pending") {
          toast.info("Payment marked as Pending", { autoClose: 2000 });
        }

        setHiddenIds(prev => [...prev, _id]);
        return true;
      } else {
        toast.error(result?.message || "Approval failed");
      }
    }
  } catch (error) {
    console.error("Approval update error:", error);
    toast.error(error.response?.data?.message || "Network error. Please try again.");
  }

  return false;
};


  // === Final CAM Batch Approval ===
  const handleCAMBatchApproval = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const idsToApprove = pdfPayments.map((p) => p._id);
      debugger; // Check selected IDs and token

      if (pdfBlob) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "CAM_Approval.pdf";
        link.click();
      }

      const approvalRes = await Axios.put(
  "/account-approve",
  {
    _id: idsToApprove,
    status: "Pending",
  },
  {
    headers: { "x-auth-token": token },
  }
);


      debugger; // After approval
      if (approvalRes.status === 200) {
        toast.success("All payments approved successfully");
        setHiddenIds((prev) => [...prev, ...idsToApprove]);
        setSelected((prev) => prev.filter((id) => !idsToApprove.includes(id)));
        setIsPdfModalOpen(false);
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      debugger; // On error
      console.error("CAM approval failed", error);
      toast.error("Failed to approve payments");
    }
  };

  const RowMenu = ({ _id, onStatusChange }) => (
    <Box sx={{ display: "flex", justifyContent: "left", gap: 1 }}>
      <Chip
        variant="solid"
        color="success"
        label="Approved"
        onClick={() => onStatusChange(_id, "Approved")}
        sx={{ textTransform: "none", fontSize: "0.875rem", fontWeight: 500 }}
        startDecorator={<CheckRoundedIcon />}
      />
      <Chip
        variant="outlined"
        color="danger"
        label="Rejected"
        onClick={() => onStatusChange(_id, "Rejected")}
        sx={{ textTransform: "none", fontSize: "0.875rem", fontWeight: 500 }}
        startDecorator={<BlockIcon />}
      />
    </Box>
  );
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedData.map((row) => String(row._id)));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id, checked) => {
    const idStr = String(_id);
    setSelected((prev) =>
      checked ? [...prev, idStr] : prev.filter((item) => item !== idStr)
    );
  };

  const blobUrl = useMemo(() => {
    return pdfBlob ? URL.createObjectURL(pdfBlob) : null;
  }, [pdfBlob]);

  const handleClosePdfModal = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setPdfBlob(null);
    setIsPdfModalOpen(false);
    setIsConfirmModalOpen(false);
  };

  const renderFilters = () => {
    const hasSelection = selected.length > 0;

    const handlePreviewClick = () => {
      const selectedPayments = paginatedData.filter((p) =>
        selected.includes(String(p._id))
      );
      handleMultiPDFDownload(selectedPayments);
    };

    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {hasSelection && (
          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={handlePreviewClick}
            disabled={isPdfLoading}
            sx={{ ml: "auto", minWidth: 200 }}
          >
            {isPdfLoading ? (
              <>
                <CircularProgress size="sm" sx={{ mr: 1 }} />
                Generating PDF...
              </>
            ) : (
              "📄 Preview & Download PDF"
            )}
          </Button>
        )}
      </Box>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "primary.softBg",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 16px",
    textAlign: "left",
    color: "#000",
    borderBottom: "1px soft",
    borderColor: "primary.softBorder",
  };

  const cellStyle = {
    padding: "12px 16px",
    verticalAlign: "top",
    fontSize: 13,
    fontWeight: 400,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  // console.log(paginatedData);

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

  const PaymentID = ({ payment_id, request_date }) => {
    return (
      <>
        {payment_id && (
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
              {payment_id || "N/A"}
            </Chip>
          </Box>
        )}

        {request_date && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <Calendar size={12} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Request Date :{" "}
            </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {request_date}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const ProjectDetail = ({ project_id, client_name, group_name }) => {
    return (
      <>
        {project_id && (
          <Box>
            <span style={{ cursor: "pointer", fontWeight: 400 }}>
              {project_id}
            </span>
          </Box>
        )}

        {client_name && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <CircleUser size={12} />
            &nbsp;
            <span style={{ fontSize: 12, fontWeight: 600 }}>Client Name: </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {client_name}
            </Typography>
          </Box>
        )}

        {group_name && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <UsersRound size={12} />
            &nbsp;
            <span style={{ fontSize: 12, fontWeight: 600 }}>Group Name: </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {group_name || "-"}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const RequestedData = ({ request_for, payment_description }) => {
    return (
      <>
        {request_for && (
          <Box>
            <span style={{ cursor: "pointer", fontWeight: 400 }}>
              {request_for}
            </span>
          </Box>
        )}

        {payment_description && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Payment Description:{" "}
            </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {payment_description}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  const BalanceData = ({ amount_requested, ClientBalance, groupBalance }) => {
    return (
      <>
        {amount_requested && (
          <Box>
            <span style={{ cursor: "pointer", fontWeight: 400 }}>
              {amount_requested}
            </span>
          </Box>
        )}

        <Box display="flex" alignItems="center" mt={0.5}>
          <CircleUser size={12} />
          &nbsp;
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Client Balance:{" "}
          </span>
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {ClientBalance || "0"}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          <UsersRound size={12} />
          &nbsp;
          <span style={{ fontSize: 12, fontWeight: 600 }}>Group Balance: </span>
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {groupBalance || "0"}
          </Typography>
        </Box>
      </>
    );
  };

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        sx={{
          display: "flex",
          mb: 1,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "start", sm: "center" },
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginLeft: { xl: "15%", lg: "18%" },
        }}
      >
        <Box>
          {user?.department === "SCM" && user?.role === "manager" && (
            <Typography level="h2" component="h1">
              SCM Payment Approval
            </Typography>
          )}

          {user?.department === "Internal" && user?.role === "manager" && (
            <Typography level="h2" component="h1">
              CAM Payment Approval
            </Typography>
          )}

          {((user?.department === "Accounts" && user?.role === "manager") ||
            user?.department === "admin") && (
            <Typography level="h2" component="h1">
              Accounts Payment Approval
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "none", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box
            className="SearchAndFilters-tabletUp"
            sx={{
              borderRadius: "sm",
              py: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <FormControl sx={{ flex: 1 }} size="sm">
              <FormLabel>Search here</FormLabel>
              <Input
                size="sm"
                placeholder="Search by Pay ID, Items, Clients Name or Vendor"
                startDecorator={<SearchIcon />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  width: 350,

                  borderColor: "neutral.outlinedBorder",
                  borderBottom: searchQuery
                    ? "2px solid #1976d2"
                    : "1px solid #ddd",
                  borderRadius: 5,
                  boxShadow: "none",
                  "&:hover": {
                    borderBottom: "2px solid #1976d2",
                  },
                  "&:focus-within": {
                    borderBottom: "2px solid #1976d2",
                  },
                }}
              />
            </FormControl>
            {/* {renderFilters()} */}
          </Box>

          <Box sx={{ mt: 3, display: "flex", gap: 1 }}></Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          px: 1,
          py: 1,
          ml: { xl: "15%", lg: "18%", sm: 0 },
          maxWidth: { lg: "85%", sm: "100%" },
          // bgcolor: "background.level1",
          borderRadius: "md",
          mb: 2,
        }}
      >
        {renderFilters()}
        {/* Pagination Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          {/* Rows per page */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography level="body-sm">Rows per page:</Typography>
            <Select
              size="sm"
              value={perPage}
              onChange={(_, value) => {
                if (value) {
                  setPerPage(Number(value));
                  setCurrentPage(1);
                }
              }}
              sx={{ minWidth: 64 }}
            >
              {[10, 25, 50, 100].map((value) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
          </Box>

          {/* Pagination info */}
          <Typography level="body-sm">
            {`${startIndex}-${endIndex} of ${total}`}
          </Typography>

          {/* Navigation buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <KeyboardDoubleArrowLeft />
            </IconButton>
            <IconButton
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          // borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          // minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          // maxWidth: "100%",
          // overflowY: "auto",
          maxHeight: "600px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.body",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f0f0f0",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#1976d2",
            borderRadius: "8px",
          },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={headerStyle}>
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < paginatedData.length
                  }
                  checked={selected.length === paginatedData.length}
                  onChange={handleSelectAll}
                  color={selected.length > 0 ? "primary" : "neutral"}
                />
              </Box>
              {[
                "Payment Id",
                "Project Id",
                "Request For",
                "Amount Requested",
                ["SCM", "Accounts"].includes(user?.department) && "Action",
              ]
                .filter(Boolean)
                .map((header, index) => (
                  <Box component="th" key={index} sx={headerStyle}>
                    {header}
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
                  colSpan={5}
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
                      Loading… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((payment, index) => {
                return (
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
                        checked={selected.includes(String(payment._id))}
                        onChange={(event) =>
                          handleRowSelect(payment._id, event.target.checked)
                        }
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        fontSize: 14,
                        minWidth: 250,
                        padding: "12px 16px",
                      }}
                    >
                      <PaymentID
                        payment_id={payment?.payment_id}
                        request_date={payment?.request_date}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        fontSize: 14,
                        minWidth: 350,
                      }}
                    >
                      <ProjectDetail
                        project_id={payment?.project_id}
                        client_name={payment?.client_name}
                        group_name={payment?.group_name}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        fontSize: 14,
                        minWidth: 300,
                      }}
                    >
                      <RequestedData
                        request_for={payment?.request_for}
                        payment_description={payment?.payment_description}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        fontSize: 14,
                        minWidth: 250,
                      }}
                    >
                      <BalanceData
                        amount_requested={payment?.amount_requested}
                        ClientBalance={payment?.ClientBalance}
                        groupBalance={payment?.groupBalance}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        ...cellStyle,
                        // minWidth: 50,
                      }}
                    >
                      {user?.department === "SCM" ||
                      user?.department === "Accounts" ? (
                        <RowMenu
                          _id={payment._id}
                          onStatusChange={(_id, status) =>
                            handleStatusChange(_id, status, payment)
                          }
                        />
                      ) : user?.department === "CAM" && index === 0 ? (
                        <Chip
                          variant="solid"
                          color="success"
                          label="Approve Selected"
                          onClick={() => {
                            if (selected.length === 0) {
                              toast.warn("Select payments to approve.");
                              return;
                            }
                            const selectedPayments = paginatedData.filter((p) =>
                              selected.includes(p._id)
                            );
                            setPdfPayments(selectedPayments);
                            handleMultiPDFDownload(selectedPayments);
                          }}
                          disabled={selected.length === 0}
                        />
                      ) : null}
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={5}
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
                      No approval available
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Modal open={isPdfModalOpen} onClose={handleClosePdfModal}>
        <Box
          sx={{
            p: 2,
            background: "white",
            borderRadius: "md",
            width: "90%",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          {blobUrl ? (
            <iframe
              src={blobUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
              style={{ border: "none" }}
            />
          ) : (
            <Typography>Loading PDF preview...</Typography>
          )}
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
            <Button
              variant="solid"
              color="primary"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Confirm
            </Button>
            <Button variant="outlined" onClick={handleClosePdfModal}>
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <ModalDialog>
          <Typography level="title-lg">Are you sure?</Typography>
          <Typography>Confirm approval of selected payments?</Typography>
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
            <Button
              variant="solid"
              color="success"
              onClick={handleCAMBatchApproval}
            >
              Yes, Approve
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}
export default PaymentRequest;
