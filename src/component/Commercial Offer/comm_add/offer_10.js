import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../../assets/slnko_blue_logo.png";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

const Reference = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("offer_rate");
        // console.log("Fetched offer_id from localStorage page10:", offerRate);

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

       const token = localStorage.getItem("authToken");
const config = { headers: { "x-auth-token": token } };

const [response, result, answer] = await Promise.all([
  Axios.get("/get-comm-offer", config),
  Axios.get("/get-comm-scm-rate", config),
  Axios.get("/get-comm-bd-rate", config),
]);


        const fetchedData = response.data;
        const fetchedScmData = result.data[0];
        const fetchedBdData = answer.data;

        // console.log("Fetched Offer Data:", fetchedData);
        // console.log("Fetched SCM Rate Data:", fetchedScmData);
        // console.log("Fetched BD Rate Data:", fetchedBdData);

        const offerFetchData = fetchedData.find(
          (item) => item.offer_id === offerRate
        );
        const fetchRatebd = fetchedBdData.find(
          (item) => item.offer_id === offerRate
        );

        // console.log("Matched Offer Data:", offerFetchData);
        // console.log("Matched BD Rate Data:", fetchRatebd);

        if (!offerFetchData) {
          console.error("No matching offer data found");
          toast.error("No matching offer data found!");
          return;
        }

        setOfferData({
          offer_id: offerFetchData.offer_id || "",
          client_name: offerFetchData.client_name || "",
          village: offerFetchData.village || "",
          district: offerFetchData.district || "",
          state: offerFetchData.state || "",
          pincode: offerFetchData.pincode || "",
          ac_capacity: offerFetchData.ac_capacity || "",
          dc_overloading: offerFetchData.dc_overloading || "",
          dc_capacity: offerFetchData.dc_capacity || "",
          scheme: offerFetchData.scheme || "",
          component: offerFetchData.component || "",
          rate: offerFetchData.rate || "",
          timeline: offerFetchData.timeline || "",
          prepared_by: offerFetchData.prepared_by || "",
          module_type: offerFetchData.module_type || "",
          module_capacity: offerFetchData.module_capacity || "",
          inverter_capacity: offerFetchData.inverter_capacity || "",
          evacuation_voltage: offerFetchData.evacuation_voltage || "",
          module_orientation: offerFetchData.module_orientation || "",
          transmission_length: offerFetchData.transmission_length || "",
          transformer: offerFetchData.transformer || "",
          column_type: offerFetchData.column_type || "",
        });

        // console.log("Set Offer Data:", offerFetchData);

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

        // console.log("Set SCM Data:", fetchedScmData);

        if (fetchRatebd) {
          setBdRate({
            // offer_id: fetchRatebd.offer_id || "",
            spv_modules: fetchRatebd.spv_modules || "",
            module_mounting_structure:
              fetchRatebd.module_mounting_structure || "",
            transmission_line: fetchRatebd.transmission_line || "",
            slnko_charges: fetchRatebd.slnko_charges || "",
            submitted_by_BD: fetchRatebd.submitted_by_BD || "",
          });
          // console.log("Set BD Rate Data:", fetchRatebd);
        } else {
          console.warn(
            "No matching BD Rate data found for offer_id:",
            offerRate
          );
        }
      } catch (error) {
        console.error("Error fetching commercial offer data:", error);
      }
    };

    fetchData();
  }, []);

  const getSpecification = (module_capacity) => {
    // Use the module_capacity value directly for specification logic
    if (module_capacity === 550 || module_capacity === 555) {
      return "Highly efficient Mono PERC M10 cells P-Type, PID Free & UV Resistant, With Inbuilt Bypass Diode, Frame is made of Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag inside module, Product Warranty up to 12 Years and Performance Warranty Up to 27/30 Years.";
    } else if (module_capacity === 580 || module_capacity === 585) {
      return "Highly efficient TOPCon Bifacial N-Type, PID Free & UV Resistant, With Inbuilt Bypass Diode, Frame is made of Aluminium Anodized With Power Tolerance + 5Wp, With RFID Tag inside module, Product Warranty up to 12 Years and Performance Warranty Up to 27/30 Years.";
    } else {
      return "Specification not available.";
    }
  };

  const mountingStructure = (module_orientation) => {
    if (module_orientation === "Portrait") {
      return "2PX12";
    } else if (module_orientation === "Agrivoltaic") {
      return "2Px24";
    } else {
      return "4LX6";
    }
  };

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

  const evacuationVoltage = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return "11 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    } else {
      return "33 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    }
  };

    //***for N10 ***/
    const Nten = (internalQuantity2) => {
      if (internalQuantity2 <= 11) {
        // console.log(`Nten = ${internalQuantity2}`); 
        return internalQuantity2;
      } else {
        const roundedValue = Math.round(internalQuantity2 / 2);
        // console.log(`Nten = ${roundedValue}`); 
        return roundedValue;
      }
    };
  
    const NtenValue = Nten(internalQuantity2); // Call function and store the result
    const Neleven = internalQuantity2 - NtenValue; // Compute Neleven
      //***finding P17***/
  const setUp = (ac) => {
    const acValue = parseFloat(ac);
    if (!isNaN(acValue)) {
      return Math.round((acValue * 1.1 * 1000) / 100) * 100;
    }
    return "";
  };

  const EvacuationVoltage = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return "11 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
    } else {
      return "33 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
    }
  };
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
  ? offerData.dc_capacity * 1000 * 0.8
  : 0;

const internalQuantity17_2 = 150;

  //***Total Value 1***/
  const TotalVal1 =
    bdRate.spv_modules * PrintQuantity1 * offerData.module_capacity;

  //***Total Value 2***/
  const TotalVal2 = scmData.solar_inverter * internalQuantity2;

  //***Total Value 3***/
  const TotalVal3 = bdRate.module_mounting_structure * InternalQuantity3;

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

  return (
    <>
      <Grid
        sx={{
          width: "100%",
          // height: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "10px",
          alignItems: "center",
          "@media print": {
            width: "84%",
            height: "100%",
            overflow: "hidden",
            margin: "0",
            padding: "0",
            pageBreakInside: "avoid",
          },
        }}
      >
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            // marginTop: "5%",
            border: "2px solid #0f4C7f",
            "@media print": {
              width: "100%",
              height: "98vh",
              // border: "2px solid #0f4C7f",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "flex-end",
              gap: 2,
              marginTop: "2%",
            }}
          >
            <img
              width={"350px"}
              height={"200px"}
              className="logo-img1"
              alt="logo"
              src={logo}
              loading="lazy"
            />

            <hr
              style={{
                width: "50%",
                borderTop: "3px solid #0f4C7f", // Keeps the line visible
                margin: "40px 0",
                boxShadow: "none !important", // Force removal of any shadow
                background: "transparent !important", // Ensure no background color
                border: "none !important", // Ensure no border shadow
                // Remove any outline if applied
              }}
              className="hr-line"
            />
          </Box>

          <Box
            sx={{
              width: "100%",
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
              Reference&nbsp;{" "}
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
              Material List
            </Typography>
          </Box>
          <Sheet
            sx={{
              width: "100%",
              padding: "7px 10px",
              background: "white",
            }}
          >
            <Table className="table-header">
              <thead>
                <tr>
                  <th>S.NO.</th>
                  <th>ITEM NAME</th>
                  <th>RATING</th>
                  {/* <th>SPECIFICATION</th> */}
                  <th>UoM</th>
                  {/* <th>Qty (Int.)</th> */}
                  <th>Qty</th>
                  <th>Tentative Make</th>
                  <th>Category</th>
                  {/* <th>Rate</th>
                         <th>Rate UoM</th>
                         <th>Total Value</th>
                         <th>GST</th>
                         <th>GST Value</th>
                         <th>Total with GST</th> */}
                </tr>
              </thead>
              <tbody>
                {/* First row (SPV Modules) - Dynamic */}
                <tr>
                  <td>1.</td>
                  <td>SPV Modules</td>
                  <td>{offerData.module_capacity} Wp</td>
                  {/* <td>{getSpecification(offerData.module_capacity)}</td> */}

                  <td>Nos.</td>
                  {/* <td>{internalQuantity1}</td> */}
                  <td>{PrintQuantity1}</td>
                  <td>TIER 01 Domestic</td>
                  <td>Solar Module</td>
                  {/* <td>{bdRate.spv_modules}</td>
                         <td>INR/Wp</td>
                         <td>{Math.round(TotalVal1)}</td>
                         <td>12%</td>
                         <td>{Math.round((TotalVal1 * 12) / 100)}</td>
                         <td>{Math.round((TotalVal1 * 12) / 100 + TotalVal1)}</td> */}
                </tr>

                <tr>
                  <td>2.</td>
                  <td>Solar Inverter</td>
                  <td>{offerData.inverter_capacity} Wp</td>
                  {/* <td>
                    Grid-tied String Inverter, Three Phase, 50 Hz Inverter
                    output shall be at 800V, & IGBT/MOSFET Microprocessor,
                    Efficiency-98% or above. 5 years warranty shall be provided
                    by Manufacturer.
                  </td> */}
                  <td>Nos.</td>
                  {/* <td>{internalQuantity2}</td> */}
                  <td>{internalQuantity2}</td>
                  <td>Sungrow/Wattpower/Equivalent</td>
                  <td>Solar Inverter & Datalogger</td>
                  {/* <td>{scmData.solar_inverter}</td>
                         <td>INR/Nos.</td>
                         <td>{Math.round(TotalVal2)}</td>
                         <td>12%</td>
                         <td>{Math.round(TotalVal2*12/100)}</td>
                         <td>{Math.round(TotalVal2*12/100+TotalVal2)}</td> */}
                </tr>

                <tr>
                  <td>3.</td>
                  <td>Module Mounting Structure</td>
                  <td>{mountingStructure(offerData.module_orientation)}</td>
                  {/* <td>
                    MMS Shall be designed for wind speed as per IS 875 Part 3
                    and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                    conform to IS 15961, Column (YS-250) shall conform to IS
                    2062 & HDG shall conform to IS 4759.1996 and . Exact
                    Sections shall be decided at the time of detailed
                    engineering. Depth of pile foundation shall be decided after
                    soil tests.
                  </td> */}
                  <td>Kg</td>
                  {/* <td>{Math.round(InternalQuantity3)}</td> */}
                  <td>{Math.round(InternalQuantity3)}</td>
                  <td>JSW/TATA</td>
                  <td>MMS With Fasteners</td>
                  {/* <td>{bdRate.module_mounting_structure}</td>
                         <td>INR/Kg</td>
                         <td>{Math.round(TotalVal3)}</td>
                         <td>18%</td>
                         <td>{Math.round((TotalVal3 * 18) / 100)}</td>
                         <td>{Math.round((TotalVal3 * 18) / 100 + TotalVal3)}</td> */}
                </tr>

                <tr>
                  <td>4.</td>
                  <td>Module Mounting & MMS Hardware</td>
                  <td>SS304, HDG Grade 8.8</td>
                  {/* <td>
                    SS304 for Module to Purlin Mounting & HDG Grade 8.8 for all
                    other connections
                  </td> */}
                  <td>Set</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Reputed</td>
                  <td>MMS With Fasteners</td>
                  {/* <td>{scmData.mounting_hardware}</td>
                         <td>INR/Wp</td>
                         <td>{Math.round(TotalVal4)}</td>
                         <td>18%</td>
                         <td>{Math.round((TotalVal4 * 18) / 100)}</td>
                         <td>{Math.round((TotalVal4 * 18) / 100 + TotalVal4)}</td> */}
                </tr>

                <tr>
                  <td>5.</td>
                  <td>DC Cable (Solar Module to Inverter)</td>
                  <td>
                    1C x 4 sqmm Cu flexible copper conductor solar DC cable (Red
                    & Black)
                  </td>
                  {/* <td>
                    Flexible copper conductor solar DC cable, Fine wire strands
                    of annealed tinned copper, Rated 1.5 kV DC, Electron Beam
                    Cross Linked Co-polymer(XLPO) Halogen Free Insulation and
                    outer sheath, Black color and Red Colour, DC cables
                    complying to EN50618, TUV 2PFG 1169 for service life
                    expectency of 25 years. Flame retardent, UV resistent
                  </td> */}
                  <td>m</td>
                  {/* <td>{Math.round(InternalQuantity5)}</td> */}
                  <td>{Math.round(InternalQuantity5)}</td>
                  <td>Apar/Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>{scmData.dc_cable}</td>
                         <td>INR/m</td>
                         <td>{Math.round(TotalVal5)}</td>
                         <td>18%</td>
                         <td>{Math.round((TotalVal5 * 18) / 100)}</td>
                         <td>{Math.round((TotalVal5 * 18) / 100 + TotalVal5)}</td> */}
                </tr>

                <tr>
                  <td>6.</td>
                  <td>AC Cable (Inverter to ACCB) </td>
                  <td>1.9/3.3 kV,3C,300Sqmm Al</td>
                  {/* <td>
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td> */}
                  <td>m</td>
                  {/* <td>{InternalQuantity6}</td> */}
                  <td>{InternalQuantity6}</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>{scmData.ac_cable_inverter_accb}</td>
                         <td>INR/m</td>
                         <td>{Math.round(TotalVal6)}</td>
                         <td>18%</td>
                         <td>{Math.round((TotalVal6 * 18) / 100)}</td>
                         <td>{Math.round((TotalVal6 * 18) / 100 + TotalVal6)}</td> */}
                </tr>

                <tr>
                  <td>7.</td>
                  <td>AC Cable (ACCB to Transformer)</td>
                  <td>1.9/3.3 kV,3C,300Sqmm Al</td>
                  {/* <td>
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td> */}
                  <td>m</td>
                  {/* <td>{InternalQuantity7}</td> */}
                  <td>{InternalQuantity7}</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>{scmData.ac_cable_accb_transformer}</td>
                         <td>INR/m</td>
                         <td>{Math.round(TotalVal7)}</td>
                         <td>18%</td>
                         <td>{Math.round((TotalVal7 * 18) / 100)}</td>
                         <td>{Math.round((TotalVal7 * 18) / 100 + TotalVal7)}</td> */}
                </tr>
                <tr>
                  <td>8.</td>
                  <td>AC HT Cable (Transformer to HT Panel)</td>
                  <td>{evacuationVoltage(offerData.evacuation_voltage)}</td>
                  {/* <td>
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td> */}
                  <td>m</td>
                  {/* <td>50</td> */}
                  <td>50</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>{selectedCable}</td>
                     <td>INR/m</td>
                     <td>{TotalVal8}</td>
                     <td>18%</td>
                     <td>{Math.round(TotalVal8*18/100)}</td>
                     <td>{Math.round(TotalVal8*18/100+TotalVal8)}</td> */}
                </tr>

                <tr>
                  <td>9.</td>
                  <td>AC & DC Earthing Cable</td>
                  <td>1C/35 sqmm /Cu / Green Cable/UnAr</td>
                  {/* <td>Cu / Green Cable/UnAr., 450/750V</td> */}
                  <td>m</td>
                  {/* <td>{internalQuantity9}</td> */}
                  <td>{internalQuantity9}</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>380</td>
                     <td>INR/m</td>
                     <td>{TotalVal9}</td>
                     <td>18%</td>
                     <td>{Math.round(TotalVal9*18/100)}</td>
                     <td>{Math.round(TotalVal9*18/100+TotalVal9)}</td> */}
                </tr>

                <tr>
                  <td>10.</td>
                  <td>LA Earthing Cable</td>
                  <td>1C/70 sqmm /Cu / Green Cable/UnAr</td>
                  {/* <td>
                    PVC Insulated flexible Cu Cable, Cu / Green Cable/UnAr
                  </td> */}
                  <td>m</td>
                  {/* <td>{internalQuantity10}</td> */}
                  <td>{internalQuantity10}</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>660</td>
                     <td>INR/m</td>
                     <td>{TotalVal10}</td>
                     <td>18%</td>
                     <td>{Math.round(TotalVal10*18/100)}</td>
                     <td>{Math.round(TotalVal10*18/100+TotalVal10)}</td> */}
                </tr>

                <tr>
                  <td>11.</td>
                  <td>Communication Cable</td>
                  <td>RS485 / 2P / 0.5 sqmm / Armoured / Shielded Cable</td>
                  {/* <td>RS485 / 2P / 0.5 sqmm / Armoured / Shielded Cable</td> */}
                  <td>m</td>
                  {/* <td>{internalQuantity11}</td> */}
                  <td>{internalQuantity11}</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>130</td>
                     <td>INR/m</td>
                     <td>{TotalVal11}</td>
                     <td>18%</td>
                     <td>{Math.round(TotalVal11*18/100)}</td>
                     <td>{Math.round(TotalVal11*18/100+TotalVal11)}</td> */}
                </tr>

                <tr>
                  <td>12.</td>
                  <td>Control Cable (Trafo to HT Panel)</td>
                  <td>14Cx2.5 sqmm Cu XLPE Ar Cable</td>
                  {/* <td>14Cx2.5 sqmm Cu XLPE Ar Cable</td> */}
                  <td>m</td>
                  {/* <td>20</td> */}
                  <td>20</td>
                  <td>Polycab/Equivalent</td>
                  <td>Cables</td>
                  {/* <td>470</td>
                     <td>INR/m</td>
                     <td>{TotalVal12}</td>
                     <td>18%</td>
                     <td>{Math.round(TotalVal12*18/100)}</td>
                     <td>{Math.round(TotalVal12*18/100+TotalVal12)}</td> */}
                </tr>

                <tr>
                  <td>13.</td>
                  <td>AC Combiner (Distribution) Box</td>
                  <td>
                    {NtenValue}IN 2OUT{" "}
                    {Neleven > 0 ? `& ${Neleven}IN 1OUT` : ""} (I/P MCCB & O/P
                    ACB)
                  </td>
                  {/* <td>
                    3 phase, 800 V, 50 Hz ACCB Panel with
                    <br />
                    - Suitable MCCB's at Input
                    <br />
                    - Suitable ACB at Output
                    <br />
                    - Al, 3 phase, 3 W, bus bar
                    <br />
                    - MFM of class 0.5s accuracy
                    <br />- IP 65, floor mounted, air - insulated, cubical type
                  </td> */}
                  <td>Set</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Switchgears of L&T/ABB/Equivalent</td>
                  <td>
                    Electrical Equipment - Solar Plant Side (Transformer+LT
                    Panel+HT Panel+Aux Transformer+UPS System)
                  </td>
                  {/* <td>{scmWeekly1}</td>
                     <td>INR/Set</td>
                     <td>{TotalVal13}</td>
                     <td>18%</td>
                     <td>{TotalVal13*18/100}</td>
                     <td>{TotalVal13*18/100+TotalVal13}</td> */}
                </tr>

                <tr>
                  <td>14.</td>
                  <td>Step-up Transformer</td>
                  <td>
                    Step up Transformer {setUp(offerData.ac_capacity)} kVA,
                    0.800/{offerData.evacuation_voltage}kV±10%, 50Hz±5Hz,
                    Ynd11,Z=6.5%,
                    <br />
                    {offerData.transformer},ONAN
                  </td>
                  {/* <td>
                    Step up inverter duty Transformer, Copper wound, ONAN,
                    natural cooled, outdoor type, oil immersed, Type Test report
                    required.
                  </td> */}
                  <td>Nos.</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Uttam/ABC/Marsons/Equivalent</td>
                  <td>
                    Electrical Equipment - Solar Plant Side (Transformer+LT
                    Panel+HT Panel+Aux Transformer+UPS System)
                  </td>
                  {/* <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td>
                     <td>INR/Nos.</td>
                     <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td>
                     <td>18%</td>
                     <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)*18/100}</td>
                     <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)*18/100+scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td> */}
                </tr>

                <tr>
                  <td>15.</td>
                  <td>ICOG, Outdoor Panel</td>
                  <td>{EvacuationVoltage(offerData.evacuation_voltage)}</td>
                  {/* <td>
                    CT-25 kA For 3 Sec, XXX/5A, CORE-1,10VA,5P20, CORE-2,
                    10VA,CL0.2s
                    <br />
                    PT-XXkV/SQRT3/110/SQRT3/110/SQRT3
                    <br />
                    30VA,30VA,
                    <br />
                    CORE-1,CL-3P
                    <br />
                    CORE-2,CL0.2
                    <br />
                  </td> */}
                  <td>Nos.</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Switchgears of L&T/ABB/Equivalent</td>
                  <td>
                    Electrical Equipment - Solar Plant Side (Transformer+LT
                    Panel+HT Panel+Aux Transformer+UPS System)
                  </td>
                  {/* <td>{scmWeekly3(offerData.evacuation_voltage)}</td>
                     <td>INR/Nos.</td>
                     <td>{scmWeekly3(offerData.evacuation_voltage)}</td>
                     <td>18%</td>
                     <td>
                       {Math.round(
                         (scmWeekly3(offerData.evacuation_voltage) * 18) / 100
                       )}
                     </td>
                     <td>
                       {Math.round(
                         (scmWeekly3(offerData.evacuation_voltage) * 18) / 100 +
                           scmWeekly3(offerData.evacuation_voltage)
                       )}
                     </td> */}
                </tr>
                <tr>
                  <td>16.</td>
                  <td>Earthing Station</td>
                  <td>
                    Maintenance Free Earth Electrode with Chemical Earthing Set{" "}
                  </td>
                  {/* <td>
                    The earthing for array and LT power system shall be made of
                    3 mtr long , 17.2 mm dia, Copper Bonded , thickness of 250
                    microns, chemical compound filled, double walled earthing
                    electrodes including accessories, and providing masonry
                    enclosure with cast iron cover plate having pad-locking
                    arrangement, watering pipe using charcoal or coke and salt
                    as required as per provisions of IS: 3043
                  </td> */}
                  <td>Set</td>
                  {/* <td>{internalQuantity16}</td> */}
                  <td>{internalQuantity16}</td>
                  <td>Reputed</td>
                  <td>Other Balance of Material</td>
                  {/* <td>{scmData.earthing_station}</td>
                     <td>INR/Set</td>
                     <td>{TotalVal16}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal16 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal16 * 18) / 100 + TotalVal16)}</td> */}
                </tr>

                <tr>
                  <td>17.</td>
                  <td>Earthing Strips</td>
                  <td>25x3 mm GI strip</td>
                  {/* <td>
                    25x3 mm GI strip With Zinc coating of 70 to 80 microns
                  </td> */}
                  <td>m</td>
                  {/* <td>{internalQuantity17}</td> */}
                  <td>{Math.round(internalQuantity17)}</td>
                  <td>Reputed</td>
                  <td>Other Balance of Material</td>
                  {/* <td>{scmData.earthing_strips}</td>
                     <td>INR/m</td>
                     <td>{TotalVal17}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal17 * 18) / 100)}</td>
                     <td>{Math.ceil((TotalVal17 * 18) / 100 + TotalVal17)}</td> */}
                </tr>

                <tr>
                  <td>18.</td>
                  <td>Earthing Strips</td>
                  <td>50x6 mm GI strip</td>
                  {/* <td>
                    50x6 mm GI strip With Zinc coating of 70 to 80 microns
                  </td> */}
                  <td>m</td>
                  {/* <td>{internalQuantity17_2}</td> */}
                  <td>{internalQuantity17_2}</td>
                  <td>Reputed</td>
                  <td>Other Balance of Material</td>
                  {/* <td>{scmData.earthing_strip}</td>
                     <td>INR/m</td>
                     <td>{TotalVal18}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal18 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal18 * 18) / 100) + TotalVal18}</td> */}
                </tr>
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Reference;