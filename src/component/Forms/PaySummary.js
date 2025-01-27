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

const PaymentRequestSummary = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [payRequestData, setPayRequestData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({ project: true, payRequest: true });

  // Fetch Project Data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await Axios.get("/get-all-project");
        const projectIdFromStorage = Number(localStorage.getItem("p_id"));

        if (!projectIdFromStorage) {
          console.error("No valid project ID found in localStorage");
          setError((prev) => ({
            ...prev,
            project: "No valid project ID found in localStorage",
          }));
          return;
        }

        console.log("Project ID from localStorage:", projectIdFromStorage);

        // Find the matching project based on project ID
        const matchingProject = projectResponse.data?.data?.find(
          (item) => item.p_id === projectIdFromStorage
        );

        if (matchingProject) {
          console.log("Matching Project Found:", matchingProject);
          setProjectData(matchingProject); // Set the matching project data to state
        } else {
          console.error(
            "No matching project found with the ID:",
            projectIdFromStorage
          );
          setError((prev) => ({
            ...prev,
            project: "No matching project found for the given ID",
          }));
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError((prev) => ({
          ...prev,
          project: "Failed to fetch project data",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, project: false }));
      }
    };

    fetchProjectData();
  }, []);

  useEffect(() => {
    const fetchPayRequestData = async () => {
      try {
        const payRequestResponse = await Axios.get("/get-pay-summary");
        console.log("Full Pay Request Data:", payRequestResponse.data);

        const projectFromStorage = payRequestResponse.data?.data.find(
          (item) => item.pay_id === localStorage.getItem("pay_summary")
        );
        setPayRequestData(projectFromStorage || {});
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
    navigate("/daily-payment-request");
  };

  if (Object.values(loading).some((isLoading) => isLoading)) {
    return <Typography level="h5">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography level="h5" color="danger">
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
              level="h3"
              fontWeight="lg"
              sx={{
                fontFamily: "Bona Nova SC, serif",
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
              <Grid item xs={12} key={index}>
                <Input
                  fullWidth
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  variant="outlined"
                  disabled
                  InputLabelProps={
                    field.type === "date" ? { shrink: true } : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button
              variant="solid"
              color="neutral"
              onClick={handleStandby}
              sx={{
                "&:hover": {
                  backgroundColor: "red",
                  borderColor: "red",
                  color: "white",
                  mr: 2,
                },
              }}
            >
              Standby
            </Button>
            <Button variant="outlined" color="neutral" onClick={handleBack}>
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentRequestSummary;
