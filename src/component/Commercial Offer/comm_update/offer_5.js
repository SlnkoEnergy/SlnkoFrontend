import { Box, Grid, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../../assets/Comm_offer/slnko.png";
import Axios from "../../../utils/Axios";
import "../CSS/offer.css";

const Page5 = () => {
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
    comment: "",
    mob_number: "",
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
          console.error("Offer ID not found in localStorage or is null.");
          toast.error("Offer ID is missing!");
          return;
        }

        // console.log("Fetched Offer ID from localStorage:", offerRate);

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
          // console.log("Matched Offer Found:", matchedOffer);

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
            mob_number: matchedOffer.mob_number ?? "",
            comment: matchedOffer.comment ?? "",
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
          console.warn("No matching offer found for Offer ID:", offerRate);
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
            position:'absolute',
            left:'60%',
            backgroundColor:'#F2F4F5',
            height:'1400px',
            width:'20%',
            zIndex:-1,
            '@media print':{
              height:'297mm !important',
              left:'67.59%',
              width:'40%',
            }
          }}
          ></Box> */}
        <Grid
          sx={{
            width: "60%",
            height: "100%",
            border: "2px solid #0f4C7f",
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
          <br />
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
                textDecoration: "underline 3px rgb(243, 182, 39)",
                textUnderlineOffset: "8px",
                "@media print": {
                  fontSize: "2.5rem",
                },
              }}
              textColor={"#56A4DA"}
              fontWeight={"bold"}
              fontSize={"2.5rem"}
              fontFamily={"sans-serif"}
            >
              COMMERCIAL OFFER <span style={{ color: "black" }}>FOR KUSUM</span>{" "}
            </Typography>
          </Box>
          <br />
          <br />
          <br />
          <Box
            sx={{
              width: "90%",
              paddingLeft: "40px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                To
              </Typography>
            </Box>
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                {offerData.client_name}
              </Typography>
            </Box>
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                {[
                  offerData.village,
                  offerData.district,
                  offerData.state,
                  offerData.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                <span style={{ fontWeight: "bold" }}>Subject:</span> EPCM
                Services for {offerData.ac_capacity} MW AC /{" "}
                {offerData.dc_capacity} MW DC Ground Mount {offerData.scheme}{" "}
                Solar Project Component {offerData.component}.
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                textAlign={"justify"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                We are pleased to submit our commercial offer for the
                above-mentioned subject. We are submitting our most reasonable
                commercial offer for your consideration based on your
                requirements. We believe our quality-to-price ratio will meet
                your expectations.
              </Typography>
            </Box>
            <br />
            <br />
            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                textAlign={"justify"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                We are looking forward to having a long and fruitful association
                with your esteemed organization through this project.
              </Typography>
            </Box>
            <br />
            <br />

            <Box>
              <Typography
                fontSize={"1.8rem"}
                fontFamily={"serif"}
                fontWeight={"400"}
                sx={{
                  "@media print": {
                    fontSize: "2.2rem",
                  },
                }}
              >
                Thanking you! <br /> {offerData.prepared_by}
                <br />
                {offerData.mob_number || "979279XXX "}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                marginTop: "24%",
                "@media print": {
                  marginTop: "16%",
                },
              }}
            >
              <hr
                style={{
                  width: "80%",
                  color: "blue",
                  borderTop: "2px solid goldenrod",
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Page5;
