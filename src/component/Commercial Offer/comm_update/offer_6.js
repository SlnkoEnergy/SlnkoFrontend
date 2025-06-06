import { Box, Grid, Sheet, Table, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../../assets/Comm_offer/slnko.png";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

const Page6 = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offerRate = localStorage.getItem("offer_summary");

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        const token = localStorage.getItem("authToken");

        const { data: commercialOffers } = await Axios.get("/get-comm-offer", {
          headers: {
            "x-auth-token": token,
          },
        });
        // console.log("API Response:", commercialOffers);

        const matchedOffer = commercialOffers.find(
          (item) => item.offer_id === offerRate
        );

        if (matchedOffer) {
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
        } else {
          console.error("No matching offer found.");
          toast.error("No matching offer found.");
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
        {/* <Box
          sx={{
            position: "absolute",
            left: "60%",
            backgroundColor: "#F2F4F5",
            height: "1160px",
            width: "20%",
            zIndex: -1,
            "@media print": {
              height: "297mm !important",
              left: "67.59%",
              width: "40%",
            },
          }}
        ></Box> */}
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
            padding: "10px",
            "@media print": {
              width: "100%",
              height: "98vh",
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
              textColor={"#56A4DA"}
              fontSize={"3rem"}
              fontWeight={"bolder"}
              sx={{
                textDecoration: "underline 3px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",

                "@media print": {
                  fontSize: "2.5rem",
                },
              }}
            >
              SCOPE OF <span style={{ color: "black" }}>SERVICES</span>{" "}
            </Typography>
          </Box>

          <br />

          <Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                fontSize={"1.4rem"}
                fontFamily={"serif"}
                fontWeight={500}
                textAlign={"justify"}
                sx={{
                  "@media print": {
                    fontSize: "1.8rem",
                  },
                }}
              >
                Slnko will be providing following services to
                <span style={{ fontWeight: "bold" }}>
                  {" "}
                  {offerData.client_name}
                </span>{" "}
                , here after referred as “Client”. Detailed technical documents
                list defined further. (refer “Design & Documents List”)
              </Typography>
            </Box>

            <br />

            <Box>
              <Typography
                fontSize={"1.5rem"}
                fontFamily={"sans-serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "1.8rem",
                  },
                }}
              >
                1.Engineering:
              </Typography>
              <Box
                sx={{
                  marginLeft: "30px",
                }}
              >
                <Typography
                  fontSize={"1.3rem"}
                  fontWeight={"500"}
                  fontFamily={"serif"}
                  sx={{
                    "@media print": {
                      fontSize: "1.8rem",
                    },
                  }}
                >
                  a) Detailed engineering of the solar power plant. (refer
                  “Design & Documents List”)
                </Typography>
                <Typography
                  fontSize={"1.3rem"}
                  fontWeight={"500"}
                  fontFamily={"serif"}
                  sx={{
                    "@media print": {
                      fontSize: "1.8rem",
                    },
                  }}
                >
                  b) Chartered Engineer approval of design and drawings (if
                  required)
                </Typography>
              </Box>
            </Box>
          </Box>

          <br />

          <Box>
            <Typography
              fontFamily={"sans-serif"}
              fontWeight={"500"}
              fontSize={"1.7rem"}
              sx={{
                "@media print": {
                  fontSize: "1.8rem",
                  // marginTop:"0px"
                },
              }}
            >
              Engineering Detailed:
            </Typography>
          </Box>

          <Sheet
            sx={{
              width: "100%",
              backgroundColor: "white",
            }}
          >
            <Table className="table-header1">
              <thead>
                <tr>
                  <th>S.NO.</th>
                  <th>Technical Services in the scope of SLNKO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>1</td>
                  <td>
                    Detailed Technical Site Survey as per Engineering
                    Requirements
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>2</td>
                  <td>DPR (Detailed project report) Preparation</td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>3</td>
                  <td>
                    Preparation of Engineering designs and drawings as tabulated
                    below
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>4</td>
                  <td>
                    Optimization of complete Bill of Material in quantity
                    through our engineering expertise
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>5</td>
                  <td>
                    Reviewing all the equipment GTPs & drawing submitted by
                    vendors and check their applicability as per applicable
                    standards.
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>6</td>
                  <td>
                    All the Design and Drawings needed by authority for approval
                    shall be provided by Slnko
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>7</td>
                  <td>
                    All required Chartered Engineer approvals covered under
                    scope of Slnko Energy
                  </td>
                </tr>
              </tbody>
            </Table>
          </Sheet>
          <br />
          <br />
          <Sheet
            sx={{
              width: "100%",
              backgroundColor: "white",
              marginTop: "-18px",
              "@media print": {
    
                marginTop:"-45px !important"
              },
            }}
          >
            <Table
              className="table-header1"
              style={{
                "@media print": {
                  fontSize: "1.2rem",
               
                },
              }}
            >
              <thead>
                <tr>
                  <th>S.NO.</th>
                  <th>Technical Services in the scope of SLNKO</th>
                  <th>Submission</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center" }}>1</td>
                  <td>
                    Detailed Module Array Layout (from construction perspective)
                  </td>
                  <td>Phase-01</td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>2</td>
                  <td>Detailed Electrical Single Linc Diagram (SLD)</td>
                  <td>Phase-01</td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>3</td>
                  <td>
                    Detailed Bill of Material (BOM) (from RFQ and ordering
                    perspective)
                  </td>
                  <td>Phase-01</td>
                </tr>

                <tr>
                  <td style={{ textAlign: "center" }}>4</td>
                  <td>
                    Module Mounting Structure Design Calculation & STAAD Report
                  </td>
                  <td>Phase-01</td>
                </tr>
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
};

export default Page6;
