import { Box, Table, Modal, Chip } from "@mui/joy";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import { useState } from "react";
import { useGetAllPurchaseRequestQuery } from "../redux/camsSlice";

const PurchaseRequestCard = () => {
  const {
    data: getPurchaseRequest,
    isLoading,
    error,
  } = useGetAllPurchaseRequestQuery();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);

  const handleOpenModal = (pr) => {
    setSelectedPR(pr);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPR(null);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "md",
        boxShadow: "sm",
        maxWidth: 800,
        mx: "auto",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <Table
        borderAxis="none"
        hoverRow={false}
        size="sm"
        variant="plain"
        sx={{
          "--TableCell-paddingY": "8px",
          "--TableCell-paddingX": "12px",
          tableLayout: "fixed",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "40%" }}>
              <Typography level="body-sm" color="neutral">
                PR No
              </Typography>
            </th>
            <th style={{ width: "20%" }}>
              <Typography level="body-sm" color="neutral">
                Created On
              </Typography>
            </th>
            <th style={{ width: "20%" }}>
              <Typography level="body-sm" color="neutral">
                Created By
              </Typography>
            </th>
            <th style={{ width: "20%" }}>
              <Typography level="body-sm" color="neutral">
                Status
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {getPurchaseRequest && getPurchaseRequest.length > 0 ? (
            getPurchaseRequest.map((pr) => (
              <tr key={pr._id}>
                <td style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                  <Tooltip title="View Details">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="soft"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleOpenModal(pr)}
                    >
                      {pr.pr_no}
                    </Chip>
                  </Tooltip>
                </td>
                <td>
                  {pr.createdAt
                    ? new Date(pr.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>{pr.created_by?.name}</td>
                <td>
                  {pr.items && pr.items.length > 0 ? (
                    <Typography color="success">
                      {pr.items[0].current_status?.status
                        ? pr.items[0].current_status.status
                            .charAt(0)
                            .toUpperCase() +
                          pr.items[0].current_status.status
                            .slice(1)
                            .toLowerCase()
                        : "N/A"}
                    </Typography>
                  ) : (
                    <Typography color="neutral">N/A</Typography>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                <Typography level="body-sm" color="neutral">
                  {isLoading
                    ? "Loading..."
                    : error
                      ? "Failed to load data."
                      : "No Purchase Requests found."}
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            p: 3,
            borderRadius: "md",
            bgcolor: "background.body",
            boxShadow: "lg",
            minWidth: 300,
            maxWidth: 500,
            mx: "auto",
            mt: "10%",
          }}
        >
          <Typography level="h6" mb={2}>
            Purchase Request Details
          </Typography>
          {selectedPR ? (
            <>
              <Typography>
                <strong>PR No:</strong> {selectedPR.pr_no}
              </Typography>
              <Typography>
                <strong>Created By:</strong> {selectedPR.created_by?.name}
              </Typography>
              <Typography>
                <strong>Project ID:</strong> {selectedPR.project_id}
              </Typography>
              <Typography>
                <strong>PO Number:</strong> {selectedPR.po_number || "N/A"}
              </Typography>
              <Typography>
                <strong>PO Value:</strong> {selectedPR.po_value || "N/A"}
              </Typography>
              <Typography>
                <strong>Total Items:</strong> {selectedPR.items?.length || 0}
              </Typography>
            </>
          ) : (
            <Typography>No details available.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default PurchaseRequestCard;
