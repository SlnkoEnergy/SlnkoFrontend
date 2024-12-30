import React, { useState } from "react";
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

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    emp_id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      emp_id: formData.emp_id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      password: formData.password,
    };

    try {
      const response = await axios.post(
        "/user-registration",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("User registered successfully:", response.data);
      alert("User registered successfully!");

      // Clear the form data
      setFormData({
        emp_id: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        password: "",
      });
    } catch (error) {
      console.error("Error registering user:", error.response || error);
      alert("Failed to register user. Please try again.");
    }
  };

  const handleBack = () => {
    console.log("Back button clicked.");
    // Add navigation logic here if needed
  };

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
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
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
            Add User
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontWeight: 700 }}
          >
            Add New User
          </Typography>
          <Divider sx={{ width: "50%", margin: "10px auto", fontWeight: "bold" }} />
        </Box>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                name="emp_id"
                value={formData.emp_id}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
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
                  <MenuItem value="" disabled>
                    Select Role
                  </MenuItem>
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
                  <MenuItem value="" disabled>
                    Select Department
                  </MenuItem>
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
                type="submit"
                variant="contained"
                color="primary"
                sx={{ marginRight: 2 }}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddUserForm;