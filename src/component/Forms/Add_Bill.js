import {
  Box,
  Sheet,
  Grid,
  Typography,
  Input,
  Button,
  Chip,
  IconButton,
  Textarea,
} from "@mui/joy";
import { Plus } from "lucide-react";
import { DeleteOutline, RestartAlt, Send } from "@mui/icons-material";
import {
  useAddBillHistoryMutation,
  useAddBillMutation,
  useGetBillByIdQuery,
  useLazyGetBillHistoryQuery,
  useUpdateBillMutation,
} from "../../redux/billsSlice";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import POUpdateFeed from "../PoUpdateForm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAddPoHistoryMutation } from "../../redux/poHistory";

const currency = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const rid = () => Math.random().toString(36).slice(2, 9);

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

const isoDateOnly = (d) => {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

const AMOUNT_LABELS_BY_PATH = {
  bill_value: "Untaxed",
  gst: "GST",
  total: "Total",
};

export default function VendorBillForm({
  poData,
  poLines,
  onClose,
  fromModal = false,
}) {
  const [searchParams] = useSearchParams();
  const mode = fromModal ? "create" : searchParams.get("mode");
  const billId = searchParams.get("_id");
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [serverTotals, setServerTotals] = useState({
    bill_value: 0,
    gst: 0,
    bill_date: new Date(),
  });
  const [serverDesc, setServerDesc] = useState("");
  const [serverBillNo, setServerBillNo] = useState("");
  const isEdit = mode === "edit";
  const { data: billFetch, isFetching: fetchingBill } = useGetBillByIdQuery(
    { po_number: "", _id: billId || "" },
    { skip: !isEdit || !billId }
  );

  // header
  const [form, setForm] = useState(() => ({
    billNo: "",
    project_code: poData?.p_id || poData?.project_code || "",
    po_number: poData?.po_number || "",
    vendor: poData?.name || poData?.vendor || "",
    po_value: toNum(poData?.po_value),
    total_billed: toNum(poData?.total_billed),
    createdAt: poData?.createdAt ? isoDateOnly(poData.createdAt) : "",
    po_date: poData?.date || "",
    billDate: isoDateOnly(new Date()),
    description: "",
    _id: "",
  }));

  const setHeader = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const [lines, setLines] = useState(
    (poLines || []).map((l) => ({
      id: rid(),
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

  // Load bill (edit mode) and set baseline for diffs
  useEffect(() => {
    if (!isEdit) return;
    const rows = billFetch?.data || [];
    const doc = Array.isArray(rows) ? rows[0] : null;
    if (!doc) return;

    setForm({
      billNo: doc.bill_number || "",
      project_code: doc?.poData?.p_id || "",
      po_number: doc.po_number || "",
      vendor: doc?.poData?.vendor || "",
      po_value: toNum(doc?.poData?.po_value),
      total_billed: 0,
      createdAt: "",
      po_date: isoDateOnly(doc?.poData?.date) || "",
      billDate: isoDateOnly(doc.bill_date) || "",
      description: doc.description || "",
      _id: doc._id || "",
    });

    const mappedLines = (doc.items || []).map((it) => ({
      id: rid(),
      Category: it.category_name || "",
      category_id: it.category_id || "",
      product_name: it.product_name || "",
      product_make: it.product_make || "",
      uom: it.uom || "",
      qty: toNum(it.quantity),
      price: toNum(it.bill_value),
      tax: toNum(it.gst_percent),
    }));
    setLines(mappedLines);

    // establish baseline from fetched bill
    const prevTotals = mappedLines.reduce(
      (acc, l) => {
        const { base, taxAmt } = calcLine(l);
        acc.untaxed += base;
        acc.tax += taxAmt;
        return acc;
      },
      { untaxed: 0, tax: 0 }
    );

    setServerTotals({
      bill_value: Number(prevTotals.untaxed || 0),
      gst: Number(prevTotals.tax || 0),
      bill_date: isoDateOnly(doc.bill_date) || "",
    });
    setServerDesc(doc.description || "");
    setServerBillNo(doc.billNo || "");
  }, [isEdit, billFetch]);

  // totals for THIS bill
  const totals = useMemo(() => {
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

  const remainingAmount = useMemo(() => {
    const poVal = toNum(form.po_value);
    const billed = toNum(form.total_billed);
    const thisBill = toNum(totals.total);
    return poVal - (billed + thisBill);
  }, [form.po_value, form.total_billed, totals.total]);

  const overBilling = remainingAmount < 0;

  const addLine = () =>
    setLines((p) => [
      ...p,
      {
        id: rid(),
        Category: "",
        category_id: "",
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

  const [addBill, { isLoading: postingCreate }] = useAddBillMutation();
  const [updateBill, { isLoading: postingUpdate }] = useUpdateBillMutation();

  const buildPayloadItems = useCallback(
    () =>
      lines.map((l) => ({
        category_id: l.category_id,
        product_name: l.product_name,
        product_make: l.product_make,
        uom: l.uom,
        quantity: l.qty,
        bill_value: l.price,
        gst_percent: l.tax,
      })),
    [lines]
  );

  const [triggerGetBillHistory] = useLazyGetBillHistoryQuery();

  const getUserData = () => {
    const raw = localStorage.getItem("userDetails");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const feedRef = useRef(null);
  const scrollToFeed = () => {
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pushHistoryItem = (itemShape) => {
    const user = getUserData();
    const userName = user?.name || "User";
    const base = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      user: { name: userName },
    };

    let normalized;
    if (itemShape.kind === "note") {
      normalized = { ...base, kind: "note", note: itemShape.note || "" };
    } else if (itemShape.kind === "status") {
      normalized = {
        ...base,
        kind: "status",
        statusFrom: itemShape.statusFrom || "",
        statusTo: itemShape.statusTo || "",
        title: itemShape.title || "",
      };
    } else if (itemShape.kind === "amount_change") {
      const changes = Array.isArray(itemShape.changes)
        ? itemShape.changes.map((c, idx) => ({
            label: c.label || c.path || `field_${idx + 1}`,
            path: c.path,
            from: c.from,
            to: c.to,
          }))
        : [];
      normalized = {
        ...base,
        kind: "amount_change",
        title: itemShape.title || "Amounts updated",
        currency: "INR",
        changes,
      };
    } else {
      normalized = { ...base, kind: "other", title: itemShape.title || "" };
    }

    setHistoryItems((prev) => [normalized, ...prev]);
    scrollToFeed();
  };

  const [addBillHistory] = useAddBillHistoryMutation();

  const handleAddHistoryNote = async (text) => {
    if (!form?._id) return toast.error("Bill id missing.");
    pushHistoryItem({ kind: "note", note: text });
    try {
      const user = getUserData();
      await addBillHistory({
        subject_type: "bill",
        subject_id: form._id,
        event_type: "note",
        message: text,
        createdBy: {
          name: user?.name || "User",
          user_id: user?._id,
        },
        changes: [],
        attachments: [],
      }).unwrap();

      toast.success("Note added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add note");
    }
  };

  const mapDocToFeedItem = (doc) => {
    const base = {
      id: String(doc._id || crypto.randomUUID()),
      ts: doc.createdAt || doc.updatedAt || new Date().toISOString(),
      user: { name: doc?.createdBy?.name || doc?.createdBy || "System" },
    };

    if (doc.event_type === "amount_change" || doc.event_type === "update") {
      const changes = (Array.isArray(doc?.changes) ? doc.changes : [])
        .filter(
          (c) => typeof c?.from !== "undefined" && typeof c?.to !== "undefined"
        )
        .map((c, idx) => {
          const label =
            c.label ||
            (c.path ? AMOUNT_LABELS_BY_PATH[c.path] || c.path : "") ||
            `field_${idx + 1}`;
          return {
            label,
            path: c.path || undefined,
            from: c.from,
            to: c.to,
          };
        });

      return {
        ...base,
        kind: "amount_change",
        title: doc.message || "Amounts updated",
        currency: "INR",
        changes,
      };
    }
    if (doc.event_type === "note") {
      return { ...base, kind: "note", note: doc.message || "" };
    }
  };

  const fetchBillHistory = async () => {
    if (!form?._id) return;
    try {
      setHistoryLoading(true);
      const data = await triggerGetBillHistory({
        subject_type: "bill",
        subject_id: form._id,
      }).unwrap();
      const rows = Array.isArray(data?.data) ? data.data : [];
      setHistoryItems(rows.map(mapDocToFeedItem));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load PO history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (form._id) {
      fetchBillHistory();
    }
  }, [form._id]);

  function buildLogChanges(prev, next) {
    const numericChanges = [];

    const prevUntaxed = Number(prev.bill_value ?? 0);
    const prevGst = Number(prev.gst ?? 0);
    const prevTotal = prevUntaxed + prevGst;

    const nextUntaxed = Number(next.untaxed ?? 0);
    const nextGst = Number(next.tax ?? 0);
    const nextTotal = nextUntaxed + nextGst;

    if (prevUntaxed !== nextUntaxed) {
      numericChanges.push({
        path: "bill_value",
        label: AMOUNT_LABELS_BY_PATH.bill_value,
        from: prevUntaxed,
        to: nextUntaxed,
      });
    }
    if (prevGst !== nextGst) {
      numericChanges.push({
        path: "gst",
        label: AMOUNT_LABELS_BY_PATH.gst,
        from: prevGst,
        to: nextGst,
      });
    }

    if (prevTotal !== nextTotal) {
      numericChanges.push({
        path: "total",
        label: AMOUNT_LABELS_BY_PATH.total,
        from: prevTotal,
        to: nextTotal,
      });
    }

    const prevDate = isoDateOnly(prev.bill_date);
    const nextDate = isoDateOnly(next.bill_date);
    const dateChanged = prevDate !== nextDate;

    const prevDesc = (serverDesc || "").trim();
    const nextDesc = (form.description || "").trim();
    const descChanged = prevDesc !== nextDesc;

    const prevBillNo = (serverBillNo || "").trim();
    const nextBillNo = (form.billNo || "").trim();
    const billChanged = prevBillNo !== nextBillNo;
    return {
      numericChanges,
      dateChanged,
      dateFrom: prevDate,
      dateTo: nextDate,
      descChanged,
      descFrom: prevDesc,
      descTo: nextDesc,
      billFrom: prevBillNo,
      billTo: nextBillNo,
      billChanged,
    };
  }

  const onSubmit = async () => {
    if (!form.billNo?.trim()) {
      toast.error("Bill Number is required.");
      return;
    }
    if (!form.po_number?.trim()) {
      toast.error("PO Number missing.");
      return;
    }
    if (overBilling) {
      toast.error(
        "Bill total exceeds remaining PO amount. Please reduce the bill lines."
      );
      return;
    }

    try {
      const payload = {
        po_number: form.po_number,
        bill_number: form.billNo,
        bill_date: isoDateOnly(form.billDate),
        bill_value: totals.total,
        description: form.description,
        item: buildPayloadItems(),
      };

      if (isEdit) {
        if (!billId) {
          toast.error("Missing bill id for edit.");
          return;
        }

        const nextForCompare = {
          untaxed: totals.untaxed,
          tax: totals.tax,
          bill_date: isoDateOnly(form.billDate),
        };
        const {
          numericChanges,
          dateChanged,
          dateFrom,
          dateTo,
          descChanged,
          descFrom,
          descTo,
          billChanged,
          billFrom,
          billTo,
        } = buildLogChanges(serverTotals, nextForCompare);

        await updateBill({ _id: billId, updatedData: payload }).unwrap();
        toast.success("Bill updated successfully!");

        const user = getUserData();

        if (numericChanges.length > 0) {
          // Optimistic UI
          pushHistoryItem({
            kind: "amount_change",
            title: "Bill updated",
            changes: numericChanges.map((c) => ({
              label: c.label,
              path: c.path,
              from: c.from,
              to: c.to,
            })),
          });

          // Persist
          await addBillHistory({
            subject_type: "bill",
            subject_id: form._id || billId,
            event_type: "amount_change",
            message: "Bill updated",
            createdBy: {
              name: user?.name || "User",
              user_id: user?._id,
            },
            changes: numericChanges,
            attachments: [],
          }).unwrap();
        }

        if (dateChanged) {
          const msg = `Bill Date changed: ${dateFrom || "-"} → ${dateTo || "-"}`;
          // Optimistic
          pushHistoryItem({ kind: "note", note: msg });
          // Persist
          await addBillHistory({
            subject_type: "bill",
            subject_id: form._id || billId,
            event_type: "note",
            message: msg,
            createdBy: {
              name: user?.name || "User",
              user_id: user?._id,
            },
            changes: [],
            attachments: [],
          }).unwrap();
        }
        // 3) Log description change as note
        if (descChanged) {
          const msg = `Description changed: ${descFrom || "-"} → ${descTo || "-"}`;
          // Optimistic
          pushHistoryItem({ kind: "note", note: msg });
          // Persist
          await addBillHistory({
            subject_type: "bill",
            subject_id: form._id || billId,
            event_type: "note",
            message: msg,
            createdBy: {
              name: user?.name || "User",
              user_id: user?._id,
            },
            changes: [],
            attachments: [],
          }).unwrap();
        }

        if (billChanged) {
          const msg = `Bill No changed: ${billFrom || "-"} → ${billTo || "-"}`;
          // Optimistic
          pushHistoryItem({ kind: "note", note: msg });
          // Persist
          await addBillHistory({
            subject_type: "bill",
            subject_id: form._id || billId,
            event_type: "note",
            message: msg,
            createdBy: {
              name: user?.name || "User",
              user_id: user?._id,
            },
            changes: [],
            attachments: [],
          }).unwrap();
        }

        // refresh baseline to the new values
        setServerTotals({
          bill_value: Number(totals.untaxed || 0),
          gst: Number(totals.tax || 0),
          bill_date: isoDateOnly(form.billDate) || "",
        });
        setServerDesc(form.description || "");
        setServerBillNo(form.billNo || "");
      } else {
        await addBill(payload).unwrap();
        toast.success("Bill created successfully!");
      }

      onClose?.();
    } catch (err) {
      console.error(err);
      const msg =
        err?.data?.message ||
        err?.error ||
        (isEdit ? "Failed to update bill" : "Failed to create bill");
      toast.error(msg);
    }
  };

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
    toast.info("Draft logged in console.");
  };

  const loading = isEdit && (fetchingBill || !billId);
  const submitting = postingCreate || postingUpdate;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        ml: fromModal ? 0 : { xs: "0%", lg: "0%", xl: "10%" },
        maxWidth: fromModal ? "full" : 1400,
        p: 3,
      }}
    >
      <Box
        sx={{
          boxShadow: "md",
          p: 3,
        }}
      >
        <Typography level="h3" sx={{ fontWeight: 600, mb: 1 }}>
          {isEdit ? "Edit Vendor Bill" : "Vendor Bill"}
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
                  disabled={loading}
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
                  value={form.po_date || form.createdAt}
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
                  disabled={loading}
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
                    <td style={{ verticalAlign: "top" }}>
                      <Textarea
                        minRows={1}
                        size="sm"
                        variant="plain"
                        placeholder="Category"
                        value={l.Category}
                        onChange={(e) =>
                          updateLine(l.id, "Category", e.target.value)
                        }
                        disabled
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      />
                    </td>

                    <td style={{ verticalAlign: "top" }}>
                      <Textarea
                        minRows={1}
                        size="sm"
                        variant="plain"
                        placeholder="Product Name"
                        value={l.product_name}
                        onChange={(e) =>
                          updateLine(l.id, "product_name", e.target.value)
                        }
                        disabled
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      />
                    </td>

                    <td style={{ verticalAlign: "top" }}>
                      <Textarea
                        minRows={1}
                        size="sm"
                        variant="plain"
                        placeholder="Product Make"
                        value={l.product_make}
                        onChange={(e) =>
                          updateLine(l.id, "product_make", e.target.value)
                        }
                        disabled
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      />
                    </td>

                    <td>
                      <Input
                        variant="plain"
                        size="sm"
                        placeholder="UoM"
                        value={l.uom}
                        onChange={(e) =>
                          updateLine(l.id, "uom", e.target.value)
                        }
                        disabled
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Box>

          {!isEdit && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                size="sm"
                variant="plain"
                startDecorator={<Plus />}
                onClick={addLine}
                disabled={loading}
              >
                Add a line
              </Button>
            </Box>
          )}

          {/* Description */}
          <Textarea
            minRows={3}
            placeholder="Write Description of Bill"
            value={form.description}
            onChange={(e) => setHeader("description", e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
          />

          {/* Totals block */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
          >
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
        <Box
          sx={{ display: "flex", gap: 1.5, mt: 2, justifyContent: "flex-end" }}
        >
          <Button
            startDecorator={<RestartAlt />}
            variant="outlined"
            onClick={onSave}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            startDecorator={<Send />}
            variant="solid"
            onClick={onSubmit}
            disabled={overBilling || submitting || loading}
          >
            {isEdit ? "Update Bill" : "Submit Bill"}
          </Button>
        </Box>
      </Box>

      <Box ref={feedRef}>
        <POUpdateFeed
          items={historyItems}
          onAddNote={handleAddHistoryNote}
          compact
        />
      </Box>
    </Box>
  );
}
