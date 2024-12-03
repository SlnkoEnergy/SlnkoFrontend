import { Container, Grid } from '@mui/material';
import React, { useRef } from 'react';
import {
    Card,
    Button,
    TextField,
    Checkbox,
    Link,
    FormControlLabel,
    Box,
    Typography,
    IconButton,
    InputAdornment
} from "@mui/material";
import { useState } from 'react';
import Img1 from '../../../assets/Img_01.png';
import Img2 from '../../../assets/slnko_white_logo.png';
import Img3 from '../../../assets/Protrac_blue.png';
import { useNavigate } from "react-router-dom";
// import Axios from '../../../utils/Axios';
import axios from 'axios';
import { useFormik } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";


const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [isRemembered, setIsRemembered] = useState(false);

    const handleCheckboxChange = (event) => {
        setIsRemembered(event.target.checked);
    };

    const LoginUser = async () => {
        const data = {
          userName: formik.values.userName,
          passWord: formik.values.passWord,
        };
    
        try {
          const response = await axios.post("https://backendslnko.onrender.com/v1/login", data);
          console.log("Login successful:", response.data);
          navigate("/");
        } catch (error) {
          console.error("Login failed:", error);
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
      // LoginUser();
    },
  });

    return (
        <Container maxWidth="xxl" sx={{ padding: '0px!important', backgroundColor: '#12263F' }}>
            {/* <Grid container sx={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}> */}
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
                <Grid item xs={12} md={7} sx={{ height: '100vh' }}>
                    <img src={Img1} alt='picture1' style={{ height: '100%', width: '100%', position: 'relative',opacity:0.5, visibility: {xl:'flex', md:'none'} }} />
                    <img src={Img2} alt='picture2' style={{ position: 'absolute', top: '-160px', left: '-75px', zIndex: '1' }} />
                    {/* </Grid> */}
                </Grid>
                <Grid item xs={12} md={5} sx={{ height: '100vh', display: 'flex' }}>
                    <Grid container justifyContent="center" alignItems="center">

                        <Card sx={{ boxShadow: 3, padding: 3, borderRadius: 10 }}>
                            <Box textAlign="center" mb={3}>
                                <img src={Img3} alt="Logo" style={{ width: '70%', height: 'auto' }} />
                            </Box>
                            <form method="post" noValidate action="" onSubmit={formik.handleSubmit}>
                                <Box mb={2}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', fontWeight: 'bold', color: 'cornflowerblue' }}>
                                        Username
                                    </Typography>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        name="userName"
                                        placeholder="Enter username"
                                        value={formik.values.userName}
                                        onChange={formik.handleChange}
                                        error={
                                          formik.touched.userName && Boolean(formik.errors.userName)
                                        }
                                        helperText={
                                          formik.touched.userName && formik.errors.userName
                                        }
                                      
                                        sx={{ borderWidth: 3 }}
                                    />

                                </Box>

                                <Box mb={3}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Playfair Display', fontWeight: 'bold', color: 'cornflowerblue' }}>
                                        Password
                                    </Typography>
                                    <Box display="flex" alignItems="center" position="relative">
                                        
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            name="passWord"
                                           
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
                                                  <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                  >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                  </IconButton>
                                                </InputAdornment>
                                              ),
                                            }}
                                            sx={{ borderWidth: 3 }}
                                        />

                                        {/* <Box
                                            onClick={togglePasswordVisibility}
                                            sx={{
                                                position: 'absolute',
                                                right: 10,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            👁️
                                        </Box> */}

                                    </Box>
                                </Box>
                                
                                    <Grid container spacing={2}  alignItems="flex-start">
                                        <Grid item xs={12} md={6} sm={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        id="remember-checkbox"
                                                        checked={isRemembered}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                }
                                                label="Remember me"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} sm={6}>
                                            <Link href="#" className="forgot-pass-link" underline="hover" style={{float:'right', marginTop:'10px'}}>
                                                Forgot Your Password?
                                            </Link>
                                        </Grid>
                                    </Grid>
                                

                                <Box display="flex" justifyContent="center">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{ padding: '10px 30px', fontSize: '1rem' }}
                                        onClick={() => LoginUser()}
                                    >
                                        Log In
                                    </Button>
                                </Box>
                            </form>
                        </Card>
                    </Grid>
                    {/* </Grid> */}
                </Grid>

            </Grid>
        </Container>

    );
};
export default Login;