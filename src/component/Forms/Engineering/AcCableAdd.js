import React, { useState } from "react";
import axios from "axios";
// import Img1 from "../../../assets/Add New Module.png";
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
import { useAddAcCableMutation } from "../../../redux/Eng/acsSlice";
import { toast } from "react-toastify";

const ACCableForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    size: "",
    lt_ht: "",
    voltage_rating: "",
    type: "",
    core: "",
    status: "",
  });

  const [addAcCable, { isLoading }] = useAddAcCableMutation();

  // Updated handleChange function for correct event handling
  const handleChange = (name) => (event, newValue) => {
    // Ensure 'newValue' is being accessed properly for select inputs
    const value = newValue !== undefined ? newValue : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPayload = {
      ...formData,
    };

    try {
      const response = await addAcCable(updatedPayload).unwrap();
            // console.log("Response:", response.data);
            toast.success("AC Cable added successfully!");
      setFormData({
        make: "",
        size: "",
        lt_ht: "",
        voltage_rating: "",
        type: "",
        core: "",
        status: "",
      });
      navigate("/module_sheet");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

 

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Typography level="h4" textAlign="center" gutterBottom>
          AC Cable
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Make</FormLabel>
              <Input
                name="make"
                value={formData.make}
                onChange={handleChange("make")}
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Size</FormLabel>
              <Input
                name="size"
                value={formData.size}
                onChange={handleChange("size")}
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>LT/HT</FormLabel>
              <Select
                value={formData.lt_ht}
                onChange={(e, newValue) => handleChange("lt_ht")(e, newValue)} // Proper value handling for select
                placeholder="Select LT/HT"
              >
                <Option value="LT">LT</Option>
                <Option value="HT">HT</Option>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Voltage Rating</FormLabel>
              <Input
                name="voltage_rating"
                value={formData.voltage_rating}
                onChange={handleChange("voltage_rating")}
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Input
                name="type"
                value={formData.type}
                onChange={handleChange("type")}
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Core</FormLabel>
              <Input
                name="core"
                value={formData.core}
                onChange={handleChange("core")}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12}>
            <FormControl fullWidth>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(e, newValue) => handleChange("status")(e, newValue)} // Proper value handling for select
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
        </Grid>
        </form>
        
      </CardContent>
    </Card>
  );
};

export default ACCableForm;
