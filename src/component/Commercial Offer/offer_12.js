import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useState,useEffect  } from "react";
import Axios from "../../utils/Axios";
import logo from "../../assets/slnko_blue_logo.png";
import "./CSS/offer.css";

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
        column_type: ""
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
                    column_type: offerData.column_type || "",
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

      // ***for 16th row***/
  const internalQuantity16 = offerData.dc_capacity
  ? Math.round((offerData.dc_capacity*4+internalQuantity2+10))
  : 0;

      // ***for 17th row***/
      const internalQuantity17 = offerData.dc_capacity
      ? Math.round((offerData.dc_capacity*1000*0.8))
      : 0;


      const internalQuantity18 = offerData.dc_capacity
      ? Math.round(offerData.dc_capacity)
      : 0

        const EvacuationVoltage =(evacuation_voltage) => {
            if(evacuation_voltage === 11 ){
              return "11 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
            }
            else{
              return "33 kV, 630/800 amp,25 kA for 3 sec With MFM of CL0.2s";
            }
          };

          const scmWeekly3 = (evacuation_voltage)=>{
            if(evacuation_voltage===11){
              return 440000;
            }
            else{
              return 770000;
            }
          };

          //***Total Value 16***/
          const TotalVal16 = internalQuantity16*scmData.earthing_station;

          //***Total Value 17***/
          const TotalVal17 = internalQuantity17*scmData.earthing_strips;

           //***Total Value 19***/
           const TotalVal19 = internalQuantity18*scmData.lightening_arrestor;

           //***Total Value 20***/
           const TotalVal20 = scmData.datalogger*1;

           //***Total Value 21***/
           const TotalVal21 = scmData.auxilary_transformer*1;

           //***Total Value 22***/
           const TotalVal22 = scmData.ups_ldb*1;


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
                            <td>15.</td>
                            <td>11 kV ICOG, Outdoor Panel</td>
                            <td>{EvacuationVoltage(offerData.evacuation_voltage)}</td>
                            <td>
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
                            </td>
                            <td>Nos.</td>
                            <td>1</td>
                            <td>1</td>
                            <td>{scmWeekly3(offerData.evacuation_voltage)}</td>
                            <td>INR/Nos.</td>
                            <td>{scmWeekly3(offerData.evacuation_voltage)}</td>
                            <td>18%</td>
                            <td>{scmWeekly3(offerData.evacuation_voltage)*18/100}</td>
                            <td>{scmWeekly3(offerData.evacuation_voltage)*18/100+scmWeekly3(offerData.evacuation_voltage)}</td>
                          </tr>
        
                          <tr>
                            <td>16.</td>
                            <td>Earthing Station</td>
                            <td>
                              Maintenance Free Earth Electrode with Chemical Earthing
                              Set{" "}
                            </td>
                            <td>
                              The earthing for array and LT power system shall be made
                              of 3 mtr long , 17.2 mm dia, Copper Bonded , thickness of
                              250 microns, chemical compound filled, double walled
                              earthing electrodes including accessories, and providing
                              masonry enclosure with cast iron cover plate having
                              pad-locking arrangement, watering pipe using charcoal or
                              coke and salt as required as per provisions of IS: 3043
                            </td>
                            <td>Set</td>
                            <td>{internalQuantity16}</td>
                            <td>{internalQuantity16}</td>
                            <td>{scmData.earthing_station}</td>
                            <td>INR/Set</td>
                            <td>{TotalVal16}</td>
                            <td>18%</td>
                            <td>{TotalVal16*18/100}</td>
                            <td>{TotalVal16*18/100+TotalVal16}</td>
                          </tr>
        
                          <tr>
                            <td>17.</td>
                            <td>Earthing Strips</td>
                            <td>25x3 mm GI strip</td>
                            <td>
                              25x3 mm GI strip With Zinc coating of 70 to 80 microns
                            </td>
                            <td>m</td>
                            <td>{internalQuantity17}</td>
                            <td>{internalQuantity17}</td>
                            <td>{scmData.earthing_strips}</td>
                            <td>INR/m</td>
                            <td>{TotalVal17}</td>
                            <td>18%</td>
                            <td>{TotalVal17*18/100}</td>
                            <td>{TotalVal17*18/100+TotalVal17}</td>
                          </tr>
        
                          <tr>
                            <td>18.</td>
                            <td>Earthing Strips</td>
                            <td>50x6 mm GI strip</td>
                            <td>
                              50x6 mm GI strip With Zinc coating of 70 to 80 microns
                            </td>
                            <td>m</td>
                            <td></td>
                            <td></td>
                            <td>{scmData.earthing_strip}</td>
                            <td>INR/m</td>
                            <td>0</td>
                            <td>18%</td>
                            <td>0</td>
                            <td>0</td>
                          </tr>
        
                          <tr>
                            <td>19.</td>
                            <td>Lightening Arrestor</td>
                            <td>107 Mtr Dia over 7 Mtr High Mast with counter</td>
                            <td>
                              ESE type as per NFC 17-102, ESE are considered with 107
                              Mtr Dia over 7 Mtr High Mast with counter
                            </td>
                            <td>Set</td>
                            <td>{internalQuantity18}</td>
                            <td>{internalQuantity18}</td>
                            <td>{scmData.lightening_arrestor}</td>
                            <td>INR/Set</td>
                            <td>{TotalVal19}</td>
                            <td>18%</td>
                            <td>{TotalVal19*18/100}</td>
                            <td>{TotalVal19*18/100+TotalVal19}</td>
                          </tr>
        
                          <tr>
                            <td>20.</td>
                            <td>Datalogger</td>
                            <td>As per inverter manufacturer</td>
                            <td>As per inverter manufacturer</td>
                            <td>Set</td>
                            <td>1</td>
                            <td>1</td>
                            <td>{scmData.datalogger}</td>
                            <td></td>
                            <td>{TotalVal20}</td>
                            <td>18%</td>
                            <td>{TotalVal20*18/100}</td>
                            <td>{TotalVal20*18/100+TotalVal20}</td>
                          </tr>
        
                          <tr>
                            <td>21.</td>
                            <td>Auxilary transformer</td>
                            <td>10 kVA,50Hz, 800/415 V, Dyn11</td>
                            <td>Dry Type Transformer</td>
                            <td>Nos.</td>
                            <td>1</td>
                            <td>1</td>
                            <td>{scmData.auxilary_transformer}</td>
                            <td>INR/Nos.</td>
                            <td>{TotalVal21}</td>
                            <td>18%</td>
                            <td>{TotalVal21*18/100}</td>
                            <td>{TotalVal21*18/100+TotalVal21}</td>
                          </tr>
        
                          <tr>
                            <td>22.</td>
                            <td>UPS & LDB</td>
                            <td>1.5 kW Load with 1 Hour backup, Battery SMF Type</td>
                            <td></td>
                            <td>Set</td>
                            <td>1</td>
                            <td>1</td>
                            <td>{scmData.ups_ldb}</td>
                            <td>INR/Set</td>
                            <td>{TotalVal22}</td>
                            <td>18%</td>
                            <td>{TotalVal22*18/100}</td>
                            <td>{TotalVal22*18/100+TotalVal22}</td>
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

export default Reference3;