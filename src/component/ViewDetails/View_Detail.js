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
    if (typeof row?.item === "string") return row.item;
    if (Array.isArray(row?.item)) {
      return row.item
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

  const saleTotalsFiltered = useMemo(
    () =>
      (filteredSales || []).reduce(
        (acc, s) => {
          const po = Number(s?.po_value ?? s?.total_po ?? 0);
          const adv = Number(s?.advance_paid ?? 0);
          acc.total_sale += po;
          acc.total_advance_paid += adv;
          return acc;
        },
        { total_sale: 0, total_advance_paid: 0 }
      ),
    [filteredSales]
  );

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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Axios.post("/project-balances/sync-all", {});
      await refetch();
    } catch (e) {
      console.error(e);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
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
    total_sales,
    total_billed_value,
    net_advanced_paid,
    billing_type,
    tcs_as_applicable,
    balance_required,
    extraGST,
  } = balanceSummary || {};

  const formatIndianNumber = (val) => {
    const n = Number(val);
    if (!isFinite(n)) return "—";
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      Math.round(Math.abs(n))
    );
  };

  const RupeeValue = ({ value }) => {
    const n = Number(value);
    const isNeg = n < 0;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
        }}
      >
        {isNeg && <span>-</span>}
        <CurrencyRupee style={{ fontSize: 16, marginBottom: 1 }} />
        <span>{formatIndianNumber(n)}</span>
      </span>
    );
  };

  const Balance_Summary = () => {
    const safeRound = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.round(n) : NaN;
    };

    const rows = [
      ["1", "Total Received", total_received],
      ["2", "Total Return", total_return],
      ["3", "Net Balance [(1)-(2)]", netBalance, "muted"],
      ["4", "Total Advance Paid to Vendors", total_advance_paid],
      ["4A", "Total Adjustment (Debit-Credit)", total_adjustment],
      [
        "5",
        "Balance With Slnko [(3)-(4)-(4A)]",
        safeRound(balance_with_slnko),
        "highlight",
        true,
      ],
      ["6", "Total PO Basic Value", safeRound(total_po_basic)],
      ["7", "GST Value as per PO", safeRound(gst_as_po_basic)],
      ["8", "Total PO with GST", safeRound(total_po_with_gst)],
      ["8A", "Total Sales with GST", safeRound(total_sales)],
      [
        "9",
        billing_type === "Composite"
          ? "GST (13.8%)"
          : billing_type === "Individual"
          ? "GST (18%)"
          : "GST (Type - N/A)",
        gst_with_type_percentage,
      ],
      ["10", "Total Billed Value", total_billed_value],
      ["11", "Net Advance Paid [(4)-(10)]", net_advanced_paid],
      [
        "12",
        "Balance Payable to Vendors [(8)-(10)-(11)]",
        safeRound(balance_payable_to_vendors),
        "highlight",
        true,
      ],
      ["13", "TCS as Applicable", safeRound(tcs_as_applicable)],
      [
        "14",
        "Extra GST Recoverable from Client [(8)-(6)]",
        safeRound(extraGST),
      ],
      [
        "15",
        "Balance Required [(5)-(12)-(13)]",
        safeRound(balance_required),
        "highlight",
        true,
        Number(balance_required) >= 0 ? "pos" : "neg",
      ],
    ];

    return (
      <Grid container spacing={2}>
        {/* Balance table */}
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
              stickyHeader={false}
              sx={{
                minWidth: 560,
                tableLayout: "fixed",
                "& thead": {
                  backgroundColor: "neutral.softBg",
                  "@media print": { backgroundColor: "#f0f0f0" },
                },
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
                {rows.map(([sno, desc, value, tone, bold, state]) => (
                  <tr
                    key={sno}
                    style={{
                      background:
                        tone === "highlight"
                          ? "#B6F4C633"
                          : tone === "muted"
                          ? "#C8C8C633"
                          : "transparent",
                      fontWeight: bold ? 700 : 400,
                      color:
                        state === "pos"
                          ? "var(--joy-palette-success-700)"
                          : state === "neg"
                          ? "var(--joy-palette-danger-700)"
                          : "inherit",
                    }}
                  >
                    <td>{sno}</td>
                    <td>{desc}</td>
                    <td className="num">
                      {isLoading ? "• • •" : <RupeeValue value={value} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Grid>

        {/* KPIs */}
        <Grid item xs={12} sm={4} md={4}>
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ mt: { xs: 1, sm: 0 } }}
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
                {isLoading ? (
                  "• • •"
                ) : (
                  <>
                    <CurrencyRupee sx={{ fontSize: 16, mb: "2px" }} />
                    {formatIndianNumber(gst_difference)}
                  </>
                )}
              </span>
            </Chip>

            {billing_type && (
              <Chip
                size="md"
                variant="soft"
                color="neutral"
                sx={{ fontWeight: 600 }}
              >
                Billing:{" "}
                {billing_type === "Composite"
                  ? "Composite (13.8%)"
                  : billing_type === "Individual"
                  ? "Individual (18%)"
                  : "N/A"}
              </Chip>
            )}
          </Stack>
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

  const formatBytes = (b) => {
    if (!b && b !== 0) return "—";
    const u = ["B", "KB", "MB", "GB"];
    let i = 0,
      n = b;
    while (n >= 1024 && i < u.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
  };

  const handleSalesConvert = async () => {
    try {
      if (!selectedClients.length) return;

      await Promise.all(
        selectedClients.map((id) =>
          updateSalesPO({
            id,
            remarks: salesRemarks.trim(),
            files: salesFiles,
          }).unwrap()
        )
      );

      toast.success(`Converted ${selectedClients.length} PO(s)`);
      setSalesOpen(false);
      setSalesRemarks("");
      setSalesFiles([]);
      setSelectedClients([]);
      refetch();
    } catch (err) {
      const msg =
        err?.data?.message || err?.error || "Failed to convert selected PO(s).";
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

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: { xs: 1, md: 2 },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", lg: 1400, xl: 1600 },
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Header Section */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "300px 1fr",
            },
            gap: { xs: 1.5, md: 2 },
            alignItems: "start",
          }}
        >
          {/* Project Details Section */}

          <Card
            variant="outlined"
            sx={{
              position: "sticky",
              top: { xs: 8, md: headerOffset + 16 },
              alignSelf: "start",
              borderRadius: "lg",
              width: "100%",
              flexShrink: 0,
              maxHeight: {
                xs: "calc(100dvh - 16px)",
                md: `calc(100dvh - ${headerOffset + 32}px)`,
              },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "sm",
              borderColor: "neutral.outlinedBorder",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                mb: 1,
                p: 1.25,
                borderBottom: "1px solid",
                borderColor: "neutral.outlinedBorder",
                background:
                  "linear-gradient(135deg, var(--joy-palette-primary-softBg), #eef4ff)",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Avatar
                variant="soft"
                size="lg"
                src={projectDetails?.avatar_url || ""}
                alt={
                  projectDetails?.customer_name ||
                  projectDetails?.name ||
                  "Project"
                }
                sx={{ "--Avatar-size": "56px", fontWeight: 700 }}
              >
                {initials(
                  projectDetails?.customer_name || projectDetails?.name || ""
                )}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  level="title-md"
                  sx={{ fontWeight: 700, lineHeight: 1 }}
                >
                  {isLoading ? "—" : projectDetails?.customer_name || "—"}
                </Typography>
                <Typography
                  level="body-sm"
                  sx={{
                    opacity: 0.85,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={projectDetails?.name}
                >
                  {projectDetails?.name || "—"}
                </Typography>
              </Box>
            </Box>

            {/* Label chip */}
            <Chip
              color="primary"
              variant="soft"
              sx={{ mb: 1, fontWeight: 700 }}
            >
              Project Details
            </Chip>

            {/* Fields */}
            <Grid container spacing={1.5}>
              <Grid xs={12}>
                <EllipsisTooltipInput
                  value={projectDetails.code}
                  startDecorator={<FolderIcon />}
                />
              </Grid>

              <Grid xs={12}>
                <EllipsisTooltipInput
                  value={projectDetails.name}
                  startDecorator={<BusinessIcon />}
                />
              </Grid>

              <Grid xs={12}>
                <Input
                  value={isLoading ? "" : projectDetails.customer_name || "-"}
                  readOnly
                  startDecorator={<AccountCircleIcon />}
                  placeholder={isLoading ? "Loading..." : ""}
                />
              </Grid>

              <Grid xs={12}>
                <Input
                  value={isLoading ? "" : projectDetails.p_group || "-"}
                  readOnly
                  startDecorator={<GroupsIcon />}
                  placeholder={isLoading ? "Loading..." : ""}
                />
              </Grid>

              <Grid xs={12}>
                <EllipsisTooltipInput
                  value={projectDetails.site_address}
                  startDecorator={<LocationOnIcon />}
                />
              </Grid>

              <Grid xs={12}>
                <Input
                  value={isLoading ? "" : projectDetails.project_kwp || "-"}
                  readOnly
                  startDecorator={<BoltIcon />}
                  placeholder={isLoading ? "Loading..." : ""}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Credit History Section */}
          <Card
            sx={{
              borderRadius: "lg",
              p: { xs: 1, md: 1.5 },
              minWidth: 0,
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

            <Stack gap={2}>
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
                          "Gagan Tayal" 
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
                          // PO & Vendor: no tooltip/ellipsis — just wrap
                          "& th.poCell, & td.poCell, & th.vendorCell, & td.vendorCell":
                            {
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                              maxWidth: "unset",
                            },
                          // Item: allow truncation (ellipsis) on wider screens only
                          "& th.itemCell, & td.itemCell": {
                            maxWidth: { xs: 160, sm: 220, md: 320 },
                            whiteSpace: { xs: "normal", md: "nowrap" },
                            overflow: { md: "hidden" },
                            textOverflow: { md: "ellipsis" },
                            overflowWrap: "anywhere",
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
                            <th className="poCell">PO Number</th>
                            <th className="vendorCell">Vendor</th>
                            <th className="itemCell">Item Name</th>
                            <th>PO Value (₹)</th>
                            <th>Advance Paid (₹)</th>
                            <th>Remaining Amount (₹)</th>
                            <th>Total Billed Value (₹)</th>
                            <th style={{ textAlign: "center" }}>
                              <Checkbox
                                onChange={handleSelectAllClient}
                                checked={
                                  ClientSummary.length > 0 &&
                                  selectedClients.length ===
                                    ClientSummary.length
                                }
                                disabled={ClientSummary.length === 0}
                              />
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td
                                colSpan={8}
                                style={{ textAlign: "center", padding: 20 }}
                              >
                                <Typography
                                  level="body-md"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  Loading purchase history...
                                </Typography>
                              </td>
                            </tr>
                          ) : ClientSummary.length > 0 ? (
                            ClientSummary.map((client) => (
                              <tr key={client._id}>
                                {/* PO: wrap freely, no title */}
                                <td className="poCell">
                                  {client.po_number || "N/A"}
                                </td>

                                {/* Vendor: wrap freely, no title */}
                                <td className="vendorCell">
                                  {client.vendor || "N/A"}
                                </td>

                                {/* Item: compact ellipsis + native title inside ItemNameCell */}
                                <td className="itemCell">
                                  <ItemNameCell text={client.item_name} />
                                </td>

                                <td>
                                  ₹{" "}
                                  {(client?.po_value || 0).toLocaleString(
                                    "en-IN"
                                  )}
                                </td>
                                <td>
                                  ₹{" "}
                                  {(client?.advance_paid || 0).toLocaleString(
                                    "en-IN"
                                  )}
                                </td>
                                <td>
                                  ₹{" "}
                                  {(
                                    client?.remaining_amount || 0
                                  ).toLocaleString("en-IN")}
                                </td>
                                <td>
                                  ₹{" "}
                                  {(
                                    client?.total_billed_value || 0
                                  ).toLocaleString("en-IN")}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <Checkbox
                                    checked={selectedClients.includes(
                                      client._id
                                    )}
                                    onChange={() =>
                                      handleClientCheckboxChange(client._id)
                                    }
                                    aria-label={`Select client ${
                                      client.po_number || client._id
                                    }`}
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={8}
                                style={{ textAlign: "center", padding: 20 }}
                              >
                                <Typography level="body-md">
                                  No purchase history available
                                </Typography>
                              </td>
                            </tr>
                          )}
                        </tbody>

                        {ClientSummary.length > 0 && (
                          <tfoot>
                            <tr
                              style={{
                                fontWeight: "bold",
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <td colSpan={3} style={{ textAlign: "right" }}>
                                Total:
                              </td>
                              <td>
                                ₹{" "}
                                {ClientTotal?.total_po_value?.toLocaleString(
                                  "en-IN"
                                )}
                              </td>
                              <td>
                                ₹{" "}
                                {ClientTotal?.total_advance_paid?.toLocaleString(
                                  "en-IN"
                                )}
                              </td>
                              <td>
                                ₹{" "}
                                {ClientTotal?.total_remaining_amount?.toLocaleString(
                                  "en-IN"
                                )}
                              </td>
                              <td>
                                ₹{" "}
                                {ClientTotal?.total_billed_value?.toLocaleString(
                                  "en-IN"
                                )}
                              </td>
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
                          tableLayout: "fixed",
                          minWidth: { xs: 780, md: "100%" },
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
                          // Only keep ellipsis behavior for Item
                          "& th.itemCell, & td.itemCell": {
                            maxWidth: { xs: 180, sm: 220, md: 280 },
                            whiteSpace: { xs: "normal", md: "nowrap" },
                            overflow: { md: "hidden" },
                            textOverflow: { md: "ellipsis" },
                            overflowWrap: "anywhere",
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
                            <th>Converted PO's</th>
                            <th>Conversion Date</th>
                            <th>Vendor</th>
                            <th className="itemCell">Item</th>
                            <th>Sales Value (₹)</th>
                          </tr>
                        </thead>

                        <tbody>
                          {isLoading ? (
                            <tr>
                              <td
                                colSpan={5}
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
                                colSpan={5}
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
                                colSpan={5}
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
                              return (
                                <tr
                                  key={sale._id || `${sale.po_number}-${idx}`}
                                >
                                  {/* PO number: no tooltip/ellipsis, free to wrap */}
                                  <td>
                                    <Stack spacing={0.75}>
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center"
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
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
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
                                                maxWidth: 180,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                              title={att.name}
                                            >
                                              <AttachFileIcon
                                                sx={{ fontSize: 16 }}
                                              />
                                              {att.name || `File ${i + 1}`}
                                            </Link>
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
                                    </Stack>
                                  </td>

                                  <td style={{ fontSize: "0.9rem" }}>
                                    {formatDateTime(sale?.converted_at)}
                                  </td>

                                  {/* Vendor: no tooltip/ellipsis, free to wrap */}
                                  <td
                                    style={{
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {sale.vendor || "N/A"}
                                  </td>

                                  {/* Item: ellipsis + native title only here */}
                                  <td
                                    className="itemCell"
                                    title={getItemLabel(sale) || "N/A"}
                                  >
                                    <span
                                      style={{
                                        display: "inline-block",
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        verticalAlign: "bottom",
                                      }}
                                    >
                                      {getItemLabel(sale) || "N/A"}
                                    </span>
                                  </td>

                                  <td>
                                    ₹{" "}
                                    {Math.round(
                                      sale?.po_value || 0
                                    ).toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>

                        {filteredSales.length > 0 && (
                          <tfoot>
                            <tr
                              style={{
                                fontWeight: "bold",
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <td colSpan={4} style={{ textAlign: "right" }}>
                                Total:
                              </td>
                              <td>
                                ₹{" "}
                                {Math.round(
                                  saleTotalsFiltered?.total_sale
                                )?.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </Table>
                    </Sheet>

                    <Modal open={saleDetailOpen} onClose={closeSaleDetail}>
                      <ModalDialog sx={{ width: 520 }}>
                        <DialogTitle>Sales Conversion</DialogTitle>
                        <DialogContent>
                          <Stack spacing={1.25}>
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

                            <Typography
                              level="body-sm"
                              sx={{ whiteSpace: "pre-wrap" }}
                            >
                              <strong>Remarks:</strong>{" "}
                              {activeSale?.remarks?.trim()
                                ? activeSale.remarks
                                : "—"}
                            </Typography>

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
                  setSalesOpen(true);
                }}
              >
                Yes, continue
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        {/* Sales Conversion modal */}
        <Modal open={salesOpen} onClose={() => setSalesOpen(false)}>
          <ModalDialog
            aria-labelledby="sales-convert-title"
            sx={{ width: 520, borderRadius: "md", boxShadow: "lg", p: 3 }}
          >
            <DialogTitle id="sales-convert-title">Sales Conversion</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {/* Dotted dropzone */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  sx={{
                    border: "2px dashed",
                    borderColor: isDragging
                      ? "primary.solidBg"
                      : "neutral.outlinedBorder",
                    backgroundColor: isDragging
                      ? "neutral.softBg"
                      : "transparent",
                    borderRadius: "md",
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all .15s ease",
                    "&:hover": {
                      borderColor: "primary.solidBg",
                      backgroundColor: "neutral.softBg",
                    },
                  }}
                >
                  <Typography level="title-sm" sx={{ mb: 0.5 }}>
                    Drop files here or <u>browse</u>
                  </Typography>
                  <Typography level="body-xs" color="neutral">
                    You can select multiple files. (PNG/JPG/PDF)
                  </Typography>

                  {/* Hidden native input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => onFileInputChange(e)}
                    style={{ display: "none" }}
                  />

                  <Typography level="body-sm" sx={{ mt: 1.25 }}>
                    {salesFiles.length
                      ? `${salesFiles.length} file(s) selected`
                      : "No files selected"}
                  </Typography>
                </Box>

                {/* Preview + editable attachment_name */}
                {salesFiles.length > 0 && (
                  <Sheet
                    variant="soft"
                    sx={{
                      p: 1,
                      borderRadius: "md",
                      maxHeight: 240,
                      overflow: "auto",
                    }}
                  >
                    <Stack spacing={0.75}>
                      {salesFiles.map((f, idx) => {
                        const key = `${f.file.name}-${f.file.size}-${f.file.lastModified}`;
                        return (
                          <Box
                            key={key}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              px: 1,
                              py: 0.75,
                              borderRadius: "sm",
                              "&:hover": {
                                backgroundColor: "neutral.plainHoverBg",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexGrow: 1,
                              }}
                            >
                              <InsertDriveFileRounded fontSize="small" />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  level="body-sm"
                                  sx={{ lineHeight: 1.1 }}
                                >
                                  {f.file.name}
                                </Typography>
                                <Typography level="body-xs" color="neutral">
                                  {formatBytes(f.file.size)}
                                </Typography>

                                <Input
                                  size="sm"
                                  placeholder="Attachment name"
                                  value={f.attachment_name}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    setSalesFiles((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? {
                                              ...item,
                                              attachment_name: newName,
                                            }
                                          : item
                                      )
                                    );
                                  }}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Box>

                            <IconButton
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() => removeFile(f.file)}
                              aria-label={`Remove ${f.file.name}`}
                            >
                              <CloseRounded />
                            </IconButton>
                          </Box>
                        );
                      })}
                      <Box sx={{ textAlign: "right", mt: 0.5 }}>
                        <Button
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={clearAllFiles}
                        >
                          Clear all
                        </Button>
                      </Box>
                    </Stack>
                  </Sheet>
                )}

                {/* Remarks */}
                <Textarea
                  minRows={3}
                  placeholder="Enter remarks..."
                  variant="soft"
                  value={salesRemarks}
                  onChange={(e) => setSalesRemarks(e.target.value)}
                />

                {/* Actions */}
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
                    disabled={!salesRemarks.trim()}
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
