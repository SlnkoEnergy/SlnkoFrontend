import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
import Dash_eng from "../../component/EngDashboard";
import { AddIcCallOutlined } from "@mui/icons-material";
import AddActivityModal from "./ActivityModal";
import { useState } from "react";
import { usePushActivityToProjectMutation } from "../../redux/projectsSlice";
import { toast } from "react-toastify";

function ProjectManagement() {
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);
  const [pushActivity, { isLoading }] = usePushActivityToProjectMutation();
    const handleCreate = async (payload) => {
    // payload comes from modal: { project_id, project_name, name, description, type }
    try {
      await pushActivity({
        projectId: payload.project_id,     // goes to :projectId param
        name: payload.name,                // activityModel.name
        description: payload.description,  // activityModel.description
        type: payload.type,                // "frontend" | "backend"
      }).unwrap();

      toast.success("Activity added to project");
      setOpenAdd(false);
    } catch (err) {
      console.error("pushactivity error:", err);
      toast.error(err?.data?.message || "Failed to add activity");
    }
  };
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title="Projects" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/eng_dash`)}
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Templates
            </Button>
          </Box>
        </MainHeader>

        <SubHeader
          title="All Projects"
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
              startDecorator={<AddIcCallOutlined />}
              onClick={() => setOpenAdd(true)}// or open modal
            >
              Add Activity
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
          <AddActivityModal
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            onCreate={handleCreate}
            isSubmitting={isLoading}
          />
          <Dash_eng />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ProjectManagement;
