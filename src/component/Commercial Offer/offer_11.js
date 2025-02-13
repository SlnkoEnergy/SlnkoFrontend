import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useState, useEffect } from "react";
import Axios from "../../utils/Axios";
import logo from "../../assets/slnko_blue_logo.png";
import "./CSS/offer.css";

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
    // column_type: "",
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
  // const[loading, setLoading] = useState(true)

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
        const offerData = fetchedData.find((item) => item.offer_id === offerRate);
        const fetchRate = fetchedScmData.find((item) => item.offer_id === offerRate)
  
        if (!offerData) {
          console.error("No matching offer data found");
          alert("No matching offer data found!");
          // setLoading(false);
          return;
        }
  
      
  
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
          // column_type: offerData.column_type || "",
        });
  
        setscmData({
          spv_modules: fetchRate.spv_modules || "",
          solar_inverter: fetchRate.solar_inverter || "",
          module_mounting_structure: fetchRate.module_mounting_structure || "",
          mounting_hardware: fetchRate.mounting_hardware || "",
          dc_cable: fetchRate.dc_cable || "",
          ac_cable_inverter_accb: fetchRate.ac_cable_inverter_accb || "",
          ac_cable_accb_transformer: fetchRate.ac_cable_accb_transformer || "",
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
          ct_pt: fetchRate.ct_pt || "",
          abt_meter: fetchRate.abt_meter || "",
          vcb_kiosk: fetchRate.vcb_kiosk || "",
          slnko_charges: fetchRate.slnko_charges || "",
          installation_commissioing: {
            labour_works: fetchRate.installation_commissioing?.labour_works || "",
            machinery: fetchRate.installation_commissioing?.machinery || "",
            civil_material: fetchRate.installation_commissioing?.civil_material || "",
          },
        });
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

  //***finding P17***/
  const setUp = (ac) => {
    const acValue = parseFloat(ac);
    if (!isNaN(acValue)) {
        return Math.round(acValue * 1.1 * 1000 / 100) * 100; // Round to nearest 100
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
      return parseFloat(((-0.211 * Math.log(setupFloat) )+ 2.4482));
    }
    return 0; // Default value if setupValue is invalid
  };

  // *** Finding Q24 ***
const findQ24 = (evacuation_voltage, Q22Value) => {
  return (evacuation_voltage === 11 ? Math.ceil((Q22Value)*100)/100 : 0.90);
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
    const result = Math.round(((((Q24Value * setupValue * 1000) + 400000) / setupValue) / 1000)*setupValue*1000);
    console.log("scmWeekly2 (OLTC):", result);
    return result;
  } else {
    const result = Q24Value * setupValue * 1000;
    console.log("scmWeekly2 (Non-OLTC):", result);
    return result;
  }
};

//***Total Value 8***/
const TotalVal8 = scmData.ac_ht_cable*50;

//***Total Value 9***/
const TotalVal9 = 380*internalQuantity9;

//***Total Value 10***/
const TotalVal10 = 660*internalQuantity10;

//***Total Value 11***/
const TotalVal11 = 130*internalQuantity11;

//***Total Value 12***/
const TotalVal12 = 470*20;

//***Total Value 13***/
const TotalVal13 = scmWeekly1*1;




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
                    <td>50</td>
                    <td>50</td>
                    <td>{scmData.ac_ht_cable}</td>
                    <td>INR/m</td>
                    <td>{TotalVal8}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal8*18/100)}</td>
                    <td>{Math.round(TotalVal8*18/100+TotalVal8)}</td>
                  </tr>

                  <tr>
                    <td>9.</td>
                    <td>AC & DC Earthing Cable</td>
                    <td>1C/35 sqmm /Cu / Green Cable/UnAr</td>
                    <td>Cu / Green Cable/UnAr., 450/750V</td>
                    <td>m</td>
                    <td>{internalQuantity9}</td>
                    <td>{internalQuantity9}</td>
                    <td>380</td>
                    <td>INR/m</td>
                    <td>{TotalVal9}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal9*18/100)}</td>
                    <td>{Math.round(TotalVal9*18/100+TotalVal9)}</td>
                  </tr>

                  <tr>
                    <td>10.</td>
                    <td>LA Earthing Cable</td>
                    <td>1C/70 sqmm /Cu / Green Cable/UnAr</td>
                    <td>
                      PVC Insulated flexible Cu Cable, Cu / Green Cable/UnAr
                    </td>
                    <td>m</td>
                    <td>{internalQuantity10}</td>
                    <td>{internalQuantity10}</td>
                    <td>660</td>
                    <td>INR/m</td>
                    <td>{TotalVal10}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal10*18/100)}</td>
                    <td>{Math.round(TotalVal10*18/100+TotalVal10)}</td>
                  </tr>

                  <tr>
                    <td>11.</td>
                    <td>Communication Cable</td>
                    <td>RS485 / 2P / 0.5 sqmm / Armoured / Shielded Cable</td>
                    <td>RS485 / 2P / 0.5 sqmm / Armoured / Shielded Cable</td>
                    <td>m</td>
                    <td>{internalQuantity11}</td>
                    <td>{internalQuantity11}</td>
                    <td>130</td>
                    <td>INR/m</td>
                    <td>{TotalVal11}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal11*18/100)}</td>
                    <td>{Math.round(TotalVal11*18/100+TotalVal11)}</td>
                  </tr>

                  <tr>
                    <td>12.</td>
                    <td>Control Cable (Trafo to HT Panel)</td>
                    <td>14Cx2.5 sqmm Cu XLPE Ar Cable</td>
                    <td>14Cx2.5 sqmm Cu XLPE Ar Cable</td>
                    <td>m</td>
                    <td>20</td>
                    <td>20</td>
                    <td>470</td>
                    <td>INR/m</td>
                    <td>{TotalVal12}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal12*18/100)}</td>
                    <td>{Math.round(TotalVal12*18/100+TotalVal12)}</td>
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
                    <td>1</td>
                    <td>1</td>
                    <td>{scmWeekly1}</td>
                    <td>INR/Set</td>
                    <td>{TotalVal13}</td>
                    <td>18%</td>
                    <td>{TotalVal13*18/100}</td>
                    <td>{TotalVal13*18/100+TotalVal13}</td>
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
                    <td>1</td>
                    <td>1</td>
                    <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td>

                    <td>INR/Nos.</td>
                    <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td>
                    <td>18%</td>
                    <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)*18/100}</td>
                    <td>{scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)*18/100+scmWeekly2(offerData.transformer, offerData.ac_capacity, offerData.evacuation_voltage)}</td>
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