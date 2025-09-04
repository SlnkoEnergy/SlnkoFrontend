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

// RTK Query hooks
import {
  useGetUserByIdQuery,
  useEditUserMutation,
} from "../redux/loginSlice";

// no attachment_url in editable keys (we don’t expose it in UI)
const ALL_KEYS = [
  "name",
  "email",
  "phone",
  "department",
  "location",
  "about",
  "avatar_url", // local display only
];

const BASIC_EDIT_KEYS = ["phone", "location", "about"]; // editable for regular users
const DEPT_OPTIONS = ["SCM", "Engineering", "BD", "Accounts", "Operations"];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (k in obj ? { ...acc, [k]: obj[k] } : acc), {});

const LS_KEY = "userDetails";
const readUserFromLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeUserToLS = (next) => localStorage.setItem(LS_KEY, JSON.stringify(next));

// helper to preview avatar locally
const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function UserProfilePanel() {
  const fileRef = useRef(null);

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
    avatar_url: "", // displayed photo (comes from DB attachment_url or cache)
  });
  const [baselineForm, setBaselineForm] = useState(null);

  // ---- RTK Query hooks
  const ls = readUserFromLS();
  const storedUserId = ls?.userID;
  const {
    data,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    error: fetchError,
  } = useGetUserByIdQuery(storedUserId, { skip: !storedUserId });

  const [editUser] = useEditUserMutation();

  // Prefill from localStorage immediately (so UI isn’t blank)
  useEffect(() => {
    setApiError("");
    const cache = readUserFromLS();
    if (cache) {
      const prefill = {
        name: cache.name || "",
        email: cache.email || "",
        phone: String(cache.phone ?? ""),
        department: cache.department || "",
        location: cache.location || "",
        about: cache.about || "",
        avatar_url: cache.avatar_url || cache.attachment_url || "",
      };
      setForm(prefill);
      setBaselineForm(prefill);
      setUser(cache);
    }
    setLoading(false); // we will hydrate again when RTK data arrives
  }, []);

  // Hydrate with fresh API data when it arrives
  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      const initial = {
        name: u.name || "",
        email: u.email || "",
        phone: String(u.phone ?? ""),
        department: u.department || "",
        location: u.location || "",
        about: u.about || "",
        avatar_url: u.attachment_url || "", // map DB image URL to avatar
      };
      setForm(initial);
      setBaselineForm(initial);
      setUser(u);

      // sync LS so other screens see latest
      writeUserToLS({
        name: initial.name,
        email: initial.email,
        phone: initial.phone,
        emp_id: u.emp_id || "",
        role: u.role || "",
        department: initial.department,
        userID: u._id || storedUserId,
        location: initial.location,
        about: initial.about,
        attachment_url: initial.avatar_url,
        avatar_url: initial.avatar_url,
      });
    } else if (fetchError) {
      setApiError(
        fetchError?.data?.message ||
          "Live profile could not be fetched. Showing cached profile from this device."
      );
    }
  }, [data, fetchError, storedUserId]);

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

  const handleField = (key) => (e, val) => {
    const value = e?.target ? e.target.value : val;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const saveProfile = async () => {
    if (!hasEditableChanges) return;
    setSaving(true);
    setApiError("");

    const currentLS = readUserFromLS();
    const userId = currentLS?.userID || user?._id;
    const payload = pick(form, editableKeys); // phone/location/about for regular users

    try {
      if (!userId) throw new Error("No user id to update.");
      await editUser({ userId, ...payload }).unwrap();

      setBaselineForm((prev) => ({ ...prev, ...payload }));

      // update LS cache
      const merged = { ...(currentLS || {}), ...payload, userID: userId };
      writeUserToLS(merged);

      setToast({ open: true, color: "success", msg: "Profile updated successfully." });
    } catch (err) {
      setApiError(err?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // ====== PHOTO (local preview only; no backend upload) ======
  const handleAvatarClick = () => fileRef.current?.click();

  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, color: "warning", msg: "Please upload an image ≤ 5MB." });
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      setForm((f) => ({ ...f, avatar_url: dataUrl }));
      setBaselineForm((b) => ({ ...(b || {}), avatar_url: dataUrl }));

      const lsNow = readUserFromLS() || {};
      writeUserToLS({ ...lsNow, avatar_url: dataUrl });

      setToast({
        open: true,
        color: "neutral",
        msg: "Photo updated locally (not uploaded to server).",
      });
    } catch {
      setApiError("Failed to read the selected file.");
    }
  };

  const removeAvatar = () => {
    setForm((f) => ({ ...f, avatar_url: "" }));
    const lsNow = readUserFromLS() || {};
    writeUserToLS({ ...lsNow, avatar_url: "" });
    setToast({
      open: true,
      color: "neutral",
      msg: "Profile photo removed (local display).",
    });
  };

  const showSkeleton = loading || isUserLoading || isUserFetching;

  if (showSkeleton) {
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

      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        {/* LEFT: Profile Card */}
        <Grid xs={12} md={5} sx={{ display: "flex" }}>
          <Sheet
            variant="soft"
            sx={{
              flex: 1,
              height: "100%",
              minHeight: { md: 520, lg: 600 },
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
