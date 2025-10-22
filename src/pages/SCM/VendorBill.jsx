import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import VendorBill from "../../component/Vendor_Bill";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import Filter from "../../component/Partials/Filter";
import { useEffect, useState } from "react";
import { useExportBillsMutation } from "../../redux/billsSlice";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

function Bill_History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);

  const status = [
    { label: "All Status", value: "" },
    { label: "Fully Billed", value: "fully billed" },
    { label: "Bill Pending", value: "bill pending" },
  ];

  const fields = [
    {
      key: "billStatus",
      label: "Filter By Bill Status",
      type: "select",
      options: status.map((d) => ({
        label: d.label,
        value: d.value,
      })),
    },
    {
      key: "dateFilter",
      label: "Date Filter",
      type: "daterange",
    },
  ];

  const [selectStatus, setSelectStatus] = useState(
    searchParams.get("status") || ""
  );

  const [dateFilterFrom, setDateFilterFrom] = useState(
    searchParams.get("from") || ""
  );

  const [dateFilterEnd, setDateFilterEnd] = useState(
    searchParams.get("to") || ""
  );

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);

    if (selectStatus) sp.set("status", selectStatus);
    else sp.delete("status");

    if (dateFilterFrom) sp.set("from", dateFilterFrom);
    else sp.delete("from");

    if (dateFilterEnd) sp.set("to", dateFilterEnd);
    else sp.delete("to");

    setSearchParams(sp);
  }, [selectStatus, dateFilterEnd, dateFilterFrom]);

  const [exportBills, { isLoading: isExporting }] = useExportBillsMutation();

  const handleExport = async (isExportAll) => {
    try {
      // const exportFrom =  formatDateToDDMMYYYY(from) ;
      // const exportTo = formatDateToDDMMYYYY(to) : null;
      // const exportAll = !from || !to;

      const res = await exportBills({
        // from: exportFrom,
        // to: exportTo,
        // exportAll: isExportAll,
      }).unwrap();

      const url = URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bills_export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export bills");
    }
  }; //   try {
  //     const exportFrom = from ? formatDateToDDMMYYYY(from) : null;
  //     const exportTo = to ? formatDateToDDMMYYYY(to) : null;
  //     // const exportAll = !from || !to;

  //     const res = await exportBills({
  //       from: exportFrom,
  //       to: exportTo,
  //       exportAll: isExportAll,
  //     }).unwrap();

  //     const url = URL.createObjectURL(res);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "bills_export.csv";
  //     link.click();
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error("Export failed", err);
  //     alert("Failed to export bills");
  //   }
  // };

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

        <SubHeader title="Vendor Bill" isBackEnabled={false} sticky>
          <>
            <Button
              variant="outlined"
              size="sm"
              color="primary"
              onClick={() => handleExport(false)}
              loading={isExporting}
              startDecorator={<CalendarMonthIcon />}
            >
              Export
            </Button>

            <Filter
              open={open}
              onOpenChange={setOpen}
              title="Filters"
              fields={fields}
              onApply={(values) => {
                setSelectStatus(values?.billStatus || "");
                setDateFilterFrom(values?.dateFilter?.from || "");
                setDateFilterEnd(values?.dateFilter?.to || "");

                setOpen(false);
              }}
              onReset={() => {
                setSelectStatus("");
                setDateFilterFrom("");
                setDateFilterEnd("");

                setOpen(false);
              }}
            />
          </>
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
            mr: "28px",
            pr: "30px",
            ml: "24px",
            overflow: "hidden",
          }}
        >
          <VendorBill />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Bill_History;
