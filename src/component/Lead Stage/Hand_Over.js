import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Input,
  Button,
  MenuItem,
  Sheet,
  Select,
  Option,
} from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Img1 from "../../assets/HandOverSheet_Icon.jpeg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAddHandOverMutation,
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
} from "../../redux/leadsSlice";

const HandoverSheetForm = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({
    id:"",
    customer_details: {
      project_id: "",
      project_name: "",
      epc_developer: "",
      site_address_pincode: "",
      site_google_coordinates: "",
      contact_no: "",
      gst_no: "",
      billing_address: "",
    },
    order_details: {
      type_business: "",
      tender_name: "",
      discom_name: "",
      design_date: "",
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
      transmission_line: "",
      substation_name: "",
      overloading: "",
    },
    commercial_details: {
      type: "",
      subsidy_amount: "",
    },
    attached_details: {
      taken_over_by: "",
      cam_member_name: "",
      loa_number: "",
      ppa_number: "",
      submitted_by_BD: "",
    },
  });
  const [moduleMakeOptions, setModuleMakeOptions] = useState([]);
  const [moduleTypeOptions, setModuleTypeOptions] = useState([]);
  const [moduleModelOptions, setModuleModelOptions] = useState([]);
  const [moduleCapacityOptions, setModuleCapacityOptions] = useState([]);
  const [inverterMakeOptions, setInverterMakeOptions] = useState([]);
  const [inverterSizeOptions, setInverterSizeOptions] = useState([]);
  const [inverterModelOptions, setInverterModelOptions] = useState([]);
  const [inverterTypeOptions, setInverterTypeOptions] = useState([]);
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

  const [HandOverSheet] = useAddHandOverMutation();

  useEffect(() => {
    if (ModuleMaster.length > 0) {
      setModuleMakeOptions([
        ...new Set(ModuleMaster.map((item) => item.make).filter(Boolean)),
      ]);
      setModuleTypeOptions([
        ...new Set(ModuleMaster.map((item) => item.type).filter(Boolean)),
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
      }));
    }
    setUser(userData);
  }, []);



  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    return userData ? JSON.parse(userData) : null;
  };
const LeadId = localStorage.getItem("hand_Over");

const handleSubmit = async () => {
  try {
    if (!LeadId) {
      toast.error("Lead ID is missing!");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      id: LeadId,
      attached_details: {
        ...prev.attached_details,
        submitted_by_BD: prev.attached_details.submitted_by_BD || user?.name || "", 
      },
    }));

    const uploadData = {
      ...formData,
      id: LeadId, 
    };

    const response = await HandOverSheet(uploadData).unwrap();
    toast.success("Form submitted successfully");
    navigate("/leads");
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("Submission failed");
  }
};


  const sections = [
    {
      name: "Customer Details",
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
                      value={formData.customer_details.project_id}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "project_id",
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
                      Name
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Name"
                      value={formData.customer_details.project_name}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "project_name",
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
                      Site Address with Pin Code
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Site Address with Pin Code"
                      value={formData.customer_details.site_address_pincode}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "site_address_pincode",
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
                      value={formData.customer_details.contact_no}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "contact_no",
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
                      placeholder="Billing Address"
                      value={formData.customer_details.billing_address}
                      onChange={(e) =>
                        handleChange(
                          "customer_details",
                          "billing_address",
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
                    </Select>
                  </Grid>

                  {/* Integrated Order Details Fields */}
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Tender Name
                    </Typography>
                    <Input
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
                      DISCOM Name
                    </Typography>
                    <Input
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
                      Preliminary Design Sign-off Date
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
                      Type
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
                      Solar Module Make & Capacity
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Select Module Make & Capacity"
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
                      <Option value="NA">NA</Option>
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
                              Module Model No
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
                              {moduleModelOptions.length > 0 ? (
                                moduleModelOptions.map((model, index) => (
                                  <Option key={index} value={model}>
                                    {model}
                                  </Option>
                                ))
                              ) : (
                                <Option disabled>No options available</Option>
                              )}
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
                      Solar Inverter Make & Capacity
                    </Typography>
                    <Select
                      fullWidth
                      placeholder="Select Inverter Make & Capacity"
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
                      <Option value="NA">NA</Option>
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
                    <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                      Proposed DC Capacity (KWp)
                    </Typography>
                    <Input
                      value={formData.project_detail.proposed_dc_capacity}
                      placeholder="Proposed DC Capacity (KWp)"
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
                      Transmission Line
                    </Typography>
                    <Input
                      value={formData.project_detail.transmission_line}
                      placeholder="Transmission Line"
                      onChange={(e) =>
                        handleChange(
                          "project_detail",
                          "transmission_line",
                          e.target.value
                        )
                      }
                    />
                  </Grid>

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
                      value={
                        formData["attached_details"]?.["taken_over_by"] || ""
                      }
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
                      // placeholder="Overloading"
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
            onClick={() => navigate("/leads")}
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

export default HandoverSheetForm;
