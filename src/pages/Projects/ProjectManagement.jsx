import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
import LibraryAddOutlined from "@mui/icons-material/LibraryAddOutlined";
import AddActivityModal from "./ActivityModal";
import { useState } from "react";
import {
  usePushActivityToProjectMutation,
  useUpdateDependencyMutation,
} from "../../redux/projectsSlice";
import { toast } from "react-toastify";
import AllProjects from "../../component/AllProject";

function ProjectManagement() {
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);

  const [pushActivity, { isLoading: isPushing }] =
    usePushActivityToProjectMutation();
  const [updateDependency, { isLoading: isUpdatingDeps }] =
    useUpdateDependencyMutation();

  const isLoading = isPushing || isUpdatingDeps;

  /** Normalize `dependency` + `predecessors` from modal payload */
  const normalizeDepsAndPreds = (payload = {}) => {
    // Prefer singular `dependency`; fallback to `dependencies`
    const dependency = Array.isArray(payload.dependency)
      ? payload.dependency
      : Array.isArray(payload.dependencies)
      ? payload.dependencies
      : [];

    // Prefer array `predecessors`; fallback to single fields {activity_id,type,lag}
    let predecessors = Array.isArray(payload.predecessors)
      ? payload.predecessors
      : [];

    if (
      predecessors.length === 0 &&
      payload.activity_id &&
      (payload.type || payload.lag !== undefined)
    ) {
      predecessors = [
        {
          activity_id: String(payload.activity_id),
          type: String(payload.type || "FS").toUpperCase(),
          lag:
            Number.isFinite(+payload.lag) && payload.lag !== ""
              ? Number(payload.lag)
              : 0,
        },
      ];
    }

    return { dependency, predecessors };
  };

  const handleCreate = async (payload) => {
    try {
      const { dependency, predecessors } = normalizeDepsAndPreds(payload || {});

      if (payload && payload.__mode === "existing") {
        // ---- Update dependencies of an EXISTING activity master ----
        const id =
          payload.activityId ||
          payload.id ||
          payload.activity_id ||
          payload._id ||
          "";

        if (!id) {
          console.error(
            "Missing master Activity _id for dependency update. Payload:",
            payload
          );
          toast.error("Missing activity id for existing activity.");
          return;
        }

        if (!dependency.length) {
          toast.error("Please select at least one dependency.");
          return;
        }

        const isGlobal = payload.__scope === "global";
        if (!isGlobal && !payload.project_id) {
          toast.error("Missing project id for project-scoped update.");
          return;
        }

        await updateDependency({
          id,
          global: isGlobal,
          projectId: isGlobal ? undefined : payload.project_id,
          // ✅ send singular `dependency`; include predecessors if present
          body: {
            dependency,
            ...(predecessors.length ? { predecessors } : {}),
          },
        }).unwrap();

        toast.success("Dependencies updated successfully");
        setOpenAdd(false);
        return;
      }

      // ---- NEW activity: push into project ----
      if (!payload?.project_id) {
        toast.error("Pick a project first.");
        return;
      }

      await pushActivity({
        projectId: payload.project_id,
        name: payload.name,
        description: payload.description,
        type: payload.type,
        // ✅ Always pass singular `dependency`; allow modal to provide either
        dependency,
        // ✅ Pass predecessors if any (backend can ignore if unused)
        ...(predecessors.length ? { predecessors } : {}),
      }).unwrap();

      toast.success("Activity added to project");
      setOpenAdd(false);
    } catch (err) {
      console.error("Create/update error:", err);
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
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
          </Box>
        </MainHeader>

        <SubHeader
          title="All Projects"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Button
              size="sm"
              variant="outlined"
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
              startDecorator={<LibraryAddOutlined />}
              onClick={() => setOpenAdd(true)}
            >
              Add Activity
            </Button>
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
          <AddActivityModal
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            onCreate={handleCreate}
            isSubmitting={isLoading}
          />
          <AllProjects />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default ProjectManagement;
