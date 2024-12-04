import { Container , Grid} from '@mui/material';
import React from 'react';
import {
    Card,
    Button,
    TextField,
    Checkbox,
    Link,
    FormControlLabel,
    Box,
    Typography,
} from "@mui/material";
import Img2 from '../Assets/slnko_white_logo.png';
const ForgotPassword =()=>{
    return(
        <Container maxWidth="xxl" sx={{  backgroundColor: '#12263F !important', height:'100vh' }}>
            <Grid container sx={{ display: 'flex' }}>
            <img src={Img2} alt='picture2' style={{ position: 'absolute', top: '-100px', left: '-55px', zIndex: '1',height:'35%' }} />
            
            </Grid>
            
            <Grid container sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height:'100%'}}>
                <Card sx={{backgroundColor:'#BBBBBB' , width:'60%', height:'60%'}}>
                <Box>
                
                <form method="post" action="" encType="multipart/form-data" style={{marginTop:'10%'}}>
                <h1 style={{textAlign: 'center'}}>Enter registered mail / mobile no.</h1>
                <Grid item flexDirection={'row'}>
                
                                <Box mb={2} sx={{display:'flex',justifyContent: 'center', alignItems: 'center' }}>
                                    
                                    <TextField
                                        variant="outlined"
                                        
                                        name="username"
                                        placeholder="Enter username"
                                        required
                                        sx={{ borderWidth: 3, width:'60%' }}
                                    />
                                    
                                        <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{marginInline:'1%' }}
                                    >
                                        Send OTP
                                    </Button>
                                </Box>
                               
                                
                          </Grid> 
                          <Grid item >
                          <Box mb={2} sx={{display:'flex',justifyContent: 'center', alignItems: 'center' }}>
                                    
                                    <TextField
                                        variant="outlined"
                                        
                                        name="username"
                                        placeholder="Verify OTP"
                                        required
                                        sx={{ borderWidth: 3, width:'60%' }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{marginInline:'1%' }}
                                    >
                                        Verify OTP
                                    </Button>
                                </Box>
                                <Box display={'flex'} justifyContent={'center'}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{marginInline:'1%', fontSize:'20px' }}
                                    >
                                        Submit
                                    </Button>
                                </Box>
                                
                          </Grid>
                            </form>
                </Box>
                
                </Card>
          
            </Grid>
        </Container>
    )
    
};

export default ForgotPassword;