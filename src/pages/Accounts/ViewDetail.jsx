import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React from "react";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import { useNavigate } from "react-router-dom";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import View_Detail from "../../component/ViewDetails/View_Detail";

function ViewDetail() {
  const navigate = useNavigate();
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Header sx={{ "@media print": { display: "none" } }} />
        <Sidebar />
        <Box
          component="main"
          className="MainContent"
          sx={{
            px: { xs: 2, md: 6 },
            pt: {
              xs: "calc(12px + var(--Header-height))",
              sm: "calc(12px + var(--Header-height))",
              md: 3,
            },
            pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100dvh",
            gap: 1,
            "@media print": { px: 1, pt: 0, pb: 0, minWidth: "1000px" },
            
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginLeft: { xl: "15%", lg: "20%" },
              "@media print": { display: "none" }
            }}
          >
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0, marginTop: {md:"4%", lg:"0%"}, "@media print": { marginTop: "0px"} }}
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
                underline="none"
                color="neutral"
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Daily Payment Request
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Customer Payment Summary
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
              "@media print": { marginBottom: 0}
              
            }}
          >
            {/* <Typography level="h2" component="h1">
              Payment Records
            </Typography> */}
            <Box
              sx={{
                display: "flex",
                mb: 1,
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "start", sm: "center" },
                flexWrap: "wrap",
                justifyContent: "center",
                "@media print": { marginBottom: 0}
              }}
            >
              {/* <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/pay_Request")}
              >
                Add New Payment +
              </Button>
              <Button
                color="primary"
                startDecorator={<DownloadRoundedIcon />}
                size="sm"
              >
                Export to CSV
              </Button> */}
            </Box>
          </Box>
          <View_Detail />
          {/* <OrderTable />
          <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ViewDetail;
