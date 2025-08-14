import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Checkbox,
  Sheet,
  Table,
  IconButton,
  Divider,
  Chip,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Add from "@mui/icons-material/Add";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Send from "@mui/icons-material/Send";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useGetProjectSearchDropdownQuery } from "../../redux/camsSlice";
import SearchPickerModal from "../SearchPickerModal"; // <-- your modal

/**
 * PurchaseRequestForm.jsx
 * - Pure React + MUI Joy (no TS)
 * - Uses async/await (no .then)
 * - Auto-calculates totals
 * - Mode aware via URL params: ?mode=create|edit|view&projectId=...&id=...
 * - On edit/view: loads PR, fills form, shows PR Code, disables inputs on view
 */

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  product: "",
  make: "",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  note: "",
});

// Helper to stringify site_address variants safely
const siteAddressToString = (site_address) => {
  if (!site_address) return "";
  if (typeof site_address === "string") return site_address;
  if (typeof site_address === "object") {
    const parts = [
      site_address.village_name,
      site_address.district_name,
      site_address.tehsil_name,
      site_address.block_name,
      site_address.state_name,
      site_address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
    return parts || "";
  }
  return "";
};

export default function Purchase_Request_Form() {
  // URL params
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "create").toLowerCase(); // create | edit | view
  const projectId = searchParams.get("projectId") || "";
  const prId = searchParams.get("id") || "";

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  // Top-level form state
  const [vendor, setVendor] = useState("");       // Project Code (UI selection)
  const [vendorRef, setVendorRef] = useState(""); // Project Name
  const [orderDeadline, setOrderDeadline] = useState(""); // (kept for compatibility)
  const [expectedArrival, setExpectedArrival] = useState(""); // Project Location (kept as original field name)
  const [askConfirmation, setAskConfirmation] = useState(false); // Fetch From BOM
  const [deliverTo, setDeliverTo] = useState("");
  const [terms, setTerms] = useState("");

  // PR meta
  const [prCode, setPrCode] = useState(""); // shown in edit/view
  const [submitting, setSubmitting] = useState(false);

  // Lines
  const [lines, setLines] = useState([EMPTY_LINE()]);

  // Options (mocked fetch for your existing dropdowns)
  const [vendors, setVendors] = useState([]);
  const [deliverToOptions, setDeliverToOptions] = useState([]);
  const [catalog, setCatalog] = useState([]); // Products

  // ---- Fetch dropdown options (mocked) ----
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const vendorsData = [
          { id: "v1", name: "Siddharth Singh" },
          { id: "v2", name: "Acme Supplies" },
          { id: "v3", name: "Universal Traders" },
        ];
        const deliverData = [
          { id: "r1", name: "SInkoEnergy: Receipts" },
          { id: "r2", name: "Main Warehouse" },
          { id: "r3", name: "Site Store" },
        ];
        const catalogData = [
          { id: "p1", label: "[EXP_GEN] Expenses" },
          { id: "p2", label: "Cables 2.5mm" },
          { id: "p3", label: "Solar Module 540Wp" },
          { id: "p4", label: "Inverter 100kW" },
        ];
        setVendors(vendorsData);
        setDeliverToOptions(deliverData);
        setCatalog(catalogData);
      } catch (err) {
        console.error("Error loading options:", err);
      }
    };
    fetchOptions();
  }, []);

  // ---- Pre-fill from params on CREATE (only projectId available) ----
  useEffect(() => {
    if (isCreate) {
      if (projectId && !vendor) setVendor(projectId); // Show incoming projectId as Project Code if you want
    }
  }, [isCreate, projectId, vendor]);

  // ---- Load existing PR on EDIT/VIEW ----
  useEffect(() => {
    const hydrateFromServer = async () => {
      if (!(isEdit || isView) || !prId) return;
      try {
        const { data } = await axios.get(`/api/purchase-requests/${prId}`);
        const d = data?.data || data; // tolerate either {data:{}} or raw

        setPrCode(d?.pr_code || "");
        setVendor(d?.project_code || d?.vendor || ""); // UI label = Project Code
        setVendorRef(d?.project_name || "");
        setExpectedArrival(d?.project_location || "");
        setAskConfirmation(Boolean(d?.fetch_from_bom || d?.ask_confirmation));
        setDeliverTo(d?.deliver_to || "");
        setTerms(d?.terms_and_conditions || d?.terms || "");

        const incomingLines = Array.isArray(d?.lines) ? d.lines : [];
        setLines(
          incomingLines.length
            ? incomingLines.map((l) => ({
                id: crypto.randomUUID(),
                product: l.product || "",
                make: l.make || "",
                quantity: Number(l.quantity || 0),
                unitPrice: Number(l.unit_price ?? l.unitPrice ?? 0),
                taxPercent: Number(l.tax_percent ?? l.taxPercent ?? 0),
                note: l.note || "",
              }))
            : [EMPTY_LINE()]
        );
      } catch (err) {
        console.error("Failed to load PR:", err?.response?.data || err.message);
        alert("Failed to load purchase request.");
      }
    };
    hydrateFromServer();
  }, [isEdit, isView, prId]);

  // ---- Derived amounts ----
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

    const total = untaxed + tax;

    return {
      untaxed: Number.isFinite(untaxed) ? untaxed : 0,
      tax: Number.isFinite(tax) ? tax : 0,
      total: Number.isFinite(total) ? total : 0,
    };
  }, [lines]);

  // ---- Line helpers ----
  const addLine = () => setLines((prev) => [...prev, EMPTY_LINE()]);
  const removeLine = (id) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const updateLine = (id, field, value) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const resetForm = () => {
    if (isView) return; // no-op in view
    setVendor(isCreate ? projectId || "" : "");
    setVendorRef("");
    setOrderDeadline("");
    setExpectedArrival("");
    setAskConfirmation(false);
    setDeliverTo("");
    setTerms("");
    setLines([EMPTY_LINE()]);
  };

  // ---- Submit (create/edit). View is disabled. ----
  const validate = () => {
    if (!vendor) return "Project Code is required.";
    if (!deliverTo) return "Deliver To is required.";
    const hasAny = lines.some((l) => l.product && Number(l.quantity) > 0);
    if (!hasAny) return "Add at least one product line with a quantity.";
    return null;
  };

  const handleSubmit = async (action = "submit") => {
    try {
      if (isView) return;

      const error = validate();
      if (error) {
        alert(error);
        return;
      }

      setSubmitting(true);

      const payload = {
        project_id: projectId || null,
        pr_id: prId || null,

        vendor, // Project Code
        vendor_reference: vendorRef || null, // Project Name
        order_deadline: orderDeadline || null,
        expected_arrival: expectedArrival || null, // Project Location
        ask_confirmation: askConfirmation,
        deliver_to: deliverTo,
        lines: lines
          .filter((l) => l.product && Number(l.quantity) > 0)
          .map((l) => ({
            product: l.product,
            make: l.make || "",
            quantity: Number(l.quantity),
            unit_price: Number(l.unitPrice),
            tax_percent: Number(l.taxPercent),
            note: l.note || "",
            line_total: Number(l.quantity) * Number(l.unitPrice),
            tax_amount:
              (Number(l.quantity) * Number(l.unitPrice) * Number(l.taxPercent)) / 100,
            gross_amount:
              Number(l.quantity) * Number(l.unitPrice) +
              (Number(l.quantity) * Number(l.unitPrice) * Number(l.taxPercent)) / 100,
          })),
        terms_and_conditions: terms || "",
        summary: {
          untaxed_amount: amounts.untaxed,
          tax_amount: amounts.tax,
          total: amounts.total,
        },
        action,
      };

      console.log("➡️ Submitting Purchase Request payload:", payload);

      let res;
      if (isEdit && prId) {
        res = await axios.put(`/api/purchase-requests/${prId}`, payload);
      } else {
        res = await axios.post(`/api/purchase-requests`, payload);
      }

      console.log("✅ Server response:", res.data);
      alert(isEdit ? "Purchase Request updated successfully." : "Purchase Request created successfully.");
    } catch (err) {
      console.error("❌ Submit failed:", err?.response?.data || err.message);
      alert("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Project Name dropdown (7 items) + Search More (Modal) on CREATE =====
  const [projectSearch, setProjectSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 7;

  const {
    data: getProjectSearchDropdown,
    isFetching: projLoading,
  } = useGetProjectSearchDropdownQuery(
    { search: projectSearch, page, limit },
    { skip: !isCreate } // only fetch when creating
  );

  // Show what's coming
  console.log({ getProjectSearchDropdown });

  const projectRows = getProjectSearchDropdown?.data || [];
  const pagination = getProjectSearchDropdown?.pagination;

  // Modal state + helpers
  const [catModalOpen, setCatModalOpen] = useState(false);

  const categoryColumns = [
    { key: "name", label: "Project Name", width: 240 },
    { key: "code", label: "Project Code", width: 200 },
    { key: "site_address", label: "Location", width: 320, render: (row) => siteAddressToString(row.site_address) },
  ];

  // Adapter for modal's paginated fetch
  const fetchCategoriesPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    // If you want to reuse the same endpoint imperatively (outside RTKQ):
    // You can also call your backend directly here.
    // Using axios to keep it simple.
    const res = await axios.get("/api/projects/search", {
      params: { search, page, limit: pageSize },
    });
    const d = res.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || 1,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const onPickCategory = (row) => {
    if (!row) return;
    // row is expected to be { _id, name, code, site_address }
    setVendorRef(row.name || "");
    setVendor(row.code || ""); // Project Code
    setExpectedArrival(siteAddressToString(row.site_address)); // Project Location
    setCatModalOpen(false);
  };

  // Common styles
  const borderlessFieldSx = {
    border: "none",
    boxShadow: "none",
    bgcolor: "transparent",
    "--Input-radius": "0px",
    "--Select-radius": "0px",
    "--Input-paddingInline": "0px",
    "--Select-minHeight": "32px",
    "--Input-minHeight": "32px",
    "&:hover": { boxShadow: "none", bgcolor: "transparent" },
    "&:focus-within": { boxShadow: "none", outline: "none" },
  };

  const commonDisable = isView ? { disabled: true } : {};

  // ---- UI ----
  return (
    <Box sx={{ p: 2, maxWidth: { xs: "full", lg: 1200 }, ml: { xs: "0%", lg: "22%" } }}>
      <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Purchase Request
      </Typography>

      {/* PR Code banner (only on view/edit) */}
      {(isEdit || isView) && (
        <Sheet variant="soft" sx={{ p: 1.5, borderRadius: "lg", mb: 1.5 }}>
          <Typography level="body-sm">
            <b>PR Code:</b> {prCode || "—"}
          </Typography>
        </Sheet>
      )}

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl", mb: 2 }}>
        <Grid container spacing={2}>
          {/* Project Code (unchanged) */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Code
            </Typography>
            <Select
              value={vendor}
              onChange={(_, v) => setVendor(v || "")}
              placeholder="Select Project"
              {...commonDisable}
            >
              {vendors.map((v) => (
                <Option key={v.id} value={v.name}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Grid>

          {/* Project Name */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Name
            </Typography>

            {/* On create: show dropdown with 7 results + Search more… */}
            {isCreate ? (
              <Select
                value={vendorRef || ""}
                onChange={(_, v) => {
                  // If the special value triggers modal
                  if (v === "__SEARCH_MORE__") {
                    setCatModalOpen(true);
                    return;
                  }
                  // Find the chosen row to auto-fill other fields
                  const row = projectRows.find((r) => r.name === v);
                  if (row) onPickCategory(row);
                }}
                placeholder={projLoading ? "Loading..." : "Search or pick a project"}
                endDecorator={
                  // lightweight inline search for first 7; for deep search use modal
                  <Input
                    size="sm"
                    placeholder="Filter"
                    value={projectSearch}
                    onChange={(e) => {
                      setProjectSearch(e.target.value);
                      setPage(1);
                    }}
                    sx={{ minWidth: 120, ml: 1 }}
                  />
                }
                {...commonDisable}
              >
                {(projectRows || []).map((r) => (
                  <Option key={r._id} value={r.name}>
                    {r.name} — {r.code}
                  </Option>
                ))}
                {/* Search More footer */}
                <Option value="__SEARCH_MORE__" sx={{ fontStyle: "italic" }}>
                  🔎 Search more…
                </Option>
              </Select>
            ) : (
              // On edit/view keep it as simple Input (your original behavior)
              <Input
                value={vendorRef}
                onChange={(e) => setVendorRef(e.target.value)}
                placeholder="Project Name"
                {...commonDisable}
              />
            )}
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Location
            </Typography>
            <Input
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
              {...commonDisable}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Category
            </Typography>
            <Select
              value={vendor}
              onChange={(_, v) => setVendor(v || "")}
              placeholder="Select vendor"
              {...commonDisable}
            >
              {vendors.map((v) => (
                <Option key={v.id} value={v.name}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Grid>

          <Grid xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={askConfirmation}
              onChange={(e) => setAskConfirmation(e.target.checked)}
              label="Fetch From BOM"
              disabled={isView}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Deliver To
            </Typography>
            <Select
              value={deliverTo}
              onChange={(_, v) => setDeliverTo(v || "")}
              placeholder="Select location"
              {...commonDisable}
            >
              {deliverToOptions.map((d) => (
                <Option key={d.id} value={d.name}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Sheet>

      {/* Products Table */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Table variant="outlined" sx={{ mb: 1 }}>
          <thead>
            <tr>
              <th style={{ width: "34%", fontWeight: 700 }}>Product</th>
              <th style={{ width: "34%", fontWeight: 700 }}>Make</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Qty</th>
              <th style={{ width: "14%", fontWeight: 700 }}>Unit Price</th>
              <th style={{ width: "12%", fontWeight: 700 }}>Tax %</th>
              <th style={{ width: "14%", fontWeight: 700 }}>Amount</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const base = Number(l.quantity || 0) * Number(l.unitPrice || 0);
              const taxAmt = (base * Number(l.taxPercent || 0)) / 100;
              const gross = base + taxAmt;

              return (
                <tr key={l.id}>
                  <td>
                    <Select
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      value={l.product}
                      onChange={(_, v) => updateLine(l.id, "product", v || "")}
                      placeholder="Select product"
                      disabled={isView}
                    >
                      {catalog.map((p) => (
                        <Option key={p.id} value={p.label}>
                          {p.label}
                        </Option>
                      ))}
                    </Select>
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      value={l.make}
                      onChange={(e) => updateLine(l.id, "make", e.target.value)}
                      slotProps={{ input: { min: 0, step: "1" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.quantity}
                      onChange={(e) => updateLine(l.id, "quantity", e.target.value)}
                      slotProps={{ input: { min: 0, step: "1" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.unitPrice}
                      onChange={(e) => updateLine(l.id, "unitPrice", e.target.value)}
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.taxPercent}
                      onChange={(e) => updateLine(l.id, "taxPercent", e.target.value)}
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Chip variant="soft">₹ {gross.toFixed(2)}</Chip>
                  </td>

                  <td>
                    <IconButton
                      variant="plain"
                      color="danger"
                      onClick={() => removeLine(l.id)}
                      disabled={isView}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {!isView && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 1,
            }}
          >
            <Button size="sm" variant="outlined" startDecorator={<Add />} onClick={addLine}>
              Add a section
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Terms */}
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Description…
        </Typography>
        <Textarea
          minRows={3}
          placeholder="Write Description of PR"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          disabled={isView}
        />

        {/* Summary */}
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
              <Typography level="body-sm">Untaxed Amount:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.untaxed.toFixed(2)}
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.tax.toFixed(2)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Total:
              </Typography>
              <Typography level="title-md" fontWeight={800} sx={{ mt: 0.5 }}>
                ₹ {amounts.total.toFixed(2)}
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

      {/* Actions */}
      {!isView && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button variant="soft" startDecorator={<RestartAlt />} onClick={resetForm} disabled={submitting}>
            Reset
          </Button>
          <Button
            color="primary"
            startDecorator={<Send />}
            loading={submitting}
            onClick={() => handleSubmit("submit")}
          >
            {isEdit ? "Update PR" : "Submit PR"}
          </Button>
        </Box>
      )}

      {/* Search More Modal */}
      <SearchPickerModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onPick={onPickCategory}
        title="Search: Project"
        columns={categoryColumns}
        fetchPage={fetchCategoriesPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>
  );
}
