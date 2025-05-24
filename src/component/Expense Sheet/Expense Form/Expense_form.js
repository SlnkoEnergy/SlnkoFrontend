import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import Sheet from "@mui/joy/Sheet";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAddProjectMutation, useGetProjectsQuery } from "../../../redux/projectsSlice";

const Expense_Form = () => {
  const [rows, setRows] = useState([
    {
      code: "",
      name: "",
      category: "",
      description: "",
      date: "",
      amount: "",
      file: null,
      approvalStatus: null,
      approvedAmount: "",
      rejectionComment: "",
      invoice: "",
      invoiceNumber: "",
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

  const [addExpense] = useAddProjectMutation();

  const { data: getProject = [], isLoading, error } = useGetProjectsQuery();

  console.log(getProject);
  


  useEffect(() => {
    axios
      .get("https://api.slnkoprotrac.com/v1/get-all-project-IT")
      .then((response) => {
        const data = response.data?.data;
        if (Array.isArray(data)) setProjectCodes(data);
        else setProjectCodes([]);
      })
      .catch(() => setProjectCodes([]));
  }, []);
  

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        code: "",
        name: "",
        category: "",
        description: "",
        date: "",
        amount: "",
        file: null,
        approvalStatus: null,
        approvedAmount: "",
        rejectionComment: "",
        invoice: "",
        invoiceNumber: "",
      },
    ]);
    setSearchInputs((prev) => [...prev, ""]);
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

  const handleSelectProject = (index, code, name) => {
    const updated = [...rows];
    updated[index].code = code;
    updated[index].name = name;
    setRows(updated);
    setSearchInputs((prev) => {
      const updated = [...prev];
      updated[index] = code;
      return updated;
    });
    setDropdownOpenIndex(null);
  };

  const handleApproval = (index, status) => {
    const updated = [...rows];
    updated[index].approvalStatus = status;
    if (status === "approved") {
      updated[index].approvedAmount = updated[index].amount || "";
    } else {
      setCommentDialog({ open: true, rowIndex: index });
    }
    setRows(updated);
  };

  const handleCommentSave = () => {
    setCommentDialog({ open: false, rowIndex: null });
  };

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
    const updated = rows.map((row) => ({
      ...row,
      approvalStatus: "approved",
      approvedAmount: row.amount || "",
    }));
    setRows(updated);
  };
  const showInvoiceNoColumn = rows.some(row => row.invoice === 'Yes');
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
                  project.code
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
                        value={row.category}
                        onChange={(e, value) =>
                          handleRowChange(rowIndex, "category", value)
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
                        value={row.description}
                        placeholder="Description"
                        onChange={(e) =>
                          handleRowChange(
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
                        value={row.date}
                        onChange={(e) =>
                          handleRowChange(rowIndex, "date", e.target.value)
                        }
                        sx={{ minWidth: 120 }}
                      />
                    </td>

                    {/* Bill Amount */}
                    <td style={{ padding: 8 }}>
                      <Input
                        size="sm"
                        variant="outlined"
                        type="number"
                        value={row.amount}
                        placeholder="₹"
                        onChange={(e) =>
                          handleRowChange(rowIndex, "amount", e.target.value)
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
                        {row.fileName || "Upload"}
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

                    {/* Approval */}
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
                          value={row.approvedAmount}
                          placeholder="₹"
                          onChange={(e) =>
                            handleRowChange(
                              rowIndex,
                              "approvedAmount",
                              e.target.value
                            )
                          }
                          inputProps={{ min: 0 }}
                          sx={{ minWidth: 90 }}
                        />
                      )}
                    </td>

                    {/* Invoice */}
                    <td>
                      <Select
                        value={row.invoice}
                        onChange={(e, value) =>
                          handleRowChange(rowIndex, "invoice", value)
                        }
                        placeholder="Yes/No"
                      >
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                      </Select>
                    </td>
                    {showInvoiceNoColumn && (
                      <td>
                        {row.invoice === "Yes" && (
                          <Input
                            value={row.invoiceNumber}
                            onChange={(e) =>
                              handleRowChange(
                                rowIndex,
                                "invoiceNumber",
                                e.target.value
                              )
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
          <Box mt={2} textAlign="left">
            <Button onClick={handleAddRow} variant="soft" size="sm">
              + Add Row
            </Button>
          </Box>
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
            value={rows[commentDialog.rowIndex]?.rejectionComment || ""}
            onChange={(e) =>
              handleRowChange(
                commentDialog.rowIndex,
                "rejectionComment",
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
     <Box mt={4} sx={{marginLeft:"15%"}}>
  <Typography level="h5" mb={1}>
    Expense Summary
  </Typography>

  <Sheet
    variant="outlined"
    sx={{
      borderRadius: "md",
      overflow: "auto", // Enables horizontal scroll on small screens
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
          const total = rows
            .filter((row) => row.category === category)
            .reduce((sum, row) => sum + Number(row.amount || 0), 0);

          const approvedTotal = rows
            .filter(
              (row) =>
                row.category === category && row.approvalStatus === "approved"
            )
            .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0);

          return (
            <tr key={idx}>
              <td>{category}</td>
              <td>{total > 0 ? total.toFixed(2) : "-"}</td>
              <td>{approvedTotal > 0 ? approvedTotal.toFixed(2) : "-"}</td>
            </tr>
          );
        })}
        <tr>
          <td>
            <Typography level="body-md" fontWeight="lg">
              Total
            </Typography>
          </td>
          <td>
            <Typography level="body-md" fontWeight="lg">
              {rows
                .reduce((sum, row) => sum + Number(row.amount || 0), 0)
                .toFixed(2)}
            </Typography>
          </td>
          <td>
            <Typography level="body-md" fontWeight="lg">
              {rows
                .filter((row) => row.approvalStatus === "approved")
                .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0)
                .toFixed(2)}
            </Typography>
          </td>
        </tr>
      </tbody>
    </Table>
  </Sheet>
</Box>
    </Box>
  );
};

export default Expense_Form;
