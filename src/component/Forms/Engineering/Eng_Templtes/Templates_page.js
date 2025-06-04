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
   useEffect(() => {
  const Id = searchParams.get("id");
  const storedId = localStorage.getItem("Id");

  if (Id && Id !== storedId) {
    localStorage.setItem("Id", Id);
  }
}, [searchParams]);
  
   
  
  const moduleId = localStorage.getItem("Id");
  const navigate = useNavigate();

  // Fetch only BOQ categories
  const {
    data: templateData,
    isLoading: loadingTemplates,
    isError: errorTemplates,
  } = useGetTemplatesByIdQuery(moduleId);

  const templates = templateData?.data || [];

  const handleAddTemplateClick = () => {
    navigate(`/create_template?module_id=${moduleId}`);
  };

  if (loadingTemplates) {
    return <Typography>Loading...</Typography>;
  }

  if (errorTemplates) {
    return <Typography color="danger">Failed to load categories.</Typography>;
  }

  return (
    <Box sx={{ p: 3, marginLeft: "14%" }}>
      {templates.length === 0 ? (
        <Typography>No BOQ templates available.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 2,
          }}
        >
          {templates?.boq?.template_category?.length > 0 ? (
            templates.boq.template_category.map((boqCategory) => (
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
            ))
          ) : (
            <Typography level="body-md" sx={{ p: 2 }}>
              Oops! No Templates Available. Go ahead and create one.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Templates_pages;
