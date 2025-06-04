import React, { useState } from "react";
import { Sheet, Typography, Stack, Button } from "@mui/joy";

const data = {
  Electrical: [
    "Electrical data item 1",
    "Electrical data item 2",
    "Electrical data item 3",
  ],
  Mechanical: [
    "Mechanical data item 1",
    "Mechanical data item 2",
    "Mechanical data item 3",
  ],
  Civil: ["Civil data item 1", "Civil data item 2", "Civil data item 3"],
};

const Overview = () => {
  const [selected, setSelected] = useState("Electrical");

  return (
    <Sheet
      variant="outlined"
      sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, borderRadius: "md" }}
    >
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {["Electrical", "Mechanical", "Civil"].map((category) => (
          <Button
            key={category}
            variant={selected === category ? "solid" : "outlined"}
            color={selected === category ? "primary" : "neutral"}
            onClick={() => setSelected(category)}
          >
            {category}
          </Button>
        ))}
      </Stack>

      <Typography level="h5" sx={{ mb: 2 }}>
        {selected} Data
      </Typography>
      <ul>
        {data[selected].map((item, index) => (
          <li key={index}>
            <Typography>{item}</Typography>
          </li>
        ))}
      </ul>
    </Sheet>
  );
};

export default Overview;
