import React, { useEffect, useState } from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Chip from "@mui/joy/Chip";
import { FocusTrap } from "@mui/base/FocusTrap";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import Layout from "../../component/Emails/Template/Layout";
import Navigation from "../../component/Emails/Template/Navigation";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import Sidebar from "../../component/Partials/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateStatusMutation,
} from "../../redux/emailSlice";
import CreateTemplate from "../../component/Emails/Template/CreateTemplate";
import Portal from "../../component/Portal";
import { Snackbar } from "@mui/joy";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function Template() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    color: "success",
    msg: "",
  });
  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const key = e.key?.toLowerCase();
      if (
        (isMac && e.metaKey && key === "n") ||
        (!isMac && e.ctrlKey && key === "n")
      ) {
        e.preventDefault();
        setSelectedTemplate(null);
        setOpen(true);
      } else if (key === "escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const {
    data: getTemplate,
    isLoading,
    isFetching,
    error,
  } = useGetEmailTemplateQuery({});

  const templates = Array.isArray(getTemplate?.data) ? getTemplate.data : [];

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };
  const [updateEmailTemplateStatus] = useUpdateEmailTemplateStatusMutation();

  const handleMoveToTrash = async () => {
    if (!selectedTemplate) return;
    try {
      await updateEmailTemplateStatus({
        id: selectedTemplate,
        status: "trash",
      }).unwrap();
      setSnack({
        open: true,
        color: "success",
        msg: "Email Template moved to trash.",
      });
    } catch (err) {
      setSnack({
        open: true,
        color: "danger",
        msg: String(err?.data?.message || err?.message || "Failed to move."),
      });
    }
  };


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
            zIndex: "999",
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
            component="a"
            size="sm"
            startDecorator={<EmailRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
            onClick={() => navigate("/email")}
          >
            Email
          </Button>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            startDecorator={<PeopleAltRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
            onClick={() => navigate("/email_template")}
          >
            Templates
          </Button>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            startDecorator={<FolderRoundedIcon />}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
          >
            Files
          </Button>
        </Stack>

        {/* Main Header */}
        <MainHeader title="Email Templates" sticky>
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

        <SubHeader
          title="Email Templates"
          isBackEnabled
          sticky
          rightSlot={
            <>
              <Button
                size="sm"
                startDecorator={<CreateRoundedIcon />}
                onClick={() => {
                  setSelectedTemplate(null);
                  setOpen(true);
                }}
                sx={{ ml: "auto" }}
              >
                Compose email
              </Button>
              {open && (
                <Portal>
                  <FocusTrap open disableAutoFocus disableEnforceFocus>
                    <CreateTemplate
                      selectedTemplate={selectedTemplate}
                      open={open}
                      onClose={() => setOpen(false)}
                    />
                  </FocusTrap>
                </Portal>
              )}
            </>
          }
        />

        {/* Main content */}
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
              {
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "minmax(64px, 200px) minmax(450px, 1fr)",
                  md: "minmax(160px, 300px) minmax(600px, 1fr)",
                },
              },
              drawerOpen && {
                height: "100vh",
                overflow: "hidden",
              },
            ]}
          >
            <Layout.SideNav>
              <Navigation />
            </Layout.SideNav>

            <Layout.Main>
              {isLoading || isFetching ? (
                <Typography level="body-sm">Loading templates…</Typography>
              ) : error ? (
                <Typography level="body-sm" color="danger">
                  Failed to load templates
                </Typography>
              ) : templates.length === 0 ? (
                <Typography level="body-sm" textColor="text.tertiary">
                  No templates found
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 2,
                  }}
                >
                  {templates.map((tpl) => (
                    <Card
                      key={tpl._id}
                      variant="outlined"
                      size="sm"
                      sx={{
                        cursor: "default",
                        "&:hover": { boxShadow: "sm" },
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography level="title-md" noWrap>
                            {tpl.name || "(Untitled template)"}
                          </Typography>

                          {/* Tags */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              flexWrap: "wrap",
                              mt: 0.5,
                            }}
                          >
                            {(tpl.tags || []).length > 0 ? (
                              tpl.tags.map((tag, i) => (
                                <Chip
                                  key={`${tpl._id}-tag-${i}`}
                                  size="sm"
                                  variant="soft"
                                >
                                  {String(tag).charAt(0).toUpperCase() +
                                    String(tag).slice(1)}
                                </Chip>
                              ))
                            ) : (
                              <Typography
                                level="body-xs"
                                textColor="text.tertiary"
                              >
                                No tags
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Menu (only place that opens editor for edit) */}
                        <Dropdown>
                          <MenuButton
                            variant="plain"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              maxWidth: 32,
                              maxHeight: 32,
                              borderRadius: "9999999px",
                              cursor: "pointer",
                            }}
                          >
                            <IconButton
                              component="span"
                              variant="plain"
                              color="neutral"
                              size="sm"
                              sx={{ cursor: "pointer" }}
                            >
                              <MoreVertRoundedIcon />
                            </IconButton>
                          </MenuButton>
                          <Menu
                            placement="bottom-end"
                            size="sm"
                            sx={{
                              zIndex: "99999",
                              p: 1,
                              gap: 1,
                              "--ListItem-radius": "var(--joy-radius-sm)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem
                              onClick={() => {
                                setSelectedTemplate(tpl._id);
                                setOpen(true);
                              }}
                              sx={{ cursor: "pointer" }}
                            >
                              <EditRoundedIcon />
                              Edit template
                            </MenuItem>
                            <MenuItem
                              sx={{
                                textColor: "danger.500",
                                cursor: "pointer",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(tpl._id);
                                handleMoveToTrash();
                              }}
                            >
                              <DeleteRoundedIcon color="danger" />
                              Move to Trash
                            </MenuItem>
                          </Menu>
                        </Dropdown>
                      </Box>

                      {/* Middle section — File Icon */}
                      <CardOverflow
                        sx={{
                          borderBottom: "1px solid",
                          borderTop: "1px solid",
                          borderColor: "neutral.outlinedBorder",
                        }}
                      >
                        <AspectRatio
                          ratio="16/9"
                          color="primary"
                          sx={{ borderRadius: 0, color: "primary.plainColor" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <InsertDriveFileRoundedIcon sx={{ fontSize: 48 }} />
                          </Box>
                        </AspectRatio>
                      </CardOverflow>

                      {/* Footer */}
                      <Typography level="body-xs" sx={{ mt: 0.5 }}>
                        Added {formatDate(tpl.createdAt)}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}
            </Layout.Main>
          </Layout.Root>
        </Box>
      </Box>
      <Snackbar
        color={snack.color}
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        startDecorator={<CheckCircleRoundedIcon />}
        endDecorator={
          <Button
            onClick={() => setSnack((s) => ({ ...s, open: false }))}
            size="sm"
            variant="soft"
            color="neutral"
          >
            Dismiss
          </Button>
        }
      >
        {snack.msg}
      </Snackbar>
    </CssVarsProvider>
  );
}
