import React from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardOverflow,
  Divider,
} from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllBoqCategoriesQuery } from "../../../../redux/Eng/templatesSlice";

const Templates_pages = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("module_id");
  const navigate = useNavigate();

  // Fetch only BOQ categories
  const {
    data: categoryData,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useGetAllBoqCategoriesQuery();

  const categories = categoryData?.data || [];

  const handleAddTemplateClick = () => {
    navigate(`/create_template?module_id=${moduleId}`);
  };

  if (loadingCategories) {
    return <Typography>Loading...</Typography>;
  }

  if (errorCategories) {
    return <Typography color="danger">Failed to load categories.</Typography>;
  }

  return (
    <Box sx={{ p: 3, marginLeft: "14%" }}>
      {categories.length === 0 ? (
        <Typography>No BOQ Categories available.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 2,
          }}
        >
          {categories.map((category) => (
            <Card
              key={category._id}
              variant="outlined"
              sx={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardOverflow>
                <Typography level="title-md" sx={{ p: 2 }}>
                  {category.name || "Untitled Category"}
                </Typography>
                <Divider />
              </CardOverflow>
              <CardContent>
                <Typography level="body-sm">
                  {category.description || "No description provided."}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Templates_pages;
