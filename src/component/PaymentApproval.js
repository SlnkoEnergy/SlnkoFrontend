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
import Typography from "@mui/joy/Typography";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../utils/Axios";

function PaymentRequest() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [groupFilter, setGroupFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [credits, setCredits] = useState([]);
  const [debits, setDebits] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total_Credit, setTotal_Credit] = useState(0);
  const [total_Debit, setTotal_Debit] = useState(0);
  const [available_Amount, setAvailable_Amount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [CreditSumup, setCreditSumUp] = useState([]);
  const [DebitSumup, setDebitSumUp] = useState([]);

  const renderFilters = () => (
    <>
      <FormControl size="sm">
        <FormLabel>Group Name</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by group"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <Option value="">All</Option>
          {groups.map((group, index) => (
            <Option key={index} value={group}>
              {group}
            </Option>
          ))}
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Customer</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by customer"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        >
          <Option value="">All</Option>
          {customers.map((customer, index) => (
            <Option key={index} value={customer}>
              {customer}
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
        // Fetch all required data in parallel
        const [
          paymentResponse,
          projectResponse,
          creditResponse,
          debitResponse,
        ] = await Promise.all([
          Axios.get("/get-pay-summary", { params: { approved: "Pending" } }),
          Axios.get("/get-all-project"),
          Axios.get("/all-bill"),
          Axios.get("/get-subtract-amount"),
        ]);

        // Handle payments data
        const pendingPayments =
          paymentResponse.data?.data?.filter(
            (payment) => payment.approved === "Pending"
          ) || [];
        setPayments(pendingPayments);

        // Handle projects data
        const projectData = projectResponse.data?.data || [];
        setProjects(projectData);

        // Handle credits and debits data
        const creditData = creditResponse.data?.bill || [];
        const debitData = debitResponse.data?.data || [];

        setCredits(creditData);
        setDebits(debitData);

        // Calculate total credits and debits
        const totalCredit = creditData.reduce(
          (sum, row) => sum + (parseFloat(row.cr_amount) || 0),
          0
        );
        const totalDebit = debitData.reduce(
          (sum, row) => sum + (parseFloat(row.amount_paid) || 0),
          0
        );

        setTotal_Credit(totalCredit.toLocaleString("en-IN"));
        setTotal_Debit(totalDebit.toLocaleString("en-IN"));

        // Calculate total credit, total debit, and available amount for each projec

        // Calculate overall available amount
        // const availableAmount = totalCredit - totalDebit;
        // setAvailable_Amount(
        //   Math.round(availableAmount).toLocaleString("en-IN")
        // );

        // Logging for debugging
        // console.log("Total Credit:", totalCredit);
        // console.log("Total Debit:", totalDebit);
        // console.log("Available Amount (Overall):", availableAmount);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsAndProjects();
  }, []);

  useEffect(() => {
    if (
      payments.length > 0 &&
      projects.length > 0 &&
      credits.length > 0 &&
      debits.length > 0
    ) {
      const creditSumMap = credits.reduce((acc, credit) => {
        const projectId = credit.p_id;
        acc[projectId] = (acc[projectId] || 0) + Number(credit.cr_amount);
        return acc;
      }, {});

      const debitSumMap = debits.reduce((acc, debit) => {
        const projectId = debit.p_id;
        const amountPaid = Number(debit.amount_paid);
        acc[projectId] =
          (acc[projectId] || 0) + (isNaN(amountPaid) ? 0 : amountPaid);
        return acc;
      }, {});

      const groupCreditMap = {};
      const groupDebitMap = {};
      const groupBalanceMap = {};

      projects.forEach((project) => {
        const group = project.p_group;

        if (!groupCreditMap[group]) groupCreditMap[group] = 0;
        if (!groupDebitMap[group]) groupDebitMap[group] = 0;

        groupCreditMap[group] += creditSumMap[project.p_id] || 0;
        groupDebitMap[group] += debitSumMap[project.p_id] || 0;

        groupBalanceMap[group] = groupCreditMap[group] - groupDebitMap[group];
      });

      // console.log("Group Balance Map:", groupBalanceMap);

      const merged = payments.map((payment) => {
        const matchingProject = projects.find(
          (project) => Number(project.p_id) === Number(payment.p_id)
        );
        const aggregateCredit = creditSumMap[payment.p_id] || 0;
        const aggregateDebit = debitSumMap[payment.p_id] || 0;

        const projectGroup = matchingProject?.p_group || "-";
        const groupBalance =
          projectGroup !== "-" ? groupBalanceMap[projectGroup] || "-" : 0;

        return {
          ...payment,
          projectCode: matchingProject?.code || "-",
          projectName: matchingProject?.name || "-",
          projectCustomer: matchingProject?.customer || "-",
          projectGroup,
          aggregateCredit,
          aggregateDebit,
          Available_Amount: (aggregateCredit - aggregateDebit).toLocaleString(
            "en-IN"
          ),
          groupBalance: Math.round(groupBalance).toLocaleString("en-IN"),
        };
      });

      console.log("Merged Data:", merged);

      setMergedData(merged);
    }
  }, [payments, projects, credits, debits]);

  // const handleApprovalUpdate = async (paymentId, newStatus) => {
  //   try {
  //     const response = await Axios.put("/account-approve", {
  //       pay_id: paymentId,
  //       status: newStatus,
  //     });

  //     if (response.status === 200) {
  //       setPayments((prevPayments) =>
  //         prevPayments.filter((payment) => payment.pay_id !== paymentId)
  //       );

  //       if (newStatus === "Approved") {
  //         toast.success("Payment Approved !!", {
  //           autoClose: 3000,
  //         });
  //       } else if (newStatus === "Rejected") {
  //         toast.error("Oops!! Rejected...", {
  //           autoClose: 2000,
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error updating approval status:", error);
  //   }
  // };

  // const RowMenu = ({ paymentId }) => {
  //   const [status, setStatus] = useState(null); // Tracks the current status

  //   const handleApprovalUpdate = (paymentId, newStatus) => {
  //     setStatus(newStatus); // Update the chip label based on the new status
  //     console.log(`Payment ID: ${paymentId}, Status: ${newStatus}`);
  //   };

  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "center",
  //         gap: 1,
  //       }}
  //     >
  //       {/* Approve Chip */}
  //       <Chip
  //         variant="solid"
  //         color={status === "Approved" ? "success" : "neutral"}
  //         onClick={() => handleApprovalUpdate(paymentId, "Approved")}
  //         sx={{
  //           textTransform: "none",
  //           fontSize: "0.875rem",
  //           fontWeight: 500,
  //           borderRadius: "sm", // Small border radius for a rectangular look
  //           cursor: "pointer",
  //         }}
  //         startDecorator={<CheckRoundedIcon />}
  //       >
  //         {status === "Approved" ? "Approved" : "Approve"}
  //       </Chip>

  //       {/* Reject Chip */}
  //       <Chip
  //         variant="outlined"
  //         color={status === "Rejected" ? "danger" : "neutral"}
  //         onClick={() => handleApprovalUpdate(paymentId, "Rejected")}
  //         sx={{
  //           textTransform: "none",
  //           fontSize: "0.875rem",
  //           fontWeight: 500,
  //           borderRadius: "sm", // Small border radius for a rectangular look
  //           cursor: "pointer",
  //         }}
  //         startDecorator={<BlockIcon />}
  //       >
  //         {status === "Rejected" ? "Rejected" : "Reject"}
  //       </Chip>
  //     </Box>
  //   );
  // };

  const handleApprovalUpdate = async (paymentId, newStatus) => {
    try {
      const response = await Axios.put("/account-approve", {
        pay_id: paymentId,
        status: newStatus,
      });

      if (response.status === 200) {
        // Update the payments state to remove the row
        setPayments((prevPayments) =>
          prevPayments.filter((payment) => payment.pay_id !== paymentId)
        );

        // Show a toast message
        if (newStatus === "Approved") {
          toast.success("Payment Approved !!", { autoClose: 3000 });
        } else if (newStatus === "Rejected") {
          toast.error("Payment Rejected...", { autoClose: 2000 });
        }
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error(`Already Done.. Please refresh it.`);
    }
  };

  const RowMenu = ({ paymentId, onStatusChange }) => {
    const [status, setStatus] = useState(null);

    const handleChipClick = (newStatus) => {
      setStatus(newStatus);
      onStatusChange(paymentId, newStatus);
    };

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {/* Approve Chip */}
        <Chip
          variant="solid"
          color="success"
          label="Approved"
          onClick={() => handleChipClick("Approved")} // Pass a function reference, not invoke it directly
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "sm",
          }}
          startDecorator={<CheckRoundedIcon />}
        />

        {/* Reject Chip */}
        <Chip
          variant="outlined"
          color="danger"
          label="Rejected"
          onClick={() => handleChipClick("Rejected")} // Pass a function reference to onClick
          sx={{
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "sm",
          }}
          startDecorator={<BlockIcon />}
        />
      </Box>
    );
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    await handleApprovalUpdate(paymentId, newStatus);

    setPayments((prevPayments) =>
      prevPayments.filter((payment) => payment.pay_id !== paymentId)
    );
  };

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
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredData = mergedData.filter((merged) => {
    const matchesSearchQuery = [
      "pay_id",
      "projectCode",
      "projectCustomer",
      "projectName",
      "paid_for",
    ].some((key) => merged[key]?.toLowerCase().includes(searchQuery));
    const matchesGroupFilter =
      !groupFilter || merged.projectGroup === groupFilter;
    const matchesCustomerFilter =
      !customerFilter || merged.projectCustomer === customerFilter;

    return matchesSearchQuery && matchesGroupFilter && matchesCustomerFilter;
  });

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: "${dateString}"`);
      return "-";
    }
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .replace(/ /g, "/");
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paymentsWithFormattedDate = paginatedData.map((payment) => ({
    ...payment,
    formattedDate: formatDate(payment.dbt_date),
  }));
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
            placeholder="Search by Project ID, Customer, or Name"
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
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    size="sm"
                    checked={
                      selected.length === paymentsWithFormattedDate.length
                    }
                    onChange={(event) =>
                      handleRowSelect("all", event.target.checked)
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paymentsWithFormattedDate.length
                    }
                  />
                </Box>
                {[
                  "Payment Id",
                  "Request Date",
                  "Project Id",
                  "Project Name",
                  "Client Name",
                  "Group Name",
                  "Request For",
                  "Payment Description",
                  "Amount Requested",
                  "Client Balance",
                  "Group Balance",
                  "Action",
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
              {paymentsWithFormattedDate.length > 0 ? (
                paymentsWithFormattedDate.map((payment, index) => (
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
                          handleRowSelect(payment.pay_id, event.target.checked)
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
                      {payment.formattedDate}
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
                      {payment.projectCustomer || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {payment.projectGroup || "-"}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {payment.paid_for}
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
                      {new Intl.NumberFormat("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(payment.amt_for_customer)}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {payment.Available_Amount}
                    </Box>
                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {payment.groupBalance || "-"}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        borderBottom: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      <RowMenu
                        paymentId={payment.pay_id}
                        onStatusChange={handleStatusChange}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Box component="tr">
                  <Box
                    component="td"
                    colSpan={9}
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
          marginLeft: { xl: "15%", md: "25%", lg: "18%" },
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
          Showing {paginatedData.length} of {filteredData.length} results
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
export default PaymentRequest;
