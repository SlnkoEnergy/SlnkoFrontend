import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HandshakeIcon from "@mui/icons-material/Handshake";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Chip,
  CircularProgress,
  Modal,
  Option,
  Select,
  Snackbar,
  Textarea,
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
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetAllPurchaseRequestQuery,
  useGetMaterialCategoryQuery,
  useUpdatePurchaseRequestStatusMutation,
} from "../redux/camsSlice";

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

  const RenderPRNo = ({ pr_no, createdAt, project_id, item_id, pr_id }) => {
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
      </>
    );
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    maxWidth: 480,
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  };

  const PRActions = ({ _id, current_status }) => {
    console.log("Current Status:", current_status.status);
    console.log("ID:", _id);

    const status = current_status?.status;

    const [open, setOpen] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const [updateStatus, { isLoading }] =
      useUpdatePurchaseRequestStatusMutation();

    const handleChipClick = (newStatus) => {
      setSelectedStatus(newStatus);
      setOpen(true);
    };

    const handleSubmit = async () => {
      try {
        await updateStatus({
          id: _id,
          status: selectedStatus,
          remarks,
        }).unwrap();

        setSnackbarMessage(`Status updated to ${selectedStatus}`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setOpen(false);
        setRemarks("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error("Status update failed:", err);
        setSnackbarMessage("Failed to update status");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    const handleClose = () => {
      setOpen(false);
      setRemarks("");
    };

    const renderStatusChip = () => {
      switch (status) {
        case "submitted":
          return (
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
              <Chip
                variant="soft"
                color="success"
                startDecorator={<CheckRoundedIcon />}
                onClick={() => handleChipClick("approved")}
                sx={{
                  cursor: "pointer",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />

              <Chip
                variant="outlined"
                color="danger"
                startDecorator={<BlockIcon />}
                onClick={() => handleChipClick("rejected")}
                sx={{
                  cursor: "pointer",
                  textTransform: "none",
                  fontWeight: 500,
                }}
              />
            </Box>
          );

        case "rejected":
          return (
            <Chip
              variant="outlined"
              color="danger"
              startDecorator={<BlockIcon />}
            >
              Rejected
            </Chip>
          );

        case "approved":
          return (
            <Chip
              variant="soft"
              color="warning"
              // startDecorator={<LocalShippingIcon />}
            >
              PO to be Raised
            </Chip>
          );

        case "po_created":
          return (
            <Chip
              variant="soft"
              color="primary"
              startDecorator={<LocalShippingIcon />}
            >
              Out for Delivery
            </Chip>
          );

        case "delivered":
          return (
            <Chip
              variant="solid"
              color="primary"
              startDecorator={<HandshakeIcon />}
            >
              Delivered
            </Chip>
          );

        default:
          return null;
      }
    };

    return (
      <>
        {/* Render Status Chip */}
        {renderStatusChip()}

        {/* Show action chips only if not finalized */}
        {/* {status === "submitted" && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Chip
              variant="solid"
              color="success"
              label="Approved"
              onClick={() => handleChipClick("approved")}
              startDecorator={<CheckRoundedIcon />}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            />
            <Chip
              variant="outlined"
              color="danger"
              label="Rejected"
              onClick={() => handleChipClick("rejected")}
              startDecorator={<BlockIcon />}
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            />
          </Box>
        )} */}

        {/* Modal for Remarks */}
        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <Typography level="h6" mb={2}>
              {`${selectedStatus?.charAt(0).toUpperCase() + selectedStatus?.slice(1)} Remarks`}
            </Typography>

            <Textarea
              placeholder="Enter remarks..."
              minRows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
              <Button
                onClick={handleClose}
                disabled={isLoading}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                variant="solid"
                color="primary"
                disabled={!remarks}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar Feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            color={snackbarSeverity}
            variant="soft"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
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
                "ETD",
                "Delivery Date",
                "Delay",
                "PO Count",
                "PO Value",
                "Actions",
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
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <RenderPRNo
                        pr_no={row.pr_no}
                        createdAt={row.createdAt}
                        project_id={row.project_id._id}
                        item_id={item.item_id?._id}
                        pr_id={row._id}
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
                      {row.etd ? new Date(row.etd).toLocaleDateString() : "-"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      {row.delivery_date
                        ? new Date(row.delivery_date).toLocaleDateString()
                        : "-"}
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
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      <PRActions
                        _id={row._id}
                        current_status={row.current_status}
                      />
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

      {/* <Modal open={open} onClose={handleClose}>
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
      </Modal> */}
    </>
  );
}

export default PurchaseReqSummary;
