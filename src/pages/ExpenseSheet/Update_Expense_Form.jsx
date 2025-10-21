import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";

import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";

import { useNavigate, useSearchParams } from "react-router-dom";
import UpdateExpense from "../../component/Expense Sheet/Expense Form/Update_Expense";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";

function Edit_Expense() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

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
        <SubHeader title="Update Expense" isBackEnabled={true} sticky>
          <Box display="flex" gap={2}>
            {(([
              "Engineering",
              "BD",
              "Projects",
              "Infra",
              "Loan",
              "CAM",
              "Accounts",
              "HR",
              "Marketing",
            ].includes(user?.department) &&
              user?.role === "manager") ||
              user?.role === "visitor" ||
              user?.name === "IT Team" ||
              user?.department === "admin") && (
              <>
                <Button
                  color="danger"
                  size="sm"
                  onClick={handleRejectAll}
                  disabled={rows.every((row) => {
                    const status =
                      typeof row.current_status === "string"
                        ? row.current_status
                        : row.current_status?.status;

                    return [
                      "rejected",
                      "hold",
                      "hr approval",
                      "manager approval",
                      "final approval",
                    ].includes(status);
                  })}
                >
                  Reject All
                </Button>

                <Button
                  color="success"
                  size="sm"
                  onClick={handleApproveAll}
                  disabled={rows.every((row) => {
                    const status =
                      typeof row.current_status === "string"
                        ? row.current_status
                        : row.current_status?.status;

                    return [
                      "rejected",
                      "hold",
                      "hr approval",
                      "manager approval",
                      "final approval",
                    ].includes(status);
                  })}
                >
                  Approve All
                </Button>
              </>
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
          <UpdateExpense />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Edit_Expense;
