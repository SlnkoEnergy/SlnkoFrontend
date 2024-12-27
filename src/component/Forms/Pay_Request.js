import React from 'react';
import {
  CssBaseline,
  Container,
  Typography,
  Select,
  Option,
  Input,
  Button,
  Grid,
  Sheet,
} from '@mui/joy';

function PaymentRequestForm() {
  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Sheet
          sx={{
            textAlign: 'center',
            mb: 4,
            p: 2,
            borderRadius: 'md',
            boxShadow: 'sm',
            bgcolor: 'background.level1',
          }}
        >
          <Typography level="h3" sx={{ mb: 1 }}>
            Payment Request Form
          </Typography>
          <Typography level="body2">
            Please fill out the form below to submit your payment request.
          </Typography>
        </Sheet>

        {/* Form */}
        <Sheet
          sx={{
            p: 3,
            borderRadius: 'md',
            boxShadow: 'sm',
            bgcolor: 'background.level1',
          }}
        >
          <Grid container spacing={2}>
            {/* Project ID & Name */}
            <Grid xs={12} sm={6}>
              <Select placeholder="Project ID" required>
                <Option value="1">Project 1</Option>
                <Option value="2">Project 2</Option>
              </Select>
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Project Name" required />
            </Grid>

            {/* Client & Group Name */}
            <Grid xs={12} sm={6}>
              <Input placeholder="Client Name" required />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Group Name" required />
            </Grid>

            {/* Payment ID & Type */}
            <Grid xs={12} sm={4}>
              <Input placeholder="Payment ID" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Select placeholder="Payment Type" required>
                <Option value="against_po">Payment Against PO</Option>
                <Option value="adjustment">Adjustment</Option>
              </Select>
            </Grid>
            <Grid xs={12} sm={4}>
              <Select placeholder="PO Number" required>
                <Option value="PO1">PO1</Option>
                <Option value="PO2">PO2</Option>
              </Select>
            </Grid>

            {/* Amount & Date */}
            <Grid xs={12} sm={4}>
              <Input type="number" placeholder="Amount Requested (INR)" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input type="number" placeholder="Amount for Customers (INR)" />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input type="date" placeholder="Request Date" required />
            </Grid>

            {/* Requested For, Vendor/Credited to, Payment Description */}
            <Grid xs={12} sm={4}>
              <Input placeholder="Requested For" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input placeholder="Vendor/Credited to" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input placeholder="Payment Description" required />
            </Grid>

            {/* PO Value, Total Advance Paid, Current PO Balance */}
            <Grid xs={12} sm={4}>
              <Input placeholder="PO Value" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input placeholder="Total Advance Paid" required />
            </Grid>
            <Grid xs={12} sm={4}>
              <Input placeholder="Current PO Balance" required />
            </Grid>

            {/* Beneficiary Details */}
            <Grid xs={12}>
              <Typography level="h6" sx={{ mt: 2, mb: 1 }}>
                Beneficiary Details
              </Typography>
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Beneficiary Name" required />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Beneficiary Account Number" required />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Beneficiary IFSC Code" required />
            </Grid>
            <Grid xs={12} sm={6}>
              <Input placeholder="Bank Name" required />
            </Grid>
          </Grid>

          {/* Submission Buttons */}
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Grid>
              <Button variant="solid" color="primary">
                Submit
              </Button>
            </Grid>
            <Grid>
              <Button variant="outlined" color="neutral">
                StandBy
              </Button>
            </Grid>
            <Grid>
              <Button variant="outlined" color="neutral">
                Back
              </Button>
            </Grid>
          </Grid>
        </Sheet>
      </Container>
    </CssBaseline>
  );
}

export default PaymentRequestForm;