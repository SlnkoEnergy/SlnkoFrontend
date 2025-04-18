import { Player } from "@lottiefiles/react-lottie-player";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import SearchIcon from "@mui/icons-material/Search";
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
// import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/Lotties/animation-loading.json";
// import Axios from "../utils/Axios";
import { Autocomplete, Chip, Grid, Modal, Option, Select } from "@mui/joy";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import { useGetEntireLeadsQuery } from "../../redux/leadsSlice";

const Overall_Leads = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selected, setSelected] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [mergedData, setMergedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // const [cachedData, setCachedData] = useState(() => {
  //   // Try to load cached data from localStorage
  //   const cached = localStorage.getItem("paginatedData");
  //   return cached ? JSON.parse(cached) : [];
  // });

  const { data: getLead = [], isLoading, error } = useGetEntireLeadsQuery();

  const leads = [
    ...(getLead?.lead?.initialdata?.map((item) => ({
      ...item,
      status: "Initial",
    })) || []),
    ...(getLead?.lead?.followupdata?.map((item) => ({
      ...item,
      status: "Followup",
    })) || []),
    ...(getLead?.lead?.warmdata?.map((item) => ({ ...item, status: "Warm" })) ||
      []),
    ...(getLead?.lead?.wondata?.map((item) => ({ ...item, status: "Won" })) ||
      []),
    ...(getLead?.lead?.deaddata?.map((item) => ({ ...item, status: "Dead" })) ||
      []),
  ];

  // console.log("overall leads", leads);

  // const LeadStatus = ({ lead = {} }) => {
  //   const {
  //     loi = "",
  //     ppa = "",
  //     loa = "",
  //     other_remarks = "",
  //     token_money = ""
  //   } = lead;

  //   let status = "Initial";
  //   let color = "primary";
  //   let variant = "soft";

  //   // ✅ Won
  //   if (
  //     (loi === "Yes" || loi === "No") &&
  //     (ppa === "Yes" || ppa === "No") &&
  //     (loa === "Yes" || loa === "No") &&
  //     token_money === "Yes" &&
  //     (!other_remarks || other_remarks.trim() === "")
  //   ) {
  //     status = "Won";
  //     color = "success";
  //   }
  //   // ✅ Initial
  //   else if (
  //     (loi === "No" || loi === "") &&
  //     (!ppa || ppa === "No") &&
  //     (!loa || loa === "No") &&
  //     (!other_remarks || other_remarks.trim() === "") &&
  //     (!token_money || token_money === "No")
  //   ) {
  //     status = "Initial";
  //     color = "primary";
  //   }
  //   // ✅ Warm (allowing other_remarks to be filled or empty)
  //   else if (
  //     (loi === "Yes" || loi === "No") &&
  //     (ppa === "Yes" || ppa === "No") &&
  //     (loa === "Yes" || loa === "No") &&
  //     token_money === "No"
  //   ) {
  //     status = "Warm";
  //     color = "warning";
  //   }

  //   // ✅ Follow Up (if loi is "Yes", regardless of token_money, and other_remarks is empty)
  //   else if (
  //     loi === "Yes" &&
  //     (ppa === "Yes" || ppa === "No") &&
  //     (loa === "Yes" || loa === "No") &&
  //     (!other_remarks || other_remarks.trim() === "")
  //   ) {
  //     status = "Follow Up";
  //     color = "warning";
  //   }
  //   // ✅ Dead (fallback)
  //   else if (
  //     (loi === "No" || loi === "Yes") &&
  //     (ppa === "No" || ppa === "Yes") &&
  //     (loa === "No" || loa === "Yes") &&
  //     (token_money === "No" || token_money === "Yes")
  //   ) {
  //     status = "Dead";
  //     color = "danger";
  //   }

  //   // ❓ Unknown fallback
  //   else {
  //     status = "Unknown";
  //     color = "neutral";
  //   }

  //   return (
  //     <Chip
  //       variant={variant}
  //       color={color}
  //       size="md"
  //     >
  //       {status}
  //     </Chip>
  //   );
  // };

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // console.log("User Loaded:", JSON.parse(storedUser));
    }
  }, []);

  const sourceOptions = {
    "Referred by": ["Directors", "Clients", "Team members", "E-mail"],
    "Social Media": ["Whatsapp", "Instagram", "LinkedIn"],
    Marketing: ["Youtube", "Advertisements"],
    "IVR/My Operator": [],
    Others: [],
  };
  const landTypes = ["Leased", "Owned"];

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = useCallback((lead) => {
    setSelectedLead(lead);
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setSelectedLead(null);
  }, []);

  // useEffect(() => {
  //   console.log("Raw Leads Data:", leads);
  // }, [leads]);

  // useEffect(() => {
  //   console.log("API Response:", getLead);
  // }, [getLead]);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateFilter}
          style={{ width: "200px" }}
        />
      </FormControl>
    </>
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all visible (paginated) leads
      const allIds = paginatedData.map((lead) => lead._id);
      setSelected(allIds);
    } else {
      // Unselect all
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const RowMenu = ({ currentPage, id }) => {
    // console.log(currentPage, id);
    return (
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
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("edit_initial", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/edit_initial?page=${page}&id=${leadId}`);
            }}
          >
            <ContentPasteGoIcon />
            <Typography>Edit Info</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              setOpen(true);
              localStorage.setItem("stage_next", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/initial_to_all?page=${page}&${leadId}`);
            }}
          >
            <NextPlanIcon />
            <Typography>Next Stage</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("view_initial_history", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/initial_records?page=${page}&${leadId}`);
            }}
          >
            <ManageHistoryIcon />
            <Typography>View History</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("add_task_initial", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/add_task_initial?page=${page}&${leadId}`);
            }}
          >
            <AddCircleOutlineIcon />
            <Typography>Add Task</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("view_initial", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/initial_Summary?page=${page}&id=${leadId}`);
            }}
          >
            <RemoveRedEyeIcon />
            <Typography>Initial Summary</Typography>
          </MenuItem>
          {/* <Divider sx={{ backgroundColor: "lightblue" }} />
          <MenuItem color="danger">
            <DeleteIcon />
            <Typography>Delete</Typography>
          </MenuItem> */}
        </Menu>
      </Dropdown>
    );
  };

  // const cacheKey = `leadsPage-${currentPage}`;

  // useEffect(() => {
  //   const cachedData = sessionStorage.getItem(cacheKey);
  //   if (cachedData) {
  //     setPaginatedData(JSON.parse(cachedData)); // Load cached data
  //   }
  // }, [cacheKey]);

  const formatDate = (date) => {
    if (!date) return new Date();
    const [day, month, year] = date.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleDateFilter = (e) => {
    setSelectedDate(e.target.value);
  };

  const filteredData = useMemo(() => {
    if (!user || !user.name) return [];

    return leads
      .filter((lead) => {
        const submittedBy = lead.submitted_by?.trim() || "unassigned";
        const userName = user.name.trim();
        const userRole = user.role?.toLowerCase();

        const isAdmin = userRole === "admin" || userRole === "superadmin";
        const matchesUser = isAdmin || submittedBy === userName;

        const matchesQuery = ["id", "c_name", "mobile", "state","submitted_by"].some(
          (key) => lead[key]?.toLowerCase().includes(searchQuery)
        );

        const matchesDate = selectedDate
          ? formatDate(lead.entry_date).toLocaleDateString() === formatDate(selectedDate).toLocaleDateString()
          : true;

        return matchesUser && matchesQuery && matchesDate;
      })
      .sort((a, b) => {
        const dateA = formatDate(a.entry_date);
        const dateB = formatDate(b.entry_date);

        if (!dateA.id) return 1;
        if (!dateB.id) return -1;

        return dateB - dateA;
      });
  }, [leads, searchQuery, selectedDate, user]);

  // const filteredData = useMemo(() => {
  //   return leads
  //     .filter((lead) => {
  //       // const status = getLeadStatus(lead); // Now status is a string ✅
  //       const matchesQuery = ["id", "c_name", "mobile", "state", "status"].some(
  //         (key) => lead[key]?.toLowerCase().includes(searchQuery.toLowerCase())
  //       );
  //       // const matchesStatus = status
  //       //   .toLowerCase()
  //       //   .includes(searchQuery.toLowerCase()); // No error ✅

  //       const matchesDate = selectedDate
  //         ? formatDate(lead.entry_date) === selectedDate
  //         : true;

  //       return matchesQuery && matchesDate;
  //     })
  //     .sort((a, b) => {
  //       const dateA = new Date(formatDate(a.entry_date));
  //       const dateB = new Date(formatDate(b.entry_date));

  //       if (isNaN(dateA.getTime())) return 1;
  //       if (isNaN(dateB.getTime())) return -1;

  //       return dateB - dateA;
  //     });
  // }, [leads, searchQuery, selectedDate]);

  // const getPaginatedData = (page) => {
  //   const startIndex = (page - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;
  //   return filteredData.slice(startIndex, endIndex);
  // };

  // const paginatedData = useMemo(() => getPaginatedData(currentPage), [filteredData, currentPage]);

  // Cache data in localStorage
  // const cacheData = (data) => {
  //   localStorage.setItem("paginatedData", JSON.stringify(data));
  // };

  // Update filterData and paginatedData
  // useEffect(() => {
  //   const data = filterData;
  //   setFilteredData(data);

  //   // Cache filtered data in localStorage for future use
  //   cacheData(data);
  // }, [filterData]);

  // useEffect(() => {
  //   const cached = localStorage.getItem("paginatedData");
  //   if (cached) {
  //     setCachedData(JSON.parse(cached));
  //   }
  // }, []);

  // Paginated data based on currentPage and filtered data
  // const paginatedData = useMemo(() => {
  //   return getPaginatedData(currentPage);
  // }, [filteredData, currentPage]);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    const page = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(page);
    setSearchParams({ page });
  };

  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) pages.push(1);
    if (currentPage > 3) pages.push("...");

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    if (currentPage < totalPages - 1) pages.push(totalPages);

    return pages;
  };

  // useEffect(() => {
  //   console.log("Filtered Data:", filteredData);
  // }, [filteredData]);

  useImperativeHandle(ref, () => ({
    exportToCSV() {
      console.log("Exporting data to CSV...");

      const headers = [
        "Lead Id",
        "Customer",
        "Mobile",
        "State",
        "Scheme",
        "Capacity",
        "Substation Distance",
        "Creation Date",
        "Lead Status",
        "Submitted_ By",
      ];

      // If selected list has items, use it. Otherwise export all.
      const exportLeads =
        selected.length > 0
          ? leads.filter((lead) => selected.includes(lead._id))
          : leads;

      if (exportLeads.length === 0) {
        toast.warning("No leads available to export.");
        return;
      }

      const rows = exportLeads.map((lead) => [
        lead.id,
        lead.c_name,
        lead.mobile,
        lead.state,
        lead.scheme,
        lead.capacity || "-",
        lead.distance || "-",
        lead.entry_date || "-",
        lead.status || "",
        lead.submitted_by || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        selected.length > 0 ? "Selected_Leads.csv" : "Overall_Leads.csv";
      link.click();
    },
  }));

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
            startDecorator={<SearchIcon />}
            type="text"
            placeholder="Search by ID, Name, Lead Status, State, Mobile..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </FormControl>
        {renderFilters()}
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
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        {isLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Player
              autoplay
              loop
              src={animationData}
              style={{ height: 100, width: 100 }}
            />
          </Box>
        ) : error ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              // color: "red",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <PermScanWifiIcon style={{color:"red", fontSize:"2rem"}} />
            <Typography
              fontStyle={"italic"}
              fontWeight={"600"}
              sx={{ color: "#0a6bcc" }}
            >
              Hang tight! Internet Connection will be back soon..
            </Typography>
          </span>
        ) : (
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    size="sm"
                    checked={
                      selected.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paginatedData.length
                    }
                    onChange={handleSelectAll}
                  />
                </Box>
                {[
                  "Lead Id",
                  "Customer",
                  "Mobile",
                  "State",
                  "Scheme",
                  "Capacity",
                  "Substation Distance",
                  "Creation Date",
                  "Submitted By",
                  "Lead Status",
                  // "Action",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box component="tbody">
              {paginatedData.length > 0 ? (
                paginatedData.map((lead, index) => (
                  <Box
                    component="tr"
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        color="primary"
                        checked={selected.includes(lead._id)}
                        onChange={() => handleRowSelect(lead._id)}
                      />
                    </Box>

                    {[
                      <span
                        key={lead.id}
                        onClick={() => handleOpenModal(lead)}
                        style={{
                          cursor: "pointer",
                          color: "black",
                          textDecoration: "none", // Removes underline
                          // fontWeight: "bold", // Makes text bold
                          // textTransform: "uppercase", // Transforms text to uppercase
                        }}
                      >
                        {lead.id}
                      </span>,
                      lead.c_name,
                      lead.mobile,
                      // `${lead.village}, ${lead.district}, ${lead.state}`,
                      lead.state,
                      lead.scheme,
                      lead.capacity || "-",
                      lead.distance || "-",
                      lead.entry_date || "-",
                      lead.submitted_by || "-",
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          lead.status === "Initial"
                            ? "primary"
                            : lead.status === "Followup"
                              ? "info"
                              : lead.status === "Warm"
                                ? "warning"
                                : lead.status === "Won"
                                  ? "success"
                                  : lead.status === "Dead"
                                    ? "danger"
                                    : "neutral"
                        }
                      >
                        {lead.status}
                      </Chip>,
                    ].map((data, idx) => (
                      <Box
                        component="td"
                        key={idx}
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {data}
                      </Box>
                    ))}

                    {/* Actions */}
                    {/* <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <RowMenu currentPage={currentPage} id={lead.id} />
                    </Box> */}
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={11}
                    sx={{
                      padding: "8px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
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
                      <img
                        src={NoData}
                        alt="No data"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <Typography fontStyle={"italic"}>
                        No Overall Leads available
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
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
          marginLeft: { xl: "15%", lg: "18%" },
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
          Showing {paginatedData.length} of {filteredData.length} results
        </Box>
        {/* <Typography>
          Page {currentPage} of {totalPages || 1}
        </Typography> */}
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

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.surface",
            borderRadius: "md",
            maxWidth: 600,
            mx: "auto",
            mt: 10,
          }}
        >
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="name"
                value={selectedLead?.c_name ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="company"
                value={selectedLead?.company ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Group Name</FormLabel>
              <Input
                name="group"
                value={selectedLead?.group ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Source</FormLabel>
              <Select
                name="source"
                value={selectedLead?.source ?? ""}
                onChange={(e, newValue) =>
                  setSelectedLead({
                    ...selectedLead,
                    source: newValue,
                    reffered_by: "",
                  })
                }
                fullWidth
              >
                {Object.keys(sourceOptions).map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
            {selectedLead?.source &&
              sourceOptions[selectedLead.source]?.length > 0 && (
                <Grid xs={12} sm={6}>
                  <FormLabel>Sub Source</FormLabel>
                  <Select
                    name="reffered_by"
                    value={selectedLead?.reffered_by ?? ""}
                    readOnly
                    fullWidth
                  >
                    {sourceOptions[selectedLead.source].map((option) => (
                      <Option key={option} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                </Grid>
              )}
            <Grid xs={12} sm={6}>
              <FormLabel>Email ID</FormLabel>
              <Input
                name="email"
                type="email"
                value={selectedLead?.email ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Mobile Number</FormLabel>
              <Input
                name="mobile"
                type="tel"
                value={selectedLead?.mobile ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={`${selectedLead?.village ?? ""}, ${selectedLead?.district ?? ""}, ${selectedLead?.state ?? ""}`}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Capacity</FormLabel>
              <Input
                name="capacity"
                value={selectedLead?.capacity ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Sub Station Distance (KM)</FormLabel>
              <Input
                name="distance"
                value={selectedLead?.distance ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Tariff (Per Unit)</FormLabel>
              <Input
                name="tarrif"
                value={selectedLead?.tarrif ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Available Land (acres)</FormLabel>
              <Input
                name="available_land"
                value={selectedLead?.land?.available_land ?? ""}
                type="text"
                fullWidth
                variant="soft"
                readOnly
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Creation Date</FormLabel>
              <Input
                name="entry_date"
                type="date"
                value={selectedLead?.entry_date ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Scheme</FormLabel>
              <Select name="scheme" value={selectedLead?.scheme ?? ""} readOnly>
                {["KUSUM A", "KUSUM C", "KUSUM C2", "Other"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Land Types</FormLabel>
              <Autocomplete
                options={landTypes}
                value={selectedLead?.land?.land_type ?? null}
                readOnly
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <Input
                    {...params}
                    placeholder="Land Type"
                    variant="soft"
                    required
                  />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid xs={12}>
              <FormLabel>Comments</FormLabel>
              <Input
                name="comment"
                value={selectedLead?.comment ?? ""}
                multiline
                rows={4}
                readOnly
                fullWidth
              />
            </Grid>
          </Grid>
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Button onClick={handleCloseModal}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
});
export default Overall_Leads;
