import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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

import { Chip, useTheme } from "@mui/joy";
import { useGetAllExpenseQuery } from "../../redux/Expense/expenseSlice";
import { useGetLoginsQuery } from "../../redux/loginSlice";

const ExpenseApproval = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const { data: getExpense = [], isLoading, error } = useGetAllExpenseQuery();

  const { data: getAllUser = [] } = useGetLoginsQuery();

  // console.log("getExpense: ", getExpense);

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
      // Remove only the IDs from current page
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

  const expenses = useMemo(
    () => (Array.isArray(getExpense?.data) ? getExpense.data : []),
    [getExpense]
  );

  // if (!user) return [];

  const filteredAndSortedData = expenses
    .filter((expense) => {
      const matchedUser = getAllUser?.data?.find(
        (u) => u.name === expense.emp_name
      );
      if (!matchedUser) return false;

      // Role and department-based access
      const allowedDepartments = [
        "Accounts",
        "Projects",
        "BD",
        "OPS",
        "CAM",
        "HR",
        "SCM",
        "Engineering",
      ];

      const isManager =
        user?.role === "manager" &&
        allowedDepartments.includes(user?.department);

      const isAdmin = user?.role === "admin" || user?.role === "superadmin";

      if (
        !isAdmin &&
        !(isManager && matchedUser.department === user?.department)
      ) {
        return false; // Access denied
      }

      // Status filter
      const allowedStatuses = [
        "submitted",
        "manager approval",
        "hr approval",
        "final approval",
        "hold",
        "rejected",
      ];
      const status = expense.current_status?.toLowerCase();
      if (!allowedStatuses.includes(status)) return false;

      // Search filter
      const search = searchQuery.toLowerCase();
      const matchesSearchQuery = [
        "expense_code",
        "emp_id",
        "emp_name",
        "status",
      ].some((key) => expense[key]?.toLowerCase().includes(search));

      return matchesSearchQuery;
    })
    .sort((a, b) => {
      const search = searchQuery.toLowerCase();
      const fields = ["expense_code", "emp_id", "emp_name", "status"];

      for (let field of fields) {
        const aValue = a[field]?.toLowerCase() || "";
        const bValue = b[field]?.toLowerCase() || "";
        const aMatch = aValue.includes(search);
        const bMatch = bValue.includes(search);

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }

      // Fallback sort by created date (descending)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(1);
    }

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (currentPage < totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
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
            navigate(`/edit_expense?page=${currentPage}&code=${expense_code}`);
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

  const totalPages = Math.ceil(
    (filteredAndSortedData?.length || 0) / itemsPerPage
  );

  const paginatedExpenses = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
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
        {/* {renderFilters()} */}
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
                "",
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
                    <ExpenseCode
                      currentPage={currentPage}
                      expense_code={expense.expense_code}
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
                          <Chip color="primary" variant="soft" size="sm">
                            Pending
                          </Chip>
                        );
                      } else if (
                        ["manager approval", "hr approval"].includes(status)
                      ) {
                        return (
                          <Chip color="warning" variant="soft" size="sm">
                            In Process
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

                  <Box
                    component="td"
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  ></Box>
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

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {generatePageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === "number" ? (
              <IconButton
                key={index}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            ) : (
              <Typography key={index} sx={{ px: 1, alignSelf: "center" }}>
                {page}
              </Typography>
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
export default ExpenseApproval;
