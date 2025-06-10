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
import { useSearchParams } from "react-router-dom";

const Material = ({item}) => {
  
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
    ) return alert("Please fill all header fields");

    if (
      materialData.materialHeaders.some(
        (h) => h.key.toLowerCase() === headerInput.key.toLowerCase()
      )
    ) return alert("Key Name must be unique");

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
      <Typography level="h3" mb={3}>{`Add ${item}`}</Typography>

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

        <Box sx={{ mt: 4 }}>
          <Button type="submit" variant="solid" color="primary">
           {` Submit ${item}`}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Material;
