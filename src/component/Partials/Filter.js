// Filter.jsx (plain JavaScript)

import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  Radio,
  RadioGroup,
  Sheet,
  Typography,
} from "@mui/joy";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRounded from "@mui/icons-material/KeyboardArrowRightRounded";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import enIN from "date-fns/locale/en-IN";
import Select from "react-select";
import { useTheme } from "@mui/joy/styles";

const DateRange = lazy(() =>
  import("react-date-range").then((m) => ({ default: m.DateRange }))
);

/* ------------------ Styles ------------------ */
const rowSx = {
  px: 1,
  py: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
};

/* ------------------ Collapsible section row ------------------ */
function SectionRow({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Box sx={rowSx}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
      >
        {open ? <KeyboardArrowDownRounded /> : <KeyboardArrowRightRounded />}
        <Typography level="body-md" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {open && <Box sx={{ mt: 1.5 }}>{children}</Box>}
    </Box>
  );
}

/* ------------------ Normalize options ------------------ */
function normalizeOptions(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .filter((x) => x !== undefined && x !== null)
    .map((x) => {
      if (typeof x === "string" || typeof x === "number")
        return { label: String(x), value: String(x) };
      if (typeof x === "object") {
        const label = x.label ?? x.name ?? x.title ?? x.value ?? x.id;
        const value = x.value ?? x.id ?? x.code ?? label;
        return { label: String(label ?? "Unknown"), value: String(value ?? "Unknown") };
      }
      return { label: String(x), value: String(x) };
    });
}

/* ------------------ SearchableSelect ------------------ */
function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select…",
  multiple = false,
  styles = {},
}) {
  const theme = useTheme();

  const byValue = new Map(options.map((o) => [String(o.value), o]));
  const selectedValue = multiple
    ? (Array.isArray(value) ? value : [])
        .map((v) => byValue.get(String(v)))
        .filter(Boolean)
    : byValue.get(String(value)) || null;

  const handleChange = (next) => {
    if (multiple) {
      onChange?.((next || []).map((o) => o.value));
    } else {
      onChange?.(next ? next.value : undefined);
    }
  };

  return (
    <Select
      isMulti={multiple}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      styles={{
        container: (base) => ({ ...base, width: "100%" }),
        control: (base, state) => ({
          ...base,
          minHeight: 32,
          borderRadius: 8,
          background: theme.vars.palette.background.body,
          borderColor: state.isFocused
            ? theme.vars.palette.primary.outlinedBorder
            : theme.vars.palette.neutral.outlinedBorder,
          boxShadow: state.isFocused
            ? `0 0 0 3px ${theme.vars.palette.primary.softActiveBg}`
            : "none",
          ":hover": { borderColor: theme.vars.palette.neutral.outlinedHoverBorder },
          fontSize: 14,
        }),
        valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
        placeholder: (base) => ({ ...base, color: theme.vars.palette.text.tertiary }),
        singleValue: (base) => ({ ...base, color: theme.vars.palette.text.primary }),
        multiValue: (base) => ({
          ...base,
          background: theme.vars.palette.neutral.softBg,
          borderRadius: 6,
        }),
        multiValueLabel: (base) => ({ ...base, color: theme.vars.palette.text.primary }),
        menu: (base) => ({
          ...base,
          zIndex: 2000,
          background: "#fff",
          borderRadius: 10,
          boxShadow:
            "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 2000 }),
        ...styles,
      }}
    />
  );
}

/* ------------------ Date helpers ------------------ */
const fmt = (d) =>
  d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 10) : "";
const parseLocal = (s) => {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d) ? undefined : d;
};


function readValuesFromQuery(fields) {
  try {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const next = {};

    // match mode
    const mm = params.get("matchMode");
    if (mm) next.matcher = mm.toLowerCase() === "all" ? "AND" : "OR";

    for (const f of fields || []) {
      const k = f.key;

      // multi-value grabber
      const rawMulti =
        params.getAll(k).length
          ? params.getAll(k)
          : params.getAll(`${k}[]`).length
          ? params.getAll(`${k}[]`)
          : (params.get(k)?.split(",") ?? []).filter(Boolean);

      const single = params.get(k);

      if (f.type === "daterange") {
        const from = params.get(`${k}_from`) || params.get("from");
        const to = params.get(`${k}_to`) || params.get("to");
        if (from || to) next[k] = { from, to };
      } else if (f.type === "multiselect" || f.type === "tags") {
        if (rawMulti.length) next[k] = rawMulti;
      } else {
        if (single) next[k] = single;
      }
    }
    return next;
  } catch {
    return {};
  }
}

/* ------------------ FieldRenderer ------------------ */
function FieldRenderer({ field, value, onChange }) {
  const [tagInput, setTagInput] = useState("");
  const [opts, setOpts] = useState(normalizeOptions(field.options));

  useEffect(() => {
    const next = normalizeOptions(field.options);
    setOpts(next);
  }, [field.options, field.key]);

  const common = { sx: { mt: 1 }, size: "sm" };

  switch (field.type) {
    case "text":
      return (
        <Input
          {...common}
          placeholder={field.placeholder || "Type…"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "select":
      return (
        <SearchableSelect
          options={opts}
          value={value ?? undefined}
          onChange={(v) => onChange(v)}
          placeholder="Select…"
        />
      );

    case "multiselect": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <SearchableSelect
          options={opts}
          value={arr}
          onChange={(v) => onChange(v)}
          placeholder="Select…"
          multiple
        />
      );
    }

    case "daterange": {
      const from = value?.from ? parseLocal(value.from) : undefined;
      const to = value?.to ? parseLocal(value.to) : undefined;
      const selection = {
        startDate: from || new Date(),
        endDate: to || new Date(),
        key: "selection",
      };

      return (
        <Box sx={{ mt: 1 }}>
          {/* Quick presets */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                onChange({ from: fmt(new Date()), to: fmt(new Date()) })
              }
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                onChange({
                  from: fmt(addDays(new Date(), -6)),
                  to: fmt(new Date()),
                })
              }
            >
              Last 7 days
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                onChange({
                  from: fmt(startOfMonth(new Date())),
                  to: fmt(endOfMonth(new Date())),
                })
              }
            >
              This month
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="danger"
              onClick={() => onChange(undefined)}
            >
              Clear
            </Button>
          </Box>

          {/* Calendar */}
          <Suspense fallback={<Box sx={{ p: 2 }}>Loading calendar…</Box>}>
            <DateRange
              locale={enIN}
              ranges={[selection]}
              onChange={(r) => {
                const sel = r.selection || r?.ranges?.selection;
                if (!sel) return;
                onChange({
                  from: fmt(sel.startDate),
                  to: fmt(sel.endDate),
                });
              }}
              moveRangeOnFirstSelection={false}
              months={1}
              direction="horizontal"
              rangeColors={["#3366a3"]}
            />
          </Suspense>
        </Box>
      );
    }

    case "tags": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Input
              size="sm"
              placeholder={field.placeholder || "Add tag and press Enter"}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  onChange([...(arr || []), tagInput.trim()]);
                  setTagInput("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (tagInput.trim()) {
                  onChange([...(arr || []), tagInput.trim()]);
                  setTagInput("");
                }
              }}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
            {arr.map((t, i) => (
              <Chip
                key={`${t}-${i}`}
                size="sm"
                variant="soft"
                onDelete={() => onChange(arr.filter((_, idx) => idx !== i))}
              >
                {t}
              </Chip>
            ))}
          </Box>
        </Box>
      );
    }

    default:
      return null;
  }
}

/* ------------------ Main Filter ------------------ */
export default function Filter({
  open,
  onOpenChange,
  fields,
  initialValues = {},
  onApply,
  onReset,
  title = "Filters",
}) {
  // include URL params in initial values
  const [values, setValues] = useState(() => ({
    matcher: "AND",
    ...readValuesFromQuery(fields || []),
    ...initialValues,
  }));
  const [exiting, setExiting] = useState(false);

  // one-time sync on mount in case URL changed just before mount
  useEffect(() => {
    const fromQuery = readValuesFromQuery(fields || []);
    if (Object.keys(fromQuery).length) {
      setValues((prev) => ({ ...prev, ...fromQuery }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFieldValue = (key, next) =>
    setValues((prev) => ({ ...prev, [key]: next }));

  const resetAll = () => {
    const resetVals = { matcher: "AND" };
    (fields || []).forEach((f) => (resetVals[f.key] = undefined));
    setValues(resetVals);
    onReset?.();
  };

  const appliedCount = useMemo(
    () =>
      Object.entries(values).filter(
        ([k, v]) =>
          k !== "matcher" &&
          v !== undefined &&
          v !== null &&
          !(Array.isArray(v) && v.length === 0) &&
          !(
            typeof v === "object" &&
            !Array.isArray(v) &&
            Object.keys(v || {}).length === 0
          )
      ).length,
    [values]
  );

  return (
    <>
      {/* Trigger button */}
      <Box sx={{ position: "relative", display: "inline-block" }}>
        <IconButton
          variant="soft"
          size="sm"
          sx={{ "--Icon-color": "#3366a3" }}
          onClick={() => onOpenChange(true)}
        >
          <FilterAltRoundedIcon />
        </IconButton>

        {appliedCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: -6,
              right: -6,
              bgcolor: "var(--joy-palette-danger-solidBg)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              px: 0.5,
              minWidth: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              border: "2px solid var(--joy-palette-background-body)",
            }}
          >
            {`+${appliedCount}`}
          </Box>
        )}
      </Box>

      <Modal
        open={!!open}
        onClose={() => {
          setExiting(true);
          setTimeout(() => {
            setExiting(false);
            onOpenChange(false);
          }, 280);
        }}
        keepMounted
      >
        <Sheet
          variant="soft"
          color="neutral"
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100%",
            width: 360,
            display: "flex",
            flexDirection: "column",
            boxShadow: "lg",
            bgcolor: "background.level1",
            zIndex: 1300,
            transition: "transform 0.28s ease",
            transform: open
              ? "translateX(0)"
              : exiting
              ? "translateX(-100%)"
              : "translateX(100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              gap: 1,
            }}
          >
            <Typography level="title-md">{title}</Typography>
            {appliedCount > 0 && (
              <Chip size="sm" variant="soft">
                {appliedCount}
              </Chip>
            )}
            <ModalClose onClick={() => onOpenChange(false)} />
          </Box>

          {/* Fields */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {(fields || []).map((f) => (
              <SectionRow key={f.key} title={f.label}>
                <FieldRenderer
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => setFieldValue(f.key, v)}
                />
              </SectionRow>
            ))}

            <Box sx={{ p: 1.5 }}>
              <FormControl size="sm">
                <FormLabel>Match</FormLabel>
                <RadioGroup
                  orientation="horizontal"
                  value={values.matcher}
                  onChange={(e) => setFieldValue("matcher", e.target.value)}
                >
                  <Radio value="OR" label="Any of these" />
                  <Radio value="AND" label="All of these" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>

          <Divider />
          <Box
            sx={{ display: "flex", gap: 1, p: 1.5, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" size="sm" onClick={resetAll}>
              Reset
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={() => onApply?.(values, { appliedCount })}
            >
              Find
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </>
  );
}
