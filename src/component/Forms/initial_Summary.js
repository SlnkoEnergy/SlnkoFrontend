import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Grid,
  Typography,
  Sheet,
  Select,
  Option,
  FormLabel,
  Box,
} from "@mui/joy";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useGetLeadsQuery } from "../../redux/leadsSlice";

const Initial_Summary = () => {
  const navigate = useNavigate();
  const { data: getLead, isLoading, error } = useGetLeadsQuery();

  console.log("Fetched lead data:", getLead);

  const [formData, setFormData] = useState({
    c_name: "",
    company: "",
    email: "",
    mobile: "",
    alt_mobile: "",
    village: "",
    district: "",
    state: "",
    scheme: "",
    capacity: "",
    distance: "",
    tarrif: "",
    land: "",
    entry_date: "",
    interest: "",
    comment: "",
    submitted_by: "",
  });

  // console.log("Initial form data:", formData);

  const statesOfIndia = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const getLeadArray = Array.isArray(getLead) ? getLead : getLead?.Data || [];
  console.log("Processed Leads Array:", getLeadArray);

  const LeadId = localStorage.getItem("view_details");
  console.log("Retrieved LeadId from localStorage:", LeadId);

  if (!LeadId) {
    console.error("Invalid Lead ID retrieved from localStorage.");
  }

  const lead = getLeadArray.find(lead => String(lead.id) === LeadId);
  console.log("Matched Lead:", lead);

 useEffect(() => {
    // if (!getLead) {
    //   console.error("Error: getLead data is undefined or null.", getLead);
    //   return;
    // }
  
    // Extract data properly (handles cases where data might be nested)
    const getLeadArray = Array.isArray(getLead) ? getLead : getLead?.Data || [];
  
    if (!Array.isArray(getLeadArray)) {
      console.error("Error: Extracted getLead data is not an array.", getLeadArray);
      return;
    }
  
    // Retrieve Lead ID from localStorage
    const LeadId = localStorage.getItem("view_details");
  
    if (!LeadId) {
      console.error("Invalid Lead ID retrieved from localStorage.");
      return;
    }
  
    // Find the matching lead using string comparison
    const selectedLead = getLeadArray.find((item) => String(item.id) === LeadId);
  
    if (!selectedLead) {
      // console.error(`No matching lead found for ID: ${LeadId}`);
      return;
    }
  
    // Function to format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (dateString) => {
      if (!dateString) return "";
    
      const parts = dateString.split("-");
      
      if (parts.length !== 3) return dateString; // Invalid format, return as is
    
      if (parts[0].length === 4) {
        // Already in YYYY-MM-DD format
        return dateString;
      } else if (parts[2].length === 4) {
        // Convert from DD-MM-YYYY to YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    
      return dateString; // Return unchanged if format is unknown
    };
    
  
    console.log("Matching Lead Found:", selectedLead);
  
    setFormData({
      ...selectedLead,
      c_name: selectedLead.c_name || "",
      company: selectedLead.company || "",
      email: selectedLead.email || "",
      group: selectedLead.group || "",
      reffered_by: selectedLead.reffered_by || "",
      source: selectedLead.source || "",
      mobile: selectedLead.mobile || "",
      alt_mobile: selectedLead.alt_mobile || "",
      village: selectedLead.village || "",
      district: selectedLead.district || "",
      state: selectedLead.state || "",
      scheme: selectedLead.scheme || "",
      capacity: selectedLead.capacity || "",
      distance: selectedLead.distance || "",
      tarrif: selectedLead.tarrif || "",
      land: selectedLead.land || "N/A",
      entry_date: formatDateToYYYYMMDD(selectedLead.entry_date) || "",
      interest: selectedLead.interest || "",
      comment: selectedLead.comment || "",
      submitted_by: selectedLead.submitted_by || ""
    });
  }, [getLead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Field changed: ${name}, New Value: ${value}`);
    
    setFormData((prev) => {
      if (name === "available_land") {
        return {
          ...prev,
          land: {
            ...prev.land,
            available_land: value || "",
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  if (isLoading) return <p>Loading lead details...</p>;
  if (error) return <p>Error fetching lead details</p>;

  return (
   <Sheet
        variant="outlined"
        sx={{
          p: 5,
          borderRadius: "lg",
          maxWidth: 800,
          mx: "auto",
          mt: 5,
          boxShadow: 4,
        }}
      >
        <Typography level="h3" mb={4} textAlign="center" fontWeight="bold">
        Initial Lead Summary
        </Typography>
        <form>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="c_name"
                value={formData.c_name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Email ID</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Mobile Number</FormLabel>
              <Input
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                required
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Alt Mobile Number</FormLabel>
              <Input
                name="alt_mobile"
                type="tel"
                value={formData.alt_mobile}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Village Name</FormLabel>
              <Input
                name="village"
                value={formData.village}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>District Name</FormLabel>
              <Input
                name="district"
                value={formData.district}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Select State</FormLabel>
              <Select
                name="state"
                value={formData.state}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, state: newValue })
                }
                required
                
              >
                {statesOfIndia.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Capacity</FormLabel>
              <Input
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Sub Station Distance (KM)</FormLabel>
              <Input
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Tariff (Per Unit)</FormLabel>
              <Input
                name="tarrif"
                value={formData.tarrif}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Available Land</FormLabel>
              <Input
                name="available_land"
                value={formData.land || "NA"}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Follow-up Date</FormLabel>
              <Input
                name="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={handleChange}
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Scheme</FormLabel>
              <Select
                name="scheme"
                value={formData.scheme}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, scheme: newValue })
                }
                required
                
              >
                {["KUSUM A", "KUSUM C", "Other"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
            {/* <Grid xs={12} sm={6}>
              <FormLabel>Land Type</FormLabel>
              <Select
                name="land_type"
                value={formData.land.land_type}
                onChange={(e, newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    land: { ...prev.land, land_type: newValue },
                  }))
                }
                required
                
              >
                {["Leased", "Owned"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid> */}
            <Grid xs={12} sm={6}>
              <FormLabel>Interest</FormLabel>
              <Input
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                
              />
            </Grid>
            {/* <Grid xs={12} sm={6}>
              <FormLabel>Interest</FormLabel>
              <Select
                name="interest"
                value={formData.interest}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, interest: newValue })
                }
                required
                
              >
                {["Yes", "No"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid> */}
            <Grid xs={6}>
              <FormLabel>Comments</FormLabel>
              <Input
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                
                multiline="true"
                rows={4}
              />
            </Grid>
            <Grid xs={12}>
              <Box textAlign="center" sx={{ mt: 3 }}>
                {/* <Button type="submit" variant="solid" loading={isLoading}>
                  Update
                </Button> */}
                <Button
                  variant="soft"
                  color="neutral"
                  sx={{ ml: 2 }}
                  onClick={() => navigate("/leads")}
                >
                  Back
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Sheet>
  );
};

export default Initial_Summary;
