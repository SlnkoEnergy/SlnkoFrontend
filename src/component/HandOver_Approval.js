import BlockIcon from "@mui/icons-material/Block";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, CircularProgress, Modal, ModalDialog, Textarea } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import { useGetHandOverQuery } from "../redux/camsSlice";
import Axios from "../utils/Axios";

import { toast } from "react-toastify";
import { useGetEntireLeadsQuery } from "../redux/leadsSlice";

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
    ? getHandOverSheet.Data.map((entry) => {
        const matchingLead = leads.find((lead) => lead.id === entry.id);
        return {
          ...entry,
          ...entry.customer_details,
          ...entry.order_details,
          ...entry.project_detail,
          ...entry.commercial_details,
          ...entry.other_details,
          scheme: matchingLead?.scheme || "-",
        };
      })
    : [];

  // console.log("HandOverSheet:", HandOverSheet);

  // const combinedData = HandOverSheet.map((handoverItem) => {
  //   const matchingLead = leads.find((lead) => lead.id === handoverItem.id);

  //   return {
  //     ...handoverItem,
  //     scheme: matchingLead?.scheme || "-",
  //   };
  // });

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

  // const handleApprovalUpdate = async (Id, newStatus) => {
  //   try {
  //     // Convert "Rejected" to "Draft" before sending to backend
  //     const statusToSend = newStatus === "Rejected" ? "draft" : "Approved";

  //     const response = await axios.put(`/update-status/${Id}`, {
  //       status_of_handoversheet: statusToSend,
  //     });

  //     if (response.status === 200) {
  //       // Remove item from UI after status change
  //       setPayments((prevPayments) =>
  //         prevPayments.filter((payment) => payment._id !== Id)
  //       );

  //       // Show appropriate toast
  //       if (newStatus === "Approved") {
  //         toast.success("Payment Approved !!", { autoClose: 3000 });
  //       } else if (newStatus === "Rejected") {
  //         toast.error("Payment Rejected (reverted to Draft)", {
  //           autoClose: 2000,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error updating approval status:", error);
  //     toast.error("Already Done.. Please refresh it.");
  //   }
  // };

  // const RowMenu1 = ({ Id, onStatusChange, currentPage, p_id }) => {
  //   const [status, setStatus] = useState(null);

  //   const handleChipClick = (newStatus) => {
  //     setStatus(newStatus);
  //     onStatusChange(Id, newStatus);
  //   };

  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "center",
  //         gap: 1,
  //       }}
  //     >
  //       {/* Approve Chip */}
  //       <Chip
  //         variant="solid"
  //         color="success"
  //         label="Approved"
  //         onClick={() => {
  //           const page = currentPage;
  //           const projectId = Number(p_id);
  //           sessionStorage.setItem(
  //             "approvalInfo",
  //             JSON.stringify({
  //               projectId,
  //               status: "Approved",
  //               page,
  //             })
  //           );
  //           handleChipClick("Approved");
  //         }}
  //         sx={{
  //           textTransform: "none",
  //           fontSize: "0.875rem",
  //           fontWeight: 500,
  //           borderRadius: "sm",
  //         }}
  //         startDecorator={<EditNoteIcon />}
  //       />

  //       {/* Reject Chip */}
  //       <Chip
  //         variant="outlined"
  //         color="danger"
  //         label="Rejected"
  //         onClick={() => handleChipClick("Rejected")}
  //         sx={{
  //           textTransform: "none",
  //           fontSize: "0.875rem",
  //           fontWeight: 500,
  //           borderRadius: "sm",
  //         }}
  //         startDecorator={<BlockIcon />}
  //       />
  //     </Box>
  //   );
  // };

  const RowMenu1 = ({ currentPage, p_id, _id }) => {
    const [openModal, setOpenModal] = useState(false);
    const [comment, setComment] = useState("");

    const handleReject = async () => {
      if (!comment.trim()) {
        toast.error("Please enter a comment before submitting.");
        return;
      }

      const ID = String(_id);

      try {
        const token = localStorage.getItem("authToken");

        await Axios.put(
          `/update-status/${ID}`,
          {
            status_of_handoversheet: "Rejected",
            comment: comment,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        toast.success("Handover sent back to BD");
        setOpenModal(false);

        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error) {
        console.error(
          "Error updating status:",
          error.response?.data || error.message
        );
        toast.error("Failed to reject the handover.");
      }
    };

    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Chip
            variant="solid"
            color="success"
            label="Approved"
            onClick={() => {
              const page = currentPage;
              const projectId = _id;

              sessionStorage.setItem("approvalInfo", projectId);
              navigate(`/edit_ops_handover?page=${page}&_id=${projectId}`);
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<EditNoteIcon />}
          />

          <Chip
            variant="outlined"
            color="danger"
            label="Rejected"
            onClick={() => setOpenModal(true)}
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<BlockIcon />}
          />
        </Box>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <ModalDialog variant="outlined" layout="center">
            <Typography level="h5">Updation Remarks</Typography>
            <Textarea
              minRows={3}
              placeholder="Enter your reason for rejection"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant="plain" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleReject}>
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </>
    );
  };

  // const RowMenu = ({ currentPage, p_id }) => {
  //   console.log("CurrentPage: ", currentPage, "p_Id:", p_id);

  //   const [user, setUser] = useState(null);

  //   useEffect(() => {
  //     const userData = getUserData();
  //     setUser(userData);
  //   }, []);

  //   const getUserData = () => {
  //     const userData = localStorage.getItem("userDetails");
  //     if (userData) {
  //       return JSON.parse(userData);
  //     }
  //     return null;
  //   };

  //   return (
  //     <>
  //       <Dropdown>
  //         <MenuButton
  //           slots={{ root: IconButton }}
  //           slotProps={{
  //             root: { variant: "plain", color: "neutral", size: "sm" },
  //           }}
  //         >
  //           <MoreHorizRoundedIcon />
  //         </MenuButton>

  //         <Menu size="sm" sx={{ minWidth: 140 }}>
  //           <MenuItem
  //             color="primary"
  //             onClick={() => {
  //               const page = currentPage;
  //               const projectId = Number(p_id);
  //               sessionStorage.setItem("view handover", projectId);
  //               // localStorage.setItem("p_id", projectID);
  //               navigate(`/view_handover?page=${page}&p_id=${projectId}`);
  //             }}
  //           >
  //             <ContentPasteGoIcon />
  //             <Typography>View</Typography>
  //           </MenuItem>
  //           <MenuItem
  //             color="primary"
  //             onClick={() => {
  //               const page = currentPage;
  //               const projectId = Number(p_id);
  //               sessionStorage.setItem("update handover", projectId);
  //               // localStorage.setItem("p_id", projectID);
  //               navigate(`/edit_handover?page=${page}&p_id=${projectId}`);
  //             }}
  //           >
  //             <EditNoteIcon />
  //             <Typography>Edit HandOver</Typography>
  //           </MenuItem>
  //           {/* <MenuItem
  //               onClick={() => {
  //                 const page = currentPage;
  //                 const projectId = String(p_id);
  //                 localStorage.setItem("get-project", projectId);
  //                 navigate("#");
  //               }}
  //             >
  //               <HistoryIcon />
  //               <Typography>View BOM</Typography>
  //             </MenuItem> */}
  //           {/* <Divider sx={{ backgroundColor: "lightblue" }} /> */}
  //           {/* {(user?.name === "IT Team" || user?.name === "admin") && (
  //               <MenuItem
  //                 color="danger"
  //                 disabled={selected.length === 0}
  //                 onClick={handleDelete}
  //               >
  //                 <DeleteIcon />
  //                 <Typography>Delete</Typography>
  //               </MenuItem>
  //             )} */}
  //         </Menu>
  //       </Dropdown>
  //     </>
  //   );
  // };

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
    return HandOverSheet.filter((project) =>
      ["code", "customer", "state"].some((key) =>
        project[key]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    ).sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.createdAt || 0);
      const dateB = new Date(b?.updatedAt || b?.createdAt || 0);
      return dateB - dateA;
    });
  }, [HandOverSheet, searchQuery]);

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

  const paginatedPayments = filteredAndSortedData;

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  // const paginatedPayments = filteredAndSortedData.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  // console.log(paginatedPayments);
  // console.log("Filtered and Sorted Data:", filteredAndSortedData);

  const handlePageChange = (page) => {
    if (page >= 1) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  const draftPayments = paginatedPayments.filter(
    (project) => project.status_of_handoversheet === "draft"
  );

  return (
    <>
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
                "Slnko Service Charges (w/o GST)",
                "Submitted By",
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
            ) : draftPayments.length > 0 ? (
              draftPayments.map((project, index) => (
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
                    {project.submitted_by || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu1
                      currentPage={currentPage}
                      p_id={project.p_id}
                      _id={project._id}
                    />
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
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { lg: "18%", xl: "15%" },
        }}
      >
        {/* Previous Button */}
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

        {/* Showing X Results (no total because backend paginates) */}
        <Box>Showing {draftPayments.length} results</Box>

        {/* Page Numbers: Only show current, prev, next for backend-driven pagination */}
        {/* Page Numbers: Only show current, prev, next for backend-driven pagination */}
        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {currentPage > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1}
            </IconButton>
          )}

          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>

          {/* Show next page button if current page has any data (not empty) */}
          {draftPayments.length > 0 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1}
            </IconButton>
          )}
        </Box>

        {/* Next Button */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={draftPayments.length === 0} // disable next if no data at all on this page
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default Dash_cam;
