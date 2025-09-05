import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useRef, useEffect, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import { useNavigate } from "react-router-dom";
import PurchaseOrder from "../../component/PurchaseOrderSummary";
import { toast } from "react-toastify";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Add } from "@mui/icons-material";

function POSummary() {
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

  const poSummaryRef = useRef();

  const handleExportToCSV = () => {
    if (poSummaryRef.current) {
      poSummaryRef.current.exportToCSV();
    }
  };

  // NEW: open logistics with selected PO(s)
  const handleOpenLogisticsWithSeed = () => {
    const seed = poSummaryRef.current?.getSelectedPOSeed?.();
    const list = seed?.pos || [];

    if (!list.length) {
      toast.info("Please select at least one PO from the table.");
      return;
    }

    navigate("/logistics-form?mode=add", {
      state: { logisticSeed: seed },
    });
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
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
              Vendor Bill
            </Button>
          </Box>
        </MainHeader>
        <SubHeader title="Purchase Order" isBackEnabled={false} sticky>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="outlined"
              size="sm"
              // onClick={() => handleExport(selectedIds)}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              size="sm"
              sx={{
                color: "#3366a3",
                borderColor: "#132e4eff",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
            >
              Add Vendor
            </Button>

            <Button
              variant="solid"
              size="sm"
              startDecorator={<Add />}
              onClick={() => navigate("/add_task")}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              Logistic Form
            </Button>
          </Box>
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
            p: "16px",
            px: "24px",
          }}
        >
          <PurchaseOrder ref={poSummaryRef} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default POSummary;
