// src/pages/PayRequestByVendor.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Sheet,
  Typography,
  Input,
  Table,
  Chip,
  Select,
  Option,
  CircularProgress,
  Stack,
} from "@mui/joy";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { useSearchParams } from "react-router-dom";
import { useGetPayRequestByVendorQuery } from "../redux/paymentsSlice";

// utils
const formatINR = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (!Number.isFinite(num)) return String(v);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (isoOrYmd) => {
  if (!isoOrYmd) return "—";
  const date = new Date(isoOrYmd);
  if (isNaN(date)) return isoOrYmd;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PayRequestByVendor = ({ vendor }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Number(searchParams.get("page") || 1);
  const limitParam = Number(searchParams.get("limit") || 10);
  const searchParam = searchParams.get("search") || "";

  // local state mirrors URL (for controlled inputs)
  const [page, setPage] = useState(pageParam);
  const [limit, setLimit] = useState(limitParam);
  const [search, setSearch] = useState(searchParam);

  // keep URL in sync when local changes
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    next.set("limit", String(limit));
    if (search) next.set("search", search);
    else next.delete("search");
    if (vendor) next.set("vendor", vendor);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, vendor]);

  const { data, isLoading, isFetching, isError, error } =
    useGetPayRequestByVendorQuery(
      { vendor, page, limit, search },
      { skip: !vendor } // require vendor
    );

  const rows = useMemo(() => data?.data ?? [], [data]);

  const formatPayId = (s) => {
    if (!s) return "—";
    // remove the last "/segment"
    return s.replace(/\/[^/]*$/, "");
  };

  // ---------- pagination helpers ----------
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = page;
  const perPage = limit;

  const startIndex = total ? (currentPage - 1) * perPage + 1 : 0;
  const endIndex = Math.min(currentPage * perPage, total);

  const handlePageChange = (newPage) => {
    if (!Number.isFinite(newPage)) return;
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handlePerPageChange = (newValue) => {
    if (!newValue) return;
    setPage(1);
    setLimit(newValue);
  };

  const getPaginationRange = () => {
    const delta = 1; // neighbors on each side
    const pages = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };
  // ----------------------------------------

  return (
    <Box p={2}>
      <Sheet
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: "12px",
          boxShadow: "sm",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Controls */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          flexWrap="wrap"
        >
          <Stack direction="row" gap={1} alignItems="center">
            <Input
              size="sm"
              placeholder="Search PO/UTR/Project..."
              value={search}
              onChange={(e) => {
                setPage(1); // reset page on new search
                setSearch(e.target.value);
              }}
              sx={{ width: 260 }}
            />
          </Stack>
        </Stack>

        {/* Table */}
        <Sheet
          variant="soft"
          sx={{
            borderRadius: "10px",
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "60vh",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
          }}
        >
          <Table
            borderAxis="both"
            stickyHeader
            sx={{
              minWidth: 900,
              "& thead": {
                backgroundColor: "neutral.softBg",
              },
              "& th, & td": {
                textAlign: "left",
                px: 1.5,
                py: 1,
                verticalAlign: "middle",
                whiteSpace: "normal",
                wordBreak: "break-word",
              },
            }}
          >
            <thead>
              <tr>
                <th>Project Code</th>
                <th>PO Number</th>
                <th>Debit Date</th>
                <th>PO Value (incl. GST)</th>
                <th>Amount Paid</th>
                <th>Paid For</th>
                <th>UTR</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <Stack direction="row" gap={1} alignItems="center" p={2}>
                      <CircularProgress size="sm" />
                      <Typography level="body-sm">Loading…</Typography>
                    </Stack>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <Typography level="body-sm" color="danger" p={2}>
                      Failed to load:{" "}
                      {error?.data?.message || error?.error || "Unknown error"}
                    </Typography>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <Typography level="body-sm" p={2}>
                      No results.
                    </Typography>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <Typography level="body-sm" fontWeight="lg">
                        {formatPayId(r.pay_id)}
                      </Typography>
                    </td>

                    <td>
                      <Typography level="body-sm" fontWeight="md">
                        {r.po_number || "—"}
                      </Typography>
                    </td>

                    <td>
                      <Chip size="sm" variant="soft" color="neutral">
                        {formatDate(r.dbt_date)}
                      </Chip>
                    </td>

                    <td>{formatINR(r.po_value)}</td>
                    <td>{formatINR(r.amount_paid)}</td>
                    <td>{r.paid_for || "—"}</td>
                    <td>
                      {r.utr ? (
                        <Chip size="sm" variant="soft" color="success">
                          {r.utr}
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="soft" color="warning">
                          Not Available
                        </Chip>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>

        {/* Footer: pagination + info (custom block) */}
        <Box
          className="Pagination-laptopUp"
          sx={{
            pt: 2,
            gap: 1,
            [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<KeyboardArrowLeftIcon />}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
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
            {getPaginationRange()?.map((p, idx) =>
              p === "..." ? (
                <Box key={`ellipsis-${idx}`} sx={{ px: 1 }}>
                  ...
                </Box>
              ) : (
                <IconButton
                  key={p}
                  size="sm"
                  variant={p === currentPage ? "solid" : "outlined"}
                  color="neutral"
                  onClick={() => handlePageChange(p)}
                  disabled={isFetching}
                >
                  {p}
                </IconButton>
              )
            )}
          </Box>

          <FormControl size="sm" sx={{ minWidth: 80 }}>
            <Select value={perPage} onChange={(_, v) => handlePerPageChange(v)}>
              {[10, 30, 60, 100].map((num) => (
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
            disabled={currentPage === totalPages || isFetching}
          >
            Next
          </Button>
        </Box>
      </Sheet>
    </Box>
  );
};

export default PayRequestByVendor;
