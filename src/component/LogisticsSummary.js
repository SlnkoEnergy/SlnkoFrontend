import { useNavigate } from "react-router-dom";
import PurchaseOrderSummary from "./PurchaseOrderSummary";

function LogisticsTable({ data = [], isLoading }) {
  const navigate = useNavigate();

  // ✅ Just call PurchaseOrderSummary directly
  return (
    <PurchaseOrderSummary
      data={data}
      isLoading={isLoading}
      // optional extra columns specific to logistics
      extraColumns={[
        { key: "logistics_status", label: "Logistics Status" },
      ]}
      onView={(p_id) => navigate(`/logistics/view?p_id=${p_id}`)}
    />
  );
}

export default LogisticsTable;
