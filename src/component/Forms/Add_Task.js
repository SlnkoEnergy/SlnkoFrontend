import {
  Card,
  Typography,
  Input,
  Select,
  Option,
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
  console.log(getAllDept?.data);

  const filteredProjects = (getProjectDropdown?.data || []).filter((project) =>
    project.code.toLowerCase().includes(searchText.toLowerCase())
  );

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

        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Project Id</FormLabel>
            <Select
              placeholder={isLoading ? "Loading..." : "Choose one"}
              value={selectedProject?.code || searchText}
              onChange={(_, value) => {
                const project = getProjectDropdown?.data?.find(
                  (proj) => proj.code === value
                );
                setSelectedProject(project || null);
                setSearchText("");
              }}
              onInputChange={(e) => {
                setSearchText(e.target.value);
                setSelectedProject(null);
              }}
              autoComplete
              slotProps={{
                listbox: { sx: { maxHeight: 250, overflowY: "auto" } },
                input: { placeholder: "Search project..." },
              }}
            >
              {filteredProjects.map((project) => (
                <Option key={project._id} value={project.code}>
                  {project.code}
                </Option>
              ))}
            </Select>
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
                onChange={(e) => setAssignToTeam(e.target.checked)}
              />
              <Typography level="body-sm">Assign to Team</Typography>
            </Box>

            <Select
              multiple={!assignToTeam}
              value={assignedTo}
              onChange={(_, val) => setAssignedTo(val)}
              placeholder={assignToTeam ? "Select a team" : "Select users"}
            >
              {assignToTeam
                ? (getAllDept?.data || [])
                    .filter((dept) => dept.trim() !== "")
                    .map((dept) => (
                      <Option key={dept} value={dept}>
                        {dept}
                      </Option>
                    ))
                : (getAllUser?.data || []).map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.name}
                    </Option>
                  ))}
            </Select>
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
