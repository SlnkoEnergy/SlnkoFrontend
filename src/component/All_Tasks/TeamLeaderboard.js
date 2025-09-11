import * as React from "react";
import {
  Card,
  Box,
  Typography,
  Avatar,
  Table,
  Sheet,
  IconButton,
  Input,
} from "@mui/joy";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";

// Helper: safe percent
const pct = (completed, assigned) =>
  assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

const SortIcon = ({ dir }) =>
  dir === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;


export default function TeamLeaderboard({
  rows = [],
  title = "Team Leaderboard",
  initialSort = { key: "completion", dir: "desc" },
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search user by name…",
  sx = {},
}) {
  const [sort, setSort] = React.useState(initialSort);

  const data = React.useMemo(() => {
    const withPct = rows.map((r) => ({
      ...r,
      completion: pct(r.completed ?? 0, r.assigned ?? 0),
    }));

    const sorted = [...withPct].sort((a, b) => {
      const { key, dir } = sort;
      let va = a[key];
      let vb = b[key];

      // case-insensitive sort for names
      if (key === "name") {
        va = (va || "").toString().toLowerCase();
        vb = (vb || "").toString().toLowerCase();
      }

      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;

      // stable tie-breaker by name
      const na = (a.name || "").toLowerCase();
      const nb = (b.name || "").toLowerCase();
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    });

    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, sort]);

  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" }
    );
  };

  const headerCell = (label, key) => (
    <th
      onClick={() => handleSort(key)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        textAlign: "left",
        padding: "12px 16px",
        fontWeight: 700,
        color: "#0f172a",
      }}
    >
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        {label}
        {sort.key === key && <SortIcon dir={sort.dir} />}
      </Box>
    </th>
  );

  return (
    <Card
      variant="soft"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        p: { xs: 1, sm: 0.5, md: 1.5 },
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow:
          "0 2px 6px rgba(15,23,42,0.06), 0 18px 32px rgba(15,23,42,0.06)",
        transition: "transform .16s ease, box-shadow .16s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 6px 16px rgba(15,23,42,0.10), 0 20px 36px rgba(15,23,42,0.08)",
        },
        height:'500px',
        ...sx,
      }}
    >
      {/* Header row with Title + Search */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          mb: 1,
          gap: 1,
        }}
      >
        <Typography level="title-md" sx={{ color: "#0f172a" }}>
          {title}
        </Typography>

        <Input
          size="sm"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          startDecorator={<SearchIcon fontSize="small" />}
          endDecorator={
            !!searchValue && (
              <IconButton
                size="sm"
                variant="plain"
                onClick={() => onSearchChange?.("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </IconButton>
            )
          }
          sx={{ maxWidth: 280, bgcolor: "#fff" }}
        />
      </Box>

      {/* Make THIS the scroll container so sticky headers work + scrollbar appears */}
      <Box
        sx={{
          maxHeight: 420, // adjust as you like
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Sheet variant="plain" sx={{ bgcolor: "#fff" }}>
          <Table
            borderAxis="none"
            stickyHeader
            sx={{
              "--TableCell-paddingY": "10px",
              "--TableCell-paddingX": "16px",
              "--Table-headerUnderlineThickness": "0px",
              "--TableRow-hoverBackground": "rgba(2,6,23,0.02)",
              "& thead th": {
                textAlign: "left",
                bgcolor: "#fff",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                position: "sticky",
                top: 0,
                zIndex: 1,
              },
              "& tbody td": {
                textAlign: "left",
              },
              "& tbody tr:not(:last-of-type) td": {
                borderBottom: "1px solid rgba(15,23,42,0.06)",
              },
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ width: 56, padding: "12px 16px", color: "#0f172a" }}
                >
                  #
                </th>
                {headerCell("Name", "name")}
                {headerCell("Assigned Tasks", "assigned")}
                {headerCell("Completed Tasks", "completed")}
                {headerCell("Delayed Tasks", "delayed")}
                {headerCell("Completion %", "completion")}
              </tr>
            </thead>

            <tbody>
              {data.map((r) => (
                <tr key={r.name}>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    {r.rank}
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={r.avatar} size="sm">
                        {r.name?.[0]}
                      </Avatar>
                      <Typography
                        level="body-sm"
                        sx={{ color: "#0f172a", fontWeight: 600 }}
                      >
                        {r.name}
                      </Typography>
                    </Box>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Typography level="body-sm">{r.assigned ?? 0}</Typography>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Typography level="body-sm">{r.completed ?? 0}</Typography>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Typography level="body-sm">{r.delayed ?? 0}</Typography>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                      {r.completion}%
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Box>
    </Card>
  );
}
