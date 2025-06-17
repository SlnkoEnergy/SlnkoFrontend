import React, { useEffect } from "react";
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
import { useGetTemplatesByIdQuery } from "../../../../redux/Eng/templatesSlice";

const Templates_pages = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || localStorage.getItem("Id");

  const navigate = useNavigate();

  // If ID comes from URL, store it
  useEffect(() => {
    const idFromURL = searchParams.get("id");
    if (idFromURL) {
      localStorage.setItem("Id", idFromURL);
      console.log("Stored Id in localStorage:", idFromURL);
    }
  }, [searchParams]);

  console.log("Module ID used for fetching:", moduleId);

  const {
    data: templateData,
    isLoading: loadingTemplates,
    isError: errorTemplates,
  } = useGetTemplatesByIdQuery(moduleId, {
    skip: !moduleId, // Avoid fetch if ID is null
  });

  console.log("Raw templateData fetched:", templateData);

  const templates = templateData?.data || {};

  const uniqueTemplateCategories = [
    ...new Map(
      (templates?.boq?.template_category || []).map((item) => [item._id, item])
    ).values(),
  ];

  const handleAddTemplateClick = () => {
    navigate(`/create_template?module_id=${moduleId}`);
  };

  if (loadingTemplates) return <Typography>Loading...</Typography>;

  if (errorTemplates)
    return <Typography color="danger">Failed to load categories.</Typography>;

  return (
    <Box sx={{ p: 3, marginLeft: "14%" }}>
      {uniqueTemplateCategories.length === 0 ? (
        <Typography>No BOQ templates available.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 2,
          }}
        >
          {uniqueTemplateCategories.map((boqCategory) => (
            <Card
              key={boqCategory._id}
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
                  {boqCategory.name || "Untitled Category"}
                </Typography>
                <Divider />
              </CardOverflow>
              <CardContent>
                <Typography level="body-sm">
                  {boqCategory.description || "No description provided."}
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
