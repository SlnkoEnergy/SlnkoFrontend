import React, { useState } from "react";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Dropdown from "@mui/joy/Dropdown";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Button from "@mui/joy/Button";
import axios from "axios";

function AccountMatch() {
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        "https://backendslnko.onrender.com/v1/add-pay-request",
        {
          params: { acc_number: accountNumber, ifsc: ifscCode },
        }
      );
      console.log("Response Data:", response.data);
      setError("");
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch data.");
    }
  };

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 250, padding: 1 }}>
        <form onSubmit={handleSubmit}>
          <MenuItem>
            <Input
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              sx={{ width: "100%" }}
            />
          </MenuItem>
          <MenuItem>
            <Input
              placeholder="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              sx={{ width: "100%" }}
            />
          </MenuItem>
          {error && (
            <MenuItem sx={{ color: "red", fontSize: "0.875rem" }}>
              {error}
            </MenuItem>
          )}
          <MenuItem>
            <Button type="submit" variant="solid" color="primary" size="sm" sx={{ width: "100%" }}>
              Fetch Data
            </Button>
          </MenuItem>
        </form>
      </Menu>
    </Dropdown>
  );
}

export default AccountMatch;
