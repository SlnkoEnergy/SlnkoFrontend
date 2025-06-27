import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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
import { Chip, Option, Select, useTheme } from "@mui/joy";
import { useGetAllExpenseQuery } from "../../redux/Expense/expenseSlice";

const AccountsExpense = forwardRef(() => {
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

  const searchParam = selectedstatus ? selectedstatus : searchQuery;

  const { data: getExpense = [] } = useGetAllExpenseQuery({
    page: currentPage,
    department: selectedDepartment,
    search: searchParam,
    from,
    to,
  });

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
      >
        <FormControl sx={{ minWidth: 180 }} size="sm">
          <FormLabel>Department</FormLabel>
          <Select
            value={selectedDepartment}
            onChange={(e, newValue) => {
              setSelectedDepartment(newValue);
              setCurrentPage(1);
            }}
            size="sm"
            placeholder="Select Department"
          >
            <Option value="">All Departments</Option>
            {departments.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Status</FormLabel>
          <Select
            value={selectedstatus}
            onChange={(e, newValue) => {
              setSelectedstatus(newValue);
              setCurrentPage(1);
            }}
            size="sm"
            placeholder="Select Status"
          >
            <Option value="">All Status</Option>
            {statuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>From Date</FormLabel>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>To Date</FormLabel>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>
      </Box>
    );
  };

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

  const expenses = useMemo(
    () => (Array.isArray(getExpense?.data) ? getExpense.data : []),
    [getExpense]
  );

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

  const handleRowSelect = (_id) => {
    setSelectedExpenses((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const ExpenseCode = ({ currentPage, expense_code }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            localStorage.setItem("edit_expense", expense_code);
            navigate(
              `/update_expense?page=${currentPage}&code=${expense_code}`
            );
          }}
        >
          {expense_code || "-"}
        </span>
      </>
    );
  };

  const EmployeeName = ({ currentPage, expense_code, emp_name }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            localStorage.setItem("edit_expense", expense_code);
            navigate(`/edit_expense?page=${currentPage}&code=${expense_code}`);
          }}
        >
          {emp_name || "-"}
        </span>
      </>
    );
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const paginatedExpenses = expenses;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: String(page) });
    }
  };

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
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
            placeholder="Search by Exp. Code, Emp. Code, Emp. Name, or Status"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: "flex",
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
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
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
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
                "Employee Code",
                "Employee Name",
                "Requested Amount",
                "Approval Amount",
                "Rejected Amount",
                "Disbursement Date",
                "Status",
                // "Actions",
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {paginatedExpenses.length > 0 ? (
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
                      textAlign: "center",
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
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline",
                        textDecoration: "underline dotted",
                        textUnderlineOffset: "2px",
                        textDecorationColor: "#999",
                      }}
                    >
                      <ExpenseCode
                        currentPage={currentPage}
                        expense_code={expense.expense_code}
                      />
                    </Box>
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {expense.emp_id || "-"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <EmployeeName
                      currentPage={currentPage}
                      expense_code={expense.expense_code}
                      emp_name={expense.emp_name}
                    />
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {expense.total_requested_amount || "0"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {expense.total_approved_amount || "0"}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
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
                      textAlign: "center",
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
                      textAlign: "center",
                    }}
                  >
                    {(() => {
                      const status = expense.current_status?.toLowerCase();

                      if (status === "submitted") {
                        return (
                          <Chip color="warning" variant="soft" size="sm">
                            Pending
                          </Chip>
                        );
                      } else if (status === "hr approval") {
                        return (
                          <Chip color="primary" variant="soft" size="sm">
                            HR Approved
                          </Chip>
                        );
                      } else if (status === "manager approval") {
                        return (
                          <Chip color="info" variant="soft" size="sm">
                            Manager Approved
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
                        return (
                          <Chip color="danger" variant="soft" size="sm">
                            Rejected
                          </Chip>
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
                  {/* <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu
                      _id={expense._id}
                      status={expense.current_status}
                    />
                  </Box> */}
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
    </>
  );
});
export default AccountsExpense;
