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
    tab: activeTab === 0 ? "instant" : "credit",
  });

  const paginatedData = responseData?.data || [];
  const total = responseData?.total || 0;
  const count = responseData?.count || paginatedData.length;

  const totalPages = Math.ceil(total / perPage);
  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(startIndex + count - 1, total);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const getUserData = () => {
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  useEffect(() => {
    const params = {};

    if (currentPage > 1) params.page = currentPage;
    if (perPage !== 10) params.pageSize = perPage;
    if (searchQuery) params.search = searchQuery;
    if (status) params.status = status;
    params.tab = activeTab === 0 ? "instant" : "credit";

    setSearchParams(params, { replace: true });
  }, [currentPage, perPage, searchQuery, status, activeTab, setSearchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    refetch();
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
        <FormControl size="sm" sx={{ minWidth: 80 }}>
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

  // const filteredData = paginatedData.filter((item) =>
  //   activeTab === 0 ? item.tab === "instant" : item.tab === "credit"
  // );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          mb: 1,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "start", sm: "center" },
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginLeft: { xl: "15%", lg: "18%" },
        }}
      >
        <Box>
          <Typography level="h2" component="h1">
            Payment Records
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "none", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            {" "}
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.department === "admin" ||
              user?.name === "Shubham Gupta" ||
              user?.name === "Gagan Tayal" ||
              user?.name === "Ajay Singh") && (
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate("/pay_Request")}
              >
                Add New Payment +
              </Button>
            )}
            {(user?.name === "IT Team" ||
              user?.name === "Guddu Rani Dubey" ||
              user?.name === "Prachi Singh" ||
              user?.department === "admin" ||
              user?.name === "Ajay Singh" ||
              user?.name === "Aryan Maheshwari" ||
              user?.name === "Sarthak Sharma" ||
              user?.name === "Naresh Kumar" ||
              user?.name === "Shubham Gupta" ||
              user?.name === "Saurabh Suman" ||
              user?.name === "Sandeep Yadav" ||
              user?.name === "Som Narayan Jha" ||
              user?.name === "Gagan Tayal" ||
              user?.name === "Saresh") && (
              <Button
                color="danger"
                size="sm"
                onClick={() => navigate("/standby_records")}
              >
                Trash
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: "sm",
          overflow: "auto",
          minHeight: 0,
          ml: { xl: "15%", lg: "18%", sm: 0 },
          maxWidth: { lg: "85%", sm: "100%" },
          p: 2,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: 1,
            py: 1,
            // bgcolor: "background.level1",
            borderRadius: "md",
            // mb: 2,
          }}
        >
          {/* Horizontal Tabs like screenshot */}
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
              setCurrentPage(1);
              refetch();
            }}
            variant="plain"
            sx={{
              borderRadius: "xl",
              p: 0.5,
              minHeight: "50px",
            }}
          >
            <TabList
              disableUnderline
              sx={{
                borderRadius: "xl",
                overflow: "hidden",
                minHeight: "36px",
                backgroundColor: "background.level1",
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
              }}
            >
              <Tab
                variant={activeTab === 0 ? "soft" : "plain"}
                color="neutral"
                disableIndicator
                sx={{
                  fontWeight: 500,
                  transition: "all 0.2s",
                  minHeight: "36px",
                  "&:hover": {
                    backgroundColor: "neutral.softHoverBg",
                  },
                  ...(activeTab === 0),
                }}
              >
                Instant
              </Tab>
              <Tab
                variant={activeTab === 1 ? "soft" : "plain"}
                color="neutral"
                disableIndicator
                sx={{
                  fontWeight: 500,
                  transition: "all 0.2s",
                  minHeight: "36px",
                  "&:hover": {
                    backgroundColor: "neutral.softHoverBg",
                  },
                  ...(activeTab === 1),
                }}
              >
                Credit
              </Tab>
            </TabList>
          </Tabs>
          <Box
            className="SearchAndFilters-tabletUp"
            sx={{
              borderRadius: "sm",
              // py: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2,
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
                sx={{
                  width: 350,

                  borderColor: "neutral.outlinedBorder",
                  borderBottom: searchQuery
                    ? "2px solid #1976d2"
                    : "1px solid #ddd",
                  borderRadius: 5,
                  boxShadow: "none",
                  "&:hover": {
                    borderBottom: "2px solid #1976d2",
                  },
                  "&:focus-within": {
                    borderBottom: "2px solid #1976d2",
                  },
                }}
              />
            </FormControl>
            {renderFilters()}
          </Box>

          {/* Pagination Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {/* Rows per page */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography level="body-sm">Rows per page:</Typography>
              <Select
                size="sm"
                value={perPage}
                onChange={(_, value) => {
                  if (value) {
                    setPerPage(Number(value));
                    setCurrentPage(1);
                  }
                }}
                sx={{ minWidth: 64 }}
              >
                {[10, 25, 50, 100].map((value) => (
                  <Option key={value} value={value}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Box>

            {/* Pagination info */}
            <Typography level="body-sm">
              {`${startIndex}-${endIndex} of ${total}`}
            </Typography>

            {/* Navigation buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <KeyboardDoubleArrowLeft />
              </IconButton>
              <IconButton
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                <KeyboardArrowRight />
              </IconButton>
              <IconButton
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <KeyboardDoubleArrowRight />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box>
          {activeTab === 0 ? (
            <InstantRequest
              key={`instant-${searchQuery}-${currentPage}`}
              data={paginatedData}
              isLoading={isLoading}
            />
          ) : (
            <CreditRequest
              key={`credit-${searchQuery}-${currentPage}`}
              data={paginatedData}
              isLoading={isLoading}
            />
          )}
        </Box>
      </Box>
    </>
  );
});
export default PaymentRequest;
