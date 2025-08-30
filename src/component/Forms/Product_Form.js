import { useMemo, useCallback, useEffect, useState } from "react";
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
  Chip,
} from "@mui/joy";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useLazyGetProductByIdQuery,
} from "../../redux/productsSlice";
import SearchPickerModal from "../SearchPickerModal";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  make: "",
  imageUrl: "",
};

function getField(rows, name) {
  const r = rows?.find((x) => x?.name?.toLowerCase() === name.toLowerCase());
  return r?.values?.[0]?.input_values ?? "";
}

function normalizeCreatedProduct(res) {
  let p = res;
  if (p?.data?.data && (p?.data?.category || p?.data?.category?._id))
    p = p.data;
  if (p?.newProduct) p = p.newProduct;
  if (p?.newMaterial) p = p.newMaterial;
  if (p?.product) p = p.product;
  if (p?.material) p = p.material;
  return p;
}

const ProductForm = ({
  embedded = false,
  initialForm = null,
  onCreated = null,
  onClose = null,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlMode = (searchParams.get("mode") || "create").toLowerCase();
  const productId = searchParams.get("id") || null;

  const [mode, setMode] = useState(embedded ? "create" : urlMode);
  const isCreate = mode === "create";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isReadOnly = embedded ? false : isView;

  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [triggerGetProductById] = useLazyGetProductByIdQuery();

  const buildMaterialData = (f) => {
    const rows = [];
    const push = (name, value) => {
      const v = value == null ? "" : String(value).trim();
      if (v) rows.push({ name, values: [{ input_values: v }] });
    };

    push("Product Name", f.name);
    push("Product Type", f.productType);
    push("Cost", f.cost);
    push("UoM", f.unitOfMeasure);
    push("GST", f.gst);
    push("Make", f.make);
    push("Description", f.Description);

    return rows;
  };

  // ---------- Create / Update submit ----------
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
      description: form.Description,
    };

    try {
      if (isCreate) {
        const res = await createProduct(payload).unwrap();
        toast.success("Product created successfully");
        const createdDoc = normalizeCreatedProduct(res);

        if (embedded && typeof onCreated === "function") {
          onCreated(createdDoc);
        }

        if (embedded) {
          onClose?.();
        } else {
          setForm(INITIAL_FORM);
          setPreview(null);
          setImageFile(null);
        }
      } else if (isEdit && productId) {
        await updateProduct({
          productId,
          category: form.productCategory,
          data: buildMaterialData(form),
          description: form.Description,
          is_available: true,
        }).unwrap();
        toast.success("Product updated successfully");
        setMode("view");
      }
    } catch (err) {
      toast.error(
        isCreate ? "Product creation failed" : "Product update failed"
      );
    }
  };

  // ---------- Inline categories ----------
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

  // ---------- Image handling ----------
  const handleFileChange = (e) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setImageFile(file);
    handleChange("imageFile", file);
  };

  // ---------- Load existing product in view/edit ----------
  useEffect(() => {
    if (embedded) return; // ignore URL mode in embedded

    let active = true;

    const load = async () => {
      if (!productId) return;
      try {
        const res = await triggerGetProductById(productId).unwrap();
        if (!active || !res?.data) return;

        const p = res.data;

        const mapped = {
          ...INITIAL_FORM,
          name: getField(p.data, "Product Name"),
          productType: getField(p.data, "Product Type"),
          cost: getField(p.data, "Cost"),
          unitOfMeasure: getField(p.data, "UoM"),
          gst: getField(p.data, "GST"),
          make: getField(p.data, "Make"),
          Description: getField(p.data, "Description"),
          productCategory: p.category?._id || p.category || "",
          productCategoryName: p.category?.name || "",
          imageUrl: p.imageUrl || "",
        };

        setForm(mapped);
        setPreview(p.imageUrl || null);
      } catch (err) {
        toast.error("Failed to load product details");
      }
    };

    if (mode === "view" || mode === "edit") load();
    return () => {
      active = false;
    };
  }, [productId, mode, embedded, triggerGetProductById]);

  // ---------- Prefill when embedded ----------
  useEffect(() => {
    if (!embedded) return;
    const merged = { ...INITIAL_FORM, ...(initialForm || {}) };
    setForm(merged);
    setPreview(merged.imageUrl || null);
    setMode("create");
  }, [embedded, initialForm]);

  // ---------- Header actions ----------
  const goToView = () => {
    if (embedded) return;
    if (!productId) return;
    setMode("view");
    navigate(`?mode=view&id=${productId}`, { replace: true });
  };
  const goToEdit = () => {
    if (embedded) return;
    if (!productId) return;
    setMode("edit");
    navigate(`?mode=edit&id=${productId}`, { replace: true });
  };
  const goToCreate = () => {
    if (embedded) return;
    setMode("create");
    navigate(`?mode=create`, { replace: true });
    setForm(INITIAL_FORM);
    setPreview(null);
    setImageFile(null);
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
        ...(embedded
          ? { m: 0, border: "none", borderRadius: 0, p: 0 }
          : {
              mt: { xs: "0%", lg: "5%" },
              ml: { xs: "3%", lg: "25%", xl: "28%" },
              mr: { xs: "3%", lg: "0%" },
            }),
      }}
    >
      {/* Header */}
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent={"flex-start"}
          flexDirection={"column-reverse"}
          gap={1}
        >
          <Typography level="h4" mb={3} fontWeight="lg">
            {isCreate ? "Add New Product" : "Product"}
          </Typography>
          {!embedded && (
            <Chip
              color={isCreate ? "success" : isView ? "neutral" : "primary"}
              size="sm"
            >
              {mode.toUpperCase()}
            </Chip>
          )}
        </Box>

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
            cursor: isReadOnly ? "default" : "pointer",
            bgcolor: "#fafafa",
            "&:hover": { bgcolor: isReadOnly ? "#fafafa" : "#f0f0f0" },
          }}
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={isReadOnly}
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
                opacity: isReadOnly ? 0.85 : 1,
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
                {isReadOnly ? "No Image" : "Upload"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mode actions (hidden in embedded) */}
      {!embedded && !isCreate && (
        <Box display="flex" gap={1} mb={2}>
          {isView && (
            <Button variant="solid" color="primary" onClick={goToEdit}>
              Edit
            </Button>
          )}
          {isEdit && (
            <Button variant="outlined" color="neutral" onClick={goToView}>
              Cancel Edit
            </Button>
          )}
          <Button variant="plain" onClick={goToCreate}>
            + New
          </Button>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" fontWeight="md" mb={0.5}>
            Product Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box
            role="textbox"
            aria-label="Product Name"
            contentEditable={!isReadOnly}
            suppressContentEditableWarning
            onInput={(e) => {
              if (isReadOnly) return;
              let text = e.currentTarget.innerText.trim();
              if (!text) e.currentTarget.innerHTML = "";
              handleChange("name", text);
            }}
            onKeyDown={(e) =>
              !isReadOnly && e.key === "Enter" && e.preventDefault()
            }
            onBlur={(e) => {
              if (isReadOnly) return;
              let txt = e.currentTarget.innerText.replace(/\s+/g, " ").trim();
              if (!txt) e.currentTarget.innerHTML = "";
              handleChange("name", txt);
            }}
            sx={{
              fontSize: "1.2rem",
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
              ...(isReadOnly && {
                pointerEvents: "none",
                opacity: 0.95,
                borderBottomColor: "transparent",
              }),
            }}
          >
            {form.name}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Product Type
            </Typography>
            <Select
              value={form.productType}
              onChange={(_, val) => handleChange("productType", val)}
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Product Category <span style={{ color: "red" }}>*</span>
            </Typography>

            <Select
              value={form.productCategory || ""}
              onChange={(_, val) => {
                if (isReadOnly) return;
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
              disabled={isReadOnly}
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

              {!isReadOnly && (
                <Option value="__search_more__" color="primary">
                  Search more…
                </Option>
              )}
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
              disabled={isReadOnly}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography level="body-sm" fontWeight="md" mb={0.5}>
              Make
            </Typography>
            <Input
              value={form.make}
              placeholder="Enter Make of the Product"
              onChange={(e) => handleChange("make", e.target.value)}
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </Grid>
        </Grid>

        {/* Footer Buttons */}
        <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
          {(isCreate || isEdit) && (
            <Button
              type="submit"
              variant="solid"
              sx={{
                backgroundColor: "#214b7b",
                color: "#fff",
                "&:hover": { backgroundColor: "#1a3b63" },
              }}
            >
              {isCreate
                ? isCreating
                  ? "Saving…"
                  : "Save Product"
                : isUpdating
                ? "Updating…"
                : "Save Changes"}
            </Button>
          )}

          {embedded && (
            <Button variant="outlined" color="neutral" onClick={onClose}>
              Cancel
            </Button>
          )}

          {!embedded && isEdit && (
            <Button variant="outlined" color="neutral" onClick={goToView}>
              Cancel
            </Button>
          )}
        </Box>
      </form>

      <SearchPickerModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onPick={onPickCategory}
        title="Search: Category"
        columns={[
          { key: "name", label: "Name", width: "100%" },
          { key: "description", label: "Description", width: "100%" },
        ]}
        fetchPage={fetchCategoriesPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>
  );
};

export default ProductForm;
