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
  Autocomplete,
  TextField
} from "@mui/joy";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {useGetFollowupLeadsQuery, useGetInitialLeadsQuery, useGetLeadsQuery, useUpdateFollowupLeadsMutation, useUpdateLeadsMutation } from "../../redux/leadsSlice";

const FollowEdit_lead = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [updateLead, { isLoading: isUpdating }] = useUpdateFollowupLeadsMutation();
  const { data: getLead, isLoading, error } = useGetFollowupLeadsQuery();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});

  const sourceOptions = {
    "Referred by": ["Directors", "Clients", "Team members", "E-mail"],
    "Social Media": ["Whatsapp", "Instagram", "LinkedIn"],
    Marketing: ["Youtube", "Advertisements"],
    "IVR/My Operator": [],
    Others: [],
  };
  const landTypes = ["Leased", "Owned"];

  const statesOfIndia = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];
  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!getLead) {
      console.error("Error: getLead data is undefined or null.");
      return;
    }

    const getLeadArray = Array.isArray(getLead) ? getLead : getLead?.data || [];

    if (!Array.isArray(getLeadArray)) {
      console.error("Error: Extracted getLead data is not an array.");
      return;
    }

    const LeadId = localStorage.getItem("edit_follow");

    if (!LeadId) {
      console.error("Invalid Lead ID retrieved from localStorage.");
      return;
    }

    const selectedLead = getLeadArray.find((item) => String(item.id) === LeadId);

    if (!selectedLead) {
      console.error(`No matching Lead found for ID: ${LeadId}`);
      return;
    }

    const formatDateToYYYYMMDD = (dateString) => {
      if (!dateString) return "";
      const parts = dateString.split("-");
      if (parts.length !== 3) return dateString;
      return parts[0].length === 4 ? dateString : `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    console.log("Matching Lead Found:", selectedLead);

    setFormData((prev) => ({
      ...prev,
      ...selectedLead,
      entry_date: formatDateToYYYYMMDD(selectedLead.entry_date) || "",
    }));
  }, [getLead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const handleSubmit = async (e) => {
     e.preventDefault();
     if (!formData || !formData._id) {
       toast.error("Lead ID is missing. Cannot update project.");
       return;
     }
   
     const formatDateToDDMMYYYY = (dateString) => {
       if (!dateString) return "";
       const parts = dateString.split("-");
       if (parts.length !== 3) return dateString;
       return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert YYYY-MM-DD to DD-MM-YYYY
     };
   
     try {
       const updatedLeadData = {
         ...formData,
         entry_date: formatDateToDDMMYYYY(formData.entry_date), // Convert before sending to API
       };
   
       const response = await updateLead({
         _id: formData._id,
         updatedLead: updatedLeadData,
       }).unwrap();
   
       console.log("API Response from updateLead:", response); // ✅ Debug API response
   
       if (response?.data) {
         setFormData({
           ...response.data,
           entry_date: formatDateToDDMMYYYY(response.data.entry_date), // Ensure UI shows DD-MM-YYYY
         });
       } else {
         console.warn("No updated data received from API");
       }
   
       toast.success(response.msg || "Lead updated successfully.");
       navigate("/leads");
     } catch (err) {
       console.error("Update Error:", err);
       toast.error("Oops! Something went wrong.");
     }
   };
  
  

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
          Update Initial Lead
        </Typography>
        <form onSubmit={handleSubmit}>
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
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Group Name</FormLabel>
              <Input
                name="group"
                value={formData.group}
                onChange={handleChange}
                s
                
              />
            </Grid>
  
            <Grid xs={12} sm={6}>
              <FormLabel>Source</FormLabel>
              <Select
                name="source"
                value={formData.source}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, source: newValue, reffered_by: "" })
                }
                
                fullWidth
              >
                {Object.keys(sourceOptions).map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
  
            {formData.source && sourceOptions[formData.source].length > 0 && (
              <Grid xs={12} sm={6}>
                <FormLabel>Sub Source</FormLabel>
                <Select
                  name="reffered_by"
                  value={formData.reffered_by}
                  onChange={(e, newValue) =>
                    setFormData({ ...formData, reffered_by: newValue })
                  }
                  
                  fullWidth
                >
                  {sourceOptions[formData.source].map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </Grid>
            )}
  
            <Grid xs={12} sm={6}>
              <FormLabel>Email ID</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                
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
              <Autocomplete
              options={statesOfIndia}
              value={formData.state}
              onChange={(event, newValue) =>
                setFormData({ ...formData, state: newValue })
              }
              renderInput={(params) => <TextField {...params} required />}
            />
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
              <FormLabel>Available Land(acres)</FormLabel>
              <Input
                name="available_land"
                value={formData.land?.available_land ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    land: { ...prev.land, available_land: e.target.value },
                  }))
                }
                type="text"
                fullWidth
                variant="soft"
                
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Revise Date</FormLabel>
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
                
              >
                {["KUSUM A", "KUSUM C","KUSUM C2", "Other"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Land Types</FormLabel>
              <Autocomplete
  options={landTypes}
  value={formData.land?.land_type ?? null} // Ensure safe access
  onChange={(e, value) =>
    setFormData((prev) => ({
      ...prev,
      land: { ...prev.land, land_type: value || "" }, // Prevent undefined values
    }))
  }
  getOptionLabel={(option) => option} // Ensure proper display
  renderInput={(params) => <Input {...params} placeholder="Land Type" variant="soft" />}
  isOptionEqualToValue={(option, value) => option === value} // Ensure correct selection matching
  sx={{ width: "100%" }}
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
            <Grid xs={12} sm={6}>
              <FormLabel>Comments</FormLabel>
              <Input
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                multiline="true"
                rows={4}
                required
              />
            </Grid>
            <Grid xs={12}>
              <Box textAlign="center" sx={{ mt: 3 }}>
                <Button type="submit" variant="solid" loading={isLoading}>
                  Update
                </Button>
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

export default FollowEdit_lead;
