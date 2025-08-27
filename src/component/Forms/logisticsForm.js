// src/components/AddLogisticForm.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  FormControl,
  FormLabel,
  Button,
  Textarea,
  Card,
  Divider,
  Sheet,
  Chip,
  IconButton,
  Modal,
  ModalDialog,
  ModalClose,
  Link,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CloudUpload from "@mui/icons-material/CloudUpload";
import UploadFile from "@mui/icons-material/UploadFile";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";
import OpenInNew from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";

import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import {
  useAddLogisticMutation,
  useGetPoBasicQuery,
  useLazyGetPoBasicQuery,
  useGetLogisticByIdQuery,
  useUpdateLogisticMutation,
} from "../../redux/purchasesSlice";
import SearchPickerModal from "../SearchPickerModal";

/* ---------------- constants (match Inspection UX) ---------------- */
const ATTACH_ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");
const MAX_FILE_MB = 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

/* ---------------- helpers ---------------- */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

const AddLogisticForm = () => {
  const [formData, setFormData] = useState({
    po_id: [],
    project_code: "",
    vendor: "",
    vehicle_number: "",
    driver_number: "",
    total_ton: "",
    total_transport_po_value: 0,
    attachment_url: "",
    description: "",
  });

  const [items, setItems] = useState([
    {
      po_id: "",
      po_item_id: null,
      po_number: "",
      project_id: "",
      vendor: "",
      received_qty: "",
      product_name: "",
      category_id: null,
      category_name: "",
      product_make: "",
      uom: "",
      quantity_requested: "",
      quantity_po: "",
      ton: "",
    },
  ]);

  const [totalWeight, setTotalWeight] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);

  // old file chips for "create" flow (kept for add mode submit)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  // ---- Upload modal (mirrors Inspection) ----
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadRemarks, setUploadRemarks] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [hasUploadedOnce, setHasUploadedOnce] = useState(false); // disable after one upload

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const urlMode = (searchParams.get("mode") || "").toLowerCase();
  const logisticId = searchParams.get("id") || null;
  const pathDefaultMode =
    location.pathname === "/logistics-form"
      ? logisticId
        ? "edit"
        : "add"
      : "add";

  const mode = (urlMode || pathDefaultMode).toLowerCase();
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const canShow = user?.department === "Logistic" || user?.role === "superadmin";

  useEffect(() => {
    const sum = items.reduce(
      (acc, item) => acc + (parseFloat(item.ton) || 0),
      0
    );
    setTotalWeight(sum);
  }, [items]);

  const { data: poData, isLoading: poLoading } = useGetPoBasicQuery({
    page: 1,
    pageSize: 7,
    search: "",
  });

  const [addLogistic, { isLoading }] = useAddLogisticMutation();
  const [updateLogistic, { isLoading: isUpdating }] =
    useUpdateLogisticMutation();

  const {
    data: byIdData,
    refetch: refetchLogistic,
  } = useGetLogisticByIdQuery(logisticId, {
    skip: !logisticId || isAdd,
  });

  // existing attachments + optional history (if backend sends it)
  const existingAttachments = useMemo(() => {
    const a = byIdData?.data?.attachment_url;
    if (Array.isArray(a)) return a.filter(Boolean);
    if (typeof a === "string" && a) return [a];
    return [];
  }, [byIdData]);

  const uploadHistory = useMemo(() => {
    const h = byIdData?.data?.upload_history;
    return Array.isArray(h) ? h : [];
  }, [byIdData]);

  const disableUpload =
    isView || hasUploadedOnce || existingAttachments.length > 0;

  // Prefill in edit/view
  useEffect(() => {
    if (!byIdData?.data || !(isEdit || isView)) return;
    const doc = byIdData.data;

    setFormData((prev) => ({
      ...prev,
      vehicle_number: doc.vehicle_number || "",
      vendor: doc.vendor || prev.vendor || "",
      driver_number: doc.driver_number || "",
      attachment_url: "", // UI message only; server manages attachment_url array
      description: doc.description || "",
      total_ton: doc.total_ton || "",
      total_transport_po_value: Number(doc.total_transport_po_value || 0),
    }));

    const poIds = Array.isArray(doc.po_id)
      ? doc.po_id
          .map((p) => (typeof p === "string" ? p : p?._id))
          .filter(Boolean)
      : [];

    const idToName = {};
    const pos = {};
    (doc.po_id || []).forEach((p) => {
      if (p && typeof p === "object" && p._id) {
        idToName[p._id] = p.po_number || String(p._id);
        pos[p._id] = p;
      }
    });
    setTransportation(poIds);
    setTransportationIdToName(idToName);
    setTransportationPos((prev) => ({ ...prev, ...pos }));

    // Items table
    const mappedItems = Array.isArray(doc.items)
      ? doc.items.map((it) => ({
          po_id:
            typeof it.material_po === "object"
              ? it.material_po?._id || ""
              : it.material_po || "",
          po_item_id: it.po_item_id || null,
          po_number:
            typeof it.material_po === "object"
              ? it.material_po?.po_number || ""
              : "",
          project_id: "",
          vendor: "",
          product_name: it.product_name || "",
          category_id:
            typeof it.category_id === "object"
              ? it.category_id?._id || null
              : it.category_id ?? null,
          category_name: it?.category_name || it?.category_id?.name || "",
          product_make: it.product_make || "",
          uom: it.uom || "",
          quantity_requested: it.quantity_requested || "",
          quantity_po: it.quantity_po || "",
          received_qty: it.received_qty || "",
          ton: it.weight || "",
        }))
      : [];

    setItems(
      mappedItems.length
        ? mappedItems
        : [
            {
              po_id: "",
              po_item_id: null,
              po_number: "",
              project_id: "",
              vendor: "",
              received_qty: "",
              product_name: "",
              category_id: null,
              category_name: "",
              product_make: "",
              uom: "",
              quantity_requested: "",
              quantity_po: "",
              ton: "",
            },
          ]
    );

    setVehicleCost(Number(doc.total_transport_po_value || 0));
    const sumWeight = mappedItems.reduce(
      (acc, r) => acc + (parseFloat(r.ton) || 0),
      0
    );
    setTotalWeight(sumWeight);
  }, [byIdData, isEdit, isView]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // keep your old multi-file picker for "create" submit
  const onFileInput = (e) => {
    const files = Array.from(e.target?.files || []);
    setSelectedFiles(files);
    setFormData((p) => ({
      ...p,
      attachment_url: files.length ? `${files.length} file(s) selected` : "",
    }));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setFormData((p) => ({ ...p, attachment_url: "" }));
    setFileInputKey((k) => k + 1);
  };

  const removeOneFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        po_id: "",
        po_number: "",
        project_id: "",
        vendor: "",
        product_name: "",
        category_id: null,
        category_name: "",
        product_make: "",
        uom: "",
        quantity_requested: "",
        quantity_po: "",
        received_qty: "",
        ton: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Transportation state
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [transportation, setTransportation] = useState([]);
  const [transportationIdToName, setTransportationIdToName] = useState({});
  const [itemPoModalOpen, setItemPoModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [transportationPos, setTransportationPos] = useState({});

  const transportationColumns = [
    { key: "po_number", label: "PO Number", width: 200 },
    { key: "vendor", label: "Vendor", width: 250 },
    { key: "po_value", label: "PO Value", width: 150 },
  ];

  const onPickTransportation = (row) => {
    if (!row?._id || isView) return;

    setTransportation((prev) =>
      prev.includes(row._id) ? prev : [...prev, row._id]
    );

    setTransportationIdToName((prev) => ({
      ...prev,
      [row._id]: row.po_number || String(row._id),
    }));

    setTransportationPos((prev) => ({
      ...prev,
      [row._id]: row,
    }));

    setFormData((prev) => ({
      ...prev,
      vendor: row.vendor || prev.vendor,
    }));
  };

  const itemPoColumns = [
    { key: "po_number", label: "PO Number", width: 200 },
    { key: "vendor", label: "Vendor", width: 200 },
    { key: "project_code", label: "Project Code", width: 150 },
  ];

  const [triggerItemPoSearch] = useLazyGetPoBasicQuery();
  const [triggerTransportationSearch] = useLazyGetPoBasicQuery();

  const fetchItemPoPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const res = await triggerItemPoSearch({ search, page, pageSize }, true);
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.total ?? d?.pagination?.total ?? 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const fetchTransportationPage = async ({
    search = "",
    page = 1,
    pageSize = 7,
  }) => {
    const res = await triggerTransportationSearch(
      { search, page, pageSize },
      true
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.total ?? d?.pagination?.total ?? 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  useEffect(() => {
    if (transportation.length === 0) {
      setVehicleCost(0);
      return;
    }
    const total = transportation.reduce((acc, id) => {
      const po =
        transportationPos[id] || poData?.data?.find((p) => p._id === id);
      return acc + (parseFloat(po?.po_value) || 0);
    }, 0);
    setVehicleCost(total);
  }, [transportation, poData, transportationPos]);

  // ------- submit (create / edit) -------
  const buildUpdateFormData = (payload, files) => {
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload)); // backend parses req.body.data
    for (const f of files || []) if (f) fd.append("files", f);
    return fd;
  };

  // new: upload-only formdata for modal
  const buildUploadFormData = (files, meta = {}) => {
    const fd = new FormData();
    for (const f of files || []) if (f) fd.append("files", f);
    fd.append("meta", JSON.stringify(meta)); // e.g. { upload_remarks: "..." }
    // Optionally include an action hint if your backend wants it:
    // fd.append("action", "append_attachments");
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedItems = items.map((i) => ({
        material_po: i.po_id,
        po_item_id: i.po_item_id || null,
        category_id: i.category_id ?? null,
        product_name: i.product_name,
        product_make: i.product_make,
        uom: i.uom || "",
        quantity_requested: String(i.quantity_requested || ""),
        received_qty: String(i.received_qty || ""),
        quantity_po: String(i.quantity_po || ""),
        weight: String(i.ton || ""),
      }));

      const payload = {
        po_id: transportation,
        vehicle_number: formData.vehicle_number,
        driver_number: formData.driver_number,
        total_ton: String(totalWeight),
        total_transport_po_value: String(vehicleCost),
        attachment_url: formData.attachment_url, // server ignores/controls this
        description: formData.description,
        items: normalizedItems,
      };

      if (isEdit && logisticId) {
        const { attachment_url, ...rest } = payload;
        const fd = buildUpdateFormData(rest, selectedFiles);
        await updateLogistic({ id: logisticId, body: fd }).unwrap();
        toast.success("Logistic updated successfully");
      } else {
        await addLogistic(payload).unwrap();
        toast.success("Logistic entry created successfully");
      }

      handleReset();
    } catch (err) {
      console.error("Failed to submit logistic:", err);
      toast.error(
        isEdit ? "Failed to update logistic" : "Failed to create logistic"
      );
    }
  };

  const handleReset = () => {
    setFormData({
      po_id: [],
      project_code: "",
      vendor: "",
      vehicle_number: "",
      driver_number: "",
      total_ton: "",
      total_transport_po_value: 0,
      attachment_url: "",
      description: "",
    });
    setItems([
      {
        po_id: "",
        po_item_id: null,
        po_number: "",
        project_id: "",
        vendor: "",
        product_name: "",
        category_id: null,
        category_name: "",
        product_make: "",
        uom: "",
        quantity_requested: "",
        quantity_po: "",
        received_qty: "",
        ton: "",
      },
    ]);
    setTransportation([]);
    setTransportationIdToName({});
    setTotalWeight(0);
    setVehicleCost(0);
    setSelectedFiles([]);
    setFileInputKey((k) => k + 1);
    setHasUploadedOnce(false);
  };

  /* ---------------- Upload Modal handlers (like Inspection) ---------------- */
  const addUploadFiles = (list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    const next = [];
    let err = "";

    picked.forEach((f) => {
      if (f.size > MAX_FILE_BYTES) {
        err = `File "${f.name}" exceeds ${MAX_FILE_MB} MB.`;
        return;
      }
      if (!ATTACH_ACCEPT.split(",").includes(f.type)) {
        err = `File "${f.name}" type not allowed.`;
        return;
      }
      next.push(f);
    });

    if (err) setFileError(err);
    setUploadFiles((prev) => [...prev, ...next]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    addUploadFiles(e.dataTransfer.files);
  };

  const onBrowse = (e) => {
    addUploadFiles(e.target.files);
    e.target.value = "";
  };

  const removeUploadFile = (idx) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadDocs = async () => {
    if (!logisticId) return;
    if (!uploadFiles.length) {
      setFileError("Please add at least one file.");
      return;
    }
    try {
      const fd = buildUploadFormData(uploadFiles, {
        upload_remarks: uploadRemarks || "",
      });
      await updateLogistic({ id: logisticId, body: fd }).unwrap();

      setHasUploadedOnce(true); // disable further uploads (per requirement)
      setUploadOpen(false);
      setUploadFiles([]);
      setUploadRemarks("");
      setFileError("");
      await refetchLogistic();
      toast.success("Documents uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
      setFileError(err?.data?.message || "Failed to upload documents");
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        ml: { xs: "0%", lg: "22%" },
        boxShadow: "md",
      }}
    >
      <Typography level="h3" fontWeight="lg" mb={2}>
        Logistic Form
      </Typography>
      <Chip
        variant="soft"
        color={isAdd ? "success" : isEdit ? "warning" : "neutral"}
        sx={{ mb: 2 }}
      >
        {mode.toUpperCase()}
      </Chip>

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Transportation PO Number</FormLabel>
                <Select
                  placeholder="Search or pick PO numbers"
                  options={[
                    ...(poData?.data || []).map((po) => ({
                      label: po.po_number,
                      value: po._id,
                    })),
                    { label: "Search more...", value: "__search_more__" },
                  ]}
                  value={transportation.map((id) => {
                    const po =
                      transportationPos[id] ||
                      poData?.data?.find((p) => p._id === id);
                    return {
                      value: id,
                      label: po?.po_number || transportationIdToName[id] || id,
                    };
                  })}
                  isMulti
                  isLoading={poLoading}
                  isDisabled={isView}
                  onChange={(selected) => {
                    if (isView) return;

                    if (selected.some((s) => s.value === "__search_more__")) {
                      setTransportationModalOpen(true);
                      return;
                    }

                    setTransportation(selected.map((s) => s.value));
                    setTransportationIdToName((prev) => {
                      const map = { ...prev };
                      selected.forEach((s) => {
                        if (s.value !== "__search_more__") {
                          map[s.value] = s.label;
                        }
                      });
                      return map;
                    });

                    if (selected.length > 0) {
                      const firstPo = poData?.data?.find(
                        (p) => p._id === selected[0].value
                      );
                      if (firstPo) {
                        setFormData((prev) => ({
                          ...prev,
                          vendor: firstPo.vendor,
                        }));
                      }
                    }
                  }}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Vendor</FormLabel>
                <Input
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="Auto-filled"
                  readOnly
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Vehicle Number</FormLabel>
                <Input
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="RJ14-AB-5678"
                  required
                  disabled={isView}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Driver Number</FormLabel>
                <Input
                  name="driver_number"
                  value={formData.driver_number}
                  onChange={handleChange}
                  placeholder="9876543211"
                  required
                  disabled={isView}
                />
              </FormControl>
            </Grid>

            {/* ---------- Attachments & Upload (Inspection-style) ---------- */}
            <Grid xs={12}>
              <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip variant="soft" size="sm" startDecorator={<InsertDriveFile />}>
                      Attachments
                    </Chip>
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      {existingAttachments.length}
                    </Typography>
                  </Box>

                  {canShow && isEdit && (
                    <Button
                      size="sm"
                      variant="soft"
                      startDecorator={<CloudUpload />}
                      onClick={() => setUploadOpen(true)}
                      title={
                        disableUpload
                          ? "Upload disabled: already uploaded once"
                          : ""
                      }
                    >
                      Upload Documents
                    </Button>
                  )}
                </Box>

                {existingAttachments.length ? (
                  <Box sx={{ display: "grid", gap: 0.5 }}>
                    {existingAttachments.map((url, i) => (
                      <Box
                        key={`${url}-${i}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 0.5,
                          borderBottom:
                            "1px dashed var(--joy-palette-neutral-outlinedBorder)",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <InsertDriveFile fontSize="sm" />
                        <Typography
                          level="body-sm"
                          component={Link}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                        >
                          {url.split("/").pop() || `Attachment ${i + 1}`} <OpenInNew />
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                    No attachments.
                  </Typography>
                )}
              </Sheet>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <Chip color="primary" variant="soft" size="sm">
                Products
              </Chip>
            </Box>

            <Box
              component="table"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "separate",
                borderSpacing: 0,
                "& th, & td": {
                  borderBottom:
                    "1px solid var(--joy-palette-neutral-outlinedBorder)",
                  p: 1,
                  textAlign: "left",
                  verticalAlign: "top",
                },
                "& th": { fontWeight: 700, bgcolor: "background.level1" },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>PO Number</th>
                  <th style={{ width: "12%" }}>Project ID</th>
                  <th style={{ width: "10%" }}>Vendor</th>
                  <th style={{ width: "15%" }}>Category</th>
                  <th style={{ width: "15%" }}>Product</th>
                  <th style={{ width: "10%" }}>Make</th>
                  <th style={{ width: "10%" }}>Qty</th>
                  {canShow && <th style={{ width: "12%" }}>Quantity Received</th>}
                  <th style={{ width: "10%" }}>UoM</th>
                  <th style={{ width: "10%" }}>Weight (Ton)</th>
                  <th style={{ width: "60px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <Select
                        variant="plain"
                        sx={{
                          width: "100%",
                          border: "none",
                          boxShadow: "none",
                          bgcolor: "transparent",
                          p: 0,
                        }}
                        placeholder="Select PO"
                        options={[
                          ...(poData?.data || []).map((po) => ({
                            label: po.po_number || "(No PO)",
                            value: po._id,
                            po,
                          })),
                          { label: "Search more...", value: "__search_more__" },
                        ]}
                        value={
                          item.po_id
                            ? {
                                value: item.po_id,
                                label:
                                  poData?.data?.find((po) => po._id === item.po_id)
                                    ?.po_number || item.po_number || "(No PO)",
                              }
                            : null
                        }
                        isDisabled={isView}
                        onChange={(selected) => {
                          if (!selected || isView) return;
                          if (selected.value === "__search_more__") {
                            setActiveItemIndex(idx);
                            setItemPoModalOpen(true);
                            return;
                          }

                          const { po } = selected;
                          if (!po) return;

                          const productItems =
                            Array.isArray(po.items) && po.items.length > 0
                              ? po.items
                              : [{}];

                          setItems((prev) => {
                            const copy = [...prev];

                            copy.splice(
                              idx,
                              1,
                              ...productItems.map((prod) => ({
                                po_id: po._id,
                                po_item_id: prod?._id || null,
                                category_id: prod?.category?._id || null,

                                po_number: po.po_number,
                                project_id: po.p_id,
                                vendor: po.vendor || "",
                                category_name: prod?.category?.name || "",
                                uom: prod?.uom || "",

                                product_name: prod?.product_name || "",
                                product_make: prod?.make || "",
                                quantity_requested: prod?.quantity || "",
                                quantity_po: "",
                                received_qty: "",
                                ton: "",
                              }))
                            );
                            return copy;
                          });

                          setFormData((prev) => ({
                            ...prev,
                            project_code: po.p_id,
                          }));
                        }}
                      />
                    </td>

                    <td>
                      <Input variant="plain" placeholder="Project Id" value={item.project_id || ""} readOnly />
                    </td>
                    <td>
                      <Input variant="plain" placeholder="Vendor" value={item.vendor || ""} readOnly />
                    </td>
                    <td>
                      <Input variant="plain" placeholder="Category" value={item.category_name} readOnly />
                    </td>
                    <td>
                      <Input variant="plain" placeholder="Product Name" value={item.product_name} readOnly />
                    </td>
                    <td>
                      <Input variant="plain" placeholder="Make" value={item.product_make} readOnly />
                    </td>
                    <td>
                      <Input
                        variant="plain"
                        placeholder="Quantity"
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity_requested ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity_requested", e.target.value)
                        }
                        disabled={isView}
                      />
                    </td>
                    {canShow && (
                      <td>
                        <Input
                          variant="plain"
                          placeholder="Quantity Received"
                          type="number"
                          value={item.received_qty || ""}
                          onChange={(e) =>
                            handleItemChange(idx, "received_qty", e.target.value)
                          }
                          disabled={isView}
                        />
                      </td>
                    )}
                    <td>
                      <Input variant="plain" placeholder="UoM" value={item.uom} readOnly />
                    </td>
                    <td>
                      <Input
                        value={item.ton}
                        variant="plain"
                        type="number"
                        placeholder="Ton"
                        onChange={(e) => handleItemChange(idx, "ton", e.target.value)}
                        disabled={isView}
                      />
                    </td>
                    <td>
                      <IconButton
                        size="sm"
                        color="danger"
                        disabled={isView}
                        onClick={() => {
                          if (isView) return;
                          if (window.confirm("Are you sure you want to delete this row?")) {
                            removeItemRow(idx);
                            toast.success("Row deleted successfully");
                          } else {
                            toast.info("Delete cancelled");
                          }
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>

            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              {!isView && (
                <Button size="sm" variant="plain" onClick={addItemRow}>
                  Add a Product
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Description…
            </Typography>
            <Textarea
              minRows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write Description of Logistic"
              disabled={isView}
              readOnly={isView}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Sheet variant="soft" sx={{ borderRadius: "lg", p: 2, minWidth: 280 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    rowGap: 0.5,
                    columnGap: 1.5,
                  }}
                >
                  <Typography level="body-sm">Transport PO Total:</Typography>
                  <Typography level="body-sm" fontWeight={700}>
                    {vehicleCost > 0 ? vehicleCost.toFixed(2) : "—"}
                  </Typography>

                  <Typography level="body-sm">Total Weight (Ton):</Typography>
                  <Typography level="body-sm" fontWeight={700}>
                    {totalWeight.toFixed(2)}
                  </Typography>
                </Box>
              </Sheet>
            </Box>
          </Sheet>

          <Divider sx={{ my: 3 }} />

          {/* Keep your "create" file picker if you still want to send files on initial create */}
          {!isEdit && canShow && (
            <Box sx={{ mb: 2 }}>
              <FormControl>
                <FormLabel>Attachment(s) (Create only)</FormLabel>
                <Button component="label" variant="soft" startDecorator={<CloudUpload />} sx={{ width: "fit-content" }}>
                  Upload files
                  <input
                    key={fileInputKey}
                    hidden
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onClick={(e) => { e.target.value = ""; }}
                    onChange={onFileInput}
                    disabled={isView}
                  />
                </Button>

                {selectedFiles.length > 0 ? (
                  <Box sx={{ mt: 1, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {selectedFiles.map((f, idx) => (
                      <Chip
                        key={idx}
                        variant="soft"
                        startDecorator={<InsertDriveFile />}
                        endDecorator={
                          <IconButton
                            type="button"
                            variant="plain"
                            size="sm"
                            aria-label="Remove file"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isView) return;
                              removeOneFile(idx);
                            }}
                            disabled={isView}
                          >
                            ✕
                          </IconButton>
                        }
                        sx={{ mt: 1, maxWidth: "100%" }}
                        title={f.name}
                      >
                        {f.name}
                      </Chip>
                    ))}
                    <Button size="sm" variant="plain" color="danger" onClick={clearAllFiles} disabled={isView}>
                      Clear all
                    </Button>
                  </Box>
                ) : (
                  <Typography level="body-xs" sx={{ mt: 0.75, color: "neutral.plainColor" }}>
                    Supported: PDF, DOCX, PNG, JPG, WEBP (max ~25MB each)
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between">
            {!isView && (
              <Button type="button" variant="outlined" color="neutral" onClick={handleReset}>
                Reset
              </Button>
            )}

            <Button type="submit" variant="solid" color="primary" disabled={isLoading || isUpdating || isView}>
              {isView
                ? "View Only"
                : isEdit
                ? isUpdating
                  ? "Updating..."
                  : "Update Logistic"
                : isLoading
                ? "Submitting..."
                : "Submit Logistic"}
            </Button>
          </Box>
        </form>
      </Card>

      {/* Transportation search modal */}
      <SearchPickerModal
        open={transportationModalOpen}
        onClose={() => setTransportationModalOpen(false)}
        onPick={onPickTransportation}
        title="Search: Transportation PO"
        columns={transportationColumns}
        fetchPage={fetchTransportationPage}
        searchKey="po_number"
        pageSize={7}
        multi
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* Item PO picker */}
      <SearchPickerModal
        open={itemPoModalOpen}
        onClose={() => setItemPoModalOpen(false)}
        onPick={(po) => {
          if (!po?._id || activeItemIndex === null || isView) return;

          const firstProduct = po.items?.[0] || {};

          setItems((prev) => {
            const copy = [...prev];
            copy[activeItemIndex] = {
              ...copy[activeItemIndex],

              po_id: po._id,
              po_item_id: firstProduct?._id || null,
              category_id: firstProduct?.category?._id || null,

              po_number: po.po_number,
              project_id: po.p_id,
              vendor: po.vendor || "",
              category_name: firstProduct?.category?.name || "",
              uom: firstProduct?.uom || "",

              product_name: firstProduct?.product_name || "",
              product_make: firstProduct?.make || "",
              quantity_requested: firstProduct?.quantity || "",
              quantity_po: "",
              received_qty: "",
            };
            return copy;
          });

          setFormData((prev) => ({
            ...prev,
            project_code: po.p_id,
          }));

          setItemPoModalOpen(false);
          setActiveItemIndex(null);
        }}
        title="Search: PO for Product Row"
        columns={itemPoColumns}
        fetchPage={fetchItemPoPage}
        searchKey="po_number"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* -------- Upload Documents Modal (Inspection-like) -------- */}
      <Modal open={isEdit && uploadOpen} onClose={() => setUploadOpen(false)}>
        <ModalDialog sx={{ width: 520, maxWidth: "92vw" }}>
          <ModalClose />
          <Typography level="h5" mb={1.5}>
            Upload Logistic Documents
          </Typography>

          <FormControl>
            <FormLabel>Attachments</FormLabel>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(false);
              }}
              onDrop={onDrop}
              sx={{
                mt: 0.5,
                border: "2px dashed",
                borderColor: dragging
                  ? "primary.solidBg"
                  : "neutral.outlinedBorder",
                borderRadius: "md",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: dragging ? "primary.softBg" : "transparent",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => {
                const el = document.createElement("input");
                el.type = "file";
                el.multiple = true;
                el.accept = ATTACH_ACCEPT;
                el.onchange = (e) => onBrowse(e);
                el.click();
              }}
            >
              <UploadFile fontSize="small" />
              <Typography level="body-sm">
                Drag & drop files here or <strong>browse</strong>
              </Typography>
            </Box>
            <Typography level="body-xs" sx={{ mt: 0.5 }} color="neutral">
              Allowed: PNG, JPG, WEBP, PDF, DOC, DOCX • Max {MAX_FILE_MB} MB each
            </Typography>
          </FormControl>

          {fileError && (
            <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
              {fileError}
            </Typography>
          )}

          {uploadFiles.length > 0 && (
            <Sheet
              variant="soft"
              sx={{
                mt: 1.5,
                borderRadius: "sm",
                p: 1,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {uploadFiles.map((f, idx) => (
                <Box
                  key={`${f.name}-${idx}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 0.75,
                    px: 1,
                    borderBottom: "1px dashed",
                    borderColor: "neutral.outlinedBorder",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level="body-sm" noWrap title={f.name}>
                      {f.name}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {f.type || "unknown"} • {formatBytes(f.size)}
                    </Typography>
                  </Box>
                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => removeUploadFile(idx)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Sheet>
          )}

          <Button
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleUploadDocs}
            loading={isUpdating}
            disabled={uploadFiles.length === 0}
          >
            Upload
          </Button>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AddLogisticForm;
