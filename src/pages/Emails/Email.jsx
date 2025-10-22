import React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import { FocusTrap } from "@mui/base/FocusTrap";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Layout from "../../component/Emails/Layout";
import Navigation from "../../component/Emails/Navigation";
import Mails from "../../component/Emails/Mails";
import EmailContent from "../../component/Emails/EmailContent";
import WriteEmail from "../../component/Emails/WriteEmail";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../component/Partials/Sidebar";

export default function Email() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  // Ctrl/⌘+N to open compose
  React.useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if (
        (isMac && e.metaKey && e.key.toLowerCase() === "n") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "n")
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
         <Sidebar />
        {drawerOpen && (
          <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
            <Navigation />
          </Layout.SideDrawer>
        )}

        {/* Mobile bottom tab bar */}
        <Stack
          id="tab-bar"
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-around",
            display: { xs: "flex", sm: "none" },
            zIndex: "1",
            bottom: 0,
            position: "fixed",
            width: "100dvw",
            py: 2,
            backgroundColor: "background.body",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="plain"
            color="neutral"
            aria-pressed="true"
            component="a"
            href="/joy-ui/getting-started/templates/email/"
            size="sm"
            startDecorator={<EmailRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
          >
            Email
          </Button>
          <Button
            variant="plain"
            color="neutral"
            component="a"
            href="/joy-ui/getting-started/templates/team/"
            size="sm"
            startDecorator={<PeopleAltRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
          >
            Team
          </Button>
          <Button
            variant="plain"
            color="neutral"
            component="a"
            href="/joy-ui/getting-started/templates/files/"
            size="sm"
            startDecorator={<FolderRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
          >
            Files
          </Button>
        </Stack>
        <MainHeader title="Email" sticky>
          <Box display="flex" gap={1}>
            <Button
              size="sm"
              onClick={() => navigate(`/task_dashboard`)}
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
              Email
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/all_task`)}
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

        <SubHeader title="Email" isBackEnabled={true} sticky></SubHeader>
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
          <Layout.Root
            sx={[
              drawerOpen && {
                height: "100vh",
                overflow: "hidden",
              },
            ]}
          >
            <Layout.SideNav>
              <Navigation />
            </Layout.SideNav>

            <Layout.SidePane>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ alignItems: "center", gap: 1 }}>
                  <Typography
                    level="title-lg"
                    textColor="text.secondary"
                    component="h1"
                  >
                    My inbox
                  </Typography>
                  <Typography level="title-sm" textColor="text.tertiary">
                    5 emails
                  </Typography>
                </Box>

                <Button
                  size="sm"
                  startDecorator={<CreateRoundedIcon />}
                  onClick={() => setOpen(true)}
                  sx={{ ml: "auto" }}
                >
                  Compose email
                </Button>

                <FocusTrap open={open} disableAutoFocus disableEnforceFocus>
                  <WriteEmail open={open} onClose={() => setOpen(false)} />
                </FocusTrap>
              </Box>

              <Mails />
            </Layout.SidePane>

            <Layout.Main>
              <EmailContent />
            </Layout.Main>
          </Layout.Root>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
