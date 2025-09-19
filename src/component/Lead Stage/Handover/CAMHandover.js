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
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Img1 from "../../../assets/HandOverSheet_Icon.jpeg";
import {
  useGetHandOverByIdQuery,
  useUpdateHandOverMutation,
  useUpdateStatusHandOverMutation,
} from "../../../redux/camsSlice";
import { useGetModuleMasterQuery } from "../../../redux/leadsSlice";

const CamHandoverSheetForm = ({ onBack, p_id }) => {
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
      overloading: "",
      project_kwp: "",
      land: { type: "", acres: "" },
      agreement_date: "",
      project_component: "",
      project_component_other: "",
      transmission_scope: "",
      ppa_expiry_date: "",
      bd_commitment_date: "",
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
  const location = useLocation();
  const isCAMDash = location.pathname === "/project_detail";
  const handlePrint = () => {
    window.print();
  };
  const inverterTypeToSave =
    formData.project_detail.inverter_type === "Other"
      ? formData.project_detail.custom_inverter_type
      : formData.project_detail.inverter_type;

  const [user, setUser] = useState(null);

  const { data: getModuleMaster = [] } = useGetModuleMasterQuery();
  const ModuleMaster = useMemo(
    () => getModuleMaster?.data ?? [],
    [getModuleMaster?.data]
  );

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
  }, [ModuleMaster]);

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

  const [searchParams] = useSearchParams();
  const LeadId = sessionStorage.getItem("submitInfo");
  const id = searchParams.get("id");

  const {
    data: getHandOverSheet,
    isLoading,
    isError,
    error,
  } = useGetHandOverByIdQuery(
    { id: id, p_id: p_id },
    {
      skip: !id && !p_id,
    }
  );
  const handoverData = getHandOverSheet?.data ?? null;

  useEffect(() => {
    if (handoverData) {
      setFormData((prev) => ({
        ...prev,
        ...handoverData,

        customer_details: {
          ...prev.customer_details,
          ...handoverData.customer_details,
        },
        order_details: {
          ...prev.order_details,
          ...handoverData.order_details,
        },
        project_detail: {
          ...prev.project_detail,
          ...handoverData.project_detail,
        },
        commercial_details: {
          ...prev.commercial_details,
          ...handoverData.commercial_details,
        },
        other_details: {
          ...prev.other_details,
          ...handoverData.other_details,
        },
        invoice_detail: {
          ...prev.invoice_detail,
          ...handoverData.invoice_detail,
        },
      }));
    }
  }, [getHandOverSheet]);

  const handoverSchema = Yup.object().shape({
    customer_details: Yup.object().shape({
      email: Yup.string("Enter Email"),
      adharNumber_of_loa_holder: Yup.string().required(
        "Aadhar Number is required"
      ),
      pan_no: Yup.string().required("PAN Number is required"),
    }),
    order_details: Yup.object().shape({
      discom_name: Yup.string().required("DISCOM name is required"),
      // design_date: Yup.string().required(
      //   "Preliminary design sign-off date is required"
      // ),
    }),
    project_detail: Yup.object().shape({
      project_type: Yup.string().required("Project type is required"),
      proposed_dc_capacity: Yup.string().required(
        "Proposed DC Capacity is required"
      ),
      topography_survey: Yup.string().required("Topography survey is required"),
      purchase_supply_net_meter: Yup.string().required(
        "Purchase supply net metering is required"
      ),
      project_completion_date: Yup.string()
        .required("Project Completion Date is required")
        .test(
          "max-90-days",
          "Project Completion Date could not be more than 90 days from today",
          function (value) {
            if (!value) return true;
            const inputDate = new Date(value);
            if (isNaN(inputDate)) return true;
            const today = new Date();
            today.setHours(0,0,0,0);
            const diffMs = inputDate - today;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            return diffDays <= 90;
          }
        ),
    }),
    commercial_details: Yup.object().shape({
      type: Yup.string().required("Commercial type is required"),
    }),

    invoice_detail: Yup.object().shape({
      // invoice_recipient: Yup.string().required("Invoice recipient is required"),
      invoicing_address: Yup.string().required("Invoicing address is required"),
    }),
  });

  useEffect(() => {
    if (!handoverData) {
      console.warn("No matching handover data found.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      _id: handoverData?._id || "",
      p_id: handoverData?.p_id || "",
      customer_details: {
        ...prev.customer_details,
        code: handoverData?.customer_details?.code || "",
        name: handoverData?.customer_details?.name || "",
        customer: handoverData?.customer_details?.customer || "",
        epc_developer: handoverData?.customer_details?.epc_developer || "",
        site_address: handoverData?.customer_details?.site_address || {
          village_name: "",
          district_name: "",
        },
        site_google_coordinates:
          handoverData?.customer_details?.site_google_coordinates || "",
        number: handoverData?.customer_details?.number || "",
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
        land:
          typeof handoverData?.project_detail?.land === "string"
            ? JSON.parse(handoverData.project_detail.land)
            : handoverData?.project_detail?.land || { type: "", acres: "" },
        agreement_date: handoverData?.project_detail?.agreement_date || "",
        project_component:
          handoverData?.project_detail?.project_component || "",
        project_component_other:
          handoverData?.project_detail?.project_component_other || "",
        transmission_scope:
          handoverData?.project_detail?.transmission_scope || "",
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
        total_gst: handoverData?.other_details?.total_gst || "",
        slnko_basic: handoverData?.other_details?.slnko_basic || "",
        billing_type: handoverData?.other_details?.billing_type || "",
        billing_by: handoverData?.other_details?.billing_by || "",
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
        invoicing_GST_status:
          handoverData?.invoice_detail?.invoicing_GST_status || "",
        invoicing_address:
          handoverData?.invoice_detail?.invoicing_address || "",

        msme_reg: handoverData?.invoice_detail?.msme_reg || "",
      },
      submitted_by: handoverData?.submitted_by || "-",
      status_of_handoversheet: handoverData?.status_of_handoversheet,
      is_locked: handoverData?.is_locked,
    }));
  }, [handoverData]);

  const calculateDcCapacity = (ac, overloadingPercent) => {
    const acValue = parseFloat(ac);
    const overloadingValue = parseFloat(overloadingPercent) / 100;
    if (!isNaN(acValue) && !isNaN(overloadingValue)) {
      return (acValue * (1 + overloadingValue)).toFixed(2);
    }
    return "";
  };

  const calculateSlnkoBasic = (kwp, slnko_basic) => {
    const kwpValue = parseFloat(kwp);
    const serviceValue = parseFloat(slnko_basic);
    if (!isNaN(kwpValue) && !isNaN(serviceValue)) {
      return (kwpValue * serviceValue * 1000).toFixed(2);
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
  const [updateStatusHandOver] = useUpdateStatusHandOverMutation();

  const handleSubmit = async () => {
    if (!LeadId || !formData._id) {
      toast.error("Invalid or missing ID!");
      return;
    }

    try {
      await handoverSchema.validate(formData, { abortEarly: false });

      if (
        formData.status_of_handoversheet === "Approved" &&
        formData.is_locked === "locked"
      ) {
        toast.error(
          "This handover sheet cannot be updated because it is locked."
        );
        return;
      }

      const land =
        typeof formData.project_detail?.land === "string"
          ? formData.project_detail.land
          : JSON.stringify(
              formData.project_detail?.land || { type: "", acres: "" }
            );

      const updatedFormData = {
        _id: formData._id,
        customer_details: { ...formData.customer_details },
        order_details: { ...formData.order_details },
        project_detail: {
          ...formData.project_detail,
          land,
        },
        commercial_details: { ...formData.commercial_details },
        other_details: { ...formData.other_details },
        invoice_detail: { ...formData.invoice_detail },
        // status_of_handoversheet: "Approved",
        is_locked: "locked",
        submitted_by: user?.name,
      };

      const statusPayload = {
        _id: formData._id,
        status_of_handoversheet: "Approved",
      };

      await updateHandOver(updatedFormData).unwrap();
      toast.success("Project updated successfully.");

      await updateStatusHandOver(statusPayload).unwrap();
      toast.success("Handover sheet locked.");

      navigate("/cam_dash");
    } catch (error) {
      if (error.name === "ValidationError") {
        error.inner.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Submission Error:", error);
        const errorMessage =
          error?.data?.message || error?.message || "Submission failed";
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
                    handleChange("invoice_detail", "invoicing_GST_no", ""); // Clear input
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
                    value={formData?.project_detail?.inverter_make || ""}
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
                    <Option value="SUNGROW">SUNGROW</Option>
                    <Option value="WATTPOWER">WATTPOWER</Option>
                    <Option value="HITACHI">HITACHI</Option>
                    <Option value="Other">Other</Option>
                  </Select>

                  {formData?.project_detail?.inverter_make === "Other" && (
                    <Input
                      fullWidth
                      placeholder="Enter other make"
                      value={
                        formData?.project_detail?.inverter_make_other || ""
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

                  {/* Show text input if 'Other' is selected */}
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
                Project Completion Date (Slnko) {" "}
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <Input
                fullWidth
                type="date"
                value={(() => {
                  const val = formData.project_detail.project_completion_date;
                  if (!val) return "";
                  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                  const d = new Date(val);
                  if (isNaN(d)) return "";
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                })()}
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

            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                PPA Expiry Date
                <span style={{ color: "red" }}>*</span>
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
              <Typography sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                BD Commitment Date
                <span style={{ color: "red" }}>*</span>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6} mt={1}>
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

      {!isCAMDash && (
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
      )}
    </Sheet>
  );
};

export default CamHandoverSheetForm;
