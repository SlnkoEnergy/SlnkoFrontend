import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import { useState } from "react";

import { toast } from "react-toastify";
import Img11 from "../../../assets/add_user.png";
import Axios from "../../../utils/Axios";

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

  const handleChange = (e, newValue) => {
    const { name, value } = e.target || { name: e, value: newValue };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData };
    try {
      const response = await Axios.post("/user-registratioN-IT", payload, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log("User registered successfully:", response.data);
      // alert("User registered successfully!");
      toast.success("User registered successfully!");
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
      // alert("Failed to register user. Please try again.");
      toast.error("Failed to register user. Please try again.");
    }
  };

  // const handleBack = () => {
  //   console.log("Back button clicked.");
  // };

  return (
    // <Box
    //   sx={{
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",

    //     width: "100%",
    //     minHeight: "100vh",
    //     backgroundColor: "background.level1",
    //     padding: "20px",
    //   }}
    // >
    <Sheet
      variant="outlined"
      sx={{
        width: "40%",
        margin: "auto",
        padding: 3,
        boxShadow: "lg",
        borderRadius: "md",
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
          level="h3"
          sx={{ textTransform: "uppercase", fontWeight: 800 }}
        >
          Add User
        </Typography>
        <Typography level="body2" sx={{ fontWeight: 700 }}>
          Add New User
        </Typography>
        <Divider sx={{ width: "50%", margin: "10px auto" }} />
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {[
            { label: "Employee ID", name: "emp_id" },
            { label: "User Name", name: "name" },
            { label: "User Email", name: "email", type: "email" },
            { label: "Contact Number", name: "phone" },
            { label: "Password", name: "password", type: "password" },
          ].map((field) => (
            <Grid item xs={12} key={field.name}>
              <FormControl fullWidth>
                <FormLabel>{field.label}</FormLabel>
                <Input
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </FormControl>
            </Grid>
          ))}

          {["role", "department"].map((field) => (
            <Grid item xs={12} key={field}>
              <FormControl fullWidth>
                <FormLabel>
                  {field === "role" ? "User Role" : "Department"}
                </FormLabel>
                <Select
                  name={field}
                  value={formData[field]}
                  onChange={(e, newValue) => handleChange(field, newValue)}
                  required
                >
                  {(field === "role"
                    ? [
                        "Front-end Developer",
                        "Back-end Developer",
                        "Manager",
                        "Assistant Manager",
                        "Executive",
                        "Executive Initial",
                        "Executive Follow",
                        "Executive Warm",
                        "Eng Executive One",
                        "Eng Executive Two",
                        "SCM Executive One",
                        "SCM Executive Two",
                        "Project Engineer",
                        "Team Lead",
                        "Site",
                      ]
                    : [
                        "IT",
                        "Engineering",
                        "SCM",
                        "BD",
                        "Operation",
                        "Projects",
                        "Accounts",
                      ]
                  ).map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          <Grid item xs={12} textAlign="center">
            <Button
              type="submit"
              variant="solid"
              color="primary"
              sx={{ marginRight: 2 }}
            >
              Submit
            </Button>
            {/* <Button variant="outlined" color="neutral" onClick={handleBack}>
                Back
              </Button> */}
          </Grid>
        </Grid>
      </form>
    </Sheet>
    // </Box>
  );
};

export default AddUserForm;

// import React from 'react'
// import Img from "../../../assets/work-in-progress.png";

// function AddUser() {
//   return (
//     <>
//     <div style={{display:"flex", flexDirection:"column", justifyContent:'center'}}>
//       <div>
//         <img src={Img} alt='progress Image' />
//       </div>

//       {/* <div style={{fontWeight:"bold", fontSize:"2rem"}}>Work IN Progress</div> */}

//     </div>

//     </>

//   )
// }

// export default AddUser;
