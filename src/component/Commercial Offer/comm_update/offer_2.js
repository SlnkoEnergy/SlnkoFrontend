import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import React from "react";
import logo from "../../../assets/Comm_offer//white_logo.png";
import logo1 from "../../../assets/Comm_offer/2(1).jpg";
import logo2 from "../../../assets/Comm_offer/2(2).JPG";
import "../CSS/offer.css";

const Page2 = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "130vh",
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
          width: "60%",
          height: "100%",
          display: "flex",
          border: "2px solid #0f4C7f",
          position:'relative',
          "@media print": {
            width: "210mm",
            height: "297mm",
            boxShadow: "none",
          },
        }}
      >
        {/* Left Side (Blue Background + Rotated Text) */}
        <Box
          sx={{
            width: "30%",
            height: "100%",
            backgroundColor: "#1A5D90",
            "@media print": {
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            },
          }}
        >
          <Box sx={{ textAlign: "center", position: "absolute", zIndex: 2 }}>
            <img
              alt="logo"
              src={logo}
              style={{ width: "300px", height: "300px", marginLeft: "10px" }}
              className="logo-img"
              loading="lazy"
            />
          </Box>
          <Box>
            <Typography
              sx={{
                transform: "rotate(90deg)",
                transformOrigin: "center",
                fontSize: "120px",
                letterSpacing: "8px",
                fontWeight: "bold",
                marginTop: "145px",
                opacity: "0.3",
                "@media print": {
                  marginTop: "80px",
                },
              }}
              textColor={"#56A4DA"}
              variant="h1"
            >
              KUSUM
            </Typography>
            <Typography
              sx={{
                transform: "rotate(90deg)",
                transformOrigin: "center",
                fontSize: "120px",
                letterSpacing: "8px",
                marginTop: "330px",
                fontWeight: "bold",
                opacity: "0.3",
              }}
              textColor={"#56A4DA"}
              variant="h1"
            >
              YOJANA
            </Typography>
          </Box>
        </Box>

        {/* Right Side (About Us Section) */}
        <Box
          sx={{
            width: "70%",
            height: "100%",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          {/* About Us Content */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              padding: "24px 48px",
              flexDirection: "column",
              flexGrow: 1, // Takes available space
            }}
          >
            <Box sx={{ display: "flex", marginBottom: "8px" }}>
              <Typography component="h1" textColor="black" fontSize="4rem">
                ABOUT
              </Typography>
              <Typography component="h1" textColor="#0f4C7f" fontSize="4rem" ml={3}>
                US...
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  "@media print": {
                    fontWeight: "500",
                    fontSize: "1.3rem",
                    
                  },
                 
                }}
                marginBottom="1rem"
                fontFamily={"sans-serif"}
                fontSize="1.6rem"
                fontWeight="500"
                textAlign={"justify"}
                
              >
                SLnko is a one-stop platform offering Engineering, Vendor
                Management, and Project Management Services. Our solutions can
                be availed at any stage, from early planning up to
                construction, installation, and commissioning.
              </Typography>
            </Box>
          </Box>

          {/* Images at the Bottom */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "40%",
              gap: 2,
              paddingBottom: "45px",
            }}
          >
            <Box sx={{ width: "98%", height: "50%" }}>
              <img width="100%" height="100%" alt="logo" src={logo1} loading="lazy" />
            </Box>
            <Box sx={{ width: "98%", height: "50%" }}>
              <img width="100%" height="100%" alt="logo" src={logo2} loading="lazy" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Overlay Text */}
      <Box
        sx={{
          position: "absolute",
          top: "192%",
          left: "40.85%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 2,
          padding: "30px",
          marginTop: "50px",
          "@media print": {
            top: "138%",
            left: "35.1%",
          },
        }}
      >
        <Typography
          sx={{
            fontSize: "64px",
            maxWidth: "600px",
            fontWeight: 100,
            color: "white !important" ,
            "@media print": {
              maxWidth: "450px",
              fontSize: "48px",
              color: "white !important",
            },
          }}
        >
          <span style={{ fontWeight: "bold" }}>
          &nbsp;&nbsp;India's<span style={{ color: "#0f4C7f",marginInline:"3px"}}>Prominent</span>&nbsp;
          &nbsp;&nbsp;Com<span style={{ color: "#0f4C7f",marginInline:"3px" }}>pany for</span>&nbsp;
          KUSUM<span style={{ color: "#0f4C7f", marginInline:"3px" }}>Projects !!!</span>
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default Page2;