import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";
import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Img9 from "../../assets/solar.png";
import Axios from "../../utils/Axios";
import { useAddProjectMutation } from "../../redux/projectsSlice";
import { useDispatch } from "react-redux";

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

  const dispatch = useDispatch();
  const [addProject, { isLoading }] = useAddProjectMutation();
  
  const [formData, setFormData] = useState({
    code: "",
    customer: "",
    name: "",
    p_group: "",
    email: "",
    number: "",
    alt_number: "",
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
    project_status: "incomplete",
    submitted_by:""
  });
  const [responseMessage, setResponseMessage] = useState("");
  // const [isLoading, setIsLoading] = useState(false);




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

  // const payload = {
  //   ...formData,
  //   land: JSON.stringify(formData.land),
  // };
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      return userData ? JSON.parse(userData) : null;
    };

    const storedUser = getUserData();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.name) {
      alert("User details are missing!");
      return;
    }

    const updatedPayload = {
      ...formData,
      submitted_by: user.name,
      land: JSON.stringify(formData.land),
    };

    try {
      const response = await addProject(updatedPayload).unwrap();
      toast.success("Project added successfully");

      setFormData({
        code: "",
        customer: "",
        name: "",
        p_group: "",
        email: "",
        number: "",
        alt_number: "",
        billing_address: { village_name: "", district_name: "" },
        site_address: { village_name: "", district_name: "" },
        state: "",
        project_category: "",
        project_kwp: "",
        distance: "",
        tariff: "",
        land: { type: "", acres: "" },
        service: "",
        project_status: "incomplete",
        submitted_by: user?.name,
      });

      navigate("/all-Project");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project. Please try again.");
    }
  };


  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        // backgroundColor: "#f5f5f5"
        padding: 2,
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: { sm: "100%", lg: "60%"},
          padding: { xs: 2, md: 4 },
          borderRadius: "md",
          boxShadow: 3,
          // marginLeft: { sm: "0", lg: "18%", xl: "10%" },
        }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          {isLoading ? (
            <Skeleton circle width={50} height={50} />
          ) : (
            <img
              src={Img9}
              alt="Logo"
              style={{ height: "50px", marginBottom: "10px", maxWidth: "100%" }}
            />
          )}
          <Typography level="h4" fontWeight="bold" color="warning">
            Add Project
          </Typography>
          <Divider inset="none" sx={{ width: "50%", margin: "8px auto" }} />
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="code">Project ID</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="code"
                  placeholder="Enter project ID"
                  value={formData.code}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="soft"
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="customer">Customer Name</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="customer"
                  placeholder="Enter customer name"
                  value={formData.customer}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="soft"
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="project">Project Name</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="soft"
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="group">Group Name</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="p_group"
                  value={formData.p_group}
                  onChange={handleChange}
                  fullWidth
                  variant="soft"
                />
              )}
            </Grid>

            <Grid item="true" xs={12} md={4}>
              <label htmlFor="email">Email Id</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  fullWidth
                  required
                  variant="soft"
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={4}>
              <label htmlFor="mobile">Mobile Number</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="soft"
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={4}>
              <label htmlFor="alt_mobile">Alternate Mobile Number</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="alt_number"
                  value={formData.alt_number}
                  onChange={handleChange}
                  fullWidth
                  variant="soft"
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
  <label htmlFor="billing-village">Billing Address - Village Name</label>
  {isLoading ? (
    <Skeleton height={40} />
  ) : (
    <Input
      name="billing_village_name"
      value={formData.billing_address.village_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          billing_address: { ...prev.billing_address, village_name: e.target.value },
        }))
      }
      fullWidth
      variant="soft"
      required
    />
  )}

  <label htmlFor="billing-district" style={{ marginTop: '10px' }}>Billing Address - District Name</label>
  {isLoading ? (
    <Skeleton height={40} />
  ) : (
    <Input
      name="billing_district_name"
      value={formData.billing_address.district_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          billing_address: { ...prev.billing_address, district_name: e.target.value },
        }))
      }
      fullWidth
      variant="soft"
      required
      sx={{ mt: 2 }}
    />
  )}
</Grid>

<Grid item xs={12} md={6}>
  <label htmlFor="site-village">Site Address - Village Name</label>
  {isLoading ? (
    <Skeleton height={40} />
  ) : (
    <Input
      name="site_village_name"
      value={formData.site_address.village_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          site_address: { ...prev.site_address, village_name: e.target.value },
        }))
      }
      fullWidth
      variant="soft"
      required
    />
  )}

  <label htmlFor="site-district" style={{ marginTop: '10px' }}>Site Address - District Name</label>
  {isLoading ? (
    <Skeleton height={40} />
  ) : (
    <Input
      name="site_district_name"
      value={formData.site_address.district_name}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          site_address: { ...prev.site_address, district_name: e.target.value },
        }))
      }
      fullWidth
      variant="soft"
      required
      sx={{ mt: 2 }}
    />
  )}
</Grid>


            <Grid item="true" xs={12}>
              <label htmlFor="state">State</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Autocomplete
                  options={states}
                  value={formData.state || null}
                  onChange={(e, value) =>
                    handleAutocompleteChange("state", value)
                  }
                  placeholder="State"
                  isOptionEqualToValue={(option, value) => option === value}
                  required
                  variant="soft"
                  sx={{ width: "100%" }}
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="category">Category</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Autocomplete
                  options={categories}
                  value={formData.project_category || null}
                  onChange={(e, value) =>
                    handleAutocompleteChange("project_category", value)
                  }
                  placeholder="Category"
                  isOptionEqualToValue={(option, value) => option === value}
                  required
                  variant="soft"
                  sx={{ width: "100%" }}
                />
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="plant">Plant Capacity (MW)</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="project_kwp"
                  value={formData.project_kwp}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  variant="soft"
                  required
                />
              )}
            </Grid>

            <Grid item="true" xs={12} md={6}>
              <label htmlFor="sub_station">Sub Station Distance (KM)</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
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
              )}
            </Grid>
            <Grid item="true" xs={12} md={6}>
              <label htmlFor="tarriff">Tariff (₹ per unit)</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="tariff"
                  value={formData.tariff}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  variant="soft"
                  required
                />
              )}
            </Grid>

            <Grid item="true" xs={12}>
              <label htmlFor="land">Land Acres</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
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
              )}
            </Grid>
            <Grid item="true" xs={12}>
              <label htmlFor="types">Land Types</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
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
              )}
            </Grid>

            <Grid item="true" xs={12}>
              <label htmlFor="service">SLnko Service Charges (incl. GST)</label>
              {isLoading ? (
                <Skeleton height={40} />
              ) : (
                <Input
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  variant="soft"
                  required
                />
              )}
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
              onClick={() => navigate("/all-Project")}
            >
              Back
            </Button>
          </Box>

          {isLoading && (
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Skeleton height={40} width={100} />
            </Box>
          )}

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
