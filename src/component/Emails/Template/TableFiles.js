import React from "react";
import Avatar from "@mui/joy/Avatar";
import AvatarGroup from "@mui/joy/AvatarGroup";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

export default function TableFiles() {
  return (
    <div>
      <Table
        hoverRow
        size="sm"
        borderAxis="none"
        variant="soft"
        sx={{
          "--TableCell-paddingX": "1rem",
          "--TableCell-paddingY": "1rem",
        }}
      >
        <thead>
          <tr>
            <th>
              <Typography level="title-sm">Folder</Typography>
            </th>
            <th>
              <Typography
                level="title-sm"
                endDecorator={<ArrowDropDownRoundedIcon />}
              >
                Last modified
              </Typography>
            </th>
            <th>
              <Typography level="title-sm">Size</Typography>
            </th>
            <th>
              <Typography level="title-sm">Users</Typography>
            </th>
          </tr>
        </thead>

        <tbody>
          {/* ---- Row 1 ---- */}
          <tr>
            <td>
              <Typography
                level="title-sm"
                startDecorator={<FolderRoundedIcon color="primary" />}
                sx={{ alignItems: "flex-start" }}
              >
                Travel pictures
              </Typography>
            </td>
            <td>
              <Typography level="body-sm">21 Oct 2023, 3PM</Typography>
            </td>
            <td>
              <Typography level="body-sm">987.5MB</Typography>
            </td>
            <td>
              <AvatarGroup
                size="sm"
                sx={{
                  "--AvatarGroup-gap": "-8px",
                  "--Avatar-size": "24px",
                }}
              >
                {[6, 7, 8, 9].map((i) => (
                  <Avatar
                    key={i}
                    src={`https://i.pravatar.cc/24?img=${i}`}
                    srcSet={`https://i.pravatar.cc/48?img=${i} 2x`}
                  />
                ))}
              </AvatarGroup>
            </td>
          </tr>

          {/* ---- Row 2 ---- */}
          <tr>
            <td>
              <Typography
                level="title-sm"
                startDecorator={<FolderRoundedIcon color="primary" />}
                sx={{ alignItems: "flex-start" }}
              >
                Important documents
              </Typography>
            </td>
            <td>
              <Typography level="body-sm">26 Sep 2023, 7PM</Typography>
            </td>
            <td>
              <Typography level="body-sm">232.3MB</Typography>
            </td>
            <td>
              <AvatarGroup
                size="sm"
                sx={{
                  "--AvatarGroup-gap": "-8px",
                  "--Avatar-size": "24px",
                }}
              >
                {[1, 9, 2, 3].map((i) => (
                  <Avatar
                    key={i}
                    src={`https://i.pravatar.cc/24?img=${i}`}
                    srcSet={`https://i.pravatar.cc/48?img=${i} 2x`}
                  />
                ))}
                <Avatar>+3</Avatar>
              </AvatarGroup>
            </td>
          </tr>

          {/* ---- Row 3 ---- */}
          <tr>
            <td>
              <Typography
                level="title-sm"
                startDecorator={<FolderRoundedIcon color="primary" />}
                sx={{ alignItems: "flex-start" }}
              >
                Projects
              </Typography>
            </td>
            <td>
              <Typography level="body-sm">12 Aug 2021, 7PM</Typography>
            </td>
            <td>
              <Typography level="body-sm">1.6GB</Typography>
            </td>
            <td>
              <AvatarGroup
                size="sm"
                sx={{
                  "--AvatarGroup-gap": "-8px",
                  "--Avatar-size": "24px",
                }}
              >
                {[4, 8, 5].map((i) => (
                  <Avatar
                    key={i}
                    src={`https://i.pravatar.cc/24?img=${i}`}
                    srcSet={`https://i.pravatar.cc/48?img=${i} 2x`}
                  />
                ))}
              </AvatarGroup>
            </td>
          </tr>

          {/* ---- Row 4 ---- */}
          <tr>
            <td>
              <Typography
                level="title-sm"
                startDecorator={<FolderRoundedIcon color="primary" />}
                sx={{ alignItems: "flex-start" }}
              >
                Invoices
              </Typography>
            </td>
            <td>
              <Typography level="body-sm">14 Mar 2021, 7PM</Typography>
            </td>
            <td>
              <Typography level="body-sm">123.3KB</Typography>
            </td>
            <td>
              <Avatar
                size="sm"
                src="https://i.pravatar.cc/24?img=2"
                srcSet="https://i.pravatar.cc/48?img=2 2x"
                sx={{ "--Avatar-size": "24px" }}
              />
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
