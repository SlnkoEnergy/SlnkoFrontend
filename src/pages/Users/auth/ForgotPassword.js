import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Container,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Grid,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Colors from "../../../utils/colors";
import { useLocation, useNavigate } from "react-router-dom";
// import Axios from "../../../utils/Axios1";

const validationSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password should have one capital letter, one number, and one special character"
    )
    .min(8, "Password must be at least 8 characters long"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

function PasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const userDataFromOTP = location.state?.formData;

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // try {
      //   const resetData = {
      //     ...userDataFromOTP,
      //     newPassword: values.password,
      //     confirmPassword: values.confirmPassword,
      //   };
      //   const response = await Axios.post("/forgotPassword", resetData);
      //   console.log("New Password:", response.data);
      //   alert("Password reset successful!");
      //   navigate("/login");
      // } catch (error) {
      //   console.error("Password reset failed:", error);
      //   alert("Password reset Unsuccessful!");
      // }
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const paperStyle = {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderRadius: 25,
  };

  const formStyle = {
    width: "100%",
    marginTop: "10%",
    position: "center",
  };

  const submitButtonStyle = {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "15px",
    borderRadius: 15,
    display: "flex",
    textAlign: "center",
    color: "white",
    backgroundColor: Colors.palette.secondary.main,
  };

  return (
    <>
      <Box
        sx={{
          background:
            "radial-gradient(circle at 100% 100%, #023159, #1F476A, #F5F5F5)",
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Container maxWidth="sm">
            <Grid container>
              <Paper
                elevation={3}
                style={paperStyle}
                sx={{
                  width: "100%",
                  background: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))`,
                }}
              >
                <form
                  style={formStyle}
                  noValidate
                  onSubmit={formik.handleSubmit}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: Colors.palette.secondary.main,
                      flex: 0.8,
                      textAlign: "center",
                    }}
                  >
                    Reset Password
                  </Typography>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    size="small"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    sx={{ marginBottom: "20px", marginTop: "40px" }}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    size="small"
                    sx={{ marginBottom: "20px" }}
                    type={showConfirmPassword ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.confirmPassword &&
                      Boolean(formik.errors.confirmPassword)
                    }
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {/* {showConfirmPassword ? <Visibility /> : <VisibilityOff />} */}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!formik.isValid}
                    fullWidth
                    style={{ ...submitButtonStyle }}
                    // onClick={LoginUser }
                  >
                    Reset Password
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default PasswordReset;