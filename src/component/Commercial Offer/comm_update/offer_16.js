import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/slnko_blue_logo.png";
import "../CSS/offer.css";


const Page16 = () => {
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
        <Box
          sx={{
            position: "absolute",
            left: "60%",
            backgroundColor: "#F2F4F5",
            height: "1300px",
            width: "20%",
            zIndex: -1,
            "@media print": {
              height: "297mm !important",
              left: "67.59%",
              width: "40%",
            },
          }}
        ></Box>
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
              paddingTop: "20px",
              "@media print": {
                padding: "5px",
                marginTop: "10px",
              },
            }}
          >
            <img
              width={"350px"}
              height={"200px"}
              className="logo-img2"
              alt="logo"
              src={logo}
              loading="lazy"
            />

            <hr
              style={{
                width: "50%",
                borderTop: "3px solid #0f4C7f", // Keeps the line visible
                margin: "40px 0",
                boxShadow: "none !important", // Force removal of any shadow
                background: "transparent !important", // Ensure no background color
                border: "none !important", // Ensure no border shadow
                // Remove any outline if applied
              }}
              className="hr-line3"
            />
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "50px 0",
            }}
          >
            <Typography
              sx={{
                textDecoration: "underline 2px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
                "@media print": {
                  fontSize: "2rem",
                },
              }}
              textColor={"#56A4DA"}
              fontSize={"3rem"}
              fontWeight={"bolder"}
            >
              TERMS
            </Typography>
          </Box>
          <Box
            sx={{
              width: "90%",
              padding: "0 15px",
            }}
          >
            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              a. All the charges to be paid for Authority approval (direct or
              indirect) shall be paid by the client.
            </Typography>
            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              b. Client shall provide a clear ground in workable condition
              before start of the project.
            </Typography>
            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              c. Site security, material security and all kinds of insurance is
              in the scope of client.
            </Typography>
            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              d. All the liasoning paper works shall be done by SLNKO, however
              all the direct or indirect payments shall be made by client at
              actual.
            </Typography>

            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              e. Client shall timely make payment. Any delay due to non-payment
              or late payment shall be the client’s responsibility.
            </Typography>

            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              f. The above quantity is tentative and based on our previous
              records of sites which have been executed. It will change based on
              actual site conditions & land profile which shall be analyzed
              after detailed engineering.
            </Typography>

            <Typography
              margin={"0 0 20px"}
              fontSize={"1.5rem"}
              fontWeight={400}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              g. The above rates are based on recent market conditions and may
              change in case of change in law or market conditions.
            </Typography>
          </Box>

          <Box
            sx={{
              marginTop: "350px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              "@media print": {
                marginTop: "49%",
              },
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
        </Grid>
      </Grid>
    </>
  );
};

export default Page16;