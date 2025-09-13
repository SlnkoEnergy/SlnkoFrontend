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

const isIOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const isStandalone =
  (typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)")?.matches ||
      // iOS Safari legacy flag when launched from Home Screen
      (navigator).standalone === true)) || false;

const hasWindow = () => typeof window !== "undefined";
const hasWebNotification =
  hasWindow() && "Notification" in window && typeof window.Notification === "function";
const hasSWShowNotification =
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  typeof ServiceWorkerRegistration !== "undefined" &&
  "showNotification" in ServiceWorkerRegistration.prototype;

// tiny helper
const permissionGranted = () =>
  hasWebNotification && window.Notification.permission === "granted";

function NotificationListener() {

  const ctx = useNotifications();
  const notifications = ctx?.notifications ?? [];
  const bootstrapped = useRef(false);
  const lastShownIdRef = useRef(null);
  const STORAGE_KEY = "novu:lastShownId";

  useEffect(() => {
    try {
      lastShownIdRef.current = localStorage.getItem(STORAGE_KEY);
    } catch { }
  }, []);
  // console.log(STORAGE_KEY);

  const showPopup = async (n) => {
    const message =
      typeof n?.payload?.message === "string"
        ? n.payload.message
        : n?.payload?.message || "You have a new message";

    const link =
      (n?.payload?.type === "sales" && n?.payload?.link1)
        ? n.payload.link1
        : n?.payload?.link || "/dashboard";

    const title = n?.payload?.Module || "Notification";
    const body = n?.payload?.sendBy_Name ? `${n.payload.sendBy_Name}: ${message}` : message;

    try {
      if ((isIOS || isStandalone) && hasSWShowNotification && permissionGranted()) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(
          n?.payload?.Module || "",
          {
            body,
            icon: main_logo,
            data: { link },
          },
        );
        return;
      }
    } catch { /* fall through to other paths */ }

    try {
      if (hasWebNotification && permissionGranted()) {
        const notif = new window.Notification(
          n?.payload?.Module || "",
          {
            body,
            icon: main_logo,
            data: { link },
          },
        );
        notif.onclick = () => {
          try { window.focus(); } catch { }
          if (/^https?:\/\//i.test(link)) window.location.assign(link);
          else window.location.href = link;
          notif.close();
        };
        return;
      }
    } catch { /* fall through */ }

    console.warn("Notifications not supported/granted; falling back to toast:", { title, body, link });
  };


  useEffect(() => {
    if (!notifications.length) return;

    const ids = notifications.map((n) => n?._id).filter(Boolean);
    if (!ids.length) return;

    if (!bootstrapped.current) {
      bootstrapped.current = true;
      if (ids[0] && lastShownIdRef.current !== ids[0]) {
        lastShownIdRef.current = ids[0];
        try { localStorage.setItem(STORAGE_KEY, ids[0]); } catch { }
      }
      return;
    }

    const lastSeen = lastShownIdRef.current;
    const lastSeenIdx = lastSeen ? ids.indexOf(lastSeen) : -1;
    const newIds = lastSeenIdx === -1 ? ids : ids.slice(0, lastSeenIdx);

    if (newIds.length) {
      [...newIds].reverse().forEach((id, i) => {
        const n = notifications.find((x) => x?._id === id);
        if (!n) return;
        setTimeout(() => showPopup(n), i * 250);
      });

      const newestProcessed = newIds[0];
      lastShownIdRef.current = newestProcessed;
      try { localStorage.setItem(STORAGE_KEY, newestProcessed); } catch { }
    } else {
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
                    sx={{ width: 20, height: 20, color: "black" }} // Bell equivalent
                  />

                  {(unseenCount ?? 0) > 0 && (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: -4,
                        right: -4,
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
        </NovuProvider>
      </Box>
    </>
  );
};

export default AppNotification;
