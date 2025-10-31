import React from "react";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import Skeleton from "@mui/joy/Skeleton";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded";
import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useSearchParams } from "react-router-dom";
import { useGetUniqueTagsQuery } from "../../../redux/emailSlice";

/** Deterministic tag dot color */
const tagDotColor = (label = "") => {
  const palette = [
    "primary.500",
    "success.500",
    "warning.500",
    "danger.500",
    "info.500",
    "neutral.500",
  ];
  let h = 0;
  for (let i = 0; i < label.length; i++)
    h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export default function Navigation({ setSelectedStatus }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = (searchParams.get("status") || "").trim();

  const selectedStatus = statusParam || "queued";

  React.useEffect(() => {
    if (typeof setSelectedStatus === "function") {
      setSelectedStatus(selectedStatus);
    }
  }, [selectedStatus, setSelectedStatus]);

  const {
    data: tagsResponse,
    isLoading: tagsLoading,
    isError: tagsError,
  } = useGetUniqueTagsQuery();

  const tagsRaw = Array.isArray(tagsResponse?.tags)
    ? tagsResponse.tags
    : Array.isArray(tagsResponse)
    ? tagsResponse
    : [];

  const tags = tagsRaw
    .filter((t) => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const items = [
    { label: "Queued", value: "queued", Icon: InboxRoundedIcon },
    { label: "Sent", value: "sent", Icon: OutboxRoundedIcon },
    { label: "Draft", value: "draft", Icon: DraftsRoundedIcon },
    { label: "Trash", value: "trash", Icon: DeleteRoundedIcon },
  ];

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);

    next.delete("page");
    setSearchParams(next);
  };

  const handleClickStatus = (value) => {
    updateParam("status", value);
  };

  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: 800 }}>
          Browse
        </ListSubheader>
        <List aria-labelledby="nav-list-browse">
          {items.map(({ label, value, Icon }) => (
            <ListItem key={value}>
              <ListItemButton
                selected={selectedStatus === value}
                onClick={() => handleClickStatus(value)}
                sx={{
                  ...(selectedStatus === value && {
                    bgcolor: "neutral.softBg",
                    "&:hover": { bgcolor: "neutral.softHoverBg" },
                  }),
                }}
              >
                <ListItemDecorator>
                  <Icon fontSize="small" />
                </ListItemDecorator>
                <ListItemContent>{label}</ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ListItem>

      <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: 800 }}>
          Tags
        </ListSubheader>

        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{ "--ListItemDecorator-size": "32px" }}
        >
          {tagsLoading &&
            [...Array(4)].map((_, i) => (
              <ListItem key={`skeleton-${i}`}>
                <ListItemButton disabled>
                  <ListItemDecorator>
                    <Skeleton
                      variant="circular"
                      width={10}
                      height={10}
                      sx={{ borderRadius: 99 }}
                    />
                  </ListItemDecorator>
                  <ListItemContent>
                    <Skeleton variant="text" level="body-sm" width={120} />
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            ))}

          {tagsError && (
            <ListItem>
              <ListItemContent>
                <Box sx={{ color: "danger.600", fontSize: 12 }}>
                  Failed to load tags
                </Box>
              </ListItemContent>
            </ListItem>
          )}

          {!tagsLoading && !tagsError && tags.length === 0 && (
            <ListItem>
              <ListItemContent>
                <Box sx={{ color: "text.tertiary", fontSize: 12 }}>
                  No tags found
                </Box>
              </ListItemContent>
            </ListItem>
          )}

          {!tagsLoading &&
            !tagsError &&
            tags.map((tag) => {
              const isSelected = selectedStatus === tag;
              return (
                <ListItem key={tag}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleClickStatus(tag)}
                    sx={{
                      ...(isSelected && {
                        bgcolor: "neutral.softBg",
                        "&:hover": { bgcolor: "neutral.softHoverBg" },
                      }),
                    }}
                  >
                    <ListItemDecorator>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "99px",
                          bgcolor: tagDotColor(tag),
                        }}
                      />
                    </ListItemDecorator>
                    <ListItemContent>
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </ListItem>
    </List>
  );
}
