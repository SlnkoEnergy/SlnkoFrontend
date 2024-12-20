import React from 'react';
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  styled,
  Button,
  Grid,
} from '@mui/material';
import Img4 from '../../assets/pay-request.png';
import Img5 from '../../assets/solar-body.png';


const StyledContainer = styled(Container)({
  position: 'relative',
  height: '100%',
  width: '100%',
  // background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/img/solar-body.png)',
  backgroundSize: 'cover',
  Position: 'center',
});

const StyledForm = styled(Box)({
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  padding: '20px',
  borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  margin: 'auto',
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '10px 20px',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  color: '#fff',
}));

const BackButton = styled(StyledButton)({
  backgroundColor: '#6f7580',
  '&:hover': { backgroundColor: 'lightsteelblue' },
});

const StandbyButton = styled(StyledButton)({
  backgroundColor: '#CF6C53',
  '&:hover': { backgroundColor: '#DE3A11' },
});

const ImageContainer = styled(Box)({
  padding: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px solid #5791ff',
  backgroundColor: '#f9f9f9',
  borderRadius: '50%',
  maxWidth: '90px',
  margin: 'auto',
});

function PaymentRequestForm() {
  return (
    
    <Container maxWidth="xxl" style={{padding:'0px',display:"flex"}}>
      {/* Header */}
      <div style={{width:"100%",height:"100vh"}}>
      <img src={Img5} style={{height:"100%", width:"100%", backgroundSize: 'auto',backgroundPosition: 'center',backgroundRepeat: 'repeat',}}/>
      </div>
      <div style={{position:"absolute",display:"flex",flexDirection:"column",}}>
      <ImageContainer>
        <img src={Img4} alt="logo-icon" style={{ maxWidth: '100px' }} />
        </ImageContainer>
        <Typography variant="h4" align="center" gutterBottom>
          Payment Request Form
        </Typography>
        <hr style={{ width: '50%', backgroundColor: 'darkgoldenrod', margin: 'auto' }} />
      </div>

      {/* Form */}
      
      <StyledForm style={{position:"absolute",height:"1200px",width:"1200px",left:"20%"}}>
      {/* <StyledContainer> */}
        {/* Project ID & Name */}
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="project-id-label">Project ID</InputLabel>
              <Select labelId="project-id-label" id="pro_id" name="pro_id" defaultValue="">
                <MenuItem value="" disabled>
                  Select Project ID
                </MenuItem>
                {/* Replace this with dynamic options */}
                <MenuItem value="1">Project 1</MenuItem>
                <MenuItem value="2">Project 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="project-name"
              name="project_name"
              label="Project Name"
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Client & Group Name */}
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="client-name"
              name="client_name"
              label="Client Name"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="group-name"
              name="group_name"
              label="Group Name"
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Payment ID & Type */}
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="pay_id"
              name="pay_id"
              label="Payment ID"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="payment-type-label">Payment Type</InputLabel>
              <Select
                labelId="payment-type-label"
                id="payment_type"
                name="pay_type"
                defaultValue=""
                required
              >
                <MenuItem value="" disabled>
                  Choose Type
                </MenuItem>
                <MenuItem value="against po">Payment Against PO</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="po-number-label">PO Number</InputLabel>
              <Select
                labelId="po-number-label"
                id="po_number"
                name="po_number"
                defaultValue=""
                required
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                {/* Replace this with dynamic options */}
                <MenuItem value="PO1">PO1</MenuItem>
                <MenuItem value="PO2">PO2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Amount & Date */}
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="amount-requested"
              name="amt_paid"
              label="Amount Requested (INR)"
              type="number"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="amount-for-customers"
              name="amt_for_customer"
              label="Amount for Customers (INR)"
              type="number"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="request-date"
              name="date"
              label="Request Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              required
            />
          </Grid>
        </Grid>

         {/* Requested For, Vendor/Credited to, Payment Description */}
         <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="requested_for"
              name="requested_for"
              label="Requested For"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <TextField
              fullWidth
              id="vendor_redited_to"
              name="vendor_redited_to"
              label="Vendor/Credited to"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <TextField
              fullWidth
              id="payment_description"
              name="payment_description"
              label="Payment Description"
              variant="outlined"
              required
            />
          </Grid>
        </Grid>

        {/* PO Value ( with GST), Total Advance Paid, Current PO Balance */}
        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="po_value"
              name="po_value"
              label="PO Value"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <TextField
              fullWidth
              id="total_advance_paid"
              name="total_advance_paid"
              label="Total Advance Paid"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          <TextField
              fullWidth
              id="payment_description"
              name="current_po_balance"
              label="Current PO Balance"
              variant="outlined"
              required
            />
          </Grid>
        </Grid>

        {/* Beneficiary Details */}
        <Typography variant="h6" marginTop={4} gutterBottom>
          Beneficiary Details
        </Typography>
        <Grid container spacing={2}>
  {/* Payment Mode */}
  <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "left", sm: "right" }, alignItems: "center" }}>
    <Typography>Payment Mode</Typography>
    <span style={{ color: "red" }}>*</span>
  </Grid>
  <Grid item xs={12} sm={8}>
    <TextField
      fullWidth
      id="payment-mode"
      name="payment-mode"
      label="Account Transfer"
      variant="outlined"
      disabled
    />
  </Grid>

  {/* Beneficiary Name */}
  <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "left", sm: "right" }, alignItems: "center" }}>
    <Typography>Beneficiary Name</Typography>
    <span style={{ color: "red" }}>*</span>
  </Grid>
  <Grid item xs={12} sm={8}>
    <TextField
      fullWidth
      id="beneficiary-name"
      name="beneficiary-name"
      label="Beneficiary Name"
      variant="outlined"
    />
  </Grid>

  {/* Beneficiary Account Number */}
  <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "left", sm: "right" }, alignItems: "center" }}>
    <Typography>Beneficiary Account Number</Typography>
    <span style={{ color: "red" }}>*</span>
  </Grid>
  <Grid item xs={12} sm={8}>
    <TextField
      fullWidth
      id="beneficiary-account-number"
      name="credit_acc_number"
      label="Beneficiary Account Number"
      variant="outlined"
    />
  </Grid>

  {/* Beneficiary IFSC Code */}
  <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "left", sm: "right" }, alignItems: "center" }}>
    <Typography>Beneficiary IFSC Code</Typography>
    <span style={{ color: "red" }}>*</span>
  </Grid>
  <Grid item xs={12} sm={8}>
    <TextField
      fullWidth
      id="beneficiary-ifsc-code"
      name="beneficiary-ifsc-code"
      label="Beneficiary IFSC Code"
      variant="outlined"
    />
  </Grid>

  {/* Bank Name */}
  <Grid item xs={12} sm={4} sx={{ display: "flex", justifyContent: { xs: "left", sm: "right" }, alignItems: "center" }}>
    <Typography>Bank Name</Typography>
    <span style={{ color: "red" }}>*</span>
  </Grid>
  <Grid item xs={12} sm={8}>
    <TextField
      fullWidth
      id="bank-name"
      name="bank-name"
      label="Bank Name"
      variant="outlined"
    />
  </Grid>
</Grid>


        {/* Submission Buttons */}
        <Grid container spacing={2} marginTop={3} marginBottom={3} justifyContent="center">
        <Grid item>
            <StyledButton variant="contained" color="primary" type="submit">
              Submit
            </StyledButton>
          </Grid>
          <Grid item>
            <StandbyButton variant="outlined">StandBy</StandbyButton>
          </Grid>
          <Grid item>
            <BackButton variant="outlined">Back</BackButton>
          </Grid>

        </Grid>
        {/* </StyledContainer> */}
        </StyledForm>
    </Container>
   
  );
}

export default PaymentRequestForm;