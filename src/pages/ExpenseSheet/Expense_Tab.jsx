import  { useState, useEffect } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';

import Typography from '@mui/joy/Typography';

import Sidebar from '../../component/Partials/Sidebar';

import { useNavigate, useSearchParams } from 'react-router-dom';
import AllExpense from '../../component/Expense Sheet/ExpenseDashboard';
import MainHeader from '../../component/Partials/MainHeader';
import SubHeader from '../../component/Partials/SubHeader';
import Filter from "../../component/Partials/Filter";


function Expense_Table() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const [department, setDepartment] = useState(
    searchParams.get("department") || ""
  );

  useEffect(() => {
    if (department) {
      setSearchParams({ department });
    } else {
      setSearchParams({});
    }
  }, [department, setSearchParams]);

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
    }
  ]
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
              setOpen(false)
            }}
          />
        </SubHeader>
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
              User Expense
            </Typography>

            <Box
              sx={{
                display: "flex",
                mb: 1,
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "start", sm: "center" },
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >


            </Box>

          </Box>
          <AllExpense />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Expense_Table;