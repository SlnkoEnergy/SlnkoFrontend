// src/pages/Approvals/MyApproval.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useTheme } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import My_Approvals from "../../component/Approvals/My_Approvals";
import { LibraryAddOutlined } from "@mui/icons-material";
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
import Filter from "../../component/Partials/Filter";

import {
  useGetProjectDropdownQuery,
  useGetProjectActivityByProjectIdQuery,
  useGetRejectedOrNotAllowedDependenciesQuery, // ⬅️ dependencies API
  useCreateApprovalMutation,
} from "../../redux/projectsSlice";

const rowSx = {
  px: 1,
  py: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
};

/* ---------- New Request Slide-over ---------- */
function NewRequestPanel({ open, onOpenChange, onCreate }) {
  const [exiting, setExiting] = useState(false);
  const theme = useTheme();

  // Projects for Project Id dropdown
  const { data: projResp, isFetching: loadingProjects } =
    useGetProjectDropdownQuery();

  // Normalize options: prefer `code` as label, send `_id` as value
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
    item: "", // activity_id
    dependency: "", // dependency model_id
  });

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const resetAll = () =>
    setValues({
      projectId: "",
      projectName: "",
      item: "",
      dependency: "",
    });

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
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
    placeholder: (base) => ({
      ...base,
      color: theme.vars.palette.text.tertiary,
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.vars.palette.text.primary,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 2000,
      background: "#fff",
      borderRadius: 10,
      boxShadow:
        "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 2000 }),
  };

  // react-select filter by id OR project name
  const filterOption = (option, rawInput) => {
    const q = (rawInput || "").toLowerCase();
    const id = (option?.label || "").toLowerCase();
    const val = (option?.value || "").toLowerCase();
    const name = (option?.data?.name || "").toLowerCase();
    return id.includes(q) || val.includes(q) || name.includes(q);
  };

  const selectedProjOption =
    projectOptions.find((o) => o.value === values.projectId) || null;

  /* ========== fetch all activities by projectId ========== */
  const {
    data: actsResp,
    isFetching: loadingActs,
    isUninitialized: actsUninit,
    isError: actsError,
    isSuccess: actsOk,
    refetch: refetchActs,
  } = useGetProjectActivityByProjectIdQuery(values.projectId, {
    skip: !values.projectId || !open,
    refetchOnMountOrArgChange: true,
  });

  // Clear activity + dependency when project changes
  useEffect(() => {
    setField("item", "");
    setField("dependency", "");
    if (open && values.projectId) refetchActs?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.projectId]);

  // Build Activity options (guard against errors/404)
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

  const activityLoading =
    !!values.projectId && !actsUninit && loadingActs;
  const selectedActivityOption =
    activityOptions.find((o) => o.value === values.item) || null;
  console.log({selectedActivityOption})
  /* ========== fetch blocked dependencies for selected project+activity ========== */
  const {
    data: depsResp,
    isFetching: loadingDeps,
    isUninitialized: depsUninit,
    isError: depsError,
    isSuccess: depsOk,
    refetch: refetchDeps,
  } = useGetRejectedOrNotAllowedDependenciesQuery(
    { projectId: values.projectId, activityId: values.item },
    {
      skip: !values.projectId || !values.item || !open,
      refetchOnMountOrArgChange: true,
    }
  );

  // Clear dependency when activity changes
  useEffect(() => {
    setField("dependency", "");
    if (open && values.projectId && values.item) refetchDeps?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.item]);

  // Build Dependency options from deps API (show model_id_name)
  const dependencyOptions = useMemo(() => {
    if (depsError || !depsOk) return [];
    const deps = Array.isArray(depsResp?.dependencies)
      ? depsResp.dependencies
      : [];
    if (deps.length === 0) return [];

    return deps.map((d) => {
      const model = String(d?.model || "Unknown");
      const mid = String(d?.model_id || "");
      const name = d?.model_id_name ? String(d.model_id_name).trim() : "";

      const label =
        name || (mid ? `${model} (${mid.slice(0, 6)}…${mid.slice(-4)})` : model);

      return {
        value: mid, // referenced doc id
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
    !!values.projectId && !!values.item && !depsUninit && loadingDeps;
  const selectedDependencyOption =
    dependencyOptions.find((o) => o.value === values.dependency) || null;
  console.log({selectedDependencyOption})
  // True when API succeeded but returned zero deps
  const noDeps =
    depsOk &&
    !depsError &&
    Array.isArray(depsResp?.dependencies) &&
    depsResp.dependencies.length === 0;

  // Compose approval payload from current selections
const buildApprovalPayload = () => {
  if (!values.projectId || !selectedActivityOption) return null;

  return {
    data: {
      model_name: "projectActivities",
      project_id: values.projectId,
      activity_id: selectedActivityOption.meta.activityIdToPost,
      ...(selectedDependencyOption?.value
        ? { dependency_id: selectedDependencyOption?.meta?.dependencyIdToPost } // uses the current dependency dropdown value
        : {}
      ),
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
          <Typography level="title-md">New Request</Typography>
          <ModalClose onClick={() => onOpenChange(false)} />
        </Box>

        {/* Fields */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {/* Project Id */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Project Id</FormLabel>
              <SelectRS
                options={projectOptions}
                value={selectedProjOption}
                isLoading={loadingProjects}
                isClearable
                isSearchable
                placeholder="Search project id…"
                onChange={(opt) => {
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

          {/* Activity */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Activity</FormLabel>
              <SelectRS
                options={activityOptions}
                value={selectedActivityOption}
                isLoading={activityLoading}
                isClearable
                isSearchable
                placeholder={activityPlaceholder}
                onChange={(opt) => {
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
              {actsError && values.projectId ? (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  No project activities were found for the selected project.
                </Typography>
              ) : null}
            </FormControl>
          </Box>

          {/* Dependencies */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Dependencies</FormLabel>
              <SelectRS
                options={dependencyOptions}
                value={selectedDependencyOption}
                isLoading={dependencyLoading}
                isClearable
                isSearchable
                placeholder={dependencyPlaceholder}
                onChange={(opt) => {
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
              {depsError && values.projectId && values.item ? (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  No blocked dependencies were found for this activity.
                </Typography>
              ) : noDeps ? (
                <Typography level="body-xs" sx={{ mt: 0.5 }}>
                  No dependencies
                </Typography>
              ) : null}
            </FormControl>
          </Box>
        </Box>

        <Divider />
        {/* Footer actions */}
        <Box
          sx={{ display: "flex", gap: 1, p: 1.5, justifyContent: "flex-end" }}
        >
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
        </Box>
      </Sheet>
    </Modal>
  );
}

function MyApproval() {
  const [openAdd, setOpenAdd] = useState(false);
  const navigate = useNavigate();

  // ⤵️ mutation to create approval
  const [createApproval, { isLoading: creating }] = useCreateApprovalMutation();
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
          title="My Approvals"
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
                onClick={() => setOpenAdd(true)}
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
                      ...(values.status && {
                        status: String(values.status),
                      }),
                    };

                    if (values.matcher) {
                      next.matchMode = values.matcher === "OR" ? "any" : "all";
                    }

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
          <My_Approvals />
        </Box>

        <NewRequestPanel
          open={openAdd}
          onOpenChange={setOpenAdd}
          onCreate={async (approvalPayload) => {
            try {
              await createApproval(approvalPayload).unwrap();
              setOpenAdd(false);
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

export default MyApproval;
