import { useEffect, useMemo, useState, useCallback } from "react";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";
import NoData from "../assets/alert-bell.svg";
import {
  useGetAllTasksQuery,
  useGetAllDeptQuery,
  useGetAllUserQuery,
} from "../redux/globalTaskSlice";

function Dash_task({ selected, setSelected, searchParams, setSearchParams }) {
  const navigate = useNavigate();

  const tabLabel = searchParams.get("tab") || "All";
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("limit")) || 100;

  const searchQuery = searchParams.get("search") || "";
  const createdAt = searchParams.get("createdAt") || "";
  const deadline = searchParams.get("deadline") || "";
  const department = searchParams.get("department") || "";
  const assignedToName = searchParams.get("assignedToName") || "";
  const createdByName = searchParams.get("createdByName") || "";

  const statusFromTab =
    {
      Pending: "pending",
      "In Progress": "in progress",
      Completed: "completed",
      Cancelled: "cancelled",
      All: "",
    }[tabLabel] ?? "";

  const [hideCompleted, setHideCompleted] = useState(false);
  const [hidePending, setHidePending] = useState(false);
  const [hideProgress, setHideProgress] = useState(false);
  const [prioritySortOrder, setPrioritySortOrder] = useState(null);
  const [rawSearch, setRawSearch] = useState(searchQuery);
  const [selectedTab, setSelectedTab] = useState(tabLabel);

  useEffect(() => setRawSearch(searchQuery), [searchQuery]);
  useEffect(() => setSelectedTab(tabLabel), [tabLabel]);

  // -------- Data ----------
  const { data, isLoading } = useGetAllTasksQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFromTab, 
    createdAt,
    deadline,
    department,
    limit: itemsPerPage,
    hide_completed: hideCompleted,
    hide_pending: hidePending,
    hide_inprogress: hideProgress,
    assignedToName,
    createdByName,
  });

  const { data: deptApiData } = useGetAllDeptQuery();


  const shouldLoadUsers = !!department;
  const {
    data: usersResp,
    isFetching: isUsersLoading,
    isError: isUsersError,
  } = useGetAllUserQuery({ department }, { skip: !shouldLoadUsers });


  const patchParams = useCallback(
    (patchObj) => {
      if (!setSearchParams) return;
      setSearchParams((prev) => {
        const merged = Object.fromEntries(prev.entries());
        return { ...merged, ...patchObj };
      });
    },
    [setSearchParams]
  );

  const setParamAndResetPage = useCallback(
    (key, value) => {
      if (!setSearchParams) return;
      setSearchParams((prev) => {
        const merged = Object.fromEntries(prev.entries());
        if (value == null || value === "") delete merged[key];
        else merged[key] = String(value);
        merged.page = "1";
        return merged;
      });
    },
    [setSearchParams]
  );

  // Debounced free-text search -> URL
  const debouncedPushSearch = useCallback(
    debounce((value) => setParamAndResetPage("search", value), 300),
    [setParamAndResetPage]
  );
  const handleSearch = (value) => {
    setRawSearch(value);
    debouncedPushSearch(value);
  };

  const handlePageChange = (page) => {
    const max = data?.totalPages || 1;
    if (page >= 1 && page <= max) patchParams({ page: String(page) });
  };

  const handlePageSize = (_e, newValue) => {
    const n = Number(newValue) || 10;
    setSearchParams((prev) => {
      const merged = Object.fromEntries(prev.entries());
      merged.limit = String(n);
      merged.page = "1";
      return merged;
    });
  };

  // -------- Table shaping ----------
  const draftPayments = data?.tasks || [];
  const totalCount = data?.totalTasks || 0;
  const totalPages = data?.totalPages || 1;

  const filteredData = useMemo(() => {
    const arr = [...draftPayments];
    if (prioritySortOrder) {
      arr.sort((a, b) => {
        const A = Number(a.priority) || 0;
        const B = Number(b.priority) || 0;
        return prioritySortOrder === "asc" ? A - B : B - A;
      });
    }
    return arr;
  }, [draftPayments, prioritySortOrder]);

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? filteredData.map((d) => d._id) : []);
  };
  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Search + Tabs + Page size */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
    
        <Tabs
          value={selectedTab}
          onChange={(_e, newValue) => {
            setSelectedTab(newValue);
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.set("tab", newValue);
              params.set("page", "1");
              return params;
            });
          }}
          indicatorPlacement="none"
          sx={{
            bgcolor: "background.level1",
            borderRadius: "md",
            boxShadow: "sm",
            width: "fit-content",
          }}
        >
          <TabList sx={{ gap: 1 }}>
            {["Pending", "In Progress", "Completed", "Cancelled", "All"].map(
              (label) => (
                <Tab
                  key={label}
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
              )
            )}
          </TabList>
        </Tabs>

        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
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
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
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
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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

              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: 8,
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((task) => (
                <tr key={task._id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(task._id)}
                      onChange={() => handleRowSelect(task._id)}
                    />
                  </td>

                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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

                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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
                        const dln = toMidnight(task.deadline);

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
                          const lateBy = daysBetween(completionDate, dln);

                          if (toMidnight(completionDate) <= dln) {
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
                                {lateBy === 1 ? "day" : "days"} · took{" "}
                                {elapsedDays}{" "}
                                {elapsedDays === 1 ? "day" : "days"}
                              </Typography>
                            );
                          }
                        }

                        if (
                          dln < today &&
                          task?.current_status?.status !== "completed"
                        ) {
                          const diffInDays = daysBetween(today, dln);
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

                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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

                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                    {(() => {
                      // Normalize to an array of { code, name }
                      let projects = [];

                      // case 1: array from API
                      if (
                        Array.isArray(task.project_details) &&
                        task.project_details.length > 0
                      ) {
                        projects = task.project_details.map((p) => ({
                          code: p.code ?? p.projectCode ?? "-",
                          name: p.name ?? p.projectName ?? "-",
                        }));
                      }

                      // case 2: single embedded object
                      else if (
                        task.project &&
                        typeof task.project === "object"
                      ) {
                        projects = [
                          {
                            code:
                              task.project.code ??
                              task.project.projectCode ??
                              "-",
                            name:
                              task.project.name ??
                              task.project.projectName ??
                              "-",
                          },
                        ];
                      }

                      // case 3: flat fields
                      else if (task.project_code || task.project_name) {
                        projects = [
                          {
                            code: task.project_code ?? "-",
                            name: task.project_name ?? "-",
                          },
                        ];
                      }

                      if (projects.length === 0) {
                        return <Typography fontWeight="lg">N/A</Typography>;
                      }

                      if (projects.length === 1) {
                        return (
                          <div>
                            <Typography fontWeight="lg">
                              {projects[0].code}
                            </Typography>
                            <Typography level="body-sm" sx={{ color: "#666" }}>
                              {projects[0].name}
                            </Typography>
                          </div>
                        );
                      }

                      // >1 projects with tooltip
                      return (
                        <Tooltip
                          title={
                            <Box
                              sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}
                            >
                              {projects.slice(1).map((p, i) => (
                                <Box key={`${p.code}-${i}`} sx={{ mb: 1 }}>
                                  <Typography level="body-md" fontWeight="lg">
                                    {p.code}
                                  </Typography>
                                  <Typography level="body-sm">
                                    {p.name}
                                  </Typography>
                                  {i !== projects.length - 2 && (
                                    <Box
                                      sx={{ height: 1, bgcolor: "#eee", my: 1 }}
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
                                {projects[0].code}
                              </Typography>
                              <Typography level="body-sm">
                                {projects[0].name}
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
                              +{projects.length - 1}
                            </Box>
                          </Box>
                        </Tooltip>
                      );
                    })()}
                  </td>

                  <td
                    style={{
                      padding: 8,
                      borderBottom: "1px solid #ddd",
                      maxWidth: 200,
                    }}
                  >
                    <Tooltip
                      title={
                        <Typography
                          sx={{ whiteSpace: "pre-line", maxWidth: 300 }}
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
                          maxWidth: 180,
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

                  <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
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
                <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
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
          pt: 1,
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
            onChange={handlePageSize}
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
