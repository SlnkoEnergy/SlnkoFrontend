import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import { Box } from "@mui/joy";

const SalesIframe = () => {
  const iframeRef = useRef(null);
  const [searchParams] = useSearchParams();

  const baseUrl = "http://localhost:5173";

  const [iframePath, setIframePath] = useState(() => {
    return localStorage.getItem("lastIframePath") || "/";
  });

  const [currentIframeSearch, setCurrentIframeSearch] = useState(() => {
    return searchParams.toString() ? `?${searchParams.toString()}` : "";
  });

  useEffect(() => {
    const iframeSearch = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    setCurrentIframeSearch(iframeSearch);
  }, [searchParams]);

  useEffect(() => {
    if (!iframePath || !currentIframeSearch) return;

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "PARENT_PUSH_SEARCH_PARAMS",
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

  const iframeSrc = `${baseUrl}${iframePath}${currentIframeSearch}`;
  console.log("Iframe Src:", iframeSrc);

  return (
    <>
      <Header />
      <Sidebar />
      <Box sx={{ position: "relative", zIndex: 1, width: "100%", height: "100vh" }}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          key={iframeSrc}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Sales Portal"
        />
      </Box>
    </>
  );
};

export default SalesIframe;
