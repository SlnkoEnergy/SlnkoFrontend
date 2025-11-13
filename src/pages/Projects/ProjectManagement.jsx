import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import LibraryAddOutlined from "@mui/icons-material/LibraryAddOutlined";
import AddActivityModal from "./ActivityModal";
import { useState } from "react";
import {
  usePushActivityToProjectMutation,
  useUpdateDependencyMutation,
} from "../../redux/projectsSlice";
import { toast } from "react-toastify";
import AllProjects from "../../component/AllProject";
import Filter from "../../component/Partials/Filter";

function ProjectManagement() {
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pushActivity, { isLoading: isPushing }] =
    usePushActivityToProjectMutation();
  const [updateDependency, { isLoading: isUpdatingDeps }] =
    useUpdateDependencyMutation();

  const isLoading = isPushing || isUpdatingDeps;

  // --- Normalize only what comes from the modal that we pass through as-is ---
  const normalizeFromModal = (payload = {}) => {
    const dependencies = Array.isArray(payload.dependencies)
      ? payload.dependencies
      : Array.isArray(payload.dependency)
      ? payload.dependency
      : [];

    // use predecessors only if provided; do NOT synthesize from payload.type
    const predecessors = Array.isArray(payload.predecessors)
      ? payload.predecessors
      : [];

    const hasCompletionFormula = Object.prototype.hasOwnProperty.call(
      payload,
      "completion_formula"
    );
    const hasWorkCompletionUnit = Object.prototype.hasOwnProperty.call(
      payload,
      "work_completion_unit"
    );
    const hasCategory = Object.prototype.hasOwnProperty.call(
      payload,
      "category"
    );
    const completion_formula = hasCompletionFormula
      ? String(payload.completion_formula ?? "")
      : undefined;

    const work_completion_unit = hasWorkCompletionUnit
      ? String(payload.work_completion_unit ?? "")
      : undefined;

    const category = hasCategory ? String(payload.category ?? "") : undefined;

    return {
      dependencies,
      predecessors,
      hasCompletionFormula,
      completion_formula,
      hasWorkCompletionUnit,
      work_completion_unit,
      hasCategory,
      category,
    };
  };

  const handleCreate = async (payload) => {
    try {
      const {
        dependencies,
        predecessors,
        hasCompletionFormula,
        completion_formula,
        hasWorkCompletionUnit,
        work_completion_unit,
        hasCategory,
        category,
      } = normalizeFromModal(payload || {});
      console.log({ payload });

      // --- UPDATE EXISTING (global or project embedded) ---
      if (payload && payload.__mode === "existing") {
        const id =
          payload.activityId ||
          payload.id ||
          payload.activity_id ||
          payload._id ||
          "";

        if (!id) {
          console.error(
            "Missing master Activity _id for update. Payload:",
            payload
          );
          toast.error("Missing activity id for existing activity.");
          return;
        }

        const isGlobal = payload.__scope === "global";

        if (!isGlobal && !payload.project_id) {
          toast.error("Missing project id for project-scoped update.");
          return;
        }

        const body = {
          ...(payload.type ? { type: String(payload.type).toLowerCase() } : {}),
          ...(Number.isFinite(+payload.order) ? { order: +payload.order } : {}),
          ...(dependencies.length ? { dependencies } : {}),
          ...(predecessors.length ? { predecessors } : {}),
          ...(isGlobal && hasCompletionFormula ? { completion_formula } : {}),
          ...(isGlobal && hasWorkCompletionUnit
            ? { work_completion_unit }
            : {}),
          ...(isGlobal && hasCategory ? { category } : {}),
        };

        // Guard: truly nothing to update?
        if (
          !("type" in body) &&
          !("order" in body) &&
          !("dependencies" in body) &&
          !("predecessors" in body) &&
          !("completion_formula" in body) &&
          !("work_completion_unit" in body) &&
          !("category" in body)
        ) {
          toast.error("Nothing to update.");
          return;
        }

        await updateDependency({
          id,
          global: isGlobal,
          projectId: isGlobal ? undefined : payload.project_id,
          body,
        }).unwrap();

        toast.success("Activity updated successfully");
        setOpenAdd(false);
        return;
      }

      // --- CREATE NEW (push to project) ---
      if (!payload?.project_id) {
        toast.error("Pick a project first.");
        return;
      }

      await pushActivity({
        projectId: payload.project_id,
        name: payload.name,
        description: payload.description,
        type: String(payload.type || "frontend").toLowerCase(),
        ...(Number.isFinite(+payload.order) ? { order: +payload.order } : {}),
        dependencies,
        ...(predecessors.length ? { predecessors } : {}),
      }).unwrap();

      toast.success("Activity added to project");
      setOpenAdd(false);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Something went wrong. Please try again."
      );
    }
  };

  const fields = [
    {
      key: "tab",
      label: "Filter by Project Status",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "To Be Started", value: "to be started" },
        { label: "Ongoing", value: "ongoing" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on_hold" },
        { label: "Delayed", value: "delayed" },
        { label: "Dead", value: "dead" },
        { label: "Books Closed", value: "books closed" },
      ],
    },
  ];

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
          title="All Projects"
          isBackEnabled={false}
          sticky
          rightSlot={
            <>
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
              <Filter
                open={open}
                onOpenChange={setOpen}
                fields={fields}
                title="Filters"
                onApply={(values) => {
                  setSearchParams((prev) => {
                    const merged = Object.fromEntries(prev.entries());
                    delete merged.tab;

                    const next = {
                      ...merged,
                      page: "1",
                      ...(values.tab && {
                        tab: String(values.tab),
                      }),
                    };

                    return next;
                  });
                  setOpen(false);
                }}
                onReset={() => {
                  setSearchParams((prev) => {
                    const merged = Object.fromEntries(prev.entries());
                    delete merged.tab;
                    delete merged.matchMode;
                    return { ...merged, page: "1" };
                  });
                }}
              />
            </>
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
