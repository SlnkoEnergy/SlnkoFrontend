import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { Button, List, ListItem, ListItemDecorator } from "@mui/joy";
import logo from "../../assets/Comm_offer/page1_logo.png";
import logo1 from "../../assets/Comm_offer/slnko.png";
import logo2 from "../../assets/Comm_offer/page1_back.jpeg";
import logo3 from "../../assets/Comm_offer/phone_icon (2).png";
import logo4 from "../../assets/Comm_offer/email_icon (2).png";
import Divider from "@mui/joy/Divider";

const Page1 = () => {
  return (
    <>
      {/* Outer container Box with full width and height */}
      <Box
        sx={{
          "@media print": {
            width: "210mm",
            height: "297mm",
          },
          width: "100%",
          height: "140vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner container Box with border and centered layout */}
        <Box
          sx={{
            "@media print": {
              width: "210mm",
              height: "297mm",
            },
            width: "50%",
            height: "130vh",
            border: "2px solid #0f4C7f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Main content Box for logo, background image, and text */}
          <Box
            sx={{
              width: "70%",
              height: "100%",
              "@media print": {
                width: "210mm",
                height: "297mm",
              },
            }}
          >
            {/* Top section with the logo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "15px",
                height: "10vh",
                "@media print": {
                  height: "10%",
                },
              }}
            >
              <img width={"50%"} height={'100%'} alt="logo" src={logo}></img>
            </Box>

            {/* Main section with background image, branding, and text */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                backgroundImage: `url(${logo2})`,
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100vh",
                backgroundSize: "cover",
                "@media print": {
                  backgroundImage: `url(${logo2})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                  height: "78%",
                  width: "100%",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                {/* Secondary logo */}
                <img width={"40%"} alt="logo" src={logo1} />
                {/* Branding Text */}
                <Typography
                  sx={{
                    "@media print": {
                      fontSize: "18px",
                    },
                  }}
                  paddingTop={"50px"}
                  fontSize={"20px"}
                  fontWeight={"500"}
                  component={"span"}
                >
                  INDIA'S LARGEST AND MOST TRUSTED BRAND FOR KUSUM
                </Typography>
                <Typography
                  fontSize={"1.25rem"}
                  fontWeight={"500"}
                  component={"span"}
                  sx={{
                    "@media print": {
                      fontSize: "18px",
                    },
                  }}
                >
                  PROJECTS
                </Typography>
                {/* Main commercial text */}
                <Typography
                  paddingTop={"320px"}
                  letterSpacing={"2px"}
                  fontSize={"45px"}
                  fontWeight={"300"}
                  textColor={"white"}
                  sx={{
                    "@media print": {
                      fontSize: "40px",
                      paddingTop: "310px",
                    },
                  }}
                >
                  COMMERCIAL
                </Typography>
                {/* Offer text */}
                <Typography
                  sx={{
                    filter: "drop-shadow(0 0 0.50rem white)",
                    fontWeight: "bolder",
                    letterSpacing: "18px",
                    marginTop: "-40px",
                    "@media print": {
                      fontSize: "100px",
                    },
                  }}
                  fontSize={"120px"}
                  fontWeight={"300"}
                  textColor={"#0f4C7f"}
                >
                  OFFER
                </Typography>
                {/* "Prepared for" box */}
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    width: "40%",
                    margin: "2px",
                    "@media print": {
                      margin: "1px",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "25px",
                      fontWeight: "600",
                      textAlign: "center",
                      "@media print": {
                        fontSize: "20px",
                        fontWeight: "500",
                      },
                    }}
                  >
                    PREPARED FOR
                  </Typography>
                </Box>
                {/* Ensure sections */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    paddingTop: "110px",
                    "@media print": {
                      paddingTop: "90px",
                    },
                  }}
                >
                  <List orientation="horizontal" >
                    {[
                      "ENSURE QUALITY",
                      "ENSURE SUSTAINABILITY",
                      "ENSURE SUPPORT",
                    ].map((item, index) => (
                      <ListItem
                        key={index}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <ListItemDecorator
                          sx={{ minWidth: "auto", mr: 0.5, color: "black" }}
                        >
                          •
                        </ListItemDecorator>
                        <Typography
                          sx={{ fontWeight: "600",
                           '@media print':{
                             fontSize:'0.9rem'
                           }

                           }}
                          textColor={"black"}
                        >
                          {item}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
              </Box>
            </Box>

            {/* Contact section with phone and email */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "40px",
                "@media print": {
                  paddingTop: "10px",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img width="10%" alt="phone" src={logo3} />
                <Divider
                  sx={{ width: "50%", alignSelf: "center", marginY: 2 }}
                />
                <Typography>+91 9123153939</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img width={"10%"} alt="phone" src={logo4} />
                <Divider
                  sx={{ width: "50%", alignSelf: "center", marginY: 2 }}
                />
                <Typography>info@slnkoenergy.com</Typography>
              </Box>
            </Box>
          </Box>

          {/* Sidebar with rotating text */}
          <Box
            sx={{
              width: "30%",
              height: "100%",
              backgroundColor: "#0f4C7f",
              "@media print": {
                backgroundColor: "#0f4C7f",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              },
            }}
          >
            <Typography
              sx={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                fontSize: "120px",
                marginTop: "350px",
                letterSpacing: "8px",
                fontWeight: "bold",
                opacity: "0.3",
              }}
              textColor={"#56A4DA"}
              variant="h1"
            >
              YOJANA
            </Typography>
            <Typography
              sx={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                fontSize: "120px",
                marginTop: "350px",
                letterSpacing: "8px",
                fontWeight: "bold",
                opacity: "0.3",
              }}
              textColor={"#56A4DA"}
              variant="h1"
            >
              KUSUM
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Page1;