import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Input,
  Button,
  Sheet,
  Skeleton,
} from "@mui/joy";
import Axios from "../../utils/Axios";
import { useParams } from 'react-router-dom';

const UpdateProject = () => {
  const { p_id } = useParams();
  console.log("p_ID:", p_id)
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
    status : "incomplete",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await Axios.get(
          `/get-all-project/${p_id}`
        );
        const data = response.data?.data?.[0];
        
        console.log("Fetched Project Data:", data);

        if (data) {
          setFormData((prev) => ({
            ...prev,
            p_id: data.p_id || "",
            code: data.code || "",
            name: data.name || "",
            customer: data.customer || "",
            p_group: data.p_group || "",
            email: data.email || "",
            number: data.number || "",
            alternate_mobile_number: data.alternate_mobile_number || "",
            billing_address: {
              village_name: data.billing_address?.village_name || "",
              district_name: data.billing_address?.district_name || "",
            },
            site_address: {
              village_name: data.site_address?.village_name || "",
              district_name: data.site_address?.district_name || "",
            },
            state: data.state || "",
            project_category: data.project_category || "",
            project_kwp: data.project_kwp || "",
            distance: data.distance || "",
            tariff: data.tariff || "",
            land: {
              type: data.land?.type || "",
              acres: data.land?.acres || "",
            },
            service: data.service || "",
          }));
        } else {
          setError("No projects found. Please add projects before proceeding.");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [p_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(`Field "${name}" changed to:`, value);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data before Submission:", formData); 

  
  };

  return (
    <Box sx={{ backgroundColor: "neutral.softBg", minHeight: "100vh",width:'100%', py: 4 }}>
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
                    name="alternate_mobile_number"
                    type="number"
                    fullWidth
                    value={formData.alternate_mobile_number}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Billing Address (Village Name)
                  </Typography>
                  <Input
                    placeholder="Enter Billing Village Name"
                    name="billing_address.village_name"
                    required
                    fullWidth
                    value={formData.billing_address.village_name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Site Address (Village Name)
                  </Typography>
                  <Input
                    placeholder="Enter Site Village Name"
                    name="site_address.village_name"
                    required
                    fullWidth
                    value={formData.site_address.village_name}
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
                    name="tariff"
                    type="number"
                    fullWidth
                    value={formData.tariff}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography level="body1" fontWeight="bold" mb={1}>
                    Land Available (Acres)
                  </Typography>
                  <Input
                    placeholder="Enter Land Area in Acres"
                    name="land.acres"
                    fullWidth
                    required
                    value={formData.land.acres}
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
                  <Button type="submit" fullWidth color="primary" sx={{ mt: 2 }}>
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