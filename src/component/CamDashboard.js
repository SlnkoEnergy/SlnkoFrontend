import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, CircularProgress } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import { useTheme } from "@emotion/react";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import Tooltip from "@mui/joy/Tooltip";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import {
  useGetHandOverQuery,
  useUpdateHandOverMutation,
} from "../redux/camsSlice";

import { toast } from "react-toastify";

function Dash_cam() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({
    page: currentPage,
    search: searchQuery,
    status: "submitted,Approved",
  });
  const ProjectOverView = ({ currentPage, project_id, code }) => {
    // console.log("currentPage:", currentPage, "pproject_id:", pproject_id);

    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "underline",
            textDecorationStyle: "dotted",
          }}
          onClick={() => {
            const page = currentPage;
            // const project_id = project_id;
            // sessionStorage.setItem("eng_overview", projectId);
            navigate(`/overview?page=${page}&project_id=${project_id}`);
          }}
        >
          {code || "-"}
        </span>
      </>
    );
  };
  const HandOverSheet = Array.isArray(getHandOverSheet?.data)
    ? getHandOverSheet.data.map((entry) => {
        return {
          ...entry,
          _id: entry._id,
          ...entry.customer_details,
          ...entry.order_details,
          ...entry.project_detail,
          ...entry.commercial_details,
          ...entry.other_details,
          ...entry?.scheme,
          is_locked: entry.is_locked,
        };
      })
    : [];

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const StatusChip = ({ status, is_locked, _id, user, refetch }) => {
    console.log("StatusChip props:", { status, is_locked, _id, user, refetch });

    const [lockedState, setLockedState] = useState(
      is_locked === "locked" || is_locked === true
    );
    const [updateUnlockHandoversheet, { isLoading: isUpdating }] =
      useUpdateHandOverMutation();

    const isAdmin =
      user?.department === "admin" ||
      user?.name === "IT Team" ||
      ["Prachi Singh", "Sanjiv Kumar", "Sushant Ranjan Dubey"].includes(
        user?.name
      );

    const ProjectOverView = ({ currentPage, project_id, code }) => {
      // console.log("currentPage:", currentPage, "pproject_id:", pproject_id);

      return (
        <>
          <span
            style={{
              cursor: "pointer",
              color: theme.vars.palette.text.primary,
              textDecoration: "underline",
              textDecorationStyle: "dotted",
            }}
            onClick={() => {
              const page = currentPage;
              // const project_id = project_id;
              // sessionStorage.setItem("eng_overview", projectId);
              navigate(`/overview?page=${page}&project_id=${project_id}`);
            }}
          >
            {code || "-"}
          </span>
        </>
      );
    };
    useEffect(() => {
      setLockedState(is_locked === "locked" || is_locked === true);
    }, [is_locked]);

    const handleSubmit = useCallback(async () => {
      console.log("Unlock button clicked");

      if (!isAdmin) {
        toast.error(
          "Permission denied. You do not have access to perform this action.",
          {
            icon: "⛔",
          }
        );
        return;
      }

      if (!lockedState || status !== "Approved" || isUpdating) return;

      try {
        await updateUnlockHandoversheet({ _id, is_locked: "unlock" }).unwrap();
        toast.success("Handover sheet unlocked 🔓");
        setLockedState(false);
        refetch?.();
      } catch (err) {
        console.error("Error:", err?.data?.message || err.error);
        toast.error("Failed to update status.");
      }
    }, [
      isAdmin,
      lockedState,
      status,
      isUpdating,
      updateUnlockHandoversheet,
      _id,
      refetch,
    ]);

    const canUnlock =
      isAdmin && lockedState && status === "Approved" && !isUpdating;
    const showUnlockIcon = !lockedState && status === "Approved";
    const showSuccessLockIcon = lockedState && status === "submitted";
    const color = showUnlockIcon || showSuccessLockIcon ? "success" : "danger";
    const IconComponent = showUnlockIcon ? LockOpenIcon : LockIcon;

    return (
      <Button
        size="sm"
        variant="soft"
        color={color}
        onClick={canUnlock ? handleSubmit : undefined}
        sx={{
          minWidth: 36,
          height: 36,
          padding: 0,
          fontWeight: 500,
          cursor: canUnlock ? "pointer" : "default",
        }}
      >
        {isUpdating ? (
          <CircularProgress size="sm" />
        ) : (
          <IconComponent sx={{ fontSize: "1rem" }} />
        )}
      </Button>
    );
  };

  const RowMenu = ({ currentPage, p_id, _id, id }) => {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        <Chip
          variant="solid"
          color="success"
          label="Approved"
          onClick={() => {
            const page = currentPage;
            const projectId = String(id);
            sessionStorage.setItem("submitInfo", projectId);
            navigate(`/edit_cam_handover?page=${page}&leadId=${projectId}`);
          }}
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "sm",
          }}
          startDecorator={<EditNoteIcon />}
        />
      </Box>
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = useMemo(() => {
    return HandOverSheet.filter((project) =>
      ["code", "customer", "state"].some((key) =>
        project[key]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    ).sort((a, b) => {
      const dateA = new Date(a?.updatedAt || a?.createdAt || 0);
      const dateB = new Date(b?.updatedAt || b?.createdAt || 0);
      return dateB - dateA;
    });
  }, [HandOverSheet, searchQuery]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPayments.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const paginatedPayments = filteredAndSortedData;

  // const totalPages = Math.ceil(currentPage / (1000 / itemsPerPage));

  // const paginatedPayments = filteredAndSortedData;

  const draftPayments = paginatedPayments;
  // console.log(paginatedPayments);
  // console.log("Filtered and Sorted Data:", filteredAndSortedData);

  const handlePageChange = (page) => {
    if (page >= 1) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Mobile Filters */}
      {/* <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: "", sm: "none" }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet> */}
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          // flexDirection:{xs: "none", sm: "flex"}
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Pay ID, Customer, or Name"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {/* {renderFilters()} */}
      </Box>
      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
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
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                <Checkbox
                  size="sm"
                  checked={selected.length === paginatedPayments.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < paginatedPayments.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Customer",
                "Mobile",
                "State",
                "Type",
                "Capacity(AC/DC)",
                "Slnko Service Charges (with GST)",
                "Status",
                "Action",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ padding: "8px", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ marginBottom: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : draftPayments.length > 0 ? (
              draftPayments.map((project, index) => (
                <tr
                  key={index}
                  style={{
                    "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                  }}
                >
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Checkbox
                      size="sm"
                      checked={selected.includes(project._id)}
                      onChange={(event) =>
                        handleRowSelect(project._id, event.target.checked)
                      }
                    />
                  </td>

                  {/* <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.code || "-"}
                  </td> */}
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <Tooltip title="View Engineering Overview" arrow>
                      <span>
                        <ProjectOverView
                          currentPage={currentPage}
                          project_id={project.project_id}
                          code={project.code}
                        />
                      </span>
                    </Tooltip>
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.customer || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.number || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.state || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.scheme || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.project_kwp && project.proposed_dc_capacity
                      ? `${project.project_kwp} AC / ${project.proposed_dc_capacity} DC`
                      : "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.total_gst || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <StatusChip
                      status={project.status_of_handoversheet}
                      is_locked={project.is_locked}
                      _id={project._id}
                      user={user}
                      refetch={refetch}
                    />
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu
                      currentPage={currentPage}
                      id={project.id}
                      _id={project._id}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ padding: "8px", textAlign: "center" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={NoData}
                      alt="No data"
                      style={{
                        width: "50px",
                        height: "50px",
                        marginBottom: "8px",
                      }}
                    />
                    <Typography fontStyle="italic">
                      No Handover Sheet Found
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>
      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          marginLeft: { lg: "18%", xl: "15%" },
        }}
      >
        {/* Previous Button */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {/* Showing X Results (no total because backend paginates) */}
        <Box>Showing {draftPayments.length} results</Box>

        {/* Page Numbers: Only show current, prev, next for backend-driven pagination */}
        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {currentPage > 1 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              {currentPage - 1}
            </IconButton>
          )}

          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>

          {/* Show next page button if current page has any data (not empty) */}
          {draftPayments.length > 0 && (
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              {currentPage + 1}
            </IconButton>
          )}
        </Box>

        {/* Next Button */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={draftPayments.length === 0} // disable next if no data at all on this page
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default Dash_cam;
