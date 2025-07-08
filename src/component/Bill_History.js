import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import {
  Grid,
  Button,
  Tooltip,
  IconButton,
  Modal,
  CircularProgress,
} from "@mui/joy";
import Axios from "../utils/Axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import UpdateBillForm from "./Forms/Edit_Bill";

const BillHistoryTable = ({ po_number }) => {
  const [billHistoryData, setBillHistoryData] = useState([]);
  const [poNumber, setPoNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
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
        // console.log("Enriched POs are:", fetchedPoNumber);

        const billResponse = await Axios.get("/get-bill-by-id", {
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
              _id: bill._id || "",
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

  const handleOpen = (_id, action) => {
    setSelectedId(_id);
    setModalAction(action);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
    setModalAction("");
  };

  const EditBill = ({ _id }) => {
    console.log("PO Number in EditBill:", _id);
    return (
      <Tooltip title="Edit Bill" placement="top">
        <IconButton
          color="primary"
          onClick={() => handleOpen(_id, "edit_bill")}
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
          {loading ? (
            <tr>
              <td colSpan={14}>
                <Box
                  sx={{
                    py: 5,
                    textAlign: "center",
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                  <Typography fontStyle="italic">
                    Loading history… please hang tight ⏳
                  </Typography>
                </Box>
              </td>
            </tr>
          ) : billHistoryData.length > 0 ? (
            billHistoryData.map((row, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fafafa",
                }}
              >
                <td style={{ padding: 8 }}>
                  <EditBill _id={row._id} />
                </td>
                <td style={{ padding: 8 }}>{row.bill_number}</td>
                <td style={{ padding: 8 }}>{row.bill_date}</td>
                <td style={{ padding: 8 }}>{row.bill_value}</td>
                <td style={{ padding: 8 }}>{row.submitted_by}</td>
              </tr>
            ))
          ) : (
            <tr style={{ backgroundColor: "#fafafa" }}>
              <td colSpan={5} style={{ padding: 16, textAlign: "center" }}>
                No matching bill data found.
              </td>
            </tr>
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

          {modalAction === "edit_bill" && <UpdateBillForm _id={selectedId} />}
        </Box>
      </Modal>
    </Box>
  );
};

export default BillHistoryTable;
