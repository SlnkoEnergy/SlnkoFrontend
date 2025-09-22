// pages/Approval_Dashboard.jsx
import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Sheet,
  Typography,
  Skeleton,
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCircleIcon from "@mui/icons-material/AddCircle";
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

const CardSkeleton = () => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: "xl",
      boxShadow: "sm",
      p: 1.5,
    }}
  >
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" level="title-md" width="60%" />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Skeleton variant="rectangular" width={120} height={32} />
          <Skeleton variant="rectangular" width={120} height={32} />
        </Box>
      </Box>
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
  </Card>
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
  return model?.name ?? model?.model_name ?? (typeof model === "string" ? model : "");
}

function ModelCard({ model, onNewRequest, onOpenList }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const title = resolveTitle(model);
  const toReview = resolveCount(model);
  const modelName = resolveName(model);
  const imgSrc = model?.icon;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "md",
        boxShadow: "xs",
        p: 1.5,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
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
          }}
        >
          {imgSrc ? (
            <Box
              component="img"
              src={imgSrc}
              alt={title}
              sx={{ width: 32, height: 32, objectFit: "contain" }}
            />
          ) : (
            <FactCheckIcon fontSize="small" />
          )}
        </Sheet>

        {/* Content */}
        <CardContent sx={{ p: 0, flex: 1, minWidth: 0, display:'flex',justifyContent:'space-between' }}>
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
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
                width:'140px',
                backgroundColor: "#6E4C71",
                color: "#fff",
                "&:hover": { backgroundColor: "#5C3F5F" },
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
                width:'140px',
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
    slug: name,        // you can add slug if needed
    title: prettify(name),
    to_review: count,
  }));

  const onNewRequest = (model) => {
    navigate(
      `/approvals/new?model=${encodeURIComponent(model?.slug || model?.name)}`
    );
  };

  const onOpenList = (model) => {
    navigate(
      `/approvals?model=${encodeURIComponent(
        model?.slug || model?.name
      )}&filter=to_review`
    );
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

