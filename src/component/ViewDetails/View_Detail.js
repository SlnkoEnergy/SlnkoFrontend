
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  IconButton,
  Input,
  Typography,
} from "@mui/joy";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import React, { useEffect, useState } from "react";
import Img12 from "../../assets/slnko_blue_logo.png";
import DeleteIcon from "@mui/icons-material/Delete";
import Axios from "../../utils/Axios";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import { toast } from "react-toastify";

const Customer_Payment_Summary = () => {
  const [error, setError] = useState("");
  const [projectData, setProjectData] = useState({
    p_id: "",
    code: "",
    name: "",
    customer: "",
    p_group: "",
    billing_address: "",
    project_kwp: "",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.html(document.body, {
      callback: function (doc) {
        doc.save("CustomerPaymentSummary.pdf");
      },
      x: 10,
      y: 10,
    });
  };

  const today = new Date();

  const dayOptions = { weekday: "long" };
  const dateOptions = { month: "long", day: "numeric", year: "numeric" };

  const currentDay = today.toLocaleDateString("en-US", dayOptions);
  const currentDate = today.toLocaleDateString("en-US", dateOptions);

  const handleExportAll = () => {
    // Credit Table
    const creditHeader = [
      "S.No.",
      "Credit Date",
      "Credit Mode",
      "Credited Amount",
    ];
    const creditRows = creditHistory.map((row, index) => [
      index + 1,
      new Date(row.cr_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      row.cr_mode,
      row.cr_amount,
    ]);

    const totalCredited =
      creditHistory.reduce((acc, row) => acc + row.cr_amount, 0) || "0";

    // Debit Table
    const debitHeader = [
      "S.No.",
      "Debit Date",
      "Debit Mode",
      "Paid For",
      "Paid To",
      "Amount",
      "UTR",
    ];
    const debitRows = debitHistory.map((row, index) => [
      index + 1,
      new Date(row.dbt_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      row.pay_mode,
      row.paid_for,
      row.vendor,
      row.amount_paid,
      row.utr,
    ]);

    const totalDebited =
      debitHistory.reduce((acc, row) => acc + row.amount_paid, 0) || "0";

    const netBalance = totalCredited - totalReturn;
    const tcs =
      netBalance > 5000000 ? Math.round(netBalance - 5000000) * 0.001 : 0;

    // Client Table
    const clientHeader = [
      "S.No.",
      "PO Number",
      "Vendor",
      "Item Name",
      "PO Value",
      "Advance Paid",
      "Remaining Amount",
      "Total Billed Value",
    ];
    const clientRows = filteredClients.map((client, index) => [
      index + 1,
      client.po_number || "-",
      client.vendor || "-",
      client.item || "-",
      client.po_value || "0",
      client.totalAdvancePaid || "0",
      (client.po_value || "0") - (client.totalAdvancePaid || "0"),
      client.billedValue || "0",
    ]);

    const totalPOValue =
      filteredClients.reduce((acc, client) => acc + client.po_value, 0) || "0";
    const totalAmountPaid =
      filteredClients.reduce(
        (acc, client) => acc + (client.totalAdvancePaid || 0),
        0
      ) || "0";

    // Debugging logs
    console.log("filteredClients:", filteredClients);
    console.log("totalAmountPaid:", totalAmountPaid);
    console.log("totalPOValue:", totalPOValue);

    const totalBilledValue = filteredClients.reduce(
      (acc, client) => acc + client.billedValue,
      0
    );
    const balanceSlnko = netBalance - totalAmountPaid;
    const netAdvance = totalAmountPaid - totalBilledValue;
    const balancePayable = totalPOValue - totalBilledValue - netAdvance;
    const balanceRequired = balanceSlnko - balancePayable - tcs;
    const totalAvailable = totalCredited - totalDebited;

    const summaryData = [
      ["S.No.", "Balance Summary", "Value"],
      ["1", "Total Received", totalCredited],
      ["2", "Total Return", totalReturn],
      ["3", "Net Balance [(1)-(2)]", netBalance],
      ["4", "Total Advance Paid to Vendors", totalAmountPaid],
      ["5", "Balance with Slnko [(3)-(4)]", balanceSlnko],
      ["6", "Total PO Value", totalPOValue],
      ["7", "Total Billed Value", totalBilledValue],
      ["8", "Net Advance Paid [(4)-(7)]", netAdvance],
      ["9", "Balance Payable to Vendors [(6)-(7)-(8)]", balancePayable],
      ["10", "TCS as Applicable", tcs],
      ["11", "Balance Required [(5)-(9)-(10)]", balanceRequired],
    ];

    const summaryData2 = [
      ["S.No.", "Available Amount (Old)", "Value"],
      ["1", "Total Credit", totalCredited],
      ["2", "Total Debit", totalDebited],
      ["3", "Credit - Debit [(1)-(2)]", totalAvailable],
    ];

    const csvContent = [
      // Credit Table
      creditHeader.join(","),
      ...creditRows.map((row) => row.join(",")),
      "",
      // Debit Table
      debitHeader.join(","),
      ...debitRows.map((row) => row.join(",")),
      "",
      // Client Table
      clientHeader.join(","),
      ...clientRows.map((row) => row.join(",")),
      "",
      ...summaryData.map((row) => row.join(",")),
      "",
      ...summaryData2.map((row) => row.join(",")),
      "",
    ].join("\n");

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "CustomerPaymentSummary.csv");
  };

  const [creditHistory, setCreditHistory] = useState([]);

  const [debitHistory, setDebitHistory] = useState([]);

  const [clientHistory, setClientHistory] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [creditSearch, setCreditSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const adjustmentHistory = [
    {
      id: 1,
      date: "2023-12-12",
      adjusted_from: "ABC Supplies",
      adjusted_for: "Materials",
      value: 1500,
    },
    {
      id: 2,
      date: "2023-12-13",
      adjusted_from: "XYZ Services",
      adjusted_for: "Labor",
      value: -500,
    },
  ];

  const [selectedCredits, setSelectedCredits] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [debitSearch, setDebitSearch] = useState("");
  const [selectedDebits, setSelectedDebits] = useState([]);
  const [filteredDebits, setFilteredDebits] = useState([]);
  const [payments, setPayments] = useState([]);

  const totalCredited = creditHistory.reduce(
    (sum, item) => sum + item.cr_amount,
    0
  );

  const totalDebited = debitHistory.reduce(
    (sum, item) => sum + item.amount_paid,
    0
  );

  const [selectedAdjustments, setSelectedAdjustments] = useState([]);

  const totalAdjustment = adjustmentHistory.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const handleSearchDebit = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setDebitSearch(searchValue);

    const filteredD = debitHistory.filter(
      (item) =>
        (item.paid_for && item.paid_for.toLowerCase().includes(searchValue)) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchValue))
    );

    setDebitHistory(filteredD);
    // console.log("Search Data are:", filteredD);
  };

  // const handleSelectAll = (event) => {
  //   if (event.target.checked) {
  //     setSelectedCredits(creditHistory.map((item) => item.id));
  //   } else {
  //     setSelectedCredits([]);
  //   }
  // };

  // const handleSelectAllDebits = (event) => {
  //   if (event.target.checked) {
  //     setSelectedDebits(filteredDebits.map((item) => item.id));
  //   } else {
  //     setSelectedDebits([]);
  //   }
  // };

  // const handleDelete = () => {
  //   // Logic to delete selected items
  //   // console.log("Deleting selected adjustments", selectedAdjustments);
  // };

  // const handleCheckboxChange = (id) => {
  //   setSelectedCredits((prev) =>
  //     prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  //   );
  // };

  // const handleDebitCheckboxChange = (id) => {
  //   setSelectedDebits((prev) =>
  //     prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  //   );
  // };

  // const handleSelectAllAdjustments = (event) => {
  //   if (event.target.checked) {
  //     setSelectedAdjustments(adjustmentHistory.map((item) => item.id));
  //   } else {
  //     setSelectedAdjustments([]);
  //   }
  // };

  // const handleAdjustmentCheckboxChange = (id) => {
  //   setSelectedAdjustments((prev) =>
  //     prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  //   );
  // };

  // const handleClientCheckboxChange = (poNumber) => {
  //   if (selectedClients.includes(poNumber)) {
  //     setSelectedClients(
  //       selectedClients.filter((client) => client !== poNumber)
  //     );
  //   } else {
  //     setSelectedClients([...selectedClients, poNumber]);
  //   }
  // };
  // const handleSelectAllClient = () => {
  //   if (selectedClients.length === filteredClients.length) {
  //     setSelectedClients([]);
  //   } else {
  //     setSelectedClients(filteredClients.map((client) => client.po_number));
  //   }
  // };

  // const handleDeleteSelectedClient = () => {
  //   // Your delete logic here. For now, we just log the selected clients.
  //   // console.log("Deleting selected clients with PO numbers:", selectedClients);
  //   setSelectedClients([]);
  // };

  const handleClientSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setClientSearch(searchValue);

    const filtered = clientHistory.filter(
      (client) =>
        client.po_number.toLowerCase().includes(searchValue) ||
        client.vendor.toLowerCase().includes(searchValue) ||
        client.item.toLowerCase().includes(searchValue)
    );

    setFilteredClients(filtered);
  };

  // const handleCreditSearch = (event) => {
  //   const searchValue = event.target.value.toLowerCase();
  //   setCreditSearch(searchValue);

  //   const filtered = creditHistory.filter(
  //     (client) =>
  //       client.po_number.toLowerCase().includes(searchValue) ||
  //       client.vendor.toLowerCase().includes(searchValue) ||
  //       client.item.toLowerCase().includes(searchValue)
  //   );

  //   setCreditHistory(filtered);
  // };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await Axios.get("/get-all-project");
        // const data = response.data?.data?.[0];
        let project = localStorage.getItem("view_detail");
        project = Number.parseInt(project);
        // console.log("View Details are: ", project);

        if (response.data?.data) {
          const matchingItem = response.data.data.find(
            (item) => item.p_id === project
          );

          if (matchingItem) {
            // console.log("Matching Project are:", matchingItem);
            setProjectData((prev) => ({
              ...prev,
              p_id: matchingItem.p_id || "",
              code: matchingItem.code || "",
              name: matchingItem.name || "",
              customer: matchingItem.customer || "",
              p_group: matchingItem.p_group || "",
              billing_address: matchingItem.billing_address || "",
              project_kwp: matchingItem.project_kwp || "",
            }));
          }
        } else {
          setError("No projects found. Please add projects before proceeding.");
        }
        // console.log("Response from Server:", response.data);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project data. Please try again later.");
      }
    };

    fetchProjectData();
  }, []);

  useEffect(() => {
    if (projectData.p_id) {
      const fetchCreditHistory = async () => {
        try {
          // console.log("Fetching credit history for p_id:", projectData.p_id);

          const response = await Axios.get(
            `/all-bill?p_id=${projectData.p_id}`
          );
          // console.log("Credit History Response:", response);

          const data = response.data?.bill || [];

          // Filter credit history based on p_id match
          const filteredCreditHistory = data.filter(
            (item) => item.p_id === projectData.p_id
          );

          // console.log("Filtered Credit History:", filteredCreditHistory);

          setCreditHistory(filteredCreditHistory);
        } catch (err) {
          console.error("Error fetching credit history data:", err);
          setError("Failed to fetch credit history. Please try again later.");
        }
      };

      fetchCreditHistory();
    }
  }, [projectData.p_id]);

  useEffect(() => {
    if (projectData.p_id) {
      const fetchDebitHistory = async () => {
        try {
          // console.log("Fetching debit history for p_id:", projectData.p_id);

          // Fetch debit history data from the API
          const response = await Axios.get(
            `/get-subtract-amount?p_id=${projectData.p_id}`
          );
          // console.log("Debit History Response:", response.data);

          const data = response.data?.data ?? [];

          // Fetch purchase orders (PO) data
          const poResponse = await Axios.get("/get-all-po");
          // console.log("PO Response:", poResponse.data);

          const poData = poResponse.data?.data || [];

          // Filter debit history based on p_id match
          const filteredDebitHistory = data.filter(
            (item) => String(item.p_id) === String(projectData.p_id)
          );

          const matchingPO = poData.find(
            (po) => String(po.p_id) === String(projectData.p_id)
          );

          const updatedDebits = filteredDebitHistory.map((item) => ({
            ...item,
            // po_number: matchingPO ? matchingPO.po_number : "-",
          }));

          // console.log("Updated Debit History with PO Number:", updatedDebits);

          setDebitHistory(filteredDebitHistory);
          setFilteredDebits(updatedDebits);
        } catch (err) {
          console.error("Error fetching debit history data:", err);
          setError("Failed to fetch debit history. Please try again later.");
        }
      };

      fetchDebitHistory();
    }
  }, [projectData.p_id]);

  const handleDeleteDebit = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedDebits.length === 0) {
        toast.error("No debits selected for deletion.");
        return;
      }

      console.log("Deleting selected debits:", selectedDebits);

      // Perform all deletions in parallel
      await Promise.all(
        selectedDebits.map((_id) =>
          Axios.delete(`/delete-subtract-money/${_id}`)
        )
      );

      toast.success("Deleted successfully.");

      setDebitHistory((prev) =>
        prev.filter((item) => !selectedDebits.includes(item._id))
      );
      setFilteredDebits((prev) =>
        prev.filter((item) => !selectedDebits.includes(item._id))
      );
      setSelectedDebits([]);
    } catch (err) {
      console.error("Error deleting debits:", err);
      setError(err.response?.data?.msg || "Failed to delete selected debits.");
      toast.error("Failed to delete selected debits.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllDebits = (event) => {
    if (event.target.checked) {
      setSelectedDebits(filteredDebits.map((item) => item._id));
    } else {
      setSelectedDebits([]);
    }
  };

  const handleDebitCheckboxChange = (_id) => {
    setSelectedDebits((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };


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


  const handleDateFilter = (event) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);

    applyFilters(debitSearch, dateValue);
  };


  const applyFilters = (searchValue, dateValue) => {
    const filteredData = debitHistory.filter((item) => {
      const matchesSearch =
        (item.paid_for && item.paid_for.toLowerCase().includes(searchValue)) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchValue));
      const matchesDate = dateValue
        ? new Date(item.dbt_date).toISOString().split("T")[0] === dateValue
        : true;
      return matchesSearch && matchesDate;
    });

    setDebitHistory(filteredData);
  };

  useEffect(() => {
    if (projectData.code) {
      const fetchClientHistory = async () => {
        try {
          // console.log(
          //   "Fetching client history for projectData.code:",
          //   projectData.code
          // );

          const payResponse = await Axios.get("/get-pay-summary")
          // Step 1: Fetch all PO data
          const poResponse = await Axios.get("/get-all-po");
          // console.log("PO Response:", poResponse.data);
          const payData = payResponse.data?.data || [];
          // console.log(payData);
          
          const poData = poResponse.data?.data || [];

          // setPayments(payData);

          // Step 2: Filter POs where p_id matches projectData.code
          const filteredPOs = poData.filter(
            (po) => po.p_id === projectData.code
          );
          // console.log("Filtered POs based on projectData.code:", filteredPOs);

          // Step 3: Fetch all bills
          const billResponse = await Axios.get("/get-all-bill");
          // console.log("Bill Response:", billResponse.data);

          const billData = billResponse.data?.data || [];

          // Step 4: Enrich POs with billed values
          const enrichedPOs = filteredPOs.map((po) => {
            // const matchingPay = payData.find((pay) => pay.po_number === po.po_number && pay.approved === "Approved");
            const totalAdvancePaid = payData
  .filter(pay => pay.po_number === po.po_number && pay.approved === "Approved")
  .reduce((sum, pay) => sum + Number(pay.amount_paid || 0), 0);

    

            // Find the matching bill for this PO
            const matchingBill = billData.find(
              (bill) => bill.po_number === po.po_number
            );

            return {
              ...po,
              billedValue: matchingBill?.bill_value || 0,
              // AdvancePaid: matchingPay?.amount_paid || 0,
              totalAdvancePaid : totalAdvancePaid || 0
            };
          });

          // console.log("Enriched POs with Billed Values:", enrichedPOs);

          // Step 5: Update state
          setClientHistory(enrichedPOs);
          setFilteredClients(enrichedPOs);
        } catch (err) {
          console.error("Error fetching client history:", err);
          setError("Failed to fetch client history. Please try again later.");
        }
      };

      fetchClientHistory();
    }
  }, [projectData.code]);

  const handleDeleteClient = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedClients.length === 0) {
        toast.error("No debits selected for deletion.");
        return;
      }

      console.log("Deleting selected clients:", selectedClients);

      
      await Promise.all(
        selectedClients.map((_id) =>
          Axios.delete(`/delete-po/${_id}`)
        )
      );

      toast.success("PO Deleted successfully.");

      setClientHistory((prev) =>
        prev.filter((item) => !selectedClients.includes(item._id))
      );
      setFilteredClients((prev) =>
        prev.filter((item) => !selectedClients.includes(item._id))
      );
      setSelectedClients([]);
    } catch (err) {
      console.error("Error deleting pos:", err);
      setError(err.response?.data?.msg || "Failed to delete selected pos.");
      toast.error("Failed to delete selected pos.");
    } finally {
      setLoading(false);
    }
  };

  const handleClientCheckboxChange = (_id) => {
    setSelectedClients((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const handleSelectAllClient = (event) => {
    if (event.target.checked) {
      setSelectedClients(filteredClients.map((client) => client._id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleDeleteCredit = async () => {
    try {
      setLoading(true);
      setError("");

      if (creditHistory.length === 0) {
        toast.error("No debits selected for deletion.");
        return;
      }

      console.log("Deleting selected clients:", creditHistory);

      
      await Promise.all(
        creditHistory.map((_id) =>
          Axios.delete(`/delete-crdit-amount/${_id}`)
        )
      );

      toast.success("Credit Money Deleted successfully.");

      setCreditHistory((prev) =>
        prev.filter((item) => !creditHistory.includes(item._id))
      );
      // setFilteredClients((prev) =>
      //   prev.filter((item) => !creditHistory.includes(item._id))
      // );
      setSelectedCredits([]);
    } catch (err) {
      console.error("Error deleting credits:", err);
      setError(err.response?.data?.msg || "Failed to delete selected credit.");
      toast.error("Failed to delete selected credits.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreditCheckboxChange = (_id) => {
    setSelectedCredits((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const handleSelectAllCredit = (event) => {
    if (event.target.checked) {
      setSelectedCredits(creditHistory.map((client) => client._id));
    } else {
      setSelectedCredits([]);
    }
  };

  const clientSummary = {
    totalPOValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.po_value || 0),
      0
    ),
    totalAmountPaid: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.totalAdvancePaid || 0),
      0
    ),
    totalBalance: filteredClients.reduce(
      (sum, client) =>
        sum + parseFloat((client.po_value || 0) - (client.totalAdvancePaid || 0)),
      0
    ),
    totalBilledValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.billedValue || 0),
      0
    ),
  };

  const debitHistorySummary = {
    totalCustomerAdjustment: filteredDebits.reduce((sum, row) => {
      if (row.paid_for === "Customer Adjustment") {
        return sum + (row.amount_paid || 0);
      }
      return sum;
    }, 0),
  };
  // console.log("Total Customer Adjustment:", debitHistorySummary);

  // ***Balance Summary***

  const balanceSummary = [
    {
      crAmt: totalCredited,
      totalReturn: debitHistorySummary.totalCustomerAdjustment,
      totalAdvanceValue: clientSummary.totalAmountPaid,
      totalPoValue: clientSummary.totalPOValue,
      totalBilled: clientSummary.totalBilledValue,
      dbAmt: totalDebited,
      adjTotal: "0",
    },
  ];

  const {
    crAmt,
    totalReturn,
    totalAdvanceValue,
    totalPoValue,
    totalBilled,
    dbAmt,
    adjTotal,
  } = balanceSummary[0];

  const Balance_Summary = ({
    crAmt,
    dbAmt,
    adjTotal,
    totalReturn,
    totalAdvanceValue,
    totalPoValue,
    totalBilled,
  }) => {
    const crAmtNum = Number(crAmt);
    const dbAmtNum = Number(dbAmt);
    const adjTotalNum = Number(adjTotal);

    const totalAmount = Math.round(crAmtNum - dbAmtNum) + adjTotalNum;

    const netBalance = Math.round(crAmt - totalReturn);
    const balanceSlnko = Math.round(netBalance - totalAdvanceValue);
    const netAdvance = Math.round(totalAdvanceValue - totalBilled);
    const balancePayable = Math.round(totalPoValue - totalBilled - netAdvance);

    const tcs =
      netBalance > 5000000 ? Math.round(netBalance - 5000000) * 0.001 : 0;
    const balanceRequired = Math.round(balanceSlnko - balancePayable - tcs);

    return (
      <Grid container spacing={2}>
        {/* Balance Summary Section */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <Typography
              level="h5"
              sx={{ fontWeight: "bold", marginBottom: "12px" }}
            >
              Balance Summary
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    S.No.
                  </th>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px" }}>1</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Total Received:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{crAmtNum}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>2</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Total Return:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{totalReturn}</td>
                </tr>
                <tr style={{ backgroundColor: "#C8C8C6" }}>
                  <td style={{ padding: "8px" }}>3</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Net Balance[(1)-(2)]:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{netBalance}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>4</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Total Advance Paid to vendors:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{totalAdvanceValue}</td>
                </tr>
                <tr style={{ backgroundColor: "#B6F4C6", fontWeight: "bold" }}>
                  <td style={{ padding: "8px" }}>5</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Balance With Slnko [(3)-(4)]:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{balanceSlnko}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>6</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Total PO Value:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{totalPoValue}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>7</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Total Billed Value:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{totalBilled}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>8</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Net Advance Paid [(4)-(7)]:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{netAdvance}</td>
                </tr>
                <tr style={{ backgroundColor: "#B6F4C6", fontWeight: "bold" }}>
                  <td style={{ padding: "8px" }}>9</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Balance Payable to vendors [(6)-(7)-(8)]:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{balancePayable}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px" }}>10</td>
                  <td style={{ padding: "8px" }}>
                    <strong>TCS as applicable:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{Math.round(tcs)}</td>
                </tr>
                <tr
                  style={{
                    backgroundColor: "#B6F4C6",
                    fontWeight: "bold",
                    color: balanceRequired >= 0 ? "green" : "red",
                  }}
                >
                  <td style={{ padding: "8px" }}>11</td>
                  <td style={{ padding: "8px" }}>
                    <strong>Balance Required [(5)-(9)-(10)]:</strong>
                  </td>
                  <td style={{ padding: "8px" }}>{balanceRequired}</td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Grid>

        {/* Amount Available (Old) Section */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <Typography
              level="h5"
              sx={{ fontWeight: "bold", marginBottom: "12px" }}
            >
              Amount Available (Old)
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px" }}>
                    <strong>Credit - Debit + Adjust</strong>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <strong className="text-success">{crAmt}</strong> -
                    <strong className="text-danger">{dbAmtNum}</strong> +
                    <strong className="text-primary">{adjTotalNum}</strong>
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#fff" }}>
                  <td style={{ padding: "8px" }}>
                    <strong>Total</strong>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <strong
                      className={
                        totalAmount >= 0 ? "text-success" : "text-danger"
                      }
                    >
                      {totalAmount}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container
      sx={{
        border: "1px solid black",
        padding: "20px",
        marginLeft: { xl: "15%", lg: "20%", md: "27%", sm: "0%" },
        maxWidth: { md: "75%", lg: "80%", sm: "100%", xl: "85%" },
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <img src={Img12} style={{}} />
        </Box>
        <Typography
          variant="h4"
          fontSize={"2.5rem"}
          fontFamily="Playfair Display"
          fontWeight={600}
        >
          Customer Payment Summary
        </Typography>
        <Box textAlign="center">
          <Typography
            variant="subtitle1"
            fontFamily="Bona Nova SC"
            fontWeight={300}
          >
            {currentDay}
          </Typography>
          <Typography
            variant="subtitle1"
            fontFamily="Bona Nova SC"
            fontWeight={300}
          >
            {currentDate}
          </Typography>
        </Box>
      </Box>

      {/* Project Details Section */}
      <Typography
        variant="h5"
        fontWeight={500}
        fontFamily="Playfair Display"
        mt={2}
        mb={1}
      >
        Project Details
      </Typography>
      <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />

      <form>
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Input
              fullWidth
              value={projectData.code}
              readOnly
              label="Project ID"
              sx={{ mr: 2 }}
            />
            <Input
              fullWidth
              value={projectData.name}
              readOnly
              label="Project Name"
              sx={{ mr: 2 }}
            />
            <Input
              fullWidth
              value={projectData.customer}
              readOnly
              label="Client Name"
            />
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Input
              fullWidth
              value={projectData.p_group}
              readOnly
              label="Group Name"
              sx={{ mr: 2 }}
            />
            <Input
              fullWidth
              value={projectData.billing_address}
              readOnly
              label="Plant Location"
              sx={{ mr: 2 }}
            />
            <Input
              fullWidth
              value={projectData.project_kwp}
              readOnly
              label="Plant Capacity"
            />
          </Box>
        </Box>
      </form>

      {/* Credit History Section */}

      {creditHistory.length > 0 && (
        <Box>
          <Typography
            variant="h5"
            fontFamily="Playfair Display"
            fontWeight={600}
            mt={4}
            mb={2}
          >
            Credit History
          </Typography>
          <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />

          <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { md: "row", xs: "column" },
            }}
          >
            {/* <Input
              label="Search Paid For"
              value={creditSearch}
              placeholder="Search here"
              onChange={handleCreditSearch}
              style={{ width: "250px" }}
            /> */}
            {/* <Input
              type="date"
              value={selectedDate}
              onChange={handleDateFilter}
              style={{ width: "200px", marginLeft: "5px" }}
            /> */}
          </Box>
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedCredits.length === 0}
                onClick={handleDeleteCredit}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

          <Sheet
      variant="outlined"
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        p: 2,
        boxShadow: "md",
        maxWidth: "100%",
      }}
    >
      <Table
        borderAxis="both"
        sx={{
          minWidth: "100%",
          "& thead": { backgroundColor: "neutral.softBg" },
          "& th, & td": { textAlign: "left", px: 2, py: 1.5 },
          "@media (max-width: 768px)": {
            display: "block",
            "& thead": { display: "none" },
            "& tbody tr": {
              display: "flex",
              flexDirection: "column",
              borderBottom: "1px solid #ddd",
              p: 2,
              mb: 2,
              backgroundColor: "background.level1",
              borderRadius: "8px",
            },
            "& td": { display: "flex", justifyContent: "space-between" },
          },
        }}
      >
        {/* Table Header */}
        <thead>
          <tr>
            <th>Credit Date</th>
            <th>Credit Mode</th>
            <th>Credited Amount (₹)</th>
            <th style={{textAlign:"center"}}>
              <Checkbox
                color="primary"
                onChange={handleSelectAllCredit}
                checked={selectedCredits.length === creditHistory.length}
                
              />
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {creditHistory.map((row) => (
            <tr key={row.id}>
              <td>
                {new Date(row.cr_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td>{row.cr_mode}</td>
              <td>₹ {row.cr_amount.toLocaleString("en-IN")}</td>
              <td style={{textAlign:"center"}}>
                <Checkbox
                  color="primary"
                  checked={selectedCredits.includes(row._id)}
                  onChange={() => handleCreditCheckboxChange(row._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>

        {/* Total Row */}
        <tfoot>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
            <td colSpan={2} style={{ textAlign: "right" }}>Total Credited:</td>
            <td>₹ {totalCredited.toLocaleString("en-IN")}</td>
            <td />
          </tr>
        </tfoot>
      </Table>
          </Sheet>
        </Box>
      )}

      {/* Debit History Section */}

      <Box>
        <Typography
          variant="h5"
          fontFamily="Playfair Display"
          fontWeight={600}
          mt={4}
          mb={2}
        >
          Debit History
        </Typography>
        <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { md: "row", xs: "column" },
            }}
          >
            <Input
              label="Search Paid For"
              value={debitSearch}
              placeholder="Search here"
              onChange={handleSearchDebit}
              style={{ width: "250px" }}
            />
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateFilter}
              style={{ width: "200px", marginLeft: "5px" }}
            />
          </Box>
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedDebits.length === 0}
                onClick={handleDeleteDebit}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Sheet
      variant="outlined"
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        p: 2,
        boxShadow: "md",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <Table
        borderAxis="both"
        stickyHeader
        sx={{
          minWidth: "100%",
          "& thead": { backgroundColor: "neutral.softBg" },
          "& th, & td": { textAlign: "left", px: 2, py: 1.5 },
        }}
      >
        {/* Table Header */}
        <thead>
          <tr>
            <th>Debit Date</th>
            <th>PO Number</th>
            <th>Paid For</th>
            <th>Paid To</th>
            <th>Amount (₹)</th>
            <th>UTR</th>
            <th style={{textAlign:"center"}}>
              <Box>
                <Checkbox
                  color="primary"
                  onChange={handleSelectAllDebits}
                  checked={selectedDebits.length === debitHistory.length}
                />
              </Box>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {debitHistory
            .slice()
            .sort((a, b) => new Date(a.dbt_date) - new Date(b.dbt_date))
            .map((row) => (
              <tr key={row.id}>
                <td>
                  {new Date(row.dbt_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>{row.po_number}</td>
                <td>{row.paid_for}</td>
                <td>{row.vendor}</td>
                <td>₹ {row.amount_paid.toLocaleString("en-IN")}</td>
                <td>{row.utr}</td>
                <td style={{textAlign:"center"}}>
                  <Checkbox
                    color="primary"
                    checked={selectedDebits.includes(row._id)}
                    onChange={() => handleDebitCheckboxChange(row._id)}
                  />
                </td>
              </tr>
            ))}
        </tbody>

        {/* No Data Row */}
        {debitHistory.length === 0 && (
          <tfoot>
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "10px" }}>
                No debit history available
              </td>
            </tr>
          </tfoot>
        )}

        {/* Total Row */}
        <tfoot>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
            <td colSpan={4} style={{ color: "red", textAlign:'right' }}>Total Debited:</td>
            <td colSpan={2} style={{ color: "red" }}>
               ₹ {totalDebited.toLocaleString("en-IN")}
            </td>
        
            <td></td>
          </tr>
        </tfoot>
      </Table>
    </Sheet>
      </Box>

      {/*Adjustment History Section */}
      {/* <Typography variant="h5" fontFamily="Playfair Display" fontWeight={600} mt={4} mb={2}>
  Adjustment History
</Typography>
<Divider style={{ borderWidth: '2px', marginBottom: '20px' }} /> */}

      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
  <Button
    variant="contained"
    color="error"
    disabled={selectedAdjustments.length === 0}
    onClick={handleDelete}
  >
    Delete Selected
  </Button>
</Box> */}

      {/* <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr', backgroundColor: '#f5f5f5', padding: '10px' }}>
    <div>Adjustment Date</div>
    <div>Adjusted From</div>
    <div>Adjusted For</div>
    <div>Credit (₹)</div>
    <div>Debit (₹)</div>
    <div>Select</div>
  </div>


  <div>
    {adjustmentHistory.map((row) => (
      <div
        key={row.id}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr',
          padding: '10px',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div>
          {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <div>{row.adjusted_from}</div>
        <div>{row.adjusted_for}</div>
        <div>{row.value > 0 ? `₹ ${row.value.toLocaleString('en-IN')}` : ''}</div>
        <div>{row.value < 0 ? `₹ ${Math.abs(row.value).toLocaleString('en-IN')}` : ''}</div>
        <div>
          <Checkbox
            color="primary"
            checked={selectedAdjustments.includes(row.id)}
            onChange={() => handleAdjustmentCheckboxChange(row.id)}
          />
        </div>
      </div>
    ))}
  </div>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      borderTop: '2px solid #ddd',
    }}
  >
    <div/>
    <div/>
    <div/>
    <div/>
    <div/>
    <div style={{ color: 'green' }}>
      Total Adjustment: ₹ {totalAdjustment.toLocaleString('en-IN')}
    </div>
  </div>
</div> */}

      {/* Client History Section */}
      <Box>
        <Typography
          variant="h5"
          fontFamily="Playfair Display"
          fontWeight={600}
          mt={4}
          mb={2}
        >
          Client History
        </Typography>
        <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { md: "row", xs: "column" },
            }}
          >
            <Input
            placeholder="Search Client"
            value={clientSearch}
            onChange={handleClientSearch}
            style={{ width: "250px" }}
          />
            {/* <Input
              type="date"
              value={selectedDate}
              onChange={handleDateFilter}
              style={{ width: "200px", marginLeft: "5px" }}
            /> */}
          </Box>
          {(user?.name === "IT Team" ||
            user?.name === "Guddu Rani Dubey" ||
            user?.name === "Prachi Singh" ||
            user?.name === "admin") && (
            <Box>
              <IconButton
                color="danger"
                disabled={selectedClients.length === 0}
                onClick={handleDeleteClient}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Sheet
      variant="outlined"
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        p: 2,
        boxShadow: "md",
        maxWidth: "100%",
      }}
    >
      <Table
        borderAxis="both"
        sx={{
          minWidth: "100%",
          "& thead": { backgroundColor: "neutral.softBg" },
          "& th, & td": { textAlign: "left", px: 2, py: 1.5 },
        }}
      >
        {/* Table Header */}
        <thead>
          <tr>
            
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Item Name</th>
            <th>PO Value (₹)</th>
            <th>Advance Paid (₹)</th>
            <th>Remaining Amount (₹)</th>
            <th>Total Billed Value (₹)</th>
            <th style={{textAlign:"center"}}>
              <Checkbox
              onChange={handleSelectAllClient}
              checked={selectedClients.length === filteredClients.length}
              />
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {filteredClients.map((client) => {
            const po_value = client.po_value || 0;
            const amountPaid = client.totalAdvancePaid || 0;
            const billedValue = client.billedValue || 0;

            return (
              <tr key={client.po_number}>
                <td>{client.po_number || "N/A"}</td>
                <td>{client.vendor || "N/A"}</td>
                <td>{client.item || "N/A"}</td>
                <td>₹ {po_value.toLocaleString("en-IN")}</td>
                <td>₹ {amountPaid.toLocaleString("en-IN")}</td>
                <td>₹ {(po_value - amountPaid).toLocaleString("en-IN")}</td>
                <td>₹ {billedValue.toLocaleString("en-IN")}</td>
                <td style={{textAlign:"center"}}>
                  <Checkbox
                   checked={selectedClients.includes(client._id)}
                   onChange={() => handleClientCheckboxChange(client._id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Total Row */}
        <tfoot>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
            <td colSpan={3} >Total: </td>
            <td>₹ {clientSummary.totalPOValue.toLocaleString("en-IN")}</td>
            <td>₹ {clientSummary.totalAmountPaid.toLocaleString("en-IN")}</td>
            <td>₹ {clientSummary.totalBalance.toLocaleString("en-IN")}</td>
            <td>₹ {clientSummary.totalBilledValue.toLocaleString("en-IN")}</td>
            <td />
          </tr>
        </tfoot>
      </Table>
    </Sheet>
      </Box>

      <hr />
      {/* Balance Summary and Amount Available Section */}
      <Box sx={{ marginBottom: "30px" }}>
        <Balance_Summary
          crAmt={crAmt}
          dbAmt={dbAmt}
          adjTotal={adjTotal}
          totalReturn={totalReturn}
          totalAdvanceValue={totalAdvanceValue}
          totalPoValue={totalPoValue}
          totalBilled={totalBilled}
        />
      </Box>

      {/* Balance Summary Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
      >
        <Button variant="solid" color="primary" onClick={handlePrint}>
          Print
        </Button>
        {/* <Button variant="solid" color="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button> */}
        <Button variant="solid" color="primary" onClick={handleExportAll}>
          Export to CSV
        </Button>
      </Box>
    </Container>
  );
};

export default Customer_Payment_Summary;
