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
} from "@mui/joy";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
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
import { Check } from "lucide-react";
import {
  useGetProductsQuery,
  useLazyGetProductsQuery,
} from "../../redux/productsSlice";
import ProductForm from "./Product_Form";
import POUpdateFeed from "../PoUpdateForm";
import {
  useAddPoHistoryMutation,
  useLazyGetPoHistoryQuery,
} from "../../redux/poHistory";

const VENDOR_LIMIT = 7;
const SEARCH_MORE_VENDOR = "__SEARCH_MORE_VENDOR__";
const SEARCH_MORE_MAKE = "__SEARCH_MORE_MAKE__";
const CREATE_PRODUCT_INLINE = "__CREATE_PRODUCT_INLINE__";

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

  /* Vendors */
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);

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
    setFormData((prev) => ({ ...prev, name: row.name || "" }));
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
  });

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
          productCategoryId:
            typeof it?.category === "object"
              ? (it?.category?._id ?? "")
              : (it?.category ?? ""),
          productCategoryName:
            typeof it?.category === "object" ? (it?.category?.name ?? "") : "",
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
          : (resp?.data ?? resp);
        if (!po) {
          toast.error("PO not found.");
          return;
        }
        setFetchedPoStatus(po?.current_status?.status || "draft");
        setFormData((prev) => ({
          ...prev,
          _id: po?._id || prev._id,
          p_id: po?.p_id ?? prev.p_id,
          project_code: po?.p_id ?? prev.p_id ?? "",
          po_number: po?.po_number ?? prev.po_number ?? "",
          total_billed: po?.total_billed ?? prev.total_billed ?? "",
          total_bills: po?.total_bills ?? prev.total_bills ?? "",
          createdAt: po?.createdAt ?? prev.createdAt ?? "",
          name: po?.vendor ?? "",
          date: po?.date ?? "",
          partial_billing: po?.partial_billing ?? "",
          submitted_By: po?.submitted_By ?? prev.submitted_By,
          po_basic: String(po?.po_basic ?? prev.po_basic ?? ""),
          gst: String(po?.gst ?? prev.gst ?? ""),
          po_value: String(po?.po_value ?? prev.po_value ?? ""),
          delivery_type: String(po?.delivery_type ?? prev.delivery_type ?? ""),
        }));
        setLines(mapPOtoLines(po));
      } catch (err) {
        console.error("Failed to load PO:", err);
        toast.error("Failed to load PO.");
      } finally {
        setPoLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!opt) return setFormData((prev) => ({ ...prev, name: "" }));
    if (opt.value === SEARCH_MORE_VENDOR) return setVendorModalOpen(true);
    setFormData((prev) => ({ ...prev, name: opt.value || "" }));
  };

  const [activeLineId, setActiveLineId] = useState(null);

  useGetProductsQuery(
    { search: "", page: 1, limit: 1, category: "" },
    { skip: true }
  );
  const [triggerGetProducts] = useLazyGetProductsQuery();
  const [productModalOpen, setProductModalOpen] = useState(false);

  const onPickProduct = (row) => {
    if (!row || !activeLineId) {
      setProductModalOpen(false);
      return;
    }
    const pickedMake = getProdField(row, "Make") || "";
    const pickedUom =
      getProdField(row, "UoM") || getProdField(row, "UOM") || "";
    const patch = {
      productId: row?._id || "",
      productName: getProdField(row, "Product Name") || "",
      productCategoryId:
        row?.category?._id ||
        lines.find((l) => l.id === activeLineId)?.productCategoryId ||
        "",
      productCategoryName:
        row?.category?.name ||
        lines.find((l) => l.id === activeLineId)?.productCategoryName ||
        "",
      briefDescription: getProdField(row, "Description") || "",
      make: isValidMake(pickedMake) ? pickedMake : "",
      uom: pickedUom,
      unitPrice: Number(getProdField(row, "Cost") || 0),
      taxPercent: Number(getProdField(row, "GST") || 0),
    };
    Object.entries(patch).forEach(([k, v]) => updateLine(activeLineId, k, v));
    setProductModalOpen(false);
  };

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
    setMakesCache((prev) => ({ ...prev, [key]: unique }));
    return unique;
  };

  useEffect(() => {
    const pairs = Array.from(
      new Set(
        (lines || [])
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
  }, [lines.map((l) => `${l.productCategoryId}::${l.productName}`).join("|")]);

  /* ---------- Make modal ---------- */
  const [makeModalOpen, setMakeModalOpen] = useState(false);
  const fetchMakesPage = async ({ search = "", page = 1, pageSize = 7 }) => {
    const row = lines.find((r) => r.id === activeLineId);
    const cat = row?.productCategoryId;
    const pname = row?.productName;
    if (!cat || !pname) return { rows: [], total: 0, page: 1, pageSize };
    const res = await triggerGetProducts(
      { search: pname, page: 1, limit: 300, category: String(cat) },
      true
    );
    const rows = res?.data?.data || [];
    const normalized = String(pname).trim().toLowerCase();
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
    const filtered = search
      ? unique.filter((m) =>
          m.toLowerCase().includes(String(search).toLowerCase())
        )
      : unique;
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const pageRows = filtered
      .slice(start, start + pageSize)
      .map((m) => ({ make: m }));
    return { rows: pageRows, total, page, pageSize };
  };
  const onPickMake = (row) => {
    if (!row || !activeLineId) {
      setMakeModalOpen(false);
      return;
    }
    updateLine(activeLineId, "make", row.make || "");
    setMakeModalOpen(false);
  };

  const [createProdOpen, setCreateProdOpen] = useState(false);
  const [createProdInitial, setCreateProdInitial] = useState(null);
  const [createProdLineId, setCreateProdLineId] = useState(null);

  const openCreateProductForLine = (line) => {
    if (!line?.productCategoryId || !line?.productName) {
      toast.error("Pick category and product name first.");
      return;
    }
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
      const catName = newProduct?.category?.name || "";
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
    setLines((prev) =>
      prev.map((l) => {
        if (!l.productCategoryId || !l.productName || !l.make) return l;
        const list =
          makesCache[mkKey(l.productCategoryId, l.productName)] || [];
        const ok = list.some(
          (m) => String(m).toLowerCase() === String(l.make).toLowerCase()
        );
        return ok ? l : { ...l, make: "" };
      })
    );
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
      return { ...base, kind: "note", note: doc.message || "" };
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
  /* ===== End helpers ===== */

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

    const item = (lines || [])
      .filter((l) => l?.productName || l?.productCategoryName)
      .map((l) => {
        const categoryId =
          typeof l.productCategoryId === "object" && l.productCategoryId?._id
            ? String(l.productCategoryId._id)
            : l.productCategoryId != null
              ? String(l.productCategoryId)
              : "";
        return {
          category: String(categoryId),
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
      if (!isApprovalPending)
        return toast.error("Editing allowed only during approval pending.");
      if (!hasValidLine)
        return toast.error("Add at least one valid product row.");

      const token = localStorage.getItem("authToken");
      setIsSubmitting(true);
      try {
        const body = {
          po_number: formData.po_number,
          vendor: formData.name,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          submitted_By: formData.submitted_By,
          delivery_type: formData.delivery_type,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
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
          },
          { headers: { "x-auth-token": token } }
        );
        toast.success("PO confirmed.");
        onSuccess?.({ created: false, updated: true, status: "po_created" });

        // >>> HISTORY (optimistic + server)
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
            vendor: formData.name,
            date: formData.date,
            partial_billing: formData.partial_billing || "",
            submitted_By: user.name,
            delivery_type: formData.delivery_type,
            pr_id,
            po_basic: String(amounts.untaxed ?? 0),
            gst: String(amounts.tax ?? 0),
            po_value: Number(amounts.total ?? 0),
            item,
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
            vendor: formData.name,
            date: formData.date,
            partial_billing: formData.partial_billing || "",
            submitted_By: formData.submitted_By,
            delivery_type: formData.delivery_type,
            po_basic: String(amounts.untaxed ?? 0),
            gst: String(amounts.tax ?? 0),
            po_value: Number(amounts.total ?? 0),
            item,
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

    /* ---------- CREATE ---------- */
    if (effectiveMode === "create" || fromModal) {
      if (!formData.name) return toast.error("Vendor is required.");
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
          vendor: formData.name,
          date: formData.date,
          partial_billing: formData.partial_billing || "",
          submitted_By: user.name,
          delivery_type: formData.delivery_type,
          pr_id,
          po_basic: String(amounts.untaxed ?? 0),
          gst: String(amounts.tax ?? 0),
          po_value: Number(amounts.total ?? 0),
          item,
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

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await Axios.put(
        "/updateStatusPO",
        { id: _id, status: "approval_done", remarks: "Approved by CAM" },
        { headers: { "x-auth-token": token } }
      );

      toast.success("PO Approved");

      // Optimistic status
      pushHistoryItem({
        kind: "status",
        statusFrom: statusNow,
        statusTo: "approval_done",
        title: "PO approved",
      });

      // Persist history via RTK Query
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
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to refuse");
    }
  };

  const user = getUserData();

  /* -------- vendor options -------- */
  const vendorOptions = [
    ...(formData.name && !vendorRows.some((v) => v.name === formData.name)
      ? [{ value: formData.name, label: formData.name }]
      : []),
    ...vendorRows.map((v) => ({ value: v.name, label: v.name, _raw: v })),
    { value: SEARCH_MORE_VENDOR, label: "Search more…" },
  ];

  const location = useLocation();
  const goToVendorList = () => {
    const params = new URLSearchParams();
    if (poNumberQ) params.set("po_number", poNumberQ);
    if (mode) params.set("mode", "edit");
    params.set("returnTo", location.pathname + location.search);
    navigate(`/vendor_bill?${params.toString()}`);
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{
        ml: fromModal ? 0 : { xs: "2%", lg: "6%", xl: "12%" },
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
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {!viewMode && (
                <>
                  {((effectiveMode === "edit" &&
                    statusNow === "approval_rejected") ||
                    fromModal) && (
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
                  )}

                  {(effectiveMode === "edit" &&
                    statusNow === "approval_done" &&
                    user?.department === "SCM") ||
                    (user?.name === "IT Team" &&
                      !fromModal &&
                      statusNow === "approval_done" && (
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
                      ))}
                </>
              )}
              {(user?.department === "CAM" ||
                user?.name === "Sushant Ranjan Dubey" ||
                user?.name === "Sanjiv Kumar" ||
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

              {((effectiveMode === "edit" && isApprovalPending) ||
                approvalRejected) && (
                <Box display="flex" gap={2}>
                  {(user?.department === "SCM" ||
                    user?.name === "Guddu Rani Dubey" ||
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

          {/* PO Number entry for confirm stage */}
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
                  }}
                />
              </Box>
            )}

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
                  {formData?.submitted_By || "-"}
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
            </Box>
          </Box>

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
                  <Input disabled value={formData.project_code} />
                </Grid>

                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    Vendor
                  </Typography>
                  <ReactSelect
                    styles={{
                      control: (base) => ({ ...base, minHeight: 40 }),
                      dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                      valueContainer: (base) => ({ ...base, padding: "0 6px" }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
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
                    value={
                      formData.name
                        ? { value: formData.name, label: formData.name }
                        : null
                    }
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
                    disabled={inputsDisabled}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Typography level="body1" fontWeight="bold" mb={0.5}>
                    Delivery Type
                  </Typography>
                  <ReactSelect
                    styles={{
                      control: (base) => ({ ...base, minHeight: 40 }),
                      dropdownIndicator: (base) => ({ ...base, padding: 4 }),
                      valueContainer: (base) => ({ ...base, padding: "0 6px" }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={[
                      { value: "afor", label: "Afor" },
                      { value: "slnko", label: "Slnko" },
                    ]}
                    value={
                      formData.delivery_type
                        ? {
                            value: formData.delivery_type,
                            label:
                              formData.delivery_type === "afor"
                                ? "Afor"
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
                    <th style={{ width: "12%" }}>Category</th>
                    <th style={{ width: "12%" }}>Product</th>
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

                    const key = mkKey(l.productCategoryId, l.productName);
                    const rowMakes = makesCache[key] || [];

                    const selectedMakeSafe = isValidMake(l.make) ? l.make : "";
                    const inList = rowMakes.some(
                      (m) =>
                        String(m).toLowerCase() ===
                        String(selectedMakeSafe).toLowerCase()
                    );
                    const selectValue = inList ? selectedMakeSafe : "";

                    return (
                      <tr key={l.id}>
                        <td>
                          <Input
                            size="sm"
                            variant="plain"
                            placeholder="Category"
                            value={l.productCategoryName}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "productCategoryName",
                                e.target.value
                              )
                            }
                            disabled
                          />
                        </td>
                        <td>
                          <Input
                            size="sm"
                            variant="plain"
                            placeholder="Product name"
                            value={l.productName}
                            onChange={(e) =>
                              updateLine(l.id, "productName", e.target.value)
                            }
                            disabled
                          />
                        </td>
                        <td>
                          <Input
                            size="sm"
                            variant="plain"
                            placeholder="Brief Description"
                            value={l.briefDescription}
                            onChange={(e) =>
                              updateLine(
                                l.id,
                                "briefDescription",
                                e.target.value
                              )
                            }
                            disabled
                          />
                        </td>

                        {/* Make dropdown */}
                        <td>
                          {!manualEdit && !fromModal ? (
                            <Typography
                              level="body-sm"
                              sx={{
                                whiteSpace: "normal",
                                overflowWrap: "anywhere",
                                wordBreak: "break-word",
                                fontWeight: 400,
                              }}
                            >
                              {l.makeQ || "—"}
                            </Typography>
                          ) : (
                            <Box sx={{ maxWidth: "100%" }}>
                              <JSelect
                                variant="plain"
                                size="sm"
                                value={selectValue}
                                sx={{
                                  width: "100%",
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
                                    },
                                  },
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
                                onChange={(_, v) => {
                                  if (v === SEARCH_MORE_MAKE) {
                                    setActiveLineId(l.id);
                                    setMakeModalOpen(true);
                                    return;
                                  }
                                  if (v === CREATE_PRODUCT_INLINE) {
                                    openCreateProductForLine(l);
                                    return;
                                  }
                                  updateLine(l.id, "make", v || "");
                                }}
                                placeholder="Make"
                                disabled={
                                  inputsDisabled ||
                                  !l.productCategoryId ||
                                  !l.productName
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
                                    {selectValue || "Select make"}
                                  </Typography>
                                )}
                              >
                                {rowMakes.slice(0, 7).map((m) => (
                                  <Option
                                    key={m}
                                    value={m}
                                    sx={{
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {m}
                                  </Option>
                                ))}
                                {l.productCategoryId && l.productName && (
                                  <Option
                                    value={SEARCH_MORE_MAKE}
                                    color="neutral"
                                  >
                                    Search more…
                                  </Option>
                                )}
                                {l.productCategoryId && l.productName && (
                                  <Option
                                    value={CREATE_PRODUCT_INLINE}
                                    color="primary"
                                  >
                                    + Create Product…
                                  </Option>
                                )}
                              </JSelect>
                            </Box>
                          )}
                        </td>

                        <td>
                          <Input
                            size="sm"
                            type="number"
                            variant="plain"
                            value={l.quantity}
                            onChange={(e) =>
                              updateLine(l.id, "quantity", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "1" } }}
                            disabled={inputsDisabled}
                          />
                        </td>
                        <td>
                          <Input
                            size="sm"
                            type="number"
                            variant="plain"
                            value={l.unitPrice}
                            onChange={(e) =>
                              updateLine(l.id, "unitPrice", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "0.01" } }}
                            disabled={inputsDisabled}
                          />
                        </td>
                        <td>
                          <Input
                            size="sm"
                            type="number"
                            variant="plain"
                            value={l.taxPercent}
                            onChange={(e) =>
                              updateLine(l.id, "taxPercent", e.target.value)
                            }
                            slotProps={{ input: { min: 0, step: "0.01" } }}
                            disabled={inputsDisabled}
                          />
                        </td>
                        <td>
                          <Typography level="body-sm" fontWeight="lg">
                            ₹{" "}
                            {gross.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </td>
                        <td>
                          {isApprovalPending && manualEdit && (
                            <IconButton
                              variant="plain"
                              color="danger"
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

              {isApprovalPending && manualEdit && (
                <Box
                  sx={{ display: "flex", gap: 3, color: "primary.600", mt: 1 }}
                >
                  <Button variant="plain" size="sm" onClick={addLine}>
                    Add a product
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Totals */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                      {amounts.untaxed.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>

                    <Typography level="body-sm">Tax:</Typography>
                    <Typography level="body-sm" fontWeight={700}>
                      ₹ {amounts.tax.toFixed(2)}
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
                      {amounts.total.toLocaleString(undefined, {
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
              {isApprovalPending && manualEdit && (
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

        {/* Product picker */}
        <SearchPickerModal
          open={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setActiveLineId(null);
          }}
          onPick={onPickProduct}
          title="Search: Product"
          columns={[
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
          ]}
          fetchPage={async ({ search = "", page = 1, pageSize = 7 }) => {
            const res = await triggerGetProducts(
              { search, page, limit: pageSize, category: "" },
              true
            );
            const d = res?.data;
            const total = d?.meta?.total ?? d?.pagination?.total ?? 0;
            const curPage = d?.meta?.page ?? d?.pagination?.page ?? page;
            const limit = d?.meta?.limit ?? d?.pagination?.limit ?? pageSize;
            return {
              rows: d?.data || [],
              total,
              page: curPage,
              pageSize: limit,
            };
          }}
          searchKey="name"
          pageSize={7}
          backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
        />

        {/* Make Search Modal */}
        <SearchPickerModal
          open={makeModalOpen}
          onClose={() => {
            setMakeModalOpen(false);
            setActiveLineId(null);
          }}
          onPick={onPickMake}
          title="Select Make"
          columns={[{ key: "make", label: "Make", width: 320 }]}
          fetchPage={fetchMakesPage}
          searchKey="make"
          pageSize={7}
          backdropSx={{ backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" }}
        />

        {/* Create Product (embedded ProductForm) */}
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
      </Box>

      <Box ref={feedRef}>
        <POUpdateFeed
          items={historyItems}
          onAddNote={handleAddHistoryNote}
          compact
        />
      </Box>
    </Box>
  );
};

export default AddPurchaseOrder;
