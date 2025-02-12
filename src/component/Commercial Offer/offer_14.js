import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useState, useEffect } from "react";
import Axios from "../../utils/Axios";
import logo from "../../assets/slnko_blue_logo.png";
import "./CSS/offer.css";

const CivilWorks1 = () => {
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
    spv_modules: "",
    solar_inverter: "",
    module_mounting_structure: "",
    mounting_hardware: "",
    dc_cable: "",
    ac_cable_inverter_accb: "",
    ac_cable_accb_transformer: "",
    ac_ht_cable: "",
    earthing_station: "",
    earthing_strips: "",
    earthing_strip: "",
    lightening_arrestor: "",
    datalogger: "",
    auxilary_transformer: "",
    ups_ldb: "",
    balance_of_system: "",
    transportation: "",
    transmission_line: "",
    transmission_line_internal: "",
    transmission_line_print: "",
    ct_pt: "",
    abt_meter: "",
    vcb_kiosk: "",
    slnko_charges: "",
    installation_commissioing: {
      labour_works: "",
      machinery: "",
      civil_material: "",
    },
  });

  //  const[loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("offerId");
        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          alert("Offer ID is missing!");
          // setLoading(false);
          return;
        }

        // Fetch both APIs concurrently
        const [response, result] = await Promise.all([
          Axios.get("/get-comm-offer"),
          Axios.get("/get-comm-scm-rate"),
        ]);

        console.log("API Response (Offer):", response.data);
        console.log("API Response (SCM Rate):", result.data);

        const fetchedData = response.data;
        const fetchedScmData = result.data;
        const offerData = fetchedData.find(
          (item) => item.offer_id === offerRate
        );
        const fetchRate = fetchedScmData.find((item) => item.offer_id === offerRate)

        if (!offerData) {
          console.error("No matching offer data found");
          alert("No matching offer data found!");
          // setLoading(false);
          return;
        }

        localStorage.setItem("offer_data", JSON.stringify(offerData));
        localStorage.setItem("scm_data", JSON.stringify(fetchedScmData));

        setOfferData({
          offer_id: offerData.offer_id || "",
          client_name: offerData.client_name || "",
          village: offerData.village || "",
          district: offerData.district || "",
          state: offerData.state || "",
          pincode: offerData.pincode || "",
          ac_capacity: offerData.ac_capacity || "",
          dc_overloading: offerData.dc_overloading || "",
          dc_capacity: offerData.dc_capacity || "",
          scheme: offerData.scheme || "",
          component: offerData.component || "",
          rate: offerData.rate || "",
          timeline: offerData.timeline || "",
          prepared_by: offerData.prepared_by || "",
          module_type: offerData.module_type || "",
          module_capacity: offerData.module_capacity || "",
          inverter_capacity: offerData.inverter_capacity || "",
          evacuation_voltage: offerData.evacuation_voltage || "",
          module_orientation: offerData.module_orientation || "",
          transmission_length: offerData.transmission_length || "",
          transformer: offerData.transformer || "",
          column_type: offerData.column_type || "",
        });

        setscmData({
          spv_modules: fetchRate.spv_modules || "",
          solar_inverter: fetchRate.solar_inverter || "",
          module_mounting_structure:
            fetchRate.module_mounting_structure || "",
          mounting_hardware: fetchRate.mounting_hardware || "",
          dc_cable: fetchRate.dc_cable || "",
          ac_cable_inverter_accb: fetchRate.ac_cable_inverter_accb || "",
          ac_cable_accb_transformer:
            fetchRate.ac_cable_accb_transformer || "",
          ac_ht_cable: fetchRate.ac_ht_cable || "",
          earthing_station: fetchRate.earthing_station || "",
          earthing_strips: fetchRate.earthing_strips || "",
          earthing_strip: fetchRate.earthing_strip || "",
          lightening_arrestor: fetchRate.lightening_arrestor || "",
          datalogger: fetchRate.datalogger || "",
          auxilary_transformer: fetchRate.auxilary_transformer || "",
          ups_ldb: fetchRate.ups_ldb || "",
          balance_of_system: fetchRate.balance_of_system || "",
          transportation: fetchRate.transportation || "",
          transmission_line: fetchRate.transmission_line || "",
          transmission_line_internal:fetchRate.transmission_line_internal || "",
          transmission_line_print:fetchRate.transmission_line_print || "",
          ct_pt: fetchRate.ct_pt || "",
          abt_meter: fetchRate.abt_meter || "",
          vcb_kiosk: fetchRate.vcb_kiosk || "",
          slnko_charges: fetchRate.slnko_charges || "",
          installation_commissioing: {
            labour_works:
              fetchRate.installation_commissioing?.labour_works || "",
            machinery:
              fetchRate.installation_commissioing?.machinery || "",
            civil_material:
              fetchRate.installation_commissioing?.civil_material || "",
          },
        });
      } catch (error) {
        console.error("Error fetching commercial offer data:", error);
      }
    };

    fetchData();
  }, []);

  //***for 24th row ***/
  const internalQuantity24 = offerData.dc_capacity * 1000;

  //***for 25th row ***/
  const internalQuantity25 = Math.round(offerData.dc_capacity * 3) + 4;

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
  const TotalVal32 = scmData.slnko_charges * internalQuantity32 * 1000;

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
    (offerData.module_orientation === "Portrait" ? 23 : 29) *
    1000 *
    offerData.dc_capacity;

  // ***for 5th row***
  const InternalQuantity5 = offerData.dc_capacity * 7000;

  // ***for 6th row***
  const InternalQuantity6 = internalQuantity2 * 97.5;

  // ***for 6th row***
  const InternalQuantity7 = internalQuantity2 * 20;

  //***Total Value 1***/
  const TotalVal1 =
    scmData.spv_modules * PrintQuantity1 * offerData.module_capacity;

  //***Total Value 2***/
  const TotalVal2 = scmData.solar_inverter * internalQuantity2;

  //***Total Value 3***/
  const TotalVal3 = scmData.module_mounting_structure * InternalQuantity3;

  //***Total Value 4***/
  const TotalVal4 = Math.round(
    scmData.mounting_hardware * offerData.dc_capacity * 1000 * 1000
  );

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

  //***Total Value 8***/
  const TotalVal8 = scmData.ac_ht_cable * 50;

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
    ? Math.round(offerData.dc_capacity * 4 + internalQuantity2 + 10)
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

  //***Total Value 16***/
  const TotalVal16 = internalQuantity16 * scmData.earthing_station;

  //***Total Value 17***/
  const TotalVal17 = internalQuantity17 * scmData.earthing_strips;

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
    ((TotalVal19 * 18) / 100 + TotalVal19) +
    ((TotalVal20 * 18) / 100 + TotalVal20) +
    ((TotalVal21 * 18) / 100 + TotalVal21) +
    ((TotalVal22 * 18) / 100 + TotalVal22) +
    ((TotalVal23 * 18) / 100 + TotalVal23) +
    ((TotalVal24 * 18) / 100 + TotalVal24) +
    ((TotalVal25 * 18) / 100 + TotalVal25) +
    ((TotalVal26 * 18) / 100 + TotalVal26) +
    ((TotalVal27 * 18) / 100 + TotalVal27) +
    ((scmData.ct_pt * 2 * 18) / 100 + scmData.ct_pt * 2) +
    ((scmData.abt_meter * 3 * 18) / 100 + scmData.abt_meter * 3) +
    ((scmData.vcb_kiosk * 1 * 18) / 100 + scmData.vcb_kiosk * 1) +
    ((scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
      scmWeekly4(offerData.ac_capacity) * 1);

  const scmWeekly5 = Math.round((SumO6ToO38 * 0.1) / 100);

  return (
    <>
      <Grid
        sx={{
          width: "100%",
          height: "25%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid
          sx={{
            width: "100%",
            height: "100%",
            // border: "2px solid blue",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            {/* <img width={"220px"} height={"110px"} alt="logo" src={logo} /> */}

            {/* <hr
              style={{
                width: "60%",
                color: "blue",
                borderTop: "3px solid #0f4C7f",
                margin: "19px 0",
              }}
            /> */}
          </Box>
          <Box
            sx={{
              width: "100%",
              // height: "100%",
              // marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                color: "#56A4DA",
                fontSize: "3rem",
                fontWeight: "bolder",
                textDecoration: "underline rgb(243, 182, 39)",
                textDecorationThickness: "3px",
                textUnderlineOffset: "6px",
              }}
            >
              Civil&nbsp;{" "}
            </Typography>

            <Typography
              sx={{
                color: "black",
                fontSize: "3rem",
                fontWeight: "bolder",
                textDecoration: "underline rgb(243, 182, 39)",
                textDecorationThickness: "3px",
                textUnderlineOffset: "6px",
              }}
            >
              Works
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: "76vh",
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
              }}
            >
              <Table className="table-header">
                <thead>
                  <tr>
                    <th style={{ width: "2.5%" }}>S.NO.</th>
                    <th style={{ width: "5.5%" }}>ITEM NAME</th>
                    <th style={{ width: "6%" }}>RATING</th>
                    <th style={{ width: "20%" }}>SPECIFICATION</th>
                    <th>UoM</th>
                    <th>Qty (Int.)</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Rate UoM</th>
                    <th>Total Value</th>
                    <th>GST</th>
                    <th>GST Value</th>
                    <th>Total with GST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <span style={{ fontWeight: "bold" }}>MACHINARY :</span>{" "}
                    Includes Augar, Tractor, JCBs, Hydra, Ajax and other
                    machinaries
                    <td></td>
                    <td>KWp</td>
                    <td>{internalQuantity24}</td>
                    <td>{internalQuantity24}</td>
                    <td>{scmData.installation_commissioing.machinery}</td>
                    <td>INR/Wp</td>
                    <td>{TotalVal25}</td>
                    <td>18%</td>
                    <td>{(TotalVal25 * 18) / 100}</td>
                    <td>{(TotalVal25 * 18) / 100 + TotalVal25}</td>
                  </tr>

                  <tr>
                    <td></td>
                    <td></td>
                    <td>
                      <span style={{ fontWeight: "bold" }}>
                        CIVIL MATERIAL:
                      </span>{" "}
                      Cement, Aggregates, Bricks, Sand & Iron Bars
                    </td>
                    <td></td>
                    <td>KWp</td>
                    <td>{internalQuantity24}</td>
                    <td>{internalQuantity24}</td>
                    <td>{scmData.installation_commissioing.civil_material}</td>
                    <td>INR/Wp</td>
                    <td>{TotalVal26}</td>
                    <td>18%</td>
                    <td>{(TotalVal26 * 18) / 100}</td>
                    <td>{(TotalVal26 * 18) / 100 + TotalVal26}</td>
                  </tr>

                  <tr>
                    <td>25.</td>
                    <td>Transportaion</td>
                    <td>Transformer, LT/HT, Cables, BOS</td>
                    <td></td>
                    <td>Vehicles</td>
                    <td>{internalQuantity25}</td>
                    <td>{internalQuantity25}</td>
                    <td>{scmData.transportation}</td>
                    <td>INR/Vehicle</td>
                    <td>{TotalVal27}</td>
                    <td>18%</td>
                    <td>{(TotalVal27 * 18) / 100}</td>
                    <td>{(TotalVal27 * 18) / 100 + TotalVal27}</td>
                  </tr>

                  <tr>
                    <td>26.</td>
                    <td>Transmission Line</td>
                    <td>
                      11 kV Transmission Line with appropriate conductor size
                      and PCC Poles
                    </td>
                    <td></td>
                    <td>Km</td>
                    <td>{scmData.transmission_line_internal}</td>
                    <td>{scmData.transmission_line_print}</td>
                    <td>{scmData.transmission_line}</td>
                    <td>INR/Km</td>
                    <td>
                      {scmData.transmission_line *
                        scmData.transmission_line_print}
                    </td>
                    <td>18%</td>
                    <td>
                      {(scmData.transmission_line *
                        scmData.transmission_line_print *
                        18) /
                        100}
                    </td>
                    <td>
                      {(scmData.transmission_line *
                        scmData.transmission_line_print *
                        18) /
                        100 +
                        scmData.transmission_line *
                          scmData.transmission_line_print}
                    </td>
                  </tr>

                  <tr>
                    <td>27.</td>
                    <td>CT PT</td>
                    <td>As per DISCOM requirements</td>
                    <td></td>
                    <td>Set</td>
                    <td>2</td>
                    <td>2</td>
                    <td>{scmData.ct_pt}</td>
                    <td>INR/Set</td>
                    <td>{scmData.ct_pt * 2}</td>
                    <td>18%</td>
                    <td>{(scmData.ct_pt * 2 * 18) / 100}</td>
                    <td>
                      {(scmData.ct_pt * 2 * 18) / 100 + scmData.ct_pt * 2}
                    </td>
                  </tr>

                  <tr>
                    <td>28.</td>
                    <td>ABT Meter</td>
                    <td>As per DISCOM requirements</td>
                    <td></td>
                    <td>Set</td>
                    <td>3</td>
                    <td>3</td>
                    <td>{scmData.abt_meter}</td>
                    <td>INR/Set</td>
                    <td>{scmData.abt_meter * 3}</td>
                    <td>18%</td>
                    <td>{(scmData.abt_meter * 3 * 18) / 100}</td>
                    <td>
                      {(scmData.abt_meter * 3 * 18) / 100 +
                        scmData.abt_meter * 3}
                    </td>
                  </tr>

                  <tr>
                    <td>29.</td>
                    <td>VCB Kiosk</td>
                    <td>As per DISCOM requirements</td>
                    <td></td>
                    <td>Set</td>
                    <td>1</td>
                    <td>1</td>
                    <td>{scmData.vcb_kiosk}</td>
                    <td>INR/Set</td>
                    <td>{scmData.vcb_kiosk * 1}</td>
                    <td>18%</td>
                    <td>{(scmData.vcb_kiosk * 1 * 18) / 100}</td>
                    <td>
                      {(scmData.vcb_kiosk * 1 * 18) / 100 +
                        scmData.vcb_kiosk * 1}
                    </td>
                  </tr>

                  <tr>
                    <td>30.</td>
                    <td>RMS at Substation side</td>
                    <td>As per DISCOM requirements</td>
                    <td></td>
                    <td>Set</td>
                    <td>1</td>
                    <td>1</td>
                    <td>{scmWeekly4(offerData.ac_capacity)}</td>
                    <td>INR/Set</td>
                    <td>{scmWeekly4(offerData.ac_capacity) * 1}</td>
                    <td>18%</td>
                    <td>
                      {(scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100}
                    </td>
                    <td>
                      {(scmWeekly4(offerData.ac_capacity) * 1 * 18) / 100 +
                        scmWeekly4(offerData.ac_capacity) * 1}
                    </td>
                  </tr>

                  <tr>
                    <td>31.</td>
                    <td>Plant Insurance</td>
                    <td>Transit & EAR</td>
                    <td></td>
                    <td>KWp</td>
                    <td>{internalQuantity31}</td>
                    <td>{internalQuantity31}</td>
                    <td>{scmWeekly5}</td>
                    <td>INR</td>
                    <td>{scmWeekly5}</td>
                    <td>18%</td>
                    <td>{Math.round((scmWeekly5 * 18) / 100)}</td>
                    <td>{Math.round((scmWeekly5 * 18) / 100 + scmWeekly5)}</td>
                  </tr>

                  <tr>
                    <td>32.</td>
                    <td>SLNKO EPCM Service Charges</td>
                    <td>SLNKO FEE</td>
                    <td></td>
                    <td>KWp</td>
                    <td>{internalQuantity32}</td>
                    <td>{internalQuantity32}</td>
                    <td>{scmData.slnko_charges}</td>
                    <td>INR</td>
                    <td>{TotalVal32}</td>
                    <td>18%</td>
                    <td>{(TotalVal32 * 18) / 100}</td>
                    <td>{(TotalVal32 * 18) / 100 + TotalVal32}</td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default CivilWorks1;
