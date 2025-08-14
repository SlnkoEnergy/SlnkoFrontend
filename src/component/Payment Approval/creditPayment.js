import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";

import Chip from "@mui/joy/Chip";

import Typography from "@mui/joy/Typography";

import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";

import {
  useGetPaymentApprovalQuery,
  useUpdateRequestExtensionMutation,
} from "../../redux/Accounts";
import { CircularProgress } from "@mui/joy";
import { Calendar, CircleUser, Receipt, UsersRound } from "lucide-react";
import { Money } from "@mui/icons-material";

const CreditPayment = ({ searchQuery, currentPage, perPage }) => {
  const {
    data: responseData,
    error,
    isLoading,
  } = useGetPaymentApprovalQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
    tab: "credit",
  });

  const paginatedData = responseData?.data || [];
  // console.log("paginatedData Credit are in Account :", paginatedData);

  const RowMenu = ({ _id, credit_extension }) => {
    const [updateCreditExtension, { isLoading }] =
      useUpdateRequestExtensionMutation();

    const handleRequestExtension = async () => {
      try {
        await updateCreditExtension(_id).unwrap();
        toast.success("Credit deadline extension requested successfully");
      } catch (err) {
        console.error("Failed to request extension", err);
        toast.error("Failed to request credit extension");
      }
    };

    const isDisabled = isLoading || !!credit_extension;

    return (
      <Button
        size="sm"
        color="success"
        variant="solid"
        disabled={isDisabled}
        onClick={handleRequestExtension}
        sx={{
          borderRadius: "50px",
          textTransform: "none",
          px: 3,
          py: 1,
          fontWeight: 600,
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: isDisabled ? undefined : "#2e7d32",
          },
        }}
      >
        {isLoading ? "Requesting..." : "Extension Request "}
      </Button>
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
    const displayCrId = cr_id ? cr_id.slice(0, -2) + "XX" : null;

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
              {displayCrId}
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
                      />
                    </Box>
                    <Box component="td" sx={{ ...cellStyle }}>
                      <RowMenu
                        _id={payment._id}
                        credit_extension={payment.credit_extension}
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
};
export default CreditPayment;
