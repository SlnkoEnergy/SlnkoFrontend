// pages/Approval_Dashboard.jsx
import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Sheet,
  Typography,
  Skeleton,
} from "@mui/joy";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useGetUniqueModelQuery } from "../../redux/ApprovalsSlice";
import { useNavigate } from "react-router-dom";

const Grid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gap: 1.5,
      gridTemplateColumns: {
        xs: "1fr",
        sm: "1fr 1fr",
        lg: "1fr 1fr 1fr",
        xl: "1fr 1fr 1fr 1fr",
      },
    }}
  >
    {children}
  </Box>
);

function resolveTitle(model) {
  return (
    model?.title ??
    model?.model_name ??
    model?.name ??
    (typeof model === "string" ? model : "Untitled")
  );
}

function resolveCount(model) {
  const n = model?.to_review ?? model?.count ?? model?.pending ?? 0;
  return Number(n) || 0;
}

function resolveName(model) {
  return (
    model?.name ?? model?.model_name ?? (typeof model === "string" ? model : "")
  );
}

function ModelCard({ model, onNewRequest, onOpenList }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const title = resolveTitle(model);
  const toReview = resolveCount(model);
  const modelName = resolveName(model);
  const imgSrc = model?.icon;
  console.log({ model });
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "md",
        boxShadow: "xs",
        p: 1.5,
        cursor: "pointer",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        willChange: "transform",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "lg",
          borderColor: "neutral.outlinedHoverBorder",
        },
        // Respect reduced motion
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
      // onClick={() => navigate(`/my_requests?dependency_model=${model?.name}`)}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
          cursor: "pointer",
        }}
      >
        {/* Icon */}
        <Sheet
          variant="soft"
          color="neutral"
          sx={{
            width: 100,
            height: 100,
            borderRadius: "md",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            overflow: "hidden",
            transition: "transform 220ms ease",
            "&:hover": { transform: "scale(1.04)" },
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          {imgSrc ? (
            <Box
              component="img"
              src={imgSrc}
              alt={title}
              sx={{
                width: 32,
                height: 32,
                objectFit: "contain",
                transition: "transform 220ms ease",
                // a tiny image zoom on parent hover too
                [".MuiCard-root:hover &"]: { transform: "scale(1.06)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }}
            />
          ) : (
            <FactCheckIcon fontSize="small" />
          )}
        </Sheet>

        {/* Content */}
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 5,
            width: "100%",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              level="title-sm"
              sx={{
                mb: 0.75,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Button
              size="sm"
              variant="solid"
              onClick={() => onNewRequest?.(modelName)}
              sx={{
                textTransform: "none",
                borderRadius: "sm",
                px: 1.25,
                py: 0.25,
                fontWeight: 600,
                width: "140px",
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                transition: "transform 160ms ease, background-color 160ms ease",
                [".MuiCard-root:hover &"]: { transform: "translateY(-1px)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }}
            >
              New Request
            </Button>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={() => onOpenList?.(modelName)}
              sx={{
                textTransform: "none",
                borderRadius: "sm",
                px: 1.25,
                py: 0.25,
                fontWeight: 600,
                width: "140px",
                transition: "transform 160ms ease, background-color 160ms ease",
                [".MuiCard-root:hover &"]: { transform: "translateY(-1px)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }}
            >
              {`To Review: ${toReview}`}
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}

export default function Approval_Dashboard() {
  const { data: getUniqueModel } = useGetUniqueModelQuery();
  const navigate = useNavigate();

  // raw API response
  const raw = getUniqueModel ?? {};

  // turn map into array of { name, to_review }
  const items = Object.entries(raw).map(([name, count]) => ({
    name,
    slug: name,
    title: prettify(name),
    to_review: count,
  }));

  const onNewRequest = (model) => {
    navigate(
      `/approvals/new?model=${encodeURIComponent(model?.slug || model?.name)}`
    );
  };

  const onOpenList = (model) => {
    navigate(`/my_approvals?dependency_model=${model}&status=pending`);
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Grid container spacing={2}>
        {items.map((m, idx) => (
          <Grid key={m.name} xs={12} sm={6} md={4}>
            <ModelCard
              model={m}
              onNewRequest={onNewRequest}
              onOpenList={onOpenList}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function prettify(key = "") {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());
}
