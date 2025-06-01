import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Card, CardContent, Textarea } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAddExpenseMutation } from "../../../redux/Expense/expenseSlice";

const Expense_Form = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentDialog, setCommentDialog] = useState({
    open: false,
    rowIndex: null,
  });

  const inputRefs = useRef({});
  const dropdownRefs = useRef({});

  useEffect(() => {
    function handleClickOutside(event) {
      const isClickInside =
        Object.values(inputRefs.current).some((ref) =>
          ref?.contains(event.target)
        ) ||
        Object.values(dropdownRefs.current).some((ref) =>
          ref?.contains(event.target)
        );

      if (!isClickInside) {
        setDropdownOpenIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const [addExpense] = useAddExpenseMutation();

  // const { data: getProject = [], isLoading, error } = useGetProjectsQuery();

  // console.log(getProject);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          "https://api.slnkoprotrac.com/v1/get-all-project-IT",
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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userID = JSON.parse(localStorage.getItem("userDetails"))?.userID;
      if (!userID) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      const items = rows.flatMap((row) =>
        (row.items || []).map((item) => ({
          ...item,
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
        disbursement_date: rows[0]?.disbursement_date || "",
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
      };

      const formData = new FormData();

      items.forEach((item) => {
        if (item.file) {
          formData.append("files", item.file); // For backend file handling
        }
      });

      formData.append("data", JSON.stringify(cleanedData));
      formData.append("user_id", userID);

      // ✅ Send via RTK Query mutation
      await addExpense(formData).unwrap();

      toast.success("Expense sheet submitted successfully!");
      navigate("/expense_dashboard");
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.response?.data?.message ||
        "An error occurred while submitting the expense sheet.";
      toast.error(errMsg);
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
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
              status: "",
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
    setSearchInputs((prev) => [...prev, ""]);
  };

  const handleRemoveRow = () => {
    if (rows.length <= 1) {
      toast.warning("You must have at least one row.");
      return;
    }

    setRows((prev) => prev.slice(0, -1));
    setSearchInputs((prev) => prev.slice(0, -1));
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

  const handleItemChange = (rowIndex, field, value) => {
    const updated = [...rows];
    if (!updated[rowIndex].items || updated[rowIndex].items.length === 0) {
      updated[rowIndex].items = [{}];
    }
    updated[rowIndex].items[0][field] = value;
    setRows(updated);
  };

  const handleFileChange = (rowIndex, itemIndex, file) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].items[itemIndex].file = file; // Keep the actual File
    updatedRows[rowIndex].items[itemIndex].attachment_url = file.name; // Optional, UI only
    setRows(updatedRows);
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

  const handleSelectProject = (index, code, name) => {
    const selectedProject = projectCodes.find((p) => p.code === code);
    if (!selectedProject) return;

    const updated = [...rows];

    if (updated[index]?.items?.[0]) {
      updated[index].items[0] = {
        ...updated[index].items[0],
        project_id: selectedProject._id,
        project_code: code,
        project_name: name,
        // projectSelected: true,
      };
    }

    setRows(updated);

    setSearchInputs((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = code;
      return updatedInputs;
    });

    setDropdownOpenIndex(null);
  };

  const handleCommentSave = () => {
    setCommentDialog({ open: false, rowIndex: null });
  };

  const showInvoiceNoColumn = rows.some(
    (row) => row.items?.[0]?.invoice?.status === "Yes"
  );

  const tableHeaders = [
    "Project Code",
    "Project Name",
    "Category",
    "Description",
    "Date",
    "Bill Amount",
    "Attachment",
    "Invoice",
  ];

  if (showInvoiceNoColumn) {
    tableHeaders.push("Invoice No");
  }

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
          marginLeft: { md: "15%" },
        }}
      >
        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row-reverse" },
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Select Expense Term – always first on mobile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography level="body-sm" fontWeight="md">
              📅 Select Expense Term:
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
              sx={{ minWidth: 130 }}
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
              sx={{ minWidth: 130 }}
            />
          </Box>

          {/* Action Buttons – below on mobile */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <Button
              onClick={handleAddRow}
              variant="solid"
              size="sm"
              title="Add Row"
              color="primary"
            >
              +Add Row
            </Button>

            <Button
              onClick={handleRemoveRow}
              variant="solid"
              size="sm"
              title="Remove Row"
              color="danger"
              disabled={rows.length <= 1}
            >
              -Remove Row
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" } }}>
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
              {rows.map((row, rowIndex) => {
                const filteredProjects = projectCodes.filter((project) =>
                  (project.code || "")
                    .toLowerCase()
                    .includes((searchInputs[rowIndex] || "").toLowerCase())
                );

                return (
                  <tr
                    key={rowIndex}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: rowIndex % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
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
                        // disabled={rows[rowIndex]?.items?.[0]?.projectSelected}
                      />
                      {dropdownOpenIndex === rowIndex &&
                        filteredProjects.length > 0 && (
                          <Sheet
                            ref={(el) => (dropdownRefs.current[rowIndex] = el)}
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
                        value={row.items?.[0]?.project_name || ""}
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
                        value={row.items?.[0]?.category || ""}
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
                      <Textarea
                        size="sm"
                        variant="outlined"
                        value={row.items?.[0]?.description || ""}
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
                        value={row.items[0].expense_date}
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
                        value={row.items?.[0]?.invoice?.invoice_amount || ""}
                        placeholder="₹"
                        onChange={(e) =>
                          handleItemChange(rowIndex, "invoice", {
                            ...row.items?.[0]?.invoice,
                            invoice_amount: e.target.value,
                          })
                        }
                        inputProps={{ min: 0 }}
                        sx={{ minWidth: 90 }}
                      />
                    </td>

                    {/* Attachment */}
                    <td style={{ padding: 8, width: 200 }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <Button
                          size="sm"
                          component="label"
                          startDecorator={<UploadFileIcon />}
                          variant="outlined"
                          sx={{ minWidth: 120 }}
                        >
                          {row.items?.[0]?.attachment_url
                            ? "Change File"
                            : "Upload File"}
                          <input
                            hidden
                            type="file"
                            onChange={
                              (e) =>
                                e.target.files?.[0] &&
                                handleFileChange(rowIndex, 0, e.target.files[0]) // Index 0 for items[0]
                            }
                          />
                        </Button>

                        {row.items?.[0]?.attachment_url && (
                          <div
                            style={{
                              fontSize: 12,
                              wordBreak: "break-word",
                              color: "#444",
                            }}
                          >
                            📎 {row.items[0].attachment_url}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Invoice */}
                    <td>
                      <Select
                        value={row.items?.[0]?.invoice?.status || ""} // 'invoice' can be an object, so maybe status or yes/no
                        onChange={(e, value) =>
                          handleItemChange(rowIndex, "invoice", {
                            ...row.items?.[0]?.invoice,
                            status: value,
                          })
                        }
                        placeholder="Yes/No"
                      >
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                      </Select>
                    </td>

                    {showInvoiceNoColumn && (
                      <td>
                        {row.items?.[0]?.invoice?.status === "Yes" && (
                          <Input
                            value={
                              row.items?.[0]?.invoice?.invoice_number || ""
                            }
                            onChange={(e) =>
                              handleItemChange(rowIndex, "invoice", {
                                ...row.items?.[0]?.invoice,
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
              })}
            </tbody>
          </table>
        </Box>

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          {rows.map((row, rowIndex) => {
            const filteredProjects = projectCodes.filter((project) =>
              (project.code || "")
                .toLowerCase()
                .includes((searchInputs[rowIndex] || "").toLowerCase())
            );

            return (
              <Card key={rowIndex} variant="outlined" sx={{ p: 2 }}>
                <CardContent>
                  {/* Project Code Search */}
                  <Input
                    size="sm"
                    value={searchInputs[rowIndex] || ""}
                    placeholder="Search Project Code"
                    onChange={(e) =>
                      handleSearchInputChange(rowIndex, e.target.value)
                    }
                    onFocus={() => setDropdownOpenIndex(rowIndex)}
                    inputRef={(el) => (inputRefs.current[rowIndex] = el)}
                    sx={{ mb: 1 }}
                  />
                  {/* Project Dropdown */}
                  {dropdownOpenIndex === rowIndex &&
                    filteredProjects.length > 0 && (
                      <Sheet
                        ref={(el) => (dropdownRefs.current[rowIndex] = el)}
                        variant="outlined"
                        sx={{
                          maxHeight: 180,
                          overflowY: "auto",
                          bgcolor: "background.body",
                          borderRadius: 1,
                          boxShadow: "md",
                          mt: 0.5,
                        }}
                      >
                        <List size="sm">
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

                  <Input
                    size="sm"
                    value={row.items?.[0]?.project_name || ""}
                    placeholder="Project Name"
                    disabled
                    sx={{ mt: 1 }}
                  />

                  <Select
                    size="sm"
                    value={row.items?.[0]?.category || ""}
                    onChange={(e, value) =>
                      handleItemChange(rowIndex, "category", value)
                    }
                    placeholder="Category"
                    sx={{ mt: 1 }}
                  >
                    {categoryOptions.map((cat, idx) => (
                      <Option key={idx} value={cat}>
                        {cat}
                      </Option>
                    ))}
                  </Select>

                  <Textarea
                    size="sm"
                    value={row.items?.[0]?.description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      handleItemChange(rowIndex, "description", e.target.value)
                    }
                    minRows={2}
                    sx={{ mt: 1 }}
                  />

                  <Input
                    type="date"
                    size="sm"
                    value={row.items?.[0]?.expense_date || ""}
                    onChange={(e) =>
                      handleItemChange(rowIndex, "expense_date", e.target.value)
                    }
                    sx={{ mt: 1 }}
                  />

                  <Input
                    type="number"
                    size="sm"
                    value={row.items?.[0]?.invoice?.invoice_amount || ""}
                    placeholder="₹ Invoice Amount"
                    onChange={(e) =>
                      handleItemChange(rowIndex, "invoice", {
                        ...row.items?.[0]?.invoice,
                        invoice_amount: e.target.value,
                      })
                    }
                    sx={{ mt: 1 }}
                  />

                  <Box mt={1}>
                    <Button
                      size="sm"
                      component="label"
                      variant="outlined"
                      startDecorator={<UploadFileIcon />}
                    >
                      {row.items?.[0]?.attachment_url
                        ? "Change File"
                        : "Upload File"}
                      <input
                        hidden
                        type="file"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileChange(rowIndex, 0, e.target.files[0])
                        }
                      />
                    </Button>
                    {row.items?.[0]?.attachment_url && (
                      <Typography
                        level="body-sm"
                        mt={1}
                        sx={{ wordBreak: "break-word" }}
                      >
                        📎 {row.items[0].attachment_url}
                      </Typography>
                    )}
                  </Box>

                  <Select
                    value={row.items?.[0]?.invoice?.status || ""}
                    onChange={(e, value) =>
                      handleItemChange(rowIndex, "invoice", {
                        ...row.items?.[0]?.invoice,
                        status: value,
                      })
                    }
                    placeholder="Invoice?"
                    sx={{ mt: 1 }}
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>

                  {row.items?.[0]?.invoice?.status === "Yes" && (
                    <Input
                      value={row.items?.[0]?.invoice?.invoice_number || ""}
                      onChange={(e) =>
                        handleItemChange(rowIndex, "invoice", {
                          ...row.items?.[0]?.invoice,
                          invoice_number: e.target.value,
                        })
                      }
                      placeholder="Invoice Number"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Summary */}
      <Box mt={4} sx={{ margin: "0 auto", width: { md: "60%", sm: "100%" } }}>
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

                const approvedAmt = itemsInCategory.reduce(
                  (sum, item) =>
                    item.item_current_status === "approved"
                      ? sum + Number(item.approved_amount || 0)
                      : sum,
                  0
                );

                return (
                  <tr key={idx}>
                    <td>{category}</td>
                    <td>{amt > 0 ? amt.toFixed(2) : "-"}</td>
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
              </tr>
            </tbody>
          </Table>
        </Sheet>

        {/* Submit & Back Buttons */}
        <Box mt={2} display="flex" justifyContent="center">
          <Box
            display="flex"
            justifyContent="center"
            maxWidth="400px"
            width="100%"
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/expense_dashboard")}
            >
              Back
            </Button>{" "}
            &nbsp;&nbsp;
            <Button
              variant="solid"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Submit Expense Sheet
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Expense_Form;
