import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Textarea,
  Tooltip,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllExpenseQuery,
  useUpdateDisbursementDateMutation,
  useUpdateExpenseSheetMutation,
  useUpdateExpenseStatusOverallMutation,
  useLazyExportExpenseByIdToCSVQuery,
} from "../../../redux/Expense/expenseSlice";
import PieChartByCategory from "./Expense_Chart";

const UpdateExpenseAccounts = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      items: [
        {
          category: "",
          project_id: "",
          project_code: "",
          project_name: "",
          description: "",
          expense_date: "",
          invoice: {
            invoice_number: "",
            invoice_amount: "",
          },

          item_status_history: [
            {
              status: "",
              remarks: "",
              user_id: "",
            },
          ],
          approved_amount: "",
          remarks: "",
          item_current_status: "",
        },
      ],
      expense_term: {
        from: "",
        to: "",
      },
      status_history: [
        {
          status: "",
          remarks: "",
          user_id: "",
        },
      ],

      total_requested_amount: "",
      total_approved_amount: "",
      disbursement_date: "",
      comments: "",
    },
  ]);

  const [approveHRConfirmOpen, setHRApproveConfirmOpen] = useState(false);
  const [approveAccountsConfirmOpen, setAccountsApproveConfirmOpen] =
    useState(false);

  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [showAccountsRejectAllDialog, setAccountsShowRejectAllDialog] =
    useState(false);
  const [accountsRejectionReason, setAccountsRejectionReason] = useState("");

  const [showHoldAllDialog, setShowHoldAllDialog] = useState(false);
  const [holdReason, setHoldReason] = useState("");

  const [showAccountsHoldAllDialog, setAccountsShowHoldAllDialog] =
    useState(false);
  const [accountsHoldReason, setAccountsHoldReason] = useState("");

  const [disbursementData, setDisbursementData] = useState("");

  // const showDisbursement =
  //   rows[0]?.current_status === "final approval" &&
  //   user?.department === "Accounts";

  const [commentDialog, setCommentDialog] = useState({
    open: false,
    rowIndex: null,
  });

  // const inputRefs = useRef([]);

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
  const [triggerExportById] = useLazyExportExpenseByIdToCSVQuery();
  const handleExportCSVById = async (expenseId) => {
    try {
      const blob = await triggerExportById(expenseId).unwrap();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense_${expenseId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
    }
  };

  const categoryOptions = [
    "Site Meal Per-diem Allowance",
    "Site Lodging and Accommodation Expense",
    "Site Travelling Expenses",
    "Site Labour Charges",
    "Site Staff Telephone Expenses",
    "Site Courier and Parcel Expense",
    "Site Material Purchases",
    "Site Stationery Expenses",
    "Site Miscellaneous Expenses",
    "Site Vehicle Repair and Maintenance Expense",
  ];

  const categoryDescriptions = {
    "Site Meal Per-diem Allowance":
      "Please select this head to book allowance for personnel at project site given as per company policy for meals at project site.",
    "Site Lodging and Accommodation Expense":
      "Please select this head to book all lodging related expenses incurred by personnel at project site such as hotel, rentals of places and likewise. Please make sure to collect receipts or bills",
    "Site Travelling Expenses":
      "Please select this head to book all travelling related expenses incurred by personnel at project site such as bus-ticket, train-ticket, flight-ticket, reimbursements for fuel, hire of bikes or cabs and likewise. Please make sure to collect receipts or bills",
    "Site Staff Telephone Expenses":
      "Please select this head to book all telephone related expenses incurred by personnel at project site that happens for project at site. Please make sure to collect receipts or bills",
    "Site Courier and Parcel Expense":
      "Please select this head to book all expenses for parcels and couriers from project sites incurred by personnel at project sites. Please make sure to collect receipts or bills",
    "Site Labour Charges":
      "Please select this head to book all labour related expenses incurred by personnel at project site that happens for project at site. Please make sure to collect receipts or bills",
    "Site Material Purchases":
      "Please select this head to book all purchases incurred by personnel at project site that happens for project at site such as for cements, mechanical parts, modules and likewise chargeable to project clients. Please make sure to collect receipts or bills",
    "Site Stationery Expenses":
      "Please select this head to book all stationery items related expenses incurred by personnel at project site such as pens, papers and likewise. Please make sure to collect receipts or bills",
    "Site Miscellaneous Expenses":
      "Please select this head to book all other related expenses incurred by personnel at project site that happens for project at site which are not covered in the above heads. Please make sure to collect receipts or bills",
    "Site Vehicle Repair and Maintenance Expense":
      "Please select this head to book all vehicle repair and maintenance related expenses incurred by personnel at project site that happens for project at site. Please make sure to collect receipts or bills",
  };

  const bdAndSalesCategoryOptions = [
    "Business Promotion",
    "Business Development - Travelling Expense",
    "Lodging - Business Travel",
    "Business Development - Per Diem and Meal Expenses",
  ];

  const bdAndSalesCategoryDescriptions = {
    "Business Promotion":
      "Please select this head for all kinds of expenses related to expos, conferences and likewise.",
    "Business Development - Travelling Expense":
      "Please select this head to book all travelling related expenses incurred for client visit and meeting such as bus-ticket, train-ticket, flight-ticket, reimbursements for fuel, hire of bikes or cabs and likewise. Please make sure to collect receipts or bills",
    "Lodging - Business Travel":
      "Please select this head to book all lodging related expenses incurred for client visit and meeting such as hotel, rentals of places and likewise. Please make sure to collect receipts or bills",
    "Business Development - Per Diem and Meal Expenses":
      "Please select this head to book expenses and allowance for food incurred during client visits and meetings provided as per company policy.",
  };

  const officeAdminCategoryOptions = [
    "Meals Expense - Office",
    "Office Travelling and Conveyance Expenses",
    "Repair and Maintenance",
  ];

  const officeAdminCategoryDescriptions = {
    "Meals Expense - Office":
      "Please select this head to book expenses for food incurred during office meetings and late-sitting hours provided as per company policy. Please make sure to collect receipts or bills",
    "Office Travelling and Conveyance Expenses":
      "Please select this head to book all travelling related expenses incurred for official visits and meeting such as bus-ticket, train-ticket, flight-ticket, reimbursements for fuel, hire of bikes or cabs and likewise. Please make sure to collect receipts or bills",
    "Repair and Maintenance":
      "Please select this head to book all expenses incurred for repair and maintenance of less than INR 10,000 for office equipments and computers. Please make sure to collect receipts or bills. Please make sure all payment above INR 10,000 is to be made directly from bank after raising PO.",
  };

  function getCategoryOptionsByDepartment(department) {
    const common = officeAdminCategoryOptions;

    if (department === "Projects" || department === "Engineering") {
      return [...common, ...categoryOptions];
    }

    if (department === "BD" || department === "Marketing") {
      return [...common, ...bdAndSalesCategoryOptions];
    }

    return common;
  }

  function getCategoryDescription(category) {
    return (
      categoryDescriptions[category] ||
      bdAndSalesCategoryDescriptions[category] ||
      officeAdminCategoryDescriptions[category] ||
      "No description available."
    );
  }

  const { data: response = {} } = useGetAllExpenseQuery();
  const expenses = response.data || [];

  const [updateExpense, { isLoading: isUpdating }] =
    useUpdateExpenseSheetMutation();

  const [updateStatus] = useUpdateExpenseStatusOverallMutation();

  const [updateDisbursement] = useUpdateDisbursementDateMutation();

  const ExpenseCode = localStorage.getItem("edit_expense");

  useEffect(() => {
    if (!ExpenseCode) {
      console.warn("No expense_code in localStorage");
      return;
    }

    if (!Array.isArray(expenses) || expenses.length === 0) {
      console.warn("No expenses available");
      return;
    }

    const matchedExpense = expenses.find(
      (exp) => String(exp.expense_code).trim() === String(ExpenseCode).trim()
    );

    if (matchedExpense) {
      // console.log("Matched Expense Found:", matchedExpense);

      const enrichedExpense = {
        ...matchedExpense,
      };

      setRows([enrichedExpense]);
    } else {
      console.warn("No matching expense_code found");
    }
  }, [ExpenseCode, expenses]);

  const handleSubmit = async () => {
    try {
      const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;
      const ExpenseCode = localStorage.getItem("edit_expense");

      debugger;

      if (!userID) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      if (!ExpenseCode) {
        toast.error(
          "No Expense Code found. Please re-select the form to edit."
        );
        return;
      }

      const expenseSheetId = rows[0]?._id;

      const updatedItems = rows.flatMap((row) =>
        (row.items || []).map((item) => {
          const status = item.item_current_status || "manager approval";

          return {
            ...item,
            approved_amount:
              item.approved_amount !== "" && item.approved_amount !== undefined
                ? Number(item.approved_amount)
                : Number(item.invoice?.invoice_amount || 0),
            item_current_status: status,
            item_status_history: [
              ...(item.item_status_history || []),
              {
                status,
                remarks: item.remarks || "",
                user_id: userID,
              },
            ],
          };
        })
      );

      const totalApproved = updatedItems.reduce(
        (sum, item) => sum + (Number(item.approved_amount) || 0),
        0
      );

      const payload = {
        user_id: userID,
        expense_code: ExpenseCode,
        current_status: "manager approval",
        total_approved_amount: totalApproved,
        items: updatedItems,
        status_history: [
          ...(rows[0].status_history || []),
          {
            status: "manager approval",
            remarks: rows[0].comments || "",
            user_id: userID,
          },
        ],
      };

      debugger;

      await updateExpense({
        _id: expenseSheetId,
        ...payload,
      }).unwrap();

      toast.success("Total approved amount and status updated successfully!");
      navigate("/expense_dashboard");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("An error occurred while updating the approved amount.");
    }
  };

  const handleRowChange = (rowIndex, field, value, itemIndex = null) => {
    const updatedRows = [...rows];
    const updatedRow = { ...updatedRows[rowIndex] };

    if (field === "expense_term") {
      updatedRow.expense_term = value;
      updatedRows[rowIndex] = updatedRow;
      setRows(updatedRows);
      return;
    }

    updatedRow.items = [...updatedRow.items];
    const item = { ...updatedRow.items[itemIndex] };

    if (field === "approved_amount") {
      const invoiceAmount = Number(item.invoice?.invoice_amount || 0);
      const numericValue = Number(value);

      if (numericValue > invoiceAmount) {
        toast.warning("Approved amount cannot be greater than invoice amount.");
        return;
      }
      item[field] = value;
    } else if (field.startsWith("item_status_history")) {
      const pathParts = field.split(".");
      if (pathParts.length === 3) {
        const [arrKey, indexStr, key] = pathParts;
        const index = parseInt(indexStr, 10);
        const arr = item[arrKey] ? [...item[arrKey]] : [];
        if (!arr[index]) arr[index] = {};
        arr[index] = { ...arr[index], [key]: value };
        item[arrKey] = arr;
      } else {
        item[field] = value;
      }
    } else {
      item[field] = value;
    }

    updatedRow.items[itemIndex] = item;
    updatedRows[rowIndex] = updatedRow;
    setRows(updatedRows);
  };

  const handleApproval = (rowIndex, itemIndex, status) => {
    const updatedRows = [...rows];
    const updatedRow = {
      ...updatedRows[rowIndex],
      items: [...updatedRows[rowIndex].items],
    };

    updatedRow.items[itemIndex] = {
      ...updatedRow.items[itemIndex],
      approvalStatus: status,
      item_current_status: status,
    };

    updatedRows[rowIndex] = updatedRow;
    setRows(updatedRows);

    if (status === "rejected") {
      setCommentDialog({ open: true, rowIndex, itemIndex });
    }
  };

  const handleHrApproveAll = () => {
    setHRApproveConfirmOpen(true);
  };

  const applyHrApproveAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => {
          const invoiceAmount = Number(item.invoice?.invoice_amount) || 0;

          return {
            ...item,
            item_current_status: "hr approval",
            approved_amount: invoiceAmount,
          };
        });

        const totalApprovedAmount = updatedItems.reduce(
          (sum, item) => sum + Number(item.approved_amount || 0),
          0
        );

        return {
          ...row,
          items: updatedItems,
          approved_amount: totalApprovedAmount,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hr approval",
            approved_amount: row.approved_amount,
          }).unwrap()
        )
      );

      toast.success("HR approved successfully");
      setHRApproveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to HR approve all items:", error);
      toast.error("Failed to HR approve all items");
    }
  };

  const handleHrRejectAll = () => {
    setRejectConfirmOpen(true);
  };

  const applyHrRejectAll = async (reason) => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          approved_amount: 0,
          remarks: reason,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "rejected",
          approved_amount: 0,
          remarks: reason,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "rejected",
            approved_amount: 0,
            remarks: reason,
          }).unwrap()
        )
      );

      toast.success("All items rejected successfully");
      setRejectConfirmOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject all items:", error);
      toast.error("Failed to reject all items");
    }
  };

  const handleHrHoldAll = () => {
    setShowHoldAllDialog(true);
  };

  const applyHrHoldAll = async (reason) => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "hold",
          remarks: reason,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "hold",
          remarks: reason,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hold",
            remarks: reason,
          }).unwrap()
        )
      );

      toast.success("All items put on hold successfully");
      setShowHoldAllDialog(false);
      setHoldReason(""); // clear input
    } catch (error) {
      console.error("Failed to hold all items:", error);
      toast.error("Failed to hold all items");
    }
  };

  const handleAccountsApproveAll = () => {
    setAccountsApproveConfirmOpen(true);
  };

  const applyAccountsApproveAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => {
          const invoiceAmount = Number(item.invoice?.invoice_amount) || 0;

          return {
            ...item,
            item_current_status: "final approval",
            approved_amount: invoiceAmount,
          };
        });

        const totalApprovedAmount = updatedItems.reduce(
          (sum, item) => sum + Number(item.approved_amount || 0),
          0
        );

        return {
          ...row,
          items: updatedItems,
          approved_amount: totalApprovedAmount,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "final approval",
            approved_amount: row.approved_amount,
          }).unwrap()
        )
      );

      toast.success("Accounts approved successfully");
      setAccountsApproveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to HR approve all items:", error);
      toast.error("Failed to HR approve all items");
    }
  };

  const handleAccountsRejectAll = () => {
    setAccountsShowRejectAllDialog(true);
  };

  const applyAccountsRejectAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          approved_amount: 0,
          remarks: showAccountsRejectAllDialog,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "rejected",
          approved_amount: 0,
          remarks: showAccountsRejectAllDialog,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "rejected",
            approved_amount: 0,
            remarks: showAccountsRejectAllDialog,
          }).unwrap()
        )
      );

      toast.success("All items rejected successfully");
      setAccountsShowRejectAllDialog(false);
    } catch (error) {
      console.error("Failed to reject all items:", error);
      toast.error("Failed to reject all items");
    }
  };

  const handleAccountsHoldAll = () => {
    setAccountsShowHoldAllDialog(true);
  };

  const applyAccountsHoldAll = async (reason) => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "hold",
          remarks: reason,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "hold",
          remarks: reason,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hold",
            remarks: reason,
          }).unwrap()
        )
      );

      toast.success("All items put on hold successfully");
      setAccountsShowHoldAllDialog(false);
      setAccountsHoldReason(""); // Clear reason after success
    } catch (error) {
      console.error("Failed to hold all items:", error);
      toast.error("Failed to hold all items");
    }
  };

  const handleFinalApproval = async () => {
    try {
      const expenseSheetId = rows[0]?._id;
      if (!expenseSheetId) {
        toast.error("Expense Sheet ID is missing. Please reload the page.");
        return;
      }

      const rawDate = disbursementData?.disbursement_date;

      // ✅ Ensure a valid date is selected before submission
      if (!rawDate || isNaN(new Date(rawDate).getTime())) {
        toast.error("Please select a valid disbursement date.");
        return;
      }

      const disbursement_date = new Date(rawDate).toISOString();

      console.log("Updating disbursement with:", {
        _id: expenseSheetId,
        disbursement_date,
      });

      await updateDisbursement({
        _id: expenseSheetId,
        disbursement_date,
      }).unwrap();

      toast.success("Disbursement date updated successfully!");
      navigate("/expense_dashboard");
    } catch (error) {
      console.error("Disbursement update failed:", error);
      toast.error("An error occurred while submitting disbursement date.");
    }
  };

  // const handleItemChange = (index, field, value) => {
  //   setRows((prevRows) =>
  //     prevRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
  //   );
  // };

  const tableHeaders = [
    "Project ID",
    "Project Name / Location",
    "Category",
    "Description",
    "Submission Date",
    "Bill Amount",
    "Attachment",
    "Invoice Number",
    "Approved Amount",
  ];

  return (
    <Box
      p={2}
      sx={{
        width: "-webkit-fill-available",
      }}
    >
      <Box
        sx={{
          maxWidth: "100%",
          overflowX: "auto",
          p: 1,
        }}
      >
        {/* Action Buttons */}

        <Box
          sx={{
            // px: { xs: 2, md: 2 },
            // py: 3,
            marginLeft: { lg: "20%", md: "0%", xl: "15%" },
            maxWidth: "100%",
          }}
        >
          {/* Action Controls */}
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            alignItems="center"
            gap={2}
          >
            {/* Expense Term (from-to) */}
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography level="body-md" fontWeight="lg">
                Select Expense Term:
              </Typography>
              <Input
                type="date"
                size="sm"
                value={rows[0].expense_term.from?.slice(0, 10) || ""}
                onChange={(e) =>
                  handleRowChange(0, "expense_term", {
                    ...rows[0].expense_term,
                    from: e.target.value,
                  })
                }
              />
              <Typography level="body-sm">to</Typography>
              <Input
                type="date"
                size="sm"
                value={rows[0].expense_term.to?.slice(0, 10) || ""}
                onChange={(e) =>
                  handleRowChange(0, "expense_term", {
                    ...rows[0].expense_term,
                    to: e.target.value,
                  })
                }
              />
            </Box>

            {/* Right: Bulk Actions */}
            <Box display="flex" gap={2}>
              {user?.name === "Shruti Tripathi" ||
              user?.department === "admin" ||
              user?.name === "IT Team" ? (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={handleHrRejectAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "hr approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Reject All
                  </Button>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={handleHrHoldAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "hr approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Hold All
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleHrApproveAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "hr approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Approve All
                  </Button>
                </>
              ) : (
                user?.department === "Accounts" && (
                  <>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={handleAccountsRejectAll}
                      disabled={rows.every((row) =>
                        [
                          "rejected",
                          "hold",
                          "final approval",
                          "submitted",
                          "manager approval",
                        ].includes(row.current_status)
                      )}
                    >
                      Reject All
                    </Button>
                    <Button
                      color="warning"
                      size="sm"
                      onClick={handleAccountsHoldAll}
                      disabled={rows.every((row) =>
                        [
                          "rejected",
                          "hold",
                          "final approval",
                          "submitted",
                          "manager approval",
                        ].includes(row.current_status)
                      )}
                    >
                      Hold All
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      onClick={handleAccountsApproveAll}
                      disabled={rows.every((row) =>
                        [
                          "rejected",
                          "hold",
                          "final approval",
                          "submitted",
                          "manager approval",
                        ].includes(row.current_status)
                      )}
                    >
                      Approve All
                    </Button>
                    <Button
                      onClick={() => handleExportCSVById(rows[0]?._id)}
                      size="sm"
                      variant="outlined"
                    >
                      Export CSV
                    </Button>
                  </>
                )
              )}
            </Box>
          </Box>

          {/* Table */}
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "md",
              overflow: "auto",
              boxShadow: "sm",
              maxHeight: "70vh",
            }}
          >
            {/* Desktop Table View */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Table
                variant="soft"
                size="sm"
                stickyHeader
                hoverRow
                sx={{
                  // minWidth: 900,
                  "& thead th": {
                    backgroundColor: "neutral.softBg",
                    fontWeight: "md",
                    fontSize: "sm",
                  },
                }}
              >
                <thead>
                  <tr>
                    {tableHeaders.map((header, idx) => (
                      <th key={idx}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) =>
                    row.items.map((item, itemIndex) => (
                      <tr key={`${rowIndex}-${itemIndex}`}>
                        <td>{item.project_code}</td>
                        <td>{item.project_name}</td>
                        <td>{item.category}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.expense_date
                            ? new Date(item.expense_date)
                                .toISOString()
                                .split("T")[0]
                            : ""}
                        </td>
                        <td>{item.invoice?.invoice_amount}</td>
                        <td>
                          {item.attachment_url ? (
                            <Button
                              component="a"
                              href={item.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              variant="soft"
                              color="primary"
                              startDecorator={<DownloadIcon />}
                              size="sm"
                              sx={{ textTransform: "none" }}
                            >
                              Download
                            </Button>
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              No Attachment
                            </span>
                          )}
                        </td>
                        <td>{item.invoice?.invoice_number || "NA"}</td>
                        {/* <td>{item.approved_amount || "-"}</td> */}

                        <td>{item?.approved_amount || "NA"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Box>
            <Box
              sx={{
                display: {
                  xs: "flex",
                  sm: "none",
                },
                flexDirection: "column",
                gap: 2,
              }}
            >
              {rows.map((row, rowIndex) =>
                row.items.map((item, itemIndex) => (
                  <Box
                    key={`${rowIndex}-${itemIndex}`}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      boxShadow: "sm",
                    }}
                  >
                    <strong>{item.project_name}</strong>
                    <span>
                      <b>Project Code:</b> {item.project_code}
                    </span>
                    <span>
                      <b>Category:</b> {item.category}
                    </span>
                    <span>
                      <b>Description:</b> {item.description}
                    </span>
                    <span>
                      <b>Expense Date:</b>{" "}
                      {item.expense_date
                        ? new Date(item.expense_date)
                            .toISOString()
                            .split("T")[0]
                        : "N/A"}
                    </span>
                    <span>
                      <b>Invoice Amount:</b> ₹{item.invoice?.invoice_amount}
                    </span>
                    <span>
                      <b>Invoice Number:</b>{" "}
                      {item.invoice?.invoice_number || "NA"}
                    </span>
                    <Box>
                      <b>Attachment:</b>{" "}
                      {item.attachment_url ? (
                        <Button
                          component="a"
                          href={item.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          variant="soft"
                          color="primary"
                          startDecorator={<DownloadIcon />}
                          size="sm"
                          sx={{ textTransform: "none" }}
                        >
                          Download
                        </Button>
                      ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                          No Attachment
                        </span>
                      )}
                    </Box>
                    <Box>
                      <b>Approved Amount:</b>
                      <Input
                        size="sm"
                        variant="outlined"
                        type="number"
                        value={
                          (
                            item.approved_amount ?? item.invoice?.invoice_amount
                          )?.toString() || ""
                        }
                        placeholder="₹"
                        onChange={(e) =>
                          handleRowChange(
                            rowIndex,
                            "approved_amount",
                            e.target.value,
                            itemIndex
                          )
                        }
                        inputProps={{ min: 0 }}
                        sx={{ mt: 1, minWidth: 100 }}
                      />
                    </Box>

                    {(user?.role === "manager" ||
                      user?.department === "admin" ||
                      user?.name === "IT Team") &&
                      item.item_current_status === "submitted" && (
                        <Box
                          display="flex"
                          justifyContent="center"
                          gap={1}
                          mt={1}
                        >
                          <Button
                            size="sm"
                            variant={
                              item.item_current_status === "manager approval"
                                ? "solid"
                                : "outlined"
                            }
                            color="success"
                            onClick={() =>
                              handleApproval(
                                rowIndex,
                                itemIndex,
                                "manager approval"
                              )
                            }
                          >
                            <CheckIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              item.item_current_status === "rejected"
                                ? "solid"
                                : "outlined"
                            }
                            color="danger"
                            onClick={() =>
                              handleApproval(rowIndex, itemIndex, "rejected")
                            }
                          >
                            <CloseIcon />
                          </Button>
                        </Box>
                      )}
                  </Box>
                ))
              )}
            </Box>
          </Sheet>
        </Box>
      </Box>

      {/* Comment Dialog */}

      {/* HR Approve All Confirmation Modal */}
      <Modal
        open={approveHRConfirmOpen}
        onClose={() => setHRApproveConfirmOpen(false)}
      >
        <ModalDialog
          layout="center"
          sx={{
            minWidth: 300,
            padding: 3,
            textAlign: "center",
          }}
        >
          <Typography level="h6" mb={1}>
            Confirm Approval
          </Typography>
          <Typography level="body-sm">
            Are you sure you want to approve all items?
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mt={3}>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setHRApproveConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => {
                applyHrApproveAll();
                setHRApproveConfirmOpen(false);
              }}
            >
              Yes, Approve All
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* HR Reject All Confirmation Modal */}

      <Modal
        open={rejectConfirmOpen}
        onClose={() => setRejectConfirmOpen(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Rejection</DialogTitle>
          <DialogContent>
            Are you sure you want to reject all items?
            <Textarea
              minRows={3}
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectConfirmOpen(false)}>Cancel</Button>
            <Button
              color="danger"
              disabled={!rejectionReason.trim()}
              onClick={() => applyHrRejectAll(rejectionReason)}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* HR hOLD All Confirmation Modal */}

      <Modal
        open={showHoldAllDialog}
        onClose={() => setShowHoldAllDialog(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Hold</DialogTitle>
          <DialogContent>
            Are you sure you want to put all items on hold?
            <Textarea
              minRows={3}
              placeholder="Enter hold reason"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHoldAllDialog(false)}>Cancel</Button>
            <Button
              color="warning"
              disabled={!holdReason.trim()}
              onClick={() => applyHrHoldAll(holdReason)}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Accounts Approve All Confirmation Modal */}
      <Modal
        open={approveAccountsConfirmOpen}
        onClose={() => setAccountsApproveConfirmOpen(false)}
      >
        <ModalDialog
          layout="center"
          sx={{
            minWidth: 300,
            padding: 3,
            textAlign: "center",
          }}
        >
          <Typography level="h6" mb={1}>
            Confirm Approval
          </Typography>
          <Typography level="body-sm">
            Are you sure you want to approve all items?
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mt={3}>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setAccountsApproveConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => {
                applyAccountsApproveAll();
                setAccountsApproveConfirmOpen(false);
              }}
            >
              Yes, Approve All
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Accounts Reject All Confirmation Modal */}
      <Modal
        open={showAccountsRejectAllDialog}
        onClose={() => setAccountsShowRejectAllDialog(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Rejection</DialogTitle>
          <DialogContent>
            Are you sure you want to reject all items?
            <Textarea
              minRows={3}
              placeholder="Enter rejection reason"
              value={accountsRejectionReason}
              onChange={(e) => setAccountsRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAccountsShowRejectAllDialog(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              disabled={!accountsRejectionReason.trim()}
              onClick={() => applyAccountsRejectAll(accountsRejectionReason)}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Accounts hOLD All Confirmation Modal */}
      <Modal
        open={showAccountsHoldAllDialog}
        onClose={() => setAccountsShowHoldAllDialog(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Hold</DialogTitle>
          <DialogContent>
            Are you sure you want to put all items on hold?
            <Textarea
              minRows={3}
              placeholder="Enter hold reason"
              value={accountsHoldReason}
              onChange={(e) => setAccountsHoldReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAccountsShowHoldAllDialog(false)}>
              Cancel
            </Button>
            <Button
              color="warning"
              disabled={!accountsHoldReason.trim()}
              onClick={() => applyAccountsHoldAll(accountsHoldReason)}
            >
              Submit
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Summary */}
      <Box mt={4} sx={{ margin: "0 auto", width: { md: "60%", sm: "100%" } }}>
        <Typography level="h5" mb={1}>
          Expense Summary
        </Typography>

        <Box display="flex" gap={4} flexWrap="wrap">
          {/* Summary Table */}
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "md",
              boxShadow: "sm",
              flex: 1,
              minWidth: 400,
              maxHeight: 500,
              overflowY: "auto",
            }}
          >
            <Table
              variant="soft"
              borderAxis="both"
              size="sm"
              stickyHeader
              hoverRow
              sx={{
                minWidth: 500,
                "& th": {
                  backgroundColor: "background.level1",
                  fontWeight: "md",
                  fontSize: "sm",
                  textAlign: "left",
                },
                "& td": {
                  fontSize: "sm",
                  textAlign: "left",
                },
              }}
            >
              <thead>
                <tr>
                  <th>Head</th>
                  <th>Amt</th>
                  <th>Approval Amt</th>
                </tr>
              </thead>
              <tbody>
                {(user?.role === "manager" ||
                user?.department === "admin" ||
                user?.department === "HR" ||
                user?.name === "IT Team"
                  ? [
                      ...new Set([
                        ...categoryOptions,
                        ...bdAndSalesCategoryOptions,
                        ...officeAdminCategoryOptions,
                      ]),
                    ]
                  : getCategoryOptionsByDepartment(user?.department)
                ).map((category, idx) => {
                  let total = 0;
                  let approvedTotal = 0;

                  rows.forEach((row) => {
                    row.items?.forEach((item) => {
                      if (item.category === category) {
                        total += Number(item.invoice?.invoice_amount || 0);

                        if (
                          item.item_current_status === "manager approval" ||
                          (item.approved_amount !== undefined &&
                            item.approved_amount !== null)
                        ) {
                          approvedTotal += Number(item.approved_amount || 0);
                        }
                      }
                    });
                  });

                  return (
                    <tr key={idx}>
                      <td>
                        <Tooltip
                          placement="bottom"
                          arrow
                          enterTouchDelay={0}
                          leaveTouchDelay={3000}
                          title={
                            <Sheet
                              variant="soft"
                              sx={{
                                p: 1,
                                maxWidth: 300,
                                borderRadius: "md",
                                boxShadow: "md",
                                bgcolor: "background.surface",
                              }}
                            >
                              <Typography level="body-sm">
                                {getCategoryDescription(category)}
                              </Typography>
                            </Sheet>
                          }
                        >
                          <span
                            style={{
                              cursor: "help",
                              textDecoration: "underline dotted",
                            }}
                          >
                            {category}
                          </span>
                        </Tooltip>
                      </td>
                      <td>{total > 0 ? total.toFixed(2) : "-"}</td>
                      <td>
                        {approvedTotal > 0 ? approvedTotal.toFixed(2) : "-"}
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total */}
                <tr>
                  <td>
                    <Typography level="body-md" fontWeight="lg">
                      Total
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-md" fontWeight="lg">
                      {rows
                        .flatMap((row) => row.items || [])
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.invoice?.invoice_amount || 0),
                          0
                        )
                        .toFixed(2)}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-md" fontWeight="lg">
                      {rows
                        .flatMap((row) => row.items || [])
                        .filter(
                          (item) =>
                            item.item_current_status === "manager approval" ||
                            (item.approved_amount !== undefined &&
                              item.approved_amount !== null)
                        )
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.approved_amount || 0),
                          0
                        )
                        .toFixed(2)}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </Table>
            {/* Submit & Back Buttons */}
            <Box display="flex" justifyContent="center" p={2}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                maxWidth="400px"
                width="100%"
                gap={2}
              >
                {(user?.role === "manager" ||
                  user?.department === "admin" ||
                  user?.name === "IT Team") &&
                  rows[0]?.current_status === "submitted" && (
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={
                        isUpdating ||
                        (rows[0]?.total_approved_amount === 0 &&
                          [
                            "manager approval",
                            "rejected",
                            "hr approval",
                            "final approval",
                            "hold",
                          ].includes(rows[0]?.current_status))
                      }
                    >
                      Update Expense Sheet
                    </Button>
                  )}

                {user?.department === "Accounts" &&
                  rows[0]?.current_status === "final approval" && (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      sx={{ mt: 2 }}
                    >
                      <Box>
                        <FormLabel sx={{ justifyContent: "center" }}>
                          Disbursement Date
                        </FormLabel>
                        <Input
                          type="date"
                          value={
                            disbursementData?.disbursement_date
                              ? new Date(disbursementData.disbursement_date)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setDisbursementData((prev) => ({
                              ...prev,
                              disbursement_date: e.target.value,
                            }))
                          }
                        />
                      </Box>
                      <Box mt={2}>
                        <Button
                          variant="solid"
                          color="success"
                          onClick={handleFinalApproval}
                        >
                          Final Approval
                        </Button>
                      </Box>
                    </Box>
                  )}
              </Box>
            </Box>
          </Sheet>

          {/* Pie Chart on Right */}
          <Box flex={1} minWidth={400}>
            <PieChartByCategory rows={rows} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateExpenseAccounts;
