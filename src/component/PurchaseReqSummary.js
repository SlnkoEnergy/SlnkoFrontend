import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  CircularProgress,
  Chip,
  Option,
  Select,
  Textarea,
  ModalClose,
  ModalDialog,
  Modal,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import {
  useGetAllPurchaseRequestQuery,
  useGetMaterialCategoryQuery,
} from "../redux/camsSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

function PurchaseReqSummary() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selecteditem, setSelecteditem] = useState("");
  const [selectedstatus, setSelectedstatus] = useState("");
  const [selectedpovalue, setSelectedpovalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [remarks, setRemarks] = useState();
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const itemSearch = searchParams.get("itemSearch") || "";
  const poValueSearch = searchParams.get("poValueSearch") || "";
  const statusSearch = searchParams.get("statusSearch") || "";
  const [open, setOpen] = useState();
  const navigate = useNavigate();

  const { data, isLoading } = useGetAllPurchaseRequestQuery({
    page,
    search,
    itemSearch,
    poValueSearch,
    statusSearch,
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
      </Box>
    );
  };

  const RenderPRNo = ({ currentPage, pr_no, createdAt }) => {
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
              onClick={() => {
                navigate(
                  `/purchase_detail?page=${currentPage}`
                );
              }}
            >
              {pr_no || "-"}
            </span>
          </Box>
          <Box display="flex" alignItems="center" mt={0.5}>
            <Calendar size={12} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Created At:{" "}
            </span>{" "}
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {formattedDate}
            </Typography>
          </Box>
        </>
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
                "EID",
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
              purchaseRequests.flatMap((row) =>
                row.items.map((item) => (
                  <tr key={item._id}>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
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
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                      onClick={() =>
                        navigate(
                          `/purchase_detail?project_id=${row.project_id?._id}&item_id=${item.item_id._id}`
                        )
                      }
                    >
                      {row.pr_no}
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
                        textAlign: "left",
                      }}
                    >
                      {item.item_id?.name || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
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
                                : row.current_status?.status === "delivered"
                                  ? "neutral"
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
                        textAlign: "left",
                      }}
                    >
                      {row.eid || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {row.delivery_date || "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {renderDelayChip(row.delay || "0 days")}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {row.total_po_count ?? 0}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
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

      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h5">Add Remarks</Typography>
          <Textarea
            minRows={3}
            placeholder="Enter Rejection Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button sx={{ mt: 2 }} onClick={handleApprove} color="danger">
            Submit
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default PurchaseReqSummary;
