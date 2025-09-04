import { useEffect, useState } from "react";
import {
  NovuProvider,
  PopoverNotificationCenter,
} from "@novu/notification-center";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Box, IconButton } from "@mui/joy";
import { useNavigate } from "react-router-dom";

const Notification = () => {
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
        </NovuProvider>
      </Box>
    </>
  );
};

export default Notification;