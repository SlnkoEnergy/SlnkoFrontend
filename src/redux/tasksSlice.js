import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
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

