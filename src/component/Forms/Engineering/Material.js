import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
} from "@mui/joy";
import {
  useCreateMaterialMutation,
  useGetMaterialCategoryQuery,
} from "../../../redux/Eng/masterSheet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Material = ({ item }) => {
  const [searchParams] = useSearchParams();
  const _id = searchParams.get("_id");
  const navigate = useNavigate();
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

  const [createMaterial] = useCreateMaterialMutation();
  const {
    data: materialModelData,
    isLoading: loadingMaterialModelData,
    isError: errorMaterial,
  } = useGetMaterialCategoryQuery(_id, {
    skip: !_id, // Avoid fetch if ID is null
  });

  console.log(materialModelData);


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!materialModelData?.data?.fields) {
    console.error("Fields data not available");
    return;
  }

  const finalData = materialModelData.data.fields.map((field) => ({
    name: field.name,
    values: [
      {
        input_values: materialData[field.key] ?? "",
      },
    ],
  }));

  const payload = {
    category: _id, // from useSearchParams
    data: finalData,
    is_available: true, // or false if needed
  };

  try {
    await createMaterial(payload).unwrap();
    toast.success("Material created successfully");
    navigate(`/module_sheet?module=${item}`);
    window.location.reload(); // Reload to reflect changes
  } catch (error) {
    toast.error("Failed to create material:");
  }
};

  return (
    <Box sx={{ p: 4, marginLeft: "25%" }}>
      <Typography level="h3" mb={3}>{`Add ${item}`}</Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
          {materialModelData?.data.fields?.map((field, index) => (
            <FormControl
              key={index}
              required={field.required}
              sx={{ flex: "1 1 300px", mb: 2 }}
            >
              <FormLabel>{field.name}</FormLabel>
              <Input
                type={field.input_type || "text"}
                placeholder={field.placeholder || ""}
                value={materialData[field.key] || ""}
                onChange={(e) =>
                  setMaterialData((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
              />
            </FormControl>
          ))}
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
