import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardOverflow,
  Typography,
  Grid,
  Box,
  IconButton,
  Modal,
  Input,
  Textarea,
  Select,
  Option,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Sheet,
  Stack,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import {
  useGetAllTemplatesQuery,
  useUpdateTemplatesSheetMutation,
} from "../../../../redux/Eng/templatesSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PVImage from "../../../../assets/eng/Engineering-pv.jpg";
import ModuleImage from "../../../../assets/eng/Engineering-module.jpg";

const templateImageMap = {
  "pv layout": PVImage,
  rounik: ModuleImage,
};

const getImageForTemplate = (name) => {
  const normalizedName = name?.trim().toLowerCase();
  return templateImageMap[normalizedName] || null;
};

const TemplateDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAllTemplatesQuery();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateTemplatesSheetMutation();

  const [open, setOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState(null);
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
    engineering_category: "",
  });

  const handleEditClick = (template) => {
    setEditTemplateId(template._id);
    setFormData({
      file_upload: {
        enabled: template.file_upload?.enabled || false,
        max_files: template.file_upload?.max_files || 0,
      },
      blockage: template.blockage || null,
      order: template.order || "",
      name: template.name || "",
      description: template.description || "",
      icon_image: template.icon_image || "uploads/icons/default.png",
      boq: {
        enabled: template.boq?.enabled || false,
      },
      engineering_category: template.engineering_category || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTemplateId(null);
  };

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
      await updateTemplate({
        _id: editTemplateId, // ✅ Correct key
        ...formData, // ✅ Flattened formData
      }).unwrap();
      toast.success("Template updated successfully!");
      setOpen(false);
      setEditTemplateId(null);
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update template.");
    }
  };

  if (isLoading) return <Typography>Loading templates...</Typography>;
  if (isError || !data?.data)
    return <Typography>Error loading templates</Typography>;

  const sortedTemplates = [...data.data].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <Box sx={{ px: 3, py: 2, marginLeft: "10%" }}>
      <Grid container spacing={2}>
        {sortedTemplates.map((template) => {
          const imageSrc =
            getImageForTemplate(template.name) ||
            `/${template.icon_image || "uploads/icons/default.png"}`;

          return (
            <Grid xs={12} sm={4} md={1.5} key={template._id}>
              <Card
                onClick={() => {
                  navigate(`/temp_pages?id=${template._id}`);
                }}
                variant="outlined"
                sx={{
                  borderRadius: "md",
                  boxShadow: "sm",
                  aspectRatio: "1 / 1.2",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "md",
                  },
                }}
              >
                <CardOverflow
                  variant="soft"
                  sx={{
                    flex: "0 0 65%",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.level1",
                    padding: 0,
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={imageSrc}
                    alt={template.name || "Module Template"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(template);
                    }}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      zIndex: 10,
                      bgcolor: "background.surface",
                      boxShadow: 1,
                      borderRadius: "50%",
                      padding: 0.5,
                      "&:hover": {
                        bgcolor: "primary.light",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </CardOverflow>

                <CardContent sx={{ px: 1.2, py: 0.8 }}>
                  <Typography level="title-sm" sx={{ mb: 0.4 }}>
                    {template.name || "Untitled"}
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "text.secondary", mb: 0.3 }}
                  >
                    {template.description
                      ? template.description.length > 40
                        ? `${template.description.slice(0, 40)}...`
                        : template.description
                      : "No description"}
                  </Typography>
                  {/* <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Order: {template.order || "N/A"}
                  </Typography> */}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            maxWidth: 800,
            width: "90%",
            mx: "auto",
            my: 4,
            p: 4,
            borderRadius: "lg",
            boxShadow: "lg",
            backgroundColor: "background.body",
          }}
        >
          <Typography level="h4" sx={{ mb: 3, textAlign: "center" }}>
            Edit Template
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
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

              <Grid xs={12}>
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
                      handleNestedChange(
                        "file_upload",
                        "enabled",
                        e.target.checked
                      )
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

              {/* Engineering Category Dropdown */}
              <Grid xs={12}>
                <FormControl required>
                  <FormLabel>Engineering Category</FormLabel>
                  <Select
                    value={formData.engineering_category}
                    onChange={(_, value) =>
                      handleChange("engineering_category", value)
                    }
                    placeholder="Select a category"
                  >
                    <Option value="civil">Civil</Option>
                    <Option value="mechanical">Mechanical</Option>
                    <Option value="electrical">Electrical</Option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12}>
                <FormControl required>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
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
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" loading={isUpdating}>
                    Save Changes
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Sheet>
      </Modal>
    </Box>
  );
};

export default TemplateDashboard;
