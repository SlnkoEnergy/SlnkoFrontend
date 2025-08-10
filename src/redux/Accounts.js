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
    getPaymentRecord: builder.query({
      query: ({
        page = 1,
        search = "",
        status = "",
        pageSize = 10,
        tab = "",
      }) =>
        `get-pay-sumrY-IT?page=${page}&search=${search}&status=${status}&pageSize=${pageSize}&tab=${tab}`,

      transformResponse: (response, meta, arg) => {
        return {
          data: Array.isArray(response.data) ? response.data : [],
          total: response.meta?.total ?? 0,
          count: response.meta?.count ?? 0,
          page: response.meta?.page ?? 1,
          instantTotal: response.meta?.instantTotal ?? 0,
          creditTotal: response.meta?.creditTotal ?? 0,
        };
      },
    }),

    getTrashRecord: builder.query({
      query: ({
        page = 1,
        search = "",
        status = "",
        pageSize = 10,
        tab = "",
      }) =>
        `hold-pay-summary-IT?page=${page}&search=${search}&status=${status}&pageSize=${pageSize}&tab=${tab}`,

      transformResponse: (response, meta, arg) => {
        return {
          data: Array.isArray(response.data) ? response.data : [],
          total: response.meta?.total ?? 0,
          count: response.meta?.count ?? 0,
          page: response.meta?.page ?? 1,
          instantTotal: response.meta?.instantTotal ?? 0,
          creditTotal: response.meta?.creditTotal ?? 0,
        };
      },
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
      query: ({ po_number }) =>
        `accounting/payment-history?po_number=${po_number}`,
      transformResponse: (response) => ({
        history: response.history || [],
        total: response.total || 0,
      }),
      providesTags: ["Accounts"],
    }),

    getCustomerSummary: builder.query({
      query: ({
        p_id,
        start,
        end,
        searchClient,
        searchDebit,
        searchAdjustment,
      }) => {
        const params = new URLSearchParams({ p_id });

        if (start) params.append("start", start);
        if (end) params.append("end", end);
        if (searchClient) params.append("searchClient", searchClient);
        if (searchDebit) params.append("searchDebit", searchDebit);
        if (searchAdjustment)
          params.append("searchAdjustment", searchAdjustment);

        return `accounting/customer-payment-summary?${params.toString()}`;
      },
      transformResponse: (response) => ({
        adjustment: {
          history: [],
          totalCredit: 0,
          totalDebit: 0,
          ...(response?.adjustment || {}),
        },
        ...response,
      }),
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
              response.headers
                .get("Content-Disposition")
                ?.split("filename=")[1] || "payment-history.csv",
          };
        },
        method: "GET",
      }),
    }),

    getPaymentApproved: builder.query({
      query: ({ page = 1, search = "", pageSize = 10 }) =>
        `accounting/approved-payment?page=${page}&search=${search}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Accounts"],
    }),
    getUtrSubmission: builder.query({
      query: ({ page = 1, search = "", pageSize = 10 }) =>
        `accounting/utr-submission?page=${page}&search=${search}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Accounts"],
    }),
    getExportProjectBalance: builder.mutation({
      query: (body) => ({
        url: "accounting/export-project-balance",
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();
          return {
            blob,
            filename:
              response.headers
                .get("Content-Disposition")
                ?.split("filename=")[1] || "project-balance.csv",
          };
        },
      }),
    }),
  }),
});

export const {
  useGetProjectBalanceQuery,
  useGetPaymentApprovalQuery,
  useGetPaymentHistoryQuery,
  useGetExportPaymentHistoryQuery,
  useGetCustomerSummaryQuery,
  useGetPaymentApprovedQuery,
  useGetUtrSubmissionQuery,
  useGetExportProjectBalanceMutation,
  useGetPaymentRecordQuery,
  useGetTrashRecordQuery,
} = AccountsApi;
