import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  Button,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/joy";
import Img6 from "../../assets/add_money.png";
import Axios from "../../utils/Axios";

const Add_Money = () => {
  const [formValues, setFormValues] = useState({
    submittedBy: "Admin",
    p_id: "",
    name: "",
    code: "",
    customer: "",
    p_group: "",
    cr_amount: "",
    cr_date: "",
    cr_mode: "",
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await Axios.get(
          "/get-all-project"
        );
        const data = response.data?.data?.[0];

        if (data) {
          setFormValues((prev) => ({
            ...prev,
            p_id: data.code || "",
            name: data.name || "",
            customer: data.customer || "",
            p_group: data.p_group || "",
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (_, newValue) => {
    setFormValues((prev) => ({
      ...prev,
      cr_mode: newValue || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { cr_amount, cr_date, cr_mode, comment } = formValues;

    if (!cr_amount || !cr_date || !cr_mode || !comment) {
      alert("All fields are required. Please fill out the form completely.");
      return;
    }

    const payload = {
      p_id: formValues.p_id,
      p_group: formValues.p_group,
      cr_amount: formValues.cr_amount,
      cr_date: formValues.cr_date,
      cr_mode: formValues.cr_mode,
      comment: formValues.comment,
    };

    try { 
      const response = await Axios.post(
        "/Add-Money",
        payload
      );

      console.log("Form submission response:", response.data);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "neutral.softBg",
        padding: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          padding: 3,
          boxShadow: "md",
          borderRadius: "md",
          backgroundColor: "background.surface",
        }}
      >
        <Box textAlign="center" mb={2}>
          <img
            src={Img6}
            alt="Add Money"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <Typography
            level="h4"
            sx={{
              fontFamily: "Bona Nova SC, serif",
              textTransform: "uppercase",
              color: "warning.500",
              fontWeight: "lg",
            }}
          >
            Add Money
          </Typography>
          <Box
            component="hr"
            sx={{
              width: "50%",
              margin: "10px auto",
              backgroundColor: "warning.400",
            }}
          />
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Static Fields */}
              <Grid xs={12}>
                <Input
                  fullWidth
                  placeholder="Submitted By"
                  name="submittedBy"
                  value={formValues.submittedBy}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  placeholder="Project ID"
                  name="p_id"
                  value={formValues.p_id}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  placeholder="Project Name"
                  name="name"
                  value={formValues.name}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  placeholder="Client Name"
                  name="customer"
                  value={formValues.customer}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <Input
                  fullWidth
                  placeholder="Group Name"
                  name="p_group"
                  value={formValues.p_group}
                  disabled
                />
              </Grid>

              {/* Dynamic Fields */}
              <Grid xs={12}>
                <Input
                  fullWidth
                  placeholder="Credit Amount (INR ₹)"
                  type="number"
                  name="cr_amount"
                  value={formValues.cr_amount}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  fullWidth
                  placeholder="Credit Date"
                  type="date"
                  name="cr_date"
                  value={formValues.cr_date}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid xs={12}>
                <Autocomplete
                  options={["Cash", "Account Transfer"]}
                  value={formValues.cr_mode}
                  onChange={handleAutocompleteChange}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <Input {...params} placeholder="Credit Mode" required />
                  )}
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  fullWidth
                  placeholder="Comments"
                  name="comment"
                  value={formValues.comment}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Buttons */}
              <Grid xs={12}>
                <Box textAlign="center" mt={2}>
                  <Button
                    type="submit"
                    sx={{
                      backgroundColor: "warning.400",
                      color: "text.primary",
                      fontWeight: "lg",
                      "&:hover": { backgroundColor: "warning.500" },
                    }}
                  >
                    Submit
                  </Button>
                  <Button variant="outlined" color="neutral" sx={{ ml: 2 }}>
                    Back
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default Add_Money;
