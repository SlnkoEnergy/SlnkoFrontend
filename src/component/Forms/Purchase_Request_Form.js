import { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Checkbox,
  Sheet,
  IconButton,
  Divider,
  Chip,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Add from "@mui/icons-material/Add";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Send from "@mui/icons-material/Send";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import {
  useGetProjectByIdQuery,
  useGetProjectSearchDropdownQuery,
  useLazyGetProjectSearchDropdownQuery,
} from "../../redux/projectsSlice";
import {
  useGetPurchaseRequestByIdQuery,
  useCreatePurchaseRequestMutation,
  useEditPurchaseRequestMutation,
} from "../../redux/camsSlice";
import {
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useGetProductsQuery,
  useLazyGetProductsQuery,
} from "../../redux/productsSlice";
import SearchPickerModal from "../SearchPickerModal";
import AddPurchaseOrder from "./Add_Po"; // <- adjust path if needed
import { toast } from "react-toastify";

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  _selected: false, // for "Create PO" selection
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

// site_address -> string
const siteAddressToString = (site_address) => {
  if (!site_address) return "";
  if (typeof site_address === "string") return site_address;
  if (typeof site_address === "object") {
    const parts = [site_address.village_name, site_address.district_name]
      .filter(Boolean)
      .join(", ");
    return parts || "";
  }
  return "";
};
// helper to read a named field from product.data[]
const getProdField = (row, fieldName) => {
  if (!row?.data) return "";
  const f = row.data.find((d) => d?.name === fieldName);
  return f?.values?.[0]?.input_values ?? "";
};

export default function Purchase_Request_Form() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "create").toLowerCase();
  const projectId = searchParams.get("projectId") || "";
  const prId = searchParams.get("id") || "";
  const [prno, setPrNo] = useState("");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const navigate = useNavigate();
  const location = useLocation();

  // Top-level
  const [projectCode, setProjectCode] = useState("");
  const [pId, setPId] = useState(0);
  const [projectLocation, setProjectLocation] = useState("");
  const [projectName, setProjectName] = useState("");
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [deliverTo, setDeliverTo] = useState("");
  const [category, setCategory] = useState([]);
  const [categoryIdToName, setCategoryIdToName] = useState({});
  const [description, setDescription] = useState("");
  const [poCount, setPoCount] = useState(0);
  const [createdBy, setCreatedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lines
  const [lines, setLines] = useState([EMPTY_LINE()]);

  // Modal for PO
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poSeed, setPoSeed] = useState(null);

  // Seed code from query (optional)
  useEffect(() => {
    if (isCreate && projectId && !projectCode) {
      setProjectCode(projectId);
    }
  }, [isCreate, projectId, projectCode]);

  // ---------- Project picker (inline + modal) ----------
  const [projectSearch, setProjectSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 7;

  const { data: getProjectSearchDropdown, isFetching: projLoading } =
    useGetProjectSearchDropdownQuery(
      { search: projectSearch, page, limit },
      { skip: !isCreate }
    );

  const projectRows = getProjectSearchDropdown?.data || [];
  const [triggerProjectSearch] = useLazyGetProjectSearchDropdownQuery();

  const fetchProjectsPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const res = await triggerProjectSearch(
      { search, page, limit: pageSize },
      true
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const projectColumns = [
    { key: "name", label: "Project Name", width: 240 },
    { key: "code", label: "Project Code", width: 200 },
    {
      key: "site_address",
      label: "Location",
      width: 320,
      render: (row) => siteAddressToString(row.site_address),
    },
  ];

  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const onPickProject = (row) => {
    if (!row) return;
    setProjectCode(row.code || "");
    setProjectLocation(siteAddressToString(row.site_address));
    setProjectName(row.name || "");
    setProjectModalOpen(false);
  };

  // Prefill project (create + projectId)
  const shouldFetchProject = isCreate && Boolean(projectId);
  const { data: getProjectById, isFetching: projectLoading } =
    useGetProjectByIdQuery(projectId, { skip: !shouldFetchProject });

  const hydratedFromProjectIdRef = useRef(false);
  useEffect(() => {
    if (!shouldFetchProject || projectLoading) return;
    const payload = getProjectById?.data ?? getProjectById;
    if (!payload) return;
    const p = Array.isArray(payload) ? payload[0] : payload;
    if (!p || hydratedFromProjectIdRef.current) return;

    setProjectCode(p.code || "");
    setProjectName(p.name || "");
    setProjectLocation(siteAddressToString(p.site_address));
    hydratedFromProjectIdRef.current = true;
  }, [shouldFetchProject, projectLoading, getProjectById]);

  // ---------- Category picker (inline + modal) ----------
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);

  const { data: categoryResp, isFetching: catLoading } =
    useGetCategoriesNameSearchQuery(
      {
        search: categorySearch,
        page: categoryPage,
        limit,
        pr: "true",
        projectId,
      },
      { skip: !isCreate || !projectId }
    );

  const categoryRows = categoryResp?.data || [];
  const [triggerCategorySearch] = useLazyGetCategoriesNameSearchQuery();

  const fetchCategoriesPageCat = async ({
    search = "",
    page = 1,
    pageSize = 7,
  }) => {
    const res = await triggerCategorySearch(
      { search, page, limit: pageSize, pr: "true", projectId },
      true
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.pageSize || pageSize,
    };
  };

  const categoryColumns = [
    { key: "name", label: "Category", width: 300 },
    { key: "description", label: "Description", width: 420 },
  ];

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const onPickCategoryName = (row) => {
    if (!row?._id) return;
    setCategory((prev) => (prev.includes(row._id) ? prev : [...prev, row._id]));
    setCategoryIdToName((prev) => ({
      ...prev,
      [row._id]: row.name || String(row._id),
    }));
  };

  // Map selected IDs->names when that page is visible
  useEffect(() => {
    if (!Array.isArray(category) || category.length === 0) return;
    if (!Array.isArray(categoryRows) || categoryRows.length === 0) return;
    setCategoryIdToName((prev) => {
      const next = { ...prev };
      for (const r of categoryRows) {
        if (category.includes(r._id)) {
          next[r._id] = r.name || String(r._id);
        }
      }
      return next;
    });
  }, [categoryRows, category]);

  // ---------- PRODUCTS (filtered by selected category IDs) ----------
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const productLimit = 7;

  // comma-separated for query param
  const categoryParam = category?.length ? category.join(",") : "";

  // Inline fetch for current page (optional)
  const { data: productsResp, isFetching: productsLoading } =
    useGetProductsQuery(
      {
        search: productSearch,
        page: productPage,
        limit: productLimit,
        category: categoryParam,
      },
      { skip: !categoryParam }
    );

  const productRows = productsResp?.data || [];
  const [triggerGetProducts] = useLazyGetProductsQuery();

  // Product modal (per line)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);

  // Show SKU, Product Name, and Category in the modal
  const productColumns = [
    { key: "sku_code", label: "Code", width: 160 },
    {
      key: "name",
      label: "Product Name",
      width: 320,
      render: (row) => getProdField(row, "Product Name") || "-",
    },
    {
      key: "category",
      label: "Category",
      width: 220,
      render: (row) => row?.category?.name || "-",
    },
  ];

  // Modal fetch (backend returns meta)
  const fetchProductsPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const res = await triggerGetProducts(
      { search, page, limit: pageSize, category: categoryParam },
      true
    );
    const d = res?.data;
    const meta = d?.meta || {};
    return {
      rows: d?.data || [],
      total: Number.isFinite(meta.total) ? meta.total : 0,
      page: meta.page || page,
      pageSize: meta.limit || pageSize,
    };
  };

  const onPickProduct = (row) => {
    if (!row || !activeLineId) return;

    const pickedName = getProdField(row, "Product Name") || row?.sku_code || "";
    const pickedCost = Number(getProdField(row, "Cost") || 0);
    const pickedGST = Number(getProdField(row, "GST") || 0);
    const pickedMake = getProdField(row, "Make" || "");
    const pickedUOM = getProdField(row, "UOM" || "");
    const catId = row?.category?._id || "";
    const catName = row?.category?.name || "";

    setLines((prev) =>
      prev.map((l) =>
        l.id === activeLineId
          ? {
              ...l,
              productId: row._id || "",
              productName: pickedName,
              productCategoryId: catId,
              productCategoryName: catName,
              unitPrice: pickedCost,
              taxPercent: pickedGST,
              make: pickedMake,
              uom: pickedUOM,
            }
          : l
      )
    );
    setProductModalOpen(false);
    setActiveLineId(null);
  };

  // ---------- Load existing PR on EDIT/VIEW ----------
  const { data: prDataResp, isFetching: prLoading } =
    useGetPurchaseRequestByIdQuery(prId, {
      skip: !(isEdit || isView) || !prId,
    });

  useEffect(() => {
    if (!prDataResp) return;
    const d = prDataResp?.data || prDataResp;

    setCreatedBy(d?.created_by?.name || "");
    setProjectCode(d?.project_id?.code || "");
    setPId(d?.project_id?.p_id || "");
    setPrNo(d?.pr_no || "");
    setProjectLocation(
      typeof d?.project_id?.site_address === "string"
        ? d.project_id.site_address
        : `${d?.project_id?.site_address?.village_name || ""}${
            d?.project_id?.site_address?.village_name &&
            d?.project_id?.site_address?.district_name
              ? ", "
              : ""
          }${d?.project_id?.site_address?.district_name || ""}`
    );
    setProjectName(d?.project_id?.name || "");
    setAskConfirmation(Boolean(d?.fetch_from_bom || d?.ask_confirmation));
    setDeliverTo(d?.delivery_address || "");
    setPoCount(d?.overall_total_number_of_po || 0);
    setDescription(d?.description || "");

    if (Array.isArray(d?.category)) setCategory(d.category);

    // *** CHANGED: correctly derive category from product for each line
    const incomingItems = Array.isArray(d?.items) ? d.items : [];
    setLines(
      incomingItems.length
        ? incomingItems.map((l) => {
            const productDoc = l?.item_id || {};
            const catDoc = productDoc?.category || l?.category || {};
            const catId = catDoc?._id || catDoc || "";
            const catName = catDoc?.name || "";

            return {
              id: crypto.randomUUID(),
              _selected: false,
              productId: productDoc?._id || "",
              productName: l.product_name || "",
              productCategoryId: catId,
              productCategoryName: catName,
              make: l.product_make || "",
              uom: l.uom || "",
              quantity: Number(l.quantity || 0),
              unitPrice: Number(l.cost ?? 0),
              taxPercent: Number(l.gst ?? 0),
              note: l.note || "",
            };
          })
        : [EMPTY_LINE()]
    );
  }, [prDataResp]);

  useEffect(() => {
    if (!prDataResp) return;
    const d = prDataResp?.data || prDataResp;

    setCreatedBy(d?.created_by?.name || "");
    setProjectCode(d?.project_id?.code || "");
    setPrNo(d?.pr_no || "");
    setProjectLocation(
      typeof d?.project_id?.site_address === "string"
        ? d.project_id.site_address
        : `${d?.project_id?.site_address?.village_name || ""}${
            d?.project_id?.site_address?.village_name &&
            d?.project_id?.site_address?.district_name
              ? ", "
              : ""
          }${d?.project_id?.site_address?.district_name || ""}`
    );
    setProjectName(d?.project_id?.name || "");
    setAskConfirmation(Boolean(d?.fetch_from_bom || d?.ask_confirmation));
    setDeliverTo(d?.delivery_address || "");
    setPoCount(d?.overall_total_number_of_po || 0);
    setDescription(d?.description || "");

    if (Array.isArray(d?.category)) setCategory(d.category);

    const incomingItems = Array.isArray(d?.items) ? d.items : [];

    setLines(
      incomingItems.length
        ? incomingItems.map((l) => {
            const productDoc = l?.item_id || {};
            const catId = productDoc?._id || "";
            const catName = productDoc?.name || "";

            return {
              id: crypto.randomUUID(),
              _selected: false,
              productId: productDoc?._id || "",
              productName: l.product_name || "",
              productCategoryId: catId,
              productCategoryName: catName,
              make: l.product_make || "",
              uom: l.uom || "",
              quantity: Number(l.quantity || 0),
              unitPrice: Number(l.cost ?? 0),
              taxPercent: Number(l.gst ?? 0),
              note: l.note || "",
            };
          })
        : [EMPTY_LINE()]
    );
  }, [prDataResp]);

  // Filter lines whenever category changes (already in your code)
  useEffect(() => {
    if (!Array.isArray(category) || category.length === 0) return;
    if (!Array.isArray(lines) || lines.length === 0) return;
    setLines((prev) => {
      const selectedSet = new Set(category || []);
      const filtered = prev.filter((l) => {
        if (!l.productId) return true;
        if (l.productCategoryId) {
          return selectedSet.has(l.productCategoryId);
        }
        return true;
      });
      return filtered.length ? filtered : [EMPTY_LINE()];
    });
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Amounts ----------
  const amounts = useMemo(() => {
    const untaxed = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      return sum + q * up;
    }, 0);

    const tax = lines.reduce((sum, l) => {
      const q = Number(l.quantity || 0);
      const up = Number(l.unitPrice || 0);
      const t = Number(l.taxPercent || 0);
      return sum + (q * up * t) / 100;
    }, 0);

    const total = untaxed + tax;

    return {
      untaxed: Number.isFinite(untaxed) ? untaxed : 0,
      tax: Number.isFinite(tax) ? tax : 0,
      total: Number.isFinite(total) ? total : 0,
    };
  }, [lines]);

  // ---------- Line helpers ----------
  const addLine = () => setLines((prev) => [...prev, EMPTY_LINE()]);
  const removeLine = (id) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev
    );

  const updateLine = (id, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // selection per-line (for Create PO)
  const handleProductCheckbox = (checked, lineId) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, _selected: checked } : l))
    );
  };
  const isAnyProductChecked = useMemo(
    () => lines.some((l) => l._selected),
    [lines]
  );

  // ---------- Form actions ----------
  const resetForm = () => {
    if (isView) return;
    setProjectCode(isCreate ? projectId || "" : "");
    setProjectLocation("");
    setProjectName("");
    setAskConfirmation(false);
    setDeliverTo("");
    setCategory([]);
    setCategoryIdToName({});
    setDescription("");
    setLines([EMPTY_LINE()]);
  };

  // ---------- Mutations ----------
  const [createPurchaseRequest] = useCreatePurchaseRequestMutation();
  const [updatePurchaseRequest] = useEditPurchaseRequestMutation();

  const validate = () => {
    if (!projectCode) return "Project Code is required.";
    if (!deliverTo) return "Deliver To is required.";
    const hasAny = lines.some(
      (l) => (l.productId || l.productName) && Number(l.quantity) > 0
    );
    if (!hasAny) return "Add at least one product line with a quantity.";
    return null;
  };

  const handleSubmit = async () => {
    try {
      if (isView) return;

      const error = validate();
      if (error) {
        toast.error(error);
        return;
      }

      setSubmitting(true);

      const items = lines
        .filter((l) => (l.productId || l.productName) && Number(l.quantity) > 0)
        .map((l) => ({
          item_id: l.productCategoryId || null,
          product_name: l.productName || "",
          product_make: l.make || "",
          uom: String(l.uom ?? ""),
          quantity: String(l.quantity ?? ""),
          cost: String(l.unitPrice ?? ""),
          gst: String(l.taxPercent ?? ""),
        }));

      const purchaseRequestData = {
        project_id: projectId || null,
        delivery_address: deliverTo || "",
        description: description || "",
        items,
      };

      if (isEdit && prId) {
        await updatePurchaseRequest({
          id: prId,
          body: purchaseRequestData,
        }).unwrap();
        toast.success("Purchase Request updated successfully.");
      } else {
        await createPurchaseRequest(purchaseRequestData).unwrap();
        toast.success("Purchase Request created successfully.");
      }
    } catch (err) {
      toast.error("Failed to save. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Build PO seed and open modal ----------
  const openCreatePOModal = () => {
    const selectedLines = lines.filter((l) => l._selected);
    const source = selectedLines.length ? selectedLines : lines;

    const initialLines = source.map((l) => ({
      productId: l.productId || "",
      productName: l.productName || "",
      productCategoryId: l.productCategoryId || "",
      productCategoryName: l.productCategoryName || "",
      make: l.make || "",
      uom: l.uom || "",
      quantity: Number(l.quantity || 0),
      unitPrice: Number(l.unitPrice || 0),
      taxPercent: Number(l.taxPercent || 0),
    }));

    setPoSeed({
      pr_id: prId || null,
      project_id: projectId || null,
      project_code: projectCode || "",
      p_id: pId || "",
      categories: category || [],
      categoryNames: (category || []).map(
        (id) => categoryIdToName[id] || String(id)
      ),
      initialLines,
    });
    setPoModalOpen(true);
  };

  // ---------- Shared styles/flags ----------
  const borderlessFieldSx = {
    border: "none",
    boxShadow: "none",
    bgcolor: "transparent",
    "--Input-radius": "0px",
    "--Select-radius": "0px",
    "--Input-paddingInline": "0px",
    "--Select-minHeight": "32px",
    "--Input-minHeight": "32px",
    "&:hover": { boxShadow: "none", bgcolor: "transparent" },
    "&:focus-within": { boxShadow: "none", outline: "none" },
  };

  const commonDisable = isView ? { disabled: true } : {};
  const selectedCode = (projectCode || "").trim();
  const rowsP = projectRows || [];
  const hasSelectedInList = rowsP.some((r) => r.code === selectedCode);

  // For category phantom options
  const idsInRows = new Set((categoryRows || [])?.map((r) => r._id));
  const missingSelected = (category || []).filter((id) => !idsInRows.has(id));

  const goToPOList = () => {
    const params = new URLSearchParams();
    if (prId) params.set("pr_id", prId);
    if (projectId) params.set("project_id", projectId);
    params.set("returnTo", location.pathname + location.search);
    navigate(`/purchase-order?${params.toString()}`);
  };

  const handlePoSubmitted = ({ created, updated, status, newPO }) => {
    if (created) setPoCount((c) => c + 1);
    setPoModalOpen(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 1200,
        ml: { xs: "0%", lg: "22%" },
        boxShadow: "md",
      }}
    >
      <Typography level="h3" sx={{ fontWeight: 700, mb: 1 }}>
        Purchase Request
      </Typography>

      {isView && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            mt: 1,
          }}
        >
          {/* Left: PR meta (PR Code + Created By) */}
          <Sheet
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: "lg",
              px: 1.5,
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <DescriptionOutlinedIcon fontSize="small" color="primary" />
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                PR Code
              </Typography>
              <Chip
                color="primary"
                size="sm"
                variant="solid"
                sx={{ fontWeight: 700 }}
              >
                {prno || "—"}
              </Chip>
            </Box>

            <Divider orientation="vertical" />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <PersonOutlineOutlinedIcon fontSize="small" color="primary" />
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                Created By
              </Typography>
              <Chip
                variant="soft"
                size="sm"
                sx={{ fontWeight: 700, pl: 0.5, pr: 1 }}
              >
                {createdBy || "—"}
              </Chip>
            </Box>
          </Sheet>

          {/* Right side: Purchase Orders + Create PO */}
          <Box display={"flex"} gap={2}>
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
                onClick={goToPOList}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goToPOList();
                }}
              >
                <LocalMallOutlinedIcon fontSize="small" color="primary" />
                <Box sx={{ lineHeight: 1.1 }}>
                  <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                    Purchase Orders
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                    {poCount}
                  </Typography>
                </Box>
              </Box>
            </Sheet>

            {/* Only show button if at least one line selected */}
            {isAnyProductChecked && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.25,
                  py: 0.75,
                }}
              >
                <Button
                  color="primary"
                  size="sm"
                  variant="solid"
                  startDecorator={<Add />}
                  onClick={openCreatePOModal}
                >
                  Create PO
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl", mb: 2 }}>
        <Grid container spacing={2}>
          {/* Project Code */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Code
            </Typography>

            {isCreate ? (
              <Select
                value={projectCode || ""}
                onChange={(_, v) => {
                  if (v === "__SEARCH_MORE__") {
                    setProjectModalOpen(true);
                    return;
                  }
                  const row = projectRows.find((r) => r.code === v);
                  if (row) onPickProject(row);
                }}
                placeholder={
                  projLoading ? "Loading..." : "Search or pick a project"
                }
                renderValue={() => selectedCode || "Select project code"}
                disabled={shouldFetchProject || isView}
              >
                {!hasSelectedInList && selectedCode && (
                  <Option key={`selected-${selectedCode}`} value={selectedCode}>
                    {selectedCode}
                  </Option>
                )}
                {(projectRows || [])?.map((r) => (
                  <Option key={r._id} value={r.code}>
                    {r.code} - {r.name}
                  </Option>
                ))}
                <Option value="__SEARCH_MORE__" color="primary">
                  Search more…
                </Option>
              </Select>
            ) : (
              <Input
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="Project Code"
                disabled={shouldFetchProject || isView}
              />
            )}
          </Grid>

          {/* Project Name */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Name
            </Typography>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={shouldFetchProject || isView}
            />
          </Grid>

          {/* Project Location */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Project Location
            </Typography>
            <Input
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              disabled={shouldFetchProject || isView}
            />
          </Grid>

          {/* Category (multi) */}
          {!isView && (
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
                Category
              </Typography>

              <Select
                multiple
                value={category}
                onChange={(_, v) => {
                  if (Array.isArray(v) && v.includes("__SEARCH_MORE_CAT__")) {
                    setCategoryModalOpen(true);
                    return;
                  }
                  setCategory(v || []);
                  setCategoryIdToName((prev) => {
                    const next = {};
                    (v || []).forEach((id) => {
                      next[id] = prev[id] || categoryIdToName[id] || String(id);
                    });
                    return next;
                  });
                }}
                placeholder={
                  catLoading ? "Loading..." : "Search or pick categories"
                }
                renderValue={(selectedOptions) =>
                  selectedOptions?.length ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {selectedOptions.map((opt) => (
                        <Chip key={String(opt.value)} size="sm">
                          {typeof opt.label === "string"
                            ? opt.label
                            : (categoryIdToName[opt.value] ??
                              String(opt.value))}
                        </Chip>
                      ))}
                    </Box>
                  ) : (
                    "Search or pick categories"
                  )
                }
                {...commonDisable}
              >
                {/* keep already-selected values visible even if not in current page */}
                {missingSelected?.map((id) => (
                  <Option key={`selected-${id}`} value={id}>
                    {categoryIdToName[id] || String(id)}
                  </Option>
                ))}

                {(categoryRows || []).map((r) => (
                  <Option key={r._id} value={r._id}>
                    {r.name}
                  </Option>
                ))}

                <Option value="__SEARCH_MORE_CAT__" color="primary">
                  Search more…
                </Option>
              </Select>
            </Grid>
          )}

          {/* Fetch from BOM */}
          {!isView && (
            <Grid xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={askConfirmation}
                onChange={(e) => setAskConfirmation(e.target.checked)}
                label="Fetch From BOM"
                disabled={isView}
              />
            </Grid>
          )}

          {/* Deliver To */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 700 }}>
              Deliver To
            </Typography>
            <Input
              value={deliverTo}
              onChange={(e) => setDeliverTo(e.target.value)}
              {...(commonDisable || {})}
            />
          </Grid>
        </Grid>
      </Sheet>

      {/* Products Table */}
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
            borderCollapse: "separate",
            borderSpacing: 0,
            "& th, & td": {
              borderBottom:
                "1px solid var(--joy-palette-neutral-outlinedBorder)",
              p: 1,
              textAlign: "left",
            },
            "& th": { fontWeight: 700, bgcolor: "background.level1" },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "26%", fontWeight: 700 }}>Product</th>
              <th style={{ width: "16%", fontWeight: 700 }}>Category</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Make</th>
              <th style={{ width: "8%", fontWeight: 700 }}>Qty</th>
              <th style={{ width: "12%", fontWeight: 700 }}>Unit Price</th>
              <th style={{ width: "10%", fontWeight: 700 }}>Tax %</th>
              <th style={{ width: "12%", fontWeight: 700 }}>Amount</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const base = Number(l.quantity || 0) * Number(l.unitPrice || 0);
              const taxAmt = (base * Number(l.taxPercent || 0)) / 100;
              const gross = base + taxAmt;

              const selectedId = l.productId;
              const inlineHasSelected =
                !!selectedId &&
                (productRows || []).some((p) => p._id === selectedId);

              return (
                <tr key={l.id}>
                  <td>
                    <Select
                      variant="plain"
                      size="sm"
                      value={l.productId || ""}
                      sx={{
                        border: "none",
                        boxShadow: "none",
                        bgcolor: "transparent",
                      }}
                      onChange={(_, v) => {
                        if (v === "__SEARCH_MORE_PROD__") {
                          setActiveLineId(l.id);
                          setProductModalOpen(true);
                          return;
                        }
                        const prod = (productRows || []).find(
                          (p) => p._id === v
                        );
                        if (prod) {
                          const name =
                            getProdField(prod, "Product Name") ||
                            prod?.sku_code ||
                            "";
                          const cost = Number(getProdField(prod, "Cost") || 0);
                          const gst = Number(getProdField(prod, "GST") || 0);
                          const make = getProdField(prod, "Make") || "";
                          const uom = getProdField(prod, "UOM") || "";
                          const catId = prod?.category?._id || "";
                          const catName = prod?.category?.name || "";
                          updateLine(l.id, "productId", prod._id);
                          updateLine(l.id, "productName", name);
                          updateLine(l.id, "productCategoryId", catId);
                          updateLine(l.id, "productCategoryName", catName);
                          updateLine(l.id, "unitPrice", cost);
                          updateLine(l.id, "taxPercent", gst);
                          updateLine(l.id, "make", make);
                          updateLine(l.id, "uom", uom);
                        } else {
                          updateLine(l.id, "productId", v || "");
                          updateLine(l.id, "productName", "");
                          updateLine(l.id, "productCategoryId", "");
                          updateLine(l.id, "productCategoryName", "");
                        }
                      }}
                      placeholder={
                        category.length === 0
                          ? "Pick category first"
                          : "Select product"
                      }
                      disabled={isView || category.length === 0}
                      renderValue={() =>
                        l.productName
                          ? `${l.productName}`
                          : l.productId
                            ? l.productId
                            : "Select product"
                      }
                    >
                      {!inlineHasSelected && selectedId && (
                        <Option key={`sel-${selectedId}`} value={selectedId}>
                          {l.productName || selectedId}
                        </Option>
                      )}

                      {(productRows || []).map((p) => {
                        const name =
                          getProdField(p, "Product Name") || p?.sku_code || "";
                        const catName = p?.category?.name || "";
                        const label = p.sku_code
                          ? `${p.sku_code} – ${name}${
                              catName ? ` (${catName})` : ""
                            }`
                          : `${name}${catName ? ` (${catName})` : ""}`;
                        return (
                          <Option key={p._id} value={p._id}>
                            {label}
                          </Option>
                        );
                      })}

                      <Option value="__SEARCH_MORE_PROD__" color="primary">
                        Search more…
                      </Option>
                    </Select>
                  </td>

                  <td>{l.productCategoryName || "—"}</td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      value={l.make}
                      onChange={(e) => updateLine(l.id, "make", e.target.value)}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.quantity}
                      onChange={(e) =>
                        updateLine(l.id, "quantity", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "1" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.unitPrice}
                      onChange={(e) =>
                        updateLine(l.id, "unitPrice", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      type="number"
                      value={l.taxPercent}
                      onChange={(e) =>
                        updateLine(l.id, "taxPercent", e.target.value)
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                      disabled={isView}
                    />
                  </td>

                  <td>
                    <Chip variant="soft">₹ {(base + taxAmt).toFixed(2)}</Chip>
                  </td>

                  {!isView && (
                    <td>
                      <IconButton
                        variant="plain"
                        color="danger"
                        onClick={() => removeLine(l.id)}
                        disabled={isView}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </td>
                  )}
                  {isView && (
                    <td>
                      <Checkbox
                        checked={!!l._selected}
                        onChange={(e) =>
                          handleProductCheckbox(e.target.checked, l.id)
                        }
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Box>

        {!isView && (
          <Box sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}>
            <Button size="sm" variant="plain" onClick={addLine}>
              Add a Product
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Description…
        </Typography>
        <Textarea
          minRows={3}
          placeholder="Write Description of PR"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isView}
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
              <Typography level="body-sm">Untaxed Amount:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.untaxed.toFixed(2)}
              </Typography>

              <Typography level="body-sm">Tax:</Typography>
              <Typography level="body-sm" fontWeight={700}>
                ₹ {amounts.tax.toFixed(2)}
              </Typography>

              <Typography level="title-md" sx={{ mt: 0.5 }}>
                Total:
              </Typography>
              <Typography level="title-md" fontWeight={800} sx={{ mt: 0.5 }}>
                ₹ {amounts.total.toFixed(2)}
              </Typography>
            </Box>
          </Sheet>
        </Box>
      </Sheet>

      {/* Actions */}
      {!isView && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button
            variant="soft"
            startDecorator={<RestartAlt />}
            onClick={resetForm}
            disabled={submitting}
          >
            Reset
          </Button>
          <Button
            color="primary"
            startDecorator={<Send />}
            loading={submitting || prLoading}
            onClick={() => handleSubmit("submit")}
          >
            {isEdit ? "Update PR" : "Submit PR"}
          </Button>
        </Box>
      )}

      {/* Project Search More Modal */}
      <SearchPickerModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onPick={onPickProject}
        title="Search: Project"
        columns={projectColumns}
        fetchPage={fetchProjectsPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* Category Search More Modal (multi) */}
      <SearchPickerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onPick={onPickCategoryName}
        title="Search: Category"
        columns={categoryColumns}
        fetchPage={fetchCategoriesPageCat}
        searchKey="name"
        pageSize={7}
        multi
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* Product Search More Modal */}
      <SearchPickerModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setActiveLineId(null);
        }}
        onPick={onPickProduct}
        title="Search: Product"
        columns={productColumns}
        fetchPage={fetchProductsPage}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {/* PO Modal */}
      <Modal open={poModalOpen} onClose={() => setPoModalOpen(false)}>
        <ModalDialog
          size="lg"
          sx={{
            width: "full",
            maxWidth: "98vw",
            p: 0,
            overflow: "auto",
            ml: { xs: "12%", lg: "5%" },
          }}
        >
          <ModalClose />
          {poSeed && (
            <AddPurchaseOrder
              onSuccess={handlePoSubmitted}
              onClose={() => setPoModalOpen(false)}
              pr_id={poSeed.pr_id}
              p_id={poSeed.p_id}
              project_id={poSeed.project_id}
              project_code={poSeed.project_code}
              categories={poSeed.categories}
              categoryNames={poSeed.categoryNames}
              initialLines={poSeed.initialLines}
            />
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}
