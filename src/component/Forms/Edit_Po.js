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
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import Img7 from "../../assets/update-po.png";
import Axios from "../../utils/Axios";
import axios from "axios";
import { useMemo } from "react";

const UpdatePurchaseOrder = ({ po_number }) => {
  const navigate = useNavigate();

  console.log("PO Number from props:", po_number);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const [getFormData, setGetFormData] = useState({
    projectIDs: [],
    items: [],
    vendors: [],
    AllPo: [],
  });

  const [formData, setFormData] = useState({
    p_id: "",
    po_number: "",
    vendor: "",
    date: "",
    item: "",
    po_value: "",
    po_basic: "",
    gst: "",
    other: "",
    partial_billing: "",
    amount_paid: "",
    comment: "",
    submitted_By: "",
  });

  const [projectIDs, setProjectIDs] = useState([]);
  const [showOtherItem, setShowOtherItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState([]);

  const [searchParams] = useSearchParams();

  const poNumberFromStorage = po_number || searchParams.get("po_number");
  const options = useMemo(
    () => [
      { value: "", label: "Select" },
      { value: "Partial", label: "Partial" },
      { value: "Final", label: "Final" },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const token = localStorage.getItem("authToken");
        const config = { headers: { "x-auth-token": token } };

        const [projectsRes, vendorsRes, itemsRes, poRes] = await Promise.all([
          Axios.get("/get-all-projecT-IT", config),
          Axios.get("/get-all-vendoR-IT", config),
          Axios.get("/get-iteM-IT", config),
          Axios.get("/get-all-pO-IT", config),
        ]);

        const itemsList = [...(itemsRes.data.Data || []), "other"];
        const allPoData = poRes.data.data || [];

        setGetFormData({
          projectIDs: projectsRes.data.data || [],
          vendors: vendorsRes.data.data || [],
          items: itemsList,
          AllPo: allPoData,
        });

        const poData = allPoData.find(
          (po) => po.po_number === poNumberFromStorage
        );

        if (poData) {
          setFormData({
            _id: poData._id,
            p_id: poData.p_id || "-",
            code: poData.code || "",
            po_number: poData.po_number || "",
            vendor: poData.vendor || "",
            item: poData.item || "",
            amount_paid: poData.amount_paid || "0",
            date: poData.date
              ? new Date(poData.date).toISOString().slice(0, 10)
              : "",
            po_value: poData.po_value || "",
            po_basic: poData.po_basic || "",
            gst: poData.gst || "",
            partial_billing: poData.partial_billing || "",
            other: poData.other || "",
            comment: poData.comment || "",
            submitted_By: user?.name || "Anonymous",
          });

          setShowOtherItem(poData.item?.toLowerCase() === "other");
        } else {
          console.warn("PO not found for the stored PO number");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        const message =
          err?.response?.data?.message ||
          "Failed to fetch data. Please try again.";
        setError(message);
        toast.error(message);
      }
    };

    fetchData();
  }, [user, poNumberFromStorage]);

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

  const handleSelectChange = (field, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue || "",
      ...(field === "p_id" && {
        code:
          projectIDs.find((project) => project.p_id === newValue)?.p_id || "",
      }),
    }));

    if (field === "item" && newValue === "other") {
      setShowOtherItem(true);
    } else if (field === "item") {
      setShowOtherItem(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const userData = getUserData();
    // if (userData && userData.name) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     submitted_By: userData.name,
    //   }));
    // }
    // setUser(userData);

    if (!formData._id) {
      setError("Document ID (_id) is missing. Cannot update PO.");
      toast.error("Document ID is required.");
      return;
    }
    console.log("Submitting with _id:", formData._id);
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const endpoint = `${process.env.REACT_APP_API_URL}edit-pO-IT/${formData._id}`;

      const response = await axios.put(endpoint, formData, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.status === 200) {
        setResponse(response.data);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        toast.success("PO updated successfully.");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      console.error("Error updating PO:", err);
      setError(
        err.response?.data?.message || "Failed to update PO. Please try again."
      );
      toast.error(
        err.response?.data?.message || "Failed to update PO. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
              <FormControl>
                {user?.name === "IT Team" ||
                user?.name === "admin" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Prachi Singh" ? (
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
                ) : (
                  <Input
                    name="p_id"
                    value={formData.p_id}
                    onChange={handleChange}
                    readOnly
                  />
                )}
              </FormControl>
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
              readOnly={
                ![
                  "IT Team",
                  "Guddu Rani Dubey",
                  "Prachi Singh",
                  "admin",
                ].includes(user?.name)
              }
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
                options={getFormData.vendors.map((vendor, index) => ({
                  label: vendor.name,
                  value: vendor.name,
                  key: `${vendor.name}-${index}`,
                }))}
                value={formData.vendor ? { label: formData.vendor } : null}
                onChange={(selectedOption) =>
                  handleSelectChange("vendor", selectedOption?.value || "")
                }
                placeholder="Select Vendor"
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
                options={getFormData.items.map((item, index) => ({
                  label: typeof item === "object" ? item.item : item,
                  value: typeof item === "object" ? item._id : item, // send ID
                  key: `${typeof item === "object" ? item._id : item}-${index}`,
                }))}
                value={
                  formData.item
                    ? {
                        label:
                          typeof formData.item === "object"
                            ? formData.item.item
                            : getFormData.items.find(
                                (i) => i._id === formData.item
                              )?.item || "",
                        value: formData.item,
                      }
                    : null
                }
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
              type="text"
              value={formData.po_value}
              onChange={handleChange}
              required
            />
          </Grid>

          {showOtherItem && (
            <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={6}>
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
                value={options.find(
                  (option) => option.value === formData.partial_billing
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    partial_billing: selectedOption ? selectedOption.value : "",
                  }))
                }
                options={options}
              />
            </FormControl>
          </Grid>

          {/* <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="secondary"
                fontWeight={"bold"}
                sx={{ mb: 1 }}
              >
                Advance Paid
              </Typography>
              <Input
                name="amount_paid"
                placeholder="Advance Paid"
                value={formData.amount_paid || ""}
                onChange={handleChange}
                readOnly={
                  ![
                    "IT Team",
                    "Guddu Rani Dubey",
                    "Prachi Singh",
                    "admin",
                  ].includes(user?.name)
                }
              />
            </Grid> */}
          <Grid item xs={12} md={6}>
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
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button type="submit" color="primary" sx={{ mx: 1 }}>
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UpdatePurchaseOrder;
