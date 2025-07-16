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
        url: `tasks/task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["GlobalTask"],
    }),

    // GET: Fetch all tasks with filters
    getAllTasks: builder.query({
      query: ({
        page = 1,
        search = "",
        status = "",
        createdAt = "",
        department = "",
        limit = "",
      }) =>
        `tasks/task?page=${page}&search=${search}&status=${status}&createdAt=${createdAt}&department=${department}&limit=${limit}`,
      providesTags: ["Task"],
    }),

    getAllUser: builder.query({
      query: () => ({
        url: "all-user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getAllDept: builder.query({
      query: () => ({
        url: "all-dept",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getTaskById: builder.query({
      query: (id) => ({
        url: `tasks/task/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `tasks/${id}/updateTaskStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
      providesTags: ["User"],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/task/${id}`,
        method: "DELETE",
      }),
    }),
    exportTasksToCsv: builder.mutation({
      query: (ids) => ({
        url: "tasks/exportTocsv",
        method: "POST",
        body: { ids },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllUserQuery,
  useGetAllDeptQuery,
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useExportTasksToCsvMutation,
} = GlobalTaskApi;
