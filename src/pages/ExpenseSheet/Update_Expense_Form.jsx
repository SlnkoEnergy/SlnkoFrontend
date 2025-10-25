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
import { Button, Modal, ModalDialog, Textarea } from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUpdateExpenseStatusOverallMutation } from "../../redux/expenseSlice";
import Filter from "../../component/Partials/Filter";

function Edit_Expense() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fields = [
    {
      key: "dates",
      label: "Select Term",
      type: "daterange",
    }
  ];


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
                (user?.name === "Naresh Kumar" || user?.name === "Ranvijay Singh" || user?.name === "Shruti Tripathi")) ||
              user?.name === "Shantanu Sameer" ||
              user?.department === "Projects" ||
              user?.department === "Infra" ||
              user?.department === "Marketing" ||
              user?.department === "Internal" ||
              user?.department === "Loan" ||
              user?.department === "Logistic" ||
              (user?.department === "Tender" &&
                user?.name === "Satyadeep Mohanty")
            ) ? (<Button
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
            ) : (null)}

            {(user?.name === "IT Team" ||
              user?.department === "BD" ||
              (user?.department === "BD" &&
                (user?.emp_id === "SE-277" ||
                  user?.emp_id === "SE-046")) ||
              user?.department === "admin" ||
              (user?.department === "Accounts" &&
                user?.name === "Sujan Maharjan") ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              (user?.role === "manager" &&
                (user?.name === "Naresh Kumar" || user?.name === "Ranvijay Singh" || user?.name === "Shruti Tripathi")) ||
              (user?.role === "visitor" &&
                (user?.name === "Sanjiv Kumar" ||
                  user?.name === "Sushant Ranjan Dubey")) ||
              (((user?.department === "Projects" &&
                (user?.emp_id === "SE-203" ||
                  user?.emp_id === "SE-212" ||
                  user?.emp_id === "SE-205" ||
                  user?.emp_id === "SE-010")) ||
                user?.name === "Disha Sharma")) ||
              user?.department === "Engineering"
            ) ? (<Button
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
            </Button>) : (null)}


            {(user?.name === "IT Team" ||
              user?.department === "admin" ||
              (user?.role === "manager" && user?.name === "Shruti Tripathi")) ? (<Button
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
              </Button>) : (null)}


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
                user?.name === "Sujan Maharjan" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Varun Mishra" ||
                user?.name === "Prachi Singh") ||
              user?.department === "admin"
            ) ? (<Button
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
            </Button>) : (null)}

          </Box>
        </MainHeader>
        <SubHeader title="Update Expense" isBackEnabled={true} sticky>
          <>
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
                      onClick={() => {
                        setShowRejectAllDialog(true);
                      }}
                    // disabled={rows.every((row) => {
                    //   const status =
                    //     typeof row.current_status === "string"
                    //       ? row.current_status
                    //       : row.current_status?.status;

                    //   return [
                    //     "rejected",
                    //     "hold",
                    //     "hr approval",
                    //     "manager approval",
                    //     "final approval",
                    //   ].includes(status);
                    // })}
                    >
                      Reject All
                    </Button>

                    <Button
                      color="success"
                      size="sm"
                      onClick={() => {
                        setApproveConfirmOpen(true);
                      }}
                    // disabled={rows.every((row) => {
                    //   const status =
                    //     typeof row.current_status === "string"
                    //       ? row.current_status
                    //       : row.current_status?.status;

                    //   return [
                    //     "rejected",
                    //     "hold",
                    //     "hr approval",
                    //     "manager approval",
                    //     "final approval",
                    //   ].includes(status);
                    // })}
                    >
                      Approve All
                    </Button>
                  </>
                )}
            </Box>
            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}

              onApply={(values) => {
                setFrom(values?.dates?.from);
                setTo(values?.dates?.to);

                setOpen(false)
              }}

              onReset={() => {
                setFrom("");
                setTo("");

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
          <UpdateExpense
            showRejectAllDialog={showRejectAllDialog}
            approveConfirmOpen={approveConfirmOpen}
            setShowRejectAllDialog={setShowRejectAllDialog}
            setApproveConfirmOpen={setApproveConfirmOpen}
            from={from}
            to={to}
          />
        </Box>


      </Box>
    </CssVarsProvider>
  );
}
export default Edit_Expense;
