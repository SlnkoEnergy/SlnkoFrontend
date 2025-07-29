import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";
import { Box } from "@mui/joy";

const SalesIframe = () => {
  const location = useLocation();
  const internalPath = location.state?.internalPath || "/";
  const baseUrl = "http://localhost:5173";
  const iframeRef = useRef(null);

  const [iframeSearch, setIframeSearch] = useState(location.search); 

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "UPDATE_SEARCH_PARAMS") {
        setIframeSearch(event.data.search);
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
          src={`${baseUrl}${internalPath}${iframeSearch}`}
          style={{
            width: "100%",
            height: "90%",
            border: "none",
            marginTop: "6.6vh",
          }}
          title="Sales Portal"
        />
      </Box>
    </>
  );
};

export default SalesIframe