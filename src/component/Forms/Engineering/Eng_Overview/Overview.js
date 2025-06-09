import React, { useState } from "react";
import {
  Box,
  Sheet,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  IconButton,
  Select,
  Option,
  Tooltip,
} from "@mui/joy";
import { useSearchParams } from "react-router-dom";
import {
  useGetModuleCategoryByIdQuery,
  useUpdateModuleCategoryMutation,
} from "../../../../redux/Eng/templatesSlice";
import Modal from "@mui/joy/Modal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";

const Overview = () => {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [openModalIndex, setOpenModalIndex] = useState(null);
  const [tableData, setTableData] = useState([]);

  // State to store actual File objects selected by the user
  // Structure: { categoryItemDisplayIndex: { fileInputIndex: FileObject } }
  const [fileUploads, setFileUploads] = useState({});

  const pidFromUrl = searchParams.get("project_id");
  const projectId = pidFromUrl;

  // RTK Query hook to fetch project module category data
  const { data, isLoading, isError, refetch } = useGetModuleCategoryByIdQuery(
    { projectId, engineering: selected },
    { skip: !projectId } // Skip query if projectId is not available
  );

  // Initialize a structured object to hold category-wise data for display
  const categoryData = {
    Electrical: [],
    Mechanical: [],
    Civil: [],
    plant_layout: [],
    boq: [],
  };

  const project = data?.data || null; // Access project data or null if not available

  // Populate categoryData from the fetched project data
  if (project?.items?.length) {
    project.items.forEach((item) => {
      const template = item.template_id;
      const category = template?.engineering_category;

      if (category && categoryData[category]) {
        // Ensure templateId is correctly extracted, whether template_id is an ID string or an object
        const currentTemplateId =
          typeof template === "string" ? template : template?._id;

        categoryData[category].push({
          templateId: currentTemplateId, // This is the crucial template_id needed for the backend
          name: template?.name || "N/A",
          description: template?.description || "No description provided.",
          maxFiles: template?.file_upload?.max_files || 0,
          // Ensure attachmentUrls is always an array for consistent rendering
          attachmentUrls: Array.isArray(item.current_attachment?.attachment_url)
            ? item.current_attachment?.attachment_url
            : item.current_attachment?.attachment_url
              ? [item.current_attachment.attachment_url]
              : [],
        });
      }
    });
  }

  /**
   * Handles file selection from an input field.
   * Updates the fileUploads state with the selected File object.
   * @param {number} categoryItemDisplayIndex - The visual index of the item in the currently displayed category.
   * @param {number} fileInputIndex - The index of the specific file input for that item.
   * @param {File} file - The actual File object selected by the user.
   */
  const handleFileChange = (categoryItemDisplayIndex, fileInputIndex, file) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };
      if (!newUploads[categoryItemDisplayIndex]) {
        newUploads[categoryItemDisplayIndex] = {};
      }
      newUploads[categoryItemDisplayIndex][fileInputIndex] = file;
      return newUploads;
    });
  };

  // Determines if any file has been selected to enable the submit button
  const isAnyFileSelected = Object.values(fileUploads).some(
    (fileGroup) => Object.keys(fileGroup).length > 0
  );

  // RTK Query mutation hook for updating module categories
  const [updateModuleCategory] = useUpdateModuleCategoryMutation();

  /**
   * Handles the submission of selected files to the backend.
   * Constructs FormData containing both files and JSON data.
   */
  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Project ID is missing. Cannot upload files.");
      return;
    }

    if (!isAnyFileSelected) {
      toast.info("Please select files to upload before submitting.");
      return;
    }

    const formData = new FormData();
    const itemsToUpdate = []; // This array will contain objects like { template_id: "..." }

    // Iterate through the `fileUploads` state to prepare data and append files
    // `fileUploads` keys (categoryItemDisplayIndexStr) correspond to the `index` used in `categoryData[selected].map`
    Object.entries(fileUploads).forEach(
      ([categoryItemDisplayIndexStr, fileGroup]) => {
        const categoryItemDisplayIndex = Number(categoryItemDisplayIndexStr);

        // Get the corresponding item from the currently selected category's data (e.g., Electrical)
        const itemInSelectedCategory =
          categoryData[selected][categoryItemDisplayIndex];

        if (itemInSelectedCategory && itemInSelectedCategory.templateId) {
          // Add the template_id to the itemsToUpdate array.
          // This is essential for the backend to associate uploaded files with the correct template.
          itemsToUpdate.push({
            template_id: itemInSelectedCategory.templateId,
          });

          // Append each actual File object to the FormData.
          // The backend typically expects files under the key "files" (e.g., `multer.array('files')`).
          Object.values(fileGroup).forEach((file) => {
            if (file instanceof File) {
              // Ensure we're appending a valid File object
              formData.append("files", file);
            }
          });
        } else {
          console.warn(
            `Skipping item at display index ${categoryItemDisplayIndex} due to missing data or templateId.`
          );
        }
      }
    );

    // CRITICAL PART: Append the JSON data (project_id and items array) under the "data" field.
    // The backend's `req.body.data` will parse this string.
    // IMPORTANT: Use 'project_id' as the key within this JSON to match backend's expectation.
    formData.append(
      "data",
      JSON.stringify({ project_id: projectId, items: itemsToUpdate })
    );

    // --- Debugging Logs (You can remove these after it works) ---
    console.log("Debug - fileUploads state:", fileUploads);
    console.log("Debug - itemsToUpdate array sent to backend:", itemsToUpdate);
    console.log(
      "Debug - FormData 'data' field JSON string:",
      JSON.stringify({ project_id: projectId, items: itemsToUpdate })
    );
    // --- End Debugging Logs ---

    try {
      // Call the mutation. RTK Query's fetchBaseQuery automatically sets
      // Content-Type to 'multipart/form-data' because `body` is a FormData object.
      const response = await updateModuleCategory({
        projectId: projectId, // This is passed as a query parameter for the URL
        body: formData, // The FormData object containing both files and JSON data
      }).unwrap(); // .unwrap() automatically throws if the mutation fails (e.g., non-2xx status)

      console.log("Update successful:", response);
      toast.success("Module Category updated successfully!");
      setFileUploads({}); // Clear selected files from the state
      refetch(); // Re-fetch the data to display newly uploaded attachments
    } catch (error) {
      console.error("Update error:", error);
      // Display a more specific error message from the backend if available
      if (error.data && error.data.message) {
        toast.error(`Failed to update module category: ${error.data.message}`);
      } else {
        toast.error(
          "Failed to update module category. Please check console for details."
        );
      }
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography level="h4" fontWeight="xl">
              {selected} Documentation
            </Typography>
            <Tooltip title="View BOQ" variant="outlined" arrow>
              <IconButton
                size="sm"
                variant="soft"
                onClick={() => {
                  setOpenModalIndex(0);
                  setTableData([
                    { make: "ABC", rating: "5", description: "Good quality" },
                    { make: "XYZ", rating: "4", description: "Moderate" },
                  ]);
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Modal Table */}
          <Modal
            open={openModalIndex !== null}
            onClose={() => setOpenModalIndex(null)}
          >
            <Sheet
              sx={{
                width: 500,
                mx: "auto",
                mt: "10vh",
                p: 4,
                borderRadius: "lg",
                boxShadow: "lg",
                bgcolor: "background.surface",
              }}
            >
              <Typography level="h6" mb={2}>
                📋 Document Info
              </Typography>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "1rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Make
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Rating
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px" }}>
                        <Select
                          size="sm"
                          value={row.make}
                          onChange={(_, val) => {
                            const updated = [...tableData];
                            updated[i].make = val;
                            setTableData(updated);
                          }}
                        >
                          <Option value="ABC">ABC</Option>
                          <Option value="XYZ">XYZ</Option>
                          <Option value="DEF">DEF</Option>
                        </Select>
                      </td>
                      <td style={{ padding: "8px" }}>{row.rating}</td>
                      <td style={{ padding: "8px" }}>{row.description}</td>
                      <td style={{ padding: "8px" }}>
                        <Button
                          size="sm"
                          onClick={() => alert("Action on row " + i)}
                        >
                          ✅ Action
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box sx={{ textAlign: "right" }}>
                <Button onClick={() => setOpenModalIndex(null)}>Submit</Button>
              </Box>
            </Sheet>
          </Modal>

          <Divider sx={{ mb: 3 }} />

          {/* Main Documentation Content */}
          {isLoading ? (
            <Typography>Loading documentation...</Typography>
          ) : isError ? (
            <Typography color="danger">
              Error fetching documentation.
            </Typography>
          ) : (
            <>
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

                      {/* Previously uploaded files */}
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
                  <Typography>
                    No documentation found for {selected}.
                  </Typography>
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
            </>
          )}
        </Sheet>
      </Box>
    </Box>
  );
};

export default Overview;
