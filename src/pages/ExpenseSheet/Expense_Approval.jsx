import React, { useRef, useState, useEffect } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import Sidebar from "../../component/Partials/Sidebar";

import Header from "../../component/Partials/Header";
import AllProject from "../../component/AllProject";
import { useNavigate, useSearchParams } from "react-router-dom";
import ExpenseApproval from "../../component/Expense Sheet/Expense_Approval";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import Filter from "../../component/Partials/Filter";

function ApprovalExpense() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");

  useEffect(() => {
    const sp = new URLSearchParams(searchParams);

    if (status) sp.set("status", status);
    else sp.delete("status");

    if (dateFrom) sp.set("from", dateFrom);
    else sp.delete("from");

    if (dateTo) sp.set("to", dateTo);
    else sp.delete("to");

    setSearchParams(sp);
  }, [status, dateFrom, dateTo]);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "submitted", label: "Pending" },
    { value: "manager approval", label: "Manager Approved" },
    { value: "hr approval", label: "HR Approved" },
    { value: "final approval", label: "Approved" },
    { value: "hold", label: "On Hold" },
    { value: "rejected", label: "Rejected" },
  ];
  const fields = [
    {
      key: "status",
      label: "Filter By Status",
      options: statusOptions.map((d) => ({ label: d.label, value: d.value })),
      type: "select",
    },
    {
      key: "dates",
      label: "Filter By Date",
      type: "daterange",
    },
  ];

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

        <SubHeader title="Expense Approval" isBackEnabled={false} sticky>
          <Filter
            open={open}
            onOpenChange={setOpen}
            fields={fields}
            onApply={(value) => {
              setStatus(value?.status || "");
              setDateFrom(value?.dates?.from || "");
              setDateTo(value?.dates?.to);
              setOpen(false);
            }}
            onReset={() => {
              setStatus("");
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
          <ExpenseApproval />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ApprovalExpense;
