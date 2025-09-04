import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Typography,
  Tooltip,
} from "@mui/joy";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRounded from "@mui/icons-material/KeyboardArrowRightRounded";

const rowSx = {
  px: 1,
  py: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
};

function SectionRow({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Box sx={rowSx}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
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

SectionRow.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  defaultOpen: PropTypes.bool,
};

function OperatorSelect({ value, onChange, options }) {
  const _ops =
    Array.isArray(options) && options.length ? options : ["is", "contains"];
  return (
    <Select
      value={value}
      onChange={(_, v) => onChange(v)}
      size="sm"
      sx={{ minWidth: 120 }}
    >
      {_ops.map((op) => (
        <Option key={String(op)} value={op}>
          {String(op)}
        </Option>
      ))}
    </Select>
  );
}

OperatorSelect.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
};

// Normalize any options input into stable [{label, value}] without throwing
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
        return {
          label: String(label ?? "Unknown"),
          value: String(value ?? "Unknown"),
        };
      }
      return { label: String(x), value: String(x) };
    });
}

function FieldRenderer({ field, value, onChange }) {
  const [options, setOptions] = useState(normalizeOptions(field.options));
  const loadingRef = useRef(false);
  const [tagInput, setTagInput] = useState("");

  // Keep options in sync if parent updates field.options
  useEffect(() => {
    setOptions(normalizeOptions(field.options));
  }, [field.options]);

  // Fetch async options; depend on a stable identifier to avoid loops
  useEffect(() => {
    let active = true;
    async function load() {
      if (typeof field.getOptions === "function" && !loadingRef.current) {
        loadingRef.current = true;
        try {
          const res = await field.getOptions(); // strings or {label,value}
          if (active) setOptions(normalizeOptions(res));
        } finally {
          loadingRef.current = false;
        }
      }
    }
    load();
    return () => {
      active = false;
    };
    // Depend on a stable key only; if parent recreates functions, this won't loop
  }, [field.key]);

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
    case "number":
      return (
        <Input
          {...common}
          type="number"
          placeholder={field.placeholder || "0"}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      );
    case "checkbox":
      return (
        <Checkbox
          {...common}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          label={field.checkboxLabel || "Enabled"}
        />
      );
    case "date":
      return (
        <Input
          {...common}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      );
    case "daterange": {
      const from = value?.from || "";
      const to = value?.to || "";
      return (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Input
            size="sm"
            type="date"
            value={from}
            onChange={(e) =>
              onChange({ ...(value || {}), from: e.target.value })
            }
          />
          <Input
            size="sm"
            type="date"
            value={to}
            onChange={(e) => onChange({ ...(value || {}), to: e.target.value })}
          />
        </Box>
      );
    }
    case "select": {
      const opts = normalizeOptions(options);
      return (
        <Select
          {...common}
          value={value ?? null}
          onChange={(_, v) => onChange(v)}
          placeholder="Select…"
        >
          {opts.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
      );
    }
    case "multiselect": {
      const opts = normalizeOptions(options);
      const arr = Array.isArray(value) ? value : [];
      return (
        <Select
          {...common}
          multiple
          value={arr}
          onChange={(_, v) => onChange(v)}
          placeholder="Select…"
        >
          {opts.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
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

FieldRenderer.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default function Filter({
  open,
  onOpenChange,
  fields,
  initialValues = {},
  onApply,
  onReset,
  title = "Filters",
}) {
  const [values, setValues] = useState(() => ({
    matcher: "AND",
    ...initialValues,
  }));
  const [exiting, setExiting] = useState(false);
  const initAppliedRef = useRef(false);
  useEffect(() => {
    if (!initAppliedRef.current) {
      setValues((v) => ({
        matcher: v.matcher || "AND",
        ...initialValues,
        ...v,
      }));
      initAppliedRef.current = true;
    }
  }, []);

  const setFieldValue = (key, next) =>
    setValues((prev) => ({ ...prev, [key]: next }));
  const resetAll = () => {
    const resetVals = { matcher: values.matcher || "AND" };
    (fields || []).forEach((f) => {
      resetVals[f.key] = undefined;
    });
    setValues(resetVals);
    onReset && onReset();
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
      <IconButton
        variant="soft"
        size="sm"
        sx={{
          "--Icon-color": "#3366a3",
        }}
        onClick={() => onOpenChange(true)}
      >
        <FilterAltRoundedIcon />
      </IconButton>

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
        slotProps={{
          backdrop: { sx: { transition: "opacity 0.28s ease" } },
        }}
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
            }}
          >
            <Typography level="title-md">{title}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {appliedCount > 0 && (
                <Chip size="sm" variant="soft">
                  {appliedCount}
                </Chip>
              )}
              <ModalClose onClick={() => onOpenChange(false)} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            {(fields || []).map((f) => {
              const operatorOptions =
                f.operators ||
                (f.type === "text"
                  ? ["contains", "is"]
                  : f.type === "daterange"
                  ? ["between", "on", "before", "after"]
                  : ["is"]);
              const opKey = `${f.key}__op`;
              const opVal = values[opKey] || f.operator || operatorOptions[0];
              const fieldVal = values[f.key];

              return (
                <SectionRow
                  key={f.key}
                  title={f.label}
                  defaultOpen={!!f.startOpen}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <OperatorSelect
                      value={opVal}
                      onChange={(v) => setFieldValue(opKey, v)}
                      options={operatorOptions}
                    />
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                      <FieldRenderer
                        field={f}
                        value={fieldVal}
                        onChange={(v) => setFieldValue(f.key, v)}
                      />
                    </Box>
                  </Box>
                </SectionRow>
              );
            })}

            <Box sx={{ p: 1.5 }}>
              <FormControl size="sm">
                <FormLabel>Match</FormLabel>
                <RadioGroup
                  orientation="horizontal"
                  value={values.matcher || "AND"}
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
            <Button
              variant="outlined"
              size="sm"
              sx={{
                color: "#3366a3",
                borderColor: "#3366a3",
                backgroundColor: "transparent",
                "--Button-hoverBg": "#e0e0e0",
                "--Button-hoverBorderColor": "#3366a3",
                "&:hover": {
                  color: "#3366a3",
                },
                height: "8px",
              }}
              onClick={resetAll}
            >
              Reset
            </Button>
            <Button
              variant="solid"
              size="sm"
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#285680",
                },
                height: "8px",
              }}
              onClick={() => onApply && onApply(values, { appliedCount })}
            >
              Find
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </>
  );
}

Filter.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        "text",
        "number",
        "select",
        "multiselect",
        "checkbox",
        "date",
        "daterange",
        "tags",
      ]).isRequired,
      operator: PropTypes.string,
      operators: PropTypes.array,
      options: PropTypes.array,
      getOptions: PropTypes.func,
      startOpen: PropTypes.bool,
      placeholder: PropTypes.string,
      checkboxLabel: PropTypes.string,
    })
  ).isRequired,
  initialValues: PropTypes.object,
  onApply: PropTypes.func,
  onReset: PropTypes.func,
  title: PropTypes.string,
};

export function buildQueryParams(
  values = {},
  { dateKeys = [], arrayKeys = [] } = {}
) {
  const params = new URLSearchParams();
  const matcher = values?.matcher === "OR" ? "OR" : "AND";
  params.set("matcher", matcher);

  Object.entries(values || {}).forEach(([key, val]) => {
    if (key === "matcher") return;
    if (val === undefined || val === null) return;
    if (Array.isArray(val) && val.length === 0) return;

    const op = values[`${key}__op`];

    if (dateKeys.includes(key) && typeof val === "object" && val) {
      if (val.from) params.set(`${key}[from]`, val.from);
      if (val.to) params.set(`${key}[to]`, val.to);
      if (op) params.set(`${key}[op]`, op);
      return;
    }

    if (arrayKeys.includes(key) && Array.isArray(val)) {
      val.forEach((v) => params.append(`${key}[]`, v));
      if (op) params.set(`${key}[op]`, op);
      return;
    }

    params.set(
      key,
      typeof val === "object" ? JSON.stringify(val) : String(val)
    );
    if (op) params.set(`${key}[op]`, op);
  });

  return params.toString();
}

