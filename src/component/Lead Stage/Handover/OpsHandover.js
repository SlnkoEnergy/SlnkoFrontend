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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Img1 from "../../../assets/HandOverSheet_Icon.jpeg";
import {
  useGetHandOverByIdQuery,
  useGetHandOverQuery,
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
      site_address: {
        village_name: "",
        district_name: "",
      },
      number: "",
      p_group: "",
      state: "",
      alt_number: "",
    },

    order_details: {
      type_business: "",
    },

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
      remark: "",
      remarks_for_slnko: "",
      submitted_by_BD: "",
    },
    submitted_by: "",
    status_of_handoversheet: "draft",
  });

  // const [handoverId, setHandoverId] = useState(null);

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

  useEffect(() => {}, [ModuleMaster, MasterInverter]);

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

  // useEffect(() => {
  //   const userData = getUserData();
  //   if (userData && userData.name) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       other_details: {
  //         ...prev.other_details,
  //         submitted_by_BD: userData.name,
  //       },
  //       submitted_by: userData.name,
  //     }));
  //   }
  //   setUser(userData);
  // }, []);

  // const getUserData = () => {
  //   const userData = localStorage.getItem("userDetails");
  //   return userData ? JSON.parse(userData) : null;
  // };

  const LeadId = sessionStorage.getItem("approvalInfo");

  // console.log("LeadId:", LeadId);

  const {
    data: getHandOverSheet,
    isLoading,
    isError,
    error,
  } = useGetHandOverByIdQuery(
    { leadId: LeadId },
    {
      skip: !LeadId,
    }
  );

  const handoverData = getHandOverSheet?.data ?? null;

  console.log("Handover Data:", handoverData);

  useEffect(() => {
    if (!handoverData && !isLoading && !error) {
      console.warn("No matching handover data found.");
    } else if (handoverData) {
      console.log("Fetched handover data:", handoverData);
    }
  }, [handoverData, isLoading, error]);

  useEffect(() => {
    if (getHandOverSheet?.data) {
      setFormData((prev) => ({
        // _id: getHandOverSheet.data._id,
        ...prev,
        ...getHandOverSheet.data,

        customer_details: {
          ...prev.customer_details,
          ...getHandOverSheet.data.customer_details,
        },
        order_details: {
          ...prev.order_details,
          ...getHandOverSheet.data.order_details,
        },
        project_detail: {
          ...prev.project_detail,
          ...getHandOverSheet.data.project_detail,
        },
        commercial_details: {
          ...prev.commercial_details,
          ...getHandOverSheet.data.commercial_details,
        },
        other_details: {
          ...prev.other_details,
          ...getHandOverSheet.data.other_details,
        },
      }));
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
        ...prev.project_detail,
        proposed_dc_capacity: updatedDcCapacity,
      },
      other_details: {
        ...prev.other_details,
        service: calculated,
      },
    }));
    //    if (!isNaN(serviceAmount)) {
    //   let gstPercentage = 0;
    //   if (billingType === "Composite") {
    //     gstPercentage = 13.8;
    //   } else if (billingType === "Individual") {
    //     gstPercentage = 18;
    //   }

    //   if (gstPercentage > 0) {
    //     const totalGST = Math.round(serviceAmount * (1 + gstPercentage / 100));
    //     setFormData((prev) => ({
    //       ...prev,
    //       other_details: {
    //         ...prev.other_details,
    //         total_gst: totalGST,
    //       },
    //     }));
    //   }
    // }

    if (!isNaN(serviceAmount)) {
      let gstPercentage = 0;
      if (billingType === "Composite") {
        gstPercentage = 13.8;
      } else if (billingType === "Individual") {
        gstPercentage = 18;
      }

      if (gstPercentage > 0) {
        const totalGST = (serviceAmount * (1 + gstPercentage / 100)).toFixed(0);
        setFormData((prev) => ({
          ...prev,
          other_details: {
            ...prev.other_details,
            total_gst: totalGST,
          },
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
        // p_id: formData.p_id,
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

      await updateHandOver(updatedFormData).unwrap();

      toast.success("HandOver Sheet updated and submitted successfully");
      navigate("/cam_dash");
    } catch (error) {
      if (error.name === "ValidationError") {
        error.inner.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        const errorMessage =
          error?.data?.message || error?.message || "Submission failed";
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
            color: "white",
            fontWeight: "bold",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            paddingY: 1.5,
            paddingX: 2,
            "& .MuiTypography-root": {
              fontWeight: "bold",
              fontSize: "1.3rem",
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: "white",
            },
          }}
        >
          <Typography>Internal Ops</Typography>
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
                    ? "Total Slnko Service Charge(with GST)"
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
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            color: "white",
            fontWeight: "bold",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            paddingY: 1.5,
            paddingX: 2,
            "& .MuiTypography-root": {
              fontWeight: "bold",
              fontSize: "1.3rem",
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: "white",
            },
          }}
        >
          <Typography>BD</Typography>
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
                      ...formData.customer_details.site_address,
                      village_name: e.target.value,
                    });
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

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
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
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Buttons */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <Button
            onClick={() => navigate("/handover_dash")}
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

export default OpsHandoverSheetForm;
