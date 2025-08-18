import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import Axios from "../../utils/Axios";
import { useGetPaymentApprovalQuery } from "../../redux/Accounts";
import {
  CircularProgress,
  Modal,
  ModalDialog,
  Stack,
  Textarea,
} from "@mui/joy";
import { Calendar, CircleUser, CreditCard, Receipt, UsersRound } from "lucide-react";
import { Money } from "@mui/icons-material";
import dayjs from "dayjs";

const ApprovalPayment = forwardRef(
  ({ searchQuery, currentPage, perPage }, ref) => {
    //   const isAccount = user?.department === "Accounts";
    const [selected, setSelected] = useState([]);

    const {
      data: responseData,
      isLoading,
      error,
    } = useGetPaymentApprovalQuery({
      page: currentPage,
      pageSize: perPage,
      search: searchQuery,
      tab: "toBeApproved",
    });

    const paginatedData = responseData?.data || [];
    // console.log("paginatedData Approveal are in Account :", paginatedData);

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
              toast.error(
                result.message || `Approval failed for ${result._id}`
              );
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
        console.log(
          " RowMenu → handleRejectSubmit remarks:",
          remarks,
          "type:",
          typeof remarks
        );
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
    const labelStyle = {
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "Inter, Roboto, sans-serif",
      color: "#2C3E50",
    };

    // console.log(paginatedData);

    const PaymentID = ({ cr_id, request_date }) => {
      const maskCrId = (id) => {
        if (!id) return "N/A";
        const parts = id.split("/");
        const lastIndex = parts.length - 2;

        if (!isNaN(parts[lastIndex])) {
          parts[lastIndex] = parts[lastIndex].replace(/\d{2}$/, "XX");
        }

        return parts.join("/");
      };

      return (
        <>
          {cr_id && (
            <Box>
              <Chip
                variant="solid"
                color="success"
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
                {maskCrId(cr_id)}
              </Chip>
            </Box>
          )}

          {request_date && (
            <Box display="flex" alignItems="center" mt={0.5} gap={0.5}>
              <Calendar size={12} />
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                Request Date:
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
                {dayjs(request_date).format("DD-MM-YYYY")}
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
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Client Name:{" "}
              </span>
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
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Group Name:{" "}
              </span>
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
      remainingDays,
      vendor,
    }) => {
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
          <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
            <Typography style={{ fontSize: 12, fontWeight: 600 }}>
              🏢 Vendor:
            </Typography>
            <Typography
              sx={{ fontSize: 12, fontWeight: 400, wordBreak: "break-word" }}
            >
              {vendor}
            </Typography>
          </Box>

          <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
            <Typography sx={labelStyle}>⏰</Typography>
            <Chip
              size="sm"
              variant="soft"
              color={
                remainingDays <= 0
                  ? "danger"
                  : remainingDays <= 2
                    ? "warning"
                    : "success"
              }
            >
              {remainingDays <= 0
                ? "⏱ Expired"
                : `${remainingDays} day${remainingDays > 1 ? "s" : ""} remaining`}
            </Chip>
          </Box>
        </>
      );
    };

    const BalanceData = ({
      amount_requested,
      ClientBalance,
      groupBalance,
      creditBalance,
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
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Group Balance:{" "}
            </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {groupBalance || "0"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mt={0.5}>
            <CreditCard size={12} />
            &nbsp;
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Credit Balance:{" "}
            </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {creditBalance || "0"}
            </Typography>
          </Box>
        </>
      );
    };

    return (
      <>
        {/* Tablet and Up Filters */}
        {/* <Box
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
          {((user?.department === "Accounts" && user?.role === "manager") ||
            user?.department === "admin") && (
            <Typography level="h2" component="h1">
              Accounts Payment Approval
            </Typography>
          )}
        </Box>
      </Box> */}

        {/* <Box
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
        
           { renderFilters()}
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          {/* Rows per page 
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

          {/* Pagination info 
          <Typography level="body-sm">
            {`${startIndex}-${endIndex} of ${total}`}
          </Typography>

          {/* Navigation buttons 
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
      </Box> */}

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
                          cr_id={payment?.cr_id || "N/A"}
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
                          vendor={payment?.vendor}
                          remainingDays={payment.remainingDays}
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
                          creditBalance={payment?.creditBalance}
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
                        No payment available
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);
export default ApprovalPayment;
