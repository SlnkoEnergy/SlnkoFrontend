import {
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  LinearProgress,
  Sheet,
  Switch,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import Img9 from "../../assets/solar.png";
import Axios from "../../utils/Axios";

const PROJECTS_API = "/get-all-projecT-IT";
const PO_DETAILS_API = "/get-po-detail";

function PaymentRequestForm() {
  const navigate = useNavigate();

  const [getFormData, setGetFormData] = useState({
    projectIDs: [],
    poNumbers: [],
  });

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    p_id: "",
    name: "",
    customer: "",
    p_group: "",
    pay_type: "",
    po_number: "",
    dbt_date: "",
    paid_for: "",
    vendor: "",
    comment: "",
    po_value: "",
    amount_paid: "",
    po_balance: "",
    benificiary: "",
    acc_number: "",
    ifsc: "",
    branch: "",
    acc_match: "",
    utr: "",
    total_advance_paid: "",
    submitted_by: "",
    credit: {
      credit_deadline: "",
      credit_status: false,
      credit_remarks: "",
    },
  });

  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isPoListLoading, setIsPoListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState({});

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) return JSON.parse(userData);
    return null;
  };

  useEffect(() => {
    const fetchBoot = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { "x-auth-token": token } };

        const [projectsRes, poListRes] = await Promise.all([
          Axios.get(PROJECTS_API, config),
          Axios.get(PO_DETAILS_API, config),
        ]);

        setGetFormData({
          projectIDs: projectsRes?.data?.data || [],
          poNumbers: Array.isArray(poListRes?.data?.po_numbers)
            ? poListRes.data.po_numbers
            : [],
        });
      } catch (err) {
        console.error("Boot fetch failed:", err);
        toast.error("Failed to load projects / POs");
      } finally {
        setIsProjectsLoading(false);
        setIsPoListLoading(false);
      }
    };

    fetchBoot();
  }, []);

  useEffect(() => {
    const u = getUserData();
    setUser(u);
    if (u) setFormData((p) => ({ ...p, submitted_by: u.name || "" }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pay_type") {
      if (value === "Adjustment") {
        setFormData((prev) => ({
          ...prev,
          paid_for: "Customer Adjustment",
          po_number: "N/A",
          po_value: "N/A",
          total_advance_paid: "N/A",
          po_balance: "N/A",
          amount_paid: "",
          benificiary: "",
          acc_number: "",
          ifsc: "",
          branch: "",
        }));
      } else if (value === "Slnko Service Charge") {
        setFormData((prev) => ({
          ...prev,
          paid_for: "Slnko Service Charge",
          benificiary: "Slnko Energy PVT LTD",
          acc_number: "N/A",
          ifsc: "N/A",
          branch: "N/A",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          paid_for: "",
          benificiary: "",
          acc_number: "",
          ifsc: "",
          branch: "",
        }));
      }
    }

    if (name === "p_id" && value) {
      const selectedProject = getFormData.projectIDs.find(
        (project) => project.p_id === value
      );
      if (selectedProject) {
        setFormData((prev) => ({
          ...prev,
          name: selectedProject.name || "",
          customer: selectedProject.customer || "",
          p_group: selectedProject.p_group || "",
        }));
      }
    }
  };

  const handlePoChange = async (selectedOption) => {
    const poNum = selectedOption?.value || "";
    if (!poNum) {
      setFormData((prev) => ({
        ...prev,
        po_number: "",
        po_value: "",
        total_advance_paid: "",
        po_balance: "",
        vendor: "",
        paid_for: "",
        p_id: "",
        name: "",
        customer: "",
        p_group: "",
      }));
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { "x-auth-token": token } };
      const { data } = await Axios.get(
        `${PO_DETAILS_API}?po_number=${encodeURIComponent(poNum)}`,
        config
      );

      const poValueNum = isFinite(Number(data?.po_value))
        ? Number(data.po_value)
        : "";
      const advPaidNum = isFinite(Number(data?.total_advance_paid))
        ? Number(data.total_advance_paid)
        : "";
      const balanceNum = isFinite(Number(data?.po_balance))
        ? Number(data.po_balance)
        : "";

      const poProjectCode = (data?.p_id || data?.project_code || "").toString();
      let resolvedProject = null;
      if (poProjectCode) {
        resolvedProject = getFormData.projectIDs.find(
          (p) => String(p.code) === poProjectCode
        );
      }

      setFormData((prev) => ({
        ...prev,
        po_number: data?.po_number || poNum,
         paid_for: data?.item,
        vendor: data?.vendor || prev.vendor,
        po_value: poValueNum === "" ? "" : String(poValueNum),
        total_advance_paid: advPaidNum === "" ? "" : String(advPaidNum),
        po_balance: balanceNum === "" ? "" : String(balanceNum),
        benificiary: data?.benificiary || prev.benificiary,
        acc_number: data?.acc_number || prev.acc_number,
        ifsc: data?.ifsc || prev.ifsc,
        branch: data?.branch || prev.branch,
        ...(resolvedProject
          ? {
              p_id: resolvedProject.p_id,
              name: resolvedProject.name || prev.name,
              customer: resolvedProject.customer || prev.customer,
              p_group: resolvedProject.p_group || prev.p_group,
            }
          : { p_id: prev.p_id }),
      }));

      if (poProjectCode && !resolvedProject) {
        console.warn(
          "PO project code not found in project list:",
          poProjectCode
        );
        toast.info(
          `Project code from PO ("${poProjectCode}") not found in loaded projects.`
        );
      }
    } catch (err) {
      console.error("Failed to fetch PO details:", err);
      toast.error("Could not load PO details");
    }
  };

  const validateBeforeSubmit = (data) => {
    const e = {};

    const hasRealPO = !!(data.po_number && data.po_number !== "N/A");
    if (!data.p_id && !hasRealPO) e.p_id = "Please select a project.";

    if (!data.pay_type) e.pay_type = "Please choose a payment type.";
    if (!data.dbt_date) e.dbt_date = "Requested date is required.";
    if (!data.paid_for) e.paid_for = "Please enter what this is requested for.";
    if (!data.vendor) e.vendor = "Vendor / Credited to is required.";
    if (!data.comment) e.comment = "Please add a short description.";
    if (data.pay_type === "Payment Against PO" && !data.po_number) {
      e.po_number = "PO number is required for Payment Against PO.";
    }

    const amt = Number(data.amount_paid || 0);
    if (!amt || amt <= 0) e.amount_paid = "Enter a valid Amount Requested.";

    if (!data.benificiary) e.benificiary = "Beneficiary name is required.";
    if (!data.acc_number) e.acc_number = "Account number is required.";
    if (!data.branch) e.branch = "Bank name is required.";

    if (data.credit?.credit_status) {
      if (!data.credit.credit_deadline)
        e.credit_deadline = "Credit deadline is required.";
      if (!data.credit.credit_remarks)
        e.credit_remarks = "Please add credit remarks.";
    }

    if (data.dbt_date && data.credit.credit_deadline) {
      const dbtDateObj = new Date(data.dbt_date);
      const deadlineDateObj = new Date(data.credit.credit_deadline);
      const diffDays = Math.floor(
        (deadlineDateObj - dbtDateObj) / (1000 * 60 * 60 * 24)
      );
      if (diffDays < 2) {
        const minValidDate = new Date(dbtDateObj);
        minValidDate.setDate(minValidDate.getDate() + 2);

        e.credit_deadline = `Credit deadline must be at least 2 days after the debit date. Earliest allowed: ${
          minValidDate.toISOString().split("T")[0]
        }`;
      }
    }

    return e;
  };

  const extractApiErrors = (errRes) => {
    const e = {};
    const data = errRes?.data;
    if (!data) return e;

    if (
      data.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
    ) {
      Object.entries(data.errors).forEach(([k, v]) => (e[k] = String(v)));
    } else if (Array.isArray(data.errors)) {
      data.errors.forEach((it) => {
        if (it?.path) e[it.path] = it.message || "Invalid value";
      });
    }
    return e;
  };

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = document.querySelector(`[name="${first}"]`);
    if (el && typeof el.focus === "function") el.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const clientErrors = validateBeforeSubmit(formData);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      toast.error("Please fix the highlighted fields.");

      console.error("Validation errors:", clientErrors);

      focusFirstError(clientErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        ...formData,
        p_id: formData?.p_id,
        submitted_by: user?.name || getUserData()?.name || "",
      };

      const res = await Axios.post("/add-pay-requesT-IT", payload, {
        headers: { "x-auth-token": token },
      });

      const msg = res?.data?.message || "Payment Requested Successfully";
      toast.success(msg);
      navigate("/daily-payment-request");
    } catch (err) {
      const status = err?.response?.status;
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Request failed. Please try again.";

      const apiFieldErrors = extractApiErrors(err?.response);
      if (Object.keys(apiFieldErrors).length) {
        setErrors(apiFieldErrors);
        focusFirstError(apiFieldErrors);

        console.error("API field errors:", apiFieldErrors);
      }

      console.error("API error response:", err?.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProjectCode =
    getFormData.projectIDs.find((p) => p.p_id === formData.p_id)?.code || "";

  const formatINR = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const amountRequested = Number(formData.amount_paid || 0);
  const poBalanceNum =
    formData.po_balance === "N/A" ? null : Number(formData.po_balance || 0);
  const poValueNum = Number(formData.po_value || 0);
  const totalAdvNum = Number(formData.total_advance_paid || 0);
  const balancePercent =
    poValueNum > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((poValueNum - (totalAdvNum + amountRequested)) / poValueNum) * 100
          )
        )
      : 0;

  const hasRealPO = !!(formData.po_number && formData.po_number !== "N/A");

  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={2}>
          {/* Left: Form */}
          <Grid xs={12} lg={7}>
            <Sheet
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: "lg",
                boxShadow: "md",
                bgcolor: "background.level1",
              }}
              component="form"
              onSubmit={handleSubmit}
            >
              <Box textAlign="center" sx={{ mb: 3 }}>
                <img
                  src={Img9}
                  alt="Logo"
                  style={{ height: 50, marginBottom: 10, maxWidth: "100%" }}
                />
                <Typography level="h4" fontWeight="lg" color="warning">
                  Payment Request
                </Typography>
                <Divider
                  inset="none"
                  sx={{ width: { xs: "80%", md: "60%" }, mx: "auto", my: 1 }}
                />
              </Box>

              {/* Project & PO */}
              <Typography level="title-lg" sx={{ mb: 1 }}>
                Project & PO
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>PO Number</FormLabel>
                    <Select
                      name="po_number"
                      value={
                        formData.po_number
                          ? {
                              label: formData.po_number,
                              value: formData.po_number,
                            }
                          : null
                      }
                      onChange={handlePoChange}
                      options={getFormData.poNumbers?.map((po) => ({
                        value: po,
                        label: po,
                      }))}
                      placeholder={isPoListLoading ? "Loading..." : "Select PO"}
                      isDisabled={formData.pay_type === "Adjustment"}
                      isLoading={isPoListLoading}
                      isClearable
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Project</FormLabel>
                    {hasRealPO ? (
                      <Input
                        name="p_id"
                        value={
                          getFormData.projectIDs.find(
                            (project) => project.p_id === formData.p_id
                          )?.code || ""
                        }
                        placeholder="Project Code"
                        readOnly
                      />
                    ) : (
                      <Select
                        name="p_id"
                        value={
                          formData.p_id
                            ? {
                                label: getFormData.projectIDs.find(
                                  (project) => project.p_id === formData.p_id
                                )?.code,
                                value: formData.p_id,
                              }
                            : null
                        }
                        onChange={(e) =>
                          handleChange({
                            target: { name: "p_id", value: e?.value },
                          })
                        }
                        options={getFormData.projectIDs.map((project) => ({
                          label: project.code,
                          value: project.p_id,
                        }))}
                        isLoading={isProjectsLoading}
                        isClearable
                        placeholder="Select Project"
                        noOptionsMessage={({ inputValue }) =>
                          isProjectsLoading
                            ? "Fetching..."
                            : inputValue
                              ? "No matches"
                              : "No options"
                        }
                      />
                    )}
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Project Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      placeholder="Project Name"
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={3}>
                  <FormControl>
                    <FormLabel>Client</FormLabel>
                    <Input
                      name="customer"
                      value={formData.customer || ""}
                      onChange={handleChange}
                      placeholder="Client Name"
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={3}>
                  <FormControl>
                    <FormLabel>Group</FormLabel>
                    <Input
                      name="p_group"
                      value={formData.p_group || ""}
                      onChange={handleChange}
                      placeholder="Group Name"
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={4}>
                  <FormControl>
                    <FormLabel>Payment Type</FormLabel>
                    <Select
                      name="pay_type"
                      value={
                        formData.pay_type
                          ? {
                              label: formData.pay_type,
                              value: formData.pay_type,
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleChange({
                          target: {
                            name: "pay_type",
                            value: selectedOption?.value,
                          },
                        })
                      }
                      options={[
                        {
                          label: "Payment Against PO",
                          value: "Payment Against PO",
                        },
                        { label: "Adjustment", value: "Adjustment" },
                        {
                          label: "Slnko Service Charge",
                          value: "Slnko Service Charge",
                        },
                        { label: "Other", value: "Other" },
                      ]}
                      placeholder="Select type"
                      isClearable
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Typography level="title-lg" sx={{ mt: 3, mb: 1 }}>
                Amounts & Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Amount Requested</FormLabel>
                    <Input
                      startDecorator={<span>₹</span>}
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={formData.amount_paid}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, "");
                        const value = raw === "" ? "" : parseFloat(raw);
                        const pb =
                          formData.po_balance === "N/A"
                            ? Infinity
                            : parseFloat(formData.po_balance) || 0;
                        if (pb !== Infinity && value !== "" && value > pb) {
                          toast.warning(
                            "Amount Requested can't be greater than PO Balance!"
                          );
                          setFormData((prev) => ({
                            ...prev,
                            amount_paid: String(pb),
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            amount_paid:
                              value === "" || Number.isNaN(value)
                                ? ""
                                : String(value),
                          }));
                        }
                      }}
                      placeholder="0.00"
                      required
                    />
                    <FormHelperText>
                      {formData.amount_paid
                        ? formatINR(formData.amount_paid)
                        : "Enter amount"}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Requested Date</FormLabel>
                    <Input
                      type="date"
                      name="dbt_date"
                      value={formData.dbt_date}
                      onChange={handleChange}
                      placeholder="Request Date"
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Vendor</FormLabel>
                    <Input
                      name="vendor"
                      value={formData.vendor || ""}
                      onChange={handleChange}
                      placeholder="Vendor / Credited to"
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Requested For</FormLabel>
                    <Input
                      name="paid_for"
                      value={formData.paid_for}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paid_for: e.target.value,
                        }))
                      }
                      placeholder="What is this payment for?"
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={4}>
                  <FormControl>
                    <FormLabel>PO Value (with GST)</FormLabel>
                    <Input
                      name="po_value"
                      value={formData.po_value || ""}
                      placeholder="PO Value"
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={4}>
                  <FormControl>
                    <FormLabel>Total Advance Paid</FormLabel>
                    <Input
                      name="total_advance_paid"
                      value={formData.total_advance_paid}
                      placeholder="Total Advance Paid"
                      readOnly
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={4}>
                  <FormControl>
                    <FormLabel>Current PO Balance</FormLabel>
                    <Input
                      name="po_balance"
                      value={formData.po_balance || ""}
                      placeholder="Current PO Balance"
                      readOnly
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={12}>
                  <FormControl error={!!errors.comment}>
                    <FormLabel>Payment Description</FormLabel>
                    <Textarea
                      name="comment"
                      value={formData.comment || ""}
                      onChange={handleChange}
                      placeholder="Add remarks for this Payment"
                      minRows={3}
                      required
                    />
                    {errors.comment && (
                      <FormHelperText>{errors.comment}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Credit */}
              <Typography level="title-lg" sx={{ mt: 3, mb: 1 }}>
                Credit
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid xs={12} sm={2} display="flex" alignItems="center">
                  <FormControl orientation="horizontal">
                    <FormLabel sx={{ mr: 2 }}>Is Credit?</FormLabel>
                    <Switch
                      checked={formData.credit.credit_status === true}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          credit: {
                            ...prev.credit,
                            credit_status: e.target.checked,
                          },
                        }))
                      }
                    />
                  </FormControl>
                </Grid>

                {formData.credit.credit_status === true && (
                  <>
                    <Grid xs={12} sm={3}>
                      <FormControl>
                        <FormLabel>Credit Deadline</FormLabel>
                        <Input
                          type="date"
                          name="credit_deadline"
                          value={formData.credit.credit_deadline || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              credit: {
                                ...prev.credit,
                                credit_deadline: e.target.value,
                              },
                            }))
                          }
                          required
                        />
                      </FormControl>
                    </Grid>

                    <Grid xs={12} sm={7}>
                      <FormControl>
                        <FormLabel>Credit Remarks</FormLabel>
                        <Textarea
                          name="credit_remarks"
                          value={formData.credit.credit_remarks || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              credit: {
                                ...prev.credit,
                                credit_remarks: e.target.value,
                              },
                            }))
                          }
                          placeholder="Add remarks for this credit"
                          minRows={3}
                          required
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Beneficiary */}
              <Typography level="title-lg" sx={{ mt: 3, mb: 1 }}>
                Beneficiary Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Input defaultValue={"Account Transfer"} disabled />
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Beneficiary Name</FormLabel>
                    <Input
                      name="benificiary"
                      value={formData.benificiary || ""}
                      onChange={handleChange}
                      placeholder="Beneficiary Name"
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Account Number</FormLabel>
                    <Input
                      name="acc_number"
                      value={formData.acc_number || ""}
                      onChange={handleChange}
                      placeholder="Beneficiary Account Number"
                      required
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>IFSC Code</FormLabel>
                    <Input
                      name="ifsc"
                      value={formData.ifsc || ""}
                      onChange={handleChange}
                      placeholder="IFSC Code"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Bank Name</FormLabel>
                    <Input
                      name="branch"
                      value={formData.branch || ""}
                      onChange={handleChange}
                      placeholder="Bank Name"
                      required
                    />
                  </FormControl>
                </Grid>
              </Grid>

              {/* Actions */}
              <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Grid>
                  <Button
                    type="submit"
                    variant="solid"
                    color="primary"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Submit
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => navigate("/daily-payment-request")}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </Grid>
              </Grid>
            </Sheet>
          </Grid>

          {/* Right: Summary */}
          <Grid xs={12} lg={5}>
            <Sheet
              sx={{
                position: { lg: "sticky" },
                top: { lg: 24 },
                p: 2,
                borderRadius: "lg",
                boxShadow: "md",
              }}
            >
              <Typography level="title-lg" sx={{ mb: 1 }}>
                Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography level="body-sm" color="neutral">
                    Project
                  </Typography>
                  <Chip variant="soft" size="sm">
                    {selectedProjectCode || "—"}
                  </Chip>
                </Box>
                <Box>
                  <Typography level="body-sm" color="neutral">
                    PO Number
                  </Typography>
                  <Chip variant="soft" size="sm">
                    {formData.po_number || "—"}
                  </Chip>
                </Box>
                <Box>
                  <Typography level="body-sm" color="neutral">
                    PO Value
                  </Typography>
                  <Typography>{formatINR(poValueNum)}</Typography>
                </Box>
                <Box>
                  <Typography level="body-sm" color="neutral">
                    Advance Paid
                  </Typography>
                  <Typography>{formatINR(totalAdvNum)}</Typography>
                </Box>
                <Box>
                  <Typography level="body-sm" color="neutral">
                    Current Balance
                  </Typography>
                  <Typography>
                    {poBalanceNum === null ? "N/A" : formatINR(poBalanceNum)}
                  </Typography>
                </Box>
                <Box>
                  <Typography level="body-sm" color="neutral">
                    Requested
                  </Typography>
                  <Typography>{formatINR(amountRequested)}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography level="body-sm" color="neutral" sx={{ mb: 0.5 }}>
                  Remaining after request
                </Typography>
                <LinearProgress
                  determinate
                  value={balancePercent}
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <Typography level="body-sm" sx={{ mt: 0.5 }}>
                  {poValueNum > 0
                    ? formatINR(
                        Math.max(
                          0,
                          poValueNum - (totalAdvNum + amountRequested)
                        )
                      )
                    : "—"}
                </Typography>
              </Box>

              {poBalanceNum !== null && amountRequested > poBalanceNum && (
                <Chip color="danger" variant="soft" sx={{ mt: 2 }}>
                  Requested exceeds PO Balance
                </Chip>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "grid", gap: 1 }}>
                <Tooltip title="Will appear on the payment instruction">
                  <Chip variant="outlined" size="sm">
                    Beneficiary: {formData.benificiary || "—"}
                  </Chip>
                </Tooltip>
                <Chip variant="outlined" size="sm">
                  Account: {formData.acc_number || "—"}
                </Chip>
                <Chip variant="outlined" size="sm">
                  IFSC: {formData.ifsc || "—"}
                </Chip>
                <Chip variant="outlined" size="sm">
                  Bank: {formData.branch || "—"}
                </Chip>
                {formData.credit.credit_status ? (
                  <Chip color="warning" variant="soft" size="sm">
                    Credit until {formData.credit.credit_deadline || "—"}
                  </Chip>
                ) : (
                  <Chip variant="soft" size="sm">
                    No Credit
                  </Chip>
                )}
              </Box>
            </Sheet>
          </Grid>
        </Grid>
      </Container>
    </CssBaseline>
  );
}

export default PaymentRequestForm;
