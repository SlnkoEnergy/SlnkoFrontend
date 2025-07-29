import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
import SearchIcon from "@mui/icons-material/Search";
import { Card, Checkbox, Tooltip } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import { useColorScheme, useTheme } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../assets/alert-bell.svg";
import { useGetProjectBalanceQuery } from "../redux/Accounts";
import animationData from "../assets/Lotties/animation-loading.json";
import Axios from "../utils/Axios";
import socket from "../socket/socket";

const ProjectBalances = forwardRef((props, ref) => {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: responseData,
    isLoading,
    refetch,
  } = useGetProjectBalanceQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
  });

  const paginatedData = responseData?.data || [];
  const paginatedDataTotals = responseData?.totals || {};
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

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

  const renderFilters = () => {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <FormControl size="sm" sx={{ minWidth: 150 }}>
          <FormLabel>Rows Per Page</FormLabel>
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
      </Box>
    );
  };

  const RowMenu = ({ currentPage, p_id }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);
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
      <>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "plain", color: "neutral", size: "sm" },
            }}
          >
            <MoreHorizRoundedIcon />
          </MenuButton>

          <Menu size="sm" sx={{ minWidth: 100 }}>
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.department === "admin" ||
              user?.department === "Accounts") && (
              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const projectId = p_id;
                  localStorage.setItem("add_money", projectId);
                  navigate(`/add_money?page=${page}&p_id=${projectId}`);
                }}
              >
                <AddCircleOutlineIcon />
                <Typography>Add Money</Typography>
              </MenuItem>
            )}

            <Divider sx={{ backgroundColor: "lightblue" }} />
            <MenuItem
              onClick={() => {
                const page = currentPage;
                const projectId = p_id;
                localStorage.setItem("view_detail", projectId);
                navigate(`/view_detail?page=${page}&p_id=${projectId}`);
              }}
            >
              {" "}
              <ContentPasteGoIcon />
              <Typography>View More</Typography>
            </MenuItem>
          </Menu>
        </Dropdown>
      </>
    );
  };

  const ProjectCode = ({ currentPage, p_id, code }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            localStorage.setItem("view_detail", p_id);
            navigate(`/view_detail?page=${currentPage}&p_id=${p_id}`);
          }}
        >
          {code || "-"}
        </span>
      </>
    );
  };

  const ProjectName = ({ currentPage, p_id, name }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "none",
          }}
          onClick={() => {
            localStorage.setItem("view_detail", p_id);
            navigate(`/view_detail?page=${currentPage}&p_id=${p_id}`);
          }}
        >
          {name || "-"}
        </span>
      </>
    );
  };

  const AddMoney = ({ currentPage, p_id }) => {
    // console.log("currentPage:", currentPage, "p_id:", p_id);

    return (
      <>
        <IconButton
          color="primary"
          onClick={() => {
            localStorage.setItem("add_money", p_id);
            navigate(`/add_money?page=${currentPage}&p_id=${p_id}`);
          }}
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  console.log(paginatedData);
  console.log("PAGINTED TOTAL DATA ARE :", paginatedDataTotals);

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

  const handleSelectAll = (event) => {
    const allVisibleIds = paginatedData.map((row) => row._id);
    if (event.target.checked) {
      setSelected(allVisibleIds);
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  useImperativeHandle(ref, () => ({
    exportToCSV() {
      console.log("Exporting data to CSV...");
      const headers = [
        "Project Id",
        "Project Name",
        "Client Name",
        "Group Name",
        "Plant Capacity (MW AC)",
        "Total Credit",
        "Total Debit",
        "Total Adjustment",
        "Amount Amount(Old)",
        "Balance with SLnko",
        "Balance Payable to Vendors",
        "Balance Required",
        // "View More",
        // "Aggregate Plant Capacity",
        // "Aggregate Credit",
        // "Aggregate Debit",
        // "Aggregate Available(Old)",
        // "Aggregate Balance Slnko",
        // "Aggregate Balance Payable to Vendors",
        // "Balance Required",
      ];

      const exportLeads =
        selected.length > 0
          ? paginatedData.filter((lead) => selected.includes(lead._id))
          : paginatedData;

      if (exportLeads.length === 0) {
        toast.warning("No balance available to export.");
        return;
      }

      const rows = exportLeads.map((project) => [
        project.code || "-",
        project.name || "-",
        project.customer || "-",
        project.p_group || "-",
        project.project_kwp || "-",
        project.creditAmount || "-",
        project.debitAmount || "-",
        project.adjustmentAmount || "-",
        project.oldAmount || "-",
        project.balanceSlnko || "-",
        project.balancePayable || "-",
        project.balanceRequired || "-",
        // project.view_more,
        // project.totalmWSum || "-",
        // project.totalCreditSum || "-",
        // project.totalDebitSum || "-",
        // project.totalAmountAvailable || "-",
        // project.totalBalanceSlnko || "-",
        // project.totalBalancePayable || "-",
        // project.totalBalanceRequired || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      // link.download = "project_balance.csv";
      link.download =
        selected.length > 0
          ? "Selected_ProjectBalance.csv"
          : "All_ProjectBalance.csv";
      link.click();
    },
  }));
  

  const tdStyle = {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
    // color: "#1f2937",
    color: "text.primary",
    bgcolor: "background.surface",
  };

  const cellStyle = {
    borderBottom: "1px solid #e0e0e0",
    padding: "12px",
    textAlign: "left", // More natural alignment for most text
    fontWeight: 400,
    fontSize: "1rem",
    whiteSpace: "nowrap", // Prevent text wrapping
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  useEffect(() => {
  // Listen for project balance updates
  socket.on("projectBalanceUpdated", () => {
    refetch(); // re-fetch data using RTK Query
  });

  // Clean up on unmount
  return () => {
    socket.off("projectBalanceUpdated");
  };
}, []);

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Project ID, Customer, or Name"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%", xs: "0%" },
          maxWidth: { xl: "85%", xs: "100%" },
          p: 2,
          bgcolor: "background.surface",
          borderRadius: "md",
          boxShadow: "lg",
        }}
      >
        {/* Classic Table View (sm and up) */}
        <Box sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
              minWidth: "700px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: theme.vars.palette.background.level1,
                }}
              >
                {[
                  "Total Plant Capacity (MW AC)",
                  "Total Credit",
                  "Total Debit",
                  "Total Adjustment",
                  "Available Amount (Old)",
                  "Balance with Slnko",
                  "Balance Payable to Vendors",
                  "Balance Required",
                ].map((header, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontWeight: "bold",
                      borderBottom: `1px solid ${theme.vars.palette.divider}`,
                      whiteSpace: "nowrap",
                      color: theme.vars.palette.text.primary,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <td key={i} style={tdStyle}>
                      <Skeleton height={20} />
                    </td>
                  ))}
                </tr>
              ) : (
                <tr>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalProjectKwp?.toLocaleString(
                      "en-IN"
                    )}{" "}
                    MW AC
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalCreditSum?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalDebitSum?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalAdjustmentSum?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalAvailableAmount?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalBalanceSlnko?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalBalancePayable?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                  <td style={tdStyle}>
                    {paginatedDataTotals.totalBalanceRequired?.toLocaleString(
                      "en-IN"
                    ) || 0}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        {/* Mobile Stacked View (xs only) */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{ padding: "12px 15px", borderBottom: "1px solid #ddd" }}
                >
                  <Skeleton height={20} width="50%" />
                  <Skeleton height={20} width="30%" />
                </Box>
              ))
            : [
                {
                  label: "Total Plant Capacity (MW AC)",
                  value: `${paginatedDataTotals.totalProjectKwp?.toLocaleString("en-IN")} MW AC`,
                },
                {
                  label: "Total Credit",
                  value:
                    paginatedDataTotals.totalCreditSum?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Total Debit",
                  value:
                    paginatedDataTotals.totalDebitSum?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Total Adjustment",
                  value:
                    paginatedDataTotals.totalAdjustmentSum?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Available Amount (Old)",
                  value:
                    paginatedDataTotals.totalAvailableAmount?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Balance with Slnko",
                  value:
                    paginatedDataTotals.totalBalanceSlnko?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Balance Payable to Vendors",
                  value:
                    paginatedDataTotals.totalBalancePayable?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
                {
                  label: "Balance Required",
                  value:
                    paginatedDataTotals.totalBalanceRequired?.toLocaleString(
                      "en-IN"
                    ) || 0,
                },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 15px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <Box sx={{ fontWeight: "bold" }}>{item.label}</Box>
                  <Box>{item.value}</Box>
                </Box>
              ))}
        </Box>
      </Box>

      {/* Table */}

      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflowX: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          minHeight: { xs: "fit-content", lg: "0%" },
        }}
      >
        {error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : isLoading ? (
          <>
            {/* Mobile Skeleton */}
            <Box sx={{ display: { xs: "block", sm: "none" }, padding: 2 }}>
              {[...Array(2)].map((_, i) => (
                <Card
                  key={i}
                  variant="outlined"
                  sx={{ borderRadius: 2, padding: 2, mb: 2 }}
                >
                  <Skeleton height={20} width="40%" />
                  <Skeleton height={20} width="60%" />
                  <Skeleton height={20} width="50%" />
                  <Divider sx={{ my: 1 }} />
                  {[...Array(6)].map((_, j) => (
                    <Box
                      key={j}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.5,
                      }}
                    >
                      <Skeleton height={16} width="40%" />
                      <Skeleton height={16} width="40%" />
                    </Box>
                  ))}
                </Card>
              ))}
            </Box>

            {/* Desktop Skeleton */}
            <Box sx={{ display: { xs: "none", sm: "block" }, padding: 2 }}>
              {[...Array(3)].map((_, rowIdx) => (
                <Box key={rowIdx} sx={{ display: "flex", gap: 1, mb: 2 }}>
                  {[...Array(14)].map((__, colIdx) => (
                    <Skeleton key={colIdx} height={30} width={100} />
                  ))}
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <>
            {/* Mobile View */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                flexDirection: "column",
                gap: 2,
              }}
            >
              {paginatedData.map((project, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{ borderRadius: 2, padding: 2, boxShadow: "sm" }}
                >
                  <Typography fontWeight={600} fontSize="1rem" gutterBottom>
                    <ProjectCode
                      currentPage={currentPage}
                      p_id={project.p_id}
                      code={project.code}
                    />
                  </Typography>
                  <Typography fontSize="0.9rem" color="text.secondary">
                    Client:{" "}
                    <ProjectName
                      currentPage={currentPage}
                      p_id={project.p_id}
                      name={project.name}
                    />
                  </Typography>
                  <Typography fontSize="0.9rem" color="text.secondary">
                    Capacity: {project.project_kwp || "-"} MW AC
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {[
                    { label: "Credit", value: project.totalCredit },
                    { label: "Debit", value: project.totalDebit },
                    { label: "Adjustment", value: project.totalAdjustment },
                    {
                      label: "Available Amount (Old)",
                      value: project.availableAmount,
                    },
                    {
                      label: "Balance with SLnko",
                      value: project.balanceSlnko,
                    },
                    {
                      label: "Balance Payable to Vendors",
                      value: project.balancePayable,
                    },
                    {
                      label: "Balance Required",
                      value: project.balanceRequired,
                    },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      display="flex"
                      justifyContent="space-between"
                      py={0.5}
                    >
                      <Typography fontSize="0.85rem" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography fontSize="0.85rem">
                        ₹{" "}
                        {new Intl.NumberFormat("en-IN", {
                          maximumFractionDigits: 2,
                        }).format(value || 0)}
                      </Typography>
                    </Box>
                  ))}
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <RowMenu currentPage={currentPage} p_id={project.p_id} />
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Desktop View */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  minWidth: "900px",
                  borderCollapse: "collapse",
                }}
              >
                <Box
                  component="thead"
                  sx={{ backgroundColor: "neutral.softBg" }}
                >
                  <Box component="tr">
                    <Box
                      component="th"
                      sx={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.length === paginatedData.length}
                        onChange={handleSelectAll}
                      />
                    </Box>
                    {[
                      "",
                      "Project Id",
                      "Project Name",
                      "Client Name",
                      "Group Name",
                      "Plant Capacity (MW AC)",
                      "Total Credit",
                      "Total Debit",
                      "Total Adjustment",
                      "Available Amount(Old)",
                      "Balance with SLnko",
                      "Balance Payable to Vendors",
                      "Balance Required",
                    ].map((header, index) => (
                      <Box
                        component="th"
                        key={index}
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        {header}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {isLoading ? (
                    [...Array(3)].map((_, rowIndex) => (
                      <Box component="tr" key={rowIndex}>
                        {[...Array(14)].map((__, colIndex) => (
                          <Box
                            component="td"
                            key={colIndex}
                            sx={{ padding: "8px" }}
                          >
                            <Skeleton height={24} width="100%" />
                          </Box>
                        ))}
                      </Box>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan={14}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <img
                          src={NoData}
                          alt="No data"
                          style={{ width: "50px", height: "50px" }}
                        />
                        <Typography fontStyle="italic">
                          No Balance available
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    paginatedData.map((project, index) => {
                      // console.log("Paginated Data", paginatedData);

                      return (
                        <Box
                          component="tr"
                          key={index}
                          sx={{
                            "&:hover": {
                              backgroundColor: "neutral.plainHoverBg",
                            },
                          }}
                        >
                          <Box component="td" sx={cellStyle}>
                            <Checkbox
                              size="sm"
                              color="primary"
                              checked={selected.includes(project._id)}
                              onChange={() => handleRowSelect(project._id)}
                            />
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            <AddMoney
                              currentPage={currentPage}
                              p_id={project.p_id}
                            />
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            <Tooltip title="View More Detail" arrow>
                              <span>
                                <ProjectCode
                                  currentPage={currentPage}
                                  p_id={project.p_id}
                                  code={project.code}
                                />
                              </span>
                            </Tooltip>
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            <Tooltip title="View More Detail" arrow>
                              <span>
                                <ProjectName
                                  currentPage={currentPage}
                                  p_id={project.p_id}
                                  name={project.name}
                                />
                              </span>
                            </Tooltip>
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            {project.customer || "-"}
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            {project.p_group || "-"}
                          </Box>
                          <Box component="td" sx={cellStyle}>
                            {project.project_kwp || "-"}
                          </Box>
                          {[
                            project.totalCredit,
                            project.totalDebit,
                            project.totalAdjustment,
                            project.availableAmount,
                            project.balanceSlnko,
                            project.balancePayable,
                            project.balanceRequired,
                          ].map((value, idx) => (
                            <Box key={idx} component="td" sx={cellStyle}>
                              ₹{" "}
                              {new Intl.NumberFormat("en-IN", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }).format(value || 0)}
                            </Box>
                          ))}
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>
          </>
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
          marginLeft: { xl: "15%", lg: "18%" },
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
export default ProjectBalances;
