import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../assets/Comm_offer/slnko.png";
import "../Commercial Offer/CSS/offer.css";
import img1 from "../../assets/Comm_offer/ImgP08.jpeg";
const Page8 = () => {
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
              className="logo-img1"
              alt="logo"
              src={logo}
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
              className="hr-line"
            />
          </Box>

          <Box
            sx={{
              width: "100%",
              padding: "30px",
              gap: 2,
              '@media print':{
                paddingTop:'0px'
              }
            }}
          >
            <Box sx={{ padding: "10px" }}>
              <Typography
                fontSize={"2rem"}
                fontWeight={"400"}
                sx={{ "@media print": { fontSize: "1.5rem" } }}
              >
                2. Vendor Management:
              </Typography>
            </Box>
            <Box
              sx={{
                width: "90%",
                backgroundColor: "#F1EFEF",
                padding: "10px 15px",
              }}
            >
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                a. We will be providing the best negotiated market price and
                vendor suggestions based on our extensive market research to
                ensure the cost is minimized to its lowest.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                b. This will be completely transparent; all orders will be
                issued post-approval from the client. If there is any
                recommendation from the client, the order will be issued to the
                suggested vendor.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                c. Vendor follow-up to ensure delivery at the site as per
                schedule.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                d. Evaluation of all technical documents received from vendors
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                e. PDI (Pre-Dispatch Inspection) for customized
                fabricated/manufactured material and report generation to
                maintain quality standards.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              paddingLeft: "30px",
              gap: 2,
              '@media print':{
                paddingTop:'0px'
              }
            }}
          >
            <Box sx={{ padding: "10px" }}>
              <Typography
                fontSize={"2rem"}
                fontWeight={"400"}
                sx={{ "@media print": { fontSize: "1.5rem" } }}
              >
                3. Site Management:
              </Typography>
            </Box>
            <Box
              sx={{
                width: "90%",
                backgroundColor: "#F1EFEF",
                padding: "10px 15px",
              }}
            >
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                a. SLnko's services are limited to inside boundary wall of
                project site only, any additional shall be disscussed.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                b. We will be deputing site supervisor on site to ensure
                installation as per design and project schedule mutually agreed.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                c. Scheduled visit of Engineering Team/Senior Authority.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                d. Daily work report/progress and project update to the client
                through using SAAS ProTrac.
              </Typography>
              <Typography
                fontSize={"1.4rem"}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                e. Escalation of any issues arise at site.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                width: "93%",
                padding: "60px 0px",
                '@media print':{
                    padding:'30px 0',
                    height:'250px'
                }
              }}
            >
              <img
                width={"100%"}
                height={"100%"}
                style={{ objectFit: "cover" }}
                alt="img1"
                src={img1}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page8;