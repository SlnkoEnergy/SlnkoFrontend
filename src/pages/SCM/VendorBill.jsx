import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Sidebar from "../../component/Partials/Sidebar";
import VendorBill from "../../component/Vendor_Bill";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import Filter from "../../component/Partials/Filter";
import { useEffect, useRef, useState } from "react";
import { useDeleteBillMutation } from "../../redux/billsSlice";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { IconButton, Tooltip } from "@mui/joy";

function Bill_History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const vendorRef = useRef();
  const [selectedCount, setSelectedCount] = useState(0);
  const canExport = selectedCount > 0;
  const [selected, setSelected] = useState([]);

  const exportData = (isExportAll) => {
    if (vendorRef.current) {
      vendorRef.current.handleExport(isExportAll);
    }
  };

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
      key: "status",
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

    if (selectStatus || dateFilterEnd || dateFilterFrom) sp.set("page", 1);

    setSearchParams(sp);
  }, [selectStatus, dateFilterEnd, dateFilterFrom]);

  const [deleteBill] = useDeleteBillMutation();
  const handleDelete = async () => {
    try {
      const res = await deleteBill({ ids: selected }).unwrap();
      toast.success("Bills Deleted Successfully");
    } catch (error) {
      toast.error("Error in deleting in Bill");
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
            {canExport && (
              <Button
                variant="outlined"
                size="sm"
                color="primary"
                onClick={() => exportData(false)}
                startDecorator={<CalendarMonthIcon />}
              >
                Export
              </Button>
            )}
            {
              canExport && (
                <Button
                  variant="outlined"
                  size="sm"
                  color="primary"
                  onClick={() => exportData(true)}
                  startDecorator={<CalendarMonthIcon />}
                >
                  Export All
                </Button>
              )
            }

            {selected.length > 0 &&
              (user?.name === "Guddu Rani Dubey" ||
                user?.department === "admin" ||
                user?.department === "superadmin" ||
                user?.name === "Varun Mishra") && (
                <IconButton
                  color="danger"
                  size="sm"
                  variant="outlined"
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                </IconButton>
              )}

              <Button
  variant="outlined"
  size="sm"
  color="primary"
  onClick={() => vendorRef.current?.openColumnModal()}
  startDecorator={<ViewColumnIcon />}
>
  Columns
</Button>


            <Filter
              open={open}
              onOpenChange={setOpen}
              title="Filters"
              fields={fields}
              onApply={(values) => {
                setSelectStatus(values?.status || "");
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
          <VendorBill
            ref={vendorRef}
            onSelectionChange={(len) => setSelectedCount(len)}
            setSelected={setSelected}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Bill_History;
