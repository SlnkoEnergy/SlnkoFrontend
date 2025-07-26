import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
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
      query: ({ page = 1, search = "", group, pageSize = 10 }) =>
        `accounting/project-balance?page=${page}&search=${search}&group=${group}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
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


  }),
});

export const {
  useGetProjectBalanceQuery,
  useGetPaymentApprovalQuery,
} = AccountsApi;
