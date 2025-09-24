// src/pages/Expense/Expense_Chart.jsx (aka PieChartStatic.jsx)
import React, { useMemo } from "react";
import { ResponsivePie, ResponsivePieCanvas } from "@nivo/pie";
import { useGetExpenseByIdQuery } from "../../../redux/Expense/expenseSlice";

const isDev = process.env.NODE_ENV !== "production";

function toNumberSafe(x) {
  if (x == null) return 0;
  if (typeof x === "number") return Number.isFinite(x) ? x : 0;
  if (typeof x === "string") {
    const n = Number(x.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function PieChartStatic() {
  const ExpenseCode = localStorage.getItem("edit_expense") ?? "";

  // If you have RTKQ's skipToken, you could skip when no ExpenseCode
  const { data: response = {} } = useGetExpenseByIdQuery({
    expense_code: ExpenseCode,
  });

  const expenses = response?.data || {};

  const pieData = useMemo(() => {
    const totals = new Map();
    const items = Array.isArray(expenses.items) ? expenses.items : [];

    for (const item of items) {
      const category = item?.category ? String(item.category) : "Uncategorized";
      const amount = toNumberSafe(item?.invoice?.invoice_amount);

      totals.set(category, (totals.get(category) ?? 0) + amount);
    }

    return Array.from(totals.entries())
      .map(([category, value]) => ({
        id: category,
        label: category,
        value: toNumberSafe(value),
      }))
      .filter((d) => d.value > 0);
  }, [expenses]);

  if (pieData.length === 0) {
    return (
      <div
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7,
        }}
      >
        No data to display
      </div>
    );
  }

  const commonProps = {
    data: pieData,
    margin: { top: 40, right: 80, bottom: 80, left: 80 },
    innerRadius: 0.4,
    padAngle: 0.7,
    cornerRadius: 3,
    activeOuterRadiusOffset: 8,
    valueFormat: (v) =>
      Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  };

  return (
    <div style={{ height: 400 }}>
      {isDev ? (
        // DEV: canvas → no react-spring transitions, no StrictMode ref errors
        <ResponsivePieCanvas
          {...commonProps}
          enableArcLabels
          arcLabelsSkipAngle={10}
          enableArcLinkLabels
          arcLinkLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          pixelRatio={Math.min(2, window.devicePixelRatio || 1)}
        />
      ) : (
        // PROD: SVG as you had before
        <ResponsivePie
          {...commonProps}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          // animations are fine in prod; dev is using canvas already
          animate
        />
      )}
    </div>
  );
}
