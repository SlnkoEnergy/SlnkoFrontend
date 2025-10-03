import { Box, Button, CssBaseline, CssVarsProvider } from "@mui/joy";
import Sidebar from "../../component/Partials/Sidebar";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import SubHeader from "../../component/Partials/SubHeader";
import Dash_project from "../../component/DashboardProject";
import Filter from "../../component/Partials/Filter";
import { useState, useEffect } from "react";
import { useGetProjectDropdownForDashboardQuery } from "../../redux/projectsSlice";

function ProjectDashBoard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ useSearchParams hook
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: projectResponse } = useGetProjectDropdownForDashboardQuery({
    // page: 1,
    // pageSize: 7,
  });

  const projects = Array.isArray(projectResponse)
    ? projectResponse
    : projectResponse?.data ?? [];

  const fields = [
    {
      key: "Projects",
      label: "Project By Name",
      type: "multiselect",
      options: projects.map((d) => ({ label: d.name, value: d._id })),
    },
  ];

  // ✅ Load selectedIds from URL params initially
  const [selectedIds, setSelectedIds] = useState(
    searchParams.get("projects")?.split(",") || []
  );

  // ✅ Keep URL in sync when selectedIds 
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ projects: selectedIds.join(",") });
    } else {
      setSearchParams({});
    }
  }, [selectedIds, setSearchParams]);

  console.log(selectedIds);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title={"Projects"} sticky>
          <Box display={"flex"} gap={1}>
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Templates
            </Button>
          </Box>
        </MainHeader>
        <SubHeader title="Dashboard" isBackEnabled={false} sticky>
          <Filter
            open={open}
            onOpenChange={setOpen}
            fields={fields}
            title="Filters"
            values={{ Projects: selectedIds }}   // 👈 controlled values
            onApply={(values) => {
              setSelectedIds(values?.Projects || []);
              setOpen(false);
            }}
            onReset={() => {
              setSelectedIds([]); 
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
          <Dash_project projectIds={selectedIds} />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default ProjectDashBoard;
