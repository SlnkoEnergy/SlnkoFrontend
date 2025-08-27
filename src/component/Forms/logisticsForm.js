import { useState, useEffect, useRef } from "react";
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
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { IconButton } from "@mui/joy";
import CloudUpload from "@mui/icons-material/CloudUpload";
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
import { CloseRounded, InsertDriveFile } from "@mui/icons-material";

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

  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);

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
  const canShow =
    user?.department === "Logistic" || user?.role === "superadmin";

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

  const { data: byIdData } = useGetLogisticByIdQuery(logisticId, {
    skip: !logisticId || isAdd,
  });

  useEffect(() => {
    if (!byIdData?.data || !(isEdit || isView)) return;
    const doc = byIdData.data;

    setFormData((prev) => ({
      ...prev,
      vehicle_number: doc.vehicle_number || "",
      vendor: doc.vendor || prev.vendor || "",
      driver_number: doc.driver_number || "",
      attachment_url: doc.attachment_url || "",
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

    // Items table rows
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
              : (it.category_id ?? null),
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

  // ⬇️ replace your onFileInput with:
  const onFileInput = (e) => {
    const files = Array.from(e.target?.files || []);
    setSelectedFiles(files);
    setFormData((p) => ({
      ...p,
      attachment_url: files.length ? `${files.length} file(s) selected` : "",
    }));
  };

  // new helpers
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setFormData((p) => ({ ...p, attachment_url: "" }));
    setFileInputKey((k) => k + 1); // reset the <input>
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

  // Transportation PO Number state
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [transportation, setTransportation] = useState([]); // array of transport PO ids (top-level po_id)
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
  const buildUpdateFormData = (payload, files) => {
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload)); // backend parses req.body.data
    for (const f of files || []) if (f) fd.append("files", f); // repeat 'files'
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
        attachment_url: formData.attachment_url,
        description: formData.description,
        items: normalizedItems,
      };

      console.log("Submitting Logistic Data:", mode, payload);

      if (isEdit && logisticId) {
        // Do NOT send attachment_url; server manages it
        const { attachment_url, ...rest } = payload;

        const fd = buildUpdateFormData(rest, selectedFiles); // <-- files array
        await updateLogistic({ id: logisticId, body: fd }).unwrap();

        toast.success("Logistic updated successfully");
        // optional: clear local file UI
        // setSelectedFiles([]);
        // setFileInputKey((k) => k + 1);
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

            {canShow && (
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Attachment(s)</FormLabel>

                  <Button
                    component="label"
                    variant="soft"
                    startDecorator={<CloudUpload />}
                    sx={{ width: "fit-content" }}
                    disabled={isView}
                  >
                    Upload files
                    <input
                      key={fileInputKey}
                      hidden
                      ref={fileInputRef}
                      type="file"
                      multiple // 👈 allow multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                      onClick={(e) => {
                        // allow reselecting same files
                        e.target.value = "";
                      }}
                      onChange={onFileInput}
                      disabled={isView}
                    />
                  </Button>

                  {selectedFiles.length > 0 ? (
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        gap: 0.75,
                        flexWrap: "wrap",
                      }}
                    >
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
                              <CloseRounded />
                            </IconButton>
                          }
                          sx={{ mt: 1, maxWidth: "100%" }}
                          title={f.name}
                        >
                          {f.name}
                        </Chip>
                      ))}
                      <Button
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={clearAllFiles}
                        disabled={isView}
                      >
                        Clear all
                      </Button>
                    </Box>
                  ) : (
                    <Typography
                      level="body-xs"
                      sx={{ mt: 0.75, color: "neutral.plainColor" }}
                    >
                      Supported: PDF, DOCX, PNG, JPG, WEBP (max ~25MB each)
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}
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
                  {canShow && (
                    <th style={{ width: "12%" }}>Quantity Received</th>
                  )}
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
                                  poData?.data?.find(
                                    (po) => po._id === item.po_id
                                  )?.po_number ||
                                  item.po_number ||
                                  "(No PO)",
                              }
                            : null
                        }
                        isDisabled={isView}
                        onChange={(selected) => {
                          if (!selected || isView) return;
                          if (selected.value === "__search_more__") {
                            if (isView) return;
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
                      <Input
                        variant="plain"
                        placeholder="Project Id"
                        value={item.project_id || ""}
                        readOnly
                      />
                    </td>
                    <td>
                      <Input
                        variant="plain"
                        placeholder="Vendor"
                        value={item.vendor || ""}
                        readOnly
                      />
                    </td>
                    <td>
                      <Input
                        variant="plain"
                        placeholder="Category"
                        value={item.category_name}
                        readOnly
                      />
                    </td>
                    <td>
                      <Input
                        variant="plain"
                        placeholder="Product Name"
                        value={item.product_name}
                        readOnly
                      />
                    </td>
                    <td>
                      <Input
                        variant="plain"
                        placeholder="Make"
                        value={item.product_make}
                        readOnly
                      />
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
                          handleItemChange(
                            idx,
                            "quantity_requested",
                            e.target.value
                          )
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
                            handleItemChange(
                              idx,
                              "received_qty",
                              e.target.value
                            )
                          }
                          disabled={isView}
                        />
                      </td>
                    )}

                    <td>
                      <Input
                        variant="plain"
                        placeholder="UoM"
                        value={item.uom}
                        readOnly
                      />
                    </td>
                    <td>
                      <Input
                        value={item.ton}
                        variant="plain"
                        type="number"
                        placeholder="Ton"
                        onChange={(e) =>
                          handleItemChange(idx, "ton", e.target.value)
                        }
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
                          if (
                            window.confirm(
                              "Are you sure you want to delete this row?"
                            )
                          ) {
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
              readOnly
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Sheet
                variant="soft"
                sx={{ borderRadius: "lg", p: 2, minWidth: 280 }}
              >
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

          <Box display="flex" justifyContent="space-between">
            {!isView && (
              <Button
                type="button"
                variant="outlined"
                color="neutral"
                onClick={handleReset}
              >
                Reset
              </Button>
            )}

            <Button
              type="submit"
              variant="solid"
              color="primary"
              disabled={isLoading || isUpdating || isView}
            >
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
    </Box>
  );
};

export default AddLogisticForm;
