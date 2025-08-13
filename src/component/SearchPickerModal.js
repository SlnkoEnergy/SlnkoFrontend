import React, { useEffect, useRef, useState } from "react";
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
  backdropSx = { backdropFilter: "none", bgcolor: "rgba(0,0,0,0.1)" },
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [debounced, open]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!open || !fetchPageRef.current) return;
      setLoading(true);
      try {
        const { rows: r = [], total: t = 0 } = await fetchPageRef.current({
          page,
          search: debounced,
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
  }, [open, page, debounced]);

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: backdropSx } }}
      sx={{
        ml:{xs:"0%", lg:"18%", xl:"8%"},
        mb:{xs:"0%", lg:"3%", xl:"3%"}
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
          }}
        >
          <Box sx={{ width: "full" }} />
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
              sx={{ minWidth: 90, textAlign: "right" }}
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
                  <td colSpan={columns.length}>
                    <Box sx={{ p: 2, color: "neutral.500" }}>
                      No records found.
                    </Box>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r[rowKey] ?? JSON.stringify(r)}
                    style={{ cursor: "pointer" }}
                    onClick={() => onPick?.(r)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "")
                    }
                  >
                    {columns.map((c) => (
                      <td key={c.key} style={{ width: c.width ?? "auto" }}>
                        {String(r[c.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>

        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1.5 }}>
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
        </Box>
      </ModalDialog>
    </Modal>
  );
}
