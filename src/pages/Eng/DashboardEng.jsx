import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import { useNavigate } from "react-router-dom";
import Dash_eng from "../../component/EngDashboard";
import MainHeader from "../../component/Partials/MainHeader";

function DashboardENG() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
        <Sidebar />
        <MainHeader title="Engineering" isBackEnabled={true} sticky>
           <Box display="flex" gap={1}>
          <Button size="sm" sx={{height:'16px'}}>
            xyz
          </Button>
           <Button size="xs" sx={{height:'12px'}}>
            xyz
          </Button>
          </Box>
        </MainHeader>
        <SubHeader title="Engineering Overview" isBackEnabled={true} sticky>
         <Box display="flex" gap={1}>
          <Button size="sm" sx={{height:'16px'}}>
            xyz
          </Button>
           <Button size="xs" sx={{height:'12px'}}>
            xyz
          </Button>
          </Box>
        </SubHeader>
        <Box
          component="main"
          className="MainContent"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt:"108px",
            p:'16px',
            px:'24px'
          }}
        >
          
          <Dash_eng />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default DashboardENG;
