import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Button from "@mui/joy/Button";
import Dropdown from "@mui/joy/Dropdown";
import IconButton from "@mui/joy/IconButton";
import {TextField} from "@mui/material";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import axios from "axios";
import React, { useState } from "react";

function MatchRow() {
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMatchClick = (e) => {
    e.preventDefault();
    if (accountNumber.length > 16) {
      setError("Account number cannot exceed 16 characters.");
      return;
    }
    if (ifscCode.length > 14) {
      setError("IFSC code cannot exceed 14 characters.");
      return;
    }
    setError("");
    console.log("Proceeding with:", { accountNumber, ifscCode });
    setMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = { acc_number: accountNumber, ifscCode };
      const response = await axios.post(
        "https://backendslnko.onrender.com/v1/add-pay-request",
        postData
      );
      console.log("Matched successfully:", response.data);
      setError("");
    } catch (error) {
      console.error("Failed Matching:", error);
    }
  };

  return (
    <Dropdown
      open={menuOpen}
      onOpenChange={(isOpen) => setMenuOpen(isOpen)}
    >
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 250, padding: 1 }}>
        <form onSubmit={handleSubmit}>
          <MenuItem>
            <TextField
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              type="text"
              sx={{ width: "100%" }}
              maxLength={16}
            />
          </MenuItem>
          <MenuItem>
            <TextField
              placeholder="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              type="text"
              sx={{ width: "100%" }}
              maxLength={14}
            />
          </MenuItem>
          {error && (
            <MenuItem sx={{ color: "red", fontSize: "0.875rem" }}>
              {error}
            </MenuItem>
          )}
          <MenuItem>
            <Button
              type="submit"
              variant="soft"
              color="primary"
              size="sm"
              sx={{ width: "100%" }}
            >
              Match
            </Button>
          </MenuItem>
        </form>
      </Menu>
    </Dropdown>
  );
}

export default MatchRow;
