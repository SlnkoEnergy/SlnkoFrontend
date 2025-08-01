import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import { Box } from "@mui/joy";

const SalesIframe = () => {
  const iframeRef = useRef(null);
  const [searchParams] = useSearchParams();

  const baseUrl = "http://localhost:5173";

  // Get last path + current query on initial load
  const savedPath = localStorage.getItem("lastIframePath") || "/";
  const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";

  // Set iframeSrc immediately
  const [iframeSrc] = useState(`${baseUrl}${savedPath}${currentSearch}`);

  const [iframePath, setIframePath] = useState(savedPath);
  const [currentIframeSearch, setCurrentIframeSearch] = useState(currentSearch);

  // Update search state if parent URL changes
  useEffect(() => {
    const iframeSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
    setCurrentIframeSearch(iframeSearch);
  }, [searchParams]);

  // Send message to iframe to sync route changes
  useEffect(() => {
    if (!iframePath) return;

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "PARENT_PUSH_SEARCH_PARAMS",
        path: iframePath,
        search: currentIframeSearch,
      },
      "*"
    );
  }, [iframePath, currentIframeSearch]);

  // Listen to iframe messages and update path in localStorage
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "UPDATE_SEARCH_PARAMS") {
        const fullPath = event.data.fullPath || "/";
        const [path, query] = fullPath.split("?");
        const finalPath = path || "/";
        const finalSearch = query ? `?${query}` : "";

        setIframePath(finalPath);
        setCurrentIframeSearch(finalSearch);
        localStorage.setItem("lastIframePath", fullPath);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

 useEffect(() => {
  const authData = {
    type: "AUTH_SYNC",
    token: localStorage.getItem("authToken"),
    tokenExpiration: localStorage.getItem("authTokenExpiration"),
    userDetails: localStorage.getItem("userDetails"),
  };

  const sendAuthData = () => {
    iframeRef.current?.contentWindow?.postMessage(authData, "*");
    console.log("[Parent] Sent auth data to iframe:", authData);
  };

  const iframe = iframeRef.current;
  if (iframe) {
    iframe.addEventListener("load", sendAuthData);
    return () => iframe.removeEventListener("load", sendAuthData);
  }
}, []);



  return (
    <>
      <Header />
      <Sidebar />
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", height: "100vh" }}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Sales Portal"
        />
      </Box>
    </>
  );
};

export default SalesIframe;
