import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  IconButton,
  Textarea,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllExpenseQuery,
  useUpdateDisbursementDateMutation,
  useUpdateExpenseSheetMutation,
  useUpdateExpenseStatusOverallMutation,
} from "../../../redux/Expense/expenseSlice";
import PieChartByCategory from "./Expense_Chart";
const UpdateExpense = () => {
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

  const [projectCodes, setProjectCodes] = useState([]);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [searchInputs, setSearchInputs] = useState([""]);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approveHRConfirmOpen, setHRApproveConfirmOpen] = useState(false);
  const [approveAccountsConfirmOpen, setAccountsApproveConfirmOpen] =
    useState(false);

  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectAccountsConfirmOpen, setRejectAccountsConfirmOpen] =
    useState(false);

  const [holdConfirmOpen, setHoldConfirmOpen] = useState(false);
  const [holdAccountsConfirmOpen, setHoldAccountsConfirmOpen] = useState(false);

  const [sharedRejectionComment, setSharedRejectionComment] = useState("");
  const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);
  const [showHoldAllDialog, setShowHoldAllDialog] = useState(false);
  const [showDisbursement, setShowDisbursement] = useState(false);
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

  const categoryOptions = [
    "Travelling Expenses",
    "Lodging",
    "Meal Expenses",
    "Project Expenses",
    "Repair and Maintenance",
    "Telephone Expenses",
    "Courier Charges(porter)",
    "Staff welfare expenses",
    "Medical Expenses",
    "Printing and stationary",
    "Office expenses",
  ];

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

  const handleCommentSave = () => {
    setCommentDialog({ open: false, rowIndex: null, itemIndex: null });
  };

  const handleRejectAllSubmit = async () => {
    try {
      const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;

      if (!userID) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      const requests = rows.map((row) =>
        updateStatus({
          _id: row._id,
          status: "rejected",
          remarks: sharedRejectionComment || "Rejected without comment",
        }).unwrap()
      );

      await Promise.all(requests);
      toast.success("All sheets rejected successfully");

      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          remarks: sharedRejectionComment || "Rejected without comment",
          item_status_history: [
            ...(item.item_status_history || []),
            {
              status: "rejected",
              remarks: sharedRejectionComment || "Rejected without comment",
              user_id: userID,
              updatedAt: new Date().toISOString(),
            },
          ],
        }));

        return {
          ...row,
          items: updatedItems,
          row_current_status: "rejected",
          status_history: [
            ...(row.status_history || []),
            {
              status: "rejected",
              remarks: sharedRejectionComment || "Rejected without comment",
              user_id: userID,
              updatedAt: new Date().toISOString(),
            },
          ],
        };
      });

      setRows(updated);
      setShowRejectAllDialog(false);
      setSharedRejectionComment("");
    } catch (error) {
      console.error("Failed to reject all sheets:", error);
      toast.error("Failed to reject sheets");
    }
  };

  const handleRejectAll = () => {
    setShowRejectAllDialog(true);
  };

  const handleApproveAll = () => {
    setApproveConfirmOpen(true);
  };

  const applyApproveAll = async () => {
    try {
      const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;

      if (!userID) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      // Send updates for all rows
      const requests = rows.map((row) => {
        const approved_items = row.items.map((item) => ({
          _id: item._id,
          approved_amount: Number(item.invoice?.invoice_amount) || 0,
        }));

        return updateStatus({
          _id: row._id,
          status: "manager approval",
          approved_items,
          remarks: "",
        }).unwrap();
      });

      await Promise.all(requests);

      // Update local state
      const updatedRows = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "manager approval",
          current_status: "manager approval",
          approved_amount: Number(item.approved_amount) || 0,
        }));

        const total_approved_amount = updatedItems.reduce(
          (sum, item) => sum + item.approved_amount,
          0
        );

        return {
          ...row,
          items: updatedItems,
          row_current_status: "manager approval",
          current_status: "manager approval", // add this
          approved_amount: total_approved_amount,
        };
      });

      setRows(updatedRows);
      setApproveConfirmOpen(false);
      toast.success("All items approved successfully");
    } catch (error) {
      console.error("Failed to approve all items:", error);
      toast.error("Failed to approve all items");
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

      toast.success("All items HR approved successfully");
      setApproveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to HR approve all items:", error);
      toast.error("Failed to HR approve all items");
    }
  };

  const handleHrRejectAll = () => {
    setRejectConfirmOpen(true);
  };

  const applyHrRejectAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          approved_amount: 0,
          remarks: sharedRejectionComment,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "rejected",
          approved_amount: 0,
          remarks: sharedRejectionComment,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "rejected",
            approved_amount: 0,
            remarks: sharedRejectionComment,
          }).unwrap()
        )
      );

      toast.success("All items rejected successfully");
      setShowRejectAllDialog(false);
    } catch (error) {
      console.error("Failed to reject all items:", error);
      toast.error("Failed to reject all items");
    }
  };

  const handleHrHoldAll = () => {
    setHoldConfirmOpen(true);
  };

  const applyHrHoldAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "hold",
          remarks: sharedRejectionComment,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "hold",
          remarks: sharedRejectionComment,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hold",
            remarks: sharedRejectionComment,
          }).unwrap()
        )
      );

      toast.success("All items put on hold successfully");
      setShowHoldAllDialog(false);
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

      toast.success("All items HR approved successfully");
      setApproveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to HR approve all items:", error);
      toast.error("Failed to HR approve all items");
    }
  };

  const handleAccountsRejectAll = () => {
    setRejectAccountsConfirmOpen(true);
  };

  const applyAccountsRejectAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          approved_amount: 0,
          remarks: sharedRejectionComment,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "rejected",
          approved_amount: 0,
          remarks: sharedRejectionComment,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "rejected",
            approved_amount: 0,
            remarks: sharedRejectionComment,
          }).unwrap()
        )
      );

      toast.success("All items rejected successfully");
      setShowRejectAllDialog(false);
    } catch (error) {
      console.error("Failed to reject all items:", error);
      toast.error("Failed to reject all items");
    }
  };

  const handleAccountsHoldAll = () => {
    setHoldAccountsConfirmOpen(true);
  };

  const applyAccountsHoldAll = async () => {
    try {
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "hold",
          remarks: sharedRejectionComment,
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: "hold",
          remarks: sharedRejectionComment,
        };
      });

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hold",
            remarks: sharedRejectionComment,
          }).unwrap()
        )
      );

      toast.success("All items put on hold successfully");
      setShowHoldAllDialog(false);
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
      console.log(expenseSheetId);

      const disbursement_date = disbursementData?.disbursement_date;

      if (!disbursement_date) {
        toast.error("Disbursement date is missing in disbursement details.");
        return;
      }

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

  const handleItemChange = (index, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const tableHeaders = [
    "Project ID",
    "Project Name",
    "Category",
    "Description",
    "Submission Date",
    "Bill Amount",
    "Invoice Number",
    "Approved Amount",
    ...(user?.name !== "Shruti Tripathi" ? ["Approval"] : []),
  ];

  return (
    <Box p={2}>
      <Typography level="h4" mb={2}>
        Expense Sheet
      </Typography>

      <Box sx={{ maxWidth: "100%", overflowX: "auto", p: 1 }}>
        {/* Action Buttons */}

        <Box
          sx={{
            px: { xs: 2, md: 2 },
            py: 3,
            marginLeft: { md: "12%" },
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
              {user?.name === "Shruti Tripathi" ? (
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
              ) : user?.department === "Accounts" ? (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={handleAccountsRejectAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "final approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Reject All
                  </Button>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={handleAccountsHoldAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "final approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Hold All
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleAccountsApproveAll}
                    disabled={rows.every((row) =>
                      ["rejected", "hold", "final approval"].includes(
                        row.current_status
                      )
                    )}
                  >
                    Approve All
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={handleRejectAll}
                    disabled={rows.every((row) =>
                      [
                        "rejected",
                        "hold",
                        "hr approval",
                        "manager approval",
                        "final approval",
                      ].includes(row.current_status)
                    )}
                  >
                    Reject All
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleApproveAll}
                    disabled={rows.every((row) =>
                      [
                        "rejected",
                        "hold",
                        "hr approval",
                        "manager approval",
                        "final approval",
                      ].includes(row.current_status)
                    )}
                  >
                    Approve All
                  </Button>
                </>
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
            <Table
              variant="soft"
              size="sm"
              stickyHeader
              hoverRow
              sx={{
                minWidth: 900,
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
                      <td>{item.invoice?.invoice_number || "NA"}</td>
                      {/* <td>{item.approved_amount || "-"}</td> */}

                      <td>
                        <Input
                          size="sm"
                          variant="outlined"
                          type="number"
                          value={
                            item.approved_amount !== undefined &&
                            item.approved_amount !== null
                              ? item.approved_amount
                              : item.invoice?.invoice_amount?.toString() || ""
                          }
                          placeholder="₹"
                          onChange={(e) =>
                            handleRowChange(
                              rowIndex,
                              itemIndex,
                              "approved_amount",
                              e.target.value
                            )
                          }
                          inputProps={{ min: 0 }}
                          sx={{ minWidth: 90 }}
                        />
                      </td>

                      {user?.name !== "Shruti Tripathi" && (
                        <td style={{ padding: 8 }}>
                          <Box display="flex" gap={1} justifyContent="center">
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
                              aria-label="Approve"
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
                              aria-label="Reject"
                            >
                              <CloseIcon />
                            </Button>
                          </Box>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Sheet>
        </Box>
      </Box>

      {/* Joy UI Modal for Comment */}
      <Modal
        open={commentDialog.open}
        onClose={() => setCommentDialog({ open: false, rowIndex: null })}
      >
        <ModalDialog
          aria-labelledby="rejection-remarks-title"
          layout="center"
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 320,
            padding: 2,
          }}
        >
          {/* Close icon */}
          <IconButton
            size="sm"
            onClick={() => setCommentDialog({ open: false, rowIndex: null })}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            id="rejection-remarks-title"
            level="h6"
            mb={1}
            fontWeight={600}
          >
            Enter Rejection Remarks:
          </Typography>

          <Textarea
            minRows={2}
            placeholder="Enter reason..."
            value={
              rows[commentDialog.rowIndex]?.items?.[commentDialog.itemIndex]
                ?.item_status_history?.[0]?.remarks || ""
            }
            onChange={(e) =>
              handleRowChange(
                commentDialog.rowIndex,
                commentDialog.itemIndex,
                "item_status_history.0.remarks",
                e.target.value
              )
            }
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setCommentDialog({ open: false, rowIndex: null })}
            >
              Cancel
            </Button>
            <Button size="sm" color="danger" onClick={handleCommentSave}>
              Reject
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Approve All Confirmation Modal */}
      <Modal
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
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
              onClick={() => setApproveConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => {
                applyApproveAll();
                setApproveConfirmOpen(false);
              }}
            >
              Yes, Approve All
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

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

      {/* Reject All Confirmation Modal */}
      <Modal
        open={showRejectAllDialog}
        onClose={() => setShowRejectAllDialog(false)}
      >
        <ModalDialog sx={{ minWidth: 320 }}>
          <Typography level="h6">Reject All Items</Typography>
          <Typography level="body-sm">
            Provide remarks for rejection:
          </Typography>

          <Textarea
            minRows={2}
            placeholder="Enter rejection remarks..."
            value={sharedRejectionComment}
            onChange={(e) => setSharedRejectionComment(e.target.value)}
            sx={{ mt: 1 }}
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              variant="outlined"
              onClick={() => setShowRejectAllDialog(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleRejectAllSubmit} size="sm">
              Reject All
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectConfirmOpen(false)}>Cancel</Button>
            <Button
              color="danger"
              onClick={() => {
                applyHrRejectAll();
                setRejectConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      {/* HR hOLD All Confirmation Modal */}
      <Modal
        open={holdAccountsConfirmOpen}
        onClose={() => setHoldConfirmOpen(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Hold</DialogTitle>
          <DialogContent>
            Are you sure you want to put all items on hold?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHoldConfirmOpen(false)}>Cancel</Button>
            <Button
              color="warning"
              onClick={() => {
                applyHrHoldAll();
                setHoldConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Accounts Approve All Confirmation Modal */}
      <Modal
        open={approveAccountsConfirmOpen}
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
        open={rejectAccountsConfirmOpen}
        onClose={() => setRejectAccountsConfirmOpen(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Rejection</DialogTitle>
          <DialogContent>
            Are you sure you want to reject all items?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectAccountsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={() => {
                applyAccountsRejectAll();
                setRejectAccountsConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      {/* Accounts hOLD All Confirmation Modal */}
      <Modal
        open={holdConfirmOpen}
        onClose={() => setHoldAccountsConfirmOpen(false)}
      >
        <ModalDialog>
          <DialogTitle>Confirm Hold</DialogTitle>
          <DialogContent>
            Are you sure you want to put all items on hold?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHoldAccountsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              color="warning"
              onClick={() => {
                applyAccountsHoldAll();
                setHoldAccountsConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Summary */}
      <Box mt={4} sx={{ margin: "0 auto", width: "60%" }}>
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
              overflow: "auto",
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
                {categoryOptions.map((category, idx) => {
                  let total = 0;
                  let approvedTotal = 0;

                  rows.forEach((row) => {
                    row.items?.forEach((item) => {
                      if (item.category === category) {
                        total += Number(item.invoice?.invoice_amount || 0);

                        // ✅ Always count if there's an approved_amount set
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
                      <td>{category}</td>
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
                {user?.department !== "Accounts" && (
                  <Button
                    variant="solid"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                      isUpdating ||
                      [
                        "manager approval",
                        "rejected",
                        "hr approval",
                        "final approval",
                        "hold",
                      ].includes(rows[0]?.current_status)
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
                        <FormLabel sx={{justifyContent:"center"}}>Disbursement Date</FormLabel>
                        <Input
                          size="sm"
                          variant="outlined"
                          type="date"
                          value={rows[0]?.disbursement_date || ""}
                          onChange={(e) =>
                            handleItemChange(
                              0,
                              "disbursement_date",
                              e.target.value
                            )
                          }
                          sx={{ minWidth: 160 }}
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

                {/* {rows[0]?.current_status === "final approval" &&
                  user?.department === "Accounts" && (
                    <Input
                      placeholder="Enter Disbursement Details"
                      value={disbursementData}
                      onChange={(e) => setDisbursementData(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  )} */}
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

export default UpdateExpense;
