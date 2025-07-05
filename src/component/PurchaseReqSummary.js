import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  CircularProgress,
  Chip,
  Tooltip,
  Stack,
  Modal,
  ModalDialog,
  ModalClose,
  Textarea,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import  { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllPurchaseRequestQuery } from "../redux/camsSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function PurchaseReqSummary() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const { data, isLoading } = useGetAllPurchaseRequestQuery({
    page,
    search,
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

  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleApprove = () => {
    console.log("Remarks:", remarks);
    handleClose();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "primary";
      case "approved":
        return "warning";
      case "po_created":
        return "success";
      default:
        return "default";
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
                "PR No.",
                "Project Code",
                "Item Name",
                "Status",
                "EID",
                "Delivery Date",
                "Delay",
                "PO Count",
                "PO Value with GST",
                "Action",
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
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <Tooltip
                        title={
                          row.current_status.status !== "approved"
                            ? "Please Approve PR to create PO"
                            : "Create PO"
                        }
                        arrow
                      >
                        <span>{row.pr_no}</span>
                      </Tooltip>
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
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "center",
                        padding: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="Approve PR" arrow placement="top">
                          <Button
                            color="success"
                            variant="plain"
                            sx={{
                              borderRadius: "50%",
                              width: 36,
                              height: 36,
                              minWidth: 0,
                              boxShadow: "0 2px 6px rgba(0, 128, 0, 0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(0, 128, 0, 0.1)",
                              },
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: "green", fontSize: 28 }}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Reject PR" arrow placement="top">
                          <Button
                            color="danger"
                            variant="plain"
                            onClick={handleOpen}
                            sx={{
                              borderRadius: "50%",
                              width: 36,
                              height: 36,
                              minWidth: 0,
                              boxShadow: "0 2px 6px rgba(255, 0, 0, 0.3)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 0, 0, 0.1)",
                              },
                            }}
                          >
                            <CancelIcon sx={{ color: "red", fontSize: 28 }} />
                          </Button>
                        </Tooltip>
                      </Stack>
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
