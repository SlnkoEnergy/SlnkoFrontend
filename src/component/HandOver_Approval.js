import BlockIcon from "@mui/icons-material/Block";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import { Chip, CircularProgress, Modal, ModalDialog, Textarea } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import { useGetHandOverQuery } from "../redux/camsSlice";
import Axios from "../utils/Axios";
import { toast } from "react-toastify";

function Dash_cam() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);

  const itemsPerPage = 10;

  const {
    data: getHandOverSheet = {},
    isLoading,
    refetch,
  } = useGetHandOverQuery({
    page: currentPage,
    search: searchQuery,
    status: "draft",
  });

  const HandOverSheet = Array.isArray(getHandOverSheet?.data)
    ? getHandOverSheet.data.map((entry) => {
        return {
          ...entry,
          ...entry.customer_details,
          ...entry.order_details,
          ...entry.project_detail,
          ...entry.commercial_details,
          ...entry.other_details,
          ...entry?.scheme,
          ...entry?.submitted_by,
        };
      })
    : [];

  const totalCount = getHandOverSheet.total || 0;

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const RowMenu1 = ({ currentPage, p_id, _id, id }) => {
    const [openModal, setOpenModal] = useState(false);
    const [comment, setComment] = useState("");

    const handleReject = async () => {
      if (!comment.trim()) {
        toast.error("Please enter a comment before submitting.");
        return;
      }

      const ID = String(_id);

      try {
        const token = localStorage.getItem("authToken");

        await Axios.put(
          `/handover/update-status/${ID}`,
          {
            status_of_handoversheet: "Rejected",
            comment: comment,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        toast.success("Handover sent back to BD");
        setOpenModal(false);

        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error) {
        console.error(
          "Error updating status:",
          error.response?.data || error.message
        );
        toast.error("Failed to reject the handover.");
      }
    };

    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Chip
            variant="solid"
            color="success"
            label="Approved"
            onClick={() => {
              const page = currentPage;
              const projectId = String(id);

              sessionStorage.setItem("approvalInfo", projectId);
              navigate(`/edit_ops_handover?page=${page}&id=${projectId}`);
            }}
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<EditNoteIcon />}
          />

          <Chip
            variant="outlined"
            color="danger"
            label="Rejected"
            onClick={() => setOpenModal(true)}
            sx={{
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "sm",
            }}
            startDecorator={<BlockIcon />}
          />
        </Box>

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <ModalDialog variant="outlined" layout="center">
            <Typography level="h5">Updation Remarks</Typography>
            <Textarea
              minRows={3}
              placeholder="Enter your reason for rejection"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              }}
            >
              <Button variant="plain" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleReject}>
                Submit
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </>
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
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (currentPage > 2) {
      pages.push(1);
    }

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (currentPage < totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const paginatedPayments = filteredAndSortedData;

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const handlePageChange = (page) => {
    if (page >= 1) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  const draftPayments = paginatedPayments;

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
      <Box display={"flex"} justifyContent={"flex-end"} pb={0.5}>
        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: "sm",
            py: 1,
            display: "flex",
            gap: 1.5,
            width: "50%",
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search by Pay ID, Customer, or Name"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
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
          sx={{ width: "100%", borderCollapse: "collapse" }}
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
                "Slnko Service Charges (w/o GST)",
                "Submitted By",
                "Action",
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

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.code || "-"}
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
                    {project.service || "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {project.submitted_by || "-"}
                  </td>

                  <td
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <RowMenu1
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
    </Box>
  );
}
export default Dash_cam;
