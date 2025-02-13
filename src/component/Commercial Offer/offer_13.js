import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useState, useEffect } from "react";
import Axios from "../../utils/Axios";
import logo from "../../assets/slnko_blue_logo.png";
import "./CSS/offer.css";

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
                    <td>{internalQuantity24}</td>
                    <td>{internalQuantity24}</td>
                    <td>{scmData.balance_of_system}</td>
                    <td>INR/Wp</td>
                    <td>{TotalVal23}</td>
                    <td>18%</td>
                    <td>{Math.round(TotalVal23*18/100)}</td>
                    <td>{Math.round(TotalVal23*18/100+TotalVal23)}</td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>
          </Box>
          <Box
            sx={{
              width: "100%",
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
          <Sheet
            sx={{
              width: "99.5%",
              height: "100%",
              backgroundColor: "white",
              marginBottom: "10px",
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
                  <td>24.</td>
                  <td>Installation and commissioing</td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>LABOUR WORKS:</span>{" "}
                    Includes Pile casting, Module Mounting & Alignment, and
                    complete AC-DC work till commissioning inside plant boundary
                  </td>
                  <td></td>
                  <td>KWp</td>
                  <td>{internalQuantity24}</td>
                  <td>{internalQuantity24}</td>
                  <td>{scmData.installation_commissioing.labour_works}</td>
                  <td>INR/Wp</td>
                  <td>{TotalVal24}</td>
                  <td>18%</td>
                  <td>{Math.round(TotalVal24*18/100)}</td>
                  <td>{Math.round(TotalVal24*18/100+TotalVal24)}</td>
                </tr>
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Reference4;
