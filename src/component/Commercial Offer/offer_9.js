import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import logo from "../../assets/Comm_offer/slnko.png";
import "../Commercial Offer/CSS/offer.css";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";

const Page9 = () => {
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("offer_rate");
  
        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!")
          return;
        }
  
        // Fetch all commercial offers
        const { data: commercialOffers } = await Axios.get("/get-comm-offer");
        console.log("API Response:", commercialOffers);
  
        // Find the matching offer based on offer_id
        const matchedOffer = commercialOffers.find(
          (item) => item.offer_id === offerRate
        );
  
        if (!matchedOffer) {
          console.error("No matching offer found.");
          toast.error("No matching offer found.")
          return;
        }
  
        // Set the matched offer data to the state
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
  
      } catch (error) {
        console.error("Error fetching commercial offer data:", error);
        alert("Failed to fetch offer data. Please try again later.");
      }
    };
  
    fetchData();
  }, []);


  return (
    <>
      <Grid
        sx={{
          width: "100%",
          // height: "100%",
          display: "flex",
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
        <Box
          sx={{
            position: "absolute",
            left: "60%",
            backgroundColor: "#F2F4F5",
            height: "1200px",
            width: "20%",
            zIndex: -1,
            "@media print": {
              height: "297mm !important",
              left: "67.59%",
              width: "40%",
            },
          }}
        ></Box>
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
            "@media print": {
              width: "210mm",
              height: "297mm",
            },
          }}
        >
          <Box
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
              width={"350px"}
              height={"200px"}
              className="logo-img2"
              alt="logo"
              src={logo}
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
              className="hr-line3"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "60px 0",
              "@media print": {
                margin: "30px 0",
              },
            }}
          >
            <Typography
              sx={{
                textDecoration: "underline 2px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
                "@media print": {
                  fontSize: "2rem",
                },
              }}
              textColor={"#56A4DA"}
              fontWeight={"bolder"}
              fontSize={"3rem"}
            >
              COMMERCIAL <span style={{ color: "black" }}> OFFER</span>
            </Typography>
          </Box>

          <Box
            sx={{
              margin: "20px 20px",
            }}
          >
            <Typography
              marginBottom={"10px"}
              fontSize={"1.7rem"}
              fontWeight={400}
              fontFamily={"sans-serif"}
              sx={{
                "@media print": {
                  fontSize: "1.4rem",
                },
              }}
            >
              1. EPC-M Services:
            </Typography>

            <Sheet
              sx={{
                width: "100%",
              }}
            >
              <Table className="table-header-page9">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ width: "16%" }}>
                      kW(AC) <br /> Capacity
                    </th>
                    <th style={{ width: "8%" }}> UoM</th>
                    <th style={{ width: "12%" }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Detailed Technical Site Survey as per Engineering
                      Requirements.
                    </td>
                    <td>{offerData.ac_capacity} MW AC</td>
                    <td>INR</td>
                    <td>{offerData.rate}/- kWp</td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>

            <Box>
              <ul>
                <li
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "1.3rem",
                    margin: "20px 0",
                  }}
                  className="ul-item"
                >
                  We have considered {offerData.timeline} the complete site execution work,
                  if any delay in site execution additional charges to be
                  disscussed and finalized again.
                </li>
                <li
                  className="ul-item"
                  style={{ fontFamily: "sans-serif", fontSize: "1.3rem" }}
                >
                  GST @1 % is Additional as actual.
                </li>
              </ul>
            </Box>

            <Box
              sx={{
                marginTop: "60px",
                marginBottom: "20px",
                "@media print": {
                  marginTop: "40px",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontFamily: "sans-serif",
                  fontWeight: "400",
                  "@media print": {
                    fontSize: "1.4rem",
                  },
                }}
              >
                Payment Terms for EPC-M Services:
              </Typography>
            </Box>

            <Sheet
              sx={{
                width: "100%",
              }}
            >
              <Table className="table-header-page9">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ width: "20%" }}>
                      Payment <br /> Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Advance along with work order</td>
                    <td>30% of the Project Cost</td>
                  </tr>

                  <tr>
                    <td>On releasing Phase 01 drawings</td>
                    <td> 20% of the Project Cost</td>
                  </tr>

                  <tr>
                    <td>
                      After orders finalization of major items (Module,
                      Inverter, MMS, Cables, Transformer and ACDB)
                    </td>
                    <td>20% of the Project Cost</td>
                  </tr>

                  <tr>
                    <td>On releasing Phase 02 drawings & MMS Installation</td>
                    <td>20% of the Project Cost</td>
                  </tr>

                  <tr>
                    <td>After delivery and Installation of major items</td>
                    <td>5% of the Project Cost</td>
                  </tr>

                  <tr>
                    <td>
                      Before testing and charging of Plant before
                      commissioningAdvance along with work order
                    </td>
                    <td>5% of the Project Cost</td>
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

export default Page9;