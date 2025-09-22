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
import Avatar from "@mui/joy/Avatar"; // ⬅️ NEW
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress, Option, Select, Tab, TabList, Tabs } from "@mui/joy";
import NoData from "../../assets/alert-bell.svg";
import { useGetHandOverQuery } from "../../redux/camsSlice";
import { useTheme } from "@emotion/react";
import { Add } from "@mui/icons-material";
import { useGetRequestsQuery } from "../../redux/ApprovalsSlice";

function My_Requests() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
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
    data: getRequests = {},
    isLoading,
    refetch,
  } = useGetRequestsQuery({
    page: currentPage,
    status: statusFilter,
    search: searchQuery,
    limit: rowsPerPage,
  });

  const requests = getRequests?.requests;
  const totalPages = getRequests?.total;

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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(requests.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  // === helpers for avatars ===
  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const ApproverAvatars = ({ approvers = [], max = 3 }) => {
    const users = approvers
      ?.filter((a) => a?.user_id) // skip null user_id
      .map((a) => a.user_id) || [];

    if (!users.length) return <span>-</span>;

    const visible = users.slice(0, max);
    const extra = users.length - visible.length;

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {visible.map((u, idx) => (
          <Tooltip key={u._id} title={u.name} arrow>
            <Avatar
              src={u.attachment_url || undefined}
              alt={u.name}
              sx={{
                width: 28,
                height: 28,
                fontSize: 12,
                border: "2px solid #fff",
                ml: idx === 0 ? 0 : -1.2, // overlap amount
                zIndex: visible.length - idx, // keep leftmost on top
                backgroundColor: "#ccc",
              }}
            >
              {getInitials(u.name)}
            </Avatar>
          </Tooltip>
        ))}
        {extra > 0 && (
          <Avatar
            variant="outlined"
            sx={{
              width: 28,
              height: 28,
              fontSize: 12,
              ml: -1.2,
              backgroundColor: theme.vars.palette.background.surface,
            }}
          >
            {`+${extra}`}
          </Avatar>
        )}
      </Box>
    );
  };

  const CurrentApproverAvatar = ({ current }) => {
    const u = current?.user_id;
    if (!u) return <span>-</span>;
    return (
      <Tooltip title={u.name} arrow>
        <Avatar
          src={u.attachment_url || undefined}
          alt={u.name}
          sx={{ width: 28, height: 28, fontSize: 12, backgroundColor: "#ccc" }}
        >
          {getInitials(u.name)}
        </Avatar>
      </Tooltip>
    );
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
      <Box display={"flex"} justifyContent={"flex-end"} pb={0.5}>
        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: "sm",
            py: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            width: { lg: "50%" },
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
                  checked={selected?.length === requests?.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected?.length > 0 &&
                    selected?.length < requests?.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Category",
                "Approvers",
                "Current Approver",
                "Status",
                "Created By",
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
            ) : requests?.length > 0 ? (
              requests.map((request, index) => (
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
                      checked={selected.includes(request._id)}
                      onChange={(event) =>
                        handleRowSelect(request._id, event.target.checked)
                      }
                    />
                  </td>

                  {/* Project Id */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Tooltip title="View request Detail" arrow>
                      <span>
                        <ProjectOverView
                          currentPage={currentPage}
                          project_id={request?.project?._id}
                          code={request?.project?.code}
                        />
                      </span>
                    </Tooltip>
                  </td>

                  {/* Category */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {request.model_name || "-"}
                  </td>

                  {/* Approvers (overlapping avatars) */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <ApproverAvatars approvers={request.approvers} max={3} />
                  </td>

                  {/* Current Approver (single avatar) */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <CurrentApproverAvatar current={request.current_approver} />
                  </td>

                  {/* Status */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {request.current_approver?.status || "-"}
                  </td>

                  {/* Created By */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {request?.created_by?.name || "-"}
                  </td>

                  {/* Created At */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {request.createdAt}
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
          // onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Box>Showing {requests?.length} results</Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {currentPage > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              // onClick={() => handlePageChange(currentPage - 1)}
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
              // onClick={() => handlePageChange(currentPage + 1)}
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
          // onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
export default My_Requests;
