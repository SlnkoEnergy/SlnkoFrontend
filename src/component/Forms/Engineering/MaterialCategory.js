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
import { useCreateMaterialCategoryMutation } from "../../../redux/Eng/masterSheet";

const MaterialCategory = () => {
  const [materialData, setMaterialData] = useState({
    name: "",
    description: "",
    materialHeaders: [],
  });

  const [headerInput, setHeaderInput] = useState({
    name: "",
    input_type: "text",
    key: "",
    placeholder: "",
    required: false,
  });

  const [createMaterialCategory] = useCreateMaterialCategoryMutation();

  const handleHeaderInputChange = (field, value) => {
    setHeaderInput((prev) => ({ ...prev, [field]: value }));
  };

  const addHeader = () => {
    if (
      !headerInput.name.trim() ||
      !headerInput.key.trim() ||
      !headerInput.input_type
    )
      return alert("Please fill all header fields");

    if (
      materialData.materialHeaders.some(
        (h) => h.key.toLowerCase() === headerInput.key.toLowerCase()
      )
    )
      return alert("Key Name must be unique");

    setMaterialData((prev) => ({
      ...prev,
      materialHeaders: [...prev.materialHeaders, headerInput],
    }));

    setHeaderInput({
      name: "",
      input_type: "text",
      key: "",
      placeholder: "",
    });
  };

  const editHeader = (index, field, value) => {
    setMaterialData((prev) => {
      const newHeaders = [...prev.materialHeaders];
      newHeaders[index][field] = value;
      return { ...prev, materialHeaders: newHeaders };
    });
  };

  const removeHeader = (index) => {
    setMaterialData((prev) => {
      const newHeaders = prev.materialHeaders.filter((_, i) => i !== index);
      return { ...prev, materialHeaders: newHeaders };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: materialData.name,
      description: materialData.description,
      fields: materialData.materialHeaders, // key changed here
    };

    try {
      const response = await createMaterialCategory(payload).unwrap();
      alert("Success: " + response.message);
      // Reset form
      setMaterialData({ name: "", description: "", materialHeaders: [] });
    } catch (error) {
      alert("Error creating material category");
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 4, marginLeft: "25%" }}>
      <Typography level="h3" mb={3}>
        Add Material Category
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          <FormControl required sx={{ flex: "1 1 300px" }}>
            <FormLabel>Name</FormLabel>
            <Input
              value={materialData.name}
              onChange={(e) =>
                setMaterialData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </FormControl>
          <FormControl required sx={{ flex: "1 1 300px" }}>
            <FormLabel>Description</FormLabel>
            <Input
              multiline
              minRows={2}
              value={materialData.description}
              onChange={(e) =>
                setMaterialData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </FormControl>
        </Box>

        <Typography level="h4" mb={2}>
          Define Material Template Headers
        </Typography>

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
            value={headerInput.name}
            onChange={(e) => handleHeaderInputChange("name", e.target.value)}
            sx={{ flex: "1 1 200px" }}
          />
          <Select
            value={headerInput.input_type}
            onChange={(event, val) =>
              handleHeaderInputChange("input_type", val)
            }
            sx={{ flex: "0 0 120px" }}
          >
            <Option value="text">Text</Option>
            <Option value="number">Number</Option>
            <Option value="date">Date</Option>
          </Select>
          <Input
            placeholder="Key Name"
            value={headerInput.key}
            onChange={(e) => handleHeaderInputChange("key", e.target.value)}
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

        {materialData.materialHeaders.length > 0 && (
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
              {materialData.materialHeaders.map((header, idx) => (
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
                    value={header.name}
                    onChange={(e) => editHeader(idx, "name", e.target.value)}
                    placeholder="Column Name"
                  />
                  <Select
                    size="sm"
                    value={header.input_type}
                    onChange={(event, val) =>
                      editHeader(idx, "input_type", val)
                    }
                  >
                    <Option value="text">Text</Option>
                    <Option value="number">Number</Option>
                    <Option value="date">Date</Option>
                  </Select>
                  <Input
                    size="sm"
                    value={header.key}
                    onChange={(e) => editHeader(idx, "key", e.target.value)}
                    placeholder="Key Name"
                  />
                  <Input
                    size="sm"
                    value={header.placeholder}
                    onChange={(e) =>
                      editHeader(idx, "placeholder", e.target.value)
                    }
                    placeholder="Placeholder"
                  />
                  <IconButton
                    variant="soft"
                    color="danger"
                    size="sm"
                    onClick={() => removeHeader(idx)}
                    sx={{ position: "absolute", top: 4, right: 4 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Sheet>
        )}

        <Box sx={{ mt: 4 }}>
          <Button type="submit" variant="solid" color="primary">
            Submit Material Category
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default MaterialCategory;
