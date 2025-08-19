import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  FormControl,
  FormLabel,
  Button,
  Textarea,
  Card,
  Divider,
  Sheet,
  Chip,
} from "@mui/joy";
import { toast } from "react-toastify";
import { useAddLogisticMutation } from "../../redux/purchasesSlice";
const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  _selected: false, 
  productId: "",
  productName: "",
  productCategoryId: "",
  productCategoryName: "",
  make: "",
  uom: "",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  note: "",
});
const AddLogisticForm = () => {
  const [formData, setFormData] = useState({
    po_id: "",
    project_code: "",
    vendor: "",
    vehicle_number: "",
    driver_number: "",
    total_ton: "",
    attachment_url: "",
    remarks: "",
  });

  const [items, setItems] = useState([
    {
      category_id: "",
      product_name: "",
      product_make: "",
      quantity_requested: "",
      quantity_loaded: "",
      quantity_received: "",
      ton: "",
    },
  ]);

  const [addLogistic, { isLoading }] = useAddLogisticMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      attachment_url: file ? file.name : "",
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        category_id: "",
        product_name: "",
        product_make: "",
        quantity_requested: "",
        quantity_loaded: "",
        quantity_received: "",
        ton: "",
      },
    ]);
  };

  const removeItemRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, items };
      console.log("Submitting Logistic Data:", payload);

      await addLogistic(payload).unwrap();
      toast.success("Logistic entry created successfully");

      handleReset();
    } catch (err) {
      console.error("Failed to submit logistic:", err);
      toast.error("Failed to create logistic entry");
    }
  };

  const handleReset = () => {
    setFormData({
      po_id: "",
      project_code: "",
      vendor: "",
      vehicle_number: "",
      driver_number: "",
      total_ton: "",
      attachment_url: "",
      remarks: "",
    });
    setItems([
      {
        category_id: "",
        product_name: "",
        product_make: "",
        quantity_requested: "",
        quantity_loaded: "",
        quantity_received: "",
        ton: "",
      },
    ]);
  };
  const [lines, setLines] = useState([EMPTY_LINE()]);
const addLine = () => setLines((prev) => [...prev, EMPTY_LINE()]);
  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        ml: { xs: "0%", lg: "22%" },
        boxShadow: "md",
      }}
    >
      {/* Title */}
      <Typography level="h3" fontWeight="lg" mb={2}>
        Logistic Form
      </Typography>

      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* PO Number */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>PO Number</FormLabel>
                <Input
                  name="po_id"
                  value={formData.po_id}
                  onChange={handleChange}
                  placeholder="Enter PO Number"
                  required
                />
              </FormControl>
            </Grid>

            {/* Project Code */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Project Code</FormLabel>
                <Input
                  name="project_code"
                  value={formData.project_code}
                  onChange={handleChange}
                  placeholder="Auto-filled"
                  readOnly
                />
              </FormControl>
            </Grid>

            {/* Vendor */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Vendor</FormLabel>
                <Input
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="Auto-filled"
                  readOnly
                />
              </FormControl>
            </Grid>

            {/* Vehicle Number */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Vehicle Number</FormLabel>
                <Input
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="RJ14-AB-5678"
                  required
                />
              </FormControl>
            </Grid>

            {/* Driver Number */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Driver Number</FormLabel>
                <Input
                  name="driver_number"
                  value={formData.driver_number}
                  onChange={handleChange}
                  placeholder="9876543211"
                  required
                />
              </FormControl>
            </Grid>

            {/* Total Ton */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Total Ton</FormLabel>
                <Input
                  name="total_ton"
                  value={formData.total_ton}
                  onChange={handleChange}
                  placeholder="16"
                  required
                />
              </FormControl>
            </Grid>

            {/* Attachment */}
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Attachment</FormLabel>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
            </Grid>

            {/* Remarks */}
           
          </Grid>

          {/* Items Table */}
          <Divider sx={{ my: 3 }} />
           <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
          <Chip color="primary" variant="soft" size="sm">
            Products
          </Chip>
        </Box>

        <Box
          component="table"
          sx={{
            width: "100%",
            tableLayout: "fixed", // ⬅️ important
            borderCollapse: "separate",
            borderSpacing: 0,
            "& th, & td": {
              borderBottom:
                "1px solid var(--joy-palette-neutral-outlinedBorder)",
              p: 1,
              textAlign: "left",
              verticalAlign: "top", // ⬅️ top-align multi-line cells
            },
            "& th": { fontWeight: 700, bgcolor: "background.level1" },
            "& td:nth-of-type(1)": {
              // ⬅️ product column wraps
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "26%", fontWeight: 700 }}>Product</th>
              <th style={{ width: "16%", fontWeight: 700 }}>Category</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Make</th>
              <th style={{ width: "8%", fontWeight: 700 }}>Qty</th>
              <th style={{ width: "8%", fontWeight: 700 }}>UoM</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Weight (Ton)</th>
            </tr>
          </thead>
          <tbody>
            
          </tbody>
        </Box>

       
          <Box sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}>
            <Button size="sm" variant="plain" onClick={addLine}>
              Add a Product
            </Button>
          </Box>
        

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Description…
        </Typography>
        <Textarea
          minRows={3}
          placeholder="Write Description of PR"
          
 

        />

        {/* Summary */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Sheet
            variant="soft"
            sx={{ borderRadius: "lg", p: 2, minWidth: 280 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                rowGap: 0.5,
                columnGap: 1.5,
              }}
            >
              <Typography level="body-sm">Total Weight:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ 
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ 
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Total:
              </Typography>
              <Typography level="title-md" fontWeight={800} sx={{ mt: 0.5 }}>
                ₹ 
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

          <Divider sx={{ my: 3 }} />

          {/* Footer Buttons */}
          <Box display="flex" justifyContent="space-between">
            <Button
              type="button"
              variant="outlined"
              color="neutral"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="solid"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Logistic"}
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default AddLogisticForm;
