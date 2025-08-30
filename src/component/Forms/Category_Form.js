import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, Select, Option, Typography } from "@mui/joy";
import { useGetMaterialCategoryByIdQuery, useUpdateCategoriesMutation } from "../../redux/productsSlice";

const CategoryForm = () => {
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "view";
  const categoryId= searchParams.get("id") || "";
  const { data: categoryData, isLoading: isLoadingCategory, error: categoryError } = useGetMaterialCategoryByIdQuery(categoryId);

  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoriesMutation();

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    type: "",
    category_code: "",
    status: "active",
    product_count: 0,
  });

  useEffect(() => {
    if (mode === "edit" && categoryData) {
      setFormValues({
        name: categoryData.name,
        description: categoryData.description,
        type: categoryData.type,
        category_code: categoryData.category_code,
        status: categoryData.status,
        product_count: categoryData.product_count,
      });
    }
  }, [mode, categoryData]);

  const handleSubmit = async () => {
    try {
      await updateCategory({ categoryId, body: formValues });
      navigate("/categories"); // Redirect after successful update
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  if (isLoadingCategory) return <Typography>Loading...</Typography>;
  if (categoryError) return <Typography>Error loading category: {categoryError.message}</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5">{mode === "edit" ? "Edit Category" : "View Category"}</Typography>

      <FormControl fullWidth size="sm" sx={{ marginY: 2 }}>
        <FormLabel>Category Name</FormLabel>
        <Input
          disabled={mode === "view"}
          value={formValues.name}
          onChange={(e) => setFormValues({ ...formValues, name: e?.target.value })}
        />
      </FormControl>

      <FormControl fullWidth size="sm" sx={{ marginY: 2 }}>
        <FormLabel>Category Code</FormLabel>
        <Input
          disabled={mode === "view"}
          value={formValues.category_code}
          onChange={(e) => setFormValues({ ...formValues, category_code: e?.target.value })}
        />
      </FormControl>

      <FormControl fullWidth size="sm" sx={{ marginY: 2 }}>
        <FormLabel>Description</FormLabel>
        <Input
          disabled={mode === "view"}
          value={formValues.description}
          onChange={(e) => setFormValues({ ...formValues, description: e?.target.value })}
        />
      </FormControl>

      <FormControl fullWidth size="sm" sx={{ marginY: 2 }}>
        <FormLabel>Product Type</FormLabel>
        <Select
          disabled={mode === "view"}
          value={formValues.type}
          onChange={(e) => setFormValues({ ...formValues, type: e?.target.value })}
        >
          <Option value="supply">Supply</Option>
          <Option value="execution">Execution</Option>
        </Select>
      </FormControl>

      <FormControl fullWidth size="sm" sx={{ marginY: 2 }}>
        <FormLabel>Status</FormLabel>
        <Select
          disabled={mode === "view"}
          value={formValues.status}
          onChange={(e) => setFormValues({ ...formValues, status: e?.target.value })}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
        <Button
          variant="outlined"
          color="neutral"
          onClick={() => navigate("/categories")}
          sx={{ marginRight: 2 }}
        >
          Cancel
        </Button>

        {mode === "edit" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CategoryForm;
