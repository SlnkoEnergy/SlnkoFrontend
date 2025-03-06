import { Box, Grid, Sheet, Table } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";
import { toast } from "react-toastify";

const Reference2 = () => {
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
            console.log("Fetched offer_id from localStorage:", offerRate);
      
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
      
            const offerFetchData = fetchedData.find((item) => item.offer_id === offerRate);
            const fetchRatebd = fetchedBdData.find((item) => item.offer_id === offerRate);
      
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
              module_mounting_structure_scm: fetchedScmData.module_mounting_structure || "",
              mounting_hardware: fetchedScmData.mounting_hardware || "",
              dc_cable: fetchedScmData.dc_cable || "",
              ac_cable_inverter_accb: fetchedScmData.ac_cable_inverter_accb || "",
              ac_cable_accb_transformer: fetchedScmData.ac_cable_accb_transformer || "",
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
                labour_works: fetchedScmData.installation_commissioing?.labour_works || "",
                machinery: fetchedScmData.installation_commissioing?.machinery || "",
                civil_material: fetchedScmData.installation_commissioing?.civil_material || "",
              },
            });
      
            console.log("Set SCM Data:", fetchedScmData);
      
            if (fetchRatebd) {
              setBdRate({
                // offer_id: fetchRatebd.offer_id || "",
                spv_modules: fetchRatebd.spv_modules || "",
                module_mounting_structure: fetchRatebd.module_mounting_structure || "",
                transmission_line: fetchRatebd.transmission_line || "",
                slnko_charges: fetchRatebd.slnko_charges || "",
                submitted_by_BD: fetchRatebd.submitted_by_BD || "",
              });
              console.log("Set BD Rate Data:", fetchRatebd);
            } else {
              console.warn("No matching BD Rate data found for offer_id:", offerRate);
            }
      
          } catch (error) {
            console.error("Error fetching commercial offer data:", error);
          }
        };
      
        fetchData();
      }, []);
      



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

  const evacuationVoltage = (evacuation_voltage) => {
    if (evacuation_voltage === 11) {
      return "11 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    } else {
      return "33 kV(E),3C,120Sqmm Al,Ar,HT,XLPE, CABLE";
    }
  };

  const final_ht_cable = (
    ac_ht_cable_11KV,
    ac_ht_cable_33KV,
    evacuation_voltage
  ) => (evacuation_voltage === 11 ? ac_ht_cable_11KV : ac_ht_cable_33KV);

  //***finding P17***/
  const setUp = (ac) => {
    const acValue = parseFloat(ac);
    if (!isNaN(acValue)) {
      return Math.round((acValue * 1.1 * 1000) / 100) * 100;
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

  // Call the function with actual values from offerData
  const selectedCable = final_ht_cable(
    scmData.ac_ht_cable_11KV,
    scmData.ac_ht_cable_33KV,
    offerData.evacuation_voltage
  );

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

  return (
     <>
       <Grid
         sx={{
           width: "100%",
           // height: "100%",
           display: "flex",
           justifyContent: "center",
           alignItems: "center",
         }}
       >
         <Grid
            sx={{
             width: "60%",
             height: "100%",
             // marginTop: "5%",
             border: "2px solid #0f4C7f",
             "@media print": {
               border: "0px",
               width: "100%",
               border: "2px solid #0f4C7f",
               marginTop:'10%'
             },
           }}
         >
           {/* <Box
             sx={{
               display: "flex",
               width: "100%",
               alignItems: "flex-end",
               gap: 2,
               marginTop:"2%"
             }}
           >
             <img width={"220px"} height={"110px"} alt="logo" src={logo} />
 
             <hr
               style={{
                 width: "80%",
                 color: "blue",
                 borderTop: "2px solid #0f4C7f",
                 margin: "19px 0",
               }}
             />
           </Box>
           <Box
             sx={{
               width: "100%",
               height: "100%",
               marginTop: "20px",
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
           </Box> */}
           <Box
             sx={{
               width: "100%",
               height: "100%",
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               margin: "auto",
               "@media-print": {
                 width: "100%",
               },
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
               <Table className="table-header">
                 <thead>
                   <tr>
                     <th>S.NO.</th>
                     <th >ITEM NAME</th>
                     <th >RATING</th>
                     <th>SPECIFICATION</th>
                     <th>UoM</th>
                     {/* <th>Qty (Int.)</th> */}
                     <th>Qty</th>
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
                   <tr>
                     <td>8.</td>
                     <td>AC HT Cable (Transformer to HT Panel)</td>
                     <td>{evacuationVoltage(offerData.evacuation_voltage)}</td>
                     <td>
                       Aluminium, FRLS with galvanized steel armouring minimum
                       area of coverage 90% , XLPE insulated compliant to IS:
                       7098, with distinct extruded XLPE inner sheath of black
                       color as per IS 5831. If armoured, Galvanized Steel
                       armouring to be used with minumum 90% area of coverage.
                     </td>
                     <td>m</td>
                     {/* <td>50</td> */}
                     <td>50</td>
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
                     <td>Cu / Green Cable/UnAr., 450/750V</td>
                     <td>m</td>
                     {/* <td>{internalQuantity9}</td> */}
                     <td>{internalQuantity9}</td>
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
                     <td>
                       PVC Insulated flexible Cu Cable, Cu / Green Cable/UnAr
                     </td>
                     <td>m</td>
                     {/* <td>{internalQuantity10}</td> */}
                     <td>{internalQuantity10}</td>
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
                     <td>RS485 / 2P / 0.5 sqmm / Armoured / Shielded Cable</td>
                     <td>m</td>
                     {/* <td>{internalQuantity11}</td> */}
                     <td>{internalQuantity11}</td>
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
                     <td>14Cx2.5 sqmm Cu XLPE Ar Cable</td>
                     <td>m</td>
                     {/* <td>20</td> */}
                     <td>20</td>
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
                     <td>
                       3 phase, 800 V, 50 Hz ACCB Panel with
                       <br />
                       - Suitable MCCB's at Input
                       <br />
                       - Suitable ACB at Output
                       <br />
                       - Al, 3 phase, 3 W, bus bar
                       <br />
                       - MFM of class 0.5s accuracy
                       <br />- IP 65, floor mounted, air - insulated, cubical
                       type
                     </td>
                     <td>Set</td>
                     {/* <td>1</td> */}
                     <td>1</td>
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
                     <td>
                       Step up inverter duty Transformer, Copper wound, ONAN,
                       natural cooled, outdoor type, oil immersed, Type Test
                       report required.
                     </td>
                     <td>Nos.</td>
                     {/* <td>1</td> */}
                     <td>1</td>
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
                 </tbody>
               </Table>
             </Sheet>
           </Box>
         </Grid>
       </Grid>
     </>
   );
};

export default Reference2;
