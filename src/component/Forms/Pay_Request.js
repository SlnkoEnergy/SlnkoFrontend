import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Grid,
  Input,
  Sheet,
  Typography
} from "@mui/joy";
import React, { useEffect, useState } from "react";
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
  });


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
    acc_match:"",
    utr:"",
    total_advance_paid:""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, poNumbersResponse, vendorsResponse] = await Promise.all([
          Axios.get("/get-all-project"),
          Axios.get("/get-all-po"),
          Axios.get("/get-all-vendor"),
        ]);

        setGetFormData({
          projectIDs: projectsResponse.data.data || [],
          poNumbers: poNumbersResponse.data.data || [],
          vendors: vendorsResponse.data.data || [],
        });

        // console.log("Fetched all data:", {
        //   projectIDs: projectsResponse.data.data,
        //   poNumbers: poNumbersResponse.data.data,
        //   vendors: vendorsResponse.data.data,
        // });
      } catch (error) {
        console.error("Error fetching data with Promise.all:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pay_type") {
      if (value === "adjustment") {
        setFormData((prev) => ({
          ...prev,
          paid_for: "Customer Adjustment",
          po_number: "N/A",
          po_value: "N/A",
          total_advance_paid: "N/A",
          po_balance: "N/A",
          benificiary: "",
          acc_number: "",
          ifsc: "",
          branch: "",
        }));
      } else if (value === "slnko_service_charge") {
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

    if (name === "amount_paid") {
      const amount_paid = parseFloat(value);
      const po_value = parseFloat(formData.po_value);

      if (amount_paid > po_value) {
        alert("Amount Requested is greater than PO value!");
        setFormData((prev) => ({
          ...prev,
          amount_paid: po_value,
        }));
      }
    }

    if (name === "p_id" && value) {
      const selectedProject = getFormData.projectIDs.find(
        (project) => project.p_id === value
      );
    
      if (selectedProject) {
        console.log("Selected project:", selectedProject);
        setFormData((prev) => ( {
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

  const handleSelectChange = (selectedOption: { value: string; label: string }) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        p_id: selectedOption.value,
        name: selectedOption.label, // assuming label corresponds to the project name
      }));
    }
  };

  const handlePoChange = (selectedOption: { value: string; label: string }) => {
    const selectedPo = getFormData.poNumbers.find((po) => po.po_number === selectedOption?.value);
    if (selectedPo) {
      const poValue = parseFloat(selectedPo.po_value || "0");
      const totalAdvancePaid = parseFloat(selectedPo.total_advance_paid || "0");
      const po_balance = poValue - totalAdvancePaid;
      setFormData((prev) => ({
        ...prev,
        po_number: selectedPo.po_number,
        paid_for: selectedPo.item || "",
        vendor: selectedPo.vendor || "",
        po_value: poValue.toString(),
        total_advance_paid: totalAdvancePaid.toString(),
        po_balance: po_balance.toString(),
      }));

      // Update beneficiary and other details if vendor is found
      if (selectedPo.vendor) {
        const matchedVendor = getFormData.vendors.find(
          (vendor) => vendor.name === selectedPo.vendor
        );

        if (matchedVendor) {
          setFormData((prev) => ({
            ...prev,
            benificiary: matchedVendor.Beneficiary_Name || "",
            acc_number: matchedVendor.Account_No || "",
            ifsc: matchedVendor.IFSC_Code || "",
            branch: matchedVendor.Bank_Name || "",
            
          }));
        }
      }
    }
  };
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    // console.log("Form data submitted:", formData);

    try {
      const response = await Axios.post("/add-pay-request", formData);
      const { message } = response.data;

    setResponseMessage(message);
    toast.success("Payment request submitted successfully:", response.data);

      // console.log("Payment request submitted successfully", response.data);
      navigate("/daily-payment-request");
    } catch (error) {
          console.error(
            "Error submitting payment request:",
            error.response?.data || error.message
          );
          setResponseMessage("Failed to add payment. Please try again!!");
    
          toast.error("Something Went Wrong?");
        } finally {
          setIsLoading(false);
        }
  };
  


  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Sheet
          sx={{
            p: 3,
            borderRadius: "md",
            boxShadow: "sm",
            bgcolor: "background.level1",
          }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            <img
              src={Img9}
              alt="Logo"
              style={{
                height: "50px",
                marginBottom: "10px",
                maxWidth: "100%",
              }}
            />

            <Typography level="h4" fontWeight="bold" color="warning">
              Payment Request Form
            </Typography>
            <Divider inset="none" sx={{ width: "50%", margin: "8px auto" }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
              <Select
                name="p_id"
                value={formData.p_id}
                onChange={(e) => handleChange({ target: { name: "p_id", value: e.value } })}
                options={getFormData.projectIDs.map((project) => ({
                  label: project.code,
                  value: project.p_id
                }))}
                placeholder="Select Project"
                getOptionLabel={(e) => `${e.label} - ${e.value}`} 
              />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Project Name"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="customer"
                  value={formData.customer || ""}
                  onChange={handleChange}
                  placeholder="Client Name"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="p_group"
                  value={formData.p_group || ""}
                  onChange={handleChange}
                  placeholder="Group Name"
                  
                />
              </Grid>

              {/* <Grid xs={12} sm={4}>
                <Input
                  name="pay_id"
                  value={formData.pay_id}
                  onChange={handleChange}
                  placeholder="Payment ID"
                  required
                />
              </Grid> */}

              <Grid xs={12} sm={4}>
              <Select
                  name="pay_type"
                  value={formData.pay_type ? { label: formData.pay_type, value: formData.pay_type } : null}
                  onChange={(selectedOption) => handleChange({ target: { name: "pay_type", value: selectedOption?.value } })}
                  options={[
                    { label: "Payment Against PO", value: "against_po" },
                    { label: "Adjustment", value: "adjustment" },
                    { label: "Slnko Service Charge", value: "slnko_service_charge" },
                    { label: "Other", value: "Other" },
                  ]}
                  placeholder="Payment Type"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Select
                  name="po_number"
                  value={formData.po_number ? { label: formData.po_number, value: formData.po_number } : null}
                  onChange={handlePoChange}
                  options={getFormData.poNumbers.map((po) => ({
                    value: po.po_number,
                    label: po.po_number,
                  }))}
                  placeholder="PO Number"
                  isDisabled={formData.pay_type === "adjustment"}
                />
              </Grid>


              <Grid xs={12} sm={4}>
                <Input
                  type="number"
                  value={formData.amount_paid}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      amount_paid: e.target.value, 
    }))
  }
                  
                  placeholder="Amount Requested (INR)"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  type="number"
                  name="amt_for_customer"
                  value={formData.amt_for_customer || ""}
                  onChange={handleChange}
                  placeholder="Amount for Customers (INR)"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  type="date"
                  name="dbt_date"
                  value={formData.dbt_date}
                  onChange={handleChange}
                  placeholder="Request Date"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Input
    name="paid_for"
    value={formData.item ||formData.paid_for }
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        paid_for: e.target.value, 
      }))
    }
    placeholder="Requested For"
    required
  />
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  name="vendor"
                  value={formData.vendor || ""}
                  onChange={handleChange}
                  placeholder="Vendor/Credited to"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Payment Description"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  name="po_value"
                  value={formData.po_value || ""}
                  onChange={handleChange}
                  placeholder="PO Value"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
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
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  name="po_balance"
                  value={formData.po_balance || ""}
                  onChange={handleChange}
                  placeholder="Current PO Balance"
                  required
                />
              </Grid>

              <Grid xs={12}>
                <Typography level="h6" sx={{ mt: 2, mb: 1 }}>
                  Beneficiary Details
                </Typography>
              </Grid>

              <Grid xs={12} sm={12}>
                <Input
                defaultValue={"Account Transfer"}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="benificiary"
                  value={formData.benificiary || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary Name"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="acc_number"
                  value={formData.acc_number || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary Account Number"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="ifsc"
                  value={formData.ifsc || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary IFSC Code"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
                <Input
                  name="branch"
                  value={formData.branch || ""}
                  onChange={handleChange}
                  placeholder="Bank Name"
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Grid>
                <Button type="submit" variant="solid" color="primary">
                  Submit
                </Button>
              </Grid>

              <Grid>
                <Button variant="outlined" color="neutral" onClick={() => navigate("/standby-request")}>
                  StandBy
                </Button>
              </Grid>

              <Grid>
                <Button variant="outlined" color="neutral" onClick={() => navigate("/daily-payment-request")}>
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