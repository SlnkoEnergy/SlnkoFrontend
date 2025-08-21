import * as React from "react";
import {
  Box,
  Sheet,
  Grid,
  Typography,
  Input,
  Select as JSelect,
  Option,
  Button,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Divider,
  IconButton,
  Textarea,
} from "@mui/joy";
import { Plus, Trash2 } from "lucide-react";
import { DeleteOutline, RestartAlt, Send } from "@mui/icons-material";

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

// ------------------------ mock options (replace with API) ------------------------
const vendorOptions = [
  "Siddharth Singh",
  "AAINATH CONSTRUCTION COMPANY",
  "Acme Corp",
  "Globex India",
];

const bankOptions = ["SBI - 1234", "HDFC - 4567", "ICICI - 7890"];
const journalOptions = ["Purchases", "Expenses", "Assets"];
const accountOptions = [
  { code: "210700", name: "Purchase Expense" },
  { code: "210710", name: "Office Expense" },
  { code: "140000", name: "Assets" },
];

// ------------------------ main component ------------------------
export default function VendorBillForm() {
  // header
  const [form, setForm] = React.useState({
    billNo: "",
    vendor: "",
    billDate: new Date().toISOString().slice(0, 10),
    accountingDate: new Date().toISOString().slice(0, 10),
    paymentRef: "",
    recipientBank: "",
    dueDate: new Date().toISOString().slice(0, 10),
    journal: "Purchases",
    terms: "",
  });

  // lines
  const [lines, setLines] = React.useState([
    {
      id: id(),
      Category: "[EXP_GEN] Expenses",
      accountCode: "210700",
      accountName: "Purchase Expense",
      qty: 20,
      price: 20,
      tax: 0, // percent
    },
    {
      id: id(),
      Category: "[GIFT] Gifts",
      accountCode: "210700",
      accountName: "Purchase Expense",
      qty: 3,
      price: 10,
      tax: 0,
    },
  ]);

  // tabs
  const [tab, setTab] = React.useState(0);

  // totals
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

  // handlers
  const setHeader = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const addLine = () =>
    setLines((p) => [
      ...p,
      {
        id: id(),
        Category: "",
        accountCode: "",
        accountName: "",
        qty: "",
        price: "",
        tax: "",
      },
    ]);

  const removeLine = (rowId) =>
    setLines((p) => p.filter((r) => r.id !== rowId));

  const updateLine = (rowId, key, val) =>
    setLines((p) => p.map((r) => (r.id === rowId ? { ...r, [key]: val } : r)));

  const chooseAccount = (rowId, code) => {
    const acc = accountOptions.find((a) => a.code === code);
    updateLine(rowId, "accountCode", code);
    updateLine(rowId, "accountName", acc?.name || "");
  };

  const onSave = async () => {
    // shape payload like your PO/PR
    const payload = {
      ...form,
      lines: lines.map((l) => ({
        Category: l.Category,
        account: `${l.accountCode} ${l.accountName}`.trim(),
        qty: Number(l.qty || 0),
        price: Number(l.price || 0),
        tax: Number(l.tax || 0),
      })),
      totals,
    };
    console.log("SAVE payload", payload);
    // await axios.post('/api/vendor-bill', payload)
  };

  const onSubmit = async () => {
    await onSave();
    // add your submit state/route here
  };

  // ------------------------ UI ------------------------
  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        ml: { xs: "0%", lg: "12%" },
        boxShadow: "md",
      }}
    >
      <Typography level="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Vendor Bill
      </Typography>
      {/* Title & vendor */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl", mb: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Bill Number
              </Typography>
              <Input
                name="po_number"
                placeholder="e.g. BILL-0001"
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
          </Grid>

          {/* Right column header fields */}
          <Grid container>
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Project Id
              </Typography>
              <Input
                type="plain"
                value={form.vendor}
                onChange={(e) => setHeader("billDate", e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Number
              </Typography>
              <Input
                type="plain"
                value={form.vendor}
                onChange={(e) => setHeader("billDate", e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Value (With GST)
              </Typography>
              <Input
                type="plain"
                value={form.vendor}
                onChange={(e) => setHeader("billDate", e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                PO Date
              </Typography>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setHeader("dueDate", e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Vendor
              </Typography>
              <Input
                type="plain"
                value={form.vendor}
                onChange={(e) => setHeader("billDate", e.target.value)}
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
              <th style={{ width: "14%" }}>Product</th>
              <th style={{ width: "14%" }}>Make</th>
              <th style={{ width: "20%" }}>Qty</th>
              <th style={{ width: "12%" }}>Unit Price</th>
              <th style={{ width: "10%" }}>Tax</th>
              <th style={{ width: "12%" }}>Amount</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const { base, taxAmt, total } = calcLine(l);
              return (
                <tr key={l.id}>
                  <td>
                    <Input
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
                    <JSelect
                      variant="plain"
                      size="sm"
                      value={l.accountCode || ""}
                      onChange={(_, v) => chooseAccount(l.id, v || "")}
                      placeholder="Select account"
                    >
                      {accountOptions.map((a) => (
                        <Option key={a.code} value={a.code}>
                          {a.code} {a.name}
                        </Option>
                      ))}
                    </JSelect>
                    {l.accountName ? (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        {l.accountName}
                      </Typography>
                    ) : null}
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, "qty", e.target.value)}
                      slotProps={{ input: { min: 0, step: "1" } }}
                    />
                  </td>
                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, "qty", e.target.value)}
                      slotProps={{ input: { min: 0, step: "1" } }}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.price}
                      onChange={(e) =>
                        updateLine(l.id, "price", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.tax}
                      onChange={(e) => updateLine(l.id, "tax", e.target.value)}
                      slotProps={{ input: { min: 0, step: "0.01" } }}
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
        <Textarea minRows={3} placeholder="Write Description of Bill" />

        {/* Totals block */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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
                {currency(totals.untaxed)}
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                {currency(totals.tax)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Total:
              </Typography>
              <Typography level="title-md" fontWeight="xl" sx={{ mt: 0.5 }}>
                {currency(totals.total)}
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

      {/* Footer actions */}
      <Box
        sx={{ display: "flex", gap: 1.5, mt: 2, justifyContent: "flex-end" }}
      >
        <Button
          startDecorator={<RestartAlt />}
          variant="outlined"
          onClick={onSave}
        >
          Back
        </Button>
        <Button startDecorator={<Send />} variant="solid" onClick={onSubmit}>
          Submit Bill
        </Button>
      </Box>
    </Box>
  );
}
