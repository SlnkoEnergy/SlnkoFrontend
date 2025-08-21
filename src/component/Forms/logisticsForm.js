import { useState, useEffect } from "react";
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

import { toast } from "react-toastify";
import Select from "react-select";
import {
  useAddLogisticMutation,
  useGetPoBasicQuery,
  useLazyGetPoBasicQuery,
} from "../../redux/purchasesSlice";
import SearchPickerModal from "../SearchPickerModal";

const AddLogisticForm = () => {
  const [formData, setFormData] = useState({
    po_id: [],
    project_code: "",
    vendor: "",
    vehicle_number: "",
    driver_number: "",
    total_ton: "",
    vehicle_cost: 0,
    attachment_url: "",
    description: "",
  });

  // items table
  const [items, setItems] = useState([
    {
      po_id: "",
      po_number: "",
      project_id: "",
      product_name: "",
      category_name: "",
      product_make: "",
      uom: "",
      quantity_requested: "",
      ton: "",
      vendor: "",
    },
  ]);

  const [totalWeight, setTotalWeight] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);

  // ✅ Recalculate total weight when items change
  useEffect(() => {
    const sum = items.reduce(
      (acc, item) => acc + (parseFloat(item.ton) || 0),
      0
    );
    setTotalWeight(sum);
  }, [items]);

  // ✅ fetch PO list
  const { data: poData, isLoading: poLoading } = useGetPoBasicQuery({
    page: 1,
    pageSize: 7,
    search: "",
  });

  const [addLogistic, { isLoading }] = useAddLogisticMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      attachment_url: file ? file.name : "",
    }));
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
        product_name: "",
        category_name: "",
        product_make: "",
        uom: "",
        quantity_requested: "",
        ton: "",
        vendor: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        items,
        total_ton: totalWeight,
        vehicle_cost: vehicleCost,
      };
      console.log("Submitting Logistic Data:", payload);

      await addLogistic(payload).unwrap();
      toast.success("Logistic entry created successfully");
      handleReset();
    } catch (err) {
      console.error("Failed to submit logistic:", err);
      toast.error("Failed to create logistic entry");
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
      vehicle_cost: 0,
      attachment_url: "",
      description: "",
    });
    setItems([
      {
        po_id: "",
        po_number: "",
        project_id: "",
        product_name: "",
        category_name: "",
        product_make: "",
        uom: "",
        quantity_requested: "",
        ton: "",
        vendor: "",
      },
    ]);
    setTransportation([]);
    setTransportationIdToName({});
    setTotalWeight(0);
    setVehicleCost(0);
  };

  // 🚚 Transportation PO Number state
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
    if (!row?._id) return;

    setTransportation((prev) =>
      prev.includes(row._id) ? prev : [...prev, row._id]
    );

    setTransportationIdToName((prev) => ({
      ...prev,
      [row._id]: row.po_number || String(row._id),
    }));

    // ✅ keep full PO details for cost calculation
    setTransportationIdToName((prev) => ({
      ...prev,
      [row._id]: row.po_number || String(row._id),
    }));

    // ✅ store PO in a new map
    setTransportationPos((prev) => ({
      ...prev,
      [row._id]: row,
    }));

    // ✅ update vendor
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
  const [triggerTransportationSearch] = useLazyGetPoBasicQuery();

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

  // ✅ Vehicle cost only from transportation POs
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

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        ml: { xs: "0%", lg: "22%" },
        boxShadow: "md",
      }}
    >
      {/* Title */}
      <Typography level="h3" fontWeight="lg" mb={2}>
        Logistic Form
      </Typography>

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Transportation PO Number */}
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
                  onChange={(selected) => {
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

                    // ✅ also update vendor if first PO selected
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

            {/* Vendor */}
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

            {/* Vehicle Number */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Vehicle Number</FormLabel>
                <Input
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="RJ14-AB-5678"
                  required
                />
              </FormControl>
            </Grid>

            {/* Driver Number */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Driver Number</FormLabel>
                <Input
                  name="driver_number"
                  value={formData.driver_number}
                  onChange={handleChange}
                  placeholder="9876543211"
                  required
                />
              </FormControl>
            </Grid>

            {/* Attachment */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Attachment</FormLabel>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
            </Grid>
          </Grid>

          {/* Items Table */}
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
                  <th style={{ width: "20%" }}>Vendor</th>
                  <th style={{ width: "20%" }}>Product</th>
                  <th style={{ width: "15%" }}>Category</th>
                  <th style={{ width: "10%" }}>Make</th>
                  <th style={{ width: "8%" }}>Qty</th>
                  <th style={{ width: "8%" }}>UoM</th>
                  <th style={{ width: "10%" }}>Weight (Ton)</th>
                  <th style={{ width: "60px", textAlign: "center" }}>Action</th>

                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    {/* PO Number selection */}
                    <td>
                      <Select
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
                                  item.po_number || // ✅ fallback when selected from modal
                                  "(No PO)",
                              }
                            : null
                        }
                        onChange={(selected) => {
                          if (!selected) return;
                          if (selected.value === "__search_more__") {
                            setActiveItemIndex(idx);
                            setItemPoModalOpen(true);
                            return;
                          }

                          const { po } = selected;
                          if (!po) return;

                          // ✅ Expand PO.items into rows
                          const productItems =
                            Array.isArray(po.items) && po.items.length > 0
                              ? po.items
                              : [{}]; // fallback

                          setItems((prev) => {
                            const copy = [...prev];
                            // remove the current row (idx) and insert expanded rows
                            copy.splice(
                              idx,
                              1,
                              ...productItems.map((prod) => ({
                                po_id: po._id,
                                po_number: po.po_number,
                                project_id: po.p_id,
                                product_name: prod.product_name || "",
                                category_name: prod.category?.name || "",
                                product_make: prod.make || "",
                                uom: prod.uom || "",
                                quantity_requested: prod.quantity || "",
                                ton: "",
                                vendor: po.vendor || "",
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
                      <Input value={item.project_id || ""} readOnly />
                    </td>
                    <td>
                      <Input value={item.vendor || ""} readOnly />
                    </td>
                    <td>
                      <Input value={item.product_name} readOnly />
                    </td>
                    <td>
                      <Input value={item.category_name} readOnly />
                    </td>
                    <td>
                      <Input value={item.product_make} readOnly />
                    </td>
                    <td>
                      <Input value={item.quantity_requested} readOnly />
                    </td>
                    <td>
                      <Input value={item.uom} readOnly />
                    </td>
                    <td>
                      <Input
                        value={item.ton}
                        onChange={(e) =>
                          handleItemChange(idx, "ton", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <IconButton
                        size="sm"
                        color="danger"
                        onClick={() => {
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
              <Button size="sm" variant="plain" onClick={addItemRow}>
                Add a Product
              </Button>
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
            />

            {/* Summary */}
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
                  <Typography level="body-sm">Vehicle Cost:</Typography>
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
            <Button
              type="button"
              variant="outlined"
              color="neutral"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Logistic"}
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
          if (!po?._id || activeItemIndex === null) return;

          const firstProduct = po.items[0] || {};

          setItems((prev) => {
            const copy = [...prev];
            copy[activeItemIndex] = {
              ...copy[activeItemIndex],
              po_id: po._id,
              po_number: po.po_number,
              project_id: po.p_id,
              product_name: firstProduct.product_name || "",
              category_name: firstProduct.category?.name || "",
              product_make: firstProduct.make || "",
              uom: firstProduct.uom || "",
              quantity_requested: firstProduct.quantity || "",
              vendor: po.vendor || "",
              __selectValue: {
                value: po._id,
                label: po.po_number,
                po,
              },
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
