import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightMode";
import IconButton from "@mui/joy/IconButton";
import { useColorScheme } from "@mui/joy/styles";
import React, { useEffect, useState } from "react";

const ColorSchemeToggle = ({ onClick, sx, ...other }) => {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        disabled
        sx={sx}
        {...other}
      />
    );
  }

  return (
    <IconButton
      size="sm"
      variant="outlined"
      color="neutral"
      {...other}
      onClick={(event) => {
        setMode(mode === "light" ? "dark" : "light");
        if (onClick) {
          onClick(event);
        }
      }}
      sx={[
        {
          "& > *:first-of-type": {
            // Changed from :first-child to :first-of-type
            display: mode === "light" ? "initial" : "none",
          },
          "& > *:last-child": {
            display: mode === "dark" ? "initial" : "none",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <DarkModeRoundedIcon />
      <LightModeIcon />
    </IconButton>
  );
};

export default React.memo(ColorSchemeToggle);