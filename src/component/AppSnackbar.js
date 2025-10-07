// components/common/AppSnackbar.jsx
import Snackbar from "@mui/joy/Snackbar";

export default function AppSnackbar({
  open,
  onClose,
  message,
  color = "success",
  autoHideDuration = 3000,
}) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      color={color}
      variant="outlined"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      size="sm"
      sx={{
        boxShadow: "none",
        // animation styles
        animation: open ? "slideInRight 0.3s ease-out" : "none",
        "@keyframes slideInRight": {
          from: { transform: "translateX(120%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      }}
    >
      {message}
    </Snackbar>
  );
}
