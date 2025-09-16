import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import View_Project_Management from "../../component/ViewProjectManagement";
import Filter from "../../component/Partials/Filter";
import { useEffect, useState } from "react";

function ViewProjectManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const fields = [
    {
      key: "view",
      label: "View",
      type: "select",
      options: [
        { label: "Day", value: "day" },
        { label: "Week", value: "week" },
        { label: "Month", value: "month" },
        { label: "Year", value: "year" },
      ],
    },
  ];

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
              Templates
            </Button>
          </Box>
        </MainHeader>

        <SubHeader title="View Project Management" isBackEnabled={true} sticky>
          <Box display="flex" gap={1} alignItems="center">
            <Filter
              open={open}
              onOpenChange={setOpen}
              fields={fields}
              title="Filters"
              onApply={(values) => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  const next = {
                    ...merged,
                    page: "1",
                    ...(values.view && { view: String(values.view) }),
                  };
                  return next;
                });
                setOpen(false);
              }}
              onReset={() => {
                setSearchParams((prev) => {
                  const merged = Object.fromEntries(prev.entries());
                  delete merged.view;
                  return { ...merged, page: "1" };
                });
              }}
            />
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
            mt: "108px",
            p: "16px",
            px: "24px",
          }}
        >
          <View_Project_Management />
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
export default ViewProjectManagement;
