import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Input,
  Typography,
  Divider,
  Autocomplete,
  Sheet,
} from "@mui/joy";
import axios from "axios";
import Img9 from "../../assets/solar.png";
import { useNavigate } from "react-router-dom";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
const categories = ["KUSUM A", "KUSUM C", "OTHER"];
const landTypes = ["Leased", "Owned"];

const Add_Project = () => {
    const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    code: "",
    p_id: "",
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
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (field, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  const handleAutocompleteChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const payload = {
    ...formData,
    land: JSON.stringify(formData.land),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://backendslnko.onrender.com/v1/add-new-project",
        payload
      );
      setResponseMessage("Project added successfully!");
      console.log("Response from server:", response.data);

      setFormData({
        p_id: "",
        code: "",
        customer: "",
        name: "",
        p_group: "",
        email: "",
        number: "",
        alternate_mobile_number: "",
        billing_address: { village_name: "", district_name: "" },
        site_address: { village_name: "", district_name: "" },
        state: "",
        project_category: "",
        project_kwp: "",
        distance: "",
        tariff: "",
        land: { type: "", acres: "" },
        service: "",
      });
    } catch (error) {
      console.error("Error adding project:", error.response?.data || error.message);
      setResponseMessage("Failed to add project. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: "80%", md: "80%" },
          padding: { xs: 2, md: 4 },
          borderRadius: "md",
        }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          <img src={Img9} alt="Logo" style={{ height: "50px", marginBottom: "10px" }} />
          <Typography level="h4" fontWeight="bold" color="warning">
            Add Project
          </Typography>
          <Divider inset="none" sx={{ width: "50%", margin: "8px auto" }} />
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="code">Project ID</label>
              <Input
                
                name="code"
                placeholder="Enter project ID"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                required
                variant="soft"
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="customer">Customer Name</label>
              <Input
                
                name="customer"
                placeholder="Enter customer name"
                value={formData.customer}
                onChange={handleChange}
                fullWidth
                required
                variant="soft"
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="project">Project Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="soft"
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="group">Group Name</label>
              <Input
                name="p_group"
                value={formData.p_group}
                onChange={handleChange}
                fullWidth
                variant="soft"
              />
            </Grid>

            <Grid item="true" xs={12} md={4}>
            <label htmlFor="email">Email Id</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                fullWidth
                required
                variant="soft"
              />
            </Grid>
            <Grid item="true" xs={12} md={4}>
            <label htmlFor="mobile">Mobile Number</label>
              <Input
                name="number"
                value={formData.number}
                onChange={handleChange}
                fullWidth
                required
                variant="soft"
              />
            </Grid>
            <Grid item="true" xs={12} md={4}>
            <label htmlFor="alt_mobile">Alternate Mobile Number</label>
              <Input
               
                name="alt_mobile_number"
                value={formData.alt_mobile_number}
                onChange={handleChange}
                fullWidth
                variant="soft"
              />
            </Grid>

            <Grid item="true" xs={12} md={6}>
            <label htmlFor="address">Billing Address</label>
              <Input
                
                value={formData.billing_address.village_name}
                onChange={(e) =>
                  handleNestedChange("billing_address", "village_name", e.target.value)
                }
                fullWidth
                required
                variant="soft"
              />
              <Input
                
                value={formData.billing_address.district_name}
                onChange={(e) =>
                  handleNestedChange("billing_address", "district_name", e.target.value)
                }
                fullWidth
                variant="soft"
                required
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="site-address">Site Address</label>
              <Input
                
                value={formData.site_address.village_name}
                onChange={(e) =>
                  handleNestedChange("site_address", "village_name", e.target.value)
                }
                fullWidth
                variant="soft"
                required
              />
              <Input
               
                value={formData.site_address.district_name}
                onChange={(e) =>
                  handleNestedChange("site_address", "district_name", e.target.value)
                }
                fullWidth
                required
                variant="soft"
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item="true" xs={12}>
            <label htmlFor="state">State</label>
              <Autocomplete
                options={states}
                value={formData.state || null}
                onChange={(e, value) => handleAutocompleteChange("state", value)}
                placeholder="State"
                isOptionEqualToValue={(option, value) => option === value}
                required
                variant="soft"
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="category">Category</label>
              <Autocomplete
                options={categories}
                value={formData.project_category || null}
                onChange={(e, value) => handleAutocompleteChange("project_category", value)}
                placeholder="Category"
                isOptionEqualToValue={(option, value) => option === value}
                required
                variant="soft"
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="plant">Plant Capacity (MW)</label>
              <Input
                name="project_kwp"
                value={formData.project_kwp}
                onChange={handleChange}
                type="number"
                fullWidth
                variant="soft"
                required
              />
            </Grid>

            <Grid item="true" xs={12} md={6}>
            <label htmlFor="sub_station">Sub Station Distance (KM)</label>
              <Input
                label="Sub Station Distance (KM)"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                type="number"
                fullWidth
                variant="soft"
                required
              />
            </Grid>
            <Grid item="true" xs={12} md={6}>
            <label htmlFor="tarriff">Tariff (₹ per unit)</label>
              <Input
               
                name="tariff"
                value={formData.tariff}
                onChange={handleChange}
                type="number"
                fullWidth
                variant="soft"
                required
              />
            </Grid>

            <Grid item="true" xs={12}>
            <label htmlFor="land">Land Acres</label>
              <Input
                label="Land Acres"
                name="acres"
                value={formData.land.acres}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    land: { ...prev.land, acres: e.target.value },
                  }))
                }
                type="number"
                fullWidth
                variant="soft"
                required
              />
            </Grid>
            <Grid item="true" xs={12}>
            <label htmlFor="types">Land Types</label>
              <Autocomplete
                options={landTypes}
                value={formData.land.type || null}
                onChange={(e, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    land: { ...prev.land, type: value },
                  }))
                }
                placeholder="Land Type"
                isOptionEqualToValue={(option, value) => option === value}
                variant="soft"
                required
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid item="true" xs={12}>
            <label htmlFor="service">SLnko Service Charges (incl. GST)</label>
              <Input
                name="service"
                value={formData.service}
                onChange={handleChange}
                type="number"
                fullWidth
                variant="soft"
                required
              />
            </Grid>
          </Grid>

          <Box textAlign="center" sx={{ mt: 3 }}>
            <Button type="submit" variant="solid">
              Submit
            </Button>
            <Button
              variant="soft"
              color="neutral"
              sx={{ ml: 2 }}
              onClick={() => navigate('/all-Project')}
            >
              Back
            </Button>
          </Box>

          {responseMessage && (
            <Typography level="body2" textAlign="center" sx={{ mt: 2 }}>
              {responseMessage}
            </Typography>
          )}
        </Box>
      </Sheet>
    </Box>
  );
};

export default Add_Project;