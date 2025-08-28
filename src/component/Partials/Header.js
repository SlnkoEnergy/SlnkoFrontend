import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from "@mui/joy/Box";
import ColorSchemeToggle from "./ColorSchemeToggle";
import { toggleSidebar } from '../../utils/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { IconButtonRoot } from '@mui/joy/IconButton/IconButton';
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useEffect, useState } from 'react';


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
                      const link = notification?.payload?.link;
                      if (link) {
                        navigate(notification.payload.link);
                      }


                    }}

                  >
                    {({ unseenCount }) => (
                      <IconButton
                        sx={{
                          position: "relative",
                          bgcolor: "transparent", // ghost-like
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