import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery,
  tagTypes: ["Expense"],
  endpoints: (builder) => ({
    // GET: Fetch all expenses
    getAllExpense: builder.query({
      query: () => "get-all-expense",
      providesTags: ["Expense"],
    }),

    // GET: Fetch single expense by ID
    getExpenseById: builder.query({
      query: (_id) => `get-expense-by-id/${_id}`,
      providesTags: ["Expense"],
    }),

    // POST: Create new expense
    addExpense: builder.mutation({
      query: (newExpense) => ({
        url: "create-expense",
        method: "POST",
        body: newExpense,
      }),
      invalidatesTags: ["Expense"],
    }),

    // PUT: Update overall status by _id
    updateExpenseStatusOverall: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `/${_id}/status/overall`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expense"],
    }),

    // PUT: Update status of an item in a specific sheet
    updateExpenseStatusItems: builder.mutation({
      query: ({ sheetId, itemId, ...data }) => ({
        url: `${sheetId}/item/${itemId}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expense"],
    }),

    // DELETE: Delete an expense
    deleteExpense: builder.mutation({
      query: (_id) => ({
        url: `delete-expense/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),
    updateExpenseSheet: builder.mutation({
      query: ({ _id, ...updatedData }) => ({
        url: `update-expense/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Expense"],
    }),

    updateDisbursementDate: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `update-disbursement-date/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expense"],
    }),
    exportExpensesToCSV: builder.query({
      query: () => ({
        url: "expense-all-csv", // or your actual endpoint
        method: "GET",
        responseHandler: (response) => response.blob(), // important
      }),
    }),
    exportExpenseByIdToCSV: builder.query({
      query: (expenseId) => ({
        url: `expense-by-id-csv/${expenseId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAllExpenseQuery,
  useGetExpenseByIdQuery,
  useAddExpenseMutation,
  useUpdateExpenseStatusOverallMutation,
  useUpdateExpenseStatusItemsMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseSheetMutation,
  useUpdateDisbursementDateMutation,
  useLazyExportExpensesToCSVQuery,
  useLazyExportExpenseByIdToCSVQuery,
} = expensesApi;
