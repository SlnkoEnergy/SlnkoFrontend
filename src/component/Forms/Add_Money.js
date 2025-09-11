import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  Input,
  TextField,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Img6 from "../../assets/add_money.png";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";

const Add_Money = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    submittedBy: "",
    p_id: "",
    name: "",
    code: "",
    customer: "",
    p_group: "",
    cr_amount: "",
    cr_date: "",
    cr_mode: "",
    comment: "",
  });

  const [error, setError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [user, setUser] = useState(null);

   useEffect(() => {
    const userData = getUserData();
  if (userData && userData.name) {
    setFormValues((prev) => ({
      ...prev,
      submittedBy: userData.name,
    }));
  }
  setUser(userData);
  // console.log("details are :", userData);
}, []);
  
    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      console.log("Add money :", userData);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    };


  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await Axios.get("/get-all-projecT-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        let project = localStorage.getItem("add_money");

        project = Number.parseInt(project);



        if (response && response.data && response.data.data) {
          const matchingItem = response.data.data.find(
            (item) => item.p_id === project
          );

          if (matchingItem) {
          setFormValues((prev) => ({
            ...prev,
            p_id: matchingItem.p_id || "",
            code: matchingItem.code || "",
            name: matchingItem.name || "",
            customer: matchingItem.customer || "",
            p_group: matchingItem.p_group || "",
          }));
        }} else {
          setError("No projects found. Please add projects before proceeding.");
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      }
    };

    fetchProjectData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === "cr_amount" && value < 0){
          toast.warning("Credit Amount can't be Negative !!")
          return;
        }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (_, newValue) => {
    setFormValues((prev) => ({ ...prev, cr_mode: newValue || "" }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const { cr_amount, cr_date, cr_mode, comment, submittedBy, p_id } = formValues;

    if (!cr_amount || !cr_date || !cr_mode || !comment || !submittedBy) {
      alert("All fields are required. Please fill out the form completely.");
      return;
    }

    const payload = {
      p_id,
      p_group: formValues.p_group,
      cr_amount,
      cr_date,
      cr_mode,
      comment,
      submittedBy
    };

    try {
      const token = localStorage.getItem("authToken");
      await Axios.post("/Add-MoneY-IT", payload , {
        headers: {"x-auth-token": token}
      });
      setResponseMessage("Form submitted successfully!");
      toast.success("Money Added Successfully ")
      navigate("/project-balance");
      // console.log("Form submission response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went Error !!")
      setResponseMessage("Failed to add money. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width:'100%',
        backgroundColor: "neutral.softBg",
        padding: 3,
        
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: '100%',
          padding: { xs: 2, md: 4 },
          boxShadow: 3,
          borderRadius: "md",
          backgroundColor: "background.surface",
          
        }}
      >
        <Box textAlign="center" mb={4}>
          <img
            src={Img6}
            alt="Add Money"
            style={{ height: "50px", marginBottom: "10px", maxWidth: "100%" }}
          />
          <Typography
            level="h4"
            sx={{
              fontFamily: "Bona Nova SC, serif",
              textTransform: "uppercase",
              color: "warning.500",
              fontWeight: "lg",
            }}
          >
            Add Money
          </Typography>
          <Box
            component="hr"
            sx={{
              width: "50%",
              margin: "8px auto",
              backgroundColor: "warning.400",
            }}
          />
        </Box>

        {error && <Alert color="danger">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Static Fields */}
            <Grid xs={12}>
              <Input
                fullWidth
                placeholder="Submitted By"
                name="submittedBy"
                value={formValues.submittedBy || "Loading ..."}
                disabled
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input
                fullWidth
                placeholder="Project ID"
                name="p_id"
                value={formValues.code}
                disabled
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input
                fullWidth
                placeholder="Project Name"
                name="name"
                value={formValues.name}
                disabled
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input
                fullWidth
                placeholder="Client Name"
                name="customer"
                value={formValues.customer}
                disabled
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input
                fullWidth
                placeholder="Group Name"
                name="p_group"
                value={formValues.p_group}
                disabled
              />
            </Grid>

            {/* Dynamic Fields */}
            <Grid xs={12}>
              <Input
                fullWidth
                placeholder="Credit Amount (INR ₹)"
                type="number"
                name="cr_amount"
                value={formValues.cr_amount}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid xs={12}>
              <Input
                fullWidth
                placeholder="Credit Date"
                type="date"
                name="cr_date"
                value={formValues.cr_date}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid xs={12}>
              <Autocomplete
                options={["Cash", "Account Transfer"]}
                value={formValues.cr_mode}
                onChange={handleAutocompleteChange}
                isOptionEqualToValue={(option, value) =>
                  option === value || value === ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params} // Spread the params onto TextField
                    fullWidth
                    placeholder="Credit Mode"
                    required
                  />
                )}
              />
            </Grid>
            <Grid xs={12}>
              <Input
                fullWidth
                placeholder="Comments"
                name="comment"
                value={formValues.comment}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Buttons */}
            <Grid xs={12}>
              <Box textAlign="center" mt={2}>
                <Button
                  type="submit"
                  sx={{
                    backgroundColor: "warning.400",
                    color: "text.primary",
                    fontWeight: "lg",
                    "&:hover": { backgroundColor: "warning.500" },
                  }}
                >
                  Submit
                </Button>
                <Button
                  variant="outlined"
                  color="neutral"
                  sx={{ ml: 2 }}
                  onClick={() => navigate("/project-balance")}
                >
                  Back
                </Button>
              </Box>
            </Grid>

            {responseMessage && (
              <Typography level="body2" textAlign="center" sx={{ mt: 2 }}>
                {responseMessage}
              </Typography>
            )}
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Add_Money;
