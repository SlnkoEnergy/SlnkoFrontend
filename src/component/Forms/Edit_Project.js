import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const UpdateProject = () => {
  const [formData, setFormData] = useState({
    p_id: "",
    code: "",
    customer: "",
    name: "",
    p_group: "",
    email: "",
    number: "",
    alternate_mobile_number: "",
    billing_address: {
      village_name: "",
      district_name: "",
    },
    site_address: {
      village_name: "",
      district_name: "",
    },
    state: "",
    project_category: "",
    project_kwp: "",
    distance: "",
    tariff: "",
    land: {
      type: "",
      acres: "",
    },
    service: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Project Data:", formData);
    // Add your API call here to submit the form data.
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Box
          sx={{
            boxShadow: 3,
            p: 4,
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Update Project
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Project ID */}
              <Grid item xs={12}>
                <TextField
                  label="Project ID"
                  name="code"
                  fullWidth
                  required
                  value={formData.code}
                  onChange={handleChange}
                />
              </Grid>

              {/* Customer Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Customer Name"
                  name="customer"
                  fullWidth
                  required
                  value={formData.customer}
                  onChange={handleChange}
                />
              </Grid>

              {/* Project Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Project Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Project Group */}
              <Grid item xs={12}>
                <TextField
                  label="Project Group"
                  name="p_group"
                  fullWidth
                  value={formData.p_group}
                  onChange={handleChange}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email ID"
                  name="email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>

              {/* Mobile Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  name="number"
                  type="number"
                  fullWidth
                  required
                  value={formData.number}
                  onChange={handleChange}
                />
              </Grid>

              {/* Alternate Mobile Number */}
              <Grid item xs={12}>
                <TextField
                  label="Alternate Mobile Number"
                  name="alt_number"
                  type="number"
                  fullWidth
                  value={formData.alt_number}
                  onChange={handleChange}
                />
              </Grid>

              {/* Billing Address */}
              <Grid item xs={12}>
                <TextField
                  label="Billing Address"
                  name="village"
                  fullWidth
                  required
                  value={formData.village}
                  onChange={handleChange}
                />
              </Grid>

              {/* Site Address */}
              <Grid item xs={12}>
                <TextField
                  label="Site Address"
                  name="s_village"
                  fullWidth
                  required
                  value={formData.s_village}
                  onChange={handleChange}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  required
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  name="category"
                  fullWidth
                  required
                  value={formData.category}
                  onChange={handleChange}
                />
              </Grid>

              {/* Project Capacity */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Project Capacity (MW)"
                  name="kwh"
                  type="number"
                  fullWidth
                  required
                  value={formData.kwh}
                  onChange={handleChange}
                />
              </Grid>

              {/* Substation Distance */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Substation Distance (KM)"
                  name="distance"
                  type="number"
                  fullWidth
                  required
                  value={formData.distance}
                  onChange={handleChange}
                />
              </Grid>

              {/* Tariff */}
              <Grid item xs={12}>
                <TextField
                  label="Tariff (per Unit)"
                  name="tariff"
                  type="number"
                  fullWidth
                  value={formData.tariff}
                  onChange={handleChange}
                />
              </Grid>

              {/* Land Available */}
              <Grid item xs={12}>
                <TextField
                  label="Land Available (Acres)"
                  name="land"
                  fullWidth
                  required
                  value={formData.land}
                  onChange={handleChange}
                />
              </Grid>

              {/* Service Charges */}
              <Grid item xs={12}>
                <TextField
                  label="SLnko Service Charges (incl. GST)"
                  name="service"
                  type="number"
                  fullWidth
                  required
                  value={formData.service}
                  onChange={handleChange}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default UpdateProject;
