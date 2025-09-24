import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import My_Requests from "../../component/Approvals/My_Requests";
import Filter from "../../component/Partials/Filter";
import { useState } from "react";

function MyRequest() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
    const fields = [
    {
      key: "status",
      label: "Filter By Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    {
      key: "createdAt",
      label: "Filter by Created Date",
      type: "daterange",
    },
  ];
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title="Approvals" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/approval_dashboard`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/my_requests`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              My Requests
            </Button>

            <Button
              size="sm"
              onClick={()=> navigate(`/my_approvals`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              My Approvals
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="My Requests"
          isBackEnabled={false}
          sticky
        >
          <Box display="flex" gap={1} alignItems="center">
            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}
              title="Filters"
              onApply={(values) => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.status;
                  delete merged.from;
                  delete merged.to;
                  delete merged.matchMode;

                  const next = {
                    ...merged,
                    page: "1",
                    ...(values.status && {
                      status: String(values.status),
                    }),
                  };

                  // matcher -> matchMode
                  if (values.matcher) {
                    next.matchMode = values.matcher === "OR" ? "any" : "all";
                  }

                  // createdAt range
                  if (values.createdAt?.from)
                    next.from = String(values.createdAt.from);
                  if (values.createdAt?.to)
                    next.to = String(values.createdAt.to);

                  return next;
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.priorityFilter;
                  delete merged.status;
                  delete merged.department;
                  delete merged.assigned_to;
                  delete merged.createdBy;
                  delete merged.from;
                  delete merged.to;
                  delete merged.deadlineFrom;
                  delete merged.deadlineTo;
                  delete merged.matchMode;
                  return { ...merged, page: "1" };
                });
              }}
            />
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
          <My_Requests />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default MyRequest;
