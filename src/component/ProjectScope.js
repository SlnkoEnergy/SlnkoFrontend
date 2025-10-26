import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllScopesQuery } from "../redux/camsSlice";
import NoData from "../assets/alert-bell.svg";

function Project_Scope({ selected, setSelected }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    Number(searchParams.get("pageSize")) || 20
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const cam_member = searchParams.get("cam") || "";
  const project_id = searchParams.get("project_id") || "";
  const state = searchParams.get("state") || "";
  const item_id = searchParams.get("category") || "";
  const scope = searchParams.get("scope") || "";
  const po_status = searchParams.get("po_status") || "";
  const delivery_date_from = searchParams.get("from") || "";
  const delivery_date_to = searchParams.get("to") || "";
  const etd_date_from = searchParams.get("etdFrom") || "";
  const etd_date_to = searchParams.get("etdTo") || "";
  const po_date_from = searchParams.get("poDateFrom") || "";
  const po_date_to = searchParams.get("poDateTo") || "";

  const {
    data: scopeData = {},
    isLoading,
    isFetching,
  } = useGetAllScopesQuery({
    page: currentPage,
    limit: rowsPerPage,
    search: searchQuery,
    cam_person: cam_member,
    project_id: project_id,
    state: state,
    item_name: item_id,
    scope: scope,
    po_status: po_status,
    delivered_from: delivery_date_from,
    delivery_to: delivery_date_to,
    etd_from: etd_date_from,
    etd_to: etd_date_to,
    po_date_from: po_date_from,
    po_date_to: po_date_to,
  });

  const rows = scopeData?.data || [];
  const total = scopeData?.total || 0;
  const totalPages = scopeData?.totalPages || 1;
  const count = scopeData?.count || 0;

  const options = [10, 20, 50, 100, 500, 1000];

  // --- search ---
  const handleSearch = (value) => {
    setSearchQuery(value);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("search", value);
      params.set("page", 1);
      return params;
    });
  };

  // --- pagination ---
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", page);
        return params;
      });
    }
  };

  // --- checkbox logic ---
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((row) => row._id)); // Store the _id of all rows
    } else {
      setSelected([]); // Deselect all
    }
  };

  const handleRowSelect = (id) => {
    setSelected(
      (prev) =>
        prev.includes(id)
          ? prev.filter((itemId) => itemId !== id) // Remove _id if already selected
          : [...prev, id] // Add _id to selected
    );
  };

  // --- utils ---
  const pad2 = (n) => String(n).padStart(2, "0");
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  const capitalize = (str) => {
    if (str == null || str === "") return "-";
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const prettyStatus = (s) => {
    if (!s) return "-";
    return String(s)
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getScopeColor = (scope) => {
    if (!scope || scope.toLowerCase() === "no")
      return { color: "neutral", label: "Waiting" };
    if (scope.toLowerCase() === "slnko")
      return { color: "success", label: "Slnko" };
    if (scope.toLowerCase() === "client")
      return { color: "danger", label: "Client" };
    return { color: "neutral", label: capitalize(String(scope)) };
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
        px: 0,
        overflowX: "hidden", // prevent entire UI from scrolling horizontally
      }}
    >
      {/* Header + Search */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pb={1}
        flexWrap="wrap"
      >
        <Input
          size="sm"
          placeholder="Search by Project, Item..."
          startDecorator={<SearchIcon />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ width: { xs: "100%", md: "50%" } }}
        />
      </Box>

      {/* Table */}
      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: "68vh",
          overflowY: "auto", // vertical scroll
          overflowX: "auto", // 👈 horizontal scroll only INSIDE the table container
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            minWidth: 1400, // 👈 force a min width so horizontal scroll appears here
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
                  textAlign: "center",
                  fontWeight: "bold",
                  width: 40,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={rows.length > 0 && selected.length === rows.length}
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              {[
                // Table Headers
                "Project ID",
                "Project Name",
                "Project Group",
                "State",
                "kWp / DC",
                "CAM Person",
                "Item Name",
                "Scope",
                "PO Number(s)",
                "PO Status",
                "PO Date",
                "ETD",
                "Delivered Date",
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
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading || isFetching ? (
              <tr>
                <td
                  colSpan={14}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  <CircularProgress size="sm" />
                  <Typography level="body-sm" sx={{ mt: 1 }}>
                    Loading...
                  </Typography>
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row, index) => {
                const scopeObj = getScopeColor(row.scope);
                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: selected.includes(row._id)
                        ? "rgba(0, 0, 0, 0.04)"
                        : "transparent",
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(row._id)}
                        onChange={() => handleRowSelect(row._id)}
                      />
                    </td>

                    <td style={{ padding: "8px" }}>
                      <Chip
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          navigate(
                            `/project_detail?project_id=${row.project_id_full}`
                          );
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        {row.project_id}
                      </Chip>
                    </td>
                    <td style={{ padding: "8px" }}>{row.project_name}</td>
                    <td style={{ padding: "8px" }}>{row.project_group}</td>
                    <td style={{ padding: "8px" }}>{capitalize(row.state)}</td>
                    <td style={{ padding: "8px" }}>
                      {row.kwp && row.dc ? `${row.kwp} / ${row.dc}` : "-"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {capitalize(row.cam_person)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {capitalize(row.item_name)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <Chip
                        size="sm"
                        color={scopeObj.color}
                        variant="soft"
                        sx={{ fontWeight: 600, textTransform: "capitalize" }}
                      >
                        {scopeObj.label}
                      </Chip>
                    </td>
                    <td style={{ padding: "8px" }}>{row.po_number}</td>
                    <td style={{ padding: "8px" }}>
                      {prettyStatus(row.po_status)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {formatDate(row.po_date)}
                    </td>
                    <td style={{ padding: "8px" }}>{formatDate(row.etd)}</td>
                    <td style={{ padding: "8px" }}>
                      {formatDate(row.delivered_date)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={14}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  <Box
                    sx={{
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
                      No Scope Records Found
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
        sx={{
          pt: 1,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box
          display={"flex"}
          gap={2}
          justifyContent={"center"}
          alignItems={"center"}
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

          <Typography level="body-sm">
            Page {currentPage} of {totalPages} ({count} results)
          </Typography>
        </Box>

        <Box
          display={"flex"}
          gap={2}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Select
              size="sm"
              value={rowsPerPage}
              onChange={(e, newValue) => {
                if (newValue) {
                  setRowsPerPage(newValue);
                  setSearchParams((prev) => {
                    const params = new URLSearchParams(prev);
                    params.set("pageSize", newValue);
                    params.set("page", 1);
                    return params;
                  });
                }
              }}
              sx={{ minWidth: 80 }}
            >
              {options.map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
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
      </Box>
    </Box>
  );
}

export default Project_Scope;
