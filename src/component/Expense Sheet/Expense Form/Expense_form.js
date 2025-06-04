import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Card,
  CardContent,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Textarea,
  Tooltip,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreviewOpen = () => {
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
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
    "Office Expenses",
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
    "Office Expenses":
      "Please select this head to book general office expenses unrelated to project site.",
  };

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
      console.log("userID:", userID);

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
        disbursement_date: rows[0]?.disbursement_date ?? null,

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
          formData.append("files", item.file);
        }
      });

      formData.append("data", JSON.stringify(cleanedData));
      formData.append("user_id", userID);

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

  const handleDeleteRow = (index) => {
    if (rows.length <= 1) {
      toast.warning("At least one row must remain.");
      return;
    }

    setRows((prev) => prev.filter((_, i) => i !== index));
    setSearchInputs((prev) => prev.filter((_, i) => i !== index));
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
    updatedRows[rowIndex].items[itemIndex].file = file;
    updatedRows[rowIndex].items[itemIndex].attachment_url = file.name;
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
    if (code === "Other") {
      const updated = [...rows];
      if (updated[index]?.items?.[0]) {
        updated[index].items[0] = {
          ...updated[index].items[0],
          project_id: null,
          project_code: "Other",
          project_name: "", // Allow empty so user can type
          projectSelected: true,
        };
      }

      setRows(updated);

      setSearchInputs((prev) => {
        const updatedInputs = [...prev];
        updatedInputs[index] = "Other";
        return updatedInputs;
      });

      setDropdownOpenIndex(null);
      return;
    }

    const selectedProject = projectCodes.find((p) => p.code === code);
    if (!selectedProject) return;

    const updated = [...rows];

    if (updated[index]?.items?.[0]) {
      updated[index].items[0] = {
        ...updated[index].items[0],
        project_id: selectedProject._id,
        project_code: code,
        project_name: name,
        projectSelected: true,
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
    "Project Name / Location",
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
          marginLeft: { lg: "20%", md: "0%", xl: "15%" },
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
                const searchValue = (
                  searchInputs[rowIndex] || ""
                ).toLowerCase();

                const isProjects = user?.department === "Projects";
                const isExecutive = user?.role === "executive";
                const isSurveyor = user?.role === "surveyor";

                let filteredProjects = [];

                if (isProjects) {
                  filteredProjects = projectCodes.filter((project) =>
                    (project.code || "").toLowerCase().includes(searchValue)
                  );

                  if (isSurveyor) {
                    if (
                      searchValue.includes("other") &&
                      !filteredProjects.some((p) => p.code === "Other")
                    ) {
                      filteredProjects.push({ code: "Other", name: "" });
                    }
                  }
                } else {
                  if ("other".includes(searchValue)) {
                    filteredProjects = [{ code: "Other", name: "" }];
                  }
                }

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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="danger"
                          onClick={() => handleDeleteRow(rowIndex)}
                          title="Delete Row"
                        >
                          <DeleteIcon />
                        </IconButton>

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
                      </Box>
                      {dropdownOpenIndex === rowIndex &&
                        filteredProjects.length > 0 && (
                          <Sheet
                            ref={(el) => (dropdownRefs.current[rowIndex] = el)}
                            variant="outlined"
                            sx={{
                              // position: "absolute",
                              // top: "100%",
                              // left: 0,
                              // right: 0,
                              // zIndex: 20,
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
                                  onMouseDown={() =>
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
                        placeholder="Location (if 'Other') / Project Name"
                        disabled={row.items?.[0]?.project_code !== "Other"}
                        onChange={(e) => {
                          const updated = [...rows];
                          if (updated[rowIndex]?.items?.[0]) {
                            updated[rowIndex].items[0].project_name =
                              e.target.value;
                          }
                          setRows(updated);
                        }}
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
                        placeholder="Select Expense"
                        slotProps={{
                          listbox: {
                            sx: { maxHeight: 160, overflowY: "auto" },
                          },
                        }}
                        // sx={{ width: "100%" }}
                      >
                        {categoryOptions.map((cat, idx) => (
                          <Option key={idx} value={cat}>
                            <Tooltip
                              arrow
                              placement="right"
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
                                    {categoryDescriptions[cat]}
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
                                {cat}
                              </span>
                            </Tooltip>
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
            const searchValue = (searchInputs[rowIndex] || "").toLowerCase();

            const isProjects = user?.department === "Projects";
            const isExecutive = user?.role === "executive";
            const isSurveyor = user?.role === "surveyor";

            let filteredProjects = [];

            if (isProjects) {
              filteredProjects = projectCodes.filter((project) =>
                (project.code || "").toLowerCase().includes(searchValue)
              );

              if (isSurveyor) {
                if (
                  searchValue.includes("other") &&
                  !filteredProjects.some((p) => p.code === "Other")
                ) {
                  filteredProjects.push({ code: "Other", name: "" });
                }
              }
            } else {
              if ("other".includes(searchValue)) {
                filteredProjects = [{ code: "Other", name: "" }];
              }
            }

            return (
              <Card key={rowIndex} variant="outlined" sx={{ p: 2, mt: 1 }}>
                <CardContent>
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => handleDeleteRow(rowIndex)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    title="Delete Row"
                  >
                    <DeleteIcon />
                  </IconButton>
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
                    sx={{ mb: 1, mt: 5 }}
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
                    value={
                      row.items?.[0]?.project_code === "Other"
                        ? row.items[0]?.project_name || ""
                        : row.items[0]?.project_name || ""
                    }
                    placeholder="Location (if 'Other') / Project Name"
                    disabled={row.items?.[0]?.project_code !== "Other"}
                    onChange={(e) => {
                      const updated = [...rows];
                      if (updated[rowIndex]?.items?.[0]) {
                        updated[rowIndex].items[0].project_name =
                          e.target.value;
                      }
                      setRows(updated);
                    }}
                    sx={{ mt: 1 }}
                  />

                  <Select
                    size="sm"
                    value={row.items?.[0]?.category || ""}
                    onChange={(e, value) =>
                      handleItemChange(rowIndex, "category", value)
                    }
                    placeholder="Category"
                    sx={{
                      mt: 1,
                      minWidth: 200,
                    }}
                    slotProps={{
                      listbox: {
                        sx: {
                          maxHeight: 200,
                          overflowY: "auto",
                        },
                      },
                    }}
                  >
                    {categoryOptions.map((cat, idx) => (
                      <Option key={idx} value={cat}>
                        <Tooltip
                          arrow
                          placement="left"
                          variant="soft"
                          enterTouchDelay={0}
                          leaveTouchDelay={3000}
                          title={
                            <Sheet
                              variant="soft"
                              sx={{
                                p: 1,
                                maxWidth: 260,
                                borderRadius: "md",
                                boxShadow: "md",
                                bgcolor: "background.surface",
                              }}
                            >
                              <Typography level="body-sm">
                                {categoryDescriptions[cat]}
                              </Typography>
                            </Sheet>
                          }
                        >
                          <span
                            style={{
                              cursor: "help",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "inline-block",
                              maxWidth: "100%",
                            }}
                          >
                            {cat}
                          </span>
                        </Tooltip>
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

        <Box
          mt={1}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: { md: "flex-start", xs: "center" },
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

          {/* <Button
              onClick={handleRemoveRow}
              variant="solid"
              size="sm"
              title="Remove Row"
              color="danger"
              disabled={rows.length <= 1}
            >
              -Remove Row
            </Button> */}
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
                    <td>
                      <Tooltip
                        placement="right"
                        arrow
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
                              {categoryDescriptions[category]}
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

        <Modal open={previewOpen} onClose={handlePreviewClose}>
          <ModalDialog
            size="lg"
            variant="outlined"
            sx={{
              width: {
                xs: "90vw",
                sm: "80vw",
                md: "600px",
              },
              maxHeight: "90vh",
              overflowY: "auto",
              p: 2,
            }}
          >
            <ModalClose />
            <Typography level="h5" mb={2}>
              Preview Expense Entry
            </Typography>

            <Box>
              {rows.map((row, rowIndex) => {
                const item = row.items?.[0] || {};
                return (
                  <Box
                    key={rowIndex}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Typography level="body-sm">
                      <b>Project:</b> {item.project_code} - {item.project_name}
                    </Typography>
                    <Typography level="body-sm">
                      <b>Category:</b> {item.category}
                    </Typography>
                    <Typography level="body-sm">
                      <b>Description:</b> {item.description}
                    </Typography>
                    <Typography level="body-sm">
                      <b>Date:</b> {item.expense_date}
                    </Typography>
                    <Typography level="body-sm">
                      <b>Invoice Amount:</b> ₹
                      {item.invoice?.invoice_amount || "—"}
                    </Typography>
                    <Typography level="body-sm">
                      <b>Invoice Status:</b> {item.invoice?.status || "—"}
                    </Typography>
                    {item.invoice?.status === "Yes" && (
                      <Typography level="body-sm">
                        <b>Invoice No:</b> {item.invoice?.invoice_number}
                      </Typography>
                    )}
                    <Typography level="body-sm">
                      <b>Attachment:</b>{" "}
                      {item.attachment_url ? (
                        <a
                          href={item.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ wordBreak: "break-all" }}
                        >
                          📎 {item.attachment_url}
                        </a>
                      ) : (
                        "None"
                      )}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button onClick={handlePreviewClose} variant="soft">
                Close
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        <Modal open={submitModalOpen} onClose={() => setSubmitModalOpen(false)}>
          <ModalDialog
            variant="outlined"
            size="md"
            sx={{ maxWidth: 500, p: 2 }}
          >
            <ModalClose />

            <Typography level="h5" mb={1}>
              Confirm Submission
            </Typography>

            <Typography level="body-md" mb={2}>
              Are you sure you want to submit the filled expense sheet?
              <br />
              Once submitted, changes may not be allowed.
            </Typography>

            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button variant="plain" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>

              <Button
                variant="solid"
                color="primary"
                loading={isSubmitting}
                onClick={() => {
                  setSubmitModalOpen(false);
                  handleSubmit();
                }}
              >
                Confirm & Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Submit & Back Buttons */}
        <Box mt={2} display="flex" justifyContent="center">
          <Box
            display="flex"
            justifyContent="center"
            maxWidth="400px"
            width="100%"
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/expense_dashboard")}
            >
              Back
            </Button>
            <Button variant="soft" color="primary" onClick={handlePreviewOpen}>
              Preview
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={() => setSubmitModalOpen(true)}
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
