import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const AccountsApi = createApi({
  reducerPath: "AccountsApi",
  baseQuery,
  tagTypes: ["Accounts"],
  endpoints: (builder) => ({
    getProjectBalance: builder.query({
      query: ({ page = 1, search = "", group = "", pageSize = 10 }) =>
        `accounting/project-balance?page=${page}&search=${search}&group=${group}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
        totals: response.totals || {},
      }),
      providesTags: ["Accounts"],
    }),

    getPaymentApproval: builder.query({
      query: ({ page = 1, search = "", pageSize = 10 }) =>
        `accounting/payment-approval?page=${page}&search=${search}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Accounts"],
    }),

    getPaymentHistory: builder.query({
      query: ({ po_number }) => `accounting/payment-history?po_number=${po_number}`,
      transformResponse: (response) => ({
        history: response.history || [],
        total: response.total || 0,
      }),
      providesTags: ["Accounts"],
    }),

    getCustomerSummary: builder.query({
  query: ({ p_id }) =>
    `accounting/customer-payment-summary?p_id=${p_id}`,
  transformResponse: (response) => response.data || null,
  providesTags: ["Accounts"],
}),

 getExportPaymentHistory: builder.query({
  query: ({ po_number }) => ({
    url: `accounting/debithistorycsv?po_number=${po_number}`,
    responseHandler: async (response) => {
      const blob = await response.blob();
      return {
        blob,
        filename:
          response.headers.get("Content-Disposition")?.split("filename=")[1] ||
          "payment-history.csv",
      };
    },
    method: "GET",
  }),
}),


  }),
});


export const {
  useGetProjectBalanceQuery,
  useGetPaymentApprovalQuery,
  useGetPaymentHistoryQuery,
  useGetExportPaymentHistoryQuery,
  useGetCustomerSummaryQuery
} = AccountsApi;
