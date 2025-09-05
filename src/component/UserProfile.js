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
import Chip from "@mui/joy/Chip";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";

// Icons
import EditRounded from "@mui/icons-material/EditRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import CameraAltOutlined from "@mui/icons-material/CameraAltOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

// RTK Query hooks
import {
  useGetUserByIdQuery,
  useEditUserMutation,
} from "../redux/loginSlice";

// --- constants / helpers ---
const ALL_KEYS = ["name", "email", "phone", "department", "location", "about"];
const BASIC_EDIT_KEYS = ["phone", "location", "about"];
const DEPT_OPTIONS = ["SCM", "Engineering", "BD", "Accounts", "Operations"];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (k in obj ? { ...acc, [k]: obj[k] } : acc), {});

const diffEditable = (base = {}, curr = {}, keys = []) => {
  const out = {};
  keys.forEach((k) => {
    const a = base[k] ?? "";
    const b = curr[k] ?? "";
    if (String(a) !== String(b)) out[k] = b;
  });
  return out;
};

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

// preview helper
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
    avatar_url: "", // current saved avatar URL (backed by DB attachment_url)
  });
  const [baselineForm, setBaselineForm] = useState(null);

  // NEW: staged avatar changes (preview + delayed upload)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [pendingAvatarRemove, setPendingAvatarRemove] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(""); // data URL for preview

  // NEW: preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  // RTK Query
  const ls = readUserFromLS();
  const storedUserId = ls?.userID;
  const {
    data,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    error: fetchError,
  } = useGetUserByIdQuery(storedUserId, { skip: !storedUserId });

  const [editUser] = useEditUserMutation();

  // Prefill from localStorage quickly
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
    setLoading(false);
  }, []);

  // Hydrate with fresh API data
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
        avatar_url: u.attachment_url || "",
      };
      setForm(initial);
      setBaselineForm(initial);
      setUser(u);

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

  // permissions (optional)
  const canEditAll = !!(
    user?.permissions?.profile_full_edit ||
    user?.profile_full_edit ||
    (typeof user?.role === "string" && user.role.toLowerCase() === "admin")
  );
  const editableKeys = useMemo(
    () => (canEditAll ? ALL_KEYS : BASIC_EDIT_KEYS),
    [canEditAll]
  );
  const isFieldEditable = (key) =>
    canEditAll ? true : BASIC_EDIT_KEYS.includes(key);

  const hasEditableChanges = useMemo(() => {
    if (!baselineForm) return false;
    const a = JSON.stringify(pick(form, editableKeys));
    const b = JSON.stringify(pick(baselineForm, editableKeys));
    return a !== b;
  }, [form, baselineForm, editableKeys]);

  const hasAvatarChange = !!pendingAvatarFile || pendingAvatarRemove;

  const handleField = (key) => (e, val) => {
    const value = e?.target ? e.target.value : val;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // --- Avatar handlers (no immediate upload) ---
  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarSelect = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setToast({ open: true, color: "warning", msg: "Please choose an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, color: "warning", msg: "Please upload an image ≤ 5MB." });
      return;
    }
    // stage for upload on Save, and show preview
    const dataUrl = await fileToDataURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarRemove(false);
    setAvatarPreview(dataUrl);
  };

  const markRemoveAvatar = () => {
    // mark for removal on Save; also reflect visually
    setPendingAvatarFile(null);
    setPendingAvatarRemove(true);
    setAvatarPreview("");
    setForm((f) => ({ ...f, avatar_url: "" }));
  };

  // --- Save handler: JSON only OR JSON + avatar OR avatar only OR remove avatar ---
  const saveProfile = async () => {
    if (!hasEditableChanges && !hasAvatarChange) return;
    setSaving(true);
    setApiError("");

    const currentLS = readUserFromLS();
    const userId = currentLS?.userID || user?._id;

    try {
      if (!userId) throw new Error("No user id to update.");

      // send only changed fields
      const changed = diffEditable(baselineForm, form, editableKeys);

      let resp;
      if (pendingAvatarFile) {
        // send file (and optionally changed fields)
        const fd = new FormData();
        fd.append("data", JSON.stringify(changed)); // can be {}
        fd.append("avatar", pendingAvatarFile);
        resp = await editUser({ userId, body: fd }).unwrap();
      } else if (pendingAvatarRemove) {
        // remove photo (and optionally changed fields)
        const body = { ...changed, attachment_url: "" };
        resp = await editUser({ userId, body }).unwrap();
      } else if (Object.keys(changed).length > 0) {
        // just fields
        resp = await editUser({ userId, body: changed }).unwrap();
      }

      const updatedUser = resp?.user || {};
      const serverAvatar = updatedUser.attachment_url ?? form.avatar_url;

      // update baselines/state/LS
      const nextBaseline = {
        ...baselineForm,
        ...changed,
        avatar_url: pendingAvatarRemove ? "" : serverAvatar,
      };
      setBaselineForm(nextBaseline);
      setForm((f) => ({ ...nextBaseline }));

      writeUserToLS({
        ...(readUserFromLS() || {}),
        ...nextBaseline,
        userID: userId,
        attachment_url: nextBaseline.avatar_url,
        avatar_url: nextBaseline.avatar_url,
      });

      // clear staged avatar changes
      setPendingAvatarFile(null);
      setPendingAvatarRemove(false);
      setAvatarPreview("");

      setToast({ open: true, color: "success", msg: "Profile updated successfully." });
    } catch (err) {
      setApiError(err?.data?.message || err?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Preview modal helpers
  const displayedAvatar = avatarPreview || form.avatar_url || "";
  const openPreview = () => {
    if (displayedAvatar) setPreviewOpen(true);
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
                  src={displayedAvatar || undefined}
                  onClick={openPreview}
                  title={displayedAvatar ? "Click to preview" : ""}
                  sx={{
                    width: 104,
                    height: 104,
                    fontSize: 36,
                    cursor: displayedAvatar ? "zoom-in" : "default",
                  }}
                >
                  {form.name?.[0]?.toUpperCase() || "U"}
                </Avatar>

                {!!hasAvatarChange && (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="warning"
                    sx={{ position: "absolute", left: 0, bottom: -10 }}
                  >
                    Unsaved photo
                  </Chip>
                )}

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
                  onChange={(e) => handleAvatarSelect(e.target.files?.[0])}
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
                    Choose new photo
                  </MenuItem>
                  <MenuItem
                    onClick={markRemoveAvatar}
                    disabled={!form.avatar_url && !avatarPreview}
                  >
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
                  disabled={saving || (!hasEditableChanges && !hasAvatarChange)}
                >
                  Save changes
                </Button>
              </Grid>
            </Grid>
          </Sheet>
        </Grid>
      </Grid>

      {/* Image Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <ModalDialog
          aria-labelledby="avatar-preview-title"
          sx={{
            p: 0,
            overflow: "hidden",
            maxWidth: "min(92vw, 900px)",
            bgcolor: "neutral.softBg",
          }}
        >
          <ModalClose />
          {displayedAvatar ? (
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: "100%",
                height: "100%",
                p: 2,
                bgcolor: "background.surface",
              }}
            >
              <img
                src={displayedAvatar}
                alt="Profile photo"
                style={{
                  maxWidth: "88vw",
                  maxHeight: "82vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography id="avatar-preview-title" level="title-md">
                No image available
              </Typography>
            </Box>
          )}
        </ModalDialog>
      </Modal>

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
