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
  Sheet,
  Switch,
  Textarea,
  Typography,
} from "@mui/joy";
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import Img9 from "../../assets/solar.png";
import Axios from "../../utils/Axios";

function PaymentRequestForm() {
  const navigate = useNavigate();
  const [getFormData, setGetFormData] = useState({
    projectIDs: [],
    poNumbers: [],
    vendors: [],
    pays: [],
  });

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    p_id: "",
    name: "",
    customer: "",
    p_group: "",
    pay_type: "",
    po_number: "",
    amt_for_customer: "",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { "x-auth-token": token } };

        const [
          projectsResponse,
          poNumbersResponse,
          vendorsResponse,
          payResponse,
        ] = await Promise.all([
          Axios.get("/get-all-projecT-IT", config),
          Axios.get("/get-all-pO-IT", config),
          Axios.get("/get-all-vendoR-IT", config),
          Axios.get("/get-pay-summarY-IT", config),
        ]);

        setGetFormData({
          projectIDs: projectsResponse.data.data || [],
          poNumbers: poNumbersResponse.data.data || [],
          vendors: vendorsResponse.data.data || [],
          pays: payResponse.data.data || [],
        });
      } catch (error) {
        console.error("Error fetching data with Promise.all:", error);
      } finally {
        setIsProjectsLoading(false);
        // setIsPOLoading(false);
      }
    };

    fetchData();
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
          amt_for_customer: "",
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
        console.log("Selected project:", selectedProject);
        setFormData((prev) => ({
          ...prev,
          name: selectedProject.name || "",
          customer: selectedProject.customer || "",
          p_group: selectedProject.p_group || "",
        }));
      } else {
        console.warn("No project found for projectID:", value);
      }
    }
  };

  const handlePoChange = (selectedOption) => {
    const selectedPo = getFormData.poNumbers.find(
      (po) => po.po_number === selectedOption?.value
    );

    if (!selectedPo) {
      // console.warn("PO number not found in the list:", selectedOption?.value);
      return;
    }

    const poValue = parseFloat(selectedPo.po_value ?? "0");

    const totalAdvancePaid = getFormData.pays
      .filter(
        (pay) =>
          pay.po_number === selectedPo.po_number && pay.approved === "Approved"
      )
      .reduce((sum, pay) => sum + parseFloat(pay.amount_paid ?? "0"), 0);

    const po_balance = poValue - totalAdvancePaid;

    setFormData((prev) => ({
      ...prev,
      po_number: selectedPo.po_number,
      paid_for: selectedPo.item ?? "",
      vendor: selectedPo.vendor ?? "",
      po_value: poValue.toString(),
      total_advance_paid: totalAdvancePaid.toString(),
      po_balance: po_balance.toString(),
    }));

    const matchingProject = getFormData.projectIDs.find(
      (project) => project.code === selectedPo.p_id
    );

    if (matchingProject) {
      // console.log("Matched Project details from PO p_id:", matchingProject);
      setFormData((prev) => ({
        ...prev,
        p_id: matchingProject.p_id ?? "",
        projectID: matchingProject.code ?? "",
        name: matchingProject.name ?? "",
        customer: matchingProject.customer ?? "",
        p_group: matchingProject.p_group ?? "",
      }));
    } else {
      console.warn("No matching project found for p_id:", selectedPo.p_id);
    }

    if (selectedPo.vendor) {
      const matchedVendor = getFormData.vendors.find(
        (vendor) => vendor.name === selectedPo.vendor
      );

      if (matchedVendor) {
        console.log("Matched Vendor:", matchedVendor);
        setFormData((prev) => ({
          ...prev,
          benificiary: matchedVendor.name ?? "",
          acc_number: matchedVendor.Account_No ?? "",
          ifsc: matchedVendor.IFSC_Code ?? "",
          branch: matchedVendor.Bank_Name ?? "",
        }));
      } else {
        console.warn("No matching vendor found for:", selectedPo.vendor);
      }
    }
  };

  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);

    if (userData) {
      setFormData((prev) => ({
        ...prev,
        submitted_by: userData.name || "",
      }));
    }
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const [errors, setErrors] = useState({});

  const validateBeforeSubmit = (data) => {
    const e = {};

    if (!data.p_id) e.p_id = "Please select a project.";
    if (!data.pay_type) e.pay_type = "Please choose a payment type.";
    if (!data.dbt_date) e.dbt_date = "Requested date is required.";
    if (!data.paid_for) e.paid_for = "Please enter what this is requested for.";
    if (!data.vendor) e.vendor = "Vendor / Credited to is required.";
    if (!data.comment) e.comment = "Please add a short description.";

    if (data.pay_type === "Payment Against PO" && !data.po_number) {
      e.po_number = "PO number is required for Payment Against PO.";
    }

    const amt = Number(data.amount_paid || 0);
    const afc = Number(data.amt_for_customer || 0);
    if (!amt || amt <= 0) e.amount_paid = "Enter a valid Amount Requested.";
    if (afc < 0)
      e.amt_for_customer = "Amount for customers cannot be negative.";
    if (afc > amt) e.amt_for_customer = "Cannot exceed Amount Requested.";

    if (!data.benificiary) e.benificiary = "Beneficiary name is required.";
    if (!data.acc_number) e.acc_number = "Account number is required.";
    if (!data.ifsc) e.ifsc = "IFSC is required.";
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

        e.credit_deadline = `Credit deadline must be at least 2 days after the debit date. Earliest allowed: ${minValidDate
          .toISOString()
          .split("T")[0]}`;
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
      }

      switch (status) {
        case 400:
        case 422:
          toast.error("Some inputs look invalid. Please review the form.");
          break;
        case 401:
          toast.error("You’re not signed in. Please login and try again.");
          break;
        case 403:
          toast.error("You don’t have permission to perform this action.");
          break;
        case 404:
          toast.error("Endpoint not found. Please contact support.");
          break;
        case 409:
          toast.error(
            "Duplicate or conflicting request. Please check your data."
          );
          break;
        case 429:
          toast.error("Too many requests. Please wait a moment and retry.");
          break;
        case 500:
        default: {
          if (err?.code === "ECONNABORTED") {
            toast.error("Request timed out. Please try again.");
          } else if (!status) {
            toast.error("Network error. Check your connection and retry.");
          } else {
            toast.error(apiMsg);
          }
        }
      }

      setResponseMessage(
        typeof apiMsg === "string"
          ? apiMsg
          : "Failed to add payment. Please try again!!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProjectCode =
    getFormData.projectIDs.find((p) => p.p_id === formData.p_id)?.code || "";

  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Sheet
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: "lg",
            boxShadow: "md",
            bgcolor: "background.level1",
          }}
        >
          <Box textAlign="center" sx={{ mb: 3 }}>
            <img
              src={Img9}
              alt="Logo"
              style={{ height: "50px", marginBottom: "10px", maxWidth: "100%" }}
            />

            <Typography level="h4" fontWeight="lg" color="warning">
              Payment Request Form
            </Typography>
            <Divider inset="none" sx={{ width: "50%", mx: "auto", my: 1 }} />
            {selectedProjectCode ? (
              <Chip variant="soft" color="primary" size="md" sx={{ mb: 1 }}>
                Project: {selectedProjectCode}
              </Chip>
            ) : null}
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Project */}
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Projects</FormLabel>

                  {formData.pay_type === "Payment Against PO" &&
                  formData.po_number ? (
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
                          target: {
                            name: "p_id",
                            value: e?.value,
                          },
                        })
                      }
                      options={getFormData.projectIDs.map((project) => ({
                        label: project.code,
                        value: project.p_id,
                      }))}
                      isLoading={isProjectsLoading}
                      noOptionsMessage={({ inputValue }) =>
                        isProjectsLoading
                          ? "Fetching..."
                          : inputValue
                            ? "No matches"
                            : "No options"
                      }
                      placeholder="Select Project"
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
                    required
                    readOnly
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Client Name</FormLabel>
                  <Input
                    name="customer"
                    value={formData.customer || ""}
                    onChange={handleChange}
                    placeholder="Client Name"
                    required
                    readOnly
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Group Name</FormLabel>
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
                        ? { label: formData.pay_type, value: formData.pay_type }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleChange({
                        target: {
                          name: "pay_type",
                          value: selectedOption.value,
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
                    placeholder="Payment Type"
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
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
                    options={getFormData.poNumbers.map((po) => ({
                      value: po.po_number,
                      label: po.po_number,
                    }))}
                    placeholder="PO Number"
                    isDisabled={formData.pay_type === "Adjustment"}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Amount Requested (INR)</FormLabel>
                  <Input
                    type="text"
                    value={formData.amount_paid}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || "";
                      const po_balance =
                        formData.po_balance === "N/A"
                          ? Infinity
                          : parseFloat(formData.po_balance) || 0;

                      if (po_balance !== Infinity && value > po_balance) {
                        toast.warning(
                          "Amount Requested can't be greater than PO Balance!"
                        );
                        setFormData((prev) => ({
                          ...prev,
                          amount_paid: po_balance,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          amount_paid: value,
                        }));
                      }
                    }}
                    placeholder="Amount Requested (INR)"
                    required
                  />
                  <FormHelperText>
                    {formData.amount_paid
                      ? `₹${formData.amount_paid}`
                      : "Enter amount"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Amount for Customers</FormLabel>
                  <Input
                    type="text"
                    name="amt_for_customer"
                    value={formData.amt_for_customer || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const amountRequested =
                        parseFloat(formData.amount_paid) || 0;

                      if (value > amountRequested) {
                        toast.warning(
                          "Amount for Customers can't be greater than Amount Requested!"
                        );
                        setFormData((prev) => ({
                          ...prev,
                          amt_for_customer: amountRequested,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          amt_for_customer: value,
                        }));
                      }
                    }}
                    placeholder="Amount for Customers (INR)"
                    required
                  />
                  <FormHelperText>
                    {formData.amt_for_customer
                      ? `₹${formData.amt_for_customer}`
                      : "Cannot exceed 'Amount Requested'"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
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

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Requested For</FormLabel>
                  <Input
                    name="paid_for"
                    value={formData.item || formData.paid_for}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paid_for: e.target.value,
                      }))
                    }
                    placeholder="Requested For"
                    required
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Vendor</FormLabel>
                  <Input
                    name="vendor"
                    value={formData.vendor || ""}
                    onChange={handleChange}
                    placeholder="Vendor/Credited to"
                    required
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Payment Description</FormLabel>
                  <Input
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Payment Description"
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
                    onChange={handleChange}
                    placeholder="PO Value"
                    required
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4}>
                <FormControl>
                  <FormLabel>Total Advance Paid</FormLabel>
                  <Input
                    name="total_advance_paid"
                    value={formData.total_advance_paid}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_advance_paid: e.target.value,
                      }))
                    }
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
                    onChange={handleChange}
                    placeholder="Current PO Balance"
                    required
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4} display="flex" alignItems="flex-end">
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
                  <Grid xs={12} sm={6}>
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

                  <Grid xs={12} sm={6}>
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

              <Grid xs={12}>
                <Typography level="title-lg" sx={{ mt: 1 }}>
                  Beneficiary Details
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Grid>

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
                  <FormLabel>Beneficiary Account Number</FormLabel>
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
                  <FormLabel>Beneficiary IFSC Code</FormLabel>
                  <Input
                    name="ifsc"
                    value={formData.ifsc || ""}
                    onChange={handleChange}
                    placeholder="Beneficiary IFSC Code"
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

            <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
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
          </Box>
        </Sheet>
      </Container>
    </CssBaseline>
  );
}

export default PaymentRequestForm;
