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
import { useMemo, useState } from "react";
import NoData from "../assets/alert-bell.svg";

function Dash_task() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const mockData = [
    {
      _id: "1",
      code: "PRJ001",
      customer: "K Venkatesh",
      name: "K Venkatesh",
      number: "9491010011",
      state: "Telangana",
    },
    {
      _id: "2",
      code: "PRJ002",
      customer: "Brave Force Multiservices Private Limited",
      name: "Ashish Sengar",
      number: "9536947017",
      state: "Uttar Pradesh",
    },
    {
      _id: "3",
      code: "PRJ003",
      customer: "Krishn Chandra",
      name: "Mihir Mandal",
      number: "8093098376",
      state: "Odisha",
    },
    {
      _id: "4",
      code: "PRJ004",
      customer: "BHAJANA RAM GREEN ENERGY",
      name: "Umesh",
      number: "8290805560",
      state: "Rajasthan",
    },
    {
      _id: "5",
      code: "PRJ005",
      customer: "Simran Barawarda",
      name: "Simran Sharma",
      number: "9660572204",
      state: "Rajasthan",
    },
    {
      _id: "6",
      code: "PRJ006",
      customer: "Anjaly Chaudhry",
      name: "Sachin",
      number: "8755759438",
      state: "Uttar Pradesh",
    },
    {
      _id: "7",
      code: "PRJ007",
      customer: "Patratu Vidyut Utpadan Nigam LTD",
      name: "PVUNL-Patratu",
      number: "1234567890",
      state: "Jharkhand",
    },
    {
      _id: "8",
      code: "PRJ008",
      customer: "Phalwaan Solar Private Limited",
      name: "Chandra Prakash",
      number: "123456780",
      state: "Madhya Pradesh",
    },
    {
      _id: "9",
      code: "PRJ009",
      customer: "Nalla Ajay",
      name: "Ajay Nalla",
      number: "9177481351",
      state: "Rajasthan",
    },
    {
      _id: "10",
      code: "PRJ010",
      customer: "Priyanka Yadav",
      name: "Ravindra Yadav",
      number: "9887487939",
      state: "Rajasthan",
    },
  ];

  const filteredData = useMemo(() => {
    return mockData.filter((project) =>
      ["code", "customer", "state"].some((key) =>
        project[key]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const handleSearch = (query) => setSearchQuery(query.toLowerCase());

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? filteredData.map((d) => d._id) : []);
  };

  const handleRowSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1) setCurrentPage(page);
  };

  const draftPayments = filteredData;

  return (
    <>
      {/* Search */}
      <Box
        className="SearchAndFilters-tabletUp"
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
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by ProjectId , Customer , Type , or , State"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
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
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "neutral.softBg" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>
                <Checkbox
                  size="sm"
                  checked={selected.length === draftPayments.length}
                  onChange={handleSelectAll}
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < draftPayments.length
                  }
                />
              </th>
              {[
                "Project Id",
                "Customer",
                "Project Name",
                "Mobile",
                "State",
                "Capacity(AC/DC)",
                "Status",
              ].map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draftPayments.length > 0 ? (
              draftPayments.map((project, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                    <Checkbox
                      size="sm"
                      checked={selected.includes(project._id)}
                      onChange={() => handleRowSelect(project._id)}
                    />
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{project.code}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{project.customer}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{project.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{project.number}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{project.state}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>-</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Not defined</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "16px" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img src={NoData} alt="No data" style={{ width: 50, marginBottom: 8 }} />
                    <Typography fontStyle="italic">No Handover Sheet Found</Typography>
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

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton size="sm" variant="contained" color="neutral">
            {currentPage}
          </IconButton>
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {currentPage + 1}
          </IconButton>
        </Box>

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </Box>
    </>
  );
}

export default Dash_task;
