import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import { useNavigate } from "react-router-dom";
import UpdateExpenseAccounts from "../../component/Expense Sheet/Expense Form/Acc_Hr_Update_Expense";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import {
  Button,
  Stack,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/joy";
import { useEffect, useState } from "react";

// ⬇️ bring in the export mutations here so parent owns export buttons
import {
  useExportExpenseToPDFMutation,
  useExportExpenseToCSVMutation,
} from "../../redux/expenseSlice";

function Update_Expense() {
  const navigate = useNavigate();

  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [showHoldAllDialog, setShowHoldAllDialog] = useState(false);
  const [approveHRConfirmOpen, setHRApproveConfirmOpen] = useState(false);

  const [showAccountsRejectAllDialog, setAccountsShowRejectAllDialog] =
    useState(false);
  const [showAccountsHoldAllDialog, setAccountsShowHoldAllDialog] =
    useState(false);
  const [approveAccountsConfirmOpen, setAccountsApproveConfirmOpen] =
    useState(false);

  const [user, setUser] = useState(null);

  // ⬇️ lifted state from child
  const [rows, setRows] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");

  const [triggerExportPdf] = useExportExpenseToPDFMutation();
  const [triggerExportCsv] = useExportExpenseToCSVMutation();

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

  const handleHrRejectAll = () => setRejectConfirmOpen(true);
  const handleHrHoldAll = () => setShowHoldAllDialog(true);
  const handleHrApproveAll = () => setHRApproveConfirmOpen(true);

  // ⬇️ receive rows from child
  const handleRowsUpdate = (incomingRows) => {
    setRows(incomingRows || []);
  };

  // ⬇️ parent-side export handlers used by the buttons here
  const handleExportPDFById = async (expenseIds, withAttachment = true) => {
    try {
      setDownloadStatus("Preparing download...");
      const blob = await triggerExportPdf({ expenseIds, withAttachment }).unwrap();

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

      setTimeout(() => setDownloadStatus(""), 1000);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setDownloadStatus("Download failed.");
    }
  };

  const handleExportCSV = async (sheetIds) => {
    try {
      const blob = await triggerExportCsv({ sheetIds }).unwrap();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="Expense Sheet" sticky>
          <Box display="flex" gap={1}>
            {(user?.name === "Chandan Singh" ||
              user?.name === "IT Team" ||
              user?.department === "admin" ||
              user?.department === "BD" ||
              user?.department === "HR" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              user?.role === "purchase" ||
              (user?.role === "manager" &&
                (user?.name === "Naresh Kumar" ||
                  user?.name === "Ranvijay Singh" ||
                  user?.name === "Shruti Tripathi")) ||
              user?.name === "Shantanu Sameer" ||
              user?.department === "Projects" ||
              user?.department === "Infra" ||
              user?.department === "Marketing" ||
              user?.department === "Internal" ||
              user?.department === "Loan" ||
              user?.department === "Logistic" ||
              (user?.department === "Tender" &&
                user?.name === "Satyadeep Mohanty")) ? (
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
            ) : null}

            {(user?.name === "IT Team" ||
              user?.department === "BD" ||
              (user?.department === "BD" &&
                (user?.emp_id === "SE-277" || user?.emp_id === "SE-046")) ||
              user?.department === "admin" ||
              (user?.department === "Accounts" &&
                user?.name === "Sujan Maharjan") ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              (user?.role === "manager" &&
                (user?.name === "Naresh Kumar" ||
                  user?.name === "Ranvijay Singh" ||
                  user?.name === "Shruti Tripathi")) ||
              (user?.role === "visitor" &&
                (user?.name === "Sanjiv Kumar" ||
                  user?.name === "Sushant Ranjan Dubey")) ||
              ((user?.department === "Projects" &&
                (user?.emp_id === "SE-203" ||
                  user?.emp_id === "SE-212" ||
                  user?.emp_id === "SE-205" ||
                  user?.emp_id === "SE-010")) ||
                user?.name === "Disha Sharma") ||
              user?.department === "Engineering") ? (
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
            ) : null}

            {(user?.name === "IT Team" ||
              user?.department === "admin" ||
              (user?.role === "manager" && user?.name === "Shruti Tripathi")) ? (
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
            ) : null}

            {((user?.department === "Accounts" &&
              (user?.name === "Deepak Kumar Maurya" ||
                user?.name === "Gagan Tayal" ||
                user?.name === "Ajay Singh" ||
                user?.name === "Sachin Raghav" ||
                user?.name === "Anamika Poonia" ||
                user?.name === "Meena Verma" ||
                user?.name === "Kailash Chand" ||
                user?.name === "Chandan Singh")) ||
              user?.name === "IT Team" ||
              (user?.department === "Accounts" &&
                user?.name === "Sujan Maharjan") ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              user?.department === "admin") ? (
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
            ) : null}
          </Box>
        </MainHeader>

        <SubHeader title="Update Expense" isBackEnabled={true} sticky>
          <Box display="flex" gap={2}>
            {user?.name === "Shruti Tripathi" ||
              user?.department === "admin" ||
              user?.name === "IT Team" ? (
              <>
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => setRejectConfirmOpen(true)}
                >
                  Reject All
                </Button>
                <Button color="warning" size="sm" onClick={handleHrHoldAll}>
                  Hold All
                </Button>
                <Button color="success" size="sm" onClick={handleHrApproveAll}>
                  Approve All
                </Button>
              </>
            ) : (
              user?.department === "Accounts" && (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => setAccountsShowRejectAllDialog(true)}
                  >
                    Reject All
                  </Button>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={() => setAccountsShowHoldAllDialog(true)}
                  >
                    Hold All
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setAccountsApproveConfirmOpen(true)}
                  >
                    Approve All
                  </Button>

                  {/* ⬇️ Export controls use rows from child */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => handleExportCSV([rows[0]?._id])}
                      size="sm"
                      variant="outlined"
                      disabled={!rows?.[0]?._id}
                    >
                      Export CSV
                    </Button>

                    <Dropdown>
                      <MenuButton variant="outlined" size="sm" color="danger">
                        PDF
                      </MenuButton>

                      {downloadStatus && (
                        <Box mt={2} display="flex" alignItems="center" gap={1}>
                          {(downloadStatus.startsWith("Preparing") ||
                            downloadStatus.startsWith("Downloading")) && (
                              <CircularProgress size="sm" />
                            )}
                          <Typography level="body-sm">
                            {downloadStatus}
                          </Typography>
                        </Box>
                      )}

                      <Menu>
                        <MenuItem
                          disabled={!rows?.[0]?._id}
                          onClick={() =>
                            handleExportPDFById([rows[0]?._id], true)
                          }
                        >
                          Download with Attachment
                        </MenuItem>
                        <MenuItem
                          disabled={!rows?.[0]?._id}
                          onClick={() =>
                            handleExportPDFById([rows[0]?._id], false)
                          }
                        >
                          Download without Attachment
                        </MenuItem>
                      </Menu>
                    </Dropdown>
                  </Stack>
                </>
              )
            )}
          </Box>
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
          <UpdateExpenseAccounts
            // ⬇️ child → parent data pipe
            onRowsUpdate={handleRowsUpdate}
            rejectConfirmOpen={rejectConfirmOpen}
            setRejectConfirmOpen={setRejectConfirmOpen}
            showHoldAllDialog={showHoldAllDialog}
            setShowHoldAllDialog={setShowHoldAllDialog}
            approveHRConfirmOpen={approveHRConfirmOpen}
            setHRApproveConfirmOpen={setHRApproveConfirmOpen}
            showAccountsRejectAllDialog={showAccountsRejectAllDialog}
            setAccountsShowRejectAllDialog={setAccountsShowRejectAllDialog}
            setAccountsApproveConfirmOpen={setAccountsApproveConfirmOpen}
            setAccountsShowHoldAllDialog={setAccountsShowHoldAllDialog}
            showAccountsHoldAllDialog={showAccountsHoldAllDialog}
            approveAccountsConfirmOpen={approveAccountsConfirmOpen}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Update_Expense;
