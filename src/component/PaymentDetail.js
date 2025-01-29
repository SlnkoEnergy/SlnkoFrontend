import { Box, Button } from "@mui/joy";
import React, { forwardRef, useEffect, useState } from "react";
import Axios from "../utils/Axios";

const PaymentDetail = forwardRef((props, ref) => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState("");
  const [success, setSuccess] = useState("");
  const [downloading, setDownloading] = useState(false);

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
      try {
        const [paySummaryRes, projectRes] = await Promise.all([
          Axios.get("/get-exceldata", {
            params: {
              status: "Not-paid",
            },
          }),
          Axios.get("/get-all-project"),
        ]);

        const paySummary = paySummaryRes.data?.data || [];
        const projects = projectRes.data?.data || [];

        console.log(projects);
        

        if (Array.isArray(paySummary) && Array.isArray(projects)) {
          const structuredData = paySummary.map((item) => {
            const project = projects.find((proj) => proj.p_id === item.p_id);
            const remarks = `${item.paid_for || ""} / ${item.vendor || ""} / ${project?.code || ""}`;

            return {
              id: item.id || Math.random(),
              debitAccount: "025305008971",
              Approved: item.approved || "",
              acc_number: item.acc_number || "",
              benificiary: item.benificiary || "",
              amount_paid: item.amount_paid || 0,
              pay_mod: item.amount_paid > 100000 ? "R" : "N",
              dbt_date: formatDate(item.dbt_date),
              ifsc: item.ifsc || "",
              comment: remarks,
              status: item.status,
              utr: item.utr || "",
              acc_match: item.acc_match || "",
            };
          });

          setData(structuredData);
          console.log("Structured data are:", structuredData);
        } else {
          setError("Invalid data format. Unable to load payment details.");
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  const escapeValue = (value, isAccountNumber = false) => {
    if (value === null || value === undefined || value === "") {
      return `"-"`;
    }
    
    let stringValue = String(value).replace(/"/g, '""');

    if (isAccountNumber) {
      return `"'${stringValue}"`;
    }
  
    return `"${stringValue}"`;
  };

  const downloadSelectedRows = async () => {
    setError("");
    setSuccess("");

    const selectedData = data.filter(
      (row) => selectedRows.includes(row.id) && row.status === "Not-paid"
    );

    if (selectedData.length === 0) {
      setError("No rows available with status 'Not-paid' to download.");
      return;
    }

    try {
      setDownloading(true);

      
      await Axios.put("/update-excel-data", { data: selectedData });

      // CSV headers
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

      // Generate CSV content
      const csvContent =
        [headers.join(",")] +
        "\n" +
        selectedData
          .map((row) =>
            [
              escapeValue(row.debitAccount),
              escapeValue(row.acc_number, true),
              escapeValue(row.benificiary),
              escapeValue(row.amount_paid),
              escapeValue(row.pay_mod),
              escapeValue(row.dbt_date),
              escapeValue(row.ifsc),
              escapeValue(row.payable_location),
              escapeValue(row.print_location),
              escapeValue(row.bene_mobile_no),
              escapeValue(row.bene_email_id),
              escapeValue(row.bene_add1),
              escapeValue(row.bene_add2),
              escapeValue(row.bene_add3),
              escapeValue(row.bene_add4),
              escapeValue(row.add_details_1),
              escapeValue(row.add_details_2),
              escapeValue(row.add_details_3),
              escapeValue(row.add_details_4),
              escapeValue(row.add_details_5),
              escapeValue(row.comment),
            ].join(",")
          )
          .join("\n");

      // Download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Payment_Detail.csv";
      link.click();

      // Remove downloaded rows from the table
      const remainingData = data.filter(
        (row) => !selectedRows.includes(row.id)
      );
      setData(remainingData); // Update table data
      setSelectedRows([]); // Clear selected rows
      setSuccess("File downloaded successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update data. Please try again later."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box
      sx={{
        marginLeft: { xl: "15%", md: "25%", lg: "18%" },
        maxWidth: { lg: "85%", sm: "100%", md: "75%" },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        bgcolor="neutral.soft"
      >
        <Button
          variant="solid"
          color="success"
          onClick={downloadSelectedRows}
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download CSV File"}
        </Button>
      </Box>

      <div style={{ overflowX: "auto", margin: "20px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  fontWeight: "bold",
                  backgroundColor: "#e2e2e2",
                }}
              >
                Select
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Debit Ac No
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Beneficiary Ac No
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Beneficiary Name
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Amt
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Pay Mod
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                IFSC
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Payable Location
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Print Location
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene Mobile No.
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene Email ID
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene add1
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene add2
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene add3
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Bene add4
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Add Details 1
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Add Details 2
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Add Details 3
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Add Details 4
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Add Details 5
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                }}
              >
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((row) => row.status === "Not-paid") // Filter rows with status="Not-paid"
              .map((row) => (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: row.id % 2 === 0 ? "#f9f9f9" : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleCheckboxChange(row.id)}
                    />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.debitAccount}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.acc_number}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.benificiary}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.amount_paid}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.pay_mod}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.dbt_date}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.ifsc}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.payable_location}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.print_location}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_mobile_no}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_email_id}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_add1}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_add2}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_add3}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.bene_add4}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.add_details_1}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.add_details_2}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.add_details_3}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.add_details_4}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.add_details_5}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    {row.comment}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
});

export default PaymentDetail;
