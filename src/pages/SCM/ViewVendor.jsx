import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../../component/Partials/Sidebar";
import AllVendors from "../../component/AllVendors";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, Modal, ModalDialog } from "@mui/joy";
import { Add } from "@mui/icons-material";
import AddVendor from "../../component/Forms/Add_Vendor";
import { useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Vendor_Detail from "../../component/ViewVendor";

function ViewVendors() {
  const navigate = useNavigate();
  const [openAddVendorModal, setOpenAddVendorModal] = useState(false);
  console.log({ openAddVendorModal });
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/purchase-order`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
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
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Logistics
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/vendors`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Vendors
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
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Vendor Bills
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Vendor Detail"
          isBackEnabled={true}
          sticky
        ></SubHeader>
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
          <Vendor_Detail />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ViewVendors;
