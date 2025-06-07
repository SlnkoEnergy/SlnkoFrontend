import React, { useState, useEffect } from "react";
import {
  Box,
  Sheet,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
} from "@mui/joy";
import { useSearchParams } from "react-router-dom";
import { useGetModuleCategoryByIdQuery } from "../../../../redux/Eng/templatesSlice";

const Overview = () => {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState("Electrical");
  const [moduleId, setModuleId] = useState(null);

  // Store or retrieve moduleId from URL/localStorage
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    const storedId = localStorage.getItem("ModuleId");

    if (idFromUrl && idFromUrl !== storedId) {
      localStorage.setItem("ModuleId", idFromUrl);
      setModuleId(idFromUrl);
    } else if (storedId) {
      setModuleId(storedId);
    }
  }, [searchParams]);

  const { data, isLoading, isError } = useGetModuleCategoryByIdQuery(moduleId, {
    skip: !moduleId,
  });

  const categoryData = {
    Electrical: [],
    Mechanical: [],
    Civil: [],
    "Plant Layout": [],
    BOQ: [],
  };

  const project = data?.data?.project_id;

  if (data?.data?.items?.length) {
    data.data.items.forEach((item) => {
      const template = item.template_id;
      const category = template?.engineering_category;
      if (categoryData[category]) {
        categoryData[category].push({
          name: template.name,
          description: template.description,
          attachmentNumber: item.current_attachment?.attachment_number || "N/A",
        });
      }
    });
  }

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
        {/* Sidebar */}
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
                >
                  {category}
                </Button>
              </ListItem>
            ))}
          </List>
        </Sheet>

        {/* Main Content */}
        <Sheet
          variant="outlined"
          sx={{
            flexGrow: 1,
            p: 4,
            maxWidth: "100%",
            borderRadius: "lg",
            boxShadow: "sm",
            overflowY: "auto",
            bgcolor: "background.surface",
          }}
        >
          <Typography level="h4" fontWeight="lg" sx={{ mb: 2 }}>
            {selected} Data
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : isError ? (
            <Typography color="danger">Error fetching data.</Typography>
          ) : (
            <>
              {/* Project Info */}
              {project && (
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-lg" fontWeight="lg">
                    Project: {project.name} ({project.code})
                  </Typography>
                  <Typography level="body-sm">
                    Location: {project.site_address?.village_name},{" "}
                    {project.site_address?.district_name}
                  </Typography>
                </Box>
              )}

              <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                {categoryData[selected].length > 0 ? (
                  categoryData[selected].map((item, index) => (
                    <li key={index} style={{ marginBottom: "12px" }}>
                      <Typography level="body-lg" fontWeight="md">
                        {item.name}
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 0.5 }}>
                        {item.description}
                      </Typography>
                      <Typography level="body-xs" color="neutral">
                        Attachment No: {item.attachmentNumber}
                      </Typography>
                    </li>
                  ))
                ) : (
                  <Typography>No data found for {selected}.</Typography>
                )}
              </ul>
            </>
          )}
        </Sheet>
      </Box>
    </Box>
  );
};

export default Overview;
