import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";
import { toast } from "react-toastify";

const Reference4 = () => {
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
  

  //***for 24th row ***/
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
           }}
         >
           <Grid
             sx={{
               width: "60%",
               height: "100%",
              //  marginTop: "5%",
               border: "2px solid #0f4C7f",
               "@media print": {
                 border: "0px",
                 width: "100%",
                 border: "2px solid #0f4C7f",
                 marginTop:'1%'
               },
             }}
           >
             {/* <Box
               sx={{
                 display: "flex",
                 width: "100%",
                 alignItems: "flex-end",
                 gap: 2,
               }}
             >
                <img width={"220px"} height={"110px"} alt="logo" src={logo} />
         
                     <hr
                       style={{
                         width: "60%",
                         color: "blue",
                         borderTop: "3px solid #0f4C7f",
                         margin: "19px 0",
                       }}
                     /> 
             </Box> */}
             {/* <Box
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
                       <th>ITEM NAME</th>
                       <th >RATING</th>
                       <th >SPECIFICATION</th>
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
                     <tr>
                       <td>23.</td>
                       <td>
                         Balance of system with Wet Module Cleaning System (MCS) &
                         Dry Cleaning semi automatic robot
                       </td>
                       <td>
                         Class C Items including Connectors, Lungs, Glands,
                         Termination Kits, Conduits, Cable Tie, Ferruls, Sleeves,
                         PU Foam, Route Marker, Danger boards and signages, Double
                         Warning Tape, & Fire Fighting System
                       </td>
                       <td></td>
                       <td>KWp</td>
                       {/* <td>{internalQuantity24}</td> */}
                       <td>{internalQuantity24}</td>
                       <td></td>
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
             </Box>
             <Box
               sx={{
                 width: "100%",
                 marginTop: "10px",
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
                //  marginBottom: "10px",
                 display: "flex",
                 alignItems: "center",
                 flexDirection: "row",
                 margin:"10px",
                 justifyContent: "center",
                 "@media print": {
                   marginTop: "5%",
                 },
               }}
             >
               <Table className="table-header">
                 <thead>
                   <tr>
                     <th >S.NO.</th>
                     <th >ITEM NAME</th>
                     <th >RATING</th>
                     <th >SPECIFICATION</th>
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
                   <tr>
                     <td>24.</td>
                     <td>Installation and commissioing</td>
                     <td>
                       <span style={{ fontWeight: "bold" }}>LABOUR WORKS:</span>{" "}
                       Includes Pile casting, Module Mounting & Alignment, and
                       complete AC-DC work till commissioning inside plant boundary
                     </td>
                     <td></td>
                     <td>KWp</td>
                     {/* <td>{internalQuantity24}</td> */}
                     <td>{internalQuantity24}</td>
                     <td></td>
                     <td>
                       Installation Charges inside boundary wall (Labour, Machinary
                       & Civil Material)
                     </td>
                     {/* <td>{scmData.installation_commissioing.labour_works}</td>
                     <td>INR/Wp</td>
                     <td>{TotalVal24}</td>
                     <td>18%</td>
                     <td>{Math.round((TotalVal24 * 18) / 100)}</td>
                     <td>{Math.round((TotalVal24 * 18) / 100 + TotalVal24)}</td> */}
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

export default Reference4;
