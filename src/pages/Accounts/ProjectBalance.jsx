import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React, { useRef } from "react";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { Snackbar } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import ProjectBalances from "../../component/ProjectBalance";

function ProjectBalance() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setOpen(true);
  };

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

  // Create a ref for ProjectBalances component
  const projectBalancesRef = useRef();

  // Function to handle CSV export
  const handleExportToCSV = () => {
    if (projectBalancesRef.current) {
      projectBalancesRef.current.exportToCSV();
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
              <Link
                underline="hover"
                color="neutral"
                href=""
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Accounting
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Project Balances
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
              Project Balances
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
              {/* {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.name === "admin") && (
                <Button
                  color="primary"
                  onClick={() => navigate("/add_project")}
                  size="sm"
                >
                  Add New Project +
                </Button>
              )} */}
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin") && (
                <Button
                  color="primary"
                  onClick={() => navigate("/adjust_request")}
                  size="sm"
                >
                  Adjustment Form
                </Button>
              )}
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin") && (
                <Button color="primary" onClick={handleClick} size="sm">
                  Add New Project +
                </Button>
              )}

              <Snackbar
                open={open}
                onClose={() => setOpen(false)}
                variant="soft"
                color="danger"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={4000}
              >
                Projects can now only be added from the Handover Sheet.
              </Snackbar>
              {(user?.name === "IT Team" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ||
                user?.department === "admin" ||
                user?.name === "Naresh Kumar" ||
               
                user?.department === "Accounts") && (
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
          <ProjectBalances ref={projectBalancesRef} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default ProjectBalance;
