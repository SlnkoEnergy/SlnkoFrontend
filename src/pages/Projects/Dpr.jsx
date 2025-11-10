// pages/DprManagement.jsx
import { useMemo, useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import DPRTable from "../../component/Dpr";
import Filter from "../../component/Partials/Filter";

import { useGetProjectDropdownQuery } from "../../redux/projectsSlice";

function DprManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: dropdownRaw, isLoading: isDropdownLoading } =
    useGetProjectDropdownQuery();

  const projectOptions = useMemo(() => {
    const list =
      (Array.isArray(dropdownRaw?.data) && dropdownRaw.data) ||
      (Array.isArray(dropdownRaw?.projects) && dropdownRaw.projects) ||
      (Array.isArray(dropdownRaw) && dropdownRaw) ||
      [];

    return list
      .map((it) => {
        const code =
          it.code ||
          it.project_code ||
          it.projectCode ||
          it.code_value ||
          it.value ||
          it.id ||
          "";
        if (!code) return null;
        return { label: String(code), value: String(code) };
      })
      .filter(Boolean);
  }, [dropdownRaw]);

  const projectCodeFromUrl = searchParams.get("project_code") || "";
  const statusFromUrl = searchParams.get("status") || "";
  const fromFromUrl = searchParams.get("from") || undefined;
  const toFromUrl = searchParams.get("to") || undefined;

  // Optional: clean invalid project_code from URL if dropdown no longer has it
  useEffect(() => {
    if (
      projectCodeFromUrl &&
      !projectOptions.some((o) => o.value === projectCodeFromUrl)
    ) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("project_code");
        return p;
      });
    }
  }, [projectCodeFromUrl, projectOptions, setSearchParams]);

  const FILTER_FIELDS = [
    {
      key: "project_code",
      label: "Project Code",
      type: "select",
      options: projectOptions,
    },
    { key: "deadline", label: "Deadline (Range)", type: "daterange" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
       { label: "In progress", value: "in progress" },
        { label: "Idle", value: "idle" },
         { label: "Work Stopped", value: "work stopped" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];

  const handleApplyFilters = (vals) => {
    const next = new URLSearchParams(searchParams);

    next.delete("project_name"); // ensure never present

    if (vals.project_code) next.set("project_code", String(vals.project_code));
    else next.delete("project_code");

    const dr = vals.deadline;
    if (dr?.from) next.set("from", dr.from);
    else next.delete("from");
    if (dr?.to) next.set("to", dr.to);
    else next.delete("to");

    if (vals.status) next.set("status", String(vals.status));
    else next.delete("status");

    next.set("page", "1");
    if (!next.get("pageSize")) next.set("pageSize", "10");

    setSearchParams(next);
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("project_code");
      p.delete("project_name");
      p.delete("from");
      p.delete("to");
      p.delete("status");
      p.set("page", "1");
      return p;
    });
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
        <Sidebar />

        <MainHeader title="DPR" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/project_dash`)}
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
              Dashboard
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/project_management`)}
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
              All Projects
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/project_template`)}
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
              Templates
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/dpr_management`)}
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
              Site DPR
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Daily Progress Reports"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Filter
              open={filterOpen}
              onOpenChange={setFilterOpen}
              fields={FILTER_FIELDS}
              initialValues={{
                project_code: projectCodeFromUrl || undefined,
                status: statusFromUrl || undefined,
                deadline:
                  fromFromUrl || toFromUrl
                    ? { from: fromFromUrl, to: toFromUrl }
                    : undefined,
              }}
              title="Filter DPR"
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              disabled={isDropdownLoading}
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
          <DPRTable />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default DprManagement;
