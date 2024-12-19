import React, { useState, useEffect } from "react";
import axios from "axios";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Dropdown, IconButton, MenuButton, Menu, MenuItem, Input, Button } from "@mui/joy";

const Account_Match = ({ PaymentId }) => {
  const [accNumber, setAccNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await axios.get(`https://backendslnko.onrender.com/v1/get-pay-summary/${PaymentId}`);
        
        if (response.data.success) {
          if (response.data.PaymentId === PaymentId) {
            setAccNumber(response.data.acc_number || ""); 
            setIfsc(response.data.ifsc || "");
            setError(null);
          } else {
            setError("Pay ID does not match any records.");
            setAccNumber("");
            setIfsc("");
          }
        } else {
          setError("Failed to fetch account details.");
          setAccNumber("");
          setIfsc("");
        }
      } catch (err) {
        setError("Error fetching account details.");
        setAccNumber("");
        setIfsc("");
        console.error("Fetch error:", err);
      }
    };

    fetchAccountDetails();
  }, [PaymentId]);

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 250, padding: 1 }}>
        <MenuItem>
          <Input
            placeholder="Account Number"
            value={accNumber}
            name="acc_number"
            sx={{ width: "100%" }}
            disabled // Make input readonly since data comes from API
          />
        </MenuItem>
        <MenuItem>
          <Input
            placeholder="IFSC Code"
            value={ifsc}
            name="ifsc"
            sx={{ width: "100%" }}
            disabled // Make input readonly since data comes from API
          />
        </MenuItem>
        {error && (
          <MenuItem sx={{ color: "red", fontSize: "0.875rem" }}>
            {error}
          </MenuItem>
        )}
      </Menu>
    </Dropdown>
  );
};

export default Account_Match;
