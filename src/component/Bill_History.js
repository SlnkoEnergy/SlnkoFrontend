import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Grid, Button, Tooltip, IconButton, Modal } from "@mui/joy";
import Axios from "../utils/Axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import UpdateBillForm from "./Forms/Edit_Bill";

const BillHistoryTable = ({ po_number }) => {
  const [billHistoryData, setBillHistoryData] = useState([]);
  const [poNumber, setPoNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPoNumber, setSelectedPoNumber] = useState("");
  const [modalAction, setModalAction] = useState("");

  const [searchParams] = useSearchParams();

  const poNumberFromStorage = po_number || searchParams.get("po_number");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // const poNumberFromStorage = localStorage.getItem("get-po");

        const token = localStorage.getItem("authToken");
        const poResponse = await Axios.get("/get-all-pO-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        const fetchedPoNumber = poResponse.data;
        setPoNumber(fetchedPoNumber);
        console.log("Enriched POs are:", fetchedPoNumber);

        const billResponse = await Axios.get("/get-all-bilL-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
        const billData = Array.isArray(billResponse.data)
          ? billResponse.data
          : billResponse.data.data;

        if (!Array.isArray(billData)) {
          throw new Error("Bill history data is not an array.");
        }

        const matchingBills = billData
          .filter((bill) => bill.po_number === poNumberFromStorage)
          .map((bill) => {
            const date = new Date(bill.bill_date);
            const formattedDate = bill.bill_date
              ? `${date.getFullYear()}-${date.toLocaleString("default", { month: "short" })}-${String(date.getDate()).padStart(2, "0")}`
              : "";
            return {
              po_number: bill.po_number || "",
              bill_number: bill.bill_number || "",
              bill_value: bill.bill_value.toLocaleString("en-IN") || "",
              bill_date: formattedDate,
              submitted_by: bill.submitted_by || "Unknown",
            };
          });

        setBillHistoryData(matchingBills);
        console.log("data are:", matchingBills);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [poNumberFromStorage]);

  const handleOpen = (po_number, action) => {
    setSelectedPoNumber(po_number);
    setModalAction(action);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPoNumber("");
    setModalAction("");
  };

  const EditBill = ({ po_number }) => {
    console.log("PO Number in EditBill:", po_number);
    return (
      <Tooltip title="Edit Bill" placement="top">
        <IconButton
          color="primary"
          onClick={() => handleOpen(po_number, "edit_bill")}
        >
          <EditNoteIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        padding: 1,
        width: { lg: "85%", sm: "100%" },
        marginLeft: { xl: "15%", lg: "18%", sm: "0%" },
      }}
    >
      {/* Title */}
      {/* <Typography
        variant="h4"
        sx={{
          marginBottom: 3,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "24px",
          color: "primary.main",
        }}
      >
        Bill History
      </Typography> */}

      {/* Loading Indicator */}
      {loading && (
        <Typography
          variant="body1"
          sx={{ textAlign: "center", marginBottom: 2 }}
        >
          Loading...
        </Typography>
      )}

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
            {["", "Bill Number", "Bill Date", "Bill Value", "Submitted By"].map(
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
          {billHistoryData.length > 0 ? (
            billHistoryData.map((row, index) => (
              <Box
                component="tr"
                key={index}
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? "neutral.100" : "neutral.50",
                  "&:hover": {
                    backgroundColor: "neutral.200",
                  },
                }}
              >
                <Box component="td" sx={{ padding: 2 }}>
                  <EditBill po_number={row.po_number} />
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.bill_number}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.bill_date}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.bill_value}
                </Box>
                <Box component="td" sx={{ padding: 2 }}>
                  {row.submitted_by}
                </Box>
              </Box>
            ))
          ) : (
            <Box
              component="tr"
              sx={{
                textAlign: "center",
                padding: 2,
                backgroundColor: "neutral.50",
              }}
            >
              <Box component="td" colSpan={5} sx={{ padding: 2 }}>
                No matching bill data found.
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            minWidth: 500,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 20,
              right: 15,
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>

          {modalAction === "edit_bill" && (
            <UpdateBillForm po_number={selectedPoNumber} />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BillHistoryTable;
