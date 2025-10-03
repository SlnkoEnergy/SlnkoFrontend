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
import Filter from "../../component/Partials/Filter";

import {
  useGetCategoriesNameSearchQuery,
} from "../../redux/productsSlice";

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

  // ---- URL params (source of truth) ----
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const projectId = searchParams.get("projectId") || "";

  const search = searchParams.get("search") || "";
  const itemSearch = searchParams.get("itemSearch") || ""; // selected category name
  const statusSearch = searchParams.get("statusSearch") || "";
  const poValueSearch = searchParams.get("poValueSearch") || "";

  const createdFrom = searchParams.get("from") || "";
  const createdTo = searchParams.get("to") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";

  const createdDateRange = [createdFrom, createdTo];
  const etdDateRange = [deadlineFrom, deadlineTo];

  // merge into URL params
  const updateParams = (patch) => {
    setSearchParams((prev) => {
      const merged = Object.fromEntries(prev.entries());
      const next = { ...merged };
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === "") delete next[k];
        else next[k] = String(v);
      }
      return next;
    });
  };

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

  const fields = useMemo(
    () => [
      {
        key: "itemSearch",
        label: "Category",
        type: "select",
        options: categoryOptions,
      },
      {
        key: "createdAt",
        label: "Filter by Created Date",
        type: "daterange",
      },
      {
        key: "deadline",
        label: "Filter by ETD Date",
        type: "daterange",
      },
    ],
    [categoryOptions]
  );

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
          title="Purchase Request"
          isBackEnabled={false}
          sticky
          rightSlot={
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
                  delete merged.deadlineFrom;
                  delete merged.deadlineTo;
                  delete merged.matchMode;
                  delete merged.itemSearch;

                  const next = {
                    ...merged,
                    page: "1",
                  };

                  if (values.matcher) {
                    next.matchMode = values.matcher === "OR" ? "any" : "all";
                  }

                  // itemSearch from select
                  if (values.itemSearch) {
                    // in case Filter returns an object {label,value}
                    next.itemSearch =
                      typeof values.itemSearch === "string"
                        ? values.itemSearch
                        : values.itemSearch.value ?? "";
                  }

                  // createdAt range
                  if (values.createdAt?.from)
                    next.from = String(values.createdAt.from);
                  if (values.createdAt?.to)
                    next.to = String(values.createdAt.to);

                  // deadline range
                  if (values.deadline?.from)
                    next.deadlineFrom = String(values.deadline.from);
                  if (values.deadline?.to)
                    next.deadlineTo = String(values.deadline.to);

                  return next;
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.itemSearch;
                  delete merged.from;
                  delete merged.to;
                  delete merged.deadlineFrom;
                  delete merged.deadlineTo;
                  delete merged.matchMode;
                  return { ...merged, page: "1" };
                });
              }}
            />
          }
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
