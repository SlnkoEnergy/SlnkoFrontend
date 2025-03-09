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
        const offerRate = localStorage.getItem("offer_summary");
        console.log("Fetched offer_id from localStorage page10:", offerRate);

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        const [response, result, answer] = await Promise.all([
          Axios.get("/get-comm-offer"),
          Axios.get("/get-comm-scm-rate"),
          Axios.get("/get-comm-bd-rate"),
        ]);

        const fetchedData = response.data;
        const fetchedScmData = result.data[0];
        const fetchedBdData = answer.data;

        console.log("Fetched Offer Data:", fetchedData);
        console.log("Fetched SCM Rate Data:", fetchedScmData);
        console.log("Fetched BD Rate Data:", fetchedBdData);

        const offerFetchData = fetchedData.find(
          (item) => item.offer_id === offerRate
        );
        const fetchRatebd = fetchedBdData.find(
          (item) => item.offer_id === offerRate
        );

        console.log("Matched Offer Data:", offerFetchData);
        console.log("Matched BD Rate Data:", fetchRatebd);

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

        console.log("Set Offer Data:", offerFetchData);

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
          console.log("Set BD Rate Data:", fetchRatebd);
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
                  <th>SPECIFICATION</th>
                  <th>UoM</th>
                  {/* <th>Qty (Int.)</th> */}
                  <th>Qty</th>
                  <th>Tentative Mac</th>
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
                  <td>{getSpecification(offerData.module_capacity)}</td>

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
                  <td>
                    Grid-tied String Inverter, Three Phase, 50 Hz Inverter
                    output shall be at 800V, & IGBT/MOSFET Microprocessor,
                    Efficiency-98% or above. 5 years warranty shall be provided
                    by Manufacturer.
                  </td>
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
                  <td>
                    MMS Shall be designed for wind speed as per IS 875 Part 3
                    and optimum tilt angle. Galvalume (AZ-150-550MPA) shall
                    conform to IS 15961, Column (YS-250) shall conform to IS
                    2062 & HDG shall conform to IS 4759.1996 and . Exact
                    Sections shall be decided at the time of detailed
                    engineering. Depth of pile foundation shall be decided after
                    soil tests.
                  </td>
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
                  <td>
                    SS304 for Module to Purlin Mounting & HDG Grade 8.8 for all
                    other connections
                  </td>
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
                  <td>
                    Flexible copper conductor solar DC cable, Fine wire strands
                    of annealed tinned copper, Rated 1.5 kV DC, Electron Beam
                    Cross Linked Co-polymer(XLPO) Halogen Free Insulation and
                    outer sheath, Black color and Red Colour, DC cables
                    complying to EN50618, TUV 2PFG 1169 for service life
                    expectency of 25 years. Flame retardent, UV resistent
                  </td>
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
                  <td>
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
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
                  <td>
                    Aluminium, FRLS with galvanized steel armouring minimum area
                    of coverage 90% , XLPE insulated compliant to IS: 7098, with
                    distinct extruded XLPE inner sheath of black color as per IS
                    5831. If armoured, Galvanized Steel armouring to be used
                    with minumum 90% area of coverage.
                  </td>
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
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Reference;
