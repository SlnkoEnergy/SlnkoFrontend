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

export const GlobalTaskApi = createApi({
  reducerPath: "GlobalTaskApi",
  baseQuery,
  tagTypes: ["GlobalTask"],
  endpoints: (builder) => ({
    // POST: Create a new task
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `tasks/create-task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["GlobalTask"],
    }),

    // GET: Fetch all tasks with filters
    getAllTasks: builder.query({
      query: ({ page = 1, search = "", status = "", createdAt = "" }) =>
        `tasks/get-task?page=${page}&search=${search}&status=${status}&createdAt=${createdAt}`,
      providesTags: ["Task"],
    }),
  getAllUser: builder.query({
  query: () => ({
    url: 'all-user',
    method: 'GET'
  }),
  providesTags: ['User']
}),
getAllDept: builder.query({
  query: () => ({
    url: 'all-dept',
    method: 'GET'
  }),
  providesTags: ['User']
})
  })
});

// Export hooks

export const { useCreateTaskMutation, useGetAllUserQuery, useGetAllDeptQuery, useGetAllTasksQuery } = GlobalTaskApi;
