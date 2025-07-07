import {
  Box,
  Table,
  Modal,
  Chip,
  ListItem,
  List,
  Stepper,
  Step,
  stepClasses,
  Card,
  StepIndicator,
} from "@mui/joy";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import { useState } from "react";
import {
  useGetPurchaseRequestByIdQuery,
  useGetPurchaseRequestByProjectIdQuery,
} from "../redux/camsSlice";
import { useSearchParams } from "react-router-dom";
import POSummary from "../pages/SCM/POSummary";
import PurchaseOrder from "../component/PurchaseOrderSummary";
const PurchaseRequestCard = () => {
  const [searchParams] = useSearchParams();
  const project_id = searchParams.get("project_id");

  const {
    data: getPurchaseRequest,
    isLoading,
    error,
  } = useGetPurchaseRequestByProjectIdQuery(project_id);

  const [openModal, setOpenModal] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [showItems, setShowItems] = useState(false);

  const handleOpenModal = (pr) => {
    setSelectedPR(pr);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPR(null);
    setShowItems(false);
  };

  const pr_id = selectedPR?._id;

  const { data: getPurchaseRequestById } = useGetPurchaseRequestByIdQuery(
    pr_id,
    {
      skip: !pr_id,
    }
  );

  const PurchaseRequestId = getPurchaseRequestById?.data;

  const handleToggleItems = () => setShowItems((prev) => !prev);

  const steps = [
    "submitted",
    "approved",
    "po_created",
    "out_for_delivery",
    "delivery",
    "rejected",
  ];

  return (
    // <Box
    //   sx={{
    //     p: 2,
    //     borderRadius: "md",
    //     boxShadow: "sm",
    //     mx: "auto",
    //     maxHeight: "70vh",
    //     overflowY: "auto",
    //   }}
    // >
    //   <Table
    //     borderAxis="none"
    //     hoverRow={false}
    //     size="sm"
    //     variant="plain"
    //     sx={{
    //       "--TableCell-paddingY": "8px",
    //       "--TableCell-paddingX": "12px",
    //       tableLayout: "fixed",
    //       width: "100%",
    //     }}
    //   >
    //     <thead>
    //       <tr>
    //         <th style={{ width: "40%" }}>PR No</th>
    //         <th style={{ width: "20%" }}>Created On</th>
    //         <th style={{ width: "20%" }}>Created By</th>
    //         <th style={{ width: "20%" }}>Status</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {getPurchaseRequest && getPurchaseRequest.length > 0 ? (
    //         getPurchaseRequest.map((pr) => (
    //           <tr key={pr._id}>
    //             <td>
    //               <Tooltip title="View Details">
    //                 <Chip
    //                   size="sm"
    //                   color="primary"
    //                   variant="soft"
    //                   sx={{ cursor: "pointer" }}
    //                   onClick={() => handleOpenModal(pr)}
    //                 >
    //                   {pr.pr_no}
    //                 </Chip>
    //               </Tooltip>
    //             </td>
    //             <td>
    //               {pr.createdAt
    //                 ? new Date(pr.createdAt).toLocaleDateString("en-GB", {
    //                     day: "2-digit",
    //                     month: "short",
    //                     year: "numeric",
    //                   })
    //                 : "N/A"}
    //             </td>
    //             <td>{pr.created_by?.name}</td>
    //             <td>
    //               {pr.items && pr.items.length > 0 ? (
    //                 <Typography color="success">
    //                   {pr.current_status?.status === "draft"
    //                     ? "PO Yet to be Created"
    //                     : pr.current_status?.status
    //                         .split("_")
    //                         .map(
    //                           (word) =>
    //                             word.charAt(0).toUpperCase() +
    //                             word.slice(1).toLowerCase()
    //                         )
    //                         .join(" ")}
    //                 </Typography>
    //               ) : (
    //                 <Typography color="neutral">N/A</Typography>
    //               )}
    //             </td>
    //           </tr>
    //         ))
    //       ) : (
    //         <tr>
    //           <td colSpan={4}>
    //             <Typography level="body-sm" color="neutral">
    //               {isLoading
    //                 ? "Loading..."
    //                 : error
    //                   ? "Failed to load data."
    //                   : "No Purchase Requests found."}
    //             </Typography>
    //           </td>
    //         </tr>
    //       )}
    //     </tbody>
    //   </Table>

    //   <Modal open={openModal} onClose={handleCloseModal}>
    //     <Box
    //       sx={{
    //         p: 3,
    //         borderRadius: "md",
    //         bgcolor: "background.body",
    //         boxShadow: "lg",
    //         minWidth: 300,
    //         maxWidth: 900,
    //         mx: "auto",
    //         mt: "10%",
    //         maxHeight: "60vh",
    //         overflowY: "auto",
    //       }}
    //     >
    //       {selectedPR && (
    //         <>
    //           <Typography level="h4" mb={2} textAlign="center" color="primary">
    //             Purchase Request Details
    //           </Typography>

    //           <Box mb={2} display="flex" gap={2}>
    //             <Typography>
    //               <strong>PR No:</strong>{" "}
    //               <Chip size="sm" color="primary" variant="soft">
    //                 {selectedPR.pr_no}
    //               </Chip>
    //             </Typography>
    //             <Typography>
    //               <strong>Created By:</strong>{" "}
    //               <Chip size="sm" color="primary" variant="soft">
    //                 {selectedPR.created_by?.name}
    //               </Chip>
    //             </Typography>
    //           </Box>

    //           {/* Stepper */}
    //           {PurchaseRequestId?.current_status && (
    //             <Box
    //               sx={{
    //                 backgroundColor: "#f4f7fb",
    //                 p: 2,
    //                 borderRadius: 2,
    //                 mt: 1,
    //               }}
    //             >
    //               <Box
    //                 sx={{
    //                   display: "flex",
    //                   alignItems: "center",
    //                   justifyContent: "space-between",
    //                   position: "relative",
    //                 }}
    //               >
    //                 {steps.map((step, stepIndex) => {
    //                   const currentStatus =
    //                     PurchaseRequestId.current_status.status;
    //                   const currentIndex = steps.indexOf(currentStatus);

    //                   const isCompleted = stepIndex <= currentIndex;
    //                   const isActive = stepIndex === currentIndex;
    //                   const isLast = stepIndex === steps.length - 1;

    //                   return (
    //                     <Box
    //                       key={step}
    //                       sx={{
    //                         display: "flex",
    //                         alignItems: "center",
    //                         flexDirection: "column",
    //                         flex: 1,
    //                         position: "relative",
    //                         zIndex: 1,
    //                       }}
    //                     >
    //                       {!isLast && (
    //                         <Box
    //                           sx={{
    //                             position: "absolute",
    //                             height: 2,
    //                             backgroundColor:
    //                               step === "rejected"
    //                                 ? "danger.500"
    //                                 : isCompleted
    //                                   ? "success.500"
    //                                   : isActive
    //                                     ? "primary.500"
    //                                     : "neutral.300",
    //                             top: "12px",
    //                             left: "calc(51% + 10px)",
    //                             right: "-56px",
    //                             zIndex: 0,
    //                           }}
    //                         />
    //                       )}

    //                       <StepIndicator
    //                         variant={
    //                           step === "rejected"
    //                             ? "solid"
    //                             : isCompleted
    //                               ? "solid"
    //                               : isActive
    //                                 ? "soft"
    //                                 : "outlined"
    //                         }
    //                         color={
    //                           step === "rejected"
    //                             ? "danger"
    //                             : isCompleted
    //                               ? "success"
    //                               : isActive
    //                                 ? "primary"
    //                                 : "neutral"
    //                         }
    //                         sx={{
    //                           width: 24,
    //                           height: 24,
    //                           fontSize: 14,
    //                           fontWeight: "bold",
    //                         }}
    //                       >
    //                         {stepIndex + 1}
    //                       </StepIndicator>

    //                       <Typography
    //                         level="body-xs"
    //                         mt={1}
    //                         textAlign="center"
    //                         sx={{
    //                           fontWeight:
    //                             isActive || step === "rejected" ? "md" : "sm",
    //                           color:
    //                             step === "rejected"
    //                               ? "danger.700"
    //                               : isCompleted
    //                                 ? "success.700"
    //                                 : isActive
    //                                   ? "primary.700"
    //                                   : "neutral.500",
    //                           fontSize: "0.75rem",
    //                           maxWidth: 100,
    //                           whiteSpace: "nowrap",
    //                         }}
    //                       >
    //                         {step === "draft"
    //                           ? "PO Yet to be Created"
    //                           : step
    //                               .replace(/_/g, " ")
    //                               .replace(/\b\w/g, (c) => c.toUpperCase())}
    //                       </Typography>
    //                     </Box>
    //                   );
    //                 })}
    //               </Box>
    //             </Box>
    //           )}

    //           {/* Info Summary */}
    //           <Box display={"flex"} gap={2} mt={2}>
    //             <Tooltip
    //               title={showItems ? "Click to close" : "Click to see items"}
    //             >
    //               <Typography
    //                 onClick={handleToggleItems}
    //                 sx={{ cursor: "pointer", textDecoration: "underline" }}
    //               >
    //                 <strong>Total Items:</strong>{" "}
    //                 {selectedPR.items?.length || 0}
    //               </Typography>
    //             </Tooltip>

    //             <Typography>
    //               <strong>Total Number of PO:</strong>{" "}
    //               {PurchaseRequestId?.overall_total_number_of_po || 0}
    //             </Typography>

    //             <Typography>
    //               <strong>Total PO Value:</strong> ₹{" "}
    //               {PurchaseRequestId?.overall_total_po_value_with_gst || 0}
    //             </Typography>
    //           </Box>

    //           {/* Item List */}
    //           {showItems && PurchaseRequestId?.items?.length > 0 && (
    //             <List sx={{ mt: 2 }}>
    //               {PurchaseRequestId.items.map((item, idx) => (
    //                 <Card
    //                   key={idx}
    //                   variant="soft"
    //                   sx={{ mb: 2, p: 2, maxHeight: "40vh", overflowY: "auto" }}
    //                 >
    //                   <Box display={"flex"} gap={2} alignItems={"center"}>
    //                     <Chip size="lg" color="primary" variant="soft">
    //                       {item.item_id?.name || "-"}
    //                     </Chip>

    //                     <Tooltip
    //                       title={
    //                         item?.po_numbers?.length > 0
    //                           ? item.po_numbers.join(", ")
    //                           : "No PO made"
    //                       }
    //                     >
    //                       <Typography
    //                         fontWeight={600}
    //                         sx={{ cursor: "pointer" }}
    //                       >
    //                         PO Count: {item.po_numbers?.length || 0}
    //                       </Typography>
    //                     </Tooltip>
    //                   </Box>
    //                 </Card>
    //               ))}
    //             </List>
    //           )}
    //         </>
    //       )}
    //     </Box>
    //   </Modal>
    // </Box>
    <>
     <PurchaseOrder />
    </>
  );
};

export default PurchaseRequestCard;
