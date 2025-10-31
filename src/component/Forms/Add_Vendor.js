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
import { toast } from "react-toastify";

// ⬇️ existing API import kept, plus edit/get APIs added
import {
  useAddVendorMutation,
  useGetVendorByIdQuery,
  useUpdateVendorMutation,
} from "../../redux/vendorSlice";

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

const initialFormDefault = {
  type: "company",
  name: "",
  company_name: "",
  email: "",
  phone: "",
  street1: "",
  street2: "",
  city: "",
  zip: "",
  state: "",
  Beneficiary_Name: "",
  Account_No: "",
  IFSC_Code: "",
  Bank_Name: "",
};

function AddVendor({ setOpenAddVendorModal, vendorId }) {
  const isEdit = Boolean(vendorId);
  const {
    data: vendorResp,
    isLoading: isVendorLoading,
    isError: isVendorError,
    error: vendorError,
  } = useGetVendorByIdQuery(vendorId, { skip: !isEdit });

  const [addVendor, { isLoading: isCreating }] = useAddVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const vendor = vendorResp?.data;

  const initialFormFromVendor = useMemo(() => {
    if (!vendor) return null;
    return {
      type: vendor.type || "company",
      name: vendor.name || "",
      company_name: vendor.company_name || "",
      email: vendor?.contact_details?.email || "",
      phone: vendor?.contact_details?.phone || "",
      street1: vendor?.address?.line1 || "",
      street2: vendor?.address?.line2 || "",
      city: vendor?.address?.city || "",
      zip: vendor?.address?.pincode || "",
      state: vendor?.address?.state || "",
      Beneficiary_Name: vendor?.Beneficiary_Name || "",
      Account_No: vendor?.Account_No || "",
      IFSC_Code: vendor?.IFSC_Code || "",
      Bank_Name: vendor?.Bank_Name || "",
    };
  }, [vendor]);

  const [form, setForm] = useState(
    isEdit ? initialFormFromVendor || initialFormDefault : initialFormDefault
  );
  const [bankOpen, setBankOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (isEdit && initialFormFromVendor) {
      setForm(initialFormFromVendor);
    }
  }, [isEdit, initialFormFromVendor]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const titlePlaceholder = useMemo(
    () => (form.type === "company" ? "e.g. ABC Pvt Ltd" : "e.g. Ramesh Singh"),
    [form.type]
  );

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
    if (!form.email?.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email.";

    if (!form.Beneficiary_Name?.trim())
      e.Beneficiary_Name = "Beneficiary name is required.";

    if (!form.Account_No?.toString().trim())
      e.Account_No = "Account number is required.";
    else if (!/^\d{9,18}$/.test(form.Account_No.toString().trim()))
      e.Account_No = "Account number should be 9–18 digits.";

    if (!form.IFSC_Code?.trim()) e.IFSC_Code = "IFSC is required.";
    else if (!ifscRegex.test(form.IFSC_Code))
      e.IFSC_Code = "Enter a valid IFSC (e.g., HDFC0001234).";

    if (!form.Bank_Name?.trim()) e.Bank_Name = "Bank name is required.";
    if (form.zip && !/^\d{4,10}$/.test(String(form.zip)))
      e.zip = "Pincode should be 4–10 digits.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    type: form.type,
    name: form.name.trim(),
    company_name:
      form.type === "person" ? form.company_name?.trim() || "" : undefined,
    Beneficiary_Name: form.Beneficiary_Name.trim(),
    Account_No: form.Account_No,
    IFSC_Code: form.IFSC_Code.toUpperCase(),
    Bank_Name: form.Bank_Name.trim(),
    contact_details: {
      email: form.email.trim(),
      phone: form.phone?.trim() || "",
    },
    address: {
      line1: form.street1?.trim() || "",
      line2: form.street2?.trim() || "",
      pincode: form.zip?.toString().trim() || "",
      city: form.city?.trim() || "",
      state: form.state?.trim() || "",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = buildPayload();

    try {
      if (isEdit) {
        // UPDATE vendor
        await updateVendor({ id: vendorId, data: payload }).unwrap();
        toast.success("Vendor updated successfully!");
      } else {
        // CREATE vendor (existing functionality)
        await addVendor({ data: payload }).unwrap();
        toast.success("Vendor added successfully!");
      }

      // reset and close
      setErrors({});
      setPhotoFile(null);
      setPhotoPreview("");
      if (!isEdit) {
        setForm(initialFormDefault);
      }
      setOpenAddVendorModal?.(false);
    } catch (err) {
      const msg =
        err?.data?.msg ||
        err?.error ||
        err?.message ||
        (isEdit ? "Failed to update vendor." : "Failed to add vendor.");
      toast.error(msg);
    }
  };

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
          <Grid xs={12} md="auto">
            <input
              id="vendor-photo-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
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
              placeholder={
                form.type === "company"
                  ? "e.g. ABC Pvt Ltd"
                  : "e.g. Ramesh Singh"
              }
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
            {errors.name && (
              <FormHelperText sx={{ color: "danger.500", mt: 0.5 }}>
                {errors.name}
              </FormHelperText>
            )}

            {/* Company Name (only when person) */}
            {form.type === "person" && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid xs={12} md={6}>
                  <Input
                    placeholder="Company Name"
                    value={form.company_name}
                    onChange={(e) => setField("company_name", e.target.value)}
                    variant="plain"
                    sx={underlineInputStyle}
                  />
                </Grid>
              </Grid>
            )}

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
                  error={!!errors.email}
                />
                {errors.email && (
                  <FormHelperText sx={{ color: "danger.500" }}>
                    {errors.email}
                  </FormHelperText>
                )}
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
              placeholder="Address Line 1"
              value={form.street1}
              onChange={(e) => setField("street1", e.target.value)}
              variant="plain"
              sx={underlineInputStyle}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Input
              placeholder="Address Line 2"
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
              placeholder="Pincode"
              value={form.zip}
              type="number"
              onChange={(e) => setField("zip", e.target.value)}
              sx={underlineInputStyle}
              variant="plain"
              error={!!errors.zip}
            />
            {errors.zip && (
              <FormHelperText sx={{ color: "danger.500" }}>
                {errors.zip}
              </FormHelperText>
            )}
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
                <FormControl error={!!errors.Beneficiary_Name}>
                  <FormLabel>Beneficiary Name</FormLabel>
                  <Input
                    placeholder="e.g. Ramesh Singh"
                    value={form.Beneficiary_Name}
                    onChange={(e) =>
                      setField("Beneficiary_Name", e.target.value)
                    }
                    variant="plain"
                    sx={underlineInputStyle}
                  />
                  {errors.Beneficiary_Name && (
                    <FormHelperText>{errors.Beneficiary_Name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

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
                <FormControl error={!!errors.Bank_Name}>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    placeholder="e.g. Axis Bank"
                    value={form.Bank_Name}
                    onChange={(e) => setField("Bank_Name", e.target.value)}
                    sx={underlineInputStyle}
                    variant="plain"
                  />
                  {errors.Bank_Name && (
                    <FormHelperText>{errors.Bank_Name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Sheet>

        {/* Footer Buttons */}
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
            onClick={() => setOpenAddVendorModal?.(false)}
            disabled={isEdit ? isVendorLoading || isUpdating : isCreating}
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
            disabled={isEdit ? isVendorLoading || isUpdating : isCreating}
          >
            {isEdit
              ? isUpdating || isVendorLoading
                ? "Updating…"
                : "Update Vendor"
              : isCreating
                ? "Saving…"
                : "Save Vendor"}
          </Button>
        </Stack>

        {/* Edit-mode inline status */}
        {isEdit && isVendorError && (
          <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
            Failed to load vendor:{" "}
            {vendorError?.data?.msg || vendorError?.error || "Unknown error"}
          </Typography>
        )}
      </Sheet>
    </Box>
  );
}

export default AddVendor;
