import { Player } from "@lottiefiles/react-lottie-player";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
// import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
// import EditSquareIcon from '@mui/icons-material/EditSquare';

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/Lotties/animation-loading.json";
// import Axios from "../utils/Axios";
import FollowTheSignsIcon from "@mui/icons-material/FollowTheSigns";
import {
  Autocomplete,
  Chip,
  Divider,
  Grid,
  Modal,
  Option,
  Select,
  Stack,
  Tooltip,
} from "@mui/joy";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import NoData from "../../assets/alert-bell.svg";
import {
  useGetHandOverByIdQuery,
  useGetHandOverQuery,
} from "../../redux/camsSlice";
import { useGetWonLeadsQuery } from "../../redux/leadsSlice";

const StandByRequest = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [user, setUser] = useState(null);

  const { data: getLead = [], isLoading, error } = useGetWonLeadsQuery();
  const leads = useMemo(() => getLead?.data ?? [], [getLead?.data]);

  // console.log("Leads:", leads);

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

  const { data: getHandOverSheet = [] } = useGetHandOverByIdQuery();
  const HandOverSheet = useMemo(
    () => getHandOverSheet?.data ?? [],
    [getHandOverSheet]
  );

  console.log("HandOverSheet:", HandOverSheet);

  const status_handOver = (leadId) => {
    const matchedLead = leads?.find((lead) => lead.leadId === leadId);

    if (!matchedLead) {
      return {
        status: "Not Found",
        submittedBy: "Not Found",
        comment: "Not Found",
      };
    }

    return {
      status: matchedLead.status || "Not Found",
      submittedBy: matchedLead.submittedBy || "Not Found",
      comment: matchedLead.comment || "Not Found",
    };
  };

  const getStatusDetails = (leadId) => {
    const matchedLead = leads?.find((lead) => lead.leadId === leadId);
    return {
      status: matchedLead?.status || "Not Found",
      submittedBy: matchedLead?.submittedBy || "-",
      comment: matchedLead?.comment || "",
    };
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
      <FormControl size="sm">
        <FormLabel>Select Handover Status</FormLabel>
        <Select
          value={selectedStatus}
          onChange={(e, value) => setSelectedStatus(value)}
          placeholder="Choose status"
          style={{ width: "200px" }}
        >
          <Option value="">All</Option>
          <Option value="submitted">Submitted</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Rejected">Rejected</Option>
          <Option value="draft">In Process</Option>
          <Option value="not_found">Pending</Option>
        </Select>
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

  const RowMenu = ({ currentPage, id, _id, leadId }) => {
    // console.log(leadId);
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
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const ID = String(leadId);

              // const projectID = Number(p_id);
              setOpen(true);
              localStorage.setItem("stage_next3", ID);
              // localStorage.setItem("p_id", projectID);
              navigate(`/won_to_all?page=${page}&${ID}`);
            }}
          >
            <NextPlanIcon />
            <Typography>Next Stage</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const ID = String(leadId);
              // const projectID = Number(p_id);
              localStorage.setItem("view_won_history", ID);
              // localStorage.setItem("p_id", projectID);
              navigate(`/won_records?page=${page}&${ID}`);
            }}
          >
            <ManageHistoryIcon />
            <Typography>View History</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(leadId);
              // const projectID = Number(p_id);
              localStorage.setItem("add_task_won", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/add_task_won?page=${page}&${leadId}`);
            }}
          >
            <AddCircleOutlineIcon />
            <Typography>Add Task</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              // const leadId = leadId;
              // const projectID = Number(p_id);
              // localStorage.setItem("hand_Over", leadId1);
              // localStorage.setItem("p_id", projectID);
              navigate(`/hand_over?page=${page}&leadId=${leadId}`);
            }}
          >
            <FollowTheSignsIcon />
            <Typography>HandOver Sheet</Typography>
          </MenuItem>
          <MenuItem
            color="primary"
            onClick={() => {
              const page = currentPage;
              const leadId = String(leadId);
              // const projectID = Number(p_id);
              localStorage.setItem("view_won", leadId);
              // localStorage.setItem("p_id", projectID);
              navigate(`/won_Summary?page=${page}&id=${leadId}`);
            }}
          >
            <RemoveRedEyeIcon />
            <Typography>Won Summary</Typography>
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

  const ViewHandOver = ({ currentPage, leadId }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <IconButton
          color="primary"
          onClick={() => {
            // const ID = String(leadId);
            // localStorage.setItem("bd_handover", ID);
            navigate(`/bd_hand_over?page=${currentPage}&leadId=${leadId}`);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </>
    );
  };

  const EditHandOver = ({ currentPage, leadId }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <IconButton
          color="primary"
          onClick={() => {
            // localStorage.setItem("edit_won_handover", leadId);
            navigate(`/edit_won?page=${currentPage}&leadId=${leadId}`);
          }}
        >
          <EditNoteIcon />
        </IconButton>
      </>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [day, month, year] = dateString.split("-");
    const isoString = `${year}-${month}-${day}`;

    const date = new Date(isoString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
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
    const isAdmin =
      userRole === "admin" ||
      userRole === "superadmin" ||
      userName === "Shiv Ram Tathagat" ||
      userName === "Deepak Manodi" ||
      userName === "Prachi Singh" ||
      userName === "Guddu Rani Dubey";

    const stateUserMap = {
      "Uttar Pradesh": [
        "Geeta",
        "Shambhavi Gupta",
        "Vibhav Upadhyay",
        "Navin Kumar Gautam",
      ],
      Rajasthan: ["Shantanu Sameer", "Vibhav Upadhyay", "Navin Kumar Gautam"],
      "Madhya Pradesh": ["Ketan Kumar Jha"],
    };

    return leads
      .filter((lead) => {
        const leadState = lead.state?.trim() || "";
        const submittedBy = lead.submitted_by?.trim() || "";

        if (isAdmin) return true;

        const allowedUsers = stateUserMap[leadState] || [];
        const isAllowedForState = allowedUsers.includes(userName);
        const isSubmittedByUser = submittedBy === userName;

        return isAllowedForState || isSubmittedByUser;
      })
      .filter((lead) => {
        // Search & date filters
        const matchesQuery = [
          "id",
          "customer",
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
      .filter((lead) => {
        // Handover Status filter
        const { status } = status_handOver(lead.id);
        const normalizedStatus = status === "Not Found" ? "not_found" : status;

        return selectedStatus ? normalizedStatus === selectedStatus : true;
      })
      .sort((a, b) => {
        const dateA = new Date(formatDate(a.entry_date));
        const dateB = new Date(formatDate(b.entry_date));
        return dateB - dateA;
      });
  }, [leads, searchQuery, selectedDate, selectedStatus, user]);

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
        selected.length > 0 ? "Selected_Leads.csv" : "Won_Leads.csv";
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
            <Typography fontStyle={"italic"}>No Won Leads available</Typography>
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
                      textAlign: "left",
                      borderBottom: "1px solid #ccc",
                    }}
                  ></th>
                  {[
                    "",
                    "",
                    "Lead Id",
                    "Customer",
                    "Mobile",
                    "State",
                    "Scheme",
                    "Capacity(MW)",
                    "Substation Distance(KM)",
                    "Date",
                    "HandOver Status",
                    // "comment",
                    "HandOver submission",
                    "Action",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: 8,
                        textAlign: "left",
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
                {paginatedData.map((lead) => {
                  const statusInfo = getStatusDetails(lead.leadId);
                  return (
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
                      <td style={{ textAlign: "left", padding: 8 }}>
                        <Checkbox
                          size="sm"
                          color="primary"
                          checked={selected.includes(lead._id)}
                          onChange={() => handleRowSelect(lead._id)}
                        />
                      </td>

                      {[
                        <ViewHandOver currentPage={currentPage} leadId={lead.leadId} />,
                        <EditHandOver currentPage={currentPage} leadId={lead.leadId} />,
                        <span
                          key="id"
                          onClick={() => handleOpenModal(lead)}
                          style={{ cursor: "pointer" }}
                        >
                          {lead.leadId}
                        </span>,
                        lead.customer,
                        lead.mobile,
                        lead.state,
                        lead.scheme,
                        lead.capacity || "-",
                        lead.substationDistance || "-",
                        lead.date || "-",

                        <Chip
                          variant="soft"
                          color={
                            statusInfo.status === "submitted" ||
                            statusInfo.status === "Approved"
                              ? "success"
                              : statusInfo.status === "Rejected"
                                ? "danger"
                                : statusInfo.status === "draft"
                                  ? "warning"
                                  : "neutral"
                          }
                          size="sm"
                          endDecorator={
                            statusInfo.status === "Rejected" &&
                            statusInfo.comment ? (
                              <Tooltip title={statusInfo.comment}>
                                <InfoOutlined fontSize="small" />
                              </Tooltip>
                            ) : null
                          }
                        >
                          {statusInfo.status === "submitted" ||
                          statusInfo.status === "Approved"
                            ? "Submitted"
                            : statusInfo.status === "Rejected"
                              ? "Rejected"
                              : statusInfo.status === "draft"
                                ? "In Process"
                                : "Pending"}
                        </Chip>,

                        statusInfo.submittedBy || "-",
                        <RowMenu
                          currentPage={currentPage}
                          leadId={lead.leadId}
                          _id={lead._id}
                        />,
                      ].map((data, idx) => (
                        <td key={idx} style={{ padding: 8, textAlign: "left" }}>
                          {data}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </Box>

            {/* Mobile View - Card Style */}
            {paginatedData.map((lead) => {
              const isExpanded = expandedRows.includes(lead._id);
              const statusInfo = getStatusDetails(lead.leadId);
              return (
                <Box
                  key={lead._id}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    flexDirection: "column",
                    borderBottom: "1px solid #ddd",
                    p: 2,
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  {/* Header Section */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      level="body1"
                      fontWeight="lg"
                      onClick={() => handleOpenModal(lead)}
                      sx={{ cursor: "pointer", flex: 1 }}
                    >
                      {lead.customer}
                    </Typography>
                    <Chip
                      variant="soft"
                      color={
                        statusInfo.status === "submitted" ||
                        statusInfo.status === "Approved"
                          ? "success"
                          : statusInfo.status === "Rejected"
                            ? "danger"
                            : statusInfo.status === "draft"
                              ? "warning"
                              : "neutral"
                      }
                      size="sm"
                      endDecorator={
                        statusInfo.status === "Rejected" &&
                        statusInfo.comment ? (
                          <Tooltip title={statusInfo.comment}>
                            <InfoOutlined fontSize="small" />
                          </Tooltip>
                        ) : null
                      }
                    >
                      {statusInfo.status === "submitted" ||
                      statusInfo.status === "Approved"
                        ? "Submitted"
                        : statusInfo.status === "Rejected"
                          ? "Rejected"
                          : statusInfo.status === "draft"
                            ? "In Process"
                            : "Pending"}
                    </Chip>
                    <Box sx={{ ml: 1 }}>
                      <RowMenu currentPage={currentPage} leadId={lead.leadId} />
                    </Box>
                  </Box>

                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={() => toggleRow(lead._id)}
                    sx={{ width: "fit-content", mb: 1 }}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </Button>

                  {isExpanded && (
                    <Box sx={{ pl: 1 }}>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={1}>
                        {[
                          { label: "Lead ID", value: lead.leadId },
                          { label: "Mobile", value: lead.mobile },
                          { label: "State", value: lead.state },
                          { label: "Scheme", value: lead.scheme },
                          {
                            label: "Capacity (MW)",
                            value: lead.capacity || "-",
                          },
                          {
                            label: "Distance (KM)",
                            value: lead.distance || "-",
                          },
                          { label: "Date", value: lead.date || "-" },
                          {
                            label: "Handover Status",
                            value: (
                              <Chip
                                variant="soft"
                                color={
                                  statusInfo.status === "submitted" ||
                                  statusInfo.status === "Approved"
                                    ? "success"
                                    : statusInfo.status === "Rejected"
                                      ? "danger"
                                      : statusInfo.status === "draft"
                                        ? "warning"
                                        : "neutral"
                                }
                                size="sm"
                                endDecorator={
                                  statusInfo.status === "Rejected" &&
                                  statusInfo.comment ? (
                                    <Tooltip title={statusInfo.comment}>
                                      <InfoOutlined fontSize="small" />
                                    </Tooltip>
                                  ) : null
                                }
                              >
                                {statusInfo.status === "submitted" ||
                                statusInfo.status === "Approved"
                                  ? "Submitted"
                                  : statusInfo.status === "Rejected"
                                    ? "Rejected"
                                    : statusInfo.status === "draft"
                                      ? "In Process"
                                      : "Pending"}
                              </Chip>
                            )
                          },
                          {
                            label: "Handover Submission",
                            value: statusInfo.submittedBy || "-",
                          },
                        ].map((item, idx) => (
                          <Box key={idx}>
                            <Typography level="body2" fontWeight="md">
                              {item.label}:
                            </Typography>
                            <Typography level="body2" color="neutral">
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
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
                value={selectedLead?.land?.available_land ?? "-"}
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
                value={selectedLead?.entry_date ?? "-"}
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
                type="textarea"
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