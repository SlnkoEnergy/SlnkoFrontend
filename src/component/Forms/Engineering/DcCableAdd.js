import React, { useState } from "react";
import axios from "axios";
// import Img1 from "../../../assets/Add New Module.png";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import { useAddDcCableMutation } from "../../../redux/Eng/dcsSlice";
import { toast } from "react-toastify";

const DCCableForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    size: "",
    rated_ac_voltage: "",
    nominal_dc_voltage: "",
    core: "",
    cable_type:"",
    status: "",
  });

  const [addDcCable, { isLoading }] = useAddDcCableMutation();

  const handleChange = (name, value) => {
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
      const response = await addDcCable(updatedPayload).unwrap();
      // console.log("Response:", response.data);
      toast.success("DC Cable added successfully!");
      setFormData({
        make: "",
        size: "",
        rated_ac_voltage: "",
        nominal_dc_voltage: "",
        core: "",
        cable_type:"",
        status: "",
      });
      navigate("/module_sheet");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // const handleBack = () => {
  //   window.history.back();
  // };

  return (
    <Card sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Typography level="h4" textAlign="center" gutterBottom>
          Add New DC Cable
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Make</FormLabel>
                <Input
                  name="make"
                  value={formData.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Size</FormLabel>
                <Input
                  name="size"
                  value={formData.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Rated AC Voltage (kV)</FormLabel>
                <Input
                  name="rated_ac_voltage"
                  value={formData.rated_ac_voltage}
                  onChange={(e) =>
                    handleChange("rated_ac_voltage", e.target.value)
                  }
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Nominal DC Voltage</FormLabel>
                <Input
                  name="nominal_dc_voltage"
                  value={formData.nominal_dc_voltage}
                  onChange={(e) =>
                    handleChange("nominal_dc_voltage", e.target.value)
                  }
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Core</FormLabel>
                <Input
                  name="core"
                  value={formData.core}
                  onChange={(e) => handleChange("core", e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Cable Type</FormLabel>
                <Input
                  name="cable_type"
                  value={formData.cable_type}
                  onChange={(e) => handleChange("cable_type", e.target.value)}
                />
              </FormControl>
            </Grid>

            {/* ✅ Integrated Custom Status Field */}
            <Grid item xs={12} sm={12}>
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

            {/* Buttons Centered */}
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

export default DCCableForm;
