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

/**
 * PurchaseRequestForm.jsx
 * - Pure React + MUI Joy (no TS)
 * - Uses async/await (no .then)
 * - Auto-calculates totals
 * - Example submit payload printed to console and sent to a mock endpoint
 *
 * Replace the example vendor/product fetching and the POST URL with your own.
 */

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  product: "",
  make:"",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  note: "",
});

export default function Purchase_Request_Form() {
  // Top-level form state
  const [vendor, setVendor] = useState("");
  const [vendorRef, setVendorRef] = useState("");
  const [orderDeadline, setOrderDeadline] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [deliverTo, setDeliverTo] = useState("");
  const [terms, setTerms] = useState("");

  // Lines
  const [lines, setLines] = useState([EMPTY_LINE()]);
  const [submitting, setSubmitting] = useState(false);

  // Options (mocked fetch)
  const [vendors, setVendors] = useState([]);
  const [deliverToOptions, setDeliverToOptions] = useState([]);
  const [catalog, setCatalog] = useState([]); // Products

  useEffect(() => {
    // TODO: replace with your endpoints
    const fetchOptions = async () => {
      try {
        // Example mocked data
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
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev
    );

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const resetForm = () => {
    setVendor("");
    setVendorRef("");
    setOrderDeadline("");
    setExpectedArrival("");
    setAskConfirmation(false);
    setDeliverTo("");
    setTerms("");
    setLines([EMPTY_LINE()]);
  };

  // ---- Validation ----
  const validate = () => {
    if (!vendor) return "Vendor is required.";
    if (!orderDeadline) return "Order deadline is required.";
    if (!deliverTo) return "Deliver To is required.";
    const hasAny = lines.some((l) => l.product && Number(l.quantity) > 0);
    if (!hasAny) return "Add at least one product line with a quantity.";
    return null;
  };

  // ---- Submit ----
  const handleSubmit = async (action = "draft") => {
    try {
      const error = validate();
      if (error) {
        alert(error);
        return;
      }

      setSubmitting(true);

      const payload = {
        vendor,
        vendor_reference: vendorRef || null,
        order_deadline: orderDeadline,
        expected_arrival: expectedArrival || null,
        ask_confirmation: askConfirmation,
        deliver_to: deliverTo,
        lines: lines
          .filter((l) => l.product && Number(l.quantity) > 0)
          .map((l) => ({
            product: l.product,
            quantity: Number(l.quantity),
            unit_price: Number(l.unitPrice),
            tax_percent: Number(l.taxPercent),
            note: l.note || "",
            line_total: Number(l.quantity) * Number(l.unitPrice),
            tax_amount:
              (Number(l.quantity) *
                Number(l.unitPrice) *
                Number(l.taxPercent)) /
              100,
            gross_amount:
              Number(l.quantity) * Number(l.unitPrice) +
              (Number(l.quantity) *
                Number(l.unitPrice) *
                Number(l.taxPercent)) /
                100,
          })),
        terms_and_conditions: terms || "",
        summary: {
          untaxed_amount: amounts.untaxed,
          tax_amount: amounts.tax,
          total: amounts.total,
        },
        action, // "draft" | "submit"
      };

      console.log("➡️ Submitting Purchase Request payload:", payload);

      // TODO: Replace with your real endpoint
      const url =
        action === "submit"
          ? "/api/purchase-requests/submit"
          : "/api/purchase-requests/draft";

      // This POST is illustrative; change URL & handle response per your backend.
      const { data } = await axios.post(url, payload);
      console.log("✅ Server response:", data);

      alert(
        action === "submit"
          ? "Purchase Request submitted successfully."
          : "Draft saved successfully."
      );
      // Optional: reset after submit
      // resetForm();
    } catch (err) {
      console.error("❌ Submit failed:", err?.response?.data || err.message);
      alert("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

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

  // ---- UI ----
  return (
    <Box sx={{ p: 2, maxWidth: {xs: 'full', lg:1200}, ml: {xs:'0%',lg:"20%"} }}>
      <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Purchase Request
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "xl",
          mb: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Code
            </Typography>
            <Select
              value={vendor}
              onChange={(_, v) => setVendor(v || "")}
              placeholder="Select Project"
            >
              {vendors.map((v) => (
                <Option key={v.id} value={v.name}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700}}>
              Project Name
            </Typography>
            <Input
              value={vendorRef}
              onChange={(e) => setVendorRef(e.target.value)}
              placeholder="Project Name"
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Location
            </Typography>
            <Input
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
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
              <th style={{ width: "34%", fontWeight:700 }}>Product</th>
              <th style={{ width: "34%", fontWeight:700 }}>Make</th>
              <th style={{ width: "10%",fontWeight:700  }}>Qty</th>
              <th style={{ width: "14%",fontWeight:700  }}>Unit Price</th>
              <th style={{ width: "12%", fontWeight:700  }}>Tax %</th>
              <th style={{ width: "14%", fontWeight:700  }}>Amount</th>
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
                      onChange={(e) =>
                        updateLine(l.id, "make", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "1" } }}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(l.id, "quantity", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "1" } }}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.unitPrice}
                      onChange={(e) =>
                        updateLine(l.id, "unitPrice", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      sx={borderlessFieldSx}
                      type="number"
                      value={l.taxPercent}
                      onChange={(e) =>
                        updateLine(l.id, "taxPercent", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
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
                    >
                      <DeleteOutline />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 1,
          }}
        >
          <Button
            size="sm"
            variant="outlined"
            startDecorator={<Add />}
            onClick={addLine}
          >
            Add a section
          </Button>
        </Box>

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
        />

        {/* Summary */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Sheet
            variant="soft"
            sx={{
              borderRadius: "lg",
              p: 2,
              minWidth: 280,
            }}
          >
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
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end",
          mt: 2,
        }}
      >
        <Button
          variant="soft"
          startDecorator={<RestartAlt />}
          onClick={resetForm}
          disabled={submitting}
        >
          Reset
        </Button>
        <Button
          color="primary"
          startDecorator={<Send />}
          loading={submitting}
          onClick={() => handleSubmit("submit")}
        >
          Submit PR
        </Button>
      </Box>
    </Box>
  );
}
