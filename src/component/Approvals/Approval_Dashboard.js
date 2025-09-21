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

function ModelCard({ model, onNewRequest, onOpenList }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const title = model ?? "Untitled";
  const toReview = Number(model?.to_review ?? 0);
  const imgSrc = model?.icon; // URL/base64 from backend

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "xl",
        boxShadow: "sm",
        p: 3,
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "md" },
      }}
    >
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* Icon / Illustration */}
        <Sheet
          variant="soft"
          color="neutral"
          sx={{
            width: 64,
            height: 64,
            borderRadius: "lg",
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
              sx={{ width: 56, height: 56, objectFit: "contain" }}
            />
          ) : (
            <FactCheckIcon />
          )}
        </Sheet>

        {/* Content */}
        <CardContent sx={{ p: 0, flex: 1, minWidth: 0 }}>
          <Typography
            level="title-md"
            sx={{
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="solid"
              size="sm"
              startDecorator={<AddCircleIcon />}
              sx={{
                backgroundColor: "#3366a3",
                color: "#fff",
                "&:hover": { backgroundColor: "#285680" },
                height: "8px",
              }}
            >
              New Request
            </Button>

            <Button
              size="sm"
              variant="soft"
              onClick={() => onOpenList(model)}
              sx={{ borderRadius: "lg" }}
            >
              To Review:{" "}
              <Chip
                size="sm"
                variant="solid"
                color={toReview > 0 ? "warning" : "neutral"}
                sx={{ ml: 0.75 }}
              >
                {toReview}
              </Chip>
            </Button>
          </Box>
        </CardContent>

        {/* Kebab */}
        <Box>
          <IconButton
            variant="plain"
            color="neutral"
            onClick={handleMenu}
            aria-label="More"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleClose();
                onOpenList(model);
              }}
            >
              Open
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onNewRequest(model);
              }}
            >
              New Request
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Card>
  );
}

export default function Approval_Dashboard() {
  const { data: getUniqueModel } = useGetUniqueModelQuery();
  const navigate = useNavigate();
  console.log({ getUniqueModel });
  const items = Array.isArray(getUniqueModel?.data) ? getUniqueModel?.data : [];

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
        ml: {
          lg: "var(--Sidebar-width)",
        },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Grid>
        {items.map((m, idx) => (
          <ModelCard
            //   key={`${m.slug || m.name}-${idx}`}
            model={m}
            //   onNewRequest={onNewRequest}
            //   onOpenList={onOpenList}
          />
        ))}
      </Grid>
    </Box>
  );
}
