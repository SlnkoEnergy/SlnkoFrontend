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
import { useGetAllProjectActivitiesQuery } from "../redux/projectsSlice";

function TemplateTable({ rows = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const options = [10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const searchFromUrl = searchParams.get("q") || "";

  useEffect(() => {
    setSearchQuery(searchFromUrl);
    setCurrentPage(pageFromUrl || 1);
  }, [searchFromUrl, pageFromUrl]);

  const { data, isLoading, isError, error } = useGetAllProjectActivitiesQuery({
    search: searchFromUrl,
    status: "template",
    page: pageFromUrl || 1,
    limit: rowsPerPage,
  });

  const apiRows = data?.rows || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const inputRows = rows.length ? rows : apiRows;

  const filteredAndSortedData = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    const base = Array.isArray(inputRows) ? inputRows : [];
    const filtered = q
      ? base.filter((r) =>
          ["template_code", "template_name", "created_by", "description"].some(
            (k) =>
              String(r?.[k] ?? "")
                .toLowerCase()
                .includes(q)
          )
        )
      : base;

    return [...filtered].sort((a, b) =>
      String(a?.template_name ?? "").localeCompare(
        String(b?.template_name ?? "")
      )
    );
  }, [inputRows, searchQuery]);

  const draftTemplates = filteredAndSortedData;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(page));
      return p;
    });
    setCurrentPage(page);
    setSelected([]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("q", query);
      p.set("page", "1");
      return p;
    });
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* ==== HEADER BAR ===================================================== */}
      <Box display={"flex"} justifyContent={"space-between"} pb={0.5}>
        <Box />
        <Box
          className="SearchAndFilters-tabletUp"
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
              placeholder="Search by Template Code, Name, Created By, or Description"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      {/* ==== TABLE ========================================================== */}
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
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(
                        draftTemplates.map((row, i) => row._id ?? `${i}`)
                      );
                    } else {
                      setSelected([]);
                    }
                  }}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < draftTemplates.length
                  }
                />
              </th>
              {[
                "Template Code",
                "Template Name",
                "Created By",
                "Description",
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
                <td colSpan={5} style={{ padding: "12px", textAlign: "left" }}>
                  <CircularProgress size="sm" />
                  <span style={{ marginLeft: 8 }}>Loading…</span>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} style={{ padding: "12px", textAlign: "left" }}>
                  <Typography color="danger">
                    Failed to load data
                    {error?.data?.message ? `: ${error.data.message}` : ""}
                  </Typography>
                </td>
              </tr>
            ) : draftTemplates.length > 0 ? (
              draftTemplates.map((row, index) => {
                const rowId = row._id ?? `${index}`;
                return (
                  <tr key={rowId}>
                    <td style={tdCell}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(rowId)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(rowId)
                              ? prev.filter((x) => x !== rowId)
                              : [...prev, rowId]
                          )
                        }
                      />
                    </td>
                    <td style={tdCell}>{row.template_code ?? "-"}</td>
                    <td style={tdCell}>{row.template_name ?? "-"}</td>
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
                      alignItems: "center",
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

      {/* ==== PAGINATION ===================================================== */}
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

        <Box>
          Showing {draftTemplates.length} of {total} results
        </Box>

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
                  params.set("pageSize", String(newValue));
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
