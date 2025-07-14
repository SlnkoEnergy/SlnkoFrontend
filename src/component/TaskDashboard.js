import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Checkbox from "@mui/joy/Checkbox";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import { useEffect, useMemo, useState,useCallback } from "react";
import NoData from "../assets/alert-bell.svg";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { debounce } from "lodash";
import { useSearchParams } from "react-router-dom";


import { useGetAllTasksQuery } from "../redux/globalTaskSlice";

function Dash_task() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [selected, setSelected] = useState([]);
 const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
const [rawSearch, setRawSearch] = useState(searchParams.get("search") || "");    

 const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
const [dateFilter, setDateFilter] = useState(searchParams.get("createdAt") || "");
  const [prioritySortOrder, setPrioritySortOrder] = useState(null);
const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get("limit")) || 10);


  const { data, isLoading } = useGetAllTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFilter,
    createdAt: dateFilter,
    limit : itemsPerPage,
  });


useEffect(() => {
  const params = {};

  if (searchQuery) params.search = searchQuery;
  if (statusFilter) params.status = statusFilter;
  if (dateFilter) params.createdAt = dateFilter;
  if (currentPage) params.page = currentPage;
  if (itemsPerPage) params.limit = itemsPerPage;

  setSearchParams(params);
}, [searchQuery, statusFilter, dateFilter, currentPage, itemsPerPage, setSearchParams]);


const debouncedSearch = useCallback(
  debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1); // reset page when searching
  }, 300),
  []
);


const draftPayments = data?.tasks || [];
const totalCount = data?.totalTasks || 0;
const totalPages = data?.totalPages || 1;



const filteredData = useMemo(() => {
  let sorted = [...(draftPayments || [])];

  if (prioritySortOrder) {
    sorted.sort((a, b) => {
      const aPriority = Number(a.priority) || 0;
      const bPriority = Number(b.priority) || 0;
      return prioritySortOrder === "asc"
        ? aPriority - bPriority
        : bPriority - aPriority;
    });
  }

  return sorted;
}, [draftPayments, prioritySortOrder]);


const handleSearch = (value) => {
  setRawSearch(value);
  debouncedSearch(value);
};


  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? filteredData.map((d) => d._id) : []);
  };

  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};


  return (
    <>
      {/* Search and Filters */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
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
  placeholder="Search by Title or Description"
  startDecorator={<SearchIcon />}
  value={rawSearch}
  onChange={(e) => handleSearch(e.target.value)}
/>

        </FormControl>

        <FormControl size="sm">
          <FormLabel>Status</FormLabel>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: "32px",
              borderRadius: "6px",
              padding: "0 8px",
              borderColor: "#ccc",
            }}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Filter by Date</FormLabel>
          <Input
            size="sm"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </FormControl>
        <FormControl size="sm">
  <FormLabel>Items per page</FormLabel>
  <select
    value={itemsPerPage}
    onChange={(e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); // Reset to first page on limit change
    }}
    style={{
      height: "32px",
      borderRadius: "6px",
      padding: "0 8px",
      borderColor: "#ccc",
    }}
  >
    {[5, 10, 20, 50, 100].map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
</FormControl>

      </Box>
      


      {/* Table */}
      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
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
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <tr>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                <Checkbox
                  size="sm"
                  checked={selected.length === filteredData.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < filteredData.length
                  }
                />
              </th>

              {/* Task Info with Sort by Priority */}
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography level="body-sm">Task Info</Typography>
                  <Tooltip title="Sort by Priority">
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() =>
                        setPrioritySortOrder((prev) =>
                          prev === "asc"
                            ? "desc"
                            : prev === "desc"
                              ? null
                              : "asc"
                        )
                      }
                    >
                      {prioritySortOrder === "asc" ? (
                        <ArrowUpwardIcon fontSize="small" />
                      ) : prioritySortOrder === "desc" ? (
                        <ArrowDownwardIcon fontSize="small" />
                      ) : (
                        <ArrowUpwardIcon
                          fontSize="small"
                          sx={{ opacity: 0.3 }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </th>

              {/* The rest of the column headers */}
              {["Title", "Project Info", "Description", "Status"].map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((task) => (
                <tr key={task._id}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selected.includes(task._id)}
                      onChange={() => handleRowSelect(task._id)}
                    />
                  </td>

                  {/* Task Info */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography fontWeight="lg">{task.taskCode}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title="Priority">
                        <Box display="flex">
                          {[...Array(Number(task.priority || 0))].map(
                            (_, i) => (
                              <Typography key={i} level="body-sm">
                                ⭐
                              </Typography>
                            )
                          )}
                        </Box>
                      </Tooltip>
                    </Box>

                    <Typography level="body-sm" startDecorator="👤">
                      Created By: {task.createdBy?.name || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="📆">
                      Created At: {task.createdAt?.split("T")[0] || "-"}
                    </Typography>
                  </td>

                  {/* Title + Assigned To + Deadline */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography fontWeight="lg">{task.title || "-"}</Typography>

                    {task.assigned_to?.length > 0 ? (
                      <Tooltip
                        title={
                          <Box sx={{ px: 1, py: 0.5 }}>
                            <Typography
                              level="body-sm"
                              fontWeight="md"
                              mb={0.5}
                            >
                              Assigned To:
                            </Typography>
                            {task.assigned_to.map((a, i) => (
                              <Typography key={i} level="body-sm">
                                • {a.name}
                              </Typography>
                            ))}
                          </Box>
                        }
                        variant="soft"
                        placement="top"
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            backgroundColor: "#f1f3f5",
                            padding: "2px 6px",
                            borderRadius: "12px",
                            maxWidth: "100%",
                          }}
                        >
                          <Typography level="body-sm" noWrap>
                            {task.assigned_to[0].name}
                          </Typography>

                          {task.assigned_to.length > 1 && (
                            <Box
                              sx={{
                                backgroundColor: "#007bff",
                                color: "#fff",
                                borderRadius: "8px",
                                fontSize: "10px",
                                fontWeight: 500,
                                px: 0.8,
                                lineHeight: 1.2,
                              }}
                            >
                              +{task.assigned_to.length - 1}
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography level="body-sm" startDecorator="👥">
                        -
                      </Typography>
                    )}

                    <Typography level="body-sm" startDecorator="📅">
                      Deadline: {task.deadline?.split("T")[0] || "-"}
                    </Typography>
                  </td>

                  {/* Project Info */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography fontWeight="lg">
                      {task.project_id?.code || "-"}
                    </Typography>
                    <Typography level="body-sm">
                      {task.project_id?.name || "-"}
                    </Typography>
                  </td>

                  {/* Description */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {task.description}
                  </td>

                  {/* Status */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Tooltip title={task.current_status?.remarks || ""}>
                      <span>{task.current_status?.status}</span>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{ width: 50, marginBottom: 8 }}
                    />
                    <Typography fontStyle="italic">No Tasks Found</Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
    {/* Pagination */}
<Box
  sx={{
    pt: 2,
    gap: 1,
    [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    alignItems: "center",
    justifyContent: "center",
    marginLeft: { lg: "18%", xl: "15%" },
    flexWrap: "wrap",
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
    Page {currentPage} of {totalPages} | Showing{" "}
    {data?.tasks?.length || 0} of {totalCount} results
  </Box>

  <Box sx={{ display: "flex", gap: 1 }}>
    <IconButton size="sm" variant="contained" color="neutral">
      {currentPage}
    </IconButton>
    {currentPage < totalPages && (
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

export default Dash_task;
