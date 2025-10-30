import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Grid,
  Input,
  Option,
  Select,
  Sheet,
  Switch,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Img1 from "../../../assets/HandOverSheet_Icon.jpeg";
import {
  useGetHandOverByIdQuery,
  useUpdateHandOverMutation,
} from "../../../redux/camsSlice";
import {
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
} from "../../../redux/leadsSlice";

const OpsHandoverSheetForm = ({ onBack }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [showVillage, setShowVillage] = useState(false);

  // --- Attachments state (existing docs + new local picks) ---
  const [existingDocs, setExistingDocs] = useState([]); // [{ filename, fileurl }]
  // attachments now holds objects: { file: File, filename: string }
  const [attachments, setAttachments] = useState([]);
  const strictOnce = useRef(false); // avoid double-run in React 18 dev

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];
  const BillingTypes = ["Composite", "Individual"];
  const landTypes = ["Leased", "Owned"];

  const [formData, setFormData] = useState({
    _id: "",
    customer_details: {
      name: "",
      code: "",
      customer: "",
      epc_developer: "",
      site_address: { village_name: "", district_name: "" },
      number: "",
      p_group: "",
      state: "",
      alt_number: "",
    },
    order_details: { type_business: "" },
    project_detail: {
      project_type: "",
      module_type: "",
      module_category: "",
      evacuation_voltage: "",
      work_by_slnko: "",
      liaisoning_net_metering: "",
      ceig_ceg: "",
      proposed_dc_capacity: "",
      distance: "",
      overloading: "",
      project_kwp: "",
      project_component: "",
      tarrif: "",
      project_component_other: "",
      transmission_scope: "",
      loan_scope: "",
      ppa_expiry_date: "",
      bd_commitment_date: "",
    },
    commercial_details: { type: "" },
    other_details: {
      cam_member_name: "",
      service: "",
      slnko_basic: "",
      total_gst: "",
      billing_type: "",
      billing_by: "",
      project_status: "incomplete",
      remark: "",
      remarks_for_slnko: "",
    },
    status_of_handoversheet: "draft",
  });

  const { data: getModuleMaster = [] } = useGetModuleMasterQuery();
  const ModuleMaster = useMemo(
    () => getModuleMaster?.data ?? [],
    [getModuleMaster?.data]
  );

  const { data: getMasterInverter = [] } = useGetMasterInverterQuery();
  const MasterInverter = useMemo(
    () => getMasterInverter?.data ?? [],
    [getMasterInverter?.data]
  );

  const handleExpand = (panel) =>
    setExpanded(expanded === panel ? null : panel);

  const handleAutocompleteChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const handoverSchema = Yup.object().shape({
    customer_details: Yup.object().shape({
      code: Yup.string().required("Project ID is required"),
    }),
    project_detail: Yup.object().shape({
      tarrif: Yup.string().required("Tariff rate is required"),
    }),
    other_details: Yup.object().shape({
      billing_type: Yup.string().required("Billing type is required"),
    }),
  });

  const LeadId = sessionStorage.getItem("approvalInfo");
  const {
    data: getHandOverSheet,
    isLoading,
    isError,
    error,
  } = useGetHandOverByIdQuery({ leadId: LeadId }, { skip: !LeadId });

  // ——— hydrate form + documents
  useEffect(() => {
    if (!getHandOverSheet?.data) return;

    // set form
    setFormData((prev) => ({
      ...prev,
      ...getHandOverSheet.data,
      customer_details: {
        ...(prev.customer_details || {}),
        ...(getHandOverSheet.data.customer_details || {}),
      },
      order_details: {
        ...(prev.order_details || {}),
        ...(getHandOverSheet.data.order_details || {}),
      },
      project_detail: {
        ...(prev.project_detail || {}),
        ...(getHandOverSheet.data.project_detail || {}),
      },
      commercial_details: {
        ...(prev.commercial_details || {}),
        ...(getHandOverSheet.data.commercial_details || {}),
      },
      other_details: {
        ...(prev.other_details || {}),
        ...(getHandOverSheet.data.other_details || {}),
      },
    }));

    // set existing docs once (avoid StrictMode double)
    if (!strictOnce.current) {
      strictOnce.current = true;
      const docs = Array.isArray(getHandOverSheet.data.documents)
        ? getHandOverSheet.data.documents.map((d) => ({
            filename: d?.filename || "document",
            fileurl: d?.fileurl || d?.url || "",
          }))
        : [];
      setExistingDocs(docs.filter((d) => d.fileurl));
    }
  }, [getHandOverSheet]);

  const calculateDcCapacity = (ac, overloadingPercent) => {
    const acValue = parseFloat(ac);
    const overloadingValue = parseFloat(overloadingPercent) / 100;
    if (!isNaN(acValue) && !isNaN(overloadingValue)) {
      return Math.round(acValue * (1 + overloadingValue));
    }
    return "";
  };

  const calculateSlnkoBasic = (kwp, slnko_basic) => {
    const kwpValue = parseFloat(kwp);
    const serviceValue = parseFloat(slnko_basic);
    if (!isNaN(kwpValue) && !isNaN(serviceValue)) {
      return (kwpValue * serviceValue * 1000).toFixed(0);
    }
    return "";
  };

  useEffect(() => {
    const serviceAmount = parseFloat(formData?.other_details?.service);
    const billingType = formData?.other_details?.billing_type;

    const updatedDcCapacity = calculateDcCapacity(
      formData.project_detail.project_kwp,
      formData.project_detail.overloading
    );
    const calculated = calculateSlnkoBasic(
      formData.project_detail.project_kwp,
      formData.other_details.slnko_basic
    );
    setFormData((prev) => ({
      ...prev,
      project_detail: {
        ...(prev.project_detail || {}),
        proposed_dc_capacity: updatedDcCapacity,
      },
      other_details: { ...(prev.other_details || {}), service: calculated },
    }));

    if (!isNaN(serviceAmount)) {
      let gstPercentage = 0;
      if (billingType === "Composite") gstPercentage = 13.8;
      else if (billingType === "Individual") gstPercentage = 18;

      if (gstPercentage > 0) {
        const totalGST = (serviceAmount * (1 + gstPercentage / 100)).toFixed(0);
        setFormData((prev) => ({
          ...prev,
          other_details: { ...(prev.other_details || {}), total_gst: totalGST },
        }));
      }
    }
  }, [
    formData.project_detail.project_kwp,
    formData.project_detail.overloading,
    formData.other_details.slnko_basic,
    formData?.other_details?.billing_type,
    formData?.other_details?.service,
  ]);

  const [updateHandOver, { isLoading: isUpdating }] =
    useUpdateHandOverMutation();

  // file picker -> store as { file, filename }
  const onPickFiles = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const MAX = 15 * 1024 * 1024;
    const accepted = files.filter((f) => f.size <= MAX);
    const rejected = files.filter((f) => f.size > MAX);
    if (rejected.length) {
      toast.warn(`Skipped (>15MB): ${rejected.map((f) => f.name).join(", ")}`);
    }

    setAttachments((prev) => {
      const seen = new Set(prev.map((o) => `${o.file.name}|${o.file.size}`));
      const add = [];
      for (const f of accepted) {
        const key = `${f.name}|${f.size}`;
        if (!seen.has(key)) {
          // default filename (editable): without extension by default
          const base = f.name.replace(/\.[^.]+$/, "");
          add.push({ file: f, filename: base });
        }
      }
      return add.length ? [...prev, ...add] : prev;
    });

    e.currentTarget.value = "";
  };

  const updatePickedFilename = (idx, name) => {
    setAttachments((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, filename: name } : o))
    );
  };

  const removePicked = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    try {
      if (!LeadId) {
        toast.error("Invalid or missing ID!");
        return;
      }
      if (formData.status_of_handoversheet !== "draft") {
        toast.error("This handover sheet cannot be edited.");
        return;
      }
      await handoverSchema.validate(formData, { abortEarly: false });

      const updatedFormData = {
        _id: formData._id,
        customer_details: { ...formData.customer_details },
        order_details: { ...formData.order_details },
        project_detail: {
          ...formData.project_detail,
          land: JSON.stringify(formData.project_detail?.land),
        },
        commercial_details: { ...formData.commercial_details },
        other_details: { ...formData.other_details },
        status_of_handoversheet: "submitted",
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(updatedFormData));

      attachments.forEach(({ file, filename }) => {
        fd.append("files", file);
        fd.append("names", (filename || "").trim());
      });

      await updateHandOver({ _id: formData._id, formData: fd }).unwrap();

      toast.success("HandOver Sheet updated and submitted successfully");
      navigate("/cam_dash");
    } catch (err) {
      if (err?.name === "ValidationError") {
        err.inner.forEach((e) => toast.error(e.message));
      } else {
        const errorMessage =
          err?.data?.message || err?.message || "Submission failed";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 850,
        margin: "auto",
        padding: 4,
        borderRadius: "md",
        boxShadow: "lg",
        backgroundColor: "#fff",
      }}
    >
      {/* Icon */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <img src={Img1} alt="Handover Icon" style={{ width: 65, height: 65 }} />
      </div>

      {/* Title */}
      <Typography
        level="h3"
        gutterBottom
        sx={{ textAlign: "center", mb: 5, fontWeight: "bold" }}
      >
        Handover Sheet
      </Typography>

      {/* -------- Internal Ops -------- */}
      <Accordion
        expanded={expanded === "ops"}
        onChange={() => handleExpand("ops")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
          <Typography>Internal Ops</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            sm={{ display: "flex", justifyContent: "center" }}
            container
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Project ID <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                required
                fullWidth
                placeholder="Project ID"
                value={formData.customer_details.code}
                onChange={(e) =>
                  handleChange("customer_details", "code", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Tariff Rate<span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.tarrif}
                placeholder="Tariff Rate"
                required
                onChange={(e) =>
                  handleChange("project_detail", "tarrif", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Billing Type
              </Typography>
              <Autocomplete
                options={BillingTypes}
                value={formData?.other_details?.billing_type || null}
                onChange={(e, value) =>
                  handleAutocompleteChange(
                    "other_details",
                    "billing_type",
                    value
                  )
                }
                getOptionLabel={(option) => option || ""}
                isOptionEqualToValue={(option, value) => option === value}
                placeholder="Billing Type"
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Billing By
              </Typography>
              <Select
                fullWidth
                placeholder="Select Billing"
                value={formData.other_details?.billing_by || ""}
                onChange={(e, newValue) =>
                  handleChange("other_details", "billing_by", newValue)
                }
              >
                <Option value="Jharkhand">Slnko Energy Jharkhand</Option>
                <Option value="UP">Slnko Energy UP</Option>
                <Option value="Infra-UP">Slnko Infra UP</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6} mb={1.5}>
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                {formData?.other_details?.billing_type === "Composite"
                  ? "Total Slnko Service Charge(with GST)"
                  : formData?.other_details?.billing_type === "Individual"
                  ? "Total Slnko Service Charge(with GST)"
                  : "Total Slnko Service Charge(with GST)"}
              </Typography>
              <Input
                fullWidth
                value={formData?.other_details?.total_gst || ""}
                readOnly
                placeholder="Calculated Total GST"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* -------- BD -------- */}
      <Accordion
        expanded={expanded === "bd"}
        onChange={() => handleExpand("bd")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
          <Typography>BD</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            sm={{ display: "flex", justifyContent: "center" }}
            container
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Contact Person <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                required
                fullWidth
                placeholder="Enter Contact Person Name"
                value={formData.customer_details.customer}
                onChange={(e) =>
                  handleChange("customer_details", "customer", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Project Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                required
                fullWidth
                placeholder="Project Name"
                value={formData.customer_details.name}
                onChange={(e) =>
                  handleChange("customer_details", "name", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Group Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                required
                fullWidth
                placeholder="NA, if not available..."
                value={formData.customer_details.p_group}
                onChange={(e) =>
                  handleChange("customer_details", "p_group", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                State <span style={{ color: "red" }}>*</span>
              </Typography>
              <Autocomplete
                options={states}
                value={formData.customer_details.state || null}
                onChange={(e, value) =>
                  handleAutocompleteChange("customer_details", "state", value)
                }
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                placeholder="State"
                required
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                EPC/Developer <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                required
                fullWidth
                placeholder="Select EPC or Developer"
                value={formData.customer_details.epc_developer || ""}
                onChange={(_, newValue) =>
                  handleChange("customer_details", "epc_developer", newValue)
                }
                sx={{
                  fontSize: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "md",
                }}
              >
                <Option value="EPC">EPC</Option>
                <Option value="Developer">Developer</Option>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                Site/Delivery Address with Pin Code{" "}
                <span style={{ color: "red" }}>*</span>
                <Tooltip title="Enable to enter village name" placement="top">
                  <Switch
                    checked={showVillage}
                    onChange={(e) => setShowVillage(e.target.checked)}
                    sx={{ ml: 2 }}
                    size="sm"
                  />
                </Tooltip>
              </Typography>

              <Textarea
                fullWidth
                placeholder="e.g. Varanasi 221001"
                value={formData.customer_details.site_address.district_name}
                onChange={(e) => {
                  const newDistrict = e.target.value;
                  handleChange("customer_details", "site_address", {
                    ...(formData.customer_details.site_address || {}),
                    district_name: newDistrict,
                  });
                }}
              />
            </Grid>

            {showVillage && (
              <Grid item xs={12} sm={6}>
                <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Village Name
                </Typography>
                <Textarea
                  fullWidth
                  placeholder="e.g. Chakia"
                  value={formData.customer_details.site_address.village_name}
                  onChange={(e) => {
                    handleChange("customer_details", "site_address", {
                      ...(formData.customer_details.site_address || {}),
                      village_name: e.target.value,
                    });
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Contact No. <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                required
                fullWidth
                placeholder="Contact No."
                value={formData.customer_details.number}
                onChange={(e) =>
                  handleChange("customer_details", "number", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Alt Contact No.
              </Typography>
              <Input
                fullWidth
                placeholder="Alternate Contact No."
                value={formData.customer_details.alt_number}
                onChange={(e) =>
                  handleChange("customer_details", "alt_number", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Type of Business <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                required
                fullWidth
                placeholder="Select Type of Business"
                value={formData.order_details.type_business || ""}
                onChange={(e, newValue) =>
                  handleChange("order_details", "type_business", newValue)
                }
                sx={{
                  fontSize: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "md",
                }}
              >
                <Option value="Kusum">KUSUM</Option>
                <Option value="Government">Government</Option>
                <Option value="Prebid">Prebid</Option>
                <Option value="Others">Others</Option>
              </Select>
            </Grid>

            {formData.order_details.type_business === "Kusum" && (
              <Grid item xs={12} sm={6}>
                <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Project Component<span style={{ color: "red" }}>*</span>
                </Typography>

                <Select
                  fullWidth
                  placeholder="Project Component"
                  value={formData.project_detail?.project_component || ""}
                  onChange={(_, newValue) => {
                    handleChange(
                      "project_detail",
                      "project_component",
                      newValue
                    );
                    if (newValue !== "Other") {
                      handleChange(
                        "project_detail",
                        "project_component_other",
                        ""
                      );
                    }
                  }}
                >
                  <Option value="KA">Kusum A</Option>
                  <Option value="KC">Kusum C</Option>
                  <Option value="KC2">Kusum C2</Option>
                  <Option value="Other">Other</Option>
                </Select>

                {formData.project_detail?.project_component === "Other" && (
                  <Input
                    fullWidth
                    placeholder="Enter other project component"
                    value={
                      formData.project_detail?.project_component_other || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        "project_detail",
                        "project_component_other",
                        e.target.value
                      )
                    }
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Type<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Type"
                value={formData.commercial_details?.type || ""}
                onChange={(e, newValue) =>
                  handleChange("commercial_details", "type", newValue)
                }
                sx={{
                  fontSize: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "md",
                }}
              >
                <Option value="CapEx">CapEx</Option>
                <Option value="Resco">Resco</Option>
                <Option value="OpEx">OpEx</Option>
                <Option value="Retainership">Retainership</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Project Type<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Project Type"
                value={formData.project_detail?.project_type || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "project_type", newValue)
                }
              >
                <Option value="On-Grid">On-Grid</Option>
                <Option value="Off-Grid">Off-Grid</Option>
                <Option value="Hybrid">Hybrid</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Proposed AC Capacity (kW)<span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.project_kwp}
                placeholder="Proposed AC Capacity (kWp)"
                onChange={(e) =>
                  handleChange("project_detail", "project_kwp", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                DC Overloading (%)<span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.overloading}
                placeholder="Overloading (%)"
                onChange={(e) =>
                  handleChange("project_detail", "overloading", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Proposed DC Capacity (kWp)
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.proposed_dc_capacity}
                placeholder="Proposed DC Capacity (kWp)"
                readOnly
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Work By Slnko<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Work By Slnko"
                value={formData.project_detail?.work_by_slnko || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "work_by_slnko", newValue)
                }
              >
                <Option value="Eng">Eng</Option>
                <Option value="EP">EP</Option>
                <Option value="PMC">PMC</Option>
                <Option value="EPMC">EPCM</Option>
                <Option value="All">All</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Solar Module Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Module Scope"
                value={formData.project_detail?.module_make_capacity || ""}
                onChange={(e, newValue) =>
                  handleChange(
                    "project_detail",
                    "module_make_capacity",
                    newValue
                  )
                }
              >
                <Option value="Slnko">Slnko</Option>
                <Option value="Client">Client</Option>
                <Option value="TBD">TBD</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1">
                Module Type<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                value={formData?.project_detail?.module_type || ""}
                onChange={(_, newValue) =>
                  handleChange("project_detail", "module_type", newValue)
                }
              >
                <Option value="P-TYPE">P-TYPE</Option>
                <Option value="N-TYPE">N-TYPE</Option>
                <Option value="Thin-film">Thin-film</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Liaisoning for Net-Metering
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Liaisoning for Net-Metering"
                value={formData.project_detail?.liaisoning_net_metering || ""}
                onChange={(e, newValue) =>
                  handleChange(
                    "project_detail",
                    "liaisoning_net_metering",
                    newValue
                  )
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                CEIG/CEG Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="CEIG/CEG Scope"
                value={formData.project_detail?.ceig_ceg || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "ceig_ceg", newValue)
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Transmission Line Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select"
                value={formData.project_detail?.transmission_scope || ""}
                onChange={(_, newValue) =>
                  handleChange("project_detail", "transmission_scope", newValue)
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Transmission Line Length (KM)
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.distance}
                placeholder="Transmission Line"
                onChange={(e) =>
                  handleChange("project_detail", "distance", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Evacuation Voltage<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Evacuation Voltage"
                value={formData.project_detail?.evacuation_voltage || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "evacuation_voltage", newValue)
                }
              >
                <Option value="11 KV">11 KV</Option>
                <Option value="33 KV">33 KV</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Loan Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Scope"
                value={formData.project_detail?.loan_scope || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "loan_scope", newValue)
                }
              >
                <Option value="Slnko">Slnko</Option>
                <Option value="Client">Client</Option>
                <Option value="TBD">TBD</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Module Content Category<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                value={formData?.project_detail?.module_category || ""}
                onChange={(_, newValue) =>
                  handleChange("project_detail", "module_category", newValue)
                }
              >
                <Option value="DCR">DCR</Option>
                <Option value="Non DCR">Non DCR</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Slnko Service Charges (Without GST)/W{" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.other_details.slnko_basic}
                placeholder="Slnko Service Charges (Without GST)/Wp"
                onChange={(e) =>
                  handleChange("other_details", "slnko_basic", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                PPA Expiry Date<span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={(() => {
                  const val = formData.project_detail.ppa_expiry_date;
                  if (!val) return "";
                  const d = new Date(val);
                  if (isNaN(d)) return val;
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${day}-${month}-${year}`;
                })()}
                placeholder="PPA Expiry Date"
                readOnly
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                BD Commitment Date<span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={(() => {
                  const val = formData.project_detail.bd_commitment_date;
                  if (!val) return "";
                  const d = new Date(val);
                  if (isNaN(d)) return val;
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${day}-${month}-${year}`;
                })()}
                placeholder="BD Commitment Date"
                readOnly
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                Slnko Service Charges (Without GST)/MWp{" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.other_details.service}
                placeholder="Slnko Service Charge"
                readOnly
              />
            </Grid>

            <Grid xs={12}>
              <Grid item xs={12} sm={6} mt={1}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Remarks for Slnko Service Charge{" "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <Textarea
                  value={formData.other_details.remarks_for_slnko || ""}
                  placeholder="Enter Remarks for Slnko Service Charge"
                  onChange={(e) =>
                    handleChange(
                      "other_details",
                      "remarks_for_slnko",
                      e.target.value
                    )
                  }
                  minRows={2}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} mb={1.5}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Remarks (Any Other Commitments to Client){" "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <Textarea
                  value={formData.other_details.remark || ""}
                  placeholder="Enter Remarks"
                  onChange={(e) =>
                    handleChange("other_details", "remark", e.target.value)
                  }
                  minRows={2}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* -------- Attachments -------- */}
      <Accordion
        expanded={expanded === "attachments"}
        onChange={() => handleExpand("attachments")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
          <Typography>Attachments</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Existing Documents
              </Typography>

              {existingDocs.length === 0 ? (
                <Typography level="body2" sx={{ color: "text.secondary" }}>
                  No attachments found.
                </Typography>
              ) : (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  {existingDocs.map((doc, idx) => (
                    <div
                      key={`${doc.fileurl}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 14,
                        padding: "6px 0",
                        borderBottom:
                          idx === existingDocs.length - 1
                            ? "none"
                            : "1px dashed #eee",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {doc.filename}
                      </span>
                      <a
                        href={doc.fileurl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#1f487c",
                          textDecoration: "underline",
                          marginLeft: 12,
                        }}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Grid>

            <Grid item xs={12} mt={1}>
              <Typography level="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Add More Files (optional)
              </Typography>
              <Input
                type="file"
                multiple
                onChange={onPickFiles}
                slotProps={{
                  input: {
                    accept:
                      ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt",
                  },
                }}
              />

              {attachments.length > 0 && (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 10,
                  }}
                >
                  <Typography level="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                    Selected Files ({attachments.length})
                  </Typography>

                  {attachments.map((o, idx) => (
                    <div
                      key={`${o.file.name}-${o.file.size}-${idx}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom:
                          idx === attachments.length - 1
                            ? "none"
                            : "1px dashed #eee",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, marginBottom: 6 }}>
                          <strong>Original:</strong>{" "}
                          <span style={{ wordBreak: "break-all" }}>
                            {o.file.name}
                          </span>{" "}
                          <span style={{ color: "#6b7280" }}>
                            ({(o.file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>

                        {/* Editable filename to save in DB */}
                        <Typography level="body2" sx={{ mb: 0.5 }}>
                          File name to save in DB
                        </Typography>
                        <Input
                          placeholder="e.g. PPA_Agreement_V1"
                          value={o.filename}
                          onChange={(e) =>
                            updatePickedFilename(idx, e.target.value)
                          }
                          sx={{ maxWidth: 480 }}
                        />
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <Button
                          size="sm"
                          variant="outlined"
                          color="neutral"
                          onClick={() => removePicked(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Typography
                level="body3"
                sx={{ color: "text.tertiary", mt: 0.5 }}
              >
                Max 15MB per file. 
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Buttons */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}></Grid>
        <Grid item xs={6}>
          <Button
            onClick={handleSubmit}
            variant="solid"
            sx={{
              backgroundColor: "#3366a3",
              color: "#fff",
              "&:hover": { backgroundColor: "#285680" },
              height: "8px",
              p: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            disabled={isLoading}
            fullWidth
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Sheet>
  );
};

// shared styles for accordion summary headers
const summarySx = {
  color: "white",
  fontWeight: "bold",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  py: 1.5,
  px: 2,
  "& .MuiTypography-root": { fontWeight: "bold", fontSize: "1.3rem" },
  "& .MuiAccordionSummary-expandIconWrapper": { color: "white" },
  backgroundColor: "#e0e0e0",
  padding: 1.5,
  marginBottom: "1.5rem",
};

export default OpsHandoverSheetForm;
