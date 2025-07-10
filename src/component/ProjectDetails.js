// LeadProfile.tsx
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Textarea,
  Button,
  Card,
  Divider,
  Stack,
} from "@mui/joy";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnOutlined";
import { useGetProjectByIdQuery } from "../redux/projectsSlice";
import { useSearchParams } from "react-router-dom";
import Overview from "./Forms/Engineering/Eng_Overview/Overview";
import CamHandoverSheetForm from "./Lead Stage/Handover/CAMHandover";
import PurchaseRequestCard from "./PurchaseRequestCard";
import { useEffect, useState } from "react";

export default function Project_Detail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const project_id = searchParams.get("project_id");
  const {
    data: getProject,
    isLoading,
    error,
  } = useGetProjectByIdQuery(project_id);

  const initialTab = parseInt(searchParams.get("tab") || "0");
  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    setTabValue(initialTab);
  }, [initialTab]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", newValue.toString());
      return params;
    });
  };

  const projectDetails = getProject?.data || [];
  return (
    <Box p={2}>
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "16%" },
          borderRadius: "sm",
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        {/* Left Card - Profile Info */}
        <Card
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 300 },
            flexShrink: 0,
            borderRadius: "lg",
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Avatar
              src="/path-to-profile-pic.jpg"
              alt="Shankar Prasad"
              sx={{ width: 64, height: 64 }}
            />
            <Typography level="title-md">{projectDetails?.customer}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailOutlinedIcon fontSize="small" />
              <Typography level="body-sm">
                {projectDetails?.email || "-"}{" "}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneOutlinedIcon fontSize="small" />
              <Typography level="body-sm">
                {projectDetails?.number}
                {projectDetails?.alt_number
                  ? `, ${getProject.data.alt_number}`
                  : ""}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography level="body-sm">Project Id:</Typography>
              <Chip size="sm" color="primary" variant="soft">
                {projectDetails?.code}
              </Chip>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
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
            </Stack>

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
                  if (acres || type)
                    return `${acres || ""} ${type || ""}`.trim();
                  return null;
                } catch {
                  return projectDetails?.land || "N/A";
                }
              })()}
            </Typography>

            <Typography level="body-sm">
              <b>Tariff:</b> {projectDetails?.tarrif}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography level="body-sm">
              <b>Slnko Service Charges:</b> ₹ {projectDetails?.service}
            </Typography>
          </Stack>
        </Card>

        {/* Right Section - Notes & Tasks */}
        <Card width="100%" sx={{ flex: 1, borderRadius: "lg", p: 2 }}>
          <Box flex={1}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <TabList>
                <Tab>Handover Sheet</Tab>
                <Tab>Engineering</Tab>
                <Tab>Purchase Summary</Tab>
              </TabList>

              <TabPanel value={0}>
                <Box
                  style={{
                    height: "60vh",
                    overflowY: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CamHandoverSheetForm />
                </Box>
              </TabPanel>

              <TabPanel value={1}>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  height="70vh"
                  overflowY="auto"
                >
                  <Overview />
                </Box>
              </TabPanel>

              <TabPanel value={2}>
                <Box overflowY="auto">
                  <PurchaseRequestCard project_code={projectDetails?.code} />
                </Box>
              </TabPanel>
            </Tabs>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
