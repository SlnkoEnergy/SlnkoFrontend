import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Input,
  Autocomplete,
  Grid,
  Container,
  Divider,
} from "@mui/joy";
import Img7 from "../../assets/pay-request.png";
import Axios from "../../utils/Axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
    }),
  };
  const [formData, setFormData] = useState({
    p_id: "",
    code: "",
    po_number: "",
    name: "",
    date: "",
    item: "",
    po_value: "",
    other: "",
    submitted_by:""
  });
  const [projectIDs, setProjectIDs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [showOtherItem, setShowOtherItem] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsRes = await Axios.get("/get-all-project");
        console.log("Project Data: ", projectsRes.data.data);
        setProjectIDs(projectsRes.data.data || []);
  
        // Fetch vendors
        const vendorsRes = await Axios.get("/get-all-vendor");
        console.log("Vendor Data: ", vendorsRes.data.data);
        setVendors(vendorsRes.data.data || []);
  
        // Fetch items
        const itemsRes = await Axios.get("/get-item");
        const itemsData = itemsRes.data.Data || [];
        const transformedItems = itemsData.map((item) => ({
          value: item.item, // Adjust this based on your API structure
          label: item.item,
        }));
        // Add "Other" as an additional option
        setItems([...transformedItems, { value: "Other", label: "Other" }]);
  
        console.log("Items Data: ", transformedItems);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
  
    fetchData();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if(name === "po_value" && value < 0){
      toast.warning("PO Value can't be Negative !!")
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (field, newValue, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue || "",
      ...(field === "code" && {
        p_id:
          projectIDs.find((project) => project.code === newValue)?.code || "",
      }),
    }));
    if (field === "item" && newValue === "Other") {
      setShowOtherItem(true);
    } else if (field === "item") {
      setShowOtherItem(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToPost = {
      p_id: formData.code,
      po_number: formData.po_number,
      vendor: formData.name,
      date: formData.date,
      item: formData.item === "Other" ? "other" : formData.item,
      other: formData.item === "Other" ? formData.other : "",
      po_value: formData.po_value,
    };

    try {
      const response = await Axios.post("/Add-purchase-order", dataToPost);
      console.log("Add Po:", response);
      toast.success("Purchase Order Successfully !!");
      navigate("/purchase-order");
      // alert("PO added successfully!");
      setFormData({
        p_id: "",
        code: "",
        po_number: "",
        name: "",
        date: "",
        item: "",
        po_value: "",
        other: "",
        submitted_by:""
      });
      setShowOtherItem(false);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
        padding: 3,
      }}
    >
      <Container
        sx={{
          boxShadow: "lg",
          padding: 4,
          borderRadius: "md",
          backgroundColor: "background.surface",
        }}
      >
        <Box textAlign="center" mb={3}>
          <img src={Img7} alt="logo-icon" style={{ height: "50px" }} />
          <Typography level="h4" fontWeight="bold">
            Add Purchase Order
          </Typography>
          <Typography level="body2" textColor="text.secondary">
            Add Purchase Order Details
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <Select
                styles={customStyles}
                options={projectIDs.map((project) => ({
                  value: project.code,
                  label: project.code,
                }))}
                value={
                  formData.code
                    ? { value: formData.code, label: formData.code }
                    : null
                }
                onChange={(selectedOption) =>
                  handleAutocompleteChange("code", selectedOption?.value || "")
                }
                placeholder="Select Project ID"
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Input
                name="po_number"
                placeholder="PO Number"
                value={formData.po_number}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Select
                styles={customStyles}
                options={vendors.map((vendor) => ({
                  value: vendor.name,
                  label: vendor.name,
                }))}
                value={
                  formData.name
                    ? { value: formData.name, label: formData.name }
                    : null
                }
                onChange={(selectedOption) =>
                  handleAutocompleteChange("name", selectedOption?.value || "")
                }
                placeholder="Select Vendor"
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
            <Select
    options={[...items, { value: "Other", label: "Other" }]}
    value={formData.item ? { value: formData.item, label: formData.item } : null}
    onChange={(selectedOption) =>
      handleAutocompleteChange("item", selectedOption?.value || "")
    }
    placeholder="Select Item"
  />
            </Grid>

            <Grid xs={12} md={4}>
              <Input
                name="po_value"
                type="number"
                placeholder="PO Value (with GST)"
                value={formData.po_value}
                onChange={handleChange}
                required
              />
            </Grid>

            {showOtherItem && (
              <Grid xs={12}>
                <Input
                  name="other"
                  placeholder="Other Item Name"
                  value={formData.other}
                  onChange={handleChange}
                  required
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button type="submit" color="primary" variant="solid">
              Submit
            </Button>
            <Button
              color="neutral"
              variant="soft"
              href="po_dashboard.php"
              sx={{ ml: 2 }}
              onClick={() => navigate("/purchase-order")}
            >
              Back
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default AddPurchaseOrder;
