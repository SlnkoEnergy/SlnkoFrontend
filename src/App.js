import { SnackbarProvider } from "notistack";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Index from "./routes/index";
import { StackHandler, StackProvider, StackTheme } from "@stackframe/react";
import { stackClientApp } from "./stack";
import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

function HandlerRoutes() {
  const location = useLocation();
  return (<StackHandler app={stackClientApp} location={location.pathname} fullPage />);
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <SnackbarProvider
            maxSnack={2}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/handler/*" element={<HandlerRoutes />} />
              <Route path="/*" element={<Index />} />
            </Routes>
          </SnackbarProvider>
        </StackTheme>
      </StackProvider>
    </Suspense>
  );
}
