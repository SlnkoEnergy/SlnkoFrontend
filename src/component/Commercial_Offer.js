import { Player } from "@lottiefiles/react-lottie-player";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ContentPasteGoIcon from "@mui/icons-material/ContentPasteGo";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PermScanWifiIcon from "@mui/icons-material/PermScanWifi";
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
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import NoData from "../assets/alert-bell.svg";
import animationData from "../assets/Lotties/animation-loading.json";
import Axios from "../utils/Axios";

function Offer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selected, setSelected] = useState([]);
  const [bdRateData, setBdRateData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commRate, setCommRate] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchCommAndBdRate = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No auth token found in localStorage.");
        }
        // Fetch commercial offer and BD rate
        const [commResponse, bdRateResponse] = await Promise.all([
          Axios.get("/get-comm-offer", {
            headers: {
              "x-auth-token": token,
            },
          }),
          Axios.get("/get-comm-bd-rate", {
            headers: {
              "x-auth-token": token,
            },
          }),
        ]);

        const newCommRate = commResponse.data;
        const bdRateData = bdRateResponse.data;

        // Update commercial offer data only if different
        setCommRate((prevCommRate) => {
          if (JSON.stringify(prevCommRate) !== JSON.stringify(newCommRate)) {
            console.log("Commercial Offer updated:", newCommRate);
            return newCommRate;
          }
          return prevCommRate;
        });

        // Store BD Rate Data
        setBdRateData(bdRateData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "red",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <PermScanWifiIcon />
            <Typography
              fontStyle={"italic"}
              fontWeight={"600"}
              sx={{ color: "#0a6bcc" }}
            >
              Sit Back! Internet Connection will be back soon..
            </Typography>
          </span>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCommAndBdRate();
  }, []);

  useEffect(() => {
    if (commRate.length > 0) {
      const mergedData = commRate.map((offer) => {
        const matchingBdRate = bdRateData.find(
          (bd) => bd.offer_id === offer.offer_id
        );
        return {
          ...offer,
          slnkoCharges: matchingBdRate ? matchingBdRate.slnko_charges : 0,
        };
      });
      setMergedData(mergedData);
    }
  }, [commRate, bdRateData]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    console.log(storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const RowMenu = ({ currentPage, offer_id }) => {

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

    return (
      <>
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "plain", color: "neutral", size: "sm" },
            }}
          >
            <MoreHorizRoundedIcon />
          </MenuButton>
          {
          (user?.name === "IT Team" ||
            user?.department === "admin" ||
            user?.name === "Navin Kumar Gautam" ||
            user?.name === "Mohd Shakir Khan" ||
            user?.name === "Shiv Ram Tathagat" ||
            user?.name === "Kana Sharma" ||
            user?.name === "Ketan Kumar Jha" ||
            user?.name === "Vibhav Upadhyay" ||
            user?.name === "Shantanu Sameer" ||
            user?.name === "Arnav Shahi" ||
            user?.name === "Shambhavi Gupta" ||
            user?.name === "Geeta" ||
            user?.name === "Anudeep Kumar" ||
            user?.name === "Ashish Jha" ||
            user?.name === "Abhishek Sawhney" ||
            user?.name === "Ankit Dikshit" ||
            user?.name === "Kunal Kumar" ||
            user?.name === "Deepak Manodi"
          )
          && (
            <Menu size="sm" sx={{ minWidth: 140 }}>
              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const offerId = String(offer_id);
                  localStorage.setItem("offer_edit", offerId);
                  navigate(`/edit_offer?page=${page}&offer_id=${offerId}`);
                }}
              >
                <ContentPasteGoIcon />
                <Typography>Edit Offer</Typography>
              </MenuItem>
              <MenuItem
                color="primary"
                onClick={() => {
                  const page = currentPage;
                  const offerId = String(offer_id);
                  localStorage.setItem("offer_summary", offerId);
                  navigate(`/offer_summary?page=${page}&offer_id=${offerId}`);
                }}
              >
                <EditNoteIcon />
                <Typography>Edit BD Rate</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const page = currentPage;
                  const offerId = String(offer_id);
                  localStorage.setItem("get-offer", offerId);
                  navigate(`/bd_history?page=${page}&offer_id=${offerId}`);
                }}
              >
                <HistoryIcon />
                <Typography>Offer History</Typography>
              </MenuItem>
              <Divider sx={{ backgroundColor: "lightblue" }} />
              {(user?.name === "IT Team" || user?.department === "admin" || user?.name === "Deepak Manodi") && (
                <MenuItem
                  color="danger"
                  disabled={selected.length === 0}
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                  <Typography>Delete</Typography>
                </MenuItem>
              )}
            </Menu>
          )}
        </Dropdown>
      </>
    );
  };

  const AddMenu = ({ currentPage, offer_id }) => {
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

    return (
      <>
        {
        (user?.name === "IT Team" ||
            user?.department === "admin" || user?.department === "BD" ||
            user?.name === "Navin Kumar Gautam" ||
            user?.name === "Mohd Shakir Khan" ||
            user?.name === "Shiv Ram Tathagat" ||
            user?.name === "Kana Sharma" ||
            user?.name === "Ketan Kumar Jha" ||
            user?.name === "Vibhav Upadhyay" ||
            user?.name === "Shantanu Sameer" ||
            user?.name === "Arnav Shahi" ||
            user?.name === "Shambhavi Gupta" ||
            user?.name === "Geeta" ||
            user?.name === "Anudeep Kumar" ||
            user?.name === "Ashish Jha" ||
            user?.name === "Abhishek Sawhney" ||
            user?.name === "Ankit Dikshit" ||
            user?.name === "Kunal Kumar" ||
            user?.name === "Deepak Manodi")
             ? (
          <Tooltip title="Add" arrow>
            <IconButton
              size="small"
              sx={{
                backgroundColor: "skyblue",
                color: "white",
                "&:hover": { backgroundColor: "#45a049" },
                borderRadius: "50%",
                padding: "4px",
              }}
              onClick={() => {
                if (offer_id) {
                  const page = currentPage;
                  const offerId = String(offer_id);
                  localStorage.setItem("offer_rate", offerId);
                  navigate(`/offer_rate?page=${page}&offer_id=${offerId}`);
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Not Authorized" arrow>
            <IconButton
              size="small"
              disabled
              sx={{
                backgroundColor: "gray",
                color: "red",
                borderRadius: "50%",
                padding: "4px",
              }}
            >
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </>
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      toast.error("No offers selected for deletion.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No auth token found in localStorage.");
      }

      for (const _id of selected) {
        await Axios.delete(`/delete-offer/${_id}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        setCommRate((prev) => prev.filter((item) => item._id !== _id));
        setBdRateData((prev) => prev.filter((item) => item.offer_id !== _id));
        setMergedData((prev) => prev.filter((item) => item.offer_id !== _id));
      }

      toast.success("Deleted successfully.");
      setSelected([]);
    } catch (err) {
      console.error("Error deleting offers:", err);
      setError(err.response?.data?.msg || "Failed to delete selected offers.");
      toast.error("Failed to delete selected offers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = useMemo(() => {
    if (!user || !user.name) return [];
    const data = mergedData
      .filter((project) => {
        const preparedBy =
          project.prepared_by?.trim() || "unassigned";
        const userName = user.name.trim();
        const userRole = user.department?.toLowerCase();

        const isAdmin = userRole === "admin" || userRole === "superadmin" || userName === "Deepak Manodi";
        const matchesUser = isAdmin || preparedBy === userName;

        const matchesSearchQuery = [
          "offer_id",
          "client_name",
          "state",
          "prepared_by",
        ].some((key) => project[key]?.toLowerCase().includes(searchQuery));

        return matchesUser && matchesSearchQuery;
      })
      console.log({data})
    return data 
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        return dateB - dateA;
      });
  }, [mergedData, searchQuery, user]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(commRate.map((row) => row._id));
    } else {
      setSelected([]);
    }
  };

  const handleRowSelect = (_id) => {
    setSelected((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
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
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedPayments = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page });
      setCurrentPage(page);
    }
  };

  return (
    <>
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
          <FormLabel>Search here</FormLabel>
          <Input
            size="sm"
            placeholder="Search by Pay ID, Customer, or Name"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
      </Box>

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
        {error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : loading ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100px"
          >
            <Player
              autoplay
              loop
              src={animationData}
              style={{ height: 100, width: 100 }}
            />
          </Box>
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
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
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
                </Box>
                {[
                  "Offer Id",
                  "Client Name",
                  "State Name",
                  "Ac Capacity(MW)",
                  "Scheme",
                  "Component",
                  "Latest Rate",
                  "Add BD Rate",
                  "Prepared By",
                  "View More",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((offer, index) => (
                  <Box
                    component="tr"
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "neutral.plainHoverBg" },
                    }}
                  >
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selected.includes(offer._id)}
                        onChange={(event) =>
                          handleRowSelect(offer._id, event.target.checked)
                        }
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.offer_id}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.client_name}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.state || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.ac_capacity || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.scheme || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.component || "-"}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.slnkoCharges.toLocaleString("en-IN")}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <AddMenu
                        currentPage={currentPage}
                        offer_id={offer.offer_id}
                      />
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      {offer.prepared_by || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      <RowMenu
                        currentPage={currentPage}
                        offer_id={offer.offer_id}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={12}
                    sx={{
                      padding: "8px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
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
                      <img
                        src={NoData}
                        alt="No data Image"
                        style={{ width: "50px", height: "50px" }}
                      />
                      <Typography fontStyle={"italic"}>
                        No offer available
                      </Typography>
                    </Box>
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
          // display: { xs: "none", md: "flex" },
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
        <Box>
          Showing {paginatedPayments.length} of {filteredAndSortedData.length}{" "}
          results
        </Box>
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
export default Offer;
