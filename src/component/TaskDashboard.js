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
import { useEffect, useMemo, useState } from "react";
import NoData from "../assets/alert-bell.svg";
import Tooltip from "@mui/joy/Tooltip";
import { useGetAllTasksQuery } from "../redux/globalTaskSlice";

function Dash_task() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data, isLoading } = useGetAllTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFilter,
    createdAt: dateFilter,
  });

  const draftPayments = data?.tasks || [];

  const filteredData = useMemo(() => {
    return draftPayments.filter((task) => {
      const matchesSearch = ["title", "description"].some((key) =>
        task[key]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesStatus =
        !statusFilter || task.current_status?.status === statusFilter;
      const matchesDate =
        !dateFilter || task.createdAt?.split("T")[0] === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchQuery, statusFilter, dateFilter, draftPayments]);

  const handleSearch = (query) => setSearchQuery(query.toLowerCase());

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? filteredData.map((d) => d._id) : []);
  };

  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1) setCurrentPage(page);
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
            value={searchQuery}
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
              {[
                "Task Info",
                "Project Info",
                "Assigned To",
                "Details",
                "Status",
              ].map((header, i) => (
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
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography fontWeight="lg">{task.taskCode}</Typography>
                    <Typography level="body-sm" startDecorator="⭐">
                      Priority: {task.priority || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="📅">
                      Deadline: {task.deadline?.split("T")[0] || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="📌">
                      Title: {task.title || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="👤">
                      Created By: {task.createdBy?.name || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="📆">
                      Created At: {task.createdAt?.split("T")[0] || "-"}
                    </Typography>
                  </td>
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
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {task.assigned_to?.map((a) => a.name).join(", ") || "-"}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {task.description}
                  </td>
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
      <Box
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

        <Box>Showing {filteredData.length} results</Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {currentPage + 1}
          </IconButton>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default Dash_task;
