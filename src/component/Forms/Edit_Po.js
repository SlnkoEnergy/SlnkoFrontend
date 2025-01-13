import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Input,
  Button,
  FormControl,
  Typography,
  Box,
  MenuItem,
} from "@mui/joy";
import Select from "react-select";
import Axios from "../../utils/Axios";
import Img7 from "../../assets/update-po.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePurchaseOrder = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    p_id: "",
    code: "",
    po_number: "",
    vendor: "",
    date: "",
    item: "",
    po_value: "",
    other: "",
    partial_billing: "",
    comment: "",
  });
  const [projectIDs, setProjectIDs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [showOtherItem, setShowOtherItem] = useState(false);
  const [allPo, setAllPo] = useState([]);
  const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = getUserData();
        setUser(userData);
        console.log("details are :", userData);

        const poNumberFromStorage = localStorage.getItem("get-po");
        console.log("Pos are: ", poNumberFromStorage);

        if (!poNumberFromStorage) {
          console.error("PO number not found in localStorage");
          return;
        }

        const projectsRes = await Axios.get("get-all-project");
        setProjectIDs(projectsRes.data.data || []);
        console.log("All projects are:", projectsRes.data);

        const vendorsRes = await Axios.get("/get-all-vendor");
        setVendors(vendorsRes.data.data || []);

        const itemsRes = await Axios.get("get-item");
        setItems([...itemsRes.data.Data, "Other"]);

        const poRes = await Axios.get("/get-all-po");
        setAllPo(poRes.data.data || []);

        const poData = poRes.data.data.find(
          (item) => item.po_number === poNumberFromStorage
        );

        if (poData) {
          setFormData((prev) => ({
            ...prev,
            p_id: poData.p_id || "-",
            po_number: poData.po_number || "-",
            vendor: poData.vendor || "-",
            item: poData.item || "-",
            date: poData.date || "-",
            po_value: poData.po_value || "-",
            partial_billing: poData.partial_billing || "-",
            comment: poData.comment || "-",
          }));
        } else {
          console.log("PO not found for the stored PO number");
        }

        console.log("Fetched Purchase Orders:", poRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    console.log("Only this needed :", userData);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, newValue) => {
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
    console.log("Submitting form with data:", formData);

    try {
      setLoading(true);
      setError("");

      // Ensure we have the correct ID before sending the request
      if (!formData._id) {
        setError("Project ID is missing. Cannot update project.");
        return;
      }

      // Send the PUT request to update the project
      const response = await Axios.put(
        `/edit-po/${formData._id}`,
        formData
      );
      console.log("API Response:", response);

      if (response && response.data) {
        console.log("PO updated successfully:", response.data);
        // alert("Project updated successfully.");
        toast.success("PO updated successfully.");
        navigate("/purchase-order")
      }
    } catch (err) {
      console.error("Error during po update:", err);
      toast.error("oops!! something went wrong..")
      setError("Failed to update po. Please try again later.");
    } finally {
      setLoading(false);
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
        maxWidth="md"
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          p: 4,
        }}
      >
        <Box textAlign="center" mb={3}>
          <img
            src={Img7}
            alt="logo-icon"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#12263f" }}>
            Update Purchase Order
          </Typography>
          {/* <Typography variant="subtitle2" color="textSecondary">
            Update Purchase Order Details
          </Typography> */}
          <hr style={{ width: "50%", margin: "auto", marginTop: 10 }} />
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Project ID:
              </Typography>
              <FormControl>
                {user?.name === "IT Team" ? (
                  <Select
                    options={projectIDs.map((project, index) => ({
                      label: project.code,
                      value: project.code,
                      key: `${project.code}-${index}`,
                    }))}
                    value={formData.code ? { label: formData.code } : null}
                    onChange={(selectedOption) =>
                      handleSelectChange("code", selectedOption?.value || "")
                    }
                    placeholder="Select Project Id"
                    required
                  />
                ) : (
                  <Input
                    name="p_id"
                    value={formData.p_id}
                    onChange={handleChange}
                    required
                  />
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
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

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Vendor
              </Typography>
              <FormControl>
                <Select
                  options={vendors.map((vendor, index) => ({
                    label: vendor.name,
                    value: vendor.name,
                    key: `${vendor.name}-${index}`,
                  }))}
                  value={formData.vendor ? { label: formData.vendor } : null}
                  onChange={(selectedOption) =>
                    handleSelectChange("vendor", selectedOption?.value || "")
                  }
                  placeholder="Select Vendor"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
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

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Item
              </Typography>
              <FormControl>
                <Select
                  options={items.map((item, index) => ({
                    label: typeof item === "object" ? item.item : item,
                    value: typeof item === "object" ? item.item : item,
                    key: `${typeof item === "object" ? item.item : item}-${index}`,
                  }))}
                  value={formData.item ? { label: formData.item } : null}
                  onChange={(selectedOption) =>
                    handleSelectChange("item", selectedOption?.value || "")
                  }
                  placeholder="Select Item"
                  required
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                PO Value (with GST)
              </Typography>
              <Input
                name="po_value"
                placeholder="PO Value (with GST)"
                type="number"
                value={formData.po_value}
                onChange={handleChange}
                required
              />
            </Grid>

            {showOtherItem && (
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="secondary"
                  fontWeight={"bold"}
                  sx={{ mb: 1 }}
                >
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

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Partial Billing
              </Typography>
              <FormControl>
              <Select
    name="partial_billing"
    value={formData.partial_billing}
    onChange={handleChange}

  >
    <MenuItem value="Yes">Yes</MenuItem>
    <MenuItem value="No">No</MenuItem>
  </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Comments (Why Changes?)
              </Typography>
              <Input
                name="comments"
                placeholder="Comments (Why Changes?)"
                value={formData.comment}
                onChange={handleChange}
              
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button type="submit" color="primary" sx={{ mx: 1 }}>
              Submit
            </Button>
            <Button
              variant="soft"
              color="neutral"
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

export default UpdatePurchaseOrder;
