import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Chip from "@mui/joy/Chip";
import { CheckCircle, CreditCard, Info, PenLine, XCircle } from "lucide-react";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";

import {
  useGetPaymentApprovalQuery,
  useUpdateCreditExtensionMutation,
  useUpdateRequestExtensionMutation,
} from "../../redux/Accounts";
import { CircularProgress, Modal, ModalDialog, Tooltip } from "@mui/joy";
import {
  Calendar,
  CircleUser,
  FileText,
  Receipt,
  Sheet,
  UsersRound,
} from "lucide-react";
import { Money } from "@mui/icons-material";
import { forwardRef, useState, useEffect } from "react";
import { PaymentProvider } from "../../store/Context/Payment_History";
import PaymentHistory from "../PaymentHistory";
import dayjs from "dayjs";

const CreditPayment = forwardRef(
  ({ searchQuery, currentPage, perPage }, ref) => {
    const {
      data: responseData,
      error,
      isLoading,
      refetch,
    } = useGetPaymentApprovalQuery({
      page: currentPage,
      pageSize: perPage,
      search: searchQuery,
      tab: "credit",
    });

    const [paginatedData, setPaginatedData] = useState([]);
    // console.log("paginatedData Credit are in Account :", paginatedData);

    useEffect(() => {
      if (responseData?.data) {
        setPaginatedData(responseData?.data);
      }
    }, [responseData?.data]);

    const [updateCreditExtension] = useUpdateCreditExtensionMutation();

    const RowMenu = ({
      _id,
      credit_extension,
      credit_remarks,
      credit_user_name,
    }) => {
      console.log(credit_remarks);

      const [open, setOpen] = useState(false);
      const [formData, setFormData] = useState({
        credit_deadline: "",
        credit_remarks: "",
      });

      const handleOpen = () => setOpen(true);
      const handleClose = () => setOpen(false);

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };

      const handleSubmit = async () => {
        try {
          await updateCreditExtension({ id: _id, ...formData }).unwrap();

          toast.success("Credit days extended successfully!", {
            icon: <CheckCircle size={20} color="#FFFFFF" />,
            style: {
              backgroundColor: "#2E7D32",
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "15px",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          });

          refetch();
          handleClose();
        } catch (err) {
          toast.error("Failed to extend credit days", {
            icon: <XCircle size={20} color="#FFFFFF" />,
            style: {
              backgroundColor: "#D32F2F",
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "15px",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          });
        }
      };

      return (
        <>
          {/* Button to open modal */}
          {credit_extension === true ? (
            <Box display="flex" alignItems="center" gap={1}>
              {/* Edit button */}
              <Tooltip title="Edit Credit Extension" placement="top" arrow>
                <IconButton
                  size="sm"
                  variant="soft"
                  color="primary"
                  onClick={handleOpen}
                  sx={{
                    borderRadius: "50%",
                    p: 0.7,
                    minWidth: "32px",
                    minHeight: "32px",
                    "&:hover": {
                      backgroundColor: "primary.softHoverBg",
                      transform: "scale(1.05)",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}
                >
                  <PenLine size={16} strokeWidth={2} />
                </IconButton>
              </Tooltip>

              {/* Info icon showing latest remarks */}
              {credit_remarks && credit_remarks.length > 0 && (
                <Tooltip
                  placement="top"
                  arrow
                  title={
                    <Box>
                      <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        <li>Extension Remarks: {credit_remarks}</li>
                        <li>Requested by: {credit_user_name || "Unknown"}</li>
                      </ul>
                    </Box>
                  }
                >
                  <Info
                    size={18}
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              )}
            </Box>
          ) : (
            <Chip size="sm" variant="soft" color="danger">
              no extension required
            </Chip>
          )}

          {/* Modal */}
          <Modal open={open} onClose={handleClose}>
            <ModalDialog>
              <Typography level="h5" mb={1}>
                Extend Credit
              </Typography>

              <Input
                type="date"
                name="credit_deadline"
                value={formData.credit_deadline}
                onChange={handleChange}
                placeholder="New Credit Deadline"
              />

              <Input
                type="text"
                name="credit_remarks"
                value={formData.credit_remarks}
                onChange={handleChange}
                placeholder="Credit Remarks"
                sx={{ mt: 1 }}
              />

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button variant="plain" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  onClick={handleSubmit}
                  // disabled={isLoading}
                >
                  Extend
                </Button>
              </Box>
            </ModalDialog>
          </Modal>
        </>
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
                color="warning"
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
            <Box display="flex" alignItems="center" mt={0.5}>
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
      ClientBalance = 0,
      groupBalance = 0,
      creditBalance = 0,
      totalCredited = 0,
      totalPaid = 0,
      po_value,
    }) => {
      const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

      const fmt = (v, dashIfEmpty = false) => {
        if (v === null || v === undefined || v === "") {
          return dashIfEmpty ? "—" : "0";
        }
        const num = Number(v);
        return Number.isFinite(num) ? inr.format(num) : dashIfEmpty ? "—" : "0";
      };

      const chipColor =
        Number(creditBalance) > 0
          ? "success"
          : Number(creditBalance) < 0
            ? "danger"
            : "neutral";

      return (
        <>
          {amount_requested !== undefined &&
            amount_requested !== null &&
            amount_requested !== "" && (
              <Box display="flex" alignItems="center" mb={0.5}>
                <Money size={16} />
                <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
                  Requested Amount:&nbsp;
                </span>
                <Typography sx={{ fontSize: 13, fontWeight: 400 }}>
                  ₹ {fmt(amount_requested, true)}
                </Typography>
              </Box>
            )}

          <Box display="flex" alignItems="center" mb={0.5}>
            <Receipt size={16} />
            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
              Total PO (incl. GST):&nbsp;
            </span>
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {po_value == null || po_value === "" ? "—" : `₹ ${fmt(po_value)}`}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mt={0.5}>
            <CircleUser size={12} />
            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
              Client Balance:&nbsp;
            </span>
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ₹ {fmt(ClientBalance)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mt={0.5}>
            <UsersRound size={12} />
            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
              Group Balance:&nbsp;
            </span>
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ₹ {fmt(groupBalance)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mt={0.5}>
            <CreditCard size={14} />
            <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
              Credit Balance:&nbsp;
            </span>

            <Tooltip
              arrow
              placement="top"
              title={
                <Box>
                  <Typography
                    level="body-xs"
                    sx={{ fontSize: 11, fontWeight: 600, color: "#fff" }}
                  >
                    Total Credited − Total Amount Paid
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ fontSize: 11, color: "#fff" }}
                  >
                    ₹ {fmt(totalCredited)} − ₹ {fmt(totalPaid)} = ₹{" "}
                    {fmt(
                      (Number(totalCredited) || 0) - (Number(totalPaid) || 0)
                    )}
                  </Typography>
                </Box>
              }
            >
              <Chip
                size="sm"
                variant="soft"
                color={chipColor}
                sx={{ fontSize: 12, fontWeight: 500, ml: 0.5 }}
              >
                ₹ {fmt(creditBalance)}
              </Chip>
            </Tooltip>
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
                {/* <Box component="th" sx={headerStyle}>
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < paginatedData.length
                  }
                  checked={selected.length === paginatedData.length}
                  onChange={handleSelectAll}
                  color={selected.length > 0 ? "primary" : "neutral"}
                />
              </Box> */}
                {[
                  "Credit Id",
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
                      {/* <Box component="td" sx={cellStyle}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(String(payment._id))}
                        onChange={(event) =>
                          handleRowSelect(payment._id, event.target.checked)
                        }
                      />
                    </Box> */}
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
                          cr_id={payment?.cr_id}
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
                          remainingDays={payment?.remainingDays}
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
                          creditBalance={payment?.creditBalance}
                          totalCredited={payment?.totalCredited}
                          totalPaid={payment?.totalPaid}
                        />
                      </Box>
                      <Box component="td" sx={{ ...cellStyle }}>
                        <RowMenu
                          _id={payment?._id}
                          credit_extension={payment?.credit_extension}
                          credit_remarks={payment?.credit_remarks}
                          credit_user_name={payment?.credit_user_name}
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
                        No credit payment available
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
export default CreditPayment;
