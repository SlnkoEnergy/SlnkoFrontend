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
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import Send from "@mui/icons-material/Send";
import { ConfirmationNumber, Print, RestartAlt } from "@mui/icons-material";
import SearchPickerModal from "../SearchPickerModal";

import {
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
} from "../../redux/vendorSlice";

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
  onClose,
  pr_id,
  // legacy single-item fields (optional)
  item_id,
  item_name,
  other_item_name,
  // project fields
  project_id,
  project_code,
  // seeds from PR
  initialLines = [],
  categories = [],
  categoryNames = [],
}) => {
  const navigate = useNavigate();

  // ----- Vendors (server search + modal) -----
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

  // ----- Form state -----
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    p_id: project_code || "",
    po_number: "",
    name: "", // vendor name string
    date: "",
    po_value: "",
    po_basic: "",
    gst: "",
    partial_billing: "",
    submitted_By: "",
  });

  // Lines (prefilled from PR if provided)
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

  // Totals
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

  // ----- Auth/user helpers -----
  const getUserData = () => {
    const raw = localStorage.getItem("userDetails");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Prefill submitted_By from local user
  useEffect(() => {
    const user = getUserData();
    if (user?.name) {
      setFormData((p) => ({ ...p, submitted_By: user.name }));
    }
  }, []);

  // ----- Handlers -----
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
    // opt can be null (cleared), the special "search more", or a real vendor
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

  // ----- Submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.po_number) return toast.error("PO Number is required.");
    if (!formData.name) return toast.error("Vendor is required.");
    if (!formData.date) return toast.error("PO Date is required.");

    setIsSubmitting(true);
    try {
      const user = getUserData();
      if (!user?.name) {
        toast.error("User details not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const dataToPost = {
        p_id: project_code,
        project_id: project_id || null,
        po_number: formData.po_number,
        vendor: formData.name,
        date: formData.date,
        item: item_name === "Others" ? other_item_name || "Others" : item_id,
        other: "",
        po_value: String(amounts.total ?? 0),
        po_basic: String(amounts.untaxed ?? 0),
        gst: String(amounts.tax ?? 0),
        partial_billing: formData.partial_billing || "",
        submitted_By: user.name,
        pr_id,

        // include full lines / categories if you pass them in
        categories: Array.isArray(categories) ? categories : [],
        category_names: Array.isArray(categoryNames) ? categoryNames : [],
        lines: lines.map((l) => ({
          productId: l.productId || "",
          productName: l.productName || "",
          productCategoryId: l.productCategoryId || "",
          productCategoryName: l.productCategoryName || "",
          make: l.make || "",
          uom: l.uom || "",
          quantity: String(l.quantity ?? 0),
          cost: String(l.unitPrice ?? 0),
          gst: String(l.taxPercent ?? 0),
        })),
      };

      const token = localStorage.getItem("authToken");
      await Axios.post("/Add-purchase-ordeR-IT", dataToPost, {
        headers: { "x-auth-token": token },
      });

      toast.success("Purchase Order Successfully Added!");
      if (onClose) onClose();
      else navigate("/purchase-order");
    } catch (error) {
      console.error("Error posting PO:", error);
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.message === "PO Number already used!"
      ) {
        toast.error("PO Number already used. Please enter a unique one.");
      } else {
        toast.error("Something went wrong. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: "full",
          width: "100%",
          p: 3,
          boxShadow: "md",
          borderRadius: "lg",
          bgcolor: "background.surface",
        }}
      >
        {/* Header with actions (INSIDE the card) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            Purchase Order
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="solid"
              startDecorator={<Send />}
              sx={{
                bgcolor: "#214b7b",
                color: "#fff",
                "&:hover": { bgcolor: "#163553" },
              }}
              onClick={() => {
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
              onClick={() => {
                const form = document.getElementById("po-form");
                if (form) form.requestSubmit();
              }}
            >
              Confirm Order
            </Button>
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

        {/* Optional: show categories passed from PR */}
        {Array.isArray(categoryNames) && categoryNames.length > 0 && (
          <Box sx={{ mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {categoryNames.map((c) => (
              <Chip key={c} color="primary" variant="soft" size="sm">
                {c}
              </Chip>
            ))}
          </Box>
        )}

        {/* PO Number directly BELOW the buttons, still inside the card */}
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
                  Project ID
                </Typography>
                <Input disabled value={formData.p_id} />
              </Grid>

              {/* Vendor with 7 results + SearchPickerModal */}
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
                  // Don't client-filter — we already server-filter
                  filterOption={() => true}
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
                  required
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
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          variant="plain"
                          placeholder="Product name"
                          value={l.productCategoryName}
                          onChange={(e) =>
                            updateLine(l.id, "categoryName", e.target.value)
                          }
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
                        <IconButton
                          variant="plain"
                          color="danger"
                          onClick={() => removeLine(l.id)}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Box>

            <Box sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}>
              <Button variant="plain" size="sm" onClick={addLine}>
                Add a product
              </Button>
            </Box>

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
    </Box>
  );
};

export default AddPurchaseOrder;
