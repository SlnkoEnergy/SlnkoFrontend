import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Grid,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import Img9 from "../../assets/solar.png";
import Axios from "../../utils/Axios";

function PaymentRequestForm() {
  const [projectIDs, setProjectIDs] = useState([]);
  const [poNumbers, setPoNumbers] = useState([]);
  const [formData, setFormData] = useState({
    p_id: "",
    name: "",
    customer: "",
    p_group: "",
    pay_id: "",
    pay_type: "",
    po_number: "",
    amt_for_customer: "",
    dbt_date: "",
    item: "",
    vendor: "",
    comment: "",
    po_value: "",
    amount_paid: "",
    po_balance: "",
    benificiary: "",
    acc_number: "",
    ifsc: "",
    branch: "",
    paymentMode: "Account Transfer",
  });

  useEffect(() => {
    const fetchProjectIDs = async () => {
      try {
        const response = await Axios.get("/get-all-project");
        setProjectIDs(response.data.data || []);
      } catch (error) {
        console.error("Error fetching project IDs:", error);
      }
    };

    const fetchPoNumbers = async () => {
      try {
        const response = await Axios.get("/get-all-po");
        setPoNumbers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching PO numbers:", error);
      }
    };

    fetchProjectIDs();
    fetchPoNumbers();
  }, []);

  const getVendorDetails = async (vendorName) => {
    try {
      const response = await Axios.get("/get-all-vendor");
      const matchedVendor = response.data.data?.find(
        (vendor) => vendor.name === vendorName
      );
      return matchedVendor || {};
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      return {};
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || "" }));

    if (name === "po_number" && value) {
      const selectedPo = poNumbers.find((po) => po.po_number === value) || {};
      const po_balance =
        (selectedPo.po_value || 0) - (selectedPo.amount_paid || 0);

      setFormData((prev) => ({
        ...prev,
        item: selectedPo.item || "",
        vendor: selectedPo.vendor || "",
        po_value: selectedPo.po_value || "",
        amount_paid: selectedPo.amount_paid || "",
        po_balance: po_balance || "",
      }));

      if (selectedPo.vendor) {
        getVendorDetails(selectedPo.vendor).then((vendorDetails) => {
          setFormData((prev) => ({
            ...prev,
            benificiary: vendorDetails.benificiary || "",
            acc_number: vendorDetails.acc_number || "",
            ifsc: vendorDetails.ifsc || "",
            branch: vendorDetails.branch || "",
          }));
        });
      }
    }

    if (name === "p_id" && value) {
      const selectedProject = projectIDs.find(
        (project) => project.code === value
      ) || {};
      setFormData((prev) => ({
        ...prev,
        name: selectedProject.name || "",
        customer: selectedProject.customer || "",
        p_group: selectedProject.p_group || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post("/add-pay-request", formData);
      console.log("Payment request submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting payment request:", error);
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
              style={{ height: "50px", marginBottom: "10px" }}
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
                  value={formData.p_id || ""}
                  onChange={(e, value) =>
                    handleChange({ target: { name: "p_id", value } })
                  }
                  placeholder="Project ID"
                  required
                >
                  {projectIDs.map((project) => (
                    <Option key={project._id} value={project.code}>
                      {project.code}
                    </Option>
                  ))}
                </Select>
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

              {/* Other Input Fields */}

              <Grid xs={12} sm={4}>
                <Select
                  name="po_number"
                  value={formData.po_number || ""}
                  onChange={(e, value) =>
                    handleChange({ target: { name: "po_number", value } })
                  }
                  placeholder="PO Number"
                >
                  {poNumbers.map((po) => (
                    <Option key={po._id} value={po.po_number}>
                      {po.po_number}
                    </Option>
                  ))}
                </Select>
              </Grid>

              <Grid xs={12} sm={4}>
                <Input
                  type="number"
                  name="amount_paid"
                  value={formData.amount_paid || ""}
                  onChange={handleChange}
                  placeholder="Amount Requested (INR)"
                  required
                />
              </Grid>

              {/* More fields as needed */}
            </Grid>

            <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Grid>
                <Button type="submit" variant="solid" color="primary">
                  Submit
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
