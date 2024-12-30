import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Divider,
} from "@mui/material";
import axios from "axios";
import Img11 from "../Assets/add_user.png"; // Replace with the actual path to your image.

const EditUserForm = () => {
  const [formData, setFormData] = useState({
    emp_id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: "",
  });

  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "/get-all-user"
        );
        console.log("Full API Response:", response); // Log the full API response

        // Check if data exists and map to formData
        if (response.data && response.data.data.length > 0) {
          const userData = response.data.data[20]; // Assuming you want the first user
          setFormData({
            emp_id: userData.emp_id || "",
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            role: userData.role || "",
            department: userData.department || "",
            password: userData.password || "",
          });
          console.log("User Data Fetched and Loaded:", userData);
        } else {
          console.warn("No user data found");
        }
      } catch (err) {
        console.error("Error fetching users:", err.message || err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "", // Default to an empty string
    }));
    console.log(`Field Changed: ${name} = ${value}`);
  };

  // Handle form submission (Save button)
  const handleSave = async () => {
    console.log("Form Data Submitted:", formData);

    try {
      const response = await axios.post(
        "https://backendslnko.onrender.com/v1/user-registration", // API endpoint
        formData
      );
      console.log("User updated successfully:", response.data);
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err.message || err);
      alert("Failed to update user. Please try again.");
    }
  };

  // Handle Back button
  const handleBack = () => {
    console.log("Back button clicked.");
    // Logic to navigate back or reset form
  };

  // Loading or error states
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #e7eaf6, #a2a8d3, #38598b)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        padding: "20px",
      }}
    >
      <Paper
        sx={{
          maxWidth: 600,
          width: "100%",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
          backgroundColor: "#e2e8f5",
        }}
      >
        {/* Header Section */}
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              padding: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid #5791ff",
              backgroundColor: "#f9f9f9",
              borderRadius: "50%",
              maxWidth: "90px",
              margin: "auto",
            }}
          >
            <img
              src={Img11}
              alt="logo-icon"
              style={{ borderRadius: "4px", maxHeight: "70px" }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Bona Nova SC, serif",
              textTransform: "uppercase",
              color: "#12263f",
              fontWeight: 800,
            }}
          >
            Edit User
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontWeight: 700 }}
          >
            Modify User Information
          </Typography>
          <Divider sx={{ width: "50%", margin: "10px auto", fontWeight: "bold" }} />
        </Box>

        {/* Form Section */}
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={handleChange}
                  name="role"
                  label="User Role"
                >
                  <MenuItem value="Front-end Developer">Front-end Developer</MenuItem>
                  <MenuItem value="Back-end Developer">Back-end Developer</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Assistant Manager">Assistant Manager</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                  <MenuItem value="Executive Initial">Executive Initial</MenuItem>
                  <MenuItem value="Executive Follow">Executive Follow</MenuItem>
                  <MenuItem value="Executive Warm">Executive Warm</MenuItem>
                  <MenuItem value="Eng Executive One">Eng Executive One</MenuItem>
                  <MenuItem value="Eng Executive Two">Eng Executive Two</MenuItem>
                  <MenuItem value="SCM Executive One">SCM Executive One</MenuItem>
                  <MenuItem value="SCM Executive Two">SCM Executive Two</MenuItem>
                  <MenuItem value="Project Engineer">Project Engineer</MenuItem>
                  <MenuItem value="Team Lead">Team Lead</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleChange}
                  name="department"
                  label="Department"
                >
                  <MenuItem value="IT">IT Department</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="SCM">SCM</MenuItem>
                  <MenuItem value="BD">BD</MenuItem>
                  <MenuItem value="Operation">Operation</MenuItem>
                  <MenuItem value="Project">Project</MenuItem>
                  <MenuItem value="Accounts">Accounts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ marginRight: 2 }}
              >
                Update
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleBack}>
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditUserForm;