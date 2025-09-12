import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import Dash_eng from "../../component/EngDashboard";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
import UserProfilePanel from "../../component/UserProfile";
import { useEffect, useState } from "react";

function UserProfile() {
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
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title="User Profile" sticky>
          
        </MainHeader>

        <SubHeader
          title="User Details"
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
            px: "24px",
          }}
        >
          <UserProfilePanel />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default UserProfile;
