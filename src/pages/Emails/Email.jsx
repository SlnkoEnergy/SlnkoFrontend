import { useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Layout from "../../component/Emails/Email/Layout";
import Navigation from "../../component/Emails/Email/Navigation";
import Mails from "../../component/Emails/Email/Mails";
import EmailContent from "../../component/Emails/Email/EmailContent";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../component/Partials/Sidebar";

export default function Email() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("queued");

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
              onClick={() => navigate(`/email`)}
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
              onClick={() => navigate(`/email_template`)}
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

        <SubHeader title="Email" isBackEnabled sticky />

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
            px: "16px",
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
              <Navigation
                setSelectedStatus={setSelectedStatus}
              />
            </Layout.SideNav>

            <Layout.SidePane>
              {/* Header for inbox */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    level="title-lg"
                    textColor="text.secondary"
                    component="h1"
                  >
                    My inbox
                  </Typography>
                </Box>
              </Box>

              {/* Mails list */}
              <Mails
                setSelectedEmail={setSelectedEmail}
                selectedEmail={selectedEmail}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            </Layout.SidePane>

            <Layout.Main>
              <EmailContent selectedEmail={selectedEmail} />
            </Layout.Main>
          </Layout.Root>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
