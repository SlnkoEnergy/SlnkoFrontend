import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Chip,
  CircularProgress,
  Option,
  Select,
  Tooltip,
  Tabs,
  TabList,
  Tab,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { Calendar, TruckIcon, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import { useGetAllPurchaseRequestQuery } from "../redux/camsSlice";
import {
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
} from "../redux/productsSlice";
import { Money } from "@mui/icons-material";

import SearchPickerModal from "../component/SearchPickerModal";

function PurchaseReqSummary() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selecteditem, setSelecteditem] = useState("");
  const [selectedstatus, setSelectedstatus] = useState("");
  const [selectedpovalue, setSelectedpovalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // URL params
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const search = searchParams.get("search") || "";
  const itemSearch = searchParams.get("itemSearch") || "";
  const poValueSearch = searchParams.get("poValueSearch") || "";
  const statusSearch = searchParams.get("statusSearch") || "";
  const createdFromParam = searchParams.get("createdFrom") || "";
  const createdToParam = searchParams.get("createdTo") || "";
  const etdFromParam = searchParams.get("etdFrom") || "";
  const etdToParam = searchParams.get("etdTo") || "";
  const tab = searchParams.get("tab") || "all"; // "all" | "open"
  const openPR = tab === "open";
  const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;
  const projectId = searchParams.get("projectId") || "";

  const [createdDateRange, setCreatedDateRange] = useState([
    createdFromParam || null,
    createdToParam || null,
  ]);
  const [etdDateRange, setEtdDateRange] = useState([
    etdFromParam || null,
    etdToParam || null,
  ]);

  // Category UI state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);

  const updateParams = (patch) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      });
      return next;
    });
  };

  // Main PR list query
  const { data, isLoading } = useGetAllPurchaseRequestQuery(
    {
      page,
      search,
      itemSearch,
      poValueSearch,
      statusSearch,
      etdFrom: etdDateRange ? etdDateRange[0] || "" : "",
      etdTo: etdDateRange ? etdDateRange[1] || "" : "",
      createdFrom: createdDateRange[0] || "",
      createdTo: createdDateRange[1] || "",
      open_pr: tab === "open",
      limit,
    },
    {
      refetchOnMountOrArgChange: true, // <—
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  // Initial 7 categories (for the Select)
  const { data: catInitialData, isFetching: isCatInitFetching } =
    useGetCategoriesNameSearchQuery({
      page: 1,
      search: "",
      limit: 7,
      pr: openPR,
      projectId: projectId || "",
    });

  // Lazy search for categories (modal paging & searching)
  const [triggerCategorySearch] = useLazyGetCategoriesNameSearchQuery();

  useEffect(() => {
    setCurrentPage(page);
    setSearchQuery(search);
    setSelecteditem(itemSearch);
    setSelectedpovalue(poValueSearch);
    setSelectedstatus(statusSearch);
  }, [page, search, itemSearch, poValueSearch, statusSearch]);

  const purchaseRequests = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    setCurrentPage(page);
    setSearchQuery(search);
  }, [page, search]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    updateParams({ page: 1, search: query });
  };

  // Select all item ids (guard)
  const allItemIds =
    (purchaseRequests || []).map((r) => r?.item?._id).filter(Boolean) || [];

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelected(allItemIds);
    else setSelected([]);
  };

  const handleRowSelect = (itemId) => {
    setSelected((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateParams({ page: newPage, search: searchQuery, limit });
    }
  };

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

  const topCategories = (() => {
    const rows = catInitialData?.data || catInitialData?.rows || [];
    return rows.map((r) => ({
      ...r,
      name: r?.name ?? r?.category ?? r?.make ?? "",
    }));
  })();

  const fetchCategoriesPage = async ({ page, search }) => {
    try {
      const res = await triggerCategorySearch(
        {
          page: page || 1,
          search: search || "",
          limit: 7,
          pr: openPR,
          projectId: projectId || "",
        },
        true
      ).unwrap();

      const rows = (res?.data || []).map((r) => ({
        ...r,
        name: r?.name ?? r?.category ?? r?.make ?? "",
      }));

      const total =
        res?.pagination?.total ?? res?.total ?? res?.totalCount ?? rows.length;

      return { rows, total };
    } catch (e) {
      return { rows: [], total: 0 };
    }
  };

  console.log(purchaseRequests);

  const onPickCategory = (row) => {
    const pickedName = row?.name ?? row?.category ?? row?.make ?? "";
    setSelecteditem(pickedName);
    setCurrentPage(1);
    updateParams({
      page: 1,
      search: searchQuery,
      itemSearch: pickedName || "",
      statusSearch: selectedstatus,
      poValueSearch: selectedpovalue,
    });
    setCategoryModalOpen(false);
  };

  // ---------- Render helpers ----------
  const RenderPRNo = ({ pr_no, createdAt, createdBy, pr_id }) => {
    const navigate = useNavigate();

    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const isClickable = Boolean(pr_no && pr_id);

    const handleOpen = () => {
      if (isClickable) navigate(`/pr_form?mode=view&id=${pr_id}`);
    };

    return (
      <>
        <Box>
          <Tooltip
            title={isClickable ? "Open PR" : ""}
            placement="bottom"
            arrow
          >
            <Chip
              size="sm"
              variant="solid"
              color={isClickable ? "primary" : "neutral"}
              onClick={handleOpen}
              component={isClickable ? "button" : "div"}
              role={isClickable ? "link" : undefined}
              tabIndex={isClickable ? 0 : -1}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleOpen();
                }
              }}
              sx={{
                "--Chip-radius": "9999px",
                "--Chip-borderWidth": 0,
                "--Chip-paddingInline": "10px",
                "--Chip-minHeight": "22px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: isClickable ? "pointer" : "default",
                border: "none",
                userSelect: "none",
              }}
            >
              {pr_no || "-"}
            </Chip>
          </Tooltip>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5} gap={0.5}>
          <Calendar size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Created At:&nbsp;
          </span>
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {formattedDate}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <User size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Created By:&nbsp;
          </span>
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {createdBy || "-"}
          </Typography>
        </Box>
      </>
    );
  };

  const getItemName = (it) =>
    it?.item_id?.name || it?.other_item_name || it?.name || "(Unnamed item)";
  const norm = (s) => (s == null ? "" : String(s).trim().toLowerCase());
  const uniqueByName = (items) => {
    const seen = new Set();
    const out = [];
    const arr = Array.isArray(items)
      ? items.filter(Boolean)
      : [items].filter(Boolean);
    for (const it of arr) {
      const name = getItemName(it);
      const key = norm(name);
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ item: it, name });
      }
    }
    return out;
  };

  const RenderItemCell = (item) => {
    const name = item?.item_id?.name || item?.name || item?.other_item_name;
    const isOthers = name === "Others";
    return (
      <Box>
        <Typography>{name || "-"}</Typography>
        {isOthers && (
          <Box sx={{ fontSize: 12, color: "gray" }}>
            <div>
              <b>
                <TruckIcon size={13} /> Other Item Name:
              </b>{" "}
              {item?.other_item_name || "-"}
            </div>
            <div>
              <b>
                <Money /> Amount:
              </b>{" "}
              ₹{item?.amount || "0"}
            </div>
          </Box>
        )}
      </Box>
    );
  };

  const ItemsCell = ({ items }) => {
    const uniq = uniqueByName(items);
    if (uniq.length === 0) return <span>-</span>;
    if (uniq.length === 1) return <>{RenderItemCell(uniq[0].item)}</>;
    const tooltipContent = (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 0.5 }}>
        {uniq.slice(1).map(({ name }, i) => (
          <Typography level="body-sm" key={`${name}-${i}`}>
            {name}
          </Typography>
        ))}
      </Box>
    );
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <span>{RenderItemCell(uniq[0].item)}</span>
        <Tooltip title={tooltipContent} variant="soft" arrow placement="bottom">
          <Chip
            size="sm"
            variant="solid"
            sx={{
              bgcolor: "#214b7b",
              color: "#fff",
              cursor: "pointer",
              "&:hover": { bgcolor: "#1d416b" },
            }}
          >
            +{uniq.length - 1}
          </Chip>
        </Tooltip>
      </Box>
    );
  };

  return (
    <>
      {/* SEARCH + ALL FILTERS IN ONE ROW */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          flexWrap: { xs: "wrap", md: "nowrap" }, // single line on md+, wraps on small
        }}
      >
        {/* Search */}
        <FormControl sx={{ flex: 1, minWidth: 300 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by ProjectId, Customer, Type, or State"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>

        {/* Category (first 7 + Browse all…) */}
        <FormControl sx={{ minWidth: 240 }} size="sm">
          <FormLabel>Category Queue</FormLabel>
          <Select
            value={selecteditem}
            placeholder={isCatInitFetching ? "Loading…" : "Select Category"}
            listboxOpen={categorySelectOpen}
            onListboxOpenChange={(_e, open) => setCategorySelectOpen(open)} // closes on outside click
            onChange={(_e, newValue) => {
              if (newValue === "__more__") {
                setCategorySelectOpen(false); 
                setCategoryModalOpen(true); 
                return;
              }
              setSelecteditem(newValue || "");
              setCurrentPage(1);
              updateParams({
                page: 1,
                search: searchQuery,
                itemSearch: newValue || "",
                statusSearch: selectedstatus,
                poValueSearch: selectedpovalue,
              });
            }}
            size="sm"
          >
            <Option value="">All Categories</Option>

            {topCategories.slice(0, 7).map((cat) => (
              <Option key={cat._id} value={cat.name}>
                {cat.name}
              </Option>
            ))}

            {/* ensure picked value from modal (page 2+) appears in Select */}
            {selecteditem &&
              !topCategories
                .slice(0, 7)
                .some((c) => c.name === selecteditem) && (
                <Option key={`picked-${selecteditem}`} value={selecteditem}>
                  {selecteditem}
                </Option>
              )}

            <Option
              value="__more__"
              sx={{
                color: "primary.plainColor",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "primary.softBg",
                  color: "primary.solidColor",
                },
              }}
            >
              Browse all…
            </Option>
          </Select>
        </FormControl>

        {/* Created At */}
        <FormControl sx={{ minWidth: 260 }} size="sm">
          <FormLabel>Created At</FormLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Input
              type="date"
              size="sm"
              value={createdDateRange[0] || ""}
              onChange={(e) => {
                const from = e.target.value;
                const to = createdDateRange[1];
                setCreatedDateRange([from || null, to]);
                updateParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  createdFrom: from || "",
                  createdTo: to || "",
                  limit,
                });
              }}
            />
            <Input
              type="date"
              size="sm"
              value={createdDateRange[1] || ""}
              onChange={(e) => {
                const from = createdDateRange[0];
                const to = e.target.value;
                setCreatedDateRange([from, to || null]);
                updateParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  createdFrom: from || "",
                  createdTo: to || "",
                  limit,
                });
              }}
            />
          </Box>
        </FormControl>

        {/* ETD Date */}
        <FormControl sx={{ minWidth: 260 }} size="sm">
          <FormLabel>ETD Date</FormLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Input
              type="date"
              size="sm"
              value={etdDateRange[0] || ""}
              onChange={(e) => {
                const from = e.target.value;
                const to = etdDateRange[1];
                setEtdDateRange([from || null, to]);
                updateParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  etdFrom: from || "",
                  etdTo: to || "",
                  limit,
                });
              }}
            />
            <Input
              type="date"
              size="sm"
              value={etdDateRange[1] || ""}
              onChange={(e) => {
                const from = etdDateRange[0];
                const to = e.target.value;
                setEtdDateRange([from, to || null]);
                updateParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  etdFrom: from || "",
                  etdTo: to || "",
                  limit,
                });
              }}
            />
          </Box>
        </FormControl>
      </Box>

      {/* Tabs + Rows-per-page */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          mb: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_e, newValue) => {
            updateParams({ tab: newValue, page: 1, limit });
          }}
          sx={{ width: "fit-content" }}
        >
          <TabList
            sx={{
              gap: 1,
              p: 0.5,
              bgcolor: "background.level1",
              borderRadius: "xl",
              width: "fit-content",
            }}
          >
            <Tab
              value="all"
              variant={tab === "all" ? "solid" : "soft"}
              color={tab === "all" ? "primary" : "neutral"}
              sx={{ borderRadius: "xl", fontWeight: 600, px: 1.5 }}
            >
              All
            </Tab>
            <Tab
              value="open"
              variant={tab === "open" ? "solid" : "soft"}
              color={tab === "open" ? "primary" : "neutral"}
              sx={{ borderRadius: "xl", fontWeight: 600, px: 1.5 }}
            >
              Open PR
            </Tab>
          </TabList>
        </Tabs>

        {/* Rows per page */}
        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>Rows per page</FormLabel>
          <Select
            value={String(limit)}
            onChange={(_e, newValue) => {
              const newLimit = parseInt(newValue || "10", 10) || 10;
              updateParams({
                limit: String(newLimit),
                page: 1,
                tab,
                search: searchQuery || undefined,
                itemSearch: selecteditem || undefined,
                statusSearch: selectedstatus || undefined,
                poValueSearch: selectedpovalue || undefined,
                createdFrom: createdDateRange[0] || undefined,
                createdTo: createdDateRange[1] || undefined,
                etdFrom: etdDateRange[0] || undefined,
                etdTo: etdDateRange[1] || undefined,
              });
            }}
            size="sm"
            placeholder="Rows"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <Option key={n} value={String(n)}>
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
          flexShrink: 1,
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
          <thead>
            <tr>
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
                    selected?.length > 0 &&
                    selected.length === allItemIds?.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected?.length > 0 &&
                    selected?.length < (allItemIds?.length || 0)
                  }
                />
              </th>
              {[
                "PR No.",
                "Project Code",
                "Category Name",
                "PO Number",
                "PO Value",
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
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  <CircularProgress size="sm" />
                </td>
              </tr>
            ) : purchaseRequests.length > 0 ? (

              purchaseRequests.map((row) => {
                const item = row.item;
                return (
                  <tr key={item?._id}>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(item?._id)}
                        onChange={() => handleRowSelect(item?._id)}
                      />
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <RenderPRNo
                        pr_no={row.pr_no}
                        createdAt={row.createdAt}
                        pr_id={row?._id}
                        createdBy={row?.created_by?.name}
                      />
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <Box>
                        <Typography fontWeight="md">
                          {row.project_id?.code || "-"}
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary" }}
                        >
                          {row.project_id?.name || "-"}
                        </Typography>
                      </Box>
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                        padding: "8px",
                      }}
                    >
                      <ItemsCell items={row.items ?? item} />
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {Array.isArray(row.po_numbers) &&
                      row.po_numbers.length > 0 ? (
                        (() => {
                          const cleaned = row.po_numbers.map((s) =>
                            (s ?? "").trim()
                          );
                          const allEmpty = cleaned.every((s) => s === "");
                          if (allEmpty) {
                            return (
                              <Chip
                                size="sm"
                                variant="soft"
                                color="warning"
                                sx={{ fontWeight: 600 }}
                              >
                                Coming Soon
                              </Chip>
                            );
                          }
                          const numbers = cleaned.filter(Boolean);
                          if (numbers.length === 0) {
                            return (
                              <Chip
                                size="sm"
                                variant="soft"
                                color="warning"
                                sx={{ fontWeight: 600 }}
                              >
                                Coming Soon
                              </Chip>
                            );
                          }
                          return (
                            <Tooltip
                              arrow
                              placement="top"
                              title={
                                <Box
                                  sx={{
                                    bgcolor: "primary.softBg",
                                    color: "primary.solidColor",
                                    p: 1,
                                    borderRadius: "sm",
                                    minWidth: "150px",
                                  }}
                                >
                                  <Typography level="body-sm" fontWeight="md">
                                    PO Numbers:
                                  </Typography>
                                  {numbers.map((po, idx) => (
                                    <Typography key={idx} level="body-xs">
                                      • {po}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                            >
                              <Box>
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color="primary"
                                  sx={{
                                    position: "relative",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    paddingRight:
                                      numbers.length > 1 ? "24px" : "12px",
                                    maxWidth: "200px",
                                    cursor: "pointer",
                                  }}
                                >
                                  {numbers[0]}
                                  {numbers.length > 1 && (
                                    <Avatar
                                      size="xs"
                                      variant="solid"
                                      color="primary"
                                      sx={{
                                        position: "absolute",
                                        right: 2,
                                        top: -2,
                                        fontSize: "10px",
                                        height: 18,
                                        width: 20,
                                      }}
                                    >
                                      +{numbers.length - 1}
                                    </Avatar>
                                  )}
                                </Chip>
                              </Box>
                            </Tooltip>
                          );
                        })()
                      ) : (
                        <Chip
                          size="sm"
                          variant="soft"
                          color="neutral"
                          sx={{ fontWeight: 600 }}
                        >
                          PO yet to be raised
                        </Chip>
                      )}
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      ₹ {row.po_value || "0"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  No Data Found
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
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
          marginLeft: { xl: "15%", lg: "18%" },
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

        <Box>
          Showing page {currentPage} of {totalPages} ({totalCount} results)
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {getPaginationRange().map((p, idx) =>
            p === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                ...
              </Box>
            ) : (
              <IconButton
                key={p}
                size="sm"
                variant={p === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(p)}
              >
                {p}
              </IconButton>
            )
          )}
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Category Search Modal */}
      <SearchPickerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onPick={onPickCategory}
        title="Select Category"
        columns={[{ key: "name", label: "Category", width: 320 }]}
        fetchPage={fetchCategoriesPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </>
  );
}

export default PurchaseReqSummary;
