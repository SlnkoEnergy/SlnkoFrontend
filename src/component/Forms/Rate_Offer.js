import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Typography,
  Grid,
  Sheet,
  FormLabel,
} from "@mui/joy";
import Axios from "../../utils/Axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Rate_Offer = () => {
  const navigate = useNavigate();
  
  const [scmData, setscmData] = useState({
    offer_id: "",
    spv_modules: "",
    // solar_inverter: "",
    module_mounting_structure: "",
    // mounting_hardware: "",
    // dc_cable: "",
    // ac_cable_inverter_accb: "",
    // ac_cable_accb_transformer: "",
    // ac_ht_cable: "",
    // earthing_station: "",
    // earthing_strips: "",
    // earthing_strip: "",
    // lightening_arrestor: "",
    // datalogger: "",
    // auxilary_transformer: "",
    // ups_ldb: "",
    // balance_of_system: "",
    // transportation: "",
    transmission_line: "",
    // transmission_line_internal: "",
    // transmission_line_print: "",
    // ct_pt: "",
    // abt_meter: "",
    // vcb_kiosk: "",
    slnko_charges: "",
    comment:"",
    // installation_commissioing: {
    //   labour_works: "",
    //   machinery: "",
    //   civil_material: "",
    // },
    submitted_by_BD:""
  });

  const [loading, setLoading] = useState(false);
  const [offerData, setOfferData] = useState(null);

  useEffect(() => {
    const OfferRate = localStorage.getItem("offer_rate");
    if (OfferRate) {
      setscmData((prev) => ({ ...prev, offer_id: OfferRate }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setscmData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (field, key, value) => {
    setscmData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  const [user, setUser] = useState(null);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    return userData ? JSON.parse(userData) : null;
  };
  
  useEffect(() => {
    setUser(getUserData());
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const OfferRate = localStorage.getItem("offer_rate");
  
      if (!OfferRate) {
        console.error("Offer ID not found in localStorage");
        toast.error("Offer ID is missing!");
        return;
      }
  
      const token = localStorage.getItem("authToken");

const { data: commercialOffers } = await Axios.get("/get-comm-offer", {
  headers: {
    "x-auth-token": token,
  },
});

      setOfferData(commercialOffers);
  
      const offerData = commercialOffers.find((item) => item.offer_id === OfferRate);
  
      if (!offerData) {
        console.error("Matching offer not found.");
        toast.error("No matching offer found.");
        return;
      }
  
      if (!user?.name) {
        console.error("User details not found.");
        toast.error("User details are missing!");
        return;
      }
  
    

const { data: existingBDRates } = await Axios.get("/get-comm-bd-rate", {
  headers: {
    "x-auth-token": token,
  },
});

      const existingRate = existingBDRates.find((item) => item.offer_id === offerData.offer_id);
  
      if (existingRate) {
        toast.error("Cost already Submitted. Only you can edit cost!");
        return;
      }
  
      const scmPayload = {
        ...scmData,
        offer_id: offerData.offer_id,
        submitted_by_BD: user.name,
      };
  


const response = await Axios.post("/create-bd-rate", scmPayload, {
  headers: {
    "x-auth-token": token,
  },
});

      console.log("Response:", response?.data);
      toast.success("Costing submitted successfully!");
  
      localStorage.setItem("offerId", offerData.offer_id);
      navigate("/ref_list_add");
  
      setscmData({
        offer_id: "",
        spv_modules: "",
        module_mounting_structure: "",
        transmission_line: "",
        slnko_charges: "",
        comment:"",
        submitted_by_BD: "",
      });
    } catch (error) {
      console.error("Submission Error:", error?.response?.data || error.message);
      toast.error("Submission failed");
    } finally {
      setLoading(false);
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
        BD Costing Rate Form
      </Typography>
      <form onSubmit={handleSubmit}>
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
            <Typography level="h4">
              Installation & Commissioning
            </Typography>
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
          <Button type="submit" color="primary" sx={{ mx: 1 }}>
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
      </form>
    </Sheet>
  );
};

export default Rate_Offer;
