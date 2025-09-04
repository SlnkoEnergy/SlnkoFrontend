import { useEffect, useMemo, useRef, useState } from "react";

// Joy UI
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Avatar from "@mui/joy/Avatar";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Stack from "@mui/joy/Stack";
import Snackbar from "@mui/joy/Snackbar";
import Alert from "@mui/joy/Alert";
import Skeleton from "@mui/joy/Skeleton";
import Tooltip from "@mui/joy/Tooltip";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";

// Icons
import EditRounded from "@mui/icons-material/EditRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import CameraAltOutlined from "@mui/icons-material/CameraAltOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

const ALL_KEYS = [
  "name",
  "email",
  "phone",
  "department",
  "location",
  "about",
  "avatar_url",
];

const BASIC_EDIT_KEYS = ["phone", "location", "about"]; // editable for regular users
const DEPT_OPTIONS = ["SCM", "Engineering", "BD", "Accounts", "Operations"];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (k in obj ? { ...acc, [k]: obj[k] } : acc), {});

// ---- localStorage helpers
const LS_KEY = "userDetails";
const readUserFromLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeUserToLS = (next) => {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
};

// safe getter for nested keys: "user.department" etc.
const getPath = (obj, path) =>
  path.split(".").reduce((a, k) => (a && a[k] != null ? a[k] : undefined), obj);

// coalesce first non-empty from a list of keys (supports nested "a.b" paths)
const coalesce = (obj, keys, fallback = "") => {
  for (const k of keys) {
    const v = k.includes(".") ? getPath(obj, k) : obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return fallback;
};

// Convert file -> dataURL for storing avatar locally
const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function UserProfilePanel() {
  const fileRef = useRef(null);

  // ----- State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, color: "success", msg: "" });
  const [apiError, setApiError] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    location: "",
    about: "",
    avatar_url: "",
  });
  const [baselineForm, setBaselineForm] = useState(null); // for change detection

  // ---- Load from localStorage with normalization
  useEffect(() => {
    setLoading(true);
    setApiError("");
    const raw = readUserFromLS();
    console.log("[UserProfile] localStorage userDetails:", raw);
    if (!raw) {
      setApiError("No user found in localStorage (key: 'userDetails').");
      setLoading(false);
      return;
    }

    // Some apps store user inside { user: {...} } or { data: {...} }
    const u = raw.user || raw.data || raw;

    const name =
      coalesce(u, ["name", "full_name", "username"], "") ||
      `${coalesce(u, ["first_name"], "")} ${coalesce(u, ["last_name"], "")}`.trim();

    const initial = {
      name,
      email: coalesce(u, ["email"], ""),
      phone: String(coalesce(u, ["phone", "mobile", "contact"], "")),
      department: coalesce(u, ["department", "dept", "department_name", "Department", "user.department"], ""),
      location: coalesce(u, ["location", "city", "user.location"], ""),
      about: coalesce(u, ["about", "bio", "user.about"], ""),
      avatar_url: coalesce(u, ["avatar_url", "photo", "avatar", "profile_pic", "user.avatar_url"], ""),
    };

    setUser(u);
    setForm(initial);
    setBaselineForm(initial);
    setLoading(false);
  }, []);

  // ---- Permissions (optional): allow full edit if you store a flag/admin)
  const canEditAll = !!(
    user?.permissions?.profile_full_edit ||
    user?.profile_full_edit ||
    (typeof user?.role === "string" && user.role.toLowerCase() === "admin")
  );
  const editableKeys = useMemo(
    () => (canEditAll ? ALL_KEYS : BASIC_EDIT_KEYS),
    [canEditAll]
  );

  const isFieldEditable = (key) => (canEditAll ? true : BASIC_EDIT_KEYS.includes(key));

  const hasEditableChanges = useMemo(() => {
    if (!baselineForm) return false;
    const curr = JSON.stringify(pick(form, editableKeys));
    const base = JSON.stringify(pick(baselineForm, editableKeys));
    return curr !== base;
  }, [form, baselineForm, editableKeys]);

  // ---- Handlers
  const handleField = (key) => (e, val) => {
    const value = e?.target ? e.target.value : val;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const saveProfile = () => {
    if (!hasEditableChanges) return;
    setSaving(true);
    try {
      // merge only editable keys back into the stored object
      const payload = pick(form, editableKeys);
      const current = readUserFromLS() || {};
      const nextMerged = { ...(current.user || current), ...payload };
      // keep original wrapping if any
      const toStore = current.user ? { ...current, user: nextMerged } : nextMerged;

      writeUserToLS(toStore);
      setUser(nextMerged);
      setBaselineForm((prev) => ({ ...prev, ...payload }));
      setToast({ open: true, color: "success", msg: "Profile updated locally." });
    } catch {
      setApiError("Failed to save to localStorage.");
    } finally {
      setSaving(false);
    }
  };



  // ---- Avatar
  const handleAvatarClick = () => fileRef.current?.click();

  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, color: "warning", msg: "Please upload an image ≤ 2MB." });
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await fileToDataURL(file); // store as base64 data URL
      setForm((f) => ({ ...f, avatar_url: dataUrl }));
      setBaselineForm((b) => ({ ...(b || {}), avatar_url: dataUrl }));

      const current = readUserFromLS() || {};
      const merged = { ...(current.user || current), avatar_url: dataUrl };
      const toStore = current.user ? { ...current, user: merged } : merged;
      writeUserToLS(toStore);
      setUser(merged);

      setToast({ open: true, color: "success", msg: "Profile photo updated." });
    } catch {
      setApiError("Failed to read the selected file.");
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = () => {
    setSaving(true);
    try {
      setForm((f) => ({ ...f, avatar_url: "" }));
      setBaselineForm((b) => ({ ...(b || {}), avatar_url: "" }));

      const current = readUserFromLS() || {};
      const merged = { ...(current.user || current), avatar_url: "" };
      const toStore = current.user ? { ...current, user: merged } : merged;
      writeUserToLS(toStore);
      setUser(merged);

      setToast({ open: true, color: "neutral", msg: "Profile photo removed." });
    } finally {
      setSaving(false);
    }
  };

  // ---- UI
  if (loading) {
    return (
      <Grid container spacing={2}>
        <Grid xs={12} md={5}>
          <Sheet variant="soft" sx={{ p: 2, borderRadius: "lg" }}>
            <Stack spacing={2} alignItems="center">
              <Skeleton variant="circular" width={120} height={120} />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
              <Divider />
              <Skeleton width="100%" height={36} />
              <Skeleton width="100%" height={36} />
            </Stack>
          </Sheet>
        </Grid>
        <Grid xs={12} md={7}>
          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg" }}>
            <Skeleton width="30%" />
            <Skeleton width="100%" height={48} />
            <Skeleton width="100%" height={48} />
            <Skeleton width="100%" height={96} />
          </Sheet>
        </Grid>
      </Grid>
    );
  }

  const deptInList = form.department && DEPT_OPTIONS.includes(form.department);

  return (
    <Box sx={{ ml: { md: "0px", lg: "var(--Sidebar-width)" } }}>
      {!!apiError && (
        <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <Grid
        container
        spacing={2}
        sx={{ alignItems: "stretch" }} // make columns equal height
      >
        {/* LEFT: Profile Card (wider & taller) */}
        <Grid xs={12} md={5} sx={{ display: "flex" }}>
          <Sheet
            variant="soft"
            sx={{
              flex: 1,               // fill grid cell
              height: "100%",        // match tallest column
              minHeight: { md: 520, lg: 600 }, // ensure it’s tall enough
              p: 3,
              borderRadius: "lg",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  variant="soft"
                  src={form.avatar_url || undefined}
                  sx={{ width: 104, height: 104, fontSize: 36 }}
                >
                  {form.name?.[0]?.toUpperCase() || "U"}
                </Avatar>

                {/* Change photo (stored in LS as data URL) */}
                <Tooltip title="Change photo">
                  <IconButton
                    size="sm"
                    variant="soft"
                    onClick={handleAvatarClick}
                    sx={{ position: "absolute", right: -6, bottom: -6, borderRadius: "50%" }}
                  >
                    <CameraAltOutlined />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => uploadAvatar(e.target.files?.[0])}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography level="title-lg" noWrap>
                  {form.name || "Unnamed User"}
                </Typography>
                <Typography level="body-sm" color="neutral" noWrap>
                  {form.email}
                </Typography>
              </Box>

              <Dropdown>
                <MenuButton
                  slots={{ root: IconButton }}
                  slotProps={{ root: { variant: "plain", color: "neutral" } }}
                >
                  <EditRounded />
                </MenuButton>
                <Menu placement="bottom-end">
                  <MenuItem onClick={handleAvatarClick}>
                    <UploadFileOutlined fontSize="small" style={{ marginRight: 8 }} />
                    Upload new photo
                  </MenuItem>
                  <MenuItem onClick={removeAvatar} disabled={!form.avatar_url}>
                    <DeleteOutline fontSize="small" style={{ marginRight: 8 }} />
                    Remove photo
                  </MenuItem>
                </Menu>
              </Dropdown>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <InfoRow label="Phone" value={form.phone || "—"} />
              <InfoRow label="Department" value={form.department || "—"} />
              <InfoRow label="Location" value={form.location || "—"} />
            </Stack>

            {!canEditAll && (
              <>
                <Divider />
                <Typography level="body-xs" color="neutral">
                  You can edit: <b>Phone</b>, <b>Location</b>, <b>About</b>, and change your photo.
                </Typography>
              </>
            )}
          </Sheet>
        </Grid>

        {/* RIGHT: Details */}
        <Grid xs={12} md={7} sx={{ display: "flex" }}>
          <Sheet variant="outlined" sx={{ borderRadius: "lg", p: 2, flex: 1 }}>
            <Grid container spacing={1.5}>
              <Grid xs={12}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={form.name}
                    onChange={handleField("name")}
                    placeholder="Enter full name"
                    disabled={!isFieldEditable("name")}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={form.email}
                    onChange={handleField("email")}
                    type="email"
                    placeholder="name@company.com"
                    disabled={!isFieldEditable("email")}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={form.phone}
                    onChange={handleField("phone")}
                    placeholder="+91 98765 43210"
                    disabled={!isFieldEditable("phone")}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={form.department || null}
                    onChange={handleField("department")}
                    placeholder="Select department"
                    disabled={!isFieldEditable("department")}
                  >
                    {/* Add current value if it's not in the predefined list */}
                    {!deptInList && form.department && (
                      <Option value={form.department}>{form.department}</Option>
                    )}
                    {DEPT_OPTIONS.map((d) => (
                      <Option key={d} value={d}>
                        {d}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6}>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={form.location}
                    onChange={handleField("location")}
                    placeholder="City, State"
                    disabled={!isFieldEditable("location")}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12}>
                <FormControl>
                  <FormLabel>About</FormLabel>
                  <Textarea
                    minRows={3}
                    value={form.about}
                    onChange={handleField("about")}
                    placeholder="Short bio / responsibilities…"
                    disabled={!isFieldEditable("about")}
                  />
                </FormControl>
              </Grid>

              <Grid xs={12} sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  loading={saving}
                  startDecorator={<SaveRounded />}
                  onClick={saveProfile}
                  disabled={!hasEditableChanges}
                >
                  Save changes
                </Button>
                
              </Grid>
            </Grid>
          </Sheet>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        color={toast.color}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast.msg}
      </Snackbar>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography level="body-sm" color="neutral">
        {label}
      </Typography>
      <Typography level="body-sm" sx={{ fontWeight: 600, textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
}
