import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_URL, getAuthToken } from "./auth/auth_variable";


const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
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
      transformResponse: (response) => response.data || [],
    }), 
    getItems: builder.query({
      query: () => "get-iteM-IT",
      providesTags: ["Purchase"],
    }), 
    // deleteProject: builder.mutation({
    //   query: (_id) => ({
    //     url: `delete-by-id-IT/${_id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Project"],
    // }),
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
//   useDeleteProjectMutation,
  useAddPurchasesMutation,
  useUpdatePurchasesMutation
} = purchasesApi;
