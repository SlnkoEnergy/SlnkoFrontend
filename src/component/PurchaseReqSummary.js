import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, Chip, Option, Select } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllPurchaseRequestQuery } from "../redux/camsSlice";

function PurchaseReqSummary() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selecteditem, setSelecteditem] = useState("");
  const [selectedpovalue, setSelectedpovalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useGetAllPurchaseRequestQuery({
    page,
    search,
    itemSearch,
    poValueSearch
  });

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

  const allItemIds = purchaseRequests.flatMap((row) =>
    row.items.map((item) => item._id)
  );

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

  const renderDelayChip = (delay) => {
    const isDelayed = delay !== "0 days";
    return (
      <Chip size="sm" color={isDelayed ? "danger" : "success"} variant="solid">
        {delay}
      </Chip>
    );
  };

  const renderFilters = () => {
      const pr_status = ["submitted","approved", "po created",];
  
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
              value={selectedbill}
              onChange={(e, newValue) => {
                setSelectedbill(newValue);
                setCurrentPage(1);
              }}
              size="sm"
              placeholder="Select Department"
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
              value={selectedbill}
              onChange={(e, newValue) => {
                setSelectedbill(newValue);
                setCurrentPage(1);
              }}
              size="sm"
              placeholder="Select Department"
            >
              <Option value="">All item</Option>
              {bill_status.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
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
                  textAlign: "center",
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
                "Project Code",
                "Item Name",
                "PR No.",
                "Status",
                "ETD",
                "Delivery Date",
                "Delay",
                "PO Count",
                "PO Value with GST",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
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
              purchaseRequests.flatMap((row) =>
                row.items.map((item) => (
                  <tr key={item._id}>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(item._id)}
                        onChange={() => handleRowSelect(item._id)}
                      />
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
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
                        textAlign: "center",
                      }}
                    >
                      {item.item_id?.name || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {row.pr_no}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        fontWeight="md"
                        color={
                          row.current_status?.status === "submitted"
                            ? "primary"
                            : row.current_status?.status === "approved"
                              ? "warning"
                              : row.current_status?.status === "po_created"
                                ? "success"
                                : "neutral"
                        }
                        level="body-sm"
                      >
                        {row.current_status?.status
                          ? row.current_status.status
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                          : "N/A"}
                      </Typography>
                    </td>

                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {row.eid || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {row.delivery_date || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {renderDelayChip(row.delay || "0 days")}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {row.total_po_count ?? 0}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      ₹ {row.po_value?.toLocaleString("en-IN") || "0"}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  No data found
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
          marginLeft: { lg: "18%", xl: "15%" },
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
          Page {currentPage} of {totalPages}
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
