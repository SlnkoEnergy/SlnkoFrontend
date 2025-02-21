import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Axios from "../utils/Axios";
import { Grid, Button } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function BdHistoryTable() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [scmData, setScmData] = useState([]); // ✅ Initialize as an array

  useEffect(() => {
    const fetchSCMData = async () => {
      setLoading(true);
      try {
        const offerRate = localStorage.getItem("offer_summary");

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        const { data: response } = await Axios.get("/get-bd-rate-history");
        const offerBDRATE = response?.data;

        if (Array.isArray(offerBDRATE)) {
          const matchedData = offerBDRATE.filter((item) => item.offer_id === offerRate); // ✅ Use filter for array

          if (matchedData.length === 0) {
            console.error("No matching offer found.");
            toast.error("No matching offer found.");
            return;
          }

          setScmData(matchedData); // ✅ Store as an array
        } else {
          console.error("Invalid data format in API response.");
          toast.error("No data found.");
        }
      } catch (error) {
        console.error("Error fetching SCM data:", error?.response?.data || error.message);
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSCMData();
  }, []);

  return (
    <Box sx={{ padding: 1, width: { lg: "85%", md: "80%", sm: "100%" }, marginLeft: { xl: "15%", lg: "18%", md: "25%", sm: "0%" } }}>
      {/* Table */}
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          borderRadius: "md",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Table Header */}
        <Box component="thead" sx={{ backgroundColor: "neutral.300", color: "neutral.900" }}>
          <Box component="tr">
            {["S.No.", "SPV Modules", "Module Mounting Structure", "Transmission Line", "Slnko Charges", "Submitted By BD"].map(
              (header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    padding: 2,
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {header}
                </Box>
              )
            )}
          </Box>
        </Box>

        {/* Table Body */}
        <Box component="tbody">
          {scmData.length > 0 ? (
            scmData.map((row, index) => (
              <Box
                component="tr"
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? "neutral.100" : "neutral.50",
                  "&:hover": { backgroundColor: "neutral.200" },
                }}
              >
                <Box component="td" sx={{ padding: 2 }}>{index + 1}</Box>
                <Box component="td" sx={{ padding: 2 }}>{row.spv_modules || "-"}</Box>
                <Box component="td" sx={{ padding: 2 }}>{row.module_mounting_structure || "-"}</Box>
                <Box component="td" sx={{ padding: 2 }}>{row.transmission_line || "-"}</Box>
                <Box component="td" sx={{ padding: 2 }}>{row.slnko_charges || "-"}</Box>
                <Box component="td" sx={{ padding: 2 }}>{row.submitted_by_BD || "-"}</Box>
              </Box>
            ))
          ) : (
            <Box component="tr" sx={{ textAlign: "center", backgroundColor: "neutral.50" }}>
              <Box component="td" colSpan={7} sx={{ padding: 2 }}>
                No matching history data found.
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Grid xs={12} textAlign="center" pt={2}>
        <Button variant="soft" color="neutral" onClick={() => navigate("/comm_offer")}>
          Back
        </Button>
      </Grid>
    </Box>
  );
}

export default BdHistoryTable;
