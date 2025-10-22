// component/AssignedWorkModal.jsx
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
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

// Helper to safely join base + path (avoids missing/duplicate slashes)
const withBase = (base, path) =>
  `${String(base || "").replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;

const PHASES = [
  { id: "phase1", label: "Phase 1" },
  { id: "phase2", label: "Phase 2" },
];

// Keep your phase-specific activity list (static for now, swap with API later if needed)
const PHASE_ACTIVITIES = {
  phase1: [
    { id: "P1-10", label: "Foundation Marking" },
    { id: "P1-20", label: "Civil Works" },
  ],
  phase2: [
    { id: "P2-10", label: "Electrical Termination" },
    { id: "P2-20", label: "Inverter Commissioning" },
  ],
};

export default function AssignedWorkModal({
  open = false,
  onClose = () => {},
  onSaved = () => {},
  project = null, // { id, code, customer, ... }
}) {
  const [saving, setSaving] = useState(false);

  // Data states (dynamic)
  const [activities, setActivities] = useState([]); // [{ id, label }]
  const [engineers, setEngineers] = useState([]);   // [{ id, name }]

  // Loading flags
  const [loading, setLoading] = useState({ activities: false, engineers: false });

  // Form states
  const [activityId, setActivityId] = useState("");     // main activity (single)
  const [selectedPhases, setSelectedPhases] = useState([]); // ["phase1","phase2"]
  const [phaseState, setPhaseState] = useState({
    phase1: { activities: [], engineers: [] }, // activities[] & engineers[] are arrays of ids
    phase2: { activities: [], engineers: [] },
  });
  const [touched, setTouched] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL;

  // Reset + fetch when modal opens
  useEffect(() => {
    if (open) {
      setSaving(false);
      setTouched(false);
      setActivityId("");
      setSelectedPhases([]);
      setPhaseState({
        phase1: { activities: [], engineers: [] },
        phase2: { activities: [], engineers: [] },
      });
      fetchActivities();
      fetchEngineers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** Fetch DPR Activities for main activity dropdown */
  const fetchActivities = async () => {
    try {
      setLoading((prev) => ({ ...prev, activities: true }));
      const token = localStorage.getItem("authToken");
      const url = withBase(API_BASE, "dpr/dpr-activities-list");

      const res = await axios.get(url, {
        headers: { "x-auth-token": token },
      });

      const list = res?.data?.data;
      if (Array.isArray(list)) {
        // Normalize to { id, label } for consistent rendering
        const normalized = list.map((a) => ({
          id: a._id || a.id,
          label: a.code || a.name || a.label || "Unnamed Activity",
          // you can show description in Option text if present
          description: a.description || "",
        }));
        setActivities(normalized);
      } else {
        setActivities([]);
        toast.warning("No activities found");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities([]);
      toast.error("Failed to load activity list.");
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  /** Fetch Site Engineers for engineer dropdowns */
  const fetchEngineers = async () => {
    try {
      setLoading((prev) => ({ ...prev, engineers: true }));
      const token = localStorage.getItem("authToken");
      const url = withBase(API_BASE, "projectactivity/project-users");

      const res = await axios.get(url, {
        headers: { "x-auth-token": token },
      });

      const list = res?.data?.data;
      console.log("Engineers fetch response:", list);
      if (Array.isArray(list)) {
        // Normalize to { id, name }
        const formatted = list.map((u) => ({
          id: u._id || u.id,
          name: u.name || "Unnamed",
        }));
        setEngineers(formatted);
      } else {
        setEngineers([]);
        toast.warning("No site engineers found");
      }
    } catch (err) {
      console.error("Error fetching engineers:", err);
      setEngineers([]);
      toast.error("Failed to load engineer list.");
    } finally {
      setLoading((prev) => ({ ...prev, engineers: false }));
    }
  };

  /** Helpers */
  const getPhaseOptions = (phaseId) =>
    phaseId === "phase2" ? PHASE_ACTIVITIES.phase2 : PHASE_ACTIVITIES.phase1;

  const updatePhaseField = (phaseId, key, valueArray) => {
    setPhaseState((prev) => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], [key]: valueArray || [] },
    }));
  };

  /** Validation */
  const errors = useMemo(() => {
    const e = {};
    if (!activityId) e.activityId = "Select a main activity.";
    if (!selectedPhases?.length) e.selectedPhases = "Select at least one phase.";

    selectedPhases.forEach((ph) => {
      const ps = phaseState[ph] || { activities: [], engineers: [] };
      if (!ps.activities?.length)
        e[`activities_${ph}`] = `Select at least one ${ph === "phase1" ? "Phase 1" : "Phase 2"} activity.`;
      if (!ps.engineers?.length)
        e[`engineers_${ph}`] = `Select at least one engineer for ${ph === "phase1" ? "Phase 1" : "Phase 2"}.`;
    });
    return e;
  }, [activityId, selectedPhases, phaseState]);

  const isValid = Object.keys(errors).length === 0;

  /** Chip renderer for Select renderValue (receives option objects) */
  const renderChips = (selectedOptions) => {
    if (!selectedOptions?.length) return null;
    return (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {selectedOptions.map((opt) => (
          <Chip key={opt.value} size="sm" variant="soft">
            {opt.label ?? String(opt.value)}
          </Chip>
        ))}
      </Box>
    );
  };

  /** Save Handler */
  const handleSave = async () => {
    setTouched(true);
    if (!isValid) return;

    const assignments = selectedPhases.map((ph) => ({
      phase: ph, // "phase1" | "phase2"
      phaseActivities: phaseState[ph]?.activities || [],
      engineers: phaseState[ph]?.engineers || [],
    }));

    const payload = {
      projectId: project?.id,
      activity: activityId, // main activity id (if backend wants it)
      assignments,          // per-phase activities & engineers
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");
      const url = withBase(API_BASE, "v1/dpr/assign-work");

      await axios.post(url, payload, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      toast.success("Work assigned successfully!");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error assigning work:", err);
      toast.error("Failed to assign work. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /** UI */
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" size="md" sx={{ borderRadius: "lg" }}>
        <DialogTitle>Assign Work</DialogTitle>

        <DialogContent>
          {/* Project Summary */}
          <Sheet
            variant="soft"
            sx={{
              mb: 1.5,
              p: 1.25,
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

          <Box sx={{ display: "grid", gap: 1.25 }}>
            {/* Main Activity (Dynamic) */}
            <FormControl size="sm" error={touched && !!errors.activityId}>
              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                Main Activity
              </Typography>
              <Select
                size="sm"
                placeholder="Select activity"
                value={activityId || null}
                onChange={(_, v) => setActivityId(v || "")}
                disabled={loading.activities}
                startDecorator={
                  loading.activities && <CircularProgress size="sm" thickness={2} />
                }
                slotProps={{ listbox: { sx: { maxHeight: 320, overflow: "auto" } } }}
              >
                {activities.length > 0 ? (
                  activities.map((a) => (
                    <Option key={a.id} value={a.id}>
                      {a.description
                        ? `${a.label} — ${a.description}`
                        : a.label}
                    </Option>
                  ))
                ) : (
                  !loading.activities && <Option disabled>No activities found</Option>
                )}
              </Select>
              {touched && errors.activityId && (
                <FormHelperText>{errors.activityId}</FormHelperText>
              )}
            </FormControl>

            {/* Phases (MULTI) */}
            <FormControl size="sm" error={touched && !!errors.selectedPhases}>
              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                Phases
              </Typography>
              <Select
                size="sm"
                multiple
                placeholder="Select phases"
                value={selectedPhases}
                onChange={(_, v) => setSelectedPhases(v || [])}
                renderValue={(selectedOptions) =>
                  selectedOptions?.length ? renderChips(selectedOptions) : "Select phases"
                }
                slotProps={{ listbox: { sx: { maxHeight: 320, overflow: "auto" } } }}
              >
                {PHASES.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.label}
                  </Option>
                ))}
              </Select>
              {touched && errors.selectedPhases && (
                <FormHelperText>{errors.selectedPhases}</FormHelperText>
              )}
            </FormControl>

            {/* Per-phase Sections */}
            {selectedPhases.map((ph) => {
              const label = ph === "phase2" ? "Phase 2" : "Phase 1";
              const phaseOptions = getPhaseOptions(ph);

              return (
                <Sheet
                  key={ph}
                  variant="plain"
                  sx={{
                    border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
                    borderRadius: "md",
                    p: 1,
                    display: "grid",
                    gap: 1,
                  }}
                >
                  <Typography level="title-sm">{label} Assignment</Typography>

                  {/* Phase Activities (MULTI) */}
                  <FormControl size="sm" error={touched && !!errors[`activities_${ph}`]}>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>
                      {label} Activities
                    </Typography>
                    <Select
                      size="sm"
                      multiple
                      placeholder={`Select ${label} activities`}
                      value={phaseState[ph]?.activities || []}
                      onChange={(_, v) => updatePhaseField(ph, "activities", v)}
                      renderValue={(selectedOptions) =>
                        selectedOptions?.length
                          ? renderChips(selectedOptions)
                          : `Select ${label} activities`
                      }
                      slotProps={{ listbox: { sx: { maxHeight: 320, overflow: "auto" } } }}
                    >
                      {phaseOptions.map((a) => (
                        <Option key={a.id} value={a.id}>
                          {`${a.id} — ${a.label}`}
                        </Option>
                      ))}
                    </Select>
                    {touched && errors[`activities_${ph}`] && (
                      <FormHelperText>{errors[`activities_${ph}`]}</FormHelperText>
                    )}
                  </FormControl>

                  {/* Engineers (MULTI) */}
                  <FormControl size="sm" error={touched && !!errors[`engineers_${ph}`]}>
                    <Typography level="body-sm" sx={{ mb: 0.5 }}>
                      Assign Engineer(s) for {label}
                    </Typography>
                    <Select
                      size="sm"
                      multiple
                      placeholder="Select site engineers"
                      value={phaseState[ph]?.engineers || []} // array of ids
                      onChange={(_, v) => updatePhaseField(ph, "engineers", v)}
                      disabled={loading.engineers}
                      startDecorator={
                        loading.engineers && <CircularProgress size="sm" thickness={2} />
                      }
                      renderValue={(selectedOptions) =>
                        selectedOptions?.length
                          ? renderChips(selectedOptions)
                          : "Select site engineers"
                      }
                      slotProps={{ listbox: { sx: { maxHeight: 320, overflow: "auto" } } }}
                    >
                      {engineers.length > 0 ? (
                        engineers.map((e) => (
                          <Option key={e.id} value={e.id}>
                            {e.name}
                          </Option>
                        ))
                      ) : (
                        !loading.engineers && <Option disabled>No engineers found</Option>
                      )}
                    </Select>
                    {touched && errors[`engineers_${ph}`] && (
                      <FormHelperText>{errors[`engineers_${ph}`]}</FormHelperText>
                    )}
                  </FormControl>
                </Sheet>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button size="sm" variant="outlined" color="neutral" onClick={onClose}>
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
