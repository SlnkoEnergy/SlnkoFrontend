import React, { useState } from "react";
import axios from "axios";
import Img1 from "../../../assets/Add New Module.png";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Typography,
  Card,
  CardContent,
  Sheet,
  Grid,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAddLTPanelMutation } from "../../../redux/Eng/ltsSlice";
import { toast } from "react-toastify";

const LTPannelForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: "",
    type: "",
    voltage: "",
    outgoing: "",
    incoming: "",
    status: "",
    submitted_by: "",
  });

  const [addLTPanel, { isLoading }] = useAddLTPanelMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage("");

    const updatedPayload = {
      ...formData,
    };

    try {
      const response = await addLTPanel(updatedPayload).unwrap();
      // console.log("Response:", response.data);
      toast.success("LTPanel added successfully!");
      setFormData({
        make: "",
        type: "",
        voltage: "",
        outgoing: "",
        incoming: "",
        status: "",
      });
      navigate("/module_sheet");
    } catch (error) {
      console.error("Error submitting form:", error);
      setResponseMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleBack = () => {
  //   setFormData({
  //     make: "",
  //     type: "",
  //     voltage: "",
  //     outgoing:"",
  //       incoming: "",
  //     status: "",
  //   });
  // };

  return (
    <Card variant="outlined" sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Typography level="h3" align="center" gutterBottom>
          LT Panel Form
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <img
            src={Img1}
            width="40px"
            height="40px"
            alt="Inverter"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Make</FormLabel>
                <Input
                  value={formData.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>type</FormLabel>
                <Input
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  required
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Cable Size Outgoing</FormLabel>
                <Input
                  value={formData.outgoing}
                  onChange={(e) => handleChange("outgoing", e.target.value)}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Cable Size incoming</FormLabel>
                <Input
                  value={formData.incoming}
                  onChange={(e) => handleChange("incoming", e.target.value)}
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(_, value) => handleChange("status", value)}
                  placeholder="Select Status"
                  required
                  sx={{
                    color:
                      formData.status === "Available"
                        ? "green"
                        : formData.status === "Not Available"
                          ? "red"
                          : "inherit",
                  }}
                >
                  <Option value="Available" sx={{ color: "green" }}>
                    ✅ Available
                  </Option>
                  <Option value="Not Available" sx={{ color: "red" }}>
                    ❌ Not Available
                  </Option>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>voltage</FormLabel>
                <Input
                  value={formData.voltage}
                  onChange={(e) => handleChange("voltage", e.target.value)}
                  required
                />
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => navigate("/module_sheet")}
                >
                  Back
                </Button>

                <Button type="submit" color="primary" sx={{ mx: 1 }}>
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>

          {responseMessage && (
            <Typography
              level="body-sm"
              sx={{ mt: 2, textAlign: "center", color: "primary.plainColor" }}
            >
              {responseMessage}
            </Typography>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LTPannelForm;
