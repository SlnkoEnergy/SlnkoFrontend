// src/components/Inspection_Form.jsx
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Input,
  ModalClose,
  Sheet,
  Typography,
  Select as JSelect,
  Option,
  Textarea,
} from "@mui/joy";

export default function InspectionForm({
  open = true,
  onClose,
  vendorName = "",
  projectCode = "",
  items = [], // [{ productCategoryName, productName, briefDescription, make, uom, quantity }]
  onSubmit,   // async (payload) => void
  defaultMode = "online",
}) {
  const [mode, setMode] = useState(defaultMode);
  const [datetime, setDatetime] = useState(""); // ISO for datetime-local
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalQty = useMemo(
    () => (Array.isArray(items) ? items.reduce((s, r) => s + Number(r.quantity || 0), 0) : 0),
    [items]
  );

  const handleSubmit = async () => {
    if (!datetime) return alert("Inspection date & time is required.");
    if (!contactPerson) return alert("Vendor contact person is required.");
    if (!mobile) return alert("Vendor mobile number is required.");
    if (mode === "offline" && !location) return alert("Location is required for offline mode.");

    const payload = {
      vendor: vendorName || "",
      project_code: projectCode || "",
      items: items.map((it, idx) => ({
        sl: idx + 1,
        category: it.productCategoryName || "",
        product_name: it.productName || "",
        description: it.briefDescription || "",
        make: it.make || "",
        uom: it.uom || "",
        quantity: Number(it.quantity || 0),
      })),
      totals: { lines: items.length, total_qty: totalQty },
      inspection: {
        datetime,         
        mode,        
        location: mode === "offline" ? location : "",
        contact_person: contactPerson,
        contact_mobile: mobile,
        notes,
      },
    };

    try {
      setSubmitting(true);
      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      } else {
        // fallback if no handler was provided
        console.log("INSPECTION REQUEST PAYLOAD:", payload);
      }
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ p: 2, borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)" }}>
        <Typography level="h4" fontWeight="lg">
          Request Inspection
        </Typography>
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          Fill the details below and submit to request an inspection.
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 2 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor
              </Typography>
              <Input value={vendorName || ""} disabled />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Project Code
              </Typography>
              <Input value={projectCode || ""} disabled />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Inspection Date & Time
              </Typography>
              <Input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Mode
              </Typography>
              <JSelect value={mode} onChange={(_, v) => setMode(v || "online")}>
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
              </JSelect>
            </Grid>

            {mode === "offline" && (
              <Grid xs={12}>
                <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                  Location
                </Typography>
                <Input
                  placeholder="Inspection location / site address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Grid>
            )}

            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor Contact Person
              </Typography>
              <Input
                placeholder="Full name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Vendor Mobile Number
              </Typography>
              <Input
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </Grid>

            <Grid xs={12}>
              <Typography level="body-sm" fontWeight="lg" mb={0.5}>
                Notes (optional)
              </Typography>
              <Textarea
                minRows={3}
                placeholder="Add any specific instructions, access details, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </Sheet>

        <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip color="primary" variant="soft" size="sm">
              Selected Items
            </Chip>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {items.length} line(s), total qty: {totalQty}
            </Typography>
          </Box>

          <Box
            component="table"
            sx={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& th, & td": {
                borderBottom: "1px solid var(--joy-palette-neutral-outlinedBorder)",
                p: 1,
                textAlign: "left",
                verticalAlign: "top",
              },
              "& th": { fontWeight: 700, bgcolor: "background.level1" },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th style={{ width: "18%" }}>Category</th>
                <th style={{ width: "22%" }}>Product</th>
                <th style={{ width: "25%" }}>Description</th>
                <th style={{ width: "12%" }}>Make</th>
                <th style={{ width: "8%" }}>UoM</th>
                <th style={{ width: "10%" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(items) && items.length ? (
                items.map((r, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{r.productCategoryName || "-"}</td>
                    <td>{r.productName || "-"}</td>
                    <td>{r.briefDescription || "-"}</td>
                    <td>{r.make || "-"}</td>
                    <td>{r.uom || "-"}</td>
                    <td>{Number(r.quantity || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                      No items selected.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Box>
        </Sheet>

        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
          <Button variant="soft" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" loading={submitting} onClick={handleSubmit}>
            Send Request
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
