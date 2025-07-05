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
  Input,
  Tooltip,
  IconButton,
  Textarea,
} from "@mui/joy";
import {
  useEditPurchaseRequestMutation,
  useGetPurchaseRequestQuery,
} from "../redux/camsSlice";
import { useSearchParams } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DoneIcon from "@mui/icons-material/Done";
import ADDPO from "../component/Forms/Add_Po";
import { toast } from "react-toastify";

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

  const [etdDate, setEtdDate] = useState("");
  const [updateETD, { isLoading: isSubmitting }] =
    useEditPurchaseRequestMutation();

  const handleETDSubmit = async (pr_id) => {
    if (!etdDate) {
      toast.error("Please select ETD date.");
      return;
    }

    if (!pr_id) {
      toast.error("Purchase Request ID is missing.");
      return;
    }

    const payload = {
      purchaseRequestData: {
        etd: etdDate,
      },
    };

    try {
      console.log("Payload being sent for ETD update:", payload);

      await updateETD({ pr_id, payload }).unwrap();

      toast.success("ETD updated successfully!");
      setEtdDate("");
    } catch (error) {
      console.error("Error updating ETD:", error);
      toast.error(error?.data?.message || "Failed to update ETD.");
    }
  };

  const [remarks, setRemarks] = useState("");
  const [openOutModal, setOpenOutModal] = useState(false);
  const [openDeliveryDoneModal, setOpenDeliveryDoneModal] = useState(false);

  const currentStatus =
    getPurchaseRequest?.purchase_request?.current_status?.status;

  const handleOutForDelivery = () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks.");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to change status to Out for Delivery?"
      )
    ) {
      // handleStatusChange(pr_id, "out_for_delivery", remarks);
      setOpenOutModal(false);
      setRemarks("");
    }
  };

  const handleDeliveryDone = () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks.");
      return;
    }

    if (window.confirm("Are you sure you want to mark Delivery as Done?")) {
      // handleStatusChange(pr_id, "delivery_done", remarks);
      setOpenDeliveryDoneModal(false);
      setRemarks("");
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        ml: "14%",
        gap: 2,
        mt: 8,
        width: "100%",
        minHeight: "100vh",
        // backgroundColor: "background.level1",
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
        <Stack
          direction="row"
          spacing={4}
          flexWrap="wrap"
          justifyContent={"space-evenly"}
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

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              fontWeight={700}
              level="body-sm"
              textColor="text.secondary"
            >
              ETD:
            </Typography>

            {getPurchaseRequest?.purchase_request?.etd ? (
              <Typography level="body-md">
                {new Date(
                  getPurchaseRequest.purchase_request.etd
                ).toLocaleDateString()}
              </Typography>
            ) : (
              <>
                <Input
                  name="etd"
                  type="date"
                  value={etdDate}
                  onChange={(e) => setEtdDate(e.target.value)}
                  required
                  sx={{ minWidth: 160 }}
                />

                <Button
                  size="sm"
                  variant="solid"
                  color="primary"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleETDSubmit(pr_id)}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            {currentStatus === "approved" && (
              <>
                <IconButton
                  variant="solid"
                  color="primary"
                  onClick={() => setOpenOutModal(true)}
                >
                  <LocalShippingIcon />
                </IconButton>

                <Modal
                  open={openOutModal}
                  onClose={() => setOpenOutModal(false)}
                >
                  <ModalDialog>
                    <Typography level="h5" mb={2}>
                      Out for Delivery Remarks
                    </Typography>
                    <Textarea
                      minRows={3}
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      mt={2}
                      spacing={2}
                    >
                      <Button
                        variant="plain"
                        onClick={() => setOpenOutModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="solid"
                        color="primary"
                        onClick={handleOutForDelivery}
                      >
                        Confirm
                      </Button>
                    </Stack>
                  </ModalDialog>
                </Modal>
              </>
            )}

            {currentStatus === "out_for_delivery" && (
              <>
                <Button
                  size="sm"
                  variant="solid"
                  color="success"
                  startDecorator={<DoneIcon />}
                  onClick={() => setOpenDeliveryDoneModal(true)}
                >
                  Delivery Done
                </Button>

                <Modal
                  open={openDeliveryDoneModal}
                  onClose={() => setOpenDeliveryDoneModal(false)}
                >
                  <ModalDialog>
                    <Typography level="h5" mb={2}>
                      Delivery Done Remarks
                    </Typography>
                    <Textarea
                      minRows={3}
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      mt={2}
                      spacing={2}
                    >
                      <Button
                        variant="plain"
                        onClick={() => setOpenDeliveryDoneModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="solid"
                        color="success"
                        onClick={handleDeliveryDone}
                      >
                        Confirm
                      </Button>
                    </Stack>
                  </ModalDialog>
                </Modal>
              </>
            )}
          </Stack>
        </Stack>
      </Sheet>
      {/* PO Details Sheet */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "md",
          boxShadow: "sm",
          padding: 3,
          minWidth: 400,
          bgcolor: "background.surface",
          maxHeight: "40vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography level="h4" textAlign="center" mb={2}>
          PO Details
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
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

          <Tooltip
            title={
              getPurchaseRequest?.purchase_request?.etd === null
                ? "Please select ETD first"
                : ""
            }
          >
            <span>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => setOpen(true)}
                disabled={getPurchaseRequest?.purchase_request?.etd === null}
              >
                + Add PO
              </Button>
            </span>
          </Tooltip>
        </Stack>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "sm",
            flex: 1,
            overflowY: "auto",
            p: 1,
            maxHeight: "40vh",
          }}
        >
          {getPurchaseRequest?.po_details?.length > 0 ? (
            getPurchaseRequest.po_details.map((po, index) => (
              <Stack
                key={po._id || index}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{
                  p: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography level="body-md" fontWeight={600}>
                  {po.po_number}
                </Typography>
                <Typography level="body-md">
                  ₹ {po.total_value_with_gst}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography textAlign="center" color="neutral" mt={2}>
              No PO Records Found
            </Typography>
          )}
        </Box>
      </Sheet>

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
