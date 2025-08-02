import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StyledEngineProvider } from "@mui/joy/styles";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <StyledEngineProvider injectFirst>
          <App />
        </StyledEngineProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
