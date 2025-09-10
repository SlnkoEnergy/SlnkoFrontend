import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from "@mui/joy/Box";
import ColorSchemeToggle from "./ColorSchemeToggle";
import { toggleSidebar } from '../../utils/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationCenter, NovuProvider, PopoverNotificationCenter, useNotifications } from '@novu/notification-center';
import { IconButtonRoot } from '@mui/joy/IconButton/IconButton';
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useEffect, useRef, useState } from 'react';

function NotificationListener() {
  const ctx = useNotifications();
  const notifications = ctx?.notifications ?? [];
  const bootstrapped = useRef(false);
  const lastShownIdRef = useRef(null);
  const STORAGE_KEY = "novu:lastShownId";
  console.log("the notifications ", notifications);
  // Load persisted last shown id, request permission once.
  useEffect(() => {
    lastShownIdRef.current = localStorage.getItem(STORAGE_KEY);
    if (Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => { });
    }
  }, []);

  const showPopup = (n) => {
    const body =
      typeof n?.content === "string"
        ? n.content
        : n?.payload?.message || "You have a new message";

    if (Notification.permission === "granted") {
      new Notification("📢 New Notification", { body });
    }
  };

  useEffect(() => {
    if (!notifications.length) return;

    // Build id list (newest first) and a lookup map
    const ids = notifications
      .map((n) => n?._id)
      .filter(Boolean);
    if (!ids.length) return;

    // First fetch after load: mark as bootstrapped and DON'T pop anything
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      // Record the latest so refresh won't re-pop
      if (ids[0] && lastShownIdRef.current !== ids[0]) {
        lastShownIdRef.current = ids[0];
        localStorage.setItem(STORAGE_KEY, ids[0]);
      }
      return;
    }

    // After bootstrap: show all that are newer than lastShownId
    const lastSeen = lastShownIdRef.current;
    const lastSeenIdx = lastSeen ? ids.indexOf(lastSeen) : -1;

    // New ones are everything before lastSeenIdx; if not found, treat all as new
    const newIds = lastSeenIdx === -1 ? ids : ids.slice(0, lastSeenIdx);

    if (newIds.length) {
      // Oldest → newest to keep order
      const toShow = [...newIds].reverse();
      // Optional small stagger so multiple popups aren't simultaneous
      toShow.forEach((id, i) => {
        const n = notifications.find((x) => x?._id === id);
        if (!n) return;
        setTimeout(() => showPopup(n), i * 250);
      });

      // Update last shown to the newest we processed
      const newestProcessed = newIds[0]; // since ids are newest-first
      lastShownIdRef.current = newestProcessed;
      localStorage.setItem(STORAGE_KEY, newestProcessed);
    } else {
      // No brand-new items; ensure we track the current head
      if (ids[0] && lastShownIdRef.current !== ids[0]) {
        lastShownIdRef.current = ids[0];
        localStorage.setItem(STORAGE_KEY, ids[0]);
      }
    }
  }, [notifications]);

  return null;
}


function Header() {
  const location = useLocation();
  const isSalesPage = location.pathname === "/sales";
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscribeId, setSubscribeId] = useState("");
  useEffect(() => {
    const userData = getUserData();
    setSubscribeId(userData.userID);
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");

    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  return (
    <>
      {/* Header Bar for non-sales pages */}
      {!isSalesPage && (
        <Sheet
          sx={{
            display: { xs: 'flex', lg: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            width: '100vw',
            height: 'var(--Header-height)',
            zIndex: 99,
            p: 2,
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'background.level1',
            boxShadow: 'sm',
            "@media print": { display: "none!important" }
          }}
        >
          <GlobalStyles
            styles={(theme) => ({
              ':root': {
                '--Header-height': '52px',
                [theme.breakpoints.up('md')]: {
                  '--Header-height': '52px',
                },
              },
            })}
          />
          <IconButton
            onClick={() => toggleSidebar()}
            variant="outlined"
            color="neutral"
            size="sm"
            sx={{
              "@media print": { display: "none!important" },
              display: { sm: "flex", lg: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { md: "flex", lg: "none" }, gap: 1, alignItems: "center" }}>

            <Box>
              <NovuProvider
                subscriberId={subscribeId}
                applicationIdentifier={process.env.REACT_APP_NOVU_IDENTIFIER}
              >
                <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                  <NotificationCenter onUrlChange={() => { /* noop */ }} />
                </div>

                <NotificationListener />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                    p: 1,
                    position: "relative",
                    zIndex: 20000000,
                  }}
                >
                  <PopoverNotificationCenter
                    colorScheme="light"
                    position="bottom-end"
                    offset={20}
                    onNotificationClick={(notification) => {
                      if (notification?.payload?.type === "sales" && notification?.payload?.link1) {
                        navigate(notification?.payload?.link1);
                      } else if (notification?.payload?.link) {
                        navigate(notification?.payload?.link);
                      }
                    }}

                  >
                    {({ unseenCount }) => (
                      <IconButton
                        sx={{
                          position: "relative",
                          bgcolor: "transparent",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <NotificationsNoneIcon
                          sx={{ width: 20, height: 20, color: "text.primary" }} // Bell equivalent
                        />

                        {(unseenCount ?? 0) > 0 && (
                          <Box
                            component="span"
                            sx={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              backgroundColor: "#ef4444", // red-500
                              color: "white",
                              borderRadius: "9999px",
                              px: 0.5,
                              fontSize: "0.75rem",
                              lineHeight: "1rem",
                            }}
                          >
                            {unseenCount ?? 0}
                          </Box>
                        )}
                      </IconButton>
                    )}
                  </PopoverNotificationCenter>
                </Box>
              </NovuProvider>
            </Box>
            <Box sx={{ display: { md: "flex", lg: "none" }, gap: 1, alignItems: "center" }}>
              <ColorSchemeToggle sx={{ ml: "auto" }} />
            </Box>
          </Box>


        </Sheet>
      )}

      {isSalesPage && (
        <IconButton
          onClick={() => toggleSidebar()}
          size="md"
          sx={{
            position: "fixed",
            top: 15,
            left: 250,
            zIndex: 90,
            borderRadius: "50%",
            boxShadow: 3,
            backgroundColor: "#214b7b",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#183659"
            },
            "@media print": { display: "none!important" }
          }}
        >
          <MenuIcon />
        </IconButton>

      )}
    </>
  );
}

export default Header;