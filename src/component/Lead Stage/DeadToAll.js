import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/joy";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAddDeadtoFollowupMutation,
  useAddDeadtoInitialMutation,
  useAddDeadtoWarmupMutation,
  useAddDeadtoWonMutation,
} from "../../redux/leadsSlice";

const CheckboxModal4 = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    loa: false,
    ppa: false,
  });

  const [selectedRadio, setSelectedRadio] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");

  const [DeadToFollowup] = useAddDeadtoFollowupMutation();
  const [DeadToWarmup] = useAddDeadtoWarmupMutation();
  const [DeadToInitial] = useAddDeadtoInitialMutation();
  const [DeadToWon] = useAddDeadtoWonMutation();

  const [LeadId, setLeadId] = useState(
    localStorage.getItem("stage_next3") || null
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

    console.log("LeadId:", LeadId);
    console.log("Selected Radio:", selectedRadio);
    console.log("Selected Options:", selectedOptions);

    try {
      setIsSubmitting(true);

      // Extract selected values
      const loiStatus = selectedRadio === "loi" ? "Yes" : "No";
      const loaStatus = selectedOptions.loa ? "Yes" : "No";
      const ppaStatus = selectedOptions.ppa ? "Yes" : "No";
      const tokenMoneySelected =
        selectedRadio === "token_money" ? "Yes" : "No";

      let postResponse;

      // ✅ Dead to Won
      if (tokenMoneySelected === "Yes") {
        console.log("Moving to DeadToWon");
        postResponse = await DeadToWon({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Won!", { variant: "success" });

        // ✅ Dead to Warm-up
      } else if (
        tokenMoneySelected !== "Yes" &&
        (loaStatus === "Yes" || ppaStatus === "Yes")
      ) {
        console.log("Moving to DeadToWarmup");
        postResponse = await DeadToWarmup({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Warm-up!", {
          variant: "success",
        });

        // ✅ Dead to Follow-up
      } else if (
        loiStatus === "Yes" &&
        loaStatus !== "Yes" &&
        ppaStatus !== "Yes"
      ) {
        console.log("Moving to DeadToFollowup");
        postResponse = await DeadToFollowup({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Follow-up!", {
          variant: "success",
        });

        // ✅ Dead to Initial (fallback)
      } else {
        console.log("Moving to DeadToInitial");
        postResponse = await DeadToInitial({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Initial!", {
          variant: "success",
        });
      }

      // Navigate after success
      if (postResponse) {
        setTimeout(() => {
          navigate("/leads");
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      enqueueSnackbar(error?.data?.message || "Error processing request", {
        variant: "error",
      });
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
              required
            />
          )}

          {/* Checkboxes for LOA and PPA */}
          <FormLabel>LOA & PPA:</FormLabel>
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

export default CheckboxModal4;
