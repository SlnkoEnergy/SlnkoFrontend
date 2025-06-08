import React, { useState } from "react";
import {
  Box,
  Sheet,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
} from "@mui/joy";
import { useSearchParams } from "react-router-dom";
import {
  useGetModuleCategoryByIdQuery,
  useUpdateAttachmentStatusMutation,
  useUpdateModuleCategoryMutation,
} from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";

const Overview = () => {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [fileUploads, setFileUploads] = useState({});

  const pidFromUrl = searchParams.get("project_id");
  const projectId = pidFromUrl;

  const { data, isLoading, isError } = useGetModuleCategoryByIdQuery(
    { projectId, engineering: selected },
    { skip: !projectId }
  );

  const categoryData = {
    Electrical: [],
    Mechanical: [],
    Civil: [],
    plant_layout: [],
    boq: [],
  };

  const project = data?.data || "-";

  if (project?.items?.length) {
    project.items.forEach((item) => {
      const template = item.template_id;
      const category = template?.engineering_category;

      if (category && categoryData[category]) {
        categoryData[category].push({
          name: template.name,
          description: template.description,
          maxFiles: template.file_upload?.max_files || 0,
          attachmentUrls: item.current_attachment?.attachment_url || [],
        });
      }
    });
  }

  const handleFileChange = (categoryIndex, fileIndex, file) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };

      if (!newUploads[categoryIndex]) {
        newUploads[categoryIndex] = {};
      }

      newUploads[categoryIndex][fileIndex] = {
        file,
        fileName: file.name,
        // Add other metadata if needed
      };

      return newUploads;
    });
  };

  const isAnyFileUploaded = Object.values(fileUploads).some(
    (fileGroup) => Object.keys(fileGroup).length > 0
  );

  const [updateModuleCategory] = useUpdateModuleCategoryMutation();

  const handleSubmit = async () => {
    const uploadedData = [];

    Object.entries(fileUploads).forEach(([categoryIndex, fileGroup]) => {
      Object.entries(fileGroup).forEach(([fileIndex, fileObj]) => {
        uploadedData.push({
          categoryItemIndex: Number(categoryIndex),
          fileUrl: fileObj.file, // This should be the actual URL string if your backend expects URLs
        });
      });
    });

    if (!uploadedData.length) {
      toast.error("No files selected.");
      return;
    }

    try {
      const updatedItems = uploadedData.map((data) => {
        const item = project.items[data.categoryItemIndex];
        const templateId =
          typeof item.template_id === "string"
            ? item.template_id
            : item.template_id._id;

        return {
          template_id: templateId,
          attachment_urls: [data.fileUrl], // your backend expects URL strings here
        };
      });

      console.log("Items being sent:", updatedItems);

      const response = await updateModuleCategory({
        items: updatedItems,
      }).unwrap();

      console.log("Updated successfully:", response);
      toast.success("Module Category updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update module category.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "85vw",
        bgcolor: "background.body",
        p: 4,
        marginLeft: "13%",
      }}
    >
      <Box sx={{ display: "flex", flexGrow: 1, gap: 3 }}>
        {/* Sidebar */}
        <Sheet
          variant="outlined"
          sx={{
            width: 240,
            p: 2,
            borderRadius: "lg",
            boxShadow: "sm",
            bgcolor: "background.surface",
          }}
        >
          <Typography level="h6" fontWeight="lg" sx={{ mb: 2 }}>
            Categories
          </Typography>
          <List>
            {Object.keys(categoryData).map((category) => (
              <ListItem key={category} sx={{ mb: 1 }}>
                <Button
                  fullWidth
                  variant={selected === category ? "solid" : "soft"}
                  color={selected === category ? "primary" : "neutral"}
                  onClick={() => setSelected(category)}
                  sx={{ fontWeight: 600 }}
                  disabled={isLoading}
                >
                  {category}
                </Button>
              </ListItem>
            ))}
          </List>
        </Sheet>

        {/* Main Content */}
        {/* Main Content */}
        <Sheet
          variant="outlined"
          sx={{
            flexGrow: 1,
            p: 4,
            maxWidth: "100%",
            borderRadius: "lg",
            boxShadow: "sm",
            overflowY: "auto",
            bgcolor: "#f9fafb",
          }}
        >
          <Typography level="h4" fontWeight="xl" sx={{ mb: 3 }}>
            {selected} Documentation
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : isError ? (
            <Typography color="danger">Error fetching data.</Typography>
          ) : (
            <>
              <Box sx={{ display: "grid", gap: 3 }}>
                {categoryData[selected].length > 0 ? (
                  categoryData[selected].map((item, index) => (
                    <Sheet
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: "lg",
                        boxShadow: "sm",
                        bgcolor: "background.surface",
                      }}
                    >
                      <Typography level="title-md" sx={{ mb: 1 }}>
                        📁 {item.name}
                      </Typography>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.secondary", mb: 2 }}
                      >
                        {item.description || "No description provided."}
                      </Typography>

                      <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                        Max Uploads Allowed: {item.maxFiles}
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(auto-fit, minmax(200px, 1fr))",
                          },
                          gap: 1.5,
                          mt: 1.5,
                        }}
                      >
                        {Array.from({ length: item.maxFiles }).map(
                          (_, fileIndex) => (
                            <input
                              key={fileIndex}
                              type="file"
                              onChange={(e) =>
                                handleFileChange(
                                  index,
                                  fileIndex,
                                  e.target.files[0]
                                )
                              }
                              style={{
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                backgroundColor: "#fff",
                                width: "100%",
                              }}
                            />
                          )
                        )}
                      </Box>

                      {item.attachmentUrls?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            level="body-xs"
                            sx={{ fontWeight: 500, mb: 0.5 }}
                          >
                            Previously Uploaded:
                          </Typography>
                          <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                            {item.attachmentUrls.map((url, i) => (
                              <li key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  File {i + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </Sheet>
                  ))
                ) : (
                  <Typography>No data found for {selected}.</Typography>
                )}
              </Box>

              {isAnyFileUploaded && (
                <Box sx={{ textAlign: "right", mt: 4 }}>
                  <Button
                    variant="solid"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: "lg",
                      borderRadius: "md",
                    }}
                  >
                    📤 Submit Files
                  </Button>
                </Box>
              )}
            </>
          )}
        </Sheet>
      </Box>
    </Box>
  );
};

export default Overview;
