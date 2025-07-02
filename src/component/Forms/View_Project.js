import { Avatar, Box, Chip, IconButton, Typography, Card } from "@mui/joy";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOn";
import { useGetProjectByPIdQuery } from "../../redux/projectsSlice";

const View_Project = ({ projectId }) => {
  const { data: getProject, isLoading } = useGetProjectByPIdQuery(projectId);
  const projectDetails = getProject?.data[0];

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  console.log("Project Details:", projectDetails?.site_address);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography textAlign="center" fontWeight="bold" fontSize="1.1rem">
          {projectDetails?.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar alt={projectDetails?.customer} sx={{ width: 80, height: 80 }}>
            {getInitials(projectDetails?.customer)}
          </Avatar>

          <Typography level="title-md" sx={{ textTransform: "capitalize" }}>
            {projectDetails?.customer}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1,
              textAlign: "center",
            }}
          >
            <IconButton variant="plain" color="neutral">
              <EmailRoundedIcon />
            </IconButton>
            <Typography level="body-sm">{projectDetails?.email}</Typography>

            <IconButton variant="plain" color="neutral">
              <PhoneRoundedIcon />
            </IconButton>
            <Typography level="body-sm">
              {[projectDetails?.number, projectDetails?.alt_number]
                .filter(Boolean)
                .join(", ")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography level="body-sm">
            <b>Project Id:</b>{" "}
            <Chip size="sm" color="primary" variant="solid">
              {projectDetails?.code}
            </Chip>
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
            <LocationOnRoundedIcon fontSize="small" />
            <Typography level="body-sm" sx={{ ml: 0.5 }}>
              {typeof projectDetails?.site_address === "object" &&
              projectDetails?.site_address !== null
                ? [
                    projectDetails?.site_address?.village_name,
                    projectDetails?.site_address?.district_name,
                    projectDetails?.state,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : projectDetails?.site_address}
            </Typography>
          </Box>

          <Typography level="body-sm">
            <b>Project Group:</b> {projectDetails?.p_group}
          </Typography>
          <Typography level="body-sm">
            <b>Capacity:</b> {projectDetails?.project_kwp}
          </Typography>
          <Typography level="body-sm">
            <b>Substation Distance:</b> {projectDetails?.distance}
          </Typography>
          <Typography level="body-sm">
            <b>Land Available:</b>{" "}
            {(() => {
              try {
                const parsed = JSON.parse(projectDetails?.land);
                const { acres, type } = parsed || {};
                if (acres || type) return `${acres || ""} ${type || ""}`.trim();
                return null; 
              } catch {
                return projectDetails?.land || "N/A";
              }
            })()}
          </Typography>

          <Typography level="body-sm">
            <b>Tariff:</b> {projectDetails?.tarrif}
          </Typography>

          <Box sx={{ borderTop: "1px solid #eee", mt: 2, pt: 1 }}>
            <Typography level="body-sm">
              <b>Slnko Service Charges:</b> ₹ {projectDetails?.service}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default View_Project;
