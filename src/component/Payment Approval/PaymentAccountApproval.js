import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import Axios from "../../utils/Axios";
import { useGetPaymentApprovalQuery } from "../../redux/Accounts";
import {
  CircularProgress,
  Modal,
  ModalDialog,
  Sheet,
  Textarea,
} from "@mui/joy";
import {
  Calendar,
  CircleUser,
  FileText,
  Receipt,
  UsersRound,
} from "lucide-react";
import { Money } from "@mui/icons-material";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";

const PaymentAccountApproval = forwardRef(
  ({ searchQuery, currentPage, perPage }, ref) => {
    const [selected, setSelected] = useState([]);

    //   const isAccount = user?.department === "Accounts";

    const {
      data: responseData,
      isLoading,
      error,
    } = useGetPaymentApprovalQuery({
      page: currentPage,
      pageSize: perPage,
      search: searchQuery,
      tab: "instant",
    });

    const paginatedData = responseData?.data || [];
    // console.log("paginatedData Instant are in Account :", paginatedData);

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
          "📌 RowMenu → handleRejectSubmit remarks:",
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

    const PaymentID = ({ pay_id, request_date }) => {
      return (
        <>
          {pay_id && (
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
                {pay_id || "N/A"}
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
      vendor,
      po_number,
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
              tabIndex={-1}
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
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Group Balance:{" "}
            </span>
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
                          pay_id={payment?.pay_id}
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
                          po_number={payment?.po_number}
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
export default PaymentAccountApproval;
