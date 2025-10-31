import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import PurchaseReqSummary from "../../component/PurchaseReqSummary";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { Button } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGetCategoriesNameSearchQuery } from "../../redux/productsSlice";

function PurchaseRequestSheet() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ---- helpers ----
  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) return JSON.parse(userData);
    return null;
  };

  useEffect(() => {
    setUser(getUserData());
  }, []);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const projectId = searchParams.get("projectId") || "";

  const search = searchParams.get("search") || "";
  const itemSearch = searchParams.get("itemSearch") || "";
  const statusSearch = searchParams.get("statusSearch") || "";
  const poValueSearch = searchParams.get("poValueSearch") || "";

  const createdFrom = searchParams.get("from") || "";
  const createdTo = searchParams.get("to") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";

  const createdDateRange = [createdFrom, createdTo];
  const etdDateRange = [deadlineFrom, deadlineTo];


  const { data: catInitialData } = useGetCategoriesNameSearchQuery({
    page: 1,
    search: "",
    pr: false,
    projectId: projectId || "",
  });

  const categoryOptions = useMemo(() => {
    const rows = (catInitialData?.data || []).map((r) => {
      const name = r?.name ?? r?.category ?? r?.make ?? "";
      return { label: name, value: name };
    });

    if (itemSearch && !rows.some((o) => o.value === itemSearch)) {
      rows.unshift({ label: itemSearch, value: itemSearch });
    }
    return rows;
  }, [catInitialData?.data, itemSearch]);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />

        <MainHeader title="CAM" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/cam_dash`)}
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
              Handover
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/project_scope`)}
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
              Project Scope
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/loan`)}
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
              Loan
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/purchase_request`)}
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
              Purchase Request
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Add Loan"
          isBackEnabled={false}
          sticky
        />

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
          <PurchaseReqSummary
            // pass down only what you asked for
            itemSearch={itemSearch}
            etdDateRange={etdDateRange}
            createdDateRange={createdDateRange}
          />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default PurchaseRequestSheet;
