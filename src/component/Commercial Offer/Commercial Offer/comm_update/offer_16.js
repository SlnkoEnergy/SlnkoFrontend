import { Box, Grid, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../../assets/slnko_blue_logo.png";
import "../CSS/offer.css";
import Axios from "../../../utils/Axios";


const Page16 = () => {
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
    comment:""
  });
    const [bdRate, setBdRate] = useState({
        // spv_modules: "",
        // module_mounting_structure: "",
        // transmission_line: "",
        slnko_charges: "",
        // submitted_by_BD: "",
        comment:""
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
            comment: fetchRatebd.comment || "",
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
            width: "100%",
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
            height: "1300px",
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
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "50px 0",
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
              fontSize={"3rem"}
              fontWeight={"bolder"}
            >
              Terms & Condition
            </Typography>
          </Box>
          <Box
  sx={{
    width: "100%",
    padding: "0 15px",
    textAlign: "justify",
    paddingLeft: "2%",
  }}
>
  {[
    "All the charges to be paid for Authority approval (direct or indirect) shall be paid by the client.",
    "Client shall provide a clear ground in workable condition before start of the project.",
    "Site security, material security and all kinds of insurance is in the scope of client.",
    "All the liasoning paper works shall be done by SLNKO, however all the direct or indirect payments shall be made by client at actual.",
    "Client shall timely make payment. Any delay due to non-payment or late payment shall be the client’s responsibility.",
    "The above quantity is tentative and based on our previous records of sites which have been executed. It will change based on actual site conditions & land profile which shall be analyzed after detailed engineering.",
    "The above rates are based on recent market conditions and may change in case of change in law or market conditions.",
  ].map((text, index) => (
    <Typography
      key={index}
      margin={"0 0 20px"}
      fontSize={"1.5rem"}
      fontWeight={400}
      fontFamily={"serif"}
      sx={{
        "@media print": {
          fontSize: "1.4rem",
        },
      }}
    >
      {String.fromCharCode(97 + index)}. {text}
    </Typography>
  ))}

  {bdRate.comment && (
    <Typography
      margin={"0 0 20px"}
      fontSize={"1.5rem"}
      fontWeight={400}
      fontFamily={"serif"}
      sx={{
        "@media print": {
          fontSize: "1.4rem",
        },
      }}
    >
      h. {bdRate.comment}
    </Typography>
  )}
</Box>


          <Box
            sx={{
              marginTop: "350px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              "@media print": {
                marginTop: "49%",
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
        </Grid>
      </Grid>
    </>
  );
};

export default Page16;