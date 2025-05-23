import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';

const Expense_Form = () => {
  const [rows, setRows] = useState([
    {
      code: '',
      name: '',
      category: '',
      description: '',
      date: '',
      amount: '',
      file: null,
      approvalStatus: null,
      approvedAmount: '',
      rejectionComment: '',
      invoice: '',
      invoiceNumber: ''
    }
  ]);

  const [projectCodes, setProjectCodes] = useState([]);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [searchInputs, setSearchInputs] = useState(['']);
  const [commentDialog, setCommentDialog] = useState({ open: false, rowIndex: null });

  const inputRefs = useRef([]);

  const categoryOptions = [
    'Travelling Expenses',
    'Lodging',
    'Meal Expenses',
    'Project Expenses',
    'Repair and Maintenance',
    'Telephone Expenses',
    'Courier Charges(porter)',
    'Staff welfare expenses',
    'Medical Expenses',
    'Printing and stationary',
    'Office expenses',
  ];

  useEffect(() => {
    axios.get('https://api.slnkoprotrac.com/v1/get-all-project-IT')
      .then(response => {
        const data = response.data?.data;
        if (Array.isArray(data)) setProjectCodes(data);
        else setProjectCodes([]);
      })
      .catch(() => setProjectCodes([]));
  }, []);

  const handleAddRow = () => {
    setRows(prev => [...prev, {
      code: '', name: '', category: '', description: '', date: '', amount: '',
      file: null, approvalStatus: null, approvedAmount: '', rejectionComment: '', invoice: '', invoiceNumber: ''
    }]);
    setSearchInputs(prev => [...prev, '']);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    if (field === 'code') {
      const selected = projectCodes.find(p => p.code === value);
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
    setSearchInputs(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setDropdownOpenIndex(index);
    handleRowChange(index, 'code', value);
  };

  const handleSelectProject = (index, code, name) => {
    const updated = [...rows];
    updated[index].code = code;
    updated[index].name = name;
    setRows(updated);
    setSearchInputs(prev => {
      const updated = [...prev];
      updated[index] = code;
      return updated;
    });
    setDropdownOpenIndex(null);
  };

  const handleApproval = (index, status) => {
    const updated = [...rows];
    updated[index].approvalStatus = status;
    if (status === 'approved') {
      updated[index].approvedAmount = updated[index].amount || '';
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
      approvalStatus: 'rejected',
      rejectionComment: ''
    }));
    setRows(updated);
    setCommentDialog({ open: true, rowIndex: 0 });
  };

  const handleApproveAll = () => {
    const updated = rows.map(row => ({
      ...row,
      approvalStatus: 'approved',
      approvedAmount: row.amount || ''
    }));
    setRows(updated);
  };

  return (
    <Box p={2}>
      <Typography level="h4" mb={2}>Expense Sheet</Typography>

      <Box display="flex" gap={2} mb={2}>
        <Button color="success" onClick={handleApproveAll}>Approve All</Button>
        <Button color="danger" onClick={handleRejectAll}>Reject All</Button>
      </Box>

      <Table variant="outlined" borderAxis="both">
        <thead>
          <tr>
            <th>Project Code</th>
            <th>Project Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Bill Amount</th>
            <th>Attachment</th>
            <th>Approval</th>
            <th>Approved Amt</th>
            <th>Invoice</th>
            <th>Invoice No</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const filteredProjects = projectCodes.filter(project =>
              project.code.toLowerCase().includes(searchInputs[rowIndex]?.toLowerCase() || '')
            );

            return (
              <tr key={rowIndex}>
                <td style={{ position: 'relative' }}>
                  <Input
                    value={searchInputs[rowIndex] || ''}
                    placeholder="Search Project Code"
                    onChange={(e) => handleSearchInputChange(rowIndex, e.target.value)}
                    onFocus={() => setDropdownOpenIndex(rowIndex)}
                    ref={(el) => inputRefs.current[rowIndex] = el}
                  />
                  {dropdownOpenIndex === rowIndex && filteredProjects.length > 0 && (
                    <Sheet
                      variant="outlined"
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        maxHeight: 200,
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        borderRadius: 'sm',
                        boxShadow: 'md',
                      }}
                    >
                      <List size="sm" sx={{ p: 0 }}>
                        {filteredProjects.map((project, i) => (
                          <ListItem
                            key={i}
                            onClick={() => handleSelectProject(rowIndex, project.code, project.name)}
                            sx={{ cursor: 'pointer', px: 2, py: 1, '&:hover': { bgcolor: 'neutral.softBg' } }}
                          >
                            {project.code} - {project.name}
                          </ListItem>
                        ))}
                      </List>
                    </Sheet>
                  )}
                </td>
                <td>
                  <Input value={row.name} disabled placeholder="Project Name" />
                </td>
                <td>
                  <Select
                    value={row.category}
                    onChange={(e, value) => handleRowChange(rowIndex, 'category', value)}
                    placeholder="Select"
                  >
                    {categoryOptions.map((cat, idx) => (
                      <Option key={idx} value={cat}>{cat}</Option>
                    ))}
                  </Select>
                </td>
                <td>
                  <Input
                    value={row.description}
                    onChange={(e) => handleRowChange(rowIndex, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </td>
                <td>
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleRowChange(rowIndex, 'date', e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={row.amount}
                    onChange={(e) => handleRowChange(rowIndex, 'amount', e.target.value)}
                    placeholder="₹"
                  />
                </td>
                <td>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(rowIndex, e.target.files[0])}
                  />
                </td>
                <td>
                  <Box display="flex" gap={1}>
                    <Button size="sm" onClick={() => handleApproval(rowIndex, 'approved')}>✅</Button>
                    <Button size="sm" color="danger" onClick={() => handleApproval(rowIndex, 'rejected')}>❌</Button>
                  </Box>
                </td>
                <td>
                  {row.approvalStatus === 'approved' && (
                    <Input
                      type="number"
                      value={row.approvedAmount}
                      onChange={(e) => handleRowChange(rowIndex, 'approvedAmount', e.target.value)}
                      placeholder="₹"
                    />
                  )}
                </td>
                <td>
                  <Select
                    value={row.invoice}
                    onChange={(e, value) => handleRowChange(rowIndex, 'invoice', value)}
                    placeholder="Yes/No"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </td>
                <td>
                  {row.invoice === 'Yes' && (
                    <Input
                      value={row.invoiceNumber}
                      onChange={(e) => handleRowChange(rowIndex, 'invoiceNumber', e.target.value)}
                      placeholder="Invoice No."
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Button onClick={handleAddRow} sx={{ mt: 2 }}>
        Add Row
      </Button>

      {/* Joy UI Modal for Comment */}
      <Modal open={commentDialog.open} onClose={() => setCommentDialog({ open: false, rowIndex: null })}>
        <ModalDialog>
          <Typography level="h6">Rejection Comment</Typography>
          <Input
            minRows={2}
            placeholder="Enter comment"
            value={rows[commentDialog.rowIndex]?.rejectionComment || ''}
            onChange={(e) =>
              handleRowChange(commentDialog.rowIndex, 'rejectionComment', e.target.value)
            }
            sx={{ mt: 1 }}
          />
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button onClick={handleCommentSave}>Save</Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Summary */}
     <Box mt={4}>
  <Typography level="h5" mb={1}>Expense Summary</Typography>
  <Table variant="soft" borderAxis="both" size="sm">
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
          .filter(row => row.category === category)
          .reduce((sum, row) => sum + Number(row.amount || 0), 0);

        const approvedTotal = rows
          .filter(row => row.category === category && row.approvalStatus === 'approved')
          .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0);

        return (
          <tr key={idx}>
            <td>{category}</td>
            <td>{total > 0 ? total.toFixed(2) : '-'}</td>
            <td>{approvedTotal > 0 ? approvedTotal.toFixed(2) : '-'}</td>
          </tr>
        );
      })}
      <tr>
        <td><strong>Total</strong></td>
        <td>
          <strong>
            {rows.reduce((sum, row) => sum + Number(row.amount || 0), 0).toFixed(2)}
          </strong>
        </td>
        <td>
          <strong>
            {rows
              .filter(row => row.approvalStatus === 'approved')
              .reduce((sum, row) => sum + Number(row.approvedAmount || 0), 0)
              .toFixed(2)}
          </strong>
        </td>
      </tr>
    </tbody>
  </Table>
</Box>

    </Box>
  );
};

export default Expense_Form;
