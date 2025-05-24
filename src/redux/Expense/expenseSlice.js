import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
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
        url: `${_id}/status/overall`,
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
  }),
});

export const {
  useGetAllExpenseQuery,
  useGetExpenseByIdQuery,
  useAddExpenseMutation,
  useUpdateExpenseStatusOverallMutation,
  useUpdateExpenseStatusItemsMutation,
  useDeleteExpenseMutation,
} = expensesApi;
