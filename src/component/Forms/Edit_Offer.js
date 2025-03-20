import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Input,
  Select,
  Option,
  Typography,
  FormControl,
  FormLabel,
  Sheet
} from "@mui/joy";
import { toast } from "react-toastify";
import {
  useGetOfferQuery,
  useUpdateOfferMutation,
} from "../../redux/commsSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const CommercialForm = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const { data: getOffer, isLoading, error } = useGetOfferQuery();
  const [formData, setFormData] = useState({});

  // Handle form submission

  useEffect(() => {
    if (isLoading || !getOffer) return;
  
    const getOfferArray = Array.isArray(getOffer) ? getOffer : [];

    console.log(getOfferArray);
    
  
    if (!Array.isArray(getOfferArray)) {
      console.error("Error: Extracted getOffer data is not an array.");
      return;
    }
  
    const LeadId = localStorage.getItem("offer_edit");
  
    if (!LeadId) {
      console.error("Invalid Lead ID retrieved from localStorage.");
      return;
    }
  
    const selectedLead = getOfferArray.find(
      (item) => (item.offer_id) === LeadId
    );
  
    if (!selectedLead) {
      console.error(`No matching offerid found for ID: ${LeadId}`);
      return;
    }
  
    console.log("Matching Lead Found:", selectedLead);
  
    setFormData((prev) => ({
      ...prev,
      ...selectedLead,
    }));
  }, [getOffer, isLoading]);

  const calculateDcCapacity = (ac, dc) => {
    const acValue = parseFloat(ac);
    const dcValue = parseFloat(dc) / 100;
    if (!isNaN(acValue) && !isNaN(dcValue)) {
      return (acValue * (1 + dcValue)).toFixed(3);
    }
    return "";
  };

  const handleChange = (eOrField, value) => {
    if (typeof eOrField === "string") {
      // Handling MUI Joy Select (no event, just field name and value)
      setFormData((prev) => ({ ...prev, [eOrField]: value }));
    } else {
      // Handling normal input elements (with event.target)
      const { name, value } = eOrField.target;
  
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent] ?? {}), // Ensure the nested object exists
            [child]: value,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData || !formData._id) {
      toast.error("Offer Id is missing. Cannot update Comm Offer.");
      return;
    }
  
    try {
      const response = await updateOffer({
        _id: formData._id,
        updatedOffer: formData,
      }).unwrap();
  
      console.log("API Response from updateOffer:", response);
  
      if (response?.data) {
        setFormData((prev) => ({
          ...prev,
          ...response.data,
        }));
      } else {
        console.warn("No updated data received from API");
      }
  
      toast.success(response.msg || "Comm Offer updated successfully.");
      navigate("/comm_offer");
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Oops! Something went wrong.");
    }
  };

  const handleSelectChange = (name, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const getModuleCapacityOptions = () => {
    if (formData.module_type === "P Type") return ["555", "550"];
    if (formData.module_type === "N Type") return ["580", "585"];
    return [];
  };

  useEffect(() => {
    const updatedDcCapacity = calculateDcCapacity(
      formData.ac_capacity,
      formData.dc_overloading
    );
    setFormData((prev) => ({ ...prev, dc_capacity: updatedDcCapacity }));
  }, [formData.ac_capacity, formData.dc_overloading]);

  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 5,
        borderRadius: "lg",
        maxWidth: 800,
        mx: "auto",
        mt: 5,
        boxShadow: 4,
      }}
    >
      <Typography level="h3" mb={4} textAlign="center" fontWeight="bold">
        Commercial Offer Update
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Client Name */}
          <Grid xs={12} sm={12}>
            <FormControl>
              <FormLabel>Client Name</FormLabel>
              <Input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Enter Client Name"
              />
            </FormControl>
          </Grid>

          {/* Location Section */}
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Village Name</FormLabel>
              <Input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter Village Name"
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>District Name</FormLabel>
              <Input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter District Name"
              />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Select a State</FormLabel>
              <Select
                name="state"
                value={formData.state}
                onChange={(e, newValue) =>
                  handleSelectChange("state", newValue)
                }
                placeholder="Select State"
              >
                <Option value="Andhra Pradesh">Andhra Pradesh</Option>
                <Option value="Arunachal Pradesh">Arunachal Pradesh</Option>
                <Option value="Assam">Assam</Option>
                <Option value="Bihar">Bihar</Option>
                <Option value="Chhattisgarh">Chhattisgarh</Option>
                <Option value="Goa">Goa</Option>
                <Option value="Gujarat">Gujarat</Option>
                <Option value="Haryana">Haryana</Option>
                <Option value="Himachal Pradesh">Himachal Pradesh</Option>
                <Option value="Jharkhand">Jharkhand</Option>
                <Option value="Karnataka">Karnataka</Option>
                <Option value="Kerala">Kerala</Option>
                <Option value="Madhya Pradesh">Madhya Pradesh</Option>
                <Option value="Maharashtra">Maharashtra</Option>
                <Option value="Manipur">Manipur</Option>
                <Option value="Meghalaya">Meghalaya</Option>
                <Option value="Mizoram">Mizoram</Option>
                <Option value="Nagaland">Nagaland</Option>
                <Option value="Odisha">Odisha</Option>
                <Option value="Punjab">Punjab</Option>
                <Option value="Rajasthan">Rajasthan</Option>
                <Option value="Sikkim">Sikkim</Option>
                <Option value="Tamil Nadu">Tamil Nadu</Option>
                <Option value="Telangana">Telangana</Option>
                <Option value="Tripura">Tripura</Option>
                <Option value="Uttar Pradesh">Uttar Pradesh</Option>
                <Option value="Uttarakhand">Uttarakhand</Option>
                <Option value="West Bengal">West Bengal</Option>
                <Option value="Andaman and Nicobar Islands">
                  Andaman and Nicobar Islands
                </Option>
                <Option value="Chandigarh">Chandigarh</Option>
                <Option value="Dadra and Nagar Haveli and Daman and Diu">
                  Dadra and Nagar Haveli and Daman and Diu
                </Option>
                <Option value="Lakshadweep">Lakshadweep</Option>
                <Option value="Delhi">Delhi</Option>
                <Option value="Puducherry">Puducherry</Option>
                <Option value="Ladakh">Ladakh</Option>
                <Option value="Jammu and Kashmir">Jammu and Kashmir</Option>
                <Option value="Nagaland">Nagaland</Option>
              </Select>
            </FormControl>
          </Grid>

          {/* Pin Code */}
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Pin Code</FormLabel>
              <Input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter Pin Code"
              />
            </FormControl>
          </Grid>

          {/* Scheme */}
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel>Scheme</FormLabel>
              <Select
                name="scheme"
                value={formData.scheme}
                onChange={(e, newValue) =>
                  handleSelectChange("scheme", newValue)
                }
                placeholder="Scheme"
              >
                <Option value="KUSUM">KUSUM</Option>
                <Option value="Others">Others</Option>
              </Select>
            </FormControl>
          </Grid>

          {/* Component */}
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel>Component</FormLabel>
              <Select
                name="component"
                value={formData.component}
                onChange={(e, newValue) =>
                  handleSelectChange("component", newValue)
                }
                placeholder="Component"
                disabled={formData.scheme === "Others"}
              >
                <Option value="A">A</Option>
                <Option value="C">C</Option>
                <Option value="C2">C(2)</Option>
              </Select>
            </FormControl>
          </Grid>

          {/* Rate */}
          {/* <Grid xs={12} sm={6}>
                    <FormControl>
                        <FormLabel>Rate</FormLabel>
                        <Input type="number" name="rate" value={formData.rate} onChange={handleChange} placeholder="Rate" />
                    </FormControl>
                </Grid> */}

          {/* Timeline */}
          <Grid xs={12} sm={12}>
            <FormControl>
              <FormLabel>Timeline (Weeks)</FormLabel>
              <Input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="Timeline"
              />
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <hr />
          </Grid>

          {/* Plant AC Capacity */}
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Plant AC Capacity (MW)</FormLabel>
              <Input
                type="number"
                name="ac_capacity"
                value={formData.ac_capacity}
                onChange={handleChange}
                placeholder="Enter Plant AC Capacity"
              />
            </FormControl>
          </Grid>

          {/* DC Overloading */}
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>DC Overloading (%)</FormLabel>
              <Input
                type="number"
                name="dc_overloading"
                value={formData.dc_overloading}
                onChange={handleChange}
                placeholder="Enter DC Overloading (%)"
              />
            </FormControl>
          </Grid>

          {/* Plant DC Capacity */}
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel>Plant DC Capacity (MWp)</FormLabel>
              <Input
                type="text"
                name="dc_capacity"
                value={formData.dc_capacity}
                readOnly
                placeholder="Calculated Automatically"
              />
            </FormControl>
          </Grid>

          {/* Transmission Line Length */}
          {[
            {
              label: "Transmission Line Length (km)",
              name: "transmission_length",
            },
          ].map((field, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <FormControl>
                <FormLabel>{field.label}</FormLabel>
                <Input
  type="number"
  name={field.name}
  placeholder={`Enter ${field.label}`}
  value={formData.transmission_length !== undefined ? formData.transmission_length : ""}
  onChange={handleChange}
/>

              </FormControl>
            </Grid>
          ))}

          {/* Dropdown fields */}
          {[
            {
              label: "Module Orientation",
              name: "module_orientation",
              options: ["Landscape", "Portrait", "Agrivoltaic Dropdown"],
            },
            {
              label: "Evacuation Voltage Level (kV)",
              name: "evacuation_voltage",
              options: [11, 33],
            },
            {
              label: "Inverter Capacity (kVA)",
              name: "inverter_capacity",
              options: [275, 295, 302],
            },
            {
              label: "Transformer",
              name: "transformer",
              options: ["OCTC", "OLTC"],
            },
          ].map((field, index) => (
            <Grid xs={12} sm={6} key={index}>
              <FormControl>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e, newValue) =>
                    handleSelectChange(field.name, newValue)
                  } // Corrected change handler
                  placeholder={`Select ${field.label}`}
                >
                  {field.options.map((option, i) => (
                    <Option key={i} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Module Type</FormLabel>
              <Select
  name="module_type"
  value={formData.module_type || ""}
  onChange={(_, newValue) => handleChange("module_type", newValue)} // No event, just field & value
  placeholder="Select Module Type"
>
  <Option value="P Type">P Type</Option>
  <Option value="N Type">N Type</Option>
</Select>

            </FormControl>
          </Grid>
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Module Capacity</FormLabel>
              <Select
  name="module_capacity"
  value={formData.module_capacity !== undefined ? String(formData.module_capacity) : ""}
  onChange={(e, newValue) => handleSelectChange("module_capacity", Number(newValue))}
  placeholder="Select Module Capacity"
  disabled={!formData.module_type}
>
  {getModuleCapacityOptions().map((cap, idx) => (
    <Option key={idx} value={String(cap)}>
      {cap}
    </Option>
  ))}
</Select>

            </FormControl>
          </Grid>
          {/* Prepared By */}
          <Grid xs={12} sm={12}>
            <FormControl>
              <FormLabel>Prepared By</FormLabel>
              <Input
                type="text"
                name="prepared_by"
                value={formData.prepared_by}
                onChange={handleChange}
                placeholder="Prepared By"
                readOnly
              />
            </FormControl>
          </Grid>
          <Grid xs={12}>
                      <Box textAlign="center" sx={{ mt: 3 }}>
                        <Button type="submit" variant="solid" loading={isLoading}>
                          Update
                        </Button>
                        <Button
                          variant="soft"
                          color="neutral"
                          sx={{ ml: 2 }}
                          onClick={() => navigate("/comm_offer")}
                        >
                          Back
                        </Button>
                      </Box>
                    </Grid>
        </Grid>
      </form>
    </Sheet>
  );
};

export default CommercialForm;
