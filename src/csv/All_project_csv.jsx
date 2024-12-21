import React from 'react';


const formatToIndianAmount = (amount) => {
  if (isNaN(amount)) return amount;
  return new Intl.NumberFormat('en-IN').format(amount);
};

function All_project_csv() {
  const headers = [
    "Project ID",
    "Customer",
    "Project Name",
    "Email",
    "Mobile",
    "State",
    "Slnko Service Charges (with GST)",
  ];

  // Static data
  const data = [
    {
      id: 1,
      projectID: "P123",
      customer: "John Doe",
      projectName: "Project Alpha",
      email: "john@example.com",
      mobile: "1234567890",
      state: "California",
      slnkoServiceCharges: 5000000, 
    },
    {
      id: 2,
      projectID: "P124",
      customer: "Jane Smith",
      projectName: "Project Beta",
      email: "jane@example.com",
      mobile: "9876543210",
      state: "Texas",
      slnkoServiceCharges: 8000000,
    },
  ];

  
  const selectedRows = [2];

  const downloadSelectedRows = () => {
    console.log("Preparing to download selected rows...");

    // Filter selected rows
    const selectedData = data.filter((row) => selectedRows.includes(row.id));
    console.log("Selected rows data:", selectedData);

    // Prepare CSV content
    const csvContent =
      headers.map((header) => `"${header}"`).join(",") +
      "\n" +
      selectedData
        .map((row) =>
          [
            `"${row.projectID}"`,
            `"${row.customer}"`,
            `"${row.projectName}"`,
            `"${row.email}"`,
            `"${row.mobile}"`,
            `"${row.state}"`,
            `"${formatToIndianAmount(row.slnkoServiceCharges)}"`, 
          ].join(",")
        )
        .join("\n");

    // Create a Blob and initiate download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "selected_rows.csv";
    link.click();

    console.log("CSV file download initiated.");
  };

  return (
    <div>
      <h1>Download Selected Rows</h1>
      <button onClick={downloadSelectedRows}>Download CSV</button>
    </div>
  );
}

export default All_project_csv;
