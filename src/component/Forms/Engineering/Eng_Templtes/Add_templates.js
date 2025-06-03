import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  IconButton,
  Typography,
  Sheet,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useCreateBoqCategoryMutation,
  useCreateBoqTemplateRowMutation,
} from "../../../../redux/Eng/templatesSlice";

const AddTemplatesPage = () => {
  const [createBoqCategory] = useCreateBoqCategoryMutation();
  const [createBoqTemplateRow] = useCreateBoqTemplateRowMutation();

  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    boqHeaders: [],
    boqRows: [],
  });

  const [headerInput, setHeaderInput] = useState({
    columnName: "",
    inputType: "text",
    keyName: "",
    placeholder: "",
  });

  const handleHeaderInputChange = (field, value) => {
    setHeaderInput((prev) => ({ ...prev, [field]: value }));
  };

  const addHeader = () => {
    if (
      !headerInput.columnName.trim() ||
      !headerInput.keyName.trim() ||
      !headerInput.inputType
    )
      return alert("Please fill all header fields");

    // Avoid duplicate keyNames
    if (
      templateData.boqHeaders.some(
        (h) => h.keyName.toLowerCase() === headerInput.keyName.toLowerCase()
      )
    ) {
      return alert("Key Name must be unique");
    }

    setTemplateData((prev) => ({
      ...prev,
      boqHeaders: [...prev.boqHeaders, headerInput],
    }));

    setHeaderInput({
      columnName: "",
      inputType: "text",
      keyName: "",
      placeholder: "",
    });
  };

  const editHeader = (index, field, value) => {
    setTemplateData((prev) => {
      const newHeaders = [...prev.boqHeaders];
      newHeaders[index][field] = value;
      return { ...prev, boqHeaders: newHeaders };
    });
  };

  const removeHeader = (index) => {
    setTemplateData((prev) => {
      const removedKeyName = prev.boqHeaders[index].keyName;
      const newHeaders = prev.boqHeaders.filter((_, i) => i !== index);
      // Remove column data from each row
      const newRows = prev.boqRows.map((row) => {
        const copy = { ...row };
        delete copy[removedKeyName];
        return copy;
      });
      return { ...prev, boqHeaders: newHeaders, boqRows: newRows };
    });
  };

  const addRow = () => {
    // Create new row with empty strings for each header key
    const newRow = templateData.boqHeaders.reduce((acc, h) => {
      acc[h.keyName] = "";
      return acc;
    }, {});
    setTemplateData((prev) => ({
      ...prev,
      boqRows: [...prev.boqRows, newRow],
    }));
  };

  const removeRow = (index) => {
    setTemplateData((prev) => ({
      ...prev,
      boqRows: prev.boqRows.filter((_, i) => i !== index),
    }));
  };

  const handleRowChange = (rowIndex, key, value) => {
    setTemplateData((prev) => {
      const newRows = [...prev.boqRows];
      newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
      return { ...prev, boqRows: newRows };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !templateData.name ||
      !templateData.description ||
      templateData.boqHeaders.length === 0
    ) {
      return alert(
        "Please complete all required fields and add at least one header."
      );
    }

    try {
      // Step 1: Create BOQ Category (Headers)
      const categoryPayload = {
        name: templateData.name,
        description: templateData.description,
        headers: templateData.boqHeaders.map((header) => ({
          name: header.columnName,
          key: header.keyName,
          input_type: header.inputType,
          required: true,
          placeholder: header.placeholder,
        })),
      };

      const categoryResponse =
        await createBoqCategory(categoryPayload).unwrap();
      const boqCategoryId = categoryResponse._id || categoryResponse.data?._id;

      if (!boqCategoryId) {
        throw new Error("boq_category ID not returned from API");
      }

      // Step 2: Filter rows that have any non-empty value
      const filteredBoqRows = templateData.boqRows.filter((row) =>
        Object.values(row).some((val) => val !== "")
      );

      // Step 3: Build column-wise data array for all rows
      const dataForAllRows = templateData.boqHeaders.map((header) => ({
        name: header.columnName,
        values: filteredBoqRows.map((row) => ({
          input_values: row[header.keyName] || "",
        })),
      }));

      // Step 4: Build payload with category and all rows (column-wise)
      const payload = {
        boq_category: boqCategoryId,
        data: dataForAllRows,
      };

      console.log("Posting payload:", JSON.stringify(payload, null, 2));

      // Step 5: Post ONE document with all rows (column-wise)
      await createBoqTemplateRow(payload).unwrap();

      alert("Template submitted successfully!");
      // Optionally reset form state here
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit template. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 4, marginLeft: "25%" }}>
      <Typography level="h3" mb={3}>
        Add Template
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Name and Description */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          <FormControl required sx={{ flex: "1 1 300px" }}>
            <FormLabel>Name</FormLabel>
            <Input
              value={templateData.name}
              onChange={(e) =>
                setTemplateData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </FormControl>
          <FormControl required sx={{ flex: "1 1 300px" }}>
            <FormLabel>Description</FormLabel>
            <Input
              multiline
              minRows={2}
              value={templateData.description}
              onChange={(e) =>
                setTemplateData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </FormControl>
        </Box>

        {/* Define Headers */}
        <Typography level="h4" mb={2}>
          Define BOQ Template Headers
        </Typography>

        {/* Header Input Row */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Input
            placeholder="Input Column Name"
            value={headerInput.columnName}
            onChange={(e) =>
              handleHeaderInputChange("columnName", e.target.value)
            }
            sx={{ flex: "1 1 200px" }}
          />
          <Select
            value={headerInput.inputType}
            onChange={(event, val) => handleHeaderInputChange("inputType", val)}
            sx={{ flex: "0 0 120px" }}
          >
            <Option value="text">Text</Option>
            <Option value="number">Number</Option>
            <Option value="date">Date</Option>
          </Select>
          <Input
            placeholder="Key Name"
            value={headerInput.keyName}
            onChange={(e) => handleHeaderInputChange("keyName", e.target.value)}
            sx={{ flex: "1 1 200px" }}
          />
          <Input
            placeholder="Placeholder"
            value={headerInput.placeholder}
            onChange={(e) =>
              handleHeaderInputChange("placeholder", e.target.value)
            }
            sx={{ flex: "1 1 200px" }}
          />
          <Button
            type="button"
            onClick={addHeader}
            variant="soft"
            sx={{ flex: "0 0 auto" }}
          >
            Add
          </Button>
        </Box>

        {/* Editable Headers List */}
        {templateData.boqHeaders.length > 0 && (
          <Sheet
            variant="outlined"
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              overflowX: "auto",
              maxWidth: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography level="body2" sx={{ fontWeight: "bold" }}>
                Editable Headers:
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {templateData.boqHeaders.map((header, idx) => (
                <Box
                  key={idx}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    minWidth: 220,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    position: "relative",
                  }}
                >
                  <Input
                    size="sm"
                    value={header.columnName}
                    onChange={(e) =>
                      editHeader(idx, "columnName", e.target.value)
                    }
                    placeholder="Column Name"
                    aria-label={`Edit Column Name for header ${idx + 1}`}
                  />
                  <Select
                    size="sm"
                    value={header.inputType}
                    onChange={(event, val) => editHeader(idx, "inputType", val)}
                    aria-label={`Edit Input Type for header ${idx + 1}`}
                  >
                    <Option value="text">Text</Option>
                    <Option value="number">Number</Option>
                    <Option value="date">Date</Option>
                  </Select>
                  <Input
                    size="sm"
                    value={header.keyName}
                    onChange={(e) => editHeader(idx, "keyName", e.target.value)}
                    placeholder="Key Name"
                    aria-label={`Edit Key Name for header ${idx + 1}`}
                  />
                  <Input
                    size="sm"
                    value={header.placeholder}
                    onChange={(e) =>
                      editHeader(idx, "placeholder", e.target.value)
                    }
                    placeholder="Placeholder"
                    aria-label={`Edit Placeholder for header ${idx + 1}`}
                  />
                  <IconButton
                    variant="soft"
                    color="danger"
                    size="sm"
                    onClick={() => removeHeader(idx)}
                    sx={{ position: "absolute", top: 4, right: 4 }}
                    aria-label={`Remove header ${idx + 1}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Sheet>
        )}

        {/* Excel-like BOQ Table */}
        {templateData.boqHeaders.length > 0 && (
          <>
            <Typography level="h4" mb={1}>
              BOQ Table Rows
            </Typography>

            <Box
              sx={{
                overflowX: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  minWidth: 600,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f5f5f5",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    {templateData.boqHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          minWidth: 150,
                          textAlign: "center",
                        }}
                        title={`${header.columnName} (${header.keyName})`}
                      >
                        {header.columnName || header.keyName}
                      </th>
                    ))}
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        width: 80,
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templateData.boqRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={templateData.boqHeaders.length + 1}
                        style={{ textAlign: "center", padding: 16 }}
                      >
                        No rows added yet.
                      </td>
                    </tr>
                  )}
                  {templateData.boqRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {templateData.boqHeaders.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          style={{ border: "1px solid #ddd", padding: 4 }}
                        >
                          <input
                            type={header.inputType}
                            value={row[header.keyName] || ""}
                            placeholder={header.placeholder}
                            onChange={(e) =>
                              handleRowChange(
                                rowIndex,
                                header.keyName,
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              border: "none",
                              padding: "6px 8px",
                              fontSize: 14,
                              boxSizing: "border-box",
                            }}
                          />
                        </td>
                      ))}
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: 4,
                          textAlign: "center",
                        }}
                      >
                        <IconButton
                          variant="soft"
                          color="danger"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          aria-label={`Remove row ${rowIndex + 1}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            <Button type="button" onClick={addRow} sx={{ mt: 2 }}>
              Add Row
            </Button>
          </>
        )}

        {/* Submit Button */}
        <Box sx={{ mt: 4 }}>
          <Button type="submit" variant="solid" color="primary">
            Submit Template
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddTemplatesPage;
