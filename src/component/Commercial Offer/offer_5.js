import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../assets/Comm_offer/slnko.png";
import "../Commercial Offer/CSS/offer.css";

const Page5 = () => {
  return (
    <>
      <Grid
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "@media print": {
            width: "210mm",
            height: "297mm",
            overflow: "hidden",
            margin: "0",
            padding: "0",
            pageBreakInside: "avoid",
          },
        }}
      >
        <Box
          sx={{
            position:'absolute',
            left:'59.59%',
            backgroundColor:'#F2F4F5',
            height:'137%',
            width:'20%',
            zIndex:-1,
            '@media print':{
              height:'297mm !important',
              left:'67.59%',
              width:'40%',
            }
          }}
          ></Box>
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid blue",
            "@media print": {
              width: "210mm",
              height: "297mm",
            },
          }}
        >
          
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            <img width={"300px"} height={"180px"} alt="logo" src={logo} />

            <hr
              style={{
                width: "50%",
                borderTop: "3px solid #0f4C7f", // Keeps the line visible
                margin: "36px 0",
                boxShadow: "none !important", // Force removal of any shadow
                background: "transparent !important", // Ensure no background color
                border: "none !important", // Ensure no border shadow
                // Remove any outline if applied
              }}
              
            />
          </Box>
          <br />
          <br />
          <br />
          <br />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                textDecoration: "underline 3px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
                '@media print':{
                  fontSize:'2rem'
                }
              }}
              textColor={"#56A4DA"}
              fontWeight={"bold"}
              fontSize={"2.5rem"}
              fontFamily={"sans-serif"}
            >
              COMMERCIAL OFFER <span style={{ color: "black" }}>FOR KUSUM</span>{" "}
            </Typography>
          </Box>
          <br />
          <br />
          <br />
          <Box
            sx={{
              width: "90%",
              paddingLeft: "40px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                '@media print':{
                  fontSize:'1.5rem'
                }
              }}
              >
                To
              </Typography>
            </Box>
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >
                Mr. xyz singh
              </Typography>
            </Box>
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >
                bfbdhbvhfvb, akfnkdsjnfsji, Lakshadweep - 0258
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >
                <span style={{ fontWeight: "bold" }}>Subject:</span> EPCM
                Services for 3 MW AC / 5 MW DC Ground Mount kusum Solar Project
                Component A
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >
                We are pleased to submit our commercial offer for the
                above-mentioned subject. We are submitting our most reasonable
                commercial offer for your consideration based on your
                requirements. We believe our quality-to-price ratio will meet
                your expectations.
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
            <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >
              We are looking forward to having a long and fruitful association with your esteemed organization through this project.

              </Typography>
            </Box>
            <br />
            <br />

            <Box>
            <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  '@media print':{
                  fontSize:'1.5rem'
                }
                }}
              >Thanking you! <br /> IT TEAM</Typography>
            </Box>

            <Box
            sx={{
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              position:"relative",
              marginTop:'24%',
              '@media print':{
                marginTop:'18%'
              }
            }}
            >
            <hr
              style={{
                width: "80%",
                color: "blue",
                borderTop: "2px solid goldenrod",
                
              }}
            />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page5;