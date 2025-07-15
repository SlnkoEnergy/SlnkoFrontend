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
} from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useState } from "react";
import { useGetProjectDropdownQuery } from "../../redux/camsSlice";
import {
  useCreateTaskMutation,
  useGetAllDeptQuery,
  useGetAllUserQuery,
} from "../../redux/globalTaskSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const AddTask = () => {
  const [priority, setPriority] = useState(0);
  const [assignToTeam, setAssignToTeam] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const navigate = useNavigate();

  const { data: getProjectDropdown, isLoading } = useGetProjectDropdownQuery();
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();
  const { data: getAllUser } = useGetAllUserQuery();
  const { data: getAllDept } = useGetAllDeptQuery();

  const handleSubmit = async () => {
    if (!selectedProject || !title || !priority)
      return alert("Required fields missing");

    const payload = {
      title,
      description: note,
      deadline: dueDate || null,
      project_id: selectedProject._id,
      assigned_to: assignToTeam
        ? []
        : Array.isArray(assignedTo)
          ? assignedTo
          : [],

      priority: priority.toString(),
      current_status: {
        status: "pending",
        remarks: "",
        user_id: null,
      },
    };

    try {
      await createTask({
        payload,
        team: assignToTeam ? assignedTo : undefined,
      }).unwrap();

      toast.success("Task created successfully");

      setTimeout(() => {
        navigate("/all_task");
      }, 1000);
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
        maxWidth: 600,
        mt: { xs: "0%", lg: "5%" },
        ml: { xs: "auto", lg: "35%" },
        mx: "auto",
        p: 3,
        borderRadius: "lg",
      }}
    >
      <Typography level="h4" mb={2}>
        Add Task
      </Typography>

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

        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Project Id</FormLabel>
            <Select
              isLoading={isLoading}
              isClearable
              isSearchable
              placeholder="Search project..."
              value={
                selectedProject
                  ? { value: selectedProject.code, label: selectedProject.code }
                  : null
              }
              onChange={(selectedOption) => {
                const project = getProjectDropdown?.data?.find(
                  (proj) => proj.code === selectedOption?.value
                );
                setSelectedProject(project || null);
                setSearchText("");
              }}
              onInputChange={(inputValue, { action }) => {
                if (action === "input-change") {
                  setSearchText(inputValue);
                  setSelectedProject(null);
                }
              }}
              options={optionsProject.filter((project) =>
                project.label.toLowerCase().includes(searchText.toLowerCase())
              )}
              styles={customStyles}
            />
          </FormControl>
        </Grid>

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Project Name</FormLabel>
            <Input
              placeholder="Project Name"
              value={selectedProject?.name || ""}
              disabled
            />
          </FormControl>
        </Grid>

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

        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>
              Assigned To ({assignToTeam ? "Team" : "Individual"})
            </FormLabel>
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
                  const ids = selected ? selected.map((opt) => opt.value) : [];
                  setAssignedTo(ids);
                }
              }}
            />
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
