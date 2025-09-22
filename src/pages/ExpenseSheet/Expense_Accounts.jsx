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
import { useNavigate } from "react-router-dom";
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

function Accounts_Expense() {
  const navigate = useNavigate();
  const [triggerExport] = useExportExpenseToCSVMutation();
  const [sheetIds, setSheetIds] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const handleExportCSV = async (sheetIds, view = "detailed") => {
    try {
      const dashboard = view === "list";
      const blob = await triggerExport({ sheetIds, dashboard }).unwrap();

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${dashboard ? "list" : "detailed"}_${Date.now()}.csv`;
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
                Expense Sheet
              </Link>
              <Typography
                color="primary"
                sx={{ fontWeight: 500, fontSize: 12 }}
              >
                Accounts Expense Approval Dashboard
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
              Accounts Expense Approval Dashboard
            </Typography>
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
          </Box>

          <AccountsExpense setSheetIds={setSheetIds} sheetIds={sheetIds} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Accounts_Expense;
