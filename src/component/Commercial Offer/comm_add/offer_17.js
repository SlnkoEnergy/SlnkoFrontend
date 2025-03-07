import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/slnko_blue_logo.png";
import "../CSS/offer.css";
import img1 from "../../../assets/Comm_offer/1.jpeg";
import img2 from "../../../assets/Comm_offer/2.jpeg";
import img3 from "../../../assets/Comm_offer/3.jpeg";
import img4 from "../../../assets/Comm_offer/hisar.png";
import img5 from "../../../assets/Comm_offer/5.jpeg";
import img6 from "../../../assets/Comm_offer/6.jpeg";
import img7 from "../../../assets/Comm_offer/7.jpeg";


const Page17= () => {
  
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
          paddingLeft: "40px",
        }}
      >
          {/* <Box
                  sx={{
                    position: "absolute",
                    left: "60%",
                    backgroundColor: "#F2F4F5",
                    height: "1200px",
                    width: "20%",
                    zIndex: -1,
                    "@media print": {
                      height: "297mm !important",
                      left: "67.59%",
                      width: "40%",
                    },
                  }}
                ></Box> */}
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
              width: "100%",
              padding: "40px",
            }}
          >
            <Typography
              sx={{
                textDecoration: "underline 2px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
              }}
              textColor={"#56A4DA"}
              fontSize={"1.5rem"}
              fontFamily={"serif"}
              fontWeight={"bold"}
            >
              LARGEST KUSUM{" "}
              <span style={{ color: "black" }}>PORTFOLIO IN INDIA</span>{" "}
            </Typography>
          </Box>

          {/* First Polygon */}
          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250, // Adjust as needed
              top: 5,
              "@media print": {
                printColorAdjust: "exact",
              },
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: "0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "#cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
            
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img1})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
                
              }}
            />
          </Box>
          {/* Second Polygon */}
          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,

              top: -13,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img2})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>
          {/* Third Polygon */}
          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,

              top: -28,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img3})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>

          {/* Fourth Polygon */}
          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,
              left: 210,
              top: -628,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img4})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>

          {/* Fifth Polygon */}

          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,
              left: 210,
              top: -648,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img5})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>

          {/* Sixth Polygon */}

          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,
              left: 420,
              top: -1012,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img6})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>

          {/* Seventh Polygon */}

          <Box
            sx={{
              position: "relative",
              width: 300, // Adjust as needed
              height: 250,
              left: 420,
              top: -1032,
            }}
          >
            {/* Outer Box (Shadow Layer) */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "transparent",
                boxShadow: " 0 0 20px  #cbcdc9", // Shadow effect
              }}
            />

            {/* Middle Box (Border Layer) */}
            <Box
              sx={{
                width: "95%", // Slightly smaller to fit inside the shadow
                height: "95%",
                position: "absolute",
                top: "2.5%",
                left: "2.5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                background: "  #cbcdc9", // Border color
              }}
            />

            {/* Inner Box (Image Layer) */}
            <Box
              sx={{
                width: "90%", // Slightly smaller to fit inside the border
                height: "90%",
                position: "absolute",
                top: "5%",
                left: "5%",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                backgroundImage: `url(${img7})`, // Replace with your image
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Box>
          {/* Text */}
          <Box
            sx={{
              position: "relative",
              top: -1140,
              left: -100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              "@media print": {
                top: -1140,
                left: -30,
              },
            }}
          >
            <Typography
              textColor={"#0f4C7f"}
              fontSize={"2.2rem"}
              fontWeight={"bold"}
              fontFamily={"sans-serif"}
              sx={{
                "@media print": {
                  fontSize: "2rem",
                },
              }}
            >
              401
            </Typography>

            <Typography
              textColor={"#0f4C7f"}
              fontSize={"2.2rem"}
              fontWeight={"bold"}
              fontFamily={"sans-serif"}
              sx={{
                "@media print": {
                  fontSize: "2rem",
                },
              }}
            >
              MWp
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              top: -950,
              left: 95,
              "@media print": {
                top: -1005,
                left: 95,
              },
            }}
          >
            <hr
              style={{
                width: "60%",
                color: "blue",
                borderTop: "1px solid goldenrod",
                position: "absolute",
              }}
            />
          </Box>

          <Box
            sx={{
              position: "relative",
              top: -1840,
              left: 445,
              "@media print": {
                top: -1840,
                left: 445,
              },
            }}
          >
            <Typography
              textColor={"#0f4C7f"}
              fontSize={"2.2rem"}
              fontWeight={"bold"}
              fontFamily={"montserrat"}
              sx={{
                "@media print": {
                  fontSize: "1.7rem",
                },
              }}
            >
              245 MWp Outgoing
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              top: -1845,
              left: 395,
              "@media print": {
                top: -1840,
                left: 405,
              },
            }}
          >
            <Typography
              textColor={"#56A4DA"}
              fontSize={"2.2rem"}
              fontWeight={"bold"}
              fontFamily={"montserrat"}
              sx={{
                "@media print": {
                  fontSize: "1.7rem",
                },
              }}
            >
              156 MWp Completed
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page17;