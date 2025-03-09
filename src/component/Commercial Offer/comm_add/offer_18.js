import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/slnko_blue_logo.png";
import "../CSS/offer.css";
import img1 from "../../../assets/Comm_offer/client_logo/1.png";
import img2 from "../../../assets/Comm_offer/client_logo/2.png";
import img3 from "../../../assets/Comm_offer/client_logo/3.png";
import img4 from "../../../assets/Comm_offer/client_logo/4.png";
import img5 from "../../../assets/Comm_offer/client_logo/5.png";
import img6 from "../../../assets/Comm_offer/client_logo/6.png";

import img7 from "../../../assets/Comm_offer/client_logo/7.png";
import img8 from "../../../assets/Comm_offer/client_logo/8.png";
import img9 from "../../../assets/Comm_offer/client_logo/9.png";
import img10 from "../../../assets/Comm_offer/client_logo/10.png";
import img11 from "../../../assets/Comm_offer/client_logo/12.png";
import img12 from "../../../assets/Comm_offer/client_logo/13.png";

import img13 from "../../../assets/Comm_offer/client_logo/13.png";
import img14 from "../../../assets/Comm_offer/client_logo/14.png";
import img15 from "../../../assets/Comm_offer/client_logo/15.png";
import img16 from "../../../assets/Comm_offer/client_logo/16.png";
import img17 from "../../../assets/Comm_offer/client_logo/17.png";
import img18 from "../../../assets/Comm_offer/client_logo/18.png";

import img19 from "../../../assets/Comm_offer/client_logo/19.png";
import img20 from "../../../assets/Comm_offer/client_logo/20.png";
import img21 from "../../../assets/Comm_offer/client_logo/21.png";
import img22 from "../../../assets/Comm_offer/client_logo/22.png";
import img23 from "../../../assets/Comm_offer/client_logo/23.png";
import img24 from "../../../assets/Comm_offer/client_logo/24.png";

import img25 from "../../../assets/Comm_offer/client_logo/25.png";
import img26 from "../../../assets/Comm_offer/client_logo/26.png";
import img27 from "../../../assets/Comm_offer/client_logo/27.png";
import img28 from "../../../assets/Comm_offer/client_logo/28.png";
import img29 from "../../../assets/Comm_offer/client_logo/29.png";

import logo1 from "../../../assets/Comm_offer/14_01img.png";

const Page18 = () => {
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
            height: "1450px",
            width: "20%",
            zIndex: -1,
            "@media print": {
              height: "297mm !important",
              left: "67.59%",
              width: "40%",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${logo1})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(2px)",
              zIndex: -1,
            },
          }}
        >
          {/* Your content remains clear here */}

          <Typography
            sx={{
              transform: "rotate(-90deg)",
              letterSpacing: "10px",
              fontWeight: "bold",
              opacity: "0.7",
              "@media print": {
                marginTop: "385px",
                fontSize: "5.5rem",
                marginRight: "50px",
                opacity: 0.7,
              },
            }}
            textColor={"white"}
            fontSize={"7rem"}
            marginTop={"515px"}
          >
            YOJANA
          </Typography>

          <Typography
            sx={{
              transform: "rotate(-90deg)",
              marginTop: "320px",
              letterSpacing: "10px",
              fontWeight: "bold",
              opacity: "0.7",
              "@media print": {
                fontSize: "5.5rem",
                marginRight: "50px",
                opacity: 0.7,
              },
            }}
            textColor={"white"}
            fontSize={"7rem"}
          >
            KUSUM{" "}
          </Typography>
        </Box>
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

          <Box
            sx={{
              width: "60%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "60px 0",
              padding: "0 30px",
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
              fontWeight={"bolder"}
              fontSize={"3rem"}
              textColor={"#56A4DA"}
            >
              OUR <span style={{ color: "black" }}>CLIENTS</span>{" "}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "60%",
              padding: "20px",
              "@media print": {
                width: "60%",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
              }}
              className="box-img"
            >
              <img height={"100px"} width={"100px"} alt="img1" src={img1}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img2" src={img2}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img3" src={img3}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img4" src={img4}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img5" src={img5}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img6" src={img6}  loading="lazy"/>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
              }}
              className="box-img"
            >
              <img height={"100px"} width={"100px"} alt="img7" src={img7}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img8" src={img8}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img9" src={img9}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img10" src={img10}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img11" src={img11}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img12" src={img12}  loading="lazy"/>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
              }}
              className="box-img"
            >
              <img height={"100px"} width={"100px"} alt="img13" src={img13}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img14" src={img14}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img15" src={img15}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img16" src={img16}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img17" src={img17}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img18" src={img18}  loading="lazy"/>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
              }}
              className="box-img"
            >
              <img height={"100px"} width={"100px"} alt="img19" src={img19}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img20" src={img20}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img21" src={img21}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img22" src={img22}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img23" src={img23}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img24" src={img24}  loading="lazy"/>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
              }}
              className="box-img"
            >
              <img height={"100px"} width={"100px"} alt="img25" src={img25}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img26" src={img26}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img27" src={img27}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img28" src={img28}  loading="lazy"/>
              <img height={"100px"} width={"100px"} alt="img29" src={img29}  loading="lazy"/>
            </Box>
          </Box>

          <Box
            sx={{
              width: "60%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "60px 0",
              padding: "0 30px",
            }}
          >
            <Typography
              fontSize={"3rem"}
              fontFamily={"serif"}
              textColor={"#56A4DA"}
              sx={{
                "@media print": {
                  fontSize: "2rem",
                },
              }}
            >
              Thank You
            </Typography>
            <Typography
              fontSize={"3rem"}
              fontFamily={"serif"}
              textColor={"#56A4DA"}
              sx={{
                "@media print": {
                  fontSize: "2rem",
                },
              }}
            >
              ...
            </Typography>
          </Box>

          <Box
            sx={{
              width: "60%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "60px 0 ",
              padding: "0 30px",
            }}
          >
            <Typography
              fontSize={"3rem"}
              fontFamily={"serif"}
              fontWeight={"bold"}
              textColor={"black"}
              sx={{
                "@media print": {
                  fontSize: "1.5rem",
                },
              }}
            >
              Slnko Energy PVT. LTD
            </Typography>
            <Typography
              fontSize={"2rem"}
              fontFamily={"serif"}
              textColor={"black"}
              sx={{
                "@media print": {
                  fontSize: "1.5rem",
                },
              }}
            >
              2nd Floor, B 58-B, Sector-60, Noida,{" "}
            </Typography>
            <Typography
              fontSize={"2rem"}
              fontFamily={"serif"}
              textColor={"black"}
              sx={{
                "@media print": {
                  fontSize: "1.5rem",
                },
              }}
            >
              Uttar Pradesh, 201301
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page18; ss