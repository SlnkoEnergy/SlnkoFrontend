import React, { useState, useEffect } from "react";
import { Modal, ModalDialog, Typography, Checkbox, Button, FormControl, FormLabel, Stack, Input, Radio, RadioGroup } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAddInitialtoFollowupMutation } from "../../redux/leadsSlice";

const CheckboxModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [otherValue, setOtherValue] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");

  const [InitialToFollowup, {isLoading}] = useAddInitialtoFollowupMutation(); 

  useEffect(() => {
    setOpen(true); // Open modal after component mounts
  }, []);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleRadioChange = (value) => {
    setSelectedRadio(value);
    if (value !== "Others") {
      setOtherValue("");
    }
  };

  const handleSubmit = () => {
    const finalSelection = { ...selectedOptions };
    finalSelection["Selected Radio"] = selectedRadio === "Others" ? otherValue : selectedRadio;

    console.log("Selected Options:", finalSelection);
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog size="md" sx={{ maxWidth: "90%" }}>
        <Typography level="h4">Select Options as per your Requirements</Typography>
        <FormControl>
          <FormLabel>Choose your Consignments:</FormLabel>
          <Stack spacing={2}>
          
            <FormLabel>Choose One:</FormLabel>
            <RadioGroup value={selectedRadio} onChange={(e) => handleRadioChange(e.target.value)}>
              <Radio value="LOI" label="LOI" />
              <Radio value="Token Money" label="Token Money" />
              <Radio value="Others" label="Others" />
              {selectedRadio === "Others" && (
                <Input
                  placeholder="Enter your custom option"
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value)}
                />
              )}
            </RadioGroup>

            {/* Checkboxes for LOA and PPA */}
            <FormLabel>Additional Options:</FormLabel>
            {["LOA", "PPA"].map((option) => (
              <Checkbox
                key={option}
                label={option}
                checked={!!selectedOptions[option]}
                onChange={() => handleCheckboxChange(option)}
              />
            ))}
          </Stack>
        </FormControl>
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button variant="plain" onClick={() => navigate('/leads')}>Cancel</Button>
          <Button variant="solid" onClick={handleSubmit}>Submit</Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};

export default CheckboxModal;
