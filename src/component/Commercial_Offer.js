import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import AddIcon from '@mui/icons-material/Add';
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import { toast } from "react-toastify";
import Typography from "@mui/joy/Typography";
import { useSnackbar } from "notistack";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Axios from "../utils/Axios";

function Offer() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [accountNumber, setAccountNumber] = useState([]);
  const [ifscCode, setIfscCode] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commRate, setCommRate] = useState([]);
  const [isUtrSubmitted, setIsUtrSubmitted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Vendor</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by Vendors"
          value={vendorFilter}
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log("Selected State:", selectedValue);
            setVendorFilter(selectedValue);
          }}
        >
          <Option value="">All</Option>
          {vendors.map((vendor, index) => (
            <Option key={index} value={vendor}>
              {vendor}
            </Option>
          ))}
        </Select>
      </FormControl>
    </>
  );

  useEffect(() => {
    const fetchPaymentsAndProjects = async () => {
      setLoading(true);
      try {
        const [commResponse] = await Promise([
          Axios.get("/get-comm-offer"),
          // Axios.get("/get-all-project"),
        ]);

        // const approvedPayments = paymentResponse.data.data.filter(
        //   (payment) =>
        //     payment.acc_match === "matched" && payment.utr === ""
        // );
    const commRate = commResponse.data
        setCommRate(commRate);
        console.log("Payment Data (approved) are:", commRate);


        // const uniqueVendors = [
        //   ...new Set(
        //     paymentResponse.data.data.map((payment) => payment.vendor)
        //   ),
        // ].filter(Boolean);

        // console.log("Vendors are: ", uniqueVendors);

        // setVendors(uniqueVendors);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsAndProjects();
  }, []);

  // useEffect(() => {
  //   if (payments.length > 0 && projects.length > 0) {
  //     const merged = payments.map((payment) => {
  //       const matchingProject = projects.find(
  //         (project) => Number(project.p_id) === Number(payment.p_id)
  //       );
  //       return {
  //         ...payment,
  //         projectCode: matchingProject?.code || "-",
  //         projectName: matchingProject?.name || "-",
  //         // projectCustomer: matchingProject?.customer || "-",
  //         // projectGroup: matchingProject?.p_group || "-",
  //       };
  //     });

  //     setMergedData(merged);
  //   }
  // }, [payments, projects]);

 
  // const RowMenu = ({ currentPage, pay_id, p_id }) => {
  //   // console.log("currentPage:", currentPage, "pay_id:", pay_id, "p_id:", p_id);
  //   return (
  //     <>
  //       <Dropdown>
  //         <MenuButton
  //           slots={{ root: IconButton }}
  //           slotProps={{
  //             root: { variant: "plain", color: "neutral", size: "sm" },
  //           }}
  //         >
  //           <MoreHorizRoundedIcon />
  //         </MenuButton>
  //         <Menu size="sm" sx={{ minWidth: 100 }}>
  //           <MenuItem
  //             color="primary"
  //             onClick={() => {
  //               const page = currentPage;
  //               const payId = String(pay_id);
  //               const projectID = Number(p_id);
  //               localStorage.setItem("pay_summary", payId);
  //               localStorage.setItem("p_id", projectID);
  //               navigate(`/pay_summary?page=${page}&pay_id=${payId}`);
  //             }}
  //           >
  //             <ContentPasteGoIcon />
  //             <Typography>Pay summary</Typography>
  //           </MenuItem>

  //           {/* <MenuItem
  //             color="primary"
  //             onClick={() => navigate("/standby_records")}
  //           >
  //             <ContentPasteGoIcon />
  //             <Typography>Pending payments</Typography>
  //           </MenuItem> */}
  //           <Divider sx={{ backgroundColor: "lightblue" }} />
  //           <MenuItem color="danger">
  //             <DeleteIcon />
  //             <Typography>Delete</Typography>
  //           </MenuItem>
  //         </Menu>
  //       </Dropdown>
  //     </>
  //   );
  // };
  // const UTRRow = ({ paymentId, onAccountMatchSuccess }) => {
  //   const [utr, setUtr] = useState("");
  //   const [error, setError] = useState(null);
  //   const [isSubmitting, setIsSubmitting] = useState(false);
  //   const [isUtrSubmitted, setIsUtrSubmitted] = useState(false);
  //   const { enqueueSnackbar } = useSnackbar();

    
  // const [user, setUser] = useState(null);
  //        useEffect(() => {
  //       const userData = getUserData();
  //       setUser(userData);
  //     }, []);
      
  //     const getUserData = () => {
  //       const userData = localStorage.getItem("userDetails");
  //       if (userData) {
  //         return JSON.parse(userData);
  //       }
  //       return null;
  //     };

  //   const handleUtrSubmit = async () => {
       

  //     if (!utr) {
  //       enqueueSnackbar("Please enter a valid UTR.", { variant: "warning" });
  //       return;
  //     }
  
  //     setIsSubmitting(true); // Set loading state
  
  //     try {
  //       console.log("Submitting UTR...");
  //       const utrResponse = await Axios.put("/utr-update", {
  //         pay_id: paymentId,
  //         utr: utr,
  //       });
  
  //       console.log("UTR Response:", utrResponse);
  
  //       if (utrResponse.status === 200 && utrResponse.data) {
  //         enqueueSnackbar("UTR submitted successfully!", { variant: "success" });
  //         setIsUtrSubmitted(true);
  
  //         // Fetch PO details
  //         console.log("Fetching PO details...");
  //         const poResponse = await Axios.get("/get-pay-summary");
  //         console.log("PO Summary Response:", poResponse.data);
  
  //         // Match PO and perform debit operation
  //         const matchedPo = poResponse.data.data.find((po) => po.pay_id === paymentId);
  //         if (matchedPo) {
  //           console.log("Matched PO data:", matchedPo);
  
  //           const debitResponse = await Axios.post("/debit-money", {
  //             p_id: matchedPo.p_id,
  //             p_group: matchedPo.p_group || "",
  //             pay_type: matchedPo.pay_type || "",
  //             amount_paid: matchedPo.amount_paid || "",
  //             amt_for_customer: matchedPo.amt_for_customer || "",
  //             dbt_date: matchedPo.dbt_date || "",
  //             paid_for: matchedPo.paid_for || "",
  //             vendor: matchedPo.vendor || "",
  //             po_number: matchedPo.po_number || "",
  //             utr: matchedPo.utr || "",
  //             submitted_by: user?.name,
  //           });
  
  //           if (debitResponse.status === 200) {
  //             enqueueSnackbar("Money debited successfully!", { variant: "success" });
  //             console.log("Money debited successfully:", debitResponse.data);
  
  //             // Call the parent callback if provided
  //             if (onAccountMatchSuccess) {
  //               onAccountMatchSuccess(utr);
  //             }
  //           } else {
  //             enqueueSnackbar("Failed to debit money. Please try again.", { variant: "error" });
  //           }
  //         } else {
  //           enqueueSnackbar("Matching PO not found.", { variant: "error" });
  //         }
  //       } else {
  //         enqueueSnackbar("Failed to submit UTR. Please try again.", { variant: "error" });
  //       }
  //     } catch (error) {
  //       console.error("Error during UTR submission:", error);
  //       enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };
  
  //   return (
  //     <div style={{ marginTop: "1rem" }}>
  //       {!isUtrSubmitted ? (
  //         <form
  //           onSubmit={(e) => {
  //             e.preventDefault();
  //             handleUtrSubmit();
  //           }}
  //         >
  //           <input
  //             type="text"
  //             placeholder="Enter UTR"
  //             value={utr}
  //             onChange={(e) => setUtr(e.target.value)}
  //             disabled={isSubmitting}
  //             style={{
  //               width: "100%",
  //               padding: "0.5rem",
  //               marginBottom: "0.5rem",
  //               border: "1px solid #ccc",
  //             }}
  //             required
  //           />
  //           <Button
  //             type="submit"
  //             disabled={isSubmitting || !utr}
  //             sx={{
  //               width: "100%",
  //               padding: "0.5rem",
  //               backgroundColor: "#28a745",
  //               color: "white",
  //               cursor: isSubmitting ? "not-allowed" : "pointer",
  //             }}
  //           >
  //             {isSubmitting ? "Submitting..." : "Submit UTR"}
  //           </Button>
  //         </form>
  //       ) : (
  //         <div style={{ marginTop: "1rem" }}>
  //           <p>UTR: {utr}</p>
  //           <Button
  //             sx={{
  //               width: "100%",
  //               padding: "0.5rem",
  //               backgroundColor: "gray",
  //               color: "white",
  //             }}
  //             disabled
  //           >
  //             Submitted
  //           </Button>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // const handleAccountMatchSuccess = (utr) => {
  //   console.log("UTR submission was successful:", utr);
  // };

  // /** Match Logic ***/
  // const MatchRow = ({ payment }) => (
  //   <Chip
  //     variant="soft"
  //     size="sm"
  //     startDecorator={
  //       payment.acc_match === "matched" ? <CheckRoundedIcon /> : <BlockIcon />
  //     }
  //     color={payment.acc_match === "matched" ? "success" : "danger"}
  //   >
  //     {payment.acc_match === "matched" ? payment.acc_match : "match"}
  //   </Chip>
  // );

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredAndSortedData = commRate
    .filter((project) => {
      const matchesSearchQuery = ["pay_id", "projectName", "vendor"].some(
        (key) => project[key]?.toLowerCase().includes(searchQuery)
      );

      // const matchesVendorFilter =
      //   !vendorFilter || project.vendor === vendorFilter;
      // console.log("MatchVendors are: ", matchesVendorFilter);

      return matchesSearchQuery;
    })

    .sort((a, b) => {
      if (a.projectName?.toLowerCase().includes(searchQuery)) return -1;
      if (b.projectName?.toLowerCase().includes(searchQuery)) return 1;
      if (a.vendor?.toLowerCase().includes(searchQuery)) return -1;
      if (b.vendor?.toLowerCase().includes(searchQuery)) return 1;
      if (a.pay_id?.toLowerCase().includes(searchQuery)) return -1;
      if (b.pay_id?.toLowerCase().includes(searchQuery)) return 1;
      return 0;
    });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(mergedData.map((row) => row.id));
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
          marginLeft: { md: "25%", lg: "18%", xl: "15%" },
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
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    size="sm"
                    checked={selected.length === paginatedPayments.length}
                    onChange={(event) =>
                      handleRowSelect("all", event.target.checked)
                    }
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
                  "Rate",
                  "Add Costing",
                  "Prepared By",
                  "View More",
                  // "Validation",
                ].map((header, index) => (
                  <Box
                    component="th"
                    key={index}
                    sx={{
                      borderBottom: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {paginatedPayments.filter(
                (payment) =>
                  payment.acc_match === "matched"
              ).length > 0 ? (
                paginatedPayments
                  .filter(
                    (payment) =>
                      payment.acc_match === "matched"
                  )
                  .map((payment, index) => (
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
                          textAlign: "center",
                        }}
                      >
                        <Checkbox
                          size="sm"
                          checked={selected.includes(payment.pay_id)}
                          onChange={(event) =>
                            handleRowSelect(
                              payment.pay_id,
                              event.target.checked
                            )
                          }
                        />
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.pay_id}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.projectCode}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.projectName || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.paid_for || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.vendor || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {payment.comment || "-"}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {Number(payment.amt_for_customer).toLocaleString("en-IN")}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                           <Tooltip title="Add" arrow>
    <IconButton
      size="small"
      sx={{
        backgroundColor: "skyblue",
        color: "white",
        '&:hover': {
          backgroundColor: "#45a049",
        },
        borderRadius: "50%",
        padding: "4px",
      }}
    >
      <AddIcon fontSize="small" />
    </IconButton>
  </Tooltip>

                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                         {/* <UTRRow paymentId={payment.pay_id} onAccountMatchSuccess={handleAccountMatchSuccess} /> */}
                      </Box>
                      <Box
                        component="td"
                        sx={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                         {/* <UTRRow paymentId={payment.pay_id} onAccountMatchSuccess={handleAccountMatchSuccess} /> */}
                      </Box>
                    </Box>
                  ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={10}
                    sx={{
                      padding: "8px",
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
          marginLeft: { md: "25%", lg: "18%", xl: "15%" },
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
export default Offer;
