import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Textarea } from "@mui/joy";
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
  useUpdateExpenseSheetMutation,
  useUpdateExpenseStatusItemsMutation,
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
const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
const [holdConfirmOpen, setHoldConfirmOpen] = useState(false);

  const [sharedRejectionComment, setSharedRejectionComment] = useState("");
  const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);

  const [commentDialog, setCommentDialog] = useState({
    open: false,
    rowIndex: null,
  });

  const inputRefs = useRef([]);

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

  const [updateStatusItems] = useUpdateExpenseStatusItemsMutation();

  const [updateStatus] = useUpdateExpenseStatusOverallMutation();

 const ApprovalButton = ({
  rowIndex,
  itemIndex,
  itemStatus,
  itemCurrentStatus,
  handleApproval,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const isRejected =
    itemStatus === "rejected" || itemCurrentStatus === "rejected";

  const isApprovedToManager = itemCurrentStatus === "manager approval";

  const handleClick = async (action) => {
    setIsProcessing(true);
    try {
      await handleApproval(rowIndex, itemIndex, action);
    } catch (err) {
      // Optionally handle error here
    }
    setIsProcessing(false);
  };

  return (
    <Box display="flex" gap={1} justifyContent="flex-start">
      <Button
        size="sm"
        variant={isRejected ? "solid" : "outlined"}
        color="danger"
        onClick={() => handleClick("rejected")}
        aria-label="Reject"
      >
        <CloseIcon />
      </Button>

      <Button
        size="sm"
        variant={isApprovedToManager ? "solid" : "outlined"}
        color="success"
        onClick={() => handleClick("submitted")}
        aria-label="Approve"
      >
        <CheckIcon />
      </Button>
    </Box>
  );
};


  const ExpenseCode = localStorage.getItem("edit_expense");

  useEffect(() => {
    if (!ExpenseCode) {
      console.warn("❌ No expense_code in localStorage");
      return;
    }

    if (!Array.isArray(expenses) || expenses.length === 0) {
      console.warn("❌ No expenses available");
      return;
    }

    const matchedExpense = expenses.find(
      (exp) => String(exp.expense_code).trim() === String(ExpenseCode).trim()
    );

    if (matchedExpense) {
      console.log("✅ Matched Expense Found:", matchedExpense);

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
      if (!expenseSheetId) {
        toast.error("Expense Sheet ID is missing. Please reload the page.");
        return;
      }

      const items = rows.flatMap((row) => row.items || []);

      const totalApproved = items.reduce(
        (sum, item) =>
          sum +
          (item.approved_amount !== "" && item.approved_amount !== undefined
            ? Number(item.approved_amount)
            : Number(item.invoice?.invoice_amount || 0)),
        0
      );

      const currentStatus = "manager approval";

      console.log("Total Approved Amount:", totalApproved);
      console.log("Status:", currentStatus);

      const payload = {
        user_id: userID,
        data: {
          total_approved_amount: totalApproved,
          expense_code: ExpenseCode,
          current_status: currentStatus,
        },
      };

      await updateExpense({
        _id: expenseSheetId,
        ...payload,
      }).unwrap();

      toast.success("Total approved amount and status updated successfully!");
      // localStorage.removeItem("edit_expense");
      navigate("/expense_dashboard");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("An error occurred while updating the approved amount.");
    }
  };

  const handleApprovedAmountChange = (rowIndex, itemIndex, newValue) => {
    const sanitizedValue = newValue.replace(/^0+(?=\d)/, "");

    setRows((prevRows) => {
      const updated = [...prevRows];
      const updatedRow = { ...updated[rowIndex] };
      const updatedItems = [...updatedRow.items];

      const updatedItem = {
        ...updatedItems[itemIndex],
        approved_amount: Number(sanitizedValue),
      };

      updatedItems[itemIndex] = updatedItem;
      updatedRow.items = updatedItems;
      updated[rowIndex] = updatedRow;

      return updated;
    });
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    if (field === "code") {
      const selected = projectCodes.find((p) => p.code === value);
      if (selected) updated[index].name = selected.name;
    }
    setRows(updated);
  };

  const handleApproval = async (rowIndex, itemIndex, action) => {
    try {
      const row = rows[rowIndex];
      const item = row?.items[itemIndex];

      if (!row || !item) {
        console.error("Row or item not found.");
        return;
      }

      const sheetId = row._id;
      const itemId = item._id;

      if (!sheetId || !itemId) {
        console.error("Missing sheetId or itemId.");
        return;
      }

      let newStatus = "";
      let remarks = "";

      if (action === "rejected") {
        newStatus = "rejected";
        remarks = sharedRejectionComment || "Rejected without comment";
      } else if (
        action === "submitted" &&
        item.item_current_status === "submitted"
      ) {
        newStatus = "manager approval";
        remarks = "Auto-approved";
      } else {
        return;
      }

      await updateStatusItems({
        sheetId,
        itemId,
        status: newStatus,
        remarks,
      }).unwrap();

      const updatedRows = [...rows];
      const updatedItem = {
        ...item,
        item_current_status: newStatus,
        approved_amount:
          newStatus === "rejected"
            ? 0
            : Number(item.invoice?.invoice_amount || 0),
      };

      updatedRows[rowIndex].items[itemIndex] = updatedItem;

      const approvedAmount = updatedRows[rowIndex].items.reduce(
        (sum, itm) => sum + Number(itm.approved_amount || 0),
        0
      );
      updatedRows[rowIndex].approved_amount = approvedAmount;

      setRows(updatedRows);
    } catch (error) {
      console.error("Failed to update single item:", error);
    }
  };

  const handleCommentSave = () => {
    setCommentDialog({ open: false, rowIndex: null });
  };

  const handleRejectAllSubmit = async () => {
    try {
      const requests = rows.map((row) =>
        updateStatus({
          _id: row._id,
          status: "rejected",
          remarks: sharedRejectionComment || "Rejected without comment",
        }).unwrap()
      );

      await Promise.all(requests);
      toast.success("All sheets rejected successfully");

      // Update local state visually only (not sent to backend)
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
        }));

        return {
          ...row,
          items: updatedItems,
          row_current_status: "rejected",
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
      const updated = rows.map((row) => {
        const updatedItems = row.items.map((item) => {
          const invoiceAmount = Number(item.invoice?.invoice_amount) || 0;

          return {
            ...item,
            item_current_status: "manager approval",
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
            status: "manager approval",
            approved_amount: row.approved_amount,
          }).unwrap()
        )
      );

      toast.success("All items approved successfully");
      setApproveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to approve all items:", error);
      toast.error("Failed to approve all items");
    }
  };
  const handleHrApproveAll = () => {
    setApproveConfirmOpen(true);
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
    setRejectConfirmOpen(true); // optionally trigger a confirm modal
  };

  const applyHrRejectAll = async () => {
    try {
      const updated = rows.map((row) => ({
        ...row,
        current_status: "rejected",
        items: row.items.map((item) => ({
          ...item,
          item_current_status: "rejected",
          approved_amount: 0,
        })),
        approved_amount: 0,
      }));

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "rejected",
            approved_amount: 0,
          }).unwrap()
        )
      );

      toast.success("All items rejected successfully");
      setRejectConfirmOpen(false);
    } catch (error) {
      console.error("Failed to reject all items:", error);
      toast.error("Failed to reject all items");
    }
  };

  const handleHrHoldAll = () => {
    setHoldConfirmOpen(true); // optional confirmation
  };

  const applyHrHoldAll = async () => {
    try {
      const updated = rows.map((row) => ({
        ...row,
        current_status: "hold",
        items: row.items.map((item) => ({
          ...item,
          item_current_status: "hold",
        })),
      }));

      setRows(updated);

      await Promise.all(
        updated.map((row) =>
          updateStatus({
            _id: row._id,
            status: "hold",
          }).unwrap()
        )
      );

      toast.success("All items put on hold successfully");
      setHoldConfirmOpen(false);
    } catch (error) {
      console.error("Failed to hold all items:", error);
      toast.error("Failed to hold all items");
    }
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
            {/* Left: Date Range */}
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography level="body-md" fontWeight="lg">
                Select Expense Term:
              </Typography>
              <Input
                type="date"
                size="sm"
                value={rows[0].expense_term.from}
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
                value={rows[0].expense_term.to}
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
              {user?.name === "Shruti Tripathi" &&
              rows.some((row) => row.current_status === "manager approval") ? (
                <>
                  <Button color="danger" size="sm" onClick={handleHrRejectAll}>
                    Reject
                  </Button>
                  <Button color="warning" size="sm" onClick={handleHrHoldAll}>
                    Hold
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleHrApproveAll}
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="danger"
                    onClick={handleRejectAll}
                    size="sm"
                    disabled={rows.every(
                      (row) =>
                        row.current_status === "rejected" ||
                        row.current_status === "manager approval"
                    )}
                  >
                    Reject All
                  </Button>
                  <Button
                    color="success"
                    onClick={handleApproveAll}
                    size="sm"
                    disabled={rows.every(
                      (row) =>
                        row.current_status === "rejected" ||
                        row.current_status === "manager approval"
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
                          type="number"
                          value={String(
                            item.approved_amount !== undefined &&
                              item.approved_amount !== ""
                              ? item.approved_amount
                              : (item.invoice?.invoice_amount ?? "")
                          ).replace(/^0+(?=\d)/, "")}
                          onChange={(e) =>
                            handleApprovedAmountChange(
                              rowIndex,
                              itemIndex,
                              e.target.value
                            )
                          }
                          min={0}
                        />
                      </td>
                      {user?.name !== "Shruti Tripathi" && (
                        <td>
                          <ApprovalButton
                            rowIndex={rowIndex}
                            itemIndex={itemIndex}
                            itemCurrentStatus={item.item_current_status}
                            handleApproval={handleApproval}
                          />
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
              rows[commentDialog.rowIndex]?.items?.[0]?.item_status_history?.[0]
                ?.remarks || ""
            }
            onChange={(e) =>
              handleRowChange(
                commentDialog.rowIndex,
                "item_status_history.remarks",
                e.target.value
              )
            }
            sx={{ mt: 1 }}
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
                  const itemsInCategory = rows.flatMap((row) =>
                    (row.items || []).filter(
                      (item) => item.category === category
                    )
                  );

                  const amt = itemsInCategory.reduce(
                    (sum, item) =>
                      sum + Number(item.invoice?.invoice_amount || 0),
                    0
                  );

                  const approvedAmt = itemsInCategory.reduce((sum, item) => {
                    if (item.item_current_status === "manager approval") {
                      const value =
                        item.approved_amount !== undefined &&
                        item.approved_amount !== ""
                          ? Number(item.approved_amount)
                          : Number(item.invoice?.invoice_amount ?? 0);

                      return sum + value;
                    }
                    return sum;
                  }, 0);

                  return (
                    <tr key={idx}>
                      <td>{category}</td>
                      <td>{amt > 0 ? amt.toFixed(2) : "-"}</td>
                      <td>{approvedAmt > 0 ? approvedAmt.toFixed(2) : "-"}</td>
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
                            item.item_current_status === "manager approval"
                        )
                        .reduce(
                          (sum, item) =>
                            sum +
                            Number(
                              item.approved_amount !== undefined &&
                                item.approved_amount !== ""
                                ? item.approved_amount
                                : (item.invoice?.invoice_amount ?? 0)
                            ),
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
                justifyContent="center"
                maxWidth="400px"
                width="100%"
              >
               {/* <Button
              variant="outlined"
              onClick={() => navigate("/expense_dashboard")}
            >
              Back
            </Button>  */}
                <Button
                  variant="solid"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isUpdating}
                >
                  Update Expense Sheet
                </Button>
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
