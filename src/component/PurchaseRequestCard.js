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
const PurchaseRequestCard = ({project_code}) => {
  const [searchParams] = useSearchParams();
  const project_id = searchParams.get("project_id");

  const {
    data: getPurchaseRequest,
    isLoading,
    error,
  } = useGetPurchaseRequestByProjectIdQuery(project_id);

  console.log("Project code req", project_code);
  

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
    <>
     <PurchaseOrder project_code={project_code}/>
    </>
  );
};

export default PurchaseRequestCard;
