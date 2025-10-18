import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import { useNavigate } from "react-router-dom";
import AddLogisticForm from "../../component/Forms/logisticsForm";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";
import SubHeader from "../../component/Partials/SubHeader";

const LogisticsForm = () => {
  const navigate = useNavigate();
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate("/purchase-order")}
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
        <SubHeader title="Logistic Form" isBackEnabled={true} sticky></SubHeader>



        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            p: "16px",
            px: "24px",
          }}
        >
          <AddLogisticForm />
        </Box>

      </Box>
    </CssVarsProvider>
  );
};
export default LogisticsForm;
