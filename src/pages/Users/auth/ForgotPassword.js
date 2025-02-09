import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Lottie from "lottie-react";
import React, { Suspense, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loadingAnimation from "../../../assets/Lotties/animation-loading.json";
import Axios from "../../../utils/Axios";
import Colors from "../../../utils/colors";

// const Lottie = lazy(() => import("lottie-react"));
// const loadingAnimation = lazy(
//   () => import("../../../assets/Lotties/animation-loading.json")
// );

const PasswordReset = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  // const [number, setNumber] = useState({
  //   0: "",
  //   1: "",
  //   2: "",
  //   3: "",
  //   4: "",
  //   5: "",
  // });
  const [number, setNumber] = useState(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const textInputRefs = useRef(
    Array.from({ length: 6 }).map(() => React.createRef())
  );

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const onChange = (e, index) => {
    const inputValue = e.target.value;
    if (/^\d?$/.test(inputValue)) {
      setNumber((prev) => {
        const updatedNumber = [...prev];
        updatedNumber[index] = inputValue;
        return updatedNumber;
      });

      if (inputValue && index < 5) {
        textInputRefs.current[index + 1]?.current?.focus();
      }
    }
  };

  const enteredOtp = number.join("").trim();

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

    if (!otpSent) {
      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address.");
        return;
      }

      setLoading(true);
      setEmailError("");

      try {
        await Axios.post("/forget-password-send-otp", { email });
        toast.success("OTP sent to your email");
        setOtpSent(true);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Error sending OTP. Check your Email ID."
        );
        setOtpSent(false);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);

      try {
        await Axios.post("/received-email", { email, otp: enteredOtp });
        toast.success("Password sent successfully to your email");

       
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Invalid OTP. Please try again."
        );
      } finally {
        setLoading(false);
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "white",
      color: Colors.palette.secondary.main,
    },
  };

  return (
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
                  sx={{
                    color: Colors.palette.secondary.main,
                    flex: 0.8,
                    textAlign: "center",
                  }}
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
                    fullWidth
                    size="small"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!emailError}
                    helperText={emailError}
                    required
                  />
                  <Button
                    type="submit"
                    sx={{
                      mt: 2,
                      width: "100%",
                      padding: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#1F476A",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Suspense fallback={<span>Loading...</span>}>
                        <Lottie
                          animationData={loadingAnimation}
                          style={{ width: 50, height: 50 }}
                        />
                      </Suspense>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Typography>Enter OTP sent to your email:</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, index) => (
                      <TextField
                        key={index}
                        type="text"
                        variant="outlined"
                        value={number[index] || ""}
                        onChange={(e) => onChange(e, index)}
                        sx={{ width: "40px", textAlign: "center" }}
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
                    sx={{
                      mt: 2,
                      width: "100%",
                      padding: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#1F476A",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Lottie
                        animationData={loadingAnimation}
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      <>
                        Submit
                        <ArrowForwardIos sx={{ fontSize: "20px", ml: 1 }} />
                      </>
                    )}
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
