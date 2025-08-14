import axios from "axios";
import { usePayment } from "../store/Context/Payment_History";
import Axios from "../utils/Axios";

const PaymentHistory = ({ po_number }) => {
  const { history, total_debited, isLoading, error } = usePayment();

  // console.log("PoNumber payment history: ", po_number);

  const handleCSVDownload = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await Axios.get(
        `accounting/debithistorycsv?po_number=${po_number}`,
        {
          responseType: "blob",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      let filename = "payment-history.csv";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading CSV:", err);
    }
  };

  const handleClose = () => {
    window.history.back();
  };

  if (isLoading) return <p>Loading payment history...</p>;
  if (error) return <p>Error loading payment history.</p>;
  if (!history.length) return <p>No payment history available.</p>;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>Payment History</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={buttonStyle} onClick={handleCSVDownload}>
            Export to CSV
          </button>
          <button style={buttonStyle} onClick={handleClose}>
            Close
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Debit Date</th>
              <th>PO Number</th>
              <th>Paid To</th>
              <th>Paid For</th>
              <th>Amount</th>
              <th>UTR</th>
              <th>UTR Submitted</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.debit_date}</td>
                <td>{entry.po_number}</td>
                <td>{entry.paid_to}</td>
                <td>{entry.paid_for}</td>
                <td>₹{entry.amount_paid.toLocaleString()}</td>
                <td>{entry.utr}</td>
                <td>{entry.utr_submitted_date}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={tfootStyle}>
              <td colSpan="4" style={{ textAlign: "right" }}>
                Total:&nbsp;
              </td>
              <td style={{ fontWeight: "bold" }}>
                ₹{total_debited?.toLocaleString("en-IN")}
              </td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: "0.5rem",
  maxWidth: "100vw",
  margin: "auto",
  fontFamily: "Arial, sans-serif",
  border: "1px solid #ccc",
  borderRadius: "8px",
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "0.5rem 1rem",
  marginBottom: "1rem",
};

const buttonStyle = {
  backgroundColor: "#1976d2",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  minWidth: "100px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const nowrapStyle = {
  whiteSpace: "nowrap",
};

const tfootStyle = {
  backgroundColor: "#f9f9f9",
  fontWeight: "bold",
  borderTop: "2px solid #ccc",
};

export default PaymentHistory;
