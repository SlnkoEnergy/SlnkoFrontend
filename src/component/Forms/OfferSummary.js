import {
  Box,
  Button,
  FormLabel,
  Grid,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";
import { toast } from "react-toastify";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../utils/Axios";

const PaymentRequestSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scmData, setScmData] = useState({
    offer_id: "",
    spv_modules: "",
    module_mounting_structure: "",
    transmission_line: "",
    slnko_charges: "",
    submitted_by_BD: "",
    comment: "",
  });
  const [response, setResponse] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScmData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchSCMData = async () => {
      setLoading(true);
      try {
        const offerRate = localStorage.getItem("offer_summary");
        if (!offerRate) {
          toast.error("Offer ID is missing!");
          return;
        }

        const token = localStorage.getItem("authToken");

        const { data } = await Axios.get("/get-comm-bd-rate", {
          headers: {
            "x-auth-token": token,
          },
        });

        const offerData = data.find((item) => item.offer_id === offerRate);

        if (!offerData) {
          toast.error("Please Add Cost!");
          return;
        }

        setScmData({
          _id: offerData._id,
          offer_id: offerData.offer_id,
          spv_modules: offerData.spv_modules || "",
          module_mounting_structure: offerData.module_mounting_structure || "",
          transmission_line: offerData.transmission_line || "",
          slnko_charges: offerData.slnko_charges || "",
          comment: offerData.comment || "",
          submitted_by_BD: offerData.submitted_by_BD || "",
          status: offerData.status,
        });
      } catch (error) {
        console.error(
          "Error fetching data:",
          error?.response?.data || error.message
        );
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSCMData();
  }, []);

  const [user, setUser] = useState(null);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    return userData ? JSON.parse(userData) : null;
  };

  useEffect(() => {
    setUser(getUserData());
  }, []);

  const handleSubmit = async () => {
    if (scmData.status === "Posted") {
      if (!user?.name) {
        toast.error("User details are missing!");
        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token is missing!");
          return;
        }
        const response = await Axios.put(
          `/edit-bd-rate/${scmData._id}`,
          {
            _id: scmData._id,
            spv_modules: scmData.spv_modules,
            module_mounting_structure: scmData.module_mounting_structure,
            transmission_line: scmData.transmission_line,
            slnko_charges: scmData.slnko_charges,
            comment: scmData.comment || "",
            submitted_by_BD: user.name,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (response.status === 200) {
          setResponse(response.data);
          toast.success(
            response.data.msg || "Commercial Offer updated successfully."
          );
          navigate("/ref_list_update");
        } else {
          throw new Error("Unexpected response from the server.");
        }
      } catch (error) {
        console.error(
          "Error during PUT request:",
          error?.response?.data || error.message
        );
        toast.error("Failed to update Comm Rate.");
      }
    } else {
      toast.error("Cost cannot be update.");
    }
  };

  return (
    <Sheet
      sx={{
        width: "50%",
        margin: "auto",
        padding: 3,
        boxShadow: "lg",
        borderRadius: "md",
      }}
    >
      <Typography level="h2" sx={{ textAlign: "center", mb: 2 }}>
        BD Costing Rate Summary
      </Typography>

      <Grid container spacing={2}>
        <Grid md={12} sm={12}>
          <FormLabel>Offer ID</FormLabel>
          <Input
            type="text"
            name="offer_id"
            value={scmData.offer_id}
            onChange={handleChange}
            fullWidth
            readOnly
          />
        </Grid>
        <Grid md={6} sm={12}>
          <FormLabel>SPV Modules (INR/Wp)</FormLabel>
          <Input
            type="text"
            name="spv_modules"
            value={scmData.spv_modules}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid md={6} sm={12}>
          <FormLabel>Module Mounting Structure (INR/kg)</FormLabel>
          <Input
            type="text"
            name="module_mounting_structure"
            value={scmData.module_mounting_structure}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid xs={12}>
          <Typography level="h4">Installation & Commissioning</Typography>
        </Grid>

        <Grid md={6} sm={12}>
          <FormLabel>Rate of Transmission Line (INR/km)</FormLabel>
          <Input
            type="text"
            name="transmission_line"
            value={scmData.transmission_line}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid md={6} sm={12}>
          <FormLabel>SLNKO EPCM Service Charges without GST (INR)</FormLabel>
          <Input
            type="text"
            name="slnko_charges"
            value={scmData.slnko_charges}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid md={12} sm={12}>
          <FormLabel>Comment (if/any)</FormLabel>
          <Input
            type="text"
            name="comment"
            value={scmData.comment}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          type="submit"
          color="primary"
          sx={{ mx: 1 }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
        <Button
          variant="soft"
          color="neutral"
          onClick={() => navigate("/comm_offer")}
        >
          Back
        </Button>
      </Box>
    </Sheet>
  );
};

export default PaymentRequestSummary;
