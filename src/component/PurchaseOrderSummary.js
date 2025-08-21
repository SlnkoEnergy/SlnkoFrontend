import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DownloadIcon from "@mui/icons-material/Download";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { Clock, CheckCircle2 } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UpdatePurchaseOrder from "../component/Forms/Edit_Po";
import PoHistoryTable from "../component/PO_History";
import AddBillForm from "../component/Forms/Add_Bill";
import BillHistoryTable from "../component/Bill_History";
import NoData from "../assets/alert-bell.svg";
import { ClickAwayListener } from "@mui/base";
import {
  useExportPosMutation,
  useGetPaginatedPOsQuery,
  useUpdateEtdOrDeliveryDateMutation,
  useUpdatePurchasesStatusMutation,
} from "../redux/purchasesSlice";
import {
  CircularProgress,
  Divider,
  Option,
  Select,
  Textarea,
  Tooltip,
} from "@mui/joy";
import { useMemo } from "react";
import {
  Calendar,
  CalendarSearch,
  CirclePlus,
  FileCheck,
  Handshake,
  History,
  PackageCheck,
  Store,
  Truck,
  TruckIcon,
} from "lucide-react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/joy";
import { toast } from "react-toastify";
import { Money } from "@mui/icons-material";

const PurchaseOrderSummary = forwardRef((props, ref) => {
  const { project_code } = props;
  const [po, setPO] = useState("");
  const [selectedpo, setSelectedpo] = useState("");
  const [selectedtype, setSelectedtype] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedPoNumber, setSelectedPoNumber] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openFilter, setOpenFilter] = useState(false);
  const [etdFrom, setEtdFrom] = useState("");
  const [etdTo, setEtdTo] = useState("");
  const [poFrom, setPoFrom] = useState("");
  const [poTo, setPoTo] = useState("");
  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [deliveryTo, setDeliveryTo] = useState("");
  const [activeDateFilter, setActiveDateFilter] = useState("");
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [openModal, setOpenModal] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [perPage, setPerPage] = useState(initialPageSize);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const { search, state } = useLocation();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const location = useLocation();
  const isFromCAM = location.pathname === "/project_detail";
  const isFromPR = location.pathname === "/purchase_detail";

  const pr_id = sp.get("pr_id") || state?.pr_id || "";
  const item_id = sp.get("item_id") || state?.item_id || "";

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
    etdFrom: etdFrom,
    etdTo: etdTo,
    deliveryFrom: deliveryFrom,
    deliveryTo: deliveryTo,
    filter: selectedStatusFilter,
    project_id: project_code ? project_code : "",
    pr_id: pr_id ? pr_id.toString() : "",
    item_id: item_id ? item_id.toString() : "",
  });

  const handleOpen = (po_number, action) => {
    setSelectedPoNumber(po_number);
    setModalAction(action);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedPoNumber("");
    setModalAction("");
  };

  const [exportPos, { loading: isExporting }] = useExportPosMutation();
  const [updateEtdOrDeliveryDate] = useUpdateEtdOrDeliveryDateMutation();
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

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleExport = async (isExportAll) => {
    try {
      const exportFrom = from ? formatDateToDDMMYYYY(from) : null;
      const exportTo = to ? formatDateToDDMMYYYY(to) : null;
      const res = await exportPos({
        from: exportFrom,
        to: exportTo,
        exportAll: isExportAll,
      }).unwrap();

      const url = URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;
      link.download = "po_export.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export bills");
    }
  };

  const handleDateFilterSelect = (type) => {
    setActiveDateFilter((prev) => (prev === type ? null : type));
    setOpenFilter(false);
  };
  const formatStatus = (status, etd) => {
    if (status?.toLowerCase() === "draft") {
      if (!etd) return "ETD Pending";
      return "ETD Done";
    }
    return status;
  };

  const statusOptions = [
    "Approval Pending",
    "Approval Done",
    "ETD Pending",
    "ETD Done",
    "Ready to Dispatch",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    const status = searchParams.get("status") || "";
    const po = searchParams.get("poStatus") || "";

    setSelectedStatusFilter(status);
    setSelectedpo(po);
  }, [searchParams]);

  const renderFilters = () => {
    const po_status = ["Fully Billed", "Bill Pending"];

    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Bill Status</FormLabel>
          <Select
            value={searchParams.get("poStatus") || ""}
            onChange={(_, newValue) => {
              setSearchParams((prev) => {
                const updated = new URLSearchParams(prev);
                if (newValue) {
                  updated.set("poStatus", newValue);
                } else {
                  updated.delete("poStatus");
                }
                updated.set("page", "1"); // Reset to first page when filter changes
                return updated;
              });
            }}
            size="sm"
            placeholder="Select Status"
          >
            <Option value="">All status</Option>
            {po_status.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Status Filter</FormLabel>
          <Select
            value={searchParams.get("status") || ""}
            onChange={(_, newValue) => {
              setSearchParams((prev) => {
                const updated = new URLSearchParams(prev);
                if (newValue) {
                  updated.set("status", newValue);
                } else {
                  updated.delete("status");
                }
                updated.set("page", "1"); // reset to first page on filter change
                return updated;
              });
            }}
            size="sm"
            placeholder="Select Status"
          >
            <Option value="">All Status</Option>
            {statusOptions.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </FormControl>

        <Box mt={3} sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="soft"
            size="sm"
            color="neutral"
            onClick={() => handleExport(true)}
            loading={isExporting}
            startDecorator={<DownloadIcon />}
          >
            Export All
          </Button>
        </Box>

        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "soft", size: "sm", color: "neutral" },
            }}
            sx={{ mt: 3 }}
          >
            <CalendarSearch />
          </MenuButton>
          <Menu placement="bottom-start">
            <MenuItem onClick={() => handleDateFilterSelect("etd")}>
              ETD Date
            </MenuItem>
            <MenuItem onClick={() => handleDateFilterSelect("delivery")}>
              Delivery Date
            </MenuItem>
          </Menu>
        </Dropdown>

        {activeDateFilter && (
          <ClickAwayListener onClickAway={() => setActiveDateFilter(null)}>
            <Sheet
              variant="outlined"
              sx={{
                position: "absolute",
                top: "120%",
                zIndex: 10,
                mt: 1,
                backgroundColor: "background.body",
                boxShadow: "md",
                borderRadius: "sm",
                p: 2,
                width: 320,
              }}
            >
              <Typography level="body-sm" fontWeight="bold" gutterBottom>
                {activeDateFilter === "etd"
                  ? "ETD Date Range"
                  : activeDateFilter === "po"
                    ? "PO Date Range"
                    : "Delivery Date Range"}
              </Typography>

              <Box display="flex" gap={1}>
                <FormControl size="sm" sx={{ flex: 1 }}>
                  <FormLabel>From</FormLabel>
                  <Input
                    type="date"
                    value={
                      activeDateFilter === "etd"
                        ? etdFrom
                        : activeDateFilter === "po"
                          ? poFrom
                          : deliveryFrom
                    }
                    onChange={(e) => {
                      if (activeDateFilter === "etd")
                        setEtdFrom(e.target.value);
                      if (activeDateFilter === "po") setPoFrom(e.target.value);
                      if (activeDateFilter === "delivery")
                        setDeliveryFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FormControl>

                <FormControl size="sm" sx={{ flex: 1 }}>
                  <FormLabel>To</FormLabel>
                  <Input
                    type="date"
                    value={
                      activeDateFilter === "etd"
                        ? etdTo
                        : activeDateFilter === "po"
                          ? poTo
                          : deliveryTo
                    }
                    onChange={(e) => {
                      if (activeDateFilter === "etd") setEtdTo(e.target.value);
                      if (activeDateFilter === "po") setPoTo(e.target.value);
                      if (activeDateFilter === "delivery")
                        setDeliveryTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FormControl>
              </Box>
            </Sheet>
          </ClickAwayListener>
        )}
      </Box>
    );
  };

  const [updateStatus] = useUpdatePurchasesStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState("");
  const handleStatusChange = async () => {
    try {
      const nextStatusMap = {
        ready_to_dispatch: "out_for_delivery",
        out_for_delivery: "delivered",
        delivered: "ready_to_dispatch",
      };

      const updatedStatus =
        nextStatusMap[selectedStatus] ?? "ready_to_dispatch";

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

  const RowMenu = ({ currentPage, po_number, current_status }) => {
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

    // console.log("current", current_status);

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
            user?.name === "Prachi Singh" ||
            user?.department === "SCM") &&
            (current_status?.status === "delivered" ? (
              <Tooltip title="Already Delivered">
                <span>
                  <MenuItem disabled>
                    <EditNoteIcon />
                    <Typography>Change Status</Typography>
                  </MenuItem>
                </span>
              </Tooltip>
            ) : (
              <MenuItem
                onClick={() => {
                  if (current_status?.status === "ready_to_dispatch") {
                    setNextStatus("out_for_delivery");
                  } else if (current_status?.status === "out_for_delivery") {
                    setNextStatus("delivered");
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

  const handleSearch = (query) => {
    setSearchQuery(query?.toLowerCase());
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPo.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        return {
          ...Object.fromEntries(prev.entries()),
          page: String(page),
        };
      });
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

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

  const BillingTypeChip = ({ type }) => {
    const isFullyBilled = type === "Final";
    const isPending = type === "Partial";

    const label = isFullyBilled ? "Final" : isPending ? "Partial" : type;

    const color = isFullyBilled ? "primary" : isPending ? "danger" : "neutral";

    return (
      <Chip variant="soft" size="sm" color={color}>
        {label}
      </Chip>
    );
  };
const RenderPid = ({ p_id }) => {
  return (
    <Box>
      {p_id ? (
        <Chip
          variant="solid"
          color="primary"
          size="md"
          sx={{
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "20px", 
            cursor: "pointer",
          }}
        >
          {p_id}
        </Chip>
      ) : (
        <Chip
          variant="soft"
          color="neutral"
          size="md"
          sx={{
            fontWeight: 500,
            fontSize: 13,
            borderRadius: "20px",
          }}
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
      {/* PO Number */}
      {po_number ? (
        <Box
          onClick={() => navigate(`/add_po?mode=edit&po_number=${po_number}`)}
        >
          <span style={{ cursor: "pointer", fontWeight: 500, color: "#1976d2" }}>
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
          sx={{ fontWeight: 500, mt: 0.5, cursor: "pointer", }}
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

      {/* PO Date */}
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
    current_status,
    po_number,
  }) => {
    const [etdDate, setEtdDate] = useState(etd || "");
    const [rtdDate, setRtdDate] = useState(rtd || "");
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
        {/* ETD Date */}
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

        {/* Delivery Date - Only if status is delivered */}
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
        {/* Confirmation Modal */}
        <Modal
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
        >
          <ModalDialog>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogContent>
              Are you sure you want to submit this date?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)}>
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
            </DialogActions>
          </ModalDialog>
        </Modal>
      </>
    );
  };

  const RenderItem_Vendor = ({ vendor, item, other_item, amount }) => {
    return (
      <>
        <Box>
          <span style={{fontWeight: 400, fontSize: 14 }}>
            {item}
          </span>
        </Box>
        {!!amount && (
          <Box display="flex" alignItems="center" mt={0.5}>
            <Money size={12} color="green" />
            &nbsp;
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              Amount :{" "}
            </span>{" "}
            &nbsp;
            <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
              ₹ {amount}
            </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" mt={0.5}>
       
          &nbsp;
          <span style={{ fontSize: 12, fontWeight: 600 }}>Vendor : </span>{" "}
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {vendor}
          </Typography>
        </Box>
      </>
    );
  };

  const EditPo = ({ po_number }) => (
    <Tooltip title="Edit PO" placement="top">
      <IconButton color="primary" onClick={() => handleOpen(po_number, "edit")}>
        <EditNoteIcon />
      </IconButton>
    </Tooltip>
  );

  const ViewPOHistory = ({ po_number }) => (
    <Tooltip title="View PO History" placement="top">
      <IconButton color="primary" onClick={() => handleOpen(po_number, "view")}>
        <History />
      </IconButton>
    </Tooltip>
  );

  const RenderTotalBilled = ({ total_billed = 0, po_value = 0, po_number }) => {
    const billed = Number(total_billed);
    const value = Number(po_value);

    const showAddBilling = billed < value;
    const showBillingHistory = billed > 0;

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

        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
          {showAddBilling && (
            <Tooltip title="Add Billing">
              <IconButton
                size="sm"
                variant="outlined"
                color="primary"
                onClick={() => handleOpen(po_number, "add_bill")}
              >
                <CirclePlus size={18} />
              </IconButton>
            </Tooltip>
          )}

          {showBillingHistory && (
            <Tooltip title="View Billing History">
              <IconButton
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => handleOpen(po_number, "view_bill")}
              >
                <History size={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "ready_to_dispatch":
        return <PackageCheck size={18} style={{ marginRight: 6 }} />;
      case "out_for_delivery":
        return <Truck size={18} style={{ marginRight: 6 }} />;
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
      case "approval_pending":
        return "#214b7b";
      case "approval_done":
        return "#90EE90";
      case "ready_to_dispatch":
        return "red";
      case "out_for_delivery":
        return "orange";
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

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: isFromCAM || isFromPR ? 0 : { xl: "15%", lg: "18%" },

          borderRadius: "sm",
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search Project Id, PO Number, Vendor"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display:
            isFromCAM || isFromPR ? "flex" : { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: isFromCAM || isFromPR ? 0 : { xl: "15%", lg: "18%" },
          maxWidth: isFromCAM || isFromPR ? "100%" : { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  padding: 1,
                  textAlign: "left",
                  borderBottom: "1px solid",
                  fontWeight: "bold",
                }}
              >
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < paginatedPo.length
                  }
                  checked={selected.length === paginatedPo.length}
                  onChange={handleSelectAll}
                  color={selected.length > 0 ? "primary" : "neutral"}
                />
              </Box>
              {[
                // "",
                "Project ID",
                "PO Number",
                // "Partial Billing",
                "Item Name",
                "PO Value(incl. GST)",
                "Advance Paid",
                "Bill Status",
                // "Total Billed",
                "Status",
                "Delay",
                "",
              ].map((header, index) => (
                <Box
                  component="th"
                  key={index}
                  sx={{
                    padding: 1,
                    textAlign: "left",
                    borderBottom: "1px solid",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {error ? (
              <Typography color="danger" textAlign="center">
                {error}
              </Typography>
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
                      Loading Po's… please hang tight ⏳
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
                const formattedStatus = formatStatus(
                  po?.current_status?.status,
                  po?.etd
                );

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

                    {/* <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                      }}
                    >
                      <ViewPOHistory po_number={po.po_number} />
                    </Box> */}

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 15,
                        minWidth: 350,
                      }}
                    >
                      <RenderPid p_id={po.p_id}  />
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
                        etd={po?.etd}
                        rtd={po?.dispatch_date}
                        delivery_date={po?.delivery_date}
                        current_status={po?.current_status?.status}
                        pr_no={po.pr_no}
                      />
                    </Box>

                    {/* <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 14,
                        minWidth: 150,
                      }}
                    >
                      <BillingTypeChip type={po.type} />
                    </Box> */}

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
                        item={po.item === "Other" ? "other" : po.item}
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
                      ₹
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(po.amount_paid) || "0"}
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
                      <BillingStatusChip status={po.partial_billing} />
                    </Box>

                    {/* <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                        minWidth: 150,
                      }}
                    >
                      <RenderTotalBilled
                        total_billed={po.total_billed}
                        po_value={po.po_value}
                        po_number={po.po_number}
                      />
                    </Box> */}

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

                      {/* Render PO Number Info Below the Status */}
                      <RenderStatusDates
                        rtd={po?.dispatch_date}
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
                        minWidth: 150,
                      }}
                    >
                      {etd ? (
                        delay > 0 ? (
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
                        )
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
                          ⚠️ ETD NOT FOUND
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
                          />
                        )}
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={13}
                  sx={{
                    padding: 2,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
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
                    <img
                      src={NoData}
                      alt="No data Image"
                      style={{ width: "50px", height: "50px" }}
                    />
                    <Typography fontStyle={"italic"}>
                      No PO available
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
          marginLeft: isFromCAM || isFromPR ? 0 : { xl: "15%", lg: "18%" },
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
          {/* Showing page {currentPage} of {totalPages} ({total} results) */}
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

        <FormControl size="sm" sx={{ minWidth: 120 }}>
          {/* <FormLabel>Per Page</FormLabel> */}
          <Select
            value={perPage}
            onChange={(e, newValue) => {
              setPerPage(newValue);
              setCurrentPage(1);
            }}
          >
            {[10, 30, 60, 100].map((num) => (
              <Option key={num} value={num}>
                {num}/Page
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
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            minWidth: 500,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 20,
              right: 15,
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>

          {modalAction === "edit" && (
            <UpdatePurchaseOrder po_number={selectedPoNumber} />
          )}
          {modalAction === "view" && (
            <PoHistoryTable po_number={selectedPoNumber} />
          )}
          {modalAction === "add_bill" && (
            <AddBillForm po_number={selectedPoNumber} />
          )}
          {modalAction === "view_bill" && (
            <BillHistoryTable po_number={selectedPoNumber} />
          )}
        </Box>
      </Modal>
    </>
  );
});
export default PurchaseOrderSummary;
