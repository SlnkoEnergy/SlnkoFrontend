import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Sidebar from "../../component/Partials/Sidebar";
import Project_Detail from "../../component/ProjectDetails";
import MainHeader from "../../component/Partials/MainHeader";
import SubHeader from "../../component/Partials/SubHeader";
import { useNavigate } from "react-router-dom";

function ProjectDetail() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <MainHeader title="Projects" sticky></MainHeader>

        <SubHeader
          title="Project Detail"
          isBackEnabled={true}
          sticky
        ></SubHeader>
        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "108px",
            p: "16px",
          }}
        >
          <Project_Detail />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ProjectDetail;
