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
      query: ({
        page = 1,
        search = "",
        status = "",
        pageSize = 10,
        dateFrom = "",
        dateEnd = "",
        po_number,
      }) => {
        // decode status so %20 becomes space
        const cleanStatus = status ? decodeURIComponent(status) : "";

        return `bill?page=${page}&search=${search}&status=${cleanStatus}&pageSize=${pageSize}&dateFrom=${dateFrom}&dateEnd=${dateEnd}&po_number=${po_number}`;
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
      query: ({ from, to, exportAll, Ids }) => {

        const params = new URLSearchParams();

        if (exportAll) {
          params.set("export", "all");
        } else {
          params.set("from", from);
          params.set("to", to);
        }
        return {
          url: `get-export-bill?${params}`,
          method: "POST",
          body: { Ids },
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
    getBillById: builder.query({
      query: ({ po_number, _id }) => {
        const params = new URLSearchParams();
        if (po_number) params.append("po_number", po_number);
        if (_id) params.append("_id", _id);

        return {
          url: `get-bill-by-id?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    getBillHistory: builder.query({
      query: ({ subject_type, subject_id }) => {
        const params = new URLSearchParams({
          subject_type,
          subject_id,
        });

        return `/bill/billHistory?${params.toString()}`;
      },
      providesTags: ["Bill"],
    }),
    addBillHistory: builder.mutation({
      query: (newHistory) => ({
        url: "/bill/billHistory",
        method: "POST",
        body: newHistory,
      }),
      invalidatesTags: ["Pohistory"],
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
  useGetBillByIdQuery,
  useLazyGetBillHistoryQuery,
  useAddBillHistoryMutation
} = billsApi;
