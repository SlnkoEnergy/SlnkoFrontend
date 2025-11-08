import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Money } from "@mui/icons-material";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { CircularProgress, Option, Select, Textarea, Tooltip } from "@mui/joy";
import { Modal, ModalDialog } from "@mui/joy";

import {
  Clock,
  CheckCircle2,
  AlarmClockMinusIcon,
  AlertTriangle,
  Calendar,
  Handshake,
  PackageCheck,
  Truck,
} from "lucide-react";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import NoData from "../assets/alert-bell.svg";
import {
  useGetPaginatedPOsQuery,
  useUpdateEtdOrDeliveryDateMutation,
  useUpdatePurchasesStatusMutation,
  useBulkDeliverPOsMutation,
} from "../redux/purchasesSlice";
import {
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
} from "../redux/productsSlice";

const PurchaseOrderSummary = forwardRef((props, ref) => {
  const {
    project_code,
    vendor_id,
    onSelectionChange,
    selectItem = () => { },
  } = props;
  const [po, setPO] = useState("");
  const [selectedtype, setSelectedtype] = useState("");
  const [selected, setSelected] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRemarks, setBulkRemarks] = useState("");
  const [bulkDate, setBulkDate] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const readStr = (key, fallback) => {
    const v = searchParams.get(key);
    return v != null ? v : fallback;
  };
  const initialSearch = readStr("search", "");

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [openModal, setOpenModal] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [perPage, setPerPage] = useState(initialPageSize);
  const projectId = project_code || "";

  // Top 7 categories for the compact Select
  const { data: catInitialData } = useGetCategoriesNameSearchQuery({
    page: 1,
    search: "",
    limit: 7,
    projectId,
  });

  // Lazy fetcher for SearchPickerModal
  const [triggerCatSearch] = useLazyGetCategoriesNameSearchQuery();

  const topCategories = useMemo(() => {
    const rows = catInitialData?.data || catInitialData?.rows || [];
    return rows
      .map((r) => ({
        _id: r?._id,
        name: r?.name ?? r?.category ?? r?.make ?? "",
      }))
      .filter((x) => x.name);
  }, [catInitialData]);

  const totalCats =
    catInitialData?.total ??
    catInitialData?.count ??
    catInitialData?.totalCount ??
    topCategories.length;

  const { state } = useLocation();
  const navigate = useNavigate();

  const location = useLocation();
  const isLogisticsPage = location.pathname === "/logistics";

  const pr_id = searchParams.get("pr_id") || state?.pr_id || "";
  const item_id = searchParams.get("item_id") || state?.item_id || "";
  const selecteditem = searchParams.get("itemSearch") || ""
  const selectedStatusFilter = searchParams.get("status") || "";
  const deliveryFrom = searchParams.get("delivery_from") || "";
  const deliveryTo = searchParams.get("delivery_to") || "";
  const selectedpo = searchParams.get("poStatus") || "";
  const etdFrom = searchParams.get("etd_from") || "";
  const etdTo = searchParams.get("etd_to") || "";


  const {
    data: getPO = [],
    isLoading,
    error,
  } = useGetPaginatedPOsQuery({
    page: currentPage,
    pageSize: perPage,
    status: selectedpo,
    search: searchQuery,
    type: selectedtype,
    etdFrom,
    etdTo,
    deliveryFrom,
    deliveryTo,
    filter: selectedStatusFilter,
    project_id: project_code ? project_code : "",
    pr_id: pr_id ? pr_id.toString() : "",
    item_id: item_id ? item_id.toString() : "",
    itemSearch: selecteditem || "",
    vendor_id: vendor_id ? vendor_id : "",
  });

  const [bulkDeliverPOs, { isLoading: isBulkDelivering }] =
    useBulkDeliverPOsMutation();
  const { data: getPoData = [], total = 0, count = 0 } = getPO;
  const totalPages = Math.ceil(total / perPage);

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  const getPaginationRange = () => {
    const siblings = 1;
    const pages = [];
    if (totalPages <= 5 + siblings * 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(currentPage - siblings, 2);
      const right = Math.min(currentPage + siblings, totalPages - 1);
      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };



  const handleCloseBulkModal = () => {
    setBulkModalOpen(false);
    setBulkRemarks("");
    setBulkDate("");
  };

  const [updateStatus] = useUpdatePurchasesStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState("");
  const handleStatusChange = async () => {
    try {
      const nextStatusMap = {
        material_ready: "ready_to_dispatch",
        ready_to_dispatch: "out_for_delivery",
        out_for_delivery: "delivered",
        short_quantity: "delivered",
        delivered: "ready_to_dispatch",
      };

      const updatedStatus = nextStatusMap[selectedStatus] ?? "material_ready";

      await updateStatus({
        id: po,
        status: updatedStatus,
        remarks,
      }).unwrap();

      toast.success("Status Updated Successfully");
      setRemarks("");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const RowMenu = ({ currentPage, po_number, current_status, etd }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      const userData = getUserData();
      setUser(userData);
    }, []);

    const getUserData = () => {
      const userData = localStorage.getItem("userDetails");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    };

    return (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: { variant: "plain", color: "neutral", size: "sm" },
          }}
        >
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          {(user?.name === "IT Team" ||
            user?.name === "admin" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Varun Mishra" ||
            user?.name === "Prachi Singh" ||
            user?.department === "SCM") &&
            (current_status?.status === "delivered" ? (
              <span>
                <MenuItem disabled>
                  <EditNoteIcon />
                  <Typography>Change Status</Typography>
                </MenuItem>
              </span>
            ) : (
              <MenuItem
                onClick={() => {
                  if (!etd) {
                    toast.error("ETD must be set before changing status");
                    return;
                  }

                  if (
                    etd &&
                    (current_status?.status?.toLowerCase() === "po_created" ||
                      current_status?.status?.toLowerCase() === "draft")
                  ) {
                    setNextStatus("material_ready");
                  } else if (current_status?.status === "ready_to_dispatch") {
                    setNextStatus("out_for_delivery");
                  } else if (current_status?.status === "out_for_delivery") {
                    setNextStatus("delivered");
                  } else if (
                    po.etd &&
                    current_status?.status !== "material_ready"
                  ) {
                    setNextStatus("material_ready");
                  } else {
                    setNextStatus("ready_to_dispatch");
                  }

                  setOpenModal(true);
                  setPO(po_number);
                  setSelectedStatus(current_status?.status);
                }}
              >
                <EditNoteIcon />
                <Typography>Change Status</Typography>
              </MenuItem>
            ))}
        </Menu>
      </Dropdown>
    );
  };

  const paginatedPo = useMemo(() => {
    return Array.isArray(getPO?.data) ? getPO.data : [];
  }, [getPO]);

  const readInt = (key, fallback) => {
    const v = parseInt(searchParams.get(key) || "", 10);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };


  useEffect(() => {
    const page = readInt("page", 1);
    const size = readInt("pageSize", 10);
    const search = readStr("search", "");
    setCurrentPage(page);
    setPerPage(size);
    setSearchQuery(search);
  }, [searchParams]);


  const updateParams = (partial) => {
    const current = Object.fromEntries(searchParams.entries());
    Object.entries(partial).forEach(([k, v]) => {
      if (v === undefined || v === "") delete current[k];
      else current[k] = String(v);
    });
    setSearchParams(current);
  };

  const handleSearch = (query) => {
    const q = query
    setSearchQuery(q);
    updateParams({ search: q || undefined, page: 1, pageSize: perPage });
    setCurrentPage(1);
    setSelected([]);
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) => {
      const next = prev.includes(_id)
        ? prev.filter((item) => item !== _id)
        : [...prev, _id];
      onSelectionChange(next);
      return next;
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const next = paginatedPo.map((row) => row._id);
      setSelected(next);
      onSelectionChange(next);
    } else {
      setSelected([]);
      onSelectionChange([]);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(page));
        return next;
      });
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  useImperativeHandle(
    ref,
    () => ({
      getSelectedPOSeed: () => {
        const pos = selected.map((id) => {
          const r = paginatedPo.find((x) => x._id === id);
          return {
            _id: id,
            po_number: r?.po_number || "",
            p_id: r?.p_id || "",
            project_id: r?.project_id?._id ?? r?.project_id ?? "",
            vendor: r?.vendor ?? "",
            pr_id: r?.pr?._id ?? r?.pr_id ?? "",
          };
        });
        return { pos };
      },
      clearSelection: () => {
        setSelected([]);
        onSelectionChange([]);
      },
      openBulkDeliverModal: () => setBulkModalOpen(true),
    }),
    [selected, paginatedPo, onSelectionChange]
  );

  const BillingStatusChip = ({ status }) => {
    const isFullyBilled = status === "Fully Billed";
    const isPending = status === "Bill Pending";

    const label = isFullyBilled
      ? "Fully Billed"
      : isPending
        ? "Pending"
        : status;

    const icon = isFullyBilled ? (
      <CheckRoundedIcon />
    ) : isPending ? (
      <AutorenewRoundedIcon />
    ) : null;

    const color = isFullyBilled ? "success" : isPending ? "warning" : "neutral";

    return (
      <Chip variant="soft" size="sm" startDecorator={icon} color={color}>
        {label}
      </Chip>
    );
  };

  const RenderPid = ({ p_id }) => {
    return (
      <Box>
        {p_id ? (
          <Tooltip title={p_id} arrow placement="top">
            <Chip
              variant="outlined"
              color="primary"
              size="md"
              sx={{
                fontWeight: 600,
                fontSize: 13,
                borderRadius: "20px",
                cursor: "pointer",
                maxWidth: 200,
              }}
            >
              {p_id}
            </Chip>
          </Tooltip>
        ) : (
          <Chip
            variant="soft"
            color="neutral"
            size="md"
            sx={{ fontWeight: 500, fontSize: 13, borderRadius: "20px" }}
          >
            -
          </Chip>
        )}
      </Box>
    );
  };

  const RenderPONumber = ({ po_number, date, po_id, pr_no }) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj)) return "-";
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return (
      <>
        {po_number ? (
          <Box
            onClick={() => navigate(`/add_po?mode=edit&po_number=${po_number}`)}
          >
            <span
              style={{ cursor: "pointer", fontWeight: 500, color: "#1976d2" }}
            >
              {po_number}
            </span>
          </Box>
        ) : (
          <Chip
            onClick={() => navigate(`/add_po?mode=edit&_id=${po_id}`)}
            variant="soft"
            color="warning"
            size="sm"
            startDecorator={<Clock size={14} />}
            sx={{ fontWeight: 500, mt: 0.5, cursor: "pointer" }}
          >
            Coming Soon
          </Chip>
        )}

        <Box display="flex" alignItems="center" mt={0.5}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>PR No : </span> &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {pr_no || "0"}
          </Typography>
        </Box>

        {date ? (
          <Box
            display="flex"
            alignItems="center"
            mt={0.5}
            sx={{ cursor: "pointer", color: "text.secondary" }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>PO Date: </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {formatDate(date)}
            </Typography>
          </Box>
        ) : (
          <Typography
            level="body2"
            sx={{
              mt: 0.5,
              fontSize: 12,
              fontStyle: "italic",
              color: "neutral.500",
            }}
          >
            Awaiting Date Assignment
          </Typography>
        )}
      </>
    );
  };

  const RenderStatusDates = ({
    etd,
    rtd,
    delivery_date,
    mrd,
    current_status,
    po_number,
  }) => {
    const [etdDate, setEtdDate] = useState(etd || "");
    const [rtdDate, setRtdDate] = useState(rtd || "");
    const [mrdDate, setMrdDate] = useState(mrd || "");
    const [deliveryDate, setDeliveryDate] = useState(delivery_date || "");
    const [updateEtdOrDeliveryDate] = useUpdateEtdOrDeliveryDateMutation();
    const [confirmType, setConfirmType] = useState("");
    const [etdTempDate, setEtdTempDate] = useState("");
    const [deliveryTempDate, setDeliveryTempDate] = useState("");
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj)) return "-";
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const handleDateChange = async (newEtd, newDelivery) => {
      try {
        await updateEtdOrDeliveryDate({
          po_number,
          etd: newEtd,
          delivery_date: newDelivery,
        }).unwrap();
        alert("Dates Updated Successfully");
      } catch (err) {
        console.error("Failed to update dates:", err);
        alert("Failed to update dates");
      }
    };

    return (
      <>
        <Box display="flex" alignItems="center" mt={0.5}>
          <Calendar size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>ETD Date : </span>
          &nbsp;
          {etdDate ? (
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {formatDate(etdDate)}
            </Typography>
          ) : (
            <input
              type="date"
              value={etdDate}
              onChange={(e) => {
                setEtdTempDate(e.target.value);
                setConfirmType("etd");
                setOpenConfirmDialog(true);
              }}
              style={{
                fontSize: "12px",
                padding: "2px 4px",
                borderRadius: "4px",
                border: "1px solid lightgray",
              }}
            />
          )}
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          <Calendar size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>MR Date : </span>
          &nbsp;
          {mrdDate ? (
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {formatDate(mrdDate)}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ⚠️ MR Date Not Found
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          <Calendar size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>RTD Date : </span>
          &nbsp;
          {rtdDate ? (
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              {formatDate(rtdDate)}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ⚠️ RTD Not Found
            </Typography>
          )}
        </Box>

        {current_status?.toLowerCase() === "delivered" && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <Calendar size={12} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Delivery Date :{" "}
            </span>
            &nbsp;
            {deliveryDate ? (
              <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
                {formatDate(deliveryDate)}
              </Typography>
            ) : (
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => {
                  setDeliveryTempDate(e.target.value);
                  setConfirmType("delivery");
                  setOpenConfirmDialog(true);
                }}
                style={{
                  fontSize: "12px",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  border: "1px solid lightgray",
                }}
              />
            )}
          </Box>
        )}

        <Modal
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
        >
          <ModalDialog>
            <Typography level="title-md">Confirm Submission</Typography>
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              Are you sure you want to submit this date?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                onClick={() => setOpenConfirmDialog(false)}
                variant="plain"
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={async () => {
                  setOpenConfirmDialog(false);
                  if (confirmType === "etd") {
                    setEtdDate(etdTempDate);
                    await handleDateChange(etdTempDate, deliveryDate);
                  } else if (confirmType === "delivery") {
                    setDeliveryDate(deliveryTempDate);
                    await handleDateChange(etdDate, deliveryTempDate);
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </>
    );
  };

  const RenderItem_Vendor = ({ vendor, item, other_item, amount }) => {
    const categories = Array.isArray(item)
      ? item.filter(Boolean).map(String)
      : item
        ? [String(item)]
        : [];

    const onlyOther =
      categories.length === 1 && categories[0].trim().toLowerCase() === "other";
    const normalized = onlyOther ? [other_item || "Other"] : categories;

    const hasMultiple = normalized.length > 1;
    const first = normalized[0] || "";
    const rest = normalized.slice(1);

    const truncatedFirst =
      first.length > 15 ? first.substring(0, 15) + "..." : first;

    const tooltipContent = (
      <Box
        display="flex"
        flexDirection="column"
        gap={0.5}
        sx={{
          maxWidth: 300,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {normalized.map((c, i) => (
          <Typography
            key={i}
            sx={{
              fontSize: 12,
              lineHeight: 1.5,
              color: "white",
              display: "block",
            }}
          >
            {i + 1}. {c}
          </Typography>
        ))}
      </Box>
    );

    return (
      <>
        <Box display="flex" alignItems="center" gap={0.5}>
          {first.length > 15 || hasMultiple ? (
            <Tooltip
              title={tooltipContent}
              arrow
              placement="top-start"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#374151",
                    color: "white",
                    maxWidth: 320,
                    p: 1.2,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  },
                },
                arrow: { sx: { color: "#374151" } },
              }}
            >
              <span style={{ fontWeight: 400, fontSize: 14 }}>
                {truncatedFirst}
              </span>
            </Tooltip>
          ) : (
            <span style={{ fontWeight: 400, fontSize: 14 }}>{first}</span>
          )}

          {hasMultiple && (
            <Tooltip
              title={tooltipContent}
              arrow
              placement="top-start"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#374151",
                    color: "white",
                    maxWidth: 320,
                    p: 1.2,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  },
                },
                arrow: { sx: { color: "#374151" } },
              }}
            >
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 1,
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: "12px",
                  bgcolor: "#6b7280",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                +{rest.length}
              </Box>
            </Tooltip>
          )}
        </Box>

        {!!amount && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <Money size={12} color="green" />
            &nbsp;
            <span style={{ fontSize: 12, fontWeight: 600 }}>Amount : </span>
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ₹ {amount}
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" mt={0.5}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Vendor : </span>&nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {vendor}
          </Typography>
        </Box>
      </>
    );
  };

  const RenderTotalBilled = ({ total_billed = 0 }) => {
    const billed = Number(total_billed);
    const formattedAmount =
      billed > 0
        ? new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(billed)
        : null;

    return (
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        {formattedAmount && (
          <Typography level="body-sm" fontWeight="md" color="neutral">
            ₹ {formattedAmount}
          </Typography>
        )}
      </Box>
    );
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "material_ready":
        return <AlarmClockMinusIcon size={18} style={{ marginRight: 6 }} />;
      case "ready_to_dispatch":
        return <PackageCheck size={18} style={{ marginRight: 6 }} />;
      case "out_for_delivery":
        return <Truck size={18} style={{ marginRight: 6 }} />;
      case "partially_delivered":
        return <PackageCheck size={18} style={{ marginRight: 6 }} />;
      case "short_quantity":
        return <AlertTriangle size={18} style={{ marginRight: 6 }} />;
      case "delivered":
        return <Handshake size={18} style={{ marginRight: 6 }} />;
      case "etd pending":
        return <Clock size={18} style={{ marginRight: 6 }} />;
      case "etd done":
        return <CheckCircle2 size={18} style={{ marginRight: 6 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "material_ready":
        return "#6002ee";
      case "approval_pending":
        return "#214b7b";
      case "approval_done":
        return "#7ACA82";
      case "ready_to_dispatch":
        return "red";
      case "out_for_delivery":
        return "orange";
      case "partially_delivered":
        return "#f59e0b";
      case "short_quantity":
        return "#b45309";
      case "delivered":
        return "green";
      case "etd pending":
        return "#999";
      case "etd done":
        return "#1976d2";
      default:
        return "error";
    }
  };
  const isViewVendor =
    location.pathname === "/view_vendor" ||
    location.pathname === "/project_detail";
  return (
    <Box
      sx={{
        ml: isViewVendor ? 0 : { lg: "var(--Sidebar-width)" },
        width: isViewVendor
          ? "100%"
          : { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        pt={2}
        pb={0.5}
        flexWrap="wrap"
        gap={1}
      >
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            width: { xs: "100%", md: "50%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search Project Id, PO Number, Vendor"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: { xs: "66vh", xl: "75vh" },
          overflow: "auto",
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <tr>
              {/* Checkbox column */}
              <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < paginatedPo.length
                  }
                  checked={
                    selected.length === paginatedPo.length &&
                    paginatedPo.length > 0
                  }
                  onChange={handleSelectAll}
                  color={selected.length > 0 ? "primary" : "neutral"}
                />
              </th>

              {[
                "Project ID",
                "PO Number",
                "Category Name",
                "PO Value(incl. GST)",
                "Advance Paid",
                ...(isLogisticsPage ? [] : ["Bill Status"]),
                ...(isLogisticsPage ? [] : ["Total Billed"]),
                "Status",
                "Delay",
                "",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    padding: 8,
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ padding: "8px", textAlign: "center" }}
                >
                  <Typography color="danger">Something went wrong</Typography>
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ padding: "8px", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ marginBottom: "8px" }} />
                    <Typography fontStyle="italic">
                      Loading Po&apos;s… please hang tight ⏳
                    </Typography>
                  </Box>
                </td>
              </tr>
            ) : paginatedPo.length > 0 ? (
              paginatedPo.map((po, index) => {
                let etd = null;
                let delay = 0;

                const now = new Date();
                const dispatch_date = po.dispatch_date
                  ? new Date(po.dispatch_date)
                  : null;

                if (po.etd) {
                  etd = new Date(po.etd);
                  if (dispatch_date) {
                    const timeDiff = dispatch_date - etd;
                    delay = Math.max(
                      0,
                      Math.floor(timeDiff / (1000 * 60 * 60 * 24))
                    );
                  } else if (now > etd) {
                    const timeDiff = now - etd;
                    delay = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  }
                }

                const formattedStatus = (() => {
                  const status = po?.current_status?.status;
                  if (status?.toLowerCase() === "draft") {
                    if (!po?.etd) return "ETD Pending";
                    return "ETD Done";
                  }
                  return status;
                })();

                return (
                  <Box
                    component="tr"
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Checkbox
                        checked={selected.includes(po._id)}
                        onChange={() => handleRowSelect(po._id)}
                        color={
                          selected.includes(po._id) ? "primary" : "neutral"
                        }
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 15,
                        minWidth: 250,
                      }}
                    >
                      <RenderPid p_id={po.p_id} />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 14,
                        minWidth: 250,
                      }}
                    >
                      <RenderPONumber
                        po_number={po?.po_number}
                        po_id={po?._id}
                        date={po?.date}
                        pr_no={po.pr_no}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        minWidth: 350,
                      }}
                    >
                      <RenderItem_Vendor
                        item={
                          po.category_names === "Other"
                            ? "other"
                            : po.category_names
                        }
                        other_item={po?.pr?.other_item_name}
                        amount={po?.pr?.amount}
                        vendor={po.vendor}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 14,
                        minWidth: 200,
                      }}
                    >
                      ₹
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(po.po_value)}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 14,
                        minWidth: 150,
                      }}
                    >
                      {po.po_number ? (
                        <Typography level="body-sm">
                          ₹{" "}
                          {new Intl.NumberFormat("en-IN", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }).format(po.amount_paid ?? 0)}
                        </Typography>
                      ) : (
                        <Chip size="sm" variant="soft" color="neutral">
                          PO No Pending
                        </Chip>
                      )}
                    </Box>

                    {!isLogisticsPage && (
                      <Box
                        component="td"
                        sx={{
                          padding: 1,
                          textAlign: "left",
                          borderBottom: "1px solid",
                          fontSize: 14,
                          minWidth: 150,
                        }}
                      >
                        <BillingStatusChip status={po.partial_billing} />
                      </Box>
                    )}

                    {!isLogisticsPage && (
                      <Box
                        component="td"
                        sx={{
                          padding: 1,
                          textAlign: "left",
                          borderBottom: "1px solid",
                          minWidth: 150,
                        }}
                      >
                        <RenderTotalBilled total_billed={po.total_billed} />
                      </Box>
                    )}

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        minWidth: 280,
                        width: 300,
                      }}
                    >
                      <Tooltip
                        title={po?.current_status?.remarks || "No remarks"}
                        arrow
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            py: 0.5,
                            borderRadius: "16px",
                            color: getStatusColor(formattedStatus),
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "1rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {getStatusIcon(formattedStatus)}
                          {formattedStatus?.replace(/_/g, " ")}
                        </Box>
                      </Tooltip>

                      <RenderStatusDates
                        rtd={po?.dispatch_date}
                        mrd={po?.material_ready_date}
                        etd={po?.etd}
                        delivery_date={po?.delivery_date}
                        current_status={po?.current_status?.status}
                        po_number={po?.po_number}
                      />
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        minWidth: 100,
                      }}
                    >
                      {po?.etd ? (
                        (() => {
                          const now = new Date();
                          const etd = new Date(po.etd);
                          let delay = 0;
                          if (po.dispatch_date) {
                            delay = Math.max(
                              0,
                              Math.floor(
                                (new Date(po.dispatch_date) - etd) /
                                (1000 * 60 * 60 * 24)
                              )
                            );
                          } else if (now > etd) {
                            delay = Math.floor(
                              (now - etd) / (1000 * 60 * 60 * 24)
                            );
                          }
                          return delay > 0 ? (
                            <Typography
                              sx={{ color: "red", fontSize: 13, mt: 0.5 }}
                            >
                              ⏱ Delayed by {delay} day{delay > 1 ? "s" : ""}
                            </Typography>
                          ) : (
                            <Typography
                              sx={{ color: "green", fontSize: 13, mt: 0.5 }}
                            >
                              ✅ No delay
                            </Typography>
                          );
                        })()
                      ) : (
                        <Typography
                          sx={{
                            color: "gray",
                            fontSize: 13,
                            mt: 0.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          ⚠️
                        </Typography>
                      )}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po?.current_status?.status !== "delivered" &&
                        po?.etd !== null && (
                          <RowMenu
                            currentPage={currentPage}
                            po_number={po.po_number}
                            current_status={po.current_status}
                            etd={po.etd}
                          />
                        )}
                    </Box>
                  </Box>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} style={{ textAlign: "center", padding: 16 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data Image"
                      style={{ width: "50px", height: "50px" }}
                    />
                    <Typography fontStyle={"italic"}>
                      No PO available
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 1,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <Box>
          <Typography level="body-sm">
            Showing {startIndex}–{endIndex} of {total} results
          </Typography>
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {getPaginationRange().map((page, idx) =>
            page === "..." ? (
              <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                ...
              </Box>
            ) : (
              <IconButton
                key={page}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            )
          )}
        </Box>

        <FormControl size="sm" sx={{ minWidth: 80 }}>
          <Select
            value={perPage}
            onChange={(_e, newValue) => {
              setPerPage(newValue);
              setCurrentPage(1);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", "1");
                next.set("pageSize", String(newValue));
                return next;
              });
            }}
          >
            {[10, 30, 60, 100, 500, 1000].map((num) => (
              <Option key={num} value={num}>
                {num}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>

        {/* Status Change Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Sheet
            variant="outlined"
            sx={{
              maxWidth: 400,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
              mx: "auto",
              mt: "10%",
            }}
          >
            <Typography level="h5" mb={1}>
              Confirm Status Change
            </Typography>
            <Typography mb={2}>
              Do you want to change status to{" "}
              <b>{nextStatus.replace(/_/g, " ")}</b>?
            </Typography>

            <Textarea
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              minRows={3}
              sx={{ mb: 2 }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <Button variant="plain" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                color="primary"
                disabled={!remarks.trim()}
                onClick={handleStatusChange}
              >
                Confirm
              </Button>
            </div>
          </Sheet>
        </Modal>

        {/* Bulk Deliver Modal */}
        <Modal open={bulkModalOpen} onClose={handleCloseBulkModal}>
          <Sheet
            variant="outlined"
            sx={{
              maxWidth: 420,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
              mx: "auto",
              mt: "10%",
            }}
          >
            <Typography level="h5" mb={1}>
              Mark {selected.length} PO{selected.length > 1 ? "s" : ""} as
              Delivered?
            </Typography>
            <Typography level="body-sm" mb={2}>
              This will set <b>ETD</b>, <b>MR</b>, <b>RTD</b>, and{" "}
              <b>Delivery</b> dates to the same day (from the date you provide
              below, or “now” in IST if left blank).
            </Typography>

            <FormControl size="sm" sx={{ mb: 1.5 }}>
              <FormLabel>Delivery Date (optional)</FormLabel>
              <Input
                type="datetime-local"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
              />
            </FormControl>

            <FormControl size="sm" sx={{ mb: 2 }}>
              <FormLabel>Remarks</FormLabel>
              <Textarea
                minRows={3}
                placeholder="Delivered via bulk action"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
              />
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button variant="plain" onClick={handleCloseBulkModal}>
                Cancel
              </Button>
              <Button
                variant="solid"
                color="success"
                loading={isBulkDelivering}
                onClick={async () => {
                  try {
                    await bulkDeliverPOs({
                      ids: selected,
                      remarks: bulkRemarks || "Bulk marked as delivered",
                      date: bulkDate || undefined,
                    }).unwrap();
                    toast.success("Selected POs marked as Delivered");
                    setSelected([]);
                    onSelectionChange([]);
                    handleCloseBulkModal();
                  } catch (e) {
                    toast.error(e?.data?.message || "Bulk deliver failed");
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </Sheet>
        </Modal>
      </Box>
    </Box>
  );
});

export default PurchaseOrderSummary;
