import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
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
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Typography from "@mui/joy/Typography";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import Axios from "../../utils/Axios";
import { useGetPaymentApprovalQuery } from "../../redux/Accounts";
import {
  CircularProgress,
  Divider,
  Modal,
  ModalDialog,
  Sheet,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Tooltip,
} from "@mui/joy";
import {
  Calendar,
  CircleUser,
  FileText,
  Receipt,
  UsersRound,
} from "lucide-react";
import PaymentAccountApproval from "./PaymentAccountApproval";
import CreditPayment from "./creditPayment";
import { InfoOutlined, Money, RefreshRounded } from "@mui/icons-material";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";

function PaymentRequest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [hasPrinted, setHasPrinted] = useState(false);
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "payments";
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isAccount = user?.department === "Accounts";

  const {
    data: responseData,
    isLoading,
    error,
    onRefresh,
  } = useGetPaymentApprovalQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
    ...(isAccount ? { tab: activeTab } : {}),
  });

  const [paginatedData, setPaginatedData] = useState([]);
  // console.log("paginatedData :", paginatedData);

  // console.log(count);
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;
  // const Approved = responseData?.toBeApprovedCount || 0;

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  const totalPages = Math.ceil(total / perPage);

  useEffect(() => {
    if (responseData?.data) {
      setPaginatedData(responseData.data);
    }
  }, [responseData]);

  useEffect(() => {
    const params = {};
    if (isAccount) params.tab = activeTab;
    if (currentPage > 1) params.page = currentPage;
    if (perPage !== 10) params.pageSize = perPage;
    if (searchQuery) params.search = searchQuery;

    setSearchParams(params, { replace: true });
  }, [
    isAccount,
    activeTab,
    currentPage,
    perPage,
    searchQuery,

    setSearchParams,
  ]);

  const handleStatusChange = async (_id, newStatus, remarks = "") => {
    // console.log("📌 handleStatusChange got:", { _id, newStatus, remarks, remarksType: typeof remarks });

    if (!user) {
      toast.error("User not found");
      return;
    }

    const { department, role } = user;
    const isInternalManager = department === "Internal" && role === "manager";
    const isSCMOrAccountsManager =
      ["SCM", "Accounts"].includes(department) && role === "manager";

    if (newStatus === "Rejected") {
      if (!_id) {
        toast.error("Mongo Id is required for rejection.");
        return;
      }
      const remarksStr = remarks;
      // console.log("📌 handleStatusChange → cleaned remarks:", remarksStr);
      const success = await handleApprovalUpdate(_id, newStatus, remarksStr);
      if (success) setSelected((prev) => prev.filter((id) => id !== _id));
      return;
    }

    if (isSCMOrAccountsManager && newStatus === "Approved") {
      if (!_id) {
        toast.error("Mongo Id is required for approval.");
        return;
      }
      const success = await handleApprovalUpdate(_id, newStatus);
      if (success) setSelected((prev) => prev.filter((id) => id !== _id));
      return;
    }

    if (isInternalManager && newStatus === "Approved") {
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

      if (!selectedPayments.length) {
        toast.warn("No matching selected payments found in current page.");
        return;
      }

      const poIds = selectedPayments
        .map((p) => p?._id)
        .filter((id) => typeof id === "string" && id.trim().length > 0);

      if (!poIds.length) {
        toast.error("No valid PO IDs found for PDF generation.");
        return;
      }

      // console.log("📌 Selected PO IDs for PDF:", poIds);
      // console.log("📌 Selected Payments for PDF:", selectedPayments);

      // setPdfPayments(selectedPayments);
      await handleMultiPDFDownload(selectedPayments);
    }
  };

  // === Generate & Preview PDF ===
  const handleMultiPDFDownload = async (payments) => {
    // console.log("handleMultiPDFDownload called with:", payments);
    setIsPdfLoading(true);

    if (!Array.isArray(payments) || payments.length === 0) {
      console.error("Invalid payments array:", payments);
      toast.error("Unable to generate PDF. No valid payments selected.");
      setIsPdfLoading(false);
      return;
    }

    const validPayments = payments.filter((p) => p && p._id);
    if (!validPayments.length) {
      toast.error("No valid payment IDs found to generate PDF.");
      setIsPdfLoading(false);
      return;
    }

    // console.log("Valid payments for PDF generation:", validPayments);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found.");
        setIsPdfLoading(false);
        return;
      }

      const poIds = validPayments.map((p) => p._id);
      console.log("Generating PDF for PO IDs:", poIds);

      const response = await Axios.post(
        "/accounting/po-approve-pdf",
        { poIds },
        {
          headers: { "x-auth-token": token },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfBlob(blob);
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPdfLoading(false);
    }
  };
  // === Final CAM Batch Approval ===
  const handleCAMBatchApproval = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const idsToApprove = selected
        .map((id) => (id && id._id ? id._id : id))
        .filter(Boolean);

      if (idsToApprove.length === 0) {
        toast.error("No valid payment IDs selected for approval.");
        return;
      }

      if (pdfBlob) {
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "CAM_Approval.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }

      const approvalRes = await Axios.put(
        "/account-approve",
        { _id: idsToApprove, status: "Approved" },
        { headers: { "x-auth-token": token } }
      );

      if (approvalRes.status === 200) {
        const { results } = approvalRes.data;
        const successCount = results.filter(
          (r) => r.status === "success"
        ).length;
        const errorCount = results.filter((r) => r.status === "error").length;

        if (successCount > 0) {
          toast.success(`${successCount} payment(s) approved successfully`);
          // setHiddenIds((prev) => [...prev, ...idsToApprove]);
          setSelected((prev) =>
            prev.filter((id) => !idsToApprove.includes(id))
          );

          setTimeout(() => window.location.reload(), 500);
        }
        if (errorCount > 0) {
          results
            .filter((r) => r.status === "error")
            .forEach((err) => toast.error(`${err._id}: ${err.message}`));
        }

        setIsPdfModalOpen(false);
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      console.error("CAM approval failed", error);
      toast.error("Failed to approve payments");
    }
  };

  // === Single Approval Logic ===
  const handleApprovalUpdate = async (ids, newStatus, remarks = "") => {
    // console.log("📌 handleApprovalUpdate got:", { ids, newStatus, remarks, remarksType: typeof remarks });

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        _id: Array.isArray(ids) ? ids : [ids],
        status: newStatus,
      };

      if (newStatus === "Rejected") {
        payload.remarks = remarks || "Rejected by manager";
      } else if (remarks) {
        payload.remarks = remarks;
      }

      // console.log("📌 handleApprovalUpdate payload:", payload);

      const response = await Axios.put("/account-approve", payload, {
        headers: { "x-auth-token": token },
      });

      if (response.status === 200 && Array.isArray(response.data.results)) {
        let allSuccess = true;

        response.data.results.forEach((result) => {
          if (result.status === "success") {
            if (newStatus === "Approved")
              toast.success(`Payment Approved!`, { autoClose: 2000 });
            else if (newStatus === "Rejected")
              toast.error(`Payment Rejected`, { autoClose: 2000 });
            else if (newStatus === "Pending")
              toast.info(`Payment marked as Pending`, { autoClose: 2000 });
            // setHiddenIds((prev) => [...prev, result._id]);
          } else {
            allSuccess = false;
            toast.error(result.message || `Approval failed for ${result._id}`);
          }
        });

        if (allSuccess) {
          setTimeout(() => window.location.reload(), 500);
        }

        return allSuccess;
      }
    } catch (error) {
      console.error("Approval update error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    }

    return false;
  };

  const RowMenu = ({ _id, onStatusChange, showApprove }) => {
    const [open, setOpen] = useState(false);
    const [remarks, setRemarks] = useState("");

    const handleRejectSubmit = () => {
      // console.log(
      //   "📌 RowMenu → handleRejectSubmit remarks:",
      //   remarks,
      //   "type:",
      //   typeof remarks
      // );
      onStatusChange(_id, "Rejected", remarks);
      setOpen(false);
      setRemarks("");
    };

    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "left", gap: 1 }}>
          {showApprove && (
            <Chip
              component="div"
              variant="solid"
              color="success"
              onClick={() => onStatusChange(_id, "Approved")}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
              startDecorator={<CheckRoundedIcon />}
            >
              Approve
            </Chip>
          )}
          <Chip
            component="div"
            variant="outlined"
            color="danger"
            onClick={() => setOpen(true)}
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
            startDecorator={<BlockIcon />}
          >
            Reject
          </Chip>
        </Box>

        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog>
            <Typography level="h5">Rejection Remarks</Typography>
            <Textarea
              minRows={3}
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => {
                const value = e.target.value ?? "";
                // console.log("Textarea onChange value:", value, "type:", typeof value);
                setRemarks(value);
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant="plain" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                color="danger"
                onClick={handleRejectSubmit}
                disabled={!remarks}
              >
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </>
    );
  };

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
  const handlePrint = () => {
    if (!blobUrl) return;

    const printWindow = window.open(blobUrl);
    if (printWindow) {
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
        setHasPrinted(true);
      };
    } else {
      toast.error("Unable to open print window");
    }
  };

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);
  useEffect(() => {
    if (isPdfModalOpen) {
      setHasPrinted(false);
    }
  }, [isPdfModalOpen]);

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
          mt: 3,
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
    setPaginatedData([]);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

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

  const PaymentID = ({ pay_id, cr_id, request_date, approved }) => {
    // const maskId = (id) => {
    //   if (!id) return "N/A";
    //   const parts = id.split("/");
    //   const lastIndex = parts.length - 2;

    //   if (!isNaN(parts[lastIndex])) {
    //     parts[lastIndex] = parts[lastIndex].replace(/\d{2}$/, "XX");
    //   }

    //   return parts.join("/");
    // };

    const idToShow = pay_id || cr_id;

    return (
      <>
        {idToShow && (
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
              {idToShow}
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

  const RequestedData = ({
    request_for,
    payment_description,
    po_number,
    vendor,
  }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
      <>
        {request_for && (
          <Box>
            <span style={{ cursor: "pointer", fontWeight: 400 }}>
              {request_for}
            </span>
          </Box>
        )}
        {po_number && (
          <Box
            display="flex"
            alignItems="center"
            mt={0.5}
            sx={{ cursor: "pointer" }}
            onClick={handleOpen}
          >
            <FileText size={12} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>PO Number: </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {po_number}
            </Typography>
          </Box>
        )}
        <Modal open={open} onClose={handleClose}>
          <Sheet
            variant="outlined"
            sx={{
              mx: "auto",
              mt: "8vh",
              width: { xs: "95%", sm: 600 },
              borderRadius: "12px",
              p: 3,
              boxShadow: "lg",
              maxHeight: "80vh",
              overflow: "auto",
              backgroundColor: "#fff",
              minWidth: 950,
            }}
          >
            {po_number && (
              <PaymentProvider po_number={po_number}>
                <PaymentHistory po_number={po_number} />
              </PaymentProvider>
            )}
          </Sheet>
        </Modal>

        <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
            🏢 Vendor:
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 400, wordBreak: "break-word" }}
          >
            {vendor}
          </Typography>
        </Box>

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

  const BalanceData = ({
    amount_requested,
    ClientBalance,
    groupBalance,
    po_value,
  }) => {
    return (
      <>
        {amount_requested && (
          <Box display="flex" alignItems="center" mb={0.5}>
            <Money size={16} />
            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
              Requested Amount:{" "}
            </span>
            <Typography sx={{ fontSize: 13, fontWeight: 400, ml: 0.5 }}>
              {amount_requested || "-"}
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" mb={0.5}>
          <Receipt size={16} />
          <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
            Total PO (incl. GST):{" "}
          </span>
          <Typography sx={{ fontSize: 12, fontWeight: 400, ml: 0.5 }}>
            {po_value || "-"}
          </Typography>
        </Box>

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

  const useDebounced = (fn, delay = 350) => {
    const t = useRef();
    return useCallback(
      (...args) => {
        clearTimeout(t.current);
        t.current = setTimeout(() => fn(...args), delay);
      },
      [fn, delay]
    );
  };
  const [scrolled, setScrolled] = useState(false);

  const paymentsCount = responseData?.paymentsCount ?? 0;
  const finalCount = responseData?.finalApprovalPaymentsCount ?? 0;

  const handleTabChange = (_e, val) => {
    setActiveTab(val);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      tab: val,
      page: 1,
    }));
    setCurrentPage(1);
  };

  const handleScroll = (e) => setScrolled(e.currentTarget.scrollTop > 0);

  const debouncedSearch = useDebounced((val) => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      page: 1,
      search: val || "",
    }));
    setCurrentPage(1);
  }, 350);

  const onSearchChange = (e) => {
    setSearchQuery?.(e.target.value);
    debouncedSearch(e.target.value);
  };

  const tabDefs = useMemo(
    () => [
      {
        key: "payments",
        label: "Aggregate Payments",
        count: paymentsCount,
      },
      {
        key: "finalApprovalPayments",
        label: "Final Approval Payments",
        count: finalCount,
      },
    ],
    [paymentsCount, finalCount]
  );

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
      </Box>

      {isAccount ? (
        // ---------------- Accounts View with Tabs ----------------
        <>
          <Box
            className="OrderTableContainer"
            sx={{
              width: "100%",
              borderRadius: "md",
              overflow: "hidden",
              minHeight: 0,
              ml: { xl: "15%", lg: "18%", sm: 0 },
              maxWidth: { lg: "85%", sm: "100%" },
              boxSizing: "border-box",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              bgcolor: "background.body",
              boxShadow: "sm",
            }}
          >
            <Sheet
              variant="plain"
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                backgroundColor: "background.body",
                borderBottom: "1px solid",
                borderColor: "neutral.outlinedBorder",
                px: 2,
                py: 1,

                boxShadow: scrolled ? "sm" : "none",
                transition: "box-shadow .2s ease",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <Tabs
                  aria-label="Payments view tabs"
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="plain"
                  sx={{ borderRadius: "xl", p: 0.5, minHeight: 50 }}
                >
                  <TabList
                    disableUnderline
                    sx={{
                      borderRadius: "xl",
                      overflow: "hidden",
                      minHeight: 36,
                      backgroundColor: "background.level1",
                      border: "1px solid",
                      borderColor: "neutral.outlinedBorder",
                    }}
                  >
                    {tabDefs.map((t) => (
                      <Tab
                        key={t.key}
                        value={t.key}
                        variant="soft"
                        color="neutral"
                        disableIndicator
                        sx={{
                          gap: 0.5,
                          fontWeight: 600,
                          transition: "all 0.2s",
                          minHeight: 36,
                          px: 1.25,
                          "&:hover": { backgroundColor: "neutral.softHoverBg" },
                        }}
                      >
                        {t.label}
                        <Chip
                          size="sm"
                          variant="solid"
                           color={t.key === "finalApprovalPayments" ? "danger" : "primary"}
                          sx={{
                            ml: 0.5,
                            fontWeight: 700,
                          }}
                        >
                          {t.count}
                        </Chip>
                      </Tab>
                    ))}
                  </TabList>
                </Tabs>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Tooltip placement="top" title="Refresh">
                    <IconButton
                      size="sm"
                      variant="soft"
                      color="neutral"
                      onClick={onRefresh}
                      disabled={isLoading}
                    >
                      <RefreshRounded />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Toolbar Row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  flexWrap: "wrap",
                }}
              >
                <Input
                  size="sm"
                  value={searchQuery ?? ""}
                  onChange={onSearchChange}
                  placeholder="Search by code, pay_id, cr_id, name, group, PO…"
                  startDecorator={<SearchIcon />}
                  sx={{
                    flex: 1,
                    minWidth: 240,
                  }}
                  aria-label="Search payments"
                />

                <Divider orientation="vertical" sx={{ height: 28 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box
                    component="span"
                    sx={{ fontSize: 12, color: "text.tertiary" }}
                  >
                    Rows per page
                  </Box>
                  <Select
                    size="sm"
                    value={perPage ?? 50}
                    onChange={(_, v) => {
                      const next = Number(v) || 50;
                      setPerPage?.(next);
                      setCurrentPage(1);
                      setSearchParams((prev) => ({
                        ...Object.fromEntries(prev.entries()),
                        page: "1",
                        pageSize: String(next),
                      }));
                    }}
                    sx={{ width: 96 }}
                  >
                    {[50, 250, 500, 1000].map((n) => (
                      <Option key={n} value={n}>
                        {n}
                      </Option>
                    ))}
                  </Select>
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
            </Sheet>

            {/* Table Content */}
            <Box
              onScroll={handleScroll}
              sx={{
                maxHeight: 600,
                overflow: "auto",
                "& table thead th": {
                  position: "sticky",
                  top: 0,
                  backgroundColor: "background.level1",
                  zIndex: 5,
                },
                "&:hover": {
                  boxShadow: "md",
                  transition: "0.3s all",
                },
              }}
            >
              {activeTab === "payments" && (
                <CreditPayment
                  data={paginatedData}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  perPage={perPage}
                  currentPage={currentPage}
                  sxRow={{ "&:hover": { bgcolor: "action.hover" } }}
                />
              )}

              {activeTab === "finalApprovalPayments" && (
                <PaymentAccountApproval
                  data={paginatedData}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  perPage={perPage}
                  currentPage={currentPage}
                  sxRow={{ "&:hover": { bgcolor: "action.hover" } }}
                />
              )}
            </Box>
          </Box>
        </>
      ) : (
        // ---------------- SCM / CAM View without Tabs ----------------
        <>
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
              borderRadius: "md",
              mb: 2,
            }}
          >
            {/* Left Side - Filters + Search */}
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
              {user?.department === "Internal" &&
                user?.role === "manager" &&
                renderFilters?.()}

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
              </Box>
            </Box>

            {/* Right Side - Rows per page + Pagination */}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
          <Box
            className="OrderTableContainer"
            variant="outlined"
            sx={{
              display: { xs: "none", sm: "initial" },
              width: "100%",
              flexShrink: 1,
              overflow: "auto",
              marginLeft: { xl: "15%", lg: "18%" },
              maxWidth: { lg: "85%", sm: "100%" },
              maxHeight: "600px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.body",
              "&::-webkit-scrollbar": { width: "8px" },
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
                    "Action",
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
                        <CircularProgress
                          size="sm"
                          sx={{ color: "primary.500" }}
                        />
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
                            pay_id={payment?.pay_id}
                            request_date={payment?.request_date}
                            cr_id={payment?.cr_id}
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
                            po_number={payment?.po_number}
                            vendor={payment?.vendor}
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
                            po_value={payment?.po_value}
                            groupBalance={payment?.groupBalance}
                          />
                        </Box>

                        <Box component="td" sx={{ ...cellStyle }}>
                          <RowMenu
                            _id={payment._id}
                            showApprove={["SCM", "Accounts"].includes(
                              user?.department
                            )}
                            onStatusChange={(id, status, remarks) =>
                              handleStatusChange(id, status, remarks)
                            }
                          />
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
        </>
      )}

      {/* PDF Preview Modal */}
      <Modal open={isPdfModalOpen} onClose={handleClosePdfModal}>
        <ModalDialog
          sx={{
            width: "90%",
            maxWidth: 800,
            p: 2,
          }}
        >
          <Typography level="title-lg" mb={1}>
            PDF Preview
          </Typography>

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
              disabled={!hasPrinted}
            >
              Confirm
            </Button>
            <Button variant="outlined" color="danger" onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outlined" onClick={handleClosePdfModal}>
              Cancel
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <ModalDialog>
          <Typography level="title-lg">Are you sure?</Typography>
          <Typography mt={1}>Confirm approval of selected payments?</Typography>

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
