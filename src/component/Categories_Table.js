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
import { iconButtonClasses } from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import Chip from "@mui/joy/Chip";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import NoData from "../assets/alert-bell.svg";

import {
  useGetAllCategoriesQuery,
  useUpdateCategoriesMutation, // PUT /products/category/:id
} from "../redux/productsSlice";
import { useNavigate } from "react-router-dom";

function Categories_Table() {
  // ---------- local UI state ----------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [type, setType] = useState("");
  const [status, setStatus] = useState(""); // '' | 'active' | 'inactive'

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  // Tabs → control status
  const [statusTab, setStatusTab] = useState("all"); // 'all' | 'active' | 'inactive'
  useEffect(() => {
    setStatus(statusTab === "all" ? "" : statusTab);
    setPage(1);
  }, [statusTab]);

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
  }, [search, debouncer]);

  // ---------- API call ----------
  const { data, isLoading, isFetching, error, refetch } =
    useGetAllCategoriesQuery({
      page,
      pageSize,
      search: debouncedSearch,
      type,
      status,
      sortBy,
      sortOrder,
    });

  const [updateCategories, { isLoading: isUpdating }] =
    useUpdateCategoriesMutation();

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

  // ---------- pill tabs (All / Active / Inactive) ----------
  const TabPill = ({ value, label }) => {
    const active = statusTab === value;
    return (
      <Box
        role="button"
        aria-pressed={active}
        onClick={() => setStatusTab(value)}
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 9999,
          cursor: "pointer",
          userSelect: "none",
          ...(active
            ? { bgcolor: "#ffffff", boxShadow: "sm", fontWeight: "lg" }
            : { color: "text.secondary" }),
          "&:hover": !active
            ? { bgcolor: "neutral.softBg", color: "text.primary" }
            : {},
          transition: "all 120ms ease",
        }}
      >
        {label}
      </Box>
    );
  };

  // ---------- Confirm dialog: STATUS ----------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetCat, setTargetCat] = useState(null); // { _id, name, status }
  const openConfirm = (cat) => {
    setTargetCat(cat);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setTargetCat(null);
  };
  const nextStatus = targetCat?.status === "active" ? "inactive" : "active";
  const handleConfirm = async () => {
    if (!targetCat?._id) return;
    try {
      await updateCategories({
        categoryId: targetCat._id,
        body: { status: nextStatus },
      }).unwrap();
      closeConfirm();
      refetch();
    } catch (e) {
      console.error(
        e?.data?.message || e?.message || "Failed to update status"
      );
    }
  };

  // ---------- Confirm dialog: TYPE (supply ↔ execution) ----------
  const [confirmTypeOpen, setConfirmTypeOpen] = useState(false);
  const [typeTargetCat, setTypeTargetCat] = useState(null); // { _id, name, type }
  const openTypeConfirm = (cat) => {
    // Only toggle if the current type is one of the two valid values
    if (cat?.type === "supply" || cat?.type === "execution") {
      setTypeTargetCat(cat);
      setConfirmTypeOpen(true);
    }
  };
  const closeTypeConfirm = () => {
    setConfirmTypeOpen(false);
    setTypeTargetCat(null);
  };
  const nextType =
    typeTargetCat?.type === "supply"
      ? "execution"
      : typeTargetCat?.type === "execution"
        ? "supply"
        : null;

  const handleTypeConfirm = async () => {
    if (!typeTargetCat?._id || !nextType) return;
    try {
      await updateCategories({
        categoryId: typeTargetCat._id,
        body: { type: nextType },
      }).unwrap();
      closeTypeConfirm();
      refetch();
    } catch (e) {
      console.error(e?.data?.message || e?.message || "Failed to update type");
    }
  };

  return (
    <>
      {/* Search & Filters */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          py: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          "& > *": { minWidth: { xs: "120px", md: "160px" } },
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

      {/* Tabs (like the image) */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "#F3F4F6",
            borderRadius: 9999,
            p: 0.5,
            boxShadow: "xs",
            minWidth: "fit-content",
          }}
        >
          <TabPill value="all" label="All" />
          <TabPill value="active" label="Active" />
          <TabPill value="inactive" label="Inactive" />
        </Box>
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

                  {/* TYPE: clickable to toggle supply ↔ execution */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {cat.type ? (
                      <Chip
                        variant="soft"
                        color="primary"
                        size="sm"
                        onClick={() => openTypeConfirm(cat)}
                        sx={{
                          cursor:
                            cat.type === "supply" || cat.type === "execution"
                              ? "pointer"
                              : "default",
                          textTransform: "capitalize",
                        }}
                      >
                        {cat.type}
                      </Chip>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* STATUS: clickable to toggle active ↔ inactive */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Chip
                      variant="soft"
                      color={cat.status === "active" ? "success" : "neutral"}
                      size="sm"
                      onClick={() => openConfirm(cat)}
                      sx={{ cursor: "pointer" }}
                    >
                      {cat.status || "-"}
                    </Chip>
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

      {/* Confirm Dialog: Status */}
      <Modal open={confirmOpen} onClose={closeConfirm}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 420 }}>
          <ModalClose />
          <Typography level="h5" mb={1}>
            Change Status
          </Typography>
          <Typography level="body-sm" mb={2}>
            Are you sure you want to change status <b>{targetCat?.status}</b> →{" "}
            <b>{nextStatus}</b>?
          </Typography>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="plain"
              color="neutral"
              onClick={closeConfirm}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              loading={isUpdating}
              onClick={handleConfirm}
            >
              Yes, Change
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Confirm Dialog: Type */}
      <Modal open={confirmTypeOpen} onClose={closeTypeConfirm}>
        <ModalDialog variant="outlined" sx={{ maxWidth: 420 }}>
          <ModalClose />
          <Typography level="h5" mb={1}>
            Change Type
          </Typography>
          <Typography level="body-sm" mb={2}>
            {nextType ? (
              <>
                Are you sure you want to change type{" "}
                <b>{typeTargetCat?.type}</b> → <b>{nextType}</b>?
              </>
            ) : (
              <>This category has a non-toggleable type.</>
            )}
          </Typography>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="plain"
              color="neutral"
              onClick={closeTypeConfirm}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="primary"
              loading={isUpdating}
              onClick={handleTypeConfirm}
              disabled={!nextType}
            >
              Yes, Change
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default Categories_Table;
