import React, { useState } from "react";
import { Modal, ModalDialog, Typography, Checkbox, Button, FormControl, FormLabel, Stack } from "@mui/joy";

const CheckboxModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  const options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleSubmit = () => {
    console.log("Selected Options:", selectedOptions);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog size="md" sx={{ maxWidth: "90%" }}>
          <Typography level="h4">Select Options</Typography>
          <FormControl>
            <FormLabel>Choose your preferences:</FormLabel>
            <Stack spacing={1}>
              {options.map((option) => (
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
            <Button variant="plain" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="solid" onClick={handleSubmit}>Submit</Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default CheckboxModal;
