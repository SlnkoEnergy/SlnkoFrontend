// pages/Projects/ViewProjectManagement.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useSearchParams } from "react-router-dom";
import View_Project_Management from "../../component/ViewProjectManagement";
import Filter from "../../component/Partials/Filter";
import { useEffect, useRef, useState } from "react";
import { Save } from "@mui/icons-material";

// NEW imports for modal & inputs
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Typography,
  Checkbox,
} from "@mui/joy";

function ViewProjectManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const ganttRef = useRef(null);

  // NEW: modal state
  const [tplOpen, setTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplConfirm, setTplConfirm] = useState(false);
  const [tplSubmitting, setTplSubmitting] = useState(false);
  const [tplError, setTplError] = useState("");

  useEffect(() => {
    // keep whatever you had for user, etc.
  }, []);

  const selectedView = searchParams.get("view") || "week";

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

  // NEW: open modal
  const onClickSaveAsTemplate = () => {
    setTplError("");
    setTplConfirm(false);
    setTplOpen(true);
  };

  // NEW: submit modal -> call child with { name, description }
  const handleSubmitTemplate = async () => {
    const name = tplName.trim();
    const description = tplDesc.trim();

    if (!name) {
      setTplError("Please enter a template name.");
      return;
    }
    if (!tplConfirm) {
      setTplError('Please confirm: "Are you sure you want to submit?"');
      return;
    }

    setTplSubmitting(true);
    setTplError("");
    try {
      await ganttRef.current?.saveAsTemplate?.({ name, description });
      // reset & close
      setTplOpen(false);
      setTplName("");
      setTplDesc("");
      setTplConfirm(false);
    } catch (e) {
      setTplError("Something went wrong while saving the template.");
    } finally {
      setTplSubmitting(false);
    }
  };

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
        <Sidebar />
        <MainHeader title="Projects" sticky />
        <SubHeader title="View Project Schedule" isBackEnabled sticky>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="outlined"
              size="sm"
              startDecorator={<Save />}
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": { color: "#3366a3" },
                height: "8px",
              }}
              onClick={onClickSaveAsTemplate} // NEW
            >
              Save as Template
            </Button>

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
            px: "16px",
          }}
        >
          {/* pass view + ref */}
          <View_Project_Management ref={ganttRef} viewModeParam={selectedView} />
        </Box>
      </Box>

      {/* NEW: Save as Template Modal */}
      <Modal
        open={tplOpen}
        onClose={() => !tplSubmitting && setTplOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15, 18, 24, 0.55)",
              backdropFilter: "blur(2px)",
            },
          },
        }}
      >
        <ModalDialog
          variant="soft"
          color="neutral"
          sx={{ maxWidth: 560, width: "100%", borderRadius: "xl", boxShadow: "lg", p: 2 }}
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Save fontSize="small" />
              Save as Template
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 0.5 }}>
            <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 1.5 }}>
              Give your template a clear name and description.
            </Typography>

            <FormControl sx={{ mb: 1.25 }}>
              <FormLabel>Name <Typography component="span" color="danger">*</Typography></FormLabel>
              <Input
                autoFocus
                required
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="Enter template name"
                disabled={tplSubmitting}
                size="sm"
                variant="soft"
                endDecorator={
                  <Typography level="body-xs" sx={{ ml: "auto", color: "text.tertiary" }}>
                    {tplName.length}
                  </Typography>
                }
              />
            </FormControl>

            <FormControl sx={{ mb: 1.25 }}>
              <FormLabel>
                Description <Typography component="span" color="danger">*</Typography>
              </FormLabel>
              <Textarea
                required
                minRows={3}
                value={tplDesc}
                onChange={(e) => setTplDesc(e.target.value)}
                placeholder="Enter description"
                disabled={tplSubmitting}
                variant="soft"
                endDecorator={
                  <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", pt: 0.5 }}>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {tplDesc.length} chars
                    </Typography>
                  </Box>
                }
              />
            </FormControl>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 1,
                borderRadius: "md",
                bgcolor: "background.level1",
                mb: 0.5,
              }}
            >
              <Checkbox
                checked={tplConfirm}
                onChange={(e) => setTplConfirm(e.target.checked)}
                disabled={tplSubmitting}
                sx={{ m: 0 }}
              />
              <Typography level="body-sm">Are you sure you want to submit?</Typography>
            </Box>

            {tplError && (
              <Typography level="body-sm" color="danger" sx={{ mt: 0.5 }}>
                {tplError}
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ pt: 1 }}>
  <Button
    variant="plain"
    color="neutral"
    onClick={() => setTplOpen(false)}
    disabled={tplSubmitting}
  >
    Cancel
  </Button>
  <Button
    startDecorator={<Save />}
    onClick={handleSubmitTemplate}
    loading={tplSubmitting}
    disabled={tplSubmitting || !tplConfirm} // ✅ disable until checkbox ticked
  >
    Submit
  </Button>
</DialogActions>

        </ModalDialog>
      </Modal>


    </CssVarsProvider>
  );
}
export default ViewProjectManagement;
