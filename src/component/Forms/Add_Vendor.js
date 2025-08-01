import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Input,
  Divider,
  Container,
} from "@mui/joy";
import Img7 from "../../assets/pay-request.png";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddVendor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    Account_No: "",
    IFSC_Code: "",
    Bank_Name: "",
  });
  const initialFormData = {
    name: "",
    Account_No: "",
    IFSC_Code: "",
    Bank_Name: "",
  };

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Updated Form Data:", formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted with Data:", formData);

    try {
      const token = localStorage.getItem("authToken");

      const response = await Axios.post("/Add-vendoR-IT", formData, {
        headers: {
          "x-auth-token": token,
        },
      });

      setResponseMessage("Vendor added successfully!");
      toast.success("Vendor Added Successfully !!");
      setFormData(initialFormData);
      navigate("/purchase-order");
    } catch (error) {
      let errorMsg = "Failed to add vendor. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMsg = error.response.data.msg || "Bad Request!";
        } else if (error.response.status === 500) {
          errorMsg = "Internal Server Error. Please try again later.";
        } else {
          errorMsg = error.response.data.msg || error.message;
        }
      } else if (error.request) {
        errorMsg = "Network error. Please check your internet connection.";
      } else {
        errorMsg = error.message;
      }

      console.error("Error adding vendor:", errorMsg);
      setResponseMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        p: 3,
        boxShadow: "md",
        borderRadius: "md",
        backgroundColor: "background.surface",
      }}
    >
      <Box textAlign="center" mb={3}>
        <img
          src={Img7}
          alt="logo-icon"
          style={{ height: "50px", marginBottom: "10px" }}
        />
        <Typography level="h4" fontWeight="bold">
          Add Vendor Details
        </Typography>
        <Typography level="body2" textColor="text.secondary">
          Add Vendor Details
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Input
              name="name"
              placeholder="Vendor Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Input
              name="Account_No"
              placeholder="Account Number"
              value={formData.Account_No}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Input
              name="IFSC_Code"
              placeholder="IFSC Code"
              value={formData.IFSC_Code}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Input
              name="Bank_Name"
              placeholder="Bank Name"
              value={formData.Bank_Name}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button type="submit" color="primary" variant="solid">
            Submit
          </Button>
        </Box>
        {responseMessage && (
          <Typography
            sx={{
              mt: 2,
              color: responseMessage.includes("successfully")
                ? "success.main"
                : "danger.main",
            }}
          >
            {responseMessage}
          </Typography>
        )}
      </form>
    </Container>
  );
};

export default AddVendor;
