import { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Grid,
  CircularProgress,
} from "@mui/joy";
import {
  useCreateProductMutation,
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
} from "../../redux/productsSlice";
import SearchPickerModal from "../SearchPickerModal";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { toast } from "react-toastify";
const AddProduct = () => {
  const INITIAL_FORM = {
    name: "",
    productType: "",
    unitOfMeasure: "",
    cost: "",
    gst: "",
    productCategory: "",
    productCategoryName: "",
    internalReference: "",
    Description: "",
    imageFile: null,
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const buildMaterialData = (form) => {
    const rows = [];
    const push = (name, value) => {
      const v = value == null ? "" : String(value).trim();
      if (v) rows.push({ name, values: [{ input_values: v }] });
    };

    push("Product Name", form.name);
    push("Product Make", form.productMake ?? form.internalReference);
    push("Cost", form.cost);
    push("UoM", form.unitOfMeasure);
    push("GST", form.gst);

    return rows;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      toast.error("Please enter Product Name");
      return;
    }
    if (!form.productCategory) {
      toast.error("Please select a category");
      return;
    }

    const payload = {
      category: form.productCategory,
      data: buildMaterialData(form),
      is_available: true,
    };

    try {
      const res = await createProduct(payload).unwrap();
      toast.success("Product Created Successfully");
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error("Product Creation failed");
    }
  };

  const { data: inlineResp, isFetching: inlineLoading } =
    useGetCategoriesNameSearchQuery(
      { page: 1, search: "" },
      { refetchOnFocus: false, refetchOnReconnect: false }
    );

  const inlineCategories = inlineResp?.data || [];

  const displayCategoryLabel = useMemo(() => {
    if (form.productCategoryName) return form.productCategoryName;
    const found = inlineCategories.find((c) => c._id === form.productCategory);
    return found?.name || "";
  }, [form.productCategory, form.productCategoryName, inlineCategories]);

  const [triggerGetCategories] = useLazyGetCategoriesNameSearchQuery();

  const fetchCategoriesPage = useCallback(
    async ({ page, search }) => {
      const res = await triggerGetCategories({ page, search }).unwrap();
      const rows = res?.data ?? [];
      const total = res?.pagination?.total ?? rows.length;
      return { rows, total };
    },
    [triggerGetCategories]
  );

  const categoryColumns = useMemo(
    () => [
      { key: "name", label: "Name", width: "100%" },
      { key: "description", label: "Description", width: "100%" },
    ],
    []
  );

  const [catModalOpen, setCatModalOpen] = useState(false);
  const onPickCategory = (row) => {
    handleChange("productCategory", row._id);
    handleChange("productCategoryName", row.name);
    setCatModalOpen(false);
  };

  const selectedMissing =
    !!form.productCategory &&
    !inlineCategories.some((c) => c._id === form.productCategory);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImageFile(file);
    handleChange("imageFile", file);
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: "full", lg: 900, xl: 1000 },
        mx: "auto",
        p: 3,
        border: "1px solid #ddd",
        borderRadius: "lg",
        bgcolor: "background.body",
        mt: { xs: "0%", lg: "5%" },
        ml: { xs: "3%", lg: "25%", xl: "28%" },
        mr: { xs: "3%", lg: "0%" },
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography level="h4" mb={3} fontWeight="lg">
          Add New Product
        </Typography>

        <Box
          component="label"
          sx={{
            width: 80,
            height: 80,
            border: "2px dashed #ccc",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            bgcolor: "#fafafa",
            "&:hover": { bgcolor: "#f0f0f0" },
          }}
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#aaa",
              }}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
              <Typography level="body-xs" mt={0.5}>
                Upload
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" fontWeight="md" mb={0.5}>
            Product Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box
            role="textbox"
            aria-label="Product Name"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              let text = e.currentTarget.innerText.trim();
              if (!text) e.currentTarget.innerHTML = "";
              handleChange("name", text);
            }}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            onBlur={(e) => {
              let txt = e.currentTarget.innerText.replace(/\s+/g, " ").trim();
              if (!txt) e.currentTarget.innerHTML = "";
              handleChange("name", txt);
            }}
            sx={{
              fontSize: "1.5rem",
              fontWeight: "lg",
              lineHeight: 1.4,
              minHeight: 40,
              px: 0,
              border: 0,
              borderBottom: "2px solid",
              borderColor: "neutral.outlinedBorder",
              outline: "none",
              boxShadow: "none",
              "&:empty:before": {
                content: '"Enter Product Name"',
                color: "neutral.plainDisabledColor",
                pointerEvents: "none",
              },
              "&:focus": { borderColor: "neutral.plainColor" },
              "&:focus-visible": { outline: "none" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Product Type
            </Typography>
            <Select
              value={form.productType}
              onChange={(_, val) => handleChange("productType", val)}
            >
              <Option value="" disabled>
                Select Type
              </Option>
              <Option value="supply">Supply</Option>
              <Option value="execution">Execution</Option>
            </Select>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Unit of Measure
            </Typography>
            <Select
              value={form.unitOfMeasure}
              onChange={(_, val) => handleChange("unitOfMeasure", val)}
            >
              <Option value="" disabled>
                Select UoM
              </Option>
              <Option value="nos">Nos</Option>
              <Option value="meter">Meter</Option>
              <Option value="kg">Kg</Option>
              <Option value="lots">Lots</Option>
              <Option value="mw">MW</Option>
            </Select>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Cost
            </Typography>
            <Input
              type="number"
              placeholder="Enter Cost of Sale"
              value={form.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Product Category <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              value={form.productCategory || ""}
              onChange={(_, val) => {
                if (val === "__search_more__") {
                  setCatModalOpen(true);
                  return;
                }
                const picked = inlineCategories.find((c) => c._id === val);
                handleChange("productCategory", val || "");
                handleChange("productCategoryName", picked?.name || "");
              }}
              indicator={
                inlineLoading ? <CircularProgress size="sm" /> : undefined
              }
            >
              {!form.productCategory && (
                <Option value="" disabled>
                  {displayCategoryLabel || "Select Category"}
                </Option>
              )}

              {selectedMissing && (
                <Option value={form.productCategory}>
                  {form.productCategoryName}
                </Option>
              )}

              {inlineCategories.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}

              <Option value="__search_more__" color="primary">
                Search more…
              </Option>
            </Select>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              GST (%)
            </Typography>
            <Input
              value={form.gst}
              type="number"
              placeholder="Enter GST Percentage"
              onChange={(e) => handleChange("gst", e.target.value)}
            />
          </Grid>

          <Grid xs={12}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Description
            </Typography>
            <Textarea
              minRows={3}
              placeholder="Enter Description of Product"
              value={form.Description}
              onChange={(e) => handleChange("Description", e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="solid"
            sx={{
              backgroundColor: "#214b7b",
              color: "#fff",
              "&:hover": { backgroundColor: "#1a3b63" },
            }}
          >
            {isCreating ? "Saving…" : "Save Product"}
          </Button>
        </Box>
      </form>

      <SearchPickerModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onPick={onPickCategory}
        title="Search: Category"
        columns={categoryColumns}
        fetchPage={fetchCategoriesPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>
  );
};

export default AddProduct;
