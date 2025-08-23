import * as React from "react";
import {
  Box,
  Sheet,
  Grid,
  Typography,
  Input,
  Button,
  Chip,
  Divider,
  IconButton,
  Textarea,
} from "@mui/joy";
import { Plus } from "lucide-react";
import { DeleteOutline, RestartAlt, Send } from "@mui/icons-material";
import { useAddBillMutation } from "../../redux/billsSlice";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// ------------------------ helpers ------------------------
const currency = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const id = () => Math.random().toString(36).slice(2, 9);

const calcLine = (l) => {
  const qty = Number(l.qty || 0);
  const price = Number(l.price || 0);
  const tax = Number(l.tax || 0);
  const base = qty * price;
  const taxAmt = (base * tax) / 100;
  const total = base + taxAmt;
  return { base, taxAmt, total };
};

const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function VendorBillForm({ poData, poLines, onClose }) {
  // header
  const [form, setForm] = React.useState({
    billNo: "",
    project_code: poData?.p_id || poData?.project_code || "",
    po_number: poData?.po_number || "",
    vendor: poData?.name || poData?.vendor || "",
    po_value: toNum(poData?.po_value),
    total_billed: toNum(poData?.total_billed),
    createdAt: poData?.createdAt
    ? new Date(poData.createdAt).toISOString().slice(0, 10) 
    : "",
    po_date: poData?.date || "",
    billDate: new Date().toISOString().slice(0, 10),
    description: "",
  });
  
  const setHeader = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // lines from PO
  const [lines, setLines] = React.useState(
    (poLines || []).map((l) => ({
      id: id(),
      Category: l.productCategoryName || "",
      category_id: l.productCategoryId || "",
      product_name: l.productName || "",
      product_make: l.makeQ || "",
      uom: l.uom || "",
      qty: toNum(l.quantity),
      price: toNum(l.unitPrice),
      tax: toNum(l.taxPercent),
    }))
  );

  // totals for THIS bill
  const totals = React.useMemo(() => {
    let untaxed = 0;
    let tax = 0;
    let total = 0;
    for (const l of lines) {
      const { base, taxAmt, total: t } = calcLine(l);
      untaxed += base;
      tax += taxAmt;
      total += t;
    }
    return { untaxed, tax, total };
  }, [lines]);

  // compute remaining amount = PO - (already billed + this bill)
  const remainingAmount = React.useMemo(() => {
    const poVal = toNum(form.po_value);
    const billed = toNum(form.total_billed);
    const thisBill = toNum(totals.total);
    return poVal - (billed + thisBill);
  }, [form.po_value, form.total_billed, totals.total]);
  
  console.log({totals})

  const overBilling = remainingAmount < 0;

  const addLine = () =>
    setLines((p) => [
      ...p,
      {
        id: id(),
        Category: "",
        product_name: "",
        product_make: "",
        uom: "",
        qty: 0,
        price: 0,
        tax: 0,
      },
    ]);

  const removeLine = (rowId) =>
    setLines((p) => p.filter((r) => r.id !== rowId));

  const updateLine = (rowId, key, val) =>
    setLines((p) => p.map((r) => (r.id === rowId ? { ...r, [key]: val } : r)));

  const [addBill, { isLoading: posting }] = useAddBillMutation();

  const onSubmit = async () => {
    if (overBilling) {
      toast.error(
        "Bill total exceeds remaining PO amount. Please reduce the bill lines."
      );
      return;
    }
    if (!form.billNo?.trim()) {
      toast.error("Bill Number is required.");
      return;
    }
    if (!form.po_number?.trim()) {
      toast.error("PO Number missing.");
      return;
    }

    try {
      const payload = {
        po_number: form.po_number,
        bill_number: form.billNo,
        bill_date: new Date(form.billDate).toISOString().slice(0, 10),
        bill_value: totals.total, 
        description: form.description,

        item: lines.map((l) => ({
          category_id: l.category_id, 
          product_name: l.product_name,
          product_make: l.product_make,
          uom: l.uom,
          quantity: l.qty,
          bill_value: l.price,
          gst_percent: l.tax,
        })),
      };
      await addBill(payload).unwrap();
      toast.success("Bill created successfully!");
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.error || "Failed to create bill"
      );
    }
  };
  
  console.log({lines})

  const onSave = async () => {
    const payload = {
      ...form,
      lines: lines.map((l) => ({
        category_id: l.category_id,
        product_name: l.product_name,
        product_make: l.product_make,
        uom: l.uom,
        qty: Number(l.qty || 0),
        price: Number(l.price || 0),
        tax: Number(l.tax || 0),
      })),
      totals,
    };
    console.log("SAVE payload (draft)", payload);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, boxShadow: "md" }}>
      <Typography level="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Vendor Bill
      </Typography>

      {/* Header */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl", mb: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Bill Number
              </Typography>
              <Input
                placeholder="e.g. BILL-0001"
                variant="plain"
                value={form.billNo}
                onChange={(e) => setHeader("billNo", e.target.value)}
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
                  borderBottom: "2px solid #214b7b",
                  borderRadius: 0,
                  "&:hover": { borderBottomColor: "#163553" },
                }}
              />
            </Box>
          </Grid>

          <Grid container>
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Project Id
              </Typography>
              <Input
                disabled
                value={form.project_code}
                onChange={(e) => setHeader("project_code", e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Number
              </Typography>
              <Input
                disabled
                value={form.po_number}
                onChange={(e) => setHeader("po_number", e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Value (With GST)
              </Typography>
              <Input
                disabled
                type="number"
                value={form.po_value}
                onChange={(e) => setHeader("po_value", toNum(e.target.value))}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Date
              </Typography>
              <Input
              disabled
                type="date"
                value={form.createdAt}
                onChange={(e) => setHeader("po_date", e.target.value)}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Vendor
              </Typography>
              <Input
              disabled
                value={form.vendor}
                onChange={(e) => setHeader("vendor", e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Bill Date
              </Typography>
              <Input
                type="date"
                value={form.billDate}
                onChange={(e) => setHeader("billDate", e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Sheet>

      {/* Lines */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          <Chip color="primary" variant="soft" size="sm">
            Invoice
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
              <th style={{ width: "14%" }}>Category</th>
              <th style={{ width: "18%" }}>Product</th>
              <th style={{ width: "14%" }}>Make</th>
              <th style={{ width: "10%" }}>UoM</th>
              <th style={{ width: "10%" }}>Qty</th>
              <th style={{ width: "14%" }}>Unit Price</th>
              <th style={{ width: "10%" }}>Tax %</th>
              <th style={{ width: "12%" }}>Amount</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const { total } = calcLine(l);
              return (
                <tr key={l.id}>
                  <td>
                    <Input
                      disabled
                      variant="plain"
                      size="sm"
                      placeholder="Category"
                      value={l.Category}
                      onChange={(e) =>
                        updateLine(l.id, "Category", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      disabled
                      variant="plain"
                      size="sm"
                      placeholder="Product Name"
                      value={l.product_name}
                      onChange={(e) =>
                        updateLine(l.id, "product_name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      disabled
                      variant="plain"
                      size="sm"
                      placeholder="Product Make"
                      value={l.product_make}
                      onChange={(e) =>
                        updateLine(l.id, "product_make", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      disabled
                      variant="plain"
                      size="sm"
                      placeholder="UoM"
                      value={l.uom}
                      onChange={(e) => updateLine(l.id, "uom", e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      placeholder="Quantity"
                      value={l.qty}
                      onChange={(e) =>
                        updateLine(l.id, "qty", toNum(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      placeholder="Unit Price"
                      value={l.price}
                      onChange={(e) =>
                        updateLine(l.id, "price", toNum(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      placeholder="Tax %"
                      value={l.tax}
                      onChange={(e) =>
                        updateLine(l.id, "tax", toNum(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <Typography level="body-sm" fontWeight="lg">
                      {currency(total)}
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

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            size="sm"
            variant="plain"
            startDecorator={<Plus />}
            onClick={addLine}
          >
            Add a line
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Description…
        </Typography>
        <Textarea
          minRows={3}
          placeholder="Write Description of Bill"
          value={form.description}
          onChange={(e) => setHeader("description", e.target.value)}
        />

        {/* Totals block */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
        >
          <Sheet variant="soft" sx={{ borderRadius: "lg", p: 2, minWidth: 320 }}>
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
                Total PO Value:
              </Typography>
              <Typography level="body-sm" fontWeight="lg">
                {currency(form.po_value)}
              </Typography>

              <Typography level="body-sm">Total Billed Value:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                {currency(form.total_billed + totals.total)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Remaining Amount:
              </Typography>
              <Typography
                level="title-md"
                fontWeight="xl"
                sx={{
                  mt: 0.5,
                  color: overBilling ? "danger.600" : "success.700",
                }}
              >
                {currency(remainingAmount)}
              </Typography>
            </Box>
          </Sheet>

          <Sheet variant="soft" sx={{ borderRadius: "lg", p: 2, minWidth: 320 }}>
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
                {currency(totals.untaxed)}
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                {currency(totals.tax)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                This Bill Total:
              </Typography>
              <Typography level="title-md" fontWeight="xl" sx={{ mt: 0.5 }}>
                {currency(totals.total)}
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

      {/* Footer actions */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 2, justifyContent: "flex-end" }}>
        <Button
          startDecorator={<RestartAlt />}
          variant="outlined"
          onClick={onSave}
        >
          Back
        </Button>
        <Button
          startDecorator={<Send />}
          variant="solid"
          onClick={onSubmit}
          disabled={overBilling || posting}
        >
          Submit Bill
        </Button>
      </Box>
    </Box>
  );
}
