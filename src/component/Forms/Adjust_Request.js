import {
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Grid,
  Input,
  Sheet,
  Typography
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import Img9 from "../../assets/solar.png";
import Axios from "../../utils/Axios";

function AdjustmentRequestForm() {
  const navigate = useNavigate();
  const [getFormData, setGetFormData] = useState({
    projectIDs: [],
    poNumbers: [],
    vendors: [],
    pays: []
  });

  const [user, setUser] = useState(null);
    
      
  //    useEffect(() => {
  //     const userData = getUserData();
  //     setUser(userData);
  //   }, []);
    
  //   const getUserData = () => {
  //     const userData = localStorage.getItem("userDetails");
  //     if (userData) {
  //       return JSON.parse(userData);
  //     }
  //     return null;
  //   };


  const [formData, setFormData] = useState({
    p_id: "",
    name: "",
    customer: "",
    p_group: "",
    pay_type: "",
    po_number: "",
    amt_for_customer: "",
    dbt_date: "",
    adj_date:"",
    paid_for: "",
    vendor: "",
    comment: "",
    remark:"",
    po_value: "",
    amount_paid: "",
    po_balance: "",
    total_advance_paid:"",
    submitted_by:""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, poNumbersResponse, vendorsResponse, payResponse] = await Promise.all([
          Axios.get("/get-all-projecT-IT"),
          Axios.get("/get-all-pO-IT"),
          Axios.get("/get-all-vendoR-IT"),
          Axios.get("/get-pay-summarY-IT"),
          
        ]);

        setGetFormData({
          projectIDs: projectsResponse.data.data || [],
          poNumbers: poNumbersResponse.data.data || [],
          vendors: vendorsResponse.data.data || [],
          pays: payResponse.data.data || [],
        });

        // console.log("Fetched all data:", {
        //   projectIDs: projectsResponse.data.data,
        //   poNumbers: poNumbersResponse.data.data,
        //   vendors: vendorsResponse.data.data,
        // });
      } catch (error) {
        console.error("Error fetching data with Promise.all:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e)  => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pay_type") {
      if (value === "Adjustment") {
        setFormData((prev) => ({
          ...prev,
          paid_for: "Customer Adjustment",
          po_number: "N/A",
          po_value: "N/A",
          total_advance_paid: "N/A",
          po_balance: "N/A",
          amt_for_customer: "",
          amount_paid:"",
          benificiary: "",
          acc_number: "",
          ifsc: "",
          branch: "",
        }));
      } else if (value === "Slnko Service Charge") {
        setFormData((prev) => ({
          ...prev,
          paid_for: "Slnko Service Charge",
          benificiary: "Slnko Energy PVT LTD",
          acc_number: "N/A",
          ifsc: "N/A",
          branch: "N/A",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          paid_for: "",
          benificiary: "",
          acc_number: "",
          ifsc: "",
          branch: "",
        }));
      }
    }

    // if (name === "amount_paid") {
    //   const amount_paid = parseFloat(value);
    //   const po_value = parseFloat(formData.po_value);

    //   if (amount_paid > po_value) {
    //     alert("Amount Requested is greater than PO value!");
    //     setFormData((prev) => ({
    //       ...prev,
    //       amount_paid: po_value,
    //     }));
    //   }
    // }

    if (name === "p_id" && value) {
      const selectedProject = getFormData.projectIDs.find(
        (project) => project.p_id === value
      );
    
      if (selectedProject) {
        console.log("Selected project:", selectedProject);
        setFormData((prev) => ( {
          ...prev,
          name: selectedProject.name || "",
          customer: selectedProject.customer || "",
          p_group: selectedProject.p_group || "",
        }));
      } else {
        console.warn("No project found for projectID:", value);
      }
    }
  };

  const handleSelectChange = (selectedOption: { value: string; label: string }) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        p_id: selectedOption.value,
        name: selectedOption.label,
      }));
    }
  };

  const handlePoChange = (selectedOption: { value: string; label: string }) => {
    const selectedPo = getFormData.poNumbers.find(
      (po) => po.po_number === selectedOption?.value
    );
  
    if (!selectedPo) {
      // console.warn("PO number not found in the list:", selectedOption?.value);
      return;
    }
  
    const poValue = parseFloat(selectedPo.po_value ?? "0");
  
    const totalAdvancePaid = getFormData.pays
    .filter((pay) => pay.po_number === selectedPo.po_number && pay.approved === "Approved" && pay.acc_match === "matched" && pay.utr )
    .reduce((sum, pay) => sum + parseFloat(pay.amount_paid ?? "0"), 0); 
    
    const po_balance = poValue - totalAdvancePaid;
  
    setFormData((prev) => ({
      ...prev,
      po_number: selectedPo.po_number,
      paid_for: selectedPo.item ?? "",
      vendor: selectedPo.vendor ?? "",
      po_value: poValue.toString(),
      amount_paid: totalAdvancePaid.toString(),
      po_balance: po_balance.toString(),
    }));
  
    const matchingProject = getFormData.projectIDs.find(
      (project) => project.code === selectedPo.p_id
    );
  
    if (matchingProject) {
      // console.log("Matched Project details from PO p_id:", matchingProject);
      setFormData((prev) => ({
        ...prev,
        p_id: matchingProject.p_id ?? "",
        projectID: matchingProject.code ?? "",
        name: matchingProject.name ?? "",
        customer: matchingProject.customer ?? "",
        p_group: matchingProject.p_group ?? "",
      }));
    } else {
      console.warn("No matching project found for p_id:", selectedPo.p_id);
    }
  
    if (selectedPo.vendor) {
      const matchedVendor = getFormData.vendors.find(
        (vendor) => vendor.name === selectedPo.vendor
      );
  
      if (matchedVendor) {
        console.log("Matched Vendor:", matchedVendor);
        setFormData((prev) => ({
          ...prev,
          benificiary: matchedVendor.name ?? "",
          acc_number: matchedVendor.Account_No ?? "",
          ifsc: matchedVendor.IFSC_Code ?? "",
          branch: matchedVendor.Bank_Name ?? "",
        }));
      } else {
        console.warn("No matching vendor found for:", selectedPo.vendor);
      }
    }
  };
  
  
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        submitted_by: userData.name || "",
      }));
    }
  }, []);
  
  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    // console.log("Form data submitted:", formData);

    try {
      const response = await Axios.post("/add-adjustment-request", {
        ...formData,
        p_id: formData?.p_id, 
        submitted_by: user?.name || getUserData()?.name || "",
      });
      const { message } = response.data;

    setResponseMessage(message);
    toast.success("Amount Adjusted Successfully ", response.data);

    //   console.log("Payment request are", response.data);
      navigate("/project-balance");
    } catch (error) {
          console.error(
            "Error submitting in amount adjustment:",
            error.response?.data || error.message
          );
          setResponseMessage("Failed to  adjusted amount. Please try again!!");
    
          toast.error("Something Went Wrong?");
        } finally {
          setIsLoading(false);
        }
  };


  


  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Sheet
          sx={{
            p: 3,
            borderRadius: "md",
            boxShadow: "sm",
            bgcolor: "background.level1",
          }}
        >
          <Box textAlign="center" sx={{ mb: 4 }}>
            <img
              src={Img9}
              alt="Logo"
              style={{
                height: "50px",
                marginBottom: "10px",
                maxWidth: "100%",
              }}
            />

            <Typography level="h4" fontWeight="bold" color="warning">
              Adjustment Request Form
            </Typography>
            <Divider inset="none" sx={{ width: "50%", margin: "8px auto" }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
    Projects: 
    </Typography>
    {/* <Select
  name="p_id"
  value={formData.p_id
    ? {
        label: getFormData.projectIDs.find((project) => project.p_id === formData.p_id)?.code,
        value: formData.p_id,
      }
    : null
  }
  onChange={(e) =>
    handleChange({
      target: {
        name: "p_id",
        value: e?.value,
      },
    })
  }
  options={getFormData.projectIDs.map((project) => ({
    label: project.code,
    value: project.p_id,
  }))}
  placeholder="Select Project"
  isDisabled={formData.pay_type === "Payment Against PO" && formData.po_number} // Disable when both conditions are met
/> */}

       {formData.pay_type === "Payment Against PO" && formData.po_number ? (
    // Readonly Input when Payment Against PO is selected
    <Input
      name="p_id"
      value={
        getFormData.projectIDs.find((project) => project.p_id === formData.p_id)?.code || ""
      }
      placeholder="Project Code"
      readOnly
    />
  ) : (
    // Select dropdown for other payment types
    <Select
      name="p_id"
      value={
        formData.p_id
          ? {
              label: getFormData.projectIDs.find((project) => project.p_id === formData.p_id)?.code,
              value: formData.p_id,
            }
          : null
      }
      onChange={(e) =>
        handleChange({
          target: {
            name: "p_id",
            value: e?.value,
          },
        })
      }
      options={getFormData.projectIDs.map((project) => ({
        label: project.code,
        value: project.p_id,
      }))}
      placeholder="Select Project"
    />
  )}   
{/* <Input
                  name="projectID"
                  value={formData.projectID || ""}
                  onChange={handleChange}
                  placeholder="Project ID"
                  required
                  readOnly
                /> */}

              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
      Project Name
    </Typography>
                <Input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Project Name"
                  required
                  readOnly
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
      Client Name 
    </Typography>
                <Input
                  name="customer"
                  value={formData.customer || ""}
                  onChange={handleChange}
                  placeholder="Client Name"
                  required
                  readOnly
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
      Group Name
    </Typography>
                <Input
                  name="p_group"
                  value={formData.p_group || ""}
                  onChange={handleChange}
                  placeholder="Group Name"
                  readOnly
                  
                />
              </Grid>

              {/* <Grid xs={12} sm={4}>
                <Input
                  name="pay_id"
                  value={formData.pay_id}
                  onChange={handleChange}
                  placeholder="Payment ID"
                  required
                />
              </Grid> */}

<Grid xs={12} sm={4}>
  <Typography level="body2" fontWeight="bold">
    Payment Type
  </Typography>
  <Select
    name="pay_type"
    value={
      formData.pay_type
        ? { label: formData.pay_type, value: formData.pay_type }
        : null
    }
    onChange={(selectedOption) =>
      handleChange({ target: { name: "pay_type", value: selectedOption.value } })
    }
    options={[
      { label: "Payment Against PO", value: "Payment Against PO" },
      { label: "Adjustment", value: "Adjustment" },
      { label: "Slnko Service Charge", value: "Slnko Service Charge" },
      { label: "Credit Note (CN)", value: "CN" },
    ]}
    placeholder="Payment Type"
    required
  />
</Grid>

{formData.pay_type !== "CN" && (
  <Grid xs={12} sm={4}>
    <Typography level="body2" fontWeight="bold">
      PO Number
    </Typography>
    <Select
      name="po_number"
      value={
        formData.po_number
          ? { label: formData.po_number, value: formData.po_number }
          : null
      }
      onChange={handlePoChange}
      options={getFormData.poNumbers.map((po) => ({
        value: po.po_number,
        label: po.po_number,
      }))}
      placeholder="PO Number"
      isDisabled={formData.pay_type === "Adjustment"}
    />
  </Grid>
)}

{formData.pay_type === "CN" && (
  <Grid xs={12} sm={4}>
    <Typography level="body2" fontWeight="bold">
      Reason:
    </Typography>
    <Input
      type="text"
      name="remark"
      value={formData.remark || ""}
      onChange={handleChange}
      placeholder="Enter Reason"
      required
    //   style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
    />
  </Grid>
)}



<Grid xs={12} sm={4}>
  <Typography level="body2" fontWeight="bold">
    Adjustment Type
  </Typography>
  <Select
    name="adjustment_type"
    value={
      formData.adj_type
        ? { label: formData.adj_type, value: formData.adj_type }
        : null
    }
    onChange={(selectedOption) =>
      setFormData((prev) => ({
        ...prev,
        adj_type: selectedOption.value,
      }))
    }
    options={[
      { label: "Add", value: "Add" },
      { label: "Subtract", value: "Subtract" },
    ]}
    placeholder="Select Adjustment Type"
    required
  />
</Grid>

<Grid xs={12} sm={4}>
  <Typography level="body2" fontWeight="bold">
    Adjustment Amount (INR)
  </Typography>
  <Input
    type="text"
    value={formData.adj_amount}
    onChange={(e) => {
      let value = parseFloat(e.target.value);
      const po_balance =
        formData.po_balance === "N/A"
          ? Infinity
          : parseFloat(formData.po_balance) || 0;

      // Handle empty or invalid input
      if (isNaN(value)) {
        setFormData((prev) => ({ ...prev, adj_amount: "" }));
        return;
      }

      // Force negative if Subtract
      if (formData.adj_type === "Subtract" && value > 0) {
        value = -value;
      }

      // Force positive if Add
      if (formData.adj_type === "Add" && value < 0) {
        value = Math.abs(value);
      }

     

      setFormData((prev) => ({
        ...prev,
        adj_amount: value,
      }));
    }}
    placeholder="Amount Requested (INR)"
    required
  />
</Grid>


              {/* <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
      Adjusment Amount (INR)
    </Typography>
              <Input
  type="text"
  value={formData.amount_paid}
  onChange={(e) => {
    const value = parseFloat(e.target.value) || "";
    const po_balance = formData.po_balance === "N/A" ? Infinity : parseFloat(formData.po_balance) || 0;


    if (po_balance !== Infinity && value > po_balance) {
      toast.warning("Amount Requested can't be greater than PO Balance!");
      setFormData((prev) => ({
        ...prev,
        amount_paid: po_balance,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amount_paid: value,
      }));
    }
  }}
  placeholder="Amount Requested (INR)"
  required
/>

              </Grid> */}

             {/* <Grid xs={12} sm={4}>
  <Typography level="body2" fontWeight="bold">
    Amount for Customers
  </Typography>
  <Input
    type="text"
    name="amt_for_customer"
    value={formData.amt_for_customer || ""}
    onChange={(e) => {
      const value = parseFloat(e.target.value) || 0;
      const amountRequested = parseFloat(formData.amount_paid) || 0;

      if (value > amountRequested) {
        toast.warning("Amount for Customers can't be greater than Amount Requested!");
        setFormData((prev) => ({
          ...prev,
          amt_for_customer: amountRequested,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          amt_for_customer: value,
        }));
      }
    }}
    placeholder="Amount for Customers (INR)"
    required
  />
</Grid> */}


              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Adjusted Date
    </Typography>
                <Input
                  type="date"
                  name="adj_date"
                  value={formData.adj_date}
                  onChange={handleChange}
                  placeholder="Adjust Date"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Adjusted For
    </Typography>
              <Input
    name="paid_for"
    value={formData.item ||formData.paid_for }
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        paid_for: e.target.value, 
      }))
    }
    placeholder="Requested For"
    required
  />
              </Grid>

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Vendor
    </Typography>
                <Input
                  name="vendor"
                  value={formData.vendor || ""}
                  onChange={handleChange}
                  placeholder="Vendor/Credited to"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Adjustment Description
    </Typography>
                <Input
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Adjustment Description"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              PO Value (with GST)
    </Typography>
                <Input
                  name="po_value"
                  value={formData.po_value || ""}
                  onChange={handleChange}
                  placeholder="PO Value"
                  required
                />
              </Grid>

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Total Advance Paid
    </Typography>
                <Input
                  name="amount_paid"
                  value={formData.amount_paid}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      amount_paid: e.target.value, 
    }))
  }
  placeholder="Total Advance Paid"
  readOnly
                />
              </Grid>

              {/* <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
      Amount Requested (INR)
    </Typography>
              <Input
  type="text"
  value={formData.amount_paid}
  onChange={(e) => {
    const value = parseFloat(e.target.value) || "";
    const po_balance = formData.po_balance === "N/A" ? Infinity : parseFloat(formData.po_balance) || 0;


    if (po_balance !== Infinity && value > po_balance) {
      toast.warning("Amount Requested can't be greater than PO Balance!");
      setFormData((prev) => ({
        ...prev,
        amount_paid: po_balance,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amount_paid: value,
      }));
    }
  }}
  placeholder="Amount Requested (INR)"
  required
/>

              </Grid> */}

              <Grid xs={12} sm={4}>
              <Typography level="body2" fontWeight="bold">
              Current PO Balance
    </Typography>
                <Input
                  name="po_balance"
                  value={formData.po_balance || ""}
                  onChange={handleChange}
                  placeholder="Current PO Balance"
                  required
                />
              </Grid>
              
              {/* <Grid xs={12}>
                <Typography level="h6" fontWeight="bold" sx={{ mt: 1 }}>
                  Beneficiary Details
                </Typography>
              </Grid>

              <Grid xs={12} sm={12}>
                <Input
                defaultValue={"Account Transfer"}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
              Beneficiary Name
    </Typography>
                <Input
                  name="benificiary"
                  value={formData.benificiary || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary Name"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
              Beneficiary Account Number
    </Typography>
                <Input
                  name="acc_number"
                  value={formData.acc_number || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary Account Number"
                  required
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
              Beneficiary IFSC Code
    </Typography>
                <Input
                  name="ifsc"
                  value={formData.ifsc || ""}
                  onChange={handleChange}
                  placeholder="Beneficiary IFSC Code"
                />
              </Grid>

              <Grid xs={12} sm={6}>
              <Typography level="body2" fontWeight="bold">
              Bank Name
    </Typography>
                <Input
                  name="branch"
                  value={formData.branch || ""}
                  onChange={handleChange}
                  placeholder="Bank Name"
                  required
                />
              </Grid> */}
            </Grid>

            <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Grid>
                <Button type="submit" variant="solid" color="primary">
                  Submit
                </Button>
              </Grid>

              <Grid>
                {/* <Button
  variant="outlined"
  color="neutral"
  onClick={handleHoldPayment}
  sx={{
    '&:hover': {
      backgroundColor: 'red',
      borderColor: 'red',      
      color: 'white'           
    }
  }}
>
  StandBy
</Button> */}

              </Grid>

              <Grid>
                <Button variant="outlined" color="neutral" onClick={() => navigate("/project-balance")}>
                  Back
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Sheet>
      </Container>
    </CssBaseline>
  );
}

export default AdjustmentRequestForm;