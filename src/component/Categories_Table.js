import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Checkbox from "@mui/joy/Checkbox";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import { useEffect, useMemo, useState, useCallback } from "react";
import NoData from "../assets/alert-bell.svg";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { debounce } from "lodash";
import { useSearchParams } from "react-router-dom";
import Chip from "@mui/joy/Chip";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BuildIcon from "@mui/icons-material/Build";

import {
  useGetAllTasksQuery,
  useGetAllDeptQuery,
} from "../redux/globalTaskSlice";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
} from "@mui/joy";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function Categories_Table() {
  
  const filteredData = [];

  return (
    <>
      {/* Search and Filters */}
      <Box
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Product Name"
            startDecorator={<SearchIcon />}
           
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Items per page</FormLabel>
          {/* <Select
            value={itemsPerPage}
            onChange={(e, newValue) => {
              setItemsPerPage(Number(newValue));
              setCurrentPage(1);
            }}
            sx={{
              height: "32px",
              borderRadius: "6px",
              padding: "0 8px",
              borderColor: "#ccc",
              backgroundColor: "#fff",
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <Option key={n} value={n}>
                {n}
              </Option>
            ))}
          </Select> */}
        </FormControl>

      </Box>

      {/* Table */}
      <Sheet
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          overflow: "auto",
          minHeight: 0,
          marginLeft: { lg: "18%", xl: "15%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <tr>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                <Checkbox
                  size="sm"
                //   checked={selected.length === filteredData.length}
                //   onChange={handleSelectAll}
                //   indeterminate={
                //     selected.length > 0 && selected.length < filteredData.length
                //   }
                />
              </th>

              {/* The rest of the column headers */}
              {["Category Code", "Category Name", "Product Count", "Type"].map(
                (header, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((task) => (
                <tr key={task._id}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Checkbox
                      size="sm"
                    //   checked={selected.includes(task._id)}
                    //   onChange={() => handleRowSelect(task._id)}
                    />
                  </td>

                  {/* Task Info */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography
                      fontWeight="lg"
                      sx={{ cursor: "pointer", color: "primary.700" }}
                    //   onClick={() => navigate(`/view_task?task=${task._id}`)}
                    >
                      {task.taskCode}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title="Priority">
                        <Box display="flex">
                          {[...Array(Number(task.priority || 0))].map(
                            (_, i) => (
                              <Typography key={i} level="body-sm">
                                ⭐
                              </Typography>
                            )
                          )}
                        </Box>
                      </Tooltip>
                    </Box>

                    <Typography level="body-sm" startDecorator="👤">
                      Created By: {task.createdBy?.name || "-"}
                    </Typography>
                    <Typography level="body-sm" startDecorator="📆">
                      Created At: {task.createdAt?.split("T")[0] || "-"}
                    </Typography>
                  </td>

                  {/* Title + Assigned To + Deadline */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Typography fontWeight="lg">{task.title || "-"}</Typography>

                    {task.assigned_to?.length > 0 ? (
                      <Tooltip
                        title={
                          <Box sx={{ px: 1, py: 0.5 }}>
                            <Typography
                              level="body-sm"
                              fontWeight="md"
                              mb={0.5}
                            >
                              Assigned To:
                            </Typography>
                            {task.assigned_to.map((a, i) => (
                              <Typography key={i} level="body-sm">
                                • {a.name}
                              </Typography>
                            ))}
                          </Box>
                        }
                        variant="soft"
                        placement="top"
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            backgroundColor: "#f1f3f5",
                            padding: "2px 6px",
                            borderRadius: "12px",
                            maxWidth: "100%",
                          }}
                        >
                          <Typography level="body-sm" noWrap>
                            {task.assigned_to[0].name}
                          </Typography>

                          {task.assigned_to.length > 1 && (
                            <Box
                              sx={{
                                backgroundColor: "#007bff",
                                color: "#fff",
                                borderRadius: "8px",
                                fontSize: "10px",
                                fontWeight: 500,
                                px: 0.8,
                                lineHeight: 1.2,
                              }}
                            >
                              +{task.assigned_to.length - 1}
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography level="body-sm" startDecorator="👥">
                        -
                      </Typography>
                    )}

                    <Typography level="body-sm" startDecorator="📅">
                      Deadline: {task.deadline?.split("T")[0] || "-"}
                    </Typography>
                    {task.deadline &&
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const deadlineDate = new Date(task.deadline);
                        deadlineDate.setHours(0, 0, 0, 0);

                        if (deadlineDate < today) {
                          const diffInDays = Math.floor(
                            (today - deadlineDate) / (1000 * 60 * 60 * 24)
                          );
                          return (
                            <Typography
                              level="body-sm"
                              color="danger"
                              startDecorator="⏰"
                            >
                              Delay: {diffInDays}{" "}
                              {diffInDays === 1 ? "day" : "days"}
                            </Typography>
                          );
                        } else {
                          return (
                            <Typography
                              level="body-sm"
                              color="success"
                              startDecorator="✅"
                            >
                              On Time
                            </Typography>
                          );
                        }
                      })()}
                  </td>

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {task.type ? (
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        gap={0.5}
                        px={1}
                        py={0.3}
                        borderRadius="16px"
                        border="1px solid #ccc"
                        bgcolor="#f5f5f5"
                      >

                        <Typography variant="body2" fontWeight="medium">

                        </Typography>
                      </Box>
                    ) : (
                      <Typography fontWeight="lg">-</Typography>
                    )}
                  </td>

                  {/* Project Info */}

                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    {Array.isArray(task.project_details) &&
                    task.project_details.length > 0 ? (
                      task.project_details.length === 1 ? (
                        <div>
                          <Typography fontWeight="lg">
                            {task.project_details[0].code || "-"}
                          </Typography>
                          <Typography level="body-sm" sx={{ color: "#666" }}>
                            {task.project_details[0].name || "-"}
                          </Typography>
                        </div>
                      ) : (
                        <Tooltip
                          title={
                            <Box
                              sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}
                            >
                              {task.project_details
                                .slice(1)
                                .map((project, index) => (
                                  <Box key={project._id} sx={{ mb: 1 }}>
                                    <Typography level="body-md" fontWeight="lg">
                                      {project.code}
                                    </Typography>
                                    <Typography level="body-sm">
                                      {project.name}
                                    </Typography>
                                    {index !==
                                      task.project_details.length - 2 && (
                                      <Box
                                        sx={{
                                          height: "1px",
                                          backgroundColor: "#eee",
                                          my: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                ))}
                            </Box>
                          }
                          arrow
                          placement="top-start"
                          variant="soft"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                              cursor: "pointer",
                              "&:hover .project-count-badge": {
                                backgroundColor: "#0056d2",
                              },
                            }}
                          >
                            <Box>
                              <Typography fontWeight="lg">
                                {task.project_details[0].code || "-"}
                              </Typography>
                              <Typography level="body-sm">
                                {task.project_details[0].name || "-"}
                              </Typography>
                            </Box>
                            <Box
                              className="project-count-badge"
                              sx={{
                                backgroundColor: "#007bff",
                                color: "#fff",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                px: 1,
                                py: 0.2,
                                minWidth: 26,
                                textAlign: "center",
                                transition: "all 0.2s ease-in-out",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              }}
                            >
                              +{task.project_details.length - 1}
                            </Box>
                          </Box>
                        </Tooltip>
                      )
                    ) : (
                      <>
                        <Typography fontWeight="lg">N/A</Typography>
                      </>
                    )}
                  </td>

                  {/* Description */}
                  <td
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      maxWidth: "200px",
                    }}
                  >
                    <Tooltip
                      title={
                        <Typography
                          sx={{ whiteSpace: "pre-line", maxWidth: "300px" }}
                        >
                          {task.description || ""}
                        </Typography>
                      }
                      arrow
                      placement="top-start"
                      variant="soft"
                      color="neutral"
                    >
                      <Typography
                        noWrap
                        sx={{
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "default",
                        }}
                      >
                        {task.description || "-"}
                      </Typography>
                    </Tooltip>
                  </td>

                  {/* Status */}
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #ddd" }}
                  >
                    <Tooltip title={task.current_status?.remarks || ""}>
                      <Chip
                        variant="soft"
                        color={
                          task.current_status?.status === "draft"
                            ? "primary"
                            : task.current_status?.status === "pending"
                              ? "danger"
                              : task.current_status?.status === "in progress"
                                ? "warning"
                                : task.current_status?.status === "completed"
                                  ? "success"
                                  : "neutral"
                        }
                        size="sm"
                      >
                        {task.current_status?.status
                          ? task.current_status.status.charAt(0).toUpperCase() +
                            task.current_status.status.slice(1)
                          : "-"}
                      </Chip>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "16px" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{ width: 50, marginBottom: 8 }}
                    />
                    <Typography fontStyle="italic">No Tasks Found</Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      {/* Pagination */}
      <Box
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          marginLeft: { lg: "18%", xl: "15%" },
          flexWrap: "wrap",
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
        >
          Previous
        </Button>

        <Box>
         
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="sm" variant="contained" color="neutral">
      
          </IconButton>
    
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
   
            >
         
            </IconButton>

        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}

        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default Categories_Table;
