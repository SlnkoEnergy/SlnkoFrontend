import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRight from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Option, Select, Tab, TabList, Tabs } from "@mui/joy";
import { useGetPaymentRecordQuery } from "../redux/Accounts";
import InstantRequest from "./PaymentTable/Payment";
import CreditRequest from "./PaymentTable/Credit";

const PaymentRequest = forwardRef(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialPageSize = parseInt(searchParams.get("pageSize")) || 10;

  const [perPage, setPerPage] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useGetPaymentRecordQuery({
    page: currentPage,
    pageSize: perPage,
    search: searchQuery,
    status: status,
    tab: activeTab === 0 ? "instant" : "credit",
  });

  // Keep an accumulated list for infinite scroll
  const [paginatedData, setPaginatedData] = useState([]);
  const total = responseData?.meta?.total ?? responseData?.total ?? 0;

  // for header counter
  const instantTotal = responseData?.instantTotal ?? 0;
  const creditTotal = responseData?.creditTotal ?? 0;

  // for the small "x–y of total" footer (optional)
  const countThisPage =
    responseData?.count ?? (responseData?.data?.length || 0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (currentPage - 1) * perPage + (countThisPage ? 1 : 0);
  const endIndex = Math.min(startIndex + countThisPage - 1, total);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("userDetails");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  // Keep URL in sync
  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (perPage !== 10) params.pageSize = perPage;
    if (searchQuery) params.search = searchQuery;
    if (status) params.status = status;
    params.tab = activeTab === 0 ? "instant" : "credit";
    setSearchParams(params, { replace: true });
  }, [currentPage, perPage, searchQuery, status, activeTab, setSearchParams]);

  // Append rows when page > 1; reset when filters/tab/pageSize change to page 1
  const resetKey = `${activeTab}|${searchQuery}|${status}|${perPage}`;
  const prevResetKey = useRef(resetKey);

  useEffect(() => {
    // if the reset key changed and page is not 1 yet, push it to 1
    if (prevResetKey.current !== resetKey && currentPage !== 1) {
      setCurrentPage(1);
    }
    prevResetKey.current = resetKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const newRows = responseData?.data || [];
    if (!newRows) {
      setPaginatedData([]);
      return;
    }
    setPaginatedData((prev) =>
      currentPage === 1 ? newRows : [...prev, ...newRows]
    );
  }, [responseData, currentPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // triggers fresh fetch; no manual refetch()
  };

  const renderFilters = () => (
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
          onChange={(_, newValue) => {
            setStatus(newValue ?? "");
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

      {/* Table + controls */}
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
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
              setCurrentPage(1);
              // no manual refetch(); args change auto-refetch
            }}
            variant="plain"
            sx={{ borderRadius: "xl", p: 0.5, minHeight: "50px" }}
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
                  "&:hover": { backgroundColor: "neutral.softHoverBg" },
                }}
              >
                Instant ({instantTotal})
              </Tab>
              <Tab
                variant={activeTab === 1 ? "soft" : "plain"}
                color="neutral"
                disableIndicator
                sx={{
                  fontWeight: 500,
                  transition: "all 0.2s",
                  minHeight: "36px",
                  "&:hover": { backgroundColor: "neutral.softHoverBg" },
                }}
              >
                Credit ({creditTotal})
              </Tab>
            </TabList>
          </Tabs>

          {/* Search + filters */}
          <Box
            className="SearchAndFilters-tabletUp"
            sx={{
              borderRadius: "sm",
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
                  "&:hover": { borderBottom: "2px solid #1976d2" },
                  "&:focus-within": { borderBottom: "2px solid #1976d2" },
                }}
              />
            </FormControl>
            {/* status filter */}
            {renderFilters()}
          </Box>
        </Box>

        {/* Bottom controls (optional; you can hide these if you want pure infinite) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            padding: "5px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
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

          <Typography level="body-sm">
            {total ? `${startIndex}-${endIndex} of ${total}` : "—"}
          </Typography>

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

        {/* Main Content */}
        <Box>
          {activeTab === 0 ? (
            <InstantRequest
              data={paginatedData}
              isLoading={isLoading && currentPage === 1}
              isFetching={isFetching}
              perPage={perPage}
              currentPage={currentPage}
              status={status}
              totalFromParent={total}
              onLoadMore={() => setCurrentPage((p) => p + 1)}
            />
          ) : (
            <CreditRequest
              data={paginatedData}
              isLoading={isLoading && currentPage === 1}
              isFetching={isFetching}
              perPage={perPage}
              currentPage={currentPage}
              status={status}
              totalFromParent={total}
              onLoadMore={() => setCurrentPage((p) => p + 1)}
            />
          )}
        </Box>
      </Box>
    </>
  );
});
export default PaymentRequest;
