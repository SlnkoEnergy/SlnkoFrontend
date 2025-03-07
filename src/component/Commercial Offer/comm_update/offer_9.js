import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../../assets/Comm_offer/slnko.png";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

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
    column_type: "",
  });
    const [bdRate, setBdRate] = useState({
        // spv_modules: "",
        // module_mounting_structure: "",
        // transmission_line: "",
        slnko_charges: "",
        // submitted_by_BD: "",
      });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("offer_summary");

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        const [response, answer] = await Promise.all([
          Axios.get("/get-comm-offer"),
          Axios.get("/get-comm-bd-rate"),
        ]);
  
        const fetchedData = response.data;
        const fetchedBdData = answer.data;

        const offerFetchData = fetchedData.find((item) => item.offer_id === offerRate);
        const fetchRatebd = fetchedBdData.find((item) => item.offer_id === offerRate);

        // const { data: commercialOffers } = await Axios.get("/get-comm-offer");
        // console.log("API Response:", commercialOffers);

        // const matchedOffer = commercialOffers.find(
        //   (item) => item.offer_id === offerRate
        // );

        if (offerFetchData) {
          setOfferData({
            offer_id: offerFetchData.offer_id ?? "",
            client_name: offerFetchData.client_name ?? "",
            village: offerFetchData.village ?? "",
            district: offerFetchData.district ?? "",
            state: offerFetchData.state ?? "",
            pincode: offerFetchData.pincode ?? "",
            ac_capacity: offerFetchData.ac_capacity ?? "",
            dc_overloading: offerFetchData.dc_overloading ?? "",
            dc_capacity: offerFetchData.dc_capacity ?? "",
            scheme: offerFetchData.scheme ?? "",
            component: offerFetchData.component ?? "",
            rate: offerFetchData.rate ?? "",
            timeline: offerFetchData.timeline ?? "",
            prepared_by: offerFetchData.prepared_by ?? "",
            module_type: offerFetchData.module_type ?? "",
            module_capacity: offerFetchData.module_capacity ?? "",
            inverter_capacity: offerFetchData.inverter_capacity ?? "",
            evacuation_voltage: offerFetchData.evacuation_voltage ?? "",
            module_orientation: offerFetchData.module_orientation ?? "",
            transmission_length: offerFetchData.transmission_length ?? "",
            transformer: offerFetchData.transformer ?? "",
            column_type: offerFetchData.column_type ?? "",
          });
        } else {
          console.error("No matching offer found.");
          toast.error("No matching offer found.");
        }
        if (fetchRatebd) {
          setBdRate({
            // offer_id: fetchRatebd.offer_id || "",
            // spv_modules: fetchRatebd.spv_modules || "",
            // module_mounting_structure: fetchRatebd.module_mounting_structure || "",
            // transmission_line: fetchRatebd.transmission_line || "",
            slnko_charges: fetchRatebd.slnko_charges || "",
            // submitted_by_BD: fetchRatebd.submitted_by_BD || "",
          });
          console.log("Set BD Rate Data:", fetchRatebd);
        } else {
          console.warn("No matching BD Rate data found for offer_id:", offerRate);
        }
      } catch (error) {
        console.error("Error fetching commercial offer data:", error);
        toast.error("Failed to fetch offer data. Please try again later.");
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
              marginTop: "2%",
            }}
          >
            <img
              width={"220px"}
              height={"110px"}
              alt="logo"
              src={logo}
              loading="lazy"
            />

            <hr
              style={{
                width: "60%",
                color: "blue",
                borderTop: "2px solid #0f4C7f",
                margin: "19px 0",
              }}
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
              margin: "20px 10px",
            }}
          >
            <Typography
              marginBottom={"10px"}
              fontSize={"1.7rem"}
              fontWeight={600}
              fontFamily={"serif"}
              sx={{
                "@media print": {
                  fontSize: "1.5rem",
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
                    <th>
                      Capacity
                    </th>
                    <th > UoM</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Engineering, Procurement, Construction and Management
                      Services as per above scope of work
                    </td>
                    <td>{offerData.ac_capacity} MW AC / {offerData.dc_capacity} MW DC</td>
                    <td>INR</td>
                    <td>{bdRate.slnko_charges}/- Wp</td>
                  </tr>
                </tbody>
              </Table>
            </Sheet>

            <Box>
              <ul style={{textAlign:"justify", "@media_print" :{
                      fontSize:"1.3rem !important"
                    }}}>
                <li
                  style={{
                    fontFamily: "serif",
                    fontSize: "1.3rem",
                    margin: "20px 0",
                   
                  }}
                  // className="ul-item"
                >
                  We have considered {offerData.timeline} weeks to complete site
                  execution work, if any delay in site execution additional
                  charges to be disscussed and finalized again.
                </li>
                <li
                  // className="ul-item"
                  style={{ fontFamily: "serif", fontSize: "1.3rem" }}
                >
                  GST @18% is Additional as actual.
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
                  fontSize: "1.7rem",
                  fontFamily: "serif",
                  fontWeight: "600",
                  "@media print": {
                    fontSize: "1.5rem",
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
                    <th>
                      Payment Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Advance along with work order</td>
                    <td>30% of the Service fee</td>
                  </tr>

                  <tr>
                    <td>On releasing Phase 01 drawings</td>
                    <td> 20% of the Service fee</td>
                  </tr>

                  <tr>
                    <td>
                      After orders finalization of major items (Module,
                      Inverter, MMS, Cables, Transformer and ACDB)
                    </td>
                    <td>20% of the Service fee</td>
                  </tr>

                  <tr>
                    <td>On releasing Phase 02 drawings & MMS Installation</td>
                    <td>20% of the Service fee</td>
                  </tr>

                  <tr>
                    <td>After delivery and Installation of major items</td>
                    <td>5% of the Service fee</td>
                  </tr>

                  <tr>
                    <td>
                      Before testing and charging of Plant before
                      commissioningAdvance along with work order
                    </td>
                    <td>5% of the Service fee</td>
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
