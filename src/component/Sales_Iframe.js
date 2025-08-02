import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import { Box } from "@mui/joy";

const SalesIframe = () => {
  const iframeRef = useRef(null);
  const [searchParams] = useSearchParams();

  const baseUrl = "https://sales.slnkoprotrac.com";

  const savedPath = localStorage.getItem("lastIframePath") || "/";
  const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const [iframeSrc] = useState(`${baseUrl}${savedPath}${currentSearch}`);

  const [iframePath, setIframePath] = useState(savedPath);
  const [currentIframeSearch, setCurrentIframeSearch] = useState(currentSearch);

  useEffect(() => {
    const iframeSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
    setCurrentIframeSearch(iframeSearch);
  }, [searchParams]);

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
  let authSent = false;

  const handleMessage = (event) => {
    if (event.data?.type === "IFRAME_READY" && !authSent) {
      authSent = true; // ✅ prevent future sends

      const authData = {
        type: "AUTH_SYNC",
        token: localStorage.getItem("authToken"),
        userDetails: localStorage.getItem("userDetails"),
      };

      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(authData, "https://sales.slnkoprotrac.com");
        console.log("[Parent] Sent auth data to iframe:", authData);
      }, 100);
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
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
