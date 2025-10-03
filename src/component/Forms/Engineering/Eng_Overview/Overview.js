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
  IconButton,
  Select,
  Option,
} from "@mui/joy";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useGetModuleCategoryByIdQuery,
  useUpdateModuleTemplateStatusMutation,
  useGetBoqProjectByProjectIdQuery,
  useUpdateModuleTemplateRemarksMutation,
} from "../../../../redux/Eng/templatesSlice";
import { toast } from "react-toastify";
import { ChevronLeftIcon } from "lucide-react";
import CloudUpload from "@mui/icons-material/CloudUpload";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";

const Overview = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "Electrical";
  const [selected, setSelected] = useState(initialCategory);
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
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [uploadModal, setUploadModal] = useState({
    open: false,
    index: null,
    templateId: null,
    name: "",
    max: 0,
  });
  const [stagedFiles, setStagedFiles] = useState([]);

  console.log({ logModalData });
  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("✅ Loaded user details:", parsedUser);
      setUser(parsedUser);
    } else {
      console.log("⚠️ No userDetails found in localStorage.");
    }
  }, []);

  const isEngineering = user?.department === "Engineering";
  const isCAM = user?.department === "CAM" || user?.department === "Projects";

  const projectId = searchParams.get("project_id");
  const page = searchParams.get("page");

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

  // (kept as-is) your original categoryData block with duplicates
  const categoryData = {
    Electrical: [],
    Mechanical: [],
    Civil: [],
    plant_layout: [],
    boq: [],
    Equipment: [],
    Mechanical_Inspection: [],
    Electrical_Inspection: [],
    summary: [],
    Equipment: [],
    summary: [],
  };

  // 👉 ADDED: Allowed keys for SCM & helpers to filter & clamp selection
  const SCM_ALLOWED = ["boq", "Equipment"];

  const pickKeys = (obj, keys) =>
    keys.reduce((acc, k) => {
      if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
        acc[k] = obj[k];
      }
      return acc;
    }, {});

  const clampSelectedCategory = (sel, allowedKeys) => {
    if (allowedKeys.includes(sel)) return sel;
    return allowedKeys[0] || sel;
  };

  const templates = data?.data || [];

  if (Array.isArray(templates)) {
    templates.forEach((template) => {
      const category = template.engineering_category;
      const rawUrls = Array.isArray(template.attachment_urls)
        ? template.attachment_urls.flat()
        : [];

      const latestStatus =
        template.current_status?.status?.toLowerCase() || null;
      const latestRemarks = template.current_status?.remarks || "";
      if (category && categoryData[category]) {
        categoryData[category].push({
          templateId: template._id,
          name: template.name || "N/A",
          description: template.description || "No description provided.",
          maxFiles: template.file_upload?.max_files || 0,
          fileUploadEnabled: template.file_upload?.enabled || false,
          boqEnabled: template.boq?.enabled || false,
          attachmentUrls: rawUrls,
          currentAttachments: template.current_attachment || [],
          latestStatus,
          latestRemarks,
        });
      }
    });
  }

  // 👉 ADDED: Derive an effective category map based on user department
  const effectiveCategoryData = categoryData;

  const allowedKeys = Object.keys(effectiveCategoryData);

  // 👉 ADDED: Clamp selected category & URL param when user/data changes
  useEffect(() => {
    if (!allowedKeys.length) return;
    setSelected((prev) => clampSelectedCategory(prev, allowedKeys));
    setSearchParams((sp) => {
      const fromUrl = sp.get("category") || initialCategory;
      const fixed = clampSelectedCategory(fromUrl, allowedKeys);
      sp.set("category", fixed);
      return sp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, data]);

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

  const handleSubmit = async (index) => {
    const userId = user?.userID;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    const selectedFiles = fileUploads[index];

    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("No files selected for this folder.");
      return;
    }

    const formData = new FormData();

    const item = effectiveCategoryData[selected][index];
    const templateId = item.templateId;

    const statusHistory = [
      {
        status: "submitted",
        user_id: userId,
        timestamp: new Date().toISOString(),
        remarks: "",
      },
    ];

    formData.append(`items[0][template_id]`, templateId);
    formData.append(`items[0][attachment_urls][0][attachment_number]`, "R0");

    statusHistory.forEach((status, k) => {
      formData.append(`items[0][status_history][${k}][status]`, status.status);
      formData.append(
        `items[0][status_history][${k}][user_id]`,
        status.user_id
      );
      formData.append(
        `items[0][status_history][${k}][timestamp]`,
        status.timestamp
      );
    });

    selectedFiles.forEach((fileObj) => {
      formData.append("files", fileObj.file);
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
      toast.success(`Files submitted for "${item.name}" successfully!`);
      window.location.reload();
    } catch (error) {
      console.error("❌ Update error:", error.response?.data || error.message);
      toast.error("Failed to submit files for this folder.");
    }
  };

  const handleMultipleSubmitFiles = async (submitIndexArray) => {
    const userId = user?.userID;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    if (!Array.isArray(submitIndexArray) || submitIndexArray.length === 0) {
      toast.error("No submissions to upload.");
      return;
    }

    const formData = new FormData();

    const items = [];

    submitIndexArray.forEach((entry) => {
      const { template_id, files } = entry;

      if (!files || files.length === 0) return;

      files.forEach((file) => {
        formData.append("files", file);
      });

      items.push({
        template_id,
        status_history: [
          {
            status: "submitted",
            user_id: userId,
            timestamp: new Date().toISOString(),
            remarks: {},
          },
        ],
      });
    });

    // Attach metadata JSON to formData
    formData.append("data", JSON.stringify({ items }));

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

      toast.success("All selected files submitted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Upload Error:", error.response?.data || error.message);
      toast.error("Failed to submit files.");
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
      setActiveTemplateId(templateId);
      setShowRemarksModal(true);
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

  const handleLogsOpen = (rawUrls) => {
    const grouped = {};
    console.log({ rawUrls });
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

  const handleCategorySelect = (category) => {
    setSelected(category);
    searchParams.set("category", category);
    setSearchParams(searchParams);
  };

  // 👉 ADDED: safe onChange that clamps to allowed values without altering your existing handler
  const handleCategorySelectSafe = (category) => {
    const next = clampSelectedCategory(category, allowedKeys);
    setSelected(next);
    searchParams.set("category", next);
    setSearchParams(searchParams);
  };

  const handlePreview = async (url) => {
    if (/\.(pdf)$/i.test(url)) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPreviewFileUrl(blobUrl);
      } catch (error) {
        toast.error("Unable to preview PDF file.");
      }
    } else {
      setPreviewFileUrl(url);
    }
  };
  const location = useLocation();
  const isFromCamDash = location.pathname === "/project_detail";
  const [submitIndex, setSubmitIndex] = useState([]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxHeight: isFromCamDash ? "70vh" : "85vh",
        width: {
          xs: "100%",
          lg: isFromCamDash ? "100%" : "calc(100% - var(--Sidebar-width))",
        },
        bgcolor: "background.body",
        overflowY: isFromCamDash ? "auto" : "auto",
        overflowX: "auto",
        ml: {
          lg: isFromCamDash ? 0 : "var(--Sidebar-width)",
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", flexGrow: 1, gap: 3 }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {isEngineering && (
            <IconButton
              onClick={() => navigate(`/eng_dash?page=${page}`)}
              variant="soft"
              color="neutral"
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            flexGrow: 1,
            p: 4,
            borderRadius: "lg",
            boxShadow: "sm",
            overflowY: "auto",
            bgcolor: "#f9fafb",
            maxHeight: isFromCamDash ? "67vh" : "100%",
          }}
        >
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {!isEngineering && (
              <Typography
                level="body-sm"
                sx={{ mb: 2, color: "warning.700", fontWeight: 500 }}
              >
                🔒 Upload access is restricted. You can only view/download
                files.
              </Typography>
            )}
            {submitIndex.length > 0 && (
              <Button onClick={() => handleMultipleSubmitFiles(submitIndex)}>
                Submit Files
              </Button>
            )}
            <Box
              sx={{
                minWidth: 200,
                maxWidth: 300,
                bgcolor: "background.level1",
                borderRadius: "md",
                boxShadow: "sm",
              }}
            >
              <Select
                value={selected}
                onChange={(event, newValue) => handleCategorySelectSafe(newValue)}
                disabled={isLoading}
                variant="soft"
                sx={{
                  borderRadius: "xl",
                  fontWeight: 600,
                  minHeight: 40,
                  px: 1,
                }}
              >
                {Object.keys(effectiveCategoryData).map((category) => (
                  <Option key={category} value={category}>
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Option>
                ))}
              </Select>
            </Box>
          </Box>
          <Divider sx={{ mb: 2, mt: 2 }} />
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                xl: "1fr 1fr",
              },
            }}
          >
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
                      📘 {summary?.boq_category_name}
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
            ) : effectiveCategoryData[selected]?.length > 0 ? (
              effectiveCategoryData[selected].map((item, index) => {
                const isUploadDisabled = item.latestStatus === "approved";
                const isAnyFileSelectedForThis = fileUploads[index]?.length > 0;

                return (
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

                    {item.fileUploadEnabled &&
                      isEngineering &&
                      !isUploadDisabled &&
                      item.latestStatus !== "hold" && (
                        <IconButton
                          variant="soft"
                          color="primary"
                          sx={{
                            mt: 2,
                          }}
                          onClick={() =>
                            setUploadModal({
                              open: true,
                              index,
                              templateId: item.templateId,
                              name: item.name,
                              max: item.maxFiles,
                            })
                          }
                        >
                          <CloudUpload />
                        </IconButton>
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

                    {item.currentAttachments.map((url, i) => (
                      <ListItem
                        key={i}
                        sx={{ p: 0, mt: 0.5, display: "flex", gap: 1 }}
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1976d2", fontSize: "14px" }}
                        >
                          📎 {url.split("/").pop()}
                        </a>
                        {/***** 👁️ View Button for images & pdf *****/}
                        {/\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(url) && (
                          <Button
                            size="sm"
                            variant="plain"
                            onClick={() => setPreviewFileUrl(url)}
                          >
                            👁️ View
                          </Button>
                        )}
                      </ListItem>
                    ))}

                    <Box
                      sx={{ mt: 2, display: "flex", flexDirection: "column" }}
                    >
                      <Typography level="body-xs" sx={{ fontWeight: 500 }}>
                        🟢 Current Status:{" "}
                        <Typography
                          component="span"
                          level="body-xs"
                          fontWeight="bold"
                          sx={{
                            color:
                              item.latestStatus?.toLowerCase() === "hold"
                                ? "red"
                                : "inherit",
                          }}
                        >
                          {(item.latestStatus || "N/A").replace(
                            /\b\w/g,
                            (char) => char.toUpperCase()
                          )}
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
                        {item.latestStatus === "hold" &&
                          Array.isArray(item.latestRemarks) &&
                          item.latestRemarks.length > 0 && (
                            <>
                              {item.latestRemarks.map((remark, i) => (
                                <Typography
                                  key={remark._id || i}
                                  component="span"
                                  level="body-xs"
                                  sx={{ display: "block" }}
                                >
                                  🚧 {remark.department}: {remark.text}
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
                      {item.attachmentUrls?.length > 0 && (
                        <>
                          <IconButton
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
                            <HistoryRoundedIcon />
                          </IconButton>

                          <IconButton
                            aria-label="Add remarks"
                            variant="outlined"
                            size="sm"
                            color="neutral"
                            onClick={() => {
                              setRemarksTemplateId(item.templateId);
                              setShowAddRemarksModal(true);
                            }}
                          >
                            <EditNoteRoundedIcon />
                          </IconButton>

                          {!isCAM && item?.boqEnabled && (
                            <IconButton
                              aria-label="Add BOQ"
                              variant="soft"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/add_boq?page=${page}&projectId=${projectId}&module_template=${item.templateId}&category=${selected}`
                                )
                              }
                            >
                              <PlaylistAddRoundedIcon />
                            </IconButton>
                          )}
                        </>
                      )}

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

                      {isEngineering &&
                        (user?.name === "Rishav Mahato" ||
                          user?.name === "Ranvijay Singh" ||
                          user?.name === "Naresh Kumar") &&
                        item.latestStatus !== "hold" && (
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

                    {isEngineering && isAnyFileSelectedForThis && (
                      <Box sx={{ textAlign: "right", mt: 3 }}>
                        <Button
                          variant="solid"
                          color="primary"
                          onClick={() => {
                            handleSubmit(index);
                            setSubmitIndex(index);
                          }}
                          sx={{
                            px: 3,
                            py: 1,
                            fontWeight: "lg",
                            borderRadius: "md",
                          }}
                        >
                          📤 Submit Files
                        </Button>
                      </Box>
                    )}
                  </Sheet>
                );
              })
            ) : (
              <Typography>
                No documentation found for{" "}
                {selected
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
                .
              </Typography>
            )}
          </Box>
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

      <Modal
        open={uploadModal.open}
        onClose={() => {
          setUploadModal({
            open: false,
            index: null,
            templateId: null,
            name: "",
            max: 0,
          });
          setStagedFiles([]);
        }}
      >
        <ModalDialog sx={{ width: 720, p: 2 }}>
          <Typography level="h6" sx={{ mb: 1 }}>
            Upload Document
          </Typography>

          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const incoming = Array.from(e.dataTransfer.files || []);
              if (!incoming.length) return;

              const currentCount = fileUploads[uploadModal.index]?.length || 0;
              const remaining = Math.max(
                uploadModal.max - currentCount - stagedFiles.length,
                0
              );

              if (remaining <= 0) {
                toast.error(`You can upload only ${uploadModal.max} file(s).`);
                return;
              }

              const accepted = incoming.slice(0, remaining);
              if (incoming.length > remaining) {
                toast.error(
                  `Only ${remaining} more file(s) allowed; extra file(s) ignored.`
                );
              }
              setStagedFiles((prev) => [...prev, ...accepted]);
            }}
            onClick={() =>
              document.getElementById("hidden-file-input-multi")?.click()
            }
            sx={{
              mt: 1.5,
              width: "100%",
              minHeight: 400,
              borderRadius: "md",
              border: "1.5px dashed",
              borderColor: "neutral.outlinedBorder",
              bgcolor: "background.level1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "background.level2" },
            }}
            aria-label="Click or drag files"
            role="button"
          >
            <Typography level="body-sm">
              Drag & drop file(s) here, or click to browse
            </Typography>

            {/* Hidden input */}
            <input
              id="hidden-file-input-multi"
              type="file"
              multiple
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                if (!picked.length) return;

                const currentCount =
                  fileUploads[uploadModal.index]?.length || 0;
                const remaining = Math.max(
                  uploadModal.max - currentCount - stagedFiles.length,
                  0
                );

                if (remaining <= 0) {
                  toast.error(
                    `You can upload only ${uploadModal.max} file(s).`
                  );
                  e.target.value = "";
                  return;
                }

                const accepted = picked.slice(0, remaining);
                if (picked.length > remaining) {
                  toast.error(
                    `Only ${remaining} more file(s) allowed; extra file(s) ignored.`
                  );
                }
                setStagedFiles((prev) => [...prev, ...accepted]);
                e.target.value = "";
              }}
              style={{ display: "none" }}
            />
          </Box>

          {/* Staged files preview (can remove each) */}
          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {stagedFiles.length ? (
              <List size="sm" sx={{ "--List-gap": "4px" }}>
                {stagedFiles.map((f, i) => (
                  <ListItem
                    key={`${f.name}-${i}`}
                    sx={{ p: 0, display: "flex", gap: 0.5 }}
                  >
                    <Typography level="body-xs">📎 {f.name}</Typography>
                    <Button
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={() =>
                        setStagedFiles((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      ❌
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography level="body-xs" sx={{ textAlign: "center", mt: 1 }}>
                No file selected
              </Typography>
            )}

            <Typography
              level="body-xs"
              sx={{ color: "text.tertiary", mt: 0.5 }}
            >
              {`Total for this folder (including staged): ${
                (fileUploads[uploadModal.index]?.length || 0) +
                stagedFiles.length
              } / ${uploadModal.max}`}
            </Typography>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Button
              variant="soft"
              color="neutral"
              onClick={() => {
                setUploadModal({
                  open: false,
                  index: null,
                  templateId: null,
                  name: "",
                  max: 0,
                });
                setStagedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              disabled={!stagedFiles.length}
              onClick={() => {
                const idx = uploadModal.index;
                const existing = fileUploads[idx]?.map((o) => o.file) || [];
                const remaining = Math.max(
                  uploadModal.max - existing.length,
                  0
                );

                if (remaining <= 0) {
                  toast.error(
                    `You can upload only ${uploadModal.max} file(s).`
                  );
                  return;
                }

                const toAdd = stagedFiles.slice(0, remaining);
                const merged = [...existing, ...toAdd];

                // update your existing structures
                handleMultiFileChange(idx, merged);

                setSubmitIndex((prev) => {
                  const i = Array.isArray(prev)
                    ? prev.findIndex(
                        (p) =>
                          p?.template_id === uploadModal.templateId &&
                          p?.index === idx
                      )
                    : -1;
                  if (i >= 0) {
                    const updated = [...prev];
                    updated[i] = { ...updated[i], files: merged };
                    return updated;
                  }
                  return [
                    ...(Array.isArray(prev) ? prev : []),
                    {
                      index: idx,
                      template_id: uploadModal.templateId,
                      name: uploadModal.name,
                      files: merged,
                    },
                  ];
                });

                setStagedFiles([]);
                setUploadModal({
                  open: false,
                  index: null,
                  templateId: null,
                  name: "",
                  max: 0,
                });
                toast.success("File(s) added.");
              }}
            >
              Select Files
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      <Modal
        open={!!previewFileUrl}
        onClose={() => {
          setPreviewFileUrl(null);
          setIframeLoaded(false);
        }}
      >
        <ModalDialog
          sx={{
            width: "70vw",
            height: "90vh",
            maxWidth: "none",
            maxHeight: "none",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flexGrow: 1, position: "relative", overflow: "auto" }}>
            {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewFileUrl) ? (
              <img
                src={previewFileUrl}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                  display: "block",
                  margin: "0 auto",
                }}
              />
            ) : previewFileUrl?.endsWith(".pdf") ? (
              <>
                {!iframeLoaded && (
                  <Typography
                    level="body-sm"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "gray",
                    }}
                  >
                    ⏳ Loading Preview...
                  </Typography>
                )}
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                    previewFileUrl
                  )}&embedded=true`}
                  title="PDF Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: iframeLoaded ? "block" : "none",
                    borderRadius: 8,
                  }}
                  onLoad={() => setIframeLoaded(true)}
                />
              </>
            ) : (
              <Typography level="body-sm" sx={{ color: "gray" }}>
                ⚠️ Preview not available for this file type.
              </Typography>
            )}
          </Box>
          <Modal
            open={!!previewFileUrl}
            onClose={() => {
              setPreviewFileUrl(null);
              setIframeLoaded(false);
            }}
          >
            <ModalDialog
              sx={{
                width: "70vw",
                height: "90vh",
                maxWidth: "none",
                maxHeight: "none",
                p: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ flexGrow: 1, position: "relative", overflow: "auto" }}>
                {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewFileUrl) ? (
                  <img
                    src={previewFileUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      borderRadius: 8,
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                ) : previewFileUrl?.endsWith(".pdf") ? (
                  <>
                    {!iframeLoaded && (
                      <Typography
                        level="body-sm"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "gray",
                        }}
                      >
                        ⏳ Loading Preview...
                      </Typography>
                    )}
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(
                        previewFileUrl
                      )}&embedded=true`}
                      title="PDF Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: iframeLoaded ? "block" : "none",
                        borderRadius: 8,
                      }}
                      onLoad={() => setIframeLoaded(true)}
                    />
                  </>
                ) : (
                  <Typography level="body-sm" sx={{ color: "gray" }}>
                    ⚠️ Preview not available for this file type.
                  </Typography>
                )}
              </Box>

              <Button
                onClick={() => {
                  setPreviewFileUrl(null);
                  setIframeLoaded(false);
                }}
                sx={{ mt: 2, alignSelf: "flex-end" }}
              >
                Close
              </Button>
            </ModalDialog>
          </Modal>
          <Button
            onClick={() => {
              setPreviewFileUrl(null);
              setIframeLoaded(false);
            }}
            sx={{ mt: 2, alignSelf: "flex-end" }}
          >
            Close
          </Button>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Overview;
