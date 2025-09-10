import * as React from "react";
import {
  Card,
  Box,
  Typography,
  Avatar,
  Table,
  Sheet,
  IconButton,
} from "@mui/joy";
import { ChevronDown, ChevronUp } from "lucide-react";

// Helper: safe percent
const pct = (completed, assigned) =>
  assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

const SortIcon = ({ dir }) =>
  dir === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;

/**
 * Props:
 *  - rows: [{ name, avatar, assigned, completed }]
 *  - title?: string
 *  - initialSort?: { key: "completion" | "assigned" | "completed" | "name", dir: "desc" | "asc" }
 */
export default function TeamLeaderboard({
  rows = [],
  title = "Team Leaderboard",
  initialSort = { key: "completion", dir: "desc" },
  sx = {},
}) {
  const [sort, setSort] = React.useState(initialSort);

  const data = React.useMemo(() => {
    // enrich with computed completion
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

    // add rank after sorting
    return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, sort]);

  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" }
    );
  };

  const headerCell = (label, key, align = "left") => (
    <th
      onClick={() => handleSort(key)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        textAlign: align,
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
        maxHeight: "500px",
        overflowY: "auto",
        height: "500px",
        gap: 0,
        overflowY: "auto",
      }}
    >
      <Typography level="title-md" sx={{ color: "#0f172a", mb: 1 }}>
        {title}
      </Typography>

      <Sheet
        variant="plain"
        sx={{
          bgcolor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <Table
          borderAxis="none"
          stickyHeader
          sx={{
            "--TableCell-paddingY": "10px",
            "--TableCell-paddingX": "16px",
            "--Table-headerUnderlineThickness": "0px",
            "--TableRow-hoverBackground": "rgba(2,6,23,0.02)",
            "& thead th": {
              bgcolor: "#fff",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              position: "sticky",
              top: 0,
              zIndex: 1,
            },
            "& tbody tr:not(:last-of-type) td": {
              borderBottom: "1px solid rgba(15,23,42,0.06)",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 56, padding: "12px 16px", color: "#0f172a" }}>
                #
              </th>
              {headerCell("Name", "name")}
              {headerCell("Assigned Tasks", "assigned", "right")}
              {headerCell("Completed Tasks", "completed", "right")}
              {headerCell("Completion %", "completion", "right")}
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

                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Typography level="body-sm">{r.assigned ?? 0}</Typography>
                </td>

                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Typography level="body-sm">{r.completed ?? 0}</Typography>
                </td>

                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                    {r.completion}%
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </Card>
  );
}
