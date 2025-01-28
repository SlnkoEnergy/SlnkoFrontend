import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Input,
  Typography,
} from "@mui/joy";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import React, { useEffect, useState } from "react";
import Img12 from "../../assets/slnko_blue_logo.png";
import Axios from "../../utils/Axios";


// const exportAllToCSV = (
//   creditHeader,
//   creditRows,
//   debitHeader,
//   debitRows,
//   clientHeader,
//   clientRows,
//   creditTotal,
//   creditTotalRows,
//   debitTotal,
//   debitTotalRows,
//   clientTotal,
//   clientTotalRows,
//   fileName
// ) => {
 
//   const csvContent = [
//     // Credit Table
//     creditHeader.join(","), 
//     ...creditRows.map((row) => row.join(",")), 
//     '', 
//     creditTotal.join(","), 
//     ...creditTotalRows.map((row) => row.join(",")), 
//     '',
//     // Debit Table
//     debitHeader.join(","), 
//     ...debitRows.map((row) => row.join(",")), 
//     '', 
//     debitTotal.join(","), 
//     ...debitTotalRows.map((row) => row.join(",")), 
//     '',
//     // Client Table
//     clientHeader.join(","), 
//     ...clientRows.map((row) => row.join(",")), 
//     '', 
//     clientTotal.join(","), 
//     ...clientTotalRows.map((row) => row.join(",")) 
//   ]
//     .join("\n");

//   // Create a Blob from the CSV content
//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);


//   // Trigger file download
//   saveAs(blob, fileName); 
// };
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

  // const handleExportAll = () => {
  //   // Credit Table
  //   const creditHeader = ["Credit Date", "Credit Mode", "Credited Amount (₹)"];
  //   const creditRows = creditHistory.map((row) => [
  //     new Date(row.cr_date).toLocaleDateString("en-IN", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     }),
  //     row.cr_mode,
  //     row.cr_amount
  //   ]);
  
  //   const totalCredited = creditHistory.reduce((acc, row) => acc + row.cr_amount, 0);
  //   const creditTotal = ["Total Credited", totalCredited];
  
  //   // Debit Table
  //   const debitHeader = [
  //     "Debit Date",
  //     "Debit Mode",
  //     "Paid For",
  //     "Paid To",
  //     "Amount (₹)",
  //     "UTR"
  //   ];
  //   const debitRows = debitHistory.map((row) => [
  //     new Date(row.dbt_date).toLocaleDateString("en-IN", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     }),
  //     row.pay_mode,
  //     row.paid_for,
  //     row.vendor,
  //     row.amount_paid,
  //     row.utr
  //   ]);
  
  //   const totalDebited = debitHistory.reduce((acc, row) => acc + row.amount_paid, 0);
  //   const debitTotal = ["Total Debited", totalDebited];
  
  //   // Client Table
  //   const clientHeader = [
  //     "PO Number",
  //     "Vendor",
  //     "Item Name",
  //     "PO Value (₹)",
  //     "Advance Paid (₹)",
  //     "Remaining Amount (₹)",
  //     "Total Billed Value (₹)",
  //   ];
  //   const clientRows = filteredClients.map((client) => [
  //     client.po_number || "N/A",
  //     client.vendor || "N/A",
  //     client.item || "N/A",
  //     client.po_value,
  //     client.amount_paid,
  //     (client.po_value - client.amount_paid),
  //      client.billedValue,
  //   ]);
  
  //   const totalPOValue = filteredClients.reduce((acc, client) => acc + client.po_value, 0);
  //   const totalAmountPaid = filteredClients.reduce((acc, client) => acc + client.amount_paid, 0);
  //   const totalBalance = filteredClients.reduce(
  //     (acc, client) => acc + (client.po_value - client.amount_paid),
  //     0
  //   );
  //   const totalBilledValue = filteredClients.reduce((acc, client) => acc + client.billedValue, 0);
  
  //   const clientTotal = [
  //     "Total",
  //    totalPOValue,
  //     totalAmountPaid,
  //     totalBalance,
  //     totalBilledValue,
  //   ];
  
  //   // Export all to CSV
  //   exportAllToCSV(
  //     creditHeader, creditRows,
  //     debitHeader, debitRows,
  //     clientHeader, clientRows,
  //     creditTotal, [creditTotal], // Wrap total in an array
  //     debitTotal, [debitTotal], // Wrap total in an array
  //     clientTotal, [clientTotal], // Wrap total in an array
  //     "all_data_export.csv"
  //   );
  // };
  



  // const handleExportCSV = ({
  //   crAmtNum,
  //   netBalance,
  //   balanceSlnko,
  //   balancePayable,
  //   netAdvance,
  //   balanceRequired,
  //   tcs,
  // }) => {
  //   const csvData = [
  //     ["S.No.", "Balance Summary", "Value"],
  //     ["1", "Total Received", crAmtNum],
  //     ["2", "Total Return", totalReturn],
  //     ["3", "Net Balance [(1)-(2)]", netBalance],
  //     ["4", "Total Advance Paid to vendors", totalAdvanceValue],
  //     ["5", "Balance With Slnko [(3)-(4)]", balanceSlnko],
  //     ["6", "Total PO Value", totalPoValue],
  //     ["7", "Total Billed Value", totalBilled],
  //     ["8", "Net Advance Paid [(4)-(7)]", netAdvance],
  //     ["9", "Balance Payable to vendors [(6)-(7)-(8)]", balancePayable],
  //     ["10", "TCS as applicable", tcs],
  //     ["11", "Balance Required [(5)-(9)-(10)]", balanceRequired],
  //   ];

  //   const csvContent = csvData.map((row) => row.join(",")).join("\n");
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   saveAs(blob, "CustomerPaymentSummary.csv");
  // };

  const handleExportCSV = ({crAmtNum, netBalance, netAdvance, balancePayable, tcs, balanceRequired, balanceSlnko}) => {
    // Summary section
    const summaryData = [
      ["S.No.", "Balance Summary", "Value"],
      ["1", "Total Received", crAmtNum],
      ["2", "Total Return", totalReturn],
      ["3", "Net Balance [(1)-(2)]", netBalance],
      ["4", "Total Advance Paid to Vendors", totalAdvanceValue],
      ["5", "Balance with Slnko [(3)-(4)]", balanceSlnko],
      ["6", "Total PO Value", totalPoValue],
      ["7", "Total Billed Value", totalBilled],
      ["8", "Net Advance Paid [(4)-(7)]", netAdvance],
      ["9", "Balance Payable to Vendors [(6)-(7)-(8)]", balancePayable],
      ["10", "TCS as Applicable", tcs],
      ["11", "Balance Required [(5)-(9)-(10)]", balanceRequired],
    ];
  
    // Credit history section
    const creditHistoryData = creditHistory.map((item, index) => [
      index + 1,
      item.cr_date,
      item.cr_mode,
      item.cr_amount,
    ]);
    const creditHistoryHeaders = ["S.No.","Credit Date", "Credit Mode", "Credited Amount (₹)"];
  
    // Debit history section
    const debitHistoryData = debitHistory.map((item, index) => [
      index + 1,
      item.dbt_date,
      item.paid_for,
      item.vendor,
      item.amount_paid,
      item.utr,
    ]);
    const debitHistoryHeaders = ["S.No.", "Date", "Paid For", "Paid To", "Amount (₹)", "UTR"];
  
    // Client history section
    const clientHistoryData = clientHistory.map((item, index) => [
      index + 1,
      item.po_number,
      item.vendor,
      item.item,
      item.po_value,
      item.amountPaid,
      item.item,
      item.billedValue,
    ]);
    const clientHistoryHeaders = ["PO Number", "Vendor", "Item Name", "PO Value (₹)", "Advance Paid (₹)", "Remaining Amount (₹)", "Total Billed Value (₹)"];
  
    // Combine all sections into one CSV
    const csvData = [
      // Summary section
      ...summaryData.map((row) => row.join(",")),
      "", // Empty row for spacing
  
      // Credit history section
      "Credit History",
      creditHistoryHeaders.join(","),
      ...creditHistoryData.map((row) => row.join(",")),
      "", // Empty row for spacing
  
      // Debit history section
      "Debit History",
      debitHistoryHeaders.join(","),
      ...debitHistoryData.map((row) => row.join(",")),
      "", // Empty row for spacing
  
      // Client history section
      "Client History",
      clientHistoryHeaders.join(","),
      ...clientHistoryData.map((row) => row.join(",")),
    ].join("\n");
  
    // Create and save the CSV file
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "CustomerPaymentSummary.csv");
  };


  
  const [creditHistory, setCreditHistory] = useState([]);

  const [debitHistory, setDebitHistory] = useState([]);

  const [clientHistory, setClientHistory] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);

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
  const [selectedDate, setSelectedDate] = useState('');
  const [debitSearch, setDebitSearch] = useState("");
  const [selectedDebits, setSelectedDebits] = useState([]);
  const [filteredDebits, setFilteredDebits] = useState([]);

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

    setFilteredDebits(filteredD);
    // console.log("Search Data are:", filteredD);
  };

  
  

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCredits(creditHistory.map((item) => item.id));
    } else {
      setSelectedCredits([]);
    }
  };

  const handleSelectAllDebits = (event) => {
    if (event.target.checked) {
      setSelectedDebits(filteredDebits.map((item) => item.id));
    } else {
      setSelectedDebits([]);
    }
  };

  const handleDelete = () => {
    // Logic to delete selected items
    // console.log("Deleting selected adjustments", selectedAdjustments);
  };

  const handleCheckboxChange = (id) => {
    setSelectedCredits((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDebitCheckboxChange = (id) => {
    setSelectedDebits((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAdjustments = (event) => {
    if (event.target.checked) {
      setSelectedAdjustments(adjustmentHistory.map((item) => item.id));
    } else {
      setSelectedAdjustments([]);
    }
  };

  const handleAdjustmentCheckboxChange = (id) => {
    setSelectedAdjustments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClientCheckboxChange = (poNumber) => {
    if (selectedClients.includes(poNumber)) {
      setSelectedClients(
        selectedClients.filter((client) => client !== poNumber)
      );
    } else {
      setSelectedClients([...selectedClients, poNumber]);
    }
  };
  const handleSelectAllClient = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map((client) => client.po_number));
    }
  };

  const handleDeleteSelectedClient = () => {
    // Your delete logic here. For now, we just log the selected clients.
    // console.log("Deleting selected clients with PO numbers:", selectedClients);
    setSelectedClients([]);
  };

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

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await Axios.get("/get-all-project");
        // const data = response.data?.data?.[0];
        let project = localStorage.getItem("view_detail");
        project = Number.parseInt(project);
        console.log("View Details are: ", project);

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
          console.log("Fetching debit history for p_id:", projectData.p_id);

          // Fetch debit history data from the API
          const response = await Axios.get(
            `/get-subtract-amount?p_id=${projectData.p_id}`
          );

          // Log the API response to check the returned data
          console.log("Debit History Response:", response.data);

          const data = response.data?.data ?? [];

          // Filter debit history based on p_id match
          const filteredDebitHistory = data.filter(
            (item) => String(item.p_id) === String(projectData.p_id)
          );

          // Log the filtered debit history
          console.log("Filtered Debit History:", filteredDebitHistory);


          // Set the debit history state
          setDebitHistory(filteredDebitHistory);
          setFilteredDebits(filteredDebitHistory);
        } catch (err) {
          console.error("Error fetching debit history data:", err);
          setError("Failed to fetch debit history. Please try again later.");
        }
      };

      fetchDebitHistory();
    } else {
      // console.log("No p_id found in projectData");
    }
  }, [projectData.p_id]); // Trigger when projectData.p_id changes


 // Handle Date Filter
 const handleDateFilter = (event) => {
  const dateValue = event.target.value; // Format: YYYY-MM-DD
  setSelectedDate(dateValue);

  applyFilters(debitSearch, dateValue);
};

// Apply Combined Filters
const applyFilters = (searchValue, dateValue) => {
  const filteredData = debitHistory.filter((item) => {
    const matchesSearch =
      (item.paid_for && item.paid_for.toLowerCase().includes(searchValue)) ||
      (item.vendor && item.vendor.toLowerCase().includes(searchValue));
    const matchesDate = dateValue
      ? new Date(item.dbt_date).toISOString().split('T')[0] === dateValue
      : true;
    return matchesSearch && matchesDate;
  });

  setFilteredDebits(filteredData);
};
  


  useEffect(() => {
    if (projectData.code) {
      const fetchClientHistory = async () => {
        try {
          // console.log(
          //   "Fetching client history for projectData.code:",
          //   projectData.code
          // );

          // Step 1: Fetch all PO data
          const poResponse = await Axios.get("/get-all-po");
          // console.log("PO Response:", poResponse.data);

          const poData = poResponse.data?.data || [];

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
            // Find the matching bill for this PO
            const matchingBill = billData.find(
              (bill) => bill.po_number === po.po_number
            );

            return {
              ...po,
              billedValue: matchingBill?.bill_value || 0,
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

  const clientSummary = {
    totalPOValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.po_value || 0),
      0
    ),
    totalAmountPaid: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.amount_paid || 0),
      0
    ),
    totalBalance: filteredClients.reduce(
      (sum, client) =>
        sum + parseFloat((client.po_value || 0) - (client.amount_paid || 0)),
      0
    ),
    totalBilledValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.billedValue || 0),
      0
    ),
  };
  
  
  const debitHistorySummary = {
    totalCustomerAdjustment: filteredDebits
      .reduce((sum, row) => {
        if (row.paid_for === "Customer Adjustment") {
          return sum + (row.amount_paid || 0);
        }
        return sum;
      }, 0)
      ,
  };
  console.log("Total Customer Adjustment:", debitHistorySummary);
  


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
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mb={2}
          >
            <Button
              variant="contained"
              color="danger"
              // onClick={() => console.log("Delete Selected")}
            >
              Delete Selected
            </Button>
          </Box>

          {/* Table Header */}
          <Box
            display="grid"
            gridTemplateColumns="2fr 2fr 2fr auto"
            fontWeight="bold"
            backgroundColor="#f5f5f5"
            padding="12px"
            borderRadius="8px 8px 0 0"
            border="1px solid #ddd"
            
          >
            <Box>Credit Date</Box>
            <Box>Credit Mode</Box>
            <Box>Credited Amount (₹)</Box>
            <Box>
              <Checkbox
                color="primary"
                onChange={handleSelectAll}
                checked={selectedCredits.length === creditHistory.length}
              />
            </Box>
          </Box>

          {/* Table Body */}
          {creditHistory.map((row, index) => (
            <Box
              key={row.id}
              display="grid"
              gridTemplateColumns="2fr 2fr 2fr auto"
              padding="12px"
              borderBottom="1px solid #ddd"
              backgroundColor={index % 2 === 0 ? "#fff" : "#f9f9f9"}
            >
              <Box>
                {new Date(row.cr_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Box>
              <Box>{row.cr_mode}</Box>
              <Box>₹ {row.cr_amount.toLocaleString("en-IN")}</Box>
              <Box>
                <Checkbox
                  color="primary"
                  checked={selectedCredits.includes(row.id)}
                  onChange={() => handleCheckboxChange(row.id)}
                />
              </Box>
            </Box>
          ))}

          {/* Total Row */}
          <Box
            display="grid"
            gridTemplateColumns="6fr 2fr"
            fontWeight={600}
            backgroundColor="#f5f5f5"
            padding="12px"
            borderTop="1px solid #ddd"
            borderRadius="0 0 8px 8px"
          >
            <Box textAlign="right">Total Credited:</Box>
            <Box>₹ {totalCredited.toLocaleString("en-IN")}</Box>
          </Box>
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
           display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          flexDirection:{md:"row", xs:"column"}
        }}
         
          mb={2}
        >
        <Box sx={{display:"flex",
          alignItems:"center",
          flexDirection:{md:"row", xs:"column"}}}>
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
          style={{ width: '200px', marginLeft:"5px" }}
        />
        </Box>
         
         <Box>
          <Button
            variant="contained"
            color="error"
            disabled={selectedDebits.length === 0}
            onClick={handleDelete}
          >
            Delete Selected
          </Button>
         </Box>
          
        </Box>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr 2fr 1fr 1fr 1fr",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            <div>Debit Date</div>
            <div>Po Number</div>
            <div>Paid For</div>
            <div>Paid To</div>
            <div>Amount (₹)</div>
            <div>UTR</div>
            <div>
              {" "}
              <Box>
                <Checkbox
                  color="primary"
                  onChange={handleSelectAllDebits}
                  checked={selectedDebits.length === debitHistory.length}
                />
              </Box>
            </div>
          </div>

          {/* Table Body */}
          <div>
  {filteredDebits
    .slice() // To avoid mutating the original array
    .sort((a, b) => new Date(a.dbt_date) - new Date(b.dbt_date)) // Sort by date in ascending order
    .map((row) => (
      <div
        key={row.id}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 2fr 2fr 1fr 1fr 1fr',
          padding: '10px',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div>
          {new Date(row.dbt_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
        <div>{row.pay_mode}</div>
        <div>{row.paid_for}</div>
        <div>{row.vendor}</div>
        <div>₹ {row.amount_paid.toLocaleString('en-IN')}</div>
        <div>{row.utr}</div>
        <div>
          <Checkbox
            color="primary"
            checked={selectedDebits.includes(row.id)}
            onChange={() => handleDebitCheckboxChange(row.id)}
          />
        </div>
      </div>
    ))}
  {filteredDebits.length === 0 && (
    <div style={{ padding: '10px', textAlign: 'center' }}>No debit history available</div>
  )}
</div>

          {/* Total Amount Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              borderTop: "2px solid #ddd",
            }}
          >
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div style={{ color: "red" }}>
              Total Debited: ₹ {totalDebited.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
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
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Input
            placeholder="Search Client"
            value={clientSearch}
            onChange={handleClientSearch}
            style={{ width: "250px" }}
          />
        </Box>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr 1fr 1fr",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            <div>PO Number</div>
            <div>Vendor</div>
            <div>Item Name</div>
            <div>PO Value (₹)</div>
            <div>Advance Paid (₹)</div>
            <div>Remaining Amount (₹)</div>
            <div>Total Billed Value (₹)</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredClients.map((client) => {
              const po_value = client.po_value || 0;
              const amountPaid = client.amount_paid || 0;
              const billedValue = client.billedValue || 0;

              return (
                <div
                  key={client.po_number}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr 1fr 1fr",
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <div>{client.po_number || "N/A"}</div>
                  <div>{client.vendor || "N/A"}</div>
                  <div>{client.item || "N/A"}</div>
                  <div>₹ {po_value.toLocaleString("en-IN")}</div>
                  <div>₹ {amountPaid.toLocaleString("en-IN")}</div>
                  <div>₹ {(po_value - amountPaid).toLocaleString("en-IN")}</div>
                  <div>₹ {billedValue.toLocaleString("en-IN")}</div>
                </div>
              );
            })}
          </div>

          {/* Total Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 2fr 1fr 1fr 1fr 1fr",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
              borderTop: "2px solid #ddd",
            }}
          >
            <div>Total</div>
            <div />
            <div />
            <div>₹{clientSummary.totalPOValue}</div>
            <div>₹{clientSummary.totalAmountPaid}</div>
            <div>₹{clientSummary.totalBalance}</div>
            <div>₹{clientSummary.totalBilledValue}</div>
          </div>
        </div>
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
         <Button variant="solid" color="primary" onClick={handleExportCSV}>
          Export to CSV
        </Button>
      </Box>
    </Container>
  );
};

export default Customer_Payment_Summary;
