import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Input,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Img10 from "../../assets/pr-summary.png";
import Axios from "../../utils/Axios";
import {toast} from "react-toastify";

const PaymentRequestSummary = () => {
  const [projectData, setProjectData] = useState(null);
  const [payRequestData, setPayRequestData] = useState(null);
  const [loading, setLoading] = useState({ project: true, payRequest: true });
  const [error, setError] = useState({ project: "", payRequest: "" });
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project data
        const projectResponse = await Axios.get("/get-all-project");
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

        // Fetch payment request data
        const payRequestResponse = await Axios.get("/get-pay-summary");
        const payIdFromStorage = localStorage.getItem("pay_summary");

        const matchingPayRequest = payRequestResponse.data?.data?.find(
          (item) => item.pay_id === payIdFromStorage
        );

        if (!matchingPayRequest) {
          throw new Error("No matching payment request found for the given ID");
        }
        setPayRequestData(matchingPayRequest);
      } catch (err) {
        setError((prev) => ({
          ...prev,
          project: err.message.includes("project") ? err.message : prev.project,
          payRequest: err.message.includes("payment request")
            ? err.message
            : prev.payRequest,
        }));
      } finally {
        setLoading({ project: false, payRequest: false });
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    navigate("/daily-payment-request");
  };

  const handleStandby = async () => {
    if (!projectData || !payRequestData) {
      alert("Required data is missing!");
      return;
    }

    // Prepare the PayformData with relevant data
    const PayformData = {
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

    // Validate that pay_id exists and approved status is "Pending"
    if (!PayformData.pay_id || PayformData.approved !== "Pending") {
      alert(
        "Invalid data: Either pay_id is missing or approval status is not 'Pending'."
      );
      return;
    }

    setIsPosting(true);
    try {
      const response = await Axios.post("/approve-data-send-holdpay", PayformData);
      // console.log("Standby action successful:", response.data);
      // alert("Data sent successfully!");
      toast.success("Data Hold in StandBy Records");
      navigate("/standby_records");
    } catch (err) {
      console.error("Error sending standby data:", err);
      toast.error("Check your details again !!")
      // alert("Failed to send standby data.");
    } finally {
      setIsPosting(false);
    }
  };

  if (Object.values(loading).some(Boolean)) {
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
              Payment Request Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <Grid container spacing={2}>
            {[
              { label: "Payment ID", name: "pay_id" },
              { label: "Project ID", name: "code" },
              { label: "Request Date", name: "dbt_date" },
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
                  value={formData[field.name]}
                  variant="outlined"
                  disabled
                  sx={{ mb: 2 }}
                />
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStandby}
              disabled={isPosting}
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
              {isPosting ? "Sending..." : "Standby"}
            </Button>  &nbsp; &nbsp;
            <Button variant="outlined" color="neutral" sx={{
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
    }} onClick={handleBack}>
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentRequestSummary;