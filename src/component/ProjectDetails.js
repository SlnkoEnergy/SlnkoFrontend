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
  Card,
  Divider,
  Stack,
  Tooltip,
  IconButton,
  Snackbar,
} from "@mui/joy";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useGetProjectByIdQuery } from "../redux/projectsSlice";
import {
  useGetPostsQuery,
  useFollowMutation,
  useUnfollowMutation,
} from "../redux/postsSlice";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Overview from "./Forms/Engineering/Eng_Overview/Overview";
import CamHandoverSheetForm from "./Lead Stage/Handover/CAMHandover";
import PurchaseRequestCard from "./PurchaseRequestCard";
import ScopeDetail from "./Scope";
import Posts from "./Posts";

const Project_Detail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const project_id = searchParams.get("project_id") || "";

  // Base project details
  const {
    data: getProject,
    isLoading,
    error,
  } = useGetProjectByIdQuery(project_id);
  const projectDetails = getProject?.data || {};

  // Pull the Posts doc to read followers array
  const { data: postsResp } = useGetPostsQuery({ project_id });

  // Logged-in user from localStorage
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("userDetails");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.userID || null;
    } catch {
      return null;
    }
  }, []);

  // tabs
  const initialTab = parseInt(searchParams.get("tab") || "0");
  const [tabValue, setTabValue] = useState(initialTab);
  useEffect(() => setTabValue(initialTab), [initialTab]);

  const handleTabChange = (_e, newValue) => {
    setTabValue(newValue);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", newValue.toString());
      return params;
    });
  };

  // follow/unfollow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [follow, { isLoading: isFollowingCall }] = useFollowMutation();
  const [unfollow, { isLoading: isUnfollowingCall }] = useUnfollowMutation();
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    color: "success",
  });

  // Determine following from server data
  useEffect(() => {
    try {
      const posts = postsResp?.data || [];
      const first = Array.isArray(posts) ? posts[0] : null;
      const followers = first?.followers || [];
      const meIsFollowing =
        !!currentUserId &&
        followers.some(
          (f) => String(f?.user_id?._id || f?.user_id) === String(currentUserId)
        );
      setIsFollowing(meIsFollowing);
    } catch {}
  }, [postsResp, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !project_id) {
      setToast({
        open: true,
        msg: "Missing user or project context.",
        color: "danger",
      });
      return;
    }
    const payload = { project_id, followers: [currentUserId] };
    const prev = isFollowing;
    setIsFollowing(!prev);
    try {
      if (!prev) {
        await follow(payload).unwrap();
        setToast({
          open: true,
          msg: "You’re now following this project.",
          color: "success",
        });
      } else {
        await unfollow(payload).unwrap();
        setToast({
          open: true,
          msg: "You unfollowed this project.",
          color: "success",
        });
      }
    } catch (e) {
      setIsFollowing(prev);
      setToast({
        open: true,
        msg: "Action failed. Please try again.",
        color: "danger",
      });
    }
  };

    const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };


  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box
        sx={{
          borderRadius: "sm",
          py: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            {/* Left side → Profile details */}
            <Box>
              <Stack spacing={1} alignItems="flex-start">
                <Avatar
                  src="/path-to-profile-pic.jpg"
                  alt={projectDetails?.customer || "Customer"}
                  sx={{ width: 64, height: 64 }}
                />
                <Typography level="title-md">
                  {projectDetails?.customer}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailOutlinedIcon fontSize="small" />
                  <Typography level="body-sm">
                    {projectDetails?.email || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneOutlinedIcon fontSize="small" />
                  <Typography level="body-sm">
                    {projectDetails?.number}
                    {projectDetails?.alt_number
                      ? `, ${getProject?.data?.alt_number}`
                      : ""}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Right side → Follow button */}
            <Box>
              <Tooltip
                title={isFollowing ? "Unfollow Project" : "Follow Project"}
              >
                <IconButton
                  variant="soft"
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={isFollowingCall || isUnfollowingCall}
                  sx={{
                    "--Icon-color": "#3366a3",
                    color: "#3366a3", 
                    "&:hover": {
                      backgroundColor: "rgba(51, 102, 163, 0.08)",
                    },
                  }}
                >
                  {isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

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
        <Card width="100%" sx={{ flex: 1, borderRadius: "lg", p: 1 }}>
          <Box flex={1}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <TabList>
                <Tab>Handover Sheet</Tab>
                <Tab>Scope</Tab>
                {getUserData()?.department !== 'Engineering' && (
                <Tab>Purchase Order</Tab>
              )}
                <Tab>Engineering</Tab>
                <Tab>Notes</Tab>
              </TabList>

              <TabPanel value={0}>
                <Box
                  sx={{
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
                <Box maxHeight="70vh" overflow-y="auto">
                  <ScopeDetail
                    project_id={project_id}
                    project_code={projectDetails?.code}
                  />
                </Box>
              </TabPanel>

              <TabPanel value={2}>
                <Box overflow-y="auto">
                  <PurchaseRequestCard project_code={projectDetails?.code} />
                </Box>
              </TabPanel>

              <TabPanel value={3}>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  height="70vh"
                  overflow-y="auto"
                >
                  <Overview />
                </Box>
              </TabPanel>

              <TabPanel value={4}>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  height="70vh"
                  overflow-y="auto"
                >
                  <Posts projectId={project_id} />
                </Box>
              </TabPanel>
            </Tabs>
          </Box>
        </Card>
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        variant="soft"
        color={toast.color}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        autoHideDuration={2200}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast.msg}
      </Snackbar>
    </Box>
  );
};

export default Project_Detail;
