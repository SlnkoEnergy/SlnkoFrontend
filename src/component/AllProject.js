import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
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
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
// import Axios from "../utils/Axios";
import {
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from "../redux/projectsSlice";

const AllProjects = forwardRef((props, ref) => {
  const navigate = useNavigate();
  // const [projects, setProjects] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProjects, setSelectedProjects] = useState([]);

  // const states = ["California", "Texas", "New York", "Florida"];

  // useEffect(() => {
  //   const fetchTableData = async () => {
  //     try {
  //       const response = await Axios.get("/get-all-projecT-IT");

  //       const projectsData = Array.isArray(response.data.data)
  // ? response.data.data
  //         : [];
  //       setProjects(projectsData);
  //     } catch (err) {
  //       console.error("API Error:", err);
  //       setError("Failed to fetch table data.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTableData();
  // }, []);

  const { data: getProject = [], isLoading, error } = useGetProjectsQuery();

  const [deleteProject] = useDeleteProjectMutation();

  console.log("getProject: ", getProject);

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

  const RowMenu = ({ currentPage, p_id, _id }) => {
    // console.log("CurrentPage: ", currentPage, "p_Id:", p_id);
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
                const ID = p_id;
                localStorage.setItem("idd", ID);
                // console.log(`/add_money?page=${page}&p_id=${projectId}`);
                navigate(`/edit_project?page=${page}&p_id=${ID}`);
              }}
            >
              <ModeEditIcon />
              <Typography>Edit</Typography>
            </MenuItem>
            <Divider sx={{ backgroundColor: "lightblue" }} />
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.name === "admin") && (
              <MenuItem
                color="danger"
                disabled={selectedProjects.length === 0}
                onClick={handleDelete}
              >
                <DeleteIcon />
                <Typography>Delete</Typography>
              </MenuItem>
            )}
          </Menu>
        </Dropdown>
      </>
    );
  };
  // Delete Api

  // const handleDelete = async () => {
  //   if (selectedProjects.length === 0) {
  //     toast.error("No projects selected for deletion.");
  //     return;
  //   }
  //   // console.log("Deleting selected projects:", selectedProjects);
  //   try {
  //     await Promise.all(
  //       selectedProjects.map((_id) => Axios.delete(`/delete-by-iD-IT/${_id}`))
  //     );

  //     toast.success("Deleted successfully.");

  //     // Remove deleted projects from state
  //     setProjects((prevProjects) =>
  //       prevProjects.filter((project) => !selectedProjects.includes(project._id))
  //     );

  //     // Clear selection after deletion
  //     setSelectedProjects([]);
  //   } catch (error) {
  //     console.error("Delete Error:", error);
  //     toast.error("Failed to delete projects.");
  //   }
  // };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProjects(getProject.map((row) => row._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleDelete = async () => {
    if (selectedProjects.length === 0) {
      toast.error("No projects selected for deletion.");
      return;
    }

    try {
      await Promise.all(
        selectedProjects.map(async (_id) => {
          await deleteProject(_id).unwrap();
        })
      );

      toast.success("Selected projects deleted successfully.");

      // Clear selection after successful deletion
      setSelectedProjects([]);
    } catch (err) {
      console.error("Failed to delete selected projects:", err);
      toast.error("Failed to delete selected projects.");
    }
  };

  const handleRowSelect = (_id) => {
    setSelectedProjects((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };
  const projects = useMemo(
    () => (Array.isArray(getProject?.data) ? getProject.data : []),
    [getProject]
  );

  const filteredAndSortedData = projects
    .filter((project) => {
      const matchesSearchQuery = ["code", "customer", "name"].some((key) =>
        project[key]?.toLowerCase().includes(searchQuery)
      );
      // Apply the state filter
      // const matchesStateFilter = !stateFilter || project.state === stateFilter;
      // // console.log("MatchStates are: ", matchesStateFilter);

      // // Apply the customer filter
      // const matchesCustomerFilter =
      //   !customerFilter || project.customer === customerFilter;

      // Combine all filters
      return matchesSearchQuery;
    })
    .sort((a, b) => {
      if (a.name?.toLowerCase().includes(searchQuery)) return -1;
      if (b.name?.toLowerCase().includes(searchQuery)) return 1;
      if (a.code?.toLowerCase().includes(searchQuery)) return -1;
      if (b.code?.toLowerCase().includes(searchQuery)) return 1;
      if (a.customer?.toLowerCase().includes(searchQuery)) return -1;
      if (b.customer?.toLowerCase().includes(searchQuery)) return 1;
      return 0;
    });

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

  const totalPages = Math.ceil(
    (filteredAndSortedData?.length || 0) / itemsPerPage
  );

  const paginatedProjects = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  const renderFilters = () => (
    <>
      {/* <FormControl size="sm">
        <FormLabel>State</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by state"
          value={stateFilter}
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Selected State:", selectedValue);
            setStateFilter(selectedValue);
          }}
        >
          <Option value="">All</Option>
          {states.map((state, index) => (
            <Option key={index} value={state}>
              {state}
            </Option>
          ))}
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by customer"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        >
          <Option value="">All</Option>
          {customers.map((customer, index) => (
            <Option key={index} value={customer}>
              {customer}
            </Option>
          ))}
        </Select>
      </FormControl> */}
    </>
  );

  useImperativeHandle(ref, () => ({
    exportToCSV() {
      console.log("Exporting data to CSV...");
      const headers = [
        "Project ID",
        "Customer",
        "Project Name",
        "Email",
        "Mobile",
        "State",
        "Slnko Service Charges (without GST)",
      ];

      const rows = projects.map((project) => [
        project.code || "-",
        project.customer || "-",
        project.name || "-",
        project.email || "-",
        project.number || "-",
        project.state || "-",
        project.service || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "All_Project.csv";
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
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Project ID, Customer, or Name"
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
          display: "flex",
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
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
                  checked={selectedProjects.length === getProject.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selectedProjects.length > 0 &&
                    selectedProjects.length < getProject.length
                  }
                />
              </Box>
              {[
                "Project ID",
                "Customer",
                "Project Name",
                "Email",
                "Mobile",
                "State",
                "Slnko Service Charges (without GST)",
                "",
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
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => (
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
                      checked={selectedProjects.includes(project._id)}
                      onChange={() => handleRowSelect(project._id)}
                    />
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.code}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.customer}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.name}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.email}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.number}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.state}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.service}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu currentPage={currentPage} p_id={project.p_id} />
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={9}
                  sx={{
                    padding: "8px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  No data available
                </Box>
              </Box>
            )}
          </Box>
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
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
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
});
export default AllProjects;
