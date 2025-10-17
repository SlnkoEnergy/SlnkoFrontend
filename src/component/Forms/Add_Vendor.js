// src/pages/vendors/AddVendor.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAddVendorMutation } from "../../redux/vendorSlice";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

const initialForm = {
  type: "company",
  name: "",
  email: "",
  phone: "",
  street1: "",
  street2: "",
  city: "",
  zip: "",
  state: "",
  country: "",
  gstinApplicable: "not_applicable",
  gstin: "",
  website: "",
  tags: [],
  Account_No: "",
  IFSC_Code: "",
  Bank_Name: "",
};

function AddVendor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [bankOpen, setBankOpen] = useState(true);
  const [errors, setErrors] = useState({});

  // RTK Query hook
  const [addVendor, { isLoading }] = useAddVendorMutation();

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const titlePlaceholder = useMemo(
    () => (form.type === "company" ? "e.g. ABC" : "e.g. Ramesh Singh"),
    [form.type]
  );

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max file size is 2 MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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
      ...form,
      IFSC_Code: form.IFSC_Code?.toUpperCase() || "",
      gstin:
        form.gstinApplicable === "has_gstin" ? form.gstin?.toUpperCase() : "",
      gstin_applicable: form.gstinApplicable === "has_gstin",
    };

    try {
      await addVendor({ data: payload, profileFile: photoFile }).unwrap();
      toast.success("Vendor added successfully!");
      setForm(initialForm);
      setPhotoFile(null);
      setPhotoPreview("");
      navigate("/purchase-order");
    } catch (err) {
      const msg =
        err?.data?.msg || err?.error || err?.message || "Failed to add vendor.";
      toast.error(msg);
    }
  };

  // underline style for inputs
  const underlineInputStyle = {
    width: "100%",
    borderRadius: 0,
    borderBottom: "2px solid #002B5B",
    "--Input-focusedThickness": "0px",
    px: 0,
    "&:hover": { borderBottomColor: "#004080" },
    "& input": { fontSize: "1rem", paddingBottom: "4px" },
    backgroundColor: "transparent",
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
        {/* Header */}
        <Grid container spacing={2} alignItems="center">
          {/* Upload Photo tile */}
          <Grid xs={12} md="auto">
            {/* Hidden file input */}
            <input
              id="vendor-photo-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            {/* Clickable label that looks like a big upload box */}
            <label htmlFor="vendor-photo-input" style={{ cursor: "pointer" }}>
              <Sheet
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: "lg",
                  display: "grid",
                  placeItems: "center",
                  border: "2px dashed #8aa6c1",
                  backgroundColor: "#f8fbff",
                  transition: "border-color .2s, box-shadow .2s",
                  "&:hover": {
                    borderColor: "#3366a3",
                    boxShadow: "0 0 0 3px rgba(51,102,163,0.15)",
                  },
                  overflow: "hidden",
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Vendor"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <CloudUploadRoundedIcon
                      sx={{ fontSize: 56, color: "#3366a3" }}
                    />
                    <Typography level="body-sm" sx={{ color: "#3366a3" }}>
                      Upload Photo
                    </Typography>
                  </Stack>
                )}
              </Sheet>
            </label>
          </Grid>

          <Grid xs={12} md>
            <Stack direction="row" spacing={2} alignItems="center">
              <RadioGroup
                orientation="horizontal"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <Radio value="person" label="Person" />
                <Radio value="company" label="Company" />
              </RadioGroup>
            </Stack>

            <Input
              size="lg"
              variant="plain"
              placeholder={titlePlaceholder}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={!!errors.name}
              sx={{
                mt: 1.5,
                fontSize: 36,
                fontWeight: 600,
                width: "100%",
                borderRadius: 0,
                borderBottom: "2px solid #002B5B",
                "--Input-focusedThickness": "0px",
                px: 0,
                backgroundColor: "transparent",
                "&:hover": { borderBottomColor: "#004080" },
                "& input": { paddingBottom: "4px" },
              }}
            />

            {/* Email + Phone */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid xs={12} md={6}>
                <Input
                  startDecorator={<Typography level="body-sm">📧</Typography>}
                  placeholder="Email"
                  value={form.email}
                  variant="plain"
                  onChange={(e) => setField("email", e.target.value)}
                  sx={underlineInputStyle}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Input
                  startDecorator={<Typography level="body-sm">📞</Typography>}
                  placeholder="Phone"
                  value={form.phone}
                  variant="plain"
                  onChange={(e) => setField("phone", e.target.value)}
                  sx={underlineInputStyle}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "neutral.800" }} />

        {/* Address */}
        <Typography level="title-md" sx={{ mb: 1.25 }}>
          Address
        </Typography>

        <Grid container spacing={1.5}>
          <Grid xs={12} md={6}>
            <Input
              placeholder="Street..."
              value={form.street1}
              onChange={(e) => setField("street1", e.target.value)}
              variant="plain"
              sx={underlineInputStyle}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="Street 2..."
              value={form.street2}
              onChange={(e) => setField("street2", e.target.value)}
              variant="plain"
              sx={underlineInputStyle}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              sx={underlineInputStyle}
              variant="plain"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="ZIP"
              value={form.zip}
              type="number"
              onChange={(e) => setField("zip", e.target.value)}
              sx={underlineInputStyle}
              variant="plain"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => setField("state", e.target.value)}
              sx={underlineInputStyle}
              variant="plain"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setField("country", e.target.value)}
              sx={underlineInputStyle}
              variant="plain"
            />
          </Grid>
        </Grid>

        {/* Bank Details */}
        <Sheet variant="soft" sx={{ mt: 3, p: 2, borderRadius: "md" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
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
              <Grid xs={12} md={6}>
                <FormControl error={!!errors.Account_No}>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    placeholder="e.g. 123456789012"
                    value={form.Account_No}
                    onChange={(e) => setField("Account_No", e.target.value)}
                    variant="plain"
                    sx={underlineInputStyle}
                  />
                  {errors.Account_No && (
                    <FormHelperText>{errors.Account_No}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl error={!!errors.IFSC_Code}>
                  <FormLabel>IFSC Code</FormLabel>
                  <Input
                    placeholder="e.g. HDFC0001234"
                    value={form.IFSC_Code}
                    onChange={(e) => setField("IFSC_Code", e.target.value)}
                    variant="plain"
                    sx={underlineInputStyle}
                  />
                  {errors.IFSC_Code && (
                    <FormHelperText>{errors.IFSC_Code}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    placeholder="e.g. Axis Bank"
                    value={form.Bank_Name}
                    onChange={(e) => setField("Bank_Name", e.target.value)}
                    sx={underlineInputStyle}
                    variant="plain"
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Sheet>

        {/* Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            sx={{
              color: "#3366a3",
              borderColor: "#3366a3",
              backgroundColor: "transparent",
              "--Button-hoverBg": "#e0e0e0",
              "--Button-hoverBorderColor": "#3366a3",
              "&:hover": { color: "#3366a3" },
            }}
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            sx={{
              backgroundColor: "#3366a3",
              color: "#fff",
              "&:hover": { backgroundColor: "#285680" },
            }}
            variant="solid"
            disabled={isLoading}
          >
            {isLoading ? "Saving…" : "Save Vendor"}
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}

export default AddVendor;
