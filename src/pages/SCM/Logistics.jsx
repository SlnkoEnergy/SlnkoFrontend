import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";
import Dash_eng from "../../component/EngDashboard";
import LogisticsTable from "../../component/LogisticsSummary";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";

function Logistics() {
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
    //           marginLeft: { xl: "15%", lg: "18%" },
    //         }}
    //       >
    //         <Breadcrumbs
    //           size="sm"
    //           aria-label="breadcrumbs"
    //           separator={<ChevronRightRoundedIcon fontSize="sm" />}
    //           sx={{ pl: 0, marginTop: { md: "4%", lg: "0%" } }}
    //         >
    //           {user?.department !== "Accounts" && (
    //             <Link
    //               underline="none"
    //               color="neutral"
    //               sx={{ fontSize: 12, fontWeight: 500 }}
    //             >
    //               Logistics
    //             </Link>
    //           )}
    //           <Typography
    //             color="primary"
    //             sx={{ fontWeight: 500, fontSize: 12 }}
    //           >
    //             {user?.department === "Accounts"
    //               ? "Handover Dashboard"
    //               : "Logistics"}
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
    //           {user?.department === "Accounts"
    //             ? "Logistics"
    //             : "Logistics"}
    //         </Typography>
    //         {user?.department !== "Accounts" && (
    //           <Box
    //             sx={{
    //               display: "flex",
    //               flexDirection: { xs: "column", sm: "row" },
    //               alignItems: "center",
    //               justifyContent: "center",
    //               flexWrap: "wrap",
    //               bgcolor: "background.level1",
    //               borderRadius: "lg",
    //               boxShadow: "sm",
    //             }}
    //           >

    //           </Box>
    //         )}
    //       </Box>
    //       <LogisticsTable />
    //     </Box>
    //   </Box>
    // </CssVarsProvider>

    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate('/purchase-order')}
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
          title="Logistic"
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
            pr: "20px",
            ml: "24px",
            overflow: "hidden"
          }}
        >
          <LogisticsTable />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Logistics;