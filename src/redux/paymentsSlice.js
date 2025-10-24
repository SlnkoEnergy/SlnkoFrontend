import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: () => "get-pay-summarY-IT",
      providesTags: ["Payment"],
    }),
    getVendors: builder.query({
      query: () => "vendor",
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
    getPayRequestByVendor: builder.query({
      query: ({ vendor, page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams();
        if (vendor) params.set("vendor", vendor);
        if (page) params.set("page", page);
        if (limit) params.set("limit", limit);
        if (search) params.set("search", search);
        return `/payrequestvendor?${params.toString()}`;
      },
      providesTags: ["Payment"],
    })
  }),
});

export const {
  useGetPaymentsQuery,
  useGetVendorsQuery,
  useAddPaymentsMutation,
  useAddHoldPaymentsMutation,
  useAddHoldToPaymentsMutation,
  useGetPayRequestByVendorQuery
} = paymentsApi;
