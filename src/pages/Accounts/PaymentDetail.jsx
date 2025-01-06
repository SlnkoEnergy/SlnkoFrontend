import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import React, {useRef} from "react";
import Button from "@mui/joy/Button";
// import Button from '@mui/joy/Button';
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
// import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Sidebar from "../../component/Partials/Sidebar";
import PaymentApproved from "../../component/PaymentApproved";

import Header from "../../component/Partials/Header";
import PaymentDetail from "../../component/PaymentDetail";

const Payment_Detail = () => {
      const PaymentDetailRef = useRef();
    
  
      const handleExportToCSV = () => {
        if (PaymentDetailRef.current) {
          PaymentDetailRef.current.exportToCSV();
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
              marginLeft: { xl: "15%", lg: "18%", md: "25%" },
            }}
          >
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0 }}
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
                Payment Approved
              </Typography>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Payment Detail
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
              marginLeft: { xl: "15%", md: "25%", lg: "18%" },
            }}
          >
            <Typography level="h2" component="h1">
              Payment Detail
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
                marginLeft: { xl: "15%", md: "25%", lg: "18%" },
                maxWidth: { lg: "85%", sm: "100%", md: "75%" },

              }}
            >
              {/* <Button
              color="primary"
              
              size="sm"
            >
              Add New Project +
            </Button> */}
            {/* <Button
              color="primary"
              startDecorator={<DownloadRoundedIcon />}
              size="sm"
              onClick={handleExportToCSV} 
            >
              Payment Detail
            </Button> */}
            </Box>
          </Box>
          <PaymentDetail ref={PaymentDetailRef} />
          {/* <OrderTable />
          <OrderList /> */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Payment_Detail;
