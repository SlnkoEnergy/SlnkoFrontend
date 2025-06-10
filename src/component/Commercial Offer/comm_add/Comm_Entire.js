import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import { Button } from "@mui/joy";
import React from "react";
import { useNavigate } from "react-router-dom";
import Offer1 from "../comm_add/offer_1";
import Offer10 from "../comm_add/offer_10";
// import Offer11 from "../comm_add/offer_11";
// import Offer12 from "../comm_add/offer_12";
import Offer13 from "../comm_add/offer_13";
import Offer15 from "../comm_add/offer_15";
import Offer16 from "../comm_add/offer_16";
import Offer17 from "../comm_add/offer_17";
import Offer18 from "../comm_add/offer_18";
import Offer2 from "../comm_add/offer_2";
import Offer3 from "../comm_add/offer_3";
import Offer4 from "../comm_add/offer_4";
import Offer5 from "../comm_add/offer_5";
import Offer6 from "../comm_add/offer_6";
import Offer7 from "../comm_add/offer_7";
import Offer8 from "../comm_add/offer_8";
import Offer9 from "../comm_add/offer_9";

const Comm_Entire = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/comm_offer");
  };

  return (
    <div>
      {/* Printable Content */}
      <div id="printable-content">
        <Offer1 />
        <Offer2 />
        <Offer3 />
        <Offer4 />
        <Offer5 />
        <Offer6 />
        <Offer7 />
        <Offer8 />
        <Offer9 />
        <Offer10 />
        {/* <Offer11 /> */}
        {/* <Offer12 /> */}
        <Offer13 />
        {/* <Offer14 /> */}
        <Offer15 />
        <Offer16 />
        <Offer17 />
        <Offer18 />
      </div>

      {/* Back and Print Buttons */}
      <Button
        onClick={handlePrint}
        color="danger"
        variant="solid"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          borderRadius: "50%",
          width: 64,
          height: 64,
          boxShadow: 3,
          "&:hover": { backgroundColor: "primary.dark" },
        }}
        className="no-print"
      >
        <PrintIcon sx={{ fontSize: 36 }} />
      </Button>

      <Button
        onClick={handleBack}
        color="neutral"
        variant="solid"
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          borderRadius: "50%",
          width: 64,
          height: 64,
          boxShadow: 3,
          "&:hover": { backgroundColor: "neutral.dark" },
        }}
        className="no-print"
      >
        <ArrowBackIcon sx={{ fontSize: 36 }} />
      </Button>

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Comm_Entire;
