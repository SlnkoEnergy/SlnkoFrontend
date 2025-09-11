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
} from "@mui/joy";
import { useState } from "react";
import { useGetProjectDropdownQuery } from "../../redux/projectsSlice";
import {
  useCreateTaskMutation,
  useGetAllDeptQuery,
  useGetAllUserQuery,
} from "../../redux/globalTaskSlice";
import { toast } from "react-toastify";
import Select, { components } from "react-select";

/* ---------------------------------------------------
   Shared react-select styles (Joy-like blue border)
--------------------------------------------------- */
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

  const { data: getProjectDropdown, isLoading } = useGetProjectDropdownQuery();
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();
  const { data: getAllUser } = useGetAllUserQuery({ department: "" });
  const { data: getAllDept } = useGetAllDeptQuery();

  const buildISO = (d) => (d && d.isValid() ? d.toDate().toISOString() : null);
  /* ---------------- Submit ---------------- */
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
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  /* ---------------- Project options ---------------- */
  const optionsProject = (getProjectDropdown?.data || []).map((project) => ({
    value: project.code,
    label: project.code,
  }));

  /* ---------------- Assign To (users/teams) ---------------- */
  const rawOptions = assignToTeam
    ? Array.isArray(getAllDept?.data)
      ? getAllDept.data.filter((dept) => dept.trim() !== "")
      : []
    : Array.isArray(getAllUser?.data)
    ? getAllUser.data
    : [];

  const selectOptions = rawOptions.map((item) =>
    assignToTeam
      ? { value: item, label: item }
      : { value: item._id, label: item.name }
  );

  const assignValue = assignToTeam
    ? assignedTo
      ? { value: assignedTo, label: assignedTo }
      : null
    : Array.isArray(assignedTo)
    ? assignedTo
        .map((userId) => {
          const user = rawOptions.find((u) => u._id === userId);
          return user ? { value: user._id, label: user.name } : null;
        })
        .filter(Boolean)
    : [];

  /* ---------------- Priority react-select ---------------- */
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

  return (
    <Card
      sx={{
        maxWidth: 700,
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
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Title of task..."
            />
          </FormControl>
        </Grid>

        {tab === "project" && (
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
                        getProjectDropdown?.data?.find(
                          (proj) => proj.code === opt.value
                        )
                      )
                      .filter(Boolean);
                    setSelectedProject(selectedProjects);
                  } else {
                    setSelectedProject([]);
                  }
                  setSearchText("");
                }}
                onInputChange={(inputValue, { action }) => {
                  if (action === "input-change") setSearchText(inputValue);
                }}
                options={optionsProject.filter((p) =>
                  p.label.toLowerCase().includes(searchText.toLowerCase())
                )}
                styles={joySelectStyles}
                menuPortalTarget={document.body}
              />
            </FormControl>
          </Grid>
        )}

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
            <FormLabel>Assigned To</FormLabel>

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
                      setAssignedTo(null);
                    }}
                  />
                  <Typography level="body-sm">Assign to Team</Typography>
                </Box>

                <Select
                  isMulti={!assignToTeam}
                  placeholder={assignToTeam ? "Select a team" : "Select Users"}
                  options={selectOptions}
                  value={assignValue}
                  onChange={(selected) => {
                    if (assignToTeam) {
                      setAssignedTo(selected?.value || null);
                    } else {
                      const ids = selected ? selected.map((o) => o.value) : [];
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
    </Card>
  );
};

export default AddTask;
