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
// import Axios from "../../../utils/Axios";
import Colors from "../../../utils/colors";
import {
  useAddEmailMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "../../../redux/loginSlice";


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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

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

  const [addEmail] = useAddEmailMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [verifyOtp] = useVerifyOtpMutation();

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
        await addEmail({ email }).unwrap();
        toast.success("OTP sent to your email.");
        setOtpSent(true);
      } catch (error) {
        toast.error(error?.data?.message || "Failed to send OTP.");
      } finally {
        setLoading(false);
      }
    } else if (!otpVerified) {
      const enteredOtp = number.join("").trim();
      if (enteredOtp.length !== 6) {
        toast.error("Please enter the complete 6-digit OTP.");
        return;
      }

      setLoading(true);
      try {
        await verifyOtp({ email, otp: enteredOtp }).unwrap();
        toast.success("OTP verified successfully.");
        setOtpVerified(true);
      } catch (error) {
        toast.error(error?.data?.message || "Invalid or expired OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      
      if (newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }

      setPasswordError("");
      setLoading(true);

      try {
        await resetPassword({ email, newPassword, confirmPassword }).unwrap();
        toast.success("Password reset successfully.");
        navigate("/login");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to reset password.");
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
                  type="button"
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
                  {otpSent
                    ? otpVerified
                      ? "Reset Password"
                      : "Verify OTP"
                    : "Forgot Password?"}
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
                    sx={{ mt: 1 }}
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
              ) : !otpVerified ? (
                <>
                  <Typography>
                    Enter the 6-digit OTP sent to your email:
                  </Typography>
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
                        sx={{
                          width: "40px",
                          "& input": {
                            textAlign: "center",
                            fontSize: "20px",
                          },
                        }}
                        inputRef={textInputRefs.current[index]}
                        inputProps={{ maxLength: 1 }}
                      />
                    ))}
                  </Box>
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
                        Verify OTP
                        <ArrowForwardIos sx={{ fontSize: "20px", ml: 1 }} />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Typography>Enter New Password:</Typography>
                  <TextField
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="New Password(e.g. Abcdef@123)"
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Confirm Password(must same as new password)"
                    sx={{ mt: 2 }}
                    error={!!passwordError}
                    helperText={passwordError}
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
                      <Lottie
                        animationData={loadingAnimation}
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      "Reset Password"
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
