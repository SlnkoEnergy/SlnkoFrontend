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
import Timelapse from "@mui/icons-material/Timelapse";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
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
import Documents from "./Document";

/* ---------------- helpers ---------------- */
const getUserData = () => {
  try {
    const raw = localStorage.getItem("userDetails");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const VALID_TABS = new Set([
  "notes",
  "documents",
  "handover",
  "scope",
  "po",
  "eng",
]);
const NUM_TO_KEY = {
  0: "notes",
  1: "documents",
  2: "handover",
  3: "scope",
  4: "po",
  5: "eng",
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
  const name = String(user.name || "").trim();
  if (name === "Ranvijay Singh" || name === "Rishav Mahato") return true;
  const special = user.emp_id === "SE-013";
  const privileged = special || role === "admin" || role === "superadmin";
  return privileged || dept !== "Engineering";
};

const canUserSeeDocument = (user) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const dept = user.department || "";
  const name = String(user.name || "").trim();
  const special = user.emp_id === "SE-013";
  const privileged = special || role === "admin" || role === "superadmin";
  return privileged || dept !== "SCM";
};

const canUserSeeHandover = (user) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  const dept = user.department || "";
  const special = user.emp_id === "SE-013";
  const privileged = special || role === "admin" || role === "superadmin";
  return privileged || dept !== "SCM";
};

/* ------------ Date helpers ------------- */
function toDMY(date) {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "-";
  }
}

function fmtLocalDate(v) {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "-";
}

/* ------------ Loan status color helper ------------- */
const statusColor = (s) => {
  switch (String(s || "").toLowerCase()) {
    case "documents pending":
      return "danger";
    case "under banking process":
      return "warning";
    case "sanctioned":
      return "primary";
    case "disbursed":
      return "success";
    default:
      return "neutral";
  }
};

/** Pick preferred upcoming target among project dates. */
function pickCountdownTargetFromProject(project) {
  const candidates = [];
  const pushIfValid = (key, value) => {
    if (!value) return;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) candidates.push({ key, date: d });
  };
  pushIfValid("project_completion_date", project?.project_completion_date);
  pushIfValid("ppa_expiry_date", project?.ppa_expiry_date);
  pushIfValid("bd_commitment_date", project?.bd_commitment_date);

  if (!candidates.length) return { target: null, usedKey: null };

  const prefOrder = [
    "project_completion_date",
    "ppa_expiry_date",
    "bd_commitment_date",
  ];
  const now = Date.now();

  for (const k of prefOrder) {
    const hit = candidates.find((c) => c.key === k && c.date.getTime() > now);
    if (hit) return { target: hit.date, usedKey: hit.key };
  }

  const futures = candidates.filter((c) => c.date.getTime() > now);
  if (futures.length) {
    const soonest = futures.reduce((a, b) => (a.date < b.date ? a : b));
    return { target: soonest.date, usedKey: soonest.key };
  }

  const latestPast = candidates.reduce((a, b) => (a.date > b.date ? a : b));
  return { target: latestPast.date, usedKey: latestPast.key };
}
const formatStatusText = (s) =>
  String(s || "")
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function RemainingDaysChip({ days, target, usedKey }) {
  const [text, setText] = useState("—");
  const [color, setColor] = useState("neutral");

  useEffect(() => {
    if (typeof days === "number" && Number.isFinite(days)) {
      if (days < 0) {
        setText(`Expired ${Math.abs(days)}d`);
        setColor("danger");
      } else if (days === 0) {
        setText("Today");
        setColor("warning");
      } else {
        setText(`${days}d`);
        setColor(days < 10 ? "danger" : days < 30 ? "warning" : "success");
      }
    }
  }, [days]);

  useEffect(() => {
    if (typeof days === "number" && Number.isFinite(days)) return;

    if (!target) {
      setText("—");
      setColor("neutral");
      return;
    }
    let cancelled = false;
    const tick = () => {
      const now = new Date().getTime();
      const end = new Date(target).getTime();
      const diff = end - now;
      if (diff <= 0) {
        if (!cancelled) {
          setText("Expired");
          setColor("danger");
        }
        return;
      }
      const seconds = Math.floor(diff / 1000);
      const d = Math.floor(seconds / (24 * 3600));
      const h = Math.floor((seconds % (24 * 3600)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      parts.push(`${h}h`, `${m}m`, `${s}s`);

      let c = "success";
      if (d < 10) c = "danger";
      else if (d < 30) c = "warning";

      if (!cancelled) {
        setText(parts.join(" "));
        setColor(c);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [days, target]);

  const label =
    usedKey === "project_completion_date"
      ? "Project Completion"
      : usedKey === "ppa_expiry_date"
      ? "PPA Expiry"
      : usedKey === "bd_commitment_date"
      ? "BD Commitment"
      : "Target";

  return (
    <Tooltip
      title={
        typeof days === "number" && Number.isFinite(days)
          ? label
          : target
          ? `${label}: ${toDMY(target)}`
          : "No target date"
      }
      arrow
    >
      <Chip variant="soft" color={color} size="sm" sx={{ fontWeight: 600 }}>
        {text}
      </Chip>
    </Tooltip>
  );
}

/* ----------- Utility for pending doc names ----------- */
const pendingDocNames = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((d) => String(d?.filename || "").trim())
    .filter(Boolean);

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

  const initialTab = sanitizeTabFromQuery(searchParams.get("tab"));
  const [tabValue, setTabValue] = useState(initialTab);
  const allowedPO = canUserSeePO(currentUser);
  const allowedDocument = canUserSeeDocument(currentUser);
  const allowedHandover = canUserSeeHandover(currentUser);

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

  const [isFollowing, setIsFollowing] = useState(false);
  const [follow, { isLoading: isFollowingCall }] = useFollowMutation();
  const [unfollow, { isLoading: isUnfollowingCall }] = useUnfollowMutation();
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
          msg: "You're now following this project.",
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

  const headerOffset = 72;
  const p_id = projectDetails?.p_id;

  const apiRemainingDays = useMemo(() => {
    const n = Number(projectDetails?.remaining_days);
    return Number.isFinite(n) ? n : null;
  }, [projectDetails?.remaining_days]);

  const { target: countdownTarget, usedKey: countdownKey } = useMemo(
    () => pickCountdownTargetFromProject(projectDetails),
    [projectDetails]
  );

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: { xs: 1, md: 0 },
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
            gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
            gap: { xs: 1.5, md: 2 },
            alignItems: "start",
          }}
        >
          {/* Left Column — sticky profile card */}
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
            {/* Remaining row ABOVE avatar */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}
            >
              <Timelapse fontSize="small" color="primary" />
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                Remaining:
              </Typography>
              <RemainingDaysChip
                days={apiRemainingDays}
                target={countdownTarget}
                usedKey={countdownKey}
              />
            </Box>

            {/* Customer Info */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Stack spacing={1}>
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

            <Box display={"flex"} gap={1} alignItems={"center"}>
              <Typography level="body-sm">
                <b>Loan Status:</b>
              </Typography>
              {projectDetails?.loan_status && (
                <Box>
                  {String(projectDetails?.loan_status).toLowerCase() ===
                  "documents pending" ? (
                    <Tooltip
                      arrow
                      sx={{
                        backgroundColor: "#fff",
                      }}
                      title={
                        <Box sx={{ maxWidth: 360 }}>
                          <Typography level="title-sm" sx={{ mb: 0.5 }}>
                            Missing Documents
                          </Typography>
                          {pendingDocNames(projectDetails?.documents_pending)
                            .length
                            ? pendingDocNames(
                                projectDetails?.documents_pending
                              ).map((n, i) => (
                                <Typography
                                  key={`${n}-${i}`}
                                  level="body-xs"
                                  sx={{ display: "block" }}
                                >
                                  • {n}
                                </Typography>
                              ))
                            : "No list available."}
                        </Box>
                      }
                    >
                      <Chip
                        size="sm"
                        variant="solid"
                        color={statusColor(projectDetails?.loan_status)}
                        startDecorator={
                          <ReportProblemRoundedIcon fontSize="small" />
                        }
                        sx={{ fontWeight: 700, cursor: "pointer" }}
                      >
                        {formatStatusText(projectDetails?.loan_status)}
                      </Chip>
                    </Tooltip>
                  ) : (
                    <Chip
                      size="sm"
                      variant="solid"
                      color={statusColor(projectDetails?.loan_status)}
                      sx={{ fontWeight: 700 }}
                    >
                      {formatStatusText(projectDetails?.loan_status)}
                    </Chip>
                  )}
                </Box>
              )}
            </Box>

            {/* Project Details */}
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
                <b>Project Group:</b> {projectDetails?.p_group || "-"}
              </Typography>
              <Typography level="body-sm">
                <b>Capacity:</b> {projectDetails?.project_kwp || "-"}
              </Typography>
              <Typography level="body-sm">
                <b>Substation Distance:</b> {projectDetails?.distance || "-"}
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
                <b>Tariff:</b> {projectDetails?.tarrif || "-"}
              </Typography>

              <Typography level="body-sm">
                <b>PPA Expiry Date:</b>{" "}
                {fmtLocalDate(projectDetails?.ppa_expiry_date)}
              </Typography>
              <Typography level="body-sm">
                <b>BD Commitment Date:</b>{" "}
                {fmtLocalDate(projectDetails?.bd_commitment_date)}
              </Typography>
              <Typography level="body-sm">
                <b>Project Completion Date:</b>{" "}
                {fmtLocalDate(projectDetails?.project_completion_date)}
              </Typography>

              {currentUser?.department !== "Engineering" &&
                currentUser?.department !== "SCM" && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography level="body-sm">
                      <b>Slnko Service Charges:</b> ₹{" "}
                      {projectDetails?.service || "-"}
                    </Typography>
                  </>
                )}
            </Stack>
          </Card>

          {/* Right Column — Tabs */}
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
                <Tab value="notes">Notes</Tab>
                {allowedDocument && <Tab value="documents">Documents</Tab>}
                {allowedHandover && <Tab value="handover">Handover Sheet</Tab>}
                <Tab value="scope">Material Status</Tab>
                {allowedPO && <Tab value="po">Purchase Order</Tab>}
                <Tab value="eng">Engineering</Tab>
              </TabList>

              {/* Notes */}
              <TabPanel
                value="notes"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: { xs: "auto", md: "100%" },
                  overflowY: { md: "auto" },
                }}
              >
                <Posts projectId={project_id} />
              </TabPanel>

              {/* Documents */}
              {allowedDocument && (
                <TabPanel
                  value="documents"
                  sx={{
                    p: { xs: 1, md: 1.5 },
                    height: { xs: "auto", md: "100%" },
                    overflowY: { md: "auto" },
                  }}
                >
                  <Documents projectId={project_id} />
                </TabPanel>
              )}

              {/* Handover Sheet */}
              {allowedHandover && (
                <TabPanel
                  value="handover"
                  sx={{
                    p: { xs: 1, md: 1.5 },
                    height: { xs: "auto", md: "100%" },
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
                    <CamHandoverSheetForm p_id={p_id} />
                  </Box>
                </TabPanel>
              )}

              {/* Material Status */}
              <TabPanel
                value="scope"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: { xs: "auto", md: "100%" },
                  overflowY: { md: "auto" },
                }}
              >
                <ScopeDetail
                  project_id={project_id}
                  project_code={projectDetails?.code}
                />
              </TabPanel>

              {/* Purchase Orders */}
              {allowedPO && (
                <TabPanel
                  value="po"
                  sx={{
                    p: { xs: 1, md: 1.5 },
                    height: { xs: "auto", md: "100%" },
                    overflowY: { md: "auto" },
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    <PurchaseRequestCard project_code={projectDetails?.code} />
                  </Box>
                </TabPanel>
              )}

              {/* Engineering */}
              <TabPanel
                value="eng"
                sx={{
                  p: { xs: 1, md: 1.5 },
                  height: { xs: "auto", md: "100%" },
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

      {/* Snackbar Toast */}
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
