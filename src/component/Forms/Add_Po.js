import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Input,
  Grid,
  Divider,
  Sheet,
  IconButton,
  Chip,
} from "@mui/joy";
import { Modal, ModalDialog, Textarea } from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import Send from "@mui/icons-material/Send";
import {
  Close,
  ConfirmationNumber,
  Print,
  RestartAlt,
} from "@mui/icons-material";
import SearchPickerModal from "../SearchPickerModal";

import {
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
} from "../../redux/vendorSlice";
import { Check, Cross } from "lucide-react";

// ---------- helpers ----------
const makeEmptyLine = () => ({
  id: crypto.randomUUID(),
  productId: "",
  productName: "",
  productCategoryId: "",
  productCategoryName: "",
  make: "",
  uom: "",
  quantity: 1,
  received: 0,
  billed: 0,
  unitPrice: 0,
  taxPercent: 0,
});

const VENDOR_LIMIT = 7;
const SEARCH_MORE_VENDOR = "__SEARCH_MORE_VENDOR__";

const AddPurchaseOrder = ({
  onSuccess,
  onClose,
  pr_id, // PR _id
  p_id, // project id (your backend currently shows string; we store whatever is valid)
  project_code,
  initialLines = [],
  categoryNames = [],
  mode = "create", // "create" | "edit"
  fromModal = false,
  poStatus = "draft",
  poNumberPreset = "",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // -------- URL params --------
  const modeQ = (searchParams.get("mode") || "").toLowerCase(); // "view" | "edit" | ""
  const poNumberQ = searchParams.get("po_number") || "";
  const effectiveMode = modeQ || mode;
  const viewMode = effectiveMode === "view";
  const [openRefuse, setOpenRefuse] = useState(false);
  const [remarks, setRemarks] = useState("");
  // -------- actions --------
  const [submitAction, setSubmitAction] = useState(null); // 'send_approval' | 'confirm_order' | 'edit_save'

  // -------- vendor search (server + modal) --------
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  const { data: vendorsResp, isFetching: vendorsLoading } =
    useGetVendorsNameSearchQuery({
      search: vendorSearch,
      page: vendorPage,
      limit: VENDOR_LIMIT,
    });

  const vendorRows = vendorsResp?.data || [];
  const [triggerVendorSearch] = useLazyGetVendorsNameSearchQuery();

  const vendorColumns = [
    { key: "name", label: "Vendor Name", width: 320 },
    { key: "Beneficiary_Name", label: "Beneficiary", width: 320 },
  ];

  const fetchVendorsPage = async ({
    search = "",
    page = 1,
    pageSize = VENDOR_LIMIT,
  }) => {
    const res = await triggerVendorSearch(
      { search, page, limit: pageSize },
      true
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.limit || pageSize,
    };
  };

  const onPickVendor = (row) => {
    if (!row) return;
    setFormData((prev) => ({ ...prev, name: row.name || "" }));
    setVendorModalOpen(false);
  };

  // -------- form state --------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEdit, setManualEdit] = useState(false);

  const [formData, setFormData] = useState({
    _id: "",
    p_id: p_id ?? "", // do not force numeric; backend sample shows string
    project_code: project_code || "",
    po_number: poNumberPreset || poNumberQ || "",
    name: "",
    date: "",
    po_value: "",
    po_basic: "",
    gst: "",
    partial_billing: "",
    submitted_By: "",
  });

  const [lines, setLines] = useState(() =>
    Array.isArray(initialLines) && initialLines.length
      ? initialLines.map((l) => ({
          ...makeEmptyLine(),
          ...l,
          id: crypto.randomUUID(),
        }))
      : [makeEmptyLine()]
  );

  const addLine = () => setLines((prev) => [...prev, makeEmptyLine()]);
  const removeLine = (id) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev
    );
  const updateLine = (id, field, value) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );

  // -------- totals --------
  const amounts = useMemo(() => {
    const untaxed = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      return sum + q * up;
    }, 0);

    const tax = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      const t = Number(l.taxPercent || 0);
      return sum + (q * up * t) / 100;
    }, 0);

    return { untaxed, tax, total: untaxed + tax };
  }, [lines]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      po_basic: String(amounts.untaxed ?? 0),
      gst: String(amounts.tax ?? 0),
      po_value: String(amounts.total ?? 0),
    }));
  }, [amounts]);

  // -------- auth helper --------
  const getUserData = () => {
    const raw = localStorage.getItem("userDetails");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // submitted_By prefill
  useEffect(() => {
    const user = getUserData();
    if (user?.name) {
      setFormData((p) => ({ ...p, submitted_By: user.name }));
    }
  }, []);

  // -------- map PO -> lines --------
  const mapPOtoLines = (po) => {
    const arr = Array.isArray(po?.items)
      ? po.items
      : Array.isArray(po?.item)
        ? po.item
        : [];
    return arr.length
      ? arr.map((it) => ({
          ...makeEmptyLine(),
          productCategoryId:
            typeof it?.category === "object"
              ? (it?.category?._id ?? "")
              : (it?.category ?? ""),
          productCategoryName:
            typeof it?.category === "object" ? (it?.category?.name ?? "") : "",
          productName: it?.product_name ?? "",
          make: it?.product_make ?? "",
          uom: it?.uom ?? "",
          quantity: Number(it?.quantity ?? 0),
          unitPrice: Number(it?.cost ?? 0),
          taxPercent: Number(it?.gst_percent ?? it?.gst ?? 0),
        }))
      : [makeEmptyLine()];
  };

  // -------- fetch PO (edit/view) --------
  const [poLoading, setPoLoading] = useState(false);
  const [fetchedPoStatus, setFetchedPoStatus] = useState(poStatus || "draft");
  const _id = searchParams.get("_id") || "";
  useEffect(() => {
    if (effectiveMode !== "view" && effectiveMode !== "edit") return;

    const token = localStorage.getItem("authToken");

    (async () => {
      try {
        setPoLoading(true);
        const { data: resp } = await Axios.get(
          `/get-po-by-po_number?po_number=${encodeURIComponent(poNumberQ)}&_id=${_id}`,
          { headers: { "x-auth-token": token } }
        );
        // backend now returns { data: <object> }
        const po = Array.isArray(resp?.data)
          ? resp.data[0]
          : (resp?.data ?? resp);
        if (!po) {
          toast.error("PO not found.");
          return;
        }

        setFetchedPoStatus(po?.current_status?.status || "draft");

        setFormData((prev) => ({
          ...prev,
          _id: po?._id || prev._id,
          p_id: po?.p_id ?? prev.p_id,
          project_code: po?.p_id ?? prev.p_id ?? "",
          po_number: po?.po_number ?? prev.po_number ?? "",
          name: po?.vendor ?? "",
          date: po?.date ?? "",
          partial_billing: po?.partial_billing ?? "",
          submitted_By: po?.submitted_By ?? prev.submitted_By,
          po_basic: String(po?.po_basic ?? prev.po_basic ?? ""),
          gst: String(po?.gst ?? prev.gst ?? ""),
          po_value: String(po?.po_value ?? prev.po_value ?? ""),
        }));

        setLines(mapPOtoLines(po));
      } catch (err) {
        console.error("Failed to load PO:", err);
        toast.error("Failed to load PO.");
      } finally {
        setPoLoading(false);
      }
    })();
  }, [poNumberQ, effectiveMode]);

  // -------- status-based gating --------
  const statusNow = fetchedPoStatus; // backend: "approval_pending" | "approval_done" | "po_created" | ...
  const isApprovalPending = statusNow === "approval_pending";
  const canConfirm = statusNow === "approval_done";
  const approvalRejected = statusNow === "approval_rejected"

  const inputsDisabled = viewMode || !(isApprovalPending && manualEdit) || !approvalRejected;

  // -------- handlers --------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "po_value" && parseFloat(value) < 0) {
      toast.warning("PO Value can't be Negative !!");
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "po_basic" || name === "gst") {
        const poBasic =
          parseFloat(name === "po_basic" ? value : updated.po_basic) || 0;
        const gst = parseFloat(name === "gst" ? value : updated.gst) || 0;
        updated.po_value = poBasic + gst;
      }
      return updated;
    });
  };

  const handleVendorChange = (opt) => {
    if (!opt) {
      setFormData((prev) => ({ ...prev, name: "" }));
      return;
    }
    if (opt.value === SEARCH_MORE_VENDOR) {
      setVendorModalOpen(true);
      return;
    }
    setFormData((prev) => ({ ...prev, name: opt.value || "" }));
  };

  // -------- submit --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const item = (lines || [])
      .filter((l) => l?.productName || l?.productCategoryName)
      .map((l) => {
        const categoryId =
          typeof l.productCategoryId === "object" && l.productCategoryId?._id
            ? String(l.productCategoryId._id)
            : l.productCategoryId != null
              ? String(l.productCategoryId)
              : "";

        return {
          category: String(categoryId),
          product_name: String(l.productName || ""),
          product_make: String(l.make || ""),
          uom: String(l.uom ?? ""),
          quantity: String(l.quantity ?? 0),
          cost: String(l.unitPrice ?? 0),
          gst_percent: String(l.taxPercent ?? 0),
        };
      });

    const hasValidLine =
      item.length > 0 && item.some((it) => Number(it.quantity) > 0);

    if (submitAction === "edit_save") {
      if (!formData?._id) {
        toast.error("PO id missing.");
        return;
      }
      if (!isApprovalPending) {
        toast.error("Editing allowed only during approval pending.");
        return;
      }
      if (!hasValidLine) {
        toast.error("Add at least one valid product row.");
        return;
      }

      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        const body = {
          po_number: formData.po_number,
          vendor: formData.name,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          submitted_By: formData.submitted_By,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
        };
        await Axios.put(`/edit-pO-IT/${formData._id}`, body, {
          headers: { "x-auth-token": token },
        });
        toast.success("PO updated.");
        setManualEdit(false);
        onSuccess?.({ created: false, updated: true, status: statusNow });
        return;
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.msg || "Failed to update PO");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (submitAction === "confirm_order") {
      if (!canConfirm) {
        toast.error("Confirm is available only after approval is done.");
        return;
      }
      if (!formData.po_number) {
        toast.error("PO Number is required to confirm this PO.");
        return;
      }

      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        await Axios.put(
          "/updateStatusPO",
          {
            id: formData.po_number,
            status: "po_created",
            remarks: "",
            new_po_number: formData.po_number,
          },
          { headers: { "x-auth-token": token } }
        );

        toast.success("PO confirmed.");
        onSuccess?.({ created: false, updated: true, status: "po_created" });
        return onClose ? onClose() : navigate("/purchase-order");
      } catch (err) {
        console.error("Confirm error:", err);
        toast.error("Failed to confirm PO");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ---------- CREATE ----------
    if (effectiveMode === "create" || fromModal) {
      if (!formData.name) return toast.error("Vendor is required.");
      if (!formData.date) return toast.error("PO Date is required.");
      if (!hasValidLine) {
        return toast.error("Add at least one valid product row.");
      }
      if (submitAction === "confirm_order" && !formData.po_number) {
        return toast.error("PO Number is required to confirm the order.");
      }

      setIsSubmitting(true);
      try {
        const user = getUserData();
        if (!user?.name) throw new Error("No user");

        const token = localStorage.getItem("authToken");
        const initial_status =
          submitAction === "send_approval" ? "po_approval" : "po_created";

        const dataToPost = {
          p_id: formData.p_id,
          po_number:
            submitAction === "send_approval" ? undefined : formData.po_number,
          vendor: formData.name,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          submitted_By: user.name,
          pr_id,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
          initial_status,
        };

        const resp = await Axios.post("/Add-purchase-ordeR-IT", dataToPost, {
          headers: { "x-auth-token": token },
        });

        const createdId = resp?.data?.newPO?._id;
        if (createdId) localStorage.setItem("lastPOApprovalId", createdId);

        toast.success(
          submitAction === "send_approval"
            ? "PO sent for approval."
            : "PO created."
        );
        onSuccess?.({
          created: true,
          updated: submitAction === "confirm_order",
          status: initial_status,
        });
        return onClose ? onClose() : navigate("/purchase-order");
      } catch (error) {
        const msg = error?.response?.data?.message;
        const statusCode = error?.response?.status;
        if (statusCode === 400 && msg === "PO Number already used!") {
          toast.error("PO Number already used. Please enter a unique one.");
        } else {
          console.error("Error posting PO:", error);
          toast.error("Something went wrong. Please check your connection.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await Axios.put(
        "/updateStatusPO",
        {
          id: _id,
          status: "approval_done",
          remarks: "Approved by CAM",
        },
        { headers: { "x-auth-token": token } }
      );
      toast.success("PO Approved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    }
  };

  const handleRefuse = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await Axios.put(
        "/updateStatusPO",
        {
          id: _id || poNumberQ,
          status: "approval_rejected",
          remarks: remarks,
        },
        { headers: { "x-auth-token": token } }
      );
      toast.success("PO Refused");
      setOpenRefuse(false);
      setRemarks("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to refuse");
    }
  };

  const user = getUserData();

  // -------- vendor options --------
  const vendorOptions = [
    ...(formData.name && !vendorRows.some((v) => v.name === formData.name)
      ? [{ value: formData.name, label: formData.name }]
      : []),
    ...vendorRows.map((v) => ({
      value: v.name,
      label: v.name,
      _raw: v,
    })),
    { value: SEARCH_MORE_VENDOR, label: "Search more…" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        p: 3,
      }}
    >
      {/* Card container */}
      <Box
        sx={{
          maxWidth: 1200,
          width: "100%",
          p: 3,
          boxShadow: "md",
          borderRadius: "lg",
          bgcolor: "background.surface",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {viewMode
              ? "View Purchase Order"
              : effectiveMode === "edit"
                ? "Edit Purchase Order"
                : "Purchase Order"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {/* Create flow buttons (optional keep) */}
            {!viewMode && (effectiveMode === "create" || fromModal || (effectiveMode === "edit" && statusNow === "approval_rejected")) && (
              <>
                <Button
                  variant="solid"
                  startDecorator={<Send />}
                  sx={{
                    bgcolor: "#214b7b",
                    color: "#fff",
                    "&:hover": { bgcolor: "#163553" },
                  }}
                  disabled={isSubmitting}
                  onClick={() => {
                    setSubmitAction("send_approval");
                    const form = document.getElementById("po-form");
                    if (form) form.requestSubmit();
                  }}
                >
                  Send Approval
                </Button>

                <Button
                  variant="outlined"
                  startDecorator={<ConfirmationNumber />}
                  sx={{
                    borderColor: "#214b7b",
                    color: "#214b7b",
                    "&:hover": {
                      bgcolor: "rgba(33, 75, 123, 0.1)",
                      borderColor: "#163553",
                      color: "#163553",
                    },
                  }}
                  disabled={isSubmitting}
                  onClick={() => {
                    setSubmitAction("confirm_order");
                    const form = document.getElementById("po-form");
                    if (form) form.requestSubmit();
                  }}
                >
                  Confirm Order
                </Button>
              </>
            )}
            {!viewMode && effectiveMode === "edit" && isApprovalPending || approvalRejected && (
              <Box display="flex" gap={2}>
                <Box>
                  <Button
                    variant={manualEdit ? "outlined" : "solid"}
                    color={manualEdit ? "neutral" : "primary"}
                    onClick={() => setManualEdit((s) => !s)}
                    sx={{ width: "fit-content" }}
                  >
                    {manualEdit ? "Cancel Edit" : "Edit"}
                  </Button>
                </Box>

                {(user?.department === "CAM" ||
                  user?.name === "Sushant Ranjan Dubey" ||
                  user?.name === "Sanjiv Kumar" ||
                  user?.name === "IT Team") && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="solid"
                      color="success"
                      sx={{ minWidth: 100 }}
                      startDecorator={<Check />}
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="danger"
                      sx={{ minWidth: 100 }}
                      startDecorator={<Close />}
                      onClick={() => setOpenRefuse(true)}
                    >
                      Refuse
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Confirm Order only when approval_done */}
            {!viewMode && effectiveMode === "edit" && canConfirm && (
              <Button
                variant="outlined"
                startDecorator={<ConfirmationNumber />}
                sx={{
                  borderColor: "#214b7b",
                  color: "#214b7b",
                  "&:hover": {
                    bgcolor: "rgba(33, 75, 123, 0.1)",
                    borderColor: "#163553",
                    color: "#163553",
                  },
                }}
                disabled={isSubmitting}
                onClick={() => {
                  setSubmitAction("confirm_order");
                  const form = document.getElementById("po-form");
                  if (form) form.requestSubmit();
                }}
              >
                Confirm Order
              </Button>
            )}

            <Button
              variant="soft"
              startDecorator={<Print />}
              sx={{
                bgcolor: "rgba(33, 75, 123, 0.1)",
                color: "#214b7b",
                "&:hover": { bgcolor: "rgba(33, 75, 123, 0.2)" },
              }}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Optional tags */}
        {Array.isArray(categoryNames) && categoryNames.length > 0 && (
          <Box sx={{ mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {categoryNames.map((c) => (
              <Chip key={c} color="primary" variant="soft" size="sm">
                {c}
              </Chip>
            ))}
          </Box>
        )}

        {/* PO Number */}
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" fontWeight="lg" sx={{ mb: 0.5 }}>
            PO Number
          </Typography>
          <Input
            name="po_number"
            value={formData.po_number}
            onChange={handleChange}
            placeholder="e.g. PO-0001"
            variant="plain"
            disabled={inputsDisabled}
            sx={{
              "--Input-minHeight": "52px",
              fontSize: 28,
              px: 0,
              color: "#607d8b",
              "--Input-focusedHighlight": "transparent",
              "--Input-focusedThickness": "0px",
              "&:focus-within": {
                boxShadow: "none",
                borderBottomColor: "#163553",
              },
              "& .MuiInput-root": { boxShadow: "none" },
              "& input": { outline: "none" },
              borderBottom: "2px solid #214b7b",
              borderRadius: 0,
              "&:hover": { borderBottomColor: "#163553" },
              "& input::placeholder": { color: "#9aa8b5", opacity: 1 },
            }}
          />
        </Box>

        {/* Form */}
        <form id="po-form" onSubmit={handleSubmit}>
          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 1.5 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={12} md={4}>
                <Typography level="body1" fontWeight="bold" mb={0.5}>
                  Project Code
                </Typography>
                <Input disabled value={formData.project_code} />
              </Grid>

              {/* Vendor */}
              <Grid xs={12} md={4}>
                <Typography level="body1" fontWeight="bold" mb={0.5}>
                  Vendor
                </Typography>
                <Select
                  styles={{
                    control: (base) => ({ ...base, minHeight: 40 }),
                    dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                    valueContainer: (base) => ({ ...base, padding: "0 6px" }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                  isClearable
                  isLoading={vendorsLoading}
                  onInputChange={(input, meta) => {
                    if (meta.action === "input-change") {
                      setVendorSearch(input);
                      setVendorPage(1);
                    }
                  }}
                  filterOption={() => true} // server-filtered
                  options={vendorOptions}
                  value={
                    formData.name
                      ? { value: formData.name, label: formData.name }
                      : null
                  }
                  onChange={handleVendorChange}
                  placeholder="Search vendor"
                  noOptionsMessage={() =>
                    vendorsLoading ? "Loading…" : "No vendors"
                  }
                  isDisabled={inputsDisabled}
                />
              </Grid>

              <Grid xs={12} md={4}>
                <Typography level="body1" fontWeight="bold" mb={0.5}>
                  PO Date
                </Typography>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={inputsDisabled}
                />
              </Grid>
            </Grid>
          </Sheet>

          {/* Product Table */}
          <Sheet
            variant="outlined"
            sx={{ p: 2, borderRadius: "xl", mb: 2, overflow: "hidden" }}
          >
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <Chip color="primary" variant="soft" size="sm">
                Products
              </Chip>
            </Box>

            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                "& th, & td": {
                  borderBottom:
                    "1px solid var(--joy-palette-neutral-outlinedBorder)",
                  p: 1,
                  textAlign: "left",
                  verticalAlign: "middle",
                },
                "& th": { fontWeight: 700, bgcolor: "background.level1" },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>Product</th>
                  <th style={{ width: "12%" }}>Category</th>
                  <th style={{ width: "14%" }}>Make</th>
                  <th style={{ width: "10%" }}>Qty</th>
                  <th style={{ width: "14%" }}>Unit Price</th>
                  <th style={{ width: "10%" }}>Taxes</th>
                  <th style={{ width: "14%" }}>Amount</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const base =
                    Number(l.quantity || 0) * Number(l.unitPrice || 0);
                  const taxAmt = (base * Number(l.taxPercent || 0)) / 100;
                  const gross = base + taxAmt;

                  return (
                    <tr key={l.id}>
                      <td>
                        <Input
                          size="sm"
                          variant="plain"
                          placeholder="Product name"
                          value={l.productName}
                          onChange={(e) =>
                            updateLine(l.id, "productName", e.target.value)
                          }
                          disabled
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          variant="plain"
                          placeholder="Category"
                          value={l.productCategoryName}
                          onChange={(e) =>
                            updateLine(
                              l.id,
                              "productCategoryName",
                              e.target.value
                            )
                          }
                          disabled
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          variant="plain"
                          placeholder="Make"
                          value={l.make}
                          onChange={(e) =>
                            updateLine(l.id, "make", e.target.value)
                          }
                          disabled={inputsDisabled}
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          type="number"
                          variant="plain"
                          value={l.quantity}
                          onChange={(e) =>
                            updateLine(l.id, "quantity", e.target.value)
                          }
                          slotProps={{ input: { min: 0, step: "1" } }}
                          disabled={inputsDisabled}
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          type="number"
                          variant="plain"
                          value={l.unitPrice}
                          onChange={(e) =>
                            updateLine(l.id, "unitPrice", e.target.value)
                          }
                          slotProps={{ input: { min: 0, step: "0.01" } }}
                          disabled={inputsDisabled}
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          type="number"
                          variant="plain"
                          value={l.taxPercent}
                          onChange={(e) =>
                            updateLine(l.id, "taxPercent", e.target.value)
                          }
                          slotProps={{ input: { min: 0, step: "0.01" } }}
                          disabled={inputsDisabled}
                        />
                      </td>
                      <td>
                        <Typography level="body-sm" fontWeight="lg">
                          ₹{" "}
                          {gross.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </td>
                      <td>
                        {isApprovalPending && manualEdit && (
                          <IconButton
                            variant="plain"
                            color="danger"
                            onClick={() => removeLine(l.id)}
                          >
                            <DeleteOutline />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Box>

            {isApprovalPending && manualEdit && (
              <Box
                sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}
              >
                <Button variant="plain" size="sm" onClick={addLine}>
                  Add a product
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Totals */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Sheet
                variant="soft"
                sx={{ borderRadius: "lg", p: 2, minWidth: 320 }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    rowGap: 0.5,
                    columnGap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-sm" textColor="text.tertiary">
                    Untaxed Amount:
                  </Typography>
                  <Typography level="body-sm" fontWeight="lg">
                    ₹{" "}
                    {amounts.untaxed.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>

                  <Typography level="body-sm">Tax:</Typography>
                  <Typography level="body-sm" fontWeight={700}>
                    ₹ {amounts.tax.toFixed(2)}
                  </Typography>

                  <Typography level="title-md" sx={{ mt: 0.5 }}>
                    Total:
                  </Typography>
                  <Typography level="title-md" fontWeight="xl" sx={{ mt: 0.5 }}>
                    ₹{" "}
                    {amounts.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Sheet>
            </Box>
          </Sheet>

          {/* Bottom buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            {isApprovalPending && manualEdit && (
              <Button
                variant="solid"
                loading={isSubmitting}
                onClick={() => {
                  setSubmitAction("edit_save");
                  const form = document.getElementById("po-form");
                  if (form) form.requestSubmit();
                }}
              >
                Save changes
              </Button>
            )}

            <Button
              variant="soft"
              startDecorator={<RestartAlt />}
              sx={{
                borderColor: "#214b7b",
                color: "#214b7b",
                "&:hover": {
                  bgcolor: "rgba(33, 75, 123, 0.1)",
                  borderColor: "#163553",
                  color: "#163553",
                },
              }}
              onClick={() =>
                onClose ? onClose() : navigate("/purchase-order")
              }
            >
              Back
            </Button>
          </Box>
        </form>
      </Box>

      {/* Vendor Search More Modal */}
      <SearchPickerModal
        open={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onPick={onPickVendor}
        title="Search: Vendor"
        columns={vendorColumns}
        fetchPage={fetchVendorsPage}
        searchKey="name"
        pageSize={VENDOR_LIMIT}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      <Modal open={openRefuse} onClose={() => setOpenRefuse(false)}>
        <ModalDialog>
          <Typography level="h5">Refuse Purchase Order</Typography>
          <Textarea
            minRows={3}
            placeholder="Enter refusal remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <Button color="danger" onClick={handleRefuse}>
            Submit Refuse
          </Button>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AddPurchaseOrder;
