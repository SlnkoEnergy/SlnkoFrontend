import { Box, Grid, Typography } from "@mui/joy";
import React from "react";
import logo from "../../../assets/Comm_offer/slnko.png";
import "../CSS/offer.css";
// import img1 from "../../assets/Comm_offer/ImgP08.jpeg";


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
            padding: "10px",
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
              padding: "5px",
              gap: 2,
              "@media print": {
                paddingLeft: "15px",
              },
            }}
          >
            <Box sx={{ padding: "10px" }}>
              <Typography
                fontSize={{
                  xs: "1.2rem",
                  sm: "1.4rem",
                  md: "1.6rem",
                  lg: "1.8rem",
                  xl: "2rem",
                }}
                fontWeight={"600"}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.5rem" } }}
              >
                2. Vendor Management:
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign:"justify",
                // width: {
                //   xs: "95%",
                //   sm: "80%",
                //   md: "85%",
                //   lg: "90%",
                //   xl: "90%",
                // },
                width:"100%",
                // backgroundColor: "#F1EFEF",
                padding: "10px 15px",
                "@media print": {
                  width: "100%",
                },
              }}
            >
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                a) We will be providing best negotiated market price and vendors
                suggestion basis our extensive market research to ensure the
                cost is minimized to its lowest.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                b) This will be completely transparent; all orders will be
                issued post approval from client. If any recommendation from
                client, order will be issued to suggested vendor.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={"bold"}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                c) All the payments shall be made, from developer to SLNKO which
                shall be transparently paid to respective vendors.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                d) Vendors’ follow-up to ensure delivery at site as per
                schedule.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                e) Evaluation of all technical documents received from vendors
              </Typography>

              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                f) <strong>PDI(Pre-Dispatch Inspection)</strong> for customized Fabricated/Manufactured material and report
                generation for the same to maintain the quality standards.
              </Typography>
            </Box>

            <Box sx={{ padding: "10px" , "@media print":{
              marginTop:"30px"
            }
               }}>
              <Typography
                fontSize={{
                  xs: "1.2rem",
                  sm: "1.4rem",
                  md: "1.6rem",
                  lg: "1.8rem",
                  xl: "2rem",
                }}
                fontFamily={"serif"}
                fontWeight={"600"}
                sx={{ "@media print": { fontSize: "1.5rem" } }}
              >
                3. Site Management:
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign:"justify",
                // width: {
                //   xs: "95%",
                //   sm: "80%",
                //   md: "85%",
                //   lg: "90%",
                //   xl: "90%",
                // },
                width:"100%",
                
                // backgroundColor: "#F1EFEF",
                padding: "10px 15px",
                "@media print": {
                  width: "100%",
                },
              }}
            >
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                a) Slnko’s services are limited to inside boundary wall of
                project site only, any additional shall be discussed.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                b) We will be deputing site supervisor on site to ensure
                installation as per design and project schedule mutually agreed.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                c) Scheduled visit of Engineering Team/Senior Authority.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                d) Daily work report/progress and project update to the client
                through using SAAS ProTrac.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                e) Escalation of any issues arise at site.
              </Typography>
            </Box>

            <Box sx={{ padding: "10px", "@media print":{
              marginTop:"30px"
            } }}>
              <Typography
                fontSize={{
                  xs: "1.2rem",
                  sm: "1.4rem",
                  md: "1.6rem",
                  lg: "1.8rem",
                  xl: "2rem",
                }}
                fontWeight={"600"}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.5rem" } }}
              >
                4. Liasoning:
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign:"justify",
                // width: {
                //   xs: "95%",
                //   sm: "80%",
                //   md: "85%",
                //   lg: "90%",
                //   xl: "90%",
                // },
                width:"100%",
               
                // backgroundColor: "#F1EFEF",
                padding: "10px 15px",
                "@media print": {
                  width: "100%",
                },
              }}
            >
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                a) All DISCOM liasoning shall be in the scope of SLNKO.
              </Typography>
              <Typography
                fontSize={{
                  xs: "1.1rem",
                  sm: "1.2rem",
                  md: "1.3rem",
                  lg: "1.3rem",
                  xl: "1.4rem",
                }}
                fontWeight={500}
                fontFamily={"serif"}
                sx={{ "@media print": { fontSize: "1.2rem" } }}
              >
                b) All the Banks and CEIG liasoning shall be in scope of SLNKO.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page8;