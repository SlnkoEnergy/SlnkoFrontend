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
import { useExportPosMutation } from "../../redux/purchasesSlice";
import { Dropdown, Menu, MenuButton, MenuItem, CircularProgress } from "@mui/joy";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

function POSummary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [selectedPOIds, setSelectedPOIds] = useState([]);
  const selectedCount = selectedPOIds.length;

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

  const [exportPos, { isLoading: isExporting }] = useExportPosMutation();
  const [exportingScope, setExportingScope] = useState(null); // "selected" | "all" | null

  const handleExportToCSV = async ({ scope }) => {
    setExportingScope(scope);
    try {
      if (scope === "selected") {
        const ids = (selectedPOIds || []).filter(Boolean);
        if (!ids.length) {
          toast.info("Please select at least one PO from the table.");
          return;
        }
        const blob = await exportPos({ purchaseorders: ids }).unwrap();
        const fileName = `po_${new Date().toISOString().slice(0, 10)}.csv`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${ids.length} PO${ids.length > 1 ? "s" : ""}`);
        return;
      }

      // scope === "all"
      const filters = poSummaryRef.current?.getCurrentFilters?.() || {};
      const blob = await exportPos({ filters }).unwrap();
      const fileName = `po_filtered_${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Exported all matching POs");
    } catch (error) {
      console.error("Export POs failed:", error);
      const msg =
        error?.data?.message ||
        error?.error ||
        "Failed to export POs. Please try again.";
      toast.error(msg);
    } finally {
      setExportingScope(null);
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
              {selectedCount > 0 && (
                <>
                  <Button
                    color="primary"
                    variant="outlined"
                    size="sm"
                    onClick={() => poSummaryRef.current?.openBulkDeliverModal?.()}
                  >
                    Change Status to Delivered
                  </Button>

                  <Button
                    color="primary"
                    variant="outlined"
                    size="sm"
                    onClick={handleOpenLogisticsWithSeed}
                  >
                    Logistics Form
                  </Button>

                  <Dropdown>
                    <MenuButton
                      variant="outlined"
                      color="primary"
                      size="sm"
                      disabled={isExporting}
                      endDecorator={
                        isExporting ? (
                          <CircularProgress size="sm" />
                        ) : (
                          <KeyboardArrowDownRoundedIcon />
                        )
                      }
                    >
                      {isExporting ? "Exporting…" : "Export CSV"}
                    </MenuButton>
                    <Menu placement="bottom-start">
                      <MenuItem
                        disabled={selectedCount === 0 || isExporting}
                        onClick={() => handleExportToCSV({ scope: "selected" })}
                      >
                        {isExporting && exportingScope === "selected" ? (
                          <>
                            <CircularProgress size="sm" sx={{ mr: 1 }} />
                            Exporting Selected…
                          </>
                        ) : (
                          "Selected"
                        )}
                      </MenuItem>
                      <MenuItem
                        disabled={isExporting}
                        onClick={() => handleExportToCSV({ scope: "all" })}
                      >
                        {isExporting && exportingScope === "all" ? (
                          <>
                            <CircularProgress size="sm" sx={{ mr: 1 }} />
                            Exporting All…
                          </>
                        ) : (
                          "All"
                        )}
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </>
              )}

              <Button
                color="primary"
                variant="solid"
                size="sm"
                onClick={() => navigate("/add_vendor")}
              >
                Add Vendor
              </Button>
            </Box>
          </Box>

          <PurchaseOrder
            ref={poSummaryRef}
            onSelectionChange={setSelectedPOIds}
            hideInlineBulkBar
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default POSummary;
