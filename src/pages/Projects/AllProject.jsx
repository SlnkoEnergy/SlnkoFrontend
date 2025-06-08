import React, { useRef, useState, useEffect } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import Sidebar from '../../component/Partials/Sidebar';
// import OrderTable from '../../component/OrderTable';
// import OrderList from '../../component/OrderList';
import Header from '../../component/Partials/Header';
import AllProject from '../../component/AllProject';

function ProjectBalance() {
      const allProjectRef = useRef();
    
  
      const handleExportToCSV = () => {
        if (allProjectRef.current) {
          allProjectRef.current.exportToCSV();
        }
      };
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
                underline="hover"
                color="neutral"
                href=""
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Project
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                All Projects
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
              All Project
            </Typography>
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.department === "admin" ||
              user?.name === "Naresh Kumar") && (
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
              {/* <Button
              color="primary"
              
              size="sm"
            >
              Add New Project +
            </Button> */}
              <Button
                color="primary"
                startDecorator={<DownloadRoundedIcon />}
                size="sm"
                onClick={handleExportToCSV} 
              >
                Export to CSV
              </Button>
            </Box>
              )}
          </Box>
          <AllProject ref={allProjectRef} />
          {/* <OrderTable /> */}
          {/* <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ProjectBalance;