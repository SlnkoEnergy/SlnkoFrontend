import { Button, Grid } from "@mui/joy";
import Box from "@mui/joy/Box";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../utils/Axios";
import Tooltip from "@mui/joy/Tooltip";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import IconButton from "@mui/joy/IconButton";

function BdHistoryTable() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [scmData, setScmData] = useState([]);

  useEffect(() => {
    const fetchSCMData = async () => {
      setLoading(true);
      try {
        const offerRate = localStorage.getItem("get-offer");

        if (!offerRate) {
          console.error("Offer ID not found in localStorage");
          toast.error("Offer ID is missing!");
          return;
        }

        const { data: response } = await Axios.get("/get-bd-rate-history");
        const offerBDRATE = response?.data;

        console.log(offerBDRATE);

        if (Array.isArray(offerBDRATE)) {
          const matchedData = offerBDRATE.filter(
            (item) => item.offer_id === offerRate
          );

          // if (matchedData.length === 0) {
          //   console.error("No matching offer found.");
          //   toast.error("No matching offer found.");
          //   return;
          // }

          setScmData(matchedData);
        } else {
          console.error("Invalid data format in API response.");
          toast.error("No data found.");
        }
      } catch (error) {
        console.error(
          "Error fetching SCM data:",
          error?.response?.data || error.message
        );
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSCMData();
  }, []);

  const AddMenu = ({offer_id, _id}) => {
    return(
      <Tooltip title="Add" arrow>
      <IconButton
        size="small"
        sx={{
          backgroundColor: "skyblue",
          color: "white",
          "&:hover": {
            backgroundColor: "#45a049",
          },
          borderRadius: "50%",
          padding: "4px",
        }}
        onClick={() =>{
          // const page = currentPage;
          const offerId = String(offer_id);
          const Id = _id;
          localStorage.setItem("preview_id", Id);
          localStorage.setItem("preview_offerId", offerId);
          navigate(`/offer_preview?_id=${Id}&offer_id=${offerId}`);
        }}
      >
        <RemoveRedEyeIcon fontSize="xl" />
      </IconButton>
    </Tooltip>
    )
  }

  return (
    <Box
      sx={{
        padding: 1,
        width: { lg: "85%", sm: "100%" },
        marginLeft: { xl: "15%", lg: "18%", sm: "0%" },
      }}
    >
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
          sx={{ backgroundColor: "neutral.300", color: "neutral.900" }}
        >
          <Box component="tr">
            {[
              "S.No.",
              "SPV Modules",
              "Module Mounting Structure",
              "Transmission Line",
              "Slnko Charges",
              "Submitted By BD",
              "Costing Preview"
            ].map((header, index) => (
              <Box
                component="th"
                key={index}
                sx={{
                  padding: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {header}
              </Box>
            ))}
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
                  textAlign:"center",
                  backgroundColor:
                    index % 2 === 0 ? "neutral.100" : "neutral.50",
                  "&:hover": { backgroundColor: "neutral.200" },
                }}
              >
                <Box component="td" sx={{ padding: 2 }}>
                  {index + 1}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.spv_modules || "-"}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.module_mounting_structure || "-"}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.transmission_line || "-"}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.slnko_charges || "-"}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.submitted_by_BD || "-"}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                <AddMenu offer_id={row.offer_id} _id={row._id} />
                </Box>
              </Box>
            ))
          ) : (
            <Box
              component="tr"
              sx={{ textAlign: "center", backgroundColor: "neutral.50" }}
            >
              <Box component="td" colSpan={8} sx={{ padding: 2 }}>
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
          onClick={() => navigate("/comm_offer")}
        >
          Back
        </Button>
      </Grid>
    </Box>
  );
}

export default BdHistoryTable;
