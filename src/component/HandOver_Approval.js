// import CancelIcon from "@mui/icons-material/Cancel";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import EditIcon from "@mui/icons-material/Edit";
// import SearchIcon from "@mui/icons-material/Search";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Tooltip,
//   Typography,
// } from "@mui/material";
// import InputAdornment from "@mui/material/InputAdornment";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import HandoverData from "../../Data/handover.json";

// function HandOverApproval() {
//   const navigate = useNavigate();
//   const [search, setSearch] = useState("");
//   const [data, setData] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedRowId, setSelectedRowId] = useState(null);
//   const [comment, setComment] = useState("");

//   console.log("Handover Data:", HandoverData);

//   useEffect(() => {
//     axios
//       .get(
//         "https://849f-103-248-94-60.ngrok-free.app/v1/get-all-handover-sheet?page=1"
//       )
//       .then((response) => {
//         console.log("API Response of the new api:", response);

//         const rawData = HandoverData;
//         console.log("API RawData of the new api:", rawData);

//         if (rawData && Array.isArray(rawData)) {
//           const apiData = rawData.map((item, index) => ({
//             id: item.id || item._id || index + 1,
//             submitted: false,
//             status: "Pending",
//             projectId: item.customer_details?.code || "-",
//             customer: item.customer_details?.name || "-",
//             mobile: item.customer_details?.number || "-",
//             state: item.customer_details?.state || "-",
//             type: item.project_detail?.project_type || "-",
//             capacity: item.project_detail?.project_kwp
//               ? `${item.project_detail.project_kwp} kWp`
//               : "-",
//             charges: item.commercial_details?.subsidy_amount || "N/A",
//           }));

//           setData(apiData);
//         } else {
//           console.error("Data is empty or not an array:", rawData);
//         }
//       })
//       .catch((error) => {
//         console.error("❌ Error fetching data:", error);
//       });
//   }, []);

//   const handleSubmit = (id) => {
//     const updated = data.map((row) =>
//       row.id === id ? { ...row, submitted: true } : row
//     );
//     setData(updated);
//   };

//   const handleDisapproveClick = (id) => {
//     setSelectedRowId(id);
//     setComment("");
//     setDialogOpen(true);
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//     setSelectedRowId(null);
//     setComment("");
//   };

//   const handleCommentSubmit = () => {
//     const updated = data.map((row) =>
//       row.id === selectedRowId
//         ? { ...row, status: "Disapproved", disapproveComment: comment }
//         : row
//     );
//     setData(updated);
//     setDialogOpen(false);
//     setSelectedRowId(null);
//     setComment("");
//   };

//   const handleApprove = (id) => {
//     const updated = data.map((row) =>
//       row.id === id ? { ...row, status: "Approved" } : row
//     );
//     setData(updated);
//   };

//   const filteredData = data.filter((row) => {
//     const query = search.toLowerCase();
//     return (
//       row.projectId?.toLowerCase().includes(query) ||
//       row.customer?.toLowerCase().includes(query) ||
//       row.state?.toLowerCase().includes(query) ||
//       row.status?.toLowerCase().includes(query)
//     );
//   });

//   return (
//     <Box p={4} sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
//       <Typography variant="h4" gutterBottom fontWeight="bold">
//         HandOver Approval
//       </Typography>

//       <Box
//         sx={{
//           mb: 3,
//           display: "flex",
//           justifyContent: "flex-start",
//         }}
//       >
//         <TextField
//           fullWidth
//           placeholder="Search by Project ID, Customer, or Name"
//           variant="outlined"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           sx={{
//             backgroundColor: "white",
//             borderRadius: 2,
//             boxShadow: 1,
//             "& .MuiOutlinedInput-root": {
//               height: 40,
//               fontSize: "0.9rem",
//               borderRadius: 2,
//               paddingRight: "8px",
//             },
//           }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon sx={{ color: "#1976d2" }} />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Box>

//       <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1976d2" }}>
//             <TableRow>
//               {[
//                 "Project Id",
//                 "Customer",
//                 "Mobile",
//                 "State",
//                 "Type",
//                 "Capacity (AC/DC)",
//                 "Service Charges (with GST)",
//                 "Approval Status", // ✅ Added
//                 "Action",
//                 "Submit",
//               ].map((head) => (
//                 <TableCell
//                   key={head}
//                   sx={{ color: "white", fontWeight: "bold" }}
//                 >
//                   {head}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {filteredData.map((row) => (
//               <TableRow key={row.id} hover>
//                 <TableCell>{row.projectId}</TableCell>
//                 <TableCell>{row.customer}</TableCell>
//                 <TableCell>{row.mobile}</TableCell>
//                 <TableCell>{row.state}</TableCell>
//                 <TableCell>{row.type}</TableCell>
//                 <TableCell>{row.capacity}</TableCell>
//                 <TableCell>{row.charges}</TableCell>

//                 <TableCell>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontWeight: "bold",
//                       color:
//                         row.status === "Approved"
//                           ? "green"
//                           : row.status === "Disapproved"
//                             ? "red"
//                             : "orange",
//                     }}
//                   >
//                     {row.status}
//                   </Typography>
//                 </TableCell>

//                 <TableCell>
//                   <Tooltip title="Edit">
//                     <IconButton
//                       color="primary"
//                       onClick={() => alert("Edit clicked")}
//                     >
//                       <EditIcon />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Approve">
//                     <IconButton
//                       color="success"
//                       onClick={() => handleApprove(row.id)}
//                     >
//                       <CheckCircleIcon />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Disapprove">
//                     <IconButton
//                       color="error"
//                       onClick={() => handleDisapproveClick(row.id)}
//                     >
//                       <CancelIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>

//                 <TableCell>
//                   <Button
//                     variant="contained"
//                     color={row.submitted ? "success" : "primary"}
//                     disabled={row.submitted || row.status === "Disapproved"}
//                     onClick={() => handleSubmit(row.id)}
//                     size="small"
//                   >
//                     {row.submitted ? "Submitted" : "Submit"}
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}

//             {filteredData.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={10} align="center">
//                   No records found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Disapprove Comment Dialog */}
//       <Dialog
//         open={dialogOpen}
//         onClose={handleDialogClose}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Reason for Disapproval</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             multiline
//             minRows={3}
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             placeholder="Enter the reason for disapproval..."
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDialogClose} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleCommentSubmit}
//             color="error"
//             variant="contained"
//           >
//             Submit Reason
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

// export default HandOverApproval;

import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, CircularProgress } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../assets/alert-bell.svg";
import {
  useGetHandOverQuery,
  useUpdateUnlockHandoversheetMutation,
} from "../redux/camsSlice";

import { useGetEntireLeadsQuery } from "../redux/leadsSlice";
import axios from "axios";

function Dash_cam() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  // const [projects, setProjects] = useState([]);
  const [bdRateData, setBdRateData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [accountNumber, setAccountNumber] = useState([]);
  const [ifscCode, setIfscCode] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUtrSubmitted, setIsUtrSubmitted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: getHandOverSheet = {},
    error,
    isLoading,
    refetch,
  } = useGetHandOverQuery(refreshKey);

  const { data: getLead = {} } = useGetEntireLeadsQuery();

  const leads = [
    ...(getLead?.lead?.initialdata?.map((item) => ({
      ...item,
    })) || []),
    ...(getLead?.lead?.followupdata?.map((item) => ({
      ...item,
    })) || []),
    ...(getLead?.lead?.warmdata?.map((item) => ({ ...item })) || []),
    ...(getLead?.lead?.wondata?.map((item) => ({ ...item })) || []),
    ...(getLead?.lead?.deaddata?.map((item) => ({ ...item })) || []),
  ];

  const HandOverSheet = Array.isArray(getHandOverSheet?.Data)
    ? getHandOverSheet.Data.map((entry) => ({
        id: entry.id,
        ...entry.customer_details,
        ...entry.order_details,
        ...entry.project_detail,
        ...entry.commercial_details,
        ...entry.attached_details,
        p_id: entry.p_id,
        status_of_handoversheet: entry.status_of_handoversheet,
      }))
    : [];

  const combinedData = HandOverSheet.map((handoverItem) => {
    const matchingLead = leads.find((lead) => lead.id === handoverItem.id);

    return {
      ...handoverItem,
      scheme: matchingLead?.scheme || "-",
    };
  });

  // console.log(combinedData);
  // const [updateUnlockHandoversheet, { isLoading: isUpdating }] =
  //   useUpdateUnlockHandoversheetMutation();

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // console.log("User Loaded:", JSON.parse(storedUser));
    }
  }, []);

  

    const handleApprovalUpdate = async (paymentId, newStatus) => {
      try {
        const response = await axios.put("/account-approve", {
          pay_id: paymentId,
          status: newStatus,
        });
  
        if (response.status === 200) {
          // Update the payments state to remove the row
          setPayments((prevPayments) =>
            prevPayments.filter((payment) => payment.pay_id !== paymentId)
          );
  
          // Show a toast message
          if (newStatus === "Approved") {
            toast.success("Payment Approved !!", { autoClose: 3000 });
          } else if (newStatus === "Rejected") {
            toast.error("Payment Rejected...", { autoClose: 2000 });
          }
        }
      } catch (error) {
        console.error("Error updating approval status:", error);
        toast.error(`Already Done.. Please refresh it.`);
      }
    };
  
    const RowMenu1 = ({ paymentId, onStatusChange }) => {
      const [status, setStatus] = useState(null);
  
      const handleChipClick = (newStatus) => {
        setStatus(newStatus);
        onStatusChange(paymentId, newStatus);
      };
  
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {/* Approve Chip */}
          <Chip
            variant="solid" 
            color="success"
            label="Approved"
            onClick={() => handleChipClick("Approved")} // Pass a function reference, not invoke it directly
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<EditNoteIcon />}
          />
  
          {/* Reject Chip */}
          <Chip
            variant="outlined"
            color="danger"
            label="Rejected"
            onClick={() => handleChipClick("Rejected")} // Pass a function reference to onClick
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<BlockIcon />}
          />
        </Box>
      );
    };

  const RowMenu = ({ currentPage, p_id }) => {
    console.log("CurrentPage: ", currentPage, "p_Id:", p_id);

    const [user, setUser] = useState(null);

    useEffect(() => {
      const userData = getUserData();
      setUser(userData);
    }, []);

    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    };

    return (
      <>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "plain", color: "neutral", size: "sm" },
            }}
          >
            <MoreHorizRoundedIcon />
          </MenuButton>

          <Menu size="sm" sx={{ minWidth: 140 }}>
            <MenuItem
              color="primary"
              onClick={() => {
                const page = currentPage;
                const projectId = Number(p_id);
                sessionStorage.setItem("view handover", projectId);
                // localStorage.setItem("p_id", projectID);
                navigate(`/view_handover?page=${page}&p_id=${projectId}`);
              }}
            >
              <ContentPasteGoIcon />
              <Typography>View</Typography>
            </MenuItem>
            <MenuItem
              color="primary"
              onClick={() => {
                const page = currentPage;
                const projectId = Number(p_id);
                sessionStorage.setItem("update handover", projectId);
                // localStorage.setItem("p_id", projectID);
                navigate(`/edit_handover?page=${page}&p_id=${projectId}`);
              }}
            >
              <EditNoteIcon />
              <Typography>Edit HandOver</Typography>
            </MenuItem>
            {/* <MenuItem
                onClick={() => {
                  const page = currentPage;
                  const projectId = String(p_id);
                  localStorage.setItem("get-project", projectId);
                  navigate("#");
                }}
              >
                <HistoryIcon />
                <Typography>View BOM</Typography>
              </MenuItem> */}
            {/* <Divider sx={{ backgroundColor: "lightblue" }} /> */}
            {/* {(user?.name === "IT Team" || user?.name === "admin") && (
                <MenuItem
                  color="danger"
                  disabled={selected.length === 0}
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                  <Typography>Delete</Typography>
                </MenuItem>
              )} */}
          </Menu>
        </Dropdown>
      </>
    );
  };

  // const handleDelete = async () => {
  //   if (selected.length === 0) {
  //     toast.error("No offers selected for deletion.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  //     for (const _id of selected) {
  //       await Axios.delete(`/delete-offer/${_id}`);

  //       setCommRate((prev) => prev.filter((item) => item._id !== _id));
  //       setBdRateData((prev) => prev.filter((item) => item.offer_id !== _id));
  //       setMergedData((prev) => prev.filter((item) => item.offer_id !== _id));
  //     }

  //     toast.success("Deleted successfully.");
  //     setSelected([]);
  //   } catch (err) {
  //     console.error("Error deleting offers:", err);
  //     setError(err.response?.data?.msg || "Failed to delete selected offers.");
  //     toast.error("Failed to delete selected offers.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(combinedData)) return [];

    return combinedData
      .filter((project) => {
        if (!project) return false; // safeguard

        const matchesSearchQuery = ["code", "customer", "state"].some((key) =>
          project[key]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery?.toLowerCase())
        );

        return matchesSearchQuery;
      })
      .sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0);
        const dateB = new Date(b?.createdAt || 0);
        return dateB - dateA;
      });
  }, [combinedData, searchQuery]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPayments.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(1);
    }

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (currentPage < totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedPayments = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // console.log(paginatedPayments);
  // console.log("Filtered and Sorted Data:", filteredAndSortedData);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Mobile Filters */}
      {/* <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: "", sm: "none" }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet> */}
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          // flexDirection:{xs: "none", sm: "flex"}
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Pay ID, Customer, or Name"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {/* {renderFilters()} */}
      </Box>
      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <Checkbox
                  size="sm"
                  checked={selected.length === paginatedPayments.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < paginatedPayments.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Customer",
                "Mobile",
                "State",
                "Type",
                "Capacity(AC/DC)",
                "Slnko Service Charges (with GST)",
                "Action",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ padding: "8px", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ marginBottom: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : paginatedPayments.length > 0 ? (
              paginatedPayments.map((project, index) => (
                <tr
                  key={index}
                  style={{
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selected.includes(project._id)}
                      onChange={(event) =>
                        handleRowSelect(project._id, event.target.checked)
                      }
                    />
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.code || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.customer || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.number || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.state || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.scheme || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.project_kwp && project.proposed_dc_capacity
                      ? `${project.project_kwp} AC / ${project.proposed_dc_capacity} DC`
                      : "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.service || "-"}
                  </td>


                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu1 currentPage={currentPage} p_id={project.p_id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ padding: "8px", textAlign: "center" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginBottom: "8px",
                      }}
                    />
                    <Typography fontStyle="italic">
                      No Handover Sheet Found
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>
      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          // display: { xs: "none", md: "flex" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { lg: "18%", xl: "15%" },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Box>
          Showing {paginatedPayments.length} of {filteredAndSortedData.length}{" "}
          results
        </Box>
        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {generatePageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === "number" ? (
              <IconButton
                key={index}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            ) : (
              <Typography key={index} sx={{ px: 1, alignSelf: "center" }}>
                {page}
              </Typography>
            )
          )}
        </Box>
        {/* <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <IconButton
        key={page}
        size="sm"
        variant={page === currentPage ? "contained" : "outlined"}
        color="neutral"
        onClick={() => handlePageChange(page)}
      >
        {page}
      </IconButton>
    ))}
  </Box> */}

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default Dash_cam;

