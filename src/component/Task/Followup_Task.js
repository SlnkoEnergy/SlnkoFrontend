import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Sheet,
  Typography,
  Input,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Grid,
  Box,
  Divider,
  Autocomplete,
  Chip,
  Checkbox,
} from "@mui/joy";
import plus from "../../assets/plus 1.png";
import { useNavigate } from "react-router-dom";
import { useAddTasksMutation } from "../../redux/tasksSlice";
import { useGetLoginsQuery } from "../../redux/loginSlice";
import { toast } from "react-toastify";
import { useGetFollowupLeadsQuery } from "../../redux/leadsSlice";

const FormComponent2 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id:"",
    name: "",
    date: "",
    reference: "",
    by_whom: "",
    comment: "",
    submitted_by:""
  });

  // const [bdMembers, setBdMembers] = useState([]);

  const [ADDTask, {isLoading}] = useAddTasksMutation();
  const { data: usersData = [], isLoading: isFetchingUsers } = useGetLoginsQuery();
    const {data: getLead = []} = useGetFollowupLeadsQuery();
  
    const getLeadArray = Array.isArray(getLead) ? getLead : getLead?.data || [];
    console.log("Processed Leads Array:", getLeadArray);

  const bdMembers = useMemo(() => {
    return (usersData?.data || [])
      .filter((user) => user.department === "BD")
      .map((member) => ({ label: member.name, id: member._id }));
  }, [usersData]);

    const [user, setUser] = useState(null);
  
    useEffect(() => {
         const userSessionData = getUserData();
         if (userSessionData && userSessionData.name) {
           setUser(userSessionData);
         }
       }, []);
       
       const getUserData = () => {
         const userSessionData = localStorage.getItem("userDetails");
         return userSessionData ? JSON.parse(userSessionData) : null;
       };
       
       // Retrieve LeadId safely
       const LeadId = localStorage.getItem("add_task_followup");
       
       useEffect(() => {
         if (LeadId && getLeadArray.length > 0) {
           const matchedLead = getLeadArray.find((lead) => lead.id === LeadId);
           if (matchedLead) {
             setFormData((prevData) => ({
               ...prevData,
               name: matchedLead.c_name || "",
             }));
           }
         }
       }, [LeadId, getLeadArray]);
       
       const handleChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
      
        if (field === "reference") {
          if (value === "By Call" && user?.name) {
            setFormData((prevData) => ({ ...prevData, by_whom: user.name }));
          } else if (value === "By Meeting" && user?.name) {
            setFormData((prevData) => ({ ...prevData, by_whom: user.name }));
          } else {
            setFormData((prevData) => ({ ...prevData, by_whom: "" }));
          }
        }
      };
      
      
      const handleByWhomChange = (_, newValue = []) => {
        if (formData.reference === "By Meeting" && user?.name) {
          // Ensure the user's name is always present
          const updatedValue = [{ label: user.name, id: "user" }, ...newValue.filter((member) => member.label !== user.name)];
          setFormData((prevData) => ({ ...prevData, by_whom: updatedValue.map((member) => member.label).join(", ") }));
        } else {
          setFormData((prevData) => ({ ...prevData, by_whom: newValue.map((member) => member.label).join(", ") }));
        }
      };
       
       const handleSubmit = async (e) => {
         e.preventDefault();
       
         if (!formData.by_whom) {
           console.error("Error: 'by_whom' field is required.");
           return;
         }
       
         const submittedBy = user?.name || ""; 

         const updatedFormData = { 
           ...formData, 
           id: LeadId, 
           submitted_by: submittedBy  // Ensuring submitted_by is set properly
         };
       
         console.log("Final Payload:", updatedFormData);
       
         try {
           await ADDTask(updatedFormData).unwrap();
           localStorage.removeItem("add_task_followup");
           toast.success("Task Added Successfully.");
           navigate("/leads");
         } catch (error) {
           console.error("Error submitting form data:", error?.data || error);
         }
       };
  
  


  return (
    <Grid
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
        mt:{md:"5%", xs:"20%"}
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <img alt="add" src={plus} />
        <Typography
          level="h4"
          sx={{
            mb: 2,
            textAlign: "center",
            textDecoration: "underline 2px rgb(243, 182, 39)",
            textUnderlineOffset: "8px",
          }}
        >
          Add Task
        </Typography>
      </Box>
      <Box>
        <Divider sx={{ width: "50%" }} />
      </Box>

      <Sheet
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "30px",
          // maxWidth: { xs: "100%", sm: 400 },
          mx: "auto",
          width: {md:"50vw",sm:"50vw"},
          boxShadow: "lg",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <FormControl>
              <FormLabel>Customer Name</FormLabel>
              <Input
                fullWidth
                placeholder="Customer Name"
                value={formData.name || "-"}
                onChange={(e) => handleChange("name", e.target.value)}
                sx={{ borderRadius: "8px" }}
                readOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Next FollowUp</FormLabel>
              <Input
                fullWidth
                type="date"
                placeholder="Next FollowUp"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                sx={{ borderRadius: "8px" }}
                slotProps={{
                  input: {
                    min: new Date().toISOString().split("T")[0],
                  },
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Reference</FormLabel>
              <Select value={formData.reference} placeholder= "Select References" onChange={(e, newValue) => handleChange("reference", newValue)} sx={{ borderRadius: "8px" }}>
                <Option value="By Call">By Call</Option>
                <Option value="By Meeting">By Meeting</Option>
              </Select>
            </FormControl>

            {/* <FormControl>
                          <FormLabel>Task Description</FormLabel>
                          <Input
                            fullWidth
                            placeholder="Task Description"
                            type="text"
                            value={formData.comment}
                            onChange={(e) => handleChange("comment", e.target.value)}
                            sx={{ borderRadius: "8px" }}
                            
                          />
                        </FormControl> */}

            {/* <FormControl>
              <FormLabel>By Whom</FormLabel>
              <Autocomplete
  multiple
  options={bdMembers}
  getOptionLabel={(option) => option.label}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  value={bdMembers.filter((member) => 
    formData.by_whom.includes(member.label)
  )}
  onChange={handleByWhomChange}
  renderInput={(params) => (
    <Input
      {...params}
      placeholder="Select BD Members"
      sx={{ minHeight: "40px", overflowY: "auto" }}
    />
  )}
/>

            </FormControl> */}
          {formData.reference === "By Call" ? (
  <FormControl>
    <FormLabel>By Whom</FormLabel>
    <Input
      fullWidth
      value={formData.by_whom}
      disabled
      sx={{ borderRadius: "8px", backgroundColor: "#f0f0f0" }}
    />
       <FormLabel sx={{marginTop:"1%"}}>Task Description</FormLabel>
                          <Input
                            fullWidth
                            placeholder="Task Description"
                            type="text"
                            value={formData.comment}
                            onChange={(e) => handleChange("comment", e.target.value)}
                            sx={{ borderRadius: "8px" }}
                            required
                            
                          />
  </FormControl>
) : formData.reference === "By Meeting" ? (
  <FormControl>
    <FormLabel>By Whom</FormLabel>
    <Autocomplete
      multiple
      options={bdMembers}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={bdMembers.filter((member) => formData.by_whom.includes(member.label))}
      onChange={handleByWhomChange}
      disableCloseOnSelect
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px" }}>
          <Checkbox
            checked={selected}
            sx={{
              color: selected ? "#007FFF" : "#B0BEC5", // Default gray, blue when selected
              "&.Mui-checked": { color: "#007FFF" }, // Active color
              "&:hover": { backgroundColor: "rgba(0, 127, 255, 0.1)" }, // Subtle hover effect
            }}
          />
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <Input
          {...params}
          placeholder="Select BD Members"
          sx={{ minHeight: "40px", overflowY: "auto", borderRadius: "8px" }}
        />
      )}
    />
    <FormLabel sx={{marginTop:"1%"}}>Task Description</FormLabel>
                          <Input
                            fullWidth
                            placeholder="Task Description"
                            type="text"
                            value={formData.comment}
                            onChange={(e) => handleChange("comment", e.target.value)}
                            sx={{ borderRadius: "8px" }}
                            required
                          />
  </FormControl>
) : null}

            

            <Stack flexDirection="row" justifyContent="center">
               
              <Button
                type="submit"
                sx={{
                  borderRadius: "8px",
                  background: "#1976d2",
                  color: "white",
                  "&:hover": { background: "#1565c0" },
                  
                }}
                disabled={isLoading || isFetchingUsers}
              >
                 {isLoading || isFetchingUsers ? "Submitting..." : "Submit"}
              </Button>&nbsp;&nbsp;
              <Button
              onClick={(() => {
                localStorage.removeItem("add_task_followup");
                 navigate("/leads")
              })}
                sx={{
                  borderRadius: "8px",
                  background: "#f5f5f5",
                  color: "black",
                  border: "1px solid #ddd",
                  "&:hover": { background: "#d6d6d6" },
                  
                }}
              >
                Back
              </Button>
            </Stack>
          </Stack>
        </form>
      </Sheet>
    </Grid>
  );
};

export default FormComponent2;