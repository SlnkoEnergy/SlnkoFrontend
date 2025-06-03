import { Box, Button, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

const Summary = () => {
  const [offerData, setOfferData] = useState({
    offer_id: "",
    client_name: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    ac_capacity: "",
    dc_overloading: "",
    dc_capacity: "",
    scheme: "",
    component: "",
    rate: "",
    timeline: "",
    prepared_by: "",
    module_type: "",
    module_capacity: "",
    inverter_capacity: "",
    evacuation_voltage: "",
    module_orientation: "",
    transmission_length: "",
    transformer: "",
    column_type: "",
  });

  const [scmData, setscmData] = useState({
    spv_modules_555: "",
    spv_modules_580: "",
    spv_modules_550: "",
    spv_modules_585: "",
    solar_inverter: "",
    module_mounting_structure: "",
    mounting_hardware: "",
    dc_cable: "",
    ac_cable_inverter_accb: "",
    ac_cable_accb_transformer: "",
    ac_ht_cable_11KV: "",
    ac_ht_cable_33KV: "",
    earthing_station: "",
    earthing_strips: "",
    earthing_strip: "",
    lightening_arrestor: "",
    datalogger: "",
    auxilary_transformer: "",
    ups_ldb: "",
    balance_of_system: "",
    transportation: "",
    transmission_line_11kv: "",
    transmission_line_33kv: "",
    transmission_line_internal: "",
    transmission_line_print: "",
    ct_pt_11kv_MP: "",
    ct_pt_33kv_MP: "",
    ct_pt_11kv_Other: "",
    ct_pt_33kv_Other: "",
    abt_meter_11kv_MP: "",
    abt_meter_33kv_MP: "",
    abt_meter_11kv_Other: "",
    abt_meter_33kv_Other: "",
    vcb_kiosk: "",
    slnko_charges: "",
    installation_commissioing: {
      labour_works: "",
      machinery: "",
      civil_material: "",
    },
  });

  const [bdRate, setBdRate] = useState({
    spv_modules: "",
    module_mounting_structure: "",
    transmission_line: "",
    slnko_charges: "",
    submitted_by_BD: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("preview_offerId");
        const previewId = localStorage.getItem("preview_id");

        console.log("Fetched offer_id from localStorage:", offerRate);
        console.log("Fetched preview_id from localStorage:", previewId);

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        // Fetch all data simultaneously
        const token = localStorage.getItem("authToken");
const config = { headers: { "x-auth-token": token } };

const [offerRes, result, bdRes] = await Promise.all([
  Axios.get("/get-comm-offer", config),
  Axios.get("/get-comm-scm-rate", config),
  Axios.get("/get-bd-rate-history", config),
]);

        const offerDataList = offerRes?.data ?? [];
        const fetchedScmData = result.data[0];
        const bdDataList = bdRes?.data?.data ?? [];

        console.log("Fetched Offer Data:", offerDataList);
        console.log("Fetched SCM Rate Data:", fetchedScmData);
        console.log("Fetched BD Rate Data:", bdDataList);

        // Match data based on localStorage values
        const matchedOffer = offerDataList.find(
          (item) => item.offer_id === offerRate
        );
        const matchedBdRate = bdDataList.find((item) => item._id === previewId);

        if (!matchedOffer) {
          console.error("No matching offer data found");
          toast.error("No matching offer data found!");
          return;
        }

        setOfferData({
          offer_id: matchedOffer.offer_id ?? "",
          client_name: matchedOffer.client_name ?? "",
          village: matchedOffer.village ?? "",
          district: matchedOffer.district ?? "",
          state: matchedOffer.state ?? "",
          pincode: matchedOffer.pincode ?? "",
          ac_capacity: matchedOffer.ac_capacity ?? "",
          dc_overloading: matchedOffer.dc_overloading ?? "",
          dc_capacity: matchedOffer.dc_capacity ?? "",
          scheme: matchedOffer.scheme ?? "",
          component: matchedOffer.component ?? "",
          rate: matchedOffer.rate ?? "",
          timeline: matchedOffer.timeline ?? "",
          prepared_by: matchedOffer.prepared_by ?? "",
          module_type: matchedOffer.module_type ?? "",
          module_capacity: matchedOffer.module_capacity ?? "",
          inverter_capacity: matchedOffer.inverter_capacity ?? "",
          evacuation_voltage: matchedOffer.evacuation_voltage ?? "",
          module_orientation: matchedOffer.module_orientation ?? "",
          transmission_length: matchedOffer.transmission_length ?? "",
          transformer: matchedOffer.transformer ?? "",
          column_type: matchedOffer.column_type ?? "",
        });
        console.log("Set Offer Data:", matchedOffer);

        setscmData({
          spv_modules_555: fetchedScmData.spv_modules_555 || "",
          spv_modules_580: fetchedScmData.spv_modules_580 || "",
          spv_modules_550: fetchedScmData.spv_modules_550 || "",
          spv_modules_585: fetchedScmData.spv_modules_585 || "",
          solar_inverter: fetchedScmData.solar_inverter || "",
          module_mounting_structure_scm:
            fetchedScmData.module_mounting_structure || "",
          mounting_hardware: fetchedScmData.mounting_hardware || "",
          dc_cable: fetchedScmData.dc_cable || "",
          ac_cable_inverter_accb: fetchedScmData.ac_cable_inverter_accb || "",
          ac_cable_accb_transformer:
            fetchedScmData.ac_cable_accb_transformer || "",
          ac_ht_cable_11KV: fetchedScmData.ac_ht_cable_11KV || "",
          ac_ht_cable_33KV: fetchedScmData.ac_ht_cable_33KV || "",
          earthing_station: fetchedScmData.earthing_station || "",
          earthing_strips: fetchedScmData.earthing_strips || "",
          earthing_strip: fetchedScmData.earthing_strip || "",
          lightening_arrestor: fetchedScmData.lightening_arrestor || "",
          datalogger: fetchedScmData.datalogger || "",
          auxilary_transformer: fetchedScmData.auxilary_transformer || "",
          ups_ldb: fetchedScmData.ups_ldb || "",
          balance_of_system: fetchedScmData.balance_of_system || "",
          transportation: fetchedScmData.transportation || "",
          transmission_line_11kv: fetchedScmData.transmission_line_11kv || "",
          transmission_line_33kv: fetchedScmData.transmission_line_33kv || "",
          ct_pt_11kv_MP: fetchedScmData.ct_pt_11kv_MP || "",
          ct_pt_33kv_MP: fetchedScmData.ct_pt_33kv_MP || "",
          ct_pt_11kv_Other: fetchedScmData.ct_pt_11kv_Other || "",
          ct_pt_33kv_Other: fetchedScmData.ct_pt_33kv_Other || "",
          abt_meter_11kv_MP: fetchedScmData.abt_meter_11kv_MP || "",
          abt_meter_33kv_MP: fetchedScmData.abt_meter_33kv_MP || "",
          abt_meter_11kv_Other: fetchedScmData.abt_meter_11kv_Other || "",
          abt_meter_33kv_Other: fetchedScmData.abt_meter_33kv_Other || "",
          vcb_kiosk: fetchedScmData.vcb_kiosk || "",
          slnko_charges_scm: fetchedScmData.slnko_charges_scm || "",
          installation_commissioing: {
            labour_works:
              fetchedScmData.installation_commissioing?.labour_works || "",
            machinery:
              fetchedScmData.installation_commissioing?.machinery || "",
            civil_material:
              fetchedScmData.installation_commissioing?.civil_material || "",
          },
        });

        console.log("Set SCM Data:", fetchedScmData);

        if (matchedBdRate) {
          setBdRate({
            spv_modules: matchedBdRate.spv_modules ?? "",
            module_mounting_structure:
              matchedBdRate.module_mounting_structure ?? "",
            transmission_line: matchedBdRate.transmission_line ?? "",
            slnko_charges: matchedBdRate.slnko_charges ?? "",
            submitted_by_BD: matchedBdRate.submitted_by_BD ?? "",
          });
          console.log("Set BD Rate Data:", matchedBdRate);
        } else {
          console.warn(
            "No matching BD Rate data found for offer_id:",
            previewId
          );
        }
      } catch (error) {
        console.error("Error fetching commercial offer data:", error);
        toast.error("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    const offerRate = localStorage.getItem("preview_offerId");
    navigate(`/bd_history?offer_id=${offerRate}`);
    localStorage.removeItem("preview_offerId");
  };

  //***for 24th row ***/
  const internalQuantity24 = offerData.dc_capacity * 1000;

  //***for 25th row ***/
  const internalQuantity25 = Math.ceil(offerData.dc_capacity * 3) + 4;

  //***for 31st row ***/
  const internalQuantity31 = offerData.dc_capacity * 1000;

  //***for 32nd row ***/
  const internalQuantity32 = offerData.ac_capacity * 1000;

  const scmWeekly4 = (ac_capacity) => {
    if (ac_capacity < 3) {
      return 125000;
    } else {
      return 200000;
    }
  };

  //***Total Value 25***/
  const TotalVal25 =
    scmData.installation_commissioing.machinery * internalQuantity24 * 1000;

  //***Total Value 26***/
  const TotalVal26 =
    scmData.installation_commissioing.civil_material *
    internalQuantity24 *
    1000;

  //***Total Value 27***/
  const TotalVal27 = scmData.transportation * internalQuantity25;

  //***Total Value 32***/
  const TotalVal32 = Number(bdRate.slnko_charges);

  // ***for 1st row***
  const internalQuantity1 = offerData.module_capacity
    ? Math.round(
        (offerData.dc_capacity * 1000 * 1000) / offerData.module_capacity
      )
    : 0;

  const PrintQuantity1 = Math.round(internalQuantity1 / 24) * 24;

  // ***for 2nd row***
  const internalQuantity2 = offerData.ac_capacity
    ? Math.round((offerData.ac_capacity * 1000) / offerData.inverter_capacity)
    : 0;

  // ***for 3rd row***
  const InternalQuantity3 =
    offerData.module_orientation === "Portrait"
      ? 23 * 1000 * offerData.dc_capacity
      : offerData.module_orientation === "Landscape"
        ? 29 * 1000 * offerData.dc_capacity
        : 33 * 1000 * offerData.dc_capacity;

  // ***for 5th row***
  const InternalQuantity5 = offerData.dc_capacity * 7000;

  // ***for 6th row***
  const InternalQuantity6 = internalQuantity2 * 97.5;

  // ***for 6th row***
  const InternalQuantity7 = internalQuantity2 * 20;

  //***Total Value 1***/
  const TotalVal1 =
    bdRate.spv_modules * PrintQuantity1 * offerData.module_capacity;

  console.log("bd_spvModules", TotalVal1);

  //***Total Value 2***/
  const TotalVal2 = scmData.solar_inverter * internalQuantity2;

  //***Total Value 3***/
  const TotalVal3 = bdRate.module_mounting_structure * InternalQuantity3;

  // console.log("scmData.module_mounting_structure: ", scmData.module_mounting_structure);

  console.log("TotalVal3", TotalVal3);

  //***Total Value 4***/
  const TotalVal4 = Math.round(
    scmData.mounting_hardware * offerData.dc_capacity * 1000 * 1000
  );

  // console.log("TotalVal4", TotalVal4);

  //***Total Value 5***/
  const TotalVal5 = scmData.dc_cable * InternalQuantity5;

  //***Total Value 6***/
  const TotalVal6 = Math.round(
    scmData.ac_cable_inverter_accb * InternalQuantity6
  );

  //***Total Value 7***/
  const TotalVal7 = scmData.ac_cable_accb_transformer * InternalQuantity7;

  // ***for 2nd row***
  //  const internalQuantity2 = offerData.ac_capacity
  //  ? Math.round((offerData.ac_capacity * 1000) / offerData.inverter_capacity)
  //  : 0;

  // ***for 9th row***
  const internalQuantity9 = internalQuantity2 * 5;

  // ***for 19th row***/
  const internalQuantity19 = offerData.dc_capacity
    ? Math.round(offerData.dc_capacity)
    : 0;

  //***for 10th row***/
  const internalQuantity10 = internalQuantity19 * 15;

  //***for 11th row***/
  const internalQuantity11 = offerData.dc_capacity
    ? Math.round(offerData.dc_capacity * 0.4 * 1000)
    : 0;

  const evacuationVoltage = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return "11 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    } else {
      return "33 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    }
  };

  //***finding P17***/
  const setUp = (ac) => {
    const acValue = parseFloat(ac);
    if (!isNaN(acValue)) {
      return Math.round((acValue * 1.1 * 1000) / 100) * 100; // Round to nearest 100
    }
    return "";
  };

  //***for N10 ***/
  const Nten = (internalQuantity2) => {
    if (internalQuantity2 <= 11) {
      console.log(`Nten = ${internalQuantity2}`); // Log the original value
      return internalQuantity2;
    } else {
      const roundedValue = Math.round(internalQuantity2 / 2);
      console.log(`Nten = ${roundedValue}`); // Log the rounded value
      return roundedValue;
    }
  };

  const NtenValue = Nten(internalQuantity2); // Call function and store the result
  const Neleven = internalQuantity2 - NtenValue; // Compute Neleven

  const Lten = (40000 * NtenValue + 30000 + 150000 + 20000) * 1.7;
  const Leleven = (40000 * Neleven + 30000 + 150000 + 20000) * 1.7;

  const scmWeekly1 = Lten + Leleven;

  //***finding Q22 ***/
  const findQ22 = (setupValue) => {
    const setupFloat = parseFloat(setupValue);
    if (!isNaN(setupFloat) && setupFloat > 0) {
      return parseFloat(-0.211 * Math.log(setupFloat) + 2.4482);
    }
    return 0; // Default value if setupValue is invalid
  };

  // *** Finding Q24 ***
  const findQ24 = (evacuation_voltage, Q22Value) => {
    return evacuation_voltage === 11 ? Math.ceil(Q22Value * 100) / 100 : 0.9;
  };

  // *** Finding scmWeekly2 ***
  const scmWeekly2 = (transformer, ac_capacity, evacuation_voltage) => {
    const setupValue = setUp(ac_capacity); // Get setup value
    const Q22Value = findQ22(setupValue); // Compute Q22
    const Q24Value = findQ24(evacuation_voltage, Q22Value); // Compute Q24

    console.log("Transformer:", transformer);
    console.log("AC Capacity:", ac_capacity);
    console.log("Evacuation Voltage:", evacuation_voltage);
    console.log("setupValue:", setupValue);
    console.log("Q22Value:", Q22Value);
    console.log("Q24Value:", Q24Value);

    if (transformer === "OLTC") {
      const result = Math.round(
        ((Q24Value * setupValue * 1000 + 400000) / setupValue / 1000) *
          setupValue *
          1000
      );
      console.log("scmWeekly2 (OLTC):", result);
      return result;
    } else {
      const result = Q24Value * setupValue * 1000;
      console.log("scmWeekly2 (Non-OLTC):", result);
      return result;
    }
  };
  const final_ht_cable = (
    ac_ht_cable_11KV,
    ac_ht_cable_33KV,
    evacuation_voltage
  ) => (evacuation_voltage === 11 ? ac_ht_cable_11KV : ac_ht_cable_33KV);

  const selectedCable = final_ht_cable(
    scmData.ac_ht_cable_11KV,
    scmData.ac_ht_cable_33KV,
    offerData.evacuation_voltage
  );

  const final_ct_pt = (
    offerData,
    ct_pt_11kv_MP,
    ct_pt_11kv_Other,
    ct_pt_33kv_MP,
    ct_pt_33kv_Other
  ) => {
    const { state, evacuation_voltage } = offerData; // Extract values from offerData

    if (evacuation_voltage === 11) {
      return state === "Madhya Pradesh" ? ct_pt_11kv_MP : ct_pt_11kv_Other;
    } else {
      return state === "Madhya Pradesh" ? ct_pt_33kv_MP : ct_pt_33kv_Other;
    }
  };

  const final_abt_meter = (
    offerData,
    abt_meter_11kv_MP,
    abt_meter_11kv_Other,
    abt_meter_33kv_MP,
    abt_meter_33kv_Other
  ) => {
    const { state, evacuation_voltage } = offerData; // Extract values from offerData

    if (evacuation_voltage === 11) {
      return state === "Madhya Pradesh"
        ? abt_meter_11kv_MP
        : abt_meter_11kv_Other;
    } else {
      return state === "Madhya Pradesh"
        ? abt_meter_33kv_MP
        : abt_meter_33kv_Other;
    }
  };

  const ct_pt_cal = final_ct_pt(
    offerData,
    scmData.ct_pt_11kv_MP,
    scmData.ct_pt_11kv_Other,
    scmData.ct_pt_33kv_MP,
    scmData.ct_pt_33kv_Other
  );

  const abt_cal = final_abt_meter(
    offerData,
    scmData.abt_meter_11kv_MP,
    scmData.abt_meter_11kv_Other,
    scmData.abt_meter_33kv_MP,
    scmData.abt_meter_33kv_Other
  );

  const vcb_value = (evacuation_voltage) => {
    return evacuation_voltage === 11 ? 320000 : 750000;
  };

  const selectedVCBValue = vcb_value(offerData.evacuation_voltage); // Pass the evacuation voltage

  const totalVCB = selectedVCBValue * 1;

  //***Total Value 8***/
  const TotalVal8 = selectedCable * 50;

  //***Total Value 9***/
  const TotalVal9 = 380 * internalQuantity9;

  //***Total Value 10***/
  const TotalVal10 = 660 * internalQuantity10;

  //***Total Value 11***/
  const TotalVal11 = 130 * internalQuantity11;

  //***Total Value 12***/
  const TotalVal12 = 470 * 20;

  //***Total Value 13***/
  const TotalVal13 = scmWeekly1 * 1;

  //  // ***for 2nd row***
  //  const internalQuantity2 = offerData.ac_capacity
  //  ? Math.round((offerData.ac_capacity * 1000) / offerData.inverter_capacity)
  //  : 0;

  // ***for 16th row***/
  const internalQuantity16 = offerData.dc_capacity
    ? Math.ceil(
        offerData.dc_capacity * 2 +
          Math.round(offerData.dc_capacity) * 2 +
          internalQuantity2 +
          10
      )
    : 0;

  // ***for 17th row***/
  const internalQuantity17 = offerData.dc_capacity
    ? Math.round(offerData.dc_capacity * 1000 * 0.8)
    : 0;

  const internalQuantity18 = offerData.dc_capacity
    ? Math.round(offerData.dc_capacity)
    : 0;

  const EvacuationVoltage = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return "11 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
    } else {
      return "33 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
    }
  };

  const scmWeekly3 = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return 440000;
    } else {
      return 770000;
    }
  };
  const internalQuantity17_2 = 150;

  //***Total Value 16***/
  const TotalVal16 = internalQuantity16 * scmData.earthing_station;

  //***Total Value 17***/
  const TotalVal17 = internalQuantity17 * scmData.earthing_strips;

  //***Total Value 18***/
  const TotalVal18 = internalQuantity17_2 * scmData.earthing_strip;

  //***Total Value 19***/
  const TotalVal19 = internalQuantity18 * scmData.lightening_arrestor;

  //***Total Value 20***/
  const TotalVal20 = scmData.datalogger * 1;

  //***Total Value 21***/
  const TotalVal21 = scmData.auxilary_transformer * 1;

  //***Total Value 22***/
  const TotalVal22 = scmData.ups_ldb * 1;

  //***for 24th row ***/
  //  const internalQuantity24 = offerData.dc_capacity*1000;

  //***Total Value 23***/
  const TotalVal23 = scmData.balance_of_system * internalQuantity24;

  //***Total Value 24***/
  const TotalVal24 =
    scmData.installation_commissioing.labour_works * internalQuantity24 * 1000;

  const SumO6ToO38 =
    (TotalVal1 * 12) / 100 +
    TotalVal1 +
    ((TotalVal2 * 12) / 100 + TotalVal2) +
    ((TotalVal3 * 18) / 100 + TotalVal3) +
    ((TotalVal4 * 18) / 100 + TotalVal4) +
    ((TotalVal5 * 18) / 100 + TotalVal5) +
    Math.round((TotalVal6 * 18) / 100 + TotalVal6) +
    ((TotalVal7 * 18) / 100 + TotalVal7) +
    ((TotalVal8 * 18) / 100 + TotalVal8) +
    ((TotalVal9 * 18) / 100 + TotalVal9) +
    ((TotalVal10 * 18) / 100 + TotalVal10) +
    ((TotalVal11 * 18) / 100 + TotalVal11) +
    ((TotalVal12 * 18) / 100 + TotalVal12) +
    ((TotalVal13 * 18) / 100 + TotalVal13) +
    ((scmWeekly2(
      offerData.transformer,
      offerData.ac_capacity,
      offerData.evacuation_voltage
    ) *
      18) /
      100 +
      scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      )) +
    ((scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
      scmWeekly3(offerData.evacuation_voltage)) +
    ((TotalVal16 * 18) / 100 + TotalVal16) +
    ((TotalVal17 * 18) / 100 + TotalVal17) +
    ((TotalVal18 * 18) / 100 + TotalVal18) +
    ((TotalVal19 * 18) / 100 + TotalVal19) +
    ((TotalVal20 * 18) / 100 + TotalVal20) +
    ((TotalVal21 * 18) / 100 + TotalVal21) +
    ((TotalVal22 * 18) / 100 + TotalVal22) +
    ((TotalVal23 * 18) / 100 + TotalVal23) +
    ((TotalVal24 * 18) / 100 + TotalVal24) +
    ((TotalVal25 * 18) / 100 + TotalVal25) +
    ((TotalVal26 * 18) / 100 + TotalVal26) +
    ((TotalVal27 * 18) / 100 + TotalVal27) +
    (offerData.transmission_length * bdRate.transmission_line * 18) / 100 +
    bdRate.transmission_line * offerData.transmission_length +
    ((ct_pt_cal * 2 * 18) / 100 + ct_pt_cal * 2) +
    ((abt_cal * 3 * 18) / 100 + abt_cal * 3) +
    ((totalVCB * 18) / 100 + totalVCB) +
    ((scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
      scmWeekly4(offerData.ac_capacity) * 1);

  const scmWeekly5 = Math.round((SumO6ToO38 * 0.1) / 100);

  const SumOfTotal_Value = Math.round(
    TotalVal1 +
      TotalVal2 +
      TotalVal3 +
      TotalVal4 +
      TotalVal5 +
      TotalVal6 +
      TotalVal7 +
      TotalVal8 +
      TotalVal9 +
      TotalVal10 +
      TotalVal11 +
      TotalVal12 +
      TotalVal13 +
      scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      ) +
      scmWeekly3(offerData.evacuation_voltage) +
      TotalVal16 +
      TotalVal17 +
      TotalVal18 +
      TotalVal19 +
      TotalVal20 +
      TotalVal21 +
      TotalVal22 +
      TotalVal23 +
      TotalVal24 +
      TotalVal25 +
      TotalVal26 +
      TotalVal27 +
      offerData.transmission_length * bdRate.transmission_line +
      2 * ct_pt_cal +
      3 * abt_cal +
      totalVCB +
      scmWeekly4(offerData.ac_capacity) * 1 +
      scmWeekly5 +
      TotalVal32
  );

  const SumOfTotal_With_GST = Math.round(
    (TotalVal1 * 12) / 100 +
      TotalVal1 +
      ((TotalVal2 * 12) / 100 + TotalVal2) +
      ((TotalVal3 * 18) / 100 + TotalVal3) +
      ((TotalVal4 * 18) / 100 + TotalVal4) +
      ((TotalVal5 * 18) / 100 + TotalVal5) +
      Math.round((TotalVal6 * 18) / 100 + TotalVal6) +
      ((TotalVal7 * 18) / 100 + TotalVal7) +
      ((TotalVal8 * 18) / 100 + TotalVal8) +
      ((TotalVal9 * 18) / 100 + TotalVal9) +
      ((TotalVal10 * 18) / 100 + TotalVal10) +
      ((TotalVal11 * 18) / 100 + TotalVal11) +
      ((TotalVal12 * 18) / 100 + TotalVal12) +
      ((TotalVal13 * 18) / 100 + TotalVal13) +
      ((scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      ) *
        18) /
        100 +
        scmWeekly2(
          offerData.transformer,
          offerData.ac_capacity,
          offerData.evacuation_voltage
        )) +
      ((scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
        scmWeekly3(offerData.evacuation_voltage)) +
      ((TotalVal16 * 18) / 100 + TotalVal16) +
      ((TotalVal17 * 18) / 100 + TotalVal17) +
      ((TotalVal18 * 18) / 100 + TotalVal18) +
      ((TotalVal19 * 18) / 100 + TotalVal19) +
      ((TotalVal20 * 18) / 100 + TotalVal20) +
      ((TotalVal21 * 18) / 100 + TotalVal21) +
      ((TotalVal22 * 18) / 100 + TotalVal22) +
      ((TotalVal23 * 18) / 100 + TotalVal23) +
      ((TotalVal24 * 18) / 100 + TotalVal24) +
      ((TotalVal25 * 18) / 100 + TotalVal25) +
      ((TotalVal26 * 18) / 100 + TotalVal26) +
      ((TotalVal27 * 18) / 100 + TotalVal27) +
      (offerData.transmission_length * bdRate.transmission_line * 18) / 100 +
      bdRate.transmission_line * offerData.transmission_length +
      ((ct_pt_cal * 2 * 18) / 100 + ct_pt_cal * 2) +
      ((abt_cal * 3 * 18) / 100 + abt_cal * 3) +
      ((totalVCB * 18) / 100 + totalVCB) +
      ((scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
        scmWeekly4(offerData.ac_capacity) * 1) +
      ((scmWeekly5 * 18) / 100 + scmWeekly5) +
      ((TotalVal32 * 18) / 100 + TotalVal32)
  );

  const SumOf_Total_GST_Value =
    (TotalVal1 * 12) / 100 +
    (TotalVal2 * 12) / 100 +
    (TotalVal3 * 18) / 100 +
    (TotalVal4 * 18) / 100 +
    (TotalVal5 * 18) / 100 +
    (TotalVal6 * 18) / 100 +
    (TotalVal7 * 18) / 100 +
    (TotalVal8 * 18) / 100 +
    (TotalVal9 * 18) / 100 +
    (TotalVal10 * 18) / 100 +
    (TotalVal11 * 18) / 100 +
    (TotalVal12 * 18) / 100 +
    (TotalVal13 * 18) / 100 +
    (scmWeekly2(
      offerData.transformer,
      offerData.ac_capacity,
      offerData.evacuation_voltage
    ) *
      18) /
      100 +
    (scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
    (TotalVal16 * 18) / 100 +
    (TotalVal17 * 18) / 100 +
    (TotalVal18 * 18) / 100 +
    (TotalVal19 * 18) / 100 +
    (TotalVal20 * 18) / 100 +
    (TotalVal21 * 18) / 100 +
    (TotalVal22 * 18) / 100 +
    (TotalVal23 * 18) / 100 +
    (TotalVal24 * 18) / 100 +
    (TotalVal25 * 18) / 100 +
    (TotalVal26 * 18) / 100 +
    (TotalVal27 * 18) / 100 +
    (offerData.transmission_length * bdRate.transmission_line * 18) / 100 +
    (ct_pt_cal * 2 * 18) / 100 +
    (abt_cal * 3 * 18) / 100 +
    (totalVCB * 18) / 100 +
    (scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
    (scmWeekly5 * 18) / 100 +
    (TotalVal32 * 18) / 100;

  const Total_Basic_Solar_Datalogger = Math.round(TotalVal2 + TotalVal20);
  const Total_GST_Solar_Datalogger = Math.round(
    (TotalVal2 * 12) / 100 + (TotalVal20 * 18) / 100
  );
  const Total_with_GST_Solar_Datalogger = Math.round(
    (TotalVal2 * 12) / 100 + TotalVal2 + ((TotalVal20 * 18) / 100 + TotalVal20)
  );

  const Total_Basic_MMS_Fastner = Math.round(TotalVal3 + TotalVal4);

  console.log("Total_Basic_MMS_Fastner", Total_Basic_MMS_Fastner);

  const Total_GST_MMS_Fastner = Math.round(
    (TotalVal3 * 18) / 100 + (TotalVal4 * 18) / 100
  );
  const Total_with_GST_MMS_Fastner = Math.round(
    (TotalVal3 * 18) / 100 + TotalVal3 + ((TotalVal4 * 18) / 100 + TotalVal4)
  );

  const Total_Basic_Cables = Math.round(
    TotalVal5 +
      TotalVal6 +
      TotalVal7 +
      TotalVal8 +
      TotalVal9 +
      TotalVal10 +
      TotalVal11 +
      TotalVal12
  );
  const Total_GST_Cables = Math.round(
    (TotalVal5 * 18) / 100 +
      (TotalVal6 * 18) / 100 +
      (TotalVal7 * 18) / 100 +
      (TotalVal8 * 18) / 100 +
      (TotalVal9 * 18) / 100 +
      (TotalVal10 * 18) / 100 +
      (TotalVal11 * 18) / 100 +
      (TotalVal12 * 18) / 100
  );
  const Total_with_GST_Cables = Math.round(
    (TotalVal5 * 18) / 100 +
      TotalVal5 +
      ((TotalVal6 * 18) / 100 + TotalVal6) +
      ((TotalVal7 * 18) / 100 + TotalVal7) +
      ((TotalVal8 * 18) / 100 + TotalVal8) +
      ((TotalVal9 * 18) / 100 + TotalVal9) +
      ((TotalVal10 * 18) / 100 + TotalVal10) +
      ((TotalVal11 * 18) / 100 + TotalVal11) +
      ((TotalVal12 * 18) / 100 + TotalVal12)
  );

  const Total_Basic_Electrical_Equipment = Math.round(
    TotalVal13 +
      (scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      ) +
        scmWeekly3(offerData.evacuation_voltage)) +
      TotalVal21 +
      TotalVal22
  );
  const Total_GST_Electrical_Equipment = Math.round(
    (TotalVal13 * 18) / 100 +
      (scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      ) *
        18) /
        100 +
      (scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
      (TotalVal21 * 18) / 100 +
      (TotalVal22 * 18) / 100
  );
  const Total_with_GST_Electrical_Equipment = Math.round(
    (TotalVal13 * 18) / 100 +
      TotalVal13 +
      ((scmWeekly2(
        offerData.transformer,
        offerData.ac_capacity,
        offerData.evacuation_voltage
      ) *
        18) /
        100 +
        scmWeekly2(
          offerData.transformer,
          offerData.ac_capacity,
          offerData.evacuation_voltage
        )) +
      ((scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
        scmWeekly3(offerData.evacuation_voltage)) +
      ((TotalVal21 * 18) / 100 + TotalVal21) +
      ((TotalVal22 * 18) / 100 + TotalVal22)
  );

  const Total_Basic_Other_Material = Math.round(
    TotalVal16 + TotalVal17 + TotalVal18 + TotalVal19 + TotalVal23
  );

  console.log("Total_Basic_Other_Material: ", Total_Basic_Other_Material);

  const Total_Gst_Other_Material = Math.round(
    (TotalVal16 * 18) / 100 +
      (TotalVal17 * 18) / 100 +
      (TotalVal18 * 18) / 100 +
      (TotalVal19 * 18) / 100 +
      (TotalVal23 * 18) / 100
  );
  const Total_with_Gst_Other_Material = Math.round(
    (TotalVal16 * 18) / 100 +
      TotalVal16 +
      ((TotalVal17 * 18) / 100 + TotalVal17) +
      ((TotalVal18 * 18) / 100 + TotalVal18) +
      ((TotalVal19 * 18) / 100 + TotalVal19) +
      ((TotalVal23 * 18) / 100 + TotalVal23)
  );

  const Total_Basic_Installation_Charges = Math.round(
    TotalVal24 + TotalVal25 + TotalVal26
  );
  const Total_GST_Installation_Charges = Math.round(
    (TotalVal24 * 18) / 100 + (TotalVal25 * 18) / 100 + (TotalVal26 * 18) / 100
  );
  const Total_with_GST_Installation_Charges = Math.round(
    (TotalVal24 * 18) / 100 +
      TotalVal24 +
      ((TotalVal25 * 18) / 100 + TotalVal25) +
      ((TotalVal26 * 18) / 100 + TotalVal26)
  );

  const Total_Basic_Transportatiom_Insurance = Math.round(
    TotalVal27 + scmWeekly5
  );
  const Total_GST_Transportatiom_Insurance = Math.round(
    (TotalVal27 * 18) / 100 + (scmWeekly5 * 18) / 100
  );
  const Total_with_GST_Transportatiom_Insurance = Math.round(
    (TotalVal27 * 18) / 100 +
      TotalVal27 +
      ((scmWeekly5 * 18) / 100 + scmWeekly5)
  );

  console.log(
    "Total_Basic_Transportatiom_Insurance",
    Total_Basic_Transportatiom_Insurance
  );

  const Total_Plant_Cost_1 = Math.round(
    TotalVal1 +
      Total_Basic_Solar_Datalogger +
      Total_Basic_MMS_Fastner +
      Total_Basic_Cables +
      Total_Basic_Electrical_Equipment +
      Total_Basic_Other_Material +
      Total_Basic_Installation_Charges +
      Total_Basic_Transportatiom_Insurance +
      TotalVal32
  );

  const Total_Plant_Cost_GST_1 = Math.round(
    (TotalVal1 * 12) / 100 +
      Total_GST_Solar_Datalogger +
      Total_GST_MMS_Fastner +
      Total_GST_Cables +
      Total_GST_Electrical_Equipment +
      Total_Gst_Other_Material +
      Total_GST_Installation_Charges +
      Total_GST_Transportatiom_Insurance +
      (TotalVal32 * 18) / 100
  );

  const Total_Plant_Cost_with_GST_1 = Math.round(
    (TotalVal1 * 12) / 100 +
      TotalVal1 +
      Total_with_GST_Solar_Datalogger +
      Total_with_GST_MMS_Fastner +
      Total_with_GST_Cables +
      Total_with_GST_Electrical_Equipment +
      Total_with_Gst_Other_Material +
      Total_with_GST_Installation_Charges +
      Total_with_GST_Transportatiom_Insurance +
      ((TotalVal32 * 18) / 100 + TotalVal32)
  );

  const Total_Basic_GSS_Equipment =
    2 * ct_pt_cal +
    3 * abt_cal +
    totalVCB +
    scmWeekly4(offerData.ac_capacity) * 1;
  console.log(totalVCB);

  const Total_GST_GSS_Equipment =
    (ct_pt_cal * 2 * 18) / 100 +
    (abt_cal * 3 * 18) / 100 +
    (totalVCB * 18) / 100 +
    (scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100;
  const Totalwith_GST_GSS_Equipment =
    (ct_pt_cal * 2 * 18) / 100 +
    ct_pt_cal * 2 +
    ((abt_cal * 3 * 18) / 100 + abt_cal * 3) +
    ((totalVCB * 18) / 100 + totalVCB) +
    ((scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
      scmWeekly4(offerData.ac_capacity) * 1);

  const Total_Basic_GSS_Cost =
    Total_Basic_GSS_Equipment +
    offerData.transmission_length * bdRate.transmission_line;
  const Total_GST_GSS_Cost =
    Total_GST_GSS_Equipment +
    (offerData.transmission_length * bdRate.transmission_line * 18) / 100;
  const Total_with_GST_Cost =
    Totalwith_GST_GSS_Equipment +
    ((offerData.transmission_length * bdRate.transmission_line * 18) / 100 +
      bdRate.transmission_line * offerData.transmission_length);

  const Final_Total_Plant_Cost = Total_Plant_Cost_1 + Total_Basic_GSS_Cost;
  const Final_Total_GST_Plant_Cost =
    Total_Plant_Cost_GST_1 + Total_GST_GSS_Cost;
  const Final_Total_with_GST_Plant_Cost =
    Total_Plant_Cost_with_GST_1 + Total_with_GST_Cost;

  const Cost_Without_Module = Final_Total_Plant_Cost - TotalVal1;
  const Cost_Without_Module_GST =
    Final_Total_GST_Plant_Cost - (TotalVal1 * 12) / 100;
  const Cost_Without_Module_with_GST =
    Final_Total_with_GST_Plant_Cost - ((TotalVal1 * 12) / 100 + TotalVal1);

  const Total_Cost_Basic = Math.round(
    Final_Total_Plant_Cost / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);
  const Total_Cost_GST = Math.round(
    Final_Total_GST_Plant_Cost / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);
  const Total_Cost_with_GST = Math.round(
    Final_Total_with_GST_Plant_Cost / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);

  const Without_module_INR_wp_Basic = Math.round(
    Cost_Without_Module / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);
  const Without_module_INR_wp_GST = Math.round(
    Cost_Without_Module_GST / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);
  const Without_Module__INR_wp_with_GST = Math.round(
    Cost_Without_Module_with_GST / offerData.dc_capacity / 1000 / 1000
  ).toFixed(2);

  const Solar_Module_Basic_value_per_Wp =
    Math.floor((TotalVal1 / (offerData.dc_capacity * 1000 * 1000)) * 100) / 100;

  const Total_Basic_Solar_Datalogger_Per_Wp =
    Math.floor(
      (Total_Basic_Solar_Datalogger / (offerData.dc_capacity * 1000 * 1000)) *
        100
    ) / 100;

  const Total_Basic_MMS_Fastner_Per_Wp =
    Math.floor(
      (Total_Basic_MMS_Fastner / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Total_Basic_Cables_Per_Wp =
    Math.floor(
      (Total_Basic_Cables / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Total_Basic_Electrical_Equipment_Per_Wp =
    Math.floor(
      (Total_Basic_Electrical_Equipment /
        (offerData.dc_capacity * 1000 * 1000)) *
        100
    ) / 100;

  const Total_Basic_Other_Material_Per_Wp =
    Math.floor(
      (Total_Basic_Other_Material / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Total_Basic_Installation_Charges_Per_Wp =
    Math.floor(
      (Total_Basic_Installation_Charges /
        (offerData.dc_capacity * 1000 * 1000)) *
        100
    ) / 100;

  const Slnko_Service_Charge_Per_Wp =
    Math.floor((TotalVal32 / (offerData.dc_capacity * 1000 * 1000)) * 100) /
    100;

  const Total_Plant_Cost_1_Per_Wp =
    Math.floor(
      (Total_Plant_Cost_1 / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Total_Basic_GSS_Equipment_Per_Wp =
    Math.floor(
      (Total_Basic_GSS_Equipment / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Transmission_Line_Per_Wp =
    Math.floor(
      ((offerData.transmission_length * bdRate.transmission_line) /
        (offerData.dc_capacity * 1000 * 1000)) *
        100
    ) / 100;

  const Total_Basic_GSS_Cost_Per_Wp =
    Math.floor(
      (Total_Basic_GSS_Cost / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Final_Total_Plant_Cost_Per_Wp =
    Math.floor(
      (Final_Total_Plant_Cost / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Cost_Without_Module_Per_Wp =
    Math.floor(
      (Cost_Without_Module / (offerData.dc_capacity * 1000 * 1000)) * 100
    ) / 100;

  const Total_Cost_Basic_Per_Wp =
    ((Total_Cost_Basic / (offerData.dc_capacity * 1000 * 1000)) * 100) / 100;

  console.log("Total_Cost_Basic_Per_Wp: ", Total_Cost_Basic_Per_Wp);

  const Without_module_INR_wp_Basic_Per_Wp =
    ((Without_module_INR_wp_Basic / (offerData.dc_capacity * 1000 * 1000)) *
      100) /
    100;

  console.log(
    "Without_module_INR_wp_Basic_Per_Wp :",
    Without_module_INR_wp_Basic_Per_Wp
  );

  const Total_Basic_Transportatiom_Insurance_Per_Wp =
    Math.floor(
      (Total_Basic_Transportatiom_Insurance /
        (offerData.dc_capacity * 1000 * 1000)) *
        100
    ) / 100;

  return (
    <>
      <Grid
        container
        sx={{
          width: "100%",
          // height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          "@media print": {
            width: "210mm",
            height: "297mm",
            overflow: "hidden",
            margin: "0",
            padding: "0",
            pageBreakInside: "avoid",
          },
        }}
      >
        <Grid
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button onClick={handleBack}>Back</Button>
        </Grid>

        <Grid
          sx={{
            width: "60%",
            height: "100%",
            //  border: "2px solid #0f4C7f",
            "@media print": {
              width: "100%",
              height: "100vh",
            },
          }}
        >
          {/* <Box
             sx={{
               display: "flex",
               width: "100%",
               alignItems: "flex-end",
               gap: 2,
               paddingTop: "20px",
               "@media print": {
                 padding: "5px",
                 marginTop: "10px",
               },
             }}
           >
             <img
               width={"220px"}
               height={"110px"}
               alt="logo"
               src={logo}
               style={{ maxWidth: "100%" }}
             />
             <Box
               sx={{
                 width: "60%",
                 margin: "18px 0",
                 "@media (max-width: 1340px)": {
                   width: "50%",
                 },
               }}
             >
               <hr
                 style={{
                   width: "100%",
                   color: "blue",
                   borderTop: "2px solid #0f4C7f",
                 }}
               />
             </Box>
           </Box> */}

          <Box
            sx={{
              width: "90%",
              height: "80%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "auto",
            }}
          >
            <Sheet
              sx={{
                width: "99.5%",
                height: "100%",
                backgroundColor: "white",
                margin: "10px",
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Table className="table-header-Summary">
                <thead>
                  {/* <tr>
                    <th
                      colSpan={4}
                      style={{
                        fontWeight: "bold",
                        fontFamily: "serif",
                        fontSize: "1.2rem",
                        textAlign: "center",
                        backgroundColor: "#B4C7E7",
                      }}
                    ></th>
                  </tr> */}

                  <tr>
                    <th
                      colSpan={5}
                      style={{
                        fontWeight: "bold",
                        fontFamily: "serif",

                        textAlign: "center",
                        // backgroundColor: "#D9D9D9",
                        background: "#0f4c7f",
                      }}
                    >
                      PLANT COSTING SUMMARY ONLY
                    </th>
                  </tr>

                  <tr>
                    <th
                      style={{
                        fontWeight: "bold",
                        fontFamily: "serif",
                        fontSize: "1.2rem",
                        textAlign: "center",
                      }}
                    >
                      Capacity
                    </th>
                    <th
                      colSpan={4}
                      style={{
                        fontWeight: "500",
                        fontFamily: "sans-serif !important",
                        fontSize: "1.2rem",
                        textAlign: "center",
                        background: "#ffffff",
                        color: "black",
                      }}
                    >
                      {offerData.dc_capacity} MWp DC
                    </th>
                  </tr>

                  <th style={{ width: "40%" }}>Items</th>
                  <th>Basic Value</th>
                  <th>GST Value</th>
                  <th>Total With GST Value</th>
                  <th>Basic Value Per Wp</th>
                </thead>

                <tbody>
                  <tr>
                    <td>Solar Module</td>
                    <td>{Number(TotalVal1).toLocaleString()}</td>
                    <td>
                      {Math.round((TotalVal1 * 12) / 100).toLocaleString()}
                    </td>
                    <td>
                      {Math.round(
                        (TotalVal1 * 12) / 100 + TotalVal1
                      ).toLocaleString()}
                    </td>
                    <td>{Solar_Module_Basic_value_per_Wp}</td>
                  </tr>

                  <tr>
                    <td>Solar Inverter & Datalogger</td>
                    <td>
                      {Number(Total_Basic_Solar_Datalogger).toLocaleString()}
                    </td>
                    <td>
                      {Number(Total_GST_Solar_Datalogger).toLocaleString()}
                    </td>
                    <td>
                      {Number(Total_with_GST_Solar_Datalogger).toLocaleString()}
                    </td>
                    <td>{Total_Basic_Solar_Datalogger_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>MMS With Fasteners</td>
                    <td>{Number(Total_Basic_MMS_Fastner).toLocaleString()}</td>
                    <td>{Number(Total_GST_MMS_Fastner).toLocaleString()}</td>
                    <td>
                      {Number(Total_with_GST_MMS_Fastner).toLocaleString()}
                    </td>
                    <td>{Total_Basic_MMS_Fastner_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>Cables</td>
                    <td>{Number(Total_Basic_Cables).toLocaleString()}</td>
                    <td>{Number(Total_GST_Cables).toLocaleString()}</td>
                    <td>{Number(Total_with_GST_Cables).toLocaleString()}</td>
                    <td>{Total_Basic_Cables_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>
                      Electrical Equipment - Solar Plant Side (Transformer+LT
                      Panel+HT Panel+Aux Transformer+UPS System)
                    </td>
                    <td>
                      {Number(
                        Total_Basic_Electrical_Equipment
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(Total_GST_Electrical_Equipment).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        Total_with_GST_Electrical_Equipment
                      ).toLocaleString()}
                    </td>
                    <td>{Total_Basic_Electrical_Equipment_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>Other Balance of Material</td>
                    <td>
                      {Number(Total_Basic_Other_Material).toLocaleString()}
                    </td>
                    <td>{Number(Total_Gst_Other_Material).toLocaleString()}</td>
                    <td>
                      {Number(Total_with_Gst_Other_Material).toLocaleString()}
                    </td>
                    <td>{Total_Basic_Other_Material_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>
                      Installation Charges inside boundary wall (Labour,
                      Machinery & Civil Material)
                    </td>
                    <td>
                      {Number(
                        Total_Basic_Installation_Charges
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(Total_GST_Installation_Charges).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        Total_with_GST_Installation_Charges
                      ).toLocaleString()}
                    </td>
                    <td>{Total_Basic_Installation_Charges_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>Transportation & Insurance</td>
                    <td>
                      {Number(
                        Total_Basic_Transportatiom_Insurance
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        Total_GST_Transportatiom_Insurance
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        Total_with_GST_Transportatiom_Insurance
                      ).toLocaleString()}
                    </td>
                    <td>{Total_Basic_Transportatiom_Insurance_Per_Wp}</td>
                  </tr>
                  <tr>
                    <td>SLnko Service Charges</td>
                    <td>{Number(TotalVal32).toLocaleString()}</td>
                    <td>{((TotalVal32 * 18) / 100).toLocaleString()}</td>
                    <td>
                      {((TotalVal32 * 18) / 100 + TotalVal32).toLocaleString()}
                    </td>
                    <td>{Slnko_Service_Charge_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td
                      style={{ backgroundColor: "#FFF2CC", fontWeight: "bold" }}
                    >
                      1. Total Plant Cost
                    </td>
                    <td style={{ backgroundColor: "#FFF2CC" }}>
                      {Number(Total_Plant_Cost_1).toLocaleString()}
                    </td>
                    <td style={{ backgroundColor: "#FFF2CC" }}>
                      {Number(Total_Plant_Cost_GST_1).toLocaleString()}
                    </td>
                    <td style={{ backgroundColor: "#FFF2CC" }}>
                      {Number(Total_Plant_Cost_with_GST_1).toLocaleString()}
                    </td>
                    <td style={{ backgroundColor: "#FFF2CC" }}>
                      {Total_Plant_Cost_1_Per_Wp}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        fontWeight: "bold",
                        fontFamily: "sans-serif",
                        fontSize: "1rem",
                        backgroundColor: "#D9D9D9",
                      }}
                    >
                      GSS ITEMS COSTING SUMMARY
                    </td>
                  </tr>

                  <tr>
                    <td>GSS Equipments</td>
                    <td>
                      {Number(Total_Basic_GSS_Equipment).toLocaleString()}
                    </td>
                    <td>{Number(Total_GST_GSS_Equipment).toLocaleString()}</td>
                    <td>
                      {Number(Totalwith_GST_GSS_Equipment).toLocaleString()}
                    </td>
                    <td>{Total_Basic_GSS_Equipment_Per_Wp}</td>
                  </tr>

                  <tr>
                    <td>Transmission Line</td>
                    <td>
                      {Number(
                        offerData.transmission_length * bdRate.transmission_line
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        (offerData.transmission_length *
                          bdRate.transmission_line *
                          18) /
                          100
                      ).toLocaleString()}
                    </td>
                    <td>
                      {Number(
                        (Math.round(
                          offerData.transmission_length *
                            bdRate.transmission_line
                        ) *
                          18) /
                          100 +
                          bdRate.transmission_line *
                            offerData.transmission_length
                      ).toLocaleString()}
                    </td>
                    <td>{Transmission_Line_Per_Wp}</td>
                  </tr>

                  <tr
                    style={{ backgroundColor: "#FFF2CC", fontWeight: "bold" }}
                  >
                    <td>2. Total GSS Equipment Cost</td>
                    <td>{Number(Total_Basic_GSS_Cost).toLocaleString()}</td>
                    <td>{Number(Total_GST_GSS_Cost).toLocaleString()}</td>
                    <td>{Number(Total_with_GST_Cost).toLocaleString()}</td>
                    <td>{Total_Basic_GSS_Cost_Per_Wp}</td>
                  </tr>

                  <tr
                    style={{
                      backgroundColor: "#ead34d",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      fontFamily: "sans-serif",
                    }}
                  >
                    <td>TOTAL PLANT COST (1+2)</td>
                    <td>{Number(Final_Total_Plant_Cost).toLocaleString()}</td>
                    <td>
                      {Number(Final_Total_GST_Plant_Cost).toLocaleString()}
                    </td>
                    <td>
                      {Number(Final_Total_with_GST_Plant_Cost).toLocaleString()}
                    </td>
                    <td>{Total_Cost_Basic}</td>
                  </tr>

                  <tr
                    style={{
                      backgroundColor: "#D9D9D9",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      fontFamily: "sans-serif",
                    }}
                  >
                    <td>Cost without Module</td>
                    <td>{Number(Cost_Without_Module).toLocaleString()}</td>
                    <td>{Number(Cost_Without_Module_GST).toLocaleString()}</td>
                    <td>
                      {Number(Cost_Without_Module_with_GST).toLocaleString()}
                    </td>
                    <td>{Without_module_INR_wp_Basic}</td>
                  </tr>

                  <tr>
                    <td>Total Cost (INR/Wp DC)</td>
                    <td>{Total_Cost_Basic}</td>
                    <td>{Total_Cost_GST}</td>
                    <td>{Total_Cost_with_GST}</td>
                    {/* <td>{Total_Cost_Basic_Per_Wp}</td> */}
                    <td>-</td>
                  </tr>

                  <tr>
                    <td>Cost without Module (INR/Wp DC)</td>
                    <td>{Without_module_INR_wp_Basic}</td>
                    <td>{Without_module_INR_wp_GST}</td>
                    <td>{Without_Module__INR_wp_with_GST}</td>
                    {/* <td>{Without_module_INR_wp_Basic_Per_Wp}</td> */}
                    <td>-</td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>
          </Box>
          <Box
            sx={{
              width: "100%",
              padding: "7px 10px",
              "@media print": { marginTop: "20px" },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontFamily: "sans-serif",
                backgroundColor: "#D9D9D9",
                padding: "8px",
                "@media print": {
                  fontSize: "1.2rem",
                },
              }}
            >
              Exclusions:
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                p: 2,
                "@media print": {
                  padding: 0,
                },
              }}
            >
              <Box sx={{ px: 2, "@media print": { pl: 1 } }}>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  1. Control Room
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  2. Water Arrangement
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  3. Boundary Wall / Fencing
                </Typography>
              </Box>
              <Box sx={{ px: 2, "@media print": { pl: 1 } }}>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  4. Road & Drainage System
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  5. WMS (Weather Monitoring System)
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  6. ROW (Right of Way)
                </Typography>
              </Box>
              <Box sx={{ px: 2, "@media print": { pl: 1 } }}>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  7. Dry Cleaning Robot
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  8. CCTV/Security
                </Typography>
                <Typography
                  sx={{ "@media print": { fontSize: "1.2rem" } }}
                  fontWeight="bold"
                >
                  {Number(
                    offerData.transmission_length * bdRate.transmission_line
                  ).toLocaleString() === "0"
                    ? "9. Transmission Line"
                    : ""}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Summary;
