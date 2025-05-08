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
      gst_no: "",
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
      module_model_no: "",
      evacuation_voltage: "",
      inverter_make_capacity: "",
      inverter_make: "",
      inverter_type: "",
      inverter_size: "",
      inverter_model_no: "",
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
      substation_name: "",
      overloading: "",
      project_kwp: "",
      land: { type: "", acres: "" },
      agreement_date: "",
    },

    commercial_details: {
      type: "",
      subsidy_amount: "",
    },

    attached_details: {
      taken_over_by: "",
      cam_member_name: "",
      service: "",
      billing_type: "",
      project_status: "incomplete",
      loa_number: "",
      ppa_number: "",
      submitted_by_BD: "",
    },
    invoice_detail: {
      invoice_recipient: "",
      invoicing_GST_no: "",
      invoicing_address: "",
      delivery_address: "",
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
        attached_details: {
          ...prev.attached_details,
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
      customer_details: {
        ...prev.customer_details,
        code: handoverData?.customer_details?.code || "",
        name: handoverData?.customer_details?.name || "",
        customer: handoverData?.customer_details?.customer || "",
        epc_developer: handoverData?.customer_details?.epc_developer || "",
        billing_address: handoverData?.customer_details?.billing_address || {
          village_name: "",
          district_name: "",
        },
        site_address: handoverData?.customer_details?.site_address || {
          village_name: "",
          district_name: "",
        },
        site_google_coordinates:
          handoverData?.customer_details?.site_google_coordinates || "",
        number: handoverData?.customer_details?.number || "",
        gst_no: handoverData?.customer_details?.gst_no || "",
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
        module_model_no: handoverData?.project_detail?.module_model_no || "",
        evacuation_voltage:
          handoverData?.project_detail?.evacuation_voltage || "",
        inverter_make_capacity:
          handoverData?.project_detail?.inverter_make_capacity || "",
        inverter_make: handoverData?.project_detail?.inverter_make || "",
        inverter_type: handoverData?.project_detail?.inverter_type || "",
        inverter_size: handoverData?.project_detail?.inverter_size || "",
        inverter_model_no:
          handoverData?.project_detail?.inverter_model_no || "",
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
      },
      commercial_details: {
        ...prev.commercial_details,
        type: handoverData?.commercial_details?.type || "",
        subsidy_amount: handoverData?.commercial_details?.subsidy_amount || "",
      },
      attached_details: {
        ...prev.attached_details,
        taken_over_by: handoverData?.attached_details?.taken_over_by || "",
        cam_member_name: handoverData?.attached_details?.cam_member_name || "",
        service: handoverData?.attached_details?.service || "",
        billing_type: handoverData?.attached_details?.billing_type || "",
        project_status:
          handoverData?.attached_details?.project_status || "incomplete",
        loa_number: handoverData?.attached_details?.loa_number || "",
        ppa_number: handoverData?.attached_details?.ppa_number || "",
        submitted_by_BD: handoverData?.attached_details?.submitted_by_BD || "",
      },
      invoice_detail: {
        ...prev.invoice_detail,
        invoice_recipient:
          handoverData?.invoice_detail?.invoice_recipient || "",
        invoicing_GST_no: handoverData?.invoice_detail?.invoicing_GST_no || "",
        invoicing_address:
          handoverData?.invoice_detail?.invoicing_address || "",
        delivery_address: handoverData?.invoice_detail?.delivery_address || "",
      },
      submitted_by: handoverData?.submitted_by || "-",
    }));
  }, [handoverData]);

  // console.log("📝 Updated formData:", formData);
  // console.log("📦 order_details:", handoverData?.order_details);
  // console.log("📦 project_detail:", handoverData?.project_detail);

  // ✅ Debugging: Log State Updates to Ensure Data is Set Correctly
  // useEffect(() => {
  //   console.log("Updated Form Data in State:", formData);
  // }, [formData]);

  //   const handleExpand = (panel) => {
  //     setExpanded(expanded === panel ? null : panel);
  //   };

  //   const handleChange = (section, field, value) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [section]: {
  //         ...prev[section],
  //         [field]: value,
  //       },
  //     }));
  //   };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       await axios.put(`https://api.slnkoprotrac.com/v1/edit-hand-over-sheet/67e2744c5c891bb412838925`, formData);

  //         alert('Handover Sheet updated successfully');
  //     } catch (error) {
  //         console.error('Error updating data:', error);
  //     }
  // };

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
      name: "Attached Details",
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
                      Project ID
                    </Typography>
                    <Input
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
                      Name(As per EB Bill)
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Name"
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
                  {["superadmin", "admin", "executive", "visitor"].includes(
                    user?.role
                  ) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          level="body1"
                          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                        >
                          Project Name
                        </Typography>
                        <Input
                          fullWidth
                          placeholder="Project Name"
                          value={formData.customer_details.name}
                          onChange={(e) =>
                            handleChange(
                              "customer_details",
                              "name",
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
                          Group Name
                        </Typography>
                        <Input
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
                          State
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
                          isOptionEqualToValue={(option, value) =>
                            option === value
                          }
                          placeholder="State"
                          required
                          sx={{ width: "100%" }}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Gender of LOA Holder
                    </Typography>
                    <Input
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
                      Email id
                    </Typography>
                    <Input
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
                      EPC/Developer
                    </Typography>
                    <Input
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
                      LOA Holder Aadhar Name
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="LOA Holder Aadhar Name"
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
                      PAN Number
                    </Typography>
                    <Input
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
                      Site Address with Pin Code
                    </Typography>
                    <Input
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
                      Site Google Coordinates
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
                      Contact No.
                    </Typography>
                    <Input
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
                      Alt Contact No.
                    </Typography>
                    <Input
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
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      GST No.
                    </Typography>
                    <Input
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
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
                      Type of Business
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Select Type of Business"
                      value={formData?.order_details?.type_business ?? ""} // ✅ Ensure value is correctly passed
                      onChange={(e, newValue) => {
                        console.log("🔄 Updating type_business to:", newValue);
                        handleChange(
                          "order_details",
                          "type_business",
                          newValue
                        );
                      }}
                      disabled={true}
                      sx={{
                        fontSize: "1rem",
                        backgroundColor: "#fff",
                        borderRadius: "md",
                      }}
                    >
                      <Option value="Commercial">Commercial</Option>
                      <Option value="Tender">Tender</Option>
                      <Option value="Consumer">Consumer</Option>
                    </Select>
                  </Grid>

                  {/* Integrated Order Details Fields */}
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Tender Name
                    </Typography>
                    <Input
                      value={formData?.order_details?.tender_name}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "tender_name",
                          e.target.value
                        )
                      }
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      DISCOM Name
                    </Typography>
                    <Input
                      value={formData?.order_details?.discom_name}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "discom_name",
                          e.target.value
                        )
                      }
                      readOnly
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Preliminary Design Sign-off Date
                    </Typography>
                    <Input
                      type="date"
                      value={formData?.order_details?.design_date}
                      onChange={(e) =>
                        handleChange(
                          "order_details",
                          "design_date",
                          e.target.value
                        )
                      }
                      readOnly
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
                      Type
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Type"
                      value={formData["commercial_details"]?.["type"] || ""}
                      onChange={(e, newValue) =>
                        handleChange("commercial_details", "type", newValue)
                      }
                      disabled={true}
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
                      Subsidy Amount
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
                      readOnly
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
                      Project Type
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
                      Solar Module Scope
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
                  {formData?.project_detail?.module_make_capacity ===
                    "Slnko" && (
                    <>
                      {/* Module Make & Capacity */}
                      {[
                        "superadmin",
                        "admin",
                        "executive",
                        "visitor",
                        "sales",
                      ].includes(user?.role) && (
                        <>
                          <Grid item xs={12} sm={6}>
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
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">
                              Module Capacity
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
                        </>
                      )}

                      {/* Module Model No & Type */}
                      {["superadmin", "admin", "executive", "visitor"].includes(
                        user?.role
                      ) && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">
                              Module Content Category
                            </Typography>
                            <Select
                              fullWidth
                              value={
                                formData?.project_detail?.module_model_no || ""
                              }
                              onChange={(_, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "module_model_no",
                                  newValue
                                )
                              }
                            >
                              <Option value="DCR">DCR</Option>
                              <Option value="Non DCR">Non DCR</Option>
                            </Select>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">Module Type</Typography>
                            <Select
                              fullWidth
                              value={
                                formData?.project_detail?.module_type || ""
                              }
                              onChange={(_, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "module_type",
                                  newValue
                                )
                              }
                            >
                              {moduleTypeOptions.length > 0 ? (
                                moduleTypeOptions.map((type, index) => (
                                  <Option key={index} value={type}>
                                    {type}
                                  </Option>
                                ))
                              ) : (
                                <Option disabled>No options available</Option>
                              )}
                            </Select>
                          </Grid>
                        </>
                      )}
                    </>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Evacuation Voltage
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
                      Solar Inverter Scope
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
                  {formData["project_detail"]?.["inverter_make_capacity"] ===
                    "Slnko" && (
                    <>
                      {[
                        "superadmin",
                        "admin",
                        "executive",
                        "visitor",
                        "sales",
                      ].includes(user?.role) && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">Inverter Make</Typography>
                            <Select
                              fullWidth
                              value={
                                formData["project_detail"]?.["inverter_make"] ||
                                ""
                              }
                              onChange={(e, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "inverter_make",
                                  newValue
                                )
                              }
                            >
                              {inverterMakeOptions.map((option) => (
                                <Option key={option} value={option}>
                                  {option}
                                </Option>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">Inverter Type</Typography>
                            <Select
                              fullWidth
                              value={
                                formData["project_detail"]?.["inverter_type"] ||
                                ""
                              }
                              onChange={(e, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "inverter_type",
                                  newValue
                                )
                              }
                            >
                              {inverterTypeOptions.length > 0 ? (
                                inverterTypeOptions.map((type, index) => (
                                  <Option key={index} value={type}>
                                    {type}
                                  </Option>
                                ))
                              ) : (
                                <Option disabled>No options available</Option>
                              )}
                              <Option value="TBD">TBD</Option>{" "}
                              {/* ✅ Added "TBD" as an option */}
                            </Select>
                          </Grid>
                        </>
                      )}
                      {["superadmin", "admin", "executive", "visitor"].includes(
                        user?.role
                      ) && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">
                              Inverter Model No
                            </Typography>
                            <Select
                              fullWidth
                              value={
                                formData["project_detail"]?.[
                                  "inverter_model_no"
                                ] || ""
                              }
                              onChange={(e, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "inverter_model_no",
                                  newValue
                                )
                              }
                            >
                              {inverterModelOptions.map((model) => (
                                <Option key={model} value={model}>
                                  {model}
                                </Option>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography level="body1">Inverter Size</Typography>
                            <Select
                              fullWidth
                              value={
                                formData["project_detail"]?.["inverter_size"] ||
                                ""
                              }
                              onChange={(e, newValue) =>
                                handleChange(
                                  "project_detail",
                                  "inverter_size",
                                  newValue
                                )
                              }
                            >
                              {inverterSizeOptions.map((size) => (
                                <Option key={size} value={size}>
                                  {size}
                                </Option>
                              ))}
                            </Select>
                          </Grid>
                        </>
                      )}
                    </>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Work By Slnko
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
                      Site Topography Survey
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
                      Soil Testing
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
                      CEIG/CEG Scope
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
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      Project Completion Date
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
                      Agreement Date
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
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Proposed DC Capacity (kWp)
                    </Typography>
                    <Input
                      value={formData.project_detail.proposed_dc_capacity}
                      placeholder="Proposed DC Capacity (kWp)"
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "proposed_dc_capacity",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Proposed AC Capacity (kWp)
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
                      Transmission Line
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

                  {["superadmin", "admin", "executive", "visitor"].includes(
                    user?.role
                  ) && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                        >
                          Tariff Rate
                        </Typography>
                        <Input
                          value={formData.project_detail.tarrif}
                          placeholder="Tariff Rate"
                          onChange={(e) =>
                            handleChange(
                              "project_detail",
                              "tarrif",
                              e.target.value
                            )
                          }
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          level="body1"
                          sx={{ fontWeight: "bold", marginBottom: 1 }}
                        >
                          Land Availables
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
                    </>
                  )}
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

                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Overloading
                    </Typography>
                    <Input
                      value={formData.project_detail.overloading}
                      placeholder="Overloading"
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "overloading",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                </>
              )}

              {/* Handle special case for Attached Details */}
              {section.name === "Attached Details" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      level="body1"
                      sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                    >
                      TakenOver By
                    </Typography>
                    <Select
                      fullWidth
                      value={formData?.attached_details?.taken_over_by || ""}
                      onChange={(e, newValue) =>
                        handleChange(
                          "attached_details",
                          "taken_over_by",
                          newValue
                        )
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
                      value={formData.attached_details.cam_member_name}
                      placeholder="CAM Member Name"
                      onChange={(e) =>
                        handleChange(
                          "attached_details",
                          "cam_member_name",
                          e.target.value
                        )
                      }
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
                          Slnko Service Charges (incl. GST)
                        </Typography>
                        <Input
                          value={formData.attached_details.service}
                          placeholder="Slnko Service Charge"
                          onChange={(e) =>
                            handleChange(
                              "attached_details",
                              "service",
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                        >
                          Billing Type
                        </Typography>
                        <Autocomplete
                          options={BillingTypes}
                          value={formData?.attached_details?.billing_type}
                          onChange={(e, value) =>
                            handleAutocompleteChange(
                              "attached_details",
                              "billing_type",
                              value
                            )
                          }
                          getOptionLabel={(option) => option || ""}
                          isOptionEqualToValue={(option, value) =>
                            option === value
                          }
                          placeholder="Billing Type"
                          required
                          sx={{ width: "100%" }}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      LOA Number
                    </Typography>
                    <Input
                      value={formData.attached_details.loa_number}
                      placeholder="LOA Number"
                      onChange={(e) =>
                        handleChange(
                          "attached_details",
                          "loa_number",
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      PPA Number
                    </Typography>
                    <Input
                      value={formData.attached_details.ppa_number}
                      placeholder="PPA Number"
                      onChange={(e) =>
                        handleChange(
                          "attached_details",
                          "ppa_number",
                          e.target.value
                        )
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      HandedOver By
                    </Typography>
                    <Input
                      value={formData.attached_details.submitted_by_BD}
                      onChange={(e) =>
                        handleChange(
                          "attached_details",
                          "submitted_by_BD",
                          e.target.value
                        )
                      }
                      readOnly
                    />
                  </Grid>
                  {["superadmin", "admin", "executive", "visitor"].includes(
                    user?.role
                  ) && (
                    <Grid item xs={12} sm={6}>
                      <Typography
                        sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                      >
                        Submitted By
                      </Typography>
                      <Input
                        value={formData.submitted_by}
                        onChange={(e) =>
                          handleChange("submitted_by", e.target.value)
                        }
                        readOnly
                      />
                    </Grid>
                  )}
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
                    readOnly
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Buttons */}
      <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
        <Grid item xs={6} sm={4} md={3}>
          <Button
            onClick={handlePrint} // 👈 Replace with your print function
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
