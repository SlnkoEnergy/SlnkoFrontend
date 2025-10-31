// pages/DPRTable.jsx
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  Input,
  Option,
  Select,
  Sheet,
  Tooltip,
  Typography,
  Chip,
} from "@mui/joy";
import { iconButtonClasses } from "@mui/joy/IconButton";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";

// ----- Mock rows (replace with API later) -----
const MOCK_ROWS = [
  {
    _id: "u1-a1",
    engineer_name: "Rahul Verma",
    activity_name: "Module Mounting Structure",
    work_completion: { value: 120, unit: "m" },
  },
  {
    _id: "u2-a1",
    engineer_name: "Priya Singh",
    activity_name: "DC Cabling",
    work_completion: { value: 45, unit: "percentage" },
  },
  {
    _id: "u3-a1",
    engineer_name: "Aman Gupta",
    activity_name: "Inverter Installation",
    work_completion: { value: 3, unit: "number" },
  },
  {
    _id: "u4-a1",
    engineer_name: "Neha Sharma",
    activity_name: "Earthing",
    work_completion: { value: 600, unit: "kg" },
  },
];

function DPRTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== URL-backed state =====
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSizeFromUrl = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
  const searchFromUrl = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);

  // keep local state in sync with URL nav (back/forward)
  useEffect(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const ps = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const s = searchParams.get("search") || "";
    setCurrentPage(p);
    setRowsPerPage(ps);
    setSearchQuery(s);
  }, [searchParams]);

  // ===== Selection =====
  const [selected, setSelected] = useState([]);
  const options = [1, 5, 10, 20, 50, 100];

  // ===== Data (mock now, API later) =====
  const isLoading = false; // set to true while integrating API
  const allRows = MOCK_ROWS;

  // search filter (case-insensitive on engineer/activity/unit/value)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => {
      const unit = r.work_completion?.unit ?? "";
      const val = String(r.work_completion?.value ?? "");
      return (
        (r.engineer_name || "").toLowerCase().includes(q) ||
        (r.activity_name || "").toLowerCase().includes(q) ||
        unit.toLowerCase().includes(q) ||
        val.includes(q)
      );
    });
  }, [allRows, searchQuery]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(startIdx, startIdx + rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("page", String(page));
        p.set("pageSize", String(rowsPerPage));
        p.set("search", searchQuery || "");
        return p;
      });
      setCurrentPage(page);
      setSelected([]); // reset selection on page change (optional)
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(pageRows.map((r) => r._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]
    );
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("search", query);
      p.set("page", "1");
      p.set("pageSize", String(rowsPerPage));
      return p;
    });
    setCurrentPage(1);
  };

  const renderWorkCompletion = (wc) => {
    if (!wc || wc.value === undefined || wc.value === null) return "-";
    const unit = wc.unit || "number";
    // For "%" display, uncomment next line:
    // const unitLabel = unit === "percentage" ? "%" : unit;
    const unitLabel = unit;
    return (
      <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 600 }}>
        {wc.value} {unitLabel}
      </Chip>
    );
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Header row (Search only; no tabs) */}
      <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              pt={2}
              pb={0.5}
              flexWrap="wrap"
              gap={1}
            >
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
              placeholder="Search by ProjectId, Customer, Type, or State"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                  width: 48,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={
                    pageRows.length > 0 && selected.length === pageRows.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < pageRows.length
                  }
                />
              </th>
              {["Engineer Name", "Activity Name", "Work Completion"].map(
                (header) => (
                  <th
                    key={header}
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
                )
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ padding: "8px" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ mb: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : pageRows.length > 0 ? (
              pageRows.map((row) => (
                <tr key={row._id}>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selected.includes(row._id)}
                      onChange={() => handleRowSelect(row._id)}
                    />
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    <Tooltip title="Engineer" arrow>
                      <span style={{ fontWeight: 600 }}>{row.engineer_name}</span>
                    </Tooltip>
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {row.activity_name || "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                    {renderWorkCompletion(row.work_completion)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: "8px", textAlign: "left" }}>
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
                    <Typography fontStyle="italic">No DPR entries found</Typography>
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
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        <Box>Showing {pageRows.length} results</Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
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

          <IconButton size="sm" variant="solid" color="neutral">
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

        <Box display="flex" alignItems="center" gap={1} sx={{ p: "8px 16px" }}>
          <Select
            value={rowsPerPage}
            onChange={(_, v) => {
              if (v != null) {
                setRowsPerPage(v);
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set("pageSize", String(v));
                  p.set("page", "1");
                  p.set("search", searchQuery || "");
                  return p;
                });
                setCurrentPage(1);
                setSelected([]);
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
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
  );
}

export default DPRTable;
