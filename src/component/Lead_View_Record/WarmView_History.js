import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Sheet,
  Typography,
  Box,
  Divider,
  Button,
  Modal,
  Grid,
  Stack,
  FormControl,
  Input,
  FormLabel,
  Select,
  Option,
  Autocomplete,
  Checkbox,
  RadioGroup,
  Radio,
  ModalDialog,
} from "@mui/joy";
import Img1 from "../../assets/follow_up_history.png";
import {

  useAddWarmuptoDeadMutation,
  useAddWarmuptoFollowupMutation,
  useAddWarmuptoWonMutation,
  useGetEntireLeadsQuery,
  useUpdateWarmMutation,
} from "../../redux/leadsSlice";
import {
  useAddTasksMutation,
  useGetTasksHistoryQuery,
} from "../../redux/tasksSlice";
import { useGetLoginsQuery } from "../../redux/loginSlice";
import { toast } from "react-toastify";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

const WarmLeadsHistory = () => {
     const navigate = useNavigate();
     const { enqueueSnackbar } = useSnackbar();
     const [open, setOpen] = useState(false); // Ensure it's false initially
 
     const [selectedOptions, setSelectedOptions] = useState({ loa: false, ppa: false });
     const [selectedRadio, setSelectedRadio] = useState("");
     const [otherRemarks, setOtherRemarks] = useState("");
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [openAddTaskModal, setOpenAddTaskModal] = useState(false);
     
     // API Hooks
    const [updateLead] = useUpdateWarmMutation();
    const [WarmupToFollowup] = useAddWarmuptoFollowupMutation();
    const [WarmupToWon] = useAddWarmuptoWonMutation();
    const [WarmupToDead] = useAddWarmuptoDeadMutation();

     const { data: getLead = {} } = useGetEntireLeadsQuery();
     const { data: getTask = [] } = useGetTasksHistoryQuery();
     const { data: usersData = [] } = useGetLoginsQuery();
     const [ADDTask] = useAddTasksMutation();
   
     // Extract data
     const getTaskArray = useMemo(() => (Array.isArray(getTask) ? getTask : getTask?.data || []), [getTask]);
     const getLeadArray = useMemo(() => [
       ...(getLead?.lead?.initialdata || []),
       ...(getLead?.lead?.followupdata || []),
       ...(getLead?.lead?.warmdata || []),
       ...(getLead?.lead?.wondata || []),
       ...(getLead?.lead?.deaddata || []),
     ], [getLead]);
   
     // Get Lead ID
     const LeadId = localStorage.getItem("view_warm_history");
     
     const lead = getLeadArray.find((lead) => String(lead.id) === LeadId) || null;
     const filteredTasks = getTaskArray.filter((task) => String(task.id) === LeadId);
   
     // Fetch BD Members
     const bdMembers = useMemo(() => {
       return (usersData?.data || []).filter((user) => user.department === "BD").map((member) => ({ label: member.name, id: member._id }));
     }, [usersData]);
   
     // Retrieve user session
     const [user, setUser] = useState(null);
     useEffect(() => {
       const userSessionData = localStorage.getItem("userDetails");
       if (userSessionData) setUser(JSON.parse(userSessionData));
     }, []);
   
     // Form Data State
     const [formData, setFormData] = useState({
       id: "",
       name: "",
       date: "",
       reference: "",
       by_whom: "",
       task_detail: "",
     });
   
     // Handle Input Changes
     const handleChange = (field, value) => {
       setFormData((prev) => ({ ...prev, [field]: value }));
       if (field === "reference" && (value === "By Call" || value === "By Meeting") && user?.name) {
         setFormData((prev) => ({ ...prev, by_whom: user.name }));
       }
     };
   
     const handleByWhomChange = (_, newValue = []) => {
       setFormData((prev) => ({ ...prev, by_whom: newValue.map((member) => member.label).join(", ") }));
     };
   
     // Handle Task Submission
     const handleSubmitTask = async (e) => {
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
       try {
         await ADDTask(updatedFormData).unwrap();
         toast.success("🎉 Task added successfully!");
         navigate("/dash_task");
         handleCloseAddTaskModal();
       } catch (error) {
         toast.error("Failed to add task.");
       }
     };
   
     const handleOpenAddTaskModal = (task = null) => {
       setFormData({
         id: String(LeadId),
         name: task?.name || lead?.c_name || "",
         date: task?.date || "",
         reference: task?.reference || "",
         task_detail: task?.task_detail || "",
         by_whom: task?.by_whom || "",
       });
       setOpenAddTaskModal(true);
     };
   
     const handleCloseAddTaskModal = () => {
       setOpenAddTaskModal(false);
       setTimeout(() => setFormData({ id: "", name: "", date: "", reference: "", task_detail: "", by_whom: "" }), 300);
     };
 
     const handleOpen = () => setOpen(true);
 const handleClose = () => setOpen(false);
 
 const handleRadioChange = (value) => {
   setSelectedRadio(value);
   if (value !== "Others") {
     setOtherRemarks("");
   }
 };
 
 const handleCheckboxChange = (option) => {
   setSelectedOptions((prev) => ({
     ...prev,
     [option]: !prev[option],
   }));
 };
   
     // Handle Lead Submission
     const handleSubmit = async () => {
 const isAnyCheckboxChecked = Object.values(selectedOptions).some((val) => val);
 
         if (!selectedRadio && !isAnyCheckboxChecked) {
             toast.error("Please select at least one option.");
             return;
           }
         
       if (!LeadId) {
         enqueueSnackbar("No valid Lead ID available.", { variant: "error" });
         return;
       }
       if (
        (selectedRadio === "loi" || selectedRadio === "token_money") &&
        (selectedOptions.loa || selectedOptions.ppa)
      ) {
        enqueueSnackbar("You are choosing the wrong field combination! Please Refresh it.", {
          variant: "warning",
        });
        return;
      }

       try {
         setIsSubmitting(true);
         const response = await updateLead({
          id: LeadId,
          loi: selectedRadio === "loi" ? "Yes" : "No",
          // loa: selectedOptions["loa"] ? "Yes" : "No",
          // ppa: selectedOptions["ppa"] ? "Yes" : "No",
          token_money: selectedRadio === "token_money" ? "Yes" : "No",
          other_remarks: selectedRadio === "Others" ? otherRemarks : "",
        }).unwrap();
   
         const updatedId = response?.data?.id;
         if (!updatedId) {
           enqueueSnackbar("Warning: Response does not contain an ID.", { variant: "warning" });
           return;
         }
         enqueueSnackbar("Consignment Accepted!", { variant: "success" });
         let postResponse;
         if (selectedRadio === "token_money") {
          postResponse = await WarmupToWon({ id: updatedId }).unwrap();
          enqueueSnackbar("Lead moved from Warm to Won!", { variant: "success" });
        } else if (selectedRadio === "Others") {
          postResponse = await WarmupToDead({ id: updatedId }).unwrap();
          enqueueSnackbar("Lead moved from Warm to Dead!", { variant: "success" });
        } else if (selectedRadio === "loi") {
          postResponse = await WarmupToFollowup({ id: updatedId }).unwrap();
          enqueueSnackbar("Lead moved from Warm to Followup!", { variant: "success" });
        }
   
         // enqueueSnackbar("Lead updated successfully!", { variant: "success" });
         if (postResponse) setTimeout(() => navigate("/leads"), 1000);
       } catch (error) {
         enqueueSnackbar("Error processing request", { variant: "error" });
       } finally {
         setIsSubmitting(false);
       }
     };

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Box textAlign="center" mb={3}>
                <img src={Img1} alt="Follow Up" style={{ width: 60 }} />
                <Typography level="h2" sx={{ color: '#D78827', fontWeight: 'bold' }}>
                    View History
                </Typography>
            </Box>

                  {/***---- Add Task Modal ------*/}
                  <Modal open={openAddTaskModal} onClose={handleCloseAddTaskModal}>
                    <Grid
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        height: "100%",
                        mt: { md: "5%", xs: "20%" },
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
                        {/* <img alt="add" src={plus} /> */}
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
                          width: { md: "50vw", sm: "50vw" },
                          boxShadow: "lg",
                        }}
                      >
                        <form onSubmit={handleSubmitTask}>
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
                              <Select
                                value={formData.reference}
                                placeholder="Select References"
                                onChange={(e, newValue) =>
                                  handleChange("reference", newValue)
                                }
                                sx={{ borderRadius: "8px" }}
                              >
                                <Option value="By Call">By Call</Option>
                                <Option value="By Meeting">By Meeting</Option>
                              </Select>
                            </FormControl>
            
                            {formData.reference === "By Call" ? (
                              <FormControl>
                                <FormLabel>By Whom</FormLabel>
                                <Input
                                  fullWidth
                                  value={formData.by_whom}
                                  disabled
                                  sx={{
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f0f0",
                                  }}
                                />
                                <FormLabel sx={{ marginTop: "1%" }}>
                                  Task Description
                                </FormLabel>
                                <Input
                                  fullWidth
                                  placeholder="Task Description"
                                  type="text"
                                  value={formData.task_detail}
                                  onChange={(e) =>
                                    handleChange("task_detail", e.target.value)
                                  }
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
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value.id
                                  }
                                  value={bdMembers.filter((member) =>
                                    formData.by_whom.includes(member.label)
                                  )}
                                  onChange={handleByWhomChange}
                                  disableCloseOnSelect
                                  renderOption={(props, option, { selected }) => (
                                    <li
                                      {...props}
                                      key={option.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "5px",
                                      }}
                                    >
                                      <Checkbox
                                        checked={selected}
                                        sx={{
                                          color: selected ? "#007FFF" : "#B0BEC5", // Default gray, blue when selected
                                          "&.Mui-checked": {
                                            color: "#007FFF",
                                          }, // Active color
                                          "&:hover": {
                                            backgroundColor: "rgba(0, 127, 255, 0.1)",
                                          }, // Subtle hover effect
                                        }}
                                      />
                                      {option.label}
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <Input
                                      {...params}
                                      placeholder="Select BD Members"
                                      sx={{
                                        minHeight: "40px",
                                        overflowY: "auto",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  )}
                                />
                                <FormLabel sx={{ marginTop: "1%" }}>
                                  Task Description
                                </FormLabel>
                                <Input
                                  fullWidth
                                  placeholder="Task Description"
                                  type="text"
                                  value={formData.task_detail}
                                  onChange={(e) =>
                                    handleChange("task_detail", e.target.value)
                                  }
                                  sx={{ borderRadius: "8px" }}
                                  required
                                />
                              </FormControl>
                            ) : null}
            
                            <Stack flexDirection="row" justifyContent="center">
                              <Button
                                type="submit"
                                disabled={isSubmitting}
                                sx={{
                                  borderRadius: "8px",
                                  background: isSubmitting ? "#9e9e9e" : "#1976d2", // Gray when disabled
                                  color: "white",
                                  "&:hover": {
                                    background: isSubmitting ? "#9e9e9e" : "#1565c0",
                                  },
                                }}
                              >
                                {isSubmitting ? "Submitting..." : "Submit"}
                              </Button>
                              &nbsp;&nbsp;
                              <Button
                                onClick={handleCloseAddTaskModal}
                                sx={{
                                  borderRadius: "8px",
                                  background: "#f44336",
                                  color: "white",
                                  "&:hover": { background: "#d32f2f" },
                                }}
                              >
                                Close
                              </Button>
                            </Stack>
                          </Stack>
                        </form>
                      </Sheet>
                    </Grid>
                  </Modal>
            
                  {/***---- NextStage Modal ------*/}
                  <Modal open={open} onClose={handleClose}>
                    <ModalDialog size="md" sx={{ maxWidth: "100%" }}>
                         <Box
                      sx={{
                        width: "90%",
                        maxWidth: "500px",
                        bgcolor: "background.paper",
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        mx: "auto",
                        mt: 5,
                      }}
                    >
                      <Typography level="h4">
                        Select Options as per your Requirements
                      </Typography>
                      <FormControl>
                        <FormLabel>Choose Consignment:</FormLabel>
                        <RadioGroup
                                  value={selectedRadio}
                                  onChange={(e) => handleRadioChange(e.target.value)}
                                >
                                  <Radio value="loi" label="Follow-up Once More" />
                                  <Radio value="token_money" label="Token Money" />
                                  <Radio value="Others" label="Others" />
                                </RadioGroup>
            
                        {selectedRadio === "Others" && (
                          <Input
                            placeholder="Enter your custom option"
                            value={otherRemarks}
                            onChange={(e) => setOtherRemarks(e.target.value)}
                            required
                          />
                        )}
            
                        {/* Checkboxes for LOA and PPA */}
                        {/* <FormLabel>Additional Options:</FormLabel>
                        <Stack spacing={1}>
                          {["loa", "ppa"].map((option) => (
                            <Checkbox
                              key={option}
                              label={option.toUpperCase()}
                              checked={selectedOptions[option]}
                              onChange={() => handleCheckboxChange(option)}
                            />
                          ))}
                        </Stack> */}
                      </FormControl>
                      <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                        <Button variant="plain" onClick={handleClose}>
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Submit"}
                        </Button>
                      </Stack>
                    </Box>
                    </ModalDialog>
                   
                  </Modal>

           {lead ? (
             <Sheet
               variant="soft"
               sx={{
                 p: 3,
                 mb: 3,
                 backgroundColor: "#E3F2FD",
                 borderRadius: "16px",
                 boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                 display: "flex",
                 flexDirection: "column",
                 gap: 2,
               }}
             >
               <Box
                 sx={{
                   display: "flex",
                   justifyContent: "space-between",
                   alignItems: "center",
                 }}
               >
                 <Typography
                   level="h5"
                   sx={{ fontWeight: "bold", color: "#1976D2", letterSpacing: 0.5 }}
                 >
                   🧾 Client Information
                 </Typography>
                 <Box sx={{ display: "flex", gap: 1.5 }}>
                   <Button
                     variant="solid"
                     color="primary"
                     onClick={handleOpenAddTaskModal}
                   >
                     ➕ Add Task
                   </Button>
                   <Button variant="solid" color="success" onClick={handleOpen}>
                     ⏭ Next Stage
                   </Button>
                 </Box>
               </Box>
               <Divider />
               <Typography sx={{ fontSize: "1.05rem", color: "#333" }}>
                 <strong>Client Name:</strong> {lead.c_name || "N/A"} &nbsp;|&nbsp;
                 <strong>POC:</strong> {lead.submitted_by || "N/A"} &nbsp;|&nbsp;
                 <strong>Company:</strong> {lead.company || "N/A"} &nbsp;|&nbsp;
                 <strong>Location:</strong> {lead.state || "N/A"}
               </Typography>
             </Sheet>
           ) : (
             <Sheet
               variant="soft"
               sx={{
                 p: 3,
                 mb: 3,
                 backgroundColor: "#F0F0F0",
                 borderRadius: "16px",
                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                 display: "flex",
                 flexDirection: "column",
                 gap: 2,
               }}
             >
               <Skeleton variant="text" level="h5" width="40%" />
               <Skeleton variant="rectangular" height={40} width="30%" />
               <Divider />
               <Skeleton variant="text" width="100%" />
               <Skeleton variant="text" width="90%" />
             </Sheet>
           )}
           
           
                 <Sheet
                   variant="outlined"
                   sx={{
                     borderRadius: "16px",
                     overflow: "hidden",
                     boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                     backgroundColor: "#fff",
                   }}
                 >
                   <Table
                     borderAxis="both"
                     size="md"
                     sx={{
                       "& thead th": {
                         backgroundColor: "#F5F5F5",
                         fontWeight: "bold",
                         fontSize: "1.05rem",
                         color: "#333",
                         textTransform: "uppercase",
                         textAlign: "left",
                         px: 2,
                         py: 1.5,
                       },
                       "& tbody td": {
                         fontSize: "1rem",
                         color: "#444",
                         px: 2,
                         py: 1.2,
                         borderBottom: "1px solid #eee",
                       },
                     }}
                   >
                     <thead>
                       <tr>
                         <th>Date</th>
                         <th>Reference</th>
                         <th>By Whom</th>
                         <th>Feedback</th>
                         <th>Submitted By</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredTasks.length > 0 ? (
                         filteredTasks.map((row, index) => (
                           <tr key={index}>
                             <td>{row.date || "N/A"}</td>
                             <td>{row.reference || "N/A"}</td>
                             <td>{row.by_whom || "N/A"}</td>
                             <td
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxWidth: "300px",
                        }}
                      >
                        {row.comment || "N/A"}
                      </td>
                             <td>{row.submitted_by || "N/A"}</td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td
                             colSpan="5"
                             style={{
                               textAlign: "center",
                               padding: "16px",
                               fontStyle: "italic",
                               color: "#888",
                             }}
                           >
                             💤 No task history available.
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </Table>
                 </Sheet>
        </Box>
    );
};

export default WarmLeadsHistory;
