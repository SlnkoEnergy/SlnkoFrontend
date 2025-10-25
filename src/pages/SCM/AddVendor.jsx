import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import CssBaseline from "@mui/joy/CssBaseline";
import Link from "@mui/joy/Link";
import { CssVarsProvider } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import React, { useEffect, useState } from "react";
import ADDVENDOR from "../../component/Forms/Add_Vendor";
import Header from "../../component/Partials/Header";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";

function Add_Vendor() {

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
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <MainHeader title="SCM" sticky>
          <Box display="flex" gap={1}>
            {(user?.name === "IT Team" ||
              user?.department === "admin" ||
              (user?.department === "Accounts" &&
                (user?.name === "Deepak Kumar Maurya" ||
                  user?.name === "Gagan Tayal" ||
                  user?.name === "Ajay Singh" ||
                  user?.name === "Sachin Raghav" ||
                  user?.name === "Anamika Poonia" ||
                  user?.name === "Meena Verma" ||
                  user?.name === "Kailash Chand" ||
                  user?.name === "Chandan Singh")) ||
              (user?.department === "Accounts" &&
                user?.name === "Sujan Maharjan") ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              user?.role === "purchase" ||
              (user?.role === "manager" && (user?.name === "Naresh Kumar")) ||
              (user?.role === "visitor" &&
                (user?.name === "Sanjiv Kumar" ||
                  user?.name === "Sushant Ranjan Dubey")) ||
              (user?.department === "CAM" && user?.name === "Shantanu Sameer")

            ) ? (<Button
              size="sm"
              onClick={() => navigate("/purchase-order")}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Purchase Order
            </Button>) : (null)}

            {(user?.name === "IT Team" ||
              user?.department === "admin" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              user?.role === "purchase" ||
              (user?.role === "manager" && (user?.name === "Naresh Kumar")) ||
              user?.department === "Logistic"
            ) ? (<Button
              size="sm"
              onClick={() => navigate(`/logistics`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Logistics
            </Button>) : (null)}

            {(user?.name === "IT Team" ||
              user?.department === "admin" ||
              (user?.department === "Accounts" &&
                (user?.name === "Deepak Kumar Maurya" ||
                  user?.name === "Gagan Tayal" ||
                  user?.name === "Ajay Singh" ||
                  user?.name === "Sachin Raghav" ||
                  user?.name === "Anamika Poonia" ||
                  user?.name === "Meena Verma" ||
                  user?.name === "Kailash Chand" ||
                  user?.name === "Chandan Singh")) ||
              (user?.department === "Accounts" &&
                user?.name === "Sujan Maharjan") ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Varun Mishra" ||
              user?.name === "Prachi Singh" ||
              user?.role === "purchase" ||
              (user?.role === "manager" && (user?.name === "Naresh Kumar"))
            ) ? (<Button
              size="sm"
              onClick={() => navigate(`/vendor_bill`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Vendor Bill
            </Button>) : (null)}

          </Box>
        </MainHeader>
        <SubHeader title="Add Vendor" isBackEnabled={true} sticky></SubHeader>

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
          <ADDVENDOR />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default Add_Vendor;
