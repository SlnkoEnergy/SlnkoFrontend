import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});
export const purchasesApi = createApi({
  reducerPath: "purchasesApi",
  baseQuery,
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: () => "get-all-pO-IT",
      providesTags: ["Purchase"],
    }),
    getPaginatedPOs: builder.query({
      query: ({ page = 1, search = "", status, pageSize = 10, type }) =>
        `get-paginated-po?page=${page}&search=${search}&status=${status}&pageSize=${pageSize}&type=${type}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Purchase"],
    }),

    getItems: builder.query({
      query: () => "get-iteM-IT",
      providesTags: ["Purchase"],
    }),

    exportPos: builder.mutation({
      query: ({ from, to, exportAll }) => {
        const params = new URLSearchParams();

        if (exportAll) {
          params.set("export", "all");
        } else {
          params.set("from", from);
          params.set("to", to);
        }

        return {
          url: `get-export-po?${params}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    addPurchases: builder.mutation({
      query: (newPurchase) => ({
        url: "/Add-purchase-ordeR-IT",
        method: "POST",
        body: newPurchase,
      }),
      invalidatesTags: ["Purchase"],
    }),
    updatePurchases: builder.mutation({
      query: ({ _id, updatedData }) => ({
        url: `edit-pO-IT/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Purchase"],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useGetItemsQuery,
  useGetPaginatedPOsQuery,
  useExportPosMutation,
  useAddPurchasesMutation,
  useUpdatePurchasesMutation,
} = purchasesApi;
