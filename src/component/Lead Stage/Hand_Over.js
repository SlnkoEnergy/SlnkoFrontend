import React, { useState, useEffect } from "react";
import axios from "axios";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Input, Button, Sheet, Select, Option } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Img1 from "../../assets/HandOverSheet_Icon.jpeg";


const HandoverSheetForm = ({ onBack }) => {
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({});
  const [moduleMakeOptions, setModuleMakeOptions] = useState([]);
  const [moduleCapacityOptions, setModuleCapacityOptions] = useState([]);
  const [inverterMakeOptions, setInverterMakeOptions] = useState([]);
  const [inverterTypeOptions, setInverterTypeOptions] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const moduleResponse = await axios.get("/api/master/module");
        setModuleMakeOptions(moduleResponse.data.moduleMake);
        setModuleCapacityOptions(moduleResponse.data.moduleCapacity);
        
        const inverterResponse = await axios.get("/api/master/inverter");
        setInverterMakeOptions(inverterResponse.data.inverterMake);
        setInverterTypeOptions(inverterResponse.data.inverterType);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchMasterData();
  }, []);

  const handleExpand = (panel) => {
    setExpanded(expanded === panel ? null : panel);
  };

  const handleChange = (section, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/handover", formData);
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const sections = [
    {
      name: "Customer Details",
      fields: ["Project ID", "Name", "EPC/Developer", "Site Address with Pin Code", "Site Google Coordinates", "Contact No.", "GST No.", "Billing Address"],
    },
    {
      name: "Order Details",
      fields: ["Tender Name", "DISCOM Name", "Preliminary Design Sign-off Date"],
    },
    {
        name: "Project Details",
        fields: [
          "Proposed DC Capacity (KWp)",
          "Transmission Line",
          "Substation Name",
          "Overloading",
          ],
    },
    {
      name: "Commercial Details",
      fields: [ "Subsidy Amount"],
    },
    {
      name: "Attached Details",
      fields: ["HandedOver By"],
    },
  ];

  return (
    <Sheet
      variant="outlined"
      sx={{ maxWidth: 850, margin: "auto", padding: 4, borderRadius: "md", boxShadow: "lg", backgroundColor: "#F8F5F5" }}
    >
      {/* Icon with Spacing */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <img src={Img1} alt="Handover Icon" style={{ width: 65, height: 65 }} />
      </div>

      {/* Form Title */}
      <Typography level="h3" gutterBottom sx={{ textAlign: "center", marginBottom: 5, fontWeight: "bold" }}>
        Handover Sheet
      </Typography>

      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <Accordion key={index} expanded={expanded === index} onChange={() => handleExpand(index)} sx={{ marginBottom: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#e0e0e0", padding: 1.5 }}>
            <Typography level="h5" sx={{ fontWeight: "bold" }}>{section.name}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 2.5 }}>
            <Grid container spacing={2}>
              {/* Handle special case for "Type of Business" dropdown */}
              {section.name === "Order Details" && (
                <Grid item xs={12} sm={6}>
                  <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Type of Business
                  </Typography>
                  <Select
                    fullWidth
                    placeholder="Select Type of Business"
                    value={formData["Order Details"]?.["Type of Business"] || ""}
                    onChange={(e, newValue) => handleChange("Order Details", "Type of Business", newValue)}
                    sx={{ padding: 1.2, fontSize: "1rem", backgroundColor: "#fff", borderRadius: "md" }}
                  >
                    <Option value="Commercial">Commercial</Option>
                    <Option value="Tender">Tender</Option>
                    <Option value="Consumer">Consumer</Option>
                  </Select>
                </Grid>
              )}
               {/* Handle special case for "Type in Commercial Details */}
              {section.name === "Commercial Details" && (
                <Grid item xs={12} sm={6}>
                  <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    Type 
                  </Typography>
                  <Select
                    fullWidth
                    placeholder="Type"
                    value={formData["Commercial Details"]?.["Type"] || ""}
                    onChange={(e, newValue) => handleChange("Commercial Details", "Type", newValue)}
                    sx={{ padding: 1.2, fontSize: "1rem", backgroundColor: "#fff", borderRadius: "md" }}
                  >
                    <Option value="CapEx">CapEx</Option>
                    <Option value="Resco">Resco</Option>
                    <Option value="OpEx">OpEx</Option>
                    <Option value="Retainership">Retainership</Option>
                  </Select>
                </Grid>
              )}

              {/* Dropdowns for Project Details */}
              {section.name === "Project Details" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Project Type</Typography>
                    <Select
                      fullWidth
                      placeholder="Select Project Type"
                      value={formData["Project Details"]?.["Project Type"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Project Type", newValue)}
                    >
                      <Option value="On-Grid">On-Grid</Option>
                      <Option value="Off-Grid">Off-Grid</Option>
                      <Option value="Hybrid">Hybrid</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Solar Module Make & Capacity</Typography>
                    <Select
                      fullWidth
                      placeholder="Select Module Make & Capacity"
                      value={formData["Project Details"]?.["Solar Module Make & Capacity"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Solar Module Make & Capacity", newValue)}
                    >
                      <Option value="Slnko">Slnko</Option>
                      <Option value="Client">Client</Option>
                      <Option value="NA">NA</Option>
                    </Select>
                  </Grid>
                  {formData["Project Details"]?.["Solar Module Make & Capacity"] === "Slnko" && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Module Make</Typography>
                  <Select
                    fullWidth
                    value={formData["Project Details"]?.["Module Make"] || ""}
                    onChange={(e, newValue) => handleChange("Project Details", "Module Make", newValue)}
                  >
                    {moduleMakeOptions.map((make) => (
                      <Option key={make} value={make}>{make}</Option>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Module Capacity</Typography>
                  <Select
                    fullWidth
                    value={formData["Project Details"]?.["Module Capacity"] || ""}
                    onChange={(e, newValue) => handleChange("Project Details", "Module Capacity", newValue)}
                  >
                    {moduleCapacityOptions.map((capacity) => (
                      <Option key={capacity} value={capacity}>{capacity}</Option>
                    ))}
                  </Select>
                </Grid>
              </>
            )}
                  
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Evacuation Voltage</Typography>
                    <Select
                      fullWidth
                      placeholder="Evacuation Voltage"
                      value={formData["Project Details"]?.["Evacuation Voltage"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Evacuation Voltage", newValue)}
                    >
                      <Option value="11 KV">11 KV</Option>
                      <Option value="33 KV">33 KV</Option>
                      
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Solar Inverter Make & Capacity</Typography>
                    <Select
                      fullWidth
                      placeholder="Select Inverter Make & Capacity"
                      value={formData["Project Details"]?.["Solar Inverter Make & Capacity"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Solar Inverter Make & Capacity", newValue)}
                    >
                      <Option value="Slnko">Slnko</Option>
                      <Option value="Client">Client</Option>
                      <Option value="NA">NA</Option>
                    </Select>
                  </Grid>
                  {formData["Project Details"]?.["Solar Inverter Make & Capacity"] === "Slnko" && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Inverter Make</Typography>
                  <Select
                    fullWidth
                    value={formData["Project Details"]?.["Inverter Make"] || ""}
                    onChange={(e, newValue) => handleChange("Project Details", "Inverter Make", newValue)}
                  >
                    {inverterMakeOptions.map((option) => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography level="body1">Inverter Type</Typography>
                  <Select
                    fullWidth
                    value={formData["Project Details"]?.["Inverter Type"] || ""}
                    onChange={(e, newValue) => handleChange("Project Details", "Inverter Type", newValue)}
                  >
                    {inverterTypeOptions.map((option) => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Select>
                </Grid>
              </>
              
            )}
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Work By Slnko</Typography>
                    <Select
                      fullWidth
                      placeholder="Work By Slnko"
                      value={formData["Project Details"]?.["Work By Slnko"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Work By Slnko", newValue)}
                    >
                      <Option value="Eng">Eng</Option>
                      <Option value="EP">EP</Option>
                      <Option value="PMC">PMC</Option>
                      <Option value="EPMC">EPMC</Option>
                      <Option value="All">All</Option>
                      
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Site Topography Survey</Typography>
                    <Select
                      fullWidth
                      placeholder="Site Topography Survey"
                      value={formData["Project Details"]?.["Site Topography Survey"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Site Topography Survey", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Soil Testing</Typography>
                    <Select
                      fullWidth
                      placeholder="Soil Testing"
                      value={formData["Project Details"]?.["Soil Testing"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Soil Testing", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Purchase & Supply of Net meter</Typography>
                    <Select
                      fullWidth
                      placeholder="Purchase & Supply of Net meter"
                      value={formData["Project Details"]?.["Purchase & Supply of Net meter"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Purchase & Supply of Net meter", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Liaisoning for Net-Metering</Typography>
                    <Select
                      fullWidth
                      placeholder="Liaisoning for Net-Metering"
                      value={formData["Project Details"]?.["Liaisoning for Net-Metering"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "Liaisoning for Net-Metering", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>CEIG/CEG Scope</Typography>
                    <Select
                      fullWidth
                      placeholder="CEIG/CEG Scope"
                      value={formData["Project Details"]?.["CEIG/CEG Scope"] || ""}
                      onChange={(e, newValue) => handleChange("Project Details", "CEIG/CEG Scope", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
  <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
    Project Completion Date
  </Typography>
  <Input
    fullWidth
    type="date"
    value={formData["Project Details"]?.["Project Completion Date"] || ""}
    onChange={(e) => handleChange("Project Details", "Project Completion Date", e.target.value)}
  />
                  </Grid>
                  
                </>
              )}

              {/* Handle special case for Attached Details */}
              {section.name === "Attached Details" && (
                <>
                <Grid item xs={12} sm={6}>
              <Typography level="body1">Final Customer Proposal</Typography>
              <Select
                fullWidth
                value={formData["Attached Details"]?.["Final Customer Proposal"] || ""}
                onChange={(e, newValue) => handleChange("Attached Details", "Final Customer Proposal", newValue)}
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Grid>
            {formData["Attached Details"]?.["Final Customer Proposal"] === "Yes" && (
              <Grid item xs={12} sm={6}>
                <Typography level="body1">Upload Proposal File</Typography>
                <Input type="file" fullWidth />
              </Grid>
            )}

                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>Purchase Order from Client</Typography>
                    <Select
                      fullWidth
                      placeholder="Purchase Order from Client"
                      value={formData["Attached Details"]?.["Purchase Order from Client"] || ""}
                      onChange={(e, newValue) => handleChange("Attached Details", "Purchase Order from Client", newValue)}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                      
                    </Select>
                  </Grid>
                  {formData["Attached Details"]?.["Purchase Order from Client"] === "Yes" && (
              <Grid item xs={12} sm={6}>
                <Typography level="body1">Upload Purchase Order File</Typography>
                <Input type="file" fullWidth />
              </Grid>
            )}

                 

                  <Grid item xs={12} sm={6}>
                    <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>TakenOver By</Typography>
                    <Select
                      fullWidth
                      placeholder="TakenOver By"
                      value={formData["Attached Details"]?.["TakenOver By"] || ""}
                      onChange={(e, newValue) => handleChange("Attached Details", "TakenOver By", newValue)}
                    >
                      <Option value="Projects">Projects</Option>
                      <Option value="CAM">CAM</Option>
                      <Option value="Engineering">Engineering</Option>
                      <Option value="Operations">Operations</Option>
                      <Option value="SCM">SCM</Option>
                      <Option value="ALL">ALL</Option>
                      
                    </Select>
                  </Grid>

                  <Grid item xs={12} sm={6}>
              <Typography level="body1">Order Form</Typography>
              <Input type="file" fullWidth />
            </Grid>
                </>
              )}

              {/* Render other fields with labels */}
              {section.fields.map((field, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Typography level="body1" sx={{ fontWeight: "bold", marginBottom: 0.5 }}>
                    {field}
                  </Typography>
                  <Input
                    fullWidth
                    placeholder={field}
                    value={formData[section.name]?.[field] ?? ""}
                    onChange={(e) => handleChange(section.name, field, e.target.value)}
                    sx={{ padding: 1.2, fontSize: "1rem", backgroundColor: "#fff", borderRadius: "md" }}
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
          <Button onClick={onBack} variant="solid" color="neutral" fullWidth sx={{ padding: 1.5, fontSize: "1rem", fontWeight: "bold" }}>
            Back
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={handleSubmit} variant="solid" color="primary" fullWidth sx={{ padding: 1.5, fontSize: "1rem", fontWeight: "bold" }}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Sheet>
  );
};

export default HandoverSheetForm;