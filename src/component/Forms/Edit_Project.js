import {
  Box,
  Button,
  Container,
  Grid,
  Input,
  Sheet,
  Skeleton,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UpdateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    p_id: "",
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
    tarrif: "",
    land: {
      type: "",
      acres: "",
    },
    service: "",
    status: "incomplete",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectData = async () => {
      console.log("Initializing data fetch...");

      try {
        setLoading(true);
        setError("");

        let project = localStorage.getItem("idd");

        if (!project) {
          console.error(
            "No project ID found in localStorage. Setting a dummy ID for testing."
          );
          setError(
            "Project ID is missing. Please ensure it is set in localStorage."
          );
          localStorage.setItem("idd", "1"); // Dummy value for testing
          project = "1"; // Set a default for fallback
        }

        project = Number.parseInt(project);
        console.log("Parsed Project ID after retrieval:", project);

        if (isNaN(project)) {
          console.error("Project ID from localStorage is invalid.");
          setError("Invalid Project ID. Please check your input.");
          return;
        }

        console.log("Sending API request to fetch projects...");
        const response = await Axios.get(
          "/get-all-project"
        );
        console.log("API Response:", response);

        if (!response || !response.data || !response.data.data) {
          console.error("Invalid API response structure.");
          setError("No project data available. Please add projects first.");
          return;
        }

        const projects = response.data.data;
        console.log("Projects Fetched:", projects);

        const matchingItem = projects.find(
          (item) => Number(item.p_id) === project
        );

        if (matchingItem) {
          console.log("Matching Project Data Found:", matchingItem);
          setFormData({
            ...formData,
            _id: matchingItem._id, 
            p_id: matchingItem.p_id || "",
            code: matchingItem.code || "",
            name: matchingItem.name || "",
            customer: matchingItem.customer || "",
            p_group: matchingItem.p_group || "",
            email: matchingItem.email || "",
            number: matchingItem.number || "",
            alt_number: matchingItem.alt_number || "",
            billing_address: matchingItem.billing_address || "",
            site_address: matchingItem.site_address || "",
            state: matchingItem.state || "",
            project_category: matchingItem.project_category || "",
            project_kwp: matchingItem.project_kwp || "",
            distance: matchingItem.distance || "",
            tarrif: matchingItem.tarrif || "",
            land: matchingItem.land || "",
            service: matchingItem.service || "",
          });
        } else {
          console.error("No matching project found for the given ID.");
          setError("No matching project found for the given ID.");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      } finally {
        console.log("Data fetch completed. Setting loading to false.");
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Field "${name}" changed to:`, value);

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);

    try {
      setLoading(true);
      setError("");

      // Ensure we have the correct ID before sending the request
      if (!formData._id) {
        setError("Project ID is missing. Cannot update project.");
        return;
      }

      // Send the PUT request to update the project
      const response = await Axios.put(
        `/update-project/${formData._id}`,
        formData
      );
      console.log("API Response:", response);

      if (response && response.data) {
        console.log("Project updated successfully:", response.data);
        // alert("Project updated successfully.");
        toast.success("Project updated successfully.");
        navigate("/all-project")
      }
    } catch (err) {
      console.error("Error during project update:", err);
      toast.error("oops!! something went wrong..")
      setError("Failed to update project. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "neutral.softBg",
        minHeight: "100vh",
        width: "100%",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Sheet
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: "md",
            boxShadow: "sm",
            backgroundColor: "neutral.surface",
          }}
        >
          <Typography level="h3" fontWeight="bold" mb={2} textAlign="center">
            Update Project
          </Typography>
          {error && (
            <Typography color="danger" mb={2} textAlign="center">
              {error}
            </Typography>
          )}
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Project ID
                  </Typography>
                  <Input
                    placeholder="Enter Project ID"
                    name="code"
                    required
                    fullWidth
                    value={formData.code}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Customer Name
                  </Typography>
                  <Input
                    placeholder="Enter Customer Name"
                    name="customer"
                    required
                    fullWidth
                    value={formData.customer}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Project Name
                  </Typography>
                  <Input
                    placeholder="Enter Project Name"
                    name="name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Project Group
                  </Typography>
                  <Input
                    placeholder="Enter Project Group"
                    name="p_group"
                    fullWidth
                    value={formData.p_group}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Email ID
                  </Typography>
                  <Input
                    placeholder="Enter Email ID"
                    name="email"
                    type="email"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Mobile Number
                  </Typography>
                  <Input
                    placeholder="Enter Mobile Number"
                    name="number"
                    type="number"
                    required
                    fullWidth
                    value={formData.number}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Alternate Mobile Number
                  </Typography>
                  <Input
                    placeholder="Enter Alternate Mobile Number"
                    name="alt_number"
                    type="number"
                    fullWidth
                    value={formData.alt_number}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Billing Address (Village Name)
                  </Typography>
                  <Input
                    placeholder="Enter Billing Village Name"
                    name="billing_address"
                    required
                    fullWidth
                    value={formData.billing_address}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Site Address (Village Name)
                  </Typography>
                  <Input
                    placeholder="Enter Site Village Name"
                    name="site_address"
                    required
                    fullWidth
                    value={formData.site_address}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    State
                  </Typography>
                  <Input
                    placeholder=" State"
                    name="state"
                    required
                    fullWidth
                    value={formData.state}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Category
                  </Typography>
                  <Input
                    placeholder="Enter Project Category"
                    name="project_category"
                    required
                    fullWidth
                    value={formData.project_category}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Project Capacity (MW)
                  </Typography>
                  <Input
                    placeholder="Enter Capacity in MW"
                    name="project_kwp"
                    type="number"
                    required
                    fullWidth
                    value={formData.project_kwp}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Substation Distance (KM)
                  </Typography>
                  <Input
                    placeholder="Enter Distance in KM"
                    name="distance"
                    type="number"
                    required
                    fullWidth
                    value={formData.distance}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Tariff (per Unit)
                  </Typography>
                  <Input
                    placeholder="Enter Tariff"
                    name="tarrif"
                    fullWidth
                    value={formData.tarrif}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Land Available (Acres)
                  </Typography>
                  <Input
                    placeholder="Enter Land Area in Acres"
                    name="land"
                    fullWidth
                    required
                    value={formData.land}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Service Charges (incl. GST)
                  </Typography>
                  <Input
                    placeholder="Enter Service Charges"
                    name="service"
                    type="number"
                    required
                    fullWidth
                    value={formData.service}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Update Project
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Sheet>
      </Container>
    </Box>
  );
};

export default UpdateProject;
