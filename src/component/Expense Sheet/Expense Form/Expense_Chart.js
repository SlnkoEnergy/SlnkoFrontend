import { ResponsivePie } from "@nivo/pie";
import { useGetAllExpenseQuery } from "../../../redux/Expense/expenseSlice"; // Replace with actual API file path
import React from "react";

const PieChartStatic = () => {
  const { data: response = {} } = useGetAllExpenseQuery();
  const expenses = response.data || [];

  const expenseCode = localStorage.getItem("edit_expense");

 
  const selectedExpense = expenses.find(
    (expense) => expense.expense_code === expenseCode
  );

  
  const categoryMap = {};

  if (selectedExpense) {
    selectedExpense.items.forEach((item) => {
      const category = item.category;
      const amount = Number(item.invoice?.invoice_amount) || 0;

      if (categoryMap[category]) {
        categoryMap[category] += amount;
      } else {
        categoryMap[category] = amount;
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
