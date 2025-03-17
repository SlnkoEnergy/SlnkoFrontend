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
  TextField,
  Autocomplete,
} from "@mui/joy";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAddLeadsMutation } from "../../redux/leadsSlice";

const Create_lead = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newLead, { isLoading }] = useAddLeadsMutation();
  const [user, setUser] = useState(null);

  const landTypes = ["Leased", "Owned"];

  const [formData, setFormData] = useState({
    c_name: "",
    company: "",
    email: "",
    group: "",
    reffered_by: "",
    source: "",
    mobile: "",
    alt_mobile: "",
    village: "",
    district: "",
    state: "",
    scheme: "",
    capacity: "",
    distance: "",
    tarrif: "",
    land: {
      available_land: "",
      land_type: "",
    },
    entry_date: "",
    interest: "",
    comment: "",
    submitted_by: "",
  });
  const statesOfIndia = [
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

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.name) {
      toast.error("User details are missing!");
      return;
    }

    try {
      

    const updatedPayload = {
      ...formData,
      submitted_by: user.name,
      land: formData.land
    };

      const response = await newLead(updatedPayload).unwrap();
      console.log(response.data);

      toast.success("Lead created successfully!");

      setFormData({
        c_name: "",
        company: "",
        email: "",
        group: "",
        reffered_by: "",
        source: "",
        mobile: "",
        alt_mobile: "",
        village: "",
        district: "",
        state: "",
        scheme: "",
        capacity: "",
        distance: "",
        tarrif: "",
        land: { available_land: "", land_type: ""},
        entry_date: "",
        interest: "",
        comment: "",
        submitted_by: user.name,
      });

      navigate("/leads");
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("Failed to create lead");
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
        Create Lead
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
              required
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>Group Name</FormLabel>
            <Input
              name="group"
              value={formData.group}
              onChange={handleChange}
              s
              required
            />
          </Grid>

          <Grid xs={12} sm={formData.source === "Referred By" ? 6 : 6}>
            <FormLabel>Source</FormLabel>
            <Select
              name="source"
              value={formData.source}
              onChange={(e, newValue) =>
                setFormData({ ...formData, source: newValue })
              }
              required
            >
              {["Linkedin", "Youtube", "Whatsapp", "Referred By"].map(
                (option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                )
              )}
            </Select>
          </Grid>

          {formData.source === "Referred By" && (
            <Grid xs={12} sm={12}>
              <FormLabel>Referred By </FormLabel>
              <Input
                placeholder="Enter referrer's name"
                name="reffered_by"
                value={formData.reffered_by || ""}
                onChange={(e) =>
                  setFormData({ ...formData, reffered_by: e.target.value })
                }
                required
                fullWidth
                sx={{ mt: 2 }}
              />
            </Grid>
          )}

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
                  value={formData.land.available_land}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      land: { ...prev.land, available_land: e.target.value },
                    }))
                  }
                  type="number"
                  fullWidth
                  variant="soft"
                  required
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
          <Grid xs={12} sm={6}>
  <FormLabel>Land Types</FormLabel>
  <Autocomplete
                  options={landTypes}
                  value={formData.land.land_type || null}
                  onChange={(e, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      land: { ...prev.land, land_type: value },
                    }))
                  }
                  placeholder="Land Type"
                  isOptionEqualToValue={(option, value) => option === value}
                  variant="soft"
                  required
                  sx={{ width: "100%" }}
                />
</Grid>
          <Grid xs={12} sm={6}>
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
          </Grid>
          <Grid xs={12} sm={12}>
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
              <Button type="submit" variant="solid" loading={isLoading}>
                Submit
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

export default Create_lead;
