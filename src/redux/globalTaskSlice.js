// src/redux/globalTaskSlice.ts (or .js)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) headers.set("x-auth-token", token);
    return headers;
  },
});

export const GlobalTaskApi = createApi({
  reducerPath: "GlobalTaskApi",
  baseQuery,
  // Use consistent tag names throughout
  tagTypes: ["Tasks", "Task", "Users", "Depts"],
  endpoints: (builder) => ({
    /* ------------------------------ CREATE ------------------------------ */
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `tasks/task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      // ensure the list page refetches
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    /* --------------------------- LIST / GET ALL ------------------------- */
    getAllTasks: builder.query({
      query: ({
        page = 1,
        search = "",
        status = "",
        createdAt = "",
        deadline = "",
        department = "",
        limit = "",
        hide_completed = false,
        hide_inprogress = false,
        hide_pending = false,
        assignedToName = "",
        createdByName = "",
      }) =>
        `tasks/task?page=${page}&search=${search}&status=${status}&createdAt=${createdAt}&deadline=${deadline}&department=${department}&limit=${limit}&hide_completed=${hide_completed}&hide_inprogress=${hide_inprogress}&hide_pending=${hide_pending}&assignedToName=${assignedToName}&createdByName=${createdByName}`,
      // Provide LIST tag and (if available) per-item tags for fine-grained invalidation
      providesTags: (result) => {
        const items = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.tasks)
          ? result.tasks
          : []; // fallback if your API wraps the array differently

        return [
          { type: "Tasks", id: "LIST" },
          ...items
            .filter(Boolean)
            .map((t) => (t?._id ? { type: "Task", id: t._id } : null))
            .filter(Boolean),
        ];
      },
    }),

    /* ----------------------------- GET ONE ------------------------------ */
    getTaskById: builder.query({
      query: (id) => ({
        url: `tasks/task/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "Task", id }],
    }),

    /* ------------------------- STATUS UPDATE (PUT) ---------------------- */
    // Matches your backend: PUT /tasks/:id/updateTaskStatus  body: { status, remarks }
    updateTaskStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `tasks/${id}/updateTaskStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
      // Refetch both this task and the list after a status change
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    /* ------------------------------ UPDATE ------------------------------ */
    updateTask: builder.mutation({
      query: ({ id, body }) => {
        const q = { url: `tasks/task/${id}`, method: "PUT", body };
        if (typeof FormData !== "undefined" && body instanceof FormData)
          q.headers = undefined;
        return q;
      },
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
    /* ------------------------------ DELETE ------------------------------ */
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `tasks/task/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    /* ----------------------------- EXPORT ------------------------------- */
    exportTasksToCsv: builder.mutation({
      query: (ids) => ({
        url: "tasks/exportTocsv",
        method: "POST",
        body: { ids },
        responseHandler: (response) => response.blob(),
      }),
    }),

    /* --------------------------- USERS / DEPTS -------------------------- */
    getAllUser: builder.query({
      query: ({ department = "" }) => ({
        url: `all-user?department=${department}`,
        method: "GET",
      }),
      providesTags: [{ type: "Users", id: "LIST" }],
    }),

    getAllDept: builder.query({
      query: () => ({
        url: "all-dept",
        method: "GET",
      }),
      providesTags: [{ type: "Depts", id: "LIST" }],
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
  useUpdateTaskMutation,
} = GlobalTaskApi;
