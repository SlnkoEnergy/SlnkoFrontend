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
  Textarea,
  Typography,
} from "@mui/joy";
import React, { useEffect, useMemo, useState } from "react";
import Img1 from "../../assets/HandOverSheet_Icon.jpeg";
import { useGetHandOverQuery } from "../../redux/camsSlice";
import {
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
} from "../../redux/leadsSlice";

const GetHandoverSheetForm = ({ onBack }) => {
  const [expanded, setExpanded] = useState(null);
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
    id: "",
    customer_details: {
      code: "",
      name: "",
      customer: "",
      epc_developer: "",
      billing_address: {
        village_name: "",
        district_name: "",
      },
      site_address: {
        village_name: "",
        district_name: "",
      },
      site_google_coordinates: "",
      number: "",
      // gst_no: "",
      // billing_address: "",
      gender_of_Loa_holder: "",
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
      module_capacity: "",
      module_type: "",
      module_category: "",
      evacuation_voltage: "",
      inverter_make_capacity: "",
      inverter_make: "",
      inverter_type: "",
      // inverter_size: "",
      // inverter_model_no: "",
      work_by_slnko: "",
      topography_survey: "",
      soil_test: "",
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
      project_component_other:"",
      transmission_scope:"",
      loan_scope:"",

    },

    commercial_details: {
      type: "",
      subsidy_amount: "",
    },

    other_details: {
      taken_over_by: "",
      cam_member_name: "",
      service: "",
      slnko_basic: "",
      billing_type: "",
      project_status: "incomplete",
      loa_number: "",
      ppa_number: "",
      remark:"",
      remarks_for_slnko: "",
      submitted_by_BD: "",
    },
    invoice_detail: {
      invoice_recipient: "",
      invoicing_GST_no: "",
      invoicing_address: "",
      delivery_address: "",
      msme_reg:"",
    },
    submitted_by: "",
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

  // useEffect(() => {
  //   const fetchMasterData = async () => {
  //     try {
  //       const response = await axios.get("https://api.slnkoprotrac.com/v1/get-module-master");

  //       // console.log("Module Master Response:", response.data);

  //       // Ensure response.data is an object and contains an array key
  //       const moduleData = Array.isArray(response.data.data) ? response.data.data : [];

  //       // console.log("Extracted Module Master Data:", moduleData);

  //       const Inverterresponse = await axios.get("https://api.slnkoprotrac.com/v1/get-master-inverter");

  //       // console.log("Inverter Master Response:", Inverterresponse.data);

  //       // Ensure response.data is an object and contains an array key
  //       const InverterData = Array.isArray(Inverterresponse.data.data) ? Inverterresponse.data.data : [];

  //       // console.log("Extracted Inverter Master Data:", InverterData);

  //       // Extract unique values for Module
  //       const makeOptions = [...new Set(moduleData.map((item) => item.make).filter(Boolean))];
  //       const typeOptions = [...new Set(moduleData.map((item) => item.type).filter(Boolean))];
  //       const modelOptions = [...new Set(moduleData.map((item) => item.model).filter(Boolean))];
  //       const capacityOptions = [...new Set(moduleData.map((item) => item.power).filter(Boolean))];

  //       setModuleMakeOptions(makeOptions);
  //       setModuleTypeOptions(typeOptions);
  //       setModuleModelOptions(modelOptions);
  //       setModuleCapacityOptions(capacityOptions);

  //       // Extract unique values for Inverter
  //       const inverterMake = [...new Set(InverterData.map((item) => item.inveter_make).filter(Boolean))];
  //       const inverterSize = [...new Set(InverterData.map((item) => item.inveter_size).filter(Boolean))];
  //       const inverterModel = [...new Set(InverterData.map((item) => item.inveter_model).filter(Boolean))];
  //       const inverterType = [...new Set(InverterData.map((item) => item.inveter_type).filter(Boolean))];

  //       setInverterMakeOptions(inverterMake);
  //       setInverterSizeOptions(inverterSize);
  //       setInverterModelOptions(inverterModel);
  //       setInverterTypeOptions(inverterType);

  //     } catch (error) {
  //       console.error("Error fetching master data:", error);
  //     }
  //   };
  //   fetchMasterData();
  // }, []);
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
  const LeadId = localStorage.getItem("HandOver_Lead");
  const { data: getHandOverSheet = [] } = useGetHandOverQuery();
  const HandOverSheet = useMemo(
    () => getHandOverSheet?.Data ?? [],
    [getHandOverSheet]
  );

  console.log("HandOverSheet", HandOverSheet);

  const handoverData = HandOverSheet.find((item) => item.id === LeadId);

  console.log("✅ Found handoverData:", handoverData);

  // 🎯 Populate Data from Handover if Available
  useEffect(() => {
    if (!handoverData) {
      console.warn("No matching handover data found.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      p_id: handoverData?.p_id || "",
      customer_details: {
        ...prev.customer_details,
        code: handoverData?.customer_details?.code || "",
        name: handoverData?.customer_details?.name || "",
        customer: handoverData?.customer_details?.customer || "",
        epc_developer: handoverData?.customer_details?.epc_developer || "",
        // billing_address: handoverData?.customer_details?.billing_address || {
        //   village_name: "",
        //   district_name: "",
        // },
        site_address: handoverData?.customer_details?.site_address || {
          village_name: "",
          district_name: "",
        },
        site_google_coordinates:
          handoverData?.customer_details?.site_google_coordinates || "",
        number: handoverData?.customer_details?.number || "",
        // gst_no: handoverData?.customer_details?.gst_no || "",
        gender_of_Loa_holder:
          handoverData?.customer_details?.gender_of_Loa_holder || "",
        email: handoverData?.customer_details?.email || "",
        p_group: handoverData?.customer_details?.p_group || "",
        pan_no: handoverData?.customer_details?.pan_no || "",
        adharNumber_of_loa_holder:
          handoverData?.customer_details?.adharNumber_of_loa_holder || "",
        state: handoverData?.customer_details?.state || "",
        alt_number: handoverData?.customer_details?.alt_number || "",
      },
      order_details: {
        ...prev.order_details,
        type_business: handoverData?.order_details?.type_business || "",
        tender_name: handoverData?.order_details?.tender_name || "",
        discom_name: handoverData?.order_details?.discom_name || "",
        design_date: handoverData?.order_details?.design_date || "",
        feeder_code: handoverData?.order_details?.feeder_code || "",
        feeder_name: handoverData?.order_details?.feeder_name || "",
      },
      project_detail: {
        ...prev.project_detail,
        project_type: handoverData?.project_detail?.project_type || "",
        module_make_capacity:
          handoverData?.project_detail?.module_make_capacity || "",
        module_make: handoverData?.project_detail?.module_make || "",
        module_capacity: handoverData?.project_detail?.module_capacity || "",
        module_type: handoverData?.project_detail?.module_type || "",
        module_category: handoverData?.project_detail?.module_category || "",
        evacuation_voltage:
          handoverData?.project_detail?.evacuation_voltage || "",
        inverter_make_capacity:
          handoverData?.project_detail?.inverter_make_capacity || "",
        inverter_make: handoverData?.project_detail?.inverter_make || "",
        inverter_type: handoverData?.project_detail?.inverter_type || "",
        // inverter_size: handoverData?.project_detail?.inverter_size || "",
        // inverter_model_no:
        //   handoverData?.project_detail?.inverter_model_no || "",
        work_by_slnko: handoverData?.project_detail?.work_by_slnko || "",
        topography_survey:
          handoverData?.project_detail?.topography_survey || "",
        soil_test: handoverData?.project_detail?.soil_test || "",
        purchase_supply_net_meter:
          handoverData?.project_detail?.purchase_supply_net_meter || "",
        liaisoning_net_metering:
          handoverData?.project_detail?.liaisoning_net_metering || "",
        ceig_ceg: handoverData?.project_detail?.ceig_ceg || "",
        project_completion_date:
          handoverData?.project_detail?.project_completion_date || "",
        proposed_dc_capacity:
          handoverData?.project_detail?.proposed_dc_capacity || "",
        distance: handoverData?.project_detail?.distance || "",
        tarrif: handoverData?.project_detail?.tarrif || "",
        substation_name: handoverData?.project_detail?.substation_name || "",
        overloading: handoverData?.project_detail?.overloading || "",
        project_kwp: handoverData?.project_detail?.project_kwp || "",
        land: handoverData?.project_detail?.land
          ? JSON.parse(handoverData.project_detail.land)
          : { type: "", acres: "" },
        agreement_date: handoverData?.project_detail?.agreement_date || "",
        project_component:
          handoverData?.project_detail?.project_component || "",
          project_component_other: handoverData?.project_detail?.project_component_other || "",
          transmission_scope: handoverData?.project_detail?.transmission_scope || "",
          loan_scope: handoverData?.project_detail?.loan_scope || "",
      },
      commercial_details: {
        ...prev.commercial_details,
        type: handoverData?.commercial_details?.type || "",
        subsidy_amount: handoverData?.commercial_details?.subsidy_amount || "",
      },
      other_details: {
        ...prev.other_details,
        taken_over_by: handoverData?.other_details?.taken_over_by || "",
        cam_member_name: handoverData?.other_details?.cam_member_name || "",
        service: handoverData?.other_details?.service || "",
        slnko_basic: handoverData?.other_details?.slnko_basic || "",
        billing_type: handoverData?.other_details?.billing_type || "",
        project_status:
          handoverData?.other_details?.project_status || "incomplete",
        loa_number: handoverData?.other_details?.loa_number || "",
        ppa_number: handoverData?.other_details?.ppa_number || "",
        remark: handoverData?.other_details?.remark || "",
        remarks_for_slnko: handoverData?.other_details?.remarks_for_slnko || "",
        submitted_by_BD: handoverData?.other_details?.submitted_by_BD || "",
      },
      invoice_detail: {
        ...prev.invoice_detail,
        invoice_recipient:
          handoverData?.invoice_detail?.invoice_recipient || "",
        invoicing_GST_no: handoverData?.invoice_detail?.invoicing_GST_no || "",
        invoicing_address:
          handoverData?.invoice_detail?.invoicing_address || "",
        delivery_address: handoverData?.invoice_detail?.delivery_address || "",
        msme_reg: handoverData?.invoice_detail?.msme_reg || "",
      },
      submitted_by: handoverData?.submitted_by || "-",
    }));
  }, [handoverData]);



  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 850,
        margin: "auto",
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

            {/* Dynamic Sections */}
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
            placeholder="Group Name"
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

        <Grid item xs={12} sm={6}>
          <Typography
            level="body1"
            sx={{ fontWeight: "bold", marginBottom: 0.5 }}
          >
            Site Address with Pin Code <span style={{ color: "red" }}>*</span>
          </Typography>
          <Input
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
        </Grid>
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

        {/* Show Project Component only if type_business === "Kusum" */}
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
                handleChange("project_detail", "project_component", newValue);
                if (newValue !== "Other") {
                  handleChange("project_detail", "project_component_other", "");
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
                value={formData.project_detail?.project_component_other || ""}
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
            value={formData["project_detail"]?.["module_make_capacity"] || ""}
            onChange={(e, newValue) =>
              handleChange("project_detail", "module_make_capacity", newValue)
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
        <Grid item xs={12} sm={6}>
          <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
            Slnko Service Charges (Without GST)/Wp{" "}
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

        <Grid xs={12}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6} mt={1}>
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
        </Grid>
      </Grid>

      {/* Buttons */}
      <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
        <Grid item xs={6} sm={4} md={3}>
          <Button
            onClick={handlePrint} 
            variant="solid"
            color="primary"
            fullWidth
            sx={{
              padding: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              "@media print": {
                display: "none",
              },
            }}
          >
            Print
          </Button>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default GetHandoverSheetForm;
