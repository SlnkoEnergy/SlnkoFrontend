import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import Dash_eng from "../../component/EngDashboard";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Filter from "../../component/Partials/Filter";

function DashboardENG() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const fields = [
    {
      key: "createdAt",
      label: "Filter by Created At",
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
        <MainHeader title="Engineering" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/eng_dash`)}
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
              All Projects
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/inspection`)}
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
              Inspection
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="All Projects"
          isBackEnabled={false}
          sticky
          rightSlot={
            <>
              <Filter
                open={open}
                onOpenChange={setOpen}
                fields={fields}
                title="Filters"
                onApply={(values) => {
                  setSearchParams((prev) => {
                    const merged = Object.fromEntries(prev.entries());
                    delete merged.from;
                    delete merged.to;
                    delete merged.matchMode;

                    const next = {
                      ...merged,
                      page: "1",
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
                    delete merged.from;
                    delete merged.to;
                    delete merged.matchMode;
                    return { ...merged, page: "1" };
                  });
                }}
              />
            </>
          }
        ></SubHeader>
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
          <Dash_eng />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default DashboardENG;
