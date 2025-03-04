import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import React,{useEffect,useState} from "react";
import Button from "@mui/joy/Button";
// import Button from '@mui/joy/Button';
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
// import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Sidebar from "../../component/Partials/Sidebar";
import Commercial_Offer from "../../component/Commercial_Offer";

import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";

function Comm_Offer() {
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
              sx={{ pl: 0, marginTop: {md:"4%", lg:"0%"} }}
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
                Business Development
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Commercial Offer
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
            Commercial Offer
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
              {(user?.name === "IT Team" ||
              user?.name === "admin" ||
              user?.name === "Naresh Kumar") && (
              <Button
              color="primary"
              startDecorator={<DownloadRoundedIcon />}
              size="sm"
              onClick={() => navigate("/costing_input")}
            >
              Add Costing +
            </Button>
            )}

{(user?.name === "IT Team" ||
              user?.name === "admin" ||
              user?.name === "BD Team") && (
              <Button
              color="primary"
              
              size="sm"
              onClick={() => navigate("/add_offer")}
            >
              Add New offer +
            </Button>
             )}
            </Box>
          </Box>
          <Commercial_Offer />
          {/* <OrderTable />
          <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Comm_Offer;
