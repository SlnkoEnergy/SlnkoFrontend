// components/Eng_Inspection.jsx
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFile from "@mui/icons-material/UploadFile";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import {
  Chip,
  CircularProgress,
  Option,
  Select,
  Modal,
  ModalDialog,
  ModalClose,
  Textarea,
} from "@mui/joy";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import {
  useGetInspectionsQuery,
  useUpdateStatusInspectionMutation,
} from "../redux/inspectionSlice";

// ---------- helpers ----------
const uniqueInOrder = (arr) => {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (!v) continue;
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
};

const toTooltip = (arr) =>
  arr.length ? arr.map((v) => `• ${v}`).join("\n") : "";

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN") : "-";

const ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
].join(",");

const MAX_FILE_MB = 15;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
// --------------------------------

function Eng_Inspection() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL params → state
  const initialPage = Number(searchParams.get("page") || 1);
  const initialPageSize = Number(searchParams.get("pageSize") || 10);
  const initialSearch = searchParams.get("search") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selected, setSelected] = useState([]);

  // date filters
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [dateError, setDateError] = useState("");

  const options = [10, 20, 50, 100];

  // Modal state for status update
  const [openModal, setOpenModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Files state for drag-and-drop upload
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const [updateStatusInspection, { isLoading: isUpdating }] =
    useUpdateStatusInspectionMutation();

  const handleChipClick = (id, currentStatus) => {
    setSelectedId(id);
    setModalStatus(currentStatus || "requested");
    setModalRemarks("");
    setFiles([]);
    setFileError("");
    setOpenModal(true);
  };

  // Add files (validating type/size)
  const addFiles = (list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    const next = [];
    let err = "";

    picked.forEach((f) => {
      if (f.size > MAX_FILE_BYTES) {
        err = `File "${f.name}" exceeds ${MAX_FILE_MB} MB.`;
        return;
      }
      if (!ACCEPT.split(",").includes(f.type)) {
        err = `File "${f.name}" type not allowed.`;
        return;
      }
      next.push(f);
    });

    if (err) setFileError(err);
    setFiles((prev) => [...prev, ...next]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onBrowse = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit status + remarks + files
  const handleSubmitStatus = async () => {
    try {
      await updateStatusInspection({
        id: selectedId,
        status: modalStatus,
        remarks: modalRemarks,
        files, // pass File[]
      }).unwrap();
      setOpenModal(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      setFileError(err?.data?.message || "Failed to update status");
    }
  };

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Validate dates
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setDateError("End date cannot be earlier than start date.");
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(currentPage));
    params.set("pageSize", String(rowsPerPage));
    params.set("search", debouncedSearch);

    // handle optional dates
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, debouncedSearch, startDate, endDate]);

  // Refetch with filters
  const { data, isFetching, isLoading, isError, error } =
    useGetInspectionsQuery({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

  // Match API shape
  const list = data?.data ?? [];
  const total = Number(data?.pagination?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // Reset selection when page data changes
  useEffect(() => {
    setSelected([]);
  }, [list]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(list.map((row) => row?._id).filter(Boolean));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((x) => x !== _id) : [...prev, _id]
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Sort newest by "date" then by updatedAt/createdAt as fallback
  const filteredAndSortedData = useMemo(() => {
    return [...list].sort((a, b) => {
      const dateA = new Date(
        a?.date || a?.updatedAt || a?.createdAt || 0
      ).getTime();
      const dateB = new Date(
        b?.date || b?.updatedAt || b?.createdAt || 0
      ).getTime();
      return dateB - dateA;
    });
  }, [list]);

  const PlusBadge = ({ moreTooltip, count }) =>
    count > 0 ? (
      <Tooltip arrow title={<pre style={{ margin: 0 }}>{moreTooltip}</pre>}>
        <Box
          component="span"
          sx={{
            px: 0.75,
            py: 0.25,
            fontSize: "12px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            cursor: "default",
          }}
        >
          +{count}
        </Box>
      </Tooltip>
    ) : null;

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    if (currentPage !== 1) setCurrentPage(1);
  };

  return (
    <>
      {/* Search + Date Filters + Rows Per Page */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          ml: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Search box */}
        <FormControl sx={{ flex: 1, minWidth: 240 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Project Id, Vendor, Category..."
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentPage !== 1) setCurrentPage(1);
            }}
          />
        </FormControl>

        {/* Start Date */}
        <FormControl size="sm" sx={{ minWidth: 170 }}>
          <FormLabel>Start date</FormLabel>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (currentPage !== 1) setCurrentPage(1);
            }}
          />
        </FormControl>

        {/* End Date */}
        <FormControl size="sm" sx={{ minWidth: 170 }}>
          <FormLabel>End date</FormLabel>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (currentPage !== 1) setCurrentPage(1);
            }}
          />
        </FormControl>

        {/* Clear dates */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={clearDates}
          sx={{ alignSelf: "center", mt: { xs: 1.75, sm: 2.5 } }}
        >
          Clear Dates
        </Button>

        {/* Rows Per Page (to the right) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            whiteSpace: "nowrap",
            mt: 2.5,
          }}
        >
          <Typography level="body-sm">Rows Per Page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(_, newValue) => {
              if (newValue) {
                setRowsPerPage(newValue);
                if (currentPage !== 1) setCurrentPage(1);
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {[10, 20, 50, 100].map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Date validation message */}
      {dateError && (
        <Box sx={{ ml: { xl: "15%", lg: "18%" }, mt: -1.5, mb: 1 }}>
          <Typography color="danger" level="body-sm">
            {dateError}
          </Typography>
        </Box>
      )}

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          ml: { lg: "18%", xl: "15%" },
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
                  checked={list.length > 0 && selected.length === list.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 && selected.length < list.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Item Category",
                "Item Make",
                "Vendor",
                "Inspection Date",
                "Status",
                "Action",
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
            {(isLoading || isFetching) && (
              <tr>
                <td colSpan={9} style={{ padding: "8px" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ mb: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            )}

            {isError && !isLoading && !isFetching && (
              <tr>
                <td colSpan={9} style={{ padding: "8px" }}>
                  <Typography color="danger">
                    Failed to load inspections
                    {error?.data?.message ? `: ${error.data.message}` : ""}
                  </Typography>
                </td>
              </tr>
            )}

            {!isLoading &&
              !isFetching &&
              !isError &&
              (filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((row) => {
                  const id = row?._id;
                  const projectCode =
                    row?.project_code || row?.projectId || "-";

                  const items = Array.isArray(row?.item) ? row.item : [];

                  const uniqueCategories = uniqueInOrder(
                    items.map((it) => it?.category_id?.name || null)
                  );
                  const uniqueMakes = uniqueInOrder(
                    items.map((it) => it?.product_make || null)
                  );

                  const itemCategory = uniqueCategories[0] || "-";
                  const itemMake = uniqueMakes[0] || "-";

                  const catMoreCount = Math.max(0, uniqueCategories.length - 1);
                  const makeMoreCount = Math.max(0, uniqueMakes.length - 1);
                  const catTooltip = toTooltip(uniqueCategories.slice(1));
                  const makeTooltip = toTooltip(uniqueMakes.slice(1));

                  const vendor = row?.vendor || row?.vendor_name || "-";
                  const when = row?.date || row?.createdAt;
                  const status = row?.current_status?.status || "-";

                  return (
                    <tr key={id || Math.random()}>
                      {/* Select */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        <Checkbox
                          size="sm"
                          checked={selected.includes(id)}
                          onChange={() => handleRowSelect(id)}
                          disabled={!id}
                        />
                      </td>

                      {/* Project Id */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        {projectCode}
                      </td>

                      {/* Item Category */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <Typography level="body-sm">
                            {itemCategory}
                          </Typography>
                          <PlusBadge
                            moreTooltip={catTooltip}
                            count={catMoreCount}
                          />
                        </Box>
                      </td>

                      {/* Item Make */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <Typography level="body-sm">{itemMake}</Typography>
                          <PlusBadge
                            moreTooltip={makeTooltip}
                            count={makeMoreCount}
                          />
                        </Box>
                      </td>

                      {/* Vendor */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        {vendor}
                      </td>

                      {/* Inspection Date */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        {fmtDateTime(when)}
                      </td>

                      {/* Status */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            status === "requested"
                              ? "primary"
                              : status === "failed"
                                ? "danger"
                                : status === "approved"
                                  ? "success"
                                  : "neutral"
                          }
                          onClick={() => handleChipClick(id, status)}
                          sx={{
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {status || "-"}
                        </Chip>
                      </td>

                      {/* Action */}
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          textAlign: "left",
                        }}
                      >
                        <Tooltip title="View Inspection" arrow>
                          <IconButton
                            size="sm"
                            variant="soft"
                            onClick={() =>
                              navigate(`/inspection_form?mode=view&id=${id}`, {
                                state: { id, projectCode },
                              })
                            }
                          >
                            <VisibilityIcon fontSize="sm" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
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
                      <Typography fontStyle="italic">
                        No Inspections Found
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ))}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination + Modal */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          ml: { lg: "18%", xl: "15%" },
          mr: { lg: "5%" },
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
          Page {currentPage} of {totalPages} — Showing {list.length} of {total}{" "}
          results
        </Box>

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

        {/* Status Update Modal */}
      </Box>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog sx={{ width: 520, maxWidth: "92vw" }}>
          <ModalClose />

          <Typography level="h5" mb={1.5}>
            Update Inspection Status
          </Typography>

          {/* Status */}
          <FormControl sx={{ mb: 1.5 }}>
            <FormLabel>Status</FormLabel>
            <Select
              value={modalStatus}
              onChange={(_, value) => setModalStatus(value)}
            >
              <Option value="requested">Requested</Option>
              <Option value="approved">Approved</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </FormControl>

          {/* Remarks */}
          <FormControl sx={{ mb: 1.5 }}>
            <FormLabel>Remarks</FormLabel>
            <Textarea
              minRows={3}
              placeholder="Enter remarks..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
            />
          </FormControl>

          {/* Drag & Drop Uploader */}
          <FormControl>
            <FormLabel>Attachments (optional)</FormLabel>
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragging(false);
              }}
              onDrop={onDrop}
              sx={{
                mt: 0.5,
                border: "2px dashed",
                borderColor: isDragging
                  ? "primary.solidBg"
                  : "neutral.outlinedBorder",
                borderRadius: "md",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: isDragging ? "primary.softBg" : "transparent",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadFile fontSize="small" />
              <Typography level="body-sm">
                Drag & drop files here or <strong>browse</strong>
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={onBrowse}
                style={{ display: "none" }}
              />
            </Box>
            <Typography level="body-xs" sx={{ mt: 0.5 }} color="neutral">
              Allowed: PNG, JPG, WEBP, PDF • Max {MAX_FILE_MB} MB each
            </Typography>
          </FormControl>

          {/* Selected Files List */}
          {fileError && (
            <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
              {fileError}
            </Typography>
          )}

          {files.length > 0 && (
            <Sheet
              variant="soft"
              sx={{
                mt: 1.5,
                borderRadius: "sm",
                p: 1,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {files.map((f, idx) => (
                <Box
                  key={`${f.name}-${idx}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 0.75,
                    px: 1,
                    borderBottom: "1px dashed",
                    borderColor: "neutral.outlinedBorder",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level="body-sm" noWrap title={f.name}>
                      {f.name}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {f.type || "unknown"} • {formatBytes(f.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => removeFile(idx)}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Box>
              ))}
            </Sheet>
          )}

          <Button
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSubmitStatus}
            loading={isUpdating}
            disabled={!modalStatus}
          >
            Update
          </Button>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default Eng_Inspection;
