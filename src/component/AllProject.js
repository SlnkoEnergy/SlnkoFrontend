// component/AllProjects.jsx
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Textarea from "@mui/joy/Textarea";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import CircularProgress from "@mui/joy/CircularProgress";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tab, TabList, Tabs } from "@mui/joy";
import NoData from "../assets/alert-bell.svg";
import { useTheme } from "@emotion/react";
import { Add } from "@mui/icons-material";
import {
  useGetAllProjectsQuery,
  useUpdateProjectStatusMutation,
} from "../redux/projectsSlice";
import AssignedWorkModal from "./Forms/AssignWorkModal";

function AllProjects() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // ======== URL-backed state (persisted) ========
  const pageFromUrl = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10)
  );
  const pageSizeFromUrl = Math.max(
    1,
    parseInt(searchParams.get("pageSize") || "10", 10)
  );
  const tabFromUrl = searchParams.get("tab") || "All";
  const searchFromUrl = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizeFromUrl);
  const [selectedTab, setSelectedTab] = useState(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);

  // keep local state in sync when user navigates with back/forward
  useEffect(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const ps = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const t = searchParams.get("tab") || "All";
    const s = searchParams.get("search") || "";
    setCurrentPage(p);
    setRowsPerPage(ps);
    setSelectedTab(t);
    setSearchQuery(s);
  }, [searchParams]);

  // ======== selection state (local) ========
  const [selected, setSelected] = useState([]);

  const options = [1, 5, 10, 20, 50, 100];

  // map UI tab -> backend status
  const statusFilter = useMemo(() => {
    const t = (selectedTab || "All").toLowerCase();
    if (t === "all") return "";
    if (t === "to be started") return "to be started";
    if (t === "ongoing") return "ongoing";
    if (t === "delayed") return "delayed";
    if (t === "completed") return "completed";
    if (t === "on hold") return "on hold";
    return t;
  }, [selectedTab]);

  const {
    data: getProjects = {},
    isLoading,
    refetch,
  } = useGetAllProjectsQuery({
    page: currentPage,
    status: statusFilter,
    search: searchQuery, // <- always in sync with URL
    limit: rowsPerPage,
    sort: "-createdAt",
  });

  const [updateProjectStatus, { isLoading: isUpdatingStatus }] =
    useUpdateProjectStatusMutation();

  const Projects = getProjects?.data || [];

  const ProjectOverView = ({ currentPage, project_id, code }) => (
    <span
      style={{
        cursor: "pointer",
        color: theme.vars.palette.text.primary,
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        fontSize: "14px",
      }}
      onClick={() => {
        navigate(
          `/project_detail?page=${currentPage}&project_id=${project_id}`
        );
      }}
    >
      {code || "-"}
    </span>
  );
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [assignedProject, setAssignedProject] = useState(null);

  const openAssignedModal = (project) => {
    setAssignedProject({
      id: project?._id || project?.project_id,
      code: project?.code || "-",
      name: project?.name || "-",
      customer: project?.customer || "-",
    });
    setAssignedOpen(true);
  };

  const closeAssignedModal = () => {
    setAssignedOpen(false);
    setAssignedProject(null);
  };

  const handleAssignedSaved = async () => {
    await (refetch().unwrap?.() ?? refetch());
    closeAssignedModal();
  };

  // ======== Search: update URL on every keystroke and reset page to 1 ========
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("search", query);
      p.set("page", "1");
      // keep current tab & pageSize in URL
      if (selectedTab) p.set("tab", selectedTab);
      if (rowsPerPage) p.set("pageSize", String(rowsPerPage));
      return p;
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(Projects.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };

  const totalPages = Number(getProjects?.pagination?.totalPages || 1);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("page", String(page));
        if (selectedTab) p.set("tab", selectedTab);
        if (rowsPerPage) p.set("pageSize", String(rowsPerPage));
        p.set("search", searchQuery || "");
        return p;
      });
      setCurrentPage(page);
    }
  };

  // ---------- Status chip helpers + modal ----------
  const statusChipColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "completed") return "success";
    if (s === "to be started") return "warning";
    if (s === "ongoing") return "primary";
    if (s === "delayed") return "danger";
    return "neutral";
  };

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusProjectId, setStatusProjectId] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "", remarks: "" });

  const openStatusModal = (project) => {
    const currentStatus =
      project?.current_status?.status || project?.status || "";
    const currentRemarks = project?.current_status?.remarks || "";
    setStatusProjectId(project?._id || project?.project_id);
    setStatusForm({
      status: currentStatus || "not started",
      remarks: currentRemarks || "",
    });
    setStatusModalOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!statusProjectId) return;
    try {
      await updateProjectStatus({
        projectId: statusProjectId,
        status: statusForm.status,
        remarks: statusForm.remarks,
      }).unwrap();
      setStatusModalOpen(false);
      await (refetch().unwrap?.() ?? refetch());
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  return (
    <Box
      sx={{
        ml: { lg: "var(--Sidebar-width)" },
        px: "0px",
        width: { xs: "100%", lg: "calc(100% - var(--Sidebar-width))" },
      }}
    >
      <Box display={"flex"} justifyContent={"space-between"} pb={0.5}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          alignItems={"center"}
        >
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => {
              setSelectedTab(newValue);
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set("tab", newValue);
                newParams.set("page", "1");
                // keep search & pageSize
                newParams.set("search", searchQuery || "");
                newParams.set("pageSize", String(rowsPerPage));
                return newParams;
              });
              setCurrentPage(1);
            }}
            sx={{ bgcolor: "background.level1", borderRadius: "xl" }}
          >
            <TabList sx={{ gap: 1 }}>
              {[
                "All",
                "To Be Started",
                "Ongoing",
                "Completed",
                "Delayed",
                "On Hold",
              ].map((label) => (
                <Tab
                  key={label}
                  value={label}
                  disableIndicator
                  sx={{
                    borderRadius: "xl",
                    fontWeight: "md",
                    "&.Mui-selected": {
                      bgcolor: "background.surface",
                      boxShadow: "sm",
                    },
                  }}
                >
                  {label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>

        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: "sm",
            py: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            width: { lg: "100%" },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by ProjectId, Customer, Type, or State"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </FormControl>
        </Box>
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "none", sm: "block" },
          width: "100%",
          borderRadius: "sm",
          maxHeight: "66vh",
          overflowY: "auto",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#e0e0e0",
                  zIndex: 2,
                  borderBottom: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                <Checkbox
                  size="sm"
                  checked={
                    Projects.length > 0 && selected?.length === Projects?.length
                  }
                  onChange={handleSelectAll}
                  indeterminate={
                    selected?.length > 0 && selected?.length < Projects?.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Project Name",
                "Customer",
                "State",
                "Capacity(AC/DC)",
                "Status",
                "Schedule",
                "Assigned Work",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#e0e0e0",
                    zIndex: 2,
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
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
                <td colSpan={9} style={{ padding: "8px" }}>
                  <Box
                    sx={{
                      fontStyle: "italic",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size="sm" sx={{ mb: "8px" }} />
                    <Typography fontStyle="italic">Loading...</Typography>
                  </Box>
                </td>
              </tr>
            ) : Projects?.length > 0 ? (
              Projects.map((project, index) => {
                const status =
                  project?.current_status?.status || project?.status || "-";
                const remarks = project?.current_status?.remarks || "";
                const projectIdForLinks = project?.project_id || project?._id;

                return (
                  <tr key={project._id || index}>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(project._id)}
                        onChange={() => handleRowSelect(project._id)}
                      />
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Tooltip title="View Project Detail" arrow>
                        <span>
                          <ProjectOverView
                            currentPage={currentPage}
                            project_id={projectIdForLinks}
                            code={project.code}
                          />
                        </span>
                      </Tooltip>
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {project.name || "-"}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {project.customer || "-"}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {project.state || "-"}
                    </td>
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      {project.project_kwp && project.proposed_dc_capacity
                        ? `${project.project_kwp} AC / ${project.proposed_dc_capacity} DC`
                        : "-"}
                    </td>

                    {/* Status chip */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <Tooltip
                        placement="top"
                        title={
                          remarks
                            ? `Remarks: ${remarks}`
                            : "Click to change status"
                        }
                        arrow
                      >
                        <Chip
                          variant="soft"
                          color={statusChipColor(status)}
                          size="sm"
                          onClick={() => openStatusModal(project)}
                          sx={{ cursor: "pointer", fontWeight: 600 }}
                        >
                          {String(status || "-")
                            .split(" ")
                            .map((w) =>
                              w ? w[0].toUpperCase() + w.slice(1) : ""
                            )
                            .join(" ")}
                        </Chip>
                      </Tooltip>
                    </td>

                    {/* Open PM schedule */}
                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <IconButton
                        onClick={() =>
                          navigate(`/view_pm?project_id=${projectIdForLinks}`)
                        }
                        size="sm"
                        variant="outlined"
                        color="primary"
                      >
                        <Add />
                      </IconButton>
                    </td>

                    <td
                      style={{ borderBottom: "1px solid #ddd", padding: "8px" }}
                    >
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => openAssignedModal(project)}
                      >
                        Assigned Work +
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ padding: "8px", textAlign: "left" }}>
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
                      No Projects Found
                    </Typography>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Box>
      </Sheet>

      <AssignedWorkModal
        open={assignedOpen}
        onClose={closeAssignedModal}
        onSaved={handleAssignedSaved}
        project={assignedProject}
      />
      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 0.5,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={getProjects?.pagination?.hasPrevPage === false}
        >
          Previous
        </Button>

        <Box>Showing {Projects?.length} results</Box>

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

          <IconButton size="sm" variant="solid" color="neutral">
            {currentPage}
          </IconButton>

          {currentPage + 1 <= totalPages && (
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

        <Box display="flex" alignItems="center" gap={1} sx={{ p: "8px 16px" }}>
          <Select
            value={rowsPerPage}
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", String(newValue));
                  params.set("page", "1");
                  params.set("tab", selectedTab);
                  params.set("search", searchQuery || "");
                  return params;
                });
                setCurrentPage(1);
              }
            }}
            size="sm"
            variant="outlined"
            sx={{ minWidth: 80, borderRadius: "md", boxShadow: "sm" }}
          >
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={getProjects?.pagination?.hasNextPage === false}
        >
          Next
        </Button>
      </Box>

      {/* Status Change Modal */}
      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <ModalDialog variant="outlined" size="md" sx={{ borderRadius: "lg" }}>
          <DialogTitle>Update Project Status</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 1.25 }}>
              <FormControl size="sm">
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Status
                </Typography>
                <Select
                  size="sm"
                  value={statusForm.status}
                  onChange={(_, v) =>
                    setStatusForm((f) => ({ ...f, status: v || f.status }))
                  }
                >
                  <Option value="to be started">To be Started</Option>
                  <Option value="ongoing">Ongoing</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="delayed">Delayed</Option>
                  <Option value="on hold">On hold</Option>
                </Select>
              </FormControl>

              <FormControl size="sm">
                <Typography level="body-sm" sx={{ mb: 0.5 }}>
                  Remarks
                </Typography>
                <Textarea
                  minRows={3}
                  value={statusForm.remarks}
                  onChange={(e) =>
                    setStatusForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                  placeholder="Add remarks (optional)"
                />
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submitStatusUpdate}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default AllProjects;
