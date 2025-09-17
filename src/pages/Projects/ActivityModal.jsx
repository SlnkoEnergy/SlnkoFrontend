// src/pages/Projects/ActivityModal.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, DialogTitle, DialogContent, FormControl, FormLabel,
  Input, Modal, ModalDialog, Option, Select, Sheet, Textarea, Typography
} from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectRS from "react-select";

import { useLazyGetProjectSearchDropdownQuery } from "../../redux/projectsSlice";
import SearchPickerModal from "../../component/SearchPickerModal";

export default function AddActivityModal({
  open,
  onClose,
  onCreate,
  isSubmitting = false,
}) {
  const [form, setForm] = useState({
    projectId: "",
    projectCode: "",
    projectName: "",
    activityName: "",
    type: "frontend",
    description: "",
  });

  const [touched, setTouched] = useState({});
  const [openProjectPicker, setOpenProjectPicker] = useState(false);

  const [quickOptions, setQuickOptions] = useState([]);
  const [fetchProjects, { isFetching }] = useLazyGetProjectSearchDropdownQuery();

  const loadQuick = async () => {
    try {
      const res = await fetchProjects({ search: "", page: 1, limit: 7 }).unwrap();
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setQuickOptions(
        arr.map((p) => ({
          _id: p._id || p.id,
          code: p.code || p.project_id || p.p_id || "",
          name: p.name || p.project_name || "",
        }))
      );
    } catch {
      setQuickOptions([]);
    }
  };
  useEffect(() => { if (open) loadQuick(); }, [open]); // eslint-disable-line

  const RS_MORE = { label: "Search more…", value: "__more__" };
  const rsOptions = useMemo(
    () => [
      ...quickOptions.map((p) => ({ label: p.code, value: p._id, name: p.name })),
      RS_MORE,
    ],
    [quickOptions]
  );
  const rsValue = form.projectId
    ? { value: form.projectId, label: form.projectCode || "", name: form.projectName }
    : null;

  const errors = {
    projectId: !form.projectId,
    projectName: !form.projectName.trim(),
    activityName: !form.activityName.trim(),
    type: !form.type.trim(),
    description: !form.description.trim(),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setTouched({ projectId: true, projectName: true, activityName: true, type: true, description: true });
    if (hasErrors) return;

    onCreate?.({
      project_id: form.projectId,
      project_name: form.projectName,
      name: form.activityName.trim(),
      description: form.description.trim(),
      type: form.type.toLowerCase(),
    });
  };

  const labelRequiredSx = { "&::after": { content: '" *"', color: "danger.500", fontWeight: 700 } };

  const fetchPage = async ({ page, search, pageSize }) => {
    const res = await fetchProjects({ search: search || "", page: page || 1, limit: pageSize || 10 }).unwrap();
    const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    const rows = arr.map((p) => ({
      _id: p._id || p.id,
      code: p.code || p.project_id || p.p_id || "",
      name: p.name || p.project_name || "",
    }));
    const total = res?.total ?? res?.pagination?.total ?? rows.length;
    return { rows, total };
  };

  const pickerColumns = [
    { key: "code", label: "Project Id", width: 220 },
    { key: "name", label: "Project Name" },
  ];

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          aria-labelledby="add-activity-title"
          variant="outlined"
          sx={{ width: 720, maxWidth: "95vw", borderRadius: "lg", boxShadow: "lg", p: 0 }}
        >
          <Box
            sx={{
              px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, bgcolor: "background.body", zIndex: 1,
            }}
          >
            <DialogTitle id="add-activity-title" sx={{ p: 0 }}>Add Activity</DialogTitle>
            <ModalClose
              variant="plain"
              sx={{ borderRadius: "sm" }}
              slots={{ root: Button }}
              slotProps={{ root: { size: "sm", variant: "plain", color: "neutral" } }}
            >
              <CloseRoundedIcon fontSize="small" />
            </ModalClose>
          </Box>

          <DialogContent sx={{ mt: 0, pb: 0, px: 2, pt: 1 }}>
            Fill all the required fields below.
          </DialogContent>

          <Sheet
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid", gap: 1.25, px: 2, pb: 2, pt: 1,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {/* Project Id - only the dropdown (with “Search more…”) */}
            <FormControl size="sm" error={touched.projectId && errors.projectId} sx={{ overflow: "visible", gridColumn: { xs: "1 / -1", md: "1 / 2" } }}>
              <FormLabel sx={labelRequiredSx}>Project Id</FormLabel>
              <SelectRS
                placeholder="Search or pick project id"
                value={rsValue}
                options={rsOptions}
                isClearable
                isSearchable
                onMenuOpen={() => loadQuick()}
                onChange={(opt) => {
                  if (!opt) {
                    setForm((p) => ({ ...p, projectId: "", projectCode: "", projectName: "" }));
                    return;
                  }
                  if (opt.value === "__more__") {
                    setOpenProjectPicker(true);
                    return;
                  }
                  setForm((p) => ({
                    ...p,
                    projectId: opt.value,
                    projectCode: opt.label,
                    projectName: opt.name || p.projectName,
                  }));
                  setTouched((t) => ({ ...t, projectId: true, projectName: true }));
                }}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                  control: (base) => ({ ...base, minHeight: 36 }),
                }}
                isLoading={isFetching}
              />
              {touched.projectId && errors.projectId && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Project Id is required.
                </Typography>
              )}
            </FormControl>

            {/* Project Name */}
            <FormControl size="sm" error={touched.projectName && errors.projectName}>
              <FormLabel sx={labelRequiredSx}>Project Name</FormLabel>
              <Input
                size="sm"
                readOnly
                value={form.projectName}
                placeholder="Auto-filled after picking Project Id"
                onBlur={() => setTouched((t) => ({ ...t, projectName: true }))}
              />
              {touched.projectName && errors.projectName && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Project Name is required.
                </Typography>
              )}
            </FormControl>

            {/* Activity Name */}
            <FormControl size="sm" error={touched.activityName && errors.activityName}>
              <FormLabel sx={labelRequiredSx}>Activity Name</FormLabel>
              <Input
                size="sm"
                placeholder="Enter activity name"
                value={form.activityName}
                onChange={(e) => setForm((p) => ({ ...p, activityName: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, activityName: true }))}
              />
              {touched.activityName && errors.activityName && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Activity Name is required.
                </Typography>
              )}
            </FormControl>

            {/* Type */}
            <FormControl size="sm" error={touched.type && errors.type}>
              <FormLabel sx={labelRequiredSx}>Type</FormLabel>
              <Select
                size="sm"
                value={form.type}
                onChange={(_, v) => v && setForm((p) => ({ ...p, type: v }))}
                onBlur={() => setTouched((t) => ({ ...t, type: true }))}
              >
                <Option value="frontend">Frontend</Option>
                <Option value="backend">Backend</Option>
              </Select>
              {touched.type && errors.type && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Type is required.
                </Typography>
              )}
            </FormControl>

            {/* Description */}
            <FormControl
              size="sm"
              error={touched.description && errors.description}
              sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
            >
              <FormLabel sx={labelRequiredSx}>Description</FormLabel>
              <Textarea
                minRows={3}
                placeholder="Describe the activity"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                onBlur={() => setTouched((t) => ({ ...t, description: true }))}
              />
              {touched.description && errors.description && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                  Description is required.
                </Typography>
              )}
            </FormControl>

            {/* Actions */}
            <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={onClose}
                size="sm"
                startDecorator={<CloseRoundedIcon />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                startDecorator={<SaveRoundedIcon />}
                disabled={hasErrors || isSubmitting}
                loading={isSubmitting}
              >
                Save
              </Button>
            </Box>
          </Sheet>
        </ModalDialog>
      </Modal>

      {/* Full, paginated search */}
      <SearchPickerModal
        open={openProjectPicker}
        onClose={() => setOpenProjectPicker(false)}
        title="Select Project"
        columns={pickerColumns}
        rowKey="_id"
        pageSize={10}
        searchKey="code or name" 
        fetchPage={fetchPage}
        onPick={(row) => {
          setForm((prev) => ({
            ...prev,
            projectId: row?._id || "",
            projectCode: row?.code || "",
            projectName: row?.name || "",
          }));
          setTouched((t) => ({ ...t, projectId: true, projectName: true }));
        }}
      />
    </>
  );
}
