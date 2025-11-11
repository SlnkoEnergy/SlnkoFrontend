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

  // Build options: label = project code, value = projectId
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
        const id =
          it._id ||
          it.projectId ||
          it.id ||
          it.value_id ||
          it.project_id ||
          "";
        if (!id || !code) return null;
        return { label: String(code), value: String(id) };
      })
      .filter(Boolean);
  }, [dropdownRaw]);

  // Read filters from URL
  const projectIdFromUrl = searchParams.get("projectId") || "";
  const statusFromUrl = searchParams.get("status") || "";
  const fromFromUrl = searchParams.get("from") || undefined;
  const toFromUrl = searchParams.get("to") || undefined;

  // If URL has a projectId that's not in dropdown, clean it up
  useEffect(() => {
    if (
      projectIdFromUrl &&
      !projectOptions.some((o) => o.value === projectIdFromUrl)
    ) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("projectId");
        return p;
      });
    }
  }, [projectIdFromUrl, projectOptions, setSearchParams]);

  const FILTER_FIELDS = [
    {
      key: "projectId", // << use projectId in the filter
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

    // Remove legacy/unused keys
    next.delete("project_code");
    next.delete("project_name");

    // Write projectId (not code) into the URL
    if (vals.projectId) next.set("projectId", String(vals.projectId));
    else next.delete("projectId");

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
      p.delete("projectId");      // << clear projectId
      p.delete("project_code");   // safety: clear any legacy key too
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

        <MainHeader title="Projects" sticky>
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
          title="Site DPR"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Filter
              open={filterOpen}
              onOpenChange={setFilterOpen}
              fields={FILTER_FIELDS}
              initialValues={{
                projectId: projectIdFromUrl || undefined, // << use projectId here
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
