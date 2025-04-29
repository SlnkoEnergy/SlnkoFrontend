import { Grid, Sheet, Table } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

const Reference3 = () => {
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
            offer_id: fetchRatebd.offer_id || "",
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

  // ***for 2nd row***
  const internalQuantity2 = offerData.ac_capacity
    ? Math.round((offerData.ac_capacity * 1000) / offerData.inverter_capacity)
    : 0;

  // console.log("Internal2 :", internalQuantity2);

  // ***for 16th row***/
  const internalQuantity16 = offerData.dc_capacity
    ? Math.ceil(
        offerData.dc_capacity * 2 +
          Math.round(offerData.dc_capacity) * 2 +
          internalQuantity2 +
          10
      )
    : 0;

  // console.log("Internal16 :", internalQuantity16);

  // ***for 17th row***/
  const internalQuantity17 = offerData.dc_capacity
    ? offerData.dc_capacity * 1000 * 0.8
    : 0;

  const internalQuantity17_2 = 150;

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
  const TotalVal17 = Math.round(internalQuantity17 * scmData.earthing_strips);

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

  const internalQuantity24 = offerData.dc_capacity * 1000;

  //***Total Value 23***/
  const TotalVal23 = scmData.balance_of_system * internalQuantity24;

  //***Total Value 24***/
  const TotalVal24 =
    scmData.installation_commissioing.labour_works * internalQuantity24 * 1000;

  return (
    <>
      <Grid
        sx={{
          width: "100%",
          // height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "10px",
          "@media print": {
            width: "84%",
          },
        }}
      >
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            //  marginTop: "5%",
            border: "2px solid #0f4C7f",
            "@media print": {
              width: "100%",
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
                <tr>
                  <td>20.</td>
                  <td>Datalogger</td>
                  <td>As per inverter manufacturer</td>
                  <td>As per inverter manufacturer</td>
                  <td>Set</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Reputed</td>
                  <td>Solar Inverter & Datalogger</td>
                  {/* <td>{scmData.datalogger}</td>
                     <td>INR/Set</td>
                     <td>{TotalVal20}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal20 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal20 * 18) / 100 + TotalVal20)}</td> */}
                </tr>

                <tr>
                  <td>21.</td>
                  <td>Auxilary transformer</td>
                  <td>10 kVA,50Hz, 800/415 V, Dyn11</td>
                  <td>Dry Type Transformer</td>
                  <td>Nos.</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Reputed</td>
                  <td>
                    Electrical Equipment - Solar Plant Side (Transformer+LT
                    Panel+HT Panel+Aux Transformer+UPS System)
                  </td>
                  {/* <td>{scmData.auxilary_transformer}</td>
                     <td>INR/Nos.</td>
                     <td>{TotalVal21}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal21 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal21 * 18) / 100 + TotalVal21)}</td> */}
                </tr>

                <tr>
                  <td>22.</td>
                  <td>UPS & LDB</td>
                  <td>1.5 kW Load with 1 Hour backup, Battery SMF Type</td>
                  <td></td>
                  <td>Set</td>
                  {/* <td>1</td> */}
                  <td>1</td>
                  <td>Reputed</td>
                  <td>
                    Electrical Equipment - Solar Plant Side (Transformer+LT
                    Panel+HT Panel+Aux Transformer+UPS System)
                  </td>
                  {/* <td>{scmData.ups_ldb}</td>
                     <td>INR/Set</td>
                     <td>{TotalVal22}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal22 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal22 * 18) / 100 + TotalVal22)}</td> */}
                </tr>

                <tr>
                  <td>23.</td>
                  <td>
                    Balance of system with Wet Module Cleaning System (MCS) &
                    Dry Cleaning semi automatic robot
                  </td>
                  <td>
                    Class C Items including Connectors, Lungs, Glands,
                    Termination Kits, Conduits, Cable Tie, Ferruls, Sleeves, PU
                    Foam, Route Marker, Danger boards and signages, Double
                    Warning Tape, & Fire Fighting System
                  </td>
                  <td></td>
                  <td>KWp</td>
                  {/* <td>{internalQuantity24}</td> */}
                  <td>{internalQuantity24}</td>
                  <td>Reputed</td>
                  <td>Other Balance of Material</td>
                  {/* <td>{scmData.balance_of_system}</td>
                       <td>INR/Set</td>
                       <td>{TotalVal23}</td>
                       <td>18%</td>
                       <td>{Math.round((TotalVal23 * 18) / 100)}</td>
                       <td>{Math.round((TotalVal23 * 18) / 100 + TotalVal23)}</td> */}
                </tr>
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Reference3;
