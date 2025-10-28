import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Sheet,
  Typography,
  Table,
  Chip,
  Divider,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  IconButton,
  Checkbox,
  Stack,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Textarea,
  Tooltip,
  Card,
  CircularProgress,
  Link,
  Grid,
  Option,
  Select,
} from "@mui/joy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import CurrencyRupee from "@mui/icons-material/CurrencyRupee";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileRounded from "@mui/icons-material/InsertDriveFileRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Axios from "../../utils/Axios";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useSearchParams, useNavigate } from "react-router-dom";
import Img12 from "../../assets/slnko_blue_logo.png";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FolderIcon from "@mui/icons-material/Folder";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { debounce } from "lodash";

import {
  useGetCustomerSummaryQuery,
  useUpdateSalesPOMutation,
} from "../../redux/Accounts";
import { toast } from "react-toastify";

// ---------------- constants ----------------
const TABS = ["credit", "debit", "purchase", "sales", "adjustment"];
const DEFAULT_PAGE_SIZE = 20;

export default function CustomerPaymentSummary() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL params -> local state
  const p_id = searchParams.get("p_id");
  const _id = searchParams.get("_id");
  const tabParam = (searchParams.get("tab") || "credit").toLowerCase();
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSizeParam = Math.max(
    1,
    parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10)
  );

  const [activeTab, setActiveTab] = useState(
    TABS.includes(tabParam) ? tabParam : "credit"
  );
  const [page, setPage] = useState(pageParam);
  const [pageSize, setPageSize] = useState(pageSizeParam);

  // filters & local UI state
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");
  const [searchClient, setSearchClient] = useState(
    searchParams.get("searchClient") || ""
  );
  const [searchDebit, setSearchDebit] = useState(
    searchParams.get("searchDebit") || ""
  );
  const [searchAdjustment, setSearchAdjustment] = useState(
    searchParams.get("searchAdjustment") || ""
  );
  const [searchSales, setSearchSales] = useState("");

  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState([]);
  const [selectedDebits, setSelectedDebits] = useState([]);
  const [selectedAdjust, setSelectedAdjust] = useState([]);

  const [user, setUser] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("userDetails");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // sync local state when the URL changes externally
  useEffect(() => {
    const newTab = (searchParams.get("tab") || "credit").toLowerCase();
    const newPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const newPageSize = Math.max(
      1,
      parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10)
    );

    setActiveTab(TABS.includes(newTab) ? newTab : "credit");
    setPage(newPage);
    // pageSize fixed for the session (already seeded from URL on first load)
    // eslint-disable-next-line
  }, [searchParams]);

  // When user clicks a tab, reset page to 1 and write URL
  const handleTabChange = (_, newTab) => {
    const safeTab = String(newTab).toLowerCase();
    const next = new URLSearchParams(searchParams);
    next.set("tab", safeTab);
    next.set("page", "1");
    next.set("pageSize", String(pageSize));
    if (p_id) next.set("p_id", p_id);

    // keep current filters in the URL
    startDate ? next.set("start", startDate) : next.delete("start");
    endDate ? next.set("end", endDate) : next.delete("end");
    searchClient
      ? next.set("searchClient", searchClient)
      : next.delete("searchClient");
    searchDebit
      ? next.set("searchDebit", searchDebit)
      : next.delete("searchDebit");
    searchAdjustment
      ? next.set("searchAdjustment", searchAdjustment)
      : next.delete("searchAdjustment");

    setSearchParams(next);
  };

  // ------------- data fetch (RTK) -------------
  const {
    data: responseData,
    isLoading,
    refetch,
    error,
  } = useGetCustomerSummaryQuery({
    p_id,
    _id,
    start: startDate,
    end: endDate,
    searchClient,
    searchDebit,
    searchAdjustment,
    tab: activeTab,
    page,
    pageSize,
  });

  // shape-safe fallbacks
  const {
    projectDetails = {},
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
  const ClientMeta = clientHistory?.meta ?? {};
  const SalesSummary = Array.isArray(salesHistory.data)
    ? salesHistory.data
    : [];
  const SalesMeta = salesHistory?.meta ?? {};
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

  // Client-side search for Sales (optional)
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

  // Debounced refetch on filter changes
  useEffect(() => {
    const debounced = debounce(() => refetch(), 400);
    debounced();
    return () => debounced.cancel();
  }, [
    searchClient,
    searchDebit,
    searchAdjustment,
    startDate,
    endDate,
    refetch,
  ]);

  // URL helpers for pagination
  const writeUrl = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", activeTab);
    next.set("page", String(newPage));
    next.set("pageSize", String(pageSize));
    if (p_id) next.set("p_id", p_id);
    startDate ? next.set("start", startDate) : next.delete("start");
    endDate ? next.set("end", endDate) : next.delete("end");
    searchClient
      ? next.set("searchClient", searchClient)
      : next.delete("searchClient");
    searchDebit
      ? next.set("searchDebit", searchDebit)
      : next.delete("searchDebit");
    searchAdjustment
      ? next.set("searchAdjustment", searchAdjustment)
      : next.delete("searchAdjustment");
    setSearchParams(next);
  };

  const onPrev = () => {
    if (page <= 1) return;
    const p = page - 1;
    setPage(p);
    writeUrl(p);
  };

  // canNext logic
  const lenForTab = {
    credit: CreditSummary.length,
    debit: DebitSummary.length,
    purchase: ClientSummary.length,
    sales: SalesSummary.length,
    adjustment: AdjustmentSummary.length,
  }[activeTab];

  const hasNextByMeta =
    activeTab === "purchase"
      ? Boolean(ClientMeta?.hasNext)
      : activeTab === "sales"
      ? Boolean(SalesMeta?.hasNext)
      : undefined;

  const canNext =
    typeof hasNextByMeta === "boolean" ? hasNextByMeta : lenForTab >= pageSize;

  const onNext = () => {
    if (!canNext) return;
    const p = page + 1;
    setPage(p);
    writeUrl(p);
  };

  // Actions: print & export
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
      toast.error("Failed to download PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  const today = new Date();

  const dayOptions = { weekday: "long" };
  const dateOptions = { month: "long", day: "numeric", year: "numeric" };

  const currentDay = today.toLocaleDateString("en-US", dayOptions);
  const currentDate = today.toLocaleDateString("en-US", dateOptions);

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

      // ✅ 2. Filter out POs with total_billed_value = 0 or missing
      const validPOs = selectedPO.filter(
        (po) => Number(po.total_billed_value || 0) > 0
      );

      if (validPOs.length === 0) {
        toast.error(
          "Only POs with billed value greater than 0 can be converted."
        );
        return;
      }

      // If some selected POs are invalid, notify user and continue with valid ones
      // if (validPOs.length < selectedPO.length) {
      //   const skipped = selectedPO
      //     .filter((po) => Number(po.total_billed_value || 0) <= 0)
      //     .map((p) => p.po_number)
      //     .join(", ");
      //   toast.warning(`Skipped PO(s) without billed value: ${skipped}`);
      // }

      // ✅ 3. Ensure remarks
      if (!salesRemarks.trim()) {
        toast.error("Remarks are required.");
        return;
      }

      // ✅ 4. Ensure Sales Invoice
      const inv = (salesInvoice || "").trim();
      if (!inv) {
        toast.error("Sales Invoice No. is required.");
        return;
      }

      // Basic format validation
      const invoiceOk = /^[A-Za-z0-9\/\-.]+$/.test(inv);
      if (!invoiceOk) {
        toast.error(
          "Sales Invoice No. can contain letters, numbers, '/', '-' or '.'."
        );
        return;
      }

      // ✅ 5. Validate Basic values for selected POs
      const invalidPOs = validPOs.filter((po) => {
        const id = po._id;
        const basic = salesAmounts[id]?.basic;
        return basic === undefined || basic === "" || isNaN(Number(basic));
      });

      if (invalidPOs.length > 0) {
        const poList = invalidPOs.map((p) => p.po_number).join(", ");
        toast.error(`Please enter Basic Sales value for: ${poList}`);
        return;
      }

      // ✅ 6. Basic Sales <= Bill Basic guard
      const capErrors = validPOs.filter((po) => {
        const id = po._id;
        const billBasic = Number(po.bill_basic || 0);
        const basic = Number(salesAmounts[id]?.basic || 0);
        return basic < 0 || basic > billBasic;
      });

      if (capErrors.length > 0) {
        const poList = capErrors.map((p) => p.po_number).join(", ");
        toast.error(
          `Basic Sales must not exceed Billed Basic Value for: ${poList}`
        );
        return;
      }

      // ✅ 7. Perform conversion calls only for valid POs
      const results = await Promise.allSettled(
        validPOs.map(async (po) => {
          const id = po._id;
          const poNumber = po.po_number;
          const basic = Number(salesAmounts[id]?.basic || 0);
          const gst = Number(salesAmounts[id]?.gst || 0);

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

      // ✅ 8. Count results
      let ok = 0,
        fail = 0;
      for (const r of results) {
        if (r.status === "fulfilled") ok++;
        else fail++;
      }

      if (ok) toast.success(`Converted ${ok} PO(s) successfully.`);
      if (fail) toast.warning(`Failed ${fail} PO(s).`);

      // ✅ 9. Reset form after success
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

  // Shared footer
  const PaginationFooter = ({ totalHint }) => {
    const pageSizeOptions = [10, 25, 50, 100];

    const handlePageSizeChange = (newSize) => {
      const parsed = Number(newSize);
      if (!Number.isFinite(parsed) || parsed <= 0) return;

      // Reset to page 1 when changing size
      setPage(1);
      setPageSize(parsed);

      const next = new URLSearchParams(searchParams);
      next.set("tab", activeTab);
      next.set("page", "1");
      next.set("pageSize", String(parsed));
      if (p_id) next.set("p_id", p_id);
      setSearchParams(next);
    };

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          justifyContent: "space-between",
          mt: 1.5,
        }}
      >
        {/* Left side: page and total hint */}
        <Typography level="body-sm">
          Page {page}
          {totalHint ? ` • ${totalHint}` : ""}
        </Typography>

        {/* Right side: pagination controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* Page size selection */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography level="body-sm">Rows per page:</Typography>
            <Select
              size="sm"
              value={pageSize}
              onChange={(_, val) => handlePageSizeChange(val)}
              sx={{ minWidth: 80 }}
            >
              {pageSizeOptions.map((size) => (
                <Option key={size} value={size}>
                  {size}/page
                </Option>
              ))}
            </Select>
          </Stack>

          {/* Prev / Next */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Button
              size="sm"
              variant="plain"
              disabled={page <= 1}
              onClick={onPrev}
            >
              Prev
            </Button>
            <Typography level="body-sm">/</Typography>
            <Button
              size="sm"
              variant="plain"
              disabled={!canNext || isLoading}
              onClick={onNext}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

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

  const Balance_Summary = ({ isLoading = false }) => {
    const safeRound = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.round(n) : "• • •";
    };

    const rows = [
      [
        "1",
        "Total Received",
        safeRound(responseData?.total_received),
        "#FFF59D",
      ],
      ["2", "Total Return", safeRound(responseData?.total_return), "#FFF59D"],
      [
        "3",
        "Net Balance [(1)-(2)]",
        safeRound(responseData?.netBalance),
        "#FFE082",
        true,
      ],
      [
        "4",
        "Total Advances Paid to Vendors",
        safeRound(responseData?.total_advance_paid),
        "#FFF",
      ],
      ["", "Billing Details", "", "#F5F5F5"],
      [
        "5",
        "Invoice issued to customer",
        safeRound(responseData?.total_sales_value),
        "#FFF",
      ],
      [
        "6",
        "Bills received, yet to be invoiced to customer",
        safeRound(responseData?.aggregate_billed_value),
        "#FFF",
      ],
      [
        "7",
        "Advances left after bills received [4-5-6]",
        safeRound(responseData?.remaining_advance_left_after_billed),
        "#FFF",
      ],
      [
        "8",
        "Adjustment (Debit-Credit)",
        safeRound(responseData?.total_adjustment),
        "#FFF",
      ],
      [
        "9",
        "Balance With Slnko [3 - 5 - 6 - 7 - 8]",
        safeRound(responseData?.balance_with_slnko),
        "#FFECB3",
        true,
      ],
    ];

    const formulaMap = {
      1: "Amount Received from Customer",
      2: "Amount Returned to Customer",
      3: "Net Balance = (1) - (2)",
      4: "Advance lying with vendors",
      5: "Value of material delivered (PO Closed) & Sales Invoice issued (including Sales GST)",
      6: "Value of material delivered (PO Closed) including Purchase GST",
      7: "Advance left after bills received [4-5-6] ",
      8: "Adjustments (Debit / Credit)",
      9: "",
    };

    const summaryData = [
      ["Total PO Value", safeRound(responseData?.total_po_with_gst)],
      ["Billed Value", safeRound(responseData?.aggregate_billed_value)],
      ["Advance Paid", safeRound(responseData?.total_advance_paid)],
      [
        "Remaining to Pay",
        safeRound(responseData?.exact_remaining_pay_to_vendor),
        responseData?.aggregate_billed_value > responseData?.total_advance_paid
          ? "success"
          : "warning",
      ],
    ];

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
          

            {responseData?.billing_type && (
              <Chip
                size="md"
                variant="soft"
                color="neutral"
                sx={{ fontWeight: 600 }}
              >
                Billing:&nbsp;
                {responseData?.billing_type === "Composite"
                  ? "Composite (8.9%)"
                  : responseData?.billing_type === "Individual"
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
                {summaryData.map(([desc, value, tone]) => (
                  <Tooltip
                    key={desc}
                    title={
                      desc === "Remaining to Pay"
                        ? "If Billed > Advance → (PO with GST − Billed), else = (PO with GST − Total Advance Paid)"
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

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <TabList
  variant="plain"
  color="neutral"
  sx={{
    gap: 0.5,
    p: 0.5,
    borderRadius: "lg",
    bgcolor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(12px)",
    boxShadow: "sm",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflowX: "auto",
  }}
>
  {TABS.map((t) => (
    <Tab
      key={t}
      value={t}
      sx={{
        textTransform: "capitalize",
        fontWeight: 600,
        fontSize: 15,
        px: 2.5,
        py: 1,
        borderRadius: "xl",
        transition: "all 0.25s ease",
        color: "text.secondary",
        bgcolor: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(10px)",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.55)",
          color: "text.primary",
          transform: "translateY(-1px)",
        },
        "&[aria-selected='true']": {
          bgcolor: "primary.solidBg",
          color: "primary.softColor",
          boxShadow: "md",
          transform: "translateY(-1px)",
        },
      }}
    >
      {t}
    </Tab>
  ))}
</TabList>


          {/* ====================== CREDIT ====================== */}
          <TabPanel value="credit" sx={{ p: 0 }}>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { md: "row", xs: "column" },
                  "@media print": { display: "none" },
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
                  {/* <FormControl sx={{ minWidth: 200 }}>
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
                  </FormControl> */}
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
                  width: "100%",
                }}
              >
                <Table borderAxis="both" stickyHeader sx={{ minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Credit Date</th>
                      <th>Credit Mode</th>
                      <th>Credited Amount (₹)</th>
                      <th style={{ textAlign: "center" }}>
                        <Checkbox
                          color="primary"
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedCredits(
                                CreditSummary.map((r) => r._id)
                              );
                            else setSelectedCredits([]);
                          }}
                          checked={
                            selectedCredits.length === CreditSummary.length &&
                            CreditSummary.length > 0
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ textAlign: "center", padding: 20 }}
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
                        <tr key={row._id || row.id}>
                          <td>
                            {formatDateTime(row.cr_date || row.createdAt)}
                          </td>
                          <td>{row.cr_mode || "—"}</td>
                          <td>
                            <RupeeValue value={row.cr_amount ?? 0} />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Checkbox
                              color="primary"
                              checked={selectedCredits.includes(row._id)}
                              onChange={() =>
                                setSelectedCredits((prev) =>
                                  prev.includes(row._id)
                                    ? prev.filter((id) => id !== row._id)
                                    : [...prev, row._id]
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ textAlign: "center", padding: 20 }}
                        >
                          <Typography level="body-md">
                            No credit history available
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {CreditSummary.length > 0 && (
                    <tfoot>
                      <tr
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <td
                          colSpan={2}
                          style={{ color: "dodgerblue", textAlign: "right" }}
                        >
                          Total Credited:
                        </td>
                        <td style={{ color: "dodgerblue" }}>
                          <RupeeValue value={credit?.total || 0} />
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </Table>

                {/* pagination for CREDIT */}
                {/* <Divider sx={{ my: 1 }} />
                <PaginationFooter /> */}
              </Sheet>
            </Box>
          </TabPanel>

          {/* ====================== DEBIT ====================== */}
          <TabPanel value="debit" sx={{ p: 0 }}>
            <Box mt={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { md: "row", xs: "column" },
                  "@media print": { display: "none" },
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
                  <FormControl sx={{ minWidth: 350 }}>
                    {/* <FormLabel>Search Paid For</FormLabel> */}
                    <Input
                      placeholder="Enter PO Number, Item or Vendor..."
                      value={searchDebit}
                      onChange={(e) => setSearchDebit(e.target.value)}
                    />
                  </FormControl>

                  {/* <FormControl sx={{ minWidth: 200 }}>
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
                  </FormControl> */}
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
                  width: "100%",
                }}
              >
                <Table
                  borderAxis="both"
                  stickyHeader
                  sx={{ minWidth: "100%", tableLayout: "fixed" }}
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
                        <Checkbox
                          color="primary"
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedDebits(DebitSummary.map((r) => r._id));
                            else setSelectedDebits([]);
                          }}
                          checked={
                            selectedDebits.length === DebitSummary.length &&
                            DebitSummary.length > 0
                          }
                        />
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
                          <td>{formatDateTime(row.dbt_date)}</td>
                          <td>{row.po_number || "—"}</td>
                          <td>{row.paid_for || "—"}</td>
                          <td>{row.vendor || "—"}</td>
                          <td>
                            <RupeeValue value={row.amount_paid} />
                          </td>
                          <td className="utrCell" title={row.utr || "-"}>
                            {row.utr || "-"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Checkbox
                              color="primary"
                              checked={selectedDebits.includes(row._id)}
                              onChange={() =>
                                setSelectedDebits((prev) =>
                                  prev.includes(row._id)
                                    ? prev.filter((id) => id !== row._id)
                                    : [...prev, row._id]
                                )
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
                          <RupeeValue value={debit?.total || 0} />
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </Table>

                {/* pagination for DEBIT */}
                {/* <Divider sx={{ my: 1 }} />
                <PaginationFooter /> */}
              </Sheet>
            </Box>
          </TabPanel>

          {/* ====================== PURCHASE (Client History) ====================== */}
          <TabPanel value="purchase" sx={{ p: 0 }}>
            <Box mt={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Input
                  placeholder="Search PO Number, Item or Vendor..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  sx={{ width: { xs: "100%", md: 350 } }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {[
                    "IT Team",
                    "Guddu Rani Dubey",
                    "Prachi Singh",
                    "admin",
                    "Chandan Singh",
                    "Gagan Tayal",
                    "Sachin Raghav",
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

                      {user?.name !== "Chandan Singh" &&
                        user?.name !== "Sachin Raghav" && (
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
                    width: "100%",
                    minWidth: 1000,
                    tableLayout: "auto",
                    fontSize: { xs: 12, sm: 14 },
                    "& thead": {
                      backgroundColor: "background.level1",
                      "& th": {
                        px: 2,
                        py: 1.1,
                        fontWeight: 600,
                        color: "text.secondary",
                        borderColor: "neutral.outlinedBorder",
                        textAlign: "center",
                      },
                    },
                    "& tbody tr:hover": {
                      backgroundColor: "background.level1",
                    },
                    "& th, & td": {
                      px: { xs: 1, sm: 2 },
                      py: 1,
                      verticalAlign: "middle",
                      lineHeight: 1.5,
                      borderColor: "neutral.outlinedBorder",
                    },
                    "& td": {
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    },
                    "& td.em": { fontWeight: 700, color: "text.primary" },
                    "& th.em": { fontWeight: 800, color: "text.primary" },
                  }}
                >
                  <colgroup>
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "200px" }} />
                    <col style={{ width: "300px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "120px" }} />
                    <col style={{ width: "60px" }} />
                  </colgroup>

                  <thead>
                    <tr>
                      <th rowSpan={2} className="text">
                        PO Number
                      </th>
                      <th rowSpan={2} className="text">
                        Vendor
                      </th>
                      <th rowSpan={2} className="text">
                        Item
                      </th>
                      <th colSpan={3} className="poGroup">
                        PO Value (₹)
                      </th>
                      <th rowSpan={2} className="num">
                        Advance Paid (₹)
                      </th>
                      <th rowSpan={2} className="num groupSplitRight">
                        Advance Remaining (₹)
                      </th>
                      <th colSpan={3} className="billedGroup">
                        Total Billed (₹)
                      </th>
                      <th rowSpan={1} style={{ textAlign: "center" }}>
                        <Checkbox
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedClients(
                                ClientSummary.map((c) => c._id)
                              );
                            else setSelectedClients([]);
                          }}
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
                      <th className="num em poGroup">Total (₹)</th>
                      <th className="num em billedGroup">Basic (₹)</th>
                      <th className="num em billedGroup">GST (₹)</th>
                      <th className="num em billedGroup">Total (₹)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={12}
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
                          <td className="text">{client.po_number || "N/A"}</td>
                          <td className="text">{client.vendor || "N/A"}</td>
                          <td
                            className="text item"
                            title={getItemLabel(client) || "—"}
                          >
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
                              {getItemLabel(client)}
                            </Typography>
                          </td>
                          <td className="num em">
                            <RupeeValue value={client.po_basic || 0} />
                          </td>
                          <td className="num em">
                            <RupeeValue value={client.gst || 0} />
                          </td>
                          <td className="num em">
                            <RupeeValue value={client.po_value || 0} />
                          </td>
                          <td className="num">
                            <RupeeValue value={client.advance_paid || 0} />
                          </td>
                          <td className="num">
                            <RupeeValue value={client.remaining_amount || 0} />
                          </td>
                          <td className="num em">
                            <RupeeValue value={client.bill_basic || 0} />
                          </td>
                          <td className="num em">
                            <RupeeValue value={client.bill_gst || 0} />
                          </td>
                          <td className="num em">
                            <RupeeValue
                              value={client.total_billed_value || 0}
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Checkbox
                              checked={selectedClients.includes(client._id)}
                              onChange={() =>
                                setSelectedClients((prev) =>
                                  prev.includes(client._id)
                                    ? prev.filter((id) => id !== client._id)
                                    : [...prev, client._id]
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={12}
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
                      <tr>
                        <td
                          colSpan={3}
                          style={{ textAlign: "right", fontWeight: 700 }}
                        >
                          Total:
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_po_basic || 0}
                          />
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_gst || 0}
                          />
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_po_value || 0}
                          />
                        </td>
                        <td className="num">
                          <RupeeValue
                            value={clientHistory?.meta?.total_advance_paid || 0}
                          />
                        </td>
                        <td className="num">
                          <RupeeValue
                            value={
                              clientHistory?.meta?.total_remaining_amount || 0
                            }
                          />
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_bill_basic || 0}
                          />
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_bill_gst || 0}
                          />
                        </td>
                        <td className="num em">
                          <RupeeValue
                            value={clientHistory?.meta?.total_billed_value || 0}
                          />
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </Table>

                {/* pagination for PURCHASE uses meta when present */}
                {/* <Divider sx={{ my: 1 }} />
                <PaginationFooter
                  totalHint={
                    clientHistory?.meta?.totalPages
                      ? `of ${clientHistory.meta.totalPages} page(s)`
                      : undefined
                  }
                /> */}
              </Sheet>
            </Box>
          </TabPanel>

          {/* ====================== SALES ====================== */}
          <TabPanel value="sales" sx={{ p: 0 }}>
            <Box mt={4}>
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
                  value={searchSales}
                  onChange={(e) => setSearchSales(e.target.value)}
                  sx={{ width: { xs: "100%", md: 350 } }}
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
                    minWidth: 950,
                    width: "100%",
                    tableLayout: "fixed",
                    fontSize: { xs: 12, sm: 14 },
                    "& thead": { backgroundColor: "neutral.softBg" },
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
                      <th colSpan={3} style={{ textAlign: "center" }}>
                        Sales
                      </th>
                    </tr>
                    <tr>
                      <th className="num">Value (₹)</th>
                      <th className="num">GST (₹)</th>
                      <th
                        className="num"
                        style={{ backgroundColor: "#E3F2FD" }}
                      >
                        Total Sales (₹)
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
                            Loading sales history...
                          </Typography>
                        </td>
                      </tr>
                    ) : (SalesSummary?.length || 0) === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
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
                          colSpan={8}
                          style={{ textAlign: "center", padding: 20 }}
                        >
                          <Typography level="body-md">
                            No matching results
                          </Typography>
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale, idx) => {
                        const atts = normalizeAttachments(sale.attachments);
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
                          sale.sales_gst ?? sale.gst_on_sales ?? sale.gstSales
                        );
                        const totalSales = salesBasic + salesGst;

                        return (
                          <tr key={sale._id || `${sale.po_number}-${idx}`}>
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
                                        key={att.url || `${sale._id}-att-${i}`}
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
                                          backgroundColor: "neutral.softBg",
                                          maxWidth: 160,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                        title={att.name}
                                      >
                                        <AttachFileIcon sx={{ fontSize: 15 }} />
                                        {att.name || `File ${i + 1}`}
                                      </Link>
                                    ))
                                  ) : (
                                    <Typography
                                      level="body-xs"
                                      sx={{ opacity: 0.6, fontStyle: "italic" }}
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

                            <td className="num">
                              <RupeeValue value={Math.round(billBasic)} />
                            </td>
                            <td className="num">
                              <RupeeValue value={Math.round(salesBasic)} />
                            </td>
                            <td className="num">
                              <RupeeValue value={Math.round(salesGst)} />
                            </td>
                            <td
                              className="num"
                              style={{ backgroundColor: "#E3F2FD" }}
                            >
                              <RupeeValue value={Math.round(totalSales)} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Totals for filtered rows (client-side) */}
                  {filteredSales.length > 0 && (
                    <tfoot>
                      {(() => {
                        const toNum = (v) =>
                          Number.isFinite(Number(v)) ? Number(v) : 0;
                        const sum = (pick) =>
                          filteredSales.reduce((acc, s) => acc + pick(s), 0);
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
                          toNum(s.sales_gst ?? s.gst_on_sales ?? s.gstSales)
                        );
                        const totalSalesOverall =
                          totalSalesBasic + totalSalesGst;
                        return (
                          <tr
                            style={{
                              fontWeight: "bold",
                              backgroundColor: "#FFF9C4",
                            }}
                          >
                            <td colSpan={4} style={{ textAlign: "right" }}>
                              Total:
                            </td>
                            <td className="num">
                              <RupeeValue value={Math.round(totalBillBasic)} />
                            </td>
                            <td className="num">
                              <RupeeValue value={Math.round(totalSalesBasic)} />
                            </td>
                            <td className="num">
                              <RupeeValue value={Math.round(totalSalesGst)} />
                            </td>
                            <td
                              className="num"
                              style={{ backgroundColor: "#E3F2FD" }}
                            >
                              <RupeeValue
                                value={Math.round(totalSalesOverall)}
                              />
                            </td>
                          </tr>
                        );
                      })()}
                    </tfoot>
                  )}
                </Table>

                {/* pagination for SALES uses meta when present */}
                {/* <Divider sx={{ my: 1 }} />
                <PaginationFooter
                  totalHint={
                    SalesMeta?.totalPages
                      ? `of ${SalesMeta.totalPages} page(s)`
                      : undefined
                  }
                /> */}
              </Sheet>

              {/* Sales detail modal (kept minimal) */}
              <Modal open={saleDetailOpen} onClose={closeSaleDetail}>
                <ModalDialog sx={{ width: 520 }}>
                  <DialogTitle>Sales Conversion</DialogTitle>
                  <DialogContent>
                    <Stack spacing={1.25}>
                      {/* --- Header Info --- */}
                      <Typography level="title-sm">
                        PO: <strong>{activeSale?.po_number ?? "—"}</strong>
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
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
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography level="body-sm">
                          <strong>Sales Invoice No.:</strong>
                        </Typography>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            activeSale?.sales_invoice ? "primary" : "neutral"
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
                        {activeSale?.remarks?.trim() ? activeSale.remarks : "—"}
                      </Typography>

                      {/* --- Sales Amounts --- */}
                      {(() => {
                        const basic = Number(activeSale?.basic_sales);
                        const gst = Number(activeSale?.gst_on_sales);
                        const billBasic = Number(
                          activeSale?.bill_basic_value ||
                            activeSale?.bill_basic ||
                            0
                        );

                        const hasBasic = Number.isFinite(basic);
                        const hasGst = Number.isFinite(gst);
                        const total =
                          (hasBasic ? basic : 0) + (hasGst ? gst : 0);

                        const exceeds = basic > billBasic && billBasic > 0;

                        const fmt = (n) =>
                          Number.isFinite(n) ? n.toLocaleString("en-IN") : "—";

                        return (
                          <Sheet
                            variant="soft"
                            sx={{
                              p: 1,
                              borderRadius: "md",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
                              gap: 1,
                              backgroundColor: exceeds
                                ? "#FFF3E0"
                                : "neutral.softBg",
                              border: exceeds ? "1px solid #F57C00" : "none",
                            }}
                          >
                            <Box>
                              <Typography level="body-xs" color="neutral">
                                Basic Sales
                              </Typography>
                              <Typography
                                level="title-sm"
                                sx={{
                                  color: exceeds
                                    ? "danger.solidBg"
                                    : "text.primary",
                                  fontWeight: exceeds ? 700 : 500,
                                }}
                              >
                                {fmt(basic)}
                              </Typography>
                              {exceeds && (
                                <Typography
                                  level="body-xs"
                                  color="danger"
                                  sx={{ mt: 0.25, fontStyle: "italic" }}
                                >
                                  Cannot exceed Bill Basic ({fmt(billBasic)})
                                </Typography>
                              )}
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
                              normalizeAttachments(activeSale?.attachments).map(
                                (a, i) => (
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
                                        backgroundColor: "neutral.plainHoverBg",
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
                                )
                              )
                            ) : (
                              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
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
            </Box>
          </TabPanel>

          {/* ====================== ADJUSTMENT ====================== */}
          <TabPanel value="adjustment" sx={{ p: 0 }}>
            <Box mt={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: { md: "row", xs: "column" },
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
                }}
              >
                <Table
                  borderAxis="both"
                  stickyHeader
                  sx={{
                    minWidth: "100%",
                    tableLayout: "fixed",
                    "& th, & td": {
                      textAlign: "left",
                      px: 2,
                      py: 1.5,
                      verticalAlign: "middle",
                    },
                    "& th.dateCell, & td.dateCell": { minWidth: 120 },
                    "& th.typeCell, & td.typeCell": {
                      minWidth: 120,
                      whiteSpace: "normal",
                    },
                    "& th.reasonCell, & td.reasonCell, & th.descCell, & td.descCell":
                      {
                        maxWidth: { xs: 180, sm: 240, md: 320 },
                        whiteSpace: { xs: "normal", md: "nowrap" },
                        overflow: { md: "hidden" },
                        textOverflow: { md: "ellipsis" },
                        overflowWrap: "anywhere",
                      },
                    "& th.poCell, & td.poCell, & th.paidForCell, & td.paidForCell":
                      {
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        minWidth: 120,
                      },
                    "& th.money, & td.money": { textAlign: "right" },
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
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedAdjust(
                                AdjustmentSummary.map((a) => a._id)
                              );
                            else setSelectedAdjust([]);
                          }}
                          checked={
                            selectedAdjust.length ===
                              AdjustmentSummary.length &&
                            AdjustmentSummary.length > 0
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
                            {formatDateTime(row.adj_date)}
                          </td>
                          <td className="typeCell">{row.pay_type}</td>
                          <td
                            className="reasonCell"
                            title={row.description || "-"}
                          >
                            {row.description || "-"}
                          </td>
                          <td className="poCell">{row.po_number || "-"}</td>
                          <td className="paidForCell">{row.paid_for || "-"}</td>
                          <td className="descCell" title={row.comment || "-"}>
                            {row.comment || "-"}
                          </td>
                          <td className="money">
                            {row.adj_type === "Add" ? (
                              <RupeeValue
                                value={parseFloat(row.adj_amount || 0)}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="money">
                            {row.adj_type === "Subtract" ? (
                              <RupeeValue
                                value={parseFloat(row.adj_amount || 0)}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Checkbox
                              color="primary"
                              checked={selectedAdjust.includes(row._id)}
                              onChange={() =>
                                setSelectedAdjust((prev) =>
                                  prev.includes(row._id)
                                    ? prev.filter((id) => id !== row._id)
                                    : [...prev, row._id]
                                )
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
                          <RupeeValue value={adjustment?.totalCredit || 0} />
                        </td>
                        <td className="money">
                          <RupeeValue value={adjustment?.totalDebit || 0} />
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </Table>

                {/* pagination for ADJUSTMENT */}
                {/* <Divider sx={{ my: 1 }} />
                <PaginationFooter /> */}
              </Sheet>
            </Box>
          </TabPanel>
        </Tabs>

        {/* ====================== Balance Summary (simple) ====================== */}
        <Divider sx={{ my: 3 }} />
        <Typography level="h5" mb={1}>
          Balance Summary
        </Typography>
        <Card variant="outlined" sx={{ borderRadius: "lg", p: 2 }}>
          <Balance_Summary />
        </Card>

        {/* Floating actions */}
        <Box
          position="fixed"
          bottom={16}
          right={16}
          zIndex={1300}
          display="flex"
          gap={2}
          sx={{ "@media print": { display: "none" } }}
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
      </Card>

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

                  // ✅ Get the full PO data from ClientSummary
                  const selectedPOsData = ClientSummary.filter((po) =>
                    selectedClients.includes(po._id)
                  );

                  if (!selectedPOsData.length) {
                    toast.error("Selected PO(s) not found in current list.");
                    return;
                  }

                  // ✅ Filter only those with total_billed_value > 0
                  const validPOs = selectedPOsData.filter(
                    (po) => Number(po.total_billed_value || 0) > 0
                  );

                  // ✅ Handle cases
                  if (validPOs.length === 0) {
                    toast.error(
                      "Only POs with billed value greater than 0 can be converted."
                    );
                    return;
                  }

                  // if (validPOs.length < selectedPOsData.length) {
                  //   const skipped = selectedPOsData
                  //     .filter((po) => Number(po.total_billed_value || 0) <= 0)
                  //     .map((p) => p.po_number)
                  //     .join(", ");
                  //   toast.warning(
                  //     // `Skipped PO(s) without billed value: ${skipped}`
                  //   );
                  // }

                  // ✅ Proceed with valid ones only
                  setSelectedPO(validPOs);
                  setSalesAmounts(
                    validPOs.reduce((acc, po) => {
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
            <DialogTitle
              id="sales-convert-title"
              sx={{ fontWeight: 700, mb: 1 }}
            >
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
                              idx % 2 === 0
                                ? "background.body"
                                : "neutral.softBg",
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
                            {/* {showInfo && (
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
                    )} */}
                            <Typography
                              level="body-sm"
                              sx={{ fontWeight: 600 }}
                            >
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
                              borderColor: basicExceeds
                                ? "danger.solidBg"
                                : undefined,
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
                  <FormLabel sx={{ fontWeight: 600 }}>
                    Sales Invoice No.
                  </FormLabel>
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
  );
}