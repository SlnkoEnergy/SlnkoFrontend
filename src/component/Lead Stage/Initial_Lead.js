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
import { Autocomplete, Grid, Modal, Option, Select } from "@mui/joy";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import { useGetInitialLeadsQuery } from "../../redux/leadsSlice";

const StandByRequest = forwardRef((props, ref) => {
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


  const { data: getLead = [], isLoading, error } = useGetInitialLeadsQuery();
  const leads = useMemo(() => getLead?.data ?? [], [getLead?.data]);



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

   const toDMY = (isoDateStr) => {
    if (!isoDateStr) return "";
    const [year, month, day] = isoDateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleDateFilter = (e) => {
    setSelectedDate(e.target.value);
  }; 

const filteredData = useMemo(() => {
  if (!user || !user.name) return [];

  const userName = user.name.trim();
  const userRole = user.department?.trim();
  const isAdmin = userRole === "admin" || userRole === "superadmin"|| userName === "Shiv Ram Tathagat" || userName === "Deepak Manodi";;

  // State-based user access
   const stateUserMap = {
    "Uttar Pradesh": ["Geeta", "Shambhavi Gupta", "Vibhav Upadhyay", "Navin Kumar Gautam"],
    "Rajasthan": ["Shantanu Sameer", "Vibhav Upadhyay", "Navin Kumar Gautam"],
    "Madhya Pradesh": ["Ketan Kumar Jha"],
  };

  return leads
    .filter((lead) => {
      const leadState = lead.state?.trim() || "";
      const submittedBy = lead.submitted_by?.trim() || "";

      // ✅ Allow if user is admin
      if (isAdmin) return true;

      // ✅ Allow if user is in the list for that state
      const allowedUsers = stateUserMap[leadState] || [];
      const isAllowedForState = allowedUsers.includes(userName);

      // ✅ Allow if user submitted this lead
      const isSubmittedByUser = submittedBy === userName;

      return isAllowedForState || isSubmittedByUser;
    })
    .filter((lead) => {
      // Apply search and date filters after role filtering
      const matchesQuery = [
          "id",
          "c_name",
          "mobile",
          "state",
          "submitted_by",
        ].some((key) =>
          lead[key]
            ?.toString()
            .toLowerCase()
            .trim()
            .includes(searchQuery.trim().toLowerCase())
        );

      const matchesDate = selectedDate
          ? lead.entry_date === toDMY(selectedDate)
          : true;

      return matchesQuery && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(formatDate(a.entry_date));
      const dateB = new Date(formatDate(b.entry_date));
      return dateB - dateA;
    });
}, [leads, searchQuery, selectedDate, user]);




  // const filteredData = useMemo(() => {
  //   if (!user || !user.name) return [];

  //   return leads
  //     .filter((lead) => {
  //       const submittedBy = lead.submitted_by?.trim() || "";
  //       const userName = user.name.trim();
  //       const userRole = user.role?.toLowerCase();

  //       const isAdmin = userRole === "admin" || userRole === "superadmin";
  //       const matchesUser = isAdmin || submittedBy === userName;

  //       const matchesQuery = [
  //         "id",
  //         "c_name",
  //         "mobile",
  //         "state",
  //         "submitted_by",
  //       ].some((key) => lead[key]?.toLowerCase().includes(searchQuery));

  //       const matchesDate = selectedDate
  //         ? formatDate(lead.entry_date).toLocaleDateString() ===
  //           formatDate(selectedDate).toLocaleDateString()
  //         : true;

  //       return matchesUser && matchesQuery && matchesDate;
  //     })
  //     .sort((a, b) => {
  //       const dateA = formatDate(a.entry_date);
  //       const dateB = formatDate(b.entry_date);

  //       if (!dateA.id) return 1;
  //       if (!dateB.id) return -1;

  //       return dateB - dateA;
  //     });
  // }, [leads, searchQuery, selectedDate, user]);

  // const filteredData = useMemo(() => {
  //   return leads
  //     .filter((lead) => {
  //       const matchesQuery = ["id", "c_name", "mobile", "state"].some((key) =>
  //         lead[key]?.toLowerCase().includes(searchQuery)
  //       );
  //       const matchesDate = selectedDate
  //         ? formatDate(lead.entry_date) === selectedDate
  //         : true;
  //       return matchesQuery && matchesDate;
  //     })
  //     .sort((a, b) => {
  //       const dateA = formatDate(a.entry_date);
  //       const dateB = formatDate(b.entry_date);

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
        selected.length > 0 ? "Selected_Leads.csv" : "Initial_Leads.csv";
      link.click();
    },
  }));

  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

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
            placeholder="Search by ID, Name, State, Mobile..."
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
          display: "flex",
          flexDirection: "column",
          width: "100%",
          borderRadius: "sm",
          overflow: "auto",
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          minHeight: { xs: "fit-content", lg: "0%" },
        }}
      >
        {/* Loading Spinner */}
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
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="20px"
          >
            <PermScanWifiIcon style={{ color: "red", fontSize: "2rem" }} />
            <Typography
              fontStyle={"italic"}
              fontWeight={"600"}
              sx={{ color: "#0a6bcc" }}
            >
              Hang tight! Internet Connection will be back soon..
            </Typography>
          </Box>
        ) : paginatedData.length === 0 ? (
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
              No Initial Leads available
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop View - Single Table with Header and Body */}
            <Box
              component="table"
              sx={{
                display: { xs: "none", md: "table" },
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "neutral.softBg",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: 8,
                      textAlign: "center",
                      borderBottom: "1px solid #ccc",
                    }}
                  ></th>
                  {[
                    "Lead Id",
                    "Customer",
                    "Mobile",
                    "State",
                    "Scheme",
                    "Capacity(MW)",
                    "Distance(KM)",
                    "Date",
                    "Submitted By",
                    "Action",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: 8,
                        textAlign: "center",
                        fontWeight: "bold",
                        borderBottom: "1px solid #ccc",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor: "#fff",
                }}
              >
                {paginatedData.map((lead) => (
                  <tr
                    key={lead._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F4F9FF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <Checkbox
                        size="sm"
                        color="primary"
                        checked={selected.includes(lead._id)}
                        onChange={() => handleRowSelect(lead._id)}
                      />
                    </td>
                    {[
                      <span
                        key="id"
                        onClick={() => handleOpenModal(lead)}
                        style={{ cursor: "pointer" }}
                      >
                        {lead.id}
                      </span>,
                      lead.c_name,
                      lead.mobile,
                      lead.state,
                      lead.scheme,
                      lead.capacity || "-",
                      lead.distance || "-",
                      lead.entry_date || "-",
                      lead.submitted_by || "-",
                      <RowMenu currentPage={currentPage} id={lead.id} />,
                    ].map((data, idx) => (
                      <td key={idx} style={{ padding: 8, textAlign: "center" }}>
                        {data}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Box>

            {/* Mobile View - Card Style */}
            {paginatedData.map((lead) => {
              const isExpanded = expandedRows.includes(lead._id);
              return (
                <Box
                  key={lead._id}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    flexDirection: "column",
                    borderBottom: "1px solid #ddd",
                    p: 1,
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      level="body1"
                      fontWeight="lg"
                      onClick={() => handleOpenModal(lead)}
                      style={{ cursor: "pointer" }}
                    >
                      {lead.c_name}
                    </Typography>

                    <RowMenu currentPage={currentPage} id={lead.id} />
                  </Box>

                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => toggleRow(lead._id)}
                    sx={{ mt: 1, width: "fit-content" }}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </Button>

                  {isExpanded && (
                    <Box sx={{ mt: 1, pl: 1 }}>
                      {[
                        { label: "Lead ID", value: lead.id },
                        { label: "Mobile", value: lead.mobile },
                        { label: "State", value: lead.state },
                        { label: "Scheme", value: lead.scheme },
                        { label: "Capacity (MW)", value: lead.capacity || "-" },
                        { label: "Distance (KM)", value: lead.distance || "-" },
                        { label: "Date", value: lead.entry_date || "-" },
                        {
                          label: "Submitted By",
                          value: lead.submitted_by || "-",
                        },
                      ].map((item, idx) => (
                        <Typography key={idx} level="body2">
                          <strong>{item.label}:</strong> {item.value}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </>
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
                readOnly
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Creation Date</FormLabel>
              <Input
                name="entry_date"
                type="text"
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
                  <Input {...params} placeholder="Land Type" required />
                )}
                isOptionEqualToValue={(option, value) => option === value}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
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
export default StandByRequest;
