import React, { useRef, useState, useEffect } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import Sidebar from '../../component/Partials/Sidebar';

import Header from '../../component/Partials/Header';
import AllProject from '../../component/AllProject';
import { useNavigate } from 'react-router-dom';
import HrExpense from '../../component/Expense Sheet/HR_Expense_Approval';
import AccountsExpense from '../../component/Expense Sheet/Accounts_Expense_Approval';
import { useLazyExportExpensesToCSVQuery } from '../../redux/Expense/expenseSlice';


function Accounts_Expense() {
    const navigate = useNavigate();
    const [triggerExport] = useLazyExportExpensesToCSVQuery();

    const handleExportToCSV = async () => {
      try {
        const result = await triggerExport().unwrap();
        const blob = new Blob([result], { type: "text/csv" });
    
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expenses.csv"; // set desired filename
        document.body.appendChild(a); // Firefox compatibility
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // cleanup
      } catch (error) {
        console.error("Export to CSV failed:", error);
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
              sx={{ pl: 0, marginTop: {md:"4%", lg:"0%"} }}
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
           
            <Button
  color="primary"
  startDecorator={<DownloadRoundedIcon />}
  size="sm"
  onClick={handleExportToCSV}
>
  Export to CSV
</Button>


          </Box>
          <AccountsExpense/>
          
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Accounts_Expense;