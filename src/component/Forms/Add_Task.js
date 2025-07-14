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

const AddTask = () => {
  const [priority, setPriority] = useState(0);
  const [assignToTeam, setAssignToTeam] = useState(false);

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
        {/* Title */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Title</FormLabel>
            <Input placeholder="Enter Title of task..." />
          </FormControl>
        </Grid>

        {/* Project Id & Project Name */}
        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Project Id</FormLabel>
            <Select placeholder="Choose one">
              <Option value="Project1">Project 1</Option>
              <Option value="Project2">Project 2</Option>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Project Name</FormLabel>
            <Input placeholder="Enter Project Name" />
          </FormControl>
        </Grid>

        {/* Priority */}
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

        {/* Due Date */}
        <Grid xs={6}>
          <FormControl fullWidth>
            <FormLabel>Due Date</FormLabel>
            <Input type="date" />
          </FormControl>
        </Grid>

        {/* Toggle + Assigned To */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>
              Assigned To (
              {assignToTeam ? "Team" : "Individual"})
            </FormLabel>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography level="body-sm">Assign to Individual</Typography>
              <Switch
                checked={assignToTeam}
                onChange={(e) => setAssignToTeam(e.target.checked)}
              />
              <Typography level="body-sm">Assign to Team</Typography>
            </Box>

            <Select placeholder={assignToTeam ? "Select a team" : "Select a user"}>
              {assignToTeam ? (
                <>
                  <Option value="team1">Team Alpha</Option>
                  <Option value="team2">Team Beta</Option>
                </>
              ) : (
                <>
                  <Option value="user1">User 1</Option>
                  <Option value="user2">User 2</Option>
                </>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Note */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <FormLabel>Note</FormLabel>
            <Textarea placeholder="Log a note..." minRows={3} />
          </FormControl>
        </Grid>

        {/* Buttons */}
        <Grid xs={12} display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="solid" color="danger">
            Discard
          </Button>
          <Button variant="soft" color="neutral">
            Mark Done
          </Button>
          <Button variant="solid" color="primary">
            Submit
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default AddTask;
