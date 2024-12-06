import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import { Button, Box, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, TimerOutlined } from "@mui/icons-material";
import Colors from "../../../utils/colors";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otpFromAPI = location.state?.otp;

  const [email, setEmail] = useState("");
  const [number, setNumber] = useState({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [validationErrors, setValidationErrors] = useState({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [otpSent, setOtpSent] = useState(false);

  const textInputRefs = useRef(Array.from({ length: 6 }).map(() => React.createRef()));

  const onChange = (e, index) => {
    const inputValue = e.target.value;

    if (inputValue.length === 1 && /^[0-9]$/.test(inputValue)) {
      setNumber({ ...number, [index]: parseInt(inputValue) });
      setValidationErrors({ ...validationErrors, [index]: "" });

      if (index < 5 && textInputRefs.current[index + 1]?.current) {
        textInputRefs.current[index + 1].current.focus();
      }
    } else {
      setNumber({ ...number, [index]: "" });
      setValidationErrors({ ...validationErrors, [index]: "Field is required and must be a single digit (0-9)." });
    }
  };

  const enteredOtp = Object.values(number).join("").trim();

  const resendOtp = async () => {
    try {
      const response = await axios.post("https://backendslnko.onrender.com/v1/forget-password-send-otp", { userEmail: email });
      console.log("Resend OTP response:", response.data);
      alert("OTP Resent Successfully");
    } catch (error) {
      console.error("Resend OTP failed:", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (otpSent) {
      // Verify OTP entered by user
      if (enteredOtp === otpFromAPI) {
        alert("OTP Matched");
        navigate("/login", { 
          state: { formData: { userEmail: email, otp: enteredOtp } },
        });
      } else {
        alert("Incorrect OTP. Please try again.");
      }
    } else {
      // Send OTP to email
      try {
        const response = await axios.post("https://backendslnko.onrender.com/v1/forget-password-send-otp", { userEmail: email });
        setOtpSent(true); // Mark OTP as sent
        alert("OTP sent to your email");
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Error sending OTP. Please try again.");
      }
    }
  };

  const isSubmitDisabled = Object.values(validationErrors).some((error) => !!error);

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
    <Box
      sx={{
        background: "radial-gradient(circle at 100% 100%, #023159, #1F476A, #F5F5F5)",
        height: "100vh",
        width: "100vw",
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
            <form style={formStyle} onSubmit={handleFormSubmit}>
              <Box sx={{ display: "flex" }}>
                <Button
                  sx={{ color: Colors.palette.secondary.main, justifyContent: "flex-start" }}
                  onClick={() => navigate("/login")}
                >
                  <ArrowBackIos />
                </Button>
                <Typography
                  variant="h4"
                  sx={{ color: Colors.palette.secondary.main, flex: 0.8, textAlign: "center" }}
                >
                  Forgot Password?
                </Typography>
              </Box>

              <Box mt={5}>
                {!otpSent ? (
                  <>
                    <Typography>Enter Your Registered Email:</Typography>
                    <TextField
                      variant="outlined"
                      placeholder="Enter your email"
                      id="email"
                      name="email"
                      fullWidth
                      size="small"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      sx={submitButtonStyle}
                    >
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography>Enter OTP sent to your email:</Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <TextField
                          key={index}
                          type="text"
                          variant="outlined"
                          value={number[index] ?? ""}
                          onChange={(e) => onChange(e, index)}
                          sx={{
                            width: "40px",
                            mt: 1,
                            ml: index === 3 ? 3 : 1,
                          }}
                          inputRef={textInputRefs.current[index]}
                        />
                      ))}
                    </Box>
                    {Object.values(validationErrors).map((error, index) => (
                      <Typography
                        key={index}
                        sx={{
                          color: Colors.palette.error.main,
                          mt: "0.5rem",
                          textAlign: "center",
                        }}
                      >
                        {error}
                      </Typography>
                    ))}
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Typography>
                        Didn’t receive the OTP?
                        <span
                          onClick={resendOtp}
                          style={{
                            color: Colors.palette.secondary.blue,
                            cursor: "pointer",
                          }}
                        >
                          Resend
                        </span>
                        <TimerOutlined /> 00:45
                      </Typography>
                    </Box>
                    <Button
                      type="submit"
                      sx={submitButtonStyle}
                      disabled={isSubmitDisabled}
                    >
                      Submit <ArrowForwardIos sx={{ fontSize: "20px" }} />
                    </Button>
                  </>
                )}
              </Box>
            </form>
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
};

export default PasswordReset;
