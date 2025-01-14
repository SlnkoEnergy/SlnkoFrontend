import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  Input,
  MenuItem,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import Img7 from "../../assets/update-po.png";
import Axios from "../../utils/Axios";

const UpdatePurchaseOrder = () => {
  const navigate = useNavigate();

  const [getFormData, setGetFormData] = useState({
    projectIDs: [],
    items: [],
    vendors: [],
    AllPo: [],
  });

  const [formData, setFormData] = useState({
    // _id:"",
    p_id: "",
    // code: "",
    po_number: "",
    vendor: "",
    date: "",
    item: "",
    po_value: "",
    other: "",
    partial_billing: "",
    comment: "",
    submitted_by: "",
  });
  const [projectIDs, setProjectIDs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [showOtherItem, setShowOtherItem] = useState(false);
  const [allPo, setAllPo] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = getUserData();
        setUser(userData);

        const poNumberFromStorage = localStorage.getItem("edit-po");
        if (!poNumberFromStorage) {
          console.error("PO number not found in localStorage");
          return;
        }

        const [projectsRes, vendorsRes, itemsRes, poRes] = await Promise.all([
          Axios.get("/get-all-project"),
          Axios.get("/get-all-vendor"),
          Axios.get("/get-item"),
          Axios.get("/get-all-po"),
        ]);

        setGetFormData({
          projectIDs: projectsRes.data.data || [],
          vendors: vendorsRes.data.data || [],
          items: [...itemsRes.data.Data, "Other"],
          AllPo: poRes.data.data || [],
        });

        const poData = poRes.data.data.find(
          (item) => item.po_number === poNumberFromStorage
        );

        if (poData) {
          setFormData({
            _id: poData._id,
            p_id: poData.p_id || "-",
            code: poData.code || "",
            po_number: poData.po_number || "",
            vendor: poData.vendor || "",
            item: poData.item || "",
            date: poData.date || "",
            po_value: poData.po_value || "",
            partial_billing: poData.partial_billing || "",
          });
          setShowOtherItem(poData.item === "Other");
        } else {
          console.error("PO not found for the stored PO number");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    return userData ? JSON.parse(userData) : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Field:", name, "Value:", value);
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleSelectChange = (field, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue || "",
      ...(field === "p_id" && {
        code:
          projectIDs.find((project) => project.p_id === newValue)?.p_id || "",
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

    // Check if _id is provided
    if (!formData._id) {
      setError("Document ID (_id) is missing. Cannot update PO.");
      toast.error("Document ID is required.");
      return;
    }
    console.log("Submitting with _id:", formData._id);
    try {
      // Show loading state
      setLoading(true);
      setError("");

      // Construct the endpoint dynamically using _id
      const endpoint = `https://api.slnkoprotrac.com/v1/edit-po/${formData._id}`;

      // Send PUT request
      const response = await Axios.put(endpoint, formData);

      // Handle success
      if (response.status === 200) {
        setResponse(response.data);
        toast.success("PO updated successfully.");
        navigate("/purchase-order");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      // Handle errors
      console.error("Error updating PO:", err);
      setError(
        err.response?.data?.message || "Failed to update PO. Please try again."
      );
      toast.error(
        err.response?.data?.message || "Failed to update PO. Please try again."
      );
    } finally {
      // Reset loading state
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
        // width:{ lg:"85%",md:"80%", sm:"100%"},
        marginLeft: { xl: "15%", lg: "18%", md: "22%", sm: "7%" },
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
                {/* {user?.name === "IT Team" ? ( */}
                <Select
                  options={getFormData.projectIDs.map((project) => ({
                    label: project.code,
                    value: project.code,
                  }))}
                  value={
                    formData.p_id
                      ? {
                          label: formData.p_id,
                          value: formData.p_id,
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    handleChange({
                      target: {
                        name: "p_id",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  placeholder="Select Project"
                  required
                />

                {/* ) : (
                  <Input
                    name="p_id"
                    value={formData.p_id}
                    onChange={handleChange}
                    required
                  />
                )} */}
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
                value={formData.po_number || ""}
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
                <select
                  name="partial_billing"
                  value={formData.partial_billing}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      partial_billing: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>
                  <option value="Partial">Partial</option>
                  <option value="Final">Final</option>
                </select>
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
                name="comment"
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
