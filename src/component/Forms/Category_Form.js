// src/component/Forms/Category_Form.js
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Option,
  Select,
  Sheet,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Edit from "@mui/icons-material/Edit";
import {
  useGetMaterialCategoryByIdQuery,
  useUpdateCategoriesMutation,
  useCreateCategoryMutation,
} from "../../redux/productsSlice";
import { toast } from "react-toastify";

const inputTypeOptions = [
  "String",
  "Number",
  "Boolean",
  "Date",
  "Array",
  "Object",
  "Decimal128",
  "Int32",
  "Long",
  "ObjectId",
  "Mixed",
];

const initialForm = {
  name: "",
  description: "",
  type: "",
  category_code: "",
  status: "active",
  product_count: 0,
  fields: [],
};

const emptyFieldRow = () => ({
  name: "",
  input_type: "",
  required: false,
  placeholder: "",
  key: "",
  _new: true,
});

function slugify(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const CategoryForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const modeParam = searchParams.get("mode") || "view";
  const [mode, setMode] = useState(modeParam);
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const categoryId = searchParams.get("id") || "";

  const {
    data: categoryResp,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useGetMaterialCategoryByIdQuery(categoryId, {
    skip: isCreate || !categoryId,
  });

  const [updateCategory, { isLoading: isSavingUpdate }] =
    useUpdateCategoriesMutation();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const [formValues, setFormValues] = useState(initialForm);

  const location = useLocation();
  const goToProductList = () => {
    const params = new URLSearchParams();
    params.set("category", categoryId);
    params.set("returnTo", location.pathname + location.search);
    navigate(`/products?${params.toString()}`);
  };
  useEffect(() => {
    if (!isCreate && categoryResp) {
      const src = categoryResp?.data ?? categoryResp;
      setFormValues({
        name: src?.name || "",
        description: src?.description || "",
        type: src?.type || "",
        category_code: src?.category_code || "",
        status: src?.status || "active",
        product_count: src?.product_count ?? 0,
        fields: Array.isArray(src?.fields)
          ? src.fields.map((f) => ({
              name: f?.name || "",
              input_type: f?.input_type || "",
              required: !!f?.required,
              placeholder: f?.placeholder || "",
              key: f?.key || slugify(f?.name || ""),
              _new: false,
            }))
          : [],
      });
    }
  }, [categoryResp, isCreate]);

  const saving = isSavingUpdate || isCreating;

  // Fields table helpers
  const addLine = () => {
    if (isView) return;
    setFormValues((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), emptyFieldRow()],
    }));
  };

  const removeRow = (idx) => {
    if (isView) return;
    setFormValues((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx),
    }));
  };

  const updateRow = (idx, patch) => {
    if (isView) return;
    setFormValues((prev) => {
      const clone = [...(prev.fields || [])];
      clone[idx] = { ...clone[idx], ...patch };
      return { ...prev, fields: clone };
    });
  };

  const handleNameChange = (idx, newName) => {
    const current = formValues.fields[idx];
    const autoKey = slugify(newName);
    const shouldUpdateKey =
      !current.key || current.key === slugify(current.name || "");
    updateRow(idx, {
      name: newName,
      key: shouldUpdateKey ? autoKey : current.key,
    });
  };

  // Submit helpers
  const buildFieldsForSubmit = () =>
    (formValues.fields || []).map((f) => ({
      name: f.name?.trim(),
      input_type: f.input_type,
      required: !!f.required,
      placeholder: f.placeholder || "",
      key: f.key?.trim() || slugify(f.name),
    }));

  const handleCreate = async () => {
    if (!formValues.name?.trim())
      return toast.error("Category Name is required.");
    if (!formValues.type) return toast.error("Product Type is required.");
    const body = {
      name: formValues.name.trim(),
      description: formValues.description || "",
      type: formValues.type,
      status: formValues.status || "active",
      fields: buildFieldsForSubmit(),
    };
    try {
      await createCategory(body).unwrap();
      toast.success("Category created");
      setFormValues(initialForm);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create category.");
    }
  };

  const handleUpdate = async () => {
    if (!formValues.name?.trim())
      return toast.error("Category Name is required.");
    if (!formValues.type) return toast.error("Product Type is required.");
    const payload = { ...formValues, fields: buildFieldsForSubmit() };
    try {
      await updateCategory({ categoryId, body: payload }).unwrap();
      toast.success("Category updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update category.");
    }
  };

  if (!isCreate && isLoadingCategory)
    return <Typography>Loading...</Typography>;
  if (categoryError)
    return (
      <Typography color="danger">
        Error loading category: {categoryError?.message || "Unknown error"}
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography level="h4">
            {isCreate ? "Create Product Category" : "Product Category"}
          </Typography>
          {!isCreate && formValues?.category_code ? (
            <Chip color="primary" variant="soft" size="sm">
              {formValues.category_code}
            </Chip>
          ) : null}
        </Box>

        {!isCreate && isView && (
          <Button
            startDecorator={<Edit />}
            variant="outlined"
            onClick={() => setMode("edit")}
          >
            Edit
          </Button>
        )}

        <Sheet
          variant="outlined"
          sx={{
            display: "flex",
            alignItems: "stretch",
            borderRadius: "lg",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.25,
              py: 0.75,
              cursor: "pointer",
              "&:hover": { bgcolor: "neutral.softHoverBg" },
            }}
            onClick={goToProductList}
            role="button"
            tabIndex={0}
          >
            <LocalMallOutlinedIcon fontSize="small" color="primary" />
            <Box sx={{ lineHeight: 1.1 }}>
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                Products
              </Typography>
              <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                {formValues.product_count || 0}
              </Typography>
            </Box>
          </Box>
        </Sheet>
      </Box>

      {/* Basic Details */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg", mb: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <FormControl size="sm" required>
              <FormLabel>Category Name</FormLabel>
              <Input
                placeholder="e.g. Solar Inverter"
                disabled={isView}
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, name: e.target.value }))
                }
              />
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl size="sm">
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Brief description…"
                disabled={isView}
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, description: e.target.value }))
                }
              />
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl size="sm" required>
              <FormLabel>Product Type</FormLabel>
              <Select
                disabled={isView}
                value={formValues.type || null}
                onChange={(_, val) =>
                  setFormValues((p) => ({ ...p, type: val || "" }))
                }
                placeholder="Select type"
              >
                <Option value="supply">Supply</Option>
                <Option value="execution">Execution</Option>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl size="sm">
              <FormLabel>Status</FormLabel>
              <Select
                disabled={isView}
                value={formValues.status || "active"}
                onChange={(_, val) =>
                  setFormValues((p) => ({ ...p, status: val || "active" }))
                }
                placeholder="Select status"
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Sheet>

      {/* Fields table */}
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "lg" }}>
        <Typography level="title-md" mb={1}>
          Add Product Fields for this Category
        </Typography>

        <Table
          size="sm"
          stickyHeader
          sx={{
            "--TableHeaderUnderlineThickness": "1px",
            "--TableCell-paddingY": "10px",
            "--TableCell-paddingX": "12px",
            borderRadius: "md",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 220 }}>Name</th>
              <th style={{ width: 190 }}>DB Type</th>
              <th style={{ width: 110 }}>Required</th>
              <th>Placeholder</th>
              <th style={{ width: 220 }}>Key</th>
              <th style={{ width: 60 }} />
            </tr>
          </thead>

          <tbody>
            {(formValues.fields || []).length ? (
              formValues.fields.map((row, idx) => {
                // EDIT MODE: allow editing of every row
                const editable = !isView && (row._new || isEdit);
                return (
                  <tr key={idx}>
                    <td>
                      {editable ? (
                        <Input
                          size="sm"
                          variant="plain"
                          value={row.name}
                          placeholder="Field name"
                          onChange={(e) =>
                            handleNameChange(idx, e.target.value)
                          }
                        />
                      ) : (
                        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                          {row.name || "—"}
                        </Typography>
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <Select
                          size="sm"
                          value={row.input_type || null}
                          placeholder="Choose"
                          onChange={(_, val) =>
                            updateRow(idx, { input_type: val || "" })
                          }
                        >
                          {inputTypeOptions.map((opt) => (
                            <Option key={opt} value={opt}>
                              {opt}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                          {row.input_type || "—"}
                        </Typography>
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <Switch
                          size="sm"
                          checked={!!row.required}
                          onChange={(e) =>
                            updateRow(idx, { required: e.target.checked })
                          }
                        />
                      ) : (
                        <Chip
                          size="sm"
                          variant="soft"
                          color={row.required ? "success" : "neutral"}
                        >
                          {row.required ? "Yes" : "No"}
                        </Chip>
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <Input
                          size="sm"
                          value={row.placeholder}
                          variant="plain"
                          placeholder="e.g. Enter value…"
                          onChange={(e) =>
                            updateRow(idx, { placeholder: e.target.value })
                          }
                        />
                      ) : (
                        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                          {row.placeholder || "—"}
                        </Typography>
                      )}
                    </td>
                    <td>
                      {editable ? (
                        <Input
                          size="sm"
                          value={row.key}
                          variant="plain"
                          placeholder="auto-generated"
                          onChange={(e) =>
                            updateRow(idx, { key: slugify(e.target.value) })
                          }
                          onBlur={() => {
                            const r = formValues.fields[idx];
                            if (
                              r?.name ||
                              r?.input_type ||
                              r?.placeholder ||
                              r?.key
                            ) {
                              updateRow(idx, {
                                _new: false,
                                key: r.key || slugify(r.name),
                              });
                            }
                          }}
                        />
                      ) : (
                        <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                          {row.key || "—"}
                        </Typography>
                      )}
                    </td>
                    <td>
                      {!isView && (
                        <Tooltip title="Remove">
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => removeRow(idx)}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                    No fields yet.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {!isView && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="sm"
              variant="plain"
              startDecorator={<Add />}
              onClick={addLine}
            >
              Add a line
            </Button>
          </Box>
        )}

        <FormHelperText sx={{ mt: 1 }}>
          Each row becomes an entry in <code>fields[]</code> with shape:{" "}
          <code>{`{ name, input_type, required, placeholder, key }`}</code>
        </FormHelperText>
      </Sheet>

      {/* Bottom-right actions */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<ArrowBack />}
          onClick={() => navigate("/categories")}
        >
          Back
        </Button>

        {isCreate ? (
          <Button
            variant="solid"
            color="primary"
            startDecorator={<Save />}
            loading={saving}
            onClick={handleCreate}
          >
            Create
          </Button>
        ) : isEdit ? (
          <Button
            variant="solid"
            color="primary"
            startDecorator={<Save />}
            loading={saving}
            onClick={handleUpdate}
          >
            Save Changes
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

export default CategoryForm;
