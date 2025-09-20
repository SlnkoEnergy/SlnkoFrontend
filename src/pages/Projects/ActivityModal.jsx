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
    type: "frontend",
    description: "",
    dependencies: {
      engineeringEnabled: false,
      engineeringModules: [], // [{ value: _id, label: name, raw }]
      scmEnabled: false,
    },
  });

  const [touched, setTouched] = useState({});
  const [openProjectPicker, setOpenProjectPicker] = useState(false);
  const [openActivityPicker, setOpenActivityPicker] = useState(false);
  const [openModulePicker, setOpenModulePicker] = useState(false);

  const RS_MORE = { label: "Search more…", value: "__more__" };

  /* ---------------- Project quick list (max 7) ---------------- */
  const [quickOptions, setQuickOptions] = useState([]);
  const [fetchProjects, { isFetching }] = useLazyGetProjectSearchDropdownQuery();

  const loadQuickProjects = async () => {
    try {
      const res = await fetchProjects({ search: "", page: 1, limit: 7 }).unwrap();
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
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
  useEffect(() => { if (open) loadQuickProjects(); }, [open]); // eslint-disable-line

  const rsOptions = useMemo(
    () => [
      ...quickOptions.map((p) => ({ label: p.code, value: p._id, name: p.name })),
      RS_MORE,
    ],
    [quickOptions]
  );
  const rsValue = form.projectId
    ? { value: form.projectId, label: form.projectCode || "", name: form.projectName }
    : null;

  /* ---------------- Activities quick list (max 7) ---------------- */
  const [fetchActivities, { isFetching: isFetchingActs }] = useLazyGetActivitiesByNameQuery();
  const [actQuickOptions, setActQuickOptions] = useState([]);
  const actSearchRef = useRef("");

  const loadActivitiesQuick = async () => {
    try {
      const { items } = await fetchActivities({ search: "", page: 1, limit: 7 }).unwrap();
      const limited = (items || []).slice(0, 7);
      setActQuickOptions(
        limited.map((a) => ({
          value: a._id,
          label: a.name,
          name: a.name,
          description: a.description || "",
          type: a.type || "",
        }))
      );
    } catch {
      setActQuickOptions([]);
    }
  };
  useEffect(() => { if (open && mode === "existing") loadActivitiesQuick(); }, [open, mode]); // eslint-disable-line

  const actRsOptions = useMemo(() => [...actQuickOptions, RS_MORE], [actQuickOptions]);
  const actRsValue =
    form.activityName ? { value: form.activityName, label: form.activityName } : null;

  /* ---------------- Modules quick list (max 7) ---------------- */
  const [fetchModules, { isFetching: isFetchingModules }] = useLazyGetAllModulesQuery();
  const [moduleQuickOptions, setModuleQuickOptions] = useState([]);

  const loadModulesQuick = async () => {
    try {
      const list = await fetchModules({ search: "", page: 1, limit: 7 }).unwrap();
      const limited = (Array.isArray(list) ? list : []).slice(0, 7);
      setModuleQuickOptions(
        limited.map((m) => ({
          value: m._id,
          label: m.name,
          raw: m,
        }))
      );
    } catch {
      setModuleQuickOptions([]);
    }
  };
  useEffect(() => {
    if (open && form.dependencies.engineeringEnabled) loadModulesQuick();
  }, [open, form.dependencies.engineeringEnabled]); // eslint-disable-line

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
            ? { projectId: !form.projectId, projectName: !form.projectName.trim() }
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
    if (form.dependencies.engineeringEnabled && form.dependencies.engineeringModules?.length) {
      form.dependencies.engineeringModules.forEach((opt) => {
        dependencies.push({ model: "module", model_id: opt.value });
      });
    }

    const payload = {
      name: form.activityName.trim(),
      description: form.description.trim(),
      type: form.type.toLowerCase(),
      ...(scope === "project" && form.projectId
        ? { project_id: form.projectId, project_name: form.projectName }
        : {}),
      ...(dependencies.length ? { dependencies } : {}),
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
    const res = await fetchProjects({ search: search || "", page: page || 1, limit: pageSize || 10 }).unwrap();
    const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    const rows = arr.map((p) => ({
      _id: p._id || p.id,
      code: p.code || p.project_id || p.p_id || "",
      name: p.name || p.project_name || "",
    }));
    const total = res?.total ?? res?.pagination?.total ?? rows.length;
    return { rows, total };
  };

  const fetchActivityPage = async ({ page, search, pageSize }) => {
    const { items, pagination } = await fetchActivities({
      search: search || "",
      page: page || 1,
      limit: pageSize || 10,
    }).unwrap();
    const rows = (items || []).map((a) => ({
      _id: a._id,
      name: a.name || "",
      type: a.type || "",
      description: a.description || "",
    }));
    const total = pagination?.total ?? rows.length;
    return { rows, total };
  };

  const fetchModulePage = async ({ page, search, pageSize }) => {
    const list = await fetchModules({ search: search || "", page: page || 1, limit: pageSize || 10 }).unwrap();
    const rows = (Array.isArray(list) ? list : []).map((m) => ({
      _id: m._id,
      name: m.name || "Unnamed",
      category: m.category || "",
      description: m.description || "",
    }));
    const total = rows.length; // adjust when backend paginates
    return { rows, total };
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
    { key: "category", label: "Category", width: 160 },
    { key: "description", label: "Description" },
  ];

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          aria-labelledby="add-activity-title"
          variant="outlined"
          sx={{ width: 720, maxWidth: "95vw", borderRadius: "lg", boxShadow: "lg", p: 0 }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, bgcolor: "background.body", zIndex: 1,
            }}
          >
            <DialogTitle id="add-activity-title" sx={{ p: 0 }}>
              Add Activity
            </DialogTitle>
            <ModalClose
              variant="plain"
              sx={{ borderRadius: "sm" }}
              slots={{ root: Button }}
              slotProps={{ root: { size: "sm", variant: "plain", color: "neutral" } }}
            >
              <CloseRoundedIcon fontSize="small" />
            </ModalClose>
          </Box>

          {/* Toggles: Mode + Scope */}
          <Box sx={{ px: 2, pt: 1, pb: 0, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                  setTouched((t) => ({ ...t, projectId: false, projectName: false }));
                }
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
                  sx={{ overflow: "visible", gridColumn: { xs: "1 / -1", md: "1 / 2" } }}
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
                      if (!opt) {
                        setForm((p) => ({ ...p, projectId: "", projectCode: "", projectName: "" }));
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
                      }));
                      setTouched((t) => ({ ...t, projectId: true, projectName: true }));
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

                <FormControl size="sm" error={touched.projectName && !!errors.projectName}>
                  <FormLabel sx={labelRequiredSx}>Project Name</FormLabel>
                  <Input
                    size="sm"
                    readOnly
                    value={form.projectName}
                    placeholder="Auto-filled after picking Project Id"
                    onBlur={() => setTouched((t) => ({ ...t, projectName: true }))}
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
            <FormControl size="sm" error={touched.activityName && !!errors.activityName}>
              <FormLabel sx={labelRequiredSx}>Activity Name</FormLabel>

              {mode === "existing" ? (
                <SelectRS
                  placeholder="Search or pick activity"
                  value={actRsValue}
                  options={actRsOptions}
                  isSearchable
                  isClearable
                  onMenuOpen={() => loadActivitiesQuick()}
                  onInputChange={(input, { action }) => {
                    if (action === "input-change") actSearchRef.current = input || "";
                    return input;
                  }}
                  onChange={(opt) => {
                    if (!opt) {
                      setForm((p) => ({ ...p, activityName: "", type: "frontend", description: "" }));
                      return;
                    }
                    if (opt.value === "__more__") {
                      setOpenActivityPicker(true);
                      return;
                    }
                    setForm((p) => ({
                      ...p,
                      activityName: opt.name || opt.label || "",
                      type: opt.type || "frontend",
                      description: opt.description || "",
                    }));
                    setTouched((t) => ({ ...t, activityName: true, type: true, description: true }));
                  }}
                  isLoading={isFetchingActs}
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
                  onChange={(e) => setForm((p) => ({ ...p, activityName: e.target.value }))}
                  onBlur={() => setTouched((t) => ({ ...t, activityName: true }))}
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
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
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

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                      dependencies: { ...p.dependencies, scmEnabled: e.target.checked },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </Box>

              {/* Engineering modules: multi-select inline with “Search more…”; keep menu open */}
              {form.dependencies.engineeringEnabled && (
                <FormControl size="sm" error={touched.dependencies && !!errors.dependencies}>
                  <FormLabel sx={labelRequiredSx}>Model Entry (Modules)</FormLabel>
                  <SelectRS
                    placeholder="Pick one or more modules"
                    value={form.dependencies.engineeringModules}
                    options={moduleRsOptions}
                    isMulti
                    isSearchable
                    closeMenuOnSelect={false}  // keep open while selecting
                    onMenuOpen={() => loadModulesQuick()}
                    onChange={(opts) => {
                      const arr = Array.isArray(opts) ? opts : [];
                      const hasMore = arr.some((o) => o?.value === "__more__");
                      if (hasMore) {
                        setOpenModulePicker(true);
                        // remove sentinel if user clicked it
                        const filtered = arr.filter((o) => o.value !== "__more__");
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
                        dependencies: { ...p.dependencies, engineeringModules: arr },
                      }));
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, dependencies: true }))}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                      control: (base) => ({ ...base, minHeight: 36 }),
                    }}
                    isLoading={isFetchingModules}
                  />
                  {touched.dependencies && !!errors.dependencies && (
                    <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                      Please pick at least one module.
                    </Typography>
                  )}
                </FormControl>
              )}
            </Box>

            {/* Actions */}
            <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
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
          setForm((prev) => ({
            ...prev,
            projectId: row?._id || "",
            projectCode: row?.code || "",
            projectName: row?.name || "",
          }));
          setTouched((t) => ({ ...t, projectId: true, projectName: true }));
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
          setForm((prev) => ({
            ...prev,
            activityName: row?.name || "",
            type: row?.type || "frontend",
            description: row?.description || "",
          }));
          setTouched((t) => ({ ...t, activityName: true, type: true, description: true }));
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
            const exists = prev.dependencies.engineeringModules.some((opt) => opt.value === row?._id);
            const next = exists
              ? prev.dependencies.engineeringModules
              : [...prev.dependencies.engineeringModules, { value: row?._id, label: row?.name || "Unnamed", raw: row }];
            return {
              ...prev,
              dependencies: { ...prev.dependencies, engineeringModules: next },
            };
          });
        }}
        allowMultiple
      />
    </>
  );
}
