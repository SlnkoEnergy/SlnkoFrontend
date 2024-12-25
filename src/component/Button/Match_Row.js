import BlockIcon from "@mui/icons-material/Block";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Chip, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";

const MatchRow = ({ payment }) => {
  const [paySummary, setPaySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pay summary data if matched
  useEffect(() => {
    if (payment.acc_match === "matched" && !paySummary) {
      setLoading(true);
      fetchPaySummary();
    }
  }, [payment.acc_match, paySummary]);

  // Fetch Pay Summary API
  const fetchPaySummary = async () => {
    try {
      const response = await fetch(
        `https://backendslnko.onrender.com/v1/get-pay-summary?acc_number=${payment.acc_number}&ifsc=${payment.ifsc}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pay summary.");
      }
      const data = await response.json();
      setPaySummary(data.summary); // Set the pay summary data
    } catch (error) {
      setError("Error fetching pay summary.");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Chip
        variant="soft"
        size="sm"
        startDecorator={
          payment.acc_match === "matched" ? <CheckRoundedIcon /> : <BlockIcon />
        }
        color={payment.acc_match === "matched" ? "success" : "neutral"}
      >
        {payment.acc_match === "matched" ? payment.acc_match : "match"}
      </Chip>

      {payment.acc_match === "matched" && (
        <div style={{ marginTop: "8px", textAlign: "center" }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <div style={{ color: "red" }}>{error}</div>
          ) : (
            <div>{paySummary}</div> // Display the fetched summary
          )}
        </div>
      )}
    </div>
  );
};

export default MatchRow;
