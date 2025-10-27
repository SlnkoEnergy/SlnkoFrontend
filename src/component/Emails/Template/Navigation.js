import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Skeleton } from "@mui/joy";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetTemplateUniqueTagsQuery } from "../../../redux/emailSlice";

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

export default function Navigation({
  setSelectedStatus = () => {},
  setSelectedTag = () => {},
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // current url state
  const tagParam = (searchParams.get("tags") || "").trim();
  const statusParam = (searchParams.get("status") || "").trim();

  const isTrash = statusParam === "trash";
  const hasTag = !!tagParam;
  const isMyTemplates = !isTrash && !hasTag;

  useEffect(() => {
    setSelectedStatus(statusParam || (isMyTemplates ? "active" : ""));
    setSelectedTag(tagParam || "");
  }, [statusParam, tagParam, isMyTemplates, setSelectedStatus, setSelectedTag]);

  // tags data
  const {
    data: tagsResponse,
    isLoading: tagsLoading,
    isError: tagsError,
  } = useGetTemplateUniqueTagsQuery();

  const tags = useMemo(() => {
    const raw = Array.isArray(tagsResponse?.data)
      ? tagsResponse.data
      : Array.isArray(tagsResponse)
      ? tagsResponse
      : [];
    return raw
      .filter((t) => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [tagsResponse]);

  const writeParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (key === "status") {
      if (value) next.set("status", value);
      else next.delete("status");
      next.delete("tags");
      setSelectedStatus(value || "active");
      setSelectedTag("");
    }

    if (key === "tags") {
      if (value) next.set("tags", value);
      else next.delete("tags");
      next.delete("status");
      setSelectedTag(value || "");
      setSelectedStatus("");
    }

    next.delete("page");
    setSearchParams(next);
  };

  // click handlers
  const handleMyTemplates = () => writeParam("status", ""); // clears both
  const handleTrash = () => writeParam("status", "trash");
  const handleClickTag = (tag) => writeParam("tags", tag);

  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      {/* Browse */}
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: 800 }}>
          BROWSE
        </ListSubheader>

        <List
          aria-labelledby="nav-list-browse"
          sx={{ "& .JoyListItemButton-root": { p: "8px" } }}
        >
          <ListItem>
            <ListItemButton
              selected={isMyTemplates}
              onClick={handleMyTemplates}
            >
              <ListItemDecorator>
                <FolderRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>My Templates</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={isTrash} onClick={handleTrash}>
              <ListItemDecorator>
                <DeleteRoundedIcon fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Trash</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </ListItem>

      {/* Tags */}
      <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: 800 }}>
          TAGS
        </ListSubheader>

        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{ "--ListItemDecorator-size": "32px" }}
        >
          {tagsLoading &&
            [...Array(4)].map((_, i) => (
              <ListItem key={`sk-${i}`}>
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
              const isSelected = tagParam === tag; // exactly one tag can be active
              return (
                <ListItem key={tag}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleClickTag(tag)}
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
