import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Container,
  Sheet,
  Stack,
} from "@mui/joy";

const PurchaseReqDetail = () => {
  const data = {
    pr_no: "PR12345",
    project_id: "PJT001",
    project_code: "PROJ-CODE-22",
    item: "Solar Panel 250W",
  };

  return (
    <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "sm",
          padding: 3,
          minWidth: 400,
          bgcolor: "background.surface",
        }}
      >
        <Typography level="h4" textAlign="center" mb={2}>
          PR Details
        </Typography>
        <Stack direction="row" spacing={4} flexWrap="wrap">
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography fontWeight={700} level="body-sm" textColor="text.secondary">
      PR No:
    </Typography>
    <Typography level="body-md">{data.pr_no}</Typography>
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography fontWeight={700} level="body-sm" textColor="text.secondary">
      Project ID:
    </Typography>
    <Typography level="body-md">{data.project_id}</Typography>
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography fontWeight={700} level="body-sm" textColor="text.secondary">
      Project Code:
    </Typography>
    <Typography level="body-md">{data.project_code}</Typography>
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center">
    <Typography fontWeight={700} level="body-sm" textColor="text.secondary">
      Item:
    </Typography>
    <Typography level="body-md">{data.item}</Typography>
  </Stack>
</Stack>


      </Sheet>
    </Container>
  );
};

export default PurchaseReqDetail;
