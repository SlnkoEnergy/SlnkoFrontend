import { useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";

import Typography from "@mui/joy/Typography";

import Sidebar from "../../component/Partials/Sidebar";

import { useNavigate, useSearchParams } from "react-router-dom";
import AllExpense from "../../component/Expense Sheet/ExpenseDashboard";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import Filter from "../../component/Partials/Filter";

function Expense_Table() {
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

  const [department, setDepartment] = useState(
    searchParams.get("department") || ""
  );

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    if (department) sp.set("department", department);
    else sp.delete("department");
    setSearchParams(sp);
  }, [department]);

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
    "Loan",
    "BD",
  ];
  const fields = [
    {
      key: "department",
      label: "Filter By Department",
      type: "select",
      options: departments.map((d) => ({ label: d, value: d })),
    },
  ];
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

        <SubHeader title="Dashboard" isBackEnabled={false} sticky>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              color="primary"
              size="sm"
              onClick={() => navigate("/add_expense")}
            >
              Add Expense +
            </Button>
          </Box>

          <Filter
            open={open}
            onOpenChange={setOpen}
            title="Filters"
            fields={fields}
            onApply={(values) => {
              setDepartment(values?.department || "");

              setOpen(false);
            }}
            onReset={() => {
              setDepartment("");
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
          <AllExpense />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Expense_Table;
