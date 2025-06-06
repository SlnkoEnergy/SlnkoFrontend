import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
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
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CircularProgress } from "@mui/joy";
import NoData from "../assets/alert-bell.svg";
import { useGetHandOverQuery } from "../redux/camsSlice";

import { useTheme } from "@emotion/react";

function Dash_eng() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const itemsPerPage = 10;

  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({
    page: currentPage,
    search: searchQuery,
    status: "Approved",
  });

  const HandOverSheet = useMemo(() => {
    const rawData = getHandOverSheet?.data || [];
    return Array.isArray(rawData)
      ? rawData.map((entry) => ({
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
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }))
      : [];
  }, [getHandOverSheet]);

  console.log("HandOverSheet:", HandOverSheet);

  const totalCount = getHandOverSheet.total || 0;

  const RowMenu = ({ currentPage, p_id, _id }) => {
    // console.log("CurrentPage: ", currentPage, "p_Id:", p_id);

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

          {(user?.name === "IT Team" ||
            user?.name === "admin".includes(user?.name)) && (
            <Menu size="sm" sx={{ minWidth: 200, p: 1 }}>
              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = _id;
                  sessionStorage.setItem("view handover", projectId);
                  navigate(`/view_handover?page=${page}&_id=${projectId}`);
                }}
              >
                <ContentPasteGoIcon sx={{ mr: 1 }} />
                <Typography>Handover Summary</Typography>
              </MenuItem>

              {/* <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = Number(p_id);
                  sessionStorage.setItem("update handover", projectId);
                  navigate("#");
                }}
              >
                <HistoryIcon sx={{ mr: 1 }} />
                <Typography>Cam Logs</Typography>
              </MenuItem> */}

              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = String(p_id);
                  localStorage.setItem("get-project", projectId);
                  navigate("#");
                }}
              >
                <DashboardCustomizeIcon sx={{ mr: 1 }} />
                <Typography>View BOM Dashboard</Typography>
              </MenuItem>

              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = String(p_id);
                  sessionStorage.setItem("add_bom", projectId);
                  navigate(`/add_bom?page=${page}&p_id=${projectId}`);
                }}
              >
                <PlaylistAddIcon sx={{ mr: 1 }} />
                <Typography>Add BOM</Typography>
              </MenuItem>

              <MenuItem
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    color: "white",
                  },
                }}
                onClick={() => {
                  const page = currentPage;
                  const projectId = String(p_id);
                  sessionStorage.setItem("process_tracker", projectId);
                  navigate(`/process_track?page=${page}&p_id=${projectId}`);
                }}
              >
                <TrackChangesIcon sx={{ mr: 1 }} />
                <Typography>Process Tracker</Typography>
              </MenuItem>
            </Menu>
          )}
        </Dropdown>
      </>
    );
  };

  const ProjectCode = ({ currentPage, _id, code }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            const page = currentPage;
            const projectId = _id;
            sessionStorage.setItem("view handover", projectId);
            navigate(`/view_handover?page=${page}&_id=${projectId}`);
          }}
        >
          {code || "-"}
        </span>
      </>
    );
  };

  const ProjectName = ({ currentPage, p_id, customer }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            const page = currentPage;
            const projectId = Number(p_id);
            sessionStorage.setItem("view handover", projectId);
            navigate(`/view_handover?page=${page}&p_id=${projectId}`);
          }}
        >
          {customer || "-"}
        </span>
      </>
    );
  };

  const handleSearch = (query) => {
    setCurrentPage(1);
    setSearchQuery(query);
  };

  // const filteredAndSortedData = useMemo(() => {
  //   return HandOverSheet.filter((project) =>
  //     ["code", "customer", "state"].some((key) =>
  //       project[key]
  //         ?.toString()
  //         .toLowerCase()
  //         .includes(searchQuery.toLowerCase())
  //     )
  //   ).sort((a, b) => {
  //     const dateA = new Date(a?.updatedAt || a?.createdAt || 0);
  //     const dateB = new Date(b?.updatedAt || b?.createdAt || 0);
  //     return dateB - dateA;
  //   });
  // }, [HandOverSheet, searchQuery]);

  const paginatedPayments = HandOverSheet;

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

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const generatePageNumbers = (current, total) => {
    const pages = [];

    if (current > 2) pages.push(1);
    if (current > 3) pages.push("...");

    for (
      let i = Math.max(1, current - 1);
      i <= Math.min(total, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    if (current < total - 1) pages.push(total);

    return pages;
  };

  const pageNumbers = generatePageNumbers(currentPage, totalPages);


  const handlePageChange = (page) => {
    if (page >= 1) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  // const draftPayments = paginatedPayments.filter(
  //   (project) => project.status_of_handoversheet === "Approved"
  // );

  const draftPayments = paginatedPayments;

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
            placeholder="Search by ProjectId , Customer , Type , or , State"
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
                  checked={selected.length === draftPayments.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < draftPayments.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Customer",
                "Project Name",
                "Mobile",
                "State",
                "Capacity(AC/DC)",
                // "Progress",
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
                <td colSpan={7} style={{ padding: "8px", textAlign: "center" }}>
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

                  {/* <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.code || "-"}
                  </td> */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="View Handover" arrow>
                      <span>
                        <ProjectCode
                          currentPage={currentPage}
                          _id={project._id}
                          code={project.code}
                        />
                      </span>
                    </Tooltip>
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="View Handover" arrow>
                      <span>
                        <ProjectName
                          currentPage={currentPage}
                          p_id={project.p_id}
                          customer={project.customer}
                        />
                      </span>
                    </Tooltip>
                  </td>

                  {/* <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.customer || "-"}
                  </td> */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="View Handover" arrow>
                      <span>
                        <ProjectName
                          currentPage={currentPage}
                          p_id={project.p_id}
                          customer={project.customer}
                        />
                      </span>
                    </Tooltip>
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
                    {project.project_kwp && project.proposed_dc_capacity
                      ? `${project.project_kwp} AC / ${project.proposed_dc_capacity} DC`
                      : "-"}
                  </td>

                  {/* <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      color:
                        project.progress === "100%"
                          ? "#4caf50"
                          : project.progress === "0%"
                            ? "#f44336"
                            : "#ff9800",
                    }}
                  >
                    {project.progress || "80%"}
                  </td> */}

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu currentPage={currentPage} p_id={project.p_id} />
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

    
        <Box>Showing {draftPayments.length} results</Box>

        {/* Page Numbers: Only show current, prev, next for backend-driven pagination */}
       <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
  {pageNumbers.map((page, index) =>
    page === "..." ? (
      <Box key={index} sx={{ px: 1 }}>...</Box>
    ) : (
      <IconButton
        key={index}
        size="sm"
        variant={page === currentPage ? "contained" : "outlined"}
        color="neutral"
        onClick={() => handlePageChange(page)}
      >
        {page}
      </IconButton>
    )
  )}
</Box>


        {/* Next Button */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default Dash_eng;
