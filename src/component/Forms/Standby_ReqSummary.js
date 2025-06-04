import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Input,
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
} from "@mui/joy";
import Axios from "../../utils/Axios";
import Img10 from "../../assets/pr-summary.png";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";

const PaymentRequestSummary = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [payRequestData, setPayRequestData] = useState(null);
  const [error, setError] = useState({ project: null, payRequest: null });
  const [loading, setLoading] = useState({ project: true, payRequest: true });

  // Fetch Project Data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const projectResponse = await Axios.get("/get-all-projecT-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        const projectIdFromStorage = Number(localStorage.getItem("p_id"));

        if (!projectIdFromStorage) {
          throw new Error("No valid project ID found in localStorage");
        }

        const matchingProject = projectResponse.data?.data?.find(
          (item) => item.p_id === projectIdFromStorage
        );

        if (!matchingProject) {
          throw new Error("No matching project found for the given ID");
        }

        setProjectData(matchingProject);
      } catch (err) {
        setError((prev) => ({
          ...prev,
          project: err.message,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, project: false }));
      }
    };

    fetchProjectData();
  }, []);

  // Fetch Payment Request Data
  useEffect(() => {
    const fetchPayRequestData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const payRequestResponse = await Axios.get("/hold-pay-summarY-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        const payIdFromStorage = localStorage.getItem("standby_summary");

        if (!payIdFromStorage) {
          throw new Error("No valid payment ID found in localStorage");
        }

        const matchingPayRequest = payRequestResponse.data?.data?.find(
          (item) =>
            item.pay_id === payIdFromStorage
        );

        if (!matchingPayRequest) {
          throw new Error(
            "No matching payment request found with 'Pending' status"
          );
        }

        setPayRequestData(matchingPayRequest);
      } catch (err) {
        setError((prev) => ({
          ...prev,
          payRequest: err.message,
        }));
      } finally {
        setLoading((prev) => ({ ...prev, payRequest: false }));
      }
    };

    fetchPayRequestData();
  }, []);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        pay_id: payRequestData?.pay_id || "",
        approved: payRequestData?.approved || "",
      };

      const response = await Axios.post("/hold-payto-payrequest", payload, {
  headers: {
    "x-auth-token": token,
  },
});

      if (response.status === 200 || response.status === 201) {
        // console.log("Data successfully submitted:", response.data);
        toast.success("Data sent to Payment Request Records");
        navigate("/daily-payment-request");
      } else {
        console.error("Unexpected response:", response);
        toast.error("Check your details again !!");
      }
    } catch (err) {
      console.error("Error while submitting data:", err);
      // alert("An error occurred while submitting the payment request.");
      toast.error("Contact Technical Team.. !!");
    }
  };

  const handleBack = () => {
    navigate("/standby_records");
  };

  if (Object.values(loading).some((isLoading) => isLoading)) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  if (Object.values(error).some(Boolean)) {
    return (
      <Typography variant="h5" color="error">
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
    paid_to: payRequestData?.vendor || "",
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
        width: "100%",
        bgcolor: "background.level1",
        padding: "20px",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 800,
          width: "100%",
          borderRadius: "md",
          boxShadow: "lg",
        }}
      >
        <CardContent>
          <Box textAlign="center" mb={3}>
            <img
              src={Img10}
              alt="logo-icon"
              style={{ height: "50px", marginBottom: "10px" }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontFamily: "Bona Nova, serif",
                textTransform: "uppercase",
                color: "text.primary",
              }}
            >
              StandBy Request Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
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
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {field.label}
                                </Typography>
                <Input
                  fullWidth
                  // label={field.label}
                  // name={field.name}
                  value={formData[field.name]}
                  variant="outlined"
                  disabled
                  sx={{ mb: 2 }}
                  // InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                />
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={3}>
  <Button
    variant="contained"
    color="primary"
    onClick={handleSubmit}
    sx={{
      backgroundColor: '#007BFF',
      color: '#fff',
      fontWeight: 'bold',
      padding: '8px 16px',
      borderRadius: '8px',
      textTransform: 'none',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.2s ease, background-color 0.3s ease',
      '&:hover': {
        backgroundColor: '#0056b3',
        transform: 'scale(1.05)',
      },
    }}
  >
    Submit Payment
  </Button> &nbsp; &nbsp;
  <Button
    variant="outlined"
    color="neutral"
    onClick={handleBack}
    sx={{
      borderColor: '#6c757d',
      color: '#6c757d',
      fontWeight: 'bold',
      padding: '8px 16px',
      borderRadius: '8px',
      textTransform: 'none',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease, color 0.3s ease, border-color 0.3s ease',
      '&:hover': {
        color: '#fff',
        borderColor: '#007BFF',
        backgroundColor: 'gray',
        transform: 'scale(1.05)',
      },
    }}
  >
    Back
  </Button>
</Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentRequestSummary;
