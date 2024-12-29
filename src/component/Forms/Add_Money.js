import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Input,
  TextField,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Img6 from "../../assets/add_money.png";
import Axios from "../../utils/Axios";

const Add_Money = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    submittedBy: "",
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

  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await Axios.get("/get-all-user");
        const username = response.data.data;

        // console.log("UserList are :", username);

        if (username) {
          setFormValues((prev) => ({
            ...prev,
            submittedBy: username.name,
          }));
          console.log("Logged User are: ", username.name);
        } else {
          setError("Unable to fetch user details. Please log in.");
        }
      } catch (err) {
        console.error("Error fetching username:", err);
        setError("Failed to fetch user details. Please try again.");
      }
    };

    fetchUsername();
  }, []);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await Axios.get("/get-all-project");
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
      }
    };

    fetchProjectData();
  }, []);

  // Fetch data for the selected project ID
  useEffect(() => {
    const fetchDataByPId = async (p_id) => {
      if (!p_id) return;
      try {
        const response = await Axios.get(`/get-all-project?p_id=${p_id}`);
        const data = response.data?.data;

        if (data) {
          setFormValues((prev) => ({
            ...prev,
            cr_amount: data.cr_amount || "",
            cr_date: data.cr_date || "",
            cr_mode: data.cr_mode || "",
            comment: data.comment || "",
          }));
        } else {
          setError("No data found for the selected project ID.");
        }
      } catch (err) {
        console.error("Error fetching data by project ID:", err);
        setError(
          "Failed to fetch data for the selected project ID. Please try again."
        );
      }
    };

    if (formValues.p_id) {
      fetchDataByPId(formValues.p_id);
    }
  }, [formValues.p_id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (_, newValue) => {
    setFormValues((prev) => ({ ...prev, cr_mode: newValue || "" }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { cr_amount, cr_date, cr_mode, comment, submittedBy } = formValues;

    if (!cr_amount || !cr_date || !cr_mode || !comment || !submittedBy) {
      alert("All fields are required. Please fill out the form completely.");
      return;
    }

    const payload = {
      p_id: formValues.p_id,
      p_group: formValues.p_group,
      cr_amount,
      cr_date,
      cr_mode,
      comment,
      submittedBy,
    };

    try {
      const response = await Axios.post("/Add-Money", payload);
      setResponseMessage("Form submitted successfully!");
      console.log("Form submission response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      setResponseMessage("Failed to add money. Please try again.");
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
          width: { xs: "100%", sm: "80%", md: "80%" },
          padding: { xs: 2, md: 4 },
          boxShadow: 3,
          borderRadius: "md",
          backgroundColor: "background.surface",
          marginLeft: { sm: "0", md: "30%", lg: "18%", xl: "10%" },
        }}
      >
        <Box textAlign="center" mb={4}>
          <img
            src={Img6}
            alt="Add Money"
            style={{ height: "50px", marginBottom: "10px", maxWidth: "100%" }}
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
              margin: "8px auto",
              backgroundColor: "warning.400",
            }}
          />
        </Box>

        {error && <Alert color="danger">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Static Fields */}
            <Grid xs={12}>
              <Typography
                fullWidth
                variant="body1"
                sx={{
                  fontWeight: "medium",
                  padding: "8px",
                  backgroundColor: "background.paper",
                  borderRadius: "4px",
                  textAlign: "center",
                  color: "text.primary",
                }}
              >
                {formValues.submittedBy || "Loading..."}
              </Typography>
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
                isOptionEqualToValue={(option, value) =>
                  option === value || value === ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params} // Spread the params onto TextField
                    fullWidth
                    placeholder="Credit Mode"
                    required
                  />
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
                <Button
                  variant="outlined"
                  color="neutral"
                  sx={{ ml: 2 }}
                  onClick={() => navigate("/project-balance")}
                >
                  Back
                </Button>
              </Box>
            </Grid>

            {responseMessage && (
              <Typography level="body2" textAlign="center" sx={{ mt: 2 }}>
                {responseMessage}
              </Typography>
            )}
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Add_Money;
