import {
  Card,
  CardContent,
  CardOverflow,
  Typography,
  Grid,
  Box,
} from "@mui/joy";
import { useGetAllTemplatesQuery } from "../../../../redux/Eng/templatesSlice";
import { Link, useNavigate } from "react-router-dom";

const TemplateDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAllTemplatesQuery();

  if (isLoading) return <Typography>Loading templates...</Typography>;
  if (isError || !data?.data)
    return <Typography>Error loading templates</Typography>;

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Grid container spacing={2}>
        {data.data.map((template) => (
          <Grid xs={12} sm={4} md={1.5} key={template._id}>
            <Link
              to={`/templates/${template._id}`}
              style={{ textDecoration: "none" }}
            >
              <Card
                onClick={() => {
                  sessionStorage.setItem("select_temp", template._id);
                  navigate(`/temp_dash?id=${template._id}`);
                }}
                variant="outlined"
                sx={{
                  borderRadius: "md",
                  boxShadow: "sm",
                  aspectRatio: "1 / 1.2",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "md",
                  },
                }}
              >
                <CardOverflow
                  variant="soft"
                  sx={{
                    flex: "0 0 65%",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.level1",
                  }}
                >
                  <Box
                    component="img"
                    src={`/${template.icon_image || "uploads/icons/default.png"}`}
                    alt={template.name || "Module Template"}
                    sx={{
                      maxHeight: "90%",
                      maxWidth: "90%",
                      objectFit: "contain",
                    }}
                  />
                </CardOverflow>

                <CardContent sx={{ px: 1.2, py: 0.8 }}>
                  <Typography level="title-sm" sx={{ mb: 0.4 }}>
                    {template.name || "Untitled"}
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: "text.secondary", mb: 0.3 }}
                  >
                    {template.description
                      ? template.description.length > 40
                        ? `${template.description.slice(0, 40)}...`
                        : template.description
                      : "No description"}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Order: {template.order || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TemplateDashboard;
