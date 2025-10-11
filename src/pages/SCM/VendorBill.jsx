import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Sidebar from '../../component/Partials/Sidebar';
import Header from '../../component/Partials/Header';
import VendorBill from "../../component/Vendor_Bill";
import MainHeader from '../../component/Partials/MainHeader';
import { Button } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import SubHeader from '../../component/Partials/SubHeader';

function Bill_History() {

  const navigate = useNavigate();
  return (
    // <CssVarsProvider disableTransitionOnChange>
    //   <CssBaseline />
    //   <Box sx={{ display: "flex", minHeight: "100dvh" }}>
    //     <Header />
    //     <Sidebar />
    //     <Box
    //       component="main"
    //       className="MainContent"
    //       sx={{
    //         px: { xs: 2, md: 6 },
    //         pt: {
    //           xs: "calc(12px + var(--Header-height))",
    //           sm: "calc(12px + var(--Header-height))",
    //           md: 3,
    //         },
    //         pb: { xs: 2, sm: 2, md: 3 },
    //         flex: 1,
    //         display: "flex",
    //         flexDirection: "column",
    //         minWidth: 0,
    //         height: "100dvh",
    //         gap: 1,
    //       }}
    //     >
    //       <Box
    //         sx={{
    //           display: "flex",
    //           alignItems: "center",
    //           marginLeft: { xl: "15%", lg: "18%", },
    //         }}
    //       >
    //         <Breadcrumbs
    //           size="sm"
    //           aria-label="breadcrumbs"
    //           separator={<ChevronRightRoundedIcon fontSize="sm" />}
    //           sx={{ pl: 0 }}
    //         >
    //           <Link
    //             underline="hover"
    //             color="neutral"
    //             href=""
    //             sx={{ fontSize: 12, fontWeight: 500 }}
    //           >
    //             SCM
    //           </Link>
    //           <Typography
    //             color="primary"
    //             sx={{ fontWeight: 500, fontSize: 12 }}
    //           >
    //             Vendor Bill
    //           </Typography>
    //         </Breadcrumbs>
    //       </Box>
    //       <Box
    //         sx={{
    //           display: "flex",
    //           mb: 1,
    //           gap: 1,
    //           flexDirection: { xs: "column", sm: "row" },
    //           alignItems: { xs: "start", sm: "center" },
    //           flexWrap: "wrap",
    //           justifyContent: "space-between",
    //           marginLeft: { xl: "15%", lg: "18%" },
    //         }}
    //       >
    //         <Typography level="h2" component="h1">
    //           Vendor Bill
    //         </Typography>
    //         <Box
    //           sx={{
    //             display: "flex",
    //             mb: 1,
    //             gap: 1,
    //             flexDirection: { xs: "column", sm: "row" },
    //             alignItems: { xs: "start", sm: "center" },
    //             flexWrap: "wrap",
    //             justifyContent: "center",
    //           }}
    //         >
    //         </Box>
    //       </Box>
    //       <VendorBill />
    //     </Box>
    //   </Box>
    // </CssVarsProvider>

    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh" }}
      >
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate('/scm_dash')}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Purchase Order
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/logistics`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Logistics
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/vendor_bill`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Vendor Bill
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Vendor Bill"
          isBackEnabled={false}
          sticky

        >

        </SubHeader>

        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            mr:"28px",
            pr: "30px",
            ml: "24px",
            overflow: "hidden"
          }}
        >
          <VendorBill />
        </Box>
      </Box>

    </CssVarsProvider>
  );
}
export default Bill_History;