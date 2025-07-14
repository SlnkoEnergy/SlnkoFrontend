import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/tasks`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    // POST: Create a new task
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `create-task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Task"],
    }),

    // GET: Fetch all tasks with filters
    getAllTasks: builder.query({
      query: ({ page = 1, search = "", status = "", createdAt = "" }) =>
        `get-task?page=${page}&search=${search}&status=${status}&createdAt=${createdAt}`,
      providesTags: ["Task"],
    }),
  }),
});

// Export hooks
export const { useCreateTaskMutation, useGetAllTasksQuery } = taskApi;
