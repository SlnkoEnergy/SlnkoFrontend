import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Paper,
} from "@mui/material";

const PaymentDetail = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data...");

      try {
        const [paySummaryRes, projectRes] = await Promise.all([
          axios.get("/get-pay-summary"),
          axios.get("/get-all-project"),
        ]);

        const paySummary = paySummaryRes.data?.data || [];
        const projects = projectRes.data?.data || [];

        if (Array.isArray(paySummary) && Array.isArray(projects)) {
          const structuredData = paySummary.map((item) => {
            const project = projects.find((proj) => proj.p_id === item.p_id);
            const remarks = `${item.paid_for || ""} / ${item.vendor || ""} / ${project?.code || ""}`;

            return {
              id: item.id || Math.random(),
              debitAccount: "025305008971",
              acc_number: item.acc_number || "",
              benificiary: item.benificiary || "",
              amount_paid: item.amount_paid || 0,
              pay_mod: item.amount_paid > 100000 ? "R" : "N",
              dbt_date: formatDate(item.dbt_date),
              ifsc: item.ifsc || "",
              comment: remarks,
              acc_match: item.acc_match || "",
            };
          });

          console.log("Structured payment data with remarks:", structuredData);
          setData(structuredData);
        } else {
          console.error("Invalid data format received from APIs.", { paySummary, projects });
          setError("Invalid data format. Unable to load payment details.");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (id) => {
    console.log(`Toggling selection for row with ID: ${id}`);
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  useImperativeHandle(ref, () => ({
    downloadSelectedRows() {
      console.log("Preparing to download selected rows...");
      const selectedData = data.filter(
        (row) => selectedRows.includes(row.id) && row.acc_match === "matched"
      );
      console.log("Selected rows data:", selectedData);

      const headers = [
        "Debit Ac No",
        "Beneficiary Ac No",
        "Beneficiary Name",
        "Amt",
        "Pay Mod",
        "Date",
        "IFSC",
        "Payable Location",
        "Print Location",
        "Bene Mobile No.",
        "Bene Email ID",
        "Bene add1",
        "Bene add2",
        "Bene add3",
        "Bene add4",
        "Add Details 1",
        "Add Details 2",
        "Add Details 3",
        "Add Details 4",
        "Add Details 5",
        "Remarks",
      ];

      const csvContent =
        [headers.join(",")] +
        "\n" +
        selectedData
          .map((row) =>
            [
              row.debitAccount,
              row.acc_number,
              row.benificiary,
              row.amount_paid,
              row.pay_mod,
              row.dbt_date,
              row.ifsc,
              row.payable_location,
              row.print_location,
              row.bene_mobile_no,
              row.bene_email_id,
              row.bene_add1,
              row.bene_add2,
              row.bene_add3,
              row.bene_add4,
              row.add_details_1,
              row.add_details_2,
              row.add_details_3,
              row.add_details_4,
              row.add_details_5,
              row.comment,
            ].join(",")
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Payment_Detail.csv";
      link.click();
    },
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        bgcolor="#e2e8f5"
      >
        <Typography variant="h5" textAlign="center" style={{ flex: 1 }}>
          Payment Detail
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => ref.current.downloadSelectedRows()}
        >
          Download CSV File
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f5f5f5" }}>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Select</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Debit Ac No</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Beneficiary Ac No</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Beneficiary Name</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Amt</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Pay Mod</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Date</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>IFSC</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Payable Location</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Print Location</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene Mobile No.</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene Email ID</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene add1</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene add2</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene add3</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Bene add4</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Add Details 1</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Add Details 2</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Add Details 3</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Add Details 4</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Add Details 5</TableCell>
              <TableCell style={{ fontSize: "1.2rem", fontWeight: "500", padding: "8px" }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleCheckboxChange(row.id)}
                  />
                </TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.debitAccount}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.acc_number}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.benificiary}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.amount_paid}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.pay_mod}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.dbt_date}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.ifsc}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.payable_location}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.print_location}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_mobile_no}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_email_id}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_add1}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_add2}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_add3}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.bene_add4}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.add_details_1}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.add_details_2}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.add_details_3}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.add_details_4}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.add_details_5}</TableCell>
                <TableCell style={{ fontSize: "1rem", fontWeight: "300" }}>{row.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

export default PaymentDetail;