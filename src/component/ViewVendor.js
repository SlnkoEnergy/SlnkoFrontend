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
  Snackbar,
} from "@mui/joy";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useGetProjectByIdQuery } from "../redux/projectsSlice";
import { useGetPostsQuery } from "../redux/postsSlice";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Overview from "./Forms/Engineering/Eng_Overview/Overview";
import CamHandoverSheetForm from "./Lead Stage/Handover/CAMHandover";
import PurchaseRequestCard from "./PurchaseRequestCard";
import ScopeDetail from "./Scope";
import Posts from "./Posts";
import { useGetVendorByIdQuery } from "../redux/vendorSlice";

/* ---------------- helpers ---------------- */
const getUserData = () => {
  try {
    const raw = localStorage.getItem("userDetails");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const VALID_TABS = new Set(["notes", "handover", "scope", "po", "eng"]);
const NUM_TO_KEY = {
  0: "notes",
  1: "handover",
  2: "scope",
  3: "po",
  4: "eng",
};

const sanitizeTabFromQuery = (raw) => {
  if (!raw) return "notes";
  if (NUM_TO_KEY[raw]) return NUM_TO_KEY[raw];
  if (VALID_TABS.has(raw)) return raw;
  return "notes";
};

const canUserSeePO = (user) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const dept = user.department || "";
  const special = user.emp_id === "SE-013";
  const privileged = special || role === "admin" || role === "superadmin";
  return privileged || dept !== "Engineering";
};

export default function Vendor_Detail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") || "";
  const project_id = searchParams.get("project_id") || "";
  const { data: postsResp } = useGetPostsQuery({ project_id });

  const currentUser = useMemo(() => getUserData(), []);
  const currentUserId = useMemo(
    () => (currentUser ? currentUser.userID || null : null),
    [currentUser]
  );

  const { data: getVendor } = useGetVendorByIdQuery(id);
  const vendorDetails = getVendor?.data || {};
  const initialTab = sanitizeTabFromQuery(searchParams.get("tab"));
  const [tabValue, setTabValue] = useState(initialTab);
  const allowedPO = canUserSeePO(currentUser);

  useEffect(() => {
    const requested = sanitizeTabFromQuery(searchParams.get("tab"));
    const isPORequested = requested === "po";
    if (isPORequested && !allowedPO) {
      setTabValue("handover");
      const params = new URLSearchParams(searchParams);
      params.set("tab", "handover");
      setSearchParams(params);
    } else {
      setTabValue(requested);
    }
  }, [searchParams, allowedPO, setSearchParams]);

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
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    color: "success",
  });

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

  const headerOffset = 72;

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: { xs: 1, md: 2 },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", lg: 1400, xl: 1600 },
          mx: "auto",
          width: "100%",
        }}
      >
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
          <Card
            variant="outlined"
            sx={{
              position: { xs: "static", md: "sticky" },
              top: { md: headerOffset + 16 },
              borderRadius: "lg",
              width: "100%",
              flexShrink: 0,
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
              <Box>
                <Stack spacing={1} alignItems="flex-start">
                  <Avatar
                    src={
                      vendorDetails?.profile_image || "/path-to-profile-pic.jpg"
                    }
                    alt={vendorDetails?.name || "Vendor"}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Typography level="title-md">
                    {vendorDetails?.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailOutlinedIcon fontSize="small" />
                    <Typography level="body-sm">
                      {vendorDetails?.contact_details?.email || "-"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneOutlinedIcon fontSize="small" />
                    <Typography level="body-sm">
                      {vendorDetails?.contact_details?.phone || "-"}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlinedIcon fontSize="small" />
                <Typography level="body-sm" sx={{ ml: 0.5 }}>
                  {(() => {
                    const addr = vendorDetails?.address || {};
                    const parts = [
                      addr.line1,
                      addr.line2,
                      addr.city,
                      addr.state,
                      addr.zipcode,
                    ]
                      .filter(Boolean)
                      .map((str) =>
                        typeof str === "string"
                          ? str.replace(/\b\w/g, (c) => c.toUpperCase())
                          : str
                      );
                    return parts.length ? parts.join(", ") : "-";
                  })()}
                </Typography>
              </Stack>
              <Typography level="body-sm">
                <b>Type:</b>{" "}
                {vendorDetails?.type
                  ? vendorDetails.type.charAt(0).toUpperCase() +
                    vendorDetails.type.slice(1)
                  : "-"}
              </Typography>
              {vendorDetails?.type === "person" && (
                <Typography level="body-sm">
                  <b>Company Name:</b>{" "}
                  {vendorDetails?.company_name
                    ? vendorDetails.company_name.charAt(0).toUpperCase() +
                      vendorDetails.company_name.slice(1)
                    : "-"}
                </Typography>
              )}
              <Typography level="body-sm">
                <b>Beneficiary Name:</b> {vendorDetails?.Beneficiary_Name}
              </Typography>
              <Typography level="body-sm">
                <b>Account Number:</b> {vendorDetails?.Account_No}
              </Typography>
              <Typography level="body-sm">
                <b>IFSC Code:</b> {vendorDetails?.IFSC_Code}
              </Typography>
              <Typography level="body-sm">
                <b>Bank Name:</b> {vendorDetails?.Bank_Name}
              </Typography>
              <Typography level="body-sm">
                <b>On Boarding Date:</b>{" "}
                {vendorDetails?.createdAt
                  ? new Date(vendorDetails.createdAt).toLocaleDateString()
                  : "-"}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography level="body-sm">
                <b>Balance:</b> ₹ {vendorDetails?.balance}
              </Typography>
            </Stack>
          </Card>

          {/* Right Column — Tabs in a card; sticky TabList; scrollable panels */}
          <Card
            sx={{
              borderRadius: "lg",
              p: { xs: 1, md: 1.5 },
              minWidth: 0,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
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
                <Tab value="purchaseorders">Purchase Orders</Tab>
                <Tab value="payments">Payments</Tab>
                <Tab value="emails">Emails</Tab>
                <Tab value="balance">Summary</Tab>
              </TabList>

              <TabPanel
                value="purchaseorders"
                sx={{
                    p: { xs: 1, md: 1.5 },
                    height: { xs: "auto", md: `100%` },
                    overflowY: { md: "auto" },
                  }}
              >
                <Box sx={{ width: "100%" }}>
                  <PurchaseRequestCard vendor_id={vendorDetails?._id} />
                </Box>
              </TabPanel>

              <TabPanel
                value="eng"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: { xs: "auto", md: `100%` },
                  overflowY: { md: "auto" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Overview />
                </Box>
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
