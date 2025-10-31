import { useState } from "react";
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import LibraryAddOutlined from "@mui/icons-material/LibraryAddOutlined";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import DPRTable from "../../component/Dpr";

function DprManagement() {
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
        <Sidebar />

        <MainHeader title="DPR" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/project_dash`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Dashboard
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/project_management`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              All Projects
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/project_template`)}
              sx={{
                color: "white",
                bgcolor: "transparent",
                fontWeight: 500,
                fontSize: "1rem",
                letterSpacing: 0.5,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              Templates
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="Daily Progress Reports"
          isBackEnabled={false}
          sticky
          rightSlot={
            <Button
              size="sm"
              variant="outlined"
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
              startDecorator={<LibraryAddOutlined />}
              onClick={() => setOpenAdd(true)}
            >
              Add DPR
            </Button>
          }
        />

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
        <DPRTable />
         
        </Box>
      </Box>
    </CssVarsProvider>
  );
}

export default DprManagement;
