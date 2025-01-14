import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Axios from "../utils/Axios";
import { Grid, Button } from "@mui/joy";
import Typography from "@mui/joy/Typography";
import { useNavigate } from "react-router-dom";

function PoHistoryTable() {
  const [poHistoryData, setPoHistoryData] = useState([]);
  const [poNumber, setPoNumber] = useState(null);
   const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
      
            const poNumberFromStorage = localStorage.getItem("get-po");
      
            if (!poNumberFromStorage) {
              console.error("PO number not found in localStorage");
              return;
            }
      
            const poResponse = await Axios.get("/get-all-po");
            const fetchedPoNumber = poResponse.data;
            setPoNumber(fetchedPoNumber);
            console.log("Enriched POs are:", fetchedPoNumber);
      
            const historyResponse = await Axios.get("get-po-history");
            console.log("PO History API Response:", historyResponse.data);
      
            const historyData = Array.isArray(historyResponse.data) ? historyResponse.data : historyResponse.data.data;
      
            if (!Array.isArray(historyData)) {
              throw new Error("PO history data is not an array.");
            }
      
            const matchingHistories = historyData
              .filter((history) => history.po_number === poNumberFromStorage)
              .map((history) => {
                const date = new Date(history.date);
                const formattedDate = history.date
                  ? `${date.getFullYear()}-${date.toLocaleString("default", { month: "short" })}-${String(date.getDate()).padStart(2, "0")}`
                  : "";
      
                return {
                  po_number: history.po_number || "-",
                  vendor: history.vendor || "-", 
                  date: formattedDate || "-",
                  item: history.item || "-", 
                  po_value: history.po_value ? history.po_value.toLocaleString("en-IN") : "-",
                  comment: history.comment || "-",
                  submitted_By: history.submitted_By || "-",
                };
              });
      
            setPoHistoryData(matchingHistories);
            console.log("Data are:", matchingHistories);
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchData();
      }, []);
      

  return (
    <Box sx={{ padding: 1, width:{ lg:"85%",md:"80%", sm:"100%"}, marginLeft: { xl: "15%", lg: "18%", md: "25%", sm:"0%" },}}>
      {/* Title */}
      {/* <Typography
        level="h4"
        component="h1"
        sx={{
          marginBottom: 3,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "primary.main",
        }}
      >
        Purchase Order History
      </Typography> */}

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
        <Box
          component="thead"
          sx={{
            backgroundColor: "neutral.300",
            color: "neutral.900",
          }}
        >
          <Box component="tr">
            {["PO NO.", "Vendor", "PO Date", "Item", "PO Value with GST", "Amendment Reason", "Submitted By"].map(
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
          {poHistoryData.length > 0 ? (
            poHistoryData.map((row, index) => (
              <Box
                component="tr"
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? "neutral.100" : "neutral.50",
                  "&:hover": {
                    backgroundColor: "neutral.200",
                  },
                }}
              >
                 <Box component="td" sx={{ padding: 2 }}>{row.po_number}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.vendor}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.date}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.item}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.po_value}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.comment}</Box>
              <Box component="td" sx={{ padding: 2 }}>{row.submitted_By}</Box>
              </Box>
            ))
          ) : (
            <Box
              component="tr"
              sx={{ textAlign: "center", padding: 2, backgroundColor: "neutral.50" }}
            >
              <Box component="td" colSpan={7} sx={{ padding: 2 }}>
                No matching history data found.
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Grid xs={12} textAlign="center" pt={2}>
                <Button
                  variant="soft"
                  color="neutral"
                  onClick={() => navigate("/purchase-order")}
                >
                  Back
                </Button>
              </Grid>
    </Box>
  );
}

export default PoHistoryTable;