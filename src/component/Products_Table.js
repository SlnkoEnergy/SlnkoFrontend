import { useEffect, useMemo, useRef, useState } from "react";
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
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import NoData from "../assets/alert-bell.svg";
import { useGetProductsQuery } from "../redux/productsSlice";
import { Chip, Option, Select, Tooltip, Typography } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";

function Products_Table() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const readInt = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const setParams = (patch, replace = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next, { replace });
  };

  const category = searchParams.get("category") || "";
  const [currentPage, setCurrentPage] = useState(
    readInt(searchParams.get("page"), 1)
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    readInt(searchParams.get("pageSize"), 10)
  );

  // Keep local state in sync if the URL changes (back/forward/manual edit)
  useEffect(() => {
    const p = readInt(searchParams.get("page"), 1);
    if (p !== currentPage) setCurrentPage(p);

    const ps = readInt(searchParams.get("pageSize"), 10);
    if (ps !== rowsPerPage) setRowsPerPage(ps);

    const q = searchParams.get("search") || "";
    if (q !== searchTerm) setSearchTerm(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Reflect local changes to the URL (omit defaults)
  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);

      if (currentPage > 1) p.set("page", String(currentPage));
      else p.delete("page");

      if (searchTerm) p.set("search", searchTerm);
      else p.delete("search");

      if (rowsPerPage !== 10) p.set("pageSize", String(rowsPerPage));
      else p.delete("pageSize");

      return p;
    });
  }, [currentPage, searchTerm, rowsPerPage, setSearchParams]);

  const { data: getProducts, isFetching } = useGetProductsQuery(
    {
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
      category: category,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const handlePrev = () => {
    if (getProducts?.meta?.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (getProducts?.meta?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // NEW: numeric page jump handler (for middle pager)
  const handlePageChange = (n) => {
    if (!n) return;
    const totalPages =
      getProducts?.meta?.totalPages ||
      Math.max(
        1,
        Math.ceil((getProducts?.meta?.total || 0) / Math.max(1, rowsPerPage))
      );
    const clamped = Math.max(1, Math.min(totalPages, Number(n)));
    setCurrentPage(clamped);
  };

  const getValue = (product, fieldName) => {
    const field = product.data.find((f) => f.name === fieldName);
    return field?.values?.[0]?.input_values || "-";
  };

  const ProductNameCell = ({ text }) => {
    const name = typeof text === "string" ? text : "";
    const truncated = name.length > 15 ? name.slice(0, 15) + "..." : name;

    const tooltipContent = (
      <Box
        sx={{
          maxWidth: 320,
          whiteSpace: "pre-line",
          wordBreak: "word-break",
        }}
      >
        <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: "#fff" }}>
          {name}
        </Typography>
      </Box>
    );

    return name.length > 15 ? (
      <Tooltip
        title={tooltipContent}
        arrow
        placement="top-start"
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: "#374151",
              color: "#fff",
              maxWidth: 320,
              p: 1.2,
              whiteSpace: "normal",
              wordBreak: "break-word",
            },
          },
          arrow: { sx: { color: "#374151" } },
        }}
      >
        <span style={{ cursor: "default" }}>{truncated}</span>
      </Tooltip>
    ) : (
      <span>{name}</span>
    );
  };

  // ---------- Derived pagination numbers ----------
  const rows = getProducts?.data || [];
  const total = getProducts?.meta?.total || 0;
  const totalPages =
    getProducts?.meta?.totalPages ||
    Math.max(1, Math.ceil(total / Math.max(1, rowsPerPage)));
  const page = getProducts?.meta?.page || currentPage;
  const limit = getProducts?.meta?.limit || rowsPerPage;

  // Clamp page if backend says fewer pages (e.g., user typed ?page=999)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // start & end indices (0 when there are no results)
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex =
    total === 0 ? 0 : Math.min((page - 1) * limit + rows.length, total);

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
              placeholder="Search by SKU, Product Category, Name, Make or GST"
              startDecorator={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1); // reset only on user search change
                setSearchTerm(e.target.value);
              }}
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
              background: "#e0e0e0",
              zIndex: 2,
              borderBottom: "1px solid #ddd",
              padding: "8px",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            <tr>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                <Checkbox size="sm" />
              </th>
              {[
                "SKU Code",
                "Product Category",
                "Product Name",
                "Make",
                "Cost",
                "UoM",
                "GST(%)",
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
            {rows.length > 0 ? (
              rows.map((product) => (
                <tr key={product._id}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox size="sm" />
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Chip
                      color="primary"
                      variant="solid"
                      onClick={() =>
                        navigate(`/product_form?mode=view&id=${product._id}`)
                      }
                    >
                      {product.sku_code}
                    </Chip>
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {product.category?.name || "-"}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <ProductNameCell text={getValue(product, "Product Name")} />
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {getValue(product, "Make")}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    ₹ {getValue(product, "Cost")}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {String(getValue(product, "UoM") || "")
                      .toLowerCase()
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {getValue(product, "GST")}
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
                    <Typography fontStyle="italic">No Product Found</Typography>
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
        <Box display={"flex"} alignItems="center" gap={2}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<KeyboardArrowLeftIcon />}
            onClick={handlePrev}
            disabled={!getProducts?.meta?.hasPrevPage || isFetching}
          >
            Previous
          </Button>

          <Box>
            <Typography level="body-sm">
              Showing {startIndex}–{endIndex} of {total} results
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography level="body-sm">
            Page {page} of {totalPages}
          </Typography>
        </Box>

        {/* NEW: Centered numeric pager (prev / current / next) */}
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

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ padding: "8px 16px" }}
        >
          <Select
            value={rowsPerPage}
            onChange={(_e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setCurrentPage(1);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  params.delete("page");
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
            {[1, 5, 10, 20, 50, 100].map((value) => (
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
          onClick={handleNext}
          disabled={!getProducts?.meta?.hasNextPage || isFetching}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Products_Table;
