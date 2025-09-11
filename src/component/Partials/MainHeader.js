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
  IconButton,
} from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import AppNotification from "./Notification";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useGetUserByIdQuery } from "../../redux/loginSlice";
import { toggleSidebar } from "../../utils/utils";

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
  window.dispatchEvent(new CustomEvent("userDetails:update", { detail: obj }));
};

const buildAvatarUrl = (src) => {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FILES_BASE) ||
    process.env.REACT_APP_FILES_BASE ||
    "";
  return base
    ? `${base.replace(/\/+$/, "")}/${String(src).replace(/^\/+/, "")}`
    : src;
};

export default function MainHeader({ title, children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => readUser());
  const [avatarErr, setAvatarErr] = useState(false);

  useEffect(() => {
    const onAny = (e) => {
      if (e.type === "storage" && e.key !== LS_KEY) return;
      if (e.type === "userDetails:update" || e.key === LS_KEY) {
        setUser(readUser());
        setAvatarErr(false);
      }
    };
    window.addEventListener("storage", onAny);
    window.addEventListener("userDetails:update", onAny);
    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener("userDetails:update", onAny);
    };
  }, []);

  const storedUserId = useMemo(() => user?.userID || user?._id || null, [user]);

  const { data, isSuccess, refetch } = useGetUserByIdQuery(storedUserId, {
    skip: !storedUserId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  useEffect(() => {
    const h = () => refetch();
    window.addEventListener("profile:updated", h);
    return () => window.removeEventListener("profile:updated", h);
  }, [refetch]);

  useEffect(() => {
    if (!isSuccess || !data?.user) return;

    const u = data.user;
    const prevSrc = user?.attachment_url || user?.avatar_url || "";
    const nextSrc = u.attachment_url || "";

    const next = {
      ...(user || {}),
      name: u.name ?? user?.name ?? "",
      email: u.email ?? user?.email ?? "",
      phone: String(u.phone ?? user?.phone ?? ""),
      department: u.department ?? user?.department ?? "",
      location: u.location ?? user?.location ?? "",
      about: u.about ?? user?.about ?? "",
      userID: u._id || storedUserId,
      attachment_url: nextSrc,
      avatar_url: nextSrc,
      avatar_version:
        nextSrc && nextSrc !== prevSrc
          ? Date.now()
          : user?.avatar_version ?? Date.now(),
    };

    writeUser(next);
    setUser(next);
    setAvatarErr(false);
  }, [isSuccess, data]);

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
        <Box display={"flex"} gap={2}>
          <IconButton
            onClick={toggleSidebar}
            variant="outlined"
            size="sm"
            sx={{
              "@media print": { display: "none!important" },
              display: { sm: "flex", lg: "none" },
              borderColor: "#fff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "#fff",
              },
            }}
          >
            <MenuIcon sx={{ color: "#fff" }} />
          </IconButton>

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
          <AppNotification />
          <Dropdown>
            <MenuButton
              variant="plain"
              color="neutral"
              sx={{
                p: 0,
                borderRadius: "50%",
                "&:hover": { backgroundColor: "transparent" },
              }}
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
                "& .MuiMenuItem-root": {
                  borderRadius: "sm",
                  "&:hover": { bgcolor: "neutral.softBg" },
                },
              }}
            >
              <MenuList
                variant="plain"
                sx={{ outline: "none", border: "none", p: 0.5 }}
              >
                <MenuItem onClick={() => navigate("/user_profile")}>
                  <ListItemDecorator>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemDecorator>
                  My Profile
                </MenuItem>

                {/* Example extra items if you re-enable later
                <ListDivider />
                <MenuItem>
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
                */}
              </MenuList>
            </Menu>
          </Dropdown>
        </Box>
      </Box>
    </Sheet>
  );
}
