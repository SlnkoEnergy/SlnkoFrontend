import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import InfoIcon from "@mui/icons-material/Info";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
// import Axios from "../utils/Axios";

import {
  Chip,
  CircularProgress,
  Modal,
  ModalDialog,
  Option,
  Select,
  Textarea,
  Tooltip,
  useTheme,
} from "@mui/joy";
import { Calendar } from "lucide-react";
import {
  useGetAllExpenseQuery,
  useUpdateExpenseStatusOverallMutation,
} from "../../redux/expenseSlice";

const HrExpense = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedstatus, setSelectedstatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // --- NEW: helper to merge into URL params without wiping others ---
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  const searchParam = searchQuery;

  const { data: getExpense = [], isLoading } = useGetAllExpenseQuery({
    page: currentPage,
    department: selectedDepartment,
    search: searchParam,
    status: selectedstatus,
    from,
    to,
  });

  const total = getExpense?.total || 0;
  const limit = getExpense?.limit || 10;
  const totalPages = Math.ceil(total / limit);

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const ids = paginatedExpenses.map((row) => row._id);
      setSelectedExpenses((prevSelected) => [
        ...new Set([...prevSelected, ...ids]),
      ]);
    } else {
      const ids = paginatedExpenses.map((row) => row._id);
      setSelectedExpenses((prevSelected) =>
        prevSelected.filter((id) => !ids.includes(id))
      );
    }
  };

  const renderFilters = () => {
    const departments = [
      "Accounts",
      "HR",
      "Engineering",
      "Projects",
      "Infra",
      "CAM",
      "Internal",
      "SCM",
      "IT Team",
      "BD",
    ];

    const statuses = [
      // { value: "draft", label: "Draft" },
      { value: "submitted", label: "Pending" },
      { value: "manager approval", label: "Manager Approved" },
      { value: "hr approval", label: "HR Approved" },
      { value: "final approval", label: "Approved" },
      { value: "hold", label: "On Hold" },
      { value: "rejected", label: "Rejected" },
    ];

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      ></Box>
    );
  };

  const handleRowSelect = (_id) => {
    setSelectedExpenses((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const handleSearch = (query) => {
    const q = query.toLowerCase();
    setSearchQuery(q);
    // --- NEW: push to URL + reset to first page ---
    updateParams({ q, page: 1 });
  };

  const expenses = useMemo(
    () => (Array.isArray(getExpense?.data) ? getExpense.data : []),
    [getExpense]
  );

  const RowMenu = ({ _id, status }) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [updateStatus] = useUpdateExpenseStatusOverallMutation();

    const disableActions = [
      "hr approval",
      "rejected",
      "hold",
      "final approval",
    ].includes(status.toLowerCase());

    const handleOpenModal = (status) => {
      setSelectedStatus(status);
      setOpenModal(true);
    };

    const handleSubmit = async () => {
      if (!remarks.trim()) {
        toast.error("Please enter remarks.");
        return;
      }

      try {
        await updateStatus({
          _id,
          status: selectedStatus,
          remarks,
        }).unwrap();

        toast.success(`Status updated to ${selectedStatus}`);
        setOpenModal(false);
        setRemarks("");

        // setTimeout(() => {
        //   window.location.reload();
        // }, 100);
      } catch (err) {
        toast.error("Update failed");
        console.error(err);
      }
    };

    return (
      <>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            color="danger"
            onClick={() => handleOpenModal("rejected")}
            startDecorator={<BlockIcon />}
            label="Reject"
            disabled={disableActions}
            sx={{ cursor: disableActions ? "not-allowed" : "pointer" }}
          />
          <Chip
            color="warning"
            onClick={() => handleOpenModal("hold")}
            startDecorator={<PauseCircleIcon />}
            label="Hold"
            disabled={disableActions}
            sx={{ cursor: disableActions ? "not-allowed" : "pointer" }}
          />
          <Chip
            color="success"
            onClick={() => handleOpenModal("hr approval")}
            startDecorator={<CheckCircleIcon />}
            label="HR Approval"
            disabled={disableActions}
            sx={{ cursor: disableActions ? "not-allowed" : "pointer" }}
          />
        </Box>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <ModalDialog>
            <Typography level="h5">Remarks for {selectedStatus}</Typography>
            <Textarea
              placeholder="Enter your remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </>
    );
  };

  // --- UPDATED: read all filters from URL and sync local state ---
  useEffect(() => {
    const pageParam = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );
    if (pageParam !== currentPage) setCurrentPage(pageParam);

    const qParam = searchParams.get("q") || "";
    if (qParam !== searchQuery) setSearchQuery(qParam);

    const deptParam = searchParams.get("department") || "";
    if (deptParam !== selectedDepartment) setSelectedDepartment(deptParam);

    const statusParam = searchParams.get("status") || "";
    if (statusParam !== selectedstatus) setSelectedstatus(statusParam);

    const fromParam = searchParams.get("from") || "";
    if (fromParam !== from) setFrom(fromParam);

    const toParam = searchParams.get("to") || "";
    if (toParam !== to) setTo(toParam);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const paginatedExpenses = expenses;

  console.log("paginatedExpenses", paginatedExpenses);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      // --- UPDATED: merge, don't replace ---
      updateParams({ page: String(page) });
    }
  };

  const ExpenseCode = ({ currentPage, expense_code, createdAt }) => {
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
              localStorage.setItem("edit_expense", expense_code);
              navigate(
                `/update_expense?page=${currentPage}&code=${expense_code}`
              );
            }}
          >
            {expense_code || "-"}
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
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      {/* Tablet and Up Filters */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by Exp. Code, Emp. Code, Emp. Name, or Status"
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
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  width: 44,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={
                    paginatedExpenses.length > 0 &&
                    paginatedExpenses.every((expense) =>
                      selectedExpenses.includes(expense._id)
                    )
                  }
                  indeterminate={
                    paginatedExpenses.some((expense) =>
                      selectedExpenses.includes(expense._id)
                    ) &&
                    !paginatedExpenses.every((expense) =>
                      selectedExpenses.includes(expense._id)
                    )
                  }
                  onChange={handleSelectAll}
                />
              </Box>
              {[
                "Expense Code",
                "Employee Name",
                "Requested Amount",
                "Approval Amount",
                "Rejected Amount",
                "Disbursement Date",
                "Current Status",
                "Actions",
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {isLoading ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={9}
                  sx={{
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size="sm" sx={{ color: "primary.500" }} />
                    <Typography fontStyle="italic">
                      Loading expense… please hang tight ⏳
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : paginatedExpenses.length > 0 ? (
              paginatedExpenses.map((expense, index) => (
                <Box
                  component="tr"
                  key={index}
                  sx={{
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      color="primary"
                      checked={selectedExpenses.includes(expense._id)}
                      onChange={() => handleRowSelect(expense._id)}
                    />
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Box sx={{ fontSize: 15 }}>
                      <ExpenseCode
                        currentPage={currentPage}
                        expense_code={expense.expense_code}
                        createdAt={expense.createdAt}
                      />
                    </Box>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {expense.emp_name || "0"}
                    <Box>
                      <span style={{ fontSize: 12 }}>{expense.emp_id}</span>
                    </Box>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {expense.total_requested_amount || "0"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {expense.total_approved_amount || "0"}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {(() => {
                      const requested = Number(
                        expense.total_requested_amount || 0
                      );
                      const approved = Number(
                        expense.total_approved_amount || 0
                      );
                      const rejected = requested - approved;
                      return isNaN(rejected) ? "0" : rejected.toString();
                    })()}
                  </Box>

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {expense.disbursement_date
                      ? new Date(expense.disbursement_date).toLocaleDateString(
                        "en-GB"
                      )
                      : "-"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    {(() => {
                      const status =
                        typeof expense.current_status === "string"
                          ? expense.current_status
                          : expense.current_status?.status || "";

                      if (status === "submitted" || status === "draft") {
                        return (
                          <Chip color="warning" variant="soft" size="sm">
                            Pending
                          </Chip>
                        );
                      } else if (status === "manager approval") {
                        return (
                          <Chip color="info" variant="soft" size="sm">
                            Manager Approved
                          </Chip>
                        );
                      } else if (status === "hr approval") {
                        return (
                          <Chip color="primary" variant="soft" size="sm">
                            HR Approved
                          </Chip>
                        );
                      } else if (status === "final approval") {
                        return (
                          <Chip color="success" variant="soft" size="sm">
                            Approved
                          </Chip>
                        );
                      } else if (status === "hold") {
                        return (
                          <Chip color="neutral" variant="soft" size="sm">
                            On Hold
                          </Chip>
                        );
                      } else if (status === "rejected") {
                        const remarks = expense.current_status?.remarks?.trim();

                        return (
                          <Box
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Chip variant="soft" color="danger" size="sm">
                              Rejected
                            </Chip>
                            <Tooltip
                              title={remarks || "Remarks not found"}
                              arrow
                            >
                              <IconButton size="sm" color="danger">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        );
                      } else {
                        return (
                          <Chip variant="outlined" size="sm">
                            -
                          </Chip>
                        );
                      }
                    })()}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontSize: 15,
                    }}
                  >
                    <RowMenu
                      _id={expense._id}
                      status={
                        typeof expense.current_status === "string"
                          ? expense.current_status
                          : expense.current_status?.status || "-"
                      }
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={9}
                  sx={{
                    padding: "8px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  No data available
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 1,
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

        <Box>
          Showing page {currentPage} of {totalPages} ({total} results)
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
    </Box>
  );
});
export default HrExpense;
