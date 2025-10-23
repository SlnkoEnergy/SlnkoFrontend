import React from "react";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded";
import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

export default function Navigation({ setSelectedStatus }) {
  const [selected, setSelected] = React.useState("queued");

  const items = [
    { label: "Queued", value: "queued", Icon: InboxRoundedIcon },
    { label: "Sent", value: "sent", Icon: OutboxRoundedIcon },
    { label: "Draft", value: "draft", Icon: DraftsRoundedIcon },
    { label: "Trash", value: "trash", Icon: DeleteRoundedIcon },
  ];

  const handleClick = (value) => {
    setSelected(value);
    setSelectedStatus?.(value);
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
                selected={selected === value}
                onClick={() => handleClick(value)}
                sx={{
                  ...(selected === value && {
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
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Tags
        </ListSubheader>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{ "--ListItemDecorator-size": "32px" }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "99px",
                    bgcolor: "primary.500",
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Personal</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "99px",
                    bgcolor: "danger.500",
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Work</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "99px",
                    bgcolor: "warning.400",
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Travels</ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "99px",
                    bgcolor: "success.400",
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Concert tickets</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </ListItem>
    </List>
  );
}
