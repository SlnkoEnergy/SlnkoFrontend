import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Typography,
} from "@mui/joy";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Img12 from "../../assets/slnko_blue_logo.png";
import Axios from "../../utils/Axios";

const Customer_Payment_Summary = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
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

  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  //   doc.html(document.body, {
  //     callback: function (doc) {
  //       doc.save("CustomerPaymentSummary.pdf");
  //     },
  //     x: 10,
  //     y: 10,
  //   });
  // };

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
      new Date(row.cr_date || row.createdAt).toLocaleDateString("en-IN", {
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

    const adjustHeader = [
      "S.No.",
      "Adjust Date",
      "Adjust Type",
      "PO Number",
      "Paid For",
      "Paid To",
      "Credit Adjustment",
      "Debit Adjustment",
    ];
    const adjustRows = adjustHistory.map((row, index) => [
      index + 1,
      new Date(row.adj_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      row.pay_type,
      row.po_number || "-",
      row.paid_for || "-",
      row.vendor || "-",
      // Credit Adjustment column
      row.adj_type === "Add" ? parseFloat(row.adj_amount) : "-",

      // Debit Adjustment column
      row.adj_type === "Subtract" ? parseFloat(row.adj_amount) : "-",
    ]);

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

    const POBasic =
      filteredClients.reduce(
        (acc, client) => acc + parseFloat(client.calculatedPoBasic),
        0
      ) || "0";

    // Debugging logs
    // console.log("filteredClients:", filteredClients);
    // console.log("totalAmountPaid:", totalAmountPaid);
    // console.log("totalPOValue:", totalPOValue);

    const totalBilledValue = filteredClients.reduce(
      (acc, client) => acc + client.billedValue,
      0
    );

    const creditTotal = filteredAdjusts
      .filter((row) => row.adj_type === "Add")
      .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);

    const debitTotal = filteredAdjusts
      .filter((row) => row.adj_type === "Subtract")
      .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);

    const adjTotal = debitTotal - creditTotal;

    const balanceSlnko = netBalance - totalAmountPaid - adjTotal;
    const netAdvance = totalAmountPaid - totalBilledValue;
    const balancePayable = totalPOValue - totalBilledValue - netAdvance;
    const balanceRequired = balanceSlnko - balancePayable - tcs;
    const totalAvailable = totalCredited - totalDebited;
    const totalPOBasic = totalPoValue - POBasic;

    const summaryData = [
      ["S.No.", "Balance Summary", "Value"],
      ["1", "Total Received", totalCredited],
      ["2", "Total Return", totalReturn],
      ["3", "Net Balance [(1)-(2)]", netBalance],
      ["4", "Total Advance Paid to Vendors", totalAmountPaid],
      ["4A", "Total Adjustment (Debit-Credit)", adjTotal],
      ["5", "Balance with Slnko [(3)-(4)-(4A)]", balanceSlnko],
      ["6", "Total PO Value", totalPOValue],
      ["7", "Total Billed Value", totalBilledValue],
      ["8", "Net Advance Paid [(4)-(7)]", netAdvance],
      ["9", "Balance Payable to Vendors [(6)-(7)-(8)]", balancePayable],
      ["10", "TCS as Applicable", tcs],
      // ["11", "Extra GST Recoverable from Client", totalPOBasic],
      // ["12", "Balance Required [(5)-(9)-(10)]", balanceRequired],
      ...(POBasic > 0
        ? [["11", "Extra GST Recoverable from Client", totalPOBasic]]
        : []),
      [
        POBasic > 0 ? "12" : "11",
        `Balance Required [(5)-(9)-(10)]`,
        balanceRequired,
      ],
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
      adjustHeader.join(","),
      ...adjustRows.map((row) => row.join(",")),
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
  const [adjustHistory, setAdjustHistory] = useState([]);

  const [clientHistory, setClientHistory] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [adjustSearch, setAdjustSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedAdjust, setSelectedAdjust] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCredits, setSelectedCredits] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [debitSearch, setDebitSearch] = useState("");
  const [selectedDebits, setSelectedDebits] = useState([]);
  const [filteredDebits, setFilteredDebits] = useState([]);
  const [filteredAdjusts, setFilteredAdjusts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startCreditDate, setStartCreditDate] = useState("");
  const [endCreditDate, setEndCreditDate] = useState("");

  const totalCredited = creditHistory.reduce(
    (sum, item) => sum + item.cr_amount,
    0
  );

  const totalDebited = filteredDebits.reduce(
    (sum, item) => sum + item.amount_paid,
    0
  );

  // const handleSearchDebit = (event) => {
  //   const searchValue = event.target.value.toLowerCase();
  //   setDebitSearch(searchValue);

  //   const filteredD = debitHistory.filter(
  //     (item) =>
  //       (item.paid_for && item.paid_for.toLowerCase().includes(searchValue)) ||
  //       (item.vendor && item.vendor.toLowerCase().includes(searchValue))
  //   );

  //   setFilteredDebits(filteredD);
  //   // console.log("Search Data are:", filteredD);
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

  const handleAdjustSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setAdjustSearch(searchValue);

    const filtered = adjustHistory.filter(
      (adjust) =>
        adjust.po_number.toLowerCase().includes(searchValue) ||
        adjust.vendor.toLowerCase().includes(searchValue) ||
        adjust.item.toLowerCase().includes(searchValue)
    );

    setFilteredAdjusts(filtered);
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
        const token = localStorage.getItem("authToken");

        const response = await Axios.get("/get-all-projecT-IT", {
          headers: {
            "x-auth-token": token,
          },
        });
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
          const token = localStorage.getItem("authToken");

          const response = await Axios.get(
            `/all-bilL-IT?p_id=${projectData.p_id}`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
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
          const token = localStorage.getItem("authToken");
          // Fetch debit history data from the API
          const response = await Axios.get(
            `/get-subtract-amounT-IT?p_id=${projectData.p_id}`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          // console.log("Debit History Response:", response.data);

          const data = response.data?.data ?? [];

          // Fetch purchase orders (PO) data
          const poResponse = await Axios.get("/get-all-pO-IT", {
            headers: {
              "x-auth-token": token,
            },
          });
          // console.log("PO Response:", poResponse.data);

          const poData = poResponse.data?.data || [];

          // Filter debit history based on p_id match
          const filteredDebitHistory = data.filter(
            (item) => String(item.p_id) === String(projectData.p_id)
          );

          // const matchingPO = poData.find(
          //   (po) => String(po.p_id) === String(projectData.p_id)
          // );

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

      // console.log("Deleting selected debits:", selectedDebits);
      const token = localStorage.getItem("authToken");
      // Perform all deletions in parallel
      await Promise.all(
        selectedDebits.map((_id) =>
          Axios.delete(`/delete-subtract-moneY/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
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

  const handleSearchDebit = (event) => {
    const value = event.target.value.toLowerCase();
    setDebitSearch(value);
    applyFilters(value, startDate, endDate);
  };

  const handleStartDateChange = (event) => {
    const value = event.target.value;
    setStartDate(value);
    applyFilters(debitSearch, value, endDate);
  };

  const handleEndDateChange = (event) => {
    const value = event.target.value;
    setEndDate(value);
    applyFilters(debitSearch, startDate, value);
  };

  const handleCreditEndDateChange = (event) => {
    const value = event.target.value;
    const newStart = startCreditDate;
    setEndCreditDate(value);
    applyCreditFilters(newStart, value);
  };

  const handleCreditStartDateChange = (event) => {
    const value = event.target.value;
    const newEnd = endCreditDate;
    setStartCreditDate(value);
    applyCreditFilters(value, newEnd);
  };

  const applyFilters = (searchValue, start, end) => {
    const filteredData = debitHistory.filter((item) => {
      const matchesSearch =
        (item.paid_for && item.paid_for.toLowerCase().includes(searchValue)) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchValue));

      let itemDate = null;
      if (item.dbt_date) {
        const parsedDate = new Date(item.dbt_date);
        if (!isNaN(parsedDate.getTime())) {
          itemDate = parsedDate.toISOString().split("T")[0];
        }
      }

      const matchesDate =
        (!start || (itemDate && itemDate >= start)) &&
        (!end || (itemDate && itemDate <= end));

      return matchesSearch && matchesDate;
    });

    setFilteredDebits(filteredData);
  };

   const applyCreditFilters = (start, end) => {
    const filteredData = creditHistory.filter((item) => {
      

      let itemDate = null;
      if (item.cr_date) {
        const parsedDate = new Date(item.cr_date);
        if (!isNaN(parsedDate.getTime())) {
          itemDate = parsedDate.toISOString().split("T")[0];
        }
      }

      const matchesDate =
        (!start || (itemDate && itemDate >= start)) &&
        (!end || (itemDate && itemDate <= end));

      return matchesDate;
    });

    setCreditHistory(filteredData);
  };



  useEffect(() => {
    if (projectData.code) {
      console.log("projectData.code:", projectData.code);

      const fetchClientHistory = async () => {
        try {
          const token = localStorage.getItem("authToken");

          const response = await Axios.get("/get-all-projecT-IT", {
            headers: { "x-auth-token": token },
          });

          const payResponse = await Axios.get("/get-pay-summarY-IT", {
            headers: { "x-auth-token": token },
          });

          const poResponse = await Axios.get("/get-all-pO-IT", {
            headers: { "x-auth-token": token },
          });

          const billResponse = await Axios.get("/get-all-bilL-IT", {
            headers: { "x-auth-token": token },
          });

          const payData = payResponse.data?.data || [];
          const poData = poResponse.data?.data || [];
          const billData = billResponse.data?.data || [];

          const allProjects = response.data?.data || [];
          const currentProject = allProjects.find(
            (proj) => proj.code === projectData.code
          );

          console.log("Current Project:", currentProject);

          const filteredPOs = poData.filter(
            (po) => po.p_id === projectData.code
          );

          const enrichedPOs = filteredPOs.map((po) => {
            const totalAdvancePaid = payData
              .filter(
                (pay) =>
                  pay.po_number === po.po_number &&
                  pay.approved === "Approved" &&
                  pay.utr
              )
              .reduce((sum, pay) => sum + Number(pay.amount_paid || 0), 0);

            const totalBilledValue = billData
              .filter((bill) => bill.po_number === po.po_number)
              .reduce((sum, bill) => sum + Number(bill.bill_value || 0), 0);

            const poBasic = po.po_basic || 0;
            const calculatedPoBasic =
              currentProject?.billing_type === "Composite"
                ? poBasic * 1.138
                : poBasic;

            return {
              ...po,
              billedValue: totalBilledValue || 0,
              totalAdvancePaid: totalAdvancePaid || 0,
              calculatedPoBasic: String(calculatedPoBasic),
            };
          });

          console.log("Enriched POs:", enrichedPOs);

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
      const token = localStorage.getItem("authToken");
      // console.log("Deleting selected clients:", selectedClients);

      await Promise.all(
        selectedClients.map((_id) =>
          Axios.delete(`/delete-pO-IT/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
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

      if (selectedCredits.length === 0) {
        toast.error("No debits selected for deletion.");
        return;
      }
      const token = localStorage.getItem("authToken");
      // console.log("Deleting selected clients:", selectedCredits);

      await Promise.all(
        selectedCredits.map((_id) =>
          Axios.delete(`/delete-crdit-amount/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("Credit Money Deleted successfully.");

      setCreditHistory((prev) =>
        prev.filter((item) => !selectedCredits.includes(item._id))
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
        sum +
        parseFloat((client.po_value || 0) - (client.totalAdvancePaid || 0)),
      0
    ),
    totalBilledValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.billedValue || 0),
      0
    ),
    totalPOBasicValue: filteredClients.reduce(
      (sum, client) => sum + parseFloat(client.calculatedPoBasic),
      0
    ),
  };

  // console.log("Total PO Basic Value:", clientSummary.totalPOBasicValue);

  const debitHistorySummary = {
    totalCustomerAdjustment: filteredDebits.reduce((sum, row) => {
      if (row.paid_for === "Customer Adjustment") {
        return sum + (row.amount_paid || 0);
      }
      return sum;
    }, 0),
  };
  // console.log("Total Customer Adjustment:", debitHistorySummary);

  useEffect(() => {
    if (projectData.p_id) {
      console.log("projectData.p_id:", projectData.p_id);

      const fetchAdjustHistory = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await Axios.get(
            `/get-all-projecT-IT?p_id=${projectData.p_id}`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          // const payResponse = await Axios.get("/get-pay-summarY-IT");
          // const poResponse = await Axios.get("/get-all-pO-IT");
          // const billResponse = await Axios.get("/get-all-bilL-IT");
          const adjustResponse = await Axios.get("/get-adjustment-request", {
            headers: {
              "x-auth-token": token,
            },
          });

          // const payData = payResponse.data?.data || [];
          // const poData = poResponse.data?.data || [];
          // const billData = billResponse.data?.data || [];

          const adjustData = adjustResponse.data;

          console.log(adjustData);

          const allProjects = response.data?.data || [];
          // Filter debit history based on p_id match
          const filteredAdjustHistory = adjustData.filter(
            (item) => String(item.p_id) === String(projectData.p_id)
          );

          // const matchingPO = poData.find(
          //   (po) => String(po.p_id) === String(projectData.p_id)
          // );

          const updatedAdjusts = filteredAdjustHistory.map((item) => ({
            ...item,
            // po_number: matchingPO ? matchingPO.po_number : "-",
          }));

          // console.log("Updated Adjust History with PO Number:", updatedAdjusts);

          setAdjustHistory(filteredAdjustHistory);
          setFilteredAdjusts(updatedAdjusts);
        } catch (err) {
          console.error("Error fetching adjust history:", err);
          setError("Failed to fetch adjust history. Please try again later.");
        }
      };

      fetchAdjustHistory();
    }
  }, [projectData.p_id]);

  const handleDeleteAdjust = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedAdjust.length === 0) {
        toast.error("No adjustment selected for deletion.");
        return;
      }
      const token = localStorage.getItem("authToken");
      // console.log("Deleting selected clients:", selectedAdjust);

      await Promise.all(
        selectedAdjust.map((_id) =>
          Axios.delete(`/delete-adjustment-request/${_id}`, {
            headers: {
              "x-auth-token": token,
            },
          })
        )
      );

      toast.success("Amount Deleted successfully.");

      setAdjustHistory((prev) =>
        prev.filter((item) => !selectedAdjust.includes(item._id))
      );
      setFilteredAdjusts((prev) =>
        prev.filter((item) => !selectedAdjust.includes(item._id))
      );
      setSelectedAdjust([]);
    } catch (err) {
      console.error("Error deleting adjust:", err);
      setError(err.response?.data?.msg || "Failed to delete selected adjust.");
      toast.error("Failed to delete selected adjust.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustCheckboxChange = (_id) => {
    setSelectedAdjust((prev) =>
      prev.includes(_id) ? prev.filter((item) => item !== _id) : [...prev, _id]
    );
  };
  const handleSelectAllAdjust = (event) => {
    if (event.target.checked) {
      setSelectedAdjust(filteredAdjusts.map((adjust) => adjust._id));
    } else {
      setSelectedAdjust([]);
    }
  };
  const creditTotal = filteredAdjusts
    .filter((row) => row.adj_type === "Add")
    .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);

  const debitTotal = filteredAdjusts
    .filter((row) => row.adj_type === "Subtract")
    .reduce((sum, row) => sum + Math.abs(parseFloat(row.adj_amount || 0)), 0);

  // ***Balance Summary***

  const balanceSummary = [
    {
      crAmt: totalCredited,
      totalReturn: debitHistorySummary.totalCustomerAdjustment,
      totalAdvanceValue: clientSummary.totalAmountPaid,
      totalPoValue: clientSummary.totalPOValue,
      totalBilled: clientSummary.totalBilledValue,
      totalPOBasic: clientSummary.totalPOBasicValue,
      dbAmt: totalDebited,
      adjTotal: debitTotal - creditTotal,
    },
  ];

  const {
    crAmt,
    totalReturn,
    totalAdvanceValue,
    totalPoValue,
    totalBilled,
    totalPOBasic,
    dbAmt,
    adjTotal,
  } = balanceSummary[0];

  // console.log("Total PO Basic (from balanceSummary):", totalPOBasic);

  const Balance_Summary = ({
    crAmt,
    dbAmt,
    adjTotal,
    totalReturn,
    totalAdvanceValue,
    totalPoValue,
    totalBilled,
    // totalPOBasic,
  }) => {
    const crAmtNum = Number(crAmt);
    const dbAmtNum = Number(dbAmt);
    const adjTotalNum = Number(adjTotal);

    const totalAmount = Math.round(crAmtNum - dbAmtNum);

    const netBalance = Math.round(crAmt - totalReturn);
    const balanceSlnko = Math.round(
      netBalance - totalAdvanceValue - adjTotalNum
    );
    const netAdvance = Math.round(totalAdvanceValue - totalBilled);
    const balancePayable = Math.round(totalPoValue - totalBilled - netAdvance);

    const tcs =
      netBalance > 5000000 ? Math.round(netBalance - 5000000) * 0.001 : 0;
    const balanceRequired = Math.round(balanceSlnko - balancePayable - tcs);

    const totalPOBasicvalue = Math.round(totalPoValue - totalPOBasic);

    const headerStyle = {
      fontWeight: "bold",
      padding: "8px",
      borderBottom: "1px solid #ddd",
      textAlign: "left",
    };

    const cellStyle = {
      padding: "8px",
      borderBottom: "1px solid #eee",
    };

    return (
      // <Grid container spacing={2}>
      //   {/* Balance Summary Section */}
      //   <Grid item xs={12} sm={6}>
      //     <Box
      //       sx={{
      //         border: "1px solid #ddd",
      //         borderRadius: "8px",
      //         padding: "16px",
      //       }}
      //     >
      //       <Typography
      //         level="h5"
      //         sx={{ fontWeight: "bold", marginBottom: "12px" }}
      //       >
      //         Balance Summary
      //       </Typography>
      //       <table style={{ width: "100%", borderCollapse: "collapse" }}>
      //         <thead>
      //           <tr>
      //             <th
      //               style={{
      //                 fontWeight: "bold",
      //                 padding: "8px",
      //                 borderBottom: "1px solid #ddd",
      //               }}
      //             >
      //               S.No.
      //             </th>
      //             <th
      //               style={{
      //                 fontWeight: "bold",
      //                 padding: "8px",
      //                 borderBottom: "1px solid #ddd",
      //               }}
      //             >
      //               Description
      //             </th>
      //             <th
      //               style={{
      //                 fontWeight: "bold",
      //                 padding: "8px",
      //                 borderBottom: "1px solid #ddd",
      //               }}
      //             >
      //               Value
      //             </th>
      //           </tr>
      //         </thead>
      //         <tbody>
      //           <tr>
      //             <td style={{ padding: "8px" }}>1</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total Received:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{crAmtNum}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>2</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total Return:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{totalReturn}</td>
      //           </tr>
      //           <tr style={{ backgroundColor: "#C8C8C6" }}>
      //             <td style={{ padding: "8px" }}>3</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Net Balance[(1)-(2)]:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{netBalance}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>4</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total Advance Paid to vendors:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{totalAdvanceValue}</td>
      //           </tr>
      //           <tr style={{ backgroundColor: "#B6F4C6", fontWeight: "bold" }}>
      //             <td style={{ padding: "8px" }}>5</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Balance With Slnko [(3)-(4)]:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{balanceSlnko}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>6</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total PO Value:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{totalPoValue}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>7</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total Billed Value:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{totalBilled}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>8</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Net Advance Paid [(4)-(7)]:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{netAdvance}</td>
      //           </tr>
      //           <tr style={{ backgroundColor: "#B6F4C6", fontWeight: "bold" }}>
      //             <td style={{ padding: "8px" }}>9</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Balance Payable to vendors [(6)-(7)-(8)]:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{balancePayable}</td>
      //           </tr>
      //           <tr>
      //             <td style={{ padding: "8px" }}>10</td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>TCS as applicable:</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{Math.round(tcs)}</td>
      //           </tr>
      //           {totalPOBasic > 0 && (
      //             <tr>
      //               <td style={{ padding: "8px" }}>11</td>
      //               <td style={{ padding: "8px" }}>
      //                 <strong>Extra GST Recoverable from Client:</strong>
      //               </td>
      //               <td style={{ padding: "8px" }}>{totalPOBasicvalue}</td>
      //             </tr>
      //           )}

      //           <tr
      //             style={{
      //               backgroundColor: "#B6F4C6",
      //               fontWeight: "bold",
      //               color: balanceRequired >= 0 ? "green" : "red",
      //             }}
      //           >
      //             <td style={{ padding: "8px" }}>
      //               {totalPOBasic > 0 ? 12 : 11}
      //             </td>
      //             <td style={{ padding: "8px" }}>
      //               <strong>
      //                 Balance Required [
      //                 {totalPOBasic > 0 ? "(5)-(9)-(10)" : "(5)-(9)-(10)"}]:
      //               </strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>{balanceRequired}</td>
      //           </tr>
      //         </tbody>
      //       </table>
      //     </Box>
      //   </Grid>

      //   {/* Amount Available (Old) Section */}
      //   <Grid item xs={12} sm={6}>
      //     <Box
      //       sx={{
      //         border: "1px solid #ddd",
      //         borderRadius: "8px",
      //         padding: "16px",
      //       }}
      //     >
      //       <Typography
      //         level="h5"
      //         sx={{ fontWeight: "bold", marginBottom: "12px" }}
      //       >
      //         Amount Available (Old)
      //       </Typography>
      //       <table style={{ width: "100%", borderCollapse: "collapse" }}>
      //         <thead>
      //           <tr>
      //             <th
      //               style={{
      //                 fontWeight: "bold",
      //                 padding: "8px",
      //                 borderBottom: "1px solid #ddd",
      //               }}
      //             >
      //               Description
      //             </th>
      //             <th
      //               style={{
      //                 fontWeight: "bold",
      //                 padding: "8px",
      //                 borderBottom: "1px solid #ddd",
      //               }}
      //             >
      //               Amount
      //             </th>
      //           </tr>
      //         </thead>
      //         <tbody>
      //           <tr>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Credit - Debit + Adjust</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>
      //               <strong className="text-success">{crAmt}</strong> -
      //               <strong className="text-danger">{dbAmtNum}</strong> +
      //               <strong className="text-primary">{adjTotalNum}</strong>
      //             </td>
      //           </tr>
      //           <tr style={{ backgroundColor: "#fff" }}>
      //             <td style={{ padding: "8px" }}>
      //               <strong>Total</strong>
      //             </td>
      //             <td style={{ padding: "8px" }}>
      //               <strong
      //                 className={
      //                   totalAmount >= 0 ? "text-success" : "text-danger"
      //                 }
      //               >
      //                 {totalAmount}
      //               </strong>
      //             </td>
      //           </tr>
      //         </tbody>
      //       </table>
      //     </Box>
      //   </Grid>
      // </Grid>
      <Grid container spacing={2}>
        {/* Balance Summary Section */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#fff",
              fontSize: "14px",
              "@media print": {
                boxShadow: "none",
                border: "none",
                // pageBreakInside: "avoid",
              },
            }}
          >
            <Typography
              level="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "12px",
                fontSize: "16px",
                "@media print": {
                  fontSize: "14px",
                },
              }}
            >
              Balance Summary
            </Typography>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={headerStyle}>S.No.</th>
                  <th style={headerStyle}>Description</th>
                  <th style={headerStyle}>Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "Total Received", crAmtNum],
                  ["2", "Total Return", totalReturn],
                  ["3", "Net Balance[(1)-(2)]", netBalance, "#C8C8C6"],
                  ["4", "Total Advance Paid to vendors", totalAdvanceValue],
                  ["4A", "Total Adjustment (Debit-Credit)", adjTotalNum],
                  [
                    "5",
                    "Balance With Slnko [(3)-(4)-(4A)]",
                    balanceSlnko,
                    "#B6F4C6",
                    true,
                  ],
                  ["6", "Total PO Value", totalPoValue],
                  ["7", "Total Billed Value", totalBilled],
                  ["8", "Net Advance Paid [(4)-(7)]", netAdvance],
                  [
                    "9",
                    "Balance Payable to vendors [(6)-(7)-(8)]",
                    balancePayable,
                    "#B6F4C6",
                    true,
                  ],
                  ["10", "TCS as applicable", Math.round(tcs)],
                  ...(totalPOBasic > 0
                    ? [
                        [
                          "11",
                          "Extra GST Recoverable from Client",
                          totalPOBasicvalue,
                        ],
                      ]
                    : []),
                  [
                    totalPOBasic > 0 ? "12" : "11",
                    `Balance Required [(5)-(9)-(10)]`,
                    balanceRequired,
                    "#B6F4C6",
                    true,
                    balanceRequired >= 0 ? "green" : "red",
                  ],
                ].map(([sno, desc, value, bgColor, bold, color], index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: bgColor || "#fff",
                      fontWeight: bold ? "bold" : "normal",
                      color: color || "inherit",
                    }}
                  >
                    <td style={cellStyle}>{sno}</td>
                    <td style={cellStyle}>{desc}</td>
                    <td style={cellStyle}>{value}</td>
                  </tr>
                ))}
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
              backgroundColor: "#fff",
              fontSize: "14px",
              "@media print": {
                boxShadow: "none",
                border: "none",
                pageBreakInside: "avoid",
              },
            }}
          >
            <Typography
              level="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "12px",
                fontSize: "16px",
                "@media print": {
                  fontSize: "14px",
                },
              }}
            >
              Amount Available (Old)
            </Typography>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Arial, sans-serif",
                "@media print": {
                  fontSize: "12px",
                },
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      fontWeight: "bold",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "8px",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    <strong>Credit - Debit</strong>
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    <strong className="text-success">{crAmt}</strong> -{" "}
                    <strong className="text-danger">{dbAmtNum}</strong>{" "}
                    {/* <strong className="text-primary">{adjTotalNum}</strong> */}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#fff" }}>
                  <td
                    style={{
                      padding: "8px",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    <strong>Total</strong>
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      "@media print": {
                        padding: "6px",
                        fontSize: "12px",
                      },
                    }}
                  >
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
        marginLeft: { xl: "15%", lg: "20%", sm: "0%" },
        maxWidth: { lg: "80%", sm: "100%", xl: "85%" },
        "@media print": {
          maxWidth: "100%",
        },
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          "@media print": {
            mb: 1,
            alignItems: "flex-start",
          },
        }}
      >
        <Box
          sx={{
            "@media print": {
              width: "100px", // shrink logo if needed
            },
          }}
        >
          <img src={Img12} style={{ maxHeight: "60px", width: "auto" }} />
        </Box>
        <Typography
          variant="h4"
          fontSize={"2.5rem"}
          fontFamily="Playfair Display"
          fontWeight={600}
          sx={{
            textAlign: "center",
            flexGrow: 1,
            "@media print": {
              fontSize: "2rem",
              marginLeft: 2,
              marginRight: 2,
              color: "black",
            },
          }}
        >
          Customer Payment Summary
        </Typography>
        <Box
          textAlign="center"
          sx={{
            "@media print": {
              fontSize: "0.9rem",
            },
          }}
        >
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
        // variant="h1"
        fontWeight={500}
        fontFamily="Playfair Display"
        mt={2}
        mb={1}
        fontSize={"1.5rem"}
      >
        Project Details
      </Typography>
      <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />

      <form>
        <Grid
          container
          spacing={2}
          sm={12}
          md={12}
          sx={{
            display: "flex",
            // justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Grid item sm={6} md={6} sx={{ width: "100%!important" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                "& > .expandable": {
                  transition: "width 0.3s ease",
                  width: "100%",
                  maxWidth: "200px",
                },
                "& > .expandable:focus-within": {
                  maxWidth: "100%",
                },
              }}
            >
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
                value={projectData.customer || "-"}
                readOnly
                label="Client Name"
              />
            </Box>
          </Grid>

          <Grid item sm={6} md={6} sx={{ width: "100%!important" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                "& > .expandable": {
                  transition: "width 0.3s ease",
                  width: "100%",
                  maxWidth: "200px",
                },
                "& > .expandable:focus-within": {
                  maxWidth: "100%",
                },
              }}
            >
              <Input
                fullWidth
                value={projectData.p_group || "-"}
                readOnly
                label="Group Name"
                sx={{ mr: 2 }}
              />

              <Input
                fullWidth
                value={
                  typeof projectData.billing_address === "object"
                    ? `${projectData.billing_address.village_name || "-"}, ${projectData.billing_address.district_name || "-"}`
                    : projectData.billing_address || "-"
                }
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
          </Grid>
        </Grid>
      </form>

      {/* Credit History Section */}

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
            "@media print": {
              display: "none",
            },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              alignItems: { md: "flex-end", xs: "stretch" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startCreditDate}
                onChange={handleCreditStartDateChange}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endCreditDate}
                onChange={handleCreditEndDateChange}
              />
            </FormControl>
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
            width: "100%",
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            stickyHeader
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#ddd",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Credit Date</th>
                {/* <th>Credit Updated TimeStamp</th> */}
                <th>Credit Mode</th>
                <th>Credited Amount (₹)</th>
                <th style={{ textAlign: "center" }}>
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
              {creditHistory
                .slice()
                .sort((a, b) => {
                  const dateA = new Date(a.cr_date || a.createdAt);
                  const dateB = new Date(b.cr_date || b.createdAt);
                  return dateA - dateB;
                })
                .map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Date(
                        row.cr_date || row.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    {/* <td>
                        {row.updatedAt && !isNaN(new Date(row.updatedAt)) ? (
                          <>
                            {new Date(row.updatedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                            ,{" "}
                            {new Date(row.updatedAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </>
                        ) : (
                          "NA"
                        )}
                      </td> */}
                    <td>{row.cr_mode}</td>
                    <td>₹ {row.cr_amount.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "center" }}>
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
              {creditHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    No Credit history available
                  </td>
                </tr>
              ) : (
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td
                    colSpan={2}
                    style={{ color: "dodgerblue", textAlign: "right" }}
                  >
                    Total Credited:
                  </td>
                  <td style={{ color: "dodgerblue" }}>
                    ₹ {totalCredited.toLocaleString("en-IN")}
                  </td>
                  <td />
                </tr>
              )}
            </tfoot>
          </Table>
        </Sheet>
      </Box>

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
            "@media print": {
              display: "none",
            },
          }}
          mb={2}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              alignItems: { md: "flex-end", xs: "stretch" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 250 }}>
              <FormLabel>Search Paid For</FormLabel>
              <Input
                value={debitSearch}
                placeholder="Enter name or vendor"
                onChange={handleSearchDebit}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </FormControl>
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
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            stickyHeader
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#ddd",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Debit Date</th>
                <th>Updated Debit Timestamp</th>
                <th>PO Number</th>
                <th>Paid For</th>
                <th>Paid To</th>
                <th>Amount (₹)</th>
                <th>UTR</th>
                <th style={{ textAlign: "center" }}>
                  <Box>
                    <Checkbox
                      color="primary"
                      onChange={handleSelectAllDebits}
                      checked={selectedDebits.length === filteredDebits.length}
                    />
                  </Box>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredDebits
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
                    <td>
                      {row.updatedAt && !isNaN(new Date(row.updatedAt)) ? (
                        <>
                          {new Date(row.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          ,{" "}
                          {new Date(row.updatedAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </>
                      ) : (
                        "NA"
                      )}
                    </td>

                    <td>{row.po_number}</td>
                    <td>{row.paid_for}</td>
                    <td>{row.vendor}</td>
                    <td>₹ {row.amount_paid.toLocaleString("en-IN")}</td>
                    <td>{row.utr}</td>
                    <td style={{ textAlign: "center" }}>
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
            <tfoot>
              {filteredDebits.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    No debit history available
                  </td>
                </tr>
              ) : (
                <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                  <td colSpan={5} style={{ color: "red", textAlign: "right" }}>
                    Total Debited:
                  </td>

                  <td colSpan={3} style={{ color: "red" }}>
                    ₹ {totalDebited.toLocaleString("en-IN")}
                  </td>
                  {/* <td></td> */}
                  {/* <td></td> */}
                </tr>
              )}
            </tfoot>
          </Table>
        </Sheet>
      </Box>

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
            "@media print": {
              display: "none",
            },
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
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#eee",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
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
                <th style={{ textAlign: "center" }}>
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
                // const billedValue = client.totalBilled || 0;
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
                    <td style={{ textAlign: "center" }}>
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
                <td colSpan={3} style={{ textAlign: "right" }}>
                  Total:{" "}
                </td>
                <td>₹ {clientSummary.totalPOValue.toLocaleString("en-IN")}</td>
                <td>
                  ₹ {clientSummary.totalAmountPaid.toLocaleString("en-IN")}
                </td>
                <td>₹ {clientSummary.totalBalance.toLocaleString("en-IN")}</td>
                <td>
                  ₹ {clientSummary.totalBilledValue.toLocaleString("en-IN")}
                </td>
                <td />
              </tr>
            </tfoot>
          </Table>
        </Sheet>
      </Box>

      {/* Adjust History Section */}
      <Box>
        <Typography
          variant="h5"
          fontFamily="Playfair Display"
          fontWeight={600}
          mt={4}
          mb={2}
        >
          Adjustment History
        </Typography>
        <Divider style={{ borderWidth: "2px", marginBottom: "20px" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { md: "row", xs: "column" },
            "@media print": {
              display: "none",
            },
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
              placeholder="Search here"
              value={adjustSearch}
              onChange={handleAdjustSearch}
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
                disabled={selectedAdjust.length === 0}
                onClick={handleDeleteAdjust}
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
            "@media print": {
              boxShadow: "none",
              p: 0,
              borderRadius: 0,
              overflow: "visible",
            },
          }}
        >
          <Table
            borderAxis="both"
            sx={{
              minWidth: "100%",
              "& thead": {
                backgroundColor: "neutral.softBg",
                "@media print": {
                  backgroundColor: "#eee",
                },
              },
              "& th, & td": {
                textAlign: "left",
                px: 2,
                py: 1.5,
                "@media print": {
                  px: 1,
                  py: 1,
                  fontSize: "12px",
                  border: "1px solid #ccc",
                },
              },
              "@media print": {
                borderCollapse: "collapse",
                width: "100%",
                tableLayout: "fixed",
              },
            }}
          >
            {/* Table Header */}
            <thead>
              <tr>
                <th>Adjust Date</th>
                <th>Updated Adjust Timestamp</th>
                <th>Adjustment Type</th>
                <th>Reason</th>
                <th>PO Number</th>
                <th>Paid For</th>
                <th>Description</th>
                <th>Credit Adjustment</th>
                <th>Debit Adjustment</th>
                <th style={{ textAlign: "center" }}>
                  <Checkbox
                    onChange={handleSelectAllAdjust}
                    checked={selectedAdjust.length === filteredAdjusts.length}
                  />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredAdjusts
                .slice()
                .sort((a, b) => new Date(a.adj_date) - new Date(b.adj_date))
                .map((row) => (
                  <tr key={row.id}>
                    <td>
                      {new Date(row.adj_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {new Date(row.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      ,
                      {new Date(row.updatedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td>{row.pay_type}</td>
                    <td>{row.remark || "-"}</td>
                    <td>{row.po_number || "-"}</td>
                    <td>{row.paid_for}</td>
                    <td>{row.comment || "-"}</td>

                    <td>
                      {row.adj_type === "Add"
                        ? `₹ ${parseFloat(row.adj_amount).toLocaleString("en-IN")}`
                        : "-"}
                    </td>

                    <td>
                      {row.adj_type === "Subtract"
                        ? `₹ ${parseFloat(row.adj_amount).toLocaleString("en-IN")}`
                        : "-"}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        color="primary"
                        checked={selectedAdjust.includes(row._id)}
                        onChange={() => handleAdjustCheckboxChange(row._id)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                <td colSpan={7} style={{ textAlign: "right" }}>
                  Total:{" "}
                </td>
                <td>₹ {creditTotal.toLocaleString("en-IN")}</td>
                <td>₹ {debitTotal.toLocaleString("en-IN")}</td>
                <td></td>
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
        <Button
          variant="solid"
          color="primary"
          onClick={handlePrint}
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          Print
        </Button>
        <Button
          variant="solid"
          color="primary"
          onClick={() => navigate("/project-balance")}
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          Back
        </Button>
        <Button
          variant="solid"
          color="primary"
          onClick={handleExportAll}
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          Export to CSV
        </Button>
      </Box>
    </Container>
  );
};

export default Customer_Payment_Summary;
