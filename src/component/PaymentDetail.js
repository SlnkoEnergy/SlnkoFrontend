import React, { forwardRef, useEffect, useState, Fragment } from "react";
import {
  Box,
  Button,
  Sheet,
  Typography,
  Chip,
  Checkbox,
  Alert,
  LinearProgress,
  Tooltip,
} from "@mui/joy";
import Axios from "../utils/Axios";

const cellSx = {
  px: 1.5,
  py: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "neutral.outlinedBorder",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 220,
};

const headerCellSx = {
  ...cellSx,
  fontWeight: 700,
  bgcolor: "background.level1",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

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
        const token = localStorage.getItem("authToken");
        const configWithToken = {
          headers: { "x-auth-token": token },
        };

        const [paySummaryRes, projectRes, purchaseRes] = await Promise.all([
          Axios.get("/get-exceldata", {
            params: { status: "Not-paid" },
            ...configWithToken,
          }),
          Axios.get("/get-all-projecT-IT", configWithToken),
          Axios.get("/get-pay-summarY-IT", configWithToken),
        ]);

        const paySummary = paySummaryRes.data?.data || [];
        const projects = projectRes.data?.data || [];
        const purchase = purchaseRes.data?.data || [];

        if (
          Array.isArray(paySummary) &&
          Array.isArray(projects) &&
          Array.isArray(purchase)
        ) {
          const structuredData = paySummary.map((item) => {
            const project = projects.find(
              (proj) => String(proj.p_id) === String(item.p_id)
            );
            const remarks = `${item?.po_number || "-"} / ${
              item.paid_for || "-"
            } / ${item.vendor || ""} / ${project?.code || "-"}`;

            return {
              id: item._id,
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
      return "-";
    }
    let stringValue = String(value).replace(/"/g, '""');
    if (isAccountNumber) {
      return `'${stringValue}`;
    }
    return `${stringValue}`;
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

      for (let row of selectedData) {
        try {
          const token = localStorage.getItem("authToken");
          await Axios.put(
            "/update-excel",
            { _id: row.id },
            {
              headers: { "x-auth-token": token },
            }
          );
        } catch (err) {
          console.error(
            `Failed to update status for row ${row.id}: ${err.message}`
          );
        }
      }

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

      const selectedDataRows = data.filter(
        (row) => selectedRows.includes(row.id) && row.status === "Not-paid"
      );

      const csvContent =
        [headers.join(",")] +
        "\n" +
        selectedDataRows
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

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Payment-Bank-Detail.csv";
      link.click();

      const remainingData = data.filter(
        (row) => !selectedRows.includes(row.id)
      );
      setData(remainingData);
      setSelectedRows([]);
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

  const notPaidRows = data.filter((r) => r.status === "Not-paid");
  const selectedCount = selectedRows.filter((id) =>
    notPaidRows.some((r) => r.id === id)
  ).length;

  if (loading) {
    return (
      <Sheet
        variant="soft"
        sx={{
          mx: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          p: 2,
          borderRadius: "lg",
        }}
      >
        <Typography level="title-md" mb={1}>
          Loading payments…
        </Typography>
        <LinearProgress size="sm" />
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet
        variant="soft"
        color="danger"
        sx={{
          mx: { xl: "15%", lg: "18%" },
          maxWidth: { lg: "85%", sm: "100%" },
          p: 2,
          borderRadius: "lg",
        }}
      >
        <Alert color="danger" variant="soft">
          {error}
        </Alert>
      </Sheet>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: { xl: "15%", lg: "18%" },
        maxWidth: { lg: "85%", sm: "100%" },
      }}
      ref={ref}
    >
      {/* Top toolbar */}
      <Sheet
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 1.5,
          borderRadius: "lg",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "saturate(180%) blur(6px)",
          bgcolor: "background.body",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="title-md">Payment Bank Export</Typography>
          <Chip variant="soft" color="neutral" size="sm">
            Not-paid: {notPaidRows.length}
          </Chip>
          <Chip
            variant="soft"
            color={selectedCount > 0 ? "primary" : "neutral"}
            size="sm"
          >
            Selected: {selectedCount}
          </Chip>
        </Box>

        <Button
          variant="solid"
          color="success"
          onClick={downloadSelectedRows}
          disabled={downloading || selectedCount === 0}
          sx={{ minWidth: 190 }}
        >
          {downloading ? "Preparing CSV…" : "Download CSV File"}
        </Button>
      </Sheet>

      {/* Success / Info banners */}
      <Box sx={{ display: "grid", gap: 1, mb: 1 }}>
        {success ? (
          <Alert color="success" variant="soft">
            {success}
          </Alert>
        ) : null}
        {payments ? (
          <Alert color="neutral" variant="soft">
            {payments}
          </Alert>
        ) : null}
      </Box>

      {/* Table container */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          overflow: "auto",
          "--Table-headerUnderlineThickness": "1px",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 1200,
            "& thead th": headerCellSx,
            "& tbody td": cellSx,
            "& tbody tr:hover": {
              bgcolor: "background.level1",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 70 }}>
                <Typography level="body-sm" fontWeight={700}>
                  Select
                </Typography>
              </th>
              <th>Debit Ac No</th>
              <th>Beneficiary Ac No</th>
              <th>Beneficiary Name</th>
              <th>Amt</th>
              <th>Pay Mod</th>
              <th>Date</th>
              <th>IFSC</th>
              <th>Payable Location</th>
              <th>Print Location</th>
              <th>Bene Mobile No.</th>
              <th>Bene Email ID</th>
              <th>Bene add1</th>
              <th>Bene add2</th>
              <th>Bene add3</th>
              <th>Bene add4</th>
              <th>Add Details 1</th>
              <th>Add Details 2</th>
              <th>Add Details 3</th>
              <th>Add Details 4</th>
              <th>Add Details 5</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {notPaidRows.map((row, index) => {
              const isSelected = selectedRows.includes(row.id);

              const Cell = ({ children }) => (
                <td>
                  {typeof children === "string" ||
                  typeof children === "number" ? (
                    <Tooltip
                      title={String(children || "").trim() || "-"}
                      placement="top"
                      variant="outlined"
                    >
                      <Typography level="body-sm">{children || "-"}</Typography>
                    </Tooltip>
                  ) : (
                    <Fragment>{children}</Fragment>
                  )}
                </td>
              );

              return (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--joy-palette-background-level1)"
                        : "transparent",
                  }}
                >
                  <td>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(row.id)}
                      variant={isSelected ? "solid" : "outlined"}
                      color={isSelected ? "primary" : "neutral"}
                      size="sm"
                    />
                  </td>
                  <Cell>{row.debitAccount}</Cell>
                  <Cell>{row.acc_number}</Cell>
                  <Cell>{row.benificiary}</Cell>
                  <Cell>
                    <Chip size="sm" variant="soft" color="primary">
                      {row.amount_paid}
                    </Chip>
                  </Cell>
                  <Cell>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={row.pay_mod === "R" ? "warning" : "success"}
                    >
                      {row.pay_mod}
                    </Chip>
                  </Cell>
                  <Cell>{row.dbt_date}</Cell>
                  <Cell>{row.ifsc}</Cell>
                  <Cell>{row.payable_location}</Cell>
                  <Cell>{row.print_location}</Cell>
                  <Cell>{row.bene_mobile_no}</Cell>
                  <Cell>{row.bene_email_id}</Cell>
                  <Cell>{row.bene_add1}</Cell>
                  <Cell>{row.bene_add2}</Cell>
                  <Cell>{row.bene_add3}</Cell>
                  <Cell>{row.bene_add4}</Cell>
                  <Cell>{row.add_details_1}</Cell>
                  <Cell>{row.add_details_2}</Cell>
                  <Cell>{row.add_details_3}</Cell>
                  <Cell>{row.add_details_4}</Cell>
                  <Cell>{row.add_details_5}</Cell>
                  <Cell>
                    <Tooltip
                      title={row.comment || "-"}
                      placement="top"
                      variant="outlined"
                      arrow
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          minHeight: "32px",
                        }}
                      >
                        <Typography
                          level="body-sm"
                          noWrap
                          sx={{
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {row.comment || "-"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Cell>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Sheet>
    </Box>
  );
});

export default PaymentDetail;
