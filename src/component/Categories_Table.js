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
import Chip from "@mui/joy/Chip";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import NoData from "../assets/alert-bell.svg";

import { useGetAllCategoriesQuery } from "../redux/productsSlice";
import { useNavigate } from "react-router-dom";

function Categories_Table() {
  // ---------- local UI state ----------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  // debounce search input
  const debouncer = useMemo(
    () =>
      debounce((v) => {
        setDebouncedSearch(v);
        setPage(1);
      }, 400),
    []
  );
  useEffect(() => {
    debouncer(search);
    return () => debouncer.cancel();
  }, [search]);

  // ---------- API call ----------
  const { data, isLoading, isFetching, error } = useGetAllCategoriesQuery({
    page,
    pageSize,
    search: debouncedSearch,
    type,
    status,
    sortBy,
    sortOrder,
  });

  const rows = data?.data || [];
  const total = data?.meta?.total || 0;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // ---------- start & end index ----------
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex =
    total === 0 ? 0 : Math.min((page - 1) * pageSize + rows.length, total);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pageCount, p + 1));

  // ---------- helpers ----------
  const renderNameCell = (name) => {
    const text = typeof name === "string" ? name : "";
    const truncated = text.length > 15 ? text.slice(0, 15) + "..." : text;

    if (text.length <= 15) return <span>{text || "-"}</span>;

    return (
      <Tooltip
        title={
          <Box
            sx={{
              maxWidth: 320,
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: "#fff" }}>
              {text}
            </Typography>
          </Box>
        }
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
    );
  };

  return (
    <>
      {/* Search & Filters */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Name / Code / Description"
            startDecorator={<SearchIcon />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Type</FormLabel>
          <Select
            size="sm"
            value={type}
            onChange={(_, v) => {
              setType(v || "");
              setPage(1);
            }}
          >
            <Option value="">All</Option>
            <Option value="supply">Supply</Option>
            <Option value="execution">Execution</Option>
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Status</FormLabel>
          <Select
            size="sm"
            value={status}
            onChange={(_, v) => {
              setStatus(v || "");
              setPage(1);
            }}
          >
            <Option value="">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Sort By</FormLabel>
          <Select
            size="sm"
            value={sortBy}
            onChange={(_, v) => {
              setSortBy(v || "createdAt");
              setPage(1);
            }}
          >
            <Option value="createdAt">Created At</Option>
            <Option value="name">Name</Option>
            <Option value="category_code">Category Code</Option>
            <Option value="updatedAt">Updated At</Option>
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Order</FormLabel>
          <Select
            size="sm"
            value={sortOrder}
            onChange={(_, v) => {
              setSortOrder(v || "desc");
              setPage(1);
            }}
          >
            <Option value="asc">Asc</Option>
            <Option value="desc">Desc</Option>
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Items per page</FormLabel>
          <Select
            size="sm"
            value={pageSize}
            onChange={(_, v) => {
              const n = Number(v || 10);
              setPageSize(n);
              setPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          overflow: "auto",
          minHeight: 0,
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
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
                <Checkbox size="sm" />
              </th>

              {[
                "Category Code",
                "Category Name",
                "Product Count",
                "Type",
                "Status",
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
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                  <Typography level="body-md">Loading…</Typography>
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((cat) => (
                <tr key={cat._id}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox size="sm" />
                  </td>

                  <td
                    onClick={() =>
                      navigate(`/category_form?mode=edit&id=${cat._id}`)
                    }
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    {cat.category_code ? (
                      <Chip
                        variant="solid"
                        color="primary"
                        sx={{ fontWeight: "lg", cursor: "pointer" }}
                      >
                        {cat.category_code}
                      </Chip>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {renderNameCell(cat.name)}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography level="body-sm">
                      {typeof cat.product_count === "number"
                        ? cat.product_count
                        : "0"}
                    </Typography>
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {cat.type ? (
                      <Chip variant="soft" color="primary" size="sm">
                        {cat.type}
                      </Chip>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {cat.status ? (
                      <Chip
                        variant="soft"
                        color={cat.status === "active" ? "success" : "neutral"}
                        size="sm"
                      >
                        {cat.status}
                      </Chip>
                    ) : (
                      "-"
                    )}
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
                    <Typography fontStyle="italic">
                      No Categories Found
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
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          marginLeft: { lg: "18%", xl: "15%" },
          flexWrap: "wrap",
        }}
      >
        <Box display={"flex"} alignItems={"center"} gap={2}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<KeyboardArrowLeftIcon />}
            onClick={handlePrev}
            disabled={page <= 1 || isFetching}
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
            Page {page} of {pageCount}
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={handleNext}
          disabled={page >= pageCount || isFetching}
        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default Categories_Table;
