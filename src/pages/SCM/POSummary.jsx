import { Box, Button, CssBaseline, CssVarsProvider } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import PurchaseOrderSummary from "../../component/PurchaseOrderSummary";
import Filter from "../../component/Partials/Filter";
import { useExportPosMutation } from "../../redux/purchasesSlice";
import DownloadIcon from "@mui/icons-material/Download";
import { useGetAllCategoriesDropdownQuery } from "../../redux/productsSlice";

function DashboardSCM() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedPOIds, setSelectedPOIds] = useState([]);
  const selectedCount = selectedPOIds.length;
  const [open, setOpen] = useState(false);
  const poSummaryRef = useRef();

  const [exportPos, { isLoading: isExporting }] = useExportPosMutation();

  const handleExportToCSV = async () => {
    try {
      const ids = (selectedPOIds || []).filter(Boolean);

      if (!ids.length) {
        toast.info("Please select at least one PO from the table.");
        return;
      }

      const blob = await exportPos({ purchaseorders: ids }).unwrap();
      const fileName = `po_${new Date().toISOString().slice(0, 10)}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${ids.length} PO${ids.length > 1 ? "s" : ""}`);
    } catch (error) {
      console.error("Export POs failed:", error);
      const msg =
        error?.data?.message ||
        error?.error ||
        "Failed to export POs. Please try again.";
      toast.error(msg);
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

  const { data: allMaterial } = useGetAllCategoriesDropdownQuery();
  const allMaterials = Array.isArray(allMaterial)
    ? allMaterial
    : allMaterial?.data ?? [];

  const statusOptions = [
    "Approval Pending",
    "Approval Done",
    "ETD Pending",
    "ETD Done",
    "Material Ready",
    "Ready to Dispatch",
    "Out for Delivery",
    "Partially Delivered",
    "Short Quantity",
    "Delivered",
  ];

  const fields = [
    {
      key: "Status",
      label: "Filter By Delivery Status",
      type: "select",
      options: statusOptions.map((d) => ({ label: d, value: d })),
    },
    {
      key: "poStatus",
      label: "Filter By Bill Status",
      type: "select",
      options: ["All Status", "Fully Billed", "Bill Pending"].map((d) => ({
        label: d,
        value: d,
      })),
    },
    {
      key: "itemSearch",
      label: "Filter By Category",
      type: "select",
      options: allMaterials.map((d) => ({ label: d.name, value: d.name })),
    },
    {
      key: "etd_date",
      label: "Filter By ETD Date",
      type: "daterange",
    },
    {
      key: "delivery_date",
      label: "Filter By Delivery Date",
      type: "daterange",
    },
  ];

  // IMPORTANT: read the SAME KEYS the child writes/reads
  const [selectStatus, setSelectStatus] = useState(
    searchParams.get("status") || ""
  );
  const [selectBillStatus, setSelectBillStatus] = useState(
    searchParams.get("poStatus") || ""
  );
  const [selectItem, setSelectItem] = useState(
    searchParams.get("itemSearch") || ""
  );
  const [etdDateFrom, setEtdDateFrom] = useState(
    searchParams.get("etdFrom") || ""
  );
  const [etdDateTo, setEtdDateTo] = useState(searchParams.get("etdTo") || "");
  const [deliveryFrom, setDeliveryFrom] = useState(
    searchParams.get("deliveryFrom") || ""
  );
  const [deliveryTo, setDeliveryTo] = useState(
    searchParams.get("deliveryTo") || ""
  );

  // Version flag to let child know Apply/Reset happened
  const [filtersVersion, setFiltersVersion] = useState(0);

  useEffect(() => {
    // dev log
    // console.log("PARENT selectItem ->", selectItem);
  }, [selectItem]);

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
                  <Button
                    color="primary"
                    variant="outlined"
                    size="sm"
                    onClick={handleExportToCSV}
                  >
                    Export to CSV
                  </Button>
                </>
              )}

              <Button
                variant="soft"
                size="sm"
                color="neutral"
                loading={isExporting}
                startDecorator={<DownloadIcon />}
              >
                Export All
              </Button>

              <Button
                color="primary"
                variant="solid"
                size="sm"
                onClick={() => navigate("/add_vendor")}
              >
                Add Vendor
              </Button>

              <Filter
                open={open}
                onOpenChange={setOpen}
                title="Filters"
                fields={fields}
                onApply={(values) => {
                  setSelectStatus(values?.Status || "");
                  setSelectBillStatus(values?.poStatus || "");
                  setSelectItem(values?.itemSearch || "");
                  setEtdDateFrom(values?.etd_date?.from || "");
                  setEtdDateTo(values?.etd_date?.to || "");
                  setDeliveryFrom(values?.delivery_date?.from || "");
                  setDeliveryTo(values?.delivery_date?.to || "");

                  setFiltersVersion((v) => v + 1); // ← signal child
                  setOpen(false);
                }}
                onReset={() => {
                  setSelectStatus("");
                  setSelectBillStatus("");
                  setSelectItem("");
                  setEtdDateFrom("");
                  setEtdDateTo("");
                  setDeliveryFrom("");
                  setDeliveryTo("");

                  setFiltersVersion((v) => v + 1); // ← signal child (clear)
                  setOpen(false);
                }}
              />
            </>
          }
        />

        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            mr: "28px",
            pr: "30px",
            ml: "24px",
            overflow: "hidden",
          }}
        >
          <PurchaseOrderSummary
            ref={poSummaryRef}
            onSelectionChange={setSelectedPOIds}
            hideInlineBulkBar
            selectStatus={selectStatus}
            selectBillStatus={selectBillStatus}
            selectItem={selectItem}
            delivery_From={deliveryFrom}
            delivery_To={deliveryTo}
            etdDateFrom={etdDateFrom}
            etdDateTo={etdDateTo}
            filtersVersion={filtersVersion} // ← NEW
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default DashboardSCM;
