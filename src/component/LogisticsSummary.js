// src/components/LogisticsDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Link,
  Option,
  Select,
  Sheet,
  Tooltip,
  Typography,
  Tabs,
  TabList,
  Tab,
} from "@mui/joy";

import {
  useGetLogisticsQuery,
  useUpdateLogisticStatusMutation,
} from "../redux/purchasesSlice";

/* ---------------- helpers ---------------- */
const formatINR = (v) =>
  Number(v ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safe = (v, fb = "-") => {
  if (v === null || v === undefined) return fb;
  const s = String(v).trim();
  return s ? s : fb;
};

const getPoNumbers = (row) => {
  const list = Array.isArray(row?.po_id) ? row.po_id : [];
  return list.map((po) =>
    typeof po === "string" ? po : po?.po_number || po?._id || "-"
  );
};

function buildPoCategorySummary(itemsRaw) {
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
  const pairCounts = new Map();
  const grouped = new Map();

  for (const it of items) {
    const po = it?.material_po?.po_number || "-";
    const category = it?.category_name || "-";
    const key = `${po}|${category}`;
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  }

  const pairs = [];
  for (const [key, count] of pairCounts.entries()) {
    const [po, category] = key.split("|");
    pairs.push({ po, category, count });
    if (!grouped.has(po)) grouped.set(po, []);
    grouped.get(po).push({ category, count });
  }

  pairs.sort((a, b) =>
    a.po === b.po
      ? a.category.localeCompare(b.category)
      : a.po.localeCompare(b.po)
  );
  for (const [po, arr] of grouped.entries()) {
    arr.sort((a, b) => a.category.localeCompare(b.category));
  }

  const first = pairs[0];
  const firstLabel = first ? `${first.po} — ${first.category}` : "-";
  const extraCount = Math.max(0, pairs.length - 1);

  return { pairs, grouped, firstLabel, extraCount };
}

const pageNumbers = (current, total) => {
  const out = [];
  if (current > 2) out.push(1);
  if (current > 3) out.push("…");
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++)
    out.push(p);
  if (current < total - 2) out.push("…");
  if (current < total - 1) out.push(total);
  return out;
};

// Compact round "+N" pill (used in two table cells)
const MorePill = ({ n }) =>
  n > 0 ? (
    <Chip
      size="sm"
      variant="solid"
      color="neutral"
      sx={{
        px: 0.6,
        py: 0,
        lineHeight: 1,
        borderRadius: "999px",
        fontWeight: 700,
        fontSize: "11px",
      }}
    >
      +{n}
    </Chip>
  ) : null;

// small helper to extract error text
const errMsg = (e) =>
  e?.data?.message || e?.error || e?.message || "Failed to update status";

function StatusCard({ row, onUpdated }) {
  const raw =
    row?.current_status?.status ??
    (Array.isArray(row?.status_history) && row.status_history.length
      ? row.status_history[row.status_history.length - 1]?.status
      : undefined);

  const current = raw || "ready_to_dispatch";

  const [updateStatus, { isLoading }] = useUpdateLogisticStatusMutation();
  const [errorText, setErrorText] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isLogistic = user?.department === "Logistic";
  const isSuperadmin = user?.role === "superadmin";

  const showChangeToOfd =
    current === "ready_to_dispatch" && (isLogistic || isSuperadmin);

  const showMarkDelivered =
    current === "out_for_delivery" && (isLogistic || isSuperadmin);

  const label =
    current === "delivered"
      ? "Delivered"
      : current === "out_for_delivery"
      ? "Out for Delivery"
      : "Ready to Dispatch";

  const color =
    current === "delivered"
      ? "success"
      : current === "out_for_delivery"
      ? "warning"
      : "neutral";

  const ddmmyyyy = (d) => {
    if (!d) return "dd - mm - yyyy";
    const dt = new Date(d);
    if (isNaN(dt)) return "dd - mm - yyyy";
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd} - ${mm} - ${yyyy}`;
  };

  // helper: is any received_qty blank?
  const hasBlankReceivedQty = (r) => {
    const items = Array.isArray(r?.items) ? r.items : [];
    return items.some(
      (it) =>
        it == null ||
        it.received_qty == null ||
        String(it.received_qty).trim() === ""
    );
  };

  const handleUpdate = async (targetStatus) => {
    setErrorText("");

    // Block Delivered if any received_qty is blank and toast a message
    if (targetStatus === "delivered" && hasBlankReceivedQty(row)) {
      toast.error(
        "Cannot mark as Delivered. One or more items have blank 'Quantity Received'."
      );
      return;
    }

    try {
      await updateStatus({ id: row._id, status: targetStatus, remarks: "" }).unwrap();
      await onUpdated?.();
    } catch (e) {
      setErrorText(e?.data?.message || e?.error || e?.message || "Failed to update status");
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "sm",
        p: 1,
        bgcolor: "background.body",
        minWidth: 320,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "neutral.softBg",
          px: 1,
          py: 0.75,
          borderRadius: "sm",
          mb: 1,
        }}
      >
        <Typography level="title-sm">{label}</Typography>
        <Chip size="sm" variant="soft" color={color}>
          {label}
        </Chip>
      </Box>

      {/* Dates */}
      <Box sx={{ display: "grid", rowGap: 0.5, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="body-sm" sx={{ minWidth: 130 }}>
            Dispatch Date :
          </Typography>
          <Typography level="body-sm">{ddmmyyyy(row?.dispatch_date)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="body-sm" sx={{ minWidth: 130 }}>
            Delivery Date :
          </Typography>
          <Typography level="body-sm">{ddmmyyyy(row?.delivery_date)}</Typography>
        </Box>
      </Box>

      {!!errorText && (
        <Typography level="body-xs" color="danger" sx={{ mb: 1 }}>
          {errorText}
        </Typography>
      )}

      {showChangeToOfd && (
        <Button
          size="sm"
          variant="soft"
          color="primary"
          onClick={() => handleUpdate("out_for_delivery")}
          disabled={isLoading}
          sx={{ mr: 1 }}
        >
          {isLoading ? "Updating..." : "Change Status to Out for Delivery"}
        </Button>
      )}

      {showMarkDelivered && (
        <Button
          size="sm"
          variant="solid"
          color="success"
          onClick={() => handleUpdate("delivered")}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Mark as Delivered"}
        </Button>
      )}
    </Box>
  );
}


/* ---------------- component ---------------- */
export default function LogisticsDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // -------- Tabs --------
  const TAB_LABELS = ["All", "Out for delivery", "Delivered"];
  const [selectedTab, setSelectedTab] = useState(
    () => searchParams.get("tab") || "All"
  );

  // read status from URL so the request query string mirrors it
  const urlStatus = (searchParams.get("status") || "").trim();

  const mapTabToStatus = (tab) => {
    switch (tab) {
      case "Out for delivery":
      case "Out for Delivery":
        return "out_for_delivery";
      case "Delivered":
        return "delivered";
      case "All":
      default:
        return ""; // no status param for All
    }
  };

  // -------- Pagination --------
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(Number.isNaN(p) ? 1 : Math.max(1, p));
  }, [searchParams]);

  // -------- Search & Page Size --------
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );

  const [selected, setSelected] = useState([]);

  // Build query args. Only include "status" when it exists in URL.
  const queryArgs = useMemo(() => {
    const base = {
      page: currentPage,
      pageSize: rowsPerPage,
      search: searchQuery,
      po_id: "",
      po_number: searchParams.get("po_number") || "",
    };
    return urlStatus ? { ...base, status: urlStatus } : base;
  }, [currentPage, rowsPerPage, searchQuery, searchParams, urlStatus]);

  const {
    data: resp = {},
    isLoading,
    refetch,
  } = useGetLogisticsQuery(queryArgs, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true, // ensure fetch on arg (status) change
  });

  const rows = useMemo(() => {
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp?.data)) return resp.data;
    return [];
  }, [resp]);

  const meta = resp?.meta || {};
  const totalCount = meta.total ?? (Array.isArray(resp?.data) ? resp.data.length : 0);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
    setCurrentPage(p);
    setSelected([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(rows.map((r) => r._id));
    else setSelected([]);
  };

  const handleRowSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <>
      {/* Search */}
      <Box
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
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Logistics Code, PO, Vehicle No., Description"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const params = new URLSearchParams(searchParams);
              params.set("page", "1");
              setSearchParams(params);
              setCurrentPage(1);
            }}
          />
        </FormControl>
      </Box>

      {/* Tabs + Rows per page */}
      <Box
        display={"flex"}
        sx={{ marginLeft: { xl: "15%", lg: "18%" } }}
        justifyContent={"space-between"}
        width={"full"}
        alignItems={"center"}
      >
        <Box>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => {
              setSelectedTab(newValue);

              const params = new URLSearchParams(searchParams);
              params.set("tab", newValue);
              params.set("page", "1");

              const statusValue = mapTabToStatus(newValue);
              if (statusValue) {
                // write status for Out for delivery / Delivered
                params.set("status", statusValue);
              } else {
                // remove status for All
                params.delete("status");
              }

              setSearchParams(params);
              setCurrentPage(1);
            }}
            indicatorPlacement="none"
            sx={{
              bgcolor: "background.level1",
              borderRadius: "md",
              boxShadow: "sm",
              width: "fit-content",
            }}
          >
            <TabList sx={{ gap: 1 }}>
              {TAB_LABELS.map((label) => (
                <Tab
                  key={label}
                  value={label}
                  disableIndicator
                  sx={{
                    borderRadius: "xl",
                    fontWeight: "md",
                    "&.Mui-selected": {
                      bgcolor: "background.surface",
                      boxShadow: "sm",
                    },
                  }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>

        <Box display="flex" alignItems="center" gap={1} sx={{ padding: "8px 16px" }}>
          <Typography level="body-sm">Rows Per Page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(_, newValue) => {
              if (newValue == null) return;
              setRowsPerPage(newValue);
              const params = new URLSearchParams(searchParams);
              params.set("pageSize", String(newValue));
              params.set("page", "1");
              setSearchParams(params);
              setCurrentPage(1);
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {[10, 25, 50, 100].map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            "& thead th": {
              position: "sticky",
              top: 0,
              background: "#e0e0e0",
              zIndex: 2,
              borderBottom: "1px solid #ddd",
              padding: "8px",
              textAlign: "left",
              fontWeight: "bold",
            },
            "& tbody td": {
              borderBottom: "1px solid #ddd",
              padding: "8px",
              textAlign: "left",
            },
            "& tbody tr:hover": {
              backgroundColor: "var(--joy-palette-neutral-plainHoverBg)",
            },
          }}
        >
          <thead>
            <tr>
              <th>
                <Checkbox
                  size="sm"
                  checked={rows.length > 0 && selected.length === rows.length}
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              {[
                "Logistics Code",
                "Transportation PO",
                "PO Number with Item",
                "Vehicle No.",
                "Transport PO Value",
                "Total Weight (Ton)",
                "Status",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: "8px", textAlign: "center" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ mb: 1 }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => {
                const poNumbers = getPoNumbers(row);
                const firstPO = poNumbers[0] || "-";
                const extraPO = Math.max(0, poNumbers.length - 1);

                const { grouped, firstLabel, extraCount } =
                  buildPoCategorySummary(row.items);

                const totalWeight =
                  row?.total_ton ??
                  (Array.isArray(row.items)
                    ? row.items.reduce(
                        (sum, it) => sum + (Number(it.weight) || 0),
                        0
                      )
                    : "-");

                return (
                  <tr key={row._id}>
                    {/* checkbox */}
                    <td>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(row._id)}
                        onChange={() => handleRowSelect(row._id)}
                      />
                    </td>

                    {/* Logistics Code */}
                    <td>
                      <Tooltip title="View Logistics Detail" arrow>
                        <span>
                          <Link
                            underline="none"
                            sx={{ fontWeight: 600, cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/logistics-form?mode=edit&id=${row._id}`)
                            }
                          >
                            {safe(row.logistic_code)}
                          </Link>
                        </span>
                      </Tooltip>
                    </td>

                    {/* Transportation PO */}
                    <td>
                      <Tooltip
                        variant="soft"
                        placement="top-start"
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography
                              level="body-xs"
                              sx={{ mb: 0.5, fontWeight: 700 }}
                            >
                              Transportation POs
                            </Typography>
                            {poNumbers.length ? (
                              poNumbers.map((p, idx) => (
                                <Typography key={idx} level="body-xs">
                                  • {p}
                                </Typography>
                              ))
                            ) : (
                              <Typography level="body-xs">-</Typography>
                            )}
                          </Box>
                        }
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography level="body-sm" fontWeight="md">
                            {firstPO}
                          </Typography>
                          <MorePill n={extraPO} />
                        </Box>
                      </Tooltip>
                    </td>

                    {/* PO Number with Item */}
                    <td>
                      <Tooltip
                        variant="soft"
                        placement="top-start"
                        title={
                          <Box sx={{ p: 0.5, maxWidth: 360 }}>
                            <Typography
                              level="body-xs"
                              sx={{ mb: 0.5, fontWeight: 700 }}
                            >
                              POs & Categories
                            </Typography>
                            {grouped.size ? (
                              Array.from(grouped.entries()).map(([po, arr]) => (
                                <Box key={po} sx={{ mb: 0.5 }}>
                                  <Typography
                                    level="body-xs"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {po}
                                  </Typography>
                                  {arr.map(({ category, count }, idx) => (
                                    <Typography
                                      key={idx}
                                      level="body-xs"
                                      sx={{ pl: 1 }}
                                    >
                                      • {category} {count > 1 ? `(${count})` : ""}
                                    </Typography>
                                  ))}
                                </Box>
                              ))
                            ) : (
                              <Typography level="body-xs">-</Typography>
                            )}
                          </Box>
                        }
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography level="body-sm">
                            {safe(firstLabel)}
                          </Typography>
                          <MorePill n={extraCount} />
                        </Box>
                      </Tooltip>
                    </td>

                    {/* Vehicle No. */}
                    <td>{safe(row.vehicle_number)}</td>

                    {/* Transport PO Value */}
                    <td>{formatINR(row.total_transport_po_value)}</td>

                    {/* Total Weight */}
                    <td>{safe(totalWeight)}</td>

                    {/* Status */}
                    <td>
                      <StatusCard row={row} onUpdated={refetch} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: "8px", textAlign: "center" }}>
                  <Typography fontStyle="italic">No Logistics Found</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        sx={{
          pt: 2,
          gap: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { lg: "18%", xl: "15%" },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>

        <Box>
          Showing {meta?.count ?? rows.length} of {meta?.total ?? rows.length} results
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {pageNumbers(currentPage, totalPages).map((v, idx) =>
            v === "…" ? (
              <Typography key={`dots-${idx}`} level="body-sm" sx={{ px: 1 }}>
                …
              </Typography>
            ) : (
              <IconButton
                key={v}
                size="sm"
                variant={v === currentPage ? "solid" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(v)}
                disabled={isLoading}
              >
                {v}
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
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
