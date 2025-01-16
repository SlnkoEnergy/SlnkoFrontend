import React, { createContext, useState, useEffect, useContext } from 'react';
import Axios from '../../utils/Axios';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [projectData, setProjectData] = useState({ p_id: '', code: '' });
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
        // Step 1: Fetch all projects
        const response = await Axios.get('/get-all-project');
        const projectsData = response.data?.data || [];
        
        if (!projectsData || projectsData.length === 0) {
          console.log('No projects found.');
          return;
        }
  
        console.log('Fetched Projects:', projectsData);
  
        const balancesData = {};
  
        // Step 2: Loop through each project and calculate balances
        for (const project of projectsData) {
          const { p_id, code } = project;
          
          // Step 3: Fetch Credit History (from /all-bill) and filter by p_id
          const creditResponse = await Axios.get("/all-bill");
          const creditHistory = creditResponse.data?.bill || [];
          const filteredCreditHistory = creditHistory.filter(item => item.p_id === p_id);
          const total_Credit = filteredCreditHistory.reduce((sum, item) => {
            return sum + (parseFloat(item.cr_amount) || 0);
          }, 0);
          console.log(`Total Credit for p_id ${p_id}:`, total_Credit);
  
          // Step 4: Fetch Debit History (from /get-subtract-amount) and filter by p_id
          const debitResponse = await Axios.get("/get-subtract-amount");
          const debitHistory = debitResponse.data?.data || [];
          const filteredDebitHistory = debitHistory.filter(item => item.p_id === p_id);
          const total_Debit = filteredDebitHistory.reduce((sum, item) => {
            return sum + (parseFloat(item.amount_paid) || 0);
          }, 0);
          console.log(`Total Debit for p_id ${p_id}:`, total_Debit);
  
          const total_return = filteredDebitHistory.reduce((sum, item) => {
            if (item.paid_for === "Customer Adjustment") {
              return sum + (parseFloat(item.amount_paid) || 0);
            }
            return sum;
          }, 0);

          console.log("Total Return are: ",total_return);
          
  
          // Step 5: Fetch PO Data (from /get-all-po) and filter by code
          const poResponse = await Axios.get('/get-all-po');
          const poData = poResponse.data?.data || [];
          const filteredPOs = poData.filter(po => po.p_id === code); // Use project `code` to filter PO data
  
          const total_po = filteredPOs.reduce((sum, client) => {
            return sum + (parseFloat(client.po_value) || 0);
          }, 0);
  
          const total_amount = filteredPOs.reduce((sum, client) => {
            return sum + (parseFloat(client.amount_paid) || 0);
          }, 0);
  
          const total_balance = filteredPOs.reduce((sum, client) => {
            return sum + ((client.po_value || 0) - (client.amount_paid || 0));
          }, 0);
  
          // Step 6: Fetch Bill Data (for matching PO number)
          const billResponse = await Axios.get('/get-all-bill');
          const billData = billResponse.data?.data || [];
          const enrichedPOs = filteredPOs.map((po) => {
            const matchingBill = billData.find(bill => bill.po_number === po.po_number);
            return {
              ...po,
              billedValue: matchingBill?.bill_value || 0,
            };
          });
  
          const total_bill = enrichedPOs.reduce((sum, client) => {
            return sum + (parseFloat(client.billedValue) || 0);
          }, 0);
  
          // Step 7: Calculate balances for this project
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
            const balancePayable = Math.round(totalPoValue - totalBilled - netAdvance);
  
            const tcs =
              netBalance > 5000000 ? Math.round(netBalance - 5000000) * 0.001 : 0;
            const balanceRequired = Math.round(balanceSlnko - balancePayable - tcs);
  
            return {
              crAmtNum,
              totalReturn,
              totalAdvanceValue,
              netBalance,
              totalAmount,
              balanceSlnko,
              balancePayable,
              balanceRequired,
            };
          };
  
          // Store the calculated balances for each project
          const projectBalances = calculateBalances({
            crAmt: total_Credit,
            dbAmt: total_Debit,
            totalAdvanceValue: total_amount,
            totalPoValue: total_po,
            totalBilled: total_bill,
            totalReturn: total_return,
          });
  
          console.log(`Calculated Balances for p_id ${p_id}:`, projectBalances);
  
          // Save balances to the state
          balancesData[p_id] = projectBalances;
        }
  
        // Step 8: Set the state with the calculated balances for all projects
        setBalances(balancesData);
      } catch (err) {
        console.error('Error fetching project balances:', err);
        setError('Failed to fetch balances. Please try again later.');
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
