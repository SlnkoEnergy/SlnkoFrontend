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
  Typography,
} from "@mui/joy";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Img1 from "../../assets/HandOverSheet_Icon.jpeg";
import {
  useGetHandOverByIdQuery,
  useGetHandOverQuery,
  useUpdateHandOverMutation,
} from "../../redux/camsSlice";
import {
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
} from "../../redux/leadsSlice";

const UpdateHandoverSheetForm = ({ onBack }) => {
  const navigate = useNavigate();
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
      project_component_other: "",
      transmission_scope: "",
      loan_scope: "",
    },

    commercial_details: {
      type: "",
      subsidy_amount: "",
    },

    other_details: {
      taken_over_by: "",
      cam_member_name: "",
      service: "",
      billing_type: "",
      project_status: "incomplete",
      loa_number: "",
      ppa_number: "",
      remark: "",
      submitted_by_BD: "",
    },
    invoice_detail: {
      invoice_recipient: "",
      invoicing_GST_no: "",
      invoicing_address: "",
      delivery_address: "",
      msme_reg: "",
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
  //       const response = await axios.get("${process.env.REACT_APP_API_URL}/get-module-master");

  //       // console.log("Module Master Response:", response.data);

  //       // Ensure response.data is an object and contains an array key
  //       const moduleData = Array.isArray(response.data.data) ? response.data.data : [];

  //       // console.log("Extracted Module Master Data:", moduleData);

  //       const Inverterresponse = await axios.get("${process.env.REACT_APP_API_URL}/get-master-inverter");

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

  const LeadId = sessionStorage.getItem("update handover");

  // console.log("LeadId:", LeadId);
  const {
    data: handoverData,
    isLoading,
    isError,
    error,
  } = useGetHandOverByIdQuery({ leadId: LeadId }, { skip: !LeadId });

  // If your API returns single object, no need to find inside array
  // If it returns array, then keep the find logic

  // Defensive check: if API returns array, then use find; else assume object
  const handover = Array.isArray(handoverData?.data)
    ? handoverData.data.find((item) => item.id === LeadId)
    : handoverData?.data || null;

  useEffect(() => {
    if (!handover) {
      console.warn("No matching handover data found.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      p_id: handover?.p_id || "",
      customer_details: {
        ...prev.customer_details,
        code: handover?.customer_details?.code || "",
        name: handover?.customer_details?.name || "",
        customer: handover?.customer_details?.customer || "",
        epc_developer: handover?.customer_details?.epc_developer || "",
        site_address: handover?.customer_details?.site_address || {
          village_name: "",
          district_name: "",
        },
        site_google_coordinates:
          handover?.customer_details?.site_google_coordinates || "",
        number: handover?.customer_details?.number || "",
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
        land: handover?.project_detail?.land
          ? JSON.parse(handover.project_detail.land)
          : { type: "", acres: "" },
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
        billing_type: handover?.other_details?.billing_type || "",
        project_status: handover?.other_details?.project_status || "incomplete",
        loa_number: handover?.other_details?.loa_number || "",
        ppa_number: handover?.other_details?.ppa_number || "",
        remark: handover?.other_details?.remark || "",
        submitted_by_BD: handover?.other_details?.submitted_by_BD || "",
      },
      invoice_detail: {
        ...prev.invoice_detail,
        invoice_recipient: handover?.invoice_detail?.invoice_recipient || "",
        invoicing_GST_no: handover?.invoice_detail?.invoicing_GST_no || "",
        invoicing_address: handover?.invoice_detail?.invoicing_address || "",
        delivery_address: handover?.invoice_detail?.delivery_address || "",
        msme_reg: handover?.invoice_detail?.msme_reg || "",
      },
      submitted_by: handover?.submitted_by || "-",
    }));
  }, [handover]);

  const calculateDcCapacity = (ac, overloadingPercent) => {
    const acValue = parseFloat(ac);
    const overloadingValue = parseFloat(overloadingPercent) / 100;
    if (!isNaN(acValue) && !isNaN(overloadingValue)) {
      return (acValue * (1 + overloadingValue)).toFixed(3);
    }
    return "";
  };

  useEffect(() => {
    const updatedDcCapacity = calculateDcCapacity(
      formData.project_detail.project_kwp,
      formData.project_detail.overloading
    );
    setFormData((prev) => ({
      ...prev,
      project_detail: {
        ...prev.project_detail,
        proposed_dc_capacity: updatedDcCapacity,
      },
    }));
  }, [
    formData.project_detail.project_kwp,
    formData.project_detail.overloading,
  ]);

  const [updateHandOver, { isLoading: isUpdating }] =
    useUpdateHandOverMutation();

  const handleSubmit = async () => {
    try {
      if (!LeadId || isNaN(Number(LeadId))) {
        toast.error("Invalid or missing Lead ID!");
        return;
      }

      console.log("LeadId:", LeadId);

      // Prepare updated form data
      const updatedFormData = {
        id: LeadId,
        customer_details: {
          ...formData.customer_details,
        },
        order_details: {
          ...formData.order_details,
        },
        project_detail: {
          ...formData.project_detail,
          land: JSON.stringify(formData.project_detail?.land),
        },
        commercial_details: {
          ...formData.commercial_details,
        },
        other_details: {
          ...formData.other_details,
          submitted_by_BD:
            formData.other_details?.submitted_by_BD || user?.name || "",
        },
        submitted_by: formData.submitted_by || user?.name || "",
        invoice_detail: {
          ...formData.invoice_detail,
        },

        ...(formData.status_of_handoversheet === "done" && {
          status_of_handoversheet: "done",
        }),
      };

      // console.log("Submitting updated handover data:", updatedFormData);

      const response = await updateHandOver(updatedFormData).unwrap();

      toast.success("HandOver Sheet updated successfully");

      console.log("Update response:", response);

      navigate("/cam_dash");
    } catch (error) {
      console.error("Error during handover update:", error);

      const errorMessage =
        error?.data?.message || error?.message || "Submission failed";

      // Handle case when status is not "done"
      if (formData.status_of_handoversheet !== "done") {
        toast.error("Your handover sheet has been locked");
      }

      if (errorMessage.toLowerCase().includes("already handed over")) {
        toast.error("Already handed over found");
      } else if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("record not found")
      ) {
        toast.warning("Please contact with admin panel");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const sections = [
    {
      name: "Customer Details",
      fields: [],
    },
    {
      name: "Invoicing Details",
      fields: [],
    },
    {
      name: "Order Details",
      fields: [],
    },
    {
      name: "Project Details",
      fields: [],
    },
    {
      name: "Commercial Details",
      fields: [],
    },
    {
      name: "Other Details",
      fields: [],
    },
  ];

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
      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <Accordion
          key={index}
          expanded={expanded === index}
          onChange={() => handleExpand(index)}
          sx={{ marginBottom: 1.5 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "#e0e0e0", padding: 1.5 }}
          >
            <Typography level="h5" sx={{ fontWeight: "bold" }}>
              {section.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 2.5 }}>
            <Grid container spacing={2}>
              {/* Handle special case for "Customer Details" section  */}
              {section.name === "Customer Details" && (
                <>
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
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Client Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="Client Name"
                      value={formData.customer_details.customer}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "customer",
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
                        handleChange(
                          "customer_details",
                          "p_group",
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
                      State <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Autocomplete
                      options={states}
                      value={formData.customer_details.state || null}
                      onChange={(e, value) =>
                        handleAutocompleteChange(
                          "customer_details",
                          "state",
                          value
                        )
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
                      Gender of LOA Holder{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="Gender of LOA Holder"
                      value={formData.customer_details.gender_of_Loa_holder}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "gender_of_Loa_holder",
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
                      Email id <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="Email"
                      value={formData.customer_details.email}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "email",
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
                      EPC/Developer <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="EPC/Developer"
                      value={formData.customer_details.epc_developer}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "epc_developer",
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
                      Aadhar Number <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Aadhar Number"
                      required
                      value={
                        formData.customer_details.adharNumber_of_loa_holder
                      }
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
                      required
                      fullWidth
                      placeholder="PAN Number"
                      value={formData.customer_details.pan_no}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "pan_no",
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
                      Site Address with Pin Code{" "}
                      <span style={{ color: "red" }}>*</span>
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
                      Site Google Coordinates{" "}
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Site Google Coordinates"
                      value={formData.customer_details.site_google_coordinates}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "site_google_coordinates",
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
                      Contact No. <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="Contact No."
                      value={formData.customer_details.number}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "number",
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
                      Alt Contact No. <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="Alternate Contact No."
                      value={formData.customer_details.alt_number}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "alt_number",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      GST No. <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      fullWidth
                      placeholder="GST No."
                      value={formData.customer_details.gst_no}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "gst_no",
                          e.target.value
                        )
                      }
                    />
                  </Grid> */}

                  {/* <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Billing Address
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="e.g. Greenfield, Central District"
                      value={`${formData?.customer_details?.billing_address?.village_name}${
                        formData?.customer_details?.billing_address
                          ?.district_name
                          ? `, ${formData?.customer_details?.billing_address?.district_name}`
                          : ""
                      }`}
                      onChange={(e) => {
                        const [village, district] = e.target.value
                          .split(",")
                          .map((s) => s.trim());
                        handleChange("customer_details", "billing_address", {
                          village_name: village || "",
                          district_name: district || "",
                        });
                      }}
                    />
                  </Grid> */}
                </>
              )}
              {/* Handle special case for "Invoicing Details" section  */}
              {section.name === "Invoicing Details" && (
                <>
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
                    <Input
                      fullWidth
                      placeholder="Invoicing GST No."
                      value={formData.invoice_detail.invoicing_GST_no}
                      onChange={(e) =>
                        handleChange(
                          "invoice_detail",
                          "invoicing_GST_no",
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
                      Invoicing Address
                    </Typography>
                    <Input
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Delivery Address
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Delivery Address"
                      value={formData.invoice_detail.delivery_address}
                      onChange={(e) =>
                        handleChange(
                          "invoice_detail",
                          "delivery_address",
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
                      MSME Reg No. (if applicable)
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="MSME Reg No."
                      value={formData.invoice_detail.msme_reg}
                      onChange={(e) =>
                        handleChange(
                          "invoice_detail",
                          "msme_reg",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                </>
              )}
              {/* Handle special case for "Type of Business" dropdown */}
              {section.name === "Order Details" && (
                <>
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
                      <Option value="Commercial">Commercial</Option>
                      <Option value="Tender">Tender</Option>
                      <Option value="Consumer">Consumer</Option>
                      <Option value="Kusum">KUSUM</Option>
                    </Select>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Tender Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      value={formData.order_details.tender_name}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "tender_name",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Feeder Code / Substation Code{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      value={formData.order_details.feeder_code}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "feeder_code",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Feeder Name / Substation Names{" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      value={formData.order_details.feeder_name}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "feeder_name",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      DISCOM Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      required
                      value={formData.order_details.discom_name}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "discom_name",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Preliminary Design Sign-off Date{" "}
                    </Typography>
                    <Input
                      type="date"
                      value={formData.order_details.design_date}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "design_date",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                </>
              )}

              {/* Handle special case for "Type" in Commercial Details */}
              {section.name === "Commercial Details" && (
                <>
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
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Subsidy Amount<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.commercial_details?.subsidy_amount || ""}
                      placeholder="Subsidy Amount"
                      onChange={(e) =>
                        handleChange(
                          "commercial_details",
                          "subsidy_amount",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                </>
              )}

              {/* Dropdowns for Project Details */}
              {section.name === "Project Details" && (
                <>
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
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Project Component<span style={{ color: "red" }}>*</span>
                    </Typography>

                    <Select
                      fullWidth
                      placeholder="Project Component"
                      value={
                        formData["project_detail"]?.["project_component"] || ""
                      }
                      onChange={(_, newValue) => {
                        handleChange(
                          "project_detail",
                          "project_component",
                          newValue
                        );
                        // Clear the custom input if not selecting "Other"
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

                    {formData["project_detail"]?.["project_component"] ===
                      "Other" && (
                      <Input
                        fullWidth
                        placeholder="Enter other project component"
                        value={
                          formData["project_detail"]?.[
                            "project_component_other"
                          ] || ""
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

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Proposed AC Capacity (kW)
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.project_detail.project_kwp}
                      placeholder="Proposed AC Capacity (kWp)"
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "project_kwp",
                          e.target.value
                        )
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
                        handleChange(
                          "project_detail",
                          "overloading",
                          e.target.value
                        )
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
                      value={
                        formData["project_detail"]?.["work_by_slnko"] || ""
                      }
                      onChange={(e, newValue) =>
                        handleChange(
                          "project_detail",
                          "work_by_slnko",
                          newValue
                        )
                      }
                    >
                      <Option value="Eng">Eng</Option>
                      <Option value="EP">EP</Option>
                      <Option value="PMC">PMC</Option>
                      <Option value="EPMC">EPMC</Option>
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
                        formData["project_detail"]?.["module_make_capacity"] ||
                        ""
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
                      {/* Module Make & Capacity */}

                      {/* <Grid item xs={12} sm={6}>
                            <Typography level="body1">Module Make</Typography>
                            <Select
                              fullWidth
                              value={
                                formData?.project_detail?.module_make || ""
                              }
                              onChange={(_, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "module_make",
                                  newValue
                                )
                              }
                            >
                              {moduleMakeOptions.length > 0 ? (
                                moduleMakeOptions.map((make, index) => (
                                  <Option key={index} value={make}>
                                    {make}
                                  </Option>
                                ))
                              ) : (
                                <Option disabled>No options available</Option>
                              )}
                            </Select>
                          </Grid> */}

                      <Grid item xs={12} sm={6}>
                        <Typography level="body1">
                          Module Make<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Select
                          fullWidth
                          value={formData?.project_detail?.module_make || ""}
                          onChange={(_, newValue) => {
                            handleChange(
                              "project_detail",
                              "module_make",
                              newValue
                            );
                            // Clear the "Other" input when a different option is selected
                            if (newValue !== "Other") {
                              handleChange(
                                "project_detail",
                                "module_make_other",
                                ""
                              );
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
                            value={
                              formData?.project_detail?.module_make_other || ""
                            }
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
                        <Typography level="body1">
                          Module Capacity<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Select
                          fullWidth
                          value={
                            formData?.project_detail?.module_capacity || ""
                          }
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
                        <Typography level="body1">
                          Module Type<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Select
                          fullWidth
                          value={formData?.project_detail?.module_type || ""}
                          onChange={(_, newValue) =>
                            handleChange(
                              "project_detail",
                              "module_type",
                              newValue
                            )
                          }
                        >
                          <Option value="P-TYPE">P-TYPE</Option>
                          <Option value="N-TYPE">N-TYPE</Option>
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
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Select Inverter Scope"
                      value={
                        formData["project_detail"]?.[
                          "inverter_make_capacity"
                        ] || ""
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
                        <Typography level="body1">
                          Inverter Make<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Select
                          fullWidth
                          value={
                            formData["project_detail"]?.["inverter_make"] || ""
                          }
                          onChange={(_, newValue) => {
                            handleChange(
                              "project_detail",
                              "inverter_make",
                              newValue
                            );
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
                              formData["project_detail"]?.[
                                "inverter_make_other"
                              ] || ""
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
                          <Option value="STRING INVERTER">
                            STRING INVERTER
                          </Option>
                          <Option value="Other">Other</Option>
                        </Select>

                        {/* Show text input if 'Other' is selected */}
                        {formData?.project_detail?.inverter_type ===
                          "Other" && (
                          <Input
                            placeholder="Enter inverter type"
                            fullWidth
                            value={
                              formData?.project_detail?.inverter_type_other ||
                              ""
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
                      value={
                        formData["project_detail"]?.["topography_survey"] || ""
                      }
                      onChange={(e, newValue) =>
                        handleChange(
                          "project_detail",
                          "topography_survey",
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
                      Soil Testing<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Soil Testing"
                      value={formData["project_detail"]?.["soil_test"] || ""}
                      onChange={(e, newValue) =>
                        handleChange("project_detail", "soil_test", newValue)
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
                        formData["project_detail"]?.[
                          "purchase_supply_net_meter"
                        ] || ""
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
                      Liaisoning for Net-Metering
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Liaisoning for Net-Metering"
                      value={
                        formData["project_detail"]?.[
                          "liaisoning_net_metering"
                        ] || ""
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
                      Transmission Line Scope
                      <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <Select
                      fullWidth
                      placeholder="Select"
                      value={formData.project_detail?.transmission_scope || ""}
                      onChange={(_, newValue) =>
                        handleChange(
                          "project_detail",
                          "transmission_scope",
                          newValue
                        )
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
                        handleChange(
                          "project_detail",
                          "distance",
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
                      Evacuation Voltage<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Evacuation Voltage"
                      value={
                        formData["project_detail"]?.["evacuation_voltage"] || ""
                      }
                      onChange={(e, newValue) =>
                        handleChange(
                          "project_detail",
                          "evacuation_voltage",
                          newValue
                        )
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
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Tariff Rate<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.project_detail.tarrif}
                      placeholder="Tariff Rate"
                      onChange={(e) =>
                        handleChange("project_detail", "tarrif", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Land Availables<span style={{ color: "red" }}>*</span>
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Input
                          name="acres"
                          type="text"
                          placeholder="e.g. 5"
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
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          options={landTypes}
                          value={
                            landTypes.includes(
                              formData.project_detail?.land?.type
                            )
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
                          isOptionEqualToValue={(option, value) =>
                            option === value
                          }
                          placeholder="Land Type"
                          required
                          sx={{ width: "100%" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Module Content Category
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      value={formData?.project_detail?.module_category || ""}
                      onChange={(_, newValue) =>
                        handleChange(
                          "project_detail",
                          "module_category",
                          newValue
                        )
                      }
                    >
                      <Option value="DCR">DCR</Option>
                      <Option value="Non DCR">Non DCR</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Project Completion Date(As per PPA)
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      fullWidth
                      type="date"
                      value={
                        formData["project_detail"]?.[
                          "project_completion_date"
                        ] || ""
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
                      LOA/PPA Date<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      fullWidth
                      type="date"
                      value={
                        formData["project_detail"]?.["agreement_date"] || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "agreement_date",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

                  {/* <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Land
                    </Typography>
                    <Input
                      value={formData.project_detail.land}
                      placeholder="Land"
                      onChange={(e) =>
                        handleChange("project_detail", "land", e.target.value)
                      }
                    />
                  </Grid> */}

                  {/* <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Substation Name
                    </Typography>
                    <Input
                      value={formData.project_detail.substation_name}
                      placeholder="Substation Name"
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "substation_name",
                          e.target.value
                        )
                      }
                    />
                  </Grid> */}
                </>
              )}

              {/* Handle special case for Other Details */}
              {section.name === "Other Details" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      TakenOver By <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      value={formData?.other_details?.taken_over_by || ""}
                      onChange={(e, newValue) =>
                        handleChange("other_details", "taken_over_by", newValue)
                      }
                      required
                    >
                      <Option value="CAM">CAM</Option>
                    </Select>
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
                      Slnko Service Charges (incl. GST){" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.other_details.service}
                      placeholder="Slnko Service Charge"
                      onChange={(e) =>
                        handleChange("other_details", "service", e.target.value)
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      LOA Number <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.other_details.loa_number}
                      placeholder="LOA Number"
                      onChange={(e) =>
                        handleChange(
                          "other_details",
                          "loa_number",
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      PPA Number <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.other_details.ppa_number}
                      placeholder="PPA Number"
                      onChange={(e) =>
                        handleChange(
                          "other_details",
                          "ppa_number",
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      HandedOver By <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData.other_details.submitted_by_BD}
                      onChange={(e) =>
                        handleChange(
                          "other_details",
                          "submitted_by_BD",
                          e.target.value
                        )
                      }
                      readOnly
                      required
                    />
                  </Grid>

                  {["superadmin", "admin", "executive", "visitor"].includes(
                    user?.role
                  ) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                        >
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
                          isOptionEqualToValue={(option, value) =>
                            option === value
                          }
                          placeholder="Billing Type"
                          sx={{ width: "100%" }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                        >
                          Submitted By <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Input
                          value={formData.submitted_by}
                          onChange={(e) =>
                            handleChange("submitted_by", e.target.value)
                          }
                          readOnly
                          required
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Remarks (Any Other Commitments to Client){" "}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Input
                      value={formData?.other_details.remark || ""}
                      placeholder="Remarks"
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

              {/* Render other fields with labels */}
              {section.fields.map((field, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography
                    level="body1"
                    sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                  >
                    {field}
                  </Typography>
                  <Input
                    fullWidth
                    placeholder={field}
                    value={formData[section.name]?.[field] ?? ""}
                    onChange={(e) =>
                      handleChange(section.name, field, e.target.value)
                    }
                    sx={{
                      padding: 1.2,
                      fontSize: "1rem",
                      backgroundColor: "#fff",
                      borderRadius: "md",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Buttons */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <Button
            onClick={() => navigate("/cam_dash")}
            variant="solid"
            color="neutral"
            fullWidth
            sx={{ padding: 1.5, fontSize: "1rem", fontWeight: "bold" }}
          >
            Back
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            onClick={handleSubmit}
            variant="solid"
            color="primary"
            fullWidth
            sx={{ padding: 1.5, fontSize: "1rem", fontWeight: "bold" }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default UpdateHandoverSheetForm;
