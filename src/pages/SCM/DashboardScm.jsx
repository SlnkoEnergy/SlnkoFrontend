import { Box, Button, CssBaseline, CssVarsProvider } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import Dash_scm from "../../component/ScmDashboard";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import PurchaseOrderSummary from "../../component/PurchaseOrderSummary";

function DashboardSCM() {
    const navigate = useNavigate();

    const [selectedPOIds, setSelectedPOIds] = useState([]);
    const selectedCount = selectedPOIds.length;

    const poSummaryRef = useRef();

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


    return (

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
                    title="Purchase Order"
                    isBackEnabled={false}
                    sticky
                    rightSlot={
                        <>
                            {selectedCount > 0 && (
                                <>
                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        size="sm"
                                        onClick={() =>
                                            poSummaryRef.current?.openBulkDeliverModal?.()
                                        }
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
                        </>
                    }
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
                        p: "16px",
                        px: "24px",
                    }}
                >
                    <PurchaseOrderSummary
                        ref={poSummaryRef}
                        onSelectionChange={setSelectedPOIds}
                        hideInlineBulkBar
                    />
                </Box>

            </Box>
        </CssVarsProvider>
    );
}

export default DashboardSCM;