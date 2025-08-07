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
import { CircularProgress, Modal, ModalDialog } from "@mui/joy";
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

  const totalPages = Math.ceil(total / perPage);

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  const visibleData = paginatedData.filter(
  (item) => !hiddenIds.includes(item.payment_id)
);


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

  const handleApprovalUpdate = async (payment_id, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await Axios.put(
        "/account-approve",
        {
          pay_id: payment_id,
          status: newStatus,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.status === 200) {
        if (newStatus === "Approved") {
          toast.success("Payment Approved!", { autoClose: 3000 });
        } else if (newStatus === "Rejected") {
          toast.error("Payment Rejected", { autoClose: 2000 });
        }

        return true;
      }
    } catch (error) {
      console.error("Error updating approval status:", error);

      if (error.response?.data?.message) {
        toast.warn(error.response.data.message, { autoClose: 4000 });
      } else {
        toast.error("Network error. Please try again later.", {
          autoClose: 3000,
        });
      }
    }

    return false;
  };
  const handleStatusChange = async (payment_id, newStatus) => {
  const selectedPayments = paginatedData.filter(payment =>
    selected.includes(payment.payment_id)
  );

  // Check if multi select and in SCM stage
  const isSCMMultiSelect =
    selectedPayments.length > 1 &&
    selectedPayments.every(p => p.approval_status?.stage === "SCM");

  if (isSCMMultiSelect) {
    const confirm = window.confirm(
      "Are you sure you want to generate the approval PDF for selected payments?"
    );

    if (!confirm) return;

    try {
      const token = localStorage.getItem("authToken");

      const response = await Axios.post(
        "/po-approval-pdf",
        { selected_ids: selectedPayments.map(p => p.payment_id) },
        {
          headers: {
            "x-auth-token": token,
          },
          responseType: "blob",
        }
      );

      setPdfBlob(new Blob([response.data], { type: "application/pdf" }));
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Failed to generate PDF");
    }

    return;
  }

  // Single approval fallback
  const success = await handleApprovalUpdate(payment_id, newStatus);
  if (success) refetch();
};


  const RowMenu = ({ payment_id, onStatusChange }) => (
    <Box sx={{ display: "flex", justifyContent: "left", gap: 1 }}>
      <Chip
        variant="solid"
        color="success"
        label="Approved"
        onClick={() => onStatusChange(payment_id, "Approved")}
        sx={{
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          borderRadius: "sm",
        }}
        startDecorator={<CheckRoundedIcon />}
      />
      <Chip
        variant="outlined"
        color="danger"
        label="Rejected"
        onClick={() => onStatusChange(payment_id, "Rejected")}
        sx={{
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          borderRadius: "sm",
        }}
        startDecorator={<BlockIcon />}
      />
    </Box>
  );

 

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(visibleData.map((row) => row.id));
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

  const renderFilters = () => {
  const hasSelection = selected.length > 0;

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

      {hasSelection && (
        <Button
          size="sm"
          variant="solid"
          color="primary"
          // onClick={handleMultiPDFDownload}
          sx={{ ml: "auto" }}
        >
          📄 Preview & Download PDF
        </Button>
      )}
    </Box>
  );
};


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
            placeholder="Search by Project ID, Customer, or Name"
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
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box
                component="th"
                sx={headerStyle}
              >
                <Checkbox
                  size="sm"
                  checked={selected.length === visibleData.length}
                  onChange={(event) =>
                    handleRowSelect("all", event.target.checked)
                  }
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < visibleData.length
                  }
                />
              </Box>
              {[
                "Payment Id",
                "Project Id",
                "Request For",
                "Amount Requested",
                "Action",
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={headerStyle}
                >
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
            ) : visibleData.length > 0 ? (
              visibleData.map((payment, index) => {
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
                    <Box
                      component="td"
                      sx={cellStyle}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(payment.payment_id)}
                        onChange={(event) =>
                          handleRowSelect(
                            payment.payment_id,
                            event.target.checked
                          )
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
                      <RowMenu
  payment_id={payment.payment_id}
  onStatusChange={handleStatusChange}
  disabled={
    selected.length > 1 &&
    selected.includes(payment.payment_id) &&
    payment.approval_status?.stage === "SCM"
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
          <Box
          component="tfoot"
          sx={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "background.surface",
            zIndex: 10,
            boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            component="tr"
            sx={{
              borderTop: "1px solid #ddd",
            }}
          >
            <Box
              component="td"
              colSpan={5}
              sx={{
                padding: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
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

                {/* Navigation controls */}
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
          </Box>
        </Box>
        </Box>

         <Modal open={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)}>
  <ModalDialog layout="fullscreen">
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid lightgray",
        }}
      >
        <Typography level="title-lg">PDF Preview</Typography>
        <Box display="flex" gap={1}>
<Button
  color="primary"
  onClick={() => {
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "po-approval.pdf";
    link.click();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    // Find matching SCM entries from selection
    const removedIds = selected.filter((id) => {
      const match = paginatedData.find(
        (p) => p.payment_id === id && p.approval_status?.stage === "SCM"
      );
      return !!match;
    });

    // Add to hiddenIds state
    setHiddenIds((prev) => [...prev, ...removedIds]);

    // Deselect them too
    setSelected((prev) => prev.filter((id) => !removedIds.includes(id)));

    // Close modal
    setIsPdfModalOpen(false);

    toast.success("Selected approvals removed from view after download.");
  }}
>
  Download
</Button>


          <Button color="danger" onClick={() => setIsPdfModalOpen(false)}>
            Close
          </Button>
        </Box>
      </Box>

      <iframe
        src={pdfBlob ? URL.createObjectURL(pdfBlob) : ""}
        style={{ flex: 1, width: "100%", border: "none" }}
        title="PDF Preview"
      />
    </Box>
  </ModalDialog>
</Modal>
      </Sheet>

    </>
  );
}
export default PaymentRequest;
