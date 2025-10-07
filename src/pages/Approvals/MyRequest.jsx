// src/pages/Approvals/MyRequest.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useTheme } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import My_Requests from "../../component/Approvals/My_Requests";
import Filter from "../../component/Partials/Filter";
import { useEffect, useMemo, useState } from "react";
import Modal from "@mui/joy/Modal";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import SelectRS from "react-select";

import { LibraryAddOutlined } from "@mui/icons-material";
import {
  useGetProjectDropdownQuery,
  useGetProjectActivityByProjectIdQuery,
  useGetRejectedOrNotAllowedDependenciesQuery,
  useCreateApprovalMutation,
} from "../../redux/projectsSlice";
import { useGetApprovalFormByIdQuery } from "../../redux/ApprovalsSlice";

const rowSx = { px: 1, py: 1, borderBottom: "1px solid", borderColor: "divider" };

/* ---------- New Request Slide-over ---------- */
function NewRequestPanel({
  open,
  onOpenChange,
  onCreate,
  mode = "post",
  approvalId,
}) {
  const [exiting, setExiting] = useState(false);
  const theme = useTheme();
  const isView = mode === "view";

  // VIEW MODE → fetch prefilled data
  const {
    data: viewData,
    isFetching: viewLoading,
    isSuccess: viewOk,
  } = useGetApprovalFormByIdQuery(approvalId, {
    skip: !isView || !approvalId || !open,
  });

  // Projects dropdown (for POST mode search)
  const { data: projResp, isFetching: loadingProjects } = useGetProjectDropdownQuery();

  const projectOptions = useMemo(() => {
    const list = projResp?.data ?? projResp ?? [];
    return (Array.isArray(list) ? list : []).map((p) => {
      const code = String(p?.code ?? p?.p_id ?? "");
      const id = String(p?._id ?? "");
      const name = String(p?.name ?? p?.project_name ?? p?.customer ?? "");
      return { value: id, label: code || id, name };
    });
  }, [projResp]);

  const [values, setValues] = useState({
    projectId: "",
    projectName: "",
    item: "",       // post: activity_id | view: activity name
    dependency: "", // post: dependency model_id | view: dependency name
  });
  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const resetAll = () =>
    setValues({ projectId: "", projectName: "", item: "", dependency: "" });

  // Refresh form when switching from view → post
  useEffect(() => {
    if (open && mode === "post") resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open]);

  // Prefill labels for view mode when data arrives
  useEffect(() => {
    if (isView && viewOk && viewData?.form) {
      const f = viewData.form;
      setValues({
        projectId: String(f.project?.code || ""), // display code in Project Id
        projectName: String(f.project?.name || ""),
        item: String(f.selected_activity?.name || ""),
        dependency: String(f.selected_dependency?.name || ""),
      });
    }
  }, [isView, viewOk, viewData]);

  // Joy-like styles for react-select
  const rsStyles = {
    container: (base) => ({ ...base, width: "100%" }),
    control: (base, state) => ({
      ...base,
      minHeight: 32,
      borderRadius: 8,
      background: theme.vars.palette.background.body,
      borderColor: state.isFocused
        ? theme.vars.palette.primary.outlinedBorder
        : theme.vars.palette.neutral.outlinedBorder,
      boxShadow: state.isFocused
        ? `0 0 0 3px ${theme.vars.palette.primary.softActiveBg}`
        : "none",
      ":hover": { borderColor: theme.vars.palette.neutral.outlinedHoverBorder },
      fontSize: 14,
      opacity: isView ? 0.7 : 1,
      pointerEvents: isView ? "none" : "auto",
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
    placeholder: (base) => ({ ...base, color: theme.vars.palette.text.tertiary }),
    singleValue: (base) => ({ ...base, color: theme.vars.palette.text.primary }),
    menu: (base) => ({
      ...base,
      zIndex: 2000,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 2000 }),
  };

  const filterOption = (option, rawInput) => {
    const q = (rawInput || "").toLowerCase();
    const id = (option?.label || "").toLowerCase();
    const val = (option?.value || "").toLowerCase();
    const name = (option?.data?.name || "").toLowerCase();
    return id.includes(q) || val.includes(q) || name.includes(q);
  };

 
  const selectedProjOption =
    (isView && viewData?.form?.project
      ? {
          value: viewData.form.project.code, // value doesn't matter in view
          label: viewData.form.project.code,
          name: viewData.form.project.name,
        }
      : null) ||
    projectOptions.find((o) => o.value === values.projectId) ||
    null;

  /* ===== Activities (POST mode only) ===== */
  const {
    data: actsResp,
    isFetching: loadingActs,
    isUninitialized: actsUninit,
    isError: actsError,
    isSuccess: actsOk,
    refetch: refetchActs,
  } = useGetProjectActivityByProjectIdQuery(values.projectId, {
    skip: !values.projectId || !open || isView,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isView) {
      setField("item", "");
      setField("dependency", "");
      if (open && values.projectId) refetchActs?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.projectId]);

  const activityOptions = useMemo(() => {
    if (actsError || !actsOk) return [];
    const activities =
      actsResp?.activities ??
      actsResp?.data?.activities ??
      actsResp?.projectactivity?.activities ??
      [];
    if (!Array.isArray(activities) || activities.length === 0) return [];
    return activities
      .map((a) => {
        const actId = String(a?.activity_id?._id ?? a?.activity_id ?? "");
        if (!actId) return null;
        const label =
          a?.name ?? a?.activity_id?.name ?? `Activity ${actId.slice(-6)}`;
        return {
          value: actId,
          label,
          meta: {
            description: a?.description ?? a?.activity_id?.description ?? "",
            type: a?.type ?? a?.activity_id?.type ?? "",
            activityIdToPost: String(a?._id) ?? "",
          },
        };
      })
      .filter(Boolean);
  }, [actsResp, actsError, actsOk]);

  const activityLoading = !!values.projectId && !actsUninit && loadingActs;

  const selectedActivityOption =
    (isView && viewData?.form?.selected_activity
      ? {
          value: viewData.form.selected_activity._id,
          label: viewData.form.selected_activity.name,
        }
      : null) ||
    activityOptions.find((o) => o.value === values.item) ||
    (values.item ? { value: values.item, label: values.item } : null);

  const {
    data: depsResp,
    isFetching: loadingDeps,
    isUninitialized: depsUninit,
    isError: depsError,
    isSuccess: depsOk,
  } = useGetRejectedOrNotAllowedDependenciesQuery(
    {
      projectId: isView ? viewData?.form?.project?._id : values.projectId,
      activityId: isView ? viewData?.approval?.activity_id : values.item,
    },
    {
      skip:
        !open ||
        (isView &&
          (!viewData?.form?.project?._id || !viewData?.approval?.activity_id)) ||
        (!isView && (!values.projectId || !values.item)),
      refetchOnMountOrArgChange: true,
    }
  );

  const dependencyOptions = useMemo(() => {
    if (depsError || !depsOk) return [];
    const deps = Array.isArray(depsResp?.dependencies) ? depsResp.dependencies : [];
    if (deps.length === 0) return [];
    return deps.map((d) => {
      const model = String(d?.model || "Unknown");
      const mid = String(d?.model_id || "");
      const name = d?.model_id_name ? String(d.model_id_name).trim() : "";
      const label = name || (mid ? `${model} (${mid.slice(0, 6)}…${mid.slice(-4)})` : model);
      return {
        value: mid,
        label,
        meta: {
          model,
          status: d?.current_status?.status || "",
          model_id_name: name,
          dependencyIdToPost: String(d?._id) || "",
        },
      };
    });
  }, [depsResp, depsError, depsOk]);

  const dependencyLoading =
    (!!values.projectId && !!values.item && !depsUninit && loadingDeps) || false;

  const selectedDependencyOption =
    (isView && viewData?.form?.selected_dependency
      ? {
          value: viewData.form.selected_dependency._id,
          label: viewData.form.selected_dependency.name,
        }
      : null) ||
    dependencyOptions.find((o) => o.value === values.dependency) ||
    (values.dependency ? { value: values.dependency, label: values.dependency } : null);

  // Derived flags
  const noDeps =
    depsOk &&
    !depsError &&
    Array.isArray(depsResp?.dependencies) &&
    depsResp.dependencies.length === 0;

  // Build payload (POST mode)
  const buildApprovalPayload = () => {
    if (!values.projectId || !selectedActivityOption?.meta) return null;
    return {
      data: {
        model_name: "projectActivities",
        project_id: values.projectId,
        activity_id: selectedActivityOption.meta.activityIdToPost,
        ...(selectedDependencyOption?.meta?.dependencyIdToPost
          ? { dependency_id: selectedDependencyOption.meta.dependencyIdToPost }
          : {}),
      },
    };
  };

  // Placeholders & disabled states
  const activityPlaceholder = !values.projectId
    ? "Select a project first…"
    : actsError
    ? "No project activities found for this project"
    : "Search activity…";

  const activityDisabled =
    isView ||
    !values.projectId ||
    activityLoading ||
    actsError ||
    activityOptions.length === 0;

  const dependencyPlaceholder = !values.projectId
    ? "Select a project first…"
    : !values.item
    ? "Select an activity first…"
    : depsError
    ? "No blocked dependencies found for this activity"
    : noDeps
    ? "No dependencies"
    : "Search dependency…";

  const dependencyDisabled =
    isView ||
    !values.projectId ||
    !values.item ||
    dependencyLoading ||
    depsError ||
    noDeps ||
    dependencyOptions.length === 0;

  return (
    <Modal
      open={!!open}
      onClose={() => {
        setExiting(true);
        setTimeout(() => {
          setExiting(false);
          onOpenChange(false);
        }, 280);
      }}
      keepMounted
    >
      <Sheet
        variant="soft"
        color="neutral"
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 420,
          display: "flex",
          flexDirection: "column",
          boxShadow: "lg",
          bgcolor: "background.level1",
          zIndex: 1300,
          transition: "transform 0.28s ease",
          transform: open
            ? "translateX(0)"
            : exiting
            ? "translateX(-100%)"
            : "translateX(100%)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Typography level="title-md">
            {isView ? "View Request" : "New Request"}
          </Typography>
          <ModalClose onClick={() => onOpenChange(false)} />
        </Box>

        {/* Slim progress while view is loading */}
        {isView && viewLoading && (
          <Box sx={{ height: 2, bgcolor: "neutral.outlinedBorder", position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "45%",
                bgcolor: "primary.solidBg",
                animation: "load 1s linear infinite",
              }}
            />
            <style>{`@keyframes load {0%{left:0;width:5%}50%{left:30%;width:40%}100%{left:100%;width:5%}}`}</style>
          </Box>
        )}

        {/* Fields */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* Project Id (view: shows project.code) */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Project Id</FormLabel>
              <SelectRS
                options={projectOptions}
                value={selectedProjOption}
                isLoading={loadingProjects}
                isClearable={!isView}
                isSearchable
                placeholder="Search project id…"
                onChange={(opt) => {
                  if (isView) return;
                  const o = opt || null;
                  setField("projectId", o?.value || "");
                  setField("projectName", o?.name || "");
                }}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                styles={rsStyles}
                filterOption={filterOption}
                menuPlacement="auto"
              />
            </FormControl>
          </Box>

          {/* Project Name (read-only) */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Project Name</FormLabel>
              <Input
                size="sm"
                readOnly
                placeholder="Auto-filled when Project Id is selected"
                value={values.projectName}
              />
            </FormControl>
          </Box>

          {/* Activity (view: shows selected_activity.name) */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Activity</FormLabel>
              <SelectRS
                options={activityOptions}
                value={selectedActivityOption}
                isLoading={activityLoading}
                isClearable={!isView}
                isSearchable
                placeholder={activityPlaceholder}
                onChange={(opt) => {
                  if (isView) return;
                  const o = opt || null;
                  setField("item", o?.value || ""); // activity_id
                }}
                isDisabled={activityDisabled}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                styles={rsStyles}
                menuPlacement="auto"
                noOptionsMessage={() =>
                  !values.projectId
                    ? "Select a project first"
                    : actsError
                    ? "No project activities found"
                    : "No activities found"
                }
              />
              {/* Hide activity error helper texts in VIEW mode */}
              {!isView && actsError && values.projectId ? (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  No project activities were found for the selected project.
                </Typography>
              ) : null}
            </FormControl>
          </Box>

          {/* Dependencies (view: shows selected_dependency.name) */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Dependencies</FormLabel>
              <SelectRS
                options={dependencyOptions}
                value={selectedDependencyOption}
                isLoading={dependencyLoading}
                isClearable={!isView}
                isSearchable
                placeholder={dependencyPlaceholder}
                onChange={(opt) => {
                  if (isView) return;
                  const o = opt || null;
                  setField("dependency", o?.value || ""); // dependency model_id
                }}
                isDisabled={dependencyDisabled}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                styles={rsStyles}
                menuPlacement="auto"
                noOptionsMessage={() =>
                  !values.projectId
                    ? "Select a project first"
                    : !values.item
                    ? "Select an activity first"
                    : depsError
                    ? "No blocked dependencies found"
                    : "No dependencies"
                }
              />
              {/* Hide dependency helper texts in VIEW mode */}
              {!isView && depsError && values.projectId && values.item ? (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  No blocked dependencies were found for this activity.
                </Typography>
              ) : !isView && noDeps ? (
                <Typography level="body-xs" sx={{ mt: 0.5 }}>
                  No dependencies
                </Typography>
              ) : null}
            </FormControl>
          </Box>
        </Box>

        <Divider />
        {/* Footer actions */}
        <Box sx={{ display: "flex", gap: 1, p: 1.5, justifyContent: "flex-end" }}>
          {!isView && (
            <>
              <Button variant="outlined" size="sm" onClick={resetAll}>
                Reset
              </Button>
              <Button
                variant="solid"
                size="sm"
                disabled={!values.projectId || !values.item}
                onClick={() => {
                  const payload = buildApprovalPayload();
                  if (payload) onCreate?.(payload);
                }}
              >
                Create
              </Button>
            </>
          )}
          {isView && (
            <Button variant="solid" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </Box>
      </Sheet>
    </Modal>
  );
}

function MyRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode from URL: "post" | "view" | null
  const mode = (searchParams.get("mode") || "").toLowerCase();
  const approvalId = searchParams.get("approval_id") || null;

  // Drive modal open/close purely from search params
  const openAdd = mode === "post" || mode === "view";

  // Create approval mutation
  const [createApproval, { isLoading: creating }] = useCreateApprovalMutation();

  // Filters (unchanged)
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
    { key: "createdAt", label: "Filter by Created Date", type: "daterange" },
  ];

  // Helper to set/merge search params
  const mergeSearchParams = (entries) => {
    setSearchParams((prev) => {
      const merged = Object.fromEntries(prev.entries());
      return { ...merged, ...entries };
    });
  };

  // Open panel in Post mode
  const openPostPanel = () => {
    mergeSearchParams({ mode: "post" });
  };

  // Close panel: clear mode & approval_id
  const closePanel = () => {
    setSearchParams((prev) => {
      const merged = Object.fromEntries(prev.entries());
      delete merged.mode;
      delete merged.approval_id;
      return { ...merged };
    });
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
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
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
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
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              My Requests
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/my_approvals`)}
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
              My Approvals
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="My Requests"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Box display="flex" gap={1} alignItems="center">
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
                onClick={openPostPanel}
              >
                {creating ? "Creating…" : "New Request"}
              </Button>
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
                      ...(values.status && { status: String(values.status) }),
                    };
                    if (values.matcher) {
                      next.matchMode = values.matcher === "OR" ? "any" : "all";
                    }
                    if (values.createdAt?.from) next.from = String(values.createdAt.from);
                    if (values.createdAt?.to) next.to = String(values.createdAt.to);
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
          }
        ></SubHeader>

        <Box
          component="main"
          className="MainContent"
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, mt: "108px", p: "16px", px: "24px" }}
        >
          <My_Requests />
        </Box>

        {/* Slide-over panel controlled by URL search params */}
        <NewRequestPanel
          open={openAdd}
          mode={mode || "post"}
          approvalId={approvalId}
          onOpenChange={(next) => {
            if (!next) {
              closePanel();
            } else {
              // ensure mode present if opened programmatically
              if (!mode) {
                const params = new URLSearchParams(location.search);
                params.set("mode", "post");
                setSearchParams(params);
              }
            }
          }}
          onCreate={async (approvalPayload) => {
            try {
              await createApproval(approvalPayload).unwrap();
              closePanel();
              navigate("/my_approvals");
            } catch (e) {
              console.error("Failed to create approval:", e);
            }
          }}
        />
      </Box>
    </CssVarsProvider>
  );
}
export default MyRequest;
