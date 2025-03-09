import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/Comm_offer/3(1).jpeg";
import img1 from "../../../assets/Comm_offer/cropped-Detailed_2.jpeg";
import img3 from "../../../assets/Comm_offer/ImgP03_04.png";
import img2 from "../../../assets/Comm_offer/vendor_manage.jpeg";
import Logo from "../../../assets/Comm_offer/white_logo.png";
import "../CSS/offer.css";
const Page3 = () => {
  return (
    <>
      <Grid
        sx={{
          width: "100%",
          height: "130vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "10px",
          // marginBottom: "100px",
          "@media print": {
            width: "84%",
            height: "100%",
            marginTop: "40px",
            marginBottom: "0px",
          },
        }}
      >
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
            "@media print": {
              width: "100%",
              height: "98vh",
            },
          }}
        >
          {/* Top */}
          <Box
            sx={{
              width: "100%",
              height: "40%",
              backgroundColor: "#0f4C7f",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "@media print": {
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              },
            }}
          >
            {/* Top Left*/}
            <Box
              sx={{
                width: "35%",
                height: "90%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                style={{ width: "80%", height: "100%", borderRadius: "5px" }}
                alt="img"
                src={logo}
                loading="lazy"
              />
            </Box>
            {/* Top Right*/}
            <Box
              sx={{
                width: "65%",
                height: "90%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                "@media print": {
                  gap: 9,
                },
              }}
            >
              <img
                width={"290px"}
                height={"110px"}
                style={{ objectFit: "cover" }}
                alt="logo"
                src={Logo}
                loading="lazy"
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: 4,
                  "@media print": {
                    gap: 2,
                  },
                }}
              >
                <Typography
                  fontWeight={"bolder"}
                  textColor={"black"}
                  sx={{
                    fontSize: "5rem",
                    "@media print": {
                      fontSize: "2.5rem !important",
                    },
                  }}
                >
                  WHY <span style={{ color: "#56A4DA" }}>US?</span>
                </Typography>
                <Typography
                  textColor={"#56A4DA"}
                  fontSize={"x-large"}
                  // fontWeight={"bold"}
                  fontFamily={"serif"}
                  textAlign={"justify"}
                  sx={{
                    paddingRight: "20px",
                    "@media print": {
                      fontSize: "1.8rem !important",
                      marginTop: "10px",
                      maxWidth: "600px",
                    },
                  }}
                >
                  We add incredible value to a project through our holistic and
                  systematic approach. We ensure that the project is optimized
                  for design along with other aspects such as execution,
                  durability, and operations thereby creating higher value for
                  money.
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Down */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              gap: 10,
              marginTop: "40px",
              "@media print": {
                gap: 14,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                height: "33.33%",
              }}
            >
              <Box
                sx={{
                  width: "33.33%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Typography
                  fontSize={"2rem"}
                  fontFamily={"serif"}
                  maxWidth={"33.33%"}
                  sx={{
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  Detailed Engineering
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#F0EFEF",
                  borderRadius: "100em 0em 0em 100em",
                  width: "67.777%",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: 20,
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    gap: 6,
                  },
                }}
              >
                <img
                  className="print-img"
                  style={{
                    filter: " drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                    padding: "10px",
                    width: "150px",
                  }}
                  alt="img"
                  src={img1}
                  loading="lazy"
                />

                <Typography
                  textColor={"#0f4C7f"}
                  fontSize={"22px"}
                  fontFamily={"serif"}
                  textAlign={"justify"}
                  sx={{
                    paddingRight: "20px",
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  Expert design and planning to ensure higher generation, and
                  cost optimization of the product
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                height: "33.33%",
                "@media print": {
                  gap: 4,
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#F0EFEF",
                  borderRadius: "0em 100em 100em 0em",
                  width: "67.777%",
                  display: "flex",
                  flexDirection: "row-reverse",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 18,
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    gap: 8,
                  },
                }}
              >
                <img
                  className="print-img"
                  style={{
                    filter: " drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                    padding: "10px",
                    width: "150px",
                  }}
                  // width={"150px"}
                  alt="img"
                  src={img2}
                  loading="lazy"
                />
                <Typography
                  textColor={"#0f4C7f"}
                  fontSize={"22px"}
                  fontFamily={"serif"}
                  textAlign={"justify"}
                  sx={{
                    paddingLeft: "20px",
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  Right material sourcing to ensure timely, high quality, and
                  cost effective project delivery
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "33.33%",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Typography
                  fontSize={"2rem"}
                  fontFamily={"serif"}
                  maxWidth={"33.33%"}
                  sx={{
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  Vendor Management
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                height: "33.33%",
              }}
            >
              <Box
                sx={{
                  width: "33.33%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Typography
                  fontSize={"2rem"}
                  fontFamily={"serif"}
                  maxWidth={"33.33%"}
                  sx={{
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  Site Management
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#F0EFEF",
                  borderRadius: "100em 0em 0em 100em",
                  width: "67.777%",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  gap: 20,
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    gap: 6,
                  },
                }}
              >
                <img
                  className="print-img"
                  style={{
                    filter: " drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                    padding: "10px",
                  }}
                  width={"150px"}
                  alt="img"
                  src={img3}
                  loading="lazy"
                />

                <Typography
                  textColor={"#0f4C7f"}
                  fontSize={"22px"}
                  fontFamily={"serif"}
                  textAlign={"justify"}
                  sx={{
                    paddingRight: "20px",
                    "@media print": {
                      fontSize: "1.6rem",
                    },
                  }}
                >
                  On-site supervision to ensure efficient execution, safety, and
                  adherence of quality standards
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page3;
