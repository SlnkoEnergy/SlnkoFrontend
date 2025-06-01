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

  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({ page: currentPage });

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

  // const HandOverSheet = Array.isArray(getHandOverSheet?.Data)
  //   ? getHandOverSheet.Data.map((entry) => ({
  //       _id: entry._id,
  //       id: entry.id,
  //       ...entry.customer_details,
  //       ...entry.order_details,
  //       ...entry.project_detail,
  //       ...entry.commercial_details,
  //       ...entry.other_details,
  //       p_id: entry.p_id,
  //       status_of_handoversheet: entry.status_of_handoversheet,
  //       submitted_by: entry.submitted_by,
  //       is_locked: entry.is_locked,
  //     }))
  //   : [];

  // console.log("📦 All Combined HandOverSheets:", HandOverSheet);

  // const combinedData = HandOverSheet.map((handoverItem) => {
  //   const matchingLead = leads.find((lead) => lead.id === handoverItem.id);

  //   return {
  //     ...handoverItem,
  //     scheme: matchingLead?.scheme || "-",
  //   };
  // });

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
    const isAdmin =
      user?.role === "admin" ||
      user?.role === "superadmin" ||
      user?.name === "Prachi Singh" ||
      user?.name === "Sanjiv Kumar" ||
      user?.name === "Sushant Ranjan Dubey";
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
          { icon: "⛔" }
        );
        return;
      }

      if (isLoading || !lockedState || status !== "Approved") return;

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

    const showUnlockIcon = !lockedState && status === "Approved";
    const showSuccessLockIcon = lockedState && status === "submitted";

    const color = showUnlockIcon || showSuccessLockIcon ? "success" : "danger";

    const IconComponent = showUnlockIcon ? LockOpenIcon : LockIcon;

    return (
      <Button
        size="sm"
        variant="soft"
        color={color}
        onClick={
          isAdmin && lockedState && status === "Approved" && !isLoading
            ? handleSubmit
            : undefined
        }
        sx={{
          minWidth: 36,
          height: 36,
          padding: 0,
          fontWeight: 500,
          cursor:
            isAdmin && lockedState && status === "Approved" && !isLoading
              ? "pointer"
              : "default",
        }}
      >
        {isLoading ? (
          <CircularProgress size="sm" />
        ) : (
          <IconComponent sx={{ fontSize: "1rem" }} />
        )}
      </Button>
    );
  };

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

  // const filteredAndSortedData = useMemo(() => {
  //   if (!Array.isArray(combinedData) || !user?.name) return [];

  //   const userName = user.name.trim();
  //   const userRole = user.role?.toLowerCase();
  //   const isAdmin = userRole === "admin" || userRole === "superadmin";
  //   const isCAM = ["Prachi Singh", "Guddu Rani Dubey", "Sanjiv Kumar", "Sushant Ranjan Dubey"].includes(userName);

  //   return combinedData
  //     .filter((project) => {
  //       if (!project) return false;

  //       const submittedBy = project.submitted_by?.trim().toLowerCase() || "";
  //       const canAccess = isAdmin || isCAM || submittedBy === userName;

  //       const matchesSearchQuery = ["code", "customer", "state"].some((key) =>
  //         project[key]?.toString().toLowerCase().includes(searchQuery?.toLowerCase())
  //       );

  //       return matchesSearchQuery && canAccess;
  //     })
  //     .sort((a, b) => {
  //       const dateA = new Date(a?.updatedAt || a?.createdAt || 0);
  //       const dateB = new Date(b?.updatedAt || b?.createdAt || 0);
  //       return dateB - dateA; // Most recent first
  //     });
  // }, [combinedData, searchQuery, user]);

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
  // const generatePageNumbers = (currentPage, totalPages) => {
  //   const pages = [];

  //   if (totalPages <= 5) {
  //     // If 5 or fewer pages, show all
  //     for (let i = 1; i <= totalPages; i++) {
  //       pages.push(i);
  //     }
  //     return pages;
  //   }

  //   if (currentPage > 2) pages.push(1);
  //   if (currentPage > 3) pages.push("...");

  //   for (
  //     let i = Math.max(1, currentPage - 1);
  //     i <= Math.min(totalPages, currentPage + 1);
  //     i++
  //   ) {
  //     pages.push(i);
  //   }

  //   if (currentPage < totalPages - 2) pages.push("...");
  //   if (currentPage < totalPages - 1) pages.push(totalPages);

  //   return pages;
  // };

  // const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const paginatedPayments = filteredAndSortedData.slice(startIndex, endIndex);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const paginatedPayments = filteredAndSortedData;

  // const totalPages = Math.ceil(currentPage / (1000 / itemsPerPage));

  // const paginatedPayments = filteredAndSortedData;

  const draftPayments = paginatedPayments.filter((project) =>
    ["submitted", "Approved"].includes(project.status_of_handoversheet)
  );

  // console.log(paginatedPayments);
  // console.log("Filtered and Sorted Data:", filteredAndSortedData);

  const handlePageChange = (page) => {
    if (page >= 1) {
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
