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

const PaymentRequestSummary = () => {
  const [projectData, setProjectData] = useState(null);
  // const [itemData, setItemData] = useState(null);
  const [payRequestData, setPayRequestData] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({ project: true, payRequest: true });

  // Fetch Project Data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(
          "/get-all-project"
        );
        console.log("Fetched Project Data:", projectResponse.data?.data?.[0]);
        setProjectData(projectResponse.data?.data?.[0] || {});
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError((prev) => ({ ...prev, project: "Failed to fetch project data" }));
      } finally {
        setLoading((prev) => ({ ...prev, project: false }));
      }
    };

    fetchProjectData();
  }, []);

 
  
  useEffect(() => {
    const fetchPayRequestData = async () => {
      try {
        const payRequestResponse = await axios.get(
          "/get-pay-summary"
        );
        console.log("Full Pay Request Data:", payRequestResponse.data);
        setPayRequestData(payRequestResponse.data?.[0] || {}); // Handle arrays
      } catch (err) {
        console.error("Error fetching pay request data:", err);
        setError((prev) => ({
          ...prev,
          payRequest: "Failed to fetch pay request data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, payRequest: false }));
      }
    };
  
    fetchPayRequestData();
  }, []);
  

  const handleStandby = () => {
    console.log("Standby button clicked.");
  };

  const handleBack = () => {
    console.log("Back button clicked.");
  };

  if (Object.values(loading).some((isLoading) => isLoading)) {
    return <Typography>Loading...</Typography>;
  }

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
    amount_paid: payRequestData?.amount_paid || "",
    paid_for: payRequestData?.paid_for || "",
    paid_to: payRequestData?.paid_to || "",
    pay_type: payRequestData?.pay_type || "",
    po_number: payRequestData?.po_number || "",
    approved: payRequestData?.approved || "",
    comment: payRequestData?.comment || "",
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
            Payment Request Summary
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
            { label: "Amount", name: "amount_paid" },
            { label: "Paid For", name: "paid_for" },
            { label: "Paid To", name: "paid_to" },
            { label: "Payment Type", name: "pay_type" },
            { label: "PO Number", name: "po_number" },
            { label: "Payment Status", name: "approved" },
            { label: "Payment Description", name: "comment" },
          ].map((field, index) => (
            <Grid item xs={12} md={12} key={index}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                variant="outlined"
                disabled
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
            onClick={handleStandby}
          >
            Standby
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleBack}>
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentRequestSummary;