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
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Img7 from "../../assets/update-po.png";
import Axios from "../../utils/Axios";

const UpdateBillForm = ({ po_number }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  console.log("PO Number from props:", po_number);

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
        const token = localStorage.getItem("authToken");

        const config = {
          headers: {
            "x-auth-token": token,
          },
          params: {
            po_number,
          },
        };

        const billRes = await Axios.get(`/get-bill-by-id?`, config);
        const allBills = Array.isArray(billRes.data?.data) ? billRes.data.data : [];

        setGetFormValues({ AllBill: allBills });

        const matchingBill = allBills.find((bill) => bill.po_number === po_number);

        if (matchingBill) {
          setFormValues({
            _id: matchingBill._id || "",
            bill_number: matchingBill.bill_number || "",
            bill_date: formatDate(matchingBill.bill_date),
            bill_value: matchingBill.bill_value || "",
            type: matchingBill.type || "",
            po_number: matchingBill.po_number || "",
            p_id: matchingBill.poData?.p_id || "",
            vendor: matchingBill.poData?.vendor || "",
            item: matchingBill.poData?.item || "",
            po_value: matchingBill.poData?.po_value || "",
            date: formatDate(matchingBill.poData?.date),
            submitted_by: user?.username || "",
          });
        }
      } catch (err) {
        console.error("Error fetching bill data:", err);
        setError("Failed to fetch bill data.");
      } finally {
        setLoading(false);
      }
    };

    if (po_number) {
      fetchData();
    }
  }, [po_number, user?.name]);

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
      type: formValues.type,
      submitted_by: user?.name || "",
    };

    // console.log("Submitting with _id:", formValues._id);

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");

      const endpoint = `${process.env.REACT_APP_API_URL}/update-bill/${formValues._id}`;
      const response = await Axios.put(endpoint, dataToPost, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.status === 200) {
        setResponse(response.data);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        toast.success("Bill updated successfully.");
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
              readOnly
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
              readOnly
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
              readOnly
            />
          </Grid>

          {/* Row 2 */}
          <Grid xs={12} md={4}>
            <Typography level="body1" fontWeight="bold" mb={1}>
              PO Date
            </Typography>
            <Input
              fullWidth
             
              name="date"
              value={formValues.date}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ padding: "10px", borderRadius: "8px" }}
              readOnly
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
              readOnly
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
              readOnly
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
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default UpdateBillForm;
