import { useEffect, useRef, useState } from "react";
import {
  NotificationCenter,
  NovuProvider,
  PopoverNotificationCenter,
  useNotifications,
} from "@novu/notification-center";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Box, IconButton } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import main_logo from "../../assets/protrac_logo.png"

function NotificationListener() {
  const ctx = useNotifications();
  const notifications = ctx?.notifications ?? [];
  const bootstrapped = useRef(false);
  const lastShownIdRef = useRef(null);
  const STORAGE_KEY = "novu:lastShownId";

  // Load persisted last shown id (no auto permission request here)
  useEffect(() => {
    try {
      lastShownIdRef.current = localStorage.getItem(STORAGE_KEY);
    } catch { }
  }, []);

  // SHOW POPUP + ONCLICK NAVIGATION
  const showPopup = (n) => {
    const message =
      typeof n?.payload?.message === "string"
        ? n?.payload?.message
        : n?.payload?.message || "You have a new message";
    // Link priority: sales.link1 → link → url → /
    const link =
      (n?.payload?.type === "sales" && n?.payload?.link1)
        ? n.payload.link1
        : n?.payload?.link || "/dashboard";

    const body = n?.payload?.sendBy_Name
      ? `${n.payload.sendBy_Name}:${message}`
      : message;

      console.log(body);

    if (typeof window !== "undefined" && "Notification" in window) {
      if (window.Notification.permission === "granted") {
        const notif = new window.Notification(
          n?.payload?.Module || "",
          {
            body,
            icon: main_logo,
            data: { link },
          },
        );

        // ⬇️ Add on-click navigation here
        notif.onclick = () => {
          try { window.focus(); } catch { }
          if (/^https?:\/\//i.test(link)) {
            window.location.assign(link); // external / absolute
          } else {
            window.location.href = link;  // let router handle relative
          }
          notif.close();
        };
      }
    }
  };

  useEffect(() => {
    if (!notifications.length) return;

    const ids = notifications.map((n) => n?._id).filter(Boolean);
    if (!ids.length) return;

    // First load: record the newest, don't pop
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      if (ids[0] && lastShownIdRef.current !== ids[0]) {
        lastShownIdRef.current = ids[0];
        try { localStorage.setItem(STORAGE_KEY, ids[0]); } catch { }
      }
      return;
    }

    // After bootstrap: pop all newer than lastShownId
    const lastSeen = lastShownIdRef.current;
    const lastSeenIdx = lastSeen ? ids.indexOf(lastSeen) : -1;
    const newIds = lastSeenIdx === -1 ? ids : ids.slice(0, lastSeenIdx);

    if (newIds.length) {
      // Oldest → newest
      [...newIds].reverse().forEach((id, i) => {
        const n = notifications.find((x) => x?._id === id);
        if (!n) return;
        setTimeout(() => showPopup(n), i * 250);
      });

      // Update last shown to newest processed (ids are newest-first)
      const newestProcessed = newIds[0];
      lastShownIdRef.current = newestProcessed;
      try { localStorage.setItem(STORAGE_KEY, newestProcessed); } catch { }
    } else {
      // Track current head even if nothing new
      if (ids[0] && lastShownIdRef.current !== ids[0]) {
        lastShownIdRef.current = ids[0];
        try { localStorage.setItem(STORAGE_KEY, ids[0]); } catch { }
      }
    }
  }, [notifications]);

  return null;
}

const AppNotification = () => {
  const [subscribeId, setSubscribeId] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");

    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    setSubscribeId(userData.userID);
    setUser(userData);
  }, []);
  return (
    <>
      <Box
        sx={{
          zIndex: 200000,
          position: "relative",
          display: "block",
        }}
      >
        {/* <NovuProvider
          subscriberId={subscribeId}
          applicationIdentifier={process.env.REACT_APP_NOVU_IDENTIFIER}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              //   p: 1,
              position: "relative",
            }}
          >
            <PopoverNotificationCenter
              colorScheme="light"
              position="bottom-end"
              sx={{ zIndex: 200000 }}
              offset={20}
              onNotificationClick={(notification) => {
                const link = notification?.payload?.link;
                if (link) {
                  navigate(notification.payload.link);
                }
              }}
            >
              {({ unseenCount }) => (
                <IconButton
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <NotificationsNoneIcon
                    sx={{ width: 28, height: 28, color: "white" }}
                  />

                  {(unseenCount ?? 0) > 0 && (
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: "#ef4444",
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
        </NovuProvider> */}
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
                    sx={{ width: 20, height: 20, color: "white" }} // Bell equivalent
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
    </>
  );
};

export default AppNotification;
