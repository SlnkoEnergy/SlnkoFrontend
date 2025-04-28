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
  Stack,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAddInverterMutation } from "../../../redux/Eng/invertersSlice";
import { toast } from "react-toastify";

const AddNewInverterForm = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    inveter_make: "",
    inveter_model: "",
    inveter_type: "",
    inveter_size: "",
    status: "",
  });

  const [addInverter, { isLoading }] = useAddInverterMutation();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting:", formData);

    const updatedPayload = {
      ...formData,
    
    };

    try {
      const response = await addInverter(updatedPayload).unwrap();
            // console.log("Response:", response.data);
            toast.success("Inverter added successfully!");
      setFormData({
        inveter_make: "",
        inveter_model: "",
        inveter_type: "",
        inveter_size: "",
        status: "",
      });
      navigate("/module_sheet");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed.");
    }
  };

  // const handleBack = () => {
  //   window.history.back();
  // };

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
        Add Inverter
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
              <FormLabel sx={{ fontSize: "lg" }}>Make</FormLabel>
              <Input
                value={formData.inveter_make}
                onChange={(e) => handleChange("inveter_make", e.target.value)}
                placeholder="Enter Make"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel sx={{ fontSize: "lg" }}>Model</FormLabel>
              <Input
                value={formData.inveter_model}
                onChange={(e) => handleChange("inveter_model", e.target.value)}
                placeholder="Enter Model"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel sx={{ fontSize: "lg" }}>Type</FormLabel>
              <Input
                value={formData.inveter_type}
                onChange={(e) => handleChange("inveter_type", e.target.value)}
                placeholder="Enter Type"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel sx={{ fontSize: "lg" }}>Size</FormLabel>
              <Input
                value={formData.inveter_size}
                onChange={(e) => handleChange("inveter_size", e.target.value)}
                placeholder="Enter Size"
                required
              />
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <FormControl>
              <FormLabel sx={{ fontSize: "lg" }}>Status</FormLabel>
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
                  borderColor:
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

export default AddNewInverterForm;
