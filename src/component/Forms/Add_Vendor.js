// src/pages/vendors/AddVendor.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../utils/Axios";
import Img7 from "../../assets/pay-request.png";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

const initialForm = {
  partyType: "company", // 'person' | 'company'
  name: "",
  email: "",
  phone: "",
  // Address
  street1: "",
  street2: "",
  city: "",
  zip: "",
  state: "",
  country: "",
  // Meta
  gstinApplicable: "not_applicable", // 'not_applicable' | 'has_gstin'
  gstin: "",
  website: "",
  tags: [],

  // Bank (optional)
  Account_No: "",
  IFSC_Code: "",
  Bank_Name: "",
};

function AddVendor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [bankOpen, setBankOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const isCompany = form.partyType === "company";

  const titlePlaceholder = useMemo(
    () => (isCompany ? "e.g. Lumber Inc" : "e.g. John Doe"),
    [isCompany]
  );

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    // live log for debugging preference
    console.log(`[form] ${name}:`, value);
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (form.tags.includes(v)) {
      setTagInput("");
      return;
    }
    setForm((p) => ({ ...p, tags: [...p.tags, v] }));
    setTagInput("");
  };

  const removeTag = (value) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== value) }));
  };

  const validate = () => {
    const e = {};

    if (!form.name?.trim()) e.name = "Name is required.";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email.";
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone))
      e.phone = "Invalid phone.";

    if (form.gstinApplicable === "has_gstin") {
      if (!form.gstin?.trim()) e.gstin = "GSTIN is required.";
      else if (!gstinRegex.test(form.gstin))
        e.gstin = "GSTIN format looks invalid.";
    }

    if (form.Account_No && !/^\d{9,18}$/.test(form.Account_No))
      e.Account_No = "Account number should be 9–18 digits.";
    if (form.IFSC_Code && !ifscRegex.test(form.IFSC_Code))
      e.IFSC_Code = "Enter a valid IFSC (e.g., HDFC0001234).";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      name: form.name?.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,

      address: {
        street1: form.street1 || undefined,
        street2: form.street2 || undefined,
        city: form.city || undefined,
        zip: form.zip || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
      },

      gstin_applicable: form.gstinApplicable === "has_gstin",
      gstin: form.gstinApplicable === "has_gstin" ? form.gstin?.toUpperCase() : undefined,

      website: form.website?.trim() || undefined,
      tags: form.tags,

      // Keep your existing backend fields intact (optional)
      Account_No: form.Account_No || undefined,
      IFSC_Code: form.IFSC_Code?.toUpperCase() || undefined,
      Bank_Name: form.Bank_Name || undefined,

      // Extra: partyType if you want to store it
      partyType: form.partyType,
    };

    console.log("Submitting payload:", payload);

    try {
      const token = localStorage.getItem("authToken");
      await Axios.post("/vendor", payload, {
        headers: { "x-auth-token": token },
      });
      toast.success("Vendor added successfully!");
      setForm(initialForm);
      navigate("/purchase-order");
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to add vendor. Please try again.";
      console.error("Add vendor error:", msg);
      toast.error(msg);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "grid", placeItems: "center", py: 3 }}
    >
      <Sheet
        variant="soft"
        sx={{
          width: "min(1120px, 96vw)",
          borderRadius: "lg",
          p: 3,
          boxShadow: "lg",
          
        }}
      >
        {/* Header Row */}
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md="auto">
            <Sheet
              sx={{
                width: 140,
                height: 140,
                display: "grid",
                placeItems: "center",
                borderRadius: "lg",
                
              }}
            >
              <img
                src={Img7}
                alt="logo"
                style={{ width: 84, height: 84, objectFit: "contain", opacity: 0.9 }}
              />
            </Sheet>
          </Grid>

          <Grid xs={12} md>
            <Stack direction="row" spacing={2} alignItems="center">
              <RadioGroup
                orientation="horizontal"
                value={form.partyType}
                onChange={(e) => setField("partyType", e.target.value)}
              >
                <Radio value="person" label="Person" />
                <Radio value="company" label="Company" />
              </RadioGroup>
            </Stack>

            <Input
              size="lg"
              variant="plain"
              sx={{
                mt: 1,
                fontSize: 36,
                fontWeight: 600,
                px: 0,
                "--Input-focusedThickness": "0px",
                color: "neutral.100",
              }}
              placeholder={titlePlaceholder}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={!!errors.name}
              slotProps={{
                input: { "aria-label": "vendor name / title" },
              }}
            />
            {errors.name && (
              <FormHelperText sx={{ color: "danger.400", mt: 0.5 }}>
                {errors.name}
              </FormHelperText>
            )}

            {/* email / phone row */}
            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} useFlexGap>
              <Input
                startDecorator={<Typography level="body-sm">📧</Typography>}
                placeholder="Email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                sx={{ flex: 1 }}
                error={!!errors.email}
              />
              <Input
                startDecorator={<Typography level="body-sm">📞</Typography>}
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                sx={{ flex: 1 }}
                error={!!errors.phone}
              />
            </Stack>
            {(errors.email || errors.phone) && (
              <FormHelperText sx={{ color: "danger.400", mt: 0.5 }}>
                {errors.email || errors.phone}
              </FormHelperText>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "neutral.800" }} />

        {/* Body: Address (left) | Meta (right) */}
        <Grid container spacing={3}>
          {/* Address Column */}
          <Grid xs={12} md={7}>
            <Typography level="title-md" sx={{ mb: 1.25 }}>
              Address
            </Typography>

            <Grid container spacing={1.5}>
              <Grid xs={12}>
                <Input
                  placeholder="Street..."
                  value={form.street1}
                  onChange={(e) => setField("street1", e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  placeholder="Street 2..."
                  value={form.street2}
                  onChange={(e) => setField("street2", e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
              </Grid>
              <Grid xs={6} md={3}>
                <Input
                  placeholder="ZIP"
                  value={form.zip}
                  onChange={(e) => setField("zip", e.target.value)}
                />
              </Grid>
              <Grid xs={6} md={3}>
                <Input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>

      
        </Grid>

        {/* Optional Bank section */}
        <Sheet
          variant="soft"
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "md",
           
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography level="title-sm">Bank Details</Typography>
            <IconButton
              variant="plain"
              color="neutral"
              onClick={() => setBankOpen((s) => !s)}
              aria-label="toggle bank details"
            >
              {bankOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Stack>

          {bankOpen && (
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              <Grid xs={12} md={4}>
                <FormControl error={!!errors.Account_No}>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    placeholder="Account Number"
                    value={form.Account_No}
                    onChange={(e) => setField("Account_No", e.target.value)}
                  />
                  {errors.Account_No && (
                    <FormHelperText>{errors.Account_No}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid xs={12} md={4}>
                <FormControl error={!!errors.IFSC_Code}>
                  <FormLabel>IFSC Code</FormLabel>
                  <Input
                    placeholder="e.g. HDFC0001234"
                    value={form.IFSC_Code}
                    onChange={(e) => setField("IFSC_Code", e.target.value)}
                  />
                  {errors.IFSC_Code && (
                    <FormHelperText>{errors.IFSC_Code}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid xs={12} md={4}>
                <FormControl>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    placeholder="Bank Name"
                    value={form.Bank_Name}
                    onChange={(e) => setField("Bank_Name", e.target.value)}
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Sheet>

        {/* Actions */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="solid">
            Save Vendor
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}

export default AddVendor;
