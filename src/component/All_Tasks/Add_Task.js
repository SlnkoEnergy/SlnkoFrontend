import {
  Card,
  Typography,
  Input,
  Textarea,
  Button,
  Grid,
  FormControl,
  FormLabel,
  Switch,
  Box,
  Tabs,
  TabList,
  Tab,
  RadioGroup,
  Radio,
} from "@mui/joy";
import { useMemo, useState } from "react";
import { useGetProjectDropdownQuery } from "../../redux/projectsSlice";
import {
  useCreateTaskMutation,
  useGetAllDeptQuery,
  useGetAllUserQuery,
  useGetAllowedModuleQuery,
  useLazyNamesearchMaterialCategoriesQuery,
} from "../../redux/globalTaskSlice";
import { toast } from "react-toastify";
import Select, { components } from "react-select";
import SelectRS from "react-select";
import SearchPickerModal from "../../component/SearchPickerModal";


const joySelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: state.isFocused
      ? "#3366a3"
      : "var(--joy-palette-neutral-outlinedBorder)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(51, 102, 163, 0.16)" : "none",
    "&:hover": {
      borderColor: state.isFocused
        ? "#3366a3"
        : "var(--joy-palette-neutral-outlinedBorder)",
    },
    fontSize: 14,
  }),
  valueContainer: (b) => ({ ...b, padding: "0 10px" }),
  placeholder: (b) => ({ ...b, color: "var(--joy-palette-text-tertiary)" }),
  menu: (b) => ({ ...b, zIndex: 1301 }),
  menuPortal: (b) => ({ ...b, zIndex: 1301 }),
};

const RS_MORE = { label: "Search more…", value: "__more__" };

const toArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const AddTask = () => {
  const [tab, setTab] = useState("project");
  const [priority, setPriority] = useState(0);
  const [assignToTeam, setAssignToTeam] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState([]);
  const [title, setTitle] = useState("");
  const [deadlineDT, setDeadlineDT] = useState(null);
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [subtype, setSubType] = useState("");

  // Category + pickers
  const [category, setCategory] = useState("Engineering");
  const [openModulePicker, setOpenModulePicker] = useState(false);
  const [openScmPicker, setOpenScmPicker] = useState(false); 

  const { data: getProjectDropdown, isLoading } = useGetProjectDropdownQuery();
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();

  const deptFilter = useMemo(() => {
    if (category === "Engineering") return "Engineering";
    if (category === "SCM") return "SCM";
    return "Other"; 
  }, [category]);

  const {
    data: usersResp,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetAllUserQuery({ department: deptFilter });

  const {
    data: deptsResp,
    isFetching: isFetchingDepts,
    isLoading: isLoadingDepts,
  } = useGetAllDeptQuery();

  const usersList = useMemo(() => toArray(usersResp), [usersResp]);
  const deptsList = useMemo(
    () =>
      toArray(deptsResp).filter(
        (d) => typeof d === "string" && d.trim() !== ""
      ),
    [deptsResp]
  );

  const projectId = selectedProject?.[0]?._id || "";

  const {
    data: allowedModulesResp,
    isLoading: isLoadingModules,
    isFetching: isFetchingModules,
  } = useGetAllowedModuleQuery(projectId, {
    skip: tab !== "project" || category !== "Engineering" || !projectId,
  });

  const allowedModules = useMemo(() => {
    const arr = toArray(allowedModulesResp);
    return arr.map((m) => ({
      _id: m._id,
      name: m.name || m.module_name || "Untitled",
      code: m.code || "",
      description: m.description || "",
    }));
  }, [allowedModulesResp]);

  const moduleQuickOptions = useMemo(() => {
    const quick = allowedModules.slice(0, 7).map((m) => ({
      value: String(m._id),
      label: m.name,
      raw: m,
    }));
    return [...quick, RS_MORE];
  }, [allowedModules]);

  const [triggerScmSearch, { isFetching: isFetchingScm }] =
    useLazyNamesearchMaterialCategoriesQuery();
  const [scmQuickOptions, setScmQuickOptions] = useState([]);

  const loadScmQuick = async (q = "") => {
    try {
      const res = await triggerScmSearch(
        {
          search: q,
          page: 1,
          limit: 7,
          pr: true,
          project_id: projectId,
        },
        true
      ).unwrap();
      const list = toArray(res);
      setScmQuickOptions([
        ...list.slice(0, 7).map((m) => ({
          value: String(m._id),
          label: String(m.name || "Unnamed"),
          raw: m,
        })),
        RS_MORE,
      ]);
    } catch {
      setScmQuickOptions([RS_MORE]);
    }
  };

  const handleSubmit = async () => {
    const isProjectTab = tab === "project";
    const isHelpdeskTab = tab === "helpdesk";

    if (!title || !priority || (isProjectTab && selectedProject.length === 0)) {
      return toast.error("Required fields missing (Title, Priority, Project).");
    }

    const projectIds = isProjectTab
      ? selectedProject.map((p) => p._id)
      : undefined;

    const payload = {
      title,
      description: note,
      deadline: deadlineDT ? new Date(deadlineDT).toISOString() : null,
      project_id: projectIds,
      assigned_to: isHelpdeskTab
        ? []
        : assignToTeam
        ? []
        : Array.isArray(assignedTo)
        ? assignedTo
        : [],
      priority: String(priority),
      type: tab,
      sub_type: isHelpdeskTab ? subtype : null,
    };

    try {
      await createTask({
        payload,
        team: isHelpdeskTab
          ? "superadmin"
          : assignToTeam
          ? assignedTo
          : undefined,
      }).unwrap();

      toast.success("Task created successfully");
      setPriority(0);
      setAssignToTeam(false);
      setSearchText("");
      setSelectedProject([]);
      setDeadlineDT(null);
      setTitle("");
      setNote("");
      setAssignedTo([]);
      setSubType("");
      setCategory("Engineering");
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  const optionsProject = (toArray(getProjectDropdown) || []).map((project) => ({
    value: project.code,
    label: project.code,
  }));

  const userOptions = useMemo(
    () =>
      usersList
        .map((u) => {
          const id = u._id || u.id;
          const name =
            u.name || u.fullName || u.full_name || u.email || "Unnamed";
          return id ? { value: id, label: name } : null;
        })
        .filter(Boolean),
    [usersList]
  );

  const teamOptions = useMemo(
    () => deptsList.map((d) => ({ value: d, label: d })),
    [deptsList]
  );

  const currentOptions = assignToTeam ? teamOptions : userOptions;

  const assignValue = useMemo(() => {
    if (assignToTeam) {
      return assignedTo ? { value: assignedTo, label: assignedTo } : null;
    }
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) return [];
    const map = new Map(currentOptions.map((o) => [String(o.value), o]));
    return assignedTo.map((id) => map.get(String(id)) || null).filter(Boolean);
  }, [assignToTeam, assignedTo, currentOptions]);

  const priorityMeta = {
    1: { label: "High", bg: "#d32f2f" },
    2: { label: "Medium", bg: "#ed6c02" },
    3: { label: "Low", bg: "#2e7d32" },
  };
  const priorityOptions = [
    { value: 1, label: "High" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Low" },
  ];

  const PrioritySingleValue = (props) => {
    const { data } = props;
    const meta = priorityMeta[data?.value];
    return (
      <components.SingleValue {...props}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            background: meta?.bg ?? "#64748b",
          }}
        >
          {meta?.label || "Select priority"}
        </span>
      </components.SingleValue>
    );
  };

  const PriorityOption = (props) => {
    const { data } = props;
    const meta = priorityMeta[data.value];
    return (
      <components.Option {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: meta?.bg ?? "#64748b",
            }}
          />
          <span>{meta?.label || data.label}</span>
        </div>
      </components.Option>
    );
  };

  const fetchAllowedModulePage = async ({
    page = 1,
    search = "",
    pageSize = 10,
  }) => {
    const norm = search.trim().toLowerCase();
    const filtered = norm
      ? allowedModules.filter(
          (m) =>
            m.name.toLowerCase().includes(norm) ||
            (m.code && m.code.toLowerCase().includes(norm)) ||
            (m.description && m.description.toLowerCase().includes(norm))
        )
      : allowedModules;

    const start = (page - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);
    return { rows, total: filtered.length };
  };

  const fetchScmPage = async ({ page = 1, search = "", pageSize = 10 }) => {
    const res = await triggerScmSearch(
      {
        search,
        page,
        limit: pageSize,
        pr: true,
        project_id: projectId,
      },
      true
    ).unwrap();
    const rows = toArray(res);
    const total = res?.pagination?.total ?? rows.length;
    return { rows, total };
  };

  return (
    <Card
      sx={{
        maxWidth: 820,
        mx: "auto",
        p: 3,
        borderRadius: "lg",
      }}
    >
      <Typography level="h4" mb={2}>
        Add Task
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <TabList>
          <Tab value="project">Project</Tab>
          <Tab value="internal">Internal</Tab>
          <Tab value="helpdesk">Helpdesk</Tab>
        </TabList>
      </Tabs>

      <Grid container spacing={2}>
        {tab === "project" && (
          <>
            {/* Category selector above Project Id */}
            <Grid xs={12}>
              <FormControl fullWidth>
                <FormLabel>Category</FormLabel>
                <RadioGroup
                  orientation="horizontal"
                  name="task-category"
                  value={category}
                  onChange={(e, v) => {
                    const next = v ?? e?.target?.value; // Joy versions fallback
                    setCategory(next);
                    setTitle(""); // reset dependent title
                    setAssignedTo([]); // reset users to match new category filter
                  }}
                  sx={{ gap: 2 }}
                >
                  <Radio value="Engineering" label="Engineering" />
                  <Radio value="SCM" label="SCM" />
                  <Radio value="Other" label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <FormControl fullWidth>
                <FormLabel>Project Id</FormLabel>
                <Select
                  isMulti
                  isLoading={isLoading}
                  isClearable
                  isSearchable
                  placeholder="Search project..."
                  value={
                    selectedProject?.length
                      ? selectedProject.map((proj) => ({
                          value: proj.code,
                          label: proj.code,
                        }))
                      : []
                  }
                  onChange={(selectedOptions) => {
                    if (Array.isArray(selectedOptions)) {
                      const selectedProjects = selectedOptions
                        .map((opt) =>
                          toArray(getProjectDropdown).find(
                            (proj) => proj.code === opt.value
                          )
                        )
                        .filter(Boolean);
                      setSelectedProject(selectedProjects);
                    } else {
                      setSelectedProject([]);
                    }
                    setSearchText("");
                    // Clear Title for Engineering/SCM when switching project
                    if (category === "Engineering" || category === "SCM")
                      setTitle("");
                  }}
                  onInputChange={(inputValue, { action }) => {
                    if (action === "input-change") setSearchText(inputValue);
                  }}
                  options={toArray(getProjectDropdown)
                    .map((p) => ({ value: p.code, label: p.code }))
                    .filter((p) =>
                      p.label.toLowerCase().includes(searchText.toLowerCase())
                    )}
                  styles={joySelectStyles}
                  menuPortalTarget={document.body}
                />
              </FormControl>
            </Grid>
          </>
        )}

        {/* Title field */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Title</FormLabel>

            {/* Engineering: allowed modules */}
            {tab === "project" && category === "Engineering" ? (
              <SelectRS
                placeholder={
                  projectId
                    ? isLoadingModules || isFetchingModules
                      ? "Loading modules…"
                      : "Search or pick module"
                    : "Select a Project first"
                }
                isDisabled={!projectId || isLoadingModules || isFetchingModules}
                value={title ? { value: "__title__", label: title } : null}
                options={moduleQuickOptions}
                isClearable
                isSearchable
                onChange={(opt) => {
                  if (!opt) {
                    setTitle("");
                    return;
                  }
                  if (opt.value === "__more__") {
                    setOpenModulePicker(true);
                    return;
                  }
                  setTitle(opt.label || "");
                }}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                  control: (base) => ({ ...base, minHeight: 40 }),
                }}
              />
            ) : tab === "project" && category === "SCM" ? (
              // SCM: allowed material categories (server search + modal)
              <SelectRS
                placeholder={
                  projectId
                    ? isFetchingScm
                      ? "Loading categories…"
                      : "Search or pick material category"
                    : "Select a Project first"
                }
                isDisabled={!projectId}
                value={title ? { value: "__title__", label: title } : null}
                options={scmQuickOptions}
                isClearable
                isSearchable
                onMenuOpen={() => loadScmQuick("")}
                onInputChange={(input, meta) => {
                  if (meta.action === "input-change") loadScmQuick(input || "");
                  return input;
                }}
                onChange={(opt) => {
                  if (!opt) {
                    setTitle("");
                    return;
                  }
                  if (opt.value === "__more__") {
                    setOpenScmPicker(true);
                    return;
                  }
                  setTitle(opt.label || "");
                }}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                  control: (base) => ({ ...base, minHeight: 40 }),
                }}
                isLoading={isFetchingScm}
              />
            ) : (
              // Other/internal/helpdesk
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Title of task..."
              />
            )}
          </FormControl>
        </Grid>

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Priority</FormLabel>
            <Select
              options={priorityOptions}
              isClearable
              value={
                priorityOptions.find((o) => o.value === Number(priority)) ||
                null
              }
              onChange={(opt) => setPriority(opt?.value ?? 0)}
              components={{
                SingleValue: PrioritySingleValue,
                Option: PriorityOption,
                IndicatorSeparator: () => null,
              }}
              styles={joySelectStyles}
              menuPortalTarget={document.body}
              placeholder="Select priority"
            />
          </FormControl>
        </Grid>

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Deadline</FormLabel>
            <Input
              type="datetime-local"
              value={deadlineDT}
              onChange={(e) => setDeadlineDT(e.target.value)}
              placeholder="dd-mm-yyyy hh:mm"
            />
          </FormControl>
        </Grid>

        {tab === "helpdesk" && (
          <Grid xs={6}>
            <FormControl fullWidth>
              <FormLabel>Type</FormLabel>
              <Select
                isLoading={isLoading}
                isClearable
                isSearchable
                placeholder="Search Type..."
                options={[
                  { label: "Changes", value: "changes" },
                  { label: "New Feature", value: "new feature" },
                  { label: "Issue", value: "issue" },
                ]}
                value={
                  subtype
                    ? {
                        label: subtype.replace(/\b\w/g, (c) => c.toUpperCase()),
                        value: subtype,
                      }
                    : null
                }
                onChange={(opt) => setSubType(opt ? opt.value : "")}
                styles={joySelectStyles}
                menuPortalTarget={document.body}
              />
            </FormControl>
          </Grid>
        )}

        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>
              Assigned To
              {!assignToTeam && category !== "Other"
                ? ` (${category} only)`
                : ""}
            </FormLabel>

            {tab !== "helpdesk" ? (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography level="body-sm">Assign to Individual</Typography>
                  <Switch
                    checked={assignToTeam}
                    onChange={(e) => {
                      setAssignToTeam(e.target.checked);
                      setAssignedTo(e.target.checked ? null : []); // normalize state
                    }}
                  />
                  <Typography level="body-sm">Assign to Team</Typography>
                </Box>

                <Select
                  isMulti={!assignToTeam}
                  placeholder={
                    assignToTeam
                      ? "Select a team"
                      : category === "Engineering"
                      ? "Select Users (Engineering)"
                      : category === "SCM"
                      ? "Select Users (SCM)"
                      : "Select Users"
                  }
                  options={currentOptions}
                  value={assignValue}
                  isLoading={
                    assignToTeam
                      ? isLoadingDepts || isFetchingDepts
                      : isLoadingUsers || isFetchingUsers
                  }
                  noOptionsMessage={() =>
                    assignToTeam
                      ? "No teams found"
                      : category === "Other"
                      ? "No users found"
                      : `No users found in ${category}`
                  }
                  onChange={(selected) => {
                    if (assignToTeam) {
                      setAssignedTo(selected?.value || null);
                    } else {
                      const ids = Array.isArray(selected)
                        ? selected.map((o) => o.value)
                        : [];
                      setAssignedTo(ids);
                    }
                  }}
                  styles={joySelectStyles}
                  menuPortalTarget={document.body}
                />
              </>
            ) : (
              <Input value="IT Team" disabled />
            )}
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Note</FormLabel>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Log a note..."
              minRows={3}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} display="flex" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            color="danger"
            onClick={() => {
              const confirmDiscard = window.confirm(
                "Are you sure you want to discard the changes?"
              );
              if (confirmDiscard) {
                setPriority(0);
                setAssignToTeam(false);
                setSearchText("");
                setSelectedProject([]);
                setTitle("");
                setDeadlineDT("");
                setNote("");
                setAssignedTo([]);
                setSubType("");
                setCategory("Engineering");
              }
            }}
            sx={{
              color: "#3366a3",
              borderColor: "#3366a3",
              backgroundColor: "transparent",
              "--Button-hoverBg": "#e0e0e0",
              "--Button-hoverBorderColor": "#3366a3",
              "&:hover": { color: "#3366a3" },
              height: "8px",
            }}
          >
            Discard
          </Button>

          <Button
            variant="solid"
            color="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            sx={{
              backgroundColor: "#3366a3",
              color: "#fff",
              "&:hover": { backgroundColor: "#285680" },
              height: "8px",
            }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>

      {/* Engineering Module picker (client-side over allowedModules) */}
      <SearchPickerModal
        open={openModulePicker}
        onClose={() => setOpenModulePicker(false)}
        title="Select Module"
        columns={[
          { key: "name", label: "Module", width: 260 },
          { key: "code", label: "Code", width: 140 },
          { key: "description", label: "Description" },
        ]}
        rowKey="_id"
        pageSize={10}
        searchKey="name or code"
        fetchPage={fetchAllowedModulePage}
        onPick={(row) => {
          if (row?.name)
            setTitle(row.code ? `${row.name} (${row.code})` : row.name);
          setOpenModulePicker(false);
        }}
      />

      {/* SCM picker (server-side search/pagination) */}
      <SearchPickerModal
        open={openScmPicker}
        onClose={() => setOpenScmPicker(false)}
        title="Select Material Category"
        columns={[
          { key: "name", label: "Category", width: 260 },
          { key: "description", label: "Description" },
        ]}
        rowKey="_id"
        pageSize={10}
        searchKey="name"
        fetchPage={fetchScmPage}
        onPick={(row) => {
          if (row?.name) setTitle(row.name);
          setOpenScmPicker(false);
        }}
      />
    </Card>
  );
};

export default AddTask;
