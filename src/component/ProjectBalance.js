import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Box,
  Sheet,
  Button,
  Tooltip,
  Input,
  Select,
  Option,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Drawer,
  Skeleton,
  IconButton,
  Checkbox,
} from "@mui/joy";
import {
  Download as DownloadIcon,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Activity as ActivityIcon,
  Wallet,
  Scale,
  IndianRupee,
  AlertTriangle,
  Search,
  Lightbulb,
  ArrowDownUp,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import Axios from "../utils/Axios";
import AnimatedNumber from "./AnimatedBalance";
import { useGetProjectBalanceQuery } from "../redux/Accounts";

/* -------------------- helpers -------------------- */
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
function timeAgoLabel(dateLike) {
  if (!dateLike) return null;
  const then = new Date(dateLike).getTime();
  if (!Number.isFinite(then)) return null;
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return `just now`;
}

const MONEY_KEYS = new Set([
  "totalCredited",
  "totalDebited",
  "totalAdjustment",
  "amountAvailable",
  "balanceSlnko",
  "balancePayable",
  "balanceRequired",
]);
const isMoneyKey = (k) => MONEY_KEYS.has(k);

const tdLabelStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--joy-palette-divider)",
  fontSize: 13,
  whiteSpace: "nowrap",
};
const tdValueStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--joy-palette-divider)",
  textAlign: "right",
};

function mergedRecent(row) {
  const credits = Array.isArray(row?.recentCredits) ? row.recentCredits : [];
  const debits = Array.isArray(row?.recentDebits) ? row.recentDebits : [];

  const items = [
    ...credits.map((c, i) => ({
      kind: "credit",
      amount: Number(c?.cr_amount) || 0,
      date: c?.cr_date || c?.date || c?.createdAt || null,
      remarks: c?.remarks ?? null,
      by: c?.added_by ?? null,
      _i: i,
    })),
    ...debits.map((d, i) => ({
      kind: "debit",
      amount: Number(d?.amount_paid) || 0,
      date: d?.dbt_date || d?.date || d?.createdAt || null,
      remarks: d?.remarks ?? null,
      by: d?.paid_for ?? null,
      _i: credits.length + i,
    })),
  ];

  return items
    .map((x) => {
      const ts = x.date ? new Date(x.date).getTime() : NaN;
      return { ...x, _ts: Number.isFinite(ts) ? ts : -Infinity };
    })
    .sort((a, b) => b._ts - a._ts || a._i - b._i);
}

function computeLatestSignal(project) {
  const rec = mergedRecent(project);
  if (rec.length) {
    const latest = rec[0];
    return {
      type: latest.kind === "credit" ? "credited" : "debited",
      amount: latest.amount,
      at: latest.date ?? null,
      source: "recent",
    };
  }
  const credit = Number(project?.totalCredited || 0);
  const debit = Number(project?.totalDebited || 0);
  const net = credit - debit;
  return {
    type: net >= 0 ? "credited" : "debited",
    amount: Math.abs(net),
    at: null,
    source: "net",
  };
}

/* ---------- tiny layout cells ---------- */
function HeaderCell({ children, minWidth, flex, align = "left" }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        minWidth,
        flexGrow: flex ? 1 : 0,
        flexBasis: flex ? 0 : "auto",
        textAlign: align,
        fontWeight: 700,
        fontSize: 13,
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        bgcolor: "background.surface",
        zIndex: 1,
      }}
    >
      {children}
    </Box>
  );
}
function Cell({ children, minWidth, flex, align = "left" }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        minWidth,
        flexGrow: flex ? 1 : 0,
        flexBasis: flex ? 0 : "auto",
        textAlign: align,
        fontSize: 13,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {children}
    </Box>
  );
}

const canAddMoney = (user) =>
  Boolean(
    user &&
      (user.name === "IT Team" ||
        user.name === "Guddu Rani Dubey" ||
        user.name === "Varun Mishra" ||
        user.name === "Prachi Singh" ||
        user.department === "admin" ||
        user.department === "Accounts")
  );

/* -------------------- main page -------------------- */
export default function ProjectBalancesJoy() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialPage = parseInt(params.get("page")) || 1;
  const initialSize = parseInt(params.get("pageSize")) || 10;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [query, setQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [drawerRow, setDrawerRow] = useState(null);
  const [selected, setSelected] = useState(() => new Set());

  const {
    data: responseData,
    isLoading,
    refetch,
  } = useGetProjectBalanceQuery(
    { page, pageSize, search: query },
    { refetchOnMountOrArgChange: true }
  );

  const rows = responseData?.data || [];
  const totals = responseData?.totals || {};
  const total = responseData?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = total ? Math.min(start + rows.length - 1, total) : 0;

  useEffect(() => {
    setParams({ page: String(page), pageSize: String(pageSize) });
    setSelected(new Set());
  }, [page, pageSize, setParams]);

  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("userDetails") || "null"));
    } catch {
      setUser(null);
    }
  }, []);

  // Use project "code" as selection id (backend expects this)
  const pageIds = rows
    .map((r) => (r?.code ? String(r.code) : null))
    .filter(Boolean);
  const allChecked =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = !allChecked && pageIds.some((id) => selected.has(id));

  // -------- EXPORT (only on button click) --------
  const exportProjectBalance = async ({
    selectedIds = [],
    selectAll = false,
    search = "",
  }) => {
    const token = localStorage.getItem("authToken");
    const base = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
    const url = `${base}/accounting/export-project-balance`;

    try {
      const res = await axios.post(
        url,
        { selectedIds, selectAll, search },
        { responseType: "blob", headers: { "x-auth-token": token } }
      );

      const contentType = (res.headers["content-type"] || "").toLowerCase();
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        try {
          const err = JSON.parse(text);
          throw new Error(err.message || "Export failed");
        } catch {
          throw new Error(text || "Export failed");
        }
      }

      const cd = res.headers["content-disposition"] || "";
      let filename = "project-balance.csv";
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
      if (match) filename = decodeURIComponent(match[1] || match[2]);

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlBlob);
    } catch (err) {
      const resp = err?.response;
      if (resp?.data instanceof Blob) {
        try {
          const text = await resp.data.text();
          let msg = text;
          try {
            msg = JSON.parse(text).message || msg;
          } catch {}
          alert(msg);
          return;
        } catch {}
      }
      console.error("Export error:", err);
      alert(err?.message || "Export failed");
    }
  };

  const exportAllFiltered = async () => {
    try {
      setIsExporting(true);
      await exportProjectBalance({
        selectedIds: [],
        selectAll: true,
        search: query,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    if (selected.size === 0) {
      alert("Please select at least one project to export.");
      return;
    }
    try {
      setIsExporting(true);
      await exportProjectBalance({
        selectedIds: [...selected],
        selectAll: false,
        search: "",
      });
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
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  function StatusChips({ project }) {
    const latest = useMemo(() => computeLatestSignal(project), [project]);
    const isCredited = latest.type === "credited";
    const PrimaryIcon = isCredited ? ArrowUpRight : ArrowDownRight;
    const primaryLabel = isCredited ? "Credited" : "Debited";
    const when = timeAgoLabel(latest.at);

    return (
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <Tooltip
          title={[
            `${primaryLabel}${latest.source === "recent" ? "" : " (net)"}`,
            `Amount: ${fullTooltipINR(latest.amount)}`,
            when ? `When: ${when}` : null,
          ]
            .filter(Boolean)
            .join(" • ")}
          arrow
        >
          <Chip
            variant="soft"
            size="sm"
            color={isCredited ? "success" : "danger"}
            startDecorator={<PrimaryIcon size={14} />}
          >
            {primaryLabel} · {rupeeCompact(latest.amount)}
          </Chip>
        </Tooltip>

        {(Array.isArray(project?.recentCredits) ||
          Array.isArray(project?.recentDebits)) && (
          <Tooltip title="Open to view recent activity" arrow>
            <Chip
              size="sm"
              variant="soft"
              color="neutral"
              startDecorator={<ActivityIcon size={14} />}
            >
              Recent activity
            </Chip>
          </Tooltip>
        )}
      </Box>
    );
  }

  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 88;
  const buffer = 6;
  const visibleCount =
    Math.ceil((containerRef.current?.clientHeight || 480) / rowHeight) + buffer;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIdx = Math.min(rows.length, startIdx + visibleCount);
  const visibleRows = rows.slice(startIdx, endIdx);
  const topSpacer = startIdx * rowHeight;
  const bottomSpacer = Math.max(0, (rows.length - endIdx) * rowHeight);

  const GRID_COLS = "48px 56px minmax(260px,1.2fr) 220px 120px 340px 300px";

  const toggleRow = (e, code) => {
    e.stopPropagation();
    const willCheck = !!e.target.checked;

    setSelected((prev) => {
      const next = new Set(prev);
      if (willCheck) next.add(code);
      else next.delete(code);
      return next;
    });
  };

  const toggleAll = async (e) => {
    e.stopPropagation();
    const willCheck = !!e.target.checked;

    setSelected((prev) => {
      const next = new Set(prev);
      if (willCheck) pageIds.forEach((id) => next.add(id));
      else pageIds.forEach((id) => next.delete(id));
      return next;
    });
    if (willCheck) {
      await exportAllFiltered();
    }
  };

  /* -------------------- render -------------------- */
  return (
    <Box sx={{ px: { xs: 1, md: 3 }, py: 2 }}>
      {/* Totals block */}
      <Box
        sx={{
          marginLeft: { xl: "12%", lg: "15%", xs: "0%" },
          maxWidth: "100%",
          p: 2,
          bgcolor: "background.surface",
          borderRadius: "md",
          boxShadow: "lg",
          mb: 1.5,
          border: "1px solid",
          borderColor: "divider",
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
                format: (v) => `${(v ?? 0).toLocaleString("en-IN")} MW AC`,
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
                  {section.map(({ label, icon, key, format }, i) => {
                    const value = totals?.[key] || 0;
                    const money = isMoneyKey(key);
                    const isRed =
                      key.includes("Debited") ||
                      key.includes("Required") ||
                      key === "totalDebited" ||
                      key === "balanceRequired";
                    const isGreen =
                      key.includes("Credit") ||
                      key.includes("Available") ||
                      key.includes("Balance") ||
                      key === "totalCredited" ||
                      key === "balanceSlnko";

                    const chipColor = isRed
                      ? "#d32f2f"
                      : isGreen
                      ? "#2e7d32"
                      : "#0052cc";
                    const bgColor = isRed
                      ? "rgba(211,47,47,.1)"
                      : isGreen
                      ? "rgba(46,125,50,.08)"
                      : "rgba(0,82,204,.08)";

                    const chipInner = money ? (
                      <AnimatedNumber
                        value={value}
                        formattingFn={rupeeCompact}
                      />
                    ) : typeof format === "function" ? (
                      format(value)
                    ) : (
                      (value ?? 0).toLocaleString("en-IN")
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
                          {icon} <span style={{ marginLeft: 6 }}>{label}</span>
                        </td>
                        <td style={tdValueStyle}>
                          {isLoading ? (
                            <Skeleton width={60} height={18} />
                          ) : money ? (
                            <Tooltip title={fullTooltipINR(value)}>
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
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          p: 1,
          borderRadius: "md",
          bgcolor: "background.surface",
          border: "1px solid",
          borderColor: "divider",
          marginLeft: { xl: "12%", lg: "15%", xs: "0%" },
          maxWidth: "100%",
        }}
      >
        <Input
          size="sm"
          placeholder="Search by Project ID, Customer, or Name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          startDecorator={<Search size={16} />}
          sx={{ flex: 1, minWidth: 280 }}
        />
        <Select
          size="sm"
          value={pageSize}
          onChange={(e, v) => {
            setPageSize(v);
            setPage(1);
          }}
          sx={{ width: 140 }}
        >
          {[10, 30, 60, 100].map((n) => (
            <Option key={n} value={n}>
              {n}/Page
            </Option>
          ))}
        </Select>
        <Tooltip title="Refresh (sync balances)">
          <span>
            <Button
              size="sm"
              variant="outlined"
              onClick={handleRefresh}
              disabled={isRefreshing}
              startDecorator={
                isRefreshing ? (
                  <CircularProgress size="sm" />
                ) : (
                  <RefreshCcw size={16} />
                )
              }
            >
              {isRefreshing ? "Syncing…" : "Refresh"}
            </Button>
          </span>
        </Tooltip>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={handleExport}
          startDecorator={
            isExporting ? (
              <CircularProgress size="sm" />
            ) : (
              <DownloadIcon size={16} />
            )
          }
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </Box>

      {/* Table */}
      <Sheet
        variant="outlined"
        sx={{
          mt: 1,
          borderRadius: "md",
          overflow: "auto",
          marginLeft: { xl: "12%", lg: "15%", xs: "0%" },
          maxWidth: "100%",
          maxHeight: 450,
        }}
      >
        {/* header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: GRID_COLS,
            columnGap: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "background.surface",
            overflow: "auto",
          }}
        >
          <HeaderCell minWidth={48} align="center">
            <Checkbox
              size="sm"
              checked={allChecked}
              indeterminate={someChecked}
              onChange={toggleAll}
              onClick={(e) => e.stopPropagation()}
              variant="soft"
            />
          </HeaderCell>

          <HeaderCell minWidth={56} align="center">
            <AddCircleOutlineIcon fontSize="small" />
          </HeaderCell>

          <HeaderCell minWidth={260}>Project</HeaderCell>
          <HeaderCell minWidth={220}>Client</HeaderCell>
          <HeaderCell minWidth={120} align="right">
            Capacity (MW AC)
          </HeaderCell>
          <HeaderCell minWidth={340}>Totals</HeaderCell>
          <HeaderCell minWidth={300}>Slnko Balances</HeaderCell>
        </Box>

        {/* body (virtualized) */}
        <Box
          ref={containerRef}
          sx={{
            maxHeight: 450,
            overflow: "auto",
            "&::-webkit-scrollbar": { height: 10, width: 10 },
          }}
        >
          <Box sx={{ height: topSpacer }} />

          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Box
                key={`s-${i}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: GRID_COLS,
                  columnGap: 0,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  px: 1.5,
                  py: 1.25,
                }}
              >
                {/* checkbox */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton variant="circular" width={16} height={16} />
                </Box>

                {/* + add */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton width={20} height={20} />
                </Box>

                {/* Project (chip + 2 lines) */}
                <Box sx={{ minWidth: 0 }}>
                  <Skeleton width={90} height={22} sx={{ borderRadius: 999 }} />
                  <Skeleton width="70%" height={14} sx={{ mt: 0.5 }} />
                </Box>

                {/* Client */}
                <Box sx={{ minWidth: 0 }}>
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="60%" height={14} sx={{ mt: 0.5 }} />
                </Box>

                {/* Capacity */}
                <Box sx={{ textAlign: "right" }}>
                  <Skeleton width={80} height={18} sx={{ ml: "auto" }} />
                </Box>

                {/* Totals */}
                <Box sx={{ minWidth: 0 }}>
                  <Skeleton width="75%" height={16} />
                  <Skeleton width="65%" height={16} sx={{ mt: 0.5 }} />
                  <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
                  <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
                </Box>

                {/* Slnko balances */}
                <Box sx={{ minWidth: 0 }}>
                  <Skeleton width="75%" height={16} />
                  <Skeleton width="65%" height={16} sx={{ mt: 0.5 }} />
                  <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))
          ) : rows.length === 0 ? (
            <Box sx={{ px: 2, py: 5, textAlign: "center" }}>
              <Typography level="title-sm" sx={{ opacity: 0.7 }}>
                No balance available
              </Typography>
            </Box>
          ) : (
            visibleRows.map((row) => {
              const credit = Number(row.totalCredited || 0);
              const debit = Number(row.totalDebited || 0);
              const adj = Number(row.totalAdjustment || 0);
              const avail = Number(row.amountAvailable || 0);
              const slnko = Number(row.balanceSlnko || 0);
              const payable = Number(row.balancePayable || 0);
              const need = Number(row.balanceRequired || 0);

              const rowKey = row?.code ? String(row.code) : ""; // use code for selection/export
              const checked = rowKey && selected.has(rowKey);

              return (
                <Box
                  key={row._id || row.code || row.p_id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: GRID_COLS,
                    columnGap: 0,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "neutral.softHoverBg" },
                  }}
                  onClick={() => setDrawerRow(row)}
                >
                  {/* Row checkbox */}
                  <Cell minWidth={48} align="center">
                    <Checkbox
                      size="sm"
                      checked={checked}
                      disabled={!rowKey} // if no code, disable selection
                      onChange={(e) => rowKey && toggleRow(e, rowKey)}
                      onClick={(e) => e.stopPropagation()}
                      variant="soft"
                    />
                  </Cell>

                  {/* + Add Money */}
                  <Cell minWidth={56} align="center">
                    <Tooltip
                      title={canAddMoney(user) ? "Add Money" : "No permission"}
                      arrow
                    >
                      <span>
                        <IconButton
                          aria-label="Add Money"
                          size="sm"
                          variant="soft"
                          color="success"
                          disabled={!canAddMoney(user)}
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem("add_money", row.p_id);
                            navigate(
                              `/add_money?page=${page}&p_id=${row.p_id}`
                            );
                          }}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Cell>

                  {/* Project */}
                  <Cell minWidth={260}>
                    <Chip
                      size="sm"
                      variant="solid"
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/view_detail?page=${page}&_id=${row._id}&p_id=${row.p_id}`
                        );
                      }}
                      sx={{
                        cursor: "pointer",
                        fontWeight: 600,
                        width: "fit-content",
                      }}
                    >
                      {row.code || "N/A"}
                    </Chip>
                    <Typography level="body-sm" sx={{ mt: 0.5 }}>
                      <b>Project Name:</b> {row.name || "—"}
                    </Typography>
                  </Cell>

                  {/* Client */}
                  <Cell minWidth={220}>
                    <Typography level="body-sm">
                      <b>Client:</b> {row.customer || "—"}
                    </Typography>
                    <Typography level="body-sm" sx={{ mt: 0.25 }}>
                      <b>Group:</b> {row.p_group || "—"}
                    </Typography>
                  </Cell>

                  {/* Capacity */}
                  <Cell minWidth={120} align="right">
                    {(row.project_kwp ?? 0).toLocaleString("en-IN")}
                  </Cell>

                  {/* Totals */}
                  <Cell minWidth={340} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        rowGap: 0.5,
                        columnGap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography level="body-sm" noWrap sx={{ minWidth: 0 }}>
                        Credit
                      </Typography>
                      <Tooltip title={fullTooltipINR(credit)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="success"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(credit)}
                        </Chip>
                      </Tooltip>

                      <Typography level="body-sm" noWrap sx={{ minWidth: 0 }}>
                        Debit
                      </Typography>
                      <Tooltip title={fullTooltipINR(debit)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="danger"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(debit)}
                        </Chip>
                      </Tooltip>

                      <Typography level="body-sm" noWrap sx={{ minWidth: 0 }}>
                        Adjustment
                      </Typography>
                      <Tooltip title={fullTooltipINR(adj)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="neutral"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(adj)}
                        </Chip>
                      </Tooltip>

                      <Typography level="body-sm" noWrap sx={{ minWidth: 0 }}>
                        Available (Old)
                      </Typography>
                      <Tooltip title={fullTooltipINR(avail)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="primary"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(avail)}
                        </Chip>
                      </Tooltip>
                    </Box>
                  </Cell>

                  {/* Slnko balances */}
                  <Cell minWidth={300} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        rowGap: 0.5,
                        columnGap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        level="body-sm"
                        noWrap
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          minWidth: 0,
                        }}
                      >
                        <Wallet size={14} /> With Slnko
                      </Typography>
                      <Tooltip title={fullTooltipINR(slnko)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="primary"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(slnko)}
                        </Chip>
                      </Tooltip>

                      <Typography
                        level="body-sm"
                        noWrap
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          minWidth: 0,
                        }}
                      >
                        <Scale size={14} /> Payable
                      </Typography>
                      <Tooltip title={fullTooltipINR(payable)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="neutral"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(payable)}
                        </Chip>
                      </Tooltip>

                      <Typography
                        level="body-sm"
                        noWrap
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          minWidth: 0,
                        }}
                      >
                        <AlertTriangle size={14} /> Required
                      </Typography>
                      <Tooltip title={fullTooltipINR(need)}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color="danger"
                          sx={{ justifySelf: "flex-start" }}
                        >
                          {rupeeCompact(need)}
                        </Chip>
                      </Tooltip>
                    </Box>
                  </Cell>
                </Box>
              );
            })
          )}
          <Box sx={{ height: bottomSpacer }} />
        </Box>
      </Sheet>

      {/* Footer mini summary + pagination */}
      <Box
        sx={{
          mt: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          marginLeft: { xl: "12%", lg: "15%", xs: "0%" },
          maxWidth: "100%",
        }}
      >
        <Typography level="body-sm">
          {total ? (
            <>
              Showing {Math.min(start, total)}–{Math.min(end, total)} of {total}{" "}
              results
            </>
          ) : (
            <>Showing 0 results</>
          )}
        </Typography>

        <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
          <Button
            size="sm"
            variant="outlined"
            disabled={!total || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            Prev
          </Button>
          <Chip size="sm" variant="soft">
            {total ? page : 0} / {total ? Math.max(1, totalPages) : 0}
          </Chip>
          <Button
            size="sm"
            variant="outlined"
            disabled={!total || page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Drawer — merged Recent Activity (last 3 overall) */}
      <Drawer
        anchor="right"
        size="md"
        open={Boolean(drawerRow)}
        onClose={() => setDrawerRow(null)}
      >
        {drawerRow && (
          <Box sx={{ p: 2 }}>
            <Typography level="h5" sx={{ mb: 1 }}>
              {drawerRow.code}
            </Typography>
            <Typography level="title-sm" sx={{ mb: 1 }}>
              {drawerRow.name}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 0.75,
              }}
            >
              <Typography level="body-sm">
                <b>Client:</b>
              </Typography>
              <Typography level="body-sm">
                {drawerRow.customer || "—"}
              </Typography>
              <Typography level="body-sm">
                <b>Group:</b>
              </Typography>
              <Typography level="body-sm">
                {drawerRow.p_group || "—"}
              </Typography>
              <Typography level="body-sm">
                <b>Capacity (MW AC):</b>
              </Typography>
              <Typography level="body-sm">
                {(drawerRow.project_kwp ?? 0).toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.25 }} />
            <Typography level="title-sm" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <StatusChips project={drawerRow} />

            <Divider sx={{ my: 1.25 }} />
            <Typography level="title-sm" sx={{ mb: 0.5 }}>
              Money
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 0.5,
              }}
            >
              <Typography level="body-sm">Total Credit</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.totalCredited)}
              </Typography>
              <Typography level="body-sm">Total Debit</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.totalDebited)}
              </Typography>
              <Typography level="body-sm">Adjustment</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.totalAdjustment)}
              </Typography>
              <Typography level="body-sm">Available (Old)</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.amountAvailable)}
              </Typography>
              <Typography level="body-sm">With Slnko</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.balanceSlnko)}
              </Typography>
              <Typography level="body-sm">Payable to Vendors</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.balancePayable)}
              </Typography>
              <Typography level="body-sm">Required</Typography>
              <Typography level="body-sm">
                {fullTooltipINR(drawerRow.balanceRequired)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.25 }} />
            <Typography level="title-sm" sx={{ mb: 0.5 }}>
              Recent Activity
            </Typography>
            {(() => {
              const list = mergedRecent(drawerRow).slice(0, 3);
              if (!list.length)
                return (
                  <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                    No recent transactions
                  </Typography>
                );

              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    maxHeight: 320,
                    overflow: "auto",
                  }}
                >
                  {list.map((a, i) => {
                    const isCredit = a.kind === "credit";
                    return (
                      <Box
                        key={`ra-${i}`}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: "1px dashed",
                          borderColor: "divider",
                          p: 0.75,
                          borderRadius: "8px",
                        }}
                      >
                        <Chip
                          size="sm"
                          variant="soft"
                          color={isCredit ? "success" : "danger"}
                          startDecorator={
                            isCredit ? (
                              <ArrowUpRight size={14} />
                            ) : (
                              <ArrowDownRight size={14} />
                            )
                          }
                        >
                          {isCredit ? "Credited" : "Debited"} ·{" "}
                          {rupeeCompact(a.amount)}
                        </Chip>
                        <Box sx={{ textAlign: "right" }}>
                          {a.date && (
                            <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                              {new Date(a.date).toLocaleString("en-IN")} ·{" "}
                              {timeAgoLabel(a.date)}
                            </Typography>
                          )}
                          {(a.by || a.remarks) && (
                            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                              {a.by || a.remarks}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              );
            })()}

            <Divider sx={{ my: 1.25 }} />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setDrawerRow(null)}>
                Close
              </Button>
              <Button
                variant="solid"
                onClick={() =>
                  navigate(
                    `/view_detail?page=${page}&_id=${drawerRow._id}&p_id=${drawerRow.p_id}`
                  )
                }
              >
                Open Project
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
