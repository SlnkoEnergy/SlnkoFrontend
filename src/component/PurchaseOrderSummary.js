import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DownloadIcon from "@mui/icons-material/Download";
import MenuItem from "@mui/joy/MenuItem";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import axios from "axios";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import {
  useExportPosMutation,
  useGetPaginatedPOsQuery,
} from "../redux/purchasesSlice";
import { Option, Select } from "@mui/joy";
import { useMemo } from "react";
import { Calendar, FileCheck, Store } from "lucide-react";

const PurchaseOrderSummary = forwardRef((props, ref, project_code) => {
  const navigate = useNavigate();
  const [selectedpo, setSelectedpo] = useState("");
  const [selectedtype, setSelectedtype] = useState("");
  const [selected, setSelected] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);
  const location = useLocation();
  const isFromCAM = location.pathname === "/project_detail";
  const isFromPR = location.pathname === "/purchase_detail";
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
    project_id: isFromCAM || isFromPR ? project_code : "",
  });
  const [exportPos, { isLoading: isExporting }] = useExportPosMutation();

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

  const renderFilters = () => {
    const po_status = ["Fully Billed ", "Bill Pending"];
    const po_type = ["Final", "Partial"];

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>PO Status</FormLabel>
          <Select
            value={selectedpo}
            onChange={(e, newValue) => {
              setSelectedpo(newValue);
              setCurrentPage(1);
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
        {/* <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Select Type</FormLabel>
          <Select
            value={selectedpo}
            onChange={(e, newValue) => {
              setSelectedtype(newValue);
              setCurrentPage(1);
            }}
            size="sm"
            placeholder="Select Type"
          >
            <Option value="">All status</Option>
            {po_type.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </FormControl> */}
        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>From Date</FormLabel>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>
        <FormControl size="sm" sx={{ minWidth: 140 }}>
          <FormLabel>To Date</FormLabel>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FormControl>
        <Box mt={3} sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="sm"
            color="primary"
            onClick={() => handleExport(false)}
            loading={isExporting}
            disabled={!from || !to}
            startDecorator={<CalendarMonthIcon />}
          >
            Export by Date
          </Button>

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
      </Box>
    );
  };

  const RowMenu = ({ currentPage, po_number }) => {
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
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.department === "admin" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Aryan Maheshwari" ||
            user?.name === "Sarthak Sharma" ||
            user?.name === "Naresh Kumar" ||
            user?.name === "Shubham Gupta") && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                localStorage.setItem("po_no", po);
                navigate(`/add_bill?page=${page}&po_number=${po}`);
              }}
            >
              {" "}
              <AddCircleOutlineIcon />
              <Typography>Add Bill</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              const page = currentPage;
              const po = po_number;
              localStorage.setItem("get-po", po);
              navigate(`/bill_history?page=${page}&po_number=${po}`);
            }}
          >
            <HistoryIcon />
            <Typography>Bill History</Typography>
          </MenuItem>
          <Divider sx={{ backgroundColor: "lightblue" }} />
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.department === "admin" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Aryan Maheshwari" ||
            user?.name === "Sarthak Sharma" ||
            user?.name === "Shubham Gupta" ||
            user?.name === "Naresh Kumar" ||
            user?.name === "Sandeep Yadav" ||
            user?.name === "Som Narayan Jha" ||
            user?.name === "Saresh") && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                // const ID = _id
                localStorage.setItem("edit-po", po);
                navigate(`/edit_po?page=${page}&po_number=${po}`);
              }}
            >
              <EditNoteIcon />
              <Typography>Edit PO</Typography>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              const page = currentPage;
              const po = po_number;
              localStorage.setItem("get-po", po);
              navigate(`/po_history?page=${page}&po_number=${po}`);
            }}
          >
            <HistoryIcon />
            <Typography>PO History</Typography>
          </MenuItem>
          {/* <Divider sx={{ backgroundColor: "lightblue" }} /> */}
          {/* <MenuItem color="primary" style={{ fontWeight: "bold" }}>
            Adjust Bill
          </MenuItem> */}
          {(user?.name === "IT Team" ||
            user?.name === "admin" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "Ajay Singh" ||
            user?.name === "Naresh Kumar" ||
            user?.name === "Shubham Gupta") && (
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const po = po_number;
                localStorage.setItem("edit_bill", po);
                navigate(`/edit_bill?page=${page}&po_number=${po}`);
              }}
            >
              {" "}
              <EditNoteIcon />
              <Typography>Edit Bill</Typography>
            </MenuItem>
          )}
          {/* <Divider sx={{ backgroundColor: "lightblue" }} />
                      {(user?.name === "IT Team" ||
                        user?.name === "Guddu Rani Dubey" ||
                        user?.name === "Prachi Singh" ||
                        user?.name === "admin") && (
                        <MenuItem
                          color="danger"
                          disabled={selectedProjects.length === 0}
                          onClick={handleDelete}
                        >
                          <DeleteIcon />
                          <Typography>Delete</Typography>
                        </MenuItem>
                      )} */}
        </Menu>
      </Dropdown>
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPo.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const Pos = useMemo(
    () => (Array.isArray(getPO?.data) ? getPO.data : []),
    [getPO]
  );
  const paginatedPo = Pos;

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleRowSelect = (id, isSelected) => {
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
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
  const RenderPid = ({ p_id, pr_no }) => {
    return (
      <>
        <Box>
          <span style={{ cursor: "pointer", fontWeight: 500 }}>
            {p_id || "-"}
          </span>
        </Box>
        <Box display="flex" alignItems="center" mt={0.5}>
          <FileCheck size={12} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>PR_No : </span> &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
            {pr_no || "0"}
          </Typography>
        </Box>
      </>
    );
  };
  const RenderPONumber = ({ po_number, date }) => {
    return (
      <>
        <Box>
          <span style={{ cursor: "pointer", fontWeight: 400 }}>
            {po_number || "-"}
          </span>
        </Box>
        <Box display="flex" alignItems="center" mt={0.5}>
          <Calendar size={12} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>PO Date : </span>{" "}
          &nbsp;
          <Typography sx={{ fontSize: 12, fontWeight: 400 }}>{date}</Typography>
        </Box>
      </>
    );
  };
  const RenderItem_Vendor = ({ vendor, item }) => {
    return (
      <>
        <Box>
          <span style={{ cursor: "pointer", fontWeight: 400, fontSize: 14 }}>
            {item}
          </span>
        </Box>
        <Box display="flex" alignItems="center" mt={0.5}>
          <Store size={12} color="green" />
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
  const EditPo = ({ po_number, currentPage }) => {
    
  }

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
        {error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : isLoading ? (
          <Typography textAlign="center">Loading...</Typography>
        ) : (
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
                      selected.length > 0 &&
                      selected.length !== paginatedPo.length
                    }
                    checked={selected.length === paginatedPo.length}
                    onChange={handleSelectAll}
                    color={selected.length > 0 ? "primary" : "neutral"}
                  />
                </Box>
                {[
                  "Project ID",
                  "PO Number",
                  "Partial Billing",
                  "Item Name",
                  "PO Value(incl. GST)",
                  "Advance Paid",
                  "Bill Status",
                  "Total Billed",
                  // "Action",
                  "",
                ].map((header) => (
                  <Box
                    component="th"
                    key={header}
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
              {paginatedPo.length > 0 ? (
                paginatedPo.map((po) => (
                  <Box
                    component="tr"
                    key={po.id}
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
                        checked={selected.includes(po.id)}
                        onChange={(event) =>
                          handleRowSelect(po.id, event.target.checked)
                        }
                        color={selected.includes(po.id) ? "primary" : "neutral"}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: "8px",
                        textAlign: "left",
                        borderBottom: "1px solid",
                        fontSize: 15,
                        minWidth: 350,
                        // fontWeight: 500,
                      }}
                    >
                      <RenderPid p_id={po.p_id} pr_no={po.pr_no} />
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
                      <RenderPONumber po_number={po.po_number} date={po.date} />
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
                      <BillingTypeChip type={po.type} />
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
                        item={po.item === "Other" ? "other" : po.item}
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
                      }).format(po.total_billed) || 0}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "left",
                        borderBottom: "1px solid",
                      }}
                    >
                      <RowMenu
                        currentPage={currentPage}
                        po_number={po.po_number}
                      />
                    </Box>
                  </Box>
                ))
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
        )}
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
                {num} perPage
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
      </Box>
    </>
  );
});
export default PurchaseOrderSummary;
