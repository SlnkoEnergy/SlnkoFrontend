// UserProfilePanel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
import { useGetUserByIdQuery, useEditUserMutation } from "../redux/loginSlice";

/* ---------------- helpers / constants ---------------- */
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
const writeUserToLS = (next) =>
  localStorage.setItem(LS_KEY, JSON.stringify(next));

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function UserProfilePanel() {
  const fileRef = useRef(null);
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    color: "success",
    msg: "",
  });
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
  const [baselineForm, setBaselineForm] = useState(null);

  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [pendingAvatarRemove, setPendingAvatarRemove] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const ls = readUserFromLS();
  const myId =
    ls?.userID || ls?.userId || ls?._id || ls?.id || ls?.emp_id || "";
  const viewingIdParam = searchParams.get("user_id") || "";
  const isOwnProfile =
    !viewingIdParam || String(viewingIdParam) === String(myId);
  const effectiveUserId = isOwnProfile ? myId : viewingIdParam;

  const {
    data,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    error: fetchError,
  } = useGetUserByIdQuery(effectiveUserId, { skip: !effectiveUserId });

  const [editUser] = useEditUserMutation();

  useEffect(() => {
    setApiError("");
    if (isOwnProfile) {
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
    }
    setLoading(false);
  }, [isOwnProfile]);

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

      if (isOwnProfile) {
        writeUserToLS({
          name: initial.name,
          email: initial.email,
          phone: initial.phone,
          emp_id: u.emp_id || "",
          role: u.role || "",
          department: initial.department,
          userID: u._id || myId,
          location: initial.location,
          about: initial.about,
          attachment_url: initial.avatar_url,
          avatar_url: initial.avatar_url,
        });
      }
    } else if (fetchError) {
      setApiError(
        fetchError?.data?.message ||
          (isOwnProfile
            ? "Live profile could not be fetched. Showing cached profile from this device."
            : "This profile could not be fetched right now.")
      );
    }
  }, [data, fetchError, isOwnProfile, myId]);

  const iAmAdmin = !!(
    ls?.permissions?.profile_full_edit ||
    ls?.profile_full_edit ||
    (typeof ls?.role === "string" && ls.role.toLowerCase() === "admin")
  );
  const canEditAll = isOwnProfile && iAmAdmin;
  const editableKeys = useMemo(
    () => (isOwnProfile ? (canEditAll ? ALL_KEYS : BASIC_EDIT_KEYS) : []),
    [isOwnProfile, canEditAll]
  );

  const isFieldEditable = (key) =>
    isOwnProfile ? (canEditAll ? true : BASIC_EDIT_KEYS.includes(key)) : false;

  const hasEditableChanges = useMemo(() => {
    if (!baselineForm) return false;
    if (!isOwnProfile) return false;
    const a = JSON.stringify(pick(form, editableKeys));
    const b = JSON.stringify(pick(baselineForm, editableKeys));
    return a !== b;
  }, [form, baselineForm, editableKeys, isOwnProfile]);

  const hasAvatarChange =
    isOwnProfile && (!!pendingAvatarFile || pendingAvatarRemove);

  const handleField = (key) => (e, val) => {
    const value = e?.target ? e.target.value : val;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAvatarClick = () => {
    if (!isOwnProfile) return;
    fileRef.current?.click();
  };

  const handleAvatarSelect = async (file) => {
    if (!isOwnProfile) {
      setToast({
        open: true,
        color: "warning",
        msg: "You can only change your own photo.",
      });
      return;
    }
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setToast({
        open: true,
        color: "warning",
        msg: "Please choose an image file.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        open: true,
        color: "warning",
        msg: "Please upload an image ≤ 5MB.",
      });
      return;
    }
    const dataUrl = await fileToDataURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarRemove(false);
    setAvatarPreview(dataUrl);
  };

  const markRemoveAvatar = () => {
    if (!isOwnProfile) return;
    setPendingAvatarFile(null);
    setPendingAvatarRemove(true);
    setAvatarPreview("");
    setForm((f) => ({ ...f, avatar_url: "" }));
  };

  const saveProfile = async () => {
    if (!isOwnProfile) {
      setToast({
        open: true,
        color: "warning",
        msg: "You can only edit your own profile.",
      });
      return;
    }
    if (!hasEditableChanges && !hasAvatarChange) return;
    setSaving(true);
    setApiError("");

    const currentLS = readUserFromLS();
    const userId = currentLS?.userID || user?._id || myId;

    try {
      if (!userId) throw new Error("No user id to update.");

      const changed = diffEditable(baselineForm, form, editableKeys);
      let resp;

      if (pendingAvatarFile) {
        const fd = new FormData();
        fd.append("data", JSON.stringify(changed));
        fd.append("avatar", pendingAvatarFile);
        resp = await editUser({ userId, body: fd }).unwrap();
      } else if (pendingAvatarRemove) {
        const body = { ...changed, attachment_url: "" };
        resp = await editUser({ userId, body }).unwrap();
      } else if (Object.keys(changed).length > 0) {
        resp = await editUser({ userId, body: changed }).unwrap();
      }

      const updatedUser = resp?.user || {};
      const serverAvatar = updatedUser.attachment_url ?? form.avatar_url;

      const nextBaseline = {
        ...baselineForm,
        ...changed,
        avatar_url: pendingAvatarRemove ? "" : serverAvatar,
      };
      setBaselineForm(nextBaseline);
      setForm((f) => ({ ...nextBaseline }));

      if (isOwnProfile) {
        writeUserToLS({
          ...(readUserFromLS() || {}),
          ...nextBaseline,
          userID: userId,
          attachment_url: nextBaseline.avatar_url,
          avatar_url: nextBaseline.avatar_url,
        });
      }

      setPendingAvatarFile(null);
      setPendingAvatarRemove(false);
      setAvatarPreview("");

      setToast({
        open: true,
        color: "success",
        msg: "Profile updated successfully.",
      });
    } catch (err) {
      setApiError(
        err?.data?.message || err?.message || "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = avatarPreview || form.avatar_url || "";
  const openPreview = () => displayedAvatar && setPreviewOpen(true);

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

      {/* View-only banner with tight possessive spacing */}
      {!isOwnProfile && (
        <Alert color="neutral" variant="soft" sx={{ mb: 2 }}>
          <Typography component="span" sx={{ display: "inline" }}>
            You’re viewing{" "}
            <Typography
              component="span"
              sx={{ color: "primary.700", fontWeight: 700, display: "inline" }}
            >
              {(form.name || "this user") + "’s"}
            </Typography>
            {" profile. Editing is disabled."}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        {/* LEFT */}
        <Grid xs={12} md={5} sx={{ display: "flex" }}>
          <Sheet
            variant="outlined"
            sx={{
              flex: 1,
              height: "100%",
              minHeight: { md: 520, lg: 600 },
              p: 0,
              borderRadius: "xl",
              overflow: "hidden",
              boxShadow: "sm",
              bgcolor: "background.surface",
            }}
          >
            {/* Header row (no cover) */}
            <Box
              sx={{
                px: 3,
                pt: 2, // add some top padding
                pb: 2,
                mt: 0, // no negative margin
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Avatar */}
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
                    boxShadow: "md",
                    // optional: a subtle ring; remove if you don't want it
                    border: "2px solid var(--joy-palette-neutral-200)",
                  }}
                >
                  {form.name?.[0]?.toUpperCase() || "U"}
                </Avatar>

                {!!hasAvatarChange && (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="warning"
                    sx={{
                      position: "absolute",
                      left: 0,
                      bottom: -10,
                      boxShadow: "sm",
                    }}
                  >
                    Unsaved photo
                  </Chip>
                )}

                <Tooltip title={isOwnProfile ? "Change photo" : "Read-only"}>
                  <span>
                    <IconButton
                      size="sm"
                      variant="solid"
                      color="neutral"
                      onClick={handleAvatarClick}
                      disabled={!isOwnProfile}
                      sx={{
                        position: "absolute",
                        right: -6,
                        bottom: -6,
                        borderRadius: "50%",
                        boxShadow: "md",
                      }}
                    >
                      <CameraAltOutlined />
                    </IconButton>
                  </span>
                </Tooltip>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleAvatarSelect(e.target.files?.[0])}
                />
              </Box>

              {/* Name + Email + Chips */}
              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.25,
                }}
              >
                <Typography level="title-lg" sx={{ lineHeight: 1.15 }} noWrap>
                  {form.name || "Unnamed User"}
                </Typography>

                {/* ⬇️ Replace the old email Typography with this */}
                <Typography
                  level="body-sm"
                  color="neutral"
                  sx={{
                    lineHeight: 1.1,
                    whiteSpace: "normal", // allow wrapping
                    overflowWrap: "anywhere", // break long strings like emails
                    wordBreak: "break-word",
                    maxWidth: "100%",
                  }}
                  title={form.email} // optional: shows full email on hover
                >
                  {form.email}
                </Typography>

                <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                  {!!form.department && (
                    <Chip
                      size="sm"
                      variant="soft"
                      color="primary"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {form.department}
                    </Chip>
                  )}
                  {!!form.location && (
                    <Chip size="sm" variant="soft" color="neutral">
                      {form.location}
                    </Chip>
                  )}
                </Stack>
              </Box>

              {/* Smaller pencil */}
              <Dropdown>
                <MenuButton
                  disabled={!isOwnProfile}
                  slots={{ root: IconButton }}
                  slotProps={{
                    root: {
                      variant: "plain",
                      color: "neutral",
                      size: "sm",
                      sx: { p: 0.25, "& svg": { fontSize: 18 } },
                    },
                  }}
                  aria-label="Edit photo"
                  title="Edit photo"
                >
                  <EditRounded />
                </MenuButton>
                <Menu placement="bottom-end">
                  <MenuItem
                    onClick={handleAvatarClick}
                    disabled={!isOwnProfile}
                  >
                    <UploadFileOutlined
                      fontSize="small"
                      style={{ marginRight: 8 }}
                    />
                    Choose new photo
                  </MenuItem>
                  <MenuItem
                    onClick={markRemoveAvatar}
                    disabled={
                      !isOwnProfile || (!form.avatar_url && !avatarPreview)
                    }
                  >
                    <DeleteOutline
                      fontSize="small"
                      style={{ marginRight: 8 }}
                    />
                    Remove photo
                  </MenuItem>
                </Menu>
              </Dropdown>
            </Box>

            <Divider />

            {/* Basic Information */}
            <Box sx={{ p: 3 }}>
              <Typography
                level="title-sm"
                sx={{ mb: 1.25, color: "text.tertiary" }}
              >
                Basic Information
              </Typography>

              <Sheet
                variant="soft"
                sx={{
                  p: 1.25,
                  borderRadius: "lg",
                  bgcolor: "background.level1",
                  display: "grid",
                  rowGap: 0.75,
                }}
              >
                <InfoRow label="Phone" value={form.phone || "—"} />
                <Divider />
                <InfoRow label="Department" value={form.department || "—"} />
                <Divider />
                <InfoRow label="Location" value={form.location || "—"} />
              </Sheet>

              {isOwnProfile && !canEditAll && (
                <Typography
                  level="body-xs"
                  sx={{ mt: 1.5, color: "text.tertiary" }}
                >
                  You can edit: <b>Phone</b>, <b>Location</b>, <b>About</b>, and
                  change your photo.
                </Typography>
              )}
            </Box>
          </Sheet>
        </Grid>

        {/* RIGHT */}
        <Grid xs={12} md={7} sx={{ display: "flex" }}>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "xl",
              p: 2,
              flex: 1,
              boxShadow: "sm",
              bgcolor: "background.surface",
            }}
          >
            {/* Keep only Personal Information chip (removed others) */}
            <Stack direction="row" gap={1} sx={{ mb: 1 }}>
              <Chip size="sm" variant="solid" color="primary">
                Personal Information
              </Chip>
            </Stack>

            {/* Identity */}
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "lg",
                bgcolor: "background.level1",
                mb: 1.5,
              }}
            >
              <Typography
                level="title-sm"
                sx={{ mb: 1, color: "text.tertiary" }}
              >
                Identity
              </Typography>

              <Grid container spacing={1.25}>
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

                <Grid xs={12} md={6}>
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

                <Grid xs={12} md={6}>
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
              </Grid>
            </Sheet>

            {/* Work & Location */}
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "lg",
                bgcolor: "background.level1",
                mb: 1.5,
              }}
            >
              <Typography
                level="title-sm"
                sx={{ mb: 1, color: "text.tertiary" }}
              >
                Work & Location
              </Typography>

              <Grid container spacing={1.25}>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={form.department || null}
                      onChange={handleField("department")}
                      placeholder="Select department"
                      disabled={!isFieldEditable("department")}
                      slotProps={{
                        button: { sx: { textTransform: "capitalize" } },
                      }}
                    >
                      {!deptInList && form.department && (
                        <Option
                          value={form.department}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {form.department}
                        </Option>
                      )}
                      {DEPT_OPTIONS.map((d) => (
                        <Option
                          key={d}
                          value={d}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {d}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
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
              </Grid>
            </Sheet>

            {/* About */}
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "lg",
                bgcolor: "background.level1",
              }}
            >
              <Typography
                level="title-sm"
                sx={{ mb: 1, color: "text.tertiary" }}
              >
                About
              </Typography>
              <FormControl>
                <Textarea
                  minRows={3}
                  value={form.about}
                  onChange={handleField("about")}
                  placeholder="Short bio / responsibilities…"
                  disabled={!isFieldEditable("about")}
                />
              </FormControl>
            </Sheet>

            <Stack direction="row" gap={1} sx={{ mt: 1.5 }}>
              <Button
                loading={saving}
                startDecorator={<SaveRounded />}
                onClick={saveProfile}
                disabled={
                  saving ||
                  !isOwnProfile ||
                  (!hasEditableChanges && !hasAvatarChange)
                }
                sx={{ minWidth: 140 }}
              >
                Save changes
              </Button>
            </Stack>
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
  const isDept = String(label).toLowerCase() === "department";
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 1,
        py: 0.25,
      }}
    >
      <Typography level="body-sm" color="neutral">
        {label}
      </Typography>
      <Typography
        level="body-sm"
        sx={{
          fontWeight: 600,
          textAlign: "right",
          ...(isDept && { textTransform: "capitalize" }), // capitalize department on view
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
