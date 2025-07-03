import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { IconButton, Stack, Textarea, Tooltip } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllExpenseQuery,
  useGetExpenseByIdQuery,
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
          item_current_status: {
            user_id:"",
            remarks:"",
            status:""
          },
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
    },
  ]);

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [sharedRejectionComment, setSharedRejectionComment] = useState("");
  const [showRejectAllDialog, setShowRejectAllDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [commentDialog, setCommentDialog] = useState({
    open: false,
    rowIndex: null,
  });

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

    if (
      department === "Projects" ||
      department === "Engineering" ||
      department === "Infra"
    ) {
      return [...common, ...categoryOptions];
    } else if (
      department === "BD" ||
      department === "Marketing" ||
      department === "Internal"
    ) {
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

  const ExpenseCode = localStorage.getItem("edit_expense");

  const { data: response = {} } = useGetExpenseByIdQuery({
    expense_code: ExpenseCode,
  });

  const expenses = response?.data || [];

  const [updateExpense, { isLoading: isUpdating }] =
    useUpdateExpenseSheetMutation();

  const [updateStatus] = useUpdateExpenseStatusOverallMutation();

  useEffect(() => {
    if (!ExpenseCode) {
      console.warn("No expense_code in localStorage");
      return;
    }

    if (!expenses || typeof expenses !== "object") {
      console.warn("No valid expense data available");
      return;
    }

    const isMatch =
      String(expenses.expense_code).trim() === String(ExpenseCode).trim();

    if (isMatch) {
      const enrichedExpense = { ...expenses };
      setRows([enrichedExpense]);
    } else {
      console.warn("Expense code does not match");
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

      const updatedItems = rows.flatMap((row) =>
        (row.items || []).map((item) => {
          const status =
            typeof item.item_current_status === "string"
              ? item.item_current_status
              : item.item_current_status?.status || "manager approval";

          const approvedAmount =
            item.approved_amount !== "" && item.approved_amount !== undefined
              ? Number(item.approved_amount)
              : Number(item.invoice?.invoice_amount || 0);

          return {
            ...item,
            approved_amount: approvedAmount,
            item_current_status: {
              status,
              remarks: item.remarks || "",
              user_id: userID,
              updatedAt: new Date().toISOString(),
            },
            item_status_history: [
              ...(item.item_status_history || []),
              {
                status,
                remarks: item.remarks || "",
                user_id: userID,
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        })
      );

      const totalApproved = updatedItems.reduce(
        (sum, item) => sum + (Number(item.approved_amount) || 0),
        0
      );

      const allItemsRejected = updatedItems.every((item) => {
        const status =
          typeof item.item_current_status === "string"
            ? item.item_current_status
            : item.item_current_status?.status;

        return status === "rejected";
      });

      const overallStatus = allItemsRejected ? "rejected" : "manager approval";

      const payload = {
        user_id: userID,
        expense_code: ExpenseCode,
        current_status: {
          status: overallStatus,
          remarks: rows[0]?.remarks?.trim() || "",
        },
        total_approved_amount: String(totalApproved),
        items: updatedItems,
        status_history: [
          ...(rows[0]?.status_history || []),
          {
            status: overallStatus,
            remarks: rows[0]?.remarks?.trim() || "",
            user_id: userID,
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      console.log("payload:", payload);

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

    const updatedItem = {
      ...updatedRow.items[itemIndex],
      item_current_status: status,
      approved_amount:
        status === "rejected" ? 0 : updatedRow.items[itemIndex].approved_amount,
    };

    updatedRow.items[itemIndex] = updatedItem;
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
        const newStatus = {
          status: "rejected",
          remarks: sharedRejectionComment || "Rejected without comment",
          user_id: userID,
          updatedAt: new Date().toISOString(),
        };

        const updatedItems = row.items.map((item) => ({
          ...item,
          item_current_status: newStatus,
          remarks: sharedRejectionComment || "Rejected without comment",
          item_status_history: [
            ...(Array.isArray(item.item_status_history)
              ? item.item_status_history
              : []),
            newStatus,
          ],
        }));

        return {
          ...row,
          items: updatedItems,
          current_status: newStatus,
          status_history: [
            ...(Array.isArray(row.status_history) ? row.status_history : []),
            newStatus,
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

      // Send approval requests to backend
      const requests = rows.map((row) => {
        const approved_items = row.items.map((item) => ({
          _id: item._id,
          approved_amount: Number(item.invoice?.invoice_amount) || 0,
        }));

        return updateStatus({
          _id: row._id,
          approved_items,
          remarks: "", // or shared approval comment if applicable
        }).unwrap();
      });

      await Promise.all(requests);

      // Locally update rows without setting status manually
      const updatedRows = rows.map((row) => {
        const updatedItems = row.items.map((item) => {
          const approvedAmount = Number(item.invoice?.invoice_amount) || 0;

          return {
            ...item,
            approved_amount: String(approvedAmount),
          };
        });

        const total_approved_amount = updatedItems.reduce(
          (sum, item) => sum + Number(item.approved_amount),
          0
        );

        return {
          ...row,
          items: updatedItems,
          total_approved_amount: String(total_approved_amount),
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

  const tableHeaders = [
    "Project ID",
    "Project Name / Location",
    "Category",
    "Description",
    "Submission Date",
    "Bill Amount",
    "Attachment",
    "",
    "Invoice Number",
    "Approved Amount",
    ...(user?.role === "manager" ||
    user?.department === "admin" ||
    user?.role === "visitor" ||
    user?.name === "IT Team"
      ? ["Approval"]
      : []),
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
                value={rows[0].expense_term?.from.slice(0, 10) || ""}
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
                value={rows[0].expense_term?.to.slice(0, 10) || ""}
                onChange={(e) =>
                  handleRowChange(0, "expense_term", {
                    ...rows[0].expense_term,
                    to: e.target.value,
                  })
                }
              />
              <Typography level="body-md" fontWeight="lg">
                Employee Name:
              </Typography>
              <Input
                type="text"
                size="sm"
                value={rows[0].emp_name || "NA"}
                onChange={(e) => handleRowChange(0, "emp_name", e.target.value)}
                placeholder="Enter employee name"
              />
            </Box>

            {/* Right: Bulk Actions */}
            <Box display="flex" gap={2}>
              {(([
                "Engineering",
                "BD",
                "Projects",
                "Infra",
                "Internal",
                "CAM",
                "Accounts",
                "HR",
              ].includes(user?.department) &&
                user?.role === "manager") ||
                user?.role === "visitor" ||
                user?.name === "IT Team" ||
                user?.department === "admin") && (
                <>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={handleRejectAll}
                    disabled={rows.every((row) => {
                      const status =
                        typeof row.current_status === "string"
                          ? row.current_status
                          : row.current_status?.status;

                      return [
                        "rejected",
                        "hold",
                        "hr approval",
                        "manager approval",
                        "final approval",
                      ].includes(status);
                    })}
                  >
                    Reject All
                  </Button>

                  <Button
                    color="success"
                    size="sm"
                    onClick={handleApproveAll}
                    disabled={rows.every((row) => {
                      const status =
                        typeof row.current_status === "string"
                          ? row.current_status
                          : row.current_status?.status;

                      return [
                        "rejected",
                        "hold",
                        "hr approval",
                        "manager approval",
                        "final approval",
                      ].includes(status);
                    })}
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
                        {/* <td>
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
                        </td> */}

                        <td>
                          {item.attachment_url ? (
                            <Stack direction="row" spacing={1}>
                              {/* 👁️ View Button — show for images and PDFs */}
                              {/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(
                                item.attachment_url
                              ) && (
                                <Button
                                  variant="soft"
                                  color="neutral"
                                  size="sm"
                                  onClick={() =>
                                    setPreviewImage(item.attachment_url)
                                  }
                                  sx={{ textTransform: "none" }}
                                >
                                  👁️ View
                                </Button>
                              )}

                              {/* ⬇️ Download Button */}
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
                            </Stack>
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              No Attachment
                            </span>
                          )}

                          {/* 📄 Preview Modal for Image or PDF */}
                          <Modal
                            open={!!previewImage}
                            onClose={() => setPreviewImage(null)}
                          >
                            <ModalDialog>
                              <Box sx={{ textAlign: "center" }}>
                                {/* If image file */}
                                {/\.(jpg|jpeg|png|webp|gif)$/i.test(
                                  previewImage
                                ) ? (
                                  <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "70vh",
                                      borderRadius: 8,
                                    }}
                                  />
                                ) : previewImage?.endsWith(".pdf") ? (
                                  <iframe
                                    src={previewImage}
                                    title="PDF Preview"
                                    style={{
                                      width: "100%",
                                      height: "70vh",
                                      border: "none",
                                      borderRadius: 8,
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    level="body-sm"
                                    sx={{ color: "gray" }}
                                  >
                                    ⚠️ Preview not available for this file type.
                                  </Typography>
                                )}

                                <Button
                                  onClick={() => setPreviewImage(null)}
                                  sx={{ mt: 2 }}
                                >
                                  Close
                                </Button>
                              </Box>
                            </ModalDialog>
                          </Modal>
                        </td>

                        <td></td>

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
                                : item.invoice?.invoice_amount || ""
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
                            disabled={item.item_current_status === "rejected"}
                            sx={{ minWidth: 90 }}
                          />
                        </td>

                        {(user?.role === "manager" ||
                          user?.role === "visitor" ||
                          user?.department === "admin" ||
                          user?.name === "IT Team") &&
                          !(
                            user?.role === "manager" &&
                            user?.name === item.emp_name
                          ) && (
                            <td style={{ padding: 8 }}>
                              <Box display="flex" gap={1} alignItems="center">
                                <Button
                                  size="sm"
                                  variant={
                                    item.item_current_status ===
                                    "manager approval"
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
                                    handleApproval(
                                      rowIndex,
                                      itemIndex,
                                      "rejected"
                                    )
                                  }
                                  aria-label="Reject"
                                >
                                  <CloseIcon />
                                </Button>

                                {item.item_current_status === "rejected" &&
                                  item.remarks && (
                                    <Tooltip
                                      title={
                                        <Sheet
                                          variant="soft"
                                          sx={{
                                            p: 1,
                                            borderRadius: "md",
                                            maxWidth: 300,
                                            fontSize: "0.85rem",
                                            bgcolor: "error.light",
                                            color: "error.dark",
                                            boxShadow: "md",
                                          }}
                                        >
                                          {item.remarks}
                                        </Sheet>
                                      }
                                      arrow
                                      placement="top"
                                    >
                                      <IconButton
                                        size="sm"
                                        color="warning"
                                        sx={{ ml: 0.5 }}
                                      >
                                        <InfoOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                              </Box>
                            </td>
                          )}
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

                    {(typeof item.item_current_status === "string"
                      ? item.item_current_status
                      : item.item_current_status?.status) === "rejected" &&
                      item.remarks && (
                        <Sheet
                          variant="soft"
                          sx={{
                            mt: 1,
                            p: 1,
                            borderRadius: "md",
                            maxWidth: 400,
                            fontSize: "0.875rem",
                            bgcolor: "#fdecea",
                            color: "#b71c1c",
                            borderLeft: "4px solid #d32f2f",
                          }}
                        >
                          <b>Rejection Reason:</b> {item.remarks}
                        </Sheet>
                      )}

                    <Box>
                      <b>Attachment:</b>{" "}
                      {item.attachment_url ? (
                        <Stack direction="row" spacing={1}>
                          {/* 👁️ View Button: show if image or PDF */}
                          {/\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(
                            item.attachment_url
                          ) && (
                            <Button
                              variant="soft"
                              color="neutral"
                              size="sm"
                              onClick={() =>
                                setPreviewImage(item.attachment_url)
                              }
                              sx={{ textTransform: "none" }}
                            >
                              👁️ View
                            </Button>
                          )}

                          {/* ⬇️ Download Button */}
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
                        </Stack>
                      ) : (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                          No Attachment
                        </span>
                      )}
                      {/* Modal Preview */}
                      <Modal
                        open={!!previewImage}
                        onClose={() => setPreviewImage(null)}
                      >
                        <ModalDialog>
                          <Box sx={{ textAlign: "center" }}>
                            {/* Render image if it's an image file */}
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(
                              previewImage
                            ) ? (
                              <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "70vh",
                                  borderRadius: 8,
                                }}
                              />
                            ) : previewImage?.endsWith(".pdf") ? (
                              <iframe
                                src={previewImage}
                                title="PDF Preview"
                                style={{
                                  width: "100%",
                                  height: "70vh",
                                  border: "none",
                                  borderRadius: 8,
                                }}
                              />
                            ) : (
                              <Typography
                                level="body-sm"
                                sx={{ color: "gray" }}
                              >
                                ⚠️ Preview not available for this file type.
                              </Typography>
                            )}

                            <Button
                              onClick={() => setPreviewImage(null)}
                              sx={{ mt: 2 }}
                            >
                              Close
                            </Button>
                          </Box>
                        </ModalDialog>
                      </Modal>
                    </Box>

                    <Box></Box>
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

                    {(() => {
                      const status =
                        typeof item.item_current_status === "string"
                          ? item.item_current_status
                          : item.item_current_status?.status;

                      return (
                        (user?.role === "manager" ||
                          user?.role === "visitor" ||
                          user?.department === "admin" ||
                          user?.name === "IT Team") &&
                        status === "submitted" && (
                          <Box
                            display="flex"
                            justifyContent="center"
                            gap={1}
                            mt={1}
                          >
                            <Button
                              size="sm"
                              variant={
                                status === "manager approval"
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
                                status === "rejected" ? "solid" : "outlined"
                              }
                              color="danger"
                              onClick={() =>
                                handleApproval(rowIndex, itemIndex, "rejected")
                              }
                            >
                              <CloseIcon />
                            </Button>
                          </Box>
                        )
                      );
                    })()}
                  </Box>
                ))
              )}
            </Box>
          </Sheet>
        </Box>
      </Box>

      {/* Joy UI Modal for Comment */}
      <Modal
        open={commentDialog.open}
        onClose={() =>
          setCommentDialog({ open: false, rowIndex: null, itemIndex: null })
        }
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
          <IconButton
            size="sm"
            onClick={() =>
              setCommentDialog({ open: false, rowIndex: null, itemIndex: null })
            }
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
                ?.remarks || ""
            }
            onChange={(e) =>
              handleRowChange(
                commentDialog.rowIndex,
                "remarks",
                e.target.value,
                commentDialog.itemIndex
              )
            }
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              size="sm"
              variant="outlined"
              onClick={() =>
                setCommentDialog({
                  open: false,
                  rowIndex: null,
                  itemIndex: null,
                })
              }
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
                user?.role === "visitor" ||
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
                      const itemStatus =
                        typeof item.item_current_status === "string"
                          ? item.item_current_status
                          : item.item_current_status?.status;

                      const rowStatus =
                        typeof row.current_status === "string"
                          ? row.current_status
                          : row.current_status?.status;

                      if (
                        item.category === category &&
                        itemStatus !== "rejected"
                      ) {
                        total += Number(item.invoice?.invoice_amount || 0);

                        if (
                          (itemStatus === "manager approval" ||
                            rowStatus === "manager approval") &&
                          Number(item.approved_amount || 0) > 0
                        ) {
                          approvedTotal += Number(item.approved_amount);
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
              </tbody>

              {/* Grand Total */}
              <tfoot>
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
                        .filter((item) => {
                          const status =
                            typeof item.item_current_status === "string"
                              ? item.item_current_status
                              : item.item_current_status?.status;
                          return status !== "rejected";
                        })
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
                        .filter((item) => {
                          const itemStatus =
                            typeof item.item_current_status === "string"
                              ? item.item_current_status
                              : item.item_current_status?.status;

                          const rowStatus =
                            typeof rows[0]?.current_status === "string"
                              ? rows[0]?.current_status
                              : rows[0]?.current_status?.status;

                          return (
                            itemStatus !== "rejected" &&
                            (itemStatus === "manager approval" ||
                              (rowStatus === "manager approval" &&
                                Number(item.approved_amount || 0) > 0))
                          );
                        })
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.approved_amount || 0),
                          0
                        )
                        .toFixed(2)}
                    </Typography>
                  </td>
                </tr>
              </tfoot>
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
                  user?.role === "visitor" ||
                  user?.name === "IT Team") &&
                  (() => {
                    const rowStatus =
                      typeof rows[0]?.current_status === "string"
                        ? rows[0]?.current_status
                        : rows[0]?.current_status?.status;

                    return rowStatus === "submitted";
                  })() && (
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={
                        isUpdating ||
                        (rows[0]?.total_approved_amount === "0" &&
                          (() => {
                            const rowStatus =
                              typeof rows[0]?.current_status === "string"
                                ? rows[0]?.current_status
                                : rows[0]?.current_status?.status;

                            return [
                              "manager approval",
                              "rejected",
                              "hr approval",
                              "final approval",
                              "hold",
                            ].includes(rowStatus);
                          })())
                      }
                    >
                      Update Expense Sheet
                    </Button>
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

export default UpdateExpense;