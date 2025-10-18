import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import ADDBILL from "../../component/Forms/Add_Bill";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";

function Add_Bill() {

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
        <SubHeader title="Edit Vendor Bill" isBackEnabled={true} sticky></SubHeader>

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
          <ADDBILL />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Add_Bill;
