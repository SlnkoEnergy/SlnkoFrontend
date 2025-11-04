// pages/AllLoan.jsx
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Avatar,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Textarea,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import { useGetAllProjectsForLoanQuery } from "../redux/projectsSlice";
import DOMPurify from "dompurify";
import { useUpdateLoanStatusMutation } from "../redux/loanSlice";

/* ------------ small helpers ------------ */
function relTime(iso) {
  if (!iso) return "";
  const now = Date.now();
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(1, Math.floor((now - t) / 1000)); // sec
  const mins = Math.floor(diff / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (diff < 60) return `${diff}s ago`;
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days} d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function latestPerUser(comments = [], limit = 2) {
  if (!Array.isArray(comments) || comments.length === 0) return [];
  const sorted = [...comments].sort(
    (a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0)
  );
  const seen = new Set();
  const picked = [];
  for (const c of sorted) {
    const uid =
      c?.createdBy?._id ||
      c?.createdBy ||
      c?.user_id?._id ||
      c?.user_id ||
      "na";
    if (seen.has(String(uid))) continue;
    seen.add(String(uid));
    picked.push(c);
    if (picked.length >= limit) break;
  }
  return picked;
}

function statusColor(s) {
  switch (String(s || "").toLowerCase()) {
    case "documents pending":
      return "danger";
    case "under banking process":
      return "warning";
    case "sanctioned":
      return "primary";
    case "disbursed":
      return "success";
    default:
      return "neutral";
  }
}

/** Sanitizes and renders limited HTML safely */
function SafeHtml({ html, clamp = 2 }) {
  const safe = useMemo(
    () =>
      DOMPurify.sanitize(String(html || ""), {
        ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "ul", "ol", "li"],
        ALLOWED_ATTR: [],
      }),
    [html]
  );

  if (!safe) {
    return (
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        —
      </Typography>
    );
  }

  // Use a Box with line-clamp that still supports inner HTML
  return (
    <Box
      sx={{
        display: "-webkit-box",
        WebkitLineClamp: clamp,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        lineHeight: 1.4,
        wordBreak: "break-word",
        mt: 0.25,
        "& ul, & ol": {
          margin: 0,
          paddingLeft: "1rem",
        },
      }}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

function CommentPill({ c }) {
  const name = c?.createdBy?.name || "User";
  const avatar = c?.createdBy?.attachment_url || "";
  const when = relTime(c?.updatedAt || c?.createdAt);
  const text = (c?.remarks || "").toString();

  return (
    <Sheet
      variant="soft"
      sx={{
        borderRadius: "xl",
        px: 1.25,
        py: 0.75,
        display: "inline-flex",
        alignItems: "flex-start",
        gap: 1,
        maxWidth: 360,
      }}
    >
      <Avatar
        src={avatar || undefined}
        variant={avatar ? "soft" : "solid"}
        size="sm"
        sx={{ width: 24, height: 24, mt: 0.25, flex: "0 0 auto" }}
      >
        {!avatar && name ? name.charAt(0).toUpperCase() : null}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="baseline" gap={0.75}>
          <Typography
            level="body-sm"
            fontWeight="lg"
            sx={{ whiteSpace: "nowrap" }}
          >
            {name}
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
            {when}
          </Typography>
        </Stack>

        {/* Render sanitized HTML (lists/bold/etc.) with clamp */}
        <SafeHtml html={text} clamp={2} />
      </Box>
    </Sheet>
  );
}

function AllLoan({ selected, setSelected }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  const options = [1, 5, 10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );
  const project_status = searchParams.get("project_status") || "";
  const state = searchParams.get("state") || "";
  const loan_status = searchParams.get("loan_status") || "";
  const expected_sanction_from =
    searchParams.get("expected_sanction_from") || "";
  const expected_sanction_to = searchParams.get("expected_sanction_to") || "";
  const expected_disbursement_from =
    searchParams.get("expected_disbursement_from") || "";
  const expected_disbursement_to =
    searchParams.get("expected_disbursement_to") || "";
  const actual_sanction_from = searchParams.get("actual_sanction_from") || "";
  const actual_sanction_to = searchParams.get("actual_sanction_to") || "";
  const actual_disbursement_from =
    searchParams.get("actual_disbursement_from") || "";
  const actual_disbursement_to =
    searchParams.get("actual_disbursement_to") || "";

  const {
    data: getLoan = {},
    isLoading,
    refetch,
  } = useGetAllProjectsForLoanQuery({
    page: currentPage,
    search: searchQuery,
    status: project_status,
    limit: rowsPerPage,
    bank_state: state,
    loan_status: loan_status,
    expected_sanction_from: expected_sanction_from,
    expected_sanction_to: expected_sanction_to,
    expected_disbursement_from: expected_disbursement_from,
    expected_disbursement_to: expected_disbursement_to,
    actual_sanction_from: actual_sanction_from,
    actual_sanction_to: actual_sanction_to,
    actual_disbursement_from: actual_disbursement_from,
    actual_disbursement_to: actual_disbursement_to,
    sort: "-createdAt",
  });

  const STATUS_OPTIONS = [
    "documents pending",
    "documents submitted",
    "under banking process",
    "sanctioned",
    "disbursed",
  ];

  const cap = (s) =>
    String(s || "")
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const [updateLoanStatus, { isLoading: updating, error: updateErr }] =
    useUpdateLoanStatusMutation();

  const openStatusModal = (loan) => {
    setSelectedLoan(loan);
    setNextStatus(loan?.loan_current_status?.status || "");
    setRemarks("");
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedLoan(null);
    setNextStatus("");
    setRemarks("");
  };

  const saveStatus = async () => {
    if (!selectedLoan?._id || !nextStatus) return;
    try {
      await updateLoanStatus({
        project_id: selectedLoan._id,
        status: nextStatus,
        remarks,
      }).unwrap();
      closeStatusModal();
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const loanData = getLoan?.data || [];
  const loanPagination = getLoan?.pagination || {};

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const total = Number(loanPagination?.totalDocs || 0);
  const pageSize = Number(rowsPerPage || 1);
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  const handleSearch = (query) => setSearchQuery(query.toLowerCase());

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(loanData.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const baseHeaders = [
    "Project Id",
    "Customer",
    "Mobile",
    "State",
    "Capacity(AC)",
    "Loan Status",
    "Comments",
  ];
  const totalCols = 1 + baseHeaders.length;

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
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
            gap: 1,
            width: { xs: "100%", lg: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by Project ID, Customer"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
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
          sx={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
        >
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              {/* checkbox column */}
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
                  checked={selected?.length === loanData?.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected?.length > 0 && selected?.length < loanData?.length
                  }
                />
              </th>

              {baseHeaders.map((header, index) => (
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
                  colSpan={totalCols}
                  style={{ padding: "8px", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ marginBottom: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : loanData?.length > 0 ? (
              loanData.map((loan) => {
                // compute latest-two, one-per-user
                const comments = latestPerUser(loan?.loan_comments || [], 2);

                return (
                  <tr
                    key={loan._id}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(`/view_loan?project_id=${loan._id}`)
                    }
                  >
                    {/* checkbox cell */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(loan._id)}
                        onChange={() => handleRowSelect(loan._id)}
                      />
                    </td>

                    {/* Project Id */}
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Chip
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/project_detail?project_id=${loan._id}`);
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        {loan.code}
                      </Chip>
                    </td>

                    {/* Customer */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {loan.customer || "-"}
                    </td>

                    {/* Mobile */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {loan.number || "-"}
                    </td>

                    {/* State */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {loan.state || "-"}
                    </td>

                    {/* Capacity(AC) */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {loan.project_kwp ? `${loan.project_kwp} AC` : "-"}
                    </td>

                    {/* Loan Status */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <Chip
                        size="sm"
                        variant="soft"
                        color={statusColor(loan?.loan_current_status?.status)}
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: 500,
                          cursor: "pointer",
                          "&:hover": { boxShadow: "sm" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openStatusModal(loan);
                        }}
                      >
                        {loan?.loan_current_status?.status
                          ? cap(loan.loan_current_status.status)
                          : "Not Submitted"}
                      </Chip>
                    </td>

                    {/* Comments (latest two, one per user) */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {comments.length === 0 ? (
                        <Typography
                          level="body-sm"
                          sx={{ color: "text.tertiary" }}
                        >
                          —
                        </Typography>
                      ) : (
                        <Stack direction="column" gap={0.75}>
                          {comments.map((c, idx) => (
                            <CommentPill key={c?._id || idx} c={c} />
                          ))}
                        </Stack>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={totalCols}
                  style={{ padding: "8px", textAlign: "left" }}
                >
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
                      style={{ width: 50, height: 50, marginBottom: 8 }}
                    />
                    <Typography fontStyle="italic">
                      No Loan Projects Found
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

        <Box>Showing {loanData?.length} results</Box>

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
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  return params;
                });
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {options.map((value) => (
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
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </Box>

      {/* ---------- Status Update Modal ---------- */}
      <Modal open={statusModalOpen} onClose={closeStatusModal}>
        <ModalDialog
          aria-labelledby="loan-status-title"
          variant="outlined"
          sx={{ borderRadius: "lg", minWidth: 420, maxWidth: "90vw" }}
        >
          <ModalClose />
          <DialogTitle id="loan-status-title">Change Loan Status</DialogTitle>
          <DialogContent>
            Select a status and optionally add remarks. This will be recorded in
            the loan status.
          </DialogContent>

          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Select
              value={nextStatus || ""}
              onChange={(_, v) => setNextStatus(v || "")}
              placeholder="Select status"
            >
              {STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>
                  {cap(s)}
                </Option>
              ))}
            </Select>

            <Textarea
              minRows={3}
              placeholder="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            {updateErr ? (
              <Alert color="danger" variant="soft">
                {updateErr?.data?.message ||
                  updateErr?.error ||
                  "Failed to update status."}
              </Alert>
            ) : null}
          </Box>

          <DialogActions>
            <Button variant="plain" onClick={closeStatusModal}>
              Cancel
            </Button>
            <Button
              onClick={saveStatus}
              loading={updating}
              disabled={!selectedLoan || !nextStatus}
            >
              Save
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default AllLoan;
