import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import * as Yup from "yup";
import Img1 from "../../../assets/New_Solar3.png";
import Img5 from "../../../assets/Protrac_blue.png";
import ImgX from "../../../assets/slnko_white_logo.png";
import axios from "axios";
import { useAddLoginsMutation } from "../../../redux/loginSlice";
import Colors from "../../../utils/colors";
import { OtpVerification } from "./OtpVerification";
import { Modal, ModalDialog } from "@mui/joy";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [addLogin] = useAddLoginsMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoInfo, setGeoInfo] = useState({
    latitude: null,
    longitude: null,
    fullAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        let fullAddress = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          fullAddress = data.display_name || "";
        } catch (err) {
          console.log("Reverse geocoding failed");
        }
        setGeoInfo({ latitude, longitude, fullAddress });
      }
    );
  }, []);

  console.log({geoInfo})

  const handleLogin = async (values) => {
    if (!geoInfo.latitude || !geoInfo.longitude) {
      toast.error("Location is required to login. Please enable location access.");
      return;
    }
    setIsSubmitting(true);
    try {
      const loginPayload = {
        ...values,
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        fullAddress: geoInfo.fullAddress,
      };

      const user = await addLogin(loginPayload).unwrap();

      if (!user.token) {
        toast.error("Login failed: Token not received.");
        return;
      }

      const expiration = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem("authToken", user.token);
      localStorage.setItem("authTokenExpiration", expiration.toString());

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-all-useR-IT`,
        {
          headers: { "x-auth-token": user.token },
          withCredentials: true
        }
      );

      const matchedUser = response?.data?.data.find(
        (item) => String(item._id) === String(user.userId)
      );

      if (!matchedUser) {
        toast.error("Login failed: User details not found.");
        return;
      }

      const userDetails = {
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone,
        emp_id: matchedUser.emp_id,
        role: matchedUser.role,
        department: matchedUser.department || "",
        userID: matchedUser._id || "",
        location: matchedUser.location || "",
        about: matchedUser.about || "",
        attacchment_url: matchedUser.attacchment_url || "",
      };

      localStorage.setItem("userDetails", JSON.stringify(userDetails));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Login failed.";
      const email = error?.response?.data?.email || error?.data?.email || error?.email;
      if (
        message === "Unrecognized device. OTP has been sent for verification."
      ) {
        setEmailForOtp(email);
        setOtpDialogOpen(true);
        toast.info(message);
        return;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required!"),
    password: Yup.string()
      .required("Password is required!")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password must contain one uppercase letter, one lowercase letter, one number, and one special character."
      )
      .min(8, "Password must be at least 8 characters long."),
  });

  const formik = useFormik({
    initialValues: { name: "", password: "" },
    validationSchema: validationSchema,
    onSubmit: handleLogin,
  });

  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };
  

   const submitButtonStyle = {
    padding: "12px",
    margin: "20px 0",
    borderRadius: 15,
    fontWeight: "600",
    backgroundColor: Colors.palette.secondary.main,
    display: "block",
    textAlign: "center",
    marginTop: "5%",
    marginLeft: { xs: "20%", sm: "30%" },
  };
  return (
    <Box
      sx={{
        background:
          "radial-gradient(circle at 100% 100%, #023159, #1F476A, #F5F5F5)",
        height: { md: "100%", xs: "100vh" },
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // overflow: "hidden",
      }}
    >
      <Grid container spacing={2} sx={{ width: "100%", height: "100%" }}>
        {/* Left Grid with Slider */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: { xs: "none", sm: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Slider {...sliderSettings} style={{ width: "100%" }}>
            <img
              src={ImgX}
              alt="Solar 2"
              style={{ width: "100%", height: "auto", marginTop: "20%" }}
            />
            <img
              src={Img1}
              alt="Solar 1"
              style={{ width: "100%", height: "auto" }}
            />
          </Slider>
        </Grid>

        {/* Right Grid with Form */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Paper
            elevation={3}
            // style={paperStyle}
            sx={{
              // background: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))`,
              width: { sm: "60%", xl: "60%", md: "85%" },
              background: Colors.palette.primary.main,
              marginTop: { xl: "20%", sm: "0%" },
              height: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              borderRadius: 10,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <img
                src={Img5}
                alt="Logo"
                style={{ width: "100%", maxWidth: "250px" }}
              />
            </Box>

            <form
              noValidate
              encType="multipart/form-data"
              onSubmit={formik.handleSubmit}
              style={{ width: "100%" }}
            >
              <Typography>Username:</Typography>
              <TextField
                variant="outlined"
                placeholder="Enter your name / Employee Code(SE-0XX)"
                id="name"
                name="name"
                fullWidth
                size="small"
                type="text"
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#1976d2" },
                    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                  },
                }}
              />
              <Typography>Password:</Typography>
              <TextField
                variant="outlined"
                placeholder="Password"
                id="password"
                name="password"
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                required
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  endAdornment: (
                    <Button
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </Button>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#1976d2" },
                    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                  },
                }}
              />
              {/* Error Message */}
              {errorMessage && (
                <Typography
                  sx={{ color: "red", fontSize: "0.875rem", mb: "10px" }}
                >
                  {errorMessage}
                </Typography>
              )}
              <Typography
                sx={{
                  color: "#023159",
                  display: "flex",
                  // mt: "1.2rem",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/forgot-password")}
              >
                <LockIcon sx={{ mr: "1rem" }} />
                Forgot password?
              </Typography>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                style={submitButtonStyle}
                disabled={isSubmitting}
                // onClick={() => LoginUser()}
              >
                {isSubmitting ? "Logging you in..." : "Login"}
              </Button>
            </form>
          </Paper>
        </Grid>
     
<Modal open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
  <ModalDialog>
    <Typography level="h4" component="h2">
      OTP Verification
    </Typography>

    <OtpVerification
      email={emailForOtp}
      onSuccess={() => setOtpDialogOpen(false)}
    />
  </ModalDialog>
</Modal>

      </Grid>
    </Box>
  );
};
export default Login;
