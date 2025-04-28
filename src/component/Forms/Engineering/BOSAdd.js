import React, { useState } from "react";
import axios from "axios";
import Img1 from "../../../assets/Add New Module.png";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Typography,
  Sheet,
  Card,
  CardContent,
  Grid,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAddBOSMutation } from "../../../redux/Eng/bosSlice";
import { toast } from "react-toastify";

const AddNewBOSForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    itemName: "",
    rating: "",
    technicalSpecification: "",
    tentativeMake: "",
    status: "",
  });

  const [addBOS, { isLoading }] = useAddBOSMutation();

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPayload = {
      ...formData,
    };

    try {
      const response = await addBOS(updatedPayload).unwrap();
      // console.log("Response:", response.data);
      toast.success("BOS Items added successfully!");
      setFormData({
        category: "",
        itemName: "",
        rating: "",
        technicalSpecification: "",
        tentativeMake: "",
        status: "",
      });
      navigate("/module_sheet");
    } catch (error) {
      console.error("Error submitting BOS:", error);
      alert("Failed to submit BOS item.");
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 5, p: 3 }}>
      <Typography level="h4" textAlign="center" mb={3}>
        Add New BOS
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <img
          src={Img1}
          width="40px"
          height="40px"
          alt="Inverter"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Input
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter Category"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Item Name</FormLabel>
              <Input
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter Item Name"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <Input
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="Enter Rating"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Technical Specification</FormLabel>
              <Input
                name="technicalSpecification"
                value={formData.technicalSpecification}
                onChange={handleInputChange}
                placeholder="Enter Technical Specification"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Tentative Make</FormLabel>
              <Input
                name="tentativeMake"
                value={formData.tentativeMake}
                onChange={handleInputChange}
                placeholder="Enter Tentative Make"
                required
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(_, value) => handleChange("status", value)}
                placeholder="Select Status"
                required
                sx={{
                  color:
                    formData.status === "Available"
                      ? "green"
                      : formData.status === "Not Available"
                        ? "red"
                        : "inherit",
                }}
              >
                <Option value="Available" sx={{ color: "green" }}>
                  ✅ Available
                </Option>
                <Option value="Not Available" sx={{ color: "red" }}>
                  ❌ Not Available
                </Option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Buttons centered */}
        <Grid xs={12}>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => navigate("/module_sheet")}
            >
              Back
            </Button>

            <Button type="submit" color="primary" sx={{ mx: 1 }}>
              Submit
            </Button>
          </Box>
        </Grid>
      </form>
    </Card>
  );
};

export default AddNewBOSForm;
