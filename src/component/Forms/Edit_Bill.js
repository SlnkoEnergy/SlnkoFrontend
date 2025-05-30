import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Input,
  TextField,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Img7 from "../../assets/update-po.png";
import Axios from "../../utils/Axios";

const UpdateBillForm = () => {
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

  const [getFormValues, setGetFormValues] = useState({
    AllBill: [],
    AllPo: [],
  });

  const [formValues, setFormValues] = useState({
    _id: "",
    p_id: "",
    po_number: "",
    vendor: "",
    date: "",
    item: "",
    po_value: "",
    bill_number: "",
    bill_date: "",
    bill_value: "",
    type: "",
    submitted_by: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState([]);
  const [allPo, setAllPo] = useState([]);
  const [allBill, setAllBill] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const po = localStorage.getItem("edit_bill");
        const poNumberFromStorage = po ? String(po) : null;

        const token = localStorage.getItem("authToken");
const config = { headers: { "x-auth-token": token } };

const [poRes, billRes] = await Promise.all([
  Axios.get("/get-all-pO-IT", config),
  Axios.get("/get-all-bilL-IT", config),
]);
        const allPOs = poRes.data?.data || [];
        const allBills = billRes.data?.data || [];

        setGetFormValues({
          AllPo: allPOs,
          AllBill: allBills,
        });

        const matchingPO = allPOs.find(
          (item) => item.po_number === poNumberFromStorage
        );

        const matchingBill = allBills.find(
          (bill) => bill.po_number === poNumberFromStorage
        );

        if (matchingPO) {
          setFormValues((prev) => ({
            ...prev,

            p_id: matchingPO.p_id || "",
            po_number: matchingPO.po_number || "",
            vendor: matchingPO.vendor || "",
            date: formatDate(matchingPO.date) || "",
            item: matchingPO.item || "",
            po_value: matchingPO.po_value || "",

            // Additional fields from the matched bill
            _id: matchingBill?._id || "",
            bill_number: matchingBill?.bill_number || "",
            bill_date: matchingBill ? formatDate(matchingBill.bill_date) : "",
            bill_value: matchingBill?.bill_value || "",
            type: matchingBill?.type || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching PO or Bill data:", err);
        setError("Failed to fetch PO or Bill data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      type: newValue?.value || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formValues._id) {
      setError("Document ID (_id) is missing. Cannot update PO.");
      toast.error("Document ID is required.");
      return;
    }

    const dataToPost = {
      po_number: formValues.po_number,
      bill_number: formValues.bill_number,
      bill_date: formValues.bill_date,
      bill_value: formValues.bill_value,
      type: formValues.type, // correctly mapped
      submitted_by: user?.name || "",
    };

    console.log("Submitting with _id:", formValues._id);

    try {
      setLoading(true);
      setError("");

      const endpoint = `https://api.slnkoprotrac.com/v1/update-bill/${formValues._id}`;
      const response = await Axios.put(endpoint, dataToPost);

      if (response.status === 200) {
        setResponse(response.data);
        toast.success("Bill updated successfully.");
        localStorage.removeItem("edit_bill");
        navigate("/purchase-order");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      console.error("Error updating bill:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Failed to update Bill. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <img
            src={Img7}
            alt="logo-icon"
            style={{ height: "50px", marginBottom: "10px" }}
          />
          <Typography level="h4" fontWeight="bold" color="primary">
            Update Bill
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
                  billTypes.find((opt) => opt.value === formValues.type) || null
                }
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField {...params} label="Bill Type" variant="outlined" />
                )}
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
              <Button
                variant="soft"
                color="neutral"
                onClick={() => navigate("/purchase-order")}
                sx={{
                  padding: "10px 30px",
                  borderRadius: "8px",
                  ":hover": { backgroundColor: "#e0e0e0" },
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default UpdateBillForm;
