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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/Lotties/animation-loading.json";
// import Axios from "../utils/Axios";
import { Autocomplete, Divider, Grid, Modal, Option, Select } from "@mui/joy";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import NoData from "../../assets/alert-bell.svg";
import { useGetInitialLeadsQuery } from "../../redux/leadsSlice";
import { toast } from "react-toastify";
import { useGetHTPanelsQuery } from "../../redux/Eng/htsSlice";

const HTPanelTab = forwardRef((props, ref) => {
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

  const { data: getLead = [], isLoading, error } = useGetHTPanelsQuery();
  const leads = useMemo(() => getLead?.data ?? [], [getLead?.data ?? ""]);

  console.log(leads);
  

  // const LeadStatus = ({ lead }) => {
  //   const { loi, ppa, loa, other_remarks, token_money } = lead;

  //   // Determine the initial status
  //   const isInitialStatus =
  //     (!loi || loi === "No") &&
  //     (!ppa || ppa === "No") &&
  //     (!loa || loa === "No") &&
  //     (!other_remarks || other_remarks === "") &&
  //     (!token_money || token_money === "No");

  //   return (
  //     <Chip color="neutral" variant="soft" sx={{ backgroundColor: "#BBDEFB", color: "#000" }}>
  //     Initial
  //   </Chip>
  //   );
  // };

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // console.log("User Loaded:", JSON.parse(storedUser));
    }
  }, []);

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
      {/* <FormControl size="sm">
        <FormLabel>Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          onChange={handleDateFilter}
          style={{ width: "200px" }}
        />
      </FormControl> */}
      <Box
  sx={{
    display: "flex",
    alignItems: "flex-end", // Aligns items to the bottom
    gap: 2, // Adds spacing between dropdown and button
  }}
>
  <FormControl size="sm">
    <FormLabel>Status Filter</FormLabel>
    <Select size="sm" placeholder="Select status">
      <Option value="">All</Option>
      <Option value="Available">Available</Option>
      <Option value="Not Available">Not Available</Option>
    </Select>
  </FormControl>

  <Button
    color="primary"
    size="sm"
    onClick={() => navigate("/add_ht_panel")}
    sx={{ mb: '2px' }} // optional fine-tuning to align perfectly
  >
    Add New HT Panel +
  </Button>
</Box>
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
              // localStorage.setItem("edit_initial", leadId);
              // localStorage.setItem("p_id", projectID);
              // navigate(`/edit_initial?page=${page}&id=${leadId}`);
              navigate("#");
            }}
          >
            {/* <ContentPasteGoIcon /> */}
            <RemoveRedEyeIcon />
            <Typography>View Details</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              setOpen(true);
              // localStorage.setItem("stage_next", leadId);
              // localStorage.setItem("p_id", projectID);
              // navigate(`/initial_to_all?page=${page}&${leadId}`);
              navigate("#");
            }}
          >
            {/* <NextPlanIcon /> */}
            <EditRoundedIcon />
            <Typography>Edit Details</Typography>
          </MenuItem>
          {/* <MenuItem
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
          </MenuItem> */}
          {/* <MenuItem
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
          </MenuItem> */}
          {/* <MenuItem
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
          </MenuItem> */}
          <Divider sx={{ backgroundColor: "lightblue" }} />
          <MenuItem color="danger">
            <DeleteIcon />
            <Typography>Delete</Typography>
          </MenuItem>
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
    return leads
      .filter((lead) => {
        const matchesQuery = ["make", "status"].some((key) =>
          lead[key]?.toLowerCase().includes(searchQuery.toLowerCase())
        );
  
        return matchesQuery;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
  }, [leads, searchQuery]);

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

      const headers = ["Make", "VCB Make", "VCB Rating", "CT Make", "PT Make","Status",];

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
        lead.make || "-",
        lead.vcb_make || "-",
        lead.vcb_rating || "-",
        lead.ct_make || "-",
        lead.pt_make || "-",
        lead.status || "-",
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
        selected.length > 0 ? "Selected_HT Panel.csv" : "All_HT Panel.csv";
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
            <PermScanWifiIcon style={{ color: "red", fontSize: "2rem" }} />
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
                {["Make", "VCB Make", "VCB Rating", "CT Make", "PT Make","Status", "Action"].map(
                  (header, index) => (
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
                  )
                )}
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
                          textDecoration: "none",
                        }}
                      >
                        {lead.make}
                        
                      </span>,
                       lead.vcb_make || "-",
                       lead.vcb_rating || "-",
                       lead.ct_make || "-",
                       lead.pt_make || "-",
                       lead.status || "-",
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
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <RowMenu currentPage={currentPage} id={lead.id} />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={6}
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
                        No HT Panel available
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
              <FormLabel>Make</FormLabel>
              <Input
                name="make"
                value={selectedLead?.make ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
          
            <Grid xs={12} sm={6}>
              <FormLabel>VCB Make</FormLabel>
              <Input
                name="type"
                value={selectedLead?.vcb_make ?? ""}
                readOnly
                fullWidth
              />
            </Grid> 
             <Grid xs={12} sm={6}>
              <FormLabel>PT Ratio</FormLabel>
              <Input
                name="size"
                value={selectedLead?.pt_ratio ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>VCB Rating</FormLabel>
              <Input
                name="size"
                value={selectedLead?.vcb_rating ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>CT Make</FormLabel>
              <Input
                name="size"
                value={selectedLead?.ct_make ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>CT Ratio</FormLabel>
              <Input
                name="size"
                value={selectedLead?.ct_ratio ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>Cable Size Incoming (Sqmm)</FormLabel>
              <Input
                name="size"
                value={selectedLead?.cabel_size_incoming ?? ""}
                readOnly
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel>PT Make</FormLabel>
              <Input
                name="size"
                value={selectedLead?.pt_make ?? ""}
                readOnly
                fullWidth
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <FormLabel>Status</FormLabel>
              <Input
                name="status"
                value={selectedLead?.status ?? ""}
                readOnly
                fullWidth
              />
            </Grid>

            {/* <Grid xs={12} sm={6}>
              <FormLabel>Status</FormLabel>
              <Select name="scheme" value={selectedModule?.scheme ?? ""} readOnly>
                {["KUSUM A", "KUSUM C", "KUSUM C2", "Other"].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </Grid> */}
            

          </Grid>
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Button onClick={handleCloseModal}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
});
export default HTPanelTab;
