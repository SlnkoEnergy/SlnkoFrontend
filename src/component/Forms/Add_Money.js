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
import { toast } from "react-toastify";

const Add_Money = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
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

  const [submittedBy, setSubmittedBy] = useState("");
  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [user, setUser] = useState(null);

   useEffect(() => {
    const userData = getUserData();
  if (userData && userData.name) {
    setFormValues((prev) => ({
      ...prev,
      submittedBy: userData.name,
    }));
  }
  setUser(userData);
}, []);
  
    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      console.log("Add money :", userData);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.name) setSubmittedBy(parsed.name);
    }
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const storedProjectId = Number(localStorage.getItem("add_money"));

        console.log(storedProjectId);

        if (!storedProjectId) {
          setError("No project ID found in local storage.");
          return;
        }

        const response = await Axios.get(`/project?p_id=${storedProjectId}`, {
          headers: { "x-auth-token": token },
        });

        let project = response?.data?.data;

        if (Array.isArray(project)) {
          project = project[0];
        }

        if (project) {
          setFormValues((prev) => ({
            ...prev,
            p_id: project.p_id || "",
            code: project.code || "",
            name: project.name || "",
            customer: project.customer || "",
            p_group: project.p_group || "",
          }));
        } else {
          setError("No project found for the given Project ID.");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      }
    };

    fetchProjectData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cr_amount" && value < 0) {
      toast.warning("Credit Amount cannot be negative!");
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (_, newValue) => {
    setFormValues((prev) => ({ ...prev, cr_mode: newValue || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { p_id, cr_amount, cr_date, cr_mode, comment } = formValues;

    if (!p_id || !cr_amount || !cr_date || !cr_mode || !comment) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = { p_id, cr_amount, cr_date, cr_mode, comment };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      await Axios.post("/Add-MoneY-IT", payload, {
        headers: { "x-auth-token": token },
      });

      toast.success("Money added successfully!");
      navigate("/project-balance");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "neutral.softBg",
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          p: { xs: 2, md: 4 },
          boxShadow: 3,
          borderRadius: "md",
          backgroundColor: "background.surface",
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <img
            src={Img6}
            alt="Add Money"
            style={{ height: 50, marginBottom: 10 }}
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
              <Input
                fullWidth
                placeholder="Submitted By"
                value={submittedBy || "Loading..."}
                disabled
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input
                fullWidth
                placeholder="Project Code"
                name="code"
                value={formValues.code}
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

            {/* Editable Fields */}
            <Grid xs={12}>
              <Input
                fullWidth
                placeholder="Credit Amount (₹)"
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
                renderInput={(params) => (
                  <TextField
                    {...params}
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
                  loading={loading}
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
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Add_Money;