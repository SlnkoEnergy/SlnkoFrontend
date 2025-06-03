import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Sheet,
  Stack,
  Typography,
  Grid,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { useAddTemplatesMutation } from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";

const CreateTemplate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    file_upload: {
      enabled: false,
      max_files: 0,
    },
    blockage: null,
    order: "",
    name: "",
    description: "",
    icon_image: "uploads/icons/default.png",
    boq: {
      enabled: false,
    },
  });

  const [addFolder] = useAddTemplatesMutation();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (group, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        file_upload: formData.file_upload,
        blockage: formData.blockage || null,
        order: formData.order,
        name: formData.name,
        description: formData.description,
        icon_image: formData.icon_image,
        boq: {
          enabled: formData.boq.enabled,
        },
      };

      const response = await addFolder(payload).unwrap();
      toast.success(response.message || "Template created successfully!");
      navigate("/temp_dash");
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template. Please try again.");
    }
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 800,
        mx: "auto",
        my: 4,
        p: 4,
        borderRadius: "lg",
        boxShadow: "lg",
        backgroundColor: "background.body",
      }}
    >
      <Typography level="h3" sx={{ mb: 3, textAlign: "center" }}>
        Create New Template
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Left Column */}
          <Grid xs={12} sm={6}>
            <FormControl required>
              <FormLabel>Template Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter template name"
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl required>
              <FormLabel>Order</FormLabel>
              <Input
                value={formData.order}
                onChange={(e) => handleChange("order", e.target.value)}
                placeholder="e.g. 1, 2"
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={12}>
            <FormControl>
              <FormLabel>Blockage ID (optional)</FormLabel>
              <Input
                value={formData.blockage ?? ""}
                onChange={(e) =>
                  handleChange("blockage", e.target.value.trim() || null)
                }
                placeholder="MongoDB ObjectId"
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <Checkbox
                checked={formData.boq.enabled}
                onChange={(e) =>
                  handleNestedChange("boq", "enabled", e.target.checked)
                }
                label="Enable BOQ"
              />
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormControl>
              <Checkbox
                checked={formData.file_upload.enabled}
                onChange={(e) =>
                  handleNestedChange("file_upload", "enabled", e.target.checked)
                }
                label="Enable File Upload"
              />
            </FormControl>
          </Grid>

          {formData.file_upload.enabled && (
            <Grid xs={12} sm={6}>
              <FormControl required>
                <FormLabel>Max Files</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={formData.file_upload.max_files}
                  onChange={(e) =>
                    handleNestedChange(
                      "file_upload",
                      "max_files",
                      Math.max(0, Number(e.target.value))
                    )
                  }
                  placeholder="0"
                />
              </FormControl>
            </Grid>
          )}
          <Grid xs={12}>
            <FormControl required>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                minRows={3}
                placeholder="Enter description"
              />
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => navigate("/temp_dash")}
              >
                Back
              </Button>
              <Button type="submit" size="lg">
                Submit Template
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Sheet>
  );
};

export default CreateTemplate;
