import React from "react";
import { useState, useEffect } from 'react';
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Sidebar from "../../component/Partials/Sidebar";
import Header from "../../component/Partials/Header";

import { useNavigate, useSearchParams } from "react-router-dom";
import Expense_form from "../../component/Expense Sheet/Expense Form/Expense_form";
import MainHeader from '../../component/Partials/MainHeader';
import SubHeader from '../../component/Partials/SubHeader';
import Filter from "../../component/Partials/Filter";

function Add_Expense() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const fields = [
    {
      key: "dates",
      label: "Select Expense Term",
      type: "daterange"
    },
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
        <SubHeader title="Add Expense" isBackEnabled={true} sticky>
          <Filter
            open={open}
            onOpenChange={setOpen}
            title="Filters"
            fields={fields}
            onApply={(values) => {
              setDateFrom(values?.dates?.from || "")
              setDateEnd(values?.dates?.to || "");
              setOpen(false);
            }}

            onReset={() => {
              setDateEnd("");
              setDateFrom("");
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
          <Expense_form
            dateFrom={dateFrom}
            dateTo={dateEnd}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Add_Expense;
