import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Textarea,
  Typography,
  RadioGroup,
  Radio,
  Checkbox,
} from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectRS from "react-select";

import {
  useLazyGetProjectSearchDropdownQuery,
  useLazyGetActivitiesByNameQuery,
  useLazyGetAllModulesQuery, // modules API hook from your slice
  useLazyNameSearchActivityByProjectIdQuery,
  useLazyNamesearchMaterialCategoriesQuery, // project-scoped activities
} from "../../redux/projectsSlice";
import SearchPickerModal from "../../component/SearchPickerModal";

export default function AddActivityModal({
  open,
  onClose,
  onCreate,
  isSubmitting = false,
}) {
  const [mode, setMode] = useState("new"); // 'new' | 'existing'
  const [scope, setScope] = useState("project"); // 'project' | 'global'

  const [form, setForm] = useState({
    projectId: "",
    projectCode: "",
    projectName: "",
    activityName: "",
    activityId: "",
    type: "frontend",
    description: "",
    dependencies: {
      engineeringEnabled: false,
      engineeringModules: [], // [{ value, label, raw }]
      scmEnabled: false,
      scmItems: [], // [{ value, label, raw }]
    },
  });

  const [touched, setTouched] = useState({});
  const [openProjectPicker, setOpenProjectPicker] = useState(false);
  const [openActivityPicker, setOpenActivityPicker] = useState(false);
  const [openModulePicker, setOpenModulePicker] = useState(false);
  const [openScmPicker, setOpenScmPicker] = useState(false);
  const [scmQuickOptions, setScmQuickOptions] = useState([]);

  const RS_MORE = { label: "Search more…", value: "__more__" };

  /* ---------------- Helpers ---------------- */
  const uniqBy = (arr, keyFn) => {
    const seen = new Set();
    return arr.filter((x) => {
      const k = keyFn(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // Split dependencies from an activity into Engineering (moduleTemplate*) and SCM (MaterialCategory)
  const extractDepsByModel = (activityOrOpt) => {
    const deps = Array.isArray(activityOrOpt?.dependency)
      ? activityOrOpt.dependency
      : [];

    const toOption = (d) => {
      const isObj = d?.model_id && typeof d.model_id === "object";
      const id = isObj ? d.model_id._id : d.model_id;
      const label =
        d?.model_name ||
        (isObj && (d.model_id.name || d.model_id.title)) ||
        "Unnamed";
      const raw = isObj
        ? { ...d.model_id, model_name: d?.model_name }
        : {
            _id: id,
            name: d?.model_name || "Unnamed",
            model_name: d?.model_name,
          };
      return { value: String(id), label: String(label), raw };
    };

    const engineering = [];
    const scm = [];

    deps.forEach((d) => {
      const model = String(d?.model || "").toLowerCase();
      if (
        model === "moduletemplate" ||
        model === "moduletemplates" ||
        model.includes("module")
      ) {
        engineering.push(toOption(d));
      } else if (model === "materialcategory") {
        scm.push(toOption(d));
      }
    });

    return {
      engineering: uniqBy(engineering, (m) => m.value),
      scm: uniqBy(scm, (m) => m.value),
    };
  };

  /* ---------------- Project quick list (max 7) ---------------- */
  const [quickOptions, setQuickOptions] = useState([]);
  const [fetchProjects, { isFetching }] =
    useLazyGetProjectSearchDropdownQuery();

  const [fetchMaterialCats, { isFetching: isFetchingScm }] =
    useLazyNamesearchMaterialCategoriesQuery();
  const loadQuickProjects = async () => {
    try {
      const res = await fetchProjects({
        search: "",
        page: 1,
        limit: 7,
      }).unwrap();
      const arr = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const limited = arr.slice(0, 7);
      setQuickOptions(
        limited.map((p) => ({
          _id: p._id || p.id,
          code: p.code || p.project_id || p.p_id || "",
          name: p.name || p.project_name || "",
        }))
      );
    } catch {
      setQuickOptions([]);
    }
  };
  useEffect(() => {
    if (open) loadQuickProjects();
  }, [open]); // eslint-disable-line

  const loadScmQuick = async (q = "") => {
    try {
      const res = await fetchMaterialCats({
        search: "",
        page: 1,
        limit: 7,
        pr: scope === "project",
        project_id: scope === "project" ? form.projectId : undefined,
      }).unwrap();

      const list = Array.isArray(res?.data) ? res.data : [];
      setScmQuickOptions(
        list.slice(0, 7).map((m) => ({
          value: String(m._id),
          label: String(m.name || "Unnamed"),
          raw: m,
        }))
      );
    } catch {
      setScmQuickOptions([]);
    }
  };

  // refresh quick SCM if modal opens or deps toggled on
  useEffect(() => {
    if (open && form.dependencies.scmEnabled) loadScmQuick();
  }, [open, form.dependencies.scmEnabled, scope, form.projectId]); // eslint-disable-line

  const rsOptions = useMemo(
    () => [
      ...quickOptions.map((p) => ({
        label: p.code,
        value: p._id,
        name: p.name,
      })),
      RS_MORE,
    ],
    [quickOptions]
  );
  const rsValue = form.projectId
    ? {
        value: form.projectId,
        label: form.projectCode || "",
        name: form.projectName,
      }
    : null;

  const scmRsOptions = useMemo(
    () => [...scmQuickOptions, RS_MORE],
    [scmQuickOptions]
  );

  /* ---------------- Activities quick list (max 7) ---------------- */
  const [fetchActivitiesGlobal, { isFetching: isFetchingActsGlobal }] =
    useLazyGetActivitiesByNameQuery();
  const [fetchActivitiesByProject, { isFetching: isFetchingActsByProj }] =
    useLazyNameSearchActivityByProjectIdQuery();

  const [actQuickOptions, setActQuickOptions] = useState([]);
  const actSearchRef = useRef("");

  const mapActivitiesToOptions = (list) =>
    (list || []).slice(0, 7).map((a) => ({
      value: a._id,
      label: a.name,
      name: a.name,
      description: a.description || "",
      type: a.type || "",
      dependency: a.dependency || [],
    }));

  const loadActivitiesQuick = async () => {
    try {
      if (mode !== "existing") {
        setActQuickOptions([]);
        return;
      }
      if (scope === "project" && form.projectId) {
        const { activities } = await fetchActivitiesByProject({
          projectId: form.projectId,
          page: 1,
          limit: 7,
          search: actSearchRef.current || "",
        }).unwrap();
        setActQuickOptions(mapActivitiesToOptions(activities));
      } else {
        const { items } = await fetchActivitiesGlobal({
          search: actSearchRef.current || "",
          page: 1,
          limit: 7,
        }).unwrap();
        setActQuickOptions(mapActivitiesToOptions(items));
      }
    } catch {
      setActQuickOptions([]);
    }
  };

  useEffect(() => {
    if (open && mode === "existing") loadActivitiesQuick();
  }, [open, mode]); // eslint-disable-line

  useEffect(() => {
    if (mode === "existing" && scope === "project") {
      loadActivitiesQuick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.projectId, scope, mode]);

  const actRsOptions = useMemo(
    () => [...actQuickOptions, RS_MORE],
    [actQuickOptions]
  );
  const actRsValue = form.activityName
    ? { value: form.activityName, label: form.activityName }
    : null;

  /* ---------------- Project-scoped modules from activities (Engineering only) ---------------- */
  const [projectModuleOptions, setProjectModuleOptions] = useState([]);

  useEffect(() => {
    const loadProjectModules = async () => {
      try {
        if (
          scope !== "project" ||
          !form.projectId ||
          !form.dependencies.engineeringEnabled
        ) {
          setProjectModuleOptions([]);
          return;
        }
        // Aggregate modules across many activities in the selected project
        const { activities } = await fetchActivitiesByProject({
          projectId: form.projectId,
          page: 1,
          limit: 100,
          search: "",
        }).unwrap();

        const all = (activities || [])
          .map((a) => extractDepsByModel(a).engineering)
          .flat();
        setProjectModuleOptions(uniqBy(all, (m) => m.value));
      } catch {
        setProjectModuleOptions([]);
      }
    };
    loadProjectModules();
  }, [
    scope,
    form.projectId,
    form.dependencies.engineeringEnabled,
    fetchActivitiesByProject,
  ]);

  /* ---------------- Modules quick list (max 7) ---------------- */
  const [fetchModules, { isFetching: isFetchingModules }] =
    useLazyGetAllModulesQuery();
  const [moduleQuickOptions, setModuleQuickOptions] = useState([]);

  const loadModulesQuick = async (q = "") => {
    try {
      // Always fetch from API (independent of project scope)
      const list = await fetchModules({
        search: q,
        page: 1,
        limit: 7,
      }).unwrap();
      const rows = Array.isArray(list) ? list : [];
      setModuleQuickOptions(
        rows.slice(0, 7).map((m) => ({
          value: String(m._id),
          label: String(m.name || "Unnamed"),
          raw: m,
        }))
      );
    } catch {
      setModuleQuickOptions([]);
    }
  };
  useEffect(() => {
    if (open && form.dependencies.engineeringEnabled) loadModulesQuick();
  }, [
    open,
    form.dependencies.engineeringEnabled,
    scope,
    form.projectId,
    projectModuleOptions.length,
  ]); // eslint-disable-line

  const moduleRsOptions = useMemo(
    () => [...moduleQuickOptions, RS_MORE],
    [moduleQuickOptions]
  );

  /* ---------------- Validation ---------------- */
  const needProject = scope === "project";
  const errors =
    mode === "new"
      ? {
          projectId: needProject ? !form.projectId : false,
          projectName: needProject ? !form.projectName.trim() : false,
          activityName: !form.activityName.trim(),
          type: !form.type.trim(),
          description: !form.description.trim(),
          dependencies:
            form.dependencies.engineeringEnabled &&
            (!form.dependencies.engineeringModules ||
              form.dependencies.engineeringModules.length === 0),
        }
      : {
          activityName: !form.activityName.trim(),
          type: !form.type.trim(),
          description: !form.description.trim(),
          dependencies:
            form.dependencies.engineeringEnabled &&
            (!form.dependencies.engineeringModules ||
              form.dependencies.engineeringModules.length === 0),
          ...(needProject
            ? {
                projectId: !form.projectId,
                projectName: !form.projectName.trim(),
              }
            : {}),
        };
  const hasErrors = Object.values(errors).some(Boolean);

  /* ---------------- Submit ---------------- */
  const handleSubmit = (e) => {
    e?.preventDefault?.();

    setTouched((prev) =>
      mode === "new"
        ? {
            ...prev,
            projectId: true,
            projectName: true,
            activityName: true,
            type: true,
            description: true,
            dependencies: true,
          }
        : {
            ...prev,
            activityName: true,
            type: true,
            description: true,
            dependencies: true,
            ...(needProject ? { projectId: true, projectName: true } : {}),
          }
    );
    if (hasErrors) return;

    // Build dependencies payload
    const dependencies = [];
    if (
      form.dependencies.engineeringEnabled &&
      form.dependencies.engineeringModules?.length
    ) {
      form.dependencies.engineeringModules.forEach((opt) => {
        dependencies.push({ model: "moduleTemplate", model_id: opt.value });
      });
    }
    if (form.dependencies.scmEnabled && form.dependencies.scmItems?.length) {
      form.dependencies.scmItems.forEach((opt) => {
        dependencies.push({ model: "MaterialCategory", model_id: opt.value });
      });
    }

    const payload = {
  name: form.activityName.trim(),
  description: form.description.trim(),
  type: form.type.toLowerCase(),
  ...(scope === "project" && form.projectId
    ? { project_id: form.projectId, project_name: form.projectName }
    : {}),
  ...(dependencies.length ? { dependencies } : {}),   // already built above
  activityId: form.activityId || "",                  // <-- add this
  __mode: mode,
  __scope: scope,
};

    onCreate?.(payload);
  };

  const labelRequiredSx = {
    "&::after": { content: '" *"', color: "danger.500", fontWeight: 700 },
  };

  /* ---------------- Data providers for SearchPickerModal ---------------- */
  const fetchPage = async ({ page, search, pageSize }) => {
    const res = await fetchProjects({
      search: search || "",
      page: page || 1,
      limit: pageSize || 10,
    }).unwrap();
    const arr = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : [];
    const rows = arr.map((p) => ({
      _id: p._id || p.id,
      code: p.code || p.project_id || p.p_id || "",
      name: p.name || p.project_name || "",
    }));
    const total = res?.total ?? res?.pagination?.total ?? rows.length;
    return { rows, total };
  };
  const fetchScmPage = async ({ page, search, pageSize }) => {
    try {
      const res = await fetchMaterialCats({
        search: search || "",
        page: page || 1,
        limit: pageSize || 10,
        pr: scope === "project",
        project_id: scope === "project" ? form.projectId : undefined,
      }).unwrap();

      const rows = (res?.data || []).map((m) => ({
        _id: m._id,
        name: m.name || "Unnamed",
        description: m.description || "",
      }));

      const total =
        res?.pagination?.total != null ? res.pagination.total : rows.length;

      return { rows, total };
    } catch (e) {
      // Don’t let the modal crash on network/validation errors
      console.error("SCM fetchPage failed:", e);
      return { rows: [], total: 0 };
    }
  };

  const fetchActivityPage = async ({ page, search, pageSize }) => {
    if (scope === "project" && form.projectId) {
      const { activities, total } = await fetchActivitiesByProject({
        projectId: form.projectId,
        page: page || 1,
        limit: pageSize || 50,
        search: search || "",
      }).unwrap();

      const rows = (activities || []).map((a) => ({
        _id: a._id,
        name: a.name || "",
        type: a.type || "",
        description: a.description || "",
        dependency: a.dependency || [],
      }));
      return { rows, total: total ?? rows.length };
    }

    const { items, pagination } = await fetchActivitiesGlobal({
      search: search || "",
      page: page || 1,
      limit: pageSize || 50,
    }).unwrap();

    const rows = (items || []).map((a) => ({
      _id: a._id,
      name: a.name || "",
      type: a.type || "",
      description: a.description || "",
      dependency: a.dependency || [],
    }));
    const total = pagination?.total ?? rows.length;
    return { rows, total };
  };

  const fetchModulePage = async ({ page, search, pageSize }) => {
    try {
      // Always fetch from API (independent of project scope), same pattern as SCM
      const list = await fetchModules({
        search: search || "",
        page: page || 1,
        limit: pageSize || 10,
      }).unwrap();
      const rows = (Array.isArray(list) ? list : []).map((m) => ({
        _id: m._id,
        name: m.name || "Unnamed",

        description: m.description || "",
      }));
      return { rows, total: rows.length };
    } catch (e) {
      console.error("Modules fetchPage failed:", e);
      return { rows: [], total: 0 };
    }
  };
  /* ---------------- Columns for pickers ---------------- */
  const projectPickerColumns = [
    { key: "code", label: "Project Id", width: 220 },
    { key: "name", label: "Project Name" },
  ];
  const activityPickerColumns = [
    { key: "name", label: "Activity Name", width: 250 },
    { key: "type", label: "Type", width: 140 },
    { key: "description", label: "Description" },
  ];
  const modulePickerColumns = [
    { key: "name", label: "Module Name", width: 260 },

    { key: "description", label: "Description" },
  ];

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          aria-labelledby="add-activity-title"
          variant="outlined"
          sx={{
            width: 720,
            maxWidth: "95vw",
            borderRadius: "lg",
            boxShadow: "lg",
            p: 0,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              bgcolor: "background.body",
              zIndex: 1,
            }}
          >
            <DialogTitle id="add-activity-title" sx={{ p: 0 }}>
              Add Activity
            </DialogTitle>
            <ModalClose
              variant="plain"
              sx={{ borderRadius: "sm" }}
              slots={{ root: Button }}
              slotProps={{
                root: { size: "sm", variant: "plain", color: "neutral" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </ModalClose>
          </Box>

          {/* Toggles: Mode + Scope */}
          <Box
            sx={{
              px: 2,
              pt: 1,
              pb: 0,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <RadioGroup
              orientation="horizontal"
              value={mode}
              onChange={(e) => {
                const next = e.target.value;
                setMode(next);
                if (next === "existing") loadActivitiesQuick();
              }}
              sx={{ gap: 1 }}
              disabled={isSubmitting}
            >
              <Radio value="existing" size="sm" label="Existing Activity" />
              <Radio value="new" size="sm" label="New Activity" />
            </RadioGroup>

            <RadioGroup
              orientation="horizontal"
              value={scope}
              onChange={(e) => {
                const next = e.target.value;
                setScope(next);
                if (next === "global") {
                  setTouched((t) => ({
                    ...t,
                    projectId: false,
                    projectName: false,
                  }));
                }
                setTimeout(loadActivitiesQuick, 0);
              }}
              sx={{ gap: 1, ml: { xs: 0, md: "auto" } }}
              disabled={isSubmitting}
            >
              <Radio value="project" size="sm" label="Individual Project" />
              <Radio value="global" size="sm" label="Global" />
            </RadioGroup>
          </Box>

          {/* Form */}
          <Sheet
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gap: 1.25,
              px: 2,
              pb: 2,
              pt: 1,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {/* Project fields when scope === project */}
            {scope === "project" && (
              <>
                <FormControl
                  size="sm"
                  error={touched.projectId && !!errors.projectId}
                  sx={{
                    overflow: "visible",
                    gridColumn: { xs: "1 / -1", md: "1 / 2" },
                  }}
                >
                  <FormLabel sx={labelRequiredSx}>Project Id</FormLabel>
                  <SelectRS
                    placeholder="Search or pick project id"
                    value={rsValue}
                    options={rsOptions}
                    isClearable
                    isSearchable
                    onMenuOpen={() => loadQuickProjects()}
                    onChange={(opt) => {
                      const resetActivity = {
                        activityName: "",
                        type: "frontend",
                        description: "",
                        dependencies: {
                          ...form.dependencies,
                          engineeringEnabled: false,
                          engineeringModules: [],
                          scmEnabled: false,
                          scmItems: [],
                        },
                      };

                      if (!opt) {
                        setForm((p) => ({
                          ...p,
                          projectId: "",
                          projectCode: "",
                          activityId: "",           
                          activityName: "",
                          projectName: "",
                          ...resetActivity,
                        }));
                        setActQuickOptions([]);
                        return;
                      }
                      if (opt.value === "__more__") {
                        setOpenProjectPicker(true);
                        return;
                      }
                      setForm((p) => ({
                        ...p,
                        projectId: opt.value,
                        projectCode: opt.label,
                        projectName: opt.name || p.projectName,
                        ...resetActivity,
                      }));
                      setTouched((t) => ({
                        ...t,
                        projectId: true,
                        projectName: true,
                      }));
                      setTimeout(loadActivitiesQuick, 0);
                    }}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    isLoading={isFetching}
                  />
                  {touched.projectId && !!errors.projectId && (
                    <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                      Project Id is required.
                    </Typography>
                  )}
                </FormControl>

                <FormControl
                  size="sm"
                  error={touched.projectName && !!errors.projectName}
                >
                  <FormLabel sx={labelRequiredSx}>Project Name</FormLabel>
                  <Input
                    size="sm"
                    readOnly
                    value={form.projectName}
                    placeholder="Auto-filled after picking Project Id"
                    onBlur={() =>
                      setTouched((t) => ({ ...t, projectName: true }))
                    }
                  />
                  {touched.projectName && !!errors.projectName && (
                    <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                      Project Name is required.
                    </Typography>
                  )}
                </FormControl>
              </>
            )}

            {/* Activity Name */}
            <FormControl
              size="sm"
              error={touched.activityName && !!errors.activityName}
            >
              <FormLabel sx={labelRequiredSx}>Activity Name</FormLabel>

              {mode === "existing" ? (
                <SelectRS
                  placeholder={
                    scope === "project" && !form.projectId
                      ? "Pick a project first"
                      : "Search or pick activity"
                  }
                  value={actRsValue}
                  options={actRsOptions}
                  isSearchable
                  isClearable
                  isDisabled={scope === "project" && !form.projectId}
                  onMenuOpen={() => loadActivitiesQuick()}
                  onInputChange={(input, { action }) => {
                    if (action === "input-change")
                      actSearchRef.current = input || "";
                    return input;
                  }}
                  onChange={(opt) => {
                    if (!opt) {
                      setForm((p) => ({
                        ...p,
                        activityId: opt.value, 
                        activityName: "",
                        type: "frontend",
                        description: "",
                        dependencies: {
                          ...p.dependencies,
                          engineeringEnabled: false,
                          engineeringModules: [],
                          scmEnabled: false,
                          scmItems: [],
                        },
                      }));
                      return;
                    }
                    if (opt.value === "__more__") {
                      setOpenActivityPicker(true);
                      return;
                    }

                    const { engineering: engOpts, scm: scmOpts } = extractDepsByModel(opt);
                   setForm((p) => ({
  ...p,
  activityId: opt.value || "",      // <-- save the chosen activity _id
  activityName: opt.name || opt.label || "",
  type: opt.type || "frontend",
  description: opt.description || "",
  dependencies: {
    ...p.dependencies,
    engineeringEnabled: engOpts.length > 0,
    engineeringModules: engOpts,
    scmEnabled: scmOpts.length > 0,
    scmItems: scmOpts,
  },
}));
                    setTouched((t) => ({
                      ...t,
                      activityName: true,
                      type: true,
                      description: true,
                      dependencies: true,
                    }));
                  }}
                  isLoading={isFetchingActsGlobal || isFetchingActsByProj}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                    control: (base) => ({ ...base, minHeight: 36 }),
                  }}
                />
              ) : (
                <Input
                  size="sm"
                  placeholder="Enter activity name"
                  value={form.activityName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, activityName: e.target.value }))
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, activityName: true }))
                  }
                />
              )}

              {touched.activityName && !!errors.activityName && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Activity Name is required.
                </Typography>
              )}
            </FormControl>

            {/* Type */}
            <FormControl size="sm" error={touched.type && !!errors.type}>
              <FormLabel sx={labelRequiredSx}>Type</FormLabel>
              <Select
                size="sm"
                value={form.type}
                onChange={(_, v) => v && setForm((p) => ({ ...p, type: v }))}
                onBlur={() => setTouched((t) => ({ ...t, type: true }))}
              >
                <Option value="frontend">Frontend</Option>
                <Option value="backend">Backend</Option>
              </Select>
              {touched.type && !!errors.type && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Type is required.
                </Typography>
              )}
            </FormControl>

            {/* Description */}
            <FormControl
              size="sm"
              error={touched.description && !!errors.description}
              sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
            >
              <FormLabel sx={labelRequiredSx}>Description</FormLabel>
              <Textarea
                minRows={3}
                placeholder="Describe the activity"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, description: true }))}
              />
              {touched.description && !!errors.description && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Description is required.
                </Typography>
              )}
            </FormControl>

            {/* Dependencies */}
            <Box sx={{ gridColumn: "1 / -1", display: "grid", gap: 1 }}>
              <Typography level="title-sm">Dependencies</Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Checkbox
                  label="Engineering"
                  checked={form.dependencies.engineeringEnabled}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      dependencies: {
                        ...p.dependencies,
                        engineeringEnabled: e.target.checked,
                      },
                    }))
                  }
                  disabled={isSubmitting}
                />
                <Checkbox
                  label="SCM"
                  checked={form.dependencies.scmEnabled}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      dependencies: {
                        ...p.dependencies,
                        scmEnabled: e.target.checked,
                      },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </Box>

              {/* Engineering modules */}
              {form.dependencies.engineeringEnabled && (
                <FormControl
                  size="sm"
                  error={touched.dependencies && !!errors.dependencies}
                >
                  <FormLabel sx={labelRequiredSx}>
                    Model Entry (Modules)
                  </FormLabel>
                  <SelectRS
                    placeholder={
                      scope === "project" && !form.projectId
                        ? "Pick a project first"
                        : projectModuleOptions.length > 0
                        ? "Pick modules used in this project's activities"
                        : "Pick modules"
                    }
                    value={form.dependencies.engineeringModules}
                    options={moduleRsOptions}
                    isMulti
                    isSearchable
                    closeMenuOnSelect={false}
                    isDisabled={scope === "project" && !form.projectId}
                    onMenuOpen={() => loadModulesQuick("")}
                    onInputChange={(input, meta) => {
                      if (meta.action === "input-change")
                        loadModulesQuick(input || "");
                      return input;
                    }}
                    onChange={(opts) => {
                      const arr = Array.isArray(opts) ? opts : [];
                      const hasMore = arr.some((o) => o?.value === "__more__");
                      if (hasMore) {
                        setOpenModulePicker(true);
                        const filtered = arr.filter(
                          (o) => o.value !== "__more__"
                        );
                        setForm((p) => ({
                          ...p,
                          dependencies: {
                            ...p.dependencies,
                            engineeringModules: filtered,
                          },
                        }));
                        return;
                      }
                      setForm((p) => ({
                        ...p,
                        dependencies: {
                          ...p.dependencies,
                          engineeringModules: arr,
                        },
                      }));
                    }}
                    onBlur={() =>
                      setTouched((t) => ({ ...t, dependencies: true }))
                    }
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    isLoading={isFetchingModules || isSubmitting}
                  />
                  {touched.dependencies && !!errors.dependencies && (
                    <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                      Please pick at least one module.
                    </Typography>
                  )}
                </FormControl>
              )}

              {/* SCM (Material Categories) */}
              {form.dependencies.scmEnabled && (
                <FormControl size="sm">
                  <FormLabel sx={labelRequiredSx}>
                    SCM (Material Categories)
                  </FormLabel>
                  <SelectRS
                    placeholder={
                      form.dependencies.scmItems?.length
                        ? "Pick SCM categories"
                        : "Search or pick SCM category"
                    }
                    value={form.dependencies.scmItems}
                    options={[...scmQuickOptions, RS_MORE]}
                    isMulti
                    isSearchable
                    closeMenuOnSelect={false}
                    // ✅ Allow independent use in global scope. Only block in project scope without projectId
                    isDisabled={scope === "project" && !form.projectId}
                    onMenuOpen={() => loadScmQuick("")} // ✅ fetch initial page
                    onInputChange={(input, meta) => {
                      // ✅ remote search
                      if (meta.action === "input-change")
                        loadScmQuick(input || "");
                      return input;
                    }}
                    onChange={(opts) => {
                      const arr = Array.isArray(opts) ? opts : [];
                      const hasMore = arr.some((o) => o?.value === "__more__");
                      if (hasMore) {
                        setOpenScmPicker(true);
                        const filtered = arr.filter(
                          (o) => o.value !== "__more__"
                        );
                        setForm((p) => ({
                          ...p,
                          dependencies: {
                            ...p.dependencies,
                            scmItems: filtered,
                            scmEnabled:
                              filtered.length > 0 || p.dependencies.scmEnabled,
                          },
                        }));
                        return;
                      }
                      setForm((p) => ({
                        ...p,
                        dependencies: {
                          ...p.dependencies,
                          scmItems: arr,
                          scmEnabled:
                            arr.length > 0 || p.dependencies.scmEnabled,
                        },
                      }));
                    }}
                    onBlur={() =>
                      setTouched((t) => ({ ...t, dependencies: true }))
                    }
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    isLoading={isFetchingScm || isSubmitting}
                  />
                </FormControl>
              )}
            </Box>

            {/* Actions */}
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                mt: 0.5,
              }}
            >
              <Button
                variant="outlined"
                color="neutral"
                onClick={onClose}
                size="sm"
                startDecorator={<CloseRoundedIcon />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                startDecorator={<SaveRoundedIcon />}
                disabled={hasErrors || isSubmitting}
                loading={isSubmitting}
              >
                Save
              </Button>
            </Box>
          </Sheet>
        </ModalDialog>
      </Modal>

      {/* Project picker */}
      <SearchPickerModal
        open={openProjectPicker}
        onClose={() => setOpenProjectPicker(false)}
        title="Select Project"
        columns={projectPickerColumns}
        rowKey="_id"
        pageSize={10}
        searchKey="code or name"
        fetchPage={fetchPage}
        onPick={(row) => {
          // reset activity & dependencies on pick
          setForm((prev) => ({
            ...prev,
            projectId: row?._id || "",
            projectCode: row?.code || "",
            projectName: row?.name || "",
            activityName: "",
            type: "frontend",
            description: "",
            dependencies: {
              ...prev.dependencies,
              engineeringEnabled: false,
              engineeringModules: [],
              scmEnabled: false,
              scmItems: [],
            },
          }));
          setTouched((t) => ({ ...t, projectId: true, projectName: true }));
          setOpenProjectPicker(false);
          setTimeout(loadActivitiesQuick, 0);
        }}
      />

      {/* Activity picker */}
      <SearchPickerModal
        open={openActivityPicker}
        onClose={() => setOpenActivityPicker(false)}
        title="Select Activity"
        columns={activityPickerColumns}
        rowKey="_id"
        pageSize={10}
        searchKey="name or description"
        fetchPage={fetchActivityPage}
        onPick={(row) => {
          const { engineering: engOpts, scm: scmOpts } =
            extractDepsByModel(row);
          setForm((prev) => ({
            ...prev,
            activityId: row?._id || "",
            activityName: row?.name || "",
            type: row?.type || "frontend",
            description: row?.description || "",
            dependencies: {
              ...prev.dependencies,
              engineeringEnabled: engOpts.length > 0,
              engineeringModules: engOpts,
              scmEnabled: scmOpts.length > 0,
              scmItems: scmOpts,
            },
          }));
          setTouched((t) => ({
            ...t,
            activityName: true,
            type: true,
            description: true,
            dependencies: true,
          }));
          setOpenActivityPicker(false);
        }}
      />

      {/* Module picker (opened by selecting “Search more…”) */}
      <SearchPickerModal
        open={openModulePicker}
        onClose={() => setOpenModulePicker(false)}
        title="Select Modules"
        columns={modulePickerColumns}
        rowKey="_id"
        pageSize={10}
        searchKey="name or category"
        fetchPage={fetchModulePage}
        onPick={(row) => {
          setForm((prev) => {
            const exists = prev.dependencies.engineeringModules.some(
              (opt) => opt.value === row?._id
            );
            const next = exists
              ? prev.dependencies.engineeringModules
              : [
                  ...prev.dependencies.engineeringModules,
                  { value: row?._id, label: row?.name || "Unnamed", raw: row },
                ];
            return {
              ...prev,
              dependencies: { ...prev.dependencies, engineeringModules: next },
            };
          });
        }}
        allowMultiple
      />

      {/* SCM picker (opened by selecting “Search more…”) */}
      <SearchPickerModal
        open={openScmPicker}
        onClose={() => setOpenScmPicker(false)}
        title="Select Material Categories"
        columns={[
          { key: "name", label: "Category Name", width: 260 },
          { key: "description", label: "Description" },
        ]}
        rowKey="_id"
        pageSize={10}
        searchKey="name or description"
        fetchPage={fetchScmPage}
        onPick={(row) => {
          setForm((prev) => {
            const exists = prev.dependencies.scmItems.some(
              (opt) => opt.value === row?._id
            );
            const next = exists
              ? prev.dependencies.scmItems
              : [
                  ...prev.dependencies.scmItems,
                  { value: row?._id, label: row?.name || "Unnamed", raw: row },
                ];
            return {
              ...prev,
              dependencies: {
                ...prev.dependencies,
                scmItems: next,
                scmEnabled: true,
              },
            };
          });
        }}
        allowMultiple
      />
    </>
  );
}
