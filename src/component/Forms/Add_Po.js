import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Input,
  Grid,
  Divider,
  Sheet,
  IconButton,
  Chip,
  Select as JSelect,
  Option,
  Modal,
  ModalDialog,
  Textarea,
  Checkbox,
  Tooltip,
} from "@mui/joy";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CloudUpload from "@mui/icons-material/CloudUpload";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";
import Axios from "../../utils/Axios";
import { toast } from "react-toastify";
import Send from "@mui/icons-material/Send";
import {
  Add,
  Close,
  ConfirmationNumber,
  RestartAlt,
} from "@mui/icons-material";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchPickerModal from "../SearchPickerModal";
import AddBill from "./Add_Bill";
import {
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
} from "../../redux/vendorSlice";
import { useGetLogisticsQuery } from "../../redux/purchasesSlice";
import { Check } from "lucide-react";
import {
  useGetProductsQuery,
  useLazyGetAllMaterialsPOQuery,
  useLazyGetAllProdcutPOQuery,
  useLazyGetProductsQuery,
  useGetAllCategoriesQuery,
  useLazyGetPurchaseOrderPdfQuery,
} from "../../redux/productsSlice";
import ProductForm from "./Product_Form";
import POUpdateFeed from "../PoUpdateForm";
import {
  useAddPoHistoryMutation,
  useLazyGetPoHistoryQuery,
} from "../../redux/poHistory";
import InspectionForm from "../../component/Forms/Inspection_Form";
import { useAddInspectionMutation } from "../../redux/inspectionSlice";
import { Select } from "@mui/material";

const VENDOR_LIMIT = 7;
const SEARCH_MORE_VENDOR = "__SEARCH_MORE_VENDOR__";
const SEARCH_MORE_PRODUCT = "__SEARCH_MORE_PRODUCT__";
const SEARCH_MORE_CATEGORY = "__SEARCH_MORE_CATEGORY__";
const CREATE_PRODUCT = "__CREATE_PRODUCT__";

/* ---------- DARK DISABLED HELPERS ---------- */
const DISABLED_SX = {
  opacity: 1,
  pointerEvents: "none",
  bgcolor: "neutral.softBg",
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

const rsx = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    boxShadow: "none",
    borderColor: "var(--joy-palette-neutral-outlinedBorder)",
    backgroundColor: state.isDisabled
      ? "var(--joy-palette-neutral-softBg)"
      : base.backgroundColor,
    opacity: 1,
    cursor: state.isDisabled ? "not-allowed" : base.cursor,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  dropdownIndicator: (base) => ({ ...base, padding: 4 }),
  valueContainer: (base) => ({ ...base, padding: "0 6px" }),
  singleValue: (base) => ({
    ...base,
    color: "var(--joy-palette-text-primary)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--joy-palette-text-tertiary)",
  }),
  input: (base) => ({ ...base, color: "var(--joy-palette-text-primary)" }),
};

/* ------------------------------------------- */
const makeEmptyLine = () => ({
  id: crypto.randomUUID(),
  productId: "",
  productName: "",
  productCategoryId: "",
  productCategoryName: "",
  briefDescription: "",
  make: "",
  makeQ: "",
  uom: "",
  quantity: 1,
  received: 0,
  billed: 0,
  unitPrice: 0,
  taxPercent: 0,
  isShow: false,
});

const getProdField = (row, fieldName) => {
  const arr = Array.isArray(row?.data) ? row.data : [];
  const item = arr.find(
    (d) =>
      String(d?.name || "")
        .trim()
        .toLowerCase() === String(fieldName).trim().toLowerCase()
  );
  const val =
    item && Array.isArray(item.values) && item.values[0]
      ? item.values[0].input_values
      : "";
  return val || "";
};

const normalizeCreatedProduct = (res) => {
  let p = res;
  if (p?.data?.data && (p?.data?.category || p?.data?.category?._id))
    p = p.data;
  if (p?.newProduct) p = p.newProduct;
  if (p?.newMaterial) p = p.newMaterial;
  if (p?.product) p = p.product;
  if (p?.material) p = p.material;
  return p;
};

const isValidMake = (m) => {
  const s = String(m ?? "").trim();
  return !!s && !/^\d+(\.\d+)?$/.test(s) && s.toLowerCase() !== "na";
};

const mkKey = (catId, prodName) =>
  `${String(catId || "").trim()}@@${String(prodName || "")
    .trim()
    .toLowerCase()}`;

/* ----- LABEL MAPS FOR FEED ----- */
const AMOUNT_LABELS_BY_PATH = {
  po_basic: "Untaxed",
  gst: "GST",
  po_value: "Total",
};

const AddPurchaseOrder = ({
  onSuccess,
  onClose,
  pr_id,
  p_id,
  pr_no,
  project_code,
  initialLines = [],
  categoryNames = [],
  mode = "create",
  fromModal = false,
  poStatus = "draft",
  poNumberPreset = "",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modeQ = (searchParams.get("mode") || "").toLowerCase();
  const poNumberQ = searchParams.get("po_number") || "";
  const effectiveMode = fromModal ? mode : modeQ || mode;
  const viewMode = effectiveMode === "view";
  const [openRefuse, setOpenRefuse] = useState(false);
  const [remarks, setRemarks] = useState("");
  const isRowLocked = (l) => !!l.isShow;

  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);

  const [etdModalOpen, setEtdModalOpen] = useState(false);
  const [etd, setEtd] = useState("");

  const [description, setDescription] = useState("");

  const { data: categoryResponse } = useGetAllCategoriesQuery({
    page: 1,
    pageSize: 7,
    status: "Active",
  });

  const categoryData = categoryResponse?.data || [];

  const [triggerCategorySearch] = useLazyGetAllMaterialsPOQuery();
  const fetchCategoriesPageCat = async ({
    search = "",
    page = 1,
    pageSize = 7,
  }) => {
    const res = await triggerCategorySearch(
      { search, page, limit: pageSize, pr: "true" },
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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const categoryColumns = [
    { key: "name", label: "Name", width: 240 },
    { key: "description", label: "Description", width: 420 },
  ];

  const [triggerProductSearch] = useLazyGetAllProdcutPOQuery();
  const fetchProductPageCat = async ({
    search = "",
    page = 1,
    pageSize = 7,
    categoryId = "",
  }) => {
    const res = await triggerProductSearch(
      {
        search,
        page,
        limit: pageSize,
        pr: "true",
        categoryId: String(categoryId || ""),
      },
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

  const [productModalOpen, setProductModalOpen] = useState(false);

  const productColumns = [
    { key: "sku_code", label: "Code" },
    {
      key: "name",
      label: "Name",
      render: (row) => row?.data?.[0]?.values?.[0]?.input_values || "",
    },
  ];

  const [activeLineId, setActiveLineId] = useState(null);

  const onPickCategory = (row) => {
    if (!row || !activeLineId) return;

    const id = row._id ?? row.id ?? row.value ?? "";
    const name = row.name ?? row.label ?? "";

    updateLine(activeLineId, "productCategoryId", String(id));
    updateLine(activeLineId, "productCategoryName", name);
    setCategoryModalOpen(false);
  };

  const onPickProduct = (row) => {
    const getInputValueByName = (row, fieldName, defaultValue = "") => {
      const field = row?.data?.find((d) => d?.name === fieldName);
      return field?.values?.[0]?.input_values ?? defaultValue;
    };

    if (!row || !activeLineId) return;

    const id = row._id ?? row.id ?? row.value ?? "";
    const name =
      getInputValueByName(row, "Product Name", row.name || "") ||
      getInputValueByName(row, "Name", row.name || "");

    updateLine(activeLineId, "productId", String(id));
    updateLine(activeLineId, "productName", name);
    updateLine(
      activeLineId,
      "briefDescription",
      getInputValueByName(row, "Description", "N/A")
    );
    updateLine(
      activeLineId,
      "unitPrice",
      Number(getInputValueByName(row, "Cost", 0))
    );
    updateLine(
      activeLineId,
      "taxPercent",
      Number(getInputValueByName(row, "GST", 0))
    );
    updateLine(activeLineId, "make", getInputValueByName(row, "Make", "N/A"));
    updateLine(activeLineId, "uom", getInputValueByName(row, "UoM", "N/A"));

    // ⛔️ No productCategoryId / productCategoryName updates
    setProductModalOpen(false);
  };

  const { data: vendorsResp, isFetching: vendorsLoading } =
    useGetVendorsNameSearchQuery({
      search: vendorSearch,
      page: vendorPage,
      limit: VENDOR_LIMIT,
    });

  const [triggerVendorSearch] = useLazyGetVendorsNameSearchQuery();
  const vendorRows = vendorsResp?.data || [];

  const vendorColumns = [
    { key: "name", label: "Vendor Name", width: 320 },
    { key: "Beneficiary_Name", label: "Beneficiary", width: 320 },
  ];

  const fetchVendorsPage = async ({
    search = "",
    page = 1,
    pageSize = VENDOR_LIMIT,
  }) => {
    const res = await triggerVendorSearch(
      { search, page, limit: pageSize },
      true
    );
    const d = res?.data;
    return {
      rows: d?.data || [],
      total: d?.pagination?.total || 0,
      page: d?.pagination?.page || page,
      pageSize: d?.pagination?.limit || pageSize,
    };
  };

  const onPickVendor = (row) => {
    if (!row) return;
    setFormData((p) => ({
      ...p,
      vendor_id: row._id || "",
      name: row.name || "",
    }));
    setVendorModalOpen(false);
  };

  /* -------- form state -------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualEdit, setManualEdit] = useState(false);

  const [formData, setFormData] = useState({
    _id: "",
    p_id: p_id ?? "",
    project_code: project_code || "",
    po_number: poNumberPreset || poNumberQ || "",
    name: "",
    vendor_id: "",
    date: "",
    po_value: "",
    po_basic: "",
    gst: "",
    partial_billing: "",
    submitted_By: "",
    delivery_type: "",
    total_billed: "",
    total_bills: 0,
    createdAt: "",
    inspectionCount: 0,
  });
  const poNum = (formData.po_number || poNumberQ || "").trim();

  const { data: logResp, isFetching: isLogFetching } = useGetLogisticsQuery(
    {
      page: 1,
      pageSize: 1,
      search: "",
      status: "",
      po_id: "",
      po_number: poNum,
    },
    { skip: !poNum }
  );
  const logisticsCount = logResp?.total ?? 0;

  const [lines, setLines] = useState(() =>
    Array.isArray(initialLines) && initialLines.length
      ? initialLines.map((l) => ({
        ...makeEmptyLine(),
        ...l,
        id: crypto.randomUUID(),
      }))
      : [makeEmptyLine()]
  );

  const addLine = () => setLines((prev) => [...prev, makeEmptyLine()]);
  const removeLine = (id) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev
    );
  const updateLine = (id, field, value) =>
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );

  /* -------- totals -------- */
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
    return { untaxed, tax, total: untaxed + tax };
  }, [lines]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      po_basic: String(amounts.untaxed ?? 0),
      gst: String(amounts.tax ?? 0),
      po_value: String(amounts.total ?? 0),
    }));
  }, [amounts]);

  /* -------- auth helper -------- */
  const getUserData = () => {
    const raw = localStorage.getItem("userDetails");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // submitted_By prefill
  useEffect(() => {
    const user = getUserData();
    if (user?.name) setFormData((p) => ({ ...p, submitted_By: user.name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- map PO -> lines -------- */
  const mapPOtoLines = (po) => {
    const arr = Array.isArray(po?.items)
      ? po.items
      : Array.isArray(po?.item)
        ? po.item
        : [];
    return arr.length
      ? arr.map((it) => ({
        ...makeEmptyLine(),
        isShow: true,
        productCategoryId:
          typeof it?.category === "object"
            ? it?.category?._id ?? ""
            : it?.category ?? "",
        productCategoryName:
          typeof it?.category === "object" ? it?.category?.name ?? "" : "",
        productName: it?.product_name ?? "",
        make: isValidMake(it?.product_make) ? it.product_make : "",
        makeQ: isValidMake(it?.product_make) ? it.product_make : "",
        briefDescription: it?.description ?? "",
        uom: it?.uom ?? "",
        quantity: Number(it?.quantity ?? 0),
        unitPrice: Number(it?.cost ?? 0),
        taxPercent: Number(it?.gst_percent ?? it?.gst ?? 0),
      }))
      : [makeEmptyLine()];
  };

  /* -------- fetch PO (edit/view) -------- */
  const [poLoading, setPoLoading] = useState(false);
  const [fetchedPoStatus, setFetchedPoStatus] = useState(poStatus || "draft");
  const _id = searchParams.get("_id") || "";

  useEffect(() => {
    if (effectiveMode !== "view" && effectiveMode !== "edit") return;
    const token = localStorage.getItem("authToken");
    (async () => {
      try {
        setPoLoading(true);
        const { data: resp } = await Axios.get(
          `/get-po-by-po_number?po_number=${encodeURIComponent(
            poNumberQ
          )}&_id=${_id}`,
          { headers: { "x-auth-token": token } }
        );
        const po = Array.isArray(resp?.data)
          ? resp.data[0]
          : resp?.data ?? resp;
        if (!po) {
          toast.error("PO not found.");
          return;
        }

        // 🔽 normalize vendor
        const vObj =
          po.vendor && typeof po.vendor === "object" ? po.vendor : null;

        const vendor_id = vObj?._id || po.vendor_id || "";
        const vendor_name = vObj?.name || po.vendor || "";

        setFetchedPoStatus(po?.current_status?.status || "draft");
        setFormData((prev) => ({
          ...prev,
          _id: po?._id || prev._id,
          p_id: po?.p_id ?? prev.p_id,
          project_code: po?.p_id ?? prev.p_id ?? "",
          po_number: po?.po_number ?? prev.po_number ?? "",
          total_billed: po?.total_billed ?? prev.total_billed ?? "",
          total_bills: po?.total_bills ?? prev.total_bills ?? "",
          inspectionCount: po?.inspectionCount ?? prev.inspectionCount ?? "",
          createdAt: po?.createdAt ?? prev.createdAt ?? "",
          vendor_id,
          name: vendor_name,
          date: po?.date ?? "",
          partial_billing: po?.partial_billing ?? "",
          submitted_By: po?.submitted_By ?? prev.submitted_By,
          po_basic: String(po?.po_basic ?? prev.po_basic ?? ""),
          gst: String(po?.gst ?? prev.gst ?? ""),
          po_value: String(po?.po_value ?? prev.po_value ?? ""),
          delivery_type: String(po?.delivery_type ?? prev.delivery_type ?? ""),
        }));
        setDescription(po?.description)
        setLines(mapPOtoLines(po));
      } catch (err) {
        console.error("Failed to load PO:", err);
        toast.error("Failed to load PO.");
      } finally {
        setPoLoading(false);
      }
    })();
  }, [poNumberQ, effectiveMode]);

  const statusNow = fetchedPoStatus;
  const isApprovalPending = statusNow === "approval_pending";
  const canConfirm = statusNow === "approval_done";
  const approvalRejected = statusNow === "approval_rejected";
  const inputsDisabled = !fromModal && !manualEdit;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "po_value" && parseFloat(value) < 0) {
      toast.warning("PO Value can't be Negative !!");
      return;
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "po_basic" || name === "gst") {
        const poBasic =
          parseFloat(name === "po_basic" ? value : updated.po_basic) || 0;
        const gst = parseFloat(name === "gst" ? value : updated.gst) || 0;
        updated.po_value = poBasic + gst;
      }
      return updated;
    });
  };

  const handleVendorChange = (opt) => {
    if (!opt) {
      setFormData((p) => ({ ...p, vendor_id: "", name: "" }));
      return;
    }
    if (opt.value === SEARCH_MORE_VENDOR) {
      setVendorModalOpen(true);
      return;
    }
    // ✅ id goes to vendor_id, text to name
    setFormData((p) => ({ ...p, vendor_id: opt.value, name: opt.label }));
  };

  useGetProductsQuery(
    { search: "", page: 1, limit: 1, category: "" },
    { skip: true }
  );

  const activeCatId = useMemo(
    () => lines.find((l) => l.id === activeLineId)?.productCategoryId || "",
    [lines, activeLineId]
  );

  const { data: productResponse } = useGetProductsQuery(
    { page: 1, limit: 7, search: "", category: activeCatId },
    { skip: !activeCatId }
  );

  const productData = productResponse?.data || [];
  const [triggerGetProducts] = useLazyGetProductsQuery();

  const [makesCache, setMakesCache] = useState({});

  const fetchUniqueMakes = async (categoryId, productName) => {
    if (!categoryId || !productName) return [];
    const key = mkKey(categoryId, productName);
    if (makesCache[key]) return makesCache[key];

    const res = await triggerGetProducts(
      {
        search: productName,
        page: 1,
        limit: 200,
        category: String(categoryId),
      },
      true
    );
    const rows = res?.data?.data || [];
    const normalized = String(productName).trim().toLowerCase();
    const makes = rows
      .filter(
        (r) =>
          String(getProdField(r, "Product Name") || "")
            .trim()
            .toLowerCase() === normalized
      )
      .map((r) => String(getProdField(r, "Make") || "").trim())
      .filter(isValidMake);

    const unique = Array.from(new Set(makes));

    // ✅ only set if different
    setMakesCache((prev) => {
      if (
        prev[key] &&
        prev[key].length === unique.length &&
        prev[key].every((v, i) => v === unique[i])
      ) {
        return prev;
      }
      return { ...prev, [key]: unique };
    });

    return unique;
  };

  useEffect(() => {
    const safeLines = Array.isArray(lines) ? lines : [];
    const pairs = Array.from(
      new Set(
        safeLines
          .filter((l) => l.productCategoryId && l.productName)
          .map((l) => mkKey(l.productCategoryId, l.productName))
      )
    );
    pairs.forEach(async (pairKey) => {
      if (!makesCache[pairKey]) {
        const [cat, name] = pairKey.split("@@");
        await fetchUniqueMakes(cat, name);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    Array.isArray(lines)
      ? lines.map((l) => `${l.productCategoryId}::${l.productName}`).join("|")
      : "",
  ]);

  const [createProdOpen, setCreateProdOpen] = useState(false);
  const [createProdInitial, setCreateProdInitial] = useState(null);
  const [createProdLineId, setCreateProdLineId] = useState(null);

  const openCreateProductForLine = (line) => {
    // if (!line?.productCategoryId || !line?.productName) {
    //   toast.error("Pick category and product name first.");
    //   return;
    // }
    setCreateProdLineId(line.id);
    setCreateProdInitial({
      name: line.productName || "",
      productCategory: line.productCategoryId || "",
      productCategoryName: line.productCategoryName || "",
      gst: String(line.taxPercent || ""),
      unitOfMeasure: line.uom || "",
      cost: String(line.unitPrice || ""),
      Description: line.briefDescription || "",
      make: "",
      productType: "",
      imageFile: null,
      imageUrl: "",
      internalReference: "",
    });
    setCreateProdOpen(true);
  };

  const handleProductCreated = (raw) => {
    try {
      const newProduct = normalizeCreatedProduct(raw);
      if (!newProduct || !createProdLineId) return;

      const name = getProdField(newProduct, "Product Name") || "";
      const make = getProdField(newProduct, "Make") || "";
      const uom =
        getProdField(newProduct, "UoM") ||
        getProdField(newProduct, "UOM") ||
        "";
      const gst = Number(getProdField(newProduct, "GST") || 0);
      const cost = Number(getProdField(newProduct, "Cost") || 0);
      const desc = getProdField(newProduct, "Description") || "";

      const catId = newProduct?.category?._id || newProduct?.category || "";

      const currentLine = lines.find((x) => x.id === createProdLineId);
      let catName = (newProduct?.category && newProduct?.category?.name) || "";
      if (!catName && catId) {
        const found = categoryData?.find((c) => c._id === catId);
        if (found?.name) catName = found.name;
        else if (currentLine?.productCategoryName)
          catName = currentLine.productCategoryName;
      }

      updateLine(createProdLineId, "productId", newProduct?._id || "");
      updateLine(createProdLineId, "productName", name);
      updateLine(createProdLineId, "productCategoryId", catId);
      updateLine(createProdLineId, "productCategoryName", catName);
      updateLine(createProdLineId, "briefDescription", desc);
      updateLine(createProdLineId, "uom", uom);
      updateLine(createProdLineId, "taxPercent", gst);
      updateLine(createProdLineId, "unitPrice", cost);
      if (isValidMake(make)) updateLine(createProdLineId, "make", make);

      const key = mkKey(catId, name);
      setMakesCache((prev) => {
        const existing = prev[key] || [];
        const exists = existing
          .map((s) => s.toLowerCase())
          .includes(String(make).toLowerCase());
        const next =
          isValidMake(make) && !exists ? [...existing, make] : existing;
        return { ...prev, [key]: next };
      });
      toast.success("Product created and row updated.");
    } finally {
      setCreateProdOpen(false);
      setCreateProdLineId(null);
      setCreateProdInitial(null);
    }
  };

  useEffect(() => {
    setLines((prev) => {
      let changed = false;
      const next = prev.map((l) => {
        if (!l.productCategoryId || !l.productName || !l.make) return l;

        const list =
          makesCache[mkKey(l.productCategoryId, l.productName)] || [];
        const ok = list.some(
          (m) => String(m).toLowerCase() === String(l.make).toLowerCase()
        );

        if (!ok && l.make) {
          changed = true;
          return { ...l, make: "" };
        }
        return l;
      });

      return changed ? next : prev;
    });
  }, [makesCache]);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [serverTotals, setServerTotals] = useState({
    po_basic: 0,
    gst: 0,
    po_value: 0,
  });

  const [addPoHistory] = useAddPoHistoryMutation();
  const [triggerGetPoHistory] = useLazyGetPoHistoryQuery();

  const mapDocToFeedItem = (doc) => {
    const base = {
      id: String(doc._id || crypto.randomUUID()),
      ts: doc.createdAt || doc.updatedAt || new Date().toISOString(),
      user: { name: doc?.createdBy?.name || doc?.createdBy || "System" },
    };

    if (doc.event_type === "amount_change" || doc.event_type === "update") {
      const changes = (Array.isArray(doc?.changes) ? doc.changes : [])
        .filter(
          (c) => typeof c?.from !== "undefined" && typeof c?.to !== "undefined"
        )
        .map((c, idx) => {
          const label =
            c.label ||
            (c.path ? AMOUNT_LABELS_BY_PATH[c.path] || c.path : "") ||
            `field_${idx + 1}`;
          return {
            label,
            path: c.path || undefined,
            from: Number(c.from ?? 0),
            to: Number(c.to ?? 0),
          };
        });

      return {
        ...base,
        kind: "amount_change",
        title: doc.message || "Amounts updated",
        currency: "INR",
        changes,
      };
    }

    if (doc.event_type === "status_change") {
      const c0 = Array.isArray(doc?.changes) ? doc.changes[0] : null;
      return {
        ...base,
        kind: "status",
        statusFrom: c0?.from || "",
        statusTo: c0?.to || "",
        title: doc.message || "Status changed",
      };
    }

    if (doc.event_type === "note") {
      return {
        ...base,
        kind: "note",
        note: doc.message || "",
        attachments: Array.isArray(doc?.attachments)
          ? doc.attachments.map((a) => ({
            name: a?.name || a?.attachment_name,
            url: a?.url || a?.attachment_url,
          }))
          : [],
      };
    }

    return { ...base, kind: "other", title: doc.message || doc.event_type };
  };

  const fetchPoHistory = async () => {
    if (!formData?._id) return;
    try {
      setHistoryLoading(true);
      const data = await triggerGetPoHistory({
        subject_type: "purchase_order",
        subject_id: formData._id,
      }).unwrap();
      const rows = Array.isArray(data?.data) ? data.data : [];
      setHistoryItems(rows.map(mapDocToFeedItem));
      setServerTotals({
        po_basic: Number(formData.po_basic || 0),
        gst: Number(formData.gst || 0),
        po_value: Number(formData.po_value || 0),
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load PO history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (
      (effectiveMode === "view" || effectiveMode === "edit") &&
      formData._id
    ) {
      fetchPoHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData._id]);

  const feedRef = useRef(null);
  const scrollToFeed = () => {
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pushHistoryItem = (itemShape) => {
    const user = getUserData();
    const userName = user?.name || "User";
    const base = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      user: { name: userName },
    };

    let normalized;
    if (itemShape.kind === "note") {
      normalized = { ...base, kind: "note", note: itemShape.note || "" };
    } else if (itemShape.kind === "status") {
      normalized = {
        ...base,
        kind: "status",
        statusFrom: itemShape.statusFrom || "",
        statusTo: itemShape.statusTo || "",
        title: itemShape.title || "",
      };
    } else if (itemShape.kind === "amount_change") {
      const changes = Array.isArray(itemShape.changes)
        ? itemShape.changes.map((c, idx) => ({
          label: c.label || c.path || `field_${idx + 1}`,
          path: c.path,
          from: Number(c.from ?? 0),
          to: Number(c.to ?? 0),
        }))
        : [
          {
            label: itemShape.label || itemShape.field || "amount",
            path: itemShape.path,
            from: Number(itemShape.from || 0),
            to: Number(itemShape.to || 0),
          },
        ];

      normalized = {
        ...base,
        kind: "amount_change",
        title: itemShape.title || "Amounts updated",
        currency: "INR",
        changes,
      };
    } else {
      normalized = { ...base, kind: "other", title: itemShape.title || "" };
    }

    setHistoryItems((prev) => [normalized, ...prev]);
    scrollToFeed();
  };

  const handleAddHistoryNote = async (text) => {
    if (!formData?._id) return toast.error("PO id missing.");

    // Optimistic feed
    pushHistoryItem({ kind: "note", note: text });

    try {
      const user = getUserData();
      await addPoHistory({
        subject_type: "purchase_order",
        subject_id: formData._id,
        event_type: "note",
        message: text,
        createdBy: {
          name: user?.name || "User",
          user_id: user?._id,
        },
        changes: [],
        attachments: [],
      }).unwrap();

      toast.success("Note added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add note");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const submitter = e.nativeEvent?.submitter;
    const action =
      submitter?.value || new FormData(e.currentTarget).get("action") || "";

    // --- REQUIRE: category & product on any touched row ---
    const missingCategory = [];
    const missingProduct = [];

    (lines || []).forEach((l, idx) => {
      const touched =
        l.productCategoryId ||
        l.productName ||
        l.briefDescription ||
        Number(l.quantity) ||
        Number(l.unitPrice) ||
        Number(l.taxPercent);

      if (!touched) return;

      if (!l.productCategoryId) missingCategory.push(idx + 1);
      if (l.productCategoryId && !l.productName) missingProduct.push(idx + 1);
    });

    if (missingCategory.length) {
      toast.error(
        `Please select a Category for row(s): ${missingCategory.join(", ")}`
      );
      return;
    }
    if (missingProduct.length) {
      toast.error(
        `Please select a Product for row(s): ${missingProduct.join(", ")}`
      );
      return;
    }

    // Build payload ONLY from rows that have both category & product
    const item = (lines || [])
      .filter((l) => l.productCategoryId && l.productName)
      .map((l) => {
        const categoryId =
          typeof l.productCategoryId === "object" && l.productCategoryId?._id
            ? String(l.productCategoryId._id)
            : l.productCategoryId != null
              ? String(l.productCategoryId)
              : "";
        return {
          category: String(categoryId),
          category_name: String(l.productCategoryName || ""),
          product_name: String(l.productName || ""),
          product_make: String(isValidMake(l.make) ? l.make : ""),
          description: String(l.briefDescription || ""),
          uom: String(l.uom ?? ""),
          quantity: String(l.quantity ?? 0),
          cost: String(l.unitPrice ?? 0),
          gst_percent: String(l.taxPercent ?? 0),
        };
      });

    const hasValidLine =
      item.length > 0 && item.some((it) => Number(it.quantity) > 0);

    /* ---------- EDIT SAVE ---------- */
    if (action === "edit_save" && !fromModal) {
      if (!formData?._id) return toast.error("PO id missing.");
      if (!hasValidLine)
        return toast.error("Add at least one valid product row.");

      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        const body = {
          po_number: formData.po_number,
          vendor: formData?.vendor_id,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          delivery_type: formData.delivery_type,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
          description: description,
        };
        await Axios.put(`/edit-pO-IT/${formData._id}`, body, {
          headers: { "x-auth-token": token },
        });
        toast.success("PO updated.");
        setManualEdit(false);
        onSuccess?.({ created: false, updated: true, status: statusNow });

        const newTotals = {
          po_basic: Number(amounts.untaxed || 0),
          gst: Number(amounts.tax || 0),
          po_value: Number(amounts.total || 0),
        };

        const FIELDS = [
          { path: "po_basic", label: "Untaxed", pick: "po_basic" },
          { path: "gst", label: "GST", pick: "gst" },
          { path: "po_value", label: "Total", pick: "po_value" },
        ];

        const diffs = FIELDS.reduce((arr, f) => {
          const from = Number(serverTotals[f.pick] || 0);
          const to = Number(newTotals[f.pick] || 0);
          if (from !== to) arr.push({ path: f.path, label: f.label, from, to });
          return arr;
        }, []);

        if (diffs.length) {
          pushHistoryItem({
            kind: "amount_change",
            title: "Amounts updated",
            changes: diffs.map((d) => ({
              path: d.path,
              label: d.label,
              from: d.from,
              to: d.to,
            })),
          });

          const user = getUserData();
          try {
            await addPoHistory({
              subject_type: "purchase_order",
              subject_id: formData._id,
              event_type: "amount_change",
              message: "Amounts updated",
              createdBy: {
                name: user?.name || "User",
                user_id: user?._id,
              },
              changes: diffs,
            }).unwrap();
          } catch (err) {
            console.error("Failed to record amount change history", err);
          }
        }

        setServerTotals(newTotals);
        return;
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.msg || "Failed to update PO");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Require ETD before confirm
    if (action === "confirm_order" && !etd) {
      setEtdModalOpen(true);
      return;
    }

    if (action === "confirm_order" && !fromModal) {
      if (!canConfirm)
        return toast.error("Confirm is available only after approval is done.");
      if (!formData.po_number)
        return toast.error("PO Number is required to confirm this PO.");
      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        await Axios.put(
          "/updateStatusPO",
          {
            id: _id,
            status: "po_created",
            remarks: "",
            new_po_number: formData.po_number,
            etd,
          },
          { headers: { "x-auth-token": token } }
        );
        toast.success("PO confirmed.");
        onSuccess?.({ created: false, updated: true, status: "po_created" });

        pushHistoryItem({
          kind: "status",
          statusFrom: statusNow,
          statusTo: "po_created",
          title: `PO confirmed (${formData.po_number})`,
        });

        const user = getUserData();
        await addPoHistory({
          subject_type: "purchase_order",
          subject_id: _id,
          event_type: "status_change",
          message: `PO confirmed (${formData.po_number})`,
          createdBy: {
            name: user?.name || "User",
            user_id: user?._id,
          },
          changes: [
            {
              path: "status",
              label: "Status",
              from: statusNow,
              to: "po_created",
            },
          ],
        }).unwrap();

        return onClose ? onClose() : navigate("/purchase-order");
      } catch (err) {
        console.error("Confirm error:", err);
        toast.error("Failed to confirm PO");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    /* ---------- SEND APPROVAL ---------- */
    if (effectiveMode === "edit" && action === "send_approval") {
      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        if (fromModal) {
          const user = getUserData();
          if (!user?.name) throw new Error("No user");
          const dataToPost = {
            p_id: formData.project_code,
            po_number: undefined,
            vendor: formData?.name,
            date: formData.date,
            partial_billing: formData.partial_billing || "",
            submitted_By: user.name,
            delivery_type: formData.delivery_type,
            pr_id,
            pr_no,
            po_basic: String(amounts.untaxed ?? 0),
            gst: String(amounts.tax ?? 0),
            po_value: Number(amounts.total ?? 0),
            item,
            description: description,
            initial_status: "approval_pending",
          };
          await Axios.post("/Add-purchase-ordeR-IT", dataToPost, {
            headers: { "x-auth-token": token },
          });
          toast.success("PO sent for approval.");
          onSuccess?.({
            created: true,
            updated: false,
            status: "approval_pending",
          });
          return onClose ? onClose() : navigate("/purchase-order");
        } else {
          if (!formData?._id) return toast.error("PO id missing.");
          const body = {
            po_number: formData.po_number,
            vendor: formData.vendor_id,
            date: formData.date,
            partial_billing: formData.partial_billing || "",
            delivery_type: formData.delivery_type,
            po_basic: String(amounts.untaxed ?? 0),
            gst: String(amounts.tax ?? 0),
            po_value: Number(amounts.total ?? 0),
            item,
            description: description,
          };
          await Axios.put(`/edit-pO-IT/${formData._id}`, body, {
            headers: { "x-auth-token": token },
          });
          toast.success("PO sent for approval.");
          onSuccess?.({
            created: false,
            updated: true,
            status: "approval_pending",
          });
          return onClose ? onClose() : navigate("/purchase-order");
        }
      } catch (err) {
        console.error("Send approval error:", err);
        toast.error("Failed to send PO for approval");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    console.log({ formData });
    /* ---------- CREATE ---------- */
    if (effectiveMode === "create" || fromModal) {
      if (!formData.vendor_id) return toast.error("Vendor is required.");
      if (!formData.date) return toast.error("PO Date is required.");
      if (!hasValidLine)
        return toast.error("Add at least one valid product row.");
      if (action === "confirm_order" && !formData.po_number) {
        return toast.error("PO Number is required to confirm the order.");
      }
      setIsSubmitting(true);
      try {
        const user = getUserData();
        if (!user?.name) throw new Error("No user");
        const token = localStorage.getItem("authToken");
        const initial_status =
          action === "send_approval" ? "approval_pending" : "po_created";
        const dataToPost = {
          p_id: formData.project_code,
          po_number:
            action === "send_approval" ? undefined : formData.po_number,
          vendor: formData.vendor_id,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          delivery_type: formData.delivery_type,
          pr_id,
          pr_no,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
          description: description,
          initial_status,
        };

        await Axios.post("/Add-purchase-ordeR-IT", dataToPost, {
          headers: { "x-auth-token": token },
        });

        toast.success(
          action === "send_approval" ? "PO sent for approval." : "PO created."
        );
        onSuccess?.({
          created: true,
          updated: action === "confirm_order",
          status: initial_status,
        });
        return onClose ? onClose() : navigate("/purchase-order");
      } catch (error) {
        const msg = error?.response?.data?.message;
        const statusCode = error?.response?.status;
        if (statusCode === 400 && msg === "PO Number already used!") {
          toast.error("PO Number already used. Please enter a unique one.");
        } else {
          console.error("Error posting PO:", error);
          toast.error("Something went wrong. Please check your connection.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const [fetchPdf, { isFetching }] = useLazyGetPurchaseOrderPdfQuery();

  const exportPdf = async () => {
    if (!poNumberQ && !_id) {
      console.warn("Missing po_number or _id in URL");
      return;
    }
    const po_number = poNumberQ || undefined;
    const payload = po_number ? { po_number } : { _id };
    const blob = await fetchPdf(payload).unwrap();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Purchase_Order_${po_number ? po_number : ""}.pdf`; // filename with .pdf
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await Axios.put(
        "/updateStatusPO",
        { id: _id, status: "approval_done", remarks: "Approved by CAM" },
        { headers: { "x-auth-token": token } }
      );

      toast.success("PO Approved");

      pushHistoryItem({
        kind: "status",
        statusFrom: statusNow,
        statusTo: "approval_done",
        title: "PO approved",
      });

      const user = getUserData();
      await addPoHistory({
        subject_type: "purchase_order",
        subject_id: _id,
        event_type: "status_change",
        message: "PO approved",
        createdBy: {
          name: user?.name || "User",
          user_id: user?._id,
        },
        changes: [
          {
            path: "status",
            label: "Status",
            from: statusNow,
            to: "approval_done",
          },
        ],
      }).unwrap();
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    }
  };

  const handleRefuse = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await Axios.put(
        "/updateStatusPO",
        { id: _id || poNumberQ, status: "approval_rejected", remarks },
        { headers: { "x-auth-token": token } }
      );

      toast.success("PO Refused");
      setOpenRefuse(false);
      setRemarks("");

      pushHistoryItem({
        kind: "status",
        statusFrom: statusNow,
        statusTo: "approval_rejected",
        title: remarks || "PO refused",
      });

      const user = getUserData();
      await addPoHistory({
        subject_type: "purchase_order",
        subject_id: _id,
        event_type: "status_change",
        message: remarks || "PO refused",
        createdBy: {
          name: user?.name || "User",
          user_id: user?._id,
        },
        changes: [
          {
            path: "status",
            label: "Status",
            from: statusNow,
            to: "approval_rejected",
          },
        ],
      }).unwrap();
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to refuse");
    }
  };
  const user = getUserData();

  /* -------- vendor options -------- */
  const vendorOptions = useMemo(
    () => [
      ...(formData.vendor_id &&
        !vendorRows.some((v) => v._id === formData.vendor_id)
        ? [{ value: formData.vendor_id, label: formData.name }]
        : []),
      ...vendorRows.map((v) => ({ value: v._id, label: v.name, _raw: v })),
      { value: SEARCH_MORE_VENDOR, label: "Search more…" },
    ],
    [vendorRows, formData.vendor_id, formData.name]
  );

  const selectedVendorOption = useMemo(
    () => vendorOptions.find((o) => o.value === formData.vendor_id) ?? null,
    [vendorOptions, formData.vendor_id]
  );

  const location = useLocation();
  const goToVendorList = () => {
    const params = new URLSearchParams();
    if (poNumberQ) params.set("po_number", poNumberQ);
    if (mode) params.set("mode", "edit");
    params.set("returnTo", location.pathname + location.search);
    navigate(`/vendor_bill?${params.toString()}`);
  };
  const goToLogisticsList = () => {
    const num = formData.po_number || poNumberQ;
    if (!num) return;
    const params = new URLSearchParams();
    params.set("po_number", num);
    navigate(`/logistics?${params.toString()}`);
  };
  const goToInspectionList = () => {
    const params = new URLSearchParams();
    if (poNumberQ) params.set("po_number", poNumberQ);
    params.set("returnTo", location.pathname + location.search);
    navigate(`/inspection?${params.toString()}`);
  };

  // ====== INSPECTION STATE ======
  const [inspectionEnabled, setInspectionEnabled] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [selectedForInspection, setSelectedForInspection] = useState({});
  const toggleSelectLine = (lineId) =>
    setSelectedForInspection((prev) => ({ ...prev, [lineId]: !prev[lineId] }));
  const clearInspectionSelection = () => setSelectedForInspection({});
  const selectedItems = useMemo(() => {
    const ids = new Set(
      Object.keys(selectedForInspection).filter((k) => selectedForInspection[k])
    );
    return (lines || []).filter((l) => ids.has(l.id));
  }, [selectedForInspection, lines]);

  const [addInspection, { isLoading: isSubmittingInspection }] =
    useAddInspectionMutation();

  const mapInspectionPayload = (payload) => {
    const {
      vendor,
      project_code,
      items = [],
      inspection = {},
      po_number,
    } = payload;

    return {
      project_code: project_code || undefined,
      vendor,
      vendor_contact: inspection.contact_person || "",
      po_number: po_number,
      vendor_mobile: inspection.contact_mobile || "",
      mode: inspection.mode,
      location: inspection.mode === "offline" ? inspection.location || "" : "",
      description: inspection.notes || "",
      date: inspection.datetime || null,
      item: items.map((it) => ({
        category_id: it.category_id || it.productCategoryName || null,
        product_name: it.product_name || it.productName || "",
        description: it.description || it.briefDescription || "",
        product_make: it.makeQ || it.make || "",
        uom: it.uom || "",
        quantity: String(it.quantity ?? 0),
      })),
    };
  };

  const [attName, setAttName] = useState("");
  const [attFile, setAttFile] = useState(null);
  const [attDragging, setAttDragging] = useState(false);
  const [attUploading, setAttUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const onDragOverAttachment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAttDragging(true);
  };
  const onDragLeaveAttachment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAttDragging(false);
  };
  const onDropAttachment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAttDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) setAttFile(file);
  };
  const onPickAttachment = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttFile(file);
  };
  const getExtFromName = (name) => {
    const dot = String(name || "").lastIndexOf(".");
    return dot >= 0 ? name.slice(dot) : "";
  };

  const handleUploadAttachment = async () => {
    if (!formData?._id) return toast.error("PO id missing.");
    if (!attFile) return toast.error("Please choose a file.");
    if (!attName.trim()) return toast.error("Please enter a document name.");

    try {
      setAttUploading(true);
      const token = localStorage.getItem("authToken");

      const hasExt = /\.[A-Za-z0-9]+$/.test(attName.trim());
      const ext = hasExt ? "" : getExtFromName(attFile.name) || "";
      const finalFilename = `${attName.trim()}${ext}`;

      const fd = new FormData();
      fd.append("file", attFile, finalFilename);

      const resp = await Axios.put(`/edit-pO-IT/${formData._id}`, fd, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const updated = resp?.data?.data || {};
      const last =
        Array.isArray(updated.attachments) && updated.attachments.length
          ? updated.attachments[updated.attachments.length - 1]
          : null;

      const niceName = last?.attachment_name || finalFilename;

      // Optimistic feed
      pushHistoryItem({
        kind: "note",
        note: `Attachment added: ${niceName}`,
      });

      const u = getUserData();
      try {
        await addPoHistory({
          subject_type: "purchase_order",
          subject_id: formData._id,
          event_type: "note",
          message: `Attachment added: ${niceName}`,
          createdBy: {
            name: u?.name || "User",
            user_id: u?._id,
          },
          attachments: last
            ? [
              {
                name: last.attachment_name,
                url: last.attachment_url,
              },
            ]
            : [],
        }).unwrap();
      } catch (e) {
        console.warn("Failed to save history for attachment:", e);
      }

      toast.success("Attachment uploaded.");
      setAttName("");
      setAttFile(null);
      setUploadModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.msg || "Failed to upload attachment");
    } finally {
      setAttUploading(false);
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{
        ml: fromModal ? 0 : { xs: "0%", lg: "12%", xl: "20%" },
        maxWidth: fromModal ? "full" : 1400,
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 3,
            boxShadow: "md",
            borderRadius: "lg",
            bgcolor: "background.surface",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography level="h3" sx={{ fontWeight: 700 }}>
              Purchase Order
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Upload icon -> opens modal */}
              {effectiveMode !== "create" && formData?._id && (
                <Tooltip title="Upload document">
                  <IconButton
                    variant="soft"
                    color="primary"
                    onClick={() => setUploadModalOpen(true)}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              )}

              {/* Existing action buttons */}
              {!viewMode && (
                <>
                  {/* Send Approval Button */}
                  {(effectiveMode === "edit" &&
                    statusNow === "approval_rejected") ||
                    fromModal ? (
                    <Button
                      component="button"
                      type="submit"
                      form="po-form"
                      name="action"
                      value="send_approval"
                      variant="solid"
                      startDecorator={<Send />}
                      sx={{
                        bgcolor: "#214b7b",
                        color: "#fff",
                        "&:hover": { bgcolor: "#163553" },
                      }}
                      disabled={isSubmitting}
                    >
                      Send Approval
                    </Button>
                  ) : null}

                  {/* Confirm Order Button */}
                  {effectiveMode === "edit" &&
                    statusNow === "approval_done" &&
                    !fromModal &&
                    (user?.department === "SCM" ||
                      user?.name === "IT Team") && (
                      <Button
                        component="button"
                        type="submit"
                        form="po-form"
                        name="action"
                        value="confirm_order"
                        variant="outlined"
                        startDecorator={<ConfirmationNumber />}
                        sx={{
                          borderColor: "#214b7b",
                          color: "#214b7b",
                          "&:hover": {
                            bgcolor: "rgba(33, 75, 123, 0.1)",
                            borderColor: "#163553",
                            color: "#163553",
                          },
                        }}
                        disabled={isSubmitting}
                      >
                        Confirm Order
                      </Button>
                    )}
                </>
              )}

              {(user?.department === "CAM" ||
                user?.name === "Sushant Ranjan Dubey" ||
                user?.name === "Sanjiv Kumar" ||
                user?.name === "Guddu Rani Dubey" ||
                user?.name === "Varun Mishra" ||
                user?.name === "IT Team") &&
                isApprovalPending && (
                  <Box display="flex" gap={2}>
                    <Button
                      variant="solid"
                      color="success"
                      sx={{ minWidth: 100 }}
                      startDecorator={<Check />}
                      onClick={handleApprove}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="danger"
                      sx={{ minWidth: 100 }}
                      startDecorator={<Close />}
                      onClick={() => setOpenRefuse(true)}
                    >
                      Refuse
                    </Button>
                  </Box>
                )}
              <Button
                color="danger"
                size="sm"
                variant="outlined"
                onClick={exportPdf}
                disabled={isFetching}
              >
                {isFetching ? "Generating..." : "Pdf"}
              </Button>

              {((effectiveMode === "edit" && user?.department === "SCM") ||
                user?.department === "superadmin" ||
                user?.department === "admin" ||
                approvalRejected) &&
                !fromModal && (
                  <Box display="flex" gap={2}>
                    {(user?.department === "SCM" ||
                      user?.name === "Guddu Rani Dubey" ||
                      user?.name === "Varun Mishra" ||
                      user?.name === "IT Team") && (
                        <Box>
                          <Button
                            variant={manualEdit ? "outlined" : "solid"}
                            color={manualEdit ? "neutral" : "primary"}
                            onClick={() => setManualEdit((s) => !s)}
                            sx={{ width: "fit-content" }}
                          >
                            {manualEdit ? "Cancel Edit" : "Edit"}
                          </Button>
                        </Box>
                      )}
                  </Box>
                )}
            </Box>
          </Box>

          {/* Optional tags */}
          {Array.isArray(categoryNames) && categoryNames.length > 0 && (
            <Box sx={{ mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {categoryNames.map((c) => (
                <Chip key={c} color="primary" variant="soft" size="sm">
                  {c}
                </Chip>
              ))}
            </Box>
          )}

          {effectiveMode === "edit" &&
            statusNow === "approval_done" &&
            (user?.department === "SCM" || user?.name === "IT Team") &&
            (!fromModal || statusNow !== "approval_rejected") && (
              <Box sx={{ mb: 2 }}>
                <Typography level="body-sm" fontWeight="lg" sx={{ mb: 0.5 }}>
                  PO Number
                </Typography>
                <Input
                  name="po_number"
                  value={formData.po_number}
                  onChange={handleChange}
                  placeholder="e.g. PO-0001"
                  variant="plain"
                  disabled={statusNow === "po_created"}
                  sx={{
                    "--Input-minHeight": "52px",
                    fontSize: 28,
                    px: 0,
                    color: "#607d8b",
                    "--Input-focusedHighlight": "transparent",
                    "--Input-focusedThickness": "0px",
                    "&:focus-within": {
                      boxShadow: "none",
                      borderBottomColor: "#163553",
                    },
                    "& .MuiInput-root": { boxShadow: "none" },
                    "& input": { outline: "none" },
                    borderBottom: "2px solid #214b7b",
                    borderRadius: 0,
                    "&:hover": { borderBottomColor: "#163553" },
                    "& input::placeholder": { color: "#9aa8b5", opacity: 1 },
                    ...(statusNow === "po_created" ? DISABLED_SX : {}),
                  }}
                  slotProps={{
                    input: {
                      sx:
                        statusNow === "po_created"
                          ? { color: "text.primary" }
                          : undefined,
                    },
                  }}
                />
              </Box>
            )}

          {!fromModal && poNumberQ && (
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
                    PO Number
                  </Typography>
                  <Chip
                    color="primary"
                    size="sm"
                    variant="solid"
                    sx={{ fontWeight: 700 }}
                  >
                    {formData?.po_number || "—"}
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
                    {formData?.submitted_By?.name || "-"}
                  </Chip>
                </Box>
              </Sheet>

              <Box
                display={"flex"}
                gap={2}
                alignItems={"center"}
                justifyContent={"center"}
              >
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
                      onClick={goToVendorList}
                      role="button"
                      tabIndex={0}
                    >
                      <LocalMallOutlinedIcon fontSize="small" color="primary" />
                      <Box sx={{ lineHeight: 1.1 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          Vendor Bills
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary" }}
                        >
                          {formData.total_bills}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider orientation="vertical" />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.25,
                        py: 0.75,
                        cursor: poNum ? "pointer" : "not-allowed",
                        opacity: poNum ? 1 : 0.6,
                        "&:hover": poNum
                          ? { bgcolor: "neutral.softHoverBg" }
                          : undefined,
                      }}
                      onClick={poNum ? goToLogisticsList : undefined}
                      role="button"
                      tabIndex={0}
                    >
                      <LocalShippingOutlinedIcon
                        fontSize="small"
                        color="primary"
                      />
                      <Box sx={{ lineHeight: 1.1 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          Logistics
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary" }}
                        >
                          {isLogFetching ? "…" : logisticsCount}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider orientation="vertical" />
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
                      onClick={goToInspectionList}
                      role="button"
                      tabIndex={0}
                    >
                      <LocalMallOutlinedIcon fontSize="small" color="primary" />
                      <Box sx={{ lineHeight: 1.1 }}>
                        <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                          Inspections
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary" }}
                        >
                          {formData.inspectionCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Sheet>
                </Box>

                <Box>
                  <Button
                    color="primary"
                    size="sm"
                    variant="solid"
                    startDecorator={<Add />}
                    onClick={() => setBillModalOpen(true)}
                  >
                    Add Bill
                  </Button>
                </Box>
                {poNumberQ && (
                  <Box
                    display={"flex"}
                    gap={2}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Checkbox
                      size="sm"
                      label={
                        inspectionEnabled
                          ? "Disable Inspection Request"
                          : "Enable Inspection Request"
                      }
                      checked={inspectionEnabled}
                      onChange={(e) => {
                        setInspectionEnabled(e.target.checked);
                        if (!e.target.checked) clearInspectionSelection();
                      }}
                    />
                    {inspectionEnabled && (
                      <Button
                        size="sm"
                        variant="outlined"
                        disabled={
                          !inspectionEnabled || selectedItems.length === 0
                        }
                        onClick={() => setInspectionModalOpen(true)}
                      >
                        Request Inspection
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Form */}
          <form id="po-form" onSubmit={handleSubmit}>
            <Sheet
              variant="outlined"
              sx={{ p: 2, borderRadius: "lg", mb: 1.5 }}
            >
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    Project Code
                  </Typography>
                  <Input
                    value={formData.project_code}
                    {...disabledInputProps}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    Vendor
                  </Typography>
                  <ReactSelect
                    styles={rsx}
                    menuPortalTarget={document.body}
                    isClearable
                    isLoading={vendorsLoading}
                    onInputChange={(input, meta) => {
                      if (meta.action === "input-change") {
                        setVendorSearch(input);
                        setVendorPage(1);
                      }
                    }}
                    filterOption={() => true}
                    options={vendorOptions}
                    value={selectedVendorOption}
                    onChange={(opt) => handleVendorChange(opt)}
                    placeholder="Search vendor"
                    noOptionsMessage={() =>
                      vendorsLoading ? "Loading…" : "No vendors"
                    }
                    isDisabled={inputsDisabled}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    PO Date
                  </Typography>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    {...(inputsDisabled ? disabledInputProps : {})}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    Delivery Type
                  </Typography>
                  <ReactSelect
                    styles={rsx}
                    menuPortalTarget={document.body}
                    isClearable
                    options={[
                      { value: "for", label: "For" },
                      { value: "slnko", label: "Slnko" },
                    ]}
                    value={
                      formData.delivery_type
                        ? {
                          value: formData.delivery_type,
                          label:
                            formData.delivery_type === "for"
                              ? "For"
                              : formData.delivery_type === "slnko"
                                ? "Slnko"
                                : "",
                        }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        delivery_type: selected ? selected.value : "",
                      }))
                    }
                    placeholder="Select Delivery Type"
                    isDisabled={inputsDisabled}
                  />
                </Grid>
              </Grid>
            </Sheet>

            {/* Product Table */}
            <Sheet
              variant="outlined"
              sx={{ p: 2, borderRadius: "xl", mb: 2, overflow: "hidden" }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <Chip color="primary" variant="soft" size="sm">
                  Products
                </Chip>
                {inspectionEnabled && (
                  <Chip size="sm" variant="soft" color="neutral">
                    {
                      Object.values(selectedForInspection).filter(Boolean)
                        .length
                    }{" "}
                    selected for inspection
                  </Chip>
                )}
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
                  "& td:nth-of-type(1)": {
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  },
                }}
              >
                <thead>
                  <tr>
                    {inspectionEnabled && <th style={{ width: 44 }}>Pick</th>}
                    <th style={{ width: "12%" }}>Category</th>
                    <th style={{ width: "16%" }}>Product</th>
                    <th style={{ width: "12%" }}>Brief Description</th>
                    <th style={{ width: "14%" }}>Make</th>
                    <th style={{ width: "10%" }}>Qty</th>
                    <th style={{ width: "14%" }}>Unit Price</th>
                    <th style={{ width: "10%" }}>Taxes</th>
                    <th style={{ width: "14%" }}>Amount</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const base =
                      Number(l.quantity || 0) * Number(l.unitPrice || 0);
                    const taxAmt = (base * Number(l.taxPercent || 0)) / 100;
                    const gross = base + taxAmt;
                    const show = l.isShow;
                    const key = mkKey(l.productCategoryId, l.productName);
                    const rowMakes = makesCache[key] || [];

                    const selectedMakeSafe = isValidMake(l.make) ? l.make : "";
                    const inList = rowMakes.some(
                      (m) =>
                        String(m).toLowerCase() ===
                        String(selectedMakeSafe).toLowerCase()
                    );
                    const selectValue = inList ? selectedMakeSafe : "";

                    const makeDisabled =
                      inputsDisabled || !l.productCategoryId || !l.productName;

                    return (
                      <tr
                        key={l.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                      >
                        {inspectionEnabled && (
                          <td className="px-3 py-2 align-middle">
                            <Checkbox
                              size="sm"
                              checked={!!selectedForInspection[l.id]}
                              onChange={() => toggleSelectLine(l.id)}
                            />
                          </td>
                        )}

                        {/* Category Select */}
                        <td className="px-3 py-2 align-middle text-sm">
                          {!isRowLocked(l) && manualEdit && !fromModal ? (
                            <JSelect
                              variant="outlined"
                              size="sm"
                              value={l.productCategoryId ?? null}
                              onChange={(_, v) => {
                                if (!v) return;

                                if (v === SEARCH_MORE_CATEGORY) {
                                  setActiveLineId(l.id);
                                  setCategoryModalOpen(true);
                                  return;
                                }

                                const picked = categoryData.find(
                                  (c) => c._id === v
                                );
                                updateLine(l.id, "productCategoryId", v);
                                updateLine(
                                  l.id,
                                  "productCategoryName",
                                  picked?.name || l.productCategoryName || ""
                                );
                              }}
                              placeholder="Select Category"
                              renderValue={(selected) => (
                                <Typography level="body-sm" noWrap>
                                  {categoryData.find((c) => c._id === selected)
                                    ?.name ||
                                    l.productCategoryName ||
                                    "Select Category"}
                                </Typography>
                              )}
                              className="min-w-[150px] rounded-md"
                              sx={{
                                "& .MuiSelect-listbox": {
                                  maxHeight: 250,
                                  overflowY: "auto",
                                  borderRadius: "0.5rem",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  paddingY: 0.5,
                                },
                              }}
                            >
                              {/* normal page of categories */}
                              {categoryData.map((cat) => (
                                <Option
                                  key={cat._id}
                                  value={cat._id}
                                  sx={{
                                    paddingY: 1,
                                    paddingX: 2,
                                    fontSize: "0.875rem",
                                    "&:hover": { bgcolor: "gray.100" },
                                  }}
                                >
                                  {cat.name}
                                </Option>
                              ))}

                              {/* ✅ ensure the currently selected category is visible even if it's not in categoryData */}
                              {l.productCategoryId &&
                                !categoryData.some(
                                  (c) => c._id === l.productCategoryId
                                ) && (
                                  <Option value={l.productCategoryId}>
                                    {l.productCategoryName ||
                                      "Current category"}
                                  </Option>
                                )}

                              <Option
                                value={SEARCH_MORE_CATEGORY}
                                color="primary"
                              >
                                Search more…
                              </Option>
                            </JSelect>
                          ) : (
                            <Typography level="body-sm">
                              {l.productCategoryName}
                            </Typography>
                          )}
                        </td>

                        {/* Product Select */}
                        <td className="px-3 py-2 align-middle text-sm">
                          {!isRowLocked(l) && manualEdit && !fromModal ? (
                            <JSelect
                              variant="outlined"
                              size="sm"
                              value={l.productId ?? null}
                              onListboxOpenChange={(open) => {
                                if (open) setActiveLineId(l.id);
                              }}
                              onChange={(_, v) => {
                                if (!v) return;

                                if (v === SEARCH_MORE_PRODUCT) {
                                  setActiveLineId(l.id);
                                  if (!l.productCategoryId) {
                                    toast.error("Pick a category first.");
                                    return;
                                  }
                                  setProductModalOpen(true);
                                  return;
                                }
                                if (v === CREATE_PRODUCT) {
                                  openCreateProductForLine(l);
                                  return;
                                }

                                const picked = productData.find(
                                  (p) => p._id === v
                                );
                                if (!picked) return;

                                const getVal = (prod, field, def = "") => {
                                  const f = prod?.data?.find(
                                    (d) => d?.name === field
                                  );
                                  return f?.values?.[0]?.input_values ?? def;
                                };

                                const name =
                                  getVal(
                                    picked,
                                    "Product Name",
                                    picked.name || ""
                                  ) ||
                                  getVal(picked, "Name", picked.name || "");

                                updateLine(l.id, "productId", picked._id);
                                updateLine(l.id, "productName", name);
                                updateLine(
                                  l.id,
                                  "briefDescription",
                                  getVal(picked, "Description", "N/A")
                                );
                                updateLine(
                                  l.id,
                                  "unitPrice",
                                  Number(getVal(picked, "Cost", 0))
                                );
                                updateLine(
                                  l.id,
                                  "taxPercent",
                                  Number(getVal(picked, "GST", 0))
                                );
                                updateLine(
                                  l.id,
                                  "make",
                                  getVal(picked, "Make", "N/A")
                                );
                                updateLine(
                                  l.id,
                                  "uom",
                                  getVal(picked, "UoM", "N/A")
                                );
                              }}
                              placeholder="Select Product"
                              renderValue={(selected) => {
                                const picked = productData.find(
                                  (p) => p._id === selected
                                );
                                const getVal = (prod, field, def = "") => {
                                  const f = prod?.data?.find(
                                    (d) => d?.name === field
                                  );
                                  return f?.values?.[0]?.input_values ?? def;
                                };
                                const label =
                                  (picked &&
                                    getVal(
                                      picked,
                                      "Product Name",
                                      picked?.name || ""
                                    )) ||
                                  l.productName ||
                                  "Select Product";
                                return (
                                  <Typography level="body-sm" noWrap>
                                    {label}
                                  </Typography>
                                );
                              }}
                              disabled={!l.productCategoryId || inputsDisabled}
                              className="min-w-[240px] rounded-md"
                              sx={{
                                "& .MuiSelect-listbox": {
                                  maxHeight: 300,
                                  overflowY: "auto",
                                  borderRadius: "0.5rem",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  paddingY: 0.5,
                                },
                              }}
                            >
                              {productData.map((prod) => {
                                const f = prod?.data?.find(
                                  (d) => d?.name === "Product Name"
                                );
                                const label =
                                  f?.values?.[0]?.input_values ??
                                  prod?.name ??
                                  "Unnamed";
                                return (
                                  <Option
                                    key={prod._id}
                                    value={prod._id}
                                    sx={{
                                      paddingY: 1,
                                      paddingX: 2,
                                      fontSize: "0.875rem",
                                      whiteSpace: "normal",
                                      "&:hover": { bgcolor: "gray.100" },
                                    }}
                                  >
                                    <Typography noWrap>{label}</Typography>
                                  </Option>
                                );
                              })}

                              {l.productId &&
                                !productData.some(
                                  (p) => p._id === l.productId
                                ) && (
                                  <Option value={l.productId}>
                                    <Typography noWrap>
                                      {l.productName || "Unnamed"}
                                    </Typography>
                                  </Option>
                                )}

                              <Option
                                value={SEARCH_MORE_PRODUCT}
                                color="primary"
                              >
                                Search more…
                              </Option>
                              {!!l.productCategoryId && (
                                <Option value={CREATE_PRODUCT} color="success">
                                  + Create new product…
                                </Option>
                              )}
                            </JSelect>
                          ) : (
                            <Typography level="body-sm">
                              {l.productName}
                            </Typography>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-3 py-2 align-middle text-gray-600 text-sm">
                          {manualEdit && !fromModal ? (
                            <Textarea
                              minRows={1}
                              size="sm"
                              variant="outlined"
                              placeholder="Brief Description"
                              value={l.briefDescription}
                              onChange={(e) =>
                                updateLine(
                                  l.id,
                                  "briefDescription",
                                  e.target.value
                                )
                              }
                              {...disabledTextareaProps}
                              className="w-56 rounded-md"
                              sx={{
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                ...DISABLED_SX,
                              }}
                            />
                          ) : (
                            <Typography level="body-sm">
                              {l.briefDescription}
                            </Typography>
                          )}
                        </td>

                        {/* Make */}
                        <td className="px-3 py-2 align-middle text-sm">
                          {manualEdit && !fromModal ? (
                            <Typography
                              level="body-sm"
                              sx={{
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                fontWeight: 400,
                              }}
                            >
                              {l.make || "—"}
                            </Typography>
                          ) : (
                            <Typography level="body-sm">{l.make}</Typography>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-3 py-2 align-middle">
                          <Input
                            size="sm"
                            type="number"
                            variant="outlined"
                            value={l.quantity}
                            onChange={(e) =>
                              updateLine(l.id, "quantity", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "0.00001" } }}
                            {...(inputsDisabled ? disabledInputProps : {})}
                            className="w-20 rounded-md"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="px-3 py-2 align-middle">
                          <Input
                            size="sm"
                            type="number"
                            variant="outlined"
                            value={l.unitPrice}
                            onChange={(e) =>
                              updateLine(l.id, "unitPrice", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "0.00001" } }}
                            {...(inputsDisabled ? disabledInputProps : {})}
                            className="w-24 rounded-md"
                          />
                        </td>

                        {/* Tax */}
                        <td className="px-3 py-2 align-middle">
                          <Input
                            size="sm"
                            type="number"
                            variant="outlined"
                            value={l.taxPercent}
                            onChange={(e) =>
                              updateLine(l.id, "taxPercent", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "0.00001" } }}
                            {...(inputsDisabled ? disabledInputProps : {})}
                            className="w-20 rounded-md"
                          />
                        </td>

                        {/* Gross */}
                        <td className="px-3 py-2 align-middle">
                          <Typography className="text-green-700 font-semibold text-sm">
                            ₹{" "}
                            {(
                              Number(l.quantity || 0) *
                              Number(l.unitPrice || 0) +
                              ((Number(l.quantity || 0) *
                                Number(l.unitPrice || 0) *
                                Number(l.taxPercent || 0)) /
                                100 || 0)
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </td>

                        {/* Delete */}
                        <td className="px-3 py-2 align-middle">
                          {manualEdit && (
                            <IconButton
                              variant="plain"
                              color="danger"
                              className="hover:bg-red-50"
                              onClick={() => removeLine(l.id)}
                            >
                              <DeleteOutline />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Box>

              {manualEdit && (
                <Box
                  sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}
                >
                  <Button variant="plain" size="sm" onClick={addLine}>
                    Add a product
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography level="body-sm" sx={{ mb: 0.5 }}>
                Description…
              </Typography>
              <Textarea
                minRows={3}
                placeholder="Write Description of Purchase Order"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                {...(effectiveMode === "view" ? disabledTextareaProps : {})}
              />

              {/* Totals */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Sheet
                  variant="soft"
                  sx={{ borderRadius: "lg", p: 2, minWidth: 320 }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      rowGap: 0.5,
                      columnGap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <Typography level="body-sm" textColor="text.tertiary">
                      Untaxed Amount:
                    </Typography>
                    <Typography level="body-sm" fontWeight="lg">
                      ₹{" "}
                      {Number(amounts.untaxed || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>

                    <Typography level="body-sm">Tax:</Typography>
                    <Typography level="body-sm" fontWeight={700}>
                      ₹ {Number(amounts.tax || 0).toFixed(2)}
                    </Typography>

                    <Typography level="title-md" sx={{ mt: 0.5 }}>
                      Total:
                    </Typography>
                    <Typography
                      level="title-md"
                      fontWeight="xl"
                      sx={{ mt: 0.5 }}
                    >
                      ₹{" "}
                      {Number(amounts.total || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                </Sheet>
              </Box>
            </Sheet>

            {/* Bottom buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              {manualEdit && (
                <Button
                  component="button"
                  type="submit"
                  form="po-form"
                  name="action"
                  value="edit_save"
                  variant="solid"
                  loading={isSubmitting}
                >
                  Save changes
                </Button>
              )}

              <Button
                variant="soft"
                startDecorator={<RestartAlt />}
                sx={{
                  borderColor: "#214b7b",
                  color: "#214b7b",
                  "&:hover": {
                    bgcolor: "rgba(33, 75, 123, 0.1)",
                    borderColor: "#163553",
                    color: "#163553",
                  },
                }}
                onClick={() =>
                  onClose ? onClose() : navigate("/purchase-order")
                }
              >
                Back
              </Button>
            </Box>
          </form>
        </Box>

        {/* Vendor Search More Modal */}
        <SearchPickerModal
          open={vendorModalOpen}
          onClose={() => setVendorModalOpen(false)}
          onPick={onPickVendor}
          title="Search: Vendor"
          columns={vendorColumns}
          fetchPage={fetchVendorsPage}
          searchKey="name"
          pageSize={VENDOR_LIMIT}
          backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
        />

        <Modal open={createProdOpen} onClose={() => setCreateProdOpen(false)}>
          <ModalDialog
            sx={{ maxWidth: 1000, width: "95vw", p: 0, overflow: "hidden" }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom:
                  "1px solid var(--joy-palette-neutral-outlinedBorder)",
              }}
            >
              <Typography level="h5">Create Product</Typography>
            </Box>
            <Box sx={{ p: 2, maxHeight: "70vh", overflow: "auto" }}>
              <ProductForm
                embedded
                initialForm={createProdInitial}
                onClose={() => setCreateProdOpen(false)}
                onCreated={(created) => handleProductCreated(created)}
              />
            </Box>
          </ModalDialog>
        </Modal>

        <Modal open={openRefuse} onClose={() => setOpenRefuse(false)}>
          <ModalDialog>
            <Typography level="h5">Refuse Purchase Order</Typography>
            <Textarea
              minRows={3}
              placeholder="Enter refusal remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Button color="danger" onClick={handleRefuse}>
              Submit Refuse
            </Button>
          </ModalDialog>
        </Modal>

        <Modal open={billModalOpen} onClose={() => setBillModalOpen(false)}>
          <ModalDialog
            sx={{
              maxWidth: 1200,
              width: "100vw",
              maxHeight: "90vh",
              overflow: "auto",
              p: 0,
            }}
          >
            <Box sx={{ p: 0 }}>
              <AddBill
                poData={formData}
                poLines={lines}
                onClose={() => setBillModalOpen(false)}
                fromModal
              />
            </Box>
          </ModalDialog>
        </Modal>

        {/* INSPECTION Modal */}
        <Modal
          open={inspectionModalOpen}
          onClose={() => setInspectionModalOpen(false)}
        >
          <ModalDialog
            sx={{
              maxWidth: 1100,
              width: "95vw",
              p: 0,
              overflow: "auto",
              ml: { xs: 0, lg: "10%", xl: "8%" },
            }}
          >
            <InspectionForm
              open
              vendorName={formData?.name || ""}
              projectCode={formData?.project_code || ""}
              po_number={poNumberQ}
              items={selectedItems}
              onClose={() => setInspectionModalOpen(false)}
              onSubmit={async (payload) => {
                try {
                  const body = mapInspectionPayload(payload);
                  await addInspection(body).unwrap();
                  toast.success("Inspection request submitted.");
                  setInspectionModalOpen(false);
                  clearInspectionSelection();
                } catch (e) {
                  toast.error(
                    e?.data?.message ||
                    e?.error ||
                    "Failed to submit inspection request"
                  );
                }
              }}
            />
          </ModalDialog>
        </Modal>

        {/* ===== Upload Modal ===== */}
        <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
          <ModalDialog
            sx={{ maxWidth: 500, width: "95vw", p: 2, borderRadius: "md" }}
          >
            <Typography level="h5" fontWeight="lg" mb={2}>
              Upload Document
            </Typography>

            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleUploadAttachment();
              }}
            >
              {/* Document Name */}
              <Box mb={2}>
                <Typography level="body-sm" fontWeight="md">
                  Document Name
                </Typography>
                <Input
                  placeholder="Enter document name"
                  value={attName}
                  onChange={(e) => setAttName(e.target.value)}
                />
              </Box>

              {/* File Drop Area */}
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: attDragging
                    ? "primary.solidBg"
                    : "neutral.outlinedBorder",
                  borderRadius: "md",
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: attDragging ? "primary.softBg" : "transparent",
                }}
                onDragOver={onDragOverAttachment}
                onDragLeave={onDragLeaveAttachment}
                onDrop={onDropAttachment}
                onClick={() =>
                  document.getElementById("file-input-hidden").click()
                }
              >
                {attFile ? (
                  <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                    {attFile.name}
                  </Typography>
                ) : (
                  <Typography level="body-sm" color="neutral">
                    Drag & drop a file here, or click to browse
                  </Typography>
                )}
                <input
                  type="file"
                  id="file-input-hidden"
                  style={{ display: "none" }}
                  onChange={onPickAttachment}
                />
              </Box>

              {/* Actions */}
              <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={attUploading}
                  disabled={!attFile || !attName.trim()}
                >
                  Upload
                </Button>
              </Box>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>

      <SearchPickerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onPick={onPickCategory}
        title="Search: Category"
        columns={categoryColumns}
        fetchPage={fetchCategoriesPageCat}
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      <SearchPickerModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onPick={onPickProduct}
        title="Search: Product"
        columns={productColumns}
        fetchPage={(args) =>
          fetchProductPageCat({
            ...args,
            categoryId:
              lines.find((x) => x.id === activeLineId)?.productCategoryId || "",
          })
        }
        searchKey="name"
        pageSize={7}
        backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
      />

      {!fromModal && (
        <Box ref={feedRef}>
          <POUpdateFeed
            items={historyItems}
            onAddNote={handleAddHistoryNote}
            compact
          />
        </Box>
      )}

      {/* ===== ETD Modal (required for Confirm Order) ===== */}
      <Modal
        open={etdModalOpen}
        onClose={() => {
          setEtd("");
          setEtdModalOpen(false);
        }}
      >
        <ModalDialog sx={{ maxWidth: 420, width: "95vw" }}>
          <Typography level="h5" fontWeight="lg" mb={1}>
            Expected Delivery Date (ETD)
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary", mb: 1 }}>
            Please select the ETD to proceed with confirmation.
          </Typography>
          <Input
            type="date"
            value={etd}
            onChange={(e) => setEtd(e.target.value)}
            sx={{ "--Input-minHeight": "40px" }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="plain"
              onClick={() => {
                setEtd("");
                setEtdModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                if (!etd) {
                  toast.error("Please select ETD to continue.");
                  return;
                }
                setEtdModalOpen(false);

                const btn = document.querySelector(
                  'button[form="po-form"][name="action"][value="confirm_order"]'
                );
                if (btn) btn.click();
              }}
            >
              Save & Continue
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default AddPurchaseOrder;
