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

        const token = localStorage.getItem("authToken");

        if (!token || !poNumberFromStorage) {
          console.warn("Missing auth token or PO number in localStorage.");
          setLoading(false);
          return;
        }

        const billResponse = await Axios.get(
          `/get-bill-by-id?po_number=${poNumberFromStorage}`,
          {
            headers: { "x-auth-token": token },
          }
        );

        const billData = Array.isArray(billResponse.data?.data) ? billResponse.data.data : [];

        if (!Array.isArray(billData)) {
          throw new Error("Bill history data is not an array.");
        }

        const formattedBills = billData.map((bill) => {
          const date = new Date(bill.bill_date);
          const formattedDate = bill.bill_date
            ? `${date.getFullYear()}-${date.toLocaleString("default", {
                month: "short",
              })}-${String(date.getDate()).padStart(2, "0")}`
            : "";

          return {
            _id: bill._id || "",
            po_number: bill.po_number || "",
            bill_number: bill.bill_number || "",
            bill_value:
              bill.bill_value?.toLocaleString("en-IN") || "",
            bill_date: formattedDate,
            submitted_by: bill.submitted_by || "Unknown",
          };
        });

        setBillHistoryData(formattedBills);
        console.log("Fetched bill history:", formattedBills);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpen = (po_number, action) => {
    setSelectedId(po_number);
    setModalAction(action);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId("");
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
                  <EditBill po_number={row.po_number} />
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

          {modalAction === "edit_bill" && <UpdateBillForm po_number={selectedId} />}
        </Box>
      </Modal>
    </Box>
  );
};

export default BillHistoryTable;
