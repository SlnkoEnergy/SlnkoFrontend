// src/components/LogisticsDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
} from "@mui/joy";

import { useGetLogisticsQuery } from "../redux/purchasesSlice";

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

/** Build PO→Category summary from items.
 * Returns:
 * - pairs: [{ po, category, count }]
 * - grouped: Map(po -> [{category, count}])
 * - firstLabel: "PO/XXX — Category"
 * - extraCount: total unique (po,category) pairs - 1
 */
function buildPoCategorySummary(itemsRaw) {
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];

  // Count unique (po, category) pairs
  const pairCounts = new Map(); // key: `${po}|${category}` -> number
  const grouped = new Map();    // po -> [{ category, count }]

  for (const it of items) {
    const po = it?.material_po?.po_number || "-";
    const category = it?.category_name || "-";
    const key = `${po}|${category}`;
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  }

  // Convert to arrays and grouped structure
  const pairs = [];
  for (const [key, count] of pairCounts.entries()) {
    const [po, category] = key.split("|");
    pairs.push({ po, category, count });
    if (!grouped.has(po)) grouped.set(po, []);
    grouped.get(po).push({ category, count });
  }

  // Sort nicely (by PO then category)
  pairs.sort((a, b) => (a.po > b.po ? 1 : a.po < b.po ? -1 : a.category.localeCompare(b.category)));
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

/* ---------------- component ---------------- */
export default function LogisticsDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-synced page
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(Number.isNaN(p) ? 1 : Math.max(1, p));
  }, [searchParams]);

  // search + rows per page
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // selection
  const [selected, setSelected] = useState([]);

  // fetch
  const { data: resp = {}, isLoading } = useGetLogisticsQuery({
    page: currentPage,
    pageSize: rowsPerPage,
    search: searchQuery,
    status: "",
    po_id: "",
  });

  // normalize
  const rows = useMemo(() => {
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp?.data)) return resp.data;
    return [];
  }, [resp]);

  const totalCount =
    resp?.total ?? resp?.meta?.total ?? (Array.isArray(resp?.data) ? resp.data.length : 0);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setSearchParams({ page: String(p) });
    setCurrentPage(p);
    setSelected([]); // clear selection on page change
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(rows.map((r) => r._id));
    else setSelected([]);
  };

  const handleRowSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      {/* Search / top controls */}
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
              setSearchParams({ page: "1" });
              setCurrentPage(1);
            }}
          />
        </FormControl>

        {/* Rows Per Page (right side) */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "flex-end", gap: 1 }}>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            Rows Per Page:
          </Typography>
          <Select
            size="sm"
            value={String(rowsPerPage)}
            onChange={(_, v) => {
              if (!v) return;
              setRowsPerPage(Number(v));
              setSearchParams({ page: "1" });
              setCurrentPage(1);
            }}
            sx={{ minWidth: 80 }}
          >
            <Option value="10">10</Option>
            <Option value="25">25</Option>
            <Option value="50">50</Option>
            <Option value="100">100</Option>
          </Select>
        </Box>
      </Box>

      {/* Table */}
      <Sheet
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
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                <Checkbox
                  size="sm"
                  checked={rows.length > 0 && selected.length === rows.length}
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  onChange={handleSelectAll}
                />
              </th>

              {[
                "Logistics Code",
                "Transportation PO",
                "PO Number with Item", // ← renamed
                "Vehicle No.",
                "Transport PO Value",
                "Total Weight",
                "Status",
              ].map((h, i) => (
                <th
                  key={i}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, textAlign: "center" }}>
                  <CircularProgress size="sm" />
                  <Typography level="body-sm" sx={{ mt: 1, fontStyle: "italic" }}>
                    Loading…
                  </Typography>
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => {
                // Transportation PO (from top-level po_id)
                const poNumbers = getPoNumbers(row);
                const firstPO = poNumbers[0] || "-";
                const extraPO = Math.max(0, poNumbers.length - 1);

                // Build "PO Number with Item" summary from items[*].material_po.po_number + category_name
                const { grouped, firstLabel, extraCount } = buildPoCategorySummary(row.items);

                const totalWeight =
                  row?.total_ton ??
                  (Array.isArray(row.items)
                    ? row.items.reduce((sum, it) => sum + (Number(it.weight) || 0), 0)
                    : "-");

                return (
                  <tr key={row._id}>
                    {/* checkbox */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(row._id)}
                        onChange={() => handleRowSelect(row._id)}
                      />
                    </td>

                    {/* Logistics Code (clickable) */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      <Link
                        underline="none"
                        sx={{ fontWeight: 600, cursor: "pointer" }}
                        onClick={() => navigate(`/logistics/${row._id}`)}
                      >
                        {safe(row.logistic_code)}
                      </Link>
                    </td>

                    {/* Transportation PO (first +N with tooltip full list) */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      <Tooltip
                        variant="soft"
                        placement="top-start"
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 700 }}>
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
                        <Box sx={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <Chip size="sm" variant="soft">
                            {firstPO}
                          </Chip>
                          {extraPO > 0 && (
                            <Chip size="sm" variant="outlined">
                              +{extraPO}
                            </Chip>
                          )}
                        </Box>
                      </Tooltip>
                    </td>

                    {/* PO Number with Item (from items: po_number + category_name, grouped) */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      <Tooltip
                        variant="soft"
                        placement="top-start"
                        title={
                          <Box sx={{ p: 0.5, maxWidth: 360 }}>
                            <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 700 }}>
                              POs & Categories
                            </Typography>
                            {grouped.size ? (
                              Array.from(grouped.entries()).map(([po, arr]) => (
                                <Box key={po} sx={{ mb: 0.5 }}>
                                  <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                                    {po}
                                  </Typography>
                                  {arr.map(({ category, count }, idx) => (
                                    <Typography key={idx} level="body-xs" sx={{ pl: 1 }}>
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
                        <Box sx={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <Typography level="body-sm">{safe(firstLabel)}</Typography>
                          {extraCount > 0 && (
                            <Chip size="sm" variant="outlined">
                              +{extraCount}
                            </Chip>
                          )}
                        </Box>
                      </Tooltip>
                    </td>

                    {/* Vehicle No. */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      {safe(row.vehicle_number)}
                    </td>

                    {/* Transport PO Value */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      {formatINR(row.total_transport_po_value)}
                    </td>

                    {/* Total Weight */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      {safe(totalWeight)}
                    </td>

                    {/* Status */}
                    <td style={{ borderBottom: "1px solid #ddd", padding: 8, textAlign: "center" }}>
                      <Chip size="sm" variant="soft">
                        {safe(row.status)}
                      </Chip>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: 16, textAlign: "center" }}>
                  <Typography level="body-sm" sx={{ fontStyle: "italic" }}>
                    No Logistics Found
                  </Typography>
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

        <Box>Showing {rows.length} results</Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
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
