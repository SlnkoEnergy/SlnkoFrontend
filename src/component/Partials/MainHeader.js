// src/components/Header.js
import { useNavigate } from "react-router-dom";
import Sheet from "@mui/joy/Sheet";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { Avatar, Dropdown, IconButton, Menu, MenuButton, MenuItem, MenuList } from "@mui/joy";
import Notification from "./Notification";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
              fontWeight: 650,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "white",
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
          <Dropdown open={open} onOpenChange={(_, isOpen) => setOpen(isOpen)}>
          <MenuButton
        slots={{ root: IconButton }}
        slotProps={{
          root: {
            variant: "plain",
            color: "neutral",
            sx: { p: 0, borderRadius: "50%" },
          },
        }}
      >
        <Avatar
          src="https://i.pravatar.cc/40?img=3" // replace with user image
          size="sm"
          sx={{ mr: 0.5 }}
        />
        <ArrowDropDownIcon fontSize="small" />
      </MenuButton>

      <Menu>
        <MenuList>
          <MenuItem>Switch Store</MenuItem>
          <MenuItem>Logout</MenuItem>
        </MenuList>
      </Menu>
</Dropdown>
        </Box>
      </Box>
    </Sheet>
  );
}
