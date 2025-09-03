// src/components/Header.js
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
import { useState } from "react";

export default function MainHeader({ title, children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      variant="primary"
      sx={(theme) => ({
        position: "fixed",
        top: 0,
        zIndex: 9999,
        backdropFilter: "saturate(180%) blur(8px)",
        backgroundColor: "#1f487c",
        borderBottom: `1px solid ${theme.vars.palette.neutral.outlinedBorder}`,
        boxShadow: "sm",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        height: "60px",
        ml: {
          md: "0px",
          lg: "var(--Sidebar-width)",
        },
      })}
    >
      {/* Main row */}
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
        {/* Center: Title */}
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

        {/* Right: Actions */}
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
              sx={{
                p: 0,
                borderRadius: "50%",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <Avatar src="https://i.pravatar.cc/40?img=3" size="md" />
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
                sx={{
                  outline: "none",
                  border: "none",
                  p: 0.5,
                  "& .MuiMenuItem-root": {
                    borderRadius: "sm",
                    "&:hover": { bgcolor: "neutral.softBg" },
                  },
                }}
              >
                <MenuItem>
                  <ListItemDecorator>
                    <PersonOutlineIcon fontSize="small" />
                  </ListItemDecorator>
                  My Profile
                </MenuItem>
                <ListDivider />
                <MenuItem>
                  <ListItemDecorator>
                    <GroupOutlinedIcon fontSize="small" />
                  </ListItemDecorator>
                  Users
                </MenuItem>
                <ListDivider />
                <MenuItem color="danger">
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
