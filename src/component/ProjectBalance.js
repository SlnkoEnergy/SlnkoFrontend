import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import { Card, Checkbox, Chip, CircularProgress, Tooltip } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import { useColorScheme, useTheme } from "@mui/joy/styles";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../assets/alert-bell.svg";
import { useGetProjectBalanceQuery } from "../redux/Accounts";
import {
  AlertTriangle,
  ArrowDownUp,
  Banknote,
  Building2,
  CircleUser,
  DownloadIcon,
  IndianRupee,
  Lightbulb,
  Scale,
  ShieldCheck,
  SquareChartGantt,
  Sun,
  UsersRound,
  Wallet,
} from "lucide-react";
import AnimatedNumber from "./AnimatedBalance";
import axios from "axios";
import Axios from "../utils/Axios";

const ProjectBalances = forwardRef(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const {
    data: responseData,
    isLoading,
    refetch,
    error,
  } = useGetProjectBalanceQuery(
    {
      page: currentPage,
      pageSize: perPage,
      search: searchQuery,
    },
    { refetchOnMountOrArgChange: true }
  );

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

  const exportProjectBalance = async ({ selectedIds, selectAll }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}accounting/export-project-balance`,
        { selectedIds, selectAll },
        {
          responseType: "blob",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "project-balance.csv";

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export Error:", err);
      throw err;
    }
  };

  const handleExport = async () => {
    if (selected.length === 0) {
      alert("Please select at least one project to export.");
      return;
    }

    try {
      setIsExporting(true);
      const selectedCodes = paginatedData
        .filter((row) => selected.includes(row._id))
        .map((row) => row.code);

      await exportProjectBalance({
        selectedIds: selectedCodes,
        selectAll: false,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Axios.post(
        `${process.env.REACT_APP_API_URL}/project-balances/sync-all`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error refreshing balances:", err);
    } finally {
      setIsRefreshing(false);
    }
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

        <Box mt={3} sx={{ display: "flex", gap: 1 }}>
          {/* Export Button */}
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Varun Mishra" ||
            user?.name === "Prachi Singh" ||
            user?.department === "admin" ||
            user?.name === "Naresh Kumar" ||
            user?.department === "Accounts") && (
            <Button
              variant="soft"
              size="sm"
              color="neutral"
              onClick={handleExport}
              disabled={selected.length === 0 || isExporting}
              startDecorator={
                isExporting ? <CircularProgress size="sm" /> : <DownloadIcon />
              }
            >
              {isExporting ? "Exporting..." : "Export to CSV"}
            </Button>
          )}
         <Tooltip title="Refresh page (sync balances)" placement="top" arrow>
          <span>
            <Button
              variant="outlined"
              size="sm"
              color="primary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              startDecorator={
                isRefreshing ? <CircularProgress size="sm" /> : <RefreshIcon />
              }
            >
              {/* {isRefreshing ? "Refreshing..." : "Refresh"} */}
            </Button>
          </span>
        </Tooltip>
        </Box>
      </Box>
    );
  };

  const RowMenu = ({ currentPage, p_id }) => {
    console.log("currentPage:", currentPage, "Row menu p_id:", p_id);
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
              user?.name === "Varun Mishra" ||
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
          </Menu>
        </Dropdown>
      </>
    );
  };

  const ProjectName = ({ currentPage, _id, name }) => {
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
            navigate(`/view_detail?page=${currentPage}&_id=${_id}`);
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
    const allVisibleCodes = paginatedData.map((row) => row.code);
    if (event.target.checked) {
      setSelected(allVisibleCodes);
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (code) => {
    setSelected((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  };

  const fontStyleBold = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 600,
  };

  const fontStyleNormal = {
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 400,
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: "background.surface",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 16px",
    textAlign: "left",
    color: "text.primary",
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const cellStyle = {
    padding: "12px 16px",
    verticalAlign: "top",
    fontSize: 13,
    fontWeight: 400,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const ProjectID = ({ code, name, p_id, _id, currentPage }) => {
    const navigate = useNavigate();

    return (
      <>
        {code && (
          <Box>
            <Chip
              variant="solid"
              color="success"
              size="md"
              onClick={() =>
                navigate(`/view_detail?page=${currentPage}&_id=${_id}`)
              }
              sx={{
                cursor: "pointer",
                fontWeight: 500,
                textDecoration: "none",
                "&:hover": {
                  opacity: 0.9,
                  boxShadow: "md",
                  textDecoration: "underline",
                },
              }}
            >
              {code || "N/A"}
            </Chip>
          </Box>
        )}

        {name && (
          <Box display="flex" alignItems="center" mt={0.5}>
            📊 &nbsp;
            <Typography sx={fontStyleBold}>Project Name:</Typography>&nbsp;
            <Typography sx={fontStyleNormal}>{name}</Typography>
          </Box>
        )}
      </>
    );
  };

  const ClientDetail = ({ customer, p_group }) => {
    return (
      <>
        <Box display="flex" alignItems="center" mt={0.5}>
          🧑‍💼 &nbsp;
          <Typography sx={fontStyleBold}>Client Name:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>{customer || "N/A"}</Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          👥 &nbsp;
          <Typography sx={fontStyleBold}>Group Name:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>{p_group || "N/A"}</Typography>
        </Box>
      </>
    );
  };

  const BalanceData = ({
    project_kwp,
    totalCredit,
    totalDebit,
    totalAdjustment,
    amountAvailable,
  }) => {
    const formatINR = (value) => {
      const number = Number(value || 0);
      return number.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: number % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <>
        {project_kwp && (
          <Box display="flex" alignItems="center" mt={0.5}>
            🔋 &nbsp;
            <Typography sx={fontStyleBold}>
              Project Capacity (MW AC):
            </Typography>
            &nbsp;
            <Typography sx={fontStyleNormal}>{project_kwp}</Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center" mt={0.5}>
          💰 &nbsp;
          <Typography sx={fontStyleBold}>Total Credit:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>{formatINR(totalCredit)}</Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          💸 &nbsp;
          <Typography sx={fontStyleBold}>Total Debit:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>{formatINR(totalDebit)}</Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          🔄 &nbsp;
          <Typography sx={fontStyleBold}>Total Adjustment:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>
            {formatINR(totalAdjustment)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          🧾 &nbsp;
          <Typography sx={fontStyleBold}>Amount Available (Old):</Typography>
          &nbsp;
          <Typography sx={fontStyleNormal}>
            {formatINR(amountAvailable)}
          </Typography>
        </Box>
      </>
    );
  };

  const OtherBalance = ({ balanceSlnko, balancePayable, balanceRequired }) => {
    const formatINR = (value) => {
      const number = Number(value || 0);
      return number.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: number % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <>
        <Box display="flex" alignItems="center" mt={0.5}>
          🏦 &nbsp;
          <Typography sx={fontStyleBold}>Balance with Slnko:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>
            {formatINR(balanceSlnko)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          📤 &nbsp;
          <Typography sx={fontStyleBold}>
            Balance Payable to Vendors:
          </Typography>
          &nbsp;
          <Typography sx={fontStyleNormal}>
            {formatINR(balancePayable)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mt={0.5}>
          ⚠️ &nbsp;
          <Typography sx={fontStyleBold}>Balance Required:</Typography>&nbsp;
          <Typography sx={fontStyleNormal}>
            {formatINR(balanceRequired)}
          </Typography>
        </Box>
      </>
    );
  };

  const trim2 = (s) => s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");

  const toCompactINR2dp = (n) => {
    const abs = Math.abs(Number(n) || 0);
    if (abs >= 1e7) return `${trim2((abs / 1e7).toFixed(2))}Cr`;
    if (abs >= 1e5) return `${trim2((abs / 1e5).toFixed(2))}L`;
    if (abs >= 1e3) return `${trim2((abs / 1e3).toFixed(2))}K`;
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      abs
    );
  };

  const rupeeCompact = (n) => {
    const num = Number(n) || 0;
    const sign = num < 0 ? "-" : "";
    return `${sign}₹${toCompactINR2dp(num)}`;
  };

  const fullTooltipINR = (n) => {
    const num = Number(n) || 0;
    const sign = num < 0 ? "-" : "";
    const abs = Math.round(Math.abs(num));
    const indian = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(abs);
    return `${sign}₹${indian} (${toCompactINR2dp(num)})`;
  };

  const isMoneyKey = (key = "") =>
    /(Credit|Debit|Adjustment|Available|Balance|Payable|Required)/i.test(key);

  const tdLabelStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
    fontWeight: 600,
    fontSize: "0.9rem",
  };
  const tdValueStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  };

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": { minWidth: { xs: "120px", md: "160px" } },
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
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "row",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {[
            [
              {
                label: "Total Plant Capacity (MW AC)",
                icon: <Lightbulb size={16} />,
                key: "totalProjectMw",
                format: (val) => `${(val ?? 0).toLocaleString("en-IN")} MW AC`,
              },
              {
                label: "Total Credit",
                icon: <IndianRupee size={16} />,
                key: "totalCredited",
                format: "inr",
              },
              {
                label: "Total Debit",
                icon: <ArrowDownUp size={16} />,
                key: "totalDebited",
                format: "inr",
              },
            ],
            [
              {
                label: "Total Adjustment",
                icon: <Scale size={16} />,
                key: "totalAdjustment",
                format: "inr",
              },
              {
                label: "Available Amount (Old)",
                icon: <Wallet size={16} />,
                key: "amountAvailable",
                format: "inr",
              },
            ],
            [
              {
                label: "Balance with Slnko",
                icon: <Banknote size={16} />,
                key: "balanceSlnko",
                format: "inr",
              },
              {
                label: "Balance Payable to Vendors",
                icon: <ShieldCheck size={16} />,
                key: "balancePayable",
                format: "inr",
              },
              {
                label: "Balance Required",
                icon: <AlertTriangle size={16} />,
                key: "balanceRequired",
                format: "inr",
              },
            ],
          ].map((section, sectionIndex) => (
            <Box
              key={sectionIndex}
              sx={{
                flex: 1,
                minWidth: 280,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                overflow: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {section.map(({ label, icon, key, format, unit }, i) => {
                    const value = paginatedDataTotals?.[key] || 0;
                    const money = isMoneyKey(key);

                    const isRed =
                      key.includes("Debit") || key.includes("Required");
                    const isGreen =
                      key.includes("Credit") ||
                      key.includes("Available") ||
                      key.includes("Balance");

                    const chipColor = isRed
                      ? "#d32f2f"
                      : isGreen
                      ? "#2e7d32"
                      : "#0052cc";
                    const bgColor = isRed
                      ? "rgba(211, 47, 47, 0.1)"
                      : isGreen
                      ? "rgba(46, 125, 50, 0.08)"
                      : "rgba(0, 82, 204, 0.08)";

                    const chipInner = money ? (
                      <AnimatedNumber
                        value={value}
                        formattingFn={rupeeCompact}
                      />
                    ) : format ? (
                      format(value)
                    ) : (
                      value.toLocaleString("en-IN")
                    );

                    const chip = (
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "6px",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          color: chipColor,
                          backgroundColor: bgColor,
                        }}
                      >
                        {chipInner}
                      </Box>
                    );

                    return (
                      <tr key={i}>
                        <td style={tdLabelStyle}>
                          {icon} {label}
                        </td>
                        <td style={tdValueStyle}>
                          {isLoading ? (
                            <Skeleton width={60} height={18} />
                          ) : money ? (
                            <Tooltip
                              title={fullTooltipINR(value)}
                              placement="top"
                            >
                              {chip}
                            </Tooltip>
                          ) : (
                            chip
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          ))}
        </Box>

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
                  key: "totalProjectMw",
                  render: (v) => `${(v ?? 0).toLocaleString("en-IN")} MW AC`,
                },
                { label: "Total Credit", key: "totalCredited", money: true },
                { label: "Total Debit", key: "totalDebited", money: true },
                {
                  label: "Total Adjustment",
                  key: "totalAdjustment",
                  money: true,
                },
                {
                  label: "Available Amount (Old)",
                  key: "amountAvailable",
                  money: true,
                },
                {
                  label: "Balance with Slnko",
                  key: "balanceSlnko",
                  money: true,
                },
                {
                  label: "Balance Payable to Vendors",
                  key: "balancePayable",
                  money: true,
                },
                {
                  label: "Balance Required",
                  key: "balanceRequired",
                  money: true,
                },
              ].map((item, index) => {
                const raw = paginatedDataTotals?.[item.key] ?? 0;

                const valueNode = item.money ? (
                  <AnimatedNumber value={raw} formattingFn={rupeeCompact} />
                ) : item.render ? (
                  item.render(raw)
                ) : (
                  (raw ?? 0).toLocaleString("en-IN")
                );

                const content = item.money ? (
                  <Tooltip title={fullTooltipINR(raw)} placement="top">
                    <Box>{valueNode}</Box>
                  </Tooltip>
                ) : (
                  <Box>{valueNode}</Box>
                );

                return (
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
                    {valueNode}
                  </Box>
                );
              })}
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
                  {[...Array(7)].map((__, colIdx) => (
                    <Skeleton key={colIdx} height={30} width={200} />
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
                    <ProjectID
                      currentPage={currentPage}
                      _id={project._id}
                      code={project.code}
                      name={project.name}
                    />
                  </Typography>
                  <Typography fontSize="0.9rem" color="text.secondary">
                    Client:{" "}
                    <ProjectName
                      currentPage={currentPage}
                      _id={project._id}
                      name={project.name}
                    />
                  </Typography>
                  <Typography fontSize="0.9rem" color="text.secondary">
                    Capacity: {project.project_kwp || "-"} MW AC
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {[
                    { label: "Credit", value: project.totalCredited },
                    { label: "Debit", value: project.totalDebited },
                    { label: "Adjustment", value: project.totalAdjustment },
                    {
                      label: "Available Amount (Old)",
                      value: project.amountAvailable,
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
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                  minWidth: "1000px",
                }}
              >
                <Box component="thead">
                  <Box
                    component="tr"
                    sx={{ backgroundColor: "neutral.softBg" }}
                  >
                    <Box component="th" sx={headerStyle}>
                      <Checkbox
                        checked={
                          paginatedData.length > 0 &&
                          selected.length === paginatedData.length
                        }
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < paginatedData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </Box>
                    {[
                      "",
                      "Project ID",
                      "Client Name",
                      "Plant Capacity (MW AC)",
                      "Slnko Balance",
                    ].map((label, idx) => (
                      <Box key={idx} component="th" sx={headerStyle}>
                        {label}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {isLoading ? (
                    [...Array(3)].map((_, rowIndex) => (
                      <Box component="tr" key={rowIndex}>
                        {[...Array(6)].map((__, colIndex) => (
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
                            backgroundColor: "background.surface",
                            borderRadius: "8px",
                            boxShadow: "xs",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: "neutral.softHoverBg",
                            },
                          }}
                        >
                          <Box component="td" sx={cellStyle}>
                            <Checkbox
                              checked={selected.includes(project.code)}
                              onChange={() => handleRowSelect(project.code)}
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
                              <Box>
                                <ProjectID
                                  name={project.name}
                                  code={project.code}
                                  _id={project._id}
                                  currentPage={currentPage}
                                />
                              </Box>
                            </Tooltip>
                          </Box>

                          <Box component="td" sx={cellStyle}>
                            <ClientDetail
                              customer={project.customer}
                              p_group={project.p_group}
                            />
                          </Box>

                          <Box component="td" sx={cellStyle}>
                            <BalanceData
                              project_kwp={project.project_kwp}
                              totalCredit={project.totalCredited}
                              totalDebit={project.totalDebited}
                              totalAdjustment={project.totalAdjustment}
                              amountAvailable={project.amountAvailable}
                            />
                          </Box>

                          <Box component="td" sx={cellStyle}>
                            <OtherBalance
                              balanceSlnko={project.balanceSlnko}
                              balancePayable={project.balancePayable}
                              balanceRequired={project.balanceRequired}
                            />
                          </Box>
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
