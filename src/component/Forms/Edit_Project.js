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

const UpdateProject = () => {
  // const { p_id } = useParams();
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
      try {
        setLoading(true);

        const response = await Axios.get("/get-all-project");
        let project = localStorage.getItem("idd");

        project = Number.parseInt(project);

        console.log(project);
        // console.log(project, "idd");

        // if (response) {
        //   const data = response.data.data.map((item) => {
        //     if (item.p_id == project) {
        //       console.log(item);
        //     }
        //   });
        // }

        // const data = response.data?.data?.[0];

        // console.log("Fetched Project Data:", response.data);

        if (response && response.data && response.data.data) {
          const matchingItem = response.data.data.find(
            (item) => item.p_id === project
          );

          if (matchingItem) {
            console.log("Matching Project Data:", matchingItem);

            setFormData((prev) => ({
              ...prev,
              p_id: matchingItem.p_id || "",
              code: matchingItem.code || "",
              name: matchingItem.name || "",
              customer: matchingItem.customer || "",
              p_group: matchingItem.p_group || "",
              email: matchingItem.email || "",
              number: matchingItem.number || "",
              alternate_mobile_number: matchingItem.alt_number || "",
              billing_address: {
                village_name: matchingItem.billing_address?.village_name || "",
                district_name:
                  matchingItem.billing_address?.district_name || "",
              },
              site_address: {
                village_name: matchingItem.site_address?.village_name || "",
                district_name: matchingItem.site_address?.district_name || "",
              },
              state: matchingItem.state || "",
              project_category: matchingItem.project_category || "",
              project_kwp: matchingItem.project_kwp || "",
              distance: matchingItem.distance || "",
              tarrif: matchingItem.tarrif || "",
              land: {
                type: matchingItem.land?.type || "",
                acres: matchingItem.land?.acres || "",
              },
              service: matchingItem.service || "",
            }));
          } else {
            setError("No matching project found for the given ID.");
          }
        } else {
          setError("No project data available. Please add projects first.");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []);

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
                    value={formData.land.type.acres}
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
