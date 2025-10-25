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
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import { Chip, CircularProgress, Option, Select } from "@mui/joy";
import { useGetAllVendorsQuery } from "../redux/vendorSlice";

const AllVendors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const readInt = (key, fallback) => {
    const v = parseInt(searchParams.get(key) || "", 10);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };
  const readStr = (key, fallback) => {
    const v = searchParams.get(key);
    return v != null ? v : fallback;
  };
  const updateParams = (partial) => {
    const current = Object.fromEntries(searchParams.entries());
    Object.entries(partial).forEach(([k, v]) => {
      if (v === undefined || v === "") delete current[k];
      else current[k] = String(v);
    });
    setSearchParams(current);
  };

  const initialPage = readInt("page", 1);
  const initialPageSize = readInt("pageSize", 10);
  const initialSearch = readStr("search", "");

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selected, setSelected] = useState([]);

  const {
    data: getVendor,
    isLoading,
    error,
  } = useGetAllVendorsQuery({
    page: currentPage,
    limit: perPage,
    search: searchQuery,
  });

  const total = getVendor?.pagination?.total || 0;
  const count = getVendor?.pagination?.limit || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const startIndex = total ? (currentPage - 1) * perPage + 1 : 0;
  const endIndex = Math.min(startIndex + count - 1, total);

  const getPaginationRange = () => {
    const siblings = 1;
    const pages = [];
    if (totalPages <= 5 + siblings * 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - siblings, 2);
      const right = Math.min(currentPage + siblings, totalPages - 1);
      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const paginatedVendor = useMemo(() => {
    return Array.isArray(getVendor?.data) ? getVendor.data : [];
  }, [getVendor]);

  // ---- Handlers ----
  const handleSearch = (query) => {
    const q = (query || "").trim();
    setSearchQuery(q);
    updateParams({ search: q || undefined, page: 1, pageSize: perPage });
    setCurrentPage(1);
    setSelected([]);
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedVendor.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handlePageChange = (page) => {
    const next = Math.max(1, Math.min(page, totalPages));
    if (next !== currentPage) {
      setCurrentPage(next);
      updateParams({
        page: next,
        pageSize: perPage,
        search: searchQuery || undefined,
      });
      setSelected([]);
    }
  };

  const handlePageSizeChange = (newValue) => {
    const size = Number(newValue || 10);
    setPerPage(size);
    setCurrentPage(1);
    updateParams({ page: 1, pageSize: size, search: searchQuery || undefined });
    setSelected([]);
  };

  useEffect(() => {
    const page = readInt("page", 1);
    const size = readInt("pageSize", 10);
    const search = readStr("search", "");
    setCurrentPage(page);
    setPerPage(size);
    setSearchQuery(search);
  }, [searchParams]);

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
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
              placeholder="Search by Vendor Name, Email, Phone"
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
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
            <Box component="tr">
              <Box
                component="th"
                sx={{
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
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < paginatedVendor.length
                  }
                  checked={
                    selected.length === paginatedVendor.length &&
                    paginatedVendor.length > 0
                  }
                  onChange={handleSelectAll}
                  color={selected.length > 0 ? "primary" : "neutral"}
                />
              </Box>

              {["Vendor Name", "Email", "Phone", "State", "Type"].map(
                (header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
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
                    {header && header.length > 15 ? (
                      <span title={header}>{header.slice(0, 15) + "..."}</span>
                    ) : (
                      header
                    )}
                  </Box>
                )
              )}
            </Box>
          </Box>

          <Box component="tbody">
            {error ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                >
                  <Typography color="danger" textAlign="center">
                    {String(error)}
                  </Typography>
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ padding: "8px", textAlign: "center" }}
                >
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
                    <Typography fontStyle="italic">Loading vendors…</Typography>
                  </Box>
                </td>
              </tr>
            ) : paginatedVendor.length > 0 ? (
              paginatedVendor.map((vendor, index) => (
                <Box
                  component="tr"
                  key={vendor._id ?? index}
                  sx={{
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/view_vendor?id=${vendor._id}`)}
                >
                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox
                      checked={selected.includes(vendor._id)}
                      onChange={() => handleRowSelect(vendor._id)}
                      color={
                        selected.includes(vendor._id) ? "primary" : "neutral"
                      }
                    />
                  </Box>

                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    <Chip
                      color="primary"
                      variant="outlined"
                      size="md"
                      sx={{ fontWeight: "md", borderRadius: "lg" }}
                    >
                      {vendor?.name || "-"}
                    </Chip>
                  </Box>

                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    {vendor?.contact_details?.email || "-"}
                  </Box>

                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    {vendor?.contact_details?.phone || "-"}
                  </Box>

                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    {vendor?.address?.state || "-"}
                  </Box>

                  <Box
                    component="td"
                    style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                  >
                    {vendor.type || "-"}
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={13}
                  style={{ padding: 8, borderBottom: "1px solid #ddd" }}
                >
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
                      style={{ width: 50, height: 50 }}
                    />
                    <Typography fontStyle={"italic"}>
                      No Vendor available
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
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
          disabled={currentPage <= 1}
        >
          Previous
        </Button>

        <Box>
          <Typography level="body-sm">
            {total ? (
              <>
                Showing {startIndex}–{endIndex} of {total} results
              </>
            ) : (
              "No results"
            )}
          </Typography>
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {getPaginationRange().map((page, idx) =>
            page === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                …
              </Box>
            ) : (
              <IconButton
                key={page}
                size="sm"
                variant={page === currentPage ? "solid" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            )
          )}
        </Box>

        <FormControl size="sm" sx={{ minWidth: 80 }}>
          <Select
            value={perPage}
            onChange={(_e, newValue) => handlePageSizeChange(newValue)}
            sx={{
              height: 32,
              borderRadius: "6px",
              borderColor: "#ccc",
              backgroundColor: "#fff",
            }}
          >
            {[5, 10, 20, 50, 100].map((num) => (
              <Option key={num} value={num}>
                {num}
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
};

export default AllVendors;
