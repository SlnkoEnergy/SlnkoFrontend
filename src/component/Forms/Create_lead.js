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
  const sourceOptions = {
    "Referred by": ["Directors", "Clients", "Team members", "E-mail"],
    "Social Media": ["Whatsapp", "Instagram", "LinkedIn"],
    Marketing: ["Youtube", "Advertisements"],
    "IVR/My Operator": [],
    Others: [],
  };
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

  const formatDateToDDMMYYYY = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero for single-digit days
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero for single-digit months
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.name) {
      toast.error("User details are missing!");
      return;
    }

    try {
      const formattedDate = formatDateToDDMMYYYY(formData.entry_date);
      const updatedPayload = {
        ...formData,
        submitted_by: user.name,
        entry_date: formattedDate,
        land: formData.land,
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
        land: { available_land: "", land_type: "" },
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
            <FormLabel>
              Customer Name<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
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
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <FormLabel>
              Source<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
            <Select
              name="source"
              value={formData.source}
              onChange={(e, newValue) =>
                setFormData({ ...formData, source: newValue, reffered_by: "" })
              }
              required
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
              <FormLabel>
                Sub Source<strong style={{ color: "red" }}>*</strong>
              </FormLabel>
              <Select
                name="reffered_by"
                value={formData.reffered_by}
                onChange={(e, newValue) =>
                  setFormData({ ...formData, reffered_by: newValue })
                }
                required
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
            <FormLabel>
              Mobile Number<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
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
            <FormLabel>
              Village Name<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
            <Input
              name="village"
              value={formData.village}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>
              District Name<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
            <Input
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <FormLabel>
              Select State<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
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
            <FormLabel>
              Capacity<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
            <Input
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
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
              value={formData.land.available_land}
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
            <FormLabel>
              Creation Date<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
            <Input
              name="entry_date"
              type="date"
              value={formData.entry_date}
              onChange={handleChange}
              required
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
              {["KUSUM A", "KUSUM C", "KUSUM C2", "Other"].map((option) => (
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
            <FormLabel>
              Comments<strong style={{ color: "red" }}>*</strong>
            </FormLabel>
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
