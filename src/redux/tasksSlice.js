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
export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => "get-all-task",
      providesTags: ["Task"],
      
    }),
    addTasks: builder.mutation({
      query: (newTask) => ({
        url: "/add-task",
        method: "POST",
        body: newTask,
      }),
      invalidatesTags: ["Task"],
    }),
    updateTaskStatus: builder.mutation({
      query: (_id) => ({
        url: "update-task-status",
        method: "PUT",
        body: { _id },
      }),
    }),
    
    getTasksHistory: builder.query({
      query: () => "get-task-history",
      providesTags: ["Task"],
      
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTasksMutation,
  useUpdateTaskStatusMutation,
  useGetTasksHistoryQuery
} = tasksApi;

