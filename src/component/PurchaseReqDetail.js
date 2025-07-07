import { useState } from "react";
import {
  Typography,
  Stack,
  Sheet,
  Button,
  Box,
  Container,
  Modal,
  ModalDialog,
  Tooltip,
  Chip,
} from "@mui/joy";
import {
  useGetPurchaseRequestQuery,
} from "../redux/camsSlice";
import PurchaseOrderSummary from "./PurchaseOrderSummary";
import { useSearchParams } from "react-router-dom";
import ADDPO from "../component/Forms/Add_Po";

const PurchaseReqDetail = () => {
  const [searchParams] = useSearchParams();
  const project_id = searchParams.get("project_id");
  const item_id = searchParams.get("item_id");
  const pr_id = searchParams.get("pr_id");
  const [open, setOpen] = useState(false);
  const {
    data: getPurchaseRequest,
    isLoading,
    error,
  } = useGetPurchaseRequestQuery({ project_id, item_id, pr_id });

   
  
  console.log("pr_id", getPurchaseRequest?.purchase_request?._id);
  

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        ml: "20%",
        gap: 2,
        mt: 8,
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {/* PR Details Sheet */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "sm",
          padding: 3,
          bgcolor: "background.surface",
          maxWidth: 1200,
        }}
      >
        <Typography level="h4" textAlign="center" mb={2}>
          PR Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              PR No:
            </Typography>
            <Typography level="body-md">
              {getPurchaseRequest?.purchase_request?.pr_no}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Project ID:
            </Typography>
            <Typography level="body-md">
              {getPurchaseRequest?.purchase_request?.project?.name}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Project Code:
            </Typography>
            <Typography level="body-md">
              {getPurchaseRequest?.purchase_request?.project?.code}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Item:
            </Typography>
            <Typography level="body-md">
              {getPurchaseRequest?.item?.item_id?.name}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Total PO Count:
            </Typography>
            <Typography level="body-md">
              {getPurchaseRequest?.overall?.total_po_count || 0}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Total PO Value (With GST):
            </Typography>
            <Typography level="body-md">
              ₹ {getPurchaseRequest?.overall?.total_value_with_gst || 0}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              Status:
            </Typography>
            <Chip
              color={
                getPurchaseRequest?.item?.current_status?.status ===
                "approved"
                  ? "success"
                  : getPurchaseRequest?.item?.current_status
                        ?.status === "submitted"
                    ? "primary"
                    : getPurchaseRequest?.item?.current_status
                          ?.status === "out_for_delivery"
                      ? "warning"
                      : getPurchaseRequest?.item?.current_status
                            ?.status === "delivered"
                        ? "success"
                        : "neutral"
              }
              variant="soft"
            >
              {getPurchaseRequest?.item?.current_status?.status
                ?.replace(/_/g, " ")
                ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "-"}
            </Chip>
          </Stack>

          <Tooltip
            title={
              getPurchaseRequest?.item?.etd === null
                ? "Please select ETD first"
                : ""
            }
          >
            <span>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => setOpen(true)}
              >
                + Add PO
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Sheet>

      <PurchaseOrderSummary project_code={getPurchaseRequest?.purchase_request?.project?.code} pr_id={getPurchaseRequest?.purchase_request?._id?.toString()} />
      
      
      {/* Add PO Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 900,
            width: "100%",
            height: "80vh",
            p: 0,
            borderRadius: "lg",
            overflowY: "auto",
            backgroundColor: "background.surface",
          }}
        >
          <ADDPO
            onClose={() => setOpen(false)}
            pr_id={getPurchaseRequest?.purchase_request?._id}
            project_id={project_id}
            item_id={item_id}
            item_name={getPurchaseRequest?.item?.item_id?.name}
            project_code={getPurchaseRequest?.purchase_request?.project?.code}
          />
        </ModalDialog>
      </Modal>
    </Container>
  );
};

export default PurchaseReqDetail;
