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
import { Calendar, Handshake, PackageCheck, Truck, TruckIcon, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

import {
  useGetAllPurchaseRequestQuery,
  useGetMaterialCategoryQuery,
} from "../redux/camsSlice";
import { Money } from "@mui/icons-material";

function PurchaseReqSummary() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selecteditem, setSelecteditem] = useState("");
  const [selectedstatus, setSelectedstatus] = useState("");
  const [selectedpovalue, setSelectedpovalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const itemSearch = searchParams.get("itemSearch") || "";
  const poValueSearch = searchParams.get("poValueSearch") || "";
  const statusSearch = searchParams.get("statusSearch") || "";
  const [createdDateRange, setCreatedDateRange] = useState([null, null]); // [from, to]
  const [etdDateRange, setEtdDateRange] = useState([null, null]); // [from, to]
  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };

  const navigate = useNavigate();

  const { data, isLoading } = useGetAllPurchaseRequestQuery({
    page,
    search,
    itemSearch,
    poValueSearch,
    statusSearch,
    etdFrom: etdDateRange[0] || "",
    etdTo: etdDateRange[1] || "",
    createdFrom: createdDateRange[0] || "",
    createdTo: createdDateRange[1] || "",
  });

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
    setSearchParams({ page: 1, search: query });
  };

  const allItemIds = purchaseRequests?.data?.item;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(allItemIds);
    } else {
      setSelected([]);
    }
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
      setSearchParams({ page: newPage, search: searchQuery });
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

  const { data: materialCategories, isLoading: isMaterialLoading } =
    useGetMaterialCategoryQuery();

  const renderFilters = () => {
    const pr_status = ["submitted", "approved", "po_created", "delivered"];
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>PR Status</FormLabel>
          <Select
            value={selectedstatus}
            onChange={(e, newValue) => {
              setSelectedstatus(newValue);
              setCurrentPage(1);
              setSearchParams({
                page: 1,
                search: searchQuery,
                statusSearch: newValue || "",
                itemSearch: selecteditem,
                poValueSearch: selectedpovalue,
              });
            }}
            size="sm"
            placeholder="Select Status"
          >
            <Option value="">All status</Option>
            {pr_status.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Item Queue</FormLabel>
          <Select
            value={selecteditem}
            onChange={(e, newValue) => {
              setSelecteditem(newValue);
              setCurrentPage(1);
              setSearchParams({
                page: 1,
                search: searchQuery,
                itemSearch: newValue || "",
                statusSearch: selectedstatus,
                poValueSearch: selectedpovalue,
              });
            }}
            size="sm"
            placeholder="Select Item"
          >
            <Option value="">All Items</Option>
            {materialCategories?.data?.map((item) => (
              <Option key={item.name} value={item.name}>
                {item.name}
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Created At</FormLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Input
              type="date"
              size="sm"
              value={createdDateRange[0] || ""}
              onChange={(e) => {
                const from = e.target.value;
                const to = createdDateRange[1];
                setCreatedDateRange([from, to]);
                setSearchParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  createdFrom: from,
                  createdTo: to,
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
                setCreatedDateRange([from, to]);
                setSearchParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  createdFrom: from,
                  createdTo: to,
                });
              }}
            />
          </Box>
        </FormControl>

        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>ETD Date</FormLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Input
              type="date"
              size="sm"
              value={etdDateRange[0] || ""}
              onChange={(e) => {
                const from = e.target.value;
                const to = etdDateRange[1];
                setEtdDateRange([from, to]);
                setSearchParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  etdFrom: from,
                  etdTo: to,
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
                setEtdDateRange([from, to]);
                setSearchParams({
                  page: 1,
                  search: searchQuery,
                  itemSearch: selecteditem,
                  statusSearch: selectedstatus,
                  poValueSearch: selectedpovalue,
                  etdFrom: from,
                  etdTo: to,
                });
              }}
            />
          </Box>
        </FormControl>
      </Box>
    );
  };

  const RenderPRNo = ({
    pr_no,
    createdAt,
    createdBy,
    project_id,
    item_id,
    pr_id,
  }) => {
    const formattedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
    return (
      <>
        <Box>
          <span
            style={{ cursor: "pointer", fontWeight: 500 }}
            onClick={() =>
              navigate(
                `/purchase_detail?project_id=${project_id}&item_id=${item_id}&pr_id=${pr_id}`
              )
            }
          >
            {pr_no || "-"}
          </span>
        </Box>
        <Box display="flex" alignItems="center">
          <Calendar size={12} />
          &nbsp;
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Created At:{" "}
          </span>{" "}
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {formattedDate}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <User size={12} />
          &nbsp;
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            Created By:{" "}
          </span>{" "}
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {createdBy}
          </Typography>
        </Box>
      </>
    );
  };

const RenderItemCell = (item) => {
    const name = item?.item_id?.name;
    const isOthers = name === "Others";
    return (
      <Box>
        <Typography>{name || "-"}</Typography>
        {isOthers && (
          <Box sx={{ fontSize: 12, color: "gray" }}>
            <div>
              <b> <TruckIcon size={13} /> Other Item Name:</b> {item?.other_item_name || "-"}
            </div>
            <div>
              <b><Money /> Amount:</b> ₹{item?.amount || "0"}
            </div>
          </Box>
        )}
      </Box>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ready_to_dispatch":
        return <PackageCheck size={18} style={{ marginRight: 6 }} />;
      case "out_for_delivery":
        return <Truck size={18} style={{ marginRight: 6 }} />;
      case "delivered":
        return <Handshake size={18} style={{ marginRight: 6 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ready_to_dispatch":
        return "red";
      case "out_for_delivery":
        return "orange";
      case "delivered":
        return "green";
      default:
        return "error";
    }
  };

  return (
    <>
      {/* Search Bar */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
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
            placeholder="Search by Project Code, Project Name, PR No., Status"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
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
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                <Checkbox
                  size="sm"
                  checked={
                    selected.length > 0 && selected.length === allItemIds.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < allItemIds.length
                  }
                />
              </th>
              {[
                "PR No.",
                "Project Code",
                "Item Name",
                "Status",
                "PO Number",
                "PO Value",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
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
                        project_id={row?.project_id?._id}
                        item_id={item?.item_id?._id}
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
  {RenderItemCell(item)}
</td>


                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          py: 0.5,
                          borderRadius: "16px",
                          color: getStatusColor(row?.item?.status),
                          fontWeight: 600,
                          fontSize: "1rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {getStatusIcon(row?.item?.status)}
                        {row?.item?.status?.replace(/_/g, " ")}
                      </Box>
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {row.po_numbers?.length > 0 ? (
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
                              {row.po_numbers.map((po, idx) => (
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
                              sx={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                paddingRight:
                                  row.po_numbers.length > 1 ? "24px" : "12px",
                                maxWidth: "200px",
                                cursor: "pointer",
                              }}
                            >
                              {row.po_numbers[0]}
                              {row.po_numbers.length > 1 && (
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
                                    zIndex: 1,
                                  }}
                                >
                                  +{row.po_numbers.length - 1}
                                </Avatar>
                              )}
                            </Chip>
                          </Box>
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {row.po_value || "-"}
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
          {getPaginationRange().map((page, idx) =>
            page === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                ...
              </Box>
            ) : (
              <IconButton
                key={page}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
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
    </>
  );
}

export default PurchaseReqSummary;
