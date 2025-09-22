import { ResponsivePie } from "@nivo/pie";
import {
  useGetAllExpenseQuery,
  useGetExpenseByIdQuery,
} from "../../../redux/expenseSlice"; // Replace with actual API file path
import React from "react";

const PieChartStatic = () => {
  const ExpenseCode = localStorage.getItem("edit_expense");

  const { data: response = {} } = useGetExpenseByIdQuery({
    expense_code: ExpenseCode,
  });

  const expenses = response?.data || [];

  console.log(expenses);

  const categoryMap = {};

  if (expenses && Array.isArray(expenses.items)) {
    expenses.items.forEach((item) => {
      const category = item.category;
      const amount = Number(item.invoice?.invoice_amount) || 0;

      if (category) {
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      }
    });
  }

  const pieData = Object.entries(categoryMap).map(([category, value]) => ({
    id: category,
    label: category,
    value,
  }));

  return (
    <div style={{ height: 400 }}>
      <ResponsivePie
        data={pieData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.4}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      />
    </div>
  );
};

export default PieChartStatic;
