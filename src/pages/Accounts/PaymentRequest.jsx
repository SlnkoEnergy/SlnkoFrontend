import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React, { useRef } from "react";
import { useEffect, useState } from "react";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import { useNavigate } from "react-router-dom";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import PaymentRequest from "../../component/PaymentRequest";
import { use } from "react";

function ProjectBalance() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const paymentRequestRef = useRef();

  const handleExportToCSV = () => {
    if (paymentRequestRef.current) {
      paymentRequestRef.current.exportToCSV();
    }
  };
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Header />
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginLeft: { xl: "15%", lg: "18%" },
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
                underline="none"
                color="neutral"
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Accounting
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Daily Payment Request
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
              marginLeft: { xl: "15%", lg: "18%" },
            }}
          >
            <Typography level="h2" component="h1">
              Payment Records
            </Typography>
            <Box
              sx={{
                display: "flex",
                mb: 1,
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "start", sm: "center" },
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {" "}
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin" ||
                user?.name === "Ajay Singh" ||
                user?.name === "Aryan Maheshwari" ||
                user?.name === "Sarthak Sharma" ||
                user?.name === "Naresh Kumar" ||
                user?.name === "Shubham Gupta" ||
                user?.name === "Saurabh Suman" ||
                user?.name === "Sandeep Yadav" ||
                user?.name === "Som Narayan Jha" ||
                user?.name === "Saresh") && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => navigate("/standby_records")}
                >
                  Pending Payment
                </Button>
              )}
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin" ||
                user?.name === "Shubham Gupta") && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => navigate("/pay_Request")}
                >
                  Add New Payment +
                </Button>
              )}
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin") && (
                <Button
                  color="primary"
                  startDecorator={<DownloadRoundedIcon />}
                  size="sm"
                  onClick={handleExportToCSV}
                >
                  Export to CSV
                </Button>
              )}
            </Box>
          </Box>
          <PaymentRequest ref={paymentRequestRef} />
          {/* <OrderTable />
          <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ProjectBalance;
