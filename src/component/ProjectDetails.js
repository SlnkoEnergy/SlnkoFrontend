// LeadProfile.jsx (responsive + sticky tabs/panel)

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
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
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

/* ---------------- helpers ---------------- */
const getUserData = () => {
  try {
    const raw = localStorage.getItem("userDetails");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const VALID_TABS = new Set(["handover", "scope", "po", "eng", "notes"]);
const NUM_TO_KEY = {
  0: "handover",
  1: "scope",
  2: "po",
  3: "eng",
  4: "notes",
};

// Sanitize ?tab=... (supports legacy numbers and new string keys)
const sanitizeTabFromQuery = (raw) => {
  if (!raw) return "handover";
  if (NUM_TO_KEY[raw]) return NUM_TO_KEY[raw];
  if (VALID_TABS.has(raw)) return raw;
  return "handover";
};

const canUserSeePO = (user) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const dept = user.department || "";
  const special = user.emp_id === "SE-013";
  const privileged = special || role === "admin" || role === "superadmin";
  // PO hidden for Engineering, unless privileged
  return privileged || dept !== "Engineering";
};

export default function Project_Detail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const project_id = searchParams.get("project_id") || "";

  const { data: getProject } = useGetProjectByIdQuery(project_id);
  const projectDetails = getProject?.data || {};

  const { data: postsResp } = useGetPostsQuery({ project_id });

  const currentUser = useMemo(() => getUserData(), []);
  const currentUserId = useMemo(
    () => (currentUser ? currentUser.userID || null : null),
    [currentUser]
  );

  // ---- tabs (string keys) ----
  const initialTab = sanitizeTabFromQuery(searchParams.get("tab"));
  const [tabValue, setTabValue] = useState(initialTab);
  const allowedPO = canUserSeePO(currentUser);

  // keep state in sync with URL, and guard `po` if not allowed
  useEffect(() => {
    const requested = sanitizeTabFromQuery(searchParams.get("tab"));
    const isPORequested = requested === "po";
    if (isPORequested && !allowedPO) {
      // redirect to a safe tab
      setTabValue("handover");
      const params = new URLSearchParams(searchParams);
      params.set("tab", "handover");
      setSearchParams(params);
    } else {
      setTabValue(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allowedPO]);

  const handleTabChange = (_e, newValue) => {
    const next = String(newValue);
    const final = next === "po" && !allowedPO ? "handover" : next;
    setTabValue(final);
    const params = new URLSearchParams(searchParams);
    params.set("tab", final);
    setSearchParams(params);
  };

  // ---- follow/unfollow state ----
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

  /* ---------------- Layout constants ----------------
     - headerOffset: space reserved for your app header (tweak as needed)
     - tabsBar: approximate height of the TabList
     - On md+ we compute a scroll area height so panels don't grow forever
  --------------------------------------------------- */
  const headerOffset = 72;
  const tabsBar = 48;
  const verticalGaps = 32;

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: { xs: 1, md: 2 },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Centered container with max width for large screens */}
      <Box
        sx={{
          maxWidth: { xs: "100%", lg: 1400, xl: 1600 },
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Responsive grid: stacked on mobile, two columns on md+ */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "300px 1fr",
            },
            gap: { xs: 1.5, md: 2 },
            alignItems: "start",
          }}
        >
          {/* Left Column — sticky profile card */}
          <Card
            variant="outlined"
            sx={{
              position: { xs: "static", md: "sticky" },
              top: { md: headerOffset + 16 }, // header + small gap
              borderRadius: "lg",
              width: "100%",
              flexShrink: 0,
              // make sure it doesn't overflow the viewport height
              height: "100%",
              overflow: { md: "auto" },
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
                        ? `, ${projectDetails?.alt_number}`
                        : ""}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Follow button */}
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
                      "&:hover": { backgroundColor: "rgba(51,102,163,0.08)" },
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
                <LocationOnOutlinedIcon fontSize="small" />
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

          {/* Right Column — Tabs in a card; sticky TabList; scrollable panels */}
          <Card
            sx={{
              borderRadius: "lg",
              p: { xs: 1, md: 1.5 },
              minWidth: 0, // prevent overflow from long contents
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                // make TabList sticky
                "& .MuiTabs-list": {
                  position: { md: "sticky" },
                  top: { md: headerOffset },
                  zIndex: 10,
                  backgroundColor: "background.body",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
              }}
            >
              <TabList>
                <Tab value="handover">Handover Sheet</Tab>
                <Tab value="scope">Scope</Tab>
                {allowedPO && <Tab value="po">Purchase Order</Tab>}
                <Tab value="eng">Engineering</Tab>
                <Tab value="notes">Notes</Tab>
              </TabList>

              <TabPanel
                value="handover"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: {
                    xs: "auto",
                    md: `100%`,
                  },
                  overflowY: { md: "auto" },
                }}
              >
                <Box
                  sx={{
                    minHeight: { md: "100%" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CamHandoverSheetForm />
                </Box>
              </TabPanel>

              <TabPanel
                value="scope"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: {
                    xs: "auto",
                    md: `100%`,
                  },
                  overflowY: { md: "auto" },
                }}
              >
                <ScopeDetail
                  project_id={project_id}
                  project_code={projectDetails?.code}
                />
              </TabPanel>

              {allowedPO && (
                <TabPanel
                  value="po"
                  sx={{
                    p: { xs: 1, md: 1.5 },
                    height: {
                      xs: "auto",
                      md: `100%`,
                    },
                    overflowY: { md: "auto" },
                  }}
                >
                  {/* Use full width; avoid fixed vw so it’s good on big screens */}
                  <Box sx={{ width: "100%" }}>
                    <PurchaseRequestCard project_code={projectDetails?.code} />
                  </Box>
                </TabPanel>
              )}

              <TabPanel
                value="eng"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: {
                    xs: "auto",
                    md: `100%`,
                  },
                  overflowY: { md: "auto" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Overview />
                </Box>
              </TabPanel>

              <TabPanel
                value="notes"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: {
                    xs: "auto",
                    md: `100%`,
                  },
                  overflowY: { md: "auto" },
                }}
              >
                <Posts projectId={project_id} />
              </TabPanel>
            </Tabs>
          </Card>
        </Box>
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
}
