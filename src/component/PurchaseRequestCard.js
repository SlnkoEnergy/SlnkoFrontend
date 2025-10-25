import PurchaseOrder from "../component/PurchaseOrderSummary";
const PurchaseRequestCard = ({project_code, vendor_id}) => {
  
  return (
    <>
     <PurchaseOrder project_code={project_code} vendor_id={vendor_id}/>
    </>
  );
};

export default PurchaseRequestCard;
