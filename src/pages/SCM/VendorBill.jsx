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
      const res = await exportBills({}).unwrap();

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
  };

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
            p: "16px",
            px: "24px",
          }}
        >
          <VendorBill />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Bill_History;
