import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import Dropdown from "@mui/joy/Dropdown";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import * as React from "react";
import { useEffect, useState } from "react";
import Axios from "../utils/Axios";

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === "desc"
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>
          {" "}
          <AddCircleOutlineIcon />
          <Typography>Add Bill</Typography>
        </MenuItem>
        <MenuItem>
          <HistoryIcon />
          <Typography>Bill History</Typography>
        </MenuItem>
        <Divider sx={{ backgroundColor: "lightblue" }} />
        <MenuItem>
          <EditNoteIcon />
          <Typography>Edit PO</Typography>
        </MenuItem>
        <MenuItem>
          <HistoryIcon />
          <Typography>PO History</Typography>
        </MenuItem>
        <Divider sx={{ backgroundColor: "lightblue" }} />
        <MenuItem color="primary" style={{ fontWeight: "bold" }}>
          Adjust Bill
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

function PurchaseOrderSummary() {
  const [pos, setPo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateFilter, setStateFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selected, setSelected] = useState([]);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>State</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by state"
          onChange={(e) => setStateFilter(e.target.value)}
          slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
        >
          <Option value="">All</Option>
          <Option value="A">A</Option>
          <Option value="B">B</Option>
          <Option value="C">C</Option>
          <Option value="D">D</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="olivia">Olivia Rhye</Option>
          <Option value="steve">Steve Hampton</Option>
          <Option value="ciaran">Ciaran Murray</Option>
          <Option value="marina">Marina Macdonald</Option>
          <Option value="charles">Charles Fulton</Option>
          <Option value="jay">Jay Hoper</Option>
        </Select>
      </FormControl>
    </>
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedPo.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (id, isSelected) => {
    setSelected((prevSelected) =>
      isSelected
        ? [...prevSelected, id]
        : prevSelected.filter((item) => item !== id)
    );
  };

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
    const fetchTableData = async () => {
      try {
        const response = await Axios.get("/get-all-po");
        setPo(Array.isArray(response.data.data) ? response.data.data : []);
        console.log("PO Data:", response.data.data);
      } catch (err) {
        console.error("Error fetching table data:", err);
        setError("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

  const totalPages = Math.ceil(pos.length / itemsPerPage);

  const paginatedPo = pos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // if (loading) {
  //   return <Typography>Loading...</Typography>;
  // }

  // if (error) {
  //   return <Typography color="danger">{error}</Typography>;
  // }

  return (
    <>
      {/* Mobile Filters */}
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: "flex", sm: "none" }, my: 1, gap: 1 }}
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
      </Sheet>

      {/* Tablet and Up Filters */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%", md: "25%" },
          borderRadius: "sm",
          py: 2,
          display: { xs: "none", sm: "flex" },
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
            placeholder="Search"
            startDecorator={<SearchIcon />}
          />
        </FormControl>
        {renderFilters()}
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
          marginLeft: { xl: "15%", md: "25%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%", md: "75%" },
        }}
      >
        {error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : loading ? (
          <Typography textAlign="center">Loading...</Typography>
        ) : (
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse" }}
          >
            <Box component="thead" sx={{ backgroundColor: "neutral.softBg" }}>
              <Box component="tr">
                <Box
                  component="th"
                  sx={{
                    padding: 1,
                    textAlign: "center",
                    borderBottom: "1px solid",
                    fontWeight: "bold",
                  }}
                >
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length !== paginatedPo.length
                    }
                    checked={selected.length === paginatedPo.length}
                    onChange={handleSelectAll}
                    color={selected.length > 0 ? "primary" : "neutral"}
                  />
                </Box>
                {[
                  "Project ID",
                  "PO Number",
                  "PO Date",
                  "Partial Billing",
                  "Item Name",
                  "Vendor",
                  "PO Value with GST",
                  "Advance Paid",
                  "Bill Status",
                  "Bill Delay",
                  "Total Billed",
                  "Action",
                  "",
                ].map((header) => (
                  <Box
                    component="th"
                    key={header}
                    sx={{
                      padding: 1,
                      textAlign: "center",
                      borderBottom: "1px solid",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {paginatedPo.length > 0 ? (
                paginatedPo.map((po) => (
                  <Box
                    component="tr"
                    key={po.id}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Checkbox
                        checked={selected.includes(po.id)}
                        onChange={(event) =>
                          handleRowSelect(po.id, event.target.checked)
                        }
                        color={selected.includes(po.id) ? "primary" : "neutral"}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.p_id}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.po_number}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.date}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.partial_billing}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.item}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.vendor}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(po.po_value)}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(po.amount_paid)}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.bill_status || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.bill_delay || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.total_billed || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {po.action || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        padding: 1,
                        textAlign: "center",
                        borderBottom: "1px solid",
                      }}
                    >
                      {RowMenu()}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={13}
                    sx={{
                      padding: 2,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    No data available
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Sheet>

      {/* Pagination */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          marginLeft: {xl: "15%", md: "25%", lg: "18%" },
        }}
      >
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

        <Box
          sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}
        >
          {generatePageNumbers(currentPage, totalPages).map((page, index) =>
            typeof page === "number" ? (
              <IconButton
                key={index}
                size="sm"
                variant={page === currentPage ? "contained" : "outlined"}
                color="neutral"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </IconButton>
            ) : (
              <Typography key={index} sx={{ px: 1, alignSelf: "center" }}>
                {page}
              </Typography>
            )
          )}
        </Box>

        {/* <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <IconButton
        key={page}
        size="sm"
        variant={page === currentPage ? "contained" : "outlined"}
        color="neutral"
        onClick={() => handlePageChange(page)}
      >
        {page}
      </IconButton>
    ))}
  </Box> */}

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
export default PurchaseOrderSummary;
