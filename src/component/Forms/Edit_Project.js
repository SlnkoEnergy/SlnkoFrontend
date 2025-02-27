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
import {
  useUpdateProjectMutation,
  useGetProjectsQuery,
} from "../../redux/projectsSlice";

const UpdateProject = () => {
  const navigate = useNavigate();
  // const [formData, setFormData] = useState({
  //   p_id: "",
  //   code: "",
  //   customer: "",
  //   name: "",
  //   p_group: "",
  //   email: "",
  //   number: "",
  //   alt_number: "",
  //   billing_address: {
  //     village_name: "",
  //     district_name: "",
  //   },
  //   site_address: {
  //     village_name: "",
  //     district_name: "",
  //   },
  //   state: "",
  //   project_category: "",
  //   project_kwp: "",
  //   distance: "",
  //   tarrif: "",
  //   land: {
  //     type: "",
  //     acres: "",
  //   },
  //   service: "",
  //   status: "incomplete",
  // });

  const [loading, setLoading] = useState(false);

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const { data: projectsData, isLoading, error } = useGetProjectsQuery();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!projectsData) {
      console.error("Error: projectsData is undefined or null.", projectsData);
      return;
    }

    // Ensure projectsData is an array, extract data if wrapped inside an object
    const projectsArray = Array.isArray(projectsData)
      ? projectsData
      : projectsData?.data || [];

    if (!Array.isArray(projectsArray)) {
      console.error(
        "Error: Extracted projectsData is not an array.",
        projectsData
      );
      return;
    }

    const projectId = Number(localStorage.getItem("idd"));

    console.log(projectId);

    if (isNaN(projectId)) {
      console.error("Invalid project ID retrieved from localStorage.");
      return;
    }

    const matchingProject = projectsArray.find(
      (item) => Number(item.p_id) === projectId
    );

    if (matchingProject) {
      setFormData((prev) => ({
        ...prev,
        ...matchingProject, // Spread existing project data into formData
      }));
    } else {
      console.error(`No matching project found for ID: ${projectId}`);
    }
  }, [projectsData]);

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
    if (!formData || !formData._id) {
      toast.error("Project ID is missing. Cannot update project.");
      return;
    }

    try {
      await updateProject({
        _id: formData._id,
        updatedData: formData,
      }).unwrap();
      toast.success("Project updated successfully.");
      navigate("/all-project");
    } catch (err) {
      toast.error("Oops! Something went wrong.");
    }
  };

  if (isLoading || !formData)
    return <Skeleton variant="rectangular" height={400} />;
  if (error)
    return <Typography color="error">Failed to load project data.</Typography>;

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
                    value={
                      formData.billing_address?.village_name +
                        ", " +
                        formData.billing_address?.district_name || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_address: {
                          ...formData.billing_address,
                          village_name: e.target.value,
                        },
                      })
                    }
                  
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
                    value={
                      formData.site_address?.village_name +
                        ", " +
                        formData.site_address?.district_name || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        site_address: {
                          ...formData.site_address,
                          village_name: e.target.value,
                        },
                      })
                    }
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

                <Grid
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Button
                    type="submit"
                    color="primary"
                    variant="solid"
                    sx={{ width: "48%", py: 1.5 }}
                  >
                    Update
                  </Button>
                  <Button
                    color="neutral"
                    variant="soft"
                    sx={{ width: "48%", py: 1.5 }}
                    onClick={() => navigate("/all-project")}
                  >
                    Back
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
