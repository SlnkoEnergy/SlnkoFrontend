import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Index from "./routes/index";
import { StackHandler, StackProvider, StackTheme } from "@stackframe/react";
import { stackClientApp } from "./stack";

// ⬇️ Add this import (make sure you created src/auth/EnsureSelectedTeam.jsx exactly as shared)
import EnsureSelectedTeam from "./redux/auth/EnsureSelectedTeam";

function HandlerRoutes() {
  const location = useLocation();
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />;
}

export default function App() {
  const location = useLocation();

  const isHandlerRoute = location.pathname.startsWith("/handler/");

  return (
    <Suspense fallback={null}>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          {/* Only run team-selection logic on normal app pages, not on /handler/* (sign-in/out flows) */}
          {!isHandlerRoute && (
            <EnsureSelectedTeam
              // optional: if you set REACT_APP_DEFAULT_TEAM_ID in .env, no need to pass this prop
               defaultTeamId="26dc7260-9455-4b72-9463-f1f68f59e919"
            />
          )}

          <SnackbarProvider
            maxSnack={2}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
