import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const withBase = (base, path) =>
  `${String(base || "").replace(/\/+$/, "")}/${String(path || "").replace(
    /^\/+/,
    ""
  )}`;

export default function AssignedWorkModal({
  open = false,
  onClose,
  onSaved,
  project,
}) {
  const API_BASE = process.env.REACT_APP_API_URL;

  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState({
    activities: false,
    engineers: false,
  });
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [phaseState, setPhaseState] = useState({
    phase1: { activities: [], engineers: [] },
    phase2: { activities: [], engineers: [] },
  });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
      fetchActivities();
      fetchEngineers();
    }
  }, [open]);

  const resetForm = () => {
    setSaving(false);
    setTouched(false);
    setSelectedPhases([]);
    setPhaseState({
      phase1: { activities: [], engineers: [] },
      phase2: { activities: [], engineers: [] },
    });
  };

  const fetchActivities = async () => {
    try {
      setLoading((p) => ({ ...p, activities: true }));
      const token = localStorage.getItem("authToken");
      const url = withBase(API_BASE, "dpr/dpr-activities-list");
      const res = await axios.get(url, { headers: { "x-auth-token": token } });
      setActivities(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Failed to load activities");
    } finally {
      setLoading((p) => ({ ...p, activities: false }));
    }
  };

  const fetchEngineers = async () => {
    try {
      setLoading((p) => ({ ...p, engineers: true }));
      const token = localStorage.getItem("authToken");
      const url = withBase(API_BASE, "projectactivity/project-users");
      const res = await axios.get(url, { headers: { "x-auth-token": token } });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setEngineers(list.map((e) => ({ id: e._id, name: e.name })));
    } catch {
      toast.error("Failed to load engineers");
    } finally {
      setLoading((p) => ({ ...p, engineers: false }));
    }
  };

  const updatePhaseField = (phase, key, value) => {
    setPhaseState((prev) => ({
      ...prev,
      [phase]: { ...prev[phase], [key]: value || [] },
    }));
  };

  const errors = useMemo(() => {
    const e = {};
    if (!selectedPhases?.length)
      e.selectedPhases = "Select at least one phase.";
    selectedPhases.forEach((ph) => {
      const ps = phaseState[ph];
      if (!ps.activities?.length)
        e[`activities_${ph}`] = `Select activities for ${
          ph === "phase1" ? "Phase 1" : "Phase 2"
        }`;
      if (!ps.engineers?.length)
        e[`engineers_${ph}`] = `Select engineers for ${
          ph === "phase1" ? "Phase 1" : "Phase 2"
        }`;
    });
    return e;
  }, [selectedPhases, phaseState]);

  const isValid = Object.keys(errors).length === 0;

  const renderChips = (opts) =>
    opts?.length ? (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {opts.map((opt) => (
          <Chip key={opt.value} size="sm" variant="soft">
            {opt.label}
          </Chip>
        ))}
      </Box>
    ) : null;

  const handleSave = async () => {
    setTouched(true);
    if (!isValid) return;

    const payload = {
      project_id: project?.id,
      phase_1_engineers: selectedPhases.includes("phase1")
        ? phaseState.phase1.engineers.map((id) => ({
            activity_id: phaseState.phase1.activities[0] || "",
            assigned_engineer: id,
            assigned_status: "Assigned",
          }))
        : [],
      phase_2_engineers: selectedPhases.includes("phase2")
        ? phaseState.phase2.engineers.map((id) => ({
            activity_id: phaseState.phase2.activities[0] || "",
            assigned_engineer: id,
            assigned_status: "Assigned",
          }))
        : [],
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");
      const url = withBase(
        API_BASE,
        `dpr/dpr-activities?projectId=${project?.id}`
      );

      await axios.post(url, payload, {
        headers: {
          "x-auth-token": token,
        },
      });

      toast.success("Work assigned successfully!");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error assigning work:", err);
      toast.error("Failed to assign work");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" size="md" sx={{ borderRadius: "lg" }}>
        <DialogTitle>Assign Work</DialogTitle>

        <DialogContent>
          <Sheet
            variant="soft"
            sx={{
              mb: 1.5,
              p: 1,
              borderRadius: "md",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
            }}
          >
            <Typography level="body-sm">
              <b>Project Code:</b> {project?.code ?? "-"}
            </Typography>
            <Typography level="body-sm">
              <b>Customer:</b> {project?.customer ?? "-"}
            </Typography>
          </Sheet>

          {/* Phase Selection */}
          <FormControl size="sm" error={touched && !!errors.selectedPhases}>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              Select Phases
            </Typography>
            <Select
              size="sm"
              multiple
              placeholder="Choose phases"
              value={selectedPhases}
              onChange={(_, v) => setSelectedPhases(v || [])}
              renderValue={(opts) =>
                opts?.length ? renderChips(opts) : "Select phases"
              }
            >
              <Option value="phase1">Phase 1</Option>
              <Option value="phase2">Phase 2</Option>
            </Select>
            {touched && errors.selectedPhases && (
              <FormHelperText>{errors.selectedPhases}</FormHelperText>
            )}
          </FormControl>

          {selectedPhases.map((ph, idx) => {
            const label = ph === "phase1" ? "Phase 1" : "Phase 2";
            return (
              <Box key={ph}>
                {idx > 0 && <Divider sx={{ my: 1 }}>── {label} ──</Divider>}
                {idx === 0 && (
                  <Typography
                    level="title-sm"
                    sx={{
                      mt: 2,
                      mb: 1,
                      fontWeight: 600,
                      color: "primary.plainColor",
                    }}
                  >
                    {label}
                  </Typography>
                )}

                {/* Activities */}
                <FormControl
                  size="sm"
                  error={touched && !!errors[`activities_${ph}`]}
                >
                  <Typography level="body-sm" sx={{ mb: 0.5 }}>
                    {label} Activities
                  </Typography>
                  <Select
                    size="sm"
                    multiple
                    placeholder={`Select ${label} activities`}
                    value={phaseState[ph]?.activities || []}
                    onChange={(_, v) => updatePhaseField(ph, "activities", v)}
                    disabled={loading.activities}
                    startDecorator={
                      loading.activities && <CircularProgress size="sm" />
                    }
                    renderValue={(opts) =>
                      opts?.length
                        ? renderChips(opts)
                        : `Select ${label} activities`
                    }
                  >
                    {activities.map((a) => (
                      <Option key={a._id} value={a._id}>
                        {a.name || a.label}
                      </Option>
                    ))}
                  </Select>
                  {touched && errors[`activities_${ph}`] && (
                    <FormHelperText>
                      {errors[`activities_${ph}`]}
                    </FormHelperText>
                  )}
                </FormControl>

                {/* Engineers */}
                <FormControl
                  size="sm"
                  error={touched && !!errors[`engineers_${ph}`]}
                >
                  <Typography level="body-sm" sx={{ mb: 0.5 }}>
                    Assign Engineer(s) for {label}
                  </Typography>
                  <Select
                    size="sm"
                    multiple
                    placeholder="Select engineers"
                    value={phaseState[ph]?.engineers || []}
                    onChange={(_, v) => updatePhaseField(ph, "engineers", v)}
                    disabled={loading.engineers}
                    startDecorator={
                      loading.engineers && <CircularProgress size="sm" />
                    }
                    renderValue={(opts) =>
                      opts?.length ? renderChips(opts) : "Select engineers"
                    }
                  >
                    {engineers.map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.name}
                      </Option>
                    ))}
                  </Select>
                  {touched && errors[`engineers_${ph}`] && (
                    <FormHelperText>{errors[`engineers_${ph}`]}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            );
          })}
        </DialogContent>

        <DialogActions>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !isValid}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
