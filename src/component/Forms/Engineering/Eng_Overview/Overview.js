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
import { useGetModuleCategoryByIdQuery } from "../../../../redux/Eng/templatesSlice";

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
      newUploads[categoryIndex][fileIndex] = file;
      return newUploads;
    });
  };

  const isAnyFileUploaded = Object.values(fileUploads).some(
    (fileGroup) => Object.keys(fileGroup).length > 0
  );

  const handleSubmit = () => {
    const uploadedData = [];

    Object.entries(fileUploads).forEach(([categoryIndex, fileGroup]) => {
      Object.entries(fileGroup).forEach(([fileIndex, file]) => {
        uploadedData.push({
          categoryItemIndex: categoryIndex,
          fileIndex: fileIndex,
          file: file,
        });
      });
    });

    console.log("Submitting uploaded files:", uploadedData);
    alert("Files ready for submission! Check console for data.");
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
                      <Typography level="title-md" fontWeight="lg">
                        📄 {item.name}
                      </Typography>
                      <Typography
                        level="body-sm"
                        sx={{ mt: 0.5, color: "text.secondary" }}
                      >
                        {item.description}
                      </Typography>

                      <Typography
                        level="body-xs"
                        sx={{
                          mt: 1,
                          mb: 1,
                          fontWeight: "md",
                          color: "primary.plainColor",
                        }}
                      >
                        Max Uploads Allowed: {item.maxFiles}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          mt: 1,
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
                              }}
                            />
                          )
                        )}
                      </Box>
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
