import PurchaseOrder from "../component/PurchaseOrderSummary";
const PurchaseRequestCard = ({project_code}) => {
  
  return (
    <>
     <PurchaseOrder project_code={project_code}/>
    </>
  );
};

export default PurchaseRequestCard;
