import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, CircularProgress } from "@mui/joy";
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
import {
  useGetHandOverQuery,
  useUpdateHandOverMutation,
} from "../redux/camsSlice";

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

  // console.log("📦 All Combined Leads:", leads);

  const HandOverSheet = Array.isArray(getHandOverSheet?.Data)
    ? getHandOverSheet.Data.map((entry) => ({
        _id: entry._id,
        id: entry.id,
        ...entry.customer_details,
        ...entry.order_details,
        ...entry.project_detail,
        ...entry.commercial_details,
        ...entry.other_details,
        p_id: entry.p_id,
        status_of_handoversheet: entry.status_of_handoversheet,
        submitted_by: entry.submitted_by,
        is_locked: entry.is_locked,
      }))
    : [];

  // console.log("📦 All Combined HandOverSheets:", HandOverSheet);

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

  const StatusChip = ({ status, is_locked, _id, user, refetch }) => {
    const isAdmin = user?.role === "admin" || user?.role === "superadmin";

    const [lockedState, setLockedState] = useState(is_locked === "locked");
    const [updateUnlockHandoversheet, { isLoading }] =
      useUpdateHandOverMutation();

    useEffect(() => {
      setLockedState(is_locked === "locked");
    }, [is_locked]);

    const handleSubmit = async () => {
      if (!isAdmin) {
        toast.error(
          "Permission denied. You do not have access to perform this action.",
          {
            icon: "⛔",
          }
        );
        return;
      }

      if (isLoading || !lockedState) return;

      try {
        await updateUnlockHandoversheet({ _id, is_locked: "unlock" }).unwrap();
        toast.success("Handover sheet unlocked 🔓");
        setLockedState(false);
        refetch?.();
      } catch (err) {
        console.error("Error:", err?.data?.message || err.error);
        toast.error("Failed to update status.");
      }
    };

    const showUnlockIcon = status === "Approved" && is_locked === "unlock";

    return (
      <Button
        size="sm"
        variant="soft"
        color={showUnlockIcon ? "success" : "danger"}
        onClick={
          isAdmin && lockedState && !isLoading ? handleSubmit : undefined
        }
        sx={{
          minWidth: 36,
          height: 36,
          padding: 0,
          fontWeight: 500,
          cursor: isAdmin && lockedState && !isLoading ? "pointer" : "default",
        }}
      >
        {isLoading ? (
          <CircularProgress size="sm" />
        ) : showUnlockIcon ? (
          <LockOpenIcon sx={{ fontSize: "1rem" }} />
        ) : (
          <LockIcon sx={{ fontSize: "1rem" }} />
        )}
      </Button>
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

  const RowMenu = ({ currentPage, p_id, _id }) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        <Chip
          variant="solid"
          color="success"
          label="Approved"
          onClick={() => {
            const page = currentPage;
            const projectId = _id;
            sessionStorage.setItem("submitInfo", projectId);
            navigate(`/edit_cam_handover?page=${page}&_id=${projectId}`);
          }}
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "sm",
          }}
          startDecorator={<EditNoteIcon />}
        />
      </Box>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(combinedData)) return [];

    if (!user || !user.name) return [];

    return combinedData
      .filter((project) => {
        if (!project) return false;
        const submittedBy = project.submitted_by?.trim() || "";
        const userName = user.name.trim();
        const userRole = user.role?.toLowerCase();

        const isAdmin = userRole === "admin" || userRole === "superadmin";
        const matchesUser = isAdmin || submittedBy === userName;

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
        return dateA - dateB;
      });
  }, [combinedData, searchQuery, user]);

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

  const draftPayments = paginatedPayments.filter((project) =>
    ["submitted", "Approved"].includes(project.status_of_handoversheet)
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
                "Status",
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
                    {project.total_gst || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <StatusChip
                      status={project.status_of_handoversheet}
                      is_locked={project.is_locked}
                      _id={project._id}
                      user={user}
                      refetch={refetch}
                    />
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu
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
          Showing {draftPayments.length} of {draftPayments.length} results
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
