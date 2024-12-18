import React, { useState } from 'react';
import Chip from '@mui/joy/Chip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';

function Match_Row() {
    const [payment, setPayment] = useState("");
  return (
    <>
    <Chip
    variant="soft"
    size="sm"
    startDecorator={
      payment.acc_match === "matched" ? (
        <CheckRoundedIcon />
      ) : (
        <BlockIcon />
      )
    }
    color={
      payment.acc_match === "matched"
        ? "success"
        : "neutral"
    }
  >
    {payment.acc_match === "matched" ? payment.acc_match : "match"}
  </Chip>
  </>
  )
}

export default Match_Row