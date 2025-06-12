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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetModuleCategoryByIdQuery } from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";

const Overview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [fileUploads, setFileUploads] = useState({});
  const [logModalData, setLogModalData] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isEngineering = user?.department === "Engineering";
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
          fileUploadEnabled: template.file_upload?.enabled || false,
          attachmentUrls: rawUrls,
          currentAttachments: template.current_attachment || [],
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

  const handleLogsOpen = (rawUrls) => {
    const grouped = {};

    rawUrls.forEach((url) => {
      // Extract the revision label, e.g., 'R0' or 'R1' from the URL
      const match = url.match(/\/(R\d+)\//);
      if (match) {
        const revision = match[1];
        if (!grouped[revision]) grouped[revision] = [];
        grouped[revision].push(url);
      }
    });

    // Convert grouped object to array format expected by modal
    const structured = Object.entries(grouped).map(([revision, urls]) => ({
      revision,
      urls,
    }));

    setLogModalData(structured);
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

        {/* Content */}
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
          {!isEngineering && (
            <Typography
              level="body-sm"
              sx={{ mb: 2, color: "warning.700", fontWeight: 500 }}
            >
              🔒 Upload access is restricted. You can only view/download files.
            </Typography>
          )}

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

                  {item.fileUploadEnabled && isEngineering && (
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
                  )}

                  {/* File Previews */}
                  {fileUploads[index]?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {fileUploads[index].map((f, i) => (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography level="body-xs">
                            📎 {f.fileName} ({(f.file.size / 1024).toFixed(1)}{" "}
                            KB)
                          </Typography>
                          <Button
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => {
                              setFileUploads((prev) => ({
                                ...prev,
                                [index]: prev[index].filter(
                                  (_, idx) => idx !== i
                                ),
                              }));
                            }}
                          >
                            ❌
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Current Attachments for CAM and others */}
                  {!isEngineering && item.currentAttachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography level="body-xs" sx={{ fontWeight: 500 }}>
                        📥 Current Attachments:
                      </Typography>
                      {item.currentAttachments.map((url, i) => (
                        <ListItem key={i} sx={{ p: 0, mt: 0.5 }}>
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
                    </Box>
                  )}

                  {/* Attachment Logs Button */}
                  {item.attachmentUrls.length > 0 && (
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleLogsOpen(item.attachmentUrls)}
                      sx={{ position: "absolute", top: 12, right: 12 }}
                    >
                      📂 Attachment Logs
                    </Button>
                  )}

                  <Button
                    variant="soft"
                    size="sm"
                    startDecorator="➕"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      navigate(
                        `/add_boq?projectId=${projectId}&module_template=${item.templateId}`
                      )
                    }
                  >
                    Add BOQ
                  </Button>
                </Sheet>
              ))
            ) : (
              <Typography>No documentation found for {selected}.</Typography>
            )}
          </Box>

          {isEngineering && isAnyFileSelected && (
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

      {/* Logs Modal */}
      <Modal open={showLogsModal} onClose={() => setShowLogsModal(false)}>
        <ModalDialog>
          <Typography level="h5" sx={{ mb: 2 }}>
            📂 Attachment Logs
          </Typography>

          {logModalData.length === 0 ? (
            <Typography>No files uploaded.</Typography>
          ) : (
            <List>
              {logModalData.map((revisionBlock, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography
                    level="body-sm"
                    sx={{ fontWeight: 600, mb: 1, color: "primary.plainColor" }}
                  >
                    📁 {revisionBlock.revision}
                  </Typography>
                  {Array.isArray(revisionBlock.urls) &&
                    revisionBlock.urls.map((url, j) => (
                      <ListItem key={j} sx={{ p: 0, pl: 2 }}>
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
                </Box>
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
