// src/pages/Approvals/My_Requests.jsx
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import Avatar from "@mui/joy/Avatar";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, CircularProgress, Option, Select } from "@mui/joy";
import { useTheme } from "@emotion/react";
import NoData from "../../assets/alert-bell.svg";
import { useGetRequestsQuery } from "../../redux/ApprovalsSlice";

function My_Requests() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(
    parseInt(searchParams.get("page") || "1", 10),
    1
  );
  const rowsPerPage = Math.max(
    parseInt(searchParams.get("pageSize") || "10", 10),
    1
  );
  const searchQuery = (searchParams.get("q") || "").trim();
  const options = [5, 10, 25, 50, 100];

  const [selected, setSelected] = useState([]);

  const patchParams = (patchObj) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(patchObj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const status = searchParams.get("status") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const dependency_model = searchParams.get("dependency_model") || "";
  const { data: getRequests = {}, isLoading } = useGetRequestsQuery({
    page: currentPage,
    status: status,
    createdAtFrom: from,
    createdAtTo: to,
    dependency_model: dependency_model,
    search: searchQuery.toLowerCase(),
    limit: rowsPerPage,
  });

  const requests = getRequests?.requests || [];
  const totalPages = Math.ceil(getRequests?.total / getRequests?.limit) || 1;

  const handleSearch = (value) => {
    patchParams({ q: value, page: 1 });
  };

  const handlePageChange = (page) => {
    const max = Math.max(1, Number(totalPages) || 1);
    const next = Math.min(Math.max(1, Number(page) || 1), max);
    patchParams({ page: next });
  };

  const handleRowsChange = (newValue) => {
    if (newValue !== null) {
      patchParams({ pageSize: newValue, page: 1 });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelected(requests.map((row) => row._id));
    else setSelected([]);
  };

  const handleRowSelect = (_id) =>
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]
    );

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const ProjectOverView = ({ currentPage, project_id, code }) => {
    if (!project_id) {
      return (
        <Chip
          variant="soft"
          color="neutral"
          size="sm"
          disabled
          sx={{ borderRadius: 999 }}
        >
          -
        </Chip>
      );
    }

    return (
      <Chip
        onClick={() =>
          navigate(
            `/project_detail?page=${currentPage}&project_id=${project_id}`
          )
        }
        title={code || "Open project"}
        variant="solid"
        color="primary"
        size="md"
        sx={{
          fontWeight: 600,
          fontSize: 13,
          borderRadius: "20px",
          cursor: "pointer",
          maxWidth: 200,
        }}
      >
        {code || "-"}
      </Chip>
    );
  };

  const ApproverAvatars = ({ approvers = [], max = 3 }) => {
    const users =
      approvers?.filter((a) => a?.user_id).map((a) => a.user_id) || [];
    if (!users.length) return <span>-</span>;

    const visible = users.slice(0, max);
    const extra = users.length - max;

    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {visible.map((u, idx) => (
          <Tooltip key={u._id || idx} title={u.name} arrow disablePortal>
            <Avatar
              src={u.attachment_url || undefined}
              alt={u.name}
              sx={{
                width: 28,
                height: 28,
                fontSize: 12,
                border: "2px solid #fff",
                ml: idx === 0 ? 0 : -1.2,
                zIndex: visible.length - idx,
                backgroundColor: "#ccc",
                transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
                "&:hover": {
                  transform: "translateY(-3px)",
                  zIndex: 100,
                },
                cursor: "pointer",
              }}
              onClick={() => navigate(`/user_profile?user_id=${u._id}`)}
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
              transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
              "&:hover": { animation: "upDown 0.6s infinite", zIndex: 100 },
              "@keyframes upDown": {
                "0%": { transform: "translateY(0)" },
                "25%": { transform: "translateY(-3px)" },
                "50%": { transform: "translateY(0)" },
                "75%": { transform: "translateY(3px)" },
                "100%": { transform: "translateY(0)" },
              },
              cursor: "pointer",
            }}
          >
            {`+${extra}`}
          </Avatar>
        )}
      </Box>
    );
  };

  const AvatarProfile = ({ current }) => {
    const u = current?.user_id || current;
    if (!u) return <span>-</span>;
    return (
      <Tooltip title={u.name} arrow disablePortal>
        <Avatar
          src={u.attachment_url || undefined}
          alt={u.name}
          sx={{
            width: 28,
            height: 28,
            fontSize: 12,
            backgroundColor: "#ccc",
            transition: "transform 0.3s cubic-bezier(.68,-0.55,.27,1.55)",
            "&:hover": { transform: "translateY(-3px)", zIndex: 100 },
            cursor: "pointer",
          }}
          onClick={() => navigate(`/user_profile?user_id=${u._id}`)}
        >
          {getInitials(u.name)}
        </Avatar>
      </Tooltip>
    );
  };

  // ------- Chips & Timeline -------
  const StatusChip = ({ label, color = "neutral", sx = {} }) => {
    const bg = {
      success: "#e8f5e9",
      danger: "#fde7e9",
      warning: "#fff3e0",
      neutral: "#f1f1f1",
    }[color];
    const text = {
      success: "#2e7d32",
      danger: "#c62828",
      warning: "#b26a00",
      neutral: "#424242",
    }[color];
    const border = {
      success: "#c8e6c9",
      danger: "#ffcdd2",
      warning: "#ffe0b2",
      neutral: "#e0e0e0",
    }[color];

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.2,
          py: 0.4,
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 700,
          lineHeight: 1,
          background: bg,
          color: text,
          border: `1px solid ${border}`,
          ...sx,
        }}
      >
        {label}
      </Box>
    );
  };

  const getAggregateStatus = (approvers = []) => {
    if (!approvers?.length) return "pending";
    const norm = approvers.map((a) =>
      String(a?.status || "")
        .toLowerCase()
        .trim()
    );
    if (norm.includes("rejected")) return "rejected";
    if (norm.length && norm.every((s) => s === "approved")) return "approved";
    return "pending";
  };

  // ---------- Stage Timeline (SOOTHING, WHITE) ----------
  const StageTimeline = ({ approvers = [], current_approver }) => {
    const soft = {
      textPrimary: "#2f3a4a",
      textMuted: "#6b778c",
      rowBg: "#f6f9ff",
      track: "#e9eef7",
      bar: "#2f6fed",
      dotDefault: "#a9b4c4",
      dotBlue: "#3b82f6",
      dotGreen: "#34c759",
      dotRed: "#ef4444",
    };

    const statusOf = (v) => (v ? String(v).toLowerCase().trim() : "pending");

    const norm = approvers.map((a) => ({ ...a, _s: statusOf(a.status) }));
    const total = norm.length || 1;
    const approved = norm.filter((a) => a._s === "approved").length;
    const pct = Math.round((approved / total) * 100);

    const fmt = (d) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date)) return "";
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const duration = (start, end) => {
      if (!start || !end) return "";
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s) || isNaN(e)) return "";
      const ms = e - s;
      const m = Math.floor(ms / 60000);
      if (m < 60) return `(${m}m)`;
      const h = Math.floor(m / 60);
      const rm = m % 60;
      if (h < 24) return `(${h}h ${rm}m)`;
      const d = Math.floor(h / 24);
      const rh = h % 24;
      return `(${d}d ${rh}h)`;
    };

    const dotColorFor = (a, isCurrent) => {
      if (isCurrent) return soft.dotBlue; 
      if (a._s === "approved") return soft.dotGreen;
      if (a._s === "rejected") return soft.dotRed;
      if (a._s === "pending") return soft.dotBlue;
      return soft.dotDefault;
    };

    return (
      <Box sx={{ minWidth: 320, p: 1, bgcolor: "#fff", borderRadius: 2 }}>
        <Typography
          level="body-sm"
          sx={{ fontWeight: 700, mb: 1, color: soft.textPrimary }}
        >
          Stage timeline
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: 8,
            borderRadius: 999,
            background: soft.track,
            mb: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${pct}%`,
              height: "100%",
              background: soft.bar,
              borderRadius: 999,
              transition: "width .3s ease",
            }}
          />
        </Box>

        {norm.map((a, idx) => {
          const isCurrent =
            current_approver && a.sequence === current_approver.sequence;
          const start = a.actionAt || a.createdAt;
          const end = a.updatedAt || a.resolvedAt;
          const timeLine =
            (fmt(start) && fmt(end) && `${fmt(start)} → ${fmt(end)}`) ||
            fmt(start) ||
            fmt(end) ||
            "";

          return (
            <Box
              key={a._id || idx}
              sx={{
                display: "grid",
                gridTemplateColumns: "12px 1fr",
                columnGap: 10,
                alignItems: "start",
                borderRadius: 10,
                px: 1,
                py: 0.6,
                mb: 0.4,
                background: isCurrent ? soft.rowBg : "transparent",
              }}
            >
              <Box
                sx={{
                  mt: 0.55,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: dotColorFor(a, isCurrent),
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? "#1f4bd8" : soft.textPrimary,
                  }}
                >
                  {a.user_id?.name || a.stage_name || "Draft"}
                </Typography>
                {timeLine && (
                  <Typography
                    sx={{ fontSize: 12, color: soft.textMuted, mt: 0.25 }}
                  >
                    {timeLine}{" "}
                    {duration(start, end) ? ` ${duration(start, end)}` : ""}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: 0,
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
              placeholder="Search by ProjectId, Approval Code..."
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
            <tr>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 101,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                <Checkbox
                  size="sm"
                  checked={
                    selected?.length === requests?.length && !!requests.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected?.length > 0 && selected?.length < requests?.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Approval Code",
                "Category",
                "Item",
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
                    zIndex: 101,
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
                    <CircularProgress size="sm" sx={{ mb: 1 }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request, index) => {
                const agg = getAggregateStatus(request.approvers);
                const statusChip =
                  agg === "approved" ? (
                    <StatusChip label="Approved" color="success" />
                  ) : agg === "rejected" ? (
                    <StatusChip label="Rejected" color="danger" />
                  ) : (
                    <StatusChip label="Pending" color="warning" />
                  );

                const createdAtStr = (() => {
                  const d = new Date(request.createdAt);
                  return isNaN(d)
                    ? request.createdAt || "-"
                    : d.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                })();

                return (
                  <tr key={request._id || index}>
                    {/* select */}
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
                        onChange={() => handleRowSelect(request._id)}
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
                      <Tooltip title="View request detail" arrow disablePortal>
                        <span>
                          <ProjectOverView
                            currentPage={currentPage}
                            project_id={request?.project?._id}
                            code={request?.project?.code}
                          />
                        </span>
                      </Tooltip>
                    </td>

                    {/* Approval Code */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Chip variant="outlined" color="primary">
                        {request.approval_code || "-"}
                      </Chip>
                    </td>

                    {/* Category */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {request.dependency_model
                        ? request.dependency_model.charAt(0).toUpperCase() +
                          request.dependency_model.slice(1)
                        : "-"}
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {request.dependency_name
                        ? request.dependency_name.charAt(0).toUpperCase() +
                          request.dependency_name.slice(1)
                        : "-"}
                    </td>

                    {/* Approvers */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <ApproverAvatars approvers={request.approvers} max={3} />
                    </td>

                    {/* Current approver */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <AvatarProfile current={request.current_approver} />
                    </td>

                    {/* Status + timeline tooltip */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Tooltip
                        disablePortal
                        arrow
                        placement="right"
                        variant="soft"
                        slotProps={{
                          tooltip: {
                            sx: {
                              bgcolor: "#fff",
                              borderRadius: "12px",
                              border: "1px solid #eef2f7",
                              p: 0,
                              maxWidth: 380,
                            },
                          },
                          arrow: { sx: { color: "#fff" } },
                        }}
                        title={
                          request.approvers?.length ? (
                            <StageTimeline
                              approvers={request.approvers}
                              current_approver={request.current_approver}
                            />
                          ) : (
                            "No timeline"
                          )
                        }
                      >
                        <Box sx={{ display: "inline-block" }}>{statusChip}</Box>
                      </Tooltip>
                    </td>

                    {/* Created by */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <AvatarProfile current={request.created_by} />
                    </td>

                    {/* Created at */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {createdAtStr}
                    </td>
                  </tr>
                );
              })
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
                      style={{ width: 50, height: 50, marginBottom: 8 }}
                    />
                    <Typography fontStyle="italic">
                      No requests found
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
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>

        <Box>Showing {requests?.length} results</Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {/* show previous page number if exists */}
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

          {/* current page */}
          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>

          {/* next page number if exists */}
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

        <Box display="flex" alignItems="center" gap={1} sx={{ p: "8px 16px" }}>
          <Select
            value={rowsPerPage}
            onChange={(_, newValue) => handleRowsChange(newValue)}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default My_Requests;
