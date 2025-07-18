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
import { formatDate } from "date-fns";

const AddPurchaseOrder = ({
  onClose,
  pr_id,
  item_id,
  project_id,
  item_name,
  other_item_name,
  project_code,
}) => {
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

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    if (userData && userData.name) {
      setFormData((prev) => ({ ...prev, submitted_By: userData.name }));
    }
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const [formData, setFormData] = useState({
    p_id: project_code,
    code: "",
    po_number: "",
    name: "",
    date: "",
    item: item_name,
    po_value: "",
    po_basic: "",
    gst: "",
    partial_billing: "",
    other: "",
    submitted_By: "",
    pr_id: pr_id,
  });
  const [projectIDs, setProjectIDs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [showOtherItem, setShowOtherItem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { "x-auth-token": token } };

        const projectsRes = await Axios.get("/get-all-projecT-IT", config);
        // console.log("Project Data: ", projectsRes.data.data);
        setProjectIDs(projectsRes.data.data || []);

        const vendorsRes = await Axios.get("/get-all-vendoR-IT", config);
        // console.log("Vendor Data: ", vendorsRes.data.data);
        setVendors(vendorsRes.data.data || []);

        const itemsRes = await Axios.get("/get-iteM-IT", config);
        const itemsData = itemsRes.data.Data || [];
        const transformedItems = itemsData.map((item) => ({
          value: item.item,
          label: item.item,
        }));

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

    if (name === "po_value" && parseFloat(value) < 0) {
      toast.warning("PO Value can't be Negative !!");
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "po_basic" || name === "gst") {
        const poBasic =
          parseFloat(name === "po_basic" ? value : updated.po_basic) || 0;
        const gst = parseFloat(name === "gst" ? value : updated.gst) || 0;
        const calculatedPoValue = poBasic + gst;

        updated.po_value = calculatedPoValue;
      }

      return updated;
    });
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
    const userData = getUserData();
    if (!userData || !userData.name) {
      toast.error("User details not found. Please log in again.");
      return;
    }
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

const dataToPost = {
  p_id: project_code,
  po_number: formData.po_number,
  vendor: formData.name,
  date: formData.date,
  item: item_name === "Others" ? other_item_name || "Others" : item_id,
  other: "",
  po_value: formData.po_value,
  po_basic: formData.po_basic,
  gst: formData.gst,
  partial_billing: formData.partial_billing || "",
  submitted_By: userData.name,
  pr_id: pr_id,
};



    try {
      const token = localStorage.getItem("authToken");

      await Axios.post("/Add-purchase-ordeR-IT", dataToPost, {
        headers: {
          "x-auth-token": token,
        },
      });

      toast.success("Purchase Order Successfully Added!");
      if (onClose) onClose();
      else navigate("/purchase-order");
      window.location.reload();
      setFormData({
        p_id: "",
        code: "",
        po_number: "",
        name: "",
        date: "",
        item: "",
        po_value: "",
        po_basic: "",
        gst: "",
        partial_billing: "",
        other: "",
        submitted_By: userData.name,
      });
      setShowOtherItem(false);
    } catch (error) {
      console.error("Error posting data:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === "PO Number already used!"
      ) {
        toast.error("PO Number already used. Please enter a unique one.");
      } else {
        toast.error("Something went wrong. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("other", other_item_name);
  

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "background.level1",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          padding: "40px",
          boxShadow: "md",
          borderRadius: "lg",
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
              <Typography level="body1" fontWeight="bold" mb={1}>
                Project ID
              </Typography>
              <Input disabled value={formData.p_id} />
            </Grid>

            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                PO Number
              </Typography>
              <Input
                name="po_number"
                placeholder="PO Number"
                value={formData.po_number}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Vendor
              </Typography>
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
              <Typography level="body1" fontWeight="bold" mb={1}>
                PO Date
              </Typography>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
  <Typography level="body1" fontWeight="bold" mb={1}>
    Item Category
  </Typography>
  <Input
    disabled
    value={
      formData.item === "Others"
        ? other_item_name || "-"
        : formData.item || "-"
    }
  />
</Grid>


            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Basic PO Value (without GST)
              </Typography>
              <Input
                name="po_basic"
                type="text"
                placeholder="PO Value (without GST)"
                value={formData.po_basic}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Total Tax
              </Typography>
              <Input
                name="gst"
                type="text"
                placeholder="CGST + SGST"
                value={formData.gst}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Total PO Value (with GST)
              </Typography>
              <Input
                name="po_value"
                type="text"
                placeholder="PO Value (with GST)"
                value={formData.po_value}
                onChange={handleChange}
                required
              />
            </Grid>

            {showOtherItem && (
              <Grid xs={12} md={4}>
                <Typography level="body1" fontWeight="bold" mb={1}>
                  Other Item Name
                </Typography>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              color="primary"
              variant="solid"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button
              color="neutral"
              variant="soft"
              href="po_dashboard.php"
              sx={{ ml: 2 }}
              onClick={() =>
                onClose ? onClose() : navigate("/purchase-order")
              }
            >
              Back
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AddPurchaseOrder;
