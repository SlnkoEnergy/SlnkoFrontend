import React, { createContext, useContext, useEffect, useState } from "react";
import Axios from "../../utils/Axios";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [projectData, setProjectData] = useState({ p_id: "", code: "" });
  const [creditHistory, setCreditHistory] = useState([]);
  const [debitHistory, setDebitHistory] = useState([]);
  const [filteredDebits, setFilteredDebits] = useState([]);
  const [clientHistory, setClientHistory] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [total_Credit, setTotal_Credit] = useState(0);
  const [total_Debit, setTotal_Debit] = useState(0);
  const [total_return, setTotal_Return] = useState(0);
  const [total_po, setTotal_po] = useState(0);
  const [total_amount, setTotal_amount] = useState(0);
  const [total_balance, setTotal_balance] = useState(0);
  const [total_bill, setTotal_bill] = useState(0);
  const [projects, setProjects] = useState([]);
  const [balances, setBalances] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectBalances = async () => {
      try {
        // Step 1: Fetch all required data at once
        const [
          projectsResponse,
          creditResponse,
          debitResponse,
          poResponse,
          billResponse,
        ] = await Promise.all([
          Axios.get("/get-all-project"),
          Axios.get("/all-bill"),
          Axios.get("/get-subtract-amount"),
          Axios.get("/get-all-po"),
          Axios.get("/get-all-bill"),
        ]);

        const projectsData = projectsResponse.data?.data || [];
        if (!projectsData || projectsData.length === 0) {
          console.log("No projects found.");
          return;
        }

        const creditHistory = creditResponse.data?.bill || [];
        const debitHistory = debitResponse.data?.data || [];
        const poData = poResponse.data?.data || [];
        const billData = billResponse.data?.data || [];

        console.log("Fetched Projects:", projectsData);

        // Step 2: Concurrently process balances for all projects
        const balancesData = {};

        await Promise.all(
          projectsData.map(async (project) => {
            const { p_id, code } = project;

            // Filter credit and debit history for the current project
            const filteredCreditHistory = creditHistory.filter(
              (item) => item.p_id === p_id
            );
            const filteredDebitHistory = debitHistory.filter(
              (item) => item.p_id === p_id
            );

            const total_Credit = filteredCreditHistory.reduce(
              (sum, item) => sum + (parseFloat(item.cr_amount) || 0),
              0
            );

            const total_Debit = filteredDebitHistory.reduce(
              (sum, item) => sum + (parseFloat(item.amount_paid) || 0),
              0
            );

            const total_return = filteredDebitHistory.reduce((sum, item) => {
              if (item.paid_for === "Customer Adjustment") {
                return sum + (parseFloat(item.amount_paid) || 0);
              }
              return sum;
            }, 0);

            // Filter PO data for the current project
            const filteredPOs = poData.filter((po) => po.p_id === code);

            const total_po = filteredPOs.reduce(
              (sum, client) => sum + (parseFloat(client.po_value) || 0),
              0
            );

            const total_amount = filteredPOs.reduce(
              (sum, client) => sum + (parseFloat(client.amount_paid) || 0),
              0
            );

            const total_balance = filteredPOs.reduce(
              (sum, client) =>
                sum + ((client.po_value || 0) - (client.amount_paid || 0)),
              0
            );

            // Enrich POs with bill data
            const enrichedPOs = filteredPOs.map((po) => {
              const matchingBill = billData.find(
                (bill) => bill.po_number === po.po_number
              );
              return {
                ...po,
                billedValue: matchingBill?.bill_value || 0,
              };
            });

            const total_bill = enrichedPOs.reduce(
              (sum, client) => sum + (parseFloat(client.billedValue) || 0),
              0
            );

            // Calculate balances for this project
            const calculateBalances = ({
              crAmt,
              dbAmt,
              totalAdvanceValue,
              totalPoValue,
              totalBilled,
              totalReturn,
            }) => {
              const crAmtNum = Number(crAmt || 0);
              const dbAmtNum = Number(dbAmt || 0);

              const totalAmount = Math.round(crAmtNum - dbAmtNum);
              const netBalance = Math.round(crAmtNum - totalReturn);
              const balanceSlnko = Math.round(crAmtNum - totalAdvanceValue);
              const netAdvance = Math.round(totalAdvanceValue - totalBilled);
              const balancePayable = Math.round(
                totalPoValue - totalBilled - netAdvance
              );

              const tcs =
                netBalance > 5000000
                  ? Math.round(netBalance - 5000000) * 0.001
                  : 0;
              const balanceRequired = Math.round(
                balanceSlnko - balancePayable - tcs
              );

              return {
                crAmtNum,
                balanceSlnko,
                balancePayable,
                balanceRequired,
              };
            };

            const projectBalances = calculateBalances({
              crAmt: total_Credit,
              dbAmt: total_Debit,
              totalAdvanceValue: total_amount,
              totalPoValue: total_po,
              totalBilled: total_bill,
              totalReturn: total_return,
            });

            console.log(
              `Calculated Balances for p_id ${p_id}:`,
              projectBalances
            );

            balancesData[p_id] = projectBalances;
          })
        );

        // Step 3: Set the state with the calculated balances
        setBalances(balancesData);
      } catch (err) {
        console.error("Error fetching project balances:", err);
        setError("Failed to fetch balances. Please try again later.");
      }
    };

    fetchProjectBalances();
  }, []);

  return (
    <BalanceContext.Provider value={{ balances, error }}>
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook to use the context
export const useBalance = () => useContext(BalanceContext);
