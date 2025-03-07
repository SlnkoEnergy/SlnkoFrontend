import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/Comm_offer/slnko.png";
import "../CSS/offer.css";
import img1 from "../../../assets/Comm_offer/cost.jpeg";
import img2 from "../../../assets/Comm_offer/evaluation.jpeg";
import img3 from "../../../assets/Comm_offer/cropped-Detailed.jpeg";
import img4 from "../../../assets/Comm_offer/testing.jpeg";

const Page4 = () => {
  return (
    <>
      <Grid
        sx={{
          width: "100%",
          // height: "100%",
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
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
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
              marginTop: "2%",
            }}
          >
            <img
              width={"220px"}
              height={"110px"}
              alt="logo"
              src={logo}
              loading="lazy"
            />

            <hr
              style={{
                width: "60%",
                color: "blue",
                borderTop: "2px solid #0f4C7f",
                margin: "19px 0",
              }}
            />
          </Box>
          <br />
          <br />
          <br />
       
          <Box
            sx={{
              width: "100%",
              height: "40vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
              "@media print": {
                height: "24vh",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              },
            }}
          >
            <Box
              sx={{
                width: "33%",
                backgroundColor: "#0f4C7f",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                borderRadius: "5px",
                height: "100%",
              }}
            >
              <Typography
                fontSize={"5rem"}
                textColor={"black"}
                fontWeight={"bolder"}
                sx={{
                  "@media print": {
                    fontSize: "3.4rem",
                  },
                }}
              >
                OUR
              </Typography>
              <Typography
                fontSize={"5rem"}
                textColor={"#56A4DA"}
                fontWeight={"bolder"}
                sx={{
                  "@media print": {
                    fontSize: "3.4rem",
                  },
                }}
              >
                PRIORITY
              </Typography>
              <Typography
                fontSize={"5rem"}
                textColor={"#56A4DA"}
                fontWeight={"bolder"}
                sx={{
                  "@media print": {
                    fontSize: "3.4rem",
                  },
                }}
              >
                IS
              </Typography>
            </Box>
            <Box
              sx={{
                width: "60%",
                backgroundColor: "#F0EFEF",
                height: "100%",
                margin: "20px",
                borderRadius: "5px",
                "@media print": {
                  margin: "20px",
                },
              }}
            >
              <Typography
                fontSize={"1.7rem"}
                fontFamily={"sans-serif"}
                padding={"45px 20px"}
                textAlign={"justify"}
                sx={{
                  "@media print": {
                    fontSize: "1.3rem",
                    padding: "30px 10px",
                  },
                }}
              >
                Delivering excellence through meticulous planning, efficient
                management, and innovative solutions, with a strong focus on
                ensuring customer satisfaction and meeting the highest standards
                of quality and performance.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textUnderlineOffset: "8px",
              "@media print": {
                marginTop: "30px",
              },
            }}
          >
            <Typography
              textColor={"#56A4DA"}
              fontSize={"3.8rem"}
              fontWeight={"bolder"}
              sx={{
                textDecoration: "underline 3px rgb(243, 182, 39)",
                "@media print": {
                  fontSize: "2.2rem",
                },
              }}
            >
              SCOPE OF <span style={{ color: "black" }}>SERVICES</span>
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontFamily: "serif",
                textAlign: "center",
                marginTop: "20px",
                "@media print": {
                  fontSize: "1.5rem",
                  marginTop: "14px",
                },
              }}
            >
              SLNKO WILL BE PROVIDING FOLLOWING SERVICES TO <br /> OUR CLIENTS
            </Typography>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
              "@media print": {
                marginTop: "35px",
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                padding: "0 5px",
              }}
            >
              <Box
                sx={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100em 100em 0em 0em",
                  backgroundColor: "#F0EFEF",
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    height: "420px",
                  },
                }}
              >
                <img
                  style={{
                    filter: "drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                  }}
                  alt="img1"
                  src={img1}
                  width={"200px"}
                  height={"200px"}
                  className="print-img1"
                  loading="lazy"
                />
                <ul
                  style={{
                    listStyleType: "disc",
                    color: "black",
                    fontFamily: "serif",
                    fontSize: "22px",
                    textAlign: "left",
                    paddingLeft: "0 0 0 40px",
                  }}
                  className="ul-item"
                >
                  <li style={{ marginBottom: "20px" }}>Cost & Risk Analysis</li>
                  <li style={{ marginBottom: "20px" }}>Detailed Site Survey</li>
                  <li style={{ marginBottom: "20px" }}>DPR Preparation</li>
                  <li style={{ marginBottom: "20px" }}>Bank Loan Support</li>
                  <li style={{ marginBottom: "10px" }}>Engineering Design</li>
                </ul>
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                padding: "0 5px",
              }}
            >
              <Box
                sx={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100em 100em 0em 0em",
                  backgroundColor: "#F0EFEF",
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    height: "420px",
                  },
                }}
              >
                <img
                  style={{
                    filter: "drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                  }}
                  alt="img1"
                  src={img2}
                  width={"200px"}
                  height={"200px"}
                  className="print-img1"
                  loading="lazy"
                />
                <ul
                  style={{
                    listStyleType: "disc",
                    color: "black",
                    fontFamily: "serif",
                    fontSize: "22px",
                    textAlign: "left",
                    paddingLeft: "0 0 0 40px",
                  }}
                  className="ul-item"
                >
                  <li style={{ marginBottom: "20px" }}>
                    Pre-dispatch Inspection
                  </li>
                  <li style={{ marginBottom: "20px" }}>
                    Complete Transparency
                  </li>
                  <li style={{ marginBottom: "20px" }}>Document Evaluation</li>
                  <li style={{ marginBottom: "40px" }}>Best Market Price</li>
                </ul>
              </Box>
            </Box>

            <Box
              sx={{
                width: "100%",
                height: "100%",
                padding: "0 5px",
              }}
            >
              <Box
                sx={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100em 100em 0em 0em",
                  backgroundColor: "#F0EFEF",
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    height: "420px",
                  },
                }}
              >
                <img
                  style={{
                    filter: "drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                  }}
                  alt="img1"
                  src={img3}
                  width={"200px"}
                  height={"200px"}
                  className="print-img1"
                  loading="lazy"
                />
                <ul
                  style={{
                    listStyleType: "disc",
                    color: "black",
                    fontFamily: "serif",
                    fontSize: "22px",
                    textAlign: "left",
                    paddingLeft: "0 0 0 40px",
                  }}
                  className="ul-item"
                >
                  <li style={{ marginBottom: "20px" }}>Supervision</li>
                  <li style={{ marginBottom: "20px" }}>Inspection</li>
                  <li style={{ marginBottom: "20px" }}>Quality Control</li>
                  <li style={{ marginBottom: "40px" }}>Daily Updates</li>
                </ul>
              </Box>
            </Box>

            <Box
              sx={{
                width: "100%",
                height: "100%",
                padding: "0 5px",
              }}
            >
              <Box
                sx={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100em 100em 0em 0em",
                  backgroundColor: "#F0EFEF",
                  "@media print": {
                    WebkitPrintColorAdjust: "exact",
                    printColorAdjust: "exact",
                    height: "420px",
                  },
                }}
              >
                <img
                  style={{
                    filter: "drop-shadow(0 0 0.50rem black)",
                    borderRadius: "50%",
                  }}
                  alt="img4"
                  src={img4}
                  width={"200px"}
                  height={"200px"}
                  className="print-img1"
                  loading="lazy"
                />
                <ul
                  style={{
                    listStyleType: "disc",
                    color: "black",
                    fontFamily: "serif",
                    fontSize: "22px",
                    textAlign: "left",
                    paddingLeft: "0 0 0 40px",
                  }}
                  className="ul-item"
                >
                  <li style={{ marginBottom: "20px" }}>Liasoning</li>
                  <li style={{ marginBottom: "20px" }}>Testing</li>
                  <li style={{ marginBottom: "20px" }}>Commissioning</li>
                  <li style={{ marginBottom: "40px" }}>Maintenance Support</li>
                </ul>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page4;
