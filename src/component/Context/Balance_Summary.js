import React, { createContext, useState, useContext } from 'react';

// Create the context
const BalanceContext = createContext();

// Create the provider component
export const BalanceProvider = ({ children }) => {
  const [balanceData, setBalanceData] = useState({
    crAmt: 0,
    dbAmt: 0,
    adjTotal: 0,
    totalReturn: 0,
    totalAdvanceValue: 0,
    totalPoValue: 0,
    totalBilled: 0,
  });

  return (
    <BalanceContext.Provider value={{ balanceData, setBalanceData }}>
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook to use the context
export const useBalance = () => useContext(BalanceContext);
