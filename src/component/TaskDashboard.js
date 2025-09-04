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
import { useEffect, useMemo, useState, useCallback } from "react";
import NoData from "../assets/alert-bell.svg";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { debounce } from "lodash";
import { useSearchParams, useNavigate } from "react-router-dom";
import Chip from "@mui/joy/Chip";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";

import {
  useGetAllTasksQuery,
  useGetAllDeptQuery,
  // NEW: import the users query
  useGetAllUserQuery,
} from "../redux/globalTaskSlice";

import {
  Badge,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
} from "@mui/joy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function Dash_task({ selected, setSelected }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hidePending, setHidePending] = useState(false);
  const [hideProgress, setHideProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [rawSearch, setRawSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("createdAt") || ""
  );
  const [departmentFilter, setDepartmentFilter] = useState(
    searchParams.get("department") || ""
  );
  const [deadlineDateFilter, setDeadlineDateFilter] = useState(
    searchParams.get("deadline") || ""
  );

  // Name filters (persisted to URL / sent to backend)
  const [assignedToName, setAssignedToName] = useState(
    searchParams.get("assignedToName") || ""
  );
  const [createdByName, setCreatedByName] = useState(
    searchParams.get("createdByName") || ""
  );

  // Raw inputs (used only when using text inputs; for dropdowns we'll set directly)
  const [rawAssignedToName, setRawAssignedToName] = useState(
    searchParams.get("assignedToName") || ""
  );
  const [rawCreatedByName, setRawCreatedByName] = useState(
    searchParams.get("createdByName") || ""
  );

  const [prioritySortOrder, setPrioritySortOrder] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(searchParams.get("limit")) || 100
  );

  const navigate = useNavigate();

  // MAIN DATA
  const { data, isLoading } = useGetAllTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFilter,
    createdAt: dateFilter,
    deadline: deadlineDateFilter,
    department: departmentFilter,
    limit: itemsPerPage,
    hide_completed: hideCompleted,
    hide_pending: hidePending,
    hide_inprogress: hideProgress,
    assignedToName,
    createdByName,
  });

  // DEPARTMENTS
  const { data: deptApiData, isLoading: isDeptLoading } = useGetAllDeptQuery();
  const deptList = deptApiData?.data?.filter((d) => d) || [];

  // NEW: Fetch users for the selected department (only when a department is chosen)
  // If you want ONLY "accounts" to trigger this, replace `!!departmentFilter` with `(departmentFilter?.toLowerCase() === "accounts")`.
  const shouldLoadUsers = !!departmentFilter;
  const {
    data: usersResp,
    isFetching: isUsersLoading,
    isError: isUsersError,
  } = useGetAllUserQuery(
    { department: departmentFilter },
    { skip: !shouldLoadUsers }
  );

  // Normalize users data (expecting array of { _id, name } or similar)
  const userOptions =
    (usersResp?.data || usersResp?.users || []).map((u) => ({
      value: u?._id || u?.id || u?.email || u?.name, // fallback keys
      label: u?.name || u?.fullName || u?.email || "Unknown",
    })) || [];

  // Keep URL in sync
  useEffect(() => {
    const params = {};

    if (searchQuery) params.search = searchQuery;
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.createdAt = dateFilter;
    if (deadlineDateFilter) params.deadline = deadlineDateFilter;
    if (departmentFilter) params.department = departmentFilter;
    if (assignedToName) params.assignedToName = assignedToName;
    if (createdByName) params.createdByName = createdByName;
    if (currentPage) params.page = currentPage;
    if (itemsPerPage) params.limit = itemsPerPage;

    setSearchParams(params);
  }, [
    searchQuery,
    statusFilter,
    dateFilter,
    deadlineDateFilter,
    departmentFilter,
    assignedToName,
    createdByName,
    currentPage,
    itemsPerPage,
    setSearchParams,
  ]);

  // Reset dependent filters when department changes
  useEffect(() => {
    // Clear name filters when department changes so we don't carry stale names across departments
    setAssignedToName("");
    setCreatedByName("");
    setRawAssignedToName("");
    setRawCreatedByName("");
  }, [departmentFilter]);

  // Debouncers (still used for text input mode)
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const debouncedAssignedToName = useCallback(
    debounce((value) => {
      setAssignedToName(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const debouncedCreatedByName = useCallback(
    debounce((value) => {
      setCreatedByName(value);
      setCurrentPage(1);
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

  // Text-input handlers (used when department not selected)
  const handleAssignedToNameText = (value) => {
    setRawAssignedToName(value);
    debouncedAssignedToName(value);
  };
  const handleCreatedByNameText = (value) => {
    setRawCreatedByName(value);
    debouncedCreatedByName(value);
  };

  // Dropdown handlers (used when department is selected)
  const handleAssignedToNameSelect = (_, newValue) => {
    const v = newValue || "";
    setAssignedToName(v);
    setRawAssignedToName(v);
    setCurrentPage(1);
  };
  const handleCreatedByNameSelect = (_, newValue) => {
    const v = newValue || "";
    setCreatedByName(v);
    setRawCreatedByName(v);
    setCurrentPage(1);
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

  const getTypeData = (type) => {
    switch (type) {
      case "project":
        return { icon: <WorkOutlineIcon fontSize="small" />, label: "Project" };
      case "internal":
        return { icon: <ApartmentIcon fontSize="small" />, label: "Internal" };
      case "helpdesk":
        return { icon: <BuildIcon fontSize="small" />, label: "Helpdesk" };
      default:
        return { icon: null, label: "-" };
    }
  };

  const statusOptions = ["completed", "pending", "in progress"];

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("hiddenStatuses") || "{}") || {};
    setHideCompleted(saved.completed || false);
    setHidePending(saved.pending || false);
    setHideProgress(saved["in progress"] || false);
  }, []);

  const selectedValues = [
    ...(hideCompleted ? ["completed"] : []),
    ...(hidePending ? ["pending"] : []),
    ...(hideProgress ? ["in progress"] : []),
  ];
  const handleToggle = (status) => {
    let updated = {
      completed: hideCompleted,
      pending: hidePending,
      "in progress": hideProgress,
    };

    if (status === "completed") {
      const newVal = !hideCompleted;
      setHideCompleted(newVal);
      updated.completed = newVal;
    } else if (status === "pending") {
      const newVal = !hidePending;
      setHidePending(newVal);
      updated.pending = newVal;
    } else if (status === "in progress") {
      const newVal = !hideProgress;
      setHideProgress(newVal);
      updated["in progress"] = newVal;
    }

    localStorage.setItem("hiddenStatuses", JSON.stringify(updated));
  };

  const hiddenCount = selectedValues.length;

  const showUserDropdowns = !!departmentFilter;

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
      {/* Search and Filters */}
      <Box display={"flex"} justifyContent={"flex-end"} alignItems={"center"} pb={0.5}>
      <Box
        sx={{
          py: 1,
          display: "flex",
          justifyContent:'flex-end',
          alignItems:'flex-end',
          gap: 1.5,
          width:'50%'
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <Input
            size="sm"
            placeholder="Search by Title, Description or Type"
            startDecorator={<SearchIcon />}
            value={rawSearch}
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
                  checked={
                    selected.length === filteredData.length &&
                    filteredData.length > 0
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < filteredData.length
                  }
                />
              </th>

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

              {["Title", "Type", "Project Info", "Description", "Status"].map(
                (header, i) => (
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
                )
              )}
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
                    <Typography
                      fontWeight="lg"
                      sx={{ cursor: "pointer", color: "primary.700" }}
                      onClick={() => navigate(`/view_task?task=${task._id}`)}
                    >
                      {task.taskCode}
                    </Typography>
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
                      Created At:{" "}
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </Typography>
                  </td>

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
                    {task.deadline &&
                      (() => {
                        const msPerDay = 1000 * 60 * 60 * 24;

                        const toMidnight = (d) => {
                          const x = new Date(d);
                          x.setHours(0, 0, 0, 0);
                          return x;
                        };

                        const daysBetween = (a, b) => {
                          const A = toMidnight(a).getTime();
                          const B = toMidnight(b).getTime();
                          return Math.floor((A - B) / msPerDay);
                        };

                        const today = toMidnight(new Date());
                        const deadline = toMidnight(task.deadline);

                        const startDate =
                          task?.createdAt ??
                          task?.status_history?.[0]?.updatedAt ??
                          today;

                        const completedFromHistory = task?.status_history
                          ?.slice()
                          .reverse()
                          .find((s) => s?.status === "completed");

                        const currentIsCompleted =
                          task?.current_status?.status === "completed";
                        const completionDate =
                          completedFromHistory?.updatedAt ??
                          (currentIsCompleted
                            ? task?.current_status?.updatedAt
                            : undefined);

                        if (completionDate) {
                          const elapsedDays = daysBetween(
                            completionDate,
                            startDate
                          );
                          const lateBy = daysBetween(completionDate, deadline);

                          if (toMidnight(completionDate) <= deadline) {
                            return (
                              <Typography
                                level="body-sm"
                                color="success"
                                startDecorator="✅"
                              >
                                Completed in {elapsedDays}{" "}
                                {elapsedDays === 1 ? "day" : "days"} (on time)
                              </Typography>
                            );
                          } else {
                            return (
                              <Typography
                                level="body-sm"
                                color="danger"
                                startDecorator="⏰"
                              >
                                Completed late by {lateBy}{" "}
                                {lateBy === 1 ? "day" : "days"} &middot; took{" "}
                                {elapsedDays}{" "}
                                {elapsedDays === 1 ? "day" : "days"}
                              </Typography>
                            );
                          }
                        }

                        if (
                          deadline < today &&
                          task?.current_status?.status !== "completed"
                        ) {
                          const diffInDays = daysBetween(today, deadline);
                          return (
                            <Typography
                              level="body-sm"
                              color="danger"
                              startDecorator="⏰"
                            >
                              Delay: {diffInDays}{" "}
                              {diffInDays === 1 ? "day" : "days"}
                            </Typography>
                          );
                        }

                        return (
                          <Typography
                            level="body-sm"
                            color="success"
                            startDecorator="✅"
                          >
                            On Time
                          </Typography>
                        );
                      })()}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {task.type ? (
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        gap={0.5}
                        px={1}
                        py={0.3}
                        borderRadius="16px"
                        border="1px solid #ccc"
                        bgcolor="#f5f5f5"
                      >
                        {getTypeData(task.type).icon}
                        <Typography variant="body2" fontWeight="medium">
                          {getTypeData(task.type).label}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography fontWeight="lg">-</Typography>
                    )}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {Array.isArray(task.project_details) &&
                    task.project_details.length > 0 ? (
                      task.project_details.length === 1 ? (
                        <div>
                          <Typography fontWeight="lg">
                            {task.project_details[0].code || "-"}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: "#666" }}>
                            {task.project_details[0].name || "-"}
                          </Typography>
                        </div>
                      ) : (
                        <Tooltip
                          title={
                            <Box
                              sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}
                            >
                              {task.project_details
                                .slice(1)
                                .map((project, index) => (
                                  <Box key={project._id} sx={{ mb: 1 }}>
                                    <Typography level="body-md" fontWeight="lg">
                                      {project.code}
                                    </Typography>
                                    <Typography level="body-sm">
                                      {project.name}
                                    </Typography>
                                    {index !==
                                      task.project_details.length - 2 && (
                                      <Box
                                        sx={{
                                          height: "1px",
                                          backgroundColor: "#eee",
                                          my: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                ))}
                            </Box>
                          }
                          arrow
                          placement="top-start"
                          variant="soft"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                              cursor: "pointer",
                              "&:hover .project-count-badge": {
                                backgroundColor: "#0056d2",
                              },
                            }}
                          >
                            <Box>
                              <Typography fontWeight="lg">
                                {task.project_details[0].code || "-"}
                              </Typography>
                              <Typography level="body-sm">
                                {task.project_details[0].name || "-"}
                              </Typography>
                            </Box>
                            <Box
                              className="project-count-badge"
                              sx={{
                                backgroundColor: "#007bff",
                                color: "#fff",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                px: 1,
                                py: 0.2,
                                minWidth: 26,
                                textAlign: "center",
                                transition: "all 0.2s ease-in-out",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              }}
                            >
                              +{task.project_details.length - 1}
                            </Box>
                          </Box>
                        </Tooltip>
                      )
                    ) : (
                      <>
                        <Typography fontWeight="lg">N/A</Typography>
                      </>
                    )}
                  </td>

                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      maxWidth: "200px",
                    }}
                  >
                    <Tooltip
                      title={
                        <Typography
                          sx={{ whiteSpace: "pre-line", maxWidth: "300px" }}
                        >
                          {task.description || ""}
                        </Typography>
                      }
                      arrow
                      placement="top-start"
                      variant="soft"
                      color="neutral"
                    >
                      <Typography
                        noWrap
                        sx={{
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "default",
                        }}
                      >
                        {task.description || "-"}
                      </Typography>
                    </Tooltip>
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Tooltip title={task.current_status?.remarks || ""}>
                      <Chip
                        variant="soft"
                        color={
                          task.current_status?.status === "draft"
                            ? "primary"
                            : task.current_status?.status === "pending"
                            ? "danger"
                            : task.current_status?.status === "in progress"
                            ? "warning"
                            : task.current_status?.status === "completed"
                            ? "success"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {task.current_status?.status
                          ? task.current_status.status.charAt(0).toUpperCase() +
                            task.current_status.status.slice(1)
                          : "-"}
                      </Chip>
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

        <Box>
          Page {currentPage} of {totalPages} | Showing{" "}
          {data?.tasks?.length || 0} of {totalCount} results
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
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

        <FormControl size="sm">
          <Select
            value={itemsPerPage}
            onChange={(_e, newValue) => {
              setItemsPerPage(Number(newValue));
              setCurrentPage(1);
            }}
            sx={{
              height: "32px",
              borderRadius: "6px",
              padding: "0 8px",
              borderColor: "#ccc",
              backgroundColor: "#fff",
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select>
        </FormControl>

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

export default Dash_task;
