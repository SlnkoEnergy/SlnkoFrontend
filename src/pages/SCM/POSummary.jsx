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
import {
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  CircularProgress,
} from "@mui/joy";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import DownloadIcon from "@mui/icons-material/Download";
import { useGetAllCategoriesDropdownQuery } from "../../redux/productsSlice";

function DashboardSCM() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedPOIds, setSelectedPOIds] = useState([]);
  const selectedCount = selectedPOIds.length;
  const [open, setOpen] = useState(false);
  const poSummaryRef = useRef();
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
      const filters = {
        filter: selectStatus,
        status: selectBillStatus,
        itemSearch: selectItem,
        etdFrom: etdDateFrom,
        etdTo: etdDateTo,
        deliveryFrom: deliveryFrom,
        deliveryTo: deliveryTo,
      };
      const blob = await exportPos({ filters }).unwrap();
      const fileName = `po_filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
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

  const status = [
    { label: "All Status", value: "" },
    { label: "Fully Billed", value: "Fully Billed" },
    { label: "Bill Pending", value: "Bill Pending" },
  ];

  const fields = [
    {
      key: "status",
      label: "Filter By Delivery Status",
      type: "select",
      options: statusOptions.map((d) => ({ label: d, value: d })),
    },
    {
      key: "poStatus",
      label: "Filter By Bill Status",
      type: "select",
      options: status.map((d) => ({
        label: d.label,
        value: d.value,
      })),
    },
    {
      key: "itemSearch",
      label: "Filter By Category",
      type: "select",
      options: allMaterials.map((d) => ({ label: d.name, value: d.name })),
    },
    {
      key: "etd",
      label: "Filter By ETD Date",
      type: "daterange",
    },
    {
      key: "delivery",
      label: "Filter By Delivery Date",
      type: "daterange",
    },
  ];

  // IMPORTANT: read the SAME KEYS the child writes/reads
  const [selectStatus, setSelectStatus] = useState(
    searchParams.get("status" || "")
  );
  const [selectBillStatus, setSelectBillStatus] = useState(
    searchParams.get("poStatus") || ""
  );
  const [selectItem, setSelectItem] = useState(
    searchParams.get("itemSearch") || ""
  );
  const [etdDateFrom, setEtdDateFrom] = useState(
    searchParams.get("etd_from") || ""
  );
  const [etdDateTo, setEtdDateTo] = useState(searchParams.get("etd_to") || "");
  const [deliveryFrom, setDeliveryFrom] = useState(
    searchParams.get("delivery_from") || ""
  );
  const [deliveryTo, setDeliveryTo] = useState(
    searchParams.get("delivery_to") || ""
  );

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);

    if (selectStatus) sp.set("status", selectStatus);
    else sp.delete("status");

    if (selectBillStatus) sp.set("poStatus", selectBillStatus);
    else sp.delete("poStatus");

    if (selectItem) sp.set("itemSearch", selectItem);
    else sp.delete("itemSearch");

    if (etdDateTo) sp.set("etd_to", etdDateTo);
    else sp.delete("etd_to");

    if (etdDateFrom) sp.set("etd_from", etdDateFrom);
    else sp.delete("etd_from");

    if (deliveryFrom) sp.set("delivery_from", deliveryFrom);
    else sp.delete("delivery_from");

    if (deliveryTo) sp.set("delivery_to", deliveryTo);
    else sp.delete("delivery_to");

    if (
      selectBillStatus ||
      selectStatus ||
      selectItem ||
      etdDateFrom ||
      etdDateTo ||
      deliveryFrom ||
      deliveryTo
    )
      sp.set("page", 1);

    setSearchParams(sp);
  }, [
    selectStatus,
    selectBillStatus,
    selectItem,
    etdDateFrom,
    etdDateTo,
    deliveryFrom,
    deliveryTo,
  ]);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            {user?.name === "IT Team" ||
            user?.department === "admin" ||
            (user?.department === "Accounts" &&
              (user?.name === "Deepak Kumar Maurya" ||
                user?.name === "Gagan Tayal" ||
                user?.name === "Ajay Singh" ||
                user?.name === "Sachin Raghav" ||
                user?.name === "Anamika Poonia" ||
                user?.name === "Meena Verma" ||
                user?.name === "Kailash Chand" ||
                user?.name === "Chandan Singh")) ||
            (user?.department === "Accounts" &&
              user?.name === "Sujan Maharjan") ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Varun Mishra" ||
            user?.name === "Prachi Singh" ||
            user?.role === "purchase" ||
            (user?.role === "manager" && user?.name === "Naresh Kumar") ||
            (user?.role === "visitor" &&
              (user?.name === "Sanjiv Kumar" ||
                user?.name === "Sushant Ranjan Dubey")) ||
            (user?.department === "CAM" && user?.name === "Shantanu Sameer") ? (
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
            ) : null}

            {user?.name === "IT Team" ||
            user?.department === "admin" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Varun Mishra" ||
            user?.name === "Prachi Singh" ||
            user?.role === "purchase" ||
            (user?.role === "manager" && user?.name === "Naresh Kumar") ||
            user?.department === "Logistic" ? (
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
            ) : null}
            {(user?.department === "SCM" ||
              user?.department === "Accounts" ||
              user?.department === "superadmin" ||
              user?.department === "admin") && (
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
            )}
            {user?.name === "IT Team" ||
            user?.department === "admin" ||
            (user?.department === "Accounts" &&
              (user?.name === "Deepak Kumar Maurya" ||
                user?.name === "Gagan Tayal" ||
                user?.name === "Ajay Singh" ||
                user?.name === "Sachin Raghav" ||
                user?.name === "Anamika Poonia" ||
                user?.name === "Meena Verma" ||
                user?.name === "Kailash Chand" ||
                user?.name === "Chandan Singh")) ||
            (user?.department === "Accounts" &&
              user?.name === "Sujan Maharjan") ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Varun Mishra" ||
            user?.name === "Prachi Singh" ||
            user?.role === "purchase" ||
            (user?.role === "manager" && user?.name === "Naresh Kumar") ? (
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
            ) : null}
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

              <Filter
                open={open}
                onOpenChange={setOpen}
                title="Filters"
                fields={fields}
                onApply={(values) => {
                  setSelectStatus(values?.status);
                  setSelectBillStatus(values?.poStatus);
                  setSelectItem(values?.itemSearch);
                  setEtdDateFrom(values?.etd?.from);
                  setEtdDateTo(values?.etd?.to);
                  setDeliveryFrom(values?.delivery?.from);
                  setDeliveryTo(values?.delivery?.to);

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
            pr: "30px",
            ml: "24px",
            overflow: "hidden",
          }}
        >
          <PurchaseOrderSummary
            ref={poSummaryRef}
            onSelectionChange={setSelectedPOIds}
            hideInlineBulkBar
            // selectStatus={selectStatus}
            selectBillStatus={selectBillStatus}
            selectItem={selectItem}
            delivery_From={deliveryFrom}
            delivery_To={deliveryTo}
            etdDateFrom={etdDateFrom}
            etdDateTo={etdDateTo}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default DashboardSCM;
