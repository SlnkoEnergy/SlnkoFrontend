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
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import {
  useAddInitialtoDeadMutation,
  useAddInitialtoFollowupMutation,
  useAddInitialtoWarmupMutation,
  useAddInitialtoWonMutation,
  useUpdateInitialMutation,
  useUpdateInitialtoFollowupMutation,
} from "../../redux/leadsSlice";

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
  // const [InitialToWarmup] = useAddInitialtoWarmupMutation();
  // const [InitialToWon] = useAddInitialtoWonMutation();
  // const [InitialToDead] = useAddInitialtoDeadMutation();

  
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

  const handleSubmit = async () => {
    if (!LeadId) {
      console.error("No valid Lead ID available.");
      return;
    }
  
    try {
      const response = await updateLead({
        id: LeadId,
        loi: selectedRadio === "loi" ? "Yes" : "No",
        loa: selectedOptions["loa"] ? "Yes" : "No",
        ppa: selectedOptions["ppa"] ? "Yes" : "No",
        token_money: selectedRadio === "token_money" ? "Yes" : "No",
        other_remarks: selectedRadio === "Others" ? otherRemarks : "",
      }).unwrap();
  
      console.log("Update successful:", response);
      setOpen(false);
      navigate("/leads");
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };
  

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog size="md" sx={{ maxWidth: "90%" }}>
        <Typography level="h4">
          Select Options as per your Requirements
        </Typography>
        <FormControl>
          <FormLabel>Choose One:</FormLabel>
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
          <Button variant="solid" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default CheckboxModal;
