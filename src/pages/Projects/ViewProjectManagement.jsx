// pages/Projects/ViewProjectManagement.jsx
import Box from "@mui/joy/Box";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";
import Button from "@mui/joy/Button";
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
import { Save, ContentPasteGo } from "@mui/icons-material";
import Sidebar from "../../component/Partials/Sidebar";
import SubHeader from "../../component/Partials/SubHeader";
import MainHeader from "../../component/Partials/MainHeader";
import { useSearchParams } from "react-router-dom";
import { useRef, useState, useMemo, useCallback } from "react";
import View_Project_Management from "../../component/ViewProjectManagement";
import Filter from "../../component/Partials/Filter";
import SearchPickerModal from "../../component/SearchPickerModal";
import {
  useExportProjectScheduleMutation,
  useExportProjectSchedulePdfQuery,
  useLazyExportProjectSchedulePdfQuery,
  useLazyGetAllTemplateNameSearchQuery,
  useUpdateProjectActivityFromTemplateMutation,
  useUpdateStatusOfPlanMutation,
} from "../../redux/projectsSlice";
import AppSnackbar from "../../component/AppSnackbar";

function ViewProjectManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project_id") || "";
  const selectedView = searchParams.get("view") || "week";
  const [snack, setSnack] = useState({ open: false, msg: "" });
  const ganttRef = useRef(null);

  const timeline = searchParams.get("timeline");
  const type = searchParams.get("type");
  const [planStatus, setPlanStatus] = useState(null);
  const [updatePlanStatus, { isLoading: isUpdatingPlanStatus }] =
    useUpdateStatusOfPlanMutation();

  const handlePlanStatusFromChild = useCallback((statusObj) => {
    const s = (statusObj?.status || "").toLowerCase();
    if (s === "freeze" || s === "unfreeze") {
      setPlanStatus(s);
    }
  }, []);
  const safeMsg = String(snack?.msg ?? "");
  const isError = /^(failed|invalid|error|server)/i.test(safeMsg);
  const toggleFreeze = async () => {
    if (!projectId || !planStatus) return;
    const next = planStatus === "unfreeze" ? "freeze" : "unfreeze";
    try {
      await updatePlanStatus({
        projectId,
        status: next,
      }).unwrap();

      setPlanStatus(next);
      ganttRef.current?.refetch?.();
      setSnack({ open: true, msg: "Status Updated Successfully" });
    } catch (e) {
      setSnack({ open: true, msg: "Failed to update status:" });
    }
  };

  // ====== Filters ======
  const [open, setOpen] = useState(false);
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

  // ====== Save-as-template ======
  const [tplOpen, setTplOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplConfirm, setTplConfirm] = useState(false);
  const [tplSubmitting, setTplSubmitting] = useState(false);
  const [tplError, setTplError] = useState("");

  const onClickSaveAsTemplate = () => {
    setTplError("");
    setTplConfirm(false);
    setTplOpen(true);
  };

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
      setTplOpen(false);
      setTplName("");
      setTplDesc("");
      setTplConfirm(false);
    } catch {
      setTplError("Something went wrong while saving the template.");
    } finally {
      setTplSubmitting(false);
    }
  };

  const [tplPickerOpen, setTplPickerOpen] = useState(false);
  const [triggerSearchTemplates] = useLazyGetAllTemplateNameSearchQuery();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applyTemplate, { isLoading: isApplyingTemplate }] =
    useUpdateProjectActivityFromTemplateMutation();

  const templateColumns = useMemo(
    () => [
      { key: "template_code", label: "Template Code", width: "18%" },
      { key: "name", label: "Template Name", width: "28%" },
      {
        key: "description",
        label: "Description",
        render: (r) => (r.description ? String(r.description) : "—"),
      },
    ],
    []
  );

  const fetchTemplatePage = async ({ page, search, pageSize }) => {
    const res = await triggerSearchTemplates({
      search: search || "",
      page: page || 1,
      limit: pageSize || 7,
      projectId,
    }).unwrap();

    const rows =
      res?.rows || res?.data?.rows || res?.templates || res?.data || [];
    const total =
      res?.total || res?.data?.total || (Array.isArray(rows) ? rows.length : 0);

    return {
      rows: Array.isArray(rows)
        ? rows.map((r, i) => ({
          _id: r._id || r.id || String(i),
          ...r,
        }))
        : [],
      total,
    };
  };

  const onPickTemplate = (row) => {
    setTplPickerOpen(false);
    setSelectedTemplate(row || null);
    setConfirmOpen(true);
  };

  const confirmApplyTemplate = async () => {
    if (!projectId || !selectedTemplate?._id) {
      setConfirmOpen(false);
      setSelectedTemplate(null);
      return;
    }
    try {
      await applyTemplate({
        projectId,
        activityId: selectedTemplate._id,
      }).unwrap();

      setConfirmOpen(false);
      setSelectedTemplate(null);
      ganttRef.current?.refetch?.();
    } catch {
      setConfirmOpen(false);
      setSelectedTemplate(null);
    }
  };

  // Compute button visuals from planStatus
  const isUnfreeze = (planStatus || "").toLowerCase() === "unfreeze";
  const freezeBtnLabel = isUnfreeze ? "Freeze" : "Unfreeze";
  const freezeBtnProps = isUnfreeze
    ? { variant: "solid", color: "danger" }
    : { variant: "outlined", color: "success" };

  const [triggerExport, { loading: isExporting }] = useExportProjectScheduleMutation();

  const handleExportCsv = async () => {
    try {
      const blob = await triggerExport({ projectId, type, timeline }).unwrap();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Project-Schedule.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Export Failed", error);
      alert("Failed to export Project Schedule");
    }
  }

  const [fetchPdf, { isFetching: isExportingPdf, isLoading, error, data }] =
    useLazyExportProjectSchedulePdfQuery();

  const handleExportPdf = async () => {
    try {

      const blob = await fetchPdf({ projectId }).unwrap();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Project-Schedule.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Export Failed", error);
      alert("Failed to Export Project Schedule");
    }
  }

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
      >
        <Sidebar />
        <MainHeader title="Projects" sticky />
        <SubHeader
          title="View Project Schedule"
          isBackEnabled
          sticky
          rightSlot={
            <>
              {/* Freeze / Unfreeze button */}
              {/* <Button */}
              {/* //   size="sm"
              //   color="danger"
              //   variant="outlined"
              //   onClick={handleExportPdf}
              //   disabled={isExportingPdf}
              // >
              //   {isExporting ? "Generating..." : "PDF"}
              // </Button> */}
              <Button
                size="sm"
                color="danger"
                variant="outlined"
                onClick={handleExportCsv}
                disabled={isExporting}
              >
                {isExporting ? "Generating..." : "CSV"}
              </Button>
              <Button
                {...freezeBtnProps}
                size="sm"
                onClick={toggleFreeze}
                loading={isUpdatingPlanStatus}
                disabled={!projectId || isUpdatingPlanStatus || !planStatus}
                sx={{
                  height: "8px",
                  ...(freezeBtnProps.variant === "outlined"
                    ? {
                      borderColor: "success.outlinedBorder",
                      color: "success.plainColor",
                      "--Button-hoverBorderColor":
                        "success.outlinedHoverBorder",
                    }
                    : {}),
                }}
              >
                {freezeBtnLabel}
              </Button>

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
                onClick={onClickSaveAsTemplate}
              >
                Save as Template
              </Button>

              <Button
                variant="solid"
                size="sm"
                startDecorator={<ContentPasteGo />}
                sx={{
                  backgroundColor: "#3366a3",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#285680" },
                  height: "8px",
                }}
                onClick={() => setTplPickerOpen(true)}
              >
                Fetch From Template
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
            </>
          }
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
            px: "16px",
          }}
        >
          <View_Project_Management
            ref={ganttRef}
            viewModeParam={selectedView}
            onPlanStatus={handlePlanStatusFromChild}
          />
        </Box>
      </Box>

      {/* Save as Template Modal */}
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
          sx={{
            maxWidth: 560,
            width: "100%",
            borderRadius: "xl",
            boxShadow: "lg",
            p: 2,
          }}
        >
          <DialogTitle sx={{ pb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Save fontSize="small" />
              Save as Template
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 0.5 }}>
            <Typography
              level="body-sm"
              sx={{ color: "text.tertiary", mb: 1.5 }}
            >
              Give your template a clear name and description.
            </Typography>

            <FormControl sx={{ mb: 1.25 }}>
              <FormLabel>
                Name{" "}
                <Typography component="span" color="danger">
                  *
                </Typography>
              </FormLabel>
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
                  <Typography
                    level="body-xs"
                    sx={{ ml: "auto", color: "text.tertiary" }}
                  >
                    {tplName.length}
                  </Typography>
                }
              />
            </FormControl>

            <FormControl sx={{ mb: 1.25 }}>
              <FormLabel>
                Description{" "}
                <Typography component="span" color="danger">
                  *
                </Typography>
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                      pt: 0.5,
                    }}
                  >
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
              <Typography level="body-sm">
                Are you sure you want to submit?
              </Typography>
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
              disabled={tplSubmitting || !tplConfirm}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Fetch From Template modal (search) */}
      <SearchPickerModal
        open={tplPickerOpen}
        onClose={() => setTplPickerOpen(false)}
        onPick={onPickTemplate}
        title="Search: Template"
        columns={templateColumns}
        fetchPage={(args) =>
          fetchTemplatePage({
            ...args,
            projectId,
          })
        }
        searchKey="code, name"
        pageSize={7}
        rowKey="_id"
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* Confirm apply template */}
      <Modal
        open={confirmOpen}
        onClose={() => !isApplyingTemplate && setConfirmOpen(false)}
        slotProps={{
          backdrop: {
            sx: { backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" },
          },
        }}
      >
        <ModalDialog variant="outlined" color="danger" sx={{ maxWidth: 440 }}>
          <DialogTitle>Apply Template?</DialogTitle>
          <DialogContent>
            This will replace activities for this project using the selected
            template.
            <br />
            <strong>This action cannot be undone.</strong>
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setConfirmOpen(false)}
              disabled={isApplyingTemplate}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="danger"
              loading={isApplyingTemplate}
              onClick={confirmApplyTemplate}
            >
              Yes, apply
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <AppSnackbar
        color={isError ? "danger" : "success"}
        open={!!snack.open}
        message={safeMsg}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </CssVarsProvider>
  );
}

export default ViewProjectManagement;
