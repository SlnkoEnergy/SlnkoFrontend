// Dash_templates.jsx
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
import Typography from "@mui/joy/Typography";
import { CircularProgress, Option, Select } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Optional row shape if you pass data later:
 * {
 *   _id?: string,          // internal id
 *   template_id: string,   // shown in "Template Id"
 *   name: string,          // shown in "Template Name"
 *   created_by: string,    // shown in "Created By"
 *   description: string,   // shown in "Description"
 * }
 */
function TemplateTable({ rows = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const options = [10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );

  // ---- NO API: local filter/sort/paginate only -----------------------------
  const filteredAndSortedData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = Array.isArray(rows) ? rows : [];
    const filtered = q
      ? base.filter((r) =>
          ["template_id", "name", "created_by", "description"].some((k) =>
            String(r?.[k] ?? "").toLowerCase().includes(q)
          )
        )
      : base;

    // keep a deterministic order; change to whatever you prefer
    return [...filtered].sort((a, b) =>
      String(a?.name ?? "").localeCompare(String(b?.name ?? ""))
    );
  }, [rows, searchQuery]);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const total = filteredAndSortedData.length;
  const pageSize = Number(rowsPerPage || 1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const start = (currentPage - 1) * pageSize;
  const paginatedRows = filteredAndSortedData.slice(start, start + pageSize);
  const draftTemplates = paginatedRows; // keep naming consistent with your layout

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
      setSelected([]); // clear selection when page changes
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
    // reset to page 1 on new search
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", 1);
      return p;
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(draftTemplates.map((row, i) => row._id ?? `${start + i}`));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
      {/* ==== HEADER BAR (same placement) =================================== */}
      <Box display={"flex"} justifyContent={"space-between"} pb={0.5}>
        <Box /> {/* left side empty (tabs removed, keeps spacing identical) */}

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
              placeholder="Search by Template Id, Name, Created By, or Description"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      {/* ==== TABLE (same look) ============================================ */}
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
                  checked={
                    draftTemplates.length > 0 &&
                    selected.length === draftTemplates.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < draftTemplates.length
                  }
                />
              </th>
              {["Template Id", "Template Name", "Created By", "Description"].map(
                (header, index) => (
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
                )
              )}
            </tr>
          </thead>

          <tbody>
            {/* no API: no loading spinner; keep empty state styling same-ish */}
            {draftTemplates.length > 0 ? (
              draftTemplates.map((row, index) => {
                const rowId = row._id ?? `${start + index}`;
                return (
                  <tr key={rowId}>
                    <td style={tdCell}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(rowId)}
                        onChange={() => handleRowSelect(rowId)}
                      />
                    </td>
                    <td style={tdCell}>{row.template_id ?? "-"}</td>
                    <td style={tdCell}>{row.name ?? "-"}</td>
                    <td style={tdCell}>{row.created_by ?? "-"}</td>
                    <td style={{ ...tdCell, maxWidth: 600 }}>
                      <span style={ellipsis}>{row.description ?? "-"}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "8px", textAlign: "left" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                    }}
                  >
                    <Typography fontStyle="italic">
                      No Templates Found
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* ==== PAGINATION (same placement & style) =========================== */}
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

        <Box>Showing {draftTemplates.length} results</Box>

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

        <Box display="flex" alignItems="center" gap={1} sx={{ p: "8px 16px" }}>
          <Select
            value={rowsPerPage}
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  params.set("page", "1");
                  return params;
                });
                setCurrentPage(1);
              }
            }}
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
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

const tdCell = {
  borderBottom: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  verticalAlign: "top",
};

const ellipsis = {
  display: "inline-block",
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default TemplateTable;
