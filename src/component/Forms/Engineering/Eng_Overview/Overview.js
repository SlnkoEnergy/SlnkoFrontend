import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Sheet,
  Typography,
  Modal,
  ModalDialog,
} from "@mui/joy";
import axios from "axios";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetModuleCategoryByIdQuery } from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";

const Overview = () => {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [fileUploads, setFileUploads] = useState({});
  const [logModalData, setLogModalData] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const projectId = searchParams.get("project_id");

  const { data, isLoading } = useGetModuleCategoryByIdQuery(
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

  const templates = data?.data || [];

  if (Array.isArray(templates)) {
    templates.forEach((template) => {
      const category = template.engineering_category;
      const rawUrls = Array.isArray(template.attachment_urls)
        ? template.attachment_urls.flat()
        : [];

      if (category && categoryData[category]) {
        categoryData[category].push({
          templateId: template._id,
          name: template.name || "N/A",
          description: template.description || "No description provided.",
          maxFiles: template.file_upload?.max_files || 0,
          attachmentUrls: rawUrls,
        });
      }
    });
  }

  const handleMultiFileChange = (index, files) => {
    setFileUploads((prev) => ({
      ...prev,
      [index]: files.map((file) => ({
        file,
        fileName: file.name,
      })),
    }));
  };

  const isAnyFileSelected = Object.values(fileUploads).some(
    (files) => files.length > 0
  );

  const handleSubmit = async () => {
    const formData = new FormData();
    const uploadedItems = [];

    Object.entries(fileUploads).forEach(([index, files]) => {
      const item = categoryData[selected][index];
      const templateId = item.templateId;
      const attachmentNumber = `R0`;

      uploadedItems.push({
        template_id: templateId,
        attachment_urls: [
          {
            attachment_number: attachmentNumber,
            attachment_url: [],
          },
        ],
      });

      files.forEach((fileObj) => {
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
      });
    });

    try {
      await axios.put(
        `https://dev.api.slnkoprotrac.com/v1/engineering/update-module-category?projectId=${projectId}`,
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("authToken"),
          },
        }
      );
      toast.success("Module Category updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Update error:", error.response?.data || error.message);
      toast.error("Failed to update module category.");
    }
  };

  const handleLogsOpen = (urls) => {
    setLogModalData(urls);
    setShowLogsModal(true);
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
        {/* Category Selector */}
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

        {/* Template Cards */}
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
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "grid", gap: 3 }}>
            {categoryData[selected]?.length > 0 ? (
              categoryData[selected].map((item, index) => (
                <Sheet
                  key={index}
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: "lg",
                    boxShadow: "sm",
                    bgcolor: "background.surface",
                    position: "relative",
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

                  {/* File Input */}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files);
                      if (selectedFiles.length > item.maxFiles) {
                        toast.error(
                          `You can only upload up to ${item.maxFiles} files.`
                        );
                        return;
                      }
                      handleMultiFileChange(index, selectedFiles);
                    }}
                    style={{
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      backgroundColor: "#fff",
                      width: "100%",
                      marginTop: "8px",
                    }}
                  />

                  {/* File Previews */}
                  {fileUploads[index]?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {fileUploads[index].map((f, i) => (
                        <Typography key={i} level="body-xs">
                          📎 {f.fileName}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Logs Button */}
                  {item.attachmentUrls.length > 0 && (
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleLogsOpen(item.attachmentUrls)}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                      }}
                    >
                      📂 Attachment Logs
                    </Button>
                  )}
                </Sheet>
              ))
            ) : (
              <Typography>No documentation found for {selected}.</Typography>
            )}
          </Box>

          {/* Submit Button */}
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
        </Sheet>
      </Box>

      {/* Attachment Logs Modal */}
      <Modal open={showLogsModal} onClose={() => setShowLogsModal(false)}>
        <ModalDialog>
          <Typography level="h5" sx={{ mb: 2 }}>
            📂 Attachment Logs
          </Typography>
          {logModalData.length === 0 ? (
            <Typography>No files uploaded.</Typography>
          ) : (
            <List>
              {logModalData.map((url, i) => (
                <ListItem key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1976d2", fontSize: "14px" }}
                  >
                    📎 {url.split("/").pop()}
                  </a>
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => setShowLogsModal(false)}
            >
              Close
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Overview;
