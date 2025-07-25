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
        `get-paginated-bill?page=${page}&search=${search}&group=${group}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Accounts"],
    }),

    // exportBills: builder.mutation({
    //   query: ({ from, to, exportAll }) => {
    //     const params = new URLSearchParams();

    //     if (exportAll) {
    //       params.set("export", "all");
    //     } else {
    //       params.set("from", from);
    //       params.set("to", to);
    //     }

    //     return {
    //       url: `get-export-bill?${params}`,
    //       method: "GET",
    //       responseHandler: (response) => response.blob(),
    //     };
    //   },
    // }),

  }),
});

export const {
  useGetProjectBalanceQuery,
} = AccountsApi;
