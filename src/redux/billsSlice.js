import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const billsApi = createApi({
  reducerPath: "billsApi",
  baseQuery,
  tagTypes: ["Bill"],
  endpoints: (builder) => ({
    // GET all bills
    getBills: builder.query({
      query: () => "get-all-bilL-IT",
      providesTags: ["Bill"],
    }),

    // POST new bill
    addBill: builder.mutation({
      query: (newBill) => ({
        url: "add-bilL-IT",
        method: "POST",
        body: newBill,
      }),
      invalidatesTags: ["Bill"],
    }),

    // PUT update bill by ID
    updateBill: builder.mutation({
      query: ({ _id, updatedData }) => ({
        url: `update-bill/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Bill"],
    }),

    // DELETE bill by ID
    deleteBill: builder.mutation({
      query: (_id) => ({
        url: `delete-bill/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bill"],
    }),

    // DELETE credit amount by ID
    deleteCredit: builder.mutation({
      query: (_id) => ({
        url: `delete-credit-amount/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bill"],
    }),

    // PUT approved bill
    approveBill: builder.mutation({
      query: (approvalData) => ({
        url: "accepted-by",
        method: "PUT",
        body: approvalData,
      }),
      invalidatesTags: ["Bill"],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useAddBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useDeleteCreditMutation,
  useApproveBillMutation,
} = billsApi;
