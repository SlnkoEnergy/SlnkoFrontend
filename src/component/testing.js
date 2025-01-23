import React, { useState } from "react";
import Axios from "../utils/Axios";
import { enqueueSnackbar } from "notistack";

const AccountMatchComponent = () => {
  const [paymentId, setPaymentId] = useState("");
  const [accountMatch, setAccountMatch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [isMatched, setIsMatched] = useState(false);
  const [error, setError] = useState(null);

  const handleAccountMatch = async () => {
    if (!accountMatch) {
      setError("Account Number required!!");
      return;
    }

    if (!paymentId) {
      setError("Payment ID required!!");
      return;
    }

    setError(null); // Clear any previous errors

    try {
      // Get the stored pay_id from localStorage
      let storedPayId = localStorage.getItem("account-match");
      storedPayId = String(storedPayId); // Ensure it's a string
      console.log("Stored Pay ID:", storedPayId);

      // Check if the localStorage pay_id matches the provided paymentId
      if (storedPayId !== paymentId) {
        enqueueSnackbar("Pay ID mismatch. Unable to match account.", { variant: "error" });
        return;
      }

      // Proceed with the account match
      const response = await Axios.put("/acc-matched", {
        pay_id: paymentId,
        acc_number: accountMatch,
        ifsc: ifsc,
      });

      if (response.status === 200) {
        setIsMatched(true);
        enqueueSnackbar("Account matched successfully!", { variant: "success" });
      } else {
        enqueueSnackbar("Failed to match account. Please try again.", { variant: "error" });
      }
    } catch (error) {
      console.error("Error during account match:", error);
      enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
    }
  };

  return (
    <div>
      <h2>Account Match</h2>
      <div>
        <label>Payment ID:</label>
        <input
          type="text"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          placeholder="Enter Payment ID"
        />
      </div>
      <div>
        <label>Account Number:</label>
        <input
          type="text"
          value={accountMatch}
          onChange={(e) => setAccountMatch(e.target.value)}
          placeholder="Enter Account Number"
        />
      </div>
      <div>
        <label>IFSC Code:</label>
        <input
          type="text"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          placeholder="Enter IFSC Code"
        />
      </div>
      <button onClick={handleAccountMatch}>Match Account</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isMatched && <p style={{ color: "green" }}>Account successfully matched!</p>}
    </div>
  );
};

export default AccountMatchComponent;
