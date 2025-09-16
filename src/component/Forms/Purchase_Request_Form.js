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
  Tooltip,
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Add from "@mui/icons-material/Add";
import { ClickAwayListener } from "@mui/base";

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
  useLazyFetchFromBOMQuery,
} from "../../redux/camsSlice";

import {
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useGetProductsQuery,
  useLazyGetProductsQuery,
} from "../../redux/productsSlice";

import SearchPickerModal from "../SearchPickerModal";
import AddPurchaseOrder from "./Add_Po";
import { toast } from "react-toastify";

// NEW: embedded product creator
import ProductForm from "./Product_Form";

const EMPTY_LINE = () => ({
  id: crypto.randomUUID(),
  _selected: false,
  productId: "",
  productName: "",
  productCategoryId: "",
  productCategoryName: "",
  briefDescription: "",
  make: "",
  uom: "",
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  note: "",
});

// ---------- DARK DISABLED HELPERS ----------
const DISABLED_SX = {
  opacity: 1, // prevent Joy default dimming
  pointerEvents: "none", // truly non-interactive
  bgcolor: "neutral.softBg", // darker bg; try 'neutral.plainActiveBg' for even darker
  color: "text.primary",
  borderColor: "neutral.outlinedBorder",
};

const disabledInputProps = {
  disabled: true,
  sx: DISABLED_SX,
  slotProps: { input: { sx: { color: "text.primary" } } },
};

const disabledTextareaProps = {
  disabled: true,
  sx: DISABLED_SX,
  slotProps: { textarea: { sx: { color: "text.primary" } } },
};

const disabledSelectProps = {
  disabled: true,
  sx: DISABLED_SX,
  // ensure the visible button area also looks dark
  slotProps: {
    button: { sx: { color: "text.primary", bgcolor: "neutral.softBg" } },
  },
};
// ------------------------------------------

const compact = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const round3 = (n) => Math.round(n);
const firstBrand = (s) =>
  compact(s)
    .split(/\/|,|\||\bor\b/i)[0]
    ?.trim() || "";

const pick = (row, ...keys) => {
  for (const k of keys) if (row[k] !== undefined) return row[k];
  return "";
};

export function mapBoqRowToLine(row, idx = 0) {
  const category = pick(row, "Category", "CATEGORY");
  const itemName = compact(pick(row, "ITEM NAME", "Item Name", "Item"));
  const rating = compact(pick(row, "RATING", "Rating", "Specs"));
  const qtyRaw = toNum(pick(row, "R0", "Quantity", "Qty"));
  const qty = round3(qtyRaw);
  const uom = compact(pick(row, "UoM", "UOM", "UOM"));
  const unitPrice = toNum(pick(row, "UNIT PRICE", "Unit Price", "Rate"));
  const gst = toNum(pick(row, "GST", "Tax %", "GST %"));
  const makeFull = pick(row, "TENTATIVE MAKE", "MAKE");
  const make = firstBrand(makeFull);
  const sno = pick(row, "S. NO.", "S.NO.", "S.NO", "SNO", "S No.");

  const productLabel = rating;
  const description = itemName;

  return {
    id: crypto?.randomUUID?.() ?? `boq-${Date.now()}-${idx}`,
    productId: `boq:${sno || idx + 1}`,
    productName: productLabel,
    briefDescription: description,
    productCategoryId: "",
    productCategoryName: category || "",
    make,
    uom,
    quantity: qty,
    unitPrice,
    taxPercent: gst || 0,
  };
}

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

const getProdField = (row, fieldName) => {
  if (!row?.data) return "";
  const f = row.data.find((d) => d?.name === fieldName);
  return f?.values?.[0]?.input_values ?? "";
};

// NEW: normalize quick "data" for a created product if API didn't return full array
const buildProductDataFromFields = ({
  name,
  description,
  cost,
  gst,
  make,
  uom,
}) => [
  { name: "Product Name", values: [{ input_values: String(name ?? "") }] },
  {
    name: "Description",
    values: [{ input_values: String(description ?? "") }],
  },
  { name: "Cost", values: [{ input_values: String(cost ?? "") }] },
  { name: "GST", values: [{ input_values: String(gst ?? "") }] },
  { name: "Make", values: [{ input_values: String(make ?? "") }] },
  { name: "UOM", values: [{ input_values: String(uom ?? "") }] },
];

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
  const [deliverTo, setDeliverTo] = useState("");
  const [category, setCategory] = useState([]);
  const [categoryIdToName, setCategoryIdToName] = useState({});
  const [description, setDescription] = useState("");
  const [poCount, setPoCount] = useState(0);
  const [createdBy, setCreatedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lines
  const [lines, setLines] = useState([EMPTY_LINE()]);

  // Per-line, lazily-fetched product results keyed by lineId
  const [lineProducts, setLineProducts] = useState({});

  // PO modal
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poSeed, setPoSeed] = useState(null);

  // NEW: per-category BOM toggle + loader
  const [bomFetchByCat, setBomFetchByCat] = useState({});
  const [bomFetching, setBomFetching] = useState({});

  // NEW: inline Create Product modal state
  const [prodCreateOpen, setProdCreateOpen] = useState(false);
  const [prodCreateInitial, setProdCreateInitial] = useState(null);
  const [prodCreateLineId, setProdCreateLineId] = useState(null);

  const [productOpenByLine, setProductOpenByLine] = useState({});
  const setProdOpen = (id, v) =>
    setProductOpenByLine((prev) => ({ ...prev, [id]: v }));



  useEffect(() => {
    if (isCreate && projectId && !projectCode) {
      setProjectCode(projectId);
    }
  }, [isCreate, projectId, projectCode]);

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
    console.log(d);
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

  // ---------- PRODUCTS (legacy global fetch; kept for fallback) ----------
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const productLimit = 7;

  const categoryParam = category?.length ? category.join(",") : "";
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
  const productRowsGlobal = productsResp?.data || [];
  const [triggerGetProducts] = useLazyGetProductsQuery();

  // Product modal (per line)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState(null);

  // Show SKU, Product Name, and Category in the modal
  // Show SKU, Product Name, Category, and Make in the modal
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
    {
      key: "make",
      label: "Make",
      width: 160,
      render: (row) => getProdField(row, "Make") || "-",
    },
  ];

  // Modal fetch — now respecting the active row's category
  const fetchProductsPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const actLine = lines.find((x) => x.id === activeLineId);
    const catForModal = actLine?.productCategoryId
      ? String(actLine.productCategoryId)
      : categoryParam;

    const res = await triggerGetProducts(
      { search, page, limit: pageSize, category: catForModal },
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
    const pickedDescription = getProdField(row, "Description" || "");
    const pickedUOM =
      getProdField(row, "UOM" || "") || getProdField(row, "UoM" || "");
    const catId = row?.category?._id || "";
    const catName = row?.category?.name || "";

    setLines((prev) =>
      prev.map((l) =>
        l.id === activeLineId
          ? {
              ...l,
              productId: row._id || "",
              productName: pickedName,
              briefDescription: pickedDescription,
              productCategoryId: catId || l.productCategoryId,
              productCategoryName: catName || l.productCategoryName,
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
    setDeliverTo(d?.delivery_address || "");
    setPoCount(d?.overall_total_number_of_po || 0);
    setDescription(d?.description || "");

    const incomingItems = Array.isArray(d?.items) ? d.items : [];

    const catsFromItems = Array.from(
      new Set(incomingItems.map((it) => it?.item_id?._id).filter(Boolean))
    );

    if (Array.isArray(d?.category) && d.category.length) {
      setCategory(d.category);
    } else {
      setCategory(catsFromItems);
    }

    setCategoryIdToName((prev) => {
      const next = { ...prev };
      incomingItems.forEach((it) => {
        const id = it?.item_id?._id;
        const nm = it?.item_id?.name;
        if (id && nm) next[id] = nm;
      });
      return next;
    });

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
              briefDescription: l.description || "",
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

  // prune lines + bom toggle map when categories change
  useEffect(() => {
    if (!Array.isArray(category) || category.length === 0) return;
    if (!Array.isArray(lines) || lines.length === 0) return;

    setLines((prev) => {
      const selectedSet = new Set(category || []);
      const filtered = prev.filter((l) => {
        if (!l.productId && !l.productCategoryId) return true;
        if (l.productCategoryId) {
          return selectedSet.has(l.productCategoryId);
        }
        return true;
      });
      return filtered.length ? filtered : [EMPTY_LINE()];
    });

    // Drop BOM toggle state for removed categories
    setBomFetchByCat((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cid) => {
        if (!category.includes(cid)) delete next[cid];
      });
      return next;
    });
  }, [category, lines]);

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
    setDeliverTo("");
    setCategory([]);
    setCategoryIdToName({});
    setDescription("");
    setLines([EMPTY_LINE()]);
    setLineProducts({});
    setBomFetchByCat({});
    setBomFetching({});
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
          description: l.briefDescription || "",
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
        resetForm();
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
      briefDescription: l.briefDescription || "",
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
      pr_no:prno || null,
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

  const handlePoSubmitted = ({ created }) => {
    if (created) setPoCount((c) => c + 1);
    setPoModalOpen(false);
  };

  const [triggerFetchFromBOM] = useLazyFetchFromBOMQuery();

  // ---------- Per-category BOM fetch helpers ----------
  const clearBOMForCategory = (catId) => {
    setLines((prev) => {
      const toRemoveIds = new Set(
        prev
          .filter((l) => l.fromBOM && l.bomCategoryId === catId)
          .map((l) => l.id)
      );
      // Clear cached product options for removed lines
      setLineProducts((old) => {
        const next = { ...old };
        toRemoveIds.forEach((lid) => delete next[lid]);
        return next;
      });
      return prev.filter((l) => !(l.fromBOM && l.bomCategoryId === catId));
    });
  };

  const fetchFromBOMForCategory = async (catId) => {
    const catName =
      categoryIdToName[catId] ||
      (categoryRows || []).find((r) => r._id === catId)?.name ||
      "";

    if (!projectId || !catName) {
      toast.error("Project and category are required to fetch BOM.");
      return;
    }

    try {
      setBomFetching((prev) => ({ ...prev, [catId]: true }));

      const args = {
        project_id: projectId,
        category_mode: "exact",
        category_logic: "or",
        category: catName,
      };

      const res = await triggerFetchFromBOM(args).unwrap();
      const rows = Array.isArray(res?.data) ? res.data : [];

      let mapped = rows.map((r, i) => mapBoqRowToLine(r, i));

      const batchId = Date.now();
      mapped = mapped.map((m, idx) => ({
        id: m.id ?? crypto?.randomUUID?.() ?? `row-${batchId}-${idx + 1}`,
        ...m,
        productCategoryId: catId,
        productCategoryName: catName,
        fromBOM: true,
        bomBatchId: batchId,
        bomCategoryId: catId,
      }));

      setLines((prev) => {
        const keep = prev.filter(
          (l) => !(l.fromBOM && l.bomCategoryId === catId)
        );
        const next = [...keep];

        const isEmptyLine = (line) => !line?.productId && !line?.productName;

        let mi = 0;
        for (let i = 0; i < next.length && mi < mapped.length; i++) {
          if (isEmptyLine(next[i])) {
            next[i] = {
              ...next[i],
              ...mapped[mi++],
              fromBOM: true,
              bomCategoryId: catId,
            };
          }
        }
        while (mi < mapped.length) next.push(mapped[mi++]);

        return next;
      });

      setBomFetchByCat((prev) => ({ ...prev, [catId]: true }));
      toast.success(`Fetched BOM items for "${catName}".`);
    } catch (e) {
      console.error("Fetch BOM failed:", e);
      toast.error("Failed to fetch BOM for this category.");
      setBomFetchByCat((prev) => ({ ...prev, [catId]: false }));
    } finally {
      setBomFetching((prev) => ({ ...prev, [catId]: false }));
    }
  };

  const fetchProductsForLineCategory = async (lineId, categoryId) => {
    try {
      const res = await triggerGetProducts(
        {
          search: "",
          page: 1,
          limit: productLimit,
          category: String(categoryId),
        },
        true
      );
      const rows = res?.data?.data || [];
      setLineProducts((prev) => ({ ...prev, [lineId]: rows }));
    } catch (e) {
      console.error(
        "Failed to load products for category",
        { lineId, categoryId },
        e
      );
      setLineProducts((prev) => ({ ...prev, [lineId]: [] }));
    }
  };

  // NEW: open embedded creator with row data/category prefilled
  const openCreateProductForLine = (line) => {
    if (!line?.productCategoryId) {
      toast.error("Pick the row's Category first.");
      return;
    }
    setProdCreateLineId(line.id);
    setProdCreateInitial({
      name: line.productName || "",
      Description: line.briefDescription || "",
      make: line.make || "",
      unitOfMeasure: line.uom || "",
      cost: line.unitPrice || "",
      gst: line.taxPercent || "",
      productCategory: line.productCategoryId,
      productCategoryName: line.productCategoryName,
    });
    setProdCreateOpen(true);
  };

  // NEW: after create, paste values into row + cache option
  const handleProductCreatedIntoRow = (p) => {
    try {
      if (!p || !prodCreateLineId) return;

      const name = getProdField(p, "Product Name") || p?.sku_code || "";
      const description = getProdField(p, "Description") || "";
      const cost = Number(getProdField(p, "Cost") || 0);
      const gst = Number(getProdField(p, "GST") || 0);
      const make = getProdField(p, "Make") || "";
      const uom = getProdField(p, "UOM") || getProdField(p, "UoM") || "";

      const catId = p?.category?._id || p?.category || "";
      const catName = p?.category?.name || categoryIdToName[catId] || "";

      // 1) fill row
      setLines((prev) =>
        prev.map((l) =>
          l.id === prodCreateLineId
            ? {
                ...l,
                productId: p?._id || "",
                productName: name,
                briefDescription: description,
                productCategoryId: catId || l.productCategoryId,
                productCategoryName: catName || l.productCategoryName,
                unitPrice: cost,
                taxPercent: gst,
                make,
                uom,
              }
            : l
        )
      );

      // 2) push into row cache so Select shows it
      setLineProducts((prev) => {
        const current = Array.isArray(prev[prodCreateLineId])
          ? [...prev[prodCreateLineId]]
          : [];
        const normalized = {
          _id: p?._id,
          category: p?.category?._id
            ? p.category
            : { _id: catId, name: catName },
          data: Array.isArray(p?.data)
            ? p.data
            : buildProductDataFromFields({
                name,
                description,
                cost,
                gst,
                make,
                uom,
              }),
          sku_code: p?.sku_code || "",
        };
        const ix = current.findIndex((x) => x?._id === normalized._id);
        if (ix >= 0) current[ix] = normalized;
        else current.unshift(normalized);
        return { ...prev, [prodCreateLineId]: current };
      });

      toast.success("Product created and filled into the row.");
    } finally {
      setProdCreateOpen(false);
      setProdCreateInitial(null);
      setProdCreateLineId(null);
    }
  };

  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);
  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) return JSON.parse(userData);
    return null;
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
      <Typography level="h3" sx={{ fontWeight: 600, mb: 1 }}>
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

            {isAnyProductChecked &&
              user?.department !== "CAM" &&
              user?.department !== "Projects" && (
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
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
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
                {...(isView ? disabledSelectProps : {})}
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
                {...(isView ? disabledInputProps : {})}
              />
            )}
          </Grid>

          {/* Project Name */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
              Project Name
            </Typography>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              {...disabledInputProps}
            />
          </Grid>

          {/* Project Location */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
              Project Location
            </Typography>
            <Input
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              {...disabledInputProps}
            />
          </Grid>

          {/* Category (multi) */}
          {!isView && (
            <Grid xs={12} md={6}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
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

                  const nextIds = Array.isArray(v) ? v : [];
                  const prevIds = Array.isArray(category) ? category : [];

                  const removedIds = prevIds.filter(
                    (catId) => !nextIds.includes(catId)
                  );

                  if (removedIds.length) {
                    const removedNamesNorm = removedIds
                      .map(
                        (catId) =>
                          categoryIdToName[catId] ||
                          (categoryRows || []).find((r) => r._id === catId)
                            ?.name
                      )
                      .filter(Boolean)
                      .map((s) => s.toLowerCase().trim());

                    // prune lines for removed categories
                    setLines((prev) =>
                      prev.filter((l) => {
                        const idHit =
                          !!l.productCategoryId &&
                          removedIds.includes(l.productCategoryId);
                        const nameHit = removedNamesNorm.includes(
                          String(l.productCategoryName || "")
                            .toLowerCase()
                            .trim()
                        );
                        return !(idHit || nameHit);
                      })
                    );

                    // also drop cached products for lines that no longer match
                    setLineProducts((prev) => {
                      const next = { ...prev };
                      for (const line of lines) {
                        if (
                          removedIds.includes(line.productCategoryId) ||
                          removedNamesNorm.includes(
                            String(line.productCategoryName || "")
                              .toLowerCase()
                              .trim()
                          )
                        ) {
                          delete next[line.id];
                        }
                      }
                      return next;
                    });

                    // drop BOM toggle state for removed categories
                    setBomFetchByCat((prev) => {
                      const next = { ...prev };
                      removedIds.forEach((id) => delete next[id]);
                      return next;
                    });
                    setBomFetching((prev) => {
                      const next = { ...prev };
                      removedIds.forEach((id) => delete next[id]);
                      return next;
                    });
                  }

                  // update selection
                  setCategory(nextIds);

                  // update id->name map
                  setCategoryIdToName((prev) => {
                    const nextMap = { ...prev };
                    nextIds.forEach((catId) => {
                      if (!nextMap[catId]) {
                        nextMap[catId] =
                          prev[catId] ||
                          categoryIdToName[catId] ||
                          (categoryRows || []).find((r) => r._id === catId)
                            ?.name ||
                          String(catId);
                      }
                    });
                    removedIds.forEach((catId) => {
                      delete nextMap[catId];
                    });
                    return nextMap;
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
                            : categoryIdToName[opt.value] ?? String(opt.value)}
                        </Chip>
                      ))}
                    </Box>
                  ) : (
                    "Search or pick categories"
                  )
                }
              >
                {missingSelected?.map((catId) => (
                  <Option key={`selected-${catId}`} value={catId}>
                    {categoryIdToName[catId] || String(catId)}
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

          {/* Fetch from BOM toggles */}
          {!isView && category.length > 0 && (
            <Grid xs={12}>
              <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
                Fetch from BOM (per category)
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 1,
                }}
              >
                {category.map((catId) => {
                  const name = categoryIdToName[catId] || String(catId);
                  const checked = !!bomFetchByCat[catId];
                  const loading = !!bomFetching[catId];
                  return (
                    <Sheet
                      key={catId}
                      variant="outlined"
                      sx={{
                        px: 1.25,
                        py: 0.75,
                        borderRadius: "md",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip size="sm" variant="soft">
                          {name}
                        </Chip>
                      </Box>
                      <Tooltip title="Fetch BOM items for this category">
                        <span>
                          <Checkbox
                            label="Fetch from BOM"
                            checked={checked}
                            disabled={loading}
                            onChange={async (e) => {
                              const on = e.target.checked;
                              if (on) {
                                await fetchFromBOMForCategory(catId);
                              } else {
                                clearBOMForCategory(catId);
                                setBomFetchByCat((prev) => ({
                                  ...prev,
                                  [catId]: false,
                                }));
                              }
                            }}
                          />
                        </span>
                      </Tooltip>
                    </Sheet>
                  );
                })}
              </Box>
            </Grid>
          )}

          {/* Deliver To */}
          <Grid xs={12} md={6}>
            <Typography level="body-md" sx={{ mb: 0.5, fontWeight: 600 }}>
              Deliver To
            </Typography>
            <Input
              value={deliverTo}
              onChange={(e) => setDeliverTo(e.target.value)}
              {...(isView ? disabledInputProps : {})}
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
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
            "& th, & td": {
              borderBottom:
                "1px solid var(--joy-palette-neutral-outlinedBorder)",
              p: 1,
              textAlign: "left",
              verticalAlign: "top",
            },
            "& th": { fontWeight: 700, bgcolor: "background.level1" },
            "& td:nth-of-type(2)": {
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "16%", fontWeight: 700 }}>Category</th>
              <th style={{ width: "18%", fontWeight: 700 }}>Product</th>
              <th style={{ width: "18%", fontWeight: 700 }}>
                Brief Description
              </th>
              <th style={{ width: "10%", fontWeight: 700 }}>Make</th>
              <th style={{ width: "12%", fontWeight: 700 }}>Qty</th>
              <th style={{ width: "8%", fontWeight: 700 }}>UoM</th>
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

              const rowProductRows = lineProducts[l.id] ?? [];

              const selectedProdId = l.productId;
              const inlineHasSelected =
                !!selectedProdId &&
                (rowProductRows || []).some((p) => p._id === selectedProdId);

              return (
                <tr key={l.id}>
                  <td>
                    <Select
                      variant="plain"
                      size="sm"
                      value={l.productCategoryId || ""}
                      onChange={async (_, catId) => {
                        const pickedId = catId || "";
                        const pickedName =
                          categoryIdToName[pickedId] ||
                          (categoryRows || []).find((r) => r._id === pickedId)
                            ?.name ||
                          "";
                        updateLine(l.id, "productCategoryId", pickedId);
                        updateLine(l.id, "productCategoryName", pickedName);
                        updateLine(l.id, "productId", "");
                        updateLine(l.id, "productName", "");
                        updateLine(l.id, "briefDescription", "");
                        updateLine(l.id, "uom", "");
                        updateLine(l.id, "make", "");
                        updateLine(l.id, "unitPrice", 0);
                        updateLine(l.id, "taxPercent", 0);

                        if (pickedId) {
                          await fetchProductsForLineCategory(l.id, pickedId);
                        } else {
                          setLineProducts((prev) => ({ ...prev, [l.id]: [] }));
                        }
                      }}
                      placeholder={
                        category.length === 0
                          ? "Pick categories above first"
                          : "Select category"
                      }
                      renderValue={() =>
                        l.productCategoryName || "Select category"
                      }
                      slotProps={{
                        listbox: {
                          sx: {
                            "& li": {
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            },
                          },
                        },
                      }}
                      {...(isView ? disabledSelectProps : {})}
                    >
                      {(category || []).map((catId) => (
                        <Option key={catId} value={catId}>
                          {categoryIdToName[catId] || String(catId)}
                        </Option>
                      ))}
                    </Select>
                  </td>
                  <td>
                    <Box sx={{ display: "inline-block" }}>
                      <Select
                        variant="plain"
                        size="sm"
                        value={l.productId || ""}
                        sx={{
                          width: "fit-content",
                          minWidth: 120,
                          maxWidth: 220,
                          border: "none",
                          boxShadow: "none",
                          bgcolor: "transparent",
                          p: 0,
                        }}
                        slotProps={{
                          button: {
                            sx: {
                              whiteSpace: "normal",
                              textAlign: "left",
                              overflowWrap: "anywhere",
                              alignItems: "flex-start",
                              py: 0.25,
                              ...(isView
                                ? {
                                    bgcolor: "neutral.softBg",
                                    color: "text.primary",
                                  }
                                : {}),
                            },
                          },
                          listbox: {
                            sx: {
                              "& li": {
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                width: "fit-content",
                                minWidth: 120,
                                maxWidth: 220,
                              },
                            },
                          },
                        }}
                        onChange={(_, v) => {
                          if (v === "__SEARCH_MORE_PROD__") {
                            setActiveLineId(l.id);
                            setProductModalOpen(true);
                            return;
                          }
                          if (v === "__CREATE_PRODUCT__") {
                            openCreateProductForLine(l);
                            return;
                          }
                          const prod = (rowProductRows || []).find(
                            (p) => p._id === v
                          );
                          if (prod) {
                            const name =
                              getProdField(prod, "Product Name") || "";
                            const description = getProdField(
                              prod,
                              "Description"
                            );
                            const cost = Number(
                              getProdField(prod, "Cost") || 0
                            );
                            const gst = Number(getProdField(prod, "GST") || 0);
                            const make = getProdField(prod, "Make") || "";
                            const uom =
                              getProdField(prod, "UOM") ||
                              getProdField(prod, "UoM") ||
                              "";
                            const catId =
                              prod?.category?._id || l.productCategoryId || "";
                            const catName =
                              prod?.category?.name ||
                              l.productCategoryName ||
                              "";

                            updateLine(l.id, "productId", prod._id);
                            updateLine(l.id, "productName", name);
                            updateLine(l.id, "briefDescription", description);
                            updateLine(l.id, "productCategoryId", catId);
                            updateLine(l.id, "productCategoryName", catName);
                            updateLine(l.id, "unitPrice", cost);
                            updateLine(l.id, "taxPercent", gst);
                            updateLine(l.id, "make", make);
                            updateLine(l.id, "uom", uom);
                          } else {
                            // cleared
                            updateLine(l.id, "productId", v || "");
                            updateLine(l.id, "productName", "");
                            updateLine(l.id, "briefDescription", "");
                            updateLine(
                              l.id,
                              "productCategoryId",
                              l.productCategoryId
                            );
                            updateLine(
                              l.id,
                              "productCategoryName",
                              l.productCategoryName
                            );
                          }
                          // no need to manually close; Joy Select closes itself on outside click
                        }}
                        placeholder={
                          !l.productCategoryId
                            ? "Pick row category first"
                            : rowProductRows.length
                              ? "Select product"
                              : "No products — search more…"
                        }
                        renderValue={() => (
                          <Typography
                            level="body-sm"
                            sx={{
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            {l.productName
                              ? l.productName
                              : l.productId
                                ? l.productId
                                : "Select product"}
                          </Typography>
                        )}
                        {...(isView ? { disabled: true, sx: DISABLED_SX } : {})}
                      >
                        {/* keep selected if not in current options */}
                        {!inlineHasSelected && selectedProdId && (
                          <Option
                            key={`sel-${selectedProdId}`}
                            value={selectedProdId}
                            sx={{
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {l.productName || selectedProdId}
                          </Option>
                        )}

                        {(rowProductRows || []).map((p) => {
                          const name =
                            getProdField(p, "Product Name") ||
                            p?.sku_code ||
                            "";
                          const catName = p?.category?.name || "";
                          const label = p.sku_code
                            ? `${p.sku_code} – ${name}${catName ? ` (${catName})` : ""}`
                            : `${name}${catName ? ` (${catName})` : ""}`;
                          return (
                            <Option
                              key={p._id}
                              value={p._id}
                              sx={{
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {label}
                            </Option>
                          );
                        })}

                        <Option value="__SEARCH_MORE_PROD__" color="primary">
                          Search more…
                        </Option>

                        {!!l.productCategoryId && (
                          <Option value="__CREATE_PRODUCT__" color="success">
                            + Create new product…
                          </Option>
                        )}
                      </Select>
                    </Box>
                  </td>

                  <td>{l.briefDescription}</td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      value={l.make}
                      onChange={(e) => updateLine(l.id, "make", e.target.value)}
                      {...(isView ? disabledInputProps : {})}
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
                      slotProps={{
                        input: {
                          min: 0,
                          step: "1",
                          ...(isView ? { sx: { color: "text.primary" } } : {}),
                        },
                      }}
                      {...(isView ? { disabled: true, sx: DISABLED_SX } : {})}
                    />
                  </td>

                  <td>
                    <Input
                      variant="plain"
                      size="sm"
                      value={l.uom}
                      onChange={(e) => updateLine(l.id, "uom", e.target.value)}
                      slotProps={{
                        input: {
                          ...(isView ? { sx: { color: "text.primary" } } : {}),
                        },
                      }}
                      {...(isView ? { disabled: true, sx: DISABLED_SX } : {})}
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
                      slotProps={{
                        input: {
                          min: 0,
                          step: "0.01",
                          ...(isView ? { sx: { color: "text.primary" } } : {}),
                        },
                      }}
                      {...(isView ? { disabled: true, sx: DISABLED_SX } : {})}
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
                      slotProps={{
                        input: {
                          min: 0,
                          step: "0.01",
                          ...(isView ? { sx: { color: "text.primary" } } : {}),
                        },
                      }}
                      {...(isView ? { disabled: true, sx: DISABLED_SX } : {})}
                    />
                  </td>

                  <td>
                    <Chip variant="soft">₹ {gross.toFixed(2)}</Chip>
                  </td>

                  {!isView && (
                    <td>
                      <IconButton
                        variant="plain"
                        color="danger"
                        onClick={() => {
                          setLineProducts((prev) => {
                            const next = { ...prev };
                            delete next[l.id];
                            return next;
                          });
                          removeLine(l.id);
                        }}
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
          {...(isView ? disabledTextareaProps : {})}
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
            onClick={() => handleSubmit()}
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

      {/* Product Search More Modal — filtered by ACTIVE ROW's category */}
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

      {/* Create Product (embedded) */}
      <Modal open={prodCreateOpen} onClose={() => setProdCreateOpen(false)}>
        <ModalDialog
          size="lg"
          sx={{ width: 980, maxWidth: "98vw", p: 1, overflow: "auto" }}
        >
          <ModalClose />
          {prodCreateOpen && (
            <ProductForm
              embedded
              initialForm={prodCreateInitial}
              onCreated={handleProductCreatedIntoRow}
              onClose={() => setProdCreateOpen(false)}
            />
          )}
        </ModalDialog>
      </Modal>

      {/* PO Modal */}
      <Modal open={poModalOpen} onClose={() => setPoModalOpen(false)}>
        <ModalDialog
          size="lg"
          sx={{
            width: 1400,
            maxWidth: "100vw",
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
              pr_no={poSeed.pr_no}
              p_id={poSeed.p_id}
              project_id={poSeed.project_id}
              project_code={poSeed.project_code}
              categories={poSeed.categories}
              categoryNames={poSeed.categoryNames}
              initialLines={poSeed.initialLines}
              briefDescription={poSeed.briefDescription}
              mode="create"
              fromModal
            />
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}
