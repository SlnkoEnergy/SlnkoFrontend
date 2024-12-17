import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import Button from "@mui/joy/Button";
import Dropdown from "@mui/joy/Dropdown";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";

import React, { useState } from "react";

function MatchRow() {
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // Ensure this is a boolean

  const handleMatchClick = () => {
    if (accountNumber && accountNumber.length > 16){
        setError("IFSC code cannot exceed 16 characters.");
      return;
    }
    if (ifscCode && ifscCode.length > 14) {
      setError("IFSC code cannot exceed 14 characters.");
      return;
    }
    setError("");
    console.log("Proceeding with:", { accountNumber, ifscCode });
    setMenuOpen(false); // Close menu after successful action
  };

  return (
    <Dropdown
      open={!!menuOpen} // Ensure `open` is a boolean
      onOpenChange={(isOpen) => setMenuOpen(!!isOpen)} // Ensure `isOpen` is boolean
    >
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
        onClick={() => setMenuOpen((prev) => !prev)} // Toggle menu open state
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 250, padding: 1 }}>
        <MenuItem>
          <Input
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            type="text"
            sx={{ width: "100%" }}
          />
        </MenuItem>
        <MenuItem>
          <Input
            placeholder="IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            type="text"
            sx={{ width: "100%" }}
            maxLength={14}
          />
        </MenuItem>
        {error && (
          <MenuItem sx={{ color: "red", fontSize: "0.875rem" }}>{error}</MenuItem>
        )}
        <MenuItem>
          <Button
            onClick={handleMatchClick}
            variant="soft"
            color="primary"
            size="sm"
            sx={{ width: "100%" }}
          >
            Match
          </Button>
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default MatchRow;
