// src/pages/Approvals/MyApproval.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, useTheme } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
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
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import CircularProgress from "@mui/joy/CircularProgress";

// ⤵️ hooks from your RTK slice
import {
  useGetProjectDropdownQuery,
  useGetRejectedOrNotAllowedDependenciesQuery,
  useCreateApprovalMutation, // <-- NEW: post approval
} from "../../redux/projectsSlice";

// ⤵️ react-select for searchable dropdowns
import SelectRS from "react-select";

/* ---------- Slide-over row style ---------- */
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
  const { data: projResp, isFetching: loadingProjects } = useGetProjectDropdownQuery();

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
    // must match your backend token for Engineering
    module: "ModuleTemplates",
    item: "", // will hold selected dependency's model_id (string)
  });

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const resetAll = () =>
    setValues({
      projectId: "",
      projectName: "",
      module: "ModuleTemplates",
      item: "",
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
    placeholder: (base) => ({ ...base, color: theme.vars.palette.text.tertiary }),
    singleValue: (base) => ({ ...base, color: theme.vars.palette.text.primary }),
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

  /* ========== fetch blocked dependencies by projectId ========== */
  const {
    data: depsResp,
    isFetching: loadingDeps,
    isUninitialized: depsUninit,
  } = useGetRejectedOrNotAllowedDependenciesQuery(values.projectId, {
    skip: !values.projectId || !open,
  });

  // Clear item when project or module changes
  useEffect(() => {
    setField("item", "");
  }, [values.projectId, values.module]);

  // Build Item options from deps, filtered by module, and KEEP meta:
  // - Engineering (ModuleTemplates) -> model is moduleTemplate(s)
  // - SCM (scm) -> model is MaterialCategory
  const itemOptions = useMemo(() => {
    const acts = depsResp?.activities || [];
    const desiredModels =
      values.module === "ModuleTemplates"
        ? new Set(["moduletemplate", "moduletemplates"])
        : new Set(["materialcategory"]);

    const seen = new Set(); // dedupe by model+model_id
    const out = [];

    for (const a of acts) {
      for (const d of a?.dependency || []) {
        const m = String(d?.model || "").toLowerCase();
        if (!desiredModels.has(m)) continue;

        const name =
          d?.ref_name ||
          String(d?.model_id || "") ||
          "Unnamed";

        const modelId = String(d?.model_id || "");
        const depId = String(d?._id || ""); // subdoc _id (if present)
        const actId = String(a?.activity_id || "");

        const key = `${m}:${modelId}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
          value: modelId,         // we store the referenced doc id here
          label: name,            // shown to the user
          meta: {
            model: d?.model,      // original model string
            dependency_id: depId, // may be empty if not projected by backend
            activity_id: actId,
            ref_name: name,
          },
        });
      }
    }
    return out;
  }, [depsResp, values.module]);

  const itemLoading = !!values.projectId && !depsUninit && loadingDeps;
  const selectedItemOption =
    itemOptions.find((o) => o.value === values.item) || null;

  // Compose approval payload from current selections
  const buildApprovalPayload = () => {
    if (!values.projectId || !selectedItemOption) return null;

    const model_name =
      values.module === "ModuleTemplates" ? "moduleTemplates" : "MaterialCategory";

    return {
      model_name,
      model_id: selectedItemOption.value,
      activity_id: selectedItemOption?.meta?.activity_id || undefined,
      dependency_id: selectedItemOption?.meta?.dependency_id || undefined,
      // approvers: [...]  // optional if you want to pre-seed
      // you do NOT send approval_code/created_by; backend sets those
    };
  };

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
          {/* Project Id (react-select, searchable) */}
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
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                styles={rsStyles}
                filterOption={filterOption}
                menuPlacement="auto"
              />
            </FormControl>
          </Box>

          {/* Project Name auto-filled (read-only) */}
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

          {/* Module (Joy Select) */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Module</FormLabel>
              <Select
                size="sm"
                value={values.module}
                onChange={(_, v) => setField("module", v || "")}
              >
                {/* Value is the backend token; label is what user sees */}
                <Option value="ModuleTemplates">Engineering</Option>
                <Option value="scm">SCM</Option>
              </Select>
            </FormControl>
          </Box>

          {/* Item (react-select) — populated by getRejectedOrNotAllowedDependencies */}
          <Box sx={rowSx}>
            <FormControl size="sm">
              <FormLabel>Item</FormLabel>
              <SelectRS
                options={itemOptions}
                value={selectedItemOption}
                isLoading={itemLoading}
                isClearable
                isSearchable
                placeholder={
                  !values.projectId
                    ? "Select a project first…"
                    : values.module === "ModuleTemplates"
                    ? "Search blocked template…"
                    : "Search blocked material category…"
                }
                onChange={(opt) => {
                  const o = opt || null;
                  setField("item", o?.value || ""); // store the model_id
                }}
                isDisabled={!values.projectId || itemLoading || itemOptions.length === 0}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                styles={rsStyles}
                // default filtering works on label/value; you can reuse filterOption if you want
                menuPlacement="auto"
                noOptionsMessage={() =>
                  !values.projectId ? "Select a project first" : "No blocked items found"
                }
              />
            </FormControl>
          </Box>
        </Box>

        <Divider />
        {/* Footer actions */}
        <Box sx={{ display: "flex", gap: 1, p: 1.5, justifyContent: "flex-end" }}>
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
          title="My Approvals"
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
              {creating ? "Creating…" : "New Request"}
            </Button>
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

        {/* Slide-over panel for New Request */}
        <NewRequestPanel
          open={openAdd}
          onOpenChange={setOpenAdd}
          onCreate={async (approvalPayload) => {
            try {
              await createApproval(approvalPayload).unwrap();
              setOpenAdd(false);
              // Navigate wherever makes sense after creating an approval:
              // - to approvals list
              // - or stay and refresh
              navigate("/my_approvals");
            } catch (e) {
              // handle error UI as you like
              console.error("Failed to create approval:", e);
            }
          }}
        />
      </Box>
    </CssVarsProvider>
  );
}

export default MyApproval;
