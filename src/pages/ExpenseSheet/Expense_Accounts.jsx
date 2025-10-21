import React, { useRef, useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountsExpense from "../../component/Expense Sheet/Accounts_Expense_Approval";
import {
  useExportExpenseToCSVMutation,
  useExportExpenseToPDFMutation,
} from "../../redux/expenseSlice";
import { toast } from "react-toastify";
import {
  CircularProgress,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import Filter from "../../component/Partials/Filter";

function Accounts_Expense() {
  const navigate = useNavigate();
  const [triggerExport] = useExportExpenseToCSVMutation();
  const [sheetIds, setSheetIds] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [department, setDepartment] = useState(
    searchParams.get("department" || "")
  );
  const [status, setStatus] = useState(searchParams.get("status" || ""));
  const [dateFrom, setDateFrom] = useState(searchParams.get("from" || ""));
  const [dateTo, setDateTo] = useState(searchParams.get("to" || ""));

  const departments = [
    "Accounts",
    "HR",
    "Engineering",
    "Projects",
    "Infra",
    "CAM",
    "Internal",
    "SCM",
    "IT Team",
    "BD",
  ];

  const statuses = [
    { value: "submitted", label: "Pending" },
    { value: "manager approval", label: "Manager Approved" },
    { value: "hr approval", label: "HR Approved" },
    { value: "final approval", label: "Approved" },
    { value: "hold", label: "On Hold" },
    { value: "rejected", label: "Rejected" },
  ];
  const fields = [
    {
      key: "department",
      label: "Filter By Department",
      type: "select",
      options: departments.map((d) => ({ label: d, value: d })),
    },
    {
      key: "status",
      label: "Filter By Status",
      type: "select",
      options: statuses.map((d) => ({ label: d.label, value: d.value })),
    },
    {
      key: "dates",
      label: "Filter By Date",
      type: "daterange",
    },
  ];

  useEffect(() => {

    const sp = new URLSearchParams(searchParams);

    if(department) sp.set("department", department);
    else sp.delete("department");

    if(status) sp.set("status", status);
    else sp.delete("status");

    if(dateFrom) sp.set("from", dateFrom);
    else sp.delete("from");

    if(dateTo) sp.set("to", dateTo);
    else sp.delete("to");

    setSearchParams(sp);
  })

  const handleExportCSV = async (sheetIds, view = "detailed") => {
    try {
      const dashboard = view === "list";
      const blob = await triggerExport({ sheetIds, dashboard }).unwrap();

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${
        dashboard ? "list" : "detailed"
      }_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Error exporting CSV");
    }
  };

  const [triggerExportPdf, { isLoading }] = useExportExpenseToPDFMutation();

  const handleExportPDFById = async (expenseIds, withAttachment = true) => {
    try {
      setDownloadStatus("Preparing download...");

      const blob = await triggerExportPdf({
        expenseIds,
        withAttachment,
      }).unwrap();

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloadStatus("");
      }, 1000);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setDownloadStatus("Download failed.");
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="Expense Sheet" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/expense_dashboard`)}
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
              DashBoard
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/expense_approval`)}
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
              Expense Approval
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/expense_hr`)}
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
              HR Expense Approval
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/expense_accounts`)}
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
              Account Expense Approval
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Accounts Expense Approval Dashboard"
          isBackEnabled={false}
          sticky
        >
          {sheetIds.length > 0 && (
            <Box gap={2} display={"flex"} justifyContent={"center"}>
              <Dropdown>
                <MenuButton
                  slots={{ root: Button }}
                  slotProps={{
                    root: {
                      color: "primary",
                      startDecorator: <DownloadRoundedIcon />,
                      size: "sm",
                    },
                  }}
                >
                  Export to CSV
                </MenuButton>
                <Menu>
                  <MenuItem onClick={() => handleExportCSV(sheetIds, "list")}>
                    List view
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleExportCSV(sheetIds, "detailed")}
                  >
                    Detailed view
                  </MenuItem>
                </Menu>
              </Dropdown>
              <Button
                variant="outlined"
                size="sm"
                color="danger"
                onClick={() => handleExportPDFById(sheetIds, false)}
              >
                PDF
              </Button>

              {downloadStatus && (
                <Box mt={2} display="flex" alignItems="center" gap={1}>
                  {(downloadStatus.startsWith("Preparing") ||
                    downloadStatus.startsWith("Downloading")) && (
                    <CircularProgress size="sm" />
                  )}
                  <Typography level="body-sm">{downloadStatus}</Typography>
                </Box>
              )}
            </Box>
          )}

          <Filter
            open={open}
            onOpenChange={setOpen}
            fields={fields}
            onApply={(values) => {
              setStatus(values?.status);
              setDepartment(values?.department);
              setDateFrom(values?.dates?.from);
              setDateTo(values?.dates?.to);

              setOpen(false);
            }}
            onReset={() => {
              setStatus("");
              setDepartment("");
              setDateFrom("");
              setDateTo("");

              setOpen(false);
            }}
          />
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
          <AccountsExpense setSheetIds={setSheetIds} sheetIds={sheetIds} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Accounts_Expense;
