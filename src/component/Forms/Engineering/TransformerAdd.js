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
  Grid,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";

const AddNewTransformerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    size: "",
    type: "",
    vector_group: "",
    cooling_type: "",
    primary_voltage: "",
    secondary_voltage: "",
    voltage_ratio: "",
    impedance: "",
    status: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    try {
      const response = await axios.post(
        "https://api.slnkoprotrac.com/v1/get-transformer-options",
        formData
      );
      console.log("Response:", response.data);
      alert("Transformer added successfully!");
      setFormData({
        make: "",
        size: "",
        type: "",
        vector_group: "",
        cooling_type: "",
        primary_voltage: "",
        secondary_voltage: "",
        voltage_ratio: "",
        impedance: "",
        status: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed.");
    }
  };

  const handleBack = () => {
    setFormData({
      make: "",
      size: "",
      type: "",
      vector_group: "",
      cooling_type: "",
      primary_voltage: "",
      secondary_voltage: "",
      voltage_ratio: "",
      impedance: "",
      status: "",
    });
  };

  return (
    <Sheet
      sx={{
        width: "50%",
        margin: "auto",
        padding: 3,
        boxShadow: "lg",
        borderRadius: "md",
      }}
    >
      <Typography level="h2" sx={{ textAlign: "center", mb: 2 }}>
        Add Transformer
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
              <FormLabel>Make</FormLabel>
              <Input
                value={formData.make}
                onChange={(e) => handleChange("make", e.target.value)}
                placeholder="Enter Make"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Size</FormLabel>
              <Input
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="Enter Size"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(_, value) => handleChange("type", value)}
                placeholder="Select Type"
                required
              >
                <Option value="OCTC">OCTC</Option>
                <Option value="OLTC">OLTC</Option>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Vector Group</FormLabel>
              <Input
                value={formData.vector_group}
                onChange={(e) => handleChange("vector_group", e.target.value)}
                placeholder="Enter Vector Group"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Cooling Type</FormLabel>
              <Input
                value={formData.cooling_type}
                onChange={(e) => handleChange("cooling_type", e.target.value)}
                placeholder="Enter Cooling Type"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Primary Voltage</FormLabel>
              <Select
                value={formData.primary_voltage}
                onChange={(_, value) => handleChange("primary_voltage", value)}
                placeholder="Select Primary Voltage"
                required
              >
                <Option value="11">11</Option>
                <Option value="33">33</Option>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Secondary Voltage</FormLabel>
              <Select
                value={formData.secondary_voltage}
                onChange={(_, value) =>
                  handleChange("secondary_voltage", value)
                }
                placeholder="Select Secondary Voltage"
                required
              >
                <Option value="ynd11">ynd11</Option>
                <Option value="ynd11d11">ynd11d11</Option>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Voltage Ratio</FormLabel>
              <Input
                value={formData.voltage_ratio}
                onChange={(e) => handleChange("voltage_ratio", e.target.value)}
                placeholder="Enter Voltage Ratio"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>% Impedance</FormLabel>
              <Input
                value={formData.impedance}
                onChange={(e) => handleChange("impedance", e.target.value)}
                placeholder="Enter % Impedance"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
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
                  Available
                </Option>
                <Option value="Not Available" sx={{ color: "red" }}>
                  Not Available
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
    </Sheet>
  );
};

export default AddNewTransformerForm;
