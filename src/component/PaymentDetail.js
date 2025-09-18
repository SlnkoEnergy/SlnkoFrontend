import React, { forwardRef, useEffect, useMemo, useState, Fragment } from "react";
import {
  Box,
  Button,
  Sheet,
  Typography,
  Chip,
  Checkbox,
  Alert,
  LinearProgress,
  Tooltip,
  Input,
  IconButton,
  Select,
  Option,
  Stack,
} from "@mui/joy";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import Axios from "../utils/Axios";

/* tiny debounce hook */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

const PaymentDetail = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState("");
  const [success, setSuccess] = useState("");
  const [downloading, setDownloading] = useState(false);

  // server pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(200);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 400);

  const headerCellSx = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    bgcolor: "background.level1",
    textAlign: "left",
    p: "8px 12px",
    borderBottom: "1px solid",
    borderColor: "divider",
    fontWeight: 700,
  };
  const cellSx = {
    p: "6px 12px",
    borderBottom: "1px solid",
    borderColor: "divider",
    verticalAlign: "middle",
    maxWidth: 260,
  };

  const fetchRows = async ({ showSpinner = true } = {}) => {
    try {
      showSpinner ? setLoading(true) : setFetching(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const { data: resp } = await Axios.get("/get-exceldata", {
        params: {
          status: "Not-paid",
          page,
          limit,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        },
        headers: { "x-auth-token": token },
      });

      const rows = Array.isArray(resp?.data) ? resp.data : [];
      setData(rows);
      // backend shape: { page, limit, total, pages }
      setTotal(Number(resp?.total || rows.length || 0));
      setPages(Number(resp?.pages || 1));

      // prune selections that are no longer on this page
      setSelectedRows((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  // initial + whenever page/limit/search changes
  useEffect(() => {
    fetchRows({ showSpinner: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  const handleCheckboxChange = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  const allSelectableIds = useMemo(
    () => data.filter((r) => r.status === "Not-paid").map((r) => r.id),
    [data]
  );
  const allSelectedOnPage = allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedRows.includes(id));
  const someSelectedOnPage = allSelectableIds.some((id) => selectedRows.includes(id));

  const toggleSelectAllPage = () => {
    setSelectedRows((prev) => {
      if (allSelectedOnPage) {
        return prev.filter((id) => !allSelectableIds.includes(id));
      }
      // add all on page
      const set = new Set(prev);
      allSelectableIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

const escapeValue = (value, isAccountNumber = false) => {
  if (value === null || value === undefined || value === "") return "-";
  const s = String(value).replace(/"/g, '""');
  return isAccountNumber ? `'${s}` : s;
};

const downloadSelectedRows = async () => {
    setError("");
    setSuccess("");

    const selectedData = data.filter(
      (row) => selectedRows.includes(row.id) && row.status === "Not-paid"
    );

    if (selectedData.length === 0) {
      setError("No rows available with status 'Not-paid' to download.");
      return;
    }

    try {
      setDownloading(true);

      // bulk update to Deleted
      const token = localStorage.getItem("authToken");
      await Axios.put(
        "/update-excel",
        { ids: selectedData.map((r) => r.id), newStatus: "Deleted" },
        { headers: { "x-auth-token": token } }
      );

      // build CSV (backend already formatted dbt_date/comment)
      const headers = [
        "Debit Ac No",
        "Beneficiary Ac No",
        "Beneficiary Name",
        "Amt",
        "Pay Mod",
        "Date",
        "IFSC",
        "Payable Location",
        "Print Location",
        "Bene Mobile No.",
        "Bene Email ID",
        "Bene add1",
        "Bene add2",
        "Bene add3",
        "Bene add4",
        "Add Details 1",
        "Add Details 2",
        "Add Details 3",
        "Add Details 4",
        "Add Details 5",
        "Remarks",
      ];

      const csvContent =
        [headers.join(",")] +
        "\n" +
        selectedData
          .map((row) =>
            [
              escapeValue(row.debitAccount, true),
              escapeValue(row.acc_number, true),
              escapeValue(row.benificiary),
              escapeValue(row.amount_paid),
              escapeValue(row.pay_mod),
              escapeValue(row.dbt_date),
              escapeValue(row.ifsc),
              escapeValue(row.payable_location),
              escapeValue(row.print_location),
              escapeValue(row.bene_mobile_no),
              escapeValue(row.bene_email_id),
              escapeValue(row.bene_add1),
              escapeValue(row.bene_add2),
              escapeValue(row.bene_add3),
              escapeValue(row.bene_add4),
              escapeValue(row.add_details_1),
              escapeValue(row.add_details_2),
              escapeValue(row.add_details_3),
              escapeValue(row.add_details_4),
              escapeValue(row.add_details_5),
              escapeValue(row.comment),
            ].join(",")
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Payment-Bank-Detail.csv";
      link.click();

      // Optimistic UI: remove updated rows from current page
      const pageAfterRemoval = data.filter((row) => !selectedRows.includes(row.id));
      setData(pageAfterRemoval);
      setSelectedRows([]);

      // also reduce client total count (server will reflect on next refetch)
      setTotal((t) => Math.max(0, t - selectedData.length));
      setSuccess("File downloaded successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update data. Please try again later."
      );
    } finally {
      setDownloading(false);
    }
  };

  const selectedCount = selectedRows.filter((id) => data.some((r) => r.id === id && r.status === "Not-paid")).length;

  if (loading) {
    return (
      <Sheet
        variant="soft"
        sx={{ mx: { xl: "15%", lg: "18%" }, maxWidth: { lg: "85%", sm: "100%" }, p: 2, borderRadius: "lg" }}
      >
        <Typography level="title-md" mb={1}>Loading payments…</Typography>
        <LinearProgress size="sm" />
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet
        variant="soft" color="danger"
        sx={{ mx: { xl: "15%", lg: "18%" }, maxWidth: { lg: "85%", sm: "100%" }, p: 2, borderRadius: "lg" }}
      >
        <Alert color="danger" variant="soft">{error}</Alert>
      </Sheet>
    );
  }

  return (
    <Box sx={{ marginLeft: { xl: "15%", lg: "18%" }, maxWidth: { lg: "85%", sm: "100%" } }} ref={ref}>
      {/* Top toolbar */}
      <Sheet
        variant="outlined"
        sx={{
          p: 1.5, mb: 1, borderRadius: "lg",
          display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 1,
          position: "sticky", top: 0, zIndex: 10,
          backdropFilter: "saturate(180%) blur(6px)", bgcolor: "background.body",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography level="title-md">Payment Bank Export</Typography>
          <Chip variant="soft" color="neutral" size="sm" sx={{ mr: 0.5 }}>
            Not-paid: {total}
          </Chip>
          <Chip variant="soft" color={selectedCount > 0 ? "primary" : "neutral"} size="sm">
            Selected: {selectedCount}
          </Chip>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
          <Input
            size="sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search vendor / PO / IFSC / UTR…"
            sx={{ minWidth: 260 }}
            endDecorator={
              search ? (
                <IconButton size="sm" variant="plain" onClick={() => { setSearch(""); setPage(1); }}>
                  <ClearRoundedIcon />
                </IconButton>
              ) : null
            }
          />
          <Select
            size="sm"
            value={String(limit)}
            onChange={(_, v) => { setLimit(Number(v)); setPage(1); }}
            sx={{ minWidth: 120 }}
          >
            <Option value="50">Rows: 50</Option>
            <Option value="100">Rows: 100</Option>
            <Option value="200">Rows: 200</Option>
            <Option value="500">Rows: 500</Option>
          </Select>
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => fetchRows({ showSpinner: false })}
            disabled={fetching}
            title="Refetch"
          >
            <ReplayRoundedIcon />
          </IconButton>
          <Button
            variant="solid"
            color="success"
            onClick={downloadSelectedRows}
            disabled={downloading || selectedCount === 0}
            sx={{ minWidth: 190 }}
          >
            {downloading ? "Preparing CSV…" : "Download CSV File"}
          </Button>
        </Stack>
      </Sheet>

      {/* Success / Info banners */}
      <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
        {success ? <Alert color="success" variant="soft">{success}</Alert> : null}
        {payments ? <Alert color="neutral" variant="soft">{payments}</Alert> : null}
      </Box>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: "lg", overflow: "auto", "--Table-headerUnderlineThickness": "1px" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 1200,
            "& thead th": headerCellSx,
            "& tbody td": cellSx,
            "& tbody tr:hover": { bgcolor: "background.level1" },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 90 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    size="sm"
                    indeterminate={!allSelectedOnPage && someSelectedOnPage}
                    checked={allSelectedOnPage}
                    onChange={toggleSelectAllPage}
                  />
                  {/* <Typography level="body-sm" fontWeight={700}>Select</Typography> */}
                </Stack>
              </th>
              <th>Debit Ac No</th>
              <th>Beneficiary Ac No</th>
              <th>Beneficiary Name</th>
              <th>Amt</th>
              <th>Pay Mod</th>
              <th>Date</th>
              <th>IFSC</th>
              <th>Payable Location</th>
              <th>Print Location</th>
              <th>Bene Mobile No.</th>
              <th>Bene Email ID</th>
              <th>Bene add1</th>
              <th>Bene add2</th>
              <th>Bene add3</th>
              <th>Bene add4</th>
              <th>Add Details 1</th>
              <th>Add Details 2</th>
              <th>Add Details 3</th>
              <th>Add Details 4</th>
              <th>Add Details 5</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isSelected = selectedRows.includes(row.id);

              const Cell = ({ children }) => (
                <td>
                  {typeof children === "string" || typeof children === "number" ? (
                    <Tooltip
                      title={String(children || "").trim() || "-"}
                      placement="top"
                      variant="outlined"
                    >
                      <Typography level="body-sm">{children || "-"}</Typography>
                    </Tooltip>
                  ) : (
                    <Fragment>{children}</Fragment>
                  )}
                </td>
              );

              return (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "var(--joy-palette-background-level1)" : "transparent",
                  }}
                >
                  <td>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(row.id)}
                      variant={isSelected ? "solid" : "outlined"}
                      color={isSelected ? "primary" : "neutral"}
                      size="sm"
                    />
                  </td>
                  <Cell>{row.debitAccount}</Cell>
                  <Cell>{row.acc_number}</Cell>
                  <Cell>{row.benificiary}</Cell>
                  <Cell>
                    <Chip size="sm" variant="soft" color="primary">
                      {row.amount_paid}
                    </Chip>
                  </Cell>
                  <Cell>
                    <Chip size="sm" variant="soft" color={row.pay_mod === "R" ? "warning" : "success"}>
                      {row.pay_mod}
                    </Chip>
                  </Cell>
                  <Cell>{row.dbt_date}</Cell>
                  <Cell>{row.ifsc}</Cell>
                  <Cell>{row.payable_location}</Cell>
                  <Cell>{row.print_location}</Cell>
                  <Cell>{row.bene_mobile_no}</Cell>
                  <Cell>{row.bene_email_id}</Cell>
                  <Cell>{row.bene_add1}</Cell>
                  <Cell>{row.bene_add2}</Cell>
                  <Cell>{row.bene_add3}</Cell>
                  <Cell>{row.bene_add4}</Cell>
                  <Cell>{row.add_details_1}</Cell>
                  <Cell>{row.add_details_2}</Cell>
                  <Cell>{row.add_details_3}</Cell>
                  <Cell>{row.add_details_4}</Cell>
                  <Cell>{row.add_details_5}</Cell>
                  <Cell>
                    <Tooltip
                      title={row.comment || "-"}
                      placement="top"
                      variant="outlined"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            borderRadius: 0,
                            p: 0.75,
                            bgcolor: "background.body",
                            borderColor: "neutral.outlinedBorder",
                            maxWidth: 360,
                            whiteSpace: "normal",
                          },
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", minHeight: 32 }}>
                        <Typography
                          level="body-sm"
                          noWrap
                          sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {row.comment || "-"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination footer */}
      <Sheet
        variant="soft"
        sx={{
          mt: 1, p: 1,
          borderRadius: "lg",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography level="body-sm">
          Showing <b>{data.length}</b> of <b>{total}</b> Not-paid
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => setPage(1)}
            disabled={page <= 1}
          >
            <FirstPageRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <NavigateBeforeRoundedIcon />
          </IconButton>

          <Typography level="body-sm" sx={{ mx: 1 }}>
            Page <b>{page}</b> / <b>{pages}</b>
          </Typography>

          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            <NavigateNextRoundedIcon />
          </IconButton>
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => setPage(pages)}
            disabled={page >= pages}
          >
            <LastPageRoundedIcon />
          </IconButton>
        </Stack>
      </Sheet>
    </Box>
  );
});

export default PaymentDetail;
