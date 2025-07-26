// PaymentContext.js
import React, { createContext, useContext } from "react";
import { useGetPaymentHistoryQuery } from "../../redux/Accounts";

const PaymentContext = createContext();
export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children, po_number }) => {
  const { data, isLoading, error } = useGetPaymentHistoryQuery({ po_number });

  const value = {
    history: data?.history || [],
    total: data?.total || 0,
    isLoading,
    error,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
