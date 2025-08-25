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

getAllBills: builder.query({
  query: ({ page = 1, search = "", status = "", pageSize = 10, date = "", po_number }) => {
    // decode status so %20 becomes space
    const cleanStatus = status ? decodeURIComponent(status) : "";

    return `bill?page=${page}&search=${search}&status=${cleanStatus}&pageSize=${pageSize}&date=${date}&po_number=${po_number}`;
  },
  transformResponse: (response) => ({
    data: response.data || [],
    total: response.total || 0,
    totalPages: response.totalPages || 0,
    page: response.page || 1,
    pageSize: response.pageSize || 10,
  }),
  providesTags: ["Bill"],
}),


    exportBills: builder.mutation({
      query: ({ from, to, exportAll }) => {
        const params = new URLSearchParams();

        if (exportAll) {
          params.set("export", "all");
        } else {
          params.set("from", from);
          params.set("to", to);
        }

        return {
          url: `get-export-bill?${params}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
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
  useGetAllBillsQuery,
  useExportBillsMutation,
  useAddBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useDeleteCreditMutation,
  useApproveBillMutation,
} = billsApi;
