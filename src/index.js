import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StyledEngineProvider } from "@mui/joy/styles";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import * as Sentry from "@sentry/react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import AuthRehydrate from "./redux/auth/AuthRehydrate";

Sentry.init({
  dsn: "https://f174e0dee7b57070ee4f9b2d6e0baaca@o4509774671511552.ingest.us.sentry.io/4509774686584832",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  send_default_pii: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={<p>Something went wrong. Please refresh.</p>}
    >
      <Provider store={store}>
        <BrowserRouter>
          <StyledEngineProvider injectFirst>
            <App />
          </StyledEngineProvider>
        </BrowserRouter>
      </Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
