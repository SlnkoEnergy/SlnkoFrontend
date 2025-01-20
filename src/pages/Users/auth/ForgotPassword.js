import React, { useState, useRef } from "react";
import { Button, Box, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, TimerOutlined } from "@mui/icons-material";
import Colors from "../../../utils/colors";
import Axios from "../../../utils/Axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordReset = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [number, setNumber] = useState({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" });
  const [otpSent, setOtpSent] = useState(false);
  const textInputRefs = useRef(Array.from({ length: 6 }).map(() => React.createRef()));

  const onChange = (e, index) => {
    const inputValue = e.target.value;

    if (inputValue.length === 1 && /^[0-9]$/.test(inputValue)) {
      setNumber({ ...number, [index]: inputValue });

      if (index < 5 && textInputRefs.current[index + 1]?.current) {
        textInputRefs.current[index + 1].current.focus();
      }
    } else {
      setNumber({ ...number, [index]: "" });
    }
  };

  const enteredOtp = Object.values(number).join("").trim();

  // const resendOtp = async () => {
  //   try {
  //     await axios.post("https://backendslnko.onrender.com/v1/forget-password-send-otp", { email: email });
  //     toast.success("OTP Resent Successfully");
  //   } catch (error) {
  //     console.error("Error resending OTP:", error);
  //     toast.error("Error resending OTP. Please try again.");
  //   }
  // };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (otpSent) {
      try {
        const response = await Axios.post("/received-email", {
          email: email,
          otp: enteredOtp,
        });
        console.log("Response:", response.data);
        toast.success("Password Reset Successfully");
        navigate("/login");
      } catch (error) {
        console.error("Error verifying OTP:", error.response?.data || error.message);
     
      }
    } else {
      try {
        const response = await Axios.post("/forget-password-send-otp", { email: email });
        setOtpSent(true);
        console.log("OTP has been Sent: ", response);
        toast.success("OTP sent to your email");
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Error sending OTP. Please try again.");
      }
    }
  };

  const paperStyle = {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderRadius: 25,
  };

  const submitButtonStyle = {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "15px",
    borderRadius: 15,
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
      <ToastContainer />
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
            <form onSubmit={handleFormSubmit}>
              <Box sx={{ display: "flex", mb: 3 }}>
                <Button
                  sx={{ color: Colors.palette.secondary.main }}
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
                  {/* <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                    <Typography>
                      Didn’t receive the OTP?{" "}
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
                  </Box> */}
                  <Button
                    type="submit"
                    sx={submitButtonStyle}
                  >
                    Submit <ArrowForwardIos sx={{ fontSize: "20px" }} />
                  </Button>
                </>
              )}
            </form>
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
};

export default PasswordReset;
