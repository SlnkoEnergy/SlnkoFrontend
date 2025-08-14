// PaymentContext.js
import React, { createContext, useContext } from "react";
import { useGetPaymentHistoryQuery } from "../../redux/Accounts";

const PaymentContext = createContext();
export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children, po_number }) => {
  const { data, isLoading, error } = useGetPaymentHistoryQuery({ po_number });

  // console.log("Po number context ",po_number);
  

  const value = {
    history: data?.history || [],
    total_debited: data?.total_debited || 0,
    po_value: data?.po_value || 0,
    isLoading,
    error,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
