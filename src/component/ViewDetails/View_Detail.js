import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Typography,
} from "@mui/joy";
import Sheet from "@mui/joy/Sheet";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FolderIcon from "@mui/icons-material/Folder";
import Table from "@mui/joy/Table";
import { saveAs } from "file-saver";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Img12 from "../../assets/slnko_blue_logo.png";
import Axios from "../../utils/Axios";
import { useGetCustomerSummaryQuery } from "../../redux/Accounts";
import { debounce } from "lodash";

const Customer_Payment_Summary = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const p_id = searchParams.get("p_id");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [searchClient, setSearchClient] = useState("");
  const [searchDebit, setSearchDebit] = useState("");
  const [searchAdjustment, setSearchAdjustment] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedAdjust, setSelectedAdjust] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [selectedDebits, setSelectedDebits] = useState([]);

  const {
    data: responseData,
    isLoading,
    refetch,
    error: fetchError,
  } = useGetCustomerSummaryQuery(
    {
      p_id,
      start: startDate,
      end: endDate,
      searchClient,
      searchDebit,
      searchAdjustment,
    },
    { skip: !p_id }
  );

  const {
    projectDetails = {},
    balanceSummary = [],
    credit = { history: [], total: 0 },
    debit = { history: [], total: 0 },
    clientHistory = { data: [], meta: {} },
    adjustment = { history: [], totalCredit: 0, totalDebit: 0 },
  } = responseData || {};

  const CreditSummary = credit.history || [];
  const DebitSummary = debit.history || [];
  const ClientSummary = clientHistory.data || [];
  const ClientTotal = clientHistory.meta || [];
  const AdjustmentSummary = adjustment.history || [];

  useEffect(() => {
    const delayedSearch = debounce(() => {
      refetch();
    }, 500);
    delayedSearch();
    return delayedSearch.cancel;
  }, [searchClient, searchDebit, searchAdjustment, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();

  const dayOptions = { weekday: "long" };
  const dateOptions = { month: "long", day: "numeric", year: "numeric" };

  const currentDay = today.toLocaleDateString("en-US", dayOptions);
  const currentDate = today.toLocaleDateString("en-US", dateOptions);

  const handleExportAll = () => {
    try {
      // Credit Table
      const creditHeader = [
        "S.No.",
        "Credit Date",
        "Credit Mode",
        "Credited Amount",
      ];
      const creditRows = CreditSummary.map((row, index) => [
        index + 1,
        new Date(row.cr_date || row.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        row.cr_mode,
        row.cr_amount,
      ]);

      // Debit Table
      const debitHeader = [
        "S.No.",
        "Debit Date",
        "Debit Mode",
        "Paid For",
        "Paid To",
        "Amount",
        "UTR",
      ];
      const debitRows = DebitSummary.map((row, index) => [
        index + 1,
        new Date(row.dbt_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        row.pay_mode,
        row.paid_for,
        row.vendor,
        row.amount_paid,
        row.utr,
      ]);

      const adjustHeader = [
        "S.No.",
        "Adjust Date",
        "Adjust Type",
        "PO Number",
        "Paid For",
        "Paid To",
        "Credit Adjustment",
        "Debit Adjustment",
      ];
      const adjustRows = AdjustmentSummary.map((row, index) => [
        index + 1,
        new Date(row.adj_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        row.pay_type,
        row.po_number || "-",
        row.paid_for || "-",
        row.vendor || "-",
        row.adj_type === "Add" ? parseFloat(row.adj_amount) : "-",
        row.adj_type === "Subtract" ? parseFloat(row.adj_amount) : "-",
      ]);

      const clientHeader = [
        "S.No.",
        "PO Number",
        "Vendor",
        "Item Name",
        "PO Value",
        "Advance Paid",
        "Remaining Amount",
        "Total Billed Value",
      ];
      const clientRows = ClientSummary.map((client, index) => [
        index + 1,
        client.po_number || "-",
        client.vendor || "-",
        client.item || "-",
        client.po_value || "0",
        client.advance_paid || "0",
        client.remaining_amount || "0",
        client.total_billed_value || "0",
      ]);

      const summaryData = [
        ["S.No.", "Balance Summary", "Value"],
        ["1", "Total Received", total_received],
        ["2", "Total Return", total_return],
        ["3", "Net Balance [(1)-(2)]", netBalance],
        ["4", "Total Advance Paid to Vendors", total_advance_paid],
        ["4A", "Total Adjustment (Debit-Credit)", total_adjustment],
        [
          "5",
          "Balance with Slnko [(3)-(4)-(4A)]",
          Math.round(balance_with_slnko),
        ],
        ["6", "Total PO Basic Value", total_po_basic],
        ["7", "GST Value as per PO", gst_as_po_basic],
        ["8", "Total PO with GST", total_po_with_gst],
        [
          "9",
          billing_type === "Composite"
            ? "GST (13.8%)"
            : billing_type === "Individual"
              ? "GST (18%)"
              : "GST(Type - N/A)",
          gst_with_type_percentage,
        ],
        ["10", "Total Billed Value", total_billed_value],
        ["11", "Net Advance Paid [(4)-(10)]", net_advanced_paid],
        [
          "12",
          "Balance Payable to Vendors [(8)-(10)-(11)]",
          Math.round(balance_payable_to_vendors),
        ],
        ["13", "TCS as Applicable", Math.round(tcs_as_applicable)],
        ["14", "Extra GST Recoverable from Client [(8)-(6)]", extraGST],
        [
          "15",
          "Balance Required [(5)-(12)-(13)]",
          Math.round(balance_required),
        ],
      ];

      const csvContent = [
        creditHeader.join(","),
        ...creditRows.map((row) => row.join(",")),
        "",
        debitHeader.join(","),
        ...debitRows.map((row) => row.join(",")),
        "",
        clientHeader.join(","),
        ...clientRows.map((row) => row.join(",")),
        "",
        adjustHeader.join(","),
        ...adjustRows.map((row) => row.join(",")),
        "",
        ...summaryData.map((row) => row.join(",")),
        "",
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "CustomerPaymentSummary.csv");
    } catch (err) {
      console.error("failed to download csv", err);
    }
  };

  const handleDeleteDebit = async () => {
    if (selectedDebits.length === 0) {
      toast.error("No debits selected for deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await Promise.all(
        selectedDebits.map((_id) =>
          Axios.delete(`/delete-subtract-moneY/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("Debits deleted successfully.");
      setSelectedDebits([]);

      refetch();
    } catch (err) {
      console.error("Error deleting debits:", err);
      const msg =
        err?.response?.data?.msg || "Failed to delete selected debits.";

      toast.error(msg);
    }
  };

  const handleSelectAllDebits = (event) => {
    if (event.target.checked) {
      setSelectedDebits(DebitSummary.map((item) => item._id));
    } else {
      setSelectedDebits([]);
    }
  };

  const handleDebitCheckboxChange = (_id) => {
    setSelectedDebits((prev) =>
      prev.includes(_id) ? prev.filter((id) => id !== _id) : [...prev, _id]
    );
  };

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

  const handleStartDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
    refetch();
  };

  const handleEndDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
    refetch();
  };

  const handleCreditStartDateChange = (event) => {
    const value = event.target.value;
    setStartDate(value);
    refetch();
  };

  const handleCreditEndDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
    refetch();
  };

  const handleDeleteClient = async () => {
    if (selectedClients.length === 0) {
      toast.error("No POs selected for deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await Promise.all(
        selectedClients.map((_id) =>
          Axios.delete(`/delete-pO-IT/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("PO(s) deleted successfully.");
      setSelectedClients([]);

      refetch();
    } catch (err) {
      console.error("Error deleting POs:", err);
      const msg = err?.response?.data?.msg || "Failed to delete selected POs.";

      toast.error(msg);
    }
  };

  const handleClientCheckboxChange = (_id) => {
    setSelectedClients((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const handleSelectAllClient = (event) => {
    if (event.target.checked) {
      setSelectedClients(ClientSummary.map((client) => client._id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleDeleteCredit = async () => {
    if (selectedCredits.length === 0) {
      toast.error("No credits selected for deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await Promise.all(
        selectedCredits.map((_id) =>
          Axios.delete(`/delete-crdit-amount/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("Credit(s) deleted successfully.");
      setSelectedCredits([]);
      refetch(); // 🔄 Refresh credit data from backend
    } catch (err) {
      console.error("Error deleting credits:", err);
      const msg =
        err?.response?.data?.msg || "Failed to delete selected credits.";

      toast.error(msg);
    }
  };

  const handleCreditCheckboxChange = (_id) => {
    setSelectedCredits((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const handleSelectAllCredit = (event) => {
    if (event.target.checked) {
      setSelectedCredits(CreditSummary.map((credit) => credit._id));
    } else {
      setSelectedCredits([]);
    }
  };

  const handleDeleteAdjust = async () => {
    if (selectedAdjust.length === 0) {
      toast.error("No adjustment selected for deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await Promise.all(
        selectedAdjust.map((_id) =>
          Axios.delete(`/delete-adjustment-request/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("Adjustment(s) deleted successfully.");
      setSelectedAdjust([]);
      refetch(); // 🔄 Refresh adjustment history from backend
    } catch (err) {
      console.error("Error deleting adjustments:", err);
      const msg =
        err?.response?.data?.msg || "Failed to delete selected adjustments.";

      toast.error(msg);
    }
  };

  const handleAdjustCheckboxChange = (_id) => {
    setSelectedAdjust((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const handleSelectAllAdjust = (event) => {
    if (event.target.checked) {
      setSelectedAdjust(AdjustmentSummary.map((adjust) => adjust._id));
    } else {
      setSelectedAdjust([]);
    }
  };

  // ***Balance Summary***

  const {
    total_received,
    total_return,
    netBalance,
    total_advance_paid,
    balance_payable_to_vendors,
    total_adjustment,
    balance_with_slnko,
    total_po_basic,
    gst_as_po_basic,
    total_po_with_gst,
    gst_with_type_percentage,
    gst_difference,
    total_po_value,
    total_billed_value,
    net_advanced_paid,
    billing_type,
    tcs_as_applicable,
    balance_required,
    extraGST,
  } = balanceSummary || {};

  const Balance_Summary = () => {
    const headerStyle = {
      fontWeight: "bold",
      padding: "8px",
      borderBottom: "1px solid #ddd",
      textAlign: "left",
    };

    const cellStyle = {
      padding: "8px",
      borderBottom: "1px solid #eee",
    };

    return (
      <Grid container spacing={2}>
        {/* Balance Summary Section */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#fff",
              fontSize: "14px",
              "@media print": {
                boxShadow: "none",
                border: "none",
              },
            }}
          >
            <Typography
              level="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "12px",
                fontSize: "16px",
                "@media print": {
                  fontSize: "16px",
                },
              }}
            >
              Balance Summary
            </Typography>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={headerStyle}>S.No.</th>
                  <th style={headerStyle}>Description</th>
                  <th style={headerStyle}>Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "Total Received", total_received],
                  ["2", "Total Return", total_return],
                  ["3", "Net Balance [(1)-(2)]", netBalance, "#C8C8C6"],
                  ["4", "Total Advance Paid to Vendors", total_advance_paid],
                  ["4A", "Total Adjustment (Debit-Credit)", total_adjustment],
                  [
                    "5",
                    "Balance With Slnko [(3)-(4)-(4A)]",
                    Math.round(balance_with_slnko),
                    "#B6F4C6",
                    true,
                  ],
                  ["6", "Total PO Basic Value", Math.round(total_po_basic)],
                  ["7", "GST Value as per PO", Math.round(gst_as_po_basic)],
                  ["8", "Total PO with GST", Math.round(total_po_with_gst)],
                  [
                    "9",
                    billing_type === "Composite"
                      ? "GST (13.8%)"
                      : billing_type === "Individual"
                        ? "GST (18%)"
                        : "GST(Type - N/A)",
                    gst_with_type_percentage,
                  ],

                  ["10", "Total Billed Value", total_billed_value],
                  ["11", "Net Advance Paid [(4)-(10)]", net_advanced_paid],
                  [
                    "12",
                    "Balance Payable to Vendors [(8)-(10)-(11)]",
                    Math.round(balance_payable_to_vendors),
                    "#B6F4C6",
                    true,
                  ],
                  ["13", "TCS as Applicable", Math.round(tcs_as_applicable)],

                  [
                    "14",
                    "Extra GST Recoverable from Client [(8)-(6)]",
                    Math.round(extraGST),
                  ],

                  [
                    "15",
                    "Balance Required [(5)-(12)-(13)]",
                    Math.round(balance_required),
                    "#B6F4C6",
                    true,
                    Math.round(balance_required) >= 0 ? "green" : "red",
                  ],
                ].map(([sno, desc, value, bgColor, bold, color], index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: bgColor || "#fff",
                      fontWeight: bold ? "bold" : "normal",
                      color: color || "inherit",
                    }}
                  >
                    <td style={cellStyle}>{sno}</td>
                    <td style={cellStyle}>{desc}</td>
                    <td style={cellStyle}>{isLoading ? "• • •" : value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box mt={2}>
            <Chip
              size="md"
              variant="soft"
              color={gst_difference >= 0 ? "success" : "danger"}
              sx={{
                fontWeight: "bold",
                fontSize: "13px",
                px: 1.5,
                py: 0.5,
                "@media print": {
                  display: "none",
                },
              }}
            >
              GST (Diff): {gst_difference}
            </Chip>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Sheet
      sx={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: { xs: "16px", sm: "24px", md: "32px" },
        backgroundColor: "#fff",
        boxShadow: {
          xs: "none",
          sm: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
        marginLeft: { xl: "15%", lg: "20%", sm: "0%" },
        minWidth: { lg: "80%", sm: "100%", xl: "85%" },
        "@media print": {
          maxWidth: "100%",
        },
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          "@media print": {
            mb: 1,
            alignItems: "flex-start",
          },
        }}
      >
        <Box
          sx={{
            "@media print": {
              width: "100px",
            },
          }}
        >
          <img src={Img12} style={{ maxHeight: "60px", width: "auto" }} />
        </Box>
        <Typography
          variant="h4"
          fontSize={"2.5rem"}
          fontFamily="Playfair Display"
          fontWeight={600}
          sx={{
            textAlign: "center",
            flexGrow: 1,
            "@media print": {
              fontSize: "2rem",
              marginLeft: 2,
              marginRight: 2,
              color: "black",
            },
          }}
        >
          Customer Payment Summary
        </Typography>
        <Box
          textAlign="center"
          sx={{
            "@media print": {
              fontSize: "0.9rem",
            },
          }}
        >
          <Typography
            variant="subtitle1"
            fontFamily="Bona Nova SC"
            fontWeight={300}
          >
            {currentDay}
          </Typography>
          <Typography
            variant="subtitle1"
            fontFamily="Bona Nova SC"
            fontWeight={300}
          >
            {currentDate}
          </Typography>
        </Box>
      </Box>

      {/* Project Details Section */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          boxShadow: "sm",
          mt: 2,
          mb: 4,
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            color="primary"
            variant="soft"
            size="md"
            sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1 }}
          >
            Project Details
          </Chip>
          {/* <Divider sx={{ flexGrow: 1, ml: 2 }} /> */}
        </Box>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.code}
                readOnly
                label="Project ID"
                variant="outlined"
                fullWidth
                startDecorator={<FolderIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.name}
                readOnly
                label="Project Name"
                variant="outlined"
                fullWidth
                startDecorator={<BusinessIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.customer_name || "-"}
                readOnly
                label="Client Name"
                variant="outlined"
                fullWidth
                startDecorator={<AccountCircleIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.p_group}
                readOnly
                label="Group Name"
                variant="outlined"
                fullWidth
                startDecorator={<GroupsIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.site_address}
                readOnly
                label="Plant Location"
                variant="outlined"
                fullWidth
                startDecorator={<LocationOnIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Input
                value={isLoading ? "" : projectDetails.project_kwp}
                readOnly
                label="Plant Capacity"
                variant="outlined"
                fullWidth
                startDecorator={<BoltIcon />}
                placeholder={isLoading ? "Loading..." : ""}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Credit History Section */}

      <Box>
        <Chip
          color="success"
          variant="soft"
          size="md"
          sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1 }}
        >
          Credit History
        </Chip>
        <Divider sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
            "@media print": {
              display: "none",
            },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              alignItems: { md: "flex-end", xs: "stretch" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={handleCreditStartDateChange}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={handleCreditEndDateChange}
              />
            </FormControl>
          </Box>

          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedCredits.length === 0}
                onClick={handleDeleteCredit}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            p: 2,
            boxShadow: "md",
            maxWidth: "100%",
            width: "100%",
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            stickyHeader
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#ddd",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Credit Date</th>
                <th>Credit Mode</th>
                <th>Credited Amount (₹)</th>
                <th style={{ textAlign: "center" }}>
                  <Checkbox
                    color="primary"
                    onChange={handleSelectAllCredit}
                    checked={selectedCredits.length === CreditSummary.length}
                  />
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md" sx={{ fontStyle: "italic" }}>
                      Loading credit history...
                    </Typography>
                  </td>
                </tr>
              ) : CreditSummary.length > 0 ? (
                CreditSummary.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Date(
                        row.cr_date || row.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{row.cr_mode}</td>
                    <td>₹ {(row.cr_amount ?? 0).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        color="primary"
                        checked={selectedCredits.includes(row._id)}
                        onChange={() => handleCreditCheckboxChange(row._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md">
                      No credit history available
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row */}

            <tfoot>
              {CreditSummary.length > 0 && (
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td
                    colSpan={2}
                    style={{ color: "dodgerblue", textAlign: "right" }}
                  >
                    Total Credited:
                  </td>
                  <td style={{ color: "dodgerblue" }}>
                    ₹{" "}
                    {credit?.total ? credit.total.toLocaleString("en-IN") : "0"}
                  </td>
                  <td />
                </tr>
              )}
            </tfoot>
          </Table>
        </Sheet>
      </Box>

      {/* Debit History Section */}

      <Box>
        <Chip
          color="danger"
          variant="soft"
          size="md"
          sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1, mt: 3 }}
        >
          Debit History
        </Chip>
        <Divider sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
            "@media print": {
              display: "none",
            },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              alignItems: { md: "flex-end", xs: "stretch" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 250 }}>
              <FormLabel>Search Paid For</FormLabel>
              <Input
                placeholder="Enter name or vendor"
                value={searchDebit}
                onChange={(e) => setSearchDebit(e.target.value)}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </FormControl>
          </Box>

          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedDebits.length === 0}
                onClick={handleDeleteDebit}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            p: 2,
            boxShadow: "md",
            maxWidth: "100%",
            width: "100%",
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            stickyHeader
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#ddd",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Debit Date</th>
                {/* <th>Updated Debit Timestamp</th> */}
                <th>PO Number</th>
                <th>Paid For</th>
                <th>Paid To</th>
                <th>Amount (₹)</th>
                <th>UTR</th>
                <th style={{ textAlign: "center" }}>
                  <Box>
                    <Checkbox
                      color="primary"
                      onChange={handleSelectAllDebits}
                      checked={selectedDebits.length === DebitSummary.length}
                    />
                  </Box>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md" sx={{ fontStyle: "italic" }}>
                      Loading debit history...
                    </Typography>
                  </td>
                </tr>
              ) : DebitSummary.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md">
                      No debit history available
                    </Typography>
                  </td>
                </tr>
              ) : (
                DebitSummary.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Date(row.dbt_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    {/* <td>
                      {row.updatedAt && !isNaN(new Date(row.updatedAt)) ? (
                        <>
                          {new Date(row.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          ,{" "}
                          {new Date(row.updatedAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </>
                      ) : (
                        "NA"
                      )}
                    </td> */}
                    <td>{row.po_number}</td>
                    <td>{row.paid_for}</td>
                    <td>{row.vendor}</td>
                    <td>₹ {row.amount_paid.toLocaleString("en-IN")}</td>
                    <td>{row.utr}</td>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        color="primary"
                        checked={selectedDebits.includes(row._id)}
                        onChange={() => handleDebitCheckboxChange(row._id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* No Data Row */}
            <tfoot>
              {DebitSummary.length > 0 && (
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td colSpan={4} style={{ color: "red", textAlign: "right" }}>
                    Total Debited:
                  </td>

                  <td colSpan={3} style={{ color: "red" }}>
                    ₹ {debit?.total?.toLocaleString("en-IN")}
                  </td>
                </tr>
              )}
            </tfoot>
          </Table>
        </Sheet>
      </Box>

      {/* Client History Section */}
      <Box>
        <Chip
          color="warning"
          variant="soft"
          size="md"
          sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1, mt: 3 }}
        >
          Purchase History
        </Chip>
        <Divider sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 2,
            "@media print": {
              display: "none",
            },
          }}
        >
          {/* Search Input */}
          <Input
            placeholder="Search Client"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            sx={{ width: { xs: "100%", md: 250 } }}
          />

          {/* Delete Button (Admin only) */}
          {/* {["IT Team", "Guddu Rani Dubey", "Prachi Singh", "admin"].includes(
            user?.name
          ) && (
            <IconButton
              color="danger"
              disabled={selectedClients.length === 0}
              onClick={handleDeleteClient}
            >
              <DeleteIcon />
            </IconButton>
          )} */}
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            p: 2,
            boxShadow: "md",
            maxWidth: "100%",
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#eee",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Item Name</th>
                <th>PO Value (₹)</th>
                <th>Advance Paid (₹)</th>
                <th>Remaining Amount (₹)</th>
                <th>Total Billed Value (₹)</th>
                <th style={{ textAlign: "center" }}>
                  <Checkbox
                    onChange={handleSelectAllClient}
                    checked={selectedClients.length === ClientSummary.length}
                  />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md" sx={{ fontStyle: "italic" }}>
                      Loading purchase history...
                    </Typography>
                  </td>
                </tr>
              ) : ClientSummary.length > 0 ? (
                ClientSummary.map((client) => (
                  <tr key={client.po_number}>
                    <td>{client.po_number || "N/A"}</td>
                    <td>{client.vendor || "N/A"}</td>
                    <td>{client.item_name || "N/A"}</td>
                    <td>₹ {client?.po_value.toLocaleString("en-IN")}</td>
                    <td>₹ {client?.advance_paid.toLocaleString("en-IN")}</td>
                    <td>
                      ₹ {client?.remaining_amount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      ₹ {client?.total_billed_value.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={selectedClients.includes(client._id)}
                        onChange={() => handleClientCheckboxChange(client._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md">
                      No purchase history available
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row */}
            <tfoot>
              {ClientSummary.length > 0 && (
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td colSpan={3} style={{ textAlign: "right" }}>
                    Total:{" "}
                  </td>
                  <td>
                    ₹ {ClientTotal?.total_po_value?.toLocaleString("en-IN")}
                  </td>
                  <td>
                    ₹ {ClientTotal?.total_advance_paid?.toLocaleString("en-IN")}
                  </td>
                  <td>
                    ₹{" "}
                    {ClientTotal?.total_remaining_amount?.toLocaleString(
                      "en-IN"
                    )}
                  </td>
                  <td>
                    ₹ {ClientTotal?.total_billed_value?.toLocaleString("en-IN")}
                  </td>
                  <td />
                </tr>
              )}
            </tfoot>
          </Table>
        </Sheet>
      </Box>

      {/* Adjust History Section */}
      <Box>
        <Chip
          color="neutral"
          variant="soft"
          size="md"
          sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1, mt: 3 }}
        >
          Adjustment History
        </Chip>
        <Divider sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
            "@media print": {
              display: "none",
            },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { md: "row", xs: "column" },
            }}
          >
            <Input
              placeholder="Search here"
              value={searchAdjustment}
              onChange={(e) => setSearchAdjustment(e.target.value)}
              style={{ width: "250px" }}
            />
          </Box>
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedAdjust.length === 0}
                onClick={handleDeleteAdjust}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            p: 2,
            boxShadow: "md",
            maxWidth: "100%",
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#eee",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Adjust Date</th>
                {/* <th>Updated Adjust Timestamp</th> */}
                <th>Adjustment Type</th>
                <th>Reason</th>
                <th>PO Number</th>
                <th>Paid For</th>
                <th>Description</th>
                <th>Credit Adjustment</th>
                <th>Debit Adjustment</th>
                <th style={{ textAlign: "center" }}>
                  <Checkbox
                    onChange={handleSelectAllAdjust}
                    checked={selectedAdjust.length === AdjustmentSummary.length}
                  />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md" sx={{ fontStyle: "italic" }}>
                      Loading adjustment history...
                    </Typography>
                  </td>
                </tr>
              ) : AdjustmentSummary.length > 0 ? (
                AdjustmentSummary.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Date(row.adj_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{row.pay_type}</td>
                    <td>{row.description || "-"}</td>
                    <td>{row.po_number || "-"}</td>
                    <td>{row.paid_for}</td>
                    <td>{row.comment || "-"}</td>
                    <td>
                      {row.adj_type === "Add"
                        ? `₹ ${parseFloat(row.adj_amount).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td>
                      {row.adj_type === "Subtract"
                        ? `₹ ${parseFloat(row.adj_amount).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        color="primary"
                        checked={selectedAdjust.includes(row._id)}
                        onChange={() => handleAdjustCheckboxChange(row._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <Typography level="body-md">
                      No adjustment history available
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>

            {!isLoading && AdjustmentSummary.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td colSpan={6} style={{ textAlign: "right" }}>
                    Total:
                  </td>
                  <td>₹ {adjustment?.totalCredit?.toLocaleString("en-IN")}</td>
                  <td>₹ {adjustment?.totalDebit?.toLocaleString("en-IN")}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </Table>
        </Sheet>
      </Box>

      <hr />
      {/* Balance Summary and Amount Available Section */}
      <Box sx={{ marginBottom: "30px" }}>
        <Balance_Summary />
      </Box>

      {/* Balance Summary Section */}
      <Box
        mt={4}
        display="flex"
        justifyContent="flex-start"
        sx={{
          "@media print": {
            display: "none",
          },
        }}
      >
        {/* Back Button - stays in flow */}
        <Button
          variant="soft"
          color="primary"
          startDecorator={<ArrowBackIcon />}
          onClick={() => navigate("/project-balance")}
        >
          Back
        </Button>
      </Box>

      <Box
        position="fixed"
        bottom={16}
        right={16}
        zIndex={1300}
        display="flex"
        gap={2}
        sx={{
          "@media print": {
            display: "none",
          },
        }}
      >
        <Button
          variant="solid"
          color="danger"
          onClick={handlePrint}
          startDecorator={<PrintIcon />}
        >
          Print
        </Button>

        <Button
          variant="solid"
          color="success"
          onClick={handleExportAll}
          startDecorator={<FileDownloadIcon />}
        >
          CSV
        </Button>
      </Box>
    </Sheet>
  );
};

export default Customer_Payment_Summary;
