import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HandoverData from "../../Data/handover.json"; // Assuming you have a JSON file with the data

function HandOverApproval() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [comment, setComment] = useState("");

  console.log("Handover Data:", HandoverData);

  useEffect(() => {
    axios
      .get(
        "https://849f-103-248-94-60.ngrok-free.app/v1/get-all-handover-sheet?page=1"
      )
      .then((response) => {
        console.log("API Response of the new api:", response);

        const rawData = HandoverData;
        console.log("API RawData of the new api:", rawData);

        if (rawData && Array.isArray(rawData)) {
          const apiData = rawData.map((item, index) => ({
            id: item.id || item._id || index + 1,
            submitted: false,
            status: "Pending",
            projectId: item.customer_details?.code || "-",
            customer: item.customer_details?.name || "-",
            mobile: item.customer_details?.number || "-",
            state: item.customer_details?.state || "-",
            type: item.project_detail?.project_type || "-",
            capacity: item.project_detail?.project_kwp
              ? `${item.project_detail.project_kwp} kWp`
              : "-",
            charges: item.commercial_details?.subsidy_amount || "N/A",
          }));

          setData(apiData);
        } else {
          console.error("Data is empty or not an array:", rawData);
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching data:", error);
      });
  }, []);

  const handleSubmit = (id) => {
    const updated = data.map((row) =>
      row.id === id ? { ...row, submitted: true } : row
    );
    setData(updated);
  };

  const handleDisapproveClick = (id) => {
    setSelectedRowId(id);
    setComment("");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRowId(null);
    setComment("");
  };

  const handleCommentSubmit = () => {
    const updated = data.map((row) =>
      row.id === selectedRowId
        ? { ...row, status: "Disapproved", disapproveComment: comment }
        : row
    );
    setData(updated);
    setDialogOpen(false);
    setSelectedRowId(null);
    setComment("");
  };

  const handleApprove = (id) => {
    const updated = data.map((row) =>
      row.id === id ? { ...row, status: "Approved" } : row
    );
    setData(updated);
  };

  const filteredData = data.filter((row) => {
    const query = search.toLowerCase();
    return (
      row.projectId?.toLowerCase().includes(query) ||
      row.customer?.toLowerCase().includes(query) ||
      row.state?.toLowerCase().includes(query) ||
      row.status?.toLowerCase().includes(query)
    );
  });

  return (
    <Box p={4} sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        HandOver Approval
      </Typography>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by Project ID, Customer, or Name"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 1,
            "& .MuiOutlinedInput-root": {
              height: 40,
              fontSize: "0.9rem",
              borderRadius: 2,
              paddingRight: "8px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#1976d2" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {[
                "Project Id",
                "Customer",
                "Mobile",
                "State",
                "Type",
                "Capacity (AC/DC)",
                "Service Charges (with GST)",
                "Approval Status", // ✅ Added
                "Action",
                "Submit",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.projectId}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.mobile}</TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.capacity}</TableCell>
                <TableCell>{row.charges}</TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color:
                        row.status === "Approved"
                          ? "green"
                          : row.status === "Disapproved"
                            ? "red"
                            : "orange",
                    }}
                  >
                    {row.status}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => alert("Edit clicked")}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Approve">
                    <IconButton
                      color="success"
                      onClick={() => handleApprove(row.id)}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disapprove">
                    <IconButton
                      color="error"
                      onClick={() => handleDisapproveClick(row.id)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color={row.submitted ? "success" : "primary"}
                    disabled={row.submitted || row.status === "Disapproved"}
                    onClick={() => handleSubmit(row.id)}
                    size="small"
                  >
                    {row.submitted ? "Submitted" : "Submit"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Disapprove Comment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reason for Disapproval</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter the reason for disapproval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleCommentSubmit}
            color="error"
            variant="contained"
          >
            Submit Reason
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HandOverApproval;
