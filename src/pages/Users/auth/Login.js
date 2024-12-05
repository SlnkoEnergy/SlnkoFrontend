import { Container, Grid } from '@mui/material';
import React, { useRef } from 'react';
import {
    Card,
    Button,
    TextField,
    Checkbox,
    Link,
    FormControlLabel,
    Paper,
    Box, 
    Typography,
    IconButton,
    InputAdornment
} from "@mui/material";
import { useState } from 'react';
import Img1 from '../../../assets/New_Solar1.png';
import Img2 from '../../../assets/New_Solar2.png';
import ImgX from '../../../assets/slnko_white_logo.png';
import Img4 from '../../../assets/New_Solar3.png';
import Img5 from '../../../assets/Protrac_blue.png';
import { useNavigate } from "react-router-dom";
// import Axios from '../../../utils/Axios';
import axios from 'axios';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useFormik } from "formik";
import * as Yup from "yup";
import LockIcon from "@mui/icons-material/Lock";
import { Label, Visibility, VisibilityOff } from "@mui/icons-material";
import Colors from '../../../utils/colors';



const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

 

    const paperStyle = {
        background: Colors.palette.primary.main,
        
        height: 'auto',
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        borderRadius: 25,
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

    
     
      const sliderSettings = {
       
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
      
        
        
        
      };


      const LoginUser = async () => {
        try {
          const response = await axios.get("https://backendslnko.onrender.com/v1/get-all-user", {
            params: {
              userName: formik.values.userName,
              passWord: formik.values.passWord,
            },
          });
          console.log("Login successful:", response.data);
          navigate("/all-project");
        } catch (error) {
          console.error("Login failed:", error.response ? error.response.data : error.message);
        }
      };

  const validationSchema = Yup.object({
    userName: Yup.string()
    .required("Name is required"),
    password: Yup.string()
    .required("Password is required")
    .matches(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        "Password Should have one Capital Letter, one number, and one special character"
    )
    .min(8, "Password must be at least 8 characters in length"),
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      passWord: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log("On Submit: ", values);
      LoginUser();
    },
  });

    return (

      <Box
      sx={{
        background: "radial-gradient(circle at 100% 100%, #023159, #1F476A, #F5F5F5)",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow:'hidden'
        
      }}
    >
      <Grid container spacing={2} sx={{ width: "100%", height: "100%",  }}>
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
            <img src={ImgX} alt="Solar 2" style={{ width: "100%", height: "auto" }} />
            <img src={Img1} alt="Solar 1" style={{ width: "100%", height: "auto" }} />
            {/* <img src={Img2} alt="Solar 2" style={{ width: "100%", height: "auto" }} /> */}
            
            {/* <img src={Img3} alt="Solar 3" style={{ width: "100%", height: "auto" }} /> */}
            <img src={Img4} alt="Solar 4" style={{ width: "100%", height: "auto" }} />
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
            style={paperStyle}
            sx={{
              background: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))`,
              width:{sm:'60%',xl:'60%', md:'85%'},
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
              <img src={Img5} alt="Logo" style={{ width: "100%", maxWidth: "250px" }} />
            </Box>

            <form
              noValidate
              encType="multipart/form-data"
              onSubmit={formik.handleSubmit}
              style={{ width: "100%", }}
            >
              <Typography>UserName:</Typography>
              <TextField
                variant="outlined"
                placeholder="Enter your UserName"
                id="userName"
                name="userName"
                fullWidth
                size="small"
                type="text"
                value={formik.values.userName}
                onChange={formik.handleChange}
                error={formik.touched.userName && Boolean(formik.errors.userName)}
                helperText={formik.touched.userName && formik.errors.userName}
                sx={{ marginBottom: "20px" }}
              />
              <Typography>Password:</Typography>
               <TextField
                    variant="outlined"
                    placeholder="Password"
                    id="passWord"
                    name="passWord"
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "passWord"}
                    value={formik.values.passWord}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.passWord && Boolean(formik.errors.passWord)
                    }
                    helperText={
                      formik.touched.passWord && formik.errors.passWord
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {/* <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton> */}
                        </InputAdornment>
                      ),
                    }}
                  />
              <Typography
                sx={{
                  color: "#023159",
                  display: "flex",
                  mt: "1.2rem",
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
                onClick={() => LoginUser()}
              >
                Login
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>

    );
};
export default Login;