import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import AddProject from "../../component/Forms/Add_Project";
import { useNavigate } from "react-router-dom";

function Add_Project() {
  const navigate = useNavigate();
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100%" }}>
        <Header />
        <Sidebar />
        <Box
          component="main"
          className="MainContent"
          sx={{
            // px: { xs: 2, md: 6 },
            // pt: {
            //   xs: 'calc(12px + var(--Header-height))',
            //   sm: 'calc(12px + var(--Header-height))',
            //   md: 3,
            // },
            // pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100dvh",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginLeft: {
                xs: "3vw",
                sm: "3vw",
                md: "3vw",
                lg: "22vw",
                xl: "16vw",
              },
              marginTop: {
                xs: "10vh",
                sm: "8vh",
                md: "4vh",
                lg: "2vh",
                xl: "0vh",
              },
            }}
          >
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0, marginTop: { md: "4%", lg: "0%" } }}
            >
              {/* <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeRoundedIcon />
              </Link> */}
              <Link
                underline="hover"
                color="neutral"
                href=""
                sx={{ fontSize: 12, fontWeight: 500 }}
                onClick={() => navigate("/all-project")}
              >
                All Projects
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Add Project
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box
            sx={{
              display: "flex",
              mb: 1,
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <AddProject />
          </Box>

          {/* <OrderTable /> */}
          {/* <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Add_Project;
