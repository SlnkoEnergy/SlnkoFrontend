// src/components/Header.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import {
  Avatar,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ListItemDecorator,
  ListDivider,
} from "@mui/joy";

import Notification from "./Notification";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

// ⬇️ bring the same hook you use in UserProfilePanel
import { useGetUserByIdQuery } from "../../redux/loginSlice";

// --- small helpers ---
const LS_KEY = "userDetails";
const readUser = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeUser = (obj) => {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
  // notify same-tab listeners
  window.dispatchEvent(new CustomEvent("userDetails:update", { detail: obj }));
};

// Build absolute URL if backend returns relative path
const buildAvatarUrl = (src) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base =
    import.meta?.env?.VITE_FILES_BASE || process.env.REACT_APP_FILES_BASE || "";
  return base ? `${base.replace(/\/+$/, "")}/${String(src).replace(/^\/+/, "")}` : src;
};

export default function MainHeader({ title, children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => readUser());
  const [avatarErr, setAvatarErr] = useState(false);

  // Keep in sync with other parts of app updating LS
  useEffect(() => {
    const handle = (e) => {
      if (e.type === "storage" && e.key !== LS_KEY) return;
      if (e.type === "userDetails:update" || e.key === LS_KEY) {
        setUser(readUser());
        setAvatarErr(false);
      }
    };
    window.addEventListener("storage", handle);
    window.addEventListener("userDetails:update", handle);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("userDetails:update", handle);
    };
  }, []);

  const storedUserId = useMemo(() => user?.userID || user?._id || null, [user]);

  // ⬇️ HYDRATE ON LOGIN: if we have an id but no avatar, fetch once
  const shouldFetch = !!storedUserId && !(user?.avatar_url || user?.attachment_url);
  const { data, isSuccess } = useGetUserByIdQuery(storedUserId, { skip: !shouldFetch });

  useEffect(() => {
    if (!isSuccess || !data?.user) return;
    const u = data.user;

    const next = {
      ...(user || {}),
      name: u.name || user?.name || "",
      email: u.email || user?.email || "",
      phone: String(u.phone ?? user?.phone ?? ""),
      department: u.department ?? user?.department ?? "",
      location: u.location ?? user?.location ?? "",
      about: u.about ?? user?.about ?? "",
      userID: u._id || storedUserId,
      attachment_url: u.attachment_url || user?.attachment_url || "",
      avatar_url: u.attachment_url || user?.avatar_url || "",
      // cache-buster so new image shows immediately
      avatar_version: Date.now(),
    };

    writeUser(next);
    setUser(next);
    setAvatarErr(false);
  }, [isSuccess, data, storedUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // compute avatar src (+version for cache busting)
  const rawSrc = user?.avatar_url || user?.attachment_url || "";
  const baseSrc = avatarErr ? "" : buildAvatarUrl(rawSrc);
  const avatarSrc =
    baseSrc && user?.avatar_version
      ? `${baseSrc}${baseSrc.includes("?") ? "&" : "?"}v=${user.avatar_version}`
      : baseSrc;

  const avatarInitial = (user?.name?.[0] || "U").toUpperCase();

  return (
    <Sheet
      variant="primary"
      sx={(theme) => ({
        position: "fixed",
        top: 0,
        zIndex: 200,
        backdropFilter: "saturate(180%) blur(8px)",
        backgroundColor: "#1f487c",
        borderBottom: `1px solid ${theme.vars.palette.neutral.outlinedBorder}`,
        boxShadow: "sm",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        height: "60px",
        ml: { md: "0px", lg: "var(--Sidebar-width)" },
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5, md: 1 },
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, md: 1 },
        }}
      >
        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            level="h5"
            sx={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "white",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Middle: children */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: 0.75, sm: 1 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
          {children}
        </Box>

        {/* Right: actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: 0.75, sm: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
          <Notification />

          <Dropdown>
            <MenuButton
              variant="plain"
              color="neutral"
              sx={{ p: 0, borderRadius: "50%", "&:hover": { backgroundColor: "transparent" } }}
            >
              <Avatar
                size="md"
                src={avatarSrc || undefined}
                alt={user?.name || "User"}
                onError={() => setAvatarErr(true)}
                sx={{ border: "2px solid rgba(255,255,255,0.6)" }}
              >
                {avatarInitial}
              </Avatar>
            </MenuButton>

            <Menu
              placement="bottom-end"
              sx={{
                p: 0,
                borderRadius: "md",
                border: "none",
                zIndex: 10000,
                "--ListItemDecorator-size": "1.5em",
                "& .MuiMenuItem-root": { borderRadius: "sm", "&:hover": { bgcolor: "neutral.softBg" } },
              }}
            >
              <MenuList variant="plain" sx={{ outline: "none", border: "none", p: 0.5 }}>
                <MenuItem onClick={() => navigate("/user_profile")}>
                  <ListItemDecorator>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemDecorator>
                  My Profile
                </MenuItem>

                <ListDivider />

                <MenuItem onClick={() => navigate("/users")}>
                  <ListItemDecorator>
                    <GroupOutlinedIcon fontSize="small" />
                  </ListItemDecorator>
                  Users
                </MenuItem>

                <ListDivider />

                <MenuItem color="danger" onClick={() => navigate("/logout")}>
                  <ListItemDecorator>
                    <LogoutRoundedIcon fontSize="small" />
                  </ListItemDecorator>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Dropdown>
        </Box>
      </Box>
    </Sheet>
  );
}
