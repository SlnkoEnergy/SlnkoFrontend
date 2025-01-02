import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  Paper,
  Button,
} from "@mui/material";
import Img10 from "../../assets/pr-summary.png";

const StandbySummaryForm = () => {
  const [projectData, setProjectData] = useState(null);
  const [payRequestData, setPayRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [editableData, setEditableData] = useState({
    amount_paid: "",
  });

  // Fetch Project Data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(
          "/get-all-project"
        );
        setProjectData(projectResponse.data?.data?.[0] || {});
      } catch (err) {
        setError((prev) => ({ ...prev, project: "Failed to fetch project data" }));
      }
    };
    fetchProjectData();
  }, []);

  // Fetch Pay Request Data
  useEffect(() => {
    const fetchPayRequestData = async () => {
      try {
        const payRequestResponse = await axios.get(
          "/get-pay-summary"
        );
        const data = payRequestResponse.data?.[0] || {};
        setPayRequestData(data);
        setEditableData({ amount_paid: data.amount_paid || "" });
      } catch (err) {
        setError((prev) => ({
          ...prev,
          payRequest: "Failed to fetch pay request data",
        }));
      }
    };
    fetchPayRequestData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    console.log("Updated Data:", { ...payRequestData, ...editableData });
    // Add logic to send updated data to the backend here.
  };

  const handleBack = () => {
    console.log("Back button clicked.");
  };

  if (error) {
    return (
      <Typography color="error">
        {Object.values(error).filter(Boolean).join(", ")}
      </Typography>
    );
  }

  const formData = {
    pay_id: payRequestData?.pay_id || "",
    code: projectData?.code || "",
    dbt_date: payRequestData?.dbt_date || "",
    customer: projectData?.customer || "",
    p_group: projectData?.p_group || "",
    amount_paid: editableData.amount_paid,
    paid_for: payRequestData?.paid_for || "",
    vendor: payRequestData?.vendor || "",
    pay_type: payRequestData?.pay_type || "",
    po_number: payRequestData?.po_number || "",
    comment: payRequestData?.comment || "",
    ifsc: payRequestData?.ifsc || "",
    acc_number: payRequestData?.acc_number || "",
    benificiary: payRequestData?.benificiary || "",
    branch: payRequestData?.branch || "",
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        padding: "20px",
      }}
    >
      <Paper
        sx={{
          maxWidth: 800,
          width: "100%",
          padding: "30px",
          borderRadius: "8px",
        }}
      >
        <Box textAlign="center" mb={3}>
          <img
            src={Img10}
            alt="logo-icon"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Bona Nova SC, serif",
              textTransform: "uppercase",
              color: "#12263f",
              fontWeight: 800,
            }}
          >
            StandBy Request Summary
          </Typography>
          <Divider sx={{ width: "50%", margin: "10px auto", fontWeight: "bold" }} />
        </Box>

        <Grid container spacing={2}>
          {[
            { label: "Payment ID", name: "pay_id" },
            { label: "Project ID", name: "code" },
            { label: "Request Date", name: "dbt_date", type: "date" },
            { label: "Client Name", name: "customer" },
            { label: "Group Name", name: "p_group" },
            { label: "Amount", name: "amount_paid", editable: true },
            { label: "Paid For", name: "paid_for" },
            { label: "Paid To", name: "vendor" },
            { label: "Payment Type", name: "pay_type" },
            { label: "PO Number", name: "po_number" },
            { label: "Payment Description", name: "comment" },
            { label: "Beneficiary Name", name: "benificiary" },
            { label: "Beneficiary Account Number", name: "acc_number" },
            { label: "Beneficiary IFSC Code", name: "ifsc" },
            { label: "Bank Name", name: "branch" },
          ].map((field, index) => (
            <Grid item xs={12} md={12} key={index}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                variant="outlined"
                onChange={field.editable ? handleChange : undefined}
                disabled={!field.editable}
                InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
              />
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={handleUpdate}
          >
            Update
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleBack}>
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StandbySummaryForm;