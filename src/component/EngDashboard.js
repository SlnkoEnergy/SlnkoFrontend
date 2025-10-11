import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress, Option, Select, Tab, TabList, Tabs } from "@mui/joy";
import NoData from "../assets/alert-bell.svg";
import { useGetHandOverQuery } from "../redux/camsSlice";
import { useTheme } from "@emotion/react";
import { Add } from "@mui/icons-material";

function Dash_eng() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const createdAtFrom = searchParams.get("from") || "";
  const createdAtTo = searchParams.get("to") || "";
  const options = [1, 5, 10, 20, 50, 100];
  const [selectedTab, setSelectedTab] = useState(
    () => searchParams.get("tab") || "All"
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );
  const getStatusFilter = (tab) => {
    switch (tab) {
      case "Scope Pending":
        return "scopepending";
      default:
        return "Approved";
    }
  };
  const statusFilter = useMemo(
    () => getStatusFilter(selectedTab),
    [selectedTab]
  );
  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({
    page: currentPage,
    status: statusFilter,
    search: searchQuery,
    limit: rowsPerPage,
    createdAtFrom: createdAtFrom,
    createdAtTo: createdAtTo,
  });

  const HandOverSheet = Array.isArray(getHandOverSheet?.data)
    ? getHandOverSheet.data.map((entry) => {
        return {
          ...entry,
          p_id: entry.p_id,
          _id: entry._id,
          ...entry.customer_details,
          ...entry.order_details,
          ...entry.project_detail,
          ...entry.commercial_details,
          ...entry.other_details,
          ...entry?.scheme,
          is_locked: entry.is_locked,
          project_id: entry.project_id,
        };
      })
    : [];

  const ProjectOverView = ({ currentPage, project_id, code }) => {
    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            fontSize: "14px",
          }}
          onClick={() => {
            const page = currentPage;
            navigate(`/project_detail?page=${page}&project_id=${project_id}`);
          }}
        >
          {code || "-"}
        </span>
      </>
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

  const paginatedPayments = filteredAndSortedData;

  const draftPayments = paginatedPayments;
  const total = Number(getHandOverSheet?.total || 0);
  const pageSize = Number(rowsPerPage || 1);
  const totalPages = Math.ceil(total / pageSize);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  const fmtDDMMYYYY = (d) => {
    if (!d) return "-";
    const t = new Date(d);
    if (Number.isNaN(t.getTime())) return "-";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(t.getDate())}-${pad(t.getMonth() + 1)}-${t.getFullYear()}`;
  };

  return (
    <Box
      sx={{
        ml: {
          lg: "var(--Sidebar-width)",
        },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box display={"flex"} justifyContent={"space-between"} pb={0.5}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          alignItems={"center"}
        >
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => {
              setSelectedTab(newValue);
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set("tab", newValue);
                newParams.set("page", 1);
                return newParams;
              });
            }}
            sx={{
              bgcolor: "background.level1",
              borderRadius: "xl",
            }}
          >
            <TabList sx={{ gap: 1 }}>
              {["All", "Scope Pending"].map((label, index) => (
                <Tab
                  key={index}
                  value={label}
                  disableIndicator
                  sx={{
                    borderRadius: "xl",
                    fontWeight: "md",
                    "&.Mui-selected": {
                      bgcolor: "background.surface",
                      boxShadow: "sm",
                    },
                  }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>
        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: "sm",
            py: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            width: { lg: "100%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by ProjectId, Customer, Type, or State"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: "66vh",
          overflowY: "auto",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
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
                "Project Name",
                "Customer",
                "Mobile",
                "State",
                "Capacity(AC/DC)",
                "Created At",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#e0e0e0",
                    zIndex: 2,
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
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
                <td colSpan={9} style={{ padding: "8px" }}>
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
                      textAlign: "left",
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
                      textAlign: "left",
                    }}
                  >
                    <Tooltip title="View Project Detail" arrow>
                      <span>
                        <ProjectOverView
                          currentPage={currentPage}
                          project_id={project.project_id}
                          code={project.code}
                        />
                      </span>
                    </Tooltip>
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.name || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.customer || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.number || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.state || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
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
                      textAlign: "left",
                    }}
                  >
                    {fmtDDMMYYYY(project?.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ padding: "8px", textAlign: "left" }}>
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
          pt: 0.5,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
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

        <Box>Showing {draftPayments.length} results</Box>

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
          {currentPage + 1 <= totalPages && (
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

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ padding: "8px 16px" }}
        >
          <Select
            value={rowsPerPage}
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  return params;
                });
              }
            }}
            size="sm"
            variant="outlined"
            sx={{
              minWidth: 80,
              borderRadius: "md",
              boxShadow: "sm",
            }}
          >
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
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
    </Box>
  );
}
export default Dash_eng;
