import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Sheet,
  Box,
  Input,
  Button,
  Typography,
  Table,
  IconButton,
  CircularProgress,
  Divider,
  Checkbox,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

function useDebounce(val, delay = 400) {
  const [v, setV] = useState(val);
  useEffect(() => {
    const id = setTimeout(() => setV(val), delay);
    return () => clearTimeout(id);
  }, [val, delay]);
  return v;
}

export default function SearchPickerModal({
  open,
  onClose,
  onPick,
  title = "Search",
  columns = [{ key: "name", label: "Name" }],
  fetchPage,
  searchKey = "name",
  pageSize = 7,
  rowKey = "_id",

  // NEW props
  multi = false,                 // enable multi-select
  showSubmit = false,            // show/hide submit button
  onSubmit,                      // callback on submit
  submitLabel = "Submit",        // submit button label

  backdropSx = { backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" },
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // selected ids (persist across pages)
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  // reset when (re)opening
  useEffect(() => {
    if (!open) return;
    setPage(1);
    setSelectedIds([]);
    setSearch("");
  }, [open]);

  // refetch when search changes
  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [debounced, open]);

  // fetch
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!open || !fetchPageRef.current) return;
      setLoading(true);
      try {
        const { rows: r = [], total: t = 0 } = await fetchPageRef.current({
          page,
          search: debounced,
          pageSize,
        });
        if (!cancelled) {
          setRows(r);
          setTotal(t);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [open, page, debounced, pageSize]);

  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = end < total;

  const LoadingOverlay = (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.level1",
        opacity: 0.6,
      }}
    >
      <CircularProgress />
    </Box>
  );

  const isSelected = (id) => selectedIds.includes(id);

  const toggleSelect = (row) => {
    const id = row?.[rowKey];
    if (id == null) return;
    if (multi) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleRowClick = (row) => {
    if (multi) {
      // only toggle in multi mode
      toggleSelect(row);
      onPick?.(row);
    } else {
      // single-pick: behave exactly like before
      toggleSelect(row);
      onPick?.(row);
      onClose?.();
    }
  };



  const currentPageIds = useMemo(
    () => rows.map((r) => r?.[rowKey]).filter(Boolean),
    [rows, rowKey]
  );

  const allOnPageSelected =
    multi &&
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const someOnPageSelected =
    multi &&
    currentPageIds.some((id) => selectedIds.includes(id)) &&
    !allOnPageSelected;

  const toggleSelectAllOnPage = () => {
    if (!multi) return;
    if (allOnPageSelected) {
      // unselect all on current page
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // select all on current page (merge)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleSubmit = () => {
    if (!multi || !showSubmit) return;
    const selectedRowsFull = rowsFromIds(selectedIds, rowKey, rows, fetchPageRef);
    onSubmit?.({ ids: selectedIds, rows: selectedRowsFull });
    // do not auto-close; parent can close after API call
  };

  // Try to return full rows for currently visible items first; parent still gets ids
  function rowsFromIds(ids, key, visibleRows, fetchRef) {
    const dict = new Map(visibleRows.map((r) => [r?.[key], r]));
    return ids.map((id) => dict.get(id)).filter(Boolean);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: backdropSx } }}
      sx={{
        ml: { xs: "0%", lg: "18%", xl: "8%" },
        mb: { xs: "0%", lg: "3%", xl: "3%" },
      }}
    >
      <ModalDialog size="lg" variant="outlined" sx={{ minWidth: 840 }}>
        <ModalClose />
        <Typography level="title-md">{title}</Typography>
        <Divider />

        {/* Header: search + pagination */}
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Input
            placeholder={`Search by ${searchKey}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchRoundedIcon />}
            sx={{ flex: 1, minWidth: 280 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              level="body-sm"
              sx={{ minWidth: 100, textAlign: "right" }}
            >
              {start}-{end} / {total}
            </Typography>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Table with fixed-height body */}
        <Sheet
          variant="outlined"
          sx={{
            mt: 1.5,
            position: "relative",
            borderRadius: "sm",
            overflow: "hidden",
          }}
        >
          {loading && LoadingOverlay}
          <Table
            borderAxis="bothBetween"
            stickyHeader
            sx={{
              "& thead th": { bgcolor: "background.level1" },
              "& tbody": { display: "block", maxHeight: 320, overflow: "auto" },
              "& thead, & tbody tr": {
                display: "table",
                tableLayout: "fixed",
                width: "100%",
              },
            }}
          >
            <thead>
              <tr>
                {multi && (
                  <th style={{ width: 44 }}>
                    <Checkbox
                      checked={allOnPageSelected}
                      indeterminate={someOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                    />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.key} style={{ width: c.width ?? "auto" }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={(multi ? 1 : 0) + columns.length}>
                    <Box sx={{ p: 2, color: "neutral.500" }}>
                      No records found.
                    </Box>
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const id = r?.[rowKey] ?? JSON.stringify(r);
                  const selected = isSelected(r?.[rowKey]);
                  return (
                    <tr
                      key={id}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selected ? "#e0e0e0" : "",
                      }}
                      onClick={() => handleRowClick(r)}
                      onMouseEnter={(e) => {
                        if (!selected)
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }}
                      onMouseLeave={(e) => {
                        if (!selected)
                          e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {multi && (
                        <td
                          style={{ width: 44 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected}
                            onChange={() => toggleSelect(r)}
                          />
                        </td>
                      )}
                      {columns.map((c) => (
                        <td key={c.key} style={{ width: c.width ?? "auto" }}>
                          {typeof c.render === "function"
                            ? c.render(r)
                            : String(r?.[c.key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Sheet>

        <Box
          sx={{
            display: "flex",
            justifyContent: showSubmit && multi ? "space-between" : "flex-start",
            alignItems: "center",
            mt: 1.5,
            gap: 1,
          }}
        >
          <Button
            variant="solid"
            onClick={onClose}
            sx={{
              backgroundColor: "#214b7b",
              color: "#fff",
              "&:hover": { backgroundColor: "#1a3b63" },
            }}
          >
            Close
          </Button>

          {showSubmit && multi && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography level="body-sm" sx={{ color: "neutral.600" }}>
                Selected: {selectedIds.length}
              </Typography>
              <Button
                variant="solid"
                color="primary"
                onClick={handleSubmit}
                disabled={selectedIds.length === 0}
              >
                {submitLabel}
              </Button>
            </Box>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
}
