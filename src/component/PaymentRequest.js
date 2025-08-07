import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../assets/alert-bell.svg";
import {
  CircularProgress,
  Modal,
  Option,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
  useTheme,
} from "@mui/joy";
import { FileText } from "lucide-react";
import { PaymentProvider } from "../store/Context/Payment_History";
import PaymentHistory from "./PaymentHistory";
import { useGetPaymentRecordQuery } from "../redux/Accounts";
import dayjs from "dayjs";
import InstantRequest from "./PaymentTable/Payment";
import CreditRequest from "./PaymentTable/Credit";

const PaymentRequest = forwardRef((props, ref) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;
  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabValue = activeTab === 0 ? "instant" : "credit";

  const {
    data: responseData,
    isLoading,
    refetch,
  } = useGetPaymentRecordQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
    status: status,
    tab: tabValue,
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  const totalPages = Math.ceil(total / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  // const handleSelectAll = (event) => {
  //   if (event.target.checked) {
  //     setSelected(paginatedData.map((row) => row.id));
  //   } else {
  //     setSelected([]);
  //   }
  // };

  // const handleRowSelect = (id, isSelected) => {
  //   setSelected((prevSelected) =>
  //     isSelected
  //       ? [...prevSelected, id]
  //       : prevSelected.filter((item) => item !== id)
  //   );
  // };
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };



  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const renderFilters = () => {
    return (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <FormControl size="sm" sx={{ minWidth: 150 }}>
          <FormLabel>Select Status</FormLabel>
          <Select
            value={status || ""}
            onChange={(e, newValue) => {
              setStatus(newValue);
              setCurrentPage(1);
            }}
            placeholder="All"
          >
            <Option value="">All</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Rejected">Rejected</Option>
          </Select>
        </FormControl>
      </Box>
    );
  };

  return (
    <>
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          marginLeft: { xl: "15%", lg: "18%" },
          borderRadius: "sm",
          py: 2,
          // display: { xs: "none", sm: "flex" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
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
            placeholder="Search by Pay ID, Items, Clients Name or Vendor"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Table */}
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: "flex", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
          marginLeft: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, value) => {
            setActiveTab(value);
            setCurrentPage(1);
          }}
        >
          <TabList>
            <Tab>Instant</Tab>
            <Tab>Credit</Tab>
          </TabList>

          <TabPanel value={0}>
            <InstantRequest data={paginatedData} isLoading={isLoading}  />
          </TabPanel>

          <TabPanel value={1}>
            <CreditRequest data={paginatedData} isLoading={isLoading} />
          </TabPanel>
        </Tabs>
      </Sheet>
    </>
  );
});
export default PaymentRequest;
