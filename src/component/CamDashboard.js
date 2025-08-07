import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SearchIcon from "@mui/icons-material/Search";
import {
  Chip,
  CircularProgress,
  Option,
  Select,
  Tab,
  TabList,
  Tabs,
  TextField,
} from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import { useTheme } from "@emotion/react";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import Tooltip from "@mui/joy/Tooltip";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Autocomplete from "@mui/joy/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  useGetHandOverQuery,
  useUpdateHandOverMutation,
  useGetMaterialCategoryQuery,
  useCreatePurchaseRequestMutation,
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
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [selectedPRProject, setSelectedPRProject] = useState(null);
  const [items, setItems] = useState([]);
  const [otherItemName, setOtherItemName] = useState("");
  const [otherItemAmount, setOtherItemAmount] = useState("");
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const [selectedTab, setSelectedTab] = useState(
    () => searchParams.get("tab") || "All"
  );
  const options = [1, 5, 10, 20, 50, 100];
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(searchParams.get("pageSize")) || 10
  );
  const getStatusFilter = (tab) => {
    switch (tab) {
      case "Handover Pending":
        return "handoverpending";
      case "Scope Pending":
        return "scopepending";
      default:
        return "submitted,Approved";
    }
  };
  const statusFilter = useMemo(
    () => getStatusFilter(selectedTab),
    [selectedTab]
  );
  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({
    page: currentPage,
    search: searchQuery,
    status: statusFilter,
    limit: rowsPerPage,
  });
  const { data: materialCategoryData = {}, isLoading: isCategoryLoading } =
    useGetMaterialCategoryQuery({ project_id: selectedPRProject?.project_id });

  const materialCategories = materialCategoryData?.data || [];

  const [createPurchaseRequest, { isLoading: isPRCreating }] =
    useCreatePurchaseRequestMutation();

  const handlePRSubmit = async () => {
    if (!selectedPRProject?.project_id) {
      toast.error("Project ID is missing.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please select at least one item.");
      return;
    }

    const formattedItems = items.map((item) => {
      const formattedItem = {
        item_id: item._id,
      };

      const originalItem = materialCategories.find(
        (cat) => cat._id === item._id
      );
      if (originalItem?.name === "Others") {
        formattedItem.other_item_name = otherItemName;
        formattedItem.amount = otherItemAmount;
      }

      return formattedItem;
    });

    const payload = {
      project_id: selectedPRProject?.project_id,
      etd: null,
      delivery_date: null,
      items: formattedItems,
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await createPurchaseRequest(payload).unwrap();
      toast.success("Purchase Request created successfully!");
      setIsPRModalOpen(false);
      setItems([]);
      setOtherItemName("");
      setOtherItemAmount("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create Purchase Request.");
    }
  };

  const ProjectOverView = ({ currentPage, project_id, code, id }) => {
    return (
      <>
        <span
          style={{
            cursor: "pointer",
            color: theme.vars.palette.text.primary,
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            fontSize: "14px",
          }}
          onClick={() => {
            const page = currentPage;
            sessionStorage.setItem("submitInfo", id);
            navigate(`/project_detail?page=${page}&project_id=${project_id}`);
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
            const id = _id;
            sessionStorage.setItem("submitInfo", id);
            navigate(`/edit_cam_handover?page=${page}&id=${id}`);
          }}
          sx={{
            textTransform: "none",
            fontSize: "14px",
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
  const handleCreatePR = (project) => {
    setSelectedPRProject(project);
    setIsPRModalOpen(true);
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

  const draftPayments = paginatedPayments;

  const total = Number(getHandOverSheet?.total || 0);
  const pageSize = Number(rowsPerPage || 1);
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
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
          <Input
            size="sm"
            placeholder="Search by Project ID, Customer"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
      </Box>
      <Box
        display={"flex"}
        sx={{ marginLeft: { xl: "15%", lg: "18%" } }}
        justifyContent={"space-between"}
        width={"full"}
        alignItems={"center"}
      >
        <Box>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => {
              setSelectedTab(newValue);
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set("tab", newValue);
                newParams.set("page", 1);
                return newParams;
              });
            }}
            indicatorPlacement="none"
            sx={{
              bgcolor: "background.level1",
              borderRadius: "md",
              boxShadow: "sm",
              width: "fit-content",
            }}
          >
            <TabList sx={{ gap: 1 }}>
              {["All", "Handover Pending", "Scope Pending"].map(
                (label, index) => (
                  <Tab
                    key={index}
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
                )
              )}
            </TabList>
          </Tabs>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ padding: "8px 16px" }}
        >
          <Typography level="body-sm">Rows Per Page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setRowsPerPage(newValue);
                setSearchParams((prev) => {
                  const params = new URLSearchParams(prev);
                  params.set("pageSize", newValue);
                  return params;
                });
              }
            }}
            size="sm"
            variant="outlined"
            sx={{
              minWidth: 80,
              borderRadius: "md",
              boxShadow: "sm",
            }}
          >
            {options.map((value) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Box>
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
          sx={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
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
                "Purchsase Request",
              ].map((header, index) => (
                <th
                  key={index}
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
                      textAlign: "left",
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
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.is_locked === "locked" &&
                    project.status_of_handoversheet === "Approved" ? (
                      <Tooltip title="View Project Detail" arrow>
                        <span>
                          <ProjectOverView
                            currentPage={currentPage}
                            project_id={project?.project_id}
                            code={project?.code}
                            id={project?._id}
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="No Project Found" arrow>
                        <span style={{ pointerEvents: "none", opacity: 1 }}>
                          <button disabled>{project?.code}</button>
                        </span>
                      </Tooltip>
                    )}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.customer || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.number || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.state || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.scheme || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
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
                      textAlign: "left",
                    }}
                  >
                    {project.total_gst || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
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
                      textAlign: "left",
                    }}
                  >
                    <RowMenu
                      currentPage={currentPage}
                      id={project.id}
                      _id={project._id}
                    />
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    {project.is_locked === "locked" &&
                    project.status_of_handoversheet === "Approved" ? (
                      <Button
                        size="xs"
                        variant="soft"
                        color="primary"
                        startDecorator={
                          <AddCircleIcon
                            sx={{ marginRight: 0.8, fontSize: "lg" }}
                          />
                        }
                        sx={{
                          height: "35px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: "20px",
                          lineHeight: "1.5",
                        }}
                        onClick={() => handleCreatePR(project)}
                      ></Button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
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

        <Box>Showing {draftPayments.length} results</Box>

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

        {/* Next Button */}
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
        <Modal open={isPRModalOpen} onClose={() => setIsPRModalOpen(false)}>
          <ModalDialog
            sx={{
              width: 500,
              borderRadius: "md",
              boxShadow: "lg",
              p: 3,
              overflow: "visible",
            }}
          >
            <ModalClose />
            <Typography level="h5" sx={{ mb: 1 }}>
              Create Purchase Request
            </Typography>

            <Sheet
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 1,
              }}
            >
              <Typography level="body-sm" sx={{ color: "neutral.500" }}>
                Project:{" "}
                <Typography component="span" fontWeight="md">
                  {selectedPRProject?.code || "-"}
                </Typography>
              </Typography>

              <Autocomplete
                multiple
                options={materialCategories || []}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                value={items}
                onChange={(e, newValue) => setItems(newValue)}
                renderOption={(props, option, { selected }) => (
                  <li
                    {...props}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Item(s)"
                    size="small"
                  />
                )}
              />
              <Button
                onClick={handlePRSubmit}
                loading={isPRCreating}
                sx={{ mt: 1 }}
              >
                {isPRCreating ? "Submitting..." : "Submit"}
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Box>
    </>
  );
}
export default Dash_cam;
