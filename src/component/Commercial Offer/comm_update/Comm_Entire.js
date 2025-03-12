import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/joy";
import React from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import Offer1 from "../comm_update/offer_1";
import Offer10 from "../comm_update/offer_10";
import Offer11 from "../comm_update/offer_11";
import Offer12 from "../comm_update/offer_12";
import Offer13 from "../comm_update/offer_13";
// import Offer14 from "../comm_update/offer_14";
import Offer15 from "../comm_update/offer_15";
import Offer16 from "../comm_update/offer_16";
import Offer17 from "../comm_update/offer_17";
import Offer18 from "../comm_update/offer_18";
import Offer2 from "../comm_update/offer_2";
import Offer3 from "../comm_update/offer_3";
import Offer4 from "../comm_update/offer_4";
import Offer5 from "../comm_update/offer_5";
import Offer6 from "../comm_update/offer_6";
import Offer7 from "../comm_update/offer_7";
import Offer8 from "../comm_update/offer_8";
import Offer9 from "../comm_update/offer_9";

const Comm_Entire = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/comm_offer");
  };

  const handleDownloadWord = () => {
    const content = document.getElementById("printable-content").innerHTML;

    // Convert HTML to plain text (basic formatting)
    const textContent = content
      .replace(/<br\s*\/?>/g, "\n") // Convert <br> to new lines
      .replace(/<\/p>/g, "\n") // Convert paragraphs to new lines
      .replace(/<\/?[^>]+(>|$)/g, ""); // Remove all HTML tags

    // Initialize Pizzip and Docxtemplater
    const zip = new PizZip();
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.loadZip(zip);
    doc.setData({ text: textContent });

    try {
      doc.render();
      const output = doc.getZip().generate({ type: "blob" });
      saveAs(output, "Comm_Entire.docx");
    } catch (error) {
      console.error("Error generating DOCX:", error);
    }
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
        <Offer11 />
        <Offer12 />
        <Offer13 />
        {/* <Offer14 /> */}
        <Offer15 />
        <Offer16 />
        <Offer17 />
        <Offer18 />
      </div>

      {/* Print Button */}
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

      {/* Back Button */}
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

      {/* Download as Word Button */}
      <Button
        onClick={handleDownloadWord}
        color="success"
        variant="solid"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 96,
          borderRadius: "50%",
          width: 64,
          height: 64,
          boxShadow: 3,
          "&:hover": { backgroundColor: "success.dark" },
        }}
        className="no-print"
      >
        <DownloadIcon sx={{ fontSize: 36 }} />
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
