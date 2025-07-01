// Overview.jsx
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useGetModuleCategoryByIdQuery,
  useUpdateModuleTemplateStatusMutation,
  useGetBoqProjectByProjectIdQuery,
  useUpdateModuleTemplateRemarksMutation,
} from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";

const Overview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [fileUploads, setFileUploads] = useState({});
  const [logModalData, setLogModalData] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateModuleTemplateStatusMutation();

  const [remarks, setRemarks] = useState("");
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [updateRemarks] = useUpdateModuleTemplateRemarksMutation();
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdRemarks, setHoldRemarks] = useState("");
  const [holdTemplateId, setHoldTemplateId] = useState(null);

  const [showAddRemarksModal, setShowAddRemarksModal] = useState(false);
  const [addRemarksText, setAddRemarksText] = useState("");
  const [remarksTemplateId, setRemarksTemplateId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("✅ Loaded user details:", parsedUser); // 🔍 Debug log
      setUser(parsedUser);
    } else {
      console.log("⚠️ No userDetails found in localStorage.");
    }
  }, []);

  const isEngineering = user?.department === "Engineering";
  const isCAM = user?.department === "CAM" || user?.department === "Projects";
  console.log("isCAM →", isCAM);
  const projectId = searchParams.get("project_id");

  const { data, isLoading } = useGetModuleCategoryByIdQuery(
    { projectId, engineering: selected },
    { skip: !projectId }
  );
  const {
    data: boqSummaryData,
    isLoading: isBoqLoading,
    error: boqError,
  } = useGetBoqProjectByProjectIdQuery(projectId, {
    skip: !projectId,
  });
  const categoryData = {
    Electrical: [],
    Mechanical: [],
    Civil: [],
    plant_layout: [],
    boq: [],
    summary: [],
  };

  const templates = data?.data || [];

  if (Array.isArray(templates)) {
    templates.forEach((template) => {
      const category = template.engineering_category;
      const rawUrls = Array.isArray(template.attachment_urls)
        ? template.attachment_urls.flat()
        : [];

      const latestStatus =
        template.current_status?.status.toLowerCase() || null;
      const latestRemarks = template.current_status?.remarks || "";
      if (category && categoryData[category]) {
        categoryData[category].push({
          templateId: template._id,
          name: template.name || "N/A",
          description: template.description || "No description provided.",
          maxFiles: template.file_upload?.max_files || 0,
          fileUploadEnabled: template.file_upload?.enabled || false,
          attachmentUrls: rawUrls,
          currentAttachments: template.current_attachment || [],
          latestStatus,
          latestRemarks,
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
    const userId = user?.userID;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    const uploadedItems = [];

    Object.entries(fileUploads).forEach(([index, files]) => {
      const item = categoryData[selected][index];
      const templateId = item.templateId;

      const statusHistory = [
        {
          status: "submitted",
          user_id: userId,
          timestamp: new Date().toISOString(),
          remarks: "",
        },
      ];

      uploadedItems.push({
        template_id: templateId,
        attachment_urls: [
          {
            attachment_number: `R0`,
            attachment_url: [],
          },
        ],
        status_history: statusHistory,
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
      formData.append(
        `items[${i}][attachment_urls][0][attachment_number]`,
        item.attachment_urls[0].attachment_number
      );
      item.status_history.forEach((status, k) => {
        formData.append(
          `items[${i}][status_history][${k}][status]`,
          status.status
        );
        formData.append(
          `items[${i}][status_history][${k}][user_id]`,
          status.user_id
        );
        formData.append(
          `items[${i}][status_history][${k}][timestamp]`,
          status.timestamp
        );
      });
    });

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/engineering/update-module-category?projectId=${projectId}`,
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
  const handleHold = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      const department = storedUser?.department || "";
      const userId = storedUser?.userId || storedUser?.name || "";

      if (!holdTemplateId) {
        toast.error("No template selected for hold.");
        return;
      }

      if (!department || !userId) {
        toast.error("User details missing.");
        return;
      }

      // Step 1: Change status to "hold"
      await updateStatus({
        projectId,
        moduleTemplateId: holdTemplateId,
        statusData: {
          status: "hold",
        },
      }).unwrap();

      // Step 2: Add remarks separately
      await updateRemarks({
        projectId,
        moduleTemplateId: holdTemplateId,
        statusData: {
          department,
          userId,
          text: holdRemarks.trim(),
        },
      }).unwrap();

      toast.success("Template held successfully.");
      setShowHoldModal(false);
      setHoldRemarks("");
      setHoldTemplateId(null);
    } catch (err) {
      console.error("❌ Hold failed:", err);
      toast.error(err?.data?.message || "Failed to hold template.");
    }
  };

  const handleUnhold = async (templateId) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      const department = storedUser?.department || "";
      const userId = storedUser?.userId || "";

      await updateStatus({
        projectId,
        moduleTemplateId: templateId,
        statusData: {
          status: "submitted",
          department: `${department}`,
          userId: `${userId}`,
          text: " ",
        },
      }).unwrap();

      toast.success("Template unheld successfully.");
    } catch (err) {
      console.error("❌ Failed to unhold template:", err);
      toast.error("Failed to unhold template.");
    }
  };

  const handleSubmitHold = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      const department = storedUser?.department;
      const userId = storedUser?.userId || storedUser?.name;

      if (!department) {
        toast.error("Department not found.");
        return;
      }

      await updateStatus({
        projectId,
        moduleTemplateId: holdTemplateId,
        statusData: {
          status: "hold",
          department: department,
          userId: userId,
          text: holdRemarks.trim(),
        },
      }).unwrap();

      toast.success("Template held successfully.");
      setShowHoldModal(false);
      setHoldRemarks("");
      setHoldTemplateId(null);
    } catch (err) {
      console.error("❌ Hold failed:", err);
      toast.error(err?.data?.message || "Failed to hold template.");
    }
  };

  const handleAddRemarks = async () => {
    if (!remarksTemplateId) {
      toast.error("No template selected for remarks.");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("userDetails"));
    const department = storedUser?.department || "";
    const userId = storedUser?.userId || storedUser?.name || "";

    if (!department || !userId) {
      toast.error("User details missing.");
      return;
    }

    try {
      await updateRemarks({
        projectId,
        moduleTemplateId: remarksTemplateId,
        statusData: {
          department,
          userId,
          text: addRemarksText.trim(),
        },
      }).unwrap();

      toast.success("Remarks added successfully.");
      setShowAddRemarksModal(false);
      setAddRemarksText("");
      setRemarksTemplateId(null);
      // Optionally refresh data here
    } catch (err) {
      console.error("❌ Failed to add remarks:", err);
      toast.error("Failed to add remarks.");
    }
  };

  const handleStatusChange = (statusType, templateId) => {
    if (statusType === "revised") {
      setActiveTemplateId(templateId); // save templateId in state
      setShowRemarksModal(true); // open remarks modal
    }
  };

  const handleApprove = async (templateId) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      const department = storedUser?.department || "";
      const userId = storedUser?.userId || "";
      await updateStatus({
        projectId,
        moduleTemplateId: templateId,
        statusData: {
          status: "approved",
          text: " ",
          department: `${department}`,
          userId: `${userId}`,
        },
      }).unwrap();

      toast.success("Template approved!");
    } catch (err) {
      console.error("Approve failed:", err);
      toast.error("Failed to approve template.");
    }
  };

  const handleSubmitRemarks = async () => {
    if (!activeTemplateId) {
      toast.error("No template selected for revision.");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("userDetails"));
      const department = storedUser?.department || "";
      const userId = storedUser?.userId || "";

      // Send all required fields to updateStatus
      await updateStatus({
        projectId,
        moduleTemplateId: activeTemplateId,
        statusData: {
          status: "revised",
          department: `${department}`,
          userId: `${userId}`,
          text: remarks.trim(),
        },
      }).unwrap();

      toast.success("Template revised successfully.");
      setShowRemarksModal(false);
      setRemarks("");
      setActiveTemplateId(null);
    } catch (err) {
      console.error("❌ Revision failed:", err);
      toast.error(err?.data?.message || "Failed to revise template.");
    }
  };

  console.log("templateId", activeTemplateId);

  const handleLogsOpen = (rawUrls) => {
    const grouped = {};
    rawUrls.forEach((url) => {
      const match = url.match(/\/(R\d+)\//);
      if (match) {
        const revision = match[1];
        if (!grouped[revision]) grouped[revision] = [];
        grouped[revision].push(url);
      }
    });
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

        <Sheet
          variant="outlined"
          sx={{
            flexGrow: 1,
            p: 4,
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
            {selected === "summary" ? (
              boqSummaryData && boqSummaryData.length > 0 ? (
                boqSummaryData.map((summary, i) => (
                  <Sheet
                    key={i}
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: "lg",
                      boxShadow: "sm",
                      bgcolor: "background.surface",
                    }}
                  >
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      📘 {summary.boq_category_name}
                    </Typography>

                    {summary.item?.current_data?.length > 0 ? (
                      summary.item.current_data.map((row, j) => (
                        <Box
                          key={j}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #ccc",
                            py: 1,
                          }}
                        >
                          <Typography level="body-sm" fontWeight="lg">
                            {row.name}
                          </Typography>
                          <Typography level="body-sm">
                            {row.values.map((v) => v.input_values).join(", ")}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography level="body-sm" sx={{ ml: 1 }}>
                        No data available.
                      </Typography>
                    )}
                  </Sheet>
                ))
              ) : (
                <Typography>No summary data found.</Typography>
              )
            ) : categoryData[selected]?.length > 0 ? (
              categoryData[selected].map((item, index) => {
                const isUploadDisabled = item.latestStatus === "approved";
                return (
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

                    {item.fileUploadEnabled &&
                      isEngineering &&
                      !isUploadDisabled &&
                      item.latestStatus !== "hold" && ( // Disable upload if status is hold
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

                    {fileUploads[index]?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {fileUploads[index].map((f, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography level="body-xs">
                              📎 {f.fileName} ({(f.file.size / 1024).toFixed(1)}{" "}
                              KB)
                            </Typography>
                            <Button
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() =>
                                setFileUploads((prev) => ({
                                  ...prev,
                                  [index]: prev[index].filter(
                                    (_, idx) => idx !== i
                                  ),
                                }))
                              }
                            >
                              ❌
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {item.currentAttachments.length > 0 &&
                      !(isCAM && item.latestStatus === "hold") && (
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
                    <Box sx={{ mt: 2 }}>
                      <Typography level="body-xs" sx={{ fontWeight: 500 }}>
                        Current Status:{" "}
                        <Typography
                          component="span"
                          level="body-xs"
                          fontWeight="bold"
                        >
                          {item.latestStatus || "N/A"}
                        </Typography>
                        {item.latestStatus === "revised" &&
                          Array.isArray(item.latestRemarks) &&
                          item.latestRemarks.length > 0 && (
                            <>
                              {" — Remarks: "}
                              {item.latestRemarks.map((remark, i) => (
                                <Typography
                                  key={remark._id || i}
                                  component="span"
                                  level="body-xs"
                                  sx={{ display: "block" }}
                                >
                                  {remark.department}: {remark.text}
                                </Typography>
                              ))}
                            </>
                          )}
                        {/* Show hold remarks if applicable */}
                        {item.latestStatus === "hold" &&
                          Array.isArray(item.latestRemarks) &&
                          item.latestRemarks.length > 0 && (
                            <>
                              <Typography sx={{ mt: 1, fontWeight: 500 }}>
                                Hold Remarks:
                              </Typography>
                              {item.latestRemarks.map((remark, i) => (
                                <Typography
                                  key={remark._id || i}
                                  component="span"
                                  level="body-xs"
                                  sx={{ display: "block" }}
                                >
                                  {remark.department}: {remark.text}
                                </Typography>
                              ))}
                            </>
                          )}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Attachment Logs & Add Boq */}
                      {item.attachmentUrls?.length > 0 && (
                        <>
                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handleLogsOpen(item.attachmentUrls)}
                            disabled={isCAM && item.latestStatus === "hold"}
                            sx={{
                              opacity:
                                isCAM && item.latestStatus === "hold" ? 0.5 : 1,
                              pointerEvents:
                                isCAM && item.latestStatus === "hold"
                                  ? "none"
                                  : "auto",
                            }}
                          >
                            📂 Attachment Logs
                          </Button>
                          <Button
                            size="sm"
                            variant="outlined"
                            color="neutral"
                            onClick={() => {
                              setRemarksTemplateId(item.templateId);
                              setShowAddRemarksModal(true);
                            }}
                          >
                            📝 Add Remarks
                          </Button>

                          {!isCAM && (
                            <Button
                              variant="soft"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/add_boq?projectId=${projectId}&module_template=${item.templateId}`
                                )
                              }
                            >
                              Add Boq
                            </Button>
                            
                          )}
                        </>
                      )}

                      {/* CAM Actions */}
                      {isCAM && item.latestStatus === "submitted" && (
                        <>
                          <Button
                            size="sm"
                            variant="soft"
                            color="success"
                            onClick={() => handleApprove(item.templateId)}
                            disabled={isUpdating}
                          >
                            ✅ Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="soft"
                            color="warning"
                            onClick={() => {
                              setActiveTemplateId(item.templateId);
                              setShowRemarksModal(true);
                            }}
                            disabled={isUpdating}
                          >
                            🔁 Revise
                          </Button>
                        </>
                      )}

                      {/* Hold/Unhold for Engineering */}
                      {isEngineering && (user?.name=== "Rishav Mahato" || user?.name==="Ranvijay Singh") &&item.latestStatus !== "hold" && (
                        <Button
                          size="sm"
                          variant="soft"
                          color="warning"
                          onClick={() => {
                            setHoldTemplateId(item.templateId);
                            setShowHoldModal(true);
                          }}
                          disabled={isUpdating}
                        >
                          🚧 Hold
                        </Button>
                      )}

                      {isEngineering && item.latestStatus === "hold" && (
                        <Button
                          size="sm"
                          variant="soft"
                          color="success"
                          onClick={() => handleUnhold(item.templateId)}
                          disabled={isUpdating}
                        >
                          🟢 Unhold
                        </Button>
                      )}
                    </Box>
                  </Sheet>
                );
              })
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
                sx={{ px: 4, py: 1.5, fontWeight: "lg", borderRadius: "md" }}
              >
                📤 Submit Files
              </Button>
            </Box>
          )}
        </Sheet>
      </Box>

      <Modal open={showLogsModal} onClose={() => setShowLogsModal(false)}>
        <ModalDialog>
          <Typography level="h5" sx={{ mb: 2 }}>
            📂 Attachment Logs
          </Typography>
          {logModalData.length === 0 ? (
            <Typography>No files uploaded.</Typography>
          ) : (
            <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
              <List>
                {logModalData.map((revisionBlock, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Typography
                      level="body-sm"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: "primary.plainColor",
                      }}
                    >
                      📁 {revisionBlock.revision}
                    </Typography>
                    {revisionBlock.urls.map((url, j) => (
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
            </Box>
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

      <Modal open={showRemarksModal} onClose={() => setShowRemarksModal(false)}>
        <ModalDialog>
          <Typography level="h6">Enter Remarks for Revision</Typography>
          <textarea
            style={{
              width: "100%",
              minHeight: "100px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              marginTop: "8px",
            }}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Write your remarks here..."
          />
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button
              variant="soft"
              color="neutral"
              onClick={() => setShowRemarksModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="warning"
              onClick={handleSubmitRemarks}
              loading={isUpdating}
              disabled={!remarks.trim()}
            >
              Submit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Modal open={showHoldModal} onClose={() => setShowHoldModal(false)}>
        <ModalDialog>
          <Typography level="h6">Enter Remarks for Hold</Typography>
          <textarea
            style={{
              width: "100%",
              minHeight: "100px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              marginTop: "8px",
            }}
            value={holdRemarks}
            onChange={(e) => setHoldRemarks(e.target.value)}
            placeholder="Write your remarks here..."
          />
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button
              variant="soft"
              color="neutral"
              onClick={() => setShowHoldModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="warning"
              onClick={handleSubmitHold}
              disabled={!holdRemarks.trim()}
            >
              Submit
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Modal open={showAddRemarksModal} onClose={() => setShowAddRemarksModal(false)}>
  <ModalDialog sx={{ width: 400, maxHeight: 500 }}>
    <Typography level="h6" sx={{ mb: 1 }}>
      Chat - Remarks
    </Typography>

    <Box
      sx={{
        maxHeight: 300,
        overflowY: "auto",
        p: 1,
        mb: 2,
        bgcolor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      {categoryData[selected]
        ?.find((item) => item.templateId === remarksTemplateId)
        ?.latestRemarks?.length > 0 ? (
        categoryData[selected]
          .find((item) => item.templateId === remarksTemplateId)
          .latestRemarks.map((remark, i) => (
            <Box
              key={remark._id || i}
              sx={{
                display: "flex",
                justifyContent:
                  remark.department === "Engineering" ? "flex-start" : "flex-end",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  p: 1.5,
                  bgcolor:
                    remark.department === "Engineering"
                      ? "primary.softBg"
                      : "success.softBg",
                  color:
                    remark.department === "Engineering"
                      ? "primary.plainColor"
                      : "success.plainColor",
                  borderRadius: "12px",
                  fontSize: "14px",
                  wordBreak: "break-word",
                }}
              >
                <Typography
                  level="body-xs"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {remark.department}
                </Typography>
                {remark.text}
              </Box>
            </Box>
          ))
      ) : (
        <Typography level="body-sm" sx={{ textAlign: "center", mt: 2 }}>
          No remarks yet.
        </Typography>
      )}
    </Box>

    <Box sx={{ display: "flex", gap: 1 }}>
      <textarea
        style={{
          flexGrow: 1,
          minHeight: "60px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
        }}
        value={addRemarksText}
        onChange={(e) => setAddRemarksText(e.target.value)}
        placeholder="Write a message..."
      />
      <Button
        variant="solid"
        color="primary"
        onClick={handleAddRemarks}
        disabled={!addRemarksText.trim()}
      >
        Send
      </Button>
    </Box>
  </ModalDialog>
</Modal>

    </Box>
  );
};

export default Overview;
