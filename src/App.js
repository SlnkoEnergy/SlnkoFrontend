import { SnackbarProvider } from "notistack";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Index from "./routes/index";

export default function App() {
  return (
    <div>
      <SnackbarProvider
        maxSnack={2}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} />
        <Index />
      </SnackbarProvider>
    </div>
  );
}
