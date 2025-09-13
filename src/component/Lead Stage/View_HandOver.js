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
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Img1 from "../../assets/HandOverSheet_Icon.jpeg";
import { useGetHandOverByIdQuery } from "../../redux/camsSlice";
import {
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
} from "../../redux/leadsSlice";

const ViewHandoverSheetForm = ({ onBack, projectId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(null);

  console.log("selected",projectId)

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
  const [showVillage, setShowVillage] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customer_details: {
      code: "",
      name: "",
      customer: "",
      epc_developer: "",

      site_address: {
        village_name: "",
        district_name: "",
      },

      number: "",
      email: "",
      p_group: "",
      pan_no: "",
      adharNumber_of_loa_holder: "",
      state: "",
      alt_number: "",
    },

    order_details: {
      type_business: "",
      tender_name: "",
      discom_name: "",
      design_date: "",
      feeder_code: "",
      feeder_name: "",
    },

    project_detail: {
      project_type: "",
      module_make_capacity: "",
      module_make: "",
      module_make_other: "",
      module_capacity: "",
      module_type: "",
      module_category: "",
      evacuation_voltage: "",
      inverter_make_capacity: "",
      inverter_make: "",
      inverter_make_other: "",
      inverter_type: "",
      inverter_type_other: "",
      work_by_slnko: "",
      topography_survey: "",

      purchase_supply_net_meter: "",
      liaisoning_net_metering: "",
      ceig_ceg: "",
      project_completion_date: "",
      proposed_dc_capacity: "",
      distance: "",
      tarrif: "",
      // substation_name: "",
      overloading: "",
      project_kwp: "",
      land: { type: "", acres: "" },
      agreement_date: "",
      project_component: "",
      project_component_other: "",
      transmission_scope: "",
      loan_scope: "",
    },

    commercial_details: {
      type: "",
    },

    other_details: {
      cam_member_name: "",
      service: "",
      slnko_basic: "",
      total_gst: "",
      billing_type: "",
      billing_by: "",
      project_status: "incomplete",
      loa_number: "",
      ppa_number: "",
      remark: "",
      submitted_by_BD: "",
    },
    invoice_detail: {
      invoice_recipient: "",
      invoicing_GST_no: "",
      invoicing_GST_status: "",
      invoicing_address: "",

      msme_reg: "",
    },
    submitted_by: "",
    status_of_handoversheet: "submitted",
    is_locked: "locked",
  });

  const [moduleMakeOptions, setModuleMakeOptions] = useState([]);
  const [moduleTypeOptions, setModuleTypeOptions] = useState([]);
  const [moduleModelOptions, setModuleModelOptions] = useState([]);
  const [moduleCapacityOptions, setModuleCapacityOptions] = useState([]);
  const [inverterMakeOptions, setInverterMakeOptions] = useState([]);
  const [inverterSizeOptions, setInverterSizeOptions] = useState([]);
  const [inverterModelOptions, setInverterModelOptions] = useState([]);
  const [inverterTypeOptions, setInverterTypeOptions] = useState([]);
  // const [handoverId, setHandoverId] = useState(null);
  const handlePrint = () => {
    window.print();
  };
  const [user, setUser] = useState(null);

  const { data: getModuleMaster = [] } = useGetModuleMasterQuery();
  const ModuleMaster = useMemo(
    () => getModuleMaster?.data ?? [],
    [getModuleMaster?.data]
  );

  console.log(ModuleMaster);

  const { data: getMasterInverter = [] } = useGetMasterInverterQuery();
  const MasterInverter = useMemo(
    () => getMasterInverter?.data ?? [],
    [getMasterInverter?.data]
  );

  console.log(MasterInverter);

  useEffect(() => {
    if (ModuleMaster.length > 0) {
      setModuleMakeOptions([
        ...new Set(ModuleMaster.map((item) => item.make).filter(Boolean)),
      ]);
      setModuleTypeOptions([
        ...new Set(ModuleMaster.map((item) => item.Type).filter(Boolean)),
      ]);
      setModuleModelOptions([
        ...new Set(ModuleMaster.map((item) => item.model).filter(Boolean)),
      ]);
      setModuleCapacityOptions([
        ...new Set(ModuleMaster.map((item) => item.power).filter(Boolean)),
      ]);
    }

    if (MasterInverter.length > 0) {
      setInverterMakeOptions([
        ...new Set(
          MasterInverter.map((item) => item.inveter_make).filter(Boolean)
        ),
      ]);
      setInverterSizeOptions([
        ...new Set(
          MasterInverter.map((item) => item.inveter_size).filter(Boolean)
        ),
      ]);
      setInverterModelOptions([
        ...new Set(
          MasterInverter.map((item) => item.inveter_model).filter(Boolean)
        ),
      ]);
      setInverterTypeOptions([
        ...new Set(
          MasterInverter.map((item) => item.inveter_type).filter(Boolean)
        ),
      ]);
    }
  }, [ModuleMaster, MasterInverter]);

  const handleExpand = (panel) => {
    setExpanded(expanded === panel ? null : panel);
  };

  const handleAutocompleteChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    const userData = getUserData();
    if (userData && userData.name) {
      setFormData((prev) => ({
        ...prev,
        other_details: {
          ...prev.other_details,
          submitted_by_BD: userData.name,
        },
        submitted_by: userData.name,
      }));
    }
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    return userData ? JSON.parse(userData) : null;
  };
  const LeadId = sessionStorage.getItem("view handover");
  console.log("LeadId:", LeadId);

  const p_id = projectId || searchParams.get("p_id");
  // console.log(routes);

  const queryParams = p_id ? { p_id } : { leadId: LeadId };

  const {
    data: handoverData,
    isLoading,
    isError,
    error,
  } = useGetHandOverByIdQuery(queryParams, {
    skip: !p_id && !LeadId,
  });

  const handover = Array.isArray(handoverData?.data)
    ? handoverData.data.find((item) => item.leadId === LeadId)
    : handoverData?.data || null;

  // console.log("handoverData:", handover);

  useEffect(() => {
    if (!handover) {
      console.warn("No matching handover data found.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      id: LeadId,
      p_id: handover?.p_id || "",
      customer_details: {
        ...prev.customer_details,
        code: handover?.customer_details?.code || "",
        name: handover?.customer_details?.name || "",
        customer: handover?.customer_details?.customer || "",
        epc_developer: handover?.customer_details?.epc_developer || "",
        // billing_address: handover?.customer_details?.billing_address || {
        //   village_name: "",
        //   district_name: "",
        // },
        site_address: handover?.customer_details?.site_address || {
          village_name: "",
          district_name: "",
        },
        site_google_coordinates:
          handover?.customer_details?.site_google_coordinates || "",
        number: handover?.customer_details?.number || "",
        // gst_no: handover?.customer_details?.gst_no || "",
        gender_of_Loa_holder:
          handover?.customer_details?.gender_of_Loa_holder || "",
        email: handover?.customer_details?.email || "",
        p_group: handover?.customer_details?.p_group || "",
        pan_no: handover?.customer_details?.pan_no || "",
        adharNumber_of_loa_holder:
          handover?.customer_details?.adharNumber_of_loa_holder || "",
        state: handover?.customer_details?.state || "",
        alt_number: handover?.customer_details?.alt_number || "",
      },
      order_details: {
        ...prev.order_details,
        type_business: handover?.order_details?.type_business || "",
        tender_name: handover?.order_details?.tender_name || "",
        discom_name: handover?.order_details?.discom_name || "",
        design_date: handover?.order_details?.design_date || "",
        feeder_code: handover?.order_details?.feeder_code || "",
        feeder_name: handover?.order_details?.feeder_name || "",
      },
      project_detail: {
        ...prev.project_detail,
        project_type: handover?.project_detail?.project_type || "",
        module_make_capacity:
          handover?.project_detail?.module_make_capacity || "",
        module_make: handover?.project_detail?.module_make || "",
        module_make_other: handover?.project_detail?.module_make_other || "",
        module_capacity: handover?.project_detail?.module_capacity || "",
        module_type: handover?.project_detail?.module_type || "",
        module_category: handover?.project_detail?.module_category || "",
        evacuation_voltage: handover?.project_detail?.evacuation_voltage || "",
        inverter_make_capacity:
          handover?.project_detail?.inverter_make_capacity || "",
        inverter_make: handover?.project_detail?.inverter_make || "",
        inverter_make_other:
          handover?.project_detail?.inverter_make_other || "",
        inverter_type: handover?.project_detail?.inverter_type || "",
        inverter_type_other:
          handover?.project_detail?.inverter_type_other || "",
        work_by_slnko: handover?.project_detail?.work_by_slnko || "",
        topography_survey: handover?.project_detail?.topography_survey || "",
        soil_test: handover?.project_detail?.soil_test || "",
        purchase_supply_net_meter:
          handover?.project_detail?.purchase_supply_net_meter || "",
        liaisoning_net_metering:
          handover?.project_detail?.liaisoning_net_metering || "",
        ceig_ceg: handover?.project_detail?.ceig_ceg || "",
        project_completion_date:
          handover?.project_detail?.project_completion_date || "",
        proposed_dc_capacity:
          handover?.project_detail?.proposed_dc_capacity || "",
        distance: handover?.project_detail?.distance || "",
        tarrif: handover?.project_detail?.tarrif || "",
        substation_name: handover?.project_detail?.substation_name || "",
        overloading: handover?.project_detail?.overloading || "",
        project_kwp: handover?.project_detail?.project_kwp || "",
        land:
          typeof handover?.project_detail?.land === "string"
            ? JSON.parse(handover.project_detail.land)
            : handover?.project_detail?.land || { type: "", acres: "" },
        agreement_date: handover?.project_detail?.agreement_date || "",
        project_component: handover?.project_detail?.project_component || "",
        project_component_other:
          handover?.project_detail?.project_component_other || "",
        transmission_scope: handover?.project_detail?.transmission_scope || "",
        loan_scope: handover?.project_detail?.loan_scope || "",
      },
      commercial_details: {
        ...prev.commercial_details,
        type: handover?.commercial_details?.type || "",
        subsidy_amount: handover?.commercial_details?.subsidy_amount || "",
      },
      other_details: {
        ...prev.other_details,
        taken_over_by: handover?.other_details?.taken_over_by || "",
        cam_member_name: handover?.other_details?.cam_member_name || "",
        service: handover?.other_details?.service || "",
        total_gst: handover?.other_details?.total_gst || "",
        slnko_basic: handover?.other_details?.slnko_basic || "",
        billing_type: handover?.other_details?.billing_type || "",
        billing_by: handover?.other_details?.billing_by || "",
        project_status: handover?.other_details?.project_status || "incomplete",
        loa_number: handover?.other_details?.loa_number || "",
        ppa_number: handover?.other_details?.ppa_number || "",
        remark: handover?.other_details?.remark || "",
        remarks_for_slnko: handover?.other_details?.remarks_for_slnko || "",
        submitted_by_BD: handover?.other_details?.submitted_by_BD || "",
      },
      invoice_detail: {
        ...prev.invoice_detail,
        invoice_recipient: handover?.invoice_detail?.invoice_recipient || "",
        invoicing_GST_no: handover?.invoice_detail?.invoicing_GST_no || "",
        invoicing_GST_status:
          handover?.invoice_detail?.invoicing_GST_status || "",
        invoicing_address: handover?.invoice_detail?.invoicing_address || "",

        msme_reg: handover?.invoice_detail?.msme_reg || "",
      },
      submitted_by: handover?.submitted_by || "-",
      status_of_handoversheet: handover?.status_of_handoversheet,
      is_locked: handover?.is_locked,
    }));
  }, [handover]);

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 850,
        marginLeft: {lg:"28%"},
        padding: 4,
        borderRadius: "md",
        boxShadow: "lg",
        backgroundColor: "#F8F5F5",
      }}
    >
      {/* Icon with Spacing */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <img src={Img1} alt="Handover Icon" style={{ width: 65, height: 65 }} />
      </div>

      {/* Form Title */}
      <Typography
        level="h3"
        gutterBottom
        sx={{ textAlign: "center", marginBottom: 5, fontWeight: "bold" }}
      >
        Handover Sheet
      </Typography>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "#e0e0e0",
            padding: 1.5,
            marginBottom: "1.5rem",
          }}
        >
          <Typography level="h4">CAM</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            sm={{ display: "flex", justifyContent: "center" }}
            container
            spacing={2}
          >
            {["Ranvijay Singh", "Rishav Mahato", "Dhruv Choudhary"].includes(
              user?.name
            ) && (
              <Grid item xs={12} sm={6}>
                <Typography
                  level="body1"
                  sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                >
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
            )}
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Email id <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                fullWidth
                placeholder="Email"
                value={formData.customer_details.email}
                onChange={(e) =>
                  handleChange("customer_details", "email", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Aadhar Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                fullWidth
                placeholder="Aadhar Number"
                value={formData.customer_details.adharNumber_of_loa_holder}
                onChange={(e) =>
                  handleChange(
                    "customer_details",
                    "adharNumber_of_loa_holder",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                PAN Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                fullWidth
                placeholder="PAN Number"
                value={formData.customer_details.pan_no}
                onChange={(e) =>
                  handleChange("customer_details", "pan_no", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Invoice To
              </Typography>
              <Input
                fullWidth
                placeholder="Invoice To Party Name"
                value={formData.invoice_detail.invoice_recipient}
                onChange={(e) =>
                  handleChange(
                    "invoice_detail",
                    "invoice_recipient",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Invoicing GST No.
              </Typography>
              <Select
                fullWidth
                placeholder="Select option"
                value={formData.invoice_detail?.invoicing_GST_status || ""}
                onChange={(_, newValue) => {
                  handleChange(
                    "invoice_detail",
                    "invoicing_GST_status",
                    newValue
                  );
                  if (newValue !== "Yes") {
                    handleChange("invoice_detail", "invoicing_GST_no", "");
                  }
                }}
              >
                <Option value="To be submitted later">
                  To be submitted later
                </Option>
                <Option value="NA">N/A</Option>
                <Option value="Yes">Yes</Option>
              </Select>

              {formData.invoice_detail?.invoicing_GST_status === "Yes" && (
                <Input
                  fullWidth
                  placeholder="Enter Invoicing GST No."
                  value={formData.invoice_detail?.invoicing_GST_no || ""}
                  onChange={(e) =>
                    handleChange(
                      "invoice_detail",
                      "invoicing_GST_no",
                      e.target.value
                    )
                  }
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Invoicing Address<span style={{ color: "red" }}>*</span>
              </Typography>
              <Textarea
                fullWidth
                placeholder="Invoicing Address"
                value={formData.invoice_detail.invoicing_address}
                onChange={(e) =>
                  handleChange(
                    "invoice_detail",
                    "invoicing_address",
                    e.target.value
                  )
                }
                sx={{
                  minHeight: 80,
                  "@media print": {
                    height: "auto",
                    overflow: "visible",
                    whiteSpace: "pre-wrap",

                    WebkitPrintColorAdjust: "exact",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                MSME Reg No. (if applicable)
              </Typography>
              <Input
                fullWidth
                placeholder="MSME Reg No."
                value={formData.invoice_detail.msme_reg}
                onChange={(e) =>
                  handleChange("invoice_detail", "msme_reg", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                Feeder Code / Substation Code{" "}
              </Typography>
              <Input
                value={formData.order_details.feeder_code}
                onChange={(e) =>
                  handleChange("order_details", "feeder_code", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                Feeder Name / Substation Names{" "}
              </Typography>
              <Input
                value={formData.order_details.feeder_name}
                onChange={(e) =>
                  handleChange("order_details", "feeder_name", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                DISCOM Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <Textarea
                value={formData.order_details.discom_name}
                onChange={(e) =>
                  handleChange("order_details", "discom_name", e.target.value)
                }
                sx={{
                  minHeight: 80,
                  "@media print": {
                    height: "auto",
                    overflow: "visible",
                    whiteSpace: "pre-wrap",

                    WebkitPrintColorAdjust: "exact",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                Preliminary Design Sign-off Date
              </Typography>
              <Input
                type="date"
                value={formData.order_details.design_date}
                onChange={(e) =>
                  handleChange("order_details", "design_date", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Solar Module Scope
              </Typography>
              <Select
                fullWidth
                placeholder="Select Module Scope"
                value={
                  formData["project_detail"]?.["module_make_capacity"] || ""
                }
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
            {["Slnko", "Client"].includes(
              formData?.project_detail?.module_make_capacity
            ) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Module Make</Typography>
                  <Select
                    fullWidth
                    value={formData?.project_detail?.module_make || ""}
                    onChange={(_, newValue) => {
                      handleChange("project_detail", "module_make", newValue);
                      // Clear the "Other" input when a different option is selected
                      if (newValue !== "Other") {
                        handleChange("project_detail", "module_make_other", "");
                      }
                    }}
                  >
                    {moduleMakeOptions.length > 0 &&
                      moduleMakeOptions.map((make, index) => (
                        <Option key={index} value={make}>
                          {make}
                        </Option>
                      ))}
                    <Option value="Other">Other</Option>
                  </Select>

                  {formData?.project_detail?.module_make === "Other" && (
                    <Input
                      fullWidth
                      placeholder="Enter other make"
                      value={formData?.project_detail?.module_make_other || ""}
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "module_make_other",
                          e.target.value
                        )
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Module Capacity</Typography>
                  <Select
                    fullWidth
                    value={formData?.project_detail?.module_capacity || ""}
                    onChange={(_, newValue) =>
                      handleChange(
                        "project_detail",
                        "module_capacity",
                        newValue
                      )
                    }
                  >
                    {moduleCapacityOptions.length > 0 ? (
                      moduleCapacityOptions.map((capacity, index) => (
                        <Option key={index} value={capacity}>
                          {capacity}
                        </Option>
                      ))
                    ) : (
                      <Option disabled>No options available</Option>
                    )}
                    <Option value="TBD">TBD</Option>
                  </Select>
                </Grid>

                {/* Module Model No & Type */}

                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Module Type</Typography>
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
              </>
            )}

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Solar Inverter Scope
              </Typography>
              <Select
                fullWidth
                placeholder="Select Inverter Scope"
                value={
                  formData["project_detail"]?.["inverter_make_capacity"] || ""
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "project_detail",
                    "inverter_make_capacity",
                    newValue
                  )
                }
              >
                <Option value="Slnko">Slnko</Option>
                <Option value="Client">Client</Option>
                <Option value="TBD">TBD</Option>
              </Select>
            </Grid>
            {["Slnko", "Client"].includes(
              formData?.project_detail?.inverter_make_capacity
            ) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Inverter Make</Typography>
                  <Select
                    fullWidth
                    value={formData["project_detail"]?.["inverter_make"] || ""}
                    onChange={(_, newValue) => {
                      handleChange("project_detail", "inverter_make", newValue);
                      if (newValue !== "Other") {
                        handleChange(
                          "project_detail",
                          "inverter_make_other",
                          ""
                        );
                      }
                    }}
                  >
                    {inverterMakeOptions.map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                    <Option value="Other">Other</Option>
                  </Select>

                  {formData["project_detail"]?.["inverter_make"] ===
                    "Other" && (
                    <Input
                      fullWidth
                      placeholder="Enter other inverter make"
                      value={
                        formData["project_detail"]?.["inverter_make_other"] ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "inverter_make_other",
                          e.target.value
                        )
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Inverter Type</Typography>
                  <Select
                    fullWidth
                    value={formData?.project_detail?.inverter_type || ""}
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        handleChange(
                          "project_detail",
                          "inverter_type",
                          newValue
                        );
                      }
                    }}
                  >
                    <Option value="STRING INVERTER">STRING INVERTER</Option>
                    <Option value="Other">Other</Option>
                  </Select>

                  {formData?.project_detail?.inverter_type === "Other" && (
                    <Input
                      placeholder="Enter inverter type"
                      fullWidth
                      value={
                        formData?.project_detail?.inverter_type_other || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "inverter_type_other",
                          e.target.value
                        )
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Site Topography Survey
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Site Topography Survey"
                value={formData["project_detail"]?.["topography_survey"] || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "topography_survey", newValue)
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Purchase & Supply of Net meter
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Purchase & Supply of Net meter"
                value={
                  formData["project_detail"]?.["purchase_supply_net_meter"] ||
                  ""
                }
                onChange={(e, newValue) =>
                  handleChange(
                    "project_detail",
                    "purchase_supply_net_meter",
                    newValue
                  )
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Land Availables
              </Typography>

              <Grid item xs={12} sm={6} md={3}>
                <Input
                  name="acres"
                  type="text"
                  placeholder="e.g. 5, 2, 3"
                  value={formData.project_detail?.land?.acres || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_detail: {
                        ...prev.project_detail,
                        land: {
                          ...prev.project_detail.land,
                          acres: e.target.value,
                        },
                      },
                    }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  options={landTypes}
                  value={
                    landTypes.includes(formData.project_detail?.land?.type)
                      ? formData.project_detail.land.type
                      : null
                  }
                  onChange={(e, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_detail: {
                        ...prev.project_detail,
                        land: {
                          ...prev.project_detail.land,
                          type: value,
                        },
                      },
                    }))
                  }
                  isOptionEqualToValue={(option, value) => option === value}
                  placeholder="Land Type"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Project Completion Date(As per PPA)
              </Typography>
              <Input
                fullWidth
                type="date"
                value={
                  formData["project_detail"]?.["project_completion_date"] || ""
                }
                onChange={(e) =>
                  handleChange(
                    "project_detail",
                    "project_completion_date",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                LOA/PPA Date
              </Typography>
              <Input
                fullWidth
                type="date"
                value={formData["project_detail"]?.["agreement_date"] || ""}
                onChange={(e) =>
                  handleChange(
                    "project_detail",
                    "agreement_date",
                    e.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                CAM Member Name
              </Typography>
              <Input
                value={formData.other_details.cam_member_name}
                placeholder="CAM Member Name"
                onChange={(e) =>
                  handleChange(
                    "other_details",
                    "cam_member_name",
                    e.target.value
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                LOA Number
              </Typography>
              <Input
                value={formData.other_details.loa_number}
                placeholder="LOA Number"
                onChange={(e) =>
                  handleChange("other_details", "loa_number", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                PPA Number
              </Typography>
              <Input
                value={formData.other_details.ppa_number}
                placeholder="PPA Number"
                onChange={(e) =>
                  handleChange("other_details", "ppa_number", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "#e0e0e0",
            padding: 1.5,
            marginBottom: "1.5rem",
            marginTop: "1.0rem",
          }}
        >
          <Typography level="h4">Internal Ops</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Grid
            sm={{ display: "flex", justifyContent: "center" }}
            container
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
            {!["Ranvijay Singh", "Rishav Mahato", "Dhruv Choudhary"].includes(
              user?.name
            ) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Billing Type
                  </Typography>
                  <Autocomplete
                    options={BillingTypes}
                    value={formData?.other_details?.billing_type}
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
                  <Typography
                    level="body1"
                    sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                  >
                    Billing By
                  </Typography>
                  <Select
                    fullWidth
                    placeholder="Select Billing"
                    value={formData["other_details"]?.["billing_by"] || ""}
                    onChange={(e, newValue) =>
                      handleChange("other_details", "billing_by", newValue)
                    }
                  >
                    <Option value="Jharkhand">Slnko Energy Jharkhand</Option>
                    <Option value="UP">Slnko Energy UP</Option>
                    <Option value="Infra-UP">Slnko Infra UP</Option>
                  </Select>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    {formData?.other_details?.billing_type === "Composite"
                      ? "Total Slnko Service Charge(with GST)"
                      : formData?.other_details?.billing_type === "Individual"
                        ? "Total Slnko Service Charge (with GST)"
                        : "Total Slnko Service Charge(with GST)"}
                  </Typography>
                  <Input
                    fullWidth
                    value={formData?.other_details?.total_gst || ""}
                    InputProps={{
                      readOnly: true,
                    }}
                    placeholder="Calculated Total GST"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "#e0e0e0",
            padding: 1.5,
            marginTop: "1.0rem",
            marginBottom: "1.5rem",
          }}
        >
          <Typography level="h4">BD</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            sm={{ display: "flex", justifyContent: "center" }}
            container
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
            {/* <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Site Address with Pin Code{" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Textarea
                required
                fullWidth
                placeholder="e.g. Sunrise Village, 221001"
                value={`${formData?.customer_details?.site_address?.village_name || ""}${
                  formData?.customer_details?.site_address?.district_name
                    ? `, ${formData?.customer_details?.site_address?.district_name}`
                    : ""
                }`}
                onChange={(e) => {
                  const [village, district] = e.target.value
                    .split(",")
                    .map((s) => s.trim());
                  handleChange("customer_details", "site_address", {
                    village_name: village || "",
                    district_name: district || "",
                  });
                }}
              />
            </Grid> */}

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
                    ...formData.customer_details.site_address,
                    district_name: newDistrict,
                  });
                }}
                // minRows={3}
                sx={{
                  minHeight: 80,
                  "@media print": {
                    height: "auto",
                    overflow: "visible",
                    whiteSpace: "pre-wrap",

                    WebkitPrintColorAdjust: "exact",
                  },
                }}
              />
            </Grid>

            {(showVillage ||
              formData.customer_details.site_address.village_name) && (
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
                      ...formData.customer_details.site_address,
                      village_name: e.target.value,
                    });
                  }}
                  // minRows={3}
                  sx={{
                    minHeight: 80,
                    "@media print": {
                      height: "auto",
                      overflow: "visible",
                      whiteSpace: "pre-wrap",

                      WebkitPrintColorAdjust: "exact",
                    },
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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
                <Typography
                  level="body1"
                  sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                >
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Type<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Type"
                value={formData["commercial_details"]?.["type"] || ""}
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Project Type<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Project Type"
                value={formData["project_detail"]?.["project_type"] || ""}
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
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                Proposed DC Capacity (kWp)
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                value={formData.project_detail.proposed_dc_capacity}
                placeholder="Proposed DC Capacity (kWp)"
                readOnly // Make it read-only since it's auto-calculated
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Work By Slnko<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Work By Slnko"
                value={formData["project_detail"]?.["work_by_slnko"] || ""}
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Solar Module Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Module Scope"
                value={
                  formData["project_detail"]?.["module_make_capacity"] || ""
                }
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Liaisoning for Net-Metering
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Liaisoning for Net-Metering"
                value={
                  formData["project_detail"]?.["liaisoning_net_metering"] || ""
                }
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                CEIG/CEG Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="CEIG/CEG Scope"
                value={formData["project_detail"]?.["ceig_ceg"] || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "ceig_ceg", newValue)
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Evacuation Voltage<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Evacuation Voltage"
                value={formData["project_detail"]?.["evacuation_voltage"] || ""}
                onChange={(e, newValue) =>
                  handleChange("project_detail", "evacuation_voltage", newValue)
                }
              >
                <Option value="11 KV">11 KV</Option>
                <Option value="33 KV">33 KV</Option>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
                Loan Scope<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                placeholder="Select Scope"
                value={formData["project_detail"]?.["loan_scope"] || ""}
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
              <Typography
                level="body1"
                sx={{ fontWeight: "bold", marginBottom: 0.5 }}
              >
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

            {!["Ranvijay Singh", "Rishav Mahato", "Dhruv Choudhary"].includes(
              user?.name
            ) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Slnko Service Charges (Without GST)/W{" "}
                    <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Input
                    value={formData.other_details.slnko_basic}
                    placeholder="Slnko Service Charges (Without GST)/Wp"
                    onChange={(e) =>
                      handleChange(
                        "other_details",
                        "slnko_basic",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Slnko Service Charges (Without GST)/MWp{" "}
                    <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Input
                    value={formData.other_details.service}
                    placeholder="Slnko Service Charge"
                    readOnly
                  />
                </Grid>
              </>
            )}
            {!["Ranvijay Singh", "Rishav Mahato", "Dhruv Choudhary"].includes(
              user?.name
            ) && (
              <>
                <Grid item xs={12} sm={12}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
                    multiline
                    minRows={2}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={12} mt={1}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Remarks (Any Other Commitments to Client){" "}
                    <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Textarea
                    value={formData.other_details.remark || ""}
                    placeholder="Enter Remarks"
                    onChange={(e) =>
                      handleChange("other_details", "remark", e.target.value)
                    }
                    multiline
                    minRows={2}
                    fullWidth
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Buttons */}
      <Grid
        container
        spacing={2}
        sx={{ marginTop: 2 }}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Grid
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            variant="solid"
            color="neutral"
            fullWidth
            sx={{
              padding: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default ViewHandoverSheetForm;
