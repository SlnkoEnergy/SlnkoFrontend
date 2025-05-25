import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllExpenseQuery,
  useUpdateExpenseSheetMutation,
} from "../../../redux/Expense/expenseSlice";
import { useGetProjectsQuery } from "../../../redux/projectsSlice";

const UpdateExpense = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      items: [
        {
          category: "",
          project_id: "",
          description: "",
          expense_date: "",
          invoice: {
            invoice_number: "",
            invoice_amount: "",
          },
          attachment_url: "",
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
  const [commentDialog, setCommentDialog] = useState({
    open: false,
    rowIndex: null,
  });

  const inputRefs = useRef([]);

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

  const { data: projresponse = {} } = useGetProjectsQuery();
  const project = projresponse.data || [];

  const [updateExpense, { isLoading: isUpdating }] =
    useUpdateExpenseSheetMutation();
  console.log("🔄 getExpense Query Response:", expenses);

  // const { data: getProject = [], isLoading, error } = useGetProjectsQuery();

  // console.log(getProject);

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

    if (!Array.isArray(project) || project.length === 0) {
      console.warn("❌ No projects available");
      return;
    }

    console.log("🔍 Looking for expense_code:", ExpenseCode);

    const matchedExpense = expenses.find(
      (exp) => String(exp.expense_code).trim() === String(ExpenseCode).trim()
    );

    if (matchedExpense) {
      console.log("✅ Matched Expense Found:", matchedExpense);

      // Enrich each item in matchedExpense.items with project data
      const enrichedItems = (matchedExpense.items || []).map((item) => {
        const matchedProject = project.find(
          (proj) => String(proj._id) === String(item.project_id)
        );

        return {
          ...item,
          project_code: matchedProject?.project_code || "",
          project_name: matchedProject?.project_name || "",
        };
      });

      // Create the updated expense with enriched items
      const enrichedExpense = {
        ...matchedExpense,
        items: enrichedItems,
      };

      setRows([enrichedExpense]);
    } else {
      console.warn("⚠️ No matching expense_code found");
    }
  }, [ExpenseCode, expenses, project]);

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

      const currentStatus = rows[0]?.current_status;
      const expenseSheetId = rows[0]?._id;

      if (!expenseSheetId) {
        toast.error("Expense Sheet ID is missing. Please reload the page.");
        return;
      }

      // ✅ Corrected: Flatten all items from each row
      const items = rows.flatMap((row) =>
        (row.items || []).map((item) => ({
          ...item,
          project_id: item.project_id || null,
          invoice: {
            ...item.invoice,
            invoice_amount: item.invoice?.invoice_amount || "0",
          },
          item_status_history: [
            {
              status: "submitted",
              remarks: item.item_status_history?.[0]?.remarks || "",
              user_id: userID,
              updatedAt: new Date().toISOString(),
            },
          ],
          item_current_status: "submitted",
        }))
      );

      const cleanedData = {
        expense_term: rows[0]?.expense_term || {},
        items,
        user_id: userID,
        current_status: "submitted",
        status_history: [
          {
            status: "submitted",
            remarks: rows[0]?.status_history?.[0]?.remarks || "",
            user_id: userID,
            updatedAt: new Date().toISOString(),
          },
        ],
        total_requested_amount: items.reduce(
          (sum, itm) => sum + Number(itm.invoice.invoice_amount || 0),
          0
        ),
        total_approved_amount: items.reduce(
          (sum, itm) => sum + Number(itm.approved_amount || 0),
          0
        ),
        expense_code: ExpenseCode,
      };

      const payload = {
        user_id: userID,
        data: cleanedData,
      };

      const updateStatuses = [
        "submitted",
        "manager approval",
        "hr approval",
        "final approval",
        "hold",
      ];

      if (updateStatuses.includes(currentStatus?.toLowerCase())) {
        await updateExpense({
          _id: expenseSheetId,
          ...payload,
        }).unwrap();

        toast.success("Expense sheet updated successfully!");
        localStorage.removeItem("edit_expense");
        navigate("/expense_dashboard");
      } else {
        toast.error(
          "You are not allowed to create a new expense sheet in this state."
        );
      }
    } catch (error) {
      console.error("❌ Submission failed:", error);
      toast.error("An error occurred while submitting the expense sheet.");
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          "https://dev.api.slnkoprotrac.com/v1/get-all-project-IT",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        const data = response.data?.data;
        if (Array.isArray(data)) {
          setProjectCodes(data);
        } else {
          setProjectCodes([]);
        }
      } catch (error) {
        console.error("Error fetching project codes:", error);
        setProjectCodes([]);
      }
    };

    fetchProjects();
  }, []);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    if (field === "code") {
      const selected = projectCodes.find((p) => p.code === value);
      if (selected) updated[index].name = selected.name;
    }
    setRows(updated);
  };

  const handleItemChange = (rowIndex, field, value) => {
    const updated = [...rows];
    if (!updated[rowIndex].items || updated[rowIndex].items.length === 0) {
      updated[rowIndex].items = [{}]; // Ensure items[0] exists
    }
    updated[rowIndex].items[0][field] = value;
    setRows(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...rows];
    updated[index].file = file;
    setRows(updated);
  };

  const handleSearchInputChange = (index, value) => {
    setSearchInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setDropdownOpenIndex(index);
    handleRowChange(index, "code", value);
  };

  // const handleSelectProject = (index, code, name) => {
  //   const updated = [...rows];
  //   updated[index]._id = _id;
  //   updated[index].code = code;
  //   updated[index].name = name;
  //   setRows(updated);
  //   setSearchInputs((prev) => {
  //     const updated = [...prev];
  //     updated[index] = code;
  //     return updated;
  //   });
  //   setDropdownOpenIndex(null);
  // };

  // const handleSelectProject = (index, code) => {
  //   const selectedProject = projectCodes.find((p) => p.code === code);
  //   if (!selectedProject) return;

  //   const updated = [...rows];
  //   updated[index].items[0].project_id = selectedProject._id;
  //   updated[index].items[0].project_name = selectedProject.name; // optional
  //   setRows(updated);

  //   setSearchInputs((prev) => {
  //     const updatedInputs = [...prev];
  //     updatedInputs[index] = code;
  //     return updatedInputs;
  //   });

  //   setDropdownOpenIndex(null);
  // };

  const handleSelectProject = (index, code, name) => {
    const selectedProject = projectCodes.find((p) => p.code === code);
    if (!selectedProject) return;

    const updated = [...rows];
    updated[index].items[0].project_id = selectedProject._id;
    updated[index].items[0].project_name = name;
    setRows(updated);

    setSearchInputs((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = code;
      updated[index].name = name;
      return updatedInputs;
    });

    setDropdownOpenIndex(null);
  };

  const handleApproval = (index, status) => {
    const updated = [...rows];

    updated[index].approvalStatus = status;

    if (status === "approved") {
      updated[index].items = updated[index].items.map((item) => ({
        ...item,
        item_current_status: "approved",
        approved_amount: item.invoice?.invoice_amount || 0,
      }));

      updated[index].approved_amount = updated[index].items.reduce(
        (sum, item) => sum + Number(item.approved_amount || 0),
        0
      );
    } else {
      updated[index].items = updated[index].items.map((item) => ({
        ...item,
        item_current_status: "rejected",
      }));
      updated[index].approved_amount = "";
      setCommentDialog({ open: true, rowIndex: index });
    }

    setRows(updated);
  };

  const handleCommentSave = () => {
    setCommentDialog({ open: false, rowIndex: null });
  };
  const showInvoiceNoColumn = rows.some((row) =>
    row.items?.some((item) => item.invoice?.invoice_number?.trim?.() !== "")
  );

  const handleRejectAll = () => {
    const updated = rows.map((row, index) => ({
      ...row,
      approvalStatus: "rejected",
      rejectionComment: "",
    }));
    setRows(updated);
    setCommentDialog({ open: true, rowIndex: 0 });
  };

  const handleApproveAll = () => {
    const updated = rows.map((row) => {
      const invoiceAmount = row.items?.[0]?.invoice?.invoice_amount || 0;

      return {
        ...row,
        approvalStatus: "approved",
        approved_amount: invoiceAmount, // use invoice amount instead of total_requested_amount
      };
    });

    setRows(updated);
  };

  const tableHeaders = [
    "Project Code",
    "Project Name",
    "Category",
    "Description",
    "Date",
    "Bill Amount",
    "Attachment",
    "Approval",
    "Approved Amt",
    "Invoice",
  ];

  if (showInvoiceNoColumn) {
    tableHeaders.push("Invoice No");
  }

  return (
    <Box p={2}>
      <Typography level="h4" mb={2}>
        Expense Sheet
      </Typography>

      <Box sx={{ maxWidth: "100%", overflowX: "auto", p: 1 }}>
        {/* Action Buttons */}

        <Box
          sx={{
            marginLeft: { md: "15%" },
          }}
        >
          {/* Action Buttons */}
          <Box
            display="flex"
            gap={2}
            mb={2}
            flexWrap="wrap"
            justifyContent="flex-start"
          >
            <Button
              color="success"
              onClick={handleApproveAll}
              sx={{ minWidth: 120 }}
            >
              Approve All
            </Button>
            <Button
              color="danger"
              onClick={handleRejectAll}
              sx={{ minWidth: 120 }}
            >
              Reject All
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography level="body-md" fontWeight="lg">
              Select Expense Term:
            </Typography>

            {/* From Date */}
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

            {/* To Date */}
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

          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: 800,
              fontSize: "0.9rem",
              tableLayout: "fixed",
            }}
          >
            <thead
              style={{
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #ccc",
              }}
            >
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) =>
                row.items.map((item, itemIndex) => {
                  const filteredProjects = projectCodes.filter((project) =>
                    (project.code || "")
                      .toLowerCase()
                      .includes((searchInputs[rowIndex] || "").toLowerCase())
                  );

                  const invoice = item.invoice || {};
                  const hasInvoiceNumber =
                    invoice.invoice_number?.trim?.() !== "";

                  return (
                    <tr
                      key={`${rowIndex}-${itemIndex}`}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor:
                          rowIndex % 2 === 0 ? "white" : "#fafafa",
                      }}
                    >
                      {/* Project Code with autocomplete */}
                      <td
                        style={{ position: "relative", padding: 8, width: 150 }}
                      >
                        <Input
                          size="sm"
                          variant="outlined"
                          value={searchInputs[rowIndex] || ""}
                          placeholder="Search Project Code"
                          onChange={(e) =>
                            handleSearchInputChange(rowIndex, e.target.value)
                          }
                          onFocus={() => setDropdownOpenIndex(rowIndex)}
                          inputRef={(el) => (inputRefs.current[rowIndex] = el)}
                          autoComplete="off"
                          sx={{ width: "100%" }}
                        />
                        {dropdownOpenIndex === rowIndex &&
                          filteredProjects.length > 0 && (
                            <Sheet
                              variant="outlined"
                              sx={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                zIndex: 20,
                                maxHeight: 180,
                                overflowY: "auto",
                                bgcolor: "background.body",
                                borderRadius: 1,
                                boxShadow: "md",
                                mt: 0.5,
                              }}
                            >
                              <List size="sm" sx={{ p: 0 }}>
                                {filteredProjects.map((project, i) => (
                                  <ListItem
                                    key={i}
                                    onClick={() =>
                                      handleSelectProject(
                                        rowIndex,
                                        project.code,
                                        project.name
                                      )
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      px: 2,
                                      py: 1,
                                      borderRadius: 1,
                                      "&:hover": { bgcolor: "primary.softBg" },
                                    }}
                                  >
                                    <Typography level="body2" fontWeight="md">
                                      {project.code}
                                    </Typography>{" "}
                                    - {project.name}
                                  </ListItem>
                                ))}
                              </List>
                            </Sheet>
                          )}
                      </td>

                      {/* Project Name */}
                      <td style={{ padding: 8, maxWidth: 200 }}>
                        <Input
                          size="sm"
                          variant="outlined"
                          value={row.name}
                          placeholder="Project Name"
                          disabled
                          sx={{ width: "100%" }}
                        />
                      </td>

                      {/* Category */}
                      <td style={{ padding: 8 }}>
                        <Select
                          size="sm"
                          variant="outlined"
                          value={item.category || ""}
                          onChange={(e, value) =>
                            handleItemChange(rowIndex, "category", value)
                          }
                          placeholder="Select"
                          slotProps={{
                            listbox: {
                              sx: { maxHeight: 160, overflowY: "auto" },
                            },
                          }}
                          sx={{ width: 120 }}
                        >
                          {categoryOptions.map((cat, idx) => (
                            <Option key={idx} value={cat}>
                              {cat}
                            </Option>
                          ))}
                        </Select>
                      </td>

                      {/* Description */}
                      <td style={{ padding: 8, maxWidth: 250 }}>
                        <Input
                          size="sm"
                          variant="outlined"
                          value={item.description || ""}
                          placeholder="Description"
                          onChange={(e) =>
                            handleItemChange(
                              rowIndex,
                              "description",
                              e.target.value
                            )
                          }
                          multiline
                          minRows={1}
                          maxRows={3}
                          sx={{ width: "100%" }}
                        />
                      </td>

                      {/* Date */}
                      <td style={{ padding: 8 }}>
                        <Input
                          size="sm"
                          variant="outlined"
                          type="date"
                          value={
                            item.expense_date
                              ? new Date(item.expense_date)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleItemChange(
                              rowIndex,
                              "expense_date",
                              e.target.value
                            )
                          }
                          sx={{ minWidth: 120 }}
                        />
                      </td>

                      {/* Invoice Amount */}
                      <td style={{ padding: 8 }}>
                        <Input
                          size="sm"
                          variant="outlined"
                          type="number"
                          value={invoice.invoice_amount || ""}
                          placeholder="₹"
                          onChange={(e) =>
                            handleItemChange(rowIndex, "invoice", {
                              ...invoice,
                              invoice_amount: e.target.value,
                            })
                          }
                          inputProps={{ min: 0 }}
                          sx={{ minWidth: 90 }}
                        />
                      </td>

                      {/* Attachment */}
                      <td style={{ padding: 8, width: 120 }}>
                        <Button
                          size="sm"
                          component="label"
                          startDecorator={<UploadFileIcon />}
                          variant="outlined"
                          sx={{ minWidth: 100 }}
                        >
                          {row.attachment_url
                            ? row.attachment_url.split("/").pop()
                            : "Upload"}
                          <input
                            hidden
                            type="file"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleFileChange(rowIndex, e.target.files[0])
                            }
                          />
                        </Button>
                      </td>

                      {/* Approval Buttons */}
                      <td style={{ padding: 8 }}>
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            size="sm"
                            variant={
                              row.approvalStatus === "approved"
                                ? "solid"
                                : "outlined"
                            }
                            color="success"
                            onClick={() => handleApproval(rowIndex, "approved")}
                            aria-label="Approve"
                          >
                            <CheckIcon />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              row.approvalStatus === "rejected"
                                ? "solid"
                                : "outlined"
                            }
                            color="danger"
                            onClick={() => handleApproval(rowIndex, "rejected")}
                            aria-label="Reject"
                          >
                            <CloseIcon />
                          </Button>
                        </Box>
                      </td>

                      {/* Approved Amount */}
                      <td style={{ padding: 8, maxWidth: 110 }}>
                        {row.approvalStatus === "approved" && (
                          <Input
                            size="sm"
                            variant="outlined"
                            type="number"
                            value={row.approved_amount || ""}
                            placeholder="₹"
                            onChange={(e) =>
                              handleRowChange(
                                rowIndex,
                                "approved_amount",
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0 }}
                            sx={{ minWidth: 90 }}
                          />
                        )}
                      </td>

                      {/* Invoice Present: Yes/No */}
                      <td>
                        <Select
                          value={hasInvoiceNumber ? "Yes" : "No"}
                          onChange={(e, value) => {
                            const isYes = value === "Yes";
                            handleItemChange(rowIndex, "invoice", {
                              ...invoice,
                              invoice_number: isYes
                                ? invoice.invoice_number || ""
                                : "",
                            });
                          }}
                          placeholder="Yes/No"
                        >
                          <Option value="Yes">Yes</Option>
                          <Option value="No">No</Option>
                        </Select>
                      </td>

                      {/* Invoice Number Input */}
                      {showInvoiceNoColumn && (
                        <td>
                          {hasInvoiceNumber && (
                            <Input
                              value={invoice.invoice_number || ""}
                              onChange={(e) =>
                                handleItemChange(rowIndex, "invoice", {
                                  ...invoice,
                                  invoice_number: e.target.value,
                                })
                              }
                              placeholder="Invoice No."
                              sx={{ width: "100%" }}
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Joy UI Modal for Comment */}
      <Modal
        open={commentDialog.open}
        onClose={() => setCommentDialog({ open: false, rowIndex: null })}
      >
        <ModalDialog>
          <Typography level="h6">Rejection Comment</Typography>
          <Input
            minRows={2}
            placeholder="Enter comment"
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
            <Button onClick={handleCommentSave}>Save</Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Summary */}
      <Box mt={4} sx={{ margin: "0 auto", width: "60%" }}>
        <Typography level="h5" mb={1}>
          Expense Summary
        </Typography>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "md",
            overflow: "auto",
            boxShadow: "sm",
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
                  (row.items || []).filter((item) => item.category === category)
                );

                const amt = itemsInCategory.reduce(
                  (sum, item) =>
                    sum + Number(item.invoice?.invoice_amount || 0),
                  0
                );

                const approvedAmt = itemsInCategory.reduce((sum, item) => {
                  if (item.item_current_status === "approved") {
                    // Prefer approved_amount if available, else fallback to invoice amount
                    return (
                      sum +
                      Number(
                        item.approved_amount ??
                          item.invoice?.invoice_amount ??
                          0
                      )
                    );
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
                      .filter((item) => item.item_current_status === "approved")
                      .reduce(
                        (sum, item) => sum + Number(item.approved_amount || 0),
                        0
                      )
                      .toFixed(2)}
                  </Typography>
                </td>
              </tr>
            </tbody>
          </Table>
        </Sheet>

        {/* Submit & Back Buttons */}
        <Box mt={2} display="flex" justifyContent="center">
          <Box
            display="flex"
            justifyContent="space-between"
            maxWidth="400px"
            width="100%"
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/expense_dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              "Update Expense Sheet"
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateExpense;
