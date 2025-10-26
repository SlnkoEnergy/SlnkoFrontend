import DeleteIcon from "@mui/icons-material/Delete";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Link,
  Modal,
  ModalDialog,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Tooltip,
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
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Img12 from "../../assets/slnko_blue_logo.png";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileRounded from "@mui/icons-material/InsertDriveFileRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Axios from "../../utils/Axios";
import CurrencyRupee from "@mui/icons-material/CurrencyRupee";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import {
  useGetCustomerSummaryQuery,
  useUpdateSalesPOMutation,
} from "../../redux/Accounts";
import { debounce } from "lodash";
import { useMemo } from "react";

const Customer_Payment_Summary = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const p_id = searchParams.get("p_id");
  const _id = searchParams.get("_id");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchClient, setSearchClient] = useState("");
  const [searchDebit, setSearchDebit] = useState("");
  const [searchAdjustment, setSearchAdjustment] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedAdjust, setSelectedAdjust] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [selectedDebits, setSelectedDebits] = useState([]);
  const [salesBasic, setSalesBasic] = useState("");
  const [salesGst, setSalesGst] = useState("");

  const [searchSales, setSearchSales] = useState("");

  const {
    data: responseData,
    isLoading,
    refetch,
    error: fetchError,
  } = useGetCustomerSummaryQuery({
    p_id,
    _id,
    start: startDate,
    end: endDate,
    searchClient,
    searchDebit,
    searchAdjustment,
  });

  const {
    projectDetails = {},
    balanceSummary = {},
    credit = { history: [], total: 0 },
    debit = { history: [], total: 0 },
    clientHistory = { data: [], meta: {} },
    salesHistory = { data: [], meta: {} },
    adjustment = { history: [], totalCredit: 0, totalDebit: 0 },
  } = responseData ?? {};

  const CreditSummary = Array.isArray(credit.history) ? credit.history : [];
  const DebitSummary = Array.isArray(debit.history) ? debit.history : [];
  const ClientSummary = Array.isArray(clientHistory.data)
    ? clientHistory.data
    : [];
  const ClientTotal = clientHistory?.meta ?? {};
  const SalesSummary = Array.isArray(salesHistory.data)
    ? salesHistory.data
    : [];
  const SalesTotal = salesHistory?.meta ?? {};
  const AdjustmentSummary = Array.isArray(adjustment.history)
    ? adjustment.history
    : [];

  const formatDateTime = (d) => {
    if (!d) return "—";
    const x = new Date(d);
    return isNaN(x) ? "—" : `${x.toLocaleDateString()}`;
  };

  const normalizeAttachments = (atts) =>
    (Array.isArray(atts) ? atts : [])
      .map((a) => ({
        url: a?.url || a?.attachment_url || "",
        name: a?.name || a?.attachment_name || "File",
      }))
      .filter((a) => a.url);

  const getItemLabel = (row) => {
    if (typeof row?.item_name === "string") return row.item_name;
    if (Array.isArray(row?.item_name)) {
      return row.item_name
        .map(
          (it) => it?.product_name || it?.category?.name || it?.category || ""
        )
        .filter(Boolean)
        .join(", ");
    }
    return row?.item_name || "-";
  };

  const filteredSales = useMemo(() => {
    const q = (searchSales || "").trim().toLowerCase();
    if (!q) return SalesSummary || [];
    return (SalesSummary || []).filter((s) => {
      const po = String(s?.po_number || "").toLowerCase();
      const vendor = String(s?.vendor || "").toLowerCase();
      const item = getItemLabel(s).toLowerCase();
      return po.includes(q) || vendor.includes(q) || item.includes(q);
    });
  }, [SalesSummary, searchSales]);

  useEffect(() => {
    const delayedSearch = debounce(() => {
      refetch();
    }, 500);
    delayedSearch();
    return delayedSearch.cancel;
  }, [searchClient, searchDebit, searchAdjustment, startDate, endDate]);

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found.");
        setIsPrinting(false);
        return;
      }
      const response = await Axios.post(
        "/accounting/customer-payment-summary-pdf",
        { p_id },
        {
          headers: { "x-auth-token": token },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customer_payment_summary_${p_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  const today = new Date();

  const dayOptions = { weekday: "long" };
  const dateOptions = { month: "long", day: "numeric", year: "numeric" };

  const currentDay = today.toLocaleDateString("en-US", dayOptions);
  const currentDate = today.toLocaleDateString("en-US", dateOptions);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found.");
        setIsExporting(false);
        return;
      }

      const params = new URLSearchParams();
      if (p_id) params.set("p_id", p_id);
      if (_id) params.set("_id", _id);
      if (startDate) params.set("start", startDate);
      if (endDate) params.set("end", endDate);
      if (searchClient) params.set("searchClient", searchClient);
      if (searchDebit) params.set("searchDebit", searchDebit);
      if (searchAdjustment) params.set("searchAdjustment", searchAdjustment);
      params.set("export", "csv");

      const resp = await Axios.get(
        `/accounting/customer-payment-summary?${params.toString()}`,
        {
          headers: { "x-auth-token": token },
          responseType: "blob",
        }
      );

      // Try to read filename from header; fallback to something sensible
      const cd = resp.headers["content-disposition"] || "";
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
      const headerFileName = decodeURIComponent(
        match?.[1] || match?.[2] || ""
      ).trim();

      const fileName =
        headerFileName || `customer_payment_summary_${p_id || "export"}.csv`;

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      toast.error("Failed to download CSV.");
    } finally {
      setIsExporting(false);
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

  const handleDeleteClient = async ({ _id }) => {
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
      refetch();
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
      refetch();
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
  total_advance_paid,
  total_adjustment,
  balance_with_slnko,
  billing_type,
  gst_difference,
  total_sales_value,
  total_unbilled_sales,
  advance_left_after_billed,
  netBalance,
  total_po_with_gst,
  total_billed_value,
  exact_remaining_pay_to_vendors,
} = balanceSummary || {};

const formatIndianNumber = (val) => {
  const n = Number(val);
  if (!isFinite(n)) return "—";
  return n.toLocaleString("en-IN");
};

const RupeeValue = ({ value, showSymbol = true }) => {
  const n = Number(value);
  if (!isFinite(n)) return "—";
  const formatted = n.toLocaleString("en-IN");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
      }}
    >
      {showSymbol && (
        <CurrencyRupee style={{ fontSize: 16, marginBottom: 1 }} />
      )}
      <span>{formatted}</span>
    </span>
  );
};
const num = (v) => Number(v) || 0;
const calc_balance_with_slnko = () => {
  return (
    num(netBalance) -
    num(total_sales_value) -
    num(total_unbilled_sales) -
    num(advance_left_after_billed) -
    num(total_adjustment)
  );
};

const balance_with_slnko_value = calc_balance_with_slnko();

const Balance_Summary = ({ isLoading = false }) => {
  const safeRound = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : "• • •";
  };

  const rows = [
    ["1", "Total Received", safeRound(total_received), "#FFF59D"],
    ["2", "Total Return", safeRound(total_return), "#FFF59D"],
    ["3", "Net Balance [(1)-(2)]", safeRound(netBalance), "#FFE082", true],
    [
      "4",
      "Total Advances Paid to Vendors",
      safeRound(total_advance_paid),
      "#FFF",
    ],
    ["", "Billing Details", "", "#F5F5F5"],
    ["5", "Invoice issued to customer", safeRound(total_sales_value), "#FFF"],
    [
      "6",
      "Bills received, yet to be invoiced to customer",
      safeRound(total_unbilled_sales),
      "#FFF",
    ],
    [
      "7",
      "Advances left after bills received",
      safeRound(advance_left_after_billed),
      "#FFF",
    ],
    ["8", "Adjustment (Debit-Credit)", safeRound(total_adjustment), "#FFF"],
    [
  "9",
  "Balance With Slnko [3 - 5 - 6 - 7 - 8]",
  safeRound(balance_with_slnko_value),
  "#FFECB3",
  true,
],

  ];

  const formulaMap = {
    1: "Amount Received from Customer",
    2: "Amount Returned to Customer",
    3: "Net Balance = (1) - (2)",
    4: "Advance lying with vendors after reducing bill balances",
    5: "Value of material delivered (PO Closed) & Sales Invoice issued (including Sales GST)",
    6: "Value of material delivered (PO Closed) including Purchase GST",
    7: "Advance left after bills received ",
    8: "Adjustments (Debit / Credit)",
    9: "",
  };

  return (
    <Grid container spacing={2}>
      {/* ---------- LEFT: Balance Summary ---------- */}
      <Grid item xs={12} sm={8} md={8}>
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "8px",
            p: 2,
            backgroundColor: "#fff",
            overflowX: "auto",
            "@media print": { boxShadow: "none", border: "none" },
          }}
        >
          <Typography
            level="h5"
            sx={{ fontWeight: "bold", mb: 1.5, fontSize: 16 }}
          >
            Balance Summary
          </Typography>

          <Table
            aria-label="Balance summary"
            borderAxis="both"
            sx={{
              minWidth: 560,
              tableLayout: "fixed",
              "& th, & td": {
                px: 1.5,
                py: 1,
                fontSize: 14,
                "@media print": {
                  px: 1,
                  py: 0.75,
                  fontSize: 12,
                  border: "1px solid #ddd",
                },
              },
              "& th.num, & td.num": {
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 64 }}>S.No.</th>
                <th>Description</th>
                <th className="num" style={{ width: 180 }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([sno, desc, value, bg, bold]) => {
                if (sno === "") {
                  return (
                    <tr key={desc}>
                      <td
                        colSpan={3}
                        style={{
                          background: "#F5F5F5",
                          textAlign: "center",
                          fontWeight: 700,
                          color: "#333",
                        }}
                      >
                        {desc}
                      </td>
                    </tr>
                  );
                }

                return (
                  <Tooltip
                    key={sno + desc}
                    title={formulaMap[sno] || ""}
                    arrow
                    placement="top-start"
                  >
                    <tr
                      style={{
                        background: bg,
                        fontWeight: bold ? 700 : 400,
                      }}
                    >
                      <td>{sno}</td>
                      <td>{desc}</td>
                      <td className="num">
                        {isLoading ? (
                          "• • •"
                        ) : (
                          <RupeeValue
                            value={value}
                            showSymbol={!(sno === "5" || sno === "6")}
                          />
                        )}
                      </td>
                    </tr>
                  </Tooltip>
                );
              })}
            </tbody>
          </Table>
        </Sheet>
      </Grid>

      {/* ---------- RIGHT: KPIs + PAYABLE ---------- */}
      <Grid item xs={12} sm={4} md={4}>
        {/* KPI chips */}
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          sx={{ mb: 2 }}
        >
          <Chip
            size="md"
            variant="soft"
            color={(Number(gst_difference) ?? 0) >= 0 ? "success" : "danger"}
            sx={{ fontWeight: "bold" }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              GST (Diff):{" "}
              {isLoading ? "• • •" : formatIndianNumber(gst_difference)}
            </span>
          </Chip>

          {billing_type && (
            <Chip
              size="md"
              variant="soft"
              color="neutral"
              sx={{ fontWeight: 600 }}
            >
              Billing:&nbsp;
              {billing_type === "Composite"
                ? "Composite (13.8%)"
                : billing_type === "Individual"
                ? "Individual (18%)"
                : "N/A"}
            </Chip>
          )}
        </Stack>

        {/* Payable to Vendors */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "8px",
            p: 2,
            backgroundColor: "#fff",
            overflowX: "auto",
          }}
        >
          <Typography
            level="h6"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: 15,
              backgroundColor: "#FBC02D",
              px: 1.5,
              py: 0.5,
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            Payable to Vendors
          </Typography>

          <Table
            aria-label="Payable to Vendors"
            borderAxis="both"
            sx={{
              minWidth: 400,
              "& th, & td": { px: 1.5, py: 1, fontSize: 14 },
              "& th.num, & td.num": { textAlign: "right" },
              "& tbody tr:hover": { backgroundColor: "#FFFDE7" },
            }}
          >
            <thead>
              <tr>
                <th>Description</th>
                <th className="num" style={{ width: 180 }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Total PO Value", safeRound(total_po_with_gst)],
                ["Billed Value", safeRound(total_billed_value)],
                ["Advance Paid", safeRound(total_advance_paid)],
                [
                  "Remaining to Pay",
                  safeRound(exact_remaining_pay_to_vendors),
                  total_billed_value > total_advance_paid
                    ? "success"
                    : "warning",
                ],
              ].map(([desc, value, tone]) => (
                <Tooltip
                  key={desc}
                  title={
                    desc === "Remaining to Pay"
                      ? "If Billed > Advance → (PO with GST − Billed), else = Total Advance Paid"
                      : ""
                  }
                  arrow
                  placement="top-start"
                >
                  <tr
                    style={{
                      background:
                        desc === "Remaining to Pay"
                          ? tone === "success"
                            ? "#E8F5E9"
                            : "#FFF9C4"
                          : "#FFFFFF",
                      fontWeight: desc === "Remaining to Pay" ? 700 : 400,
                    }}
                  >
                    <td>{desc}</td>
                    <td className="num">
                      {isLoading ? "• • •" : value?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </Tooltip>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Grid>
    </Grid>
  );
};



  const [updateSalesPO, { isLoading: isConverting }] =
    useUpdateSalesPOMutation();

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [salesRemarks, setSalesRemarks] = useState("");
  const [salesFiles, setSalesFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPO, setSelectedPO] = useState([]);
  const [salesAmounts, setSalesAmounts] = useState({});
  const [salesInvoice, setSalesInvoice] = useState("");

 const handleSalesConvert = async () => {
  try {
    // ✅ 1. Ensure PO(s) selected
    if (!selectedPO.length) {
      toast.error("No PO(s) selected.");
      return;
    }

    // ✅ 2. Ensure remarks
    if (!salesRemarks.trim()) {
      toast.error("Remarks are required.");
      return;
    }

    // ✅ 3. Ensure Sales Invoice
    const inv = (salesInvoice || "").trim();
    if (!inv) {
      toast.error("Sales Invoice No. is required.");
      return;
    }

    // Optional: basic invoice format validation
    const invoiceOk = /^[A-Za-z0-9\/\-.]+$/.test(inv);
    if (!invoiceOk) {
      toast.error(
        "Sales Invoice No. can contain letters, numbers, '/', '-' or '.'."
      );
      return;
    }

    // ✅ 4. Validate POs for basic value presence
    const invalidPOs = selectedPO.filter((po) => {
      const id = po._id;
      const basic = salesAmounts[id]?.basic;
      // Must exist & be numeric
      return basic === undefined || basic === "" || isNaN(Number(basic));
    });

    if (invalidPOs.length > 0) {
      const poList = invalidPOs.map((p) => p.po_number).join(", ");
      toast.error(`Please enter Basic Sales value for: ${poList}`);
      return;
    }

    // ✅ 5. Client-side guard: basic <= bill_basic
    const capErrors = selectedPO.filter((po) => {
      const id = po._id;
      const billBasic = Number(po.bill_basic || 0);
      const basic = Number(salesAmounts[id]?.basic || 0);
      return basic < 0 || basic > billBasic;
    });

    if (capErrors.length > 0) {
      const poList = capErrors.map((p) => p.po_number).join(", ");
      toast.error(`Basic Sales must not exceed Billed Basic Value for: ${poList}`);
      return;
    }

    // ✅ 6. Perform conversion calls
    const results = await Promise.allSettled(
      selectedPO.map(async (po) => {
        const id = po._id;
        const poNumber = po.po_number;
        const basic = Number(salesAmounts[id]?.basic || 0);
        const gst = Number(salesAmounts[id]?.gst || 0); // optional, can be 0

        return await updateSalesPO({
          id,
          po_number: poNumber,
          remarks: salesRemarks.trim(),
          basic_sales: basic,
          gst_on_sales: gst,
          sales_invoice: inv,
          files: salesFiles,
        }).unwrap();
      })
    );

    // ✅ 7. Count results
    let ok = 0,
      fail = 0;
    for (const r of results) {
      if (r.status === "fulfilled") ok++;
      else fail++;
    }

    if (ok) toast.success(`Converted ${ok} PO(s) successfully.`);
    if (fail) toast.warning(`Failed ${fail} PO(s).`);

    // ✅ 8. Reset form on success
    if (ok) {
      setSalesOpen(false);
      setSelectedPO([]);
      setSelectedClients?.([]);
      setSalesFiles([]);
      setSalesRemarks("");
      setSalesInvoice?.("");
      setSalesAmounts({});
      refetch?.();
    }
  } catch (err) {
    const msg =
      err?.data?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Sales conversion failed.";
    toast.error(msg);
  }
};



  const addFiles = (files) => {
    const incoming = Array.from(files || []).map((f) => ({
      file: f,
      attachment_name: f.name,
    }));

    setSalesFiles((prev) => {
      const map = new Map(
        prev.map((x) => [x.file.name + x.file.size + x.file.lastModified, x])
      );
      incoming.forEach((x) => {
        const k = x.file.name + x.file.size + x.file.lastModified;
        if (!map.has(k)) map.set(k, x);
      });
      return Array.from(map.values());
    });
  };

  const onFileInputChange = (e) => addFiles(e.target.files);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const removeFile = (file) => {
    setSalesFiles((prev) =>
      prev.filter(
        (f) =>
          !(
            f.file.name === file.name &&
            f.file.size === file.size &&
            f.file.lastModified === file.lastModified
          )
      )
    );
  };
  const clearAllFiles = () => setSalesFiles([]);
  const [saleDetailOpen, setSaleDetailOpen] = useState(false);
  const [activeSale, setActiveSale] = useState(null);

  const openSaleDetail = (sale) => {
    setActiveSale(sale);
    setSaleDetailOpen(true);
  };
  const closeSaleDetail = () => {
    setSaleDetailOpen(false);
    setActiveSale(null);
  };

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const getRemainingAllowed = (po) => {
    const poValue = toNum(po?.po_value) || 0;
    const totalBilledRaw = po?.total_billed;
    const totalBilled = toNum(totalBilledRaw);

    if (!Number.isFinite(totalBilled))
      return { error: "Invalid total_billed (NaN)", remaining: NaN };
    if (totalBilled < 0)
      return { error: "total_billed cannot be < 0", remaining: NaN };

    const alreadySales = toNum(po?.total_sales_value) || 0;
    const cap = Math.max(0, poValue - totalBilled);
    const remaining = Math.max(0, cap - alreadySales);
    return { error: null, remaining };
  };

  function ItemNameCell({ text }) {
    if (!text) return "N/A";

    return (
      <Tooltip
        title={
          <Box
            sx={{
              p: 1,
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#fafafa",
              boxShadow: "sm",
              maxWidth: 300,
            }}
          >
            <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
              {text}
            </Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <Box
          sx={{
            maxWidth: 180,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            "@media print": {
              maxWidth: "unset",
              whiteSpace: "normal",
              overflow: "visible",
              textOverflow: "clip",
            },
          }}
        >
          {text}
        </Box>
      </Tooltip>
    );
  }

  const headerOffset = 72;
  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  function EllipsisTooltipInput({ value, startDecorator, placeholder = "—" }) {
    const inputRef = useRef(null);
    const [overflow, setOverflow] = useState(false);

    const safeVal = isLoading ? "" : value ?? "—";

    const checkOverflow = () => {
      const el = inputRef.current;
      if (!el) return;
      setOverflow(el.scrollWidth > el.clientWidth);
    };

    useEffect(() => {
      checkOverflow();
    }, [safeVal]);

    useEffect(() => {
      const el = inputRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(checkOverflow);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const field = (
      <Input
        readOnly
        value={safeVal}
        startDecorator={startDecorator}
        placeholder={isLoading ? "Loading..." : placeholder}
        slotProps={{
          input: {
            ref: inputRef,
            style: {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            onMouseEnter: checkOverflow,
          },
        }}
      />
    );

    return overflow ? (
      <Tooltip
        arrow
        placement="top"
        title={
          <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
            {value || "—"}
          </Typography>
        }
      >
        {field}
      </Tooltip>
    ) : (
      field
    );
  }
const formatINRWithTooltip = (value) => {
  const num = Number(value || 0);
  const display = `₹ ${num.toLocaleString("en-IN")}`;
  const precise = num % 1 !== 0 && num.toString().split(".")[1]?.length > 2;
  return (
    <Tooltip title={precise ? num.toFixed(3) : ""} placement="top" arrow>
      <span>{display}</span>
    </Tooltip>
  );
};


  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
         ml: {
          lg: "var(--Sidebar-width)",
        },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
    
      }}
    >
    <Box
  sx={{
    minHeight: "100dvh",
    
    px: { xs: 1.5, sm: 2, md: 3 },
    py: { xs: 1.5, md: 2.5 },
    bgcolor: "background.body",
  }}
>
  <Box
    sx={{
      maxWidth: { xs: "100%", lg: 1400, xl: 1600 },
      mx: "auto",
      width: "100%",
    }}
  >

          {/* Credit History Section */}
          <Card
            variant="outlined"
      sx={{
        borderRadius: "xl",
        p: { xs: 2, md: 3 },
        boxShadow: "lg",
        borderColor: "neutral.outlinedBorder",
      }}
          >

            
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              sx={{ flexWrap: "wrap", gap: 2 }}
            >
              <Box>
                <img src={Img12} style={{ maxHeight: "60px", width: "auto" }} />
              </Box>
              <Typography
                variant="h3"
                fontSize={"2.5rem"}
                fontFamily="Playfair Display"
                sx={{ textAlign: "center", flexGrow: 1, fontWeight: 700 }}
              >
                Customer Payment Summary
              </Typography>
              <Box textAlign="right" minWidth={180}>
                <Typography variant="subtitle1" fontFamily="Bona Nova SC">
                  {currentDay}
                </Typography>
                <Typography variant="subtitle1" fontFamily="Bona Nova SC">
                  {currentDate}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={4}>
        {/* =================== 1️⃣ PROJECT DETAILS =================== */}
        <Box>
          <Typography level="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Project Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1.5}>
            <Grid xs={12} sm={6} md={4}>
              <EllipsisTooltipInput
                value={projectDetails.code}
                startDecorator={<FolderIcon />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <EllipsisTooltipInput
                value={projectDetails.name}
                startDecorator={<BusinessIcon />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <Input
                value={projectDetails.customer_name || "-"}
                readOnly
                startDecorator={<AccountCircleIcon />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <Input
                value={projectDetails.p_group || "-"}
                readOnly
                startDecorator={<GroupsIcon />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <EllipsisTooltipInput
                value={projectDetails.site_address}
                startDecorator={<LocationOnIcon />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <Input
                value={projectDetails.project_kwp || "-"}
                readOnly
                startDecorator={<BoltIcon />}
              />
            </Grid>
          </Grid>
        </Box>

              <Box>
                <Chip
                  color="success"
                  variant="soft"
                  size="md"
                  sx={{ fontSize: "1.1rem", fontWeight: 600, px: 2, py: 1 }}
                >
                  Credit History
                </Chip>
                <Divider
                  sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }}
                />

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
                    user?.name === "Varun Mishra" ||
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
                            checked={
                              selectedCredits.length === CreditSummary.length
                            }
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
                            <Typography
                              level="body-md"
                              sx={{ fontStyle: "italic" }}
                            >
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
                            <td>
                              ₹ {(row.cr_amount ?? 0).toLocaleString("en-IN")}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <Checkbox
                                color="primary"
                                checked={selectedCredits.includes(row._id)}
                                onChange={() =>
                                  handleCreditCheckboxChange(row._id)
                                }
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
                        <tr
                          style={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <td
                            colSpan={2}
                            style={{
                              color: "dodgerblue",
                              textAlign: "right",
                            }}
                          >
                            Total Credited:
                          </td>
                          <td style={{ color: "dodgerblue" }}>
                            ₹{" "}
                            {credit?.total
                              ? credit.total.toLocaleString("en-IN")
                              : "0"}
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
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    mt: 3,
                  }}
                >
                  Debit History
                </Chip>
                <Divider
                  sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }}
                />

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
                    user?.name === "Varun Mishra" ||
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

                    overflowX: "auto",
                    overflowY: "hidden",
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
                      tableLayout: "fixed",
                      "& thead": {
                        backgroundColor: "neutral.softBg",
                        "@media print": { backgroundColor: "#ddd" },
                      },
                      "& th, & td": {
                        textAlign: "left",
                        px: 2,
                        py: 1.5,
                        verticalAlign: "middle",
                        "@media print": {
                          px: 1,
                          py: 1,
                          fontSize: "12px",
                          border: "1px solid #ccc",
                        },
                      },
                      "& th.utrCell, & td.utrCell": {
                        maxWidth: { xs: 120, sm: 180, md: 260 },
                        whiteSpace: { xs: "normal", md: "nowrap" },
                        overflow: { md: "hidden" },
                        textOverflow: { md: "ellipsis" },
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      },
                      "@media print": {
                        borderCollapse: "collapse",
                        width: "100%",
                        tableLayout: "fixed",
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Debit Date</th>
                        <th>PO Number</th>
                        <th>Paid For</th>
                        <th>Paid To</th>
                        <th>Amount (₹)</th>
                        <th className="utrCell">UTR</th>
                        <th style={{ textAlign: "center" }}>
                          <Box>
                            <Checkbox
                              color="primary"
                              onChange={handleSelectAllDebits}
                              checked={
                                selectedDebits.length === DebitSummary.length
                              }
                            />
                          </Box>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            <Typography
                              level="body-md"
                              sx={{ fontStyle: "italic" }}
                            >
                              Loading debit history...
                            </Typography>
                          </td>
                        </tr>
                      ) : DebitSummary.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            <Typography level="body-md">
                              No debit history available
                            </Typography>
                          </td>
                        </tr>
                      ) : (
                        DebitSummary.map((row) => (
                          <tr key={row._id || row.id}>
                            <td>
                              {new Date(row.dbt_date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td>{row.po_number}</td>
                            <td>{row.paid_for}</td>
                            <td>{row.vendor}</td>
                            <td>
                              ₹{" "}
                              {Number(row.amount_paid).toLocaleString("en-IN")}
                            </td>

                            {/* UTR with responsive wrap/ellipsis and hover tooltip (no icon) */}
                            <td className="utrCell" title={row.utr || "-"}>
                              {row.utr || "-"}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              <Checkbox
                                color="primary"
                                checked={selectedDebits.includes(row._id)}
                                onChange={() =>
                                  handleDebitCheckboxChange(row._id)
                                }
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                    {DebitSummary.length > 0 && (
                      <tfoot>
                        <tr
                          style={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <td
                            colSpan={4}
                            style={{ color: "red", textAlign: "right" }}
                          >
                            Total Debited:
                          </td>
                          <td colSpan={3} style={{ color: "red" }}>
                            ₹ {debit?.total?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </Sheet>
              </Box>

              {/* Client History Section */}
              <Box>
                <Tabs
                  value={tabIndex}
                  onChange={(_, v) => setTabIndex(v)}
                  sx={{
                    "--Tabs-indicatorThickness": "0px",
                    "--Tabs-indicatorColor": "transparent",
                    backgroundColor: "transparent",
                  }}
                  slotProps={{ tabIndicator: { sx: { display: "none" } } }}
                >
                  <TabList
                    variant="plain"
                    sx={{
                      "--Tabs-gap": "8px",
                      "--Tabs-radius": "999px",
                      p: 0.5,
                      borderRadius: "999px",
                      boxShadow: "sm",
                      width: "fit-content",
                      padding: "9px",
                      mt: 2,
                      bgcolor: "transparent",
                      "& .MuiTab-root::after": { display: "none" },
                      "& .Mui-selected::after": { display: "none" },
                    }}
                  >
                    <Tab
                      variant="plain"
                      sx={{
                        borderRadius: "999px",
                        letterSpacing: 0.2,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        px: 2,
                        py: 1,
                        "&:hover": { bgcolor: "neutral.softHoverBg" },
                        '&[aria-selected="false"]': {
                          bgcolor: "neutral.softBg",
                          color: "neutral.softColor",
                        },
                        '&[aria-selected="true"]': {
                          bgcolor: "warning.softBg",
                          color: "warning.softColor",
                          boxShadow: "sm",
                        },
                        "&::after": { display: "none" },
                      }}
                    >
                      Purchase History
                    </Tab>
                    &nbsp;&nbsp;
                    <Tab
                      variant="plain"
                      sx={{
                        borderRadius: "999px",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        px: 2,
                        py: 1,
                        letterSpacing: 0.2,
                        "&:hover": { bgcolor: "neutral.softHoverBg" },
                        '&[aria-selected="false"]': {
                          bgcolor: "neutral.softBg",
                          color: "neutral.softColor",
                        },
                        '&[aria-selected="true"]': {
                          bgcolor: "primary.softBg",
                          color: "primary.softColor",
                          boxShadow: "sm",
                        },
                        "&::after": { display: "none" },
                      }}
                    >
                      Sales History
                    </Tab>
                  </TabList>
                  <Divider
                    sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }}
                  />

                  {/* -------------------- PURCHASE HISTORY -------------------- */}
                  <TabPanel value={0} sx={{ p: 0, pt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        mb: 2,
                        "@media print": { display: "none" },
                      }}
                    >
                      {/* Search Input */}
                      <Input
                        placeholder="Search Client"
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        sx={{ width: { xs: "100%", md: 250 } }}
                      />

                      {/* Actions: Delete + Sales Conversion */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {[
                          "IT Team",
                          "Guddu Rani Dubey",
                          "Prachi Singh",
                          "admin",
                          "Chandan Singh",
                          "Gagan Tayal",
                        ].includes(user?.name) && (
                          <>
                            <Button
                              variant="solid"
                              color="primary"
                              disabled={selectedClients.length === 0}
                              onClick={() => setConfirmCloseOpen(true)}
                            >
                              Sales Conversion
                            </Button>

                            {user?.name !== "Chandan Singh" && (
                              <Divider orientation="vertical" flexItem />
                            )}

                            {user?.name !== "Chandan Singh" && (
                              <IconButton
                                color="danger"
                                disabled={selectedClients.length === 0}
                                onClick={handleDeleteClient}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
<Sheet
  variant="outlined"
  sx={{
    borderRadius: 12,
    overflowX: "auto",
    p: { xs: 1, sm: 2 },
    boxShadow: "md",
    bgcolor: "#fff",
    "@media print": {
      boxShadow: "none",
      border: "none",
      borderRadius: 0,
      p: 0,
      overflow: "visible",
    },
  }}
>
  <Table
    borderAxis="both"
    stickyHeader
    sx={{
       "--num-w": "16ch", 
      minWidth: 1100,
      tableLayout: "fixed",
      fontSize: { xs: 12, sm: 14 },

      "& thead": {
        backgroundColor: "background.level1",
        "& th": {
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.1 },
          whiteSpace: "nowrap",
          fontWeight: 600,
          color: "text.secondary",
          borderColor: "neutral.outlinedBorder",
        },
      },

      "& tbody tr:hover": { backgroundColor: "background.level1" },

      "& th, & td": {
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.1 },
        verticalAlign: "middle",
        lineHeight: 1.5,
        borderColor: "neutral.outlinedBorder",
        minWidth: "60px", // ✅ keeps all columns readable
        "@media print": {
          px: 1,
          py: 1,
          fontSize: 11,
          border: "1px solid #ccc",
        },
      },

      "& th.text, & td.text": {
        textAlign: "left",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
      },

        "& th.num, & td.num, & tfoot td.num": {
      width: "var(--num-w)",
      minWidth: "var(--num-w)",
      textAlign: "right",
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

      // Highlighted cells
      "& td.em": { fontWeight: 700, color: "text.primary" },
      "& th.em": { fontWeight: 800, color: "text.primary" },

      // colored header groups
      "& thead th.poGroup": {
        backgroundColor: "warning.softBg",
        color: "warning.softColor",
        fontWeight: 800,
      },
      "& thead th.billedGroup": {
        backgroundColor: "primary.softBg",
        color: "primary.softColor",
        fontWeight: 800,
      },

      "& thead th.groupSplitRight, & tbody td.groupSplitRight, & tfoot td.groupSplitRight": {
        borderRight: "2px solid",
        borderColor: "neutral.outlinedBorder",
      },

      "& tfoot tr": {
        borderTop: "2px solid",
        borderColor: "neutral.outlinedBorder",
      },
      "& tfoot td": {
        backgroundColor: "background.body",
        fontWeight: 700,
        color: "text.primary",
        minWidth: "var(--num-w)", // ✅ keeps totals aligned and readable
      },
    }}
  >
    <colgroup>
      <col style={{ width: 120 }} />
      <col style={{ width: 140 }} />
      <col style={{ width: 280 }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: "var(--num-w)" }} />
      <col style={{ width: 56 }} />
    </colgroup>

    <thead>
      <tr>
        <th rowSpan={2} className="text">PO Number</th>
        <th rowSpan={2} className="text">Vendor</th>
        <th rowSpan={2} className="text item">Item</th>

        {/* 🔶 PO VALUE GROUP */}
        <th colSpan={3} className="poGroup" style={{ textAlign: "center" }}>
          PO Value (₹)
        </th>

        <th rowSpan={2} className="num">Advance Paid (₹)</th>
        <th rowSpan={2} className="num groupSplitRight">Advance Remaining (₹)</th>

        {/* 🔷 TOTAL BILLED GROUP */}
        <th colSpan={3} className="billedGroup" style={{ textAlign: "center" }}>
          Total Billed (₹)
        </th>

        <th rowSpan={2} className="num">Unbilled PO (₹)</th>
        <th rowSpan={2} style={{ textAlign: "center" }}>
          <Checkbox
            onChange={handleSelectAllClient}
            checked={
              ClientSummary.length > 0 &&
              selectedClients.length === ClientSummary.length
            }
            disabled={ClientSummary.length === 0}
          />
        </th>
      </tr>

      <tr>
        <th className="num em poGroup">Basic (₹)</th>
        <th className="num em poGroup">GST (₹)</th>
        <th className="num em poGroup groupSplitRight">Total (₹)</th>

        <th className="num em billedGroup">Basic (₹)</th>
        <th className="num em billedGroup">GST (₹)</th>
        <th className="num em billedGroup">Total (₹)</th>
      </tr>
    </thead>

    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan={13} style={{ textAlign: "center", padding: 20 }}>
            <Typography level="body-md" sx={{ fontStyle: "italic" }}>
              Loading purchase history...
            </Typography>
          </td>
        </tr>
      ) : ClientSummary.length > 0 ? (
        ClientSummary.map((client) => (
          <tr key={client._id}>
            <td className="text">{client.po_number || "N/A"}</td>
            <td className="text">{client.vendor || "N/A"}</td>

            <td className="text item" title={client.item_name || "—"}>
              <Typography
                level="body-sm"
                sx={{
                  display: "block",
                  maxWidth: { xs: "100%", md: 280 },
                  overflow: "hidden",
                  textOverflow: { xs: "clip", md: "ellipsis" },
                  whiteSpace: { xs: "normal", md: "nowrap" },
                }}
              >
                <ItemNameCell text={client.item_name} />
              </Typography>
            </td>

            {/* PO Value */}
            <td className="num em">₹ {Number(client.po_basic || 0).toLocaleString("en-IN")}</td>
            <td className="num em">₹ {Number(client.gst || 0).toLocaleString("en-IN")}</td>
            <td className="num em groupSplitRight">₹ {Number(client.po_value || 0).toLocaleString("en-IN")}</td>

            {/* Advances */}
            <td className="num">₹ {Number(client.advance_paid || 0).toLocaleString("en-IN")}</td>
            <td className="num groupSplitRight">₹ {Number(client.remaining_amount || 0).toLocaleString("en-IN")}</td>

            {/* Total Billed */}
            <td className="num em">₹ {Number(client.bill_basic || 0).toLocaleString("en-IN")}</td>
            <td className="num em">₹ {Number(client.bill_gst || 0).toLocaleString("en-IN")}</td>
            <td className="num em">₹ {Number(client.total_billed_value || 0).toLocaleString("en-IN")}</td>

            <td className="num">₹ {Number(client.total_unbilled_sales || 0).toLocaleString("en-IN")}</td>

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
          <td colSpan={13} style={{ textAlign: "center", padding: 20 }}>
            <Typography level="body-md">No purchase history available</Typography>
          </td>
        </tr>
      )}
    </tbody>

  {ClientSummary.length > 0 && (
  <tfoot>
    <tr>
      <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>
        Total:
      </td>

      <td className="num em">{formatINRWithTooltip(ClientTotal.total_po_basic)}</td>
      <td className="num em">{formatINRWithTooltip(ClientTotal.total_gst)}</td>
      <td className="num em groupSplitRight">{formatINRWithTooltip(ClientTotal.total_po_value)}</td>

      <td className="num">{formatINRWithTooltip(ClientTotal.total_advance_paid)}</td>
      <td className="num groupSplitRight">{formatINRWithTooltip(ClientTotal.total_remaining_amount)}</td>

      <td className="num em">{formatINRWithTooltip(ClientTotal.total_bill_basic)}</td>
      <td className="num em">{formatINRWithTooltip(ClientTotal.total_bill_gst)}</td>
      <td className="num em">{formatINRWithTooltip(ClientTotal.total_billed_value)}</td>

      <td className="num">{formatINRWithTooltip(ClientTotal.total_unbilled_sales)}</td>
      <td />
    </tr>
  </tfoot>
)}


  </Table>
</Sheet>





                  </TabPanel>

                  {/* -------------------- SALES HISTORY -------------------- */}
                  <TabPanel value={1} sx={{ p: 0, pt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        mb: 2,
                        "@media print": { display: "none" },
                      }}
                    >
                      <Input
                        placeholder="Search Vendor or Item or PO"
                        value={searchSales ?? ""}
                        onChange={(e) => setSearchSales(e.target.value)}
                        sx={{ width: { xs: "100%", md: 300 } }}
                      />
                    </Box>

                    <Sheet
                      variant="outlined"
                      sx={{
                        borderRadius: "12px",
                        overflowX: "auto",
                        overflowY: "hidden",
                        p: { xs: 1, sm: 2 },
                        boxShadow: "md",
                        bgcolor: "#fff",
                        width: "100%",
                        maxWidth: "100%",
                        "@media print": {
                          boxShadow: "none",
                          border: "none",
                          borderRadius: 0,
                          overflow: "visible",
                          p: 0,
                        },
                      }}
                    >
                      <Table
                        borderAxis="both"
                        stickyHeader
                        sx={{
                          minWidth: 880,
                          width: "100%",
                          tableLayout: "fixed",
                          fontSize: { xs: 12, sm: 14 },
                          "& thead": {
                            backgroundColor: "neutral.softBg",
                            "@media print": { backgroundColor: "#eee" },
                          },
                          "& tbody tr:nth-of-type(even)": {
                            backgroundColor: "rgba(0,0,0,0.02)",
                          },
                          "& th, & td": {
                            px: { xs: 1, sm: 2 },
                            py: { xs: 1, sm: 1.25 },
                            verticalAlign: "top",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            textAlign: "left",
                            lineHeight: 1.4,
                            "@media print": {
                              px: 1,
                              py: 1,
                              fontSize: "11px",
                              border: "1px solid #ccc",
                            },
                          },
                          "& th.num, & td.num": {
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <thead>
                          <tr>
                            <th rowSpan={2}>Converted PO’s</th>
                            <th rowSpan={2}>Conversion Date</th>
                            <th rowSpan={2}>Item</th>
                            <th rowSpan={2}>Invoice Number</th>
                            <th rowSpan={2} className="num">
                              Bill Basic (₹)
                            </th>
                            <th colSpan={2} style={{ textAlign: "center" }}>
                              Sales
                            </th>
                          </tr>
                          <tr>
                            <th className="num">Value (₹)</th>
                            <th className="num">GST (₹)</th>
                          </tr>
                        </thead>

                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{ textAlign: "center", padding: 20 }}
                              >
                                <Typography
                                  level="body-md"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  Loading sales history...
                                </Typography>
                              </td>
                            </tr>
                          ) : (SalesSummary?.length || 0) === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{ textAlign: "center", padding: 20 }}
                              >
                                <Typography level="body-md">
                                  No sales history available
                                </Typography>
                              </td>
                            </tr>
                          ) : filteredSales.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{ textAlign: "center", padding: 20 }}
                              >
                                <Typography level="body-md">
                                  No matching results
                                </Typography>
                              </td>
                            </tr>
                          ) : (
                            filteredSales.map((sale, idx) => {
                              const atts = normalizeAttachments(
                                sale.attachments
                              );
                              const toNum = (v) =>
                                Number.isFinite(Number(v)) ? Number(v) : 0;

                              const billBasic = toNum(
                                sale.bill_basic ??
                                  sale.bill_basic_value ??
                                  sale.bill_basic_amount
                              );
                              const salesBasic = toNum(
                                sale.sales_basic ??
                                  sale.basic_sales ??
                                  sale.basicSales ??
                                  sale.total_sales_value
                              );
                              const salesGst = toNum(
                                sale.sales_gst ??
                                  sale.gst_on_sales ??
                                  sale.gstSales
                              );

                              return (
                                <tr
                                  key={sale._id || `${sale.po_number}-${idx}`}
                                >
                                  {/* Converted PO */}
                                  <td>
                                    <Stack spacing={0.75}>
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center"
                                        flexWrap="wrap"
                                      >
                                        <Chip
                                          size="sm"
                                          variant="soft"
                                          color="primary"
                                        >
                                          <Typography
                                            level="body-sm"
                                            sx={{ fontWeight: 700 }}
                                          >
                                            {sale.po_number || "N/A"}
                                          </Typography>
                                        </Chip>
                                        <Tooltip
                                          title="View conversion"
                                          placement="top"
                                        >
                                          <IconButton
                                            size="sm"
                                            variant="plain"
                                            onClick={() => openSaleDetail(sale)}
                                            aria-label={`View conversion for PO ${
                                              sale.po_number || sale._id
                                            }`}
                                          >
                                            <VisibilityRounded fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>

                                      {/* Attachments */}
                                      <Stack
                                        direction="row"
                                        spacing={0.75}
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mt: 0.5 }}
                                      >
                                        {atts.length > 0 ? (
                                          atts.map((att, i) => (
                                            <Link
                                              key={
                                                att.url ||
                                                `${sale._id}-att-${i}`
                                              }
                                              href={att.url}
                                              target="_blank"
                                              rel="noopener"
                                              underline="hover"
                                              sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                fontSize: 12,
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: "8px",
                                                backgroundColor:
                                                  "neutral.softBg",
                                                maxWidth: 160,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                              title={att.name}
                                            >
                                              <AttachFileIcon
                                                sx={{ fontSize: 15 }}
                                              />
                                              {att.name || `File ${i + 1}`}
                                            </Link>
                                          ))
                                        ) : (
                                          <Typography
                                            level="body-xs"
                                            sx={{
                                              opacity: 0.6,
                                              fontStyle: "italic",
                                            }}
                                          >
                                            No attachments
                                          </Typography>
                                        )}
                                      </Stack>
                                    </Stack>
                                  </td>

                                  {/* Conversion Date */}
                                  <td style={{ whiteSpace: "nowrap" }}>
                                    {formatDateTime(sale?.converted_at)}
                                  </td>

                                  {/* Item */}
                                  <td
                                    title={getItemLabel(sale) || "N/A"}
                                    style={{
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      maxWidth: "100%",
                                    }}
                                  >
                                    {getItemLabel(sale) || "N/A"}
                                  </td>

                                  {/* Invoice Number */}
                                  <td>{sale.sales_invoice || "—"}</td>

                                  {/* Bill Basic */}
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(billBasic).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>

                                  {/* Sales Value */}
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(salesBasic).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>

                                  {/* Sales GST */}
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(salesGst).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>

                        {/* Totals */}
                        {filteredSales.length > 0 && (
                          <tfoot>
                            {(() => {
                              const toNum = (v) =>
                                Number.isFinite(Number(v)) ? Number(v) : 0;
                              const sum = (keyPick) =>
                                filteredSales.reduce(
                                  (acc, sale) => acc + keyPick(sale),
                                  0
                                );

                              const totalBillBasic = sum((s) =>
                                toNum(
                                  s.bill_basic ??
                                    s.bill_basic_value ??
                                    s.bill_basic_amount
                                )
                              );
                              const totalSalesBasic = sum((s) =>
                                toNum(
                                  s.sales_basic ??
                                    s.basic_sales ??
                                    s.basicSales ??
                                    s.total_sales_value
                                )
                              );
                              const totalSalesGst = sum((s) =>
                                toNum(
                                  s.sales_gst ?? s.gst_on_sales ?? s.gstSales
                                )
                              );

                              return (
                                <tr
                                  style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#FFF9C4",
                                  }}
                                >
                                  <td
                                    colSpan={4}
                                    style={{ textAlign: "right" }}
                                  >
                                    Total:
                                  </td>
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(totalBillBasic).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(totalSalesBasic).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                  <td className="num">
                                    ₹{" "}
                                    {Math.round(totalSalesGst).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tfoot>
                        )}
                      </Table>
                    </Sheet>

                    <Modal open={saleDetailOpen} onClose={closeSaleDetail}>
                      <ModalDialog sx={{ width: 520 }}>
                        <DialogTitle>Sales Conversion</DialogTitle>
                        <DialogContent>
                          <Stack spacing={1.25}>
                            {/* --- Header Info --- */}
                            <Typography level="title-sm">
                              PO:{" "}
                              <strong>{activeSale?.po_number ?? "—"}</strong>
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography level="body-sm">
                                <strong>Converted At:</strong>
                              </Typography>
                              <Chip size="sm" variant="soft">
                                {formatDateTime(activeSale?.converted_at)}
                              </Chip>
                            </Stack>

                            <Typography level="body-sm">
                              <strong>Converted By:</strong>{" "}
                              {activeSale?.user_name ?? "—"}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography level="body-sm">
                                <strong>Sales Invoice No.:</strong>
                              </Typography>
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  activeSale?.sales_invoice
                                    ? "primary"
                                    : "neutral"
                                }
                              >
                                {activeSale?.sales_invoice?.trim()
                                  ? activeSale.sales_invoice
                                  : "—"}
                              </Chip>
                            </Stack>

                            <Typography
                              level="body-sm"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              <strong>Remarks:</strong>{" "}
                              {activeSale?.remarks?.trim()
                                ? activeSale.remarks
                                : "—"}
                            </Typography>

                            {/* --- Sales Amounts --- */}
                            {(() => {
                              const basic = Number(activeSale?.basic_sales);
                              const gst = Number(activeSale?.gst_on_sales);
                              const hasBasic = Number.isFinite(basic);
                              const hasGst = Number.isFinite(gst);
                              const total =
                                (hasBasic ? basic : 0) + (hasGst ? gst : 0);

                              const fmt = (n) =>
                                Number.isFinite(n)
                                  ? n.toLocaleString("en-IN")
                                  : "—";

                              return (
                                <Sheet
                                  variant="soft"
                                  sx={{
                                    p: 1,
                                    borderRadius: "md",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: 1,
                                    backgroundColor: "neutral.softBg",
                                  }}
                                >
                                  <Box>
                                    <Typography level="body-xs" color="neutral">
                                      Basic Sales
                                    </Typography>
                                    <Typography level="title-sm">
                                      {fmt(basic)}
                                    </Typography>
                                  </Box>

                                  <Box>
                                    <Typography level="body-xs" color="neutral">
                                      GST on Sales
                                    </Typography>
                                    <Typography level="title-sm">
                                      {fmt(gst)}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography level="body-xs" color="neutral">
                                      Entry Total
                                    </Typography>
                                    <Typography
                                      level="title-sm"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {fmt(total)}
                                    </Typography>
                                  </Box>
                                </Sheet>
                              );
                            })()}

                            {/* --- Attachments --- */}
                            <Box>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                                <strong>Attachments</strong>
                              </Typography>
                              <Sheet
                                variant="soft"
                                sx={{
                                  p: 1,
                                  borderRadius: "md",
                                  maxHeight: 220,
                                  overflow: "auto",
                                }}
                              >
                                <Stack spacing={0.75}>
                                  {normalizeAttachments(activeSale?.attachments)
                                    .length ? (
                                    normalizeAttachments(
                                      activeSale?.attachments
                                    ).map((a, i) => (
                                      <Box
                                        key={a.url || `file-${i}`}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 1,
                                          px: 1,
                                          py: 0.75,
                                          borderRadius: "sm",
                                          "&:hover": {
                                            backgroundColor:
                                              "neutral.plainHoverBg",
                                          },
                                        }}
                                      >
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                        >
                                          <InsertDriveFileRounded fontSize="small" />
                                          <Link
                                            href={a.url}
                                            target="_blank"
                                            rel="noopener"
                                            underline="hover"
                                          >
                                            {a.name}
                                          </Link>
                                        </Stack>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography
                                      level="body-xs"
                                      sx={{ opacity: 0.7 }}
                                    >
                                      No attachments
                                    </Typography>
                                  )}
                                </Stack>
                              </Sheet>
                            </Box>

                            {/* --- Footer --- */}
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                              sx={{ mt: 1 }}
                            >
                              <Button variant="plain" onClick={closeSaleDetail}>
                                Close
                              </Button>
                            </Stack>
                          </Stack>
                        </DialogContent>
                      </ModalDialog>
                    </Modal>
                  </TabPanel>
                </Tabs>
              </Box>

              {/* Adjust History Section */}
              <Box>
                <Chip
                  color="neutral"
                  variant="soft"
                  size="md"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    mt: 3,
                  }}
                >
                  Adjustment History
                </Chip>
                <Divider
                  sx={{ borderWidth: "2px", marginBottom: "20px", mt: 2 }}
                />
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
                    user?.name === "Varun Mishra" ||
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
                    overflowX: "auto",
                    overflowY: "hidden",
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
                    stickyHeader
                    sx={{
                      minWidth: "100%",
                      tableLayout: "fixed",
                      "& thead": {
                        backgroundColor: "neutral.softBg",
                        "@media print": { backgroundColor: "#eee" },
                      },
                      "& th, & td": {
                        textAlign: "left",
                        px: 2,
                        py: 1.5,
                        verticalAlign: "middle",
                        "@media print": {
                          px: 1,
                          py: 1,
                          fontSize: "12px",
                          border: "1px solid #ccc",
                        },
                      },
                      // column behaviors
                      "& th.dateCell, & td.dateCell": { minWidth: 120 },
                      "& th.typeCell, & td.typeCell": {
                        minWidth: 120,
                        whiteSpace: "normal",
                      },

                      // Reason + Description: ellipsis on md+, wrap on small screens, show full on print
                      "& th.reasonCell, & td.reasonCell, & th.descCell, & td.descCell":
                        {
                          maxWidth: { xs: 180, sm: 240, md: 320 },
                          whiteSpace: { xs: "normal", md: "nowrap" },
                          overflow: { md: "hidden" },
                          textOverflow: { md: "ellipsis" },
                          overflowWrap: "anywhere",
                        },

                      // PO + Paid For: allow wrapping
                      "& th.poCell, & td.poCell, & th.paidForCell, & td.paidForCell":
                        {
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                          minWidth: 120,
                        },

                      // Money cells right-aligned
                      "& th.money, & td.money": { textAlign: "right" },

                      "@media print": {
                        borderCollapse: "collapse",
                        width: "100%",
                        tableLayout: "fixed",
                        "& td, & th": {
                          whiteSpace: "normal",
                          overflow: "visible",
                          textOverflow: "clip",
                        },
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th className="dateCell">Adjust Date</th>
                        <th className="typeCell">Adjustment Type</th>
                        <th className="reasonCell">Reason</th>
                        <th className="poCell">PO Number</th>
                        <th className="paidForCell">Paid For</th>
                        <th className="descCell">Description</th>
                        <th className="money">Credit Adjustment</th>
                        <th className="money">Debit Adjustment</th>
                        <th style={{ textAlign: "center" }}>
                          <Checkbox
                            onChange={handleSelectAllAdjust}
                            checked={
                              selectedAdjust.length === AdjustmentSummary.length
                            }
                          />
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{ textAlign: "center", padding: 20 }}
                          >
                            <Typography
                              level="body-md"
                              sx={{ fontStyle: "italic" }}
                            >
                              Loading adjustment history...
                            </Typography>
                          </td>
                        </tr>
                      ) : AdjustmentSummary.length > 0 ? (
                        AdjustmentSummary.map((row) => (
                          <tr key={row._id || row.id}>
                            <td className="dateCell">
                              {new Date(row.adj_date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td className="typeCell">{row.pay_type}</td>

                            {/* Reason — ellipsis on md+, full on small/print; native title on hover */}
                            <td
                              className="reasonCell"
                              title={row.description || "-"}
                            >
                              {row.description || "-"}
                            </td>

                            <td className="poCell">{row.po_number || "-"}</td>
                            <td className="paidForCell">
                              {row.paid_for || "-"}
                            </td>

                            {/* Description — same behavior as Reason */}
                            <td className="descCell" title={row.comment || "-"}>
                              {row.comment || "-"}
                            </td>

                            <td className="money">
                              {row.adj_type === "Add"
                                ? `₹ ${parseFloat(
                                    row.adj_amount || 0
                                  ).toLocaleString("en-IN")}`
                                : "-"}
                            </td>
                            <td className="money">
                              {row.adj_type === "Subtract"
                                ? `₹ ${parseFloat(
                                    row.adj_amount || 0
                                  ).toLocaleString("en-IN")}`
                                : "-"}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <Checkbox
                                color="primary"
                                checked={selectedAdjust.includes(row._id)}
                                onChange={() =>
                                  handleAdjustCheckboxChange(row._id)
                                }
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={9}
                            style={{ textAlign: "center", padding: 20 }}
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
                        <tr
                          style={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <td colSpan={6} style={{ textAlign: "right" }}>
                            Total:
                          </td>
                          <td className="money">
                            ₹ {adjustment?.totalCredit?.toLocaleString("en-IN")}
                          </td>
                          <td className="money">
                            ₹ {adjustment?.totalDebit?.toLocaleString("en-IN")}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </Sheet>
              </Box>

              {/* Balance Summary and Amount Available Section */}
              <Card variant="outlined" sx={{ borderRadius: "lg", p: 2 }}>
                <Balance_Summary />
              </Card>

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
                  variant="soft"
                  color="primary"
                  startDecorator={<ArrowBackIcon />}
                  onClick={() => navigate("/project-balance")}
                >
                  Back
                </Button>

                <Button
                  variant="solid"
                  color="danger"
                  onClick={handlePrint}
                  startDecorator={<PrintIcon />}
                  loading={isPrinting}
                >
                  Print
                </Button>

                <Button
                  variant="solid"
                  color="success"
                  onClick={handleExportAll}
                  startDecorator={<FileDownloadIcon />}
                  loading={isExporting}
                >
                  CSV
                </Button>
              </Box>
            </Stack>
          </Card>


        </Box>
        {/* Confirm first */}
        <Modal
          open={confirmCloseOpen}
          onClose={() => setConfirmCloseOpen(false)}
        >
          <ModalDialog sx={{ width: 420 }}>
            <DialogTitle>
              Close selected PO{selectedClients.length > 1 ? "s" : ""}?
            </DialogTitle>
            <DialogContent>
              Are you sure you want to close {selectedClients.length} PO
              {selectedClients.length > 1 ? "s" : ""}? This will convert them to
              Sales.
            </DialogContent>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="plain"
                onClick={() => setConfirmCloseOpen(false)}
              >
                No
              </Button>
              <Button
                variant="solid"
                color="danger"
                onClick={() => {
                  setConfirmCloseOpen(false);

                  if (!selectedClients.length) {
                    toast.error("Select at least 1 PO for Sales Conversion.");
                    return;
                  }

                  const selectedPOsData = ClientSummary.filter((po) =>
                    selectedClients.includes(po._id)
                  );

                  if (!selectedPOsData.length) {
                    toast.error("Selected PO(s) not found in current list.");
                    return;
                  }

                  setSelectedPO(selectedPOsData);
                  setSalesAmounts(
                    selectedPOsData.reduce((acc, po) => {
                      acc[po._id] = { basic: "", gst: "" };
                      return acc;
                    }, {})
                  );

                  setSalesOpen(true);
                }}
              >
                Yes, continue
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        {/* ================= Sales Conversion Modal ================= */}
    <Modal open={salesOpen} onClose={() => setSalesOpen(false)}>
  <ModalDialog
    aria-labelledby="sales-convert-title"
    sx={{
      width: 720,
      borderRadius: "lg",
      boxShadow: "xl",
      p: 3,
      background: "linear-gradient(180deg, #fff 0%, #f9f9f9 100%)",
    }}
  >
    <DialogTitle id="sales-convert-title" sx={{ fontWeight: 700, mb: 1 }}>
      Sales Conversion
    </DialogTitle>

    <DialogContent>
      <Stack spacing={2.5}>
        {/* ---- PO Table ---- */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "md",
            overflow: "auto",
            maxHeight: 280,
            borderColor: "neutral.outlinedBorder",
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              gap: 1,
              px: 1.5,
              py: 1,
              backgroundColor: "neutral.softBg",
              position: "sticky",
              top: 0,
              borderBottom: "1px solid",
              borderColor: "neutral.outlinedBorder",
              fontWeight: 600,
              zIndex: 2,
            }}
          >
            {[
              { label: "PO No.", align: "left" },
              { label: "PO Value", align: "right" },
              { label: "Bill Basic", align: "right" },
              { label: "Advance Paid", align: "right" },
              { label: "Basic Sales", align: "right" },
              { label: "GST on Sales", align: "right" },
            ].map((col) => (
              <Typography
                key={col.label}
                level="body-sm"
                textAlign={col.align}
                sx={{ fontWeight: 700 }}
              >
                {col.label}
              </Typography>
            ))}
          </Box>

          {/* Data Rows */}
          {(selectedPO || [])
            .filter((po) => Number(po.bill_basic) > 0)
            .map((po, idx) => {
              const id = po._id;
              const poValue = Number(po.po_value || 0);
              const billBasic = Number(po.bill_basic || 0);
              const totalAdvance = Number(po.advance_paid || 0);
              const basic = Number(salesAmounts[id]?.basic || 0);
              const gst = Number(salesAmounts[id]?.gst || 0);

              const basicExceeds = basic > billBasic;
              const showInfo = billBasic > totalAdvance;
              const infoText = `Bill Basic (${billBasic.toLocaleString()}) exceeds advance paid (${totalAdvance.toLocaleString()})`;

              return (
                <Box
                  key={id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 1,
                    px: 1.5,
                    py: 0.9,
                    alignItems: "center",
                    borderBottom: "1px dashed",
                    borderColor: "neutral.outlinedBorder",
                    backgroundColor:
                      idx % 2 === 0 ? "background.body" : "neutral.softBg",
                    "&:hover": {
                      backgroundColor: "neutral.plainHoverBg",
                    },
                  }}
                >
                  {/* PO No + Info Icon */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      justifyContent: "flex-start",
                    }}
                  >
                    {showInfo && (
                      <Tooltip title={infoText} placement="top-start">
                        <InfoOutlined
                          sx={{
                            color: "danger.solidBg",
                            fontSize: 18,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                      </Tooltip>
                    )}
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {po.po_number}
                    </Typography>
                  </Box>

                  {/* PO Value */}
                  <Typography level="body-sm" textAlign="right">
                    {poValue.toLocaleString()}
                  </Typography>

                  {/* Bill Basic */}
                  <Typography level="body-sm" textAlign="right">
                    {billBasic.toLocaleString()}
                  </Typography>

                  {/* Advance Paid */}
                  <Typography
                    level="body-sm"
                    textAlign="right"
                    color={showInfo ? "danger.plainColor" : "neutral"}
                  >
                    {totalAdvance.toLocaleString()}
                  </Typography>

                  {/* Basic Sales */}
                  <Input
                    size="sm"
                    type="number"
                    value={salesAmounts[id]?.basic ?? ""}
                    placeholder="Basic"
                    onChange={(e) =>
                      setSalesAmounts((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], basic: e.target.value },
                      }))
                    }
                    sx={{
                      width: 100,
                      ml: "auto",
                      borderColor: basicExceeds ? "danger.solidBg" : undefined,
                    }}
                  />

                  {/* GST on Sales (always editable) */}
                  <Input
                    size="sm"
                    type="number"
                    value={salesAmounts[id]?.gst ?? ""}
                    placeholder="GST"
                    onChange={(e) =>
                      setSalesAmounts((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], gst: e.target.value },
                      }))
                    }
                    sx={{
                      width: 100,
                      ml: "auto",
                    }}
                  />
                </Box>
              );
            })}
        </Sheet>

        {/* ---- File Upload ---- */}
        <Sheet
          variant="soft"
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          sx={{
            border: "2px dashed",
            borderColor: isDragging
              ? "primary.solidBg"
              : "neutral.outlinedBorder",
            borderRadius: "lg",
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            transition: "all .2s ease-in-out",
            "&:hover": {
              borderColor: "primary.solidBg",
              backgroundColor: "neutral.softBg",
            },
          }}
        >
          <Typography level="title-sm">
            <strong>Drop files here</strong> or <u>browse</u>
          </Typography>
          <Typography level="body-xs" color="neutral">
            Supports multiple files (.PNG, .JPG, .PDF)
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={onFileInputChange}
            style={{ display: "none" }}
          />
          <Typography level="body-sm" sx={{ mt: 1 }}>
            {salesFiles.length
              ? `${salesFiles.length} file(s) selected`
              : "No files selected"}
          </Typography>
        </Sheet>

        {/* ---- Invoice ---- */}
        <FormControl>
          <FormLabel sx={{ fontWeight: 600 }}>Sales Invoice No.</FormLabel>
          <Input
            size="md"
            variant="outlined"
            placeholder="Enter Sales Invoice Number"
            value={salesInvoice}
            onChange={(e) => setSalesInvoice(e.target.value)}
            sx={{
              borderRadius: "md",
              backgroundColor: "background.body",
            }}
          />
        </FormControl>

        {/* ---- Remarks ---- */}
        <Textarea
          minRows={3}
          placeholder="Enter remarks..."
          variant="soft"
          value={salesRemarks}
          onChange={(e) => setSalesRemarks(e.target.value)}
          sx={{
            fontSize: "sm",
            borderRadius: "md",
            backgroundColor: "background.body",
          }}
        />

        {/* ---- Actions ---- */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="plain"
            color="neutral"
            onClick={() => setSalesOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color="primary"
            loading={isConverting}
            disabled={
              !salesRemarks.trim() ||
              selectedPO.some((po) => {
                const id = po._id;
                const billBasic = Number(po.bill_basic || 0);
                const basic = Number(salesAmounts[id]?.basic || 0);
                return basic < 0 || basic > billBasic;
              })
            }
            onClick={handleSalesConvert}
          >
            Convert
          </Button>
        </Stack>
      </Stack>
    </DialogContent>
  </ModalDialog>
</Modal>


      </Box>
    </Box>
  );
};

export default Customer_Payment_Summary;
