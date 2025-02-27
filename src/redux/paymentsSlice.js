import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: () => "get-pay-summarY-IT",
      providesTags: ["Payment"],
      
    }),
    getVendors: builder.query({
        query: () => "get-all-vendoR-IT",
        providesTags: ["Payment"],
      }),
    addPayments: builder.mutation({
      query: (newPayment) => ({
        url: "/add-pay-requesT-IT",
        method: "POST",
        body: newPayment,
      }),
      invalidatesTags: ["Payment"],
    }),
    addHoldPayments: builder.mutation({
        query: (newHoldPayment) => ({
          url: "/hold-PaymenT-IT",
          method: "POST",
          body: newHoldPayment,
        }),
        invalidatesTags: ["Payment"],
      }), 
      addHoldToPayments: builder.mutation({
        query: (newHoldToPayment) => ({
          url: "/hold-payto-payrequest",
          method: "POST",
          body: newHoldToPayment,
        }),
        invalidatesTags: ["Payment"],
      }),
  }),
});

export const { 
  useGetPaymentsQuery, 
  useGetVendorsQuery,
  useAddPaymentsMutation,
  useAddHoldPaymentsMutation,
  useAddHoldToPaymentsMutation,
} = paymentsApi;

