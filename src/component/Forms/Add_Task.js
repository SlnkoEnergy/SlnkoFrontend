import {
  Card,
  Typography,
  Input,
  Textarea,
  Button,
  Grid,
  FormControl,
  FormLabel,
  IconButton,
  Switch,
  Box,
  Tabs,
  TabList,
  Tab,
} from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useState } from "react";
import { useGetProjectDropdownQuery } from "../../redux/projectsSlice";
import {
  useCreateTaskMutation,
  useGetAllDeptQuery,
  useGetAllUserQuery,
} from "../../redux/globalTaskSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const AddTask = () => {
  const [tab, setTab] = useState("project");
  const [priority, setPriority] = useState(0);
  const [assignToTeam, setAssignToTeam] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [subtype, setSubType] = useState("");
  const navigate = useNavigate();

  const { data: getProjectDropdown, isLoading } = useGetProjectDropdownQuery();
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();
  const { data: getAllUser } = useGetAllUserQuery();
  const { data: getAllDept } = useGetAllDeptQuery();

  const handleSubmit = async () => {
    const isProjectTab = tab === "project";
    const isHelpdeskTab = tab === "helpdesk";

    // Validate required fields
    if (
      !title ||
      !priority ||
      (isProjectTab && (!selectedProject || selectedProject.length === 0))
    ) {
      return alert("Required fields missing");
    }

    // Extract project IDs if multiple selected
    const projectIds = isProjectTab
      ? Array.isArray(selectedProject)
        ? selectedProject.map((p) => p._id)
        : [selectedProject._id]
      : undefined;

    const payload = {
      title,
      description: note,
      deadline: dueDate || null,
      project_id: projectIds,
      assigned_to: isHelpdeskTab
        ? []
        : assignToTeam
          ? []
          : Array.isArray(assignedTo)
            ? assignedTo
            : [],
      priority: priority.toString(),
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
      setTimeout(() => navigate("/all_task"), 1000);
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      maxWidth: 250,
      overflowX: "auto",
    }),
  };

  const optionsProject = (getProjectDropdown?.data || []).map((project) => ({
    value: project.code,
    label: project.code,
  }));

  const options = assignToTeam
    ? Array.isArray(getAllDept?.data)
      ? getAllDept.data.filter((dept) => dept.trim() !== "")
      : []
    : Array.isArray(getAllUser?.data)
      ? getAllUser.data
      : [];

  const selectOptions = options.map((item) =>
    assignToTeam
      ? { value: item, label: item }
      : { value: item._id, label: item.name }
  );

  const value = assignToTeam
    ? assignedTo
      ? { value: assignedTo, label: assignedTo }
      : null
    : Array.isArray(assignedTo)
      ? assignedTo
          .map((userId) => {
            const user = options.find((item) => item._id === userId);
            return user ? { value: user._id, label: user.name } : null;
          })
          .filter(Boolean)
      : [];

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

      <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} sx={{ mb: 3 }}>
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
          <>
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
                        .filter(Boolean); // remove nulls
                      setSelectedProject(selectedProjects);
                    } else {
                      setSelectedProject([]);
                    }
                    setSearchText("");
                  }}
                  onInputChange={(inputValue, { action }) => {
                    if (action === "input-change") {
                      setSearchText(inputValue);
                    }
                  }}
                  options={optionsProject.filter((project) =>
                    project.label
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                  )}
                  styles={customStyles}
                />
              </FormControl>
            </Grid>
          </>
        )}

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Priority</FormLabel>
            <Box display="flex" gap={1}>
              {[1, 2, 3].map((level) => (
                <IconButton
                  key={level}
                  variant="plain"
                  color="warning"
                  onClick={() =>
                    setPriority((prev) => (prev === level ? 0 : level))
                  }
                >
                  {priority >= level ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              ))}
            </Box>
          </FormControl>
        </Grid>

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Due Date</FormLabel>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormControl>
        </Grid>
        {tab === "helpdesk" && (
          <>
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
                          label: subtype.replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                          ),
                          value: subtype,
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    setSubType(selectedOption ? selectedOption.value : "");
                  }}
                />
              </FormControl>
            </Grid>
          </>
        )}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Assigned To</FormLabel>

            {tab !== "helpdesk" && (
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
                  value={value}
                  onChange={(selected) => {
                    if (assignToTeam) {
                      setAssignedTo(selected?.value || null);
                    } else {
                      const ids = selected
                        ? selected.map((opt) => opt.value)
                        : [];
                      setAssignedTo(ids);
                    }
                  }}
                />
              </>
            )}

            {tab === "helpdesk" && <Input value="IT Team" disabled />}
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
            variant="solid"
            color="danger"
            onClick={() => {
              const confirmDiscard = window.confirm(
                "Are you sure you want to discard the changes?"
              );
              if (confirmDiscard) {
                setPriority(0);
                setAssignToTeam(false);
                setSearchText("");
                setSelectedProject(null);
                setTitle("");
                setDueDate("");
                setNote("");
                setAssignedTo([]);
              }
            }}
          >
            Discard
          </Button>

          <Button
            variant="solid"
            color="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AddTask;
