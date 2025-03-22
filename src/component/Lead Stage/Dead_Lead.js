import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DeleteIcon from "@mui/icons-material/Delete";
import { Player } from "@lottiefiles/react-lottie-player";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import StarsIcon from "@mui/icons-material/Stars";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
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
import FollowTheSignsIcon from "@mui/icons-material/FollowTheSigns";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/Lotties/animation-loading.json";
import { motion } from "framer-motion";
import { CheckIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";


// import Axios from "../utils/Axios";
import {
  useAddDeadtoFollowupMutation,
  useAddDeadtoInitialMutation,
  useAddDeadtoWarmupMutation,
  useGetDeadLeadsQuery,
} from "../../redux/leadsSlice";
import NoData from "../../assets/alert-bell.svg";
import { Chip } from "@mui/joy";
import { useSnackbar } from "notistack";

const StandByRequest = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [mergedData, setMergedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: getLead = [], isLoading, error } = useGetDeadLeadsQuery();
  const leads = useMemo(() => getLead?.data ?? [], [getLead?.data]);

    const [DeadToFollowup] = useAddDeadtoFollowupMutation();
    const [DeadToWarmup] = useAddDeadtoWarmupMutation();
    const [DeadToInitial] = useAddDeadtoInitialMutation();

  // console.log(leads);
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    const LeadId = localStorage.getItem("stage_next3"); // Retrieve LeadId from localStorage
  
    if (!LeadId) {
      enqueueSnackbar("No valid Lead ID available.", { variant: "error" });
      return;
    }
  
    console.log("LeadId:", LeadId);
  
    try {
      setIsSubmitting(true);
  
      // Fetch lead data (assuming leads is available in context/state)
      const deadData = leads.find((lead) => lead.id === LeadId);
  
      if (!deadData) {
        enqueueSnackbar("Lead data not found!", { variant: "error" });
        return;
      }
  
      let postResponse;
  
      // **Move to DeadToFollowup**
      if (deadData.loi === "Yes" && deadData.loa !== "Yes" && deadData.ppa !== "Yes") {
        console.log("Moving to DeadToFollowup");
        postResponse = await DeadToFollowup({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Followup!", { variant: "success" });
      }
      // **Move to DeadToWarmup**
      else if (deadData.loa === "Yes" || deadData.ppa === "Yes") {
        console.log("Moving to DeadToWarmup");
        postResponse = await DeadToWarmup({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Warm!", { variant: "success" });
      }
     
      else if (!(deadData.loi === "Yes" && deadData.ppa === "Yes" && deadData.loa === "Yes")) {
        console.log("Moving to DeadToInitial");
        postResponse = await DeadToInitial({ id: LeadId }).unwrap();
        enqueueSnackbar("Lead moved from Dead to Initial!", { variant: "success" });
      } 
      else {
        enqueueSnackbar("Invalid selection. Cannot move lead.", { variant: "error" });
        setIsSubmitting(false);
        return;
      }
  
      // Navigate after success
      if (postResponse) {
        setTimeout(() => {
          navigate("/leads");
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing request:", error);
      enqueueSnackbar(error?.data?.message || "Error processing request", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const RevivedMenu = ({ id }) => {
    const [revived, setRevived] = useState(false);
  
    const handleRevivedClick = () => {
      const leadId = String(id);
      localStorage.setItem("stage_next3", leadId);
  
      setTimeout(() => {
        handleSubmit();
        setRevived(true);
      }, 300);
    };
  
    return (
      <motion.button
      onClick={handleRevivedClick}
      style={{
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#fff",
        borderRadius: "999px",
        background: revived ? "#22c55e" : "lightblue",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "none",
        cursor: "pointer",
        outline: "none",
        transition: "all 0.3s ease-in-out",
      }}
      whileHover={{
        background: "linear-gradient(to right, #6366f1, #9333ea)",
        scale: 1.1,
        boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.8)",
      }}
      whileTap={{ scale: 0.9 }}
    >
        Revived 🎉
      </motion.button>
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
          {/* <MenuItem
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
          </MenuItem> */}
          {/* <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              setOpen(true);
              localStorage.setItem("stage_next3", leadId);
              // localStorage.setItem("p_id", projectID);
              // navigate(`/dead_to_initial?page=${page}&${leadId}`);
            }}
          >
               <StarsIcon />
               <Button onClick={() => setTimeout(handleSubmit, 100)}>Revived Lead</Button>
           
          </MenuItem> */}
          {/* <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("followup_history", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/standby_Request?page=${page}&${leadId}`);
            }}
          >
            <ManageHistoryIcon />
            <Typography>Followup History</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId1 = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("next_followup", leadId1);
              // localStorage.setItem("p_id", projectID);
              navigate(`/standby_Request?page=${page}&${leadId1}`);
            }}
          >
            <FollowTheSignsIcon />
            <Typography>Next Followup</Typography>
          </MenuItem> */}
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(id);
              // const projectID = Number(p_id);
              localStorage.setItem("view_dead", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/dead_Summary?page=${page}&id=${leadId}`);
            }}
          >
            <RemoveRedEyeIcon />
            <Typography>View Summary</Typography>
          </MenuItem>
          <Divider sx={{ backgroundColor: "lightblue" }} />
          <MenuItem color="danger">
            <DeleteIcon />
            <Typography>Delete</Typography>
          </MenuItem>
        </Menu>
      </Dropdown>
    );
  };

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
      setSelected(paginatedData.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (id, isSelected) => {
    // console.log("currentPage:", currentPage, "pay_id:", pay_id, "p_id:", p_id);
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
  };



  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
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
        const matchesQuery = ["id", "c_name", "mobile", "state"].some((key) =>
          lead[key]?.toLowerCase().includes(searchQuery)
        );
        const matchesDate = selectedDate
          ? formatDate(lead.entry_date) === selectedDate
          : true;
        return matchesQuery && matchesDate;
      })
      .sort((a, b) => {
        if (!a.id) return 1;
        if (!b.id) return -1;
        return String(b.id).localeCompare(String(a.id));
      });
  }, [leads, searchQuery, selectedDate]);

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
              color: "red",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <PermScanWifiIcon />
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
                    checked={selected.length === getLead.length}
                    onChange={handleSelectAll}
                    indeterminate={
                      selected.length > 0 && selected.length < getLead.length
                    }
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
                  "Revive Lead",
                  "Action",
                  
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
                    {/* Checkbox Column */}
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

                    {/* Data Columns */}
                    {[
                      lead.id,
                      lead.c_name,
                      lead.mobile,
                      lead.state,
                      lead.scheme,
                      lead.capacity || "-",
                      lead.distance || "-",
                      lead.entry_date || "-",
                      
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

                    {/* Actions Column */}
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <RevivedMenu currentPage={currentPage} id={lead.id} />
                    </Box>
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
                    colSpan={10}
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
                        No Dead Leads available
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
    </>
  );
};
export default StandByRequest;
