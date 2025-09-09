import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Button from "@mui/joy/Button";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import { useRef, useEffect, useState } from "react";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Sidebar from "../../component/Partials/Sidebar";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Partials/Header";
import PurchaseOrder from "../../component/PurchaseOrderSummary";
import { toast } from "react-toastify";

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
    // expects PurchaseOrderSummary to expose getSelectedPOSeed() via useImperativeHandle
    const seed = poSummaryRef.current?.getSelectedPOSeed?.();
    const list = seed?.pos || [];

    if (!list.length) {
      toast.info("Please select at least one PO from the table.");
      return;
    }

    // Navigate with seed so AddLogisticForm can auto-fill the Products table
    navigate("/logistics-form?mode=add", {
      state: { logisticSeed: seed }, // shape: { pos: [{ _id, po_number }, ...] }
    });
  };

  const allowedUsers = [
    "IT Team",
    "Guddu Rani Dubey",
    "Varun Mishra",
    "Prachi Singh",
    "Ajay Singh",
    "Aryan Maheshwari",
    "Sarthak Sharma",
    "Naresh Kumar",
    "Shubham Gupta",
    "Gagan Tayal",
  ];


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
                SCM
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
                Purchase Order Summary
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
              Purchase Order Summary
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
                
                <Button color="primary" size="sm" onClick={handleOpenLogisticsWithSeed}>
                  Logistics Form
                </Button>
                  <Button color="primary" variant="outlined" size="sm" onClick={() => navigate("/add_vendor")}>
                    Add Vendor
                  </Button>
              </Box>
          </Box>

          <PurchaseOrder ref={poSummaryRef} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default POSummary;