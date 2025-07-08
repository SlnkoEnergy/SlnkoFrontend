import { Autocomplete, Box, Button, Grid, Input, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Img10 from "../../assets/pay-request.png";
import Axios from "../../utils/Axios";

const AddBillForm = ({po_number}) => {
  const navigate = useNavigate();
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

  const [formValues, setFormValues] = useState({
    p_id: "",
    po_number: "",
    vendor: "",
    date: "",
    item: "",
    po_value: "",
    bill_number: "",
    bill_date: "",
    bill_value: "",
    bill_type: "",
    submitted_by: "",
    approved_by: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const billTypes = [
    { label: "Final", value: "Final" },
    { label: "Partial", value: "Partial" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

      const [searchParams] = useSearchParams();
    
      const po_Number = po_number || searchParams.get("po_number");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // const po = localStorage.getItem("po_no");
        // const po_Number = po ? String(po) : null;
        // console.log("PO from localStorage:", po_Number);
        const token = localStorage.getItem("authToken");
        const response = await Axios.get("/get-all-pO-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        const pos = response.data?.data || [];
        // console.log("Fetched PO data:", pos);

        const matchingItem = pos.find(
          (item) => String(item.po_number) === po_Number
        );
        // console.log("Matching PO item:", matchingItem);

        if (matchingItem) {
          setFormValues((prev) => ({
            ...prev,
            p_id: matchingItem.p_id || "",
            po_number: matchingItem.po_number || "",
            vendor: matchingItem.vendor || "",
            date: formatDate(matchingItem.date) || "",
            item: matchingItem.item || "",
            po_value: matchingItem.po_value || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching PO data:", err);
        setError("Failed to fetch PO data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [po_Number]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bill_value") {
      const billValue = parseFloat(value);
      const poValue = parseFloat(formValues.po_value);

      if (billValue > poValue) {
        toast.warning("Bill value cannot exceed PO value !!");
        return;
      }
    }
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleAutocompleteChange = (_, newValue) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      bill_type: newValue?.value || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToPost = {
      po_number: formValues.po_number,
      bill_number: formValues.bill_number,
      bill_date: formValues.bill_date,
      bill_value: formValues.bill_value,
      bill_type: formValues.bill_type,
      submitted_by: user?.name,
      approved_by: "",
    };

    try {
      const token = localStorage.getItem("authToken");

      await Axios.post("/add-bilL-IT", dataToPost, {
        headers: {
          "x-auth-token": token,
        },
      });

      toast.success("Bill added successfully!");
      window.location.reload(setTimeout(3000));
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("An error occurred while adding the bill.");
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
            src={Img10}
            alt="logo-icon"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <Typography level="h4" fontWeight="bold" color="primary">
            Add Bill
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Row 1 */}
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Project ID
              </Typography>
              <Input
                fullWidth
                name="p_id"
                value={formValues.p_id}
                onChange={handleChange}
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                PO Number
              </Typography>
              <Input
                fullWidth
                name="po_number"
                value={formValues.po_number}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Vendor
              </Typography>
              <Input
                fullWidth
                name="vendor"
                value={formValues.vendor}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>

            {/* Row 2 */}
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                PO Date
              </Typography>
              <Input
                fullWidth
                type="date"
                name="date"
                value={formValues.date} // Ensure this is yyyy-MM-dd
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Item Name
              </Typography>
              <Input
                fullWidth
                name="item"
                value={formValues.item}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                PO Value (with GST)
              </Typography>
              <Input
                fullWidth
                name="po_value"
                value={formValues.po_value}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>

            {/* Row 3 */}
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Bill Number
              </Typography>
              <Input
                fullWidth
                name="bill_number"
                value={formValues.bill_number}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Bill Date
              </Typography>
              <Input
                fullWidth
                type="date"
                name="bill_date"
                value={formValues.bill_date}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Bill Value
              </Typography>
              <Input
                fullWidth
                name="bill_value"
                value={formValues.bill_value}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ padding: "10px", borderRadius: "8px" }}
              />
            </Grid>

            {/* Row 4 */}
            <Grid xs={12}>
              <Typography level="body1" fontWeight="bold" mb={1}>
                Type of Bill
              </Typography>
              <Autocomplete
                options={billTypes}
                getOptionLabel={(option) => option.label}
                value={
                  billTypes.find(
                    (type) => type.value === formValues.bill_type
                  ) || null
                }
                onChange={handleAutocompleteChange}
                placeholder="Select Type"
                sx={{ width: "100%" }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid xs={12} textAlign="center">
              <Button
                type="submit"
                color="primary"
                sx={{
                  mx: 1,
                  padding: "10px 30px",
                  borderRadius: "8px",
                  ":hover": { backgroundColor: "#3f51b5" },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
   
  );
};

export default AddBillForm;
