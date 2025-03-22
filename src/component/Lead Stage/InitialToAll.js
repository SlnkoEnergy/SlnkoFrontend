import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Checkbox,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Input,
  Radio,
  RadioGroup,
  CircularProgress,
} from "@mui/joy";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import {
  useAddInitialtoDeadMutation,
  useAddInitialtoFollowupMutation,
  useAddInitialtoWarmupMutation,
  useAddInitialtoWonMutation,
  useUpdateInitialMutation,
} from "../../redux/leadsSlice";
import { toast } from "react-toastify";

const CheckboxModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    loa: false,
    ppa: false,
  });

  const [selectedRadio, setSelectedRadio] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");


  const [updateLead, { isLoading: isUpdating }] = useUpdateInitialMutation();
  const [InitialToFollowup] = useAddInitialtoFollowupMutation();
  const [InitialToWarmup] = useAddInitialtoWarmupMutation();
  const [InitialToWon] = useAddInitialtoWonMutation();
  const [InitialToDead] = useAddInitialtoDeadMutation();

  
  const [LeadId, setLeadId] = useState(
    localStorage.getItem("stage_next") || null
  );

  useEffect(() => {
    if (!LeadId) {
      console.error("Invalid Lead ID retrieved from localStorage.");
      return;
    }
    setOpen(true);
  }, [LeadId]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleRadioChange = (value) => {
    setSelectedRadio(value);
    if (value !== "Others") {
      setOtherRemarks("");
    }
  };

  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async () => {
    if (!LeadId) {
      enqueueSnackbar("No valid Lead ID available.", { variant: "error" });
      return;
    }
  
   
    if (
      (selectedRadio === "loi" || selectedRadio === "token_money" || selectedRadio === "Others") &&
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
        loa: selectedOptions["loa"] ? "Yes" : "No",
        ppa: selectedOptions["ppa"] ? "Yes" : "No",
        token_money: selectedRadio === "token_money" ? "Yes" : "No",
        other_remarks: selectedRadio === "Others" ? otherRemarks : "",
      }).unwrap();
  
      const updatedId = response?.data?.id;
      if (!updatedId) {
        enqueueSnackbar("Warning: Response does not contain an ID.", {
          variant: "warning",
        });
        setIsSubmitting(false);
        return;
      }
  
      enqueueSnackbar("Consignment Accepted!", { variant: "success" });
  
      let postResponse;
      
    
      if (selectedRadio === "loi") {
        postResponse = await InitialToFollowup({ id: updatedId }).unwrap();
        enqueueSnackbar("Lead moved from Initial to Followup!", { variant: "success" });
      } else if (selectedRadio === "token_money") {
        postResponse = await InitialToWon({ id: updatedId }).unwrap();
        enqueueSnackbar("Lead moved from Initial to Won!", { variant: "success" });
      } else if (selectedRadio === "Others") {
        postResponse = await InitialToDead({ id: updatedId }).unwrap();
        enqueueSnackbar("Lead moved from Initial to Dead!", { variant: "success" });
      } else if (selectedOptions.loa || selectedOptions.ppa) {
        postResponse = await InitialToWarmup({ id: updatedId }).unwrap();
        enqueueSnackbar("Lead moved from Initial to Warm!", { variant: "success" });
      }
  
    
      if (postResponse) {
        setTimeout(() => {
          navigate("/leads");
        }, 1000);
      }
    } catch (error) {
      console.error("rror updating or posting lead:", error);
      enqueueSnackbar("Error processing request", { variant: "error" });
    } finally {
      setIsSubmitting(false); 
    }
  };
  
  
  
  
  
  

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog size="md" sx={{ maxWidth: "90%" }}>
        <Typography level="h4">
          Select Options as per your Requirements
        </Typography>
        <FormControl>
          <FormLabel>Choose Consignment:</FormLabel>
          <RadioGroup
            value={selectedRadio}
            onChange={(e) => handleRadioChange(e.target.value)}
          >
            <Radio value="loi" label="LOI" />
            <Radio value="token_money" label="Token Money" />
            <Radio value="Others" label="Others" />
          </RadioGroup>

          {selectedRadio === "Others" && (
            <Input
              placeholder="Enter your custom option"
              value={otherRemarks}
              onChange={(e) => setOtherRemarks(e.target.value)}
            />
          )}

          {/* Checkboxes for LOA and PPA */}
          <FormLabel>Additional Options:</FormLabel>
          <Stack spacing={1}>
            {["loa", "ppa"].map((option) => (
              <Checkbox
                key={option}
                label={option.toUpperCase()}
                checked={selectedOptions[option]}
                onChange={() => handleCheckboxChange(option)}
              />
            ))}
          </Stack>
        </FormControl>
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button variant="plain" onClick={() => navigate("/leads")}>
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
      </ModalDialog>
    </Modal>
  );
};

export default CheckboxModal;
