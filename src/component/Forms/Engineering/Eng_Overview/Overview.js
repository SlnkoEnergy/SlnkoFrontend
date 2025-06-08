import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Sheet,
  Typography,
} from "@mui/joy";
import axios from "axios";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetModuleCategoryByIdQuery } from "../../../../redux/Eng/templatesSlice";

const Overview = () => {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [fileUploads, setFileUploads] = useState({});

  const pidFromUrl = searchParams.get("project_id");
  const projectId = pidFromUrl;

  const { data, isLoading, isError, refetch } = useGetModuleCategoryByIdQuery(
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

  const project = data?.data || null;

  if (project?.items?.length) {
    project.items.forEach((item) => {
      const template = item.template_id;
      const category = template?.engineering_category;

      if (category && categoryData[category]) {
        const currentTemplateId =
          typeof template === "string" ? template : template?._id;

        categoryData[category].push({
          templateId: currentTemplateId,
          name: template?.name || "N/A",
          description: template?.description || "No description provided.",
          maxFiles: template?.file_upload?.max_files || 0,

          attachmentUrls: Array.isArray(item.current_attachment?.attachment_url)
            ? item.current_attachment?.attachment_url
            : item.current_attachment?.attachment_url
              ? [item.current_attachment.attachment_url]
              : [],
        });
      }
    });
  }

  const handleFileChange = (categoryItemDisplayIndex, fileInputIndex, file) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };
      if (!newUploads[categoryItemDisplayIndex]) {
        newUploads[categoryItemDisplayIndex] = {};
      }

      newUploads[categoryIndex][fileIndex] = {
        file,
        fileName: file.name,
      };

      return newUploads;
    });
  };

  const isAnyFileSelected = Object.values(fileUploads).some(
    (fileGroup) => Object.keys(fileGroup).length > 0
  );

  const handleSubmit = async () => {
    const formData = new FormData();
    const uploadedItems = [];

    Object.entries(fileUploads).forEach(([categoryIndex, fileGroup]) => {
      Object.entries(fileGroup).forEach(([fileIndex, fileObj]) => {
        const item = project.items[categoryIndex];
        const templateId =
          typeof item.template_id === "string"
            ? item.template_id
            : item.template_id._id;

        const attachmentNumber = `R${item.attachment_urls.length}`;

        uploadedItems.push({
          template_id: templateId,
          attachment_urls: [
            {
              attachment_number: attachmentNumber,
              attachment_url: [],
            },
          ],
        });

        formData.append("files", fileObj.file);
      });
    });

    if (uploadedItems.length === 0) {
      toast.error("No files selected.");
      return;
    }

    uploadedItems.forEach((item, i) => {
      formData.append(`items[${i}][template_id]`, item.template_id);

      item.attachment_urls.forEach((att, j) => {
        formData.append(
          `items[${i}][attachment_urls][${j}][attachment_number]`,
          att.attachment_number
        );

        att.attachment_url.forEach((url, k) => {
          formData.append(
            `items[${i}][attachment_urls][${j}][attachment_url][${k}]`,
            url
          );
        });
      });
    });

    console.log("🧾 Final items payload:", uploadedItems);
    console.log("📌 projectId:", projectId);

    try {
      const response = await axios.put(
        `https://dev.api.slnkoprotrac.com/v1/engineering/update-module-category?projectId=${projectId}`,
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("authToken"),
          },
        }
      );

      console.log("✅ Updated successfully:", response.data);
      toast.success("Module Category updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Update error:", error.response?.data || error.message);
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
        {/* Sidebar for Categories */}
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

        {/* Main Content Area for Documentation */}
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
            <Typography>Loading documentation...</Typography>
          ) : isError ? (
            <Typography color="danger">
              Error fetching documentation.
            </Typography>
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
                        {item.description}
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
                          (_, fileInputIndex) => (
                            <input
                              key={fileInputIndex}
                              type="file"
                              onChange={(e) =>
                                handleFileChange(
                                  index,
                                  fileInputIndex,
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

                      {/* {item.attachmentUrls?.length > 0 && (
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
                      )} */}
                    </Sheet>
                  ))
                ) : (
                  <Typography>
                    No documentation found for {selected}.
                  </Typography>
                )}
              </Box>

          
              {isAnyFileSelected && (
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
