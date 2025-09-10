// src/redux/globalTaskSlice.js
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

// helper: build query string; arrays become CSV
const buildQS = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) p.set(k, v.join(","));
    else p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const GlobalTaskApi = createApi({
  reducerPath: "GlobalTaskApi",
  baseQuery,
  tagTypes: ["Tasks", "Task", "Users", "Depts", "TaskStats"],
  endpoints: (builder) => ({
    /* ------------------------------ CREATE ------------------------------ */
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `tasks/task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Tasks", id: "LIST" },
        { type: "TaskStats", id: "SUMMARY" },
      ],
    }),

    /* --------------------------- LIST / GET ALL ------------------------- */
    getAllTasks: builder.query({
      query: (q = {}) =>
        `tasks/task${buildQS({
          page: q.page ?? 1,
          search: q.search ?? "",
          status: q.status ?? "",
          from: q.from ?? "",
          to: q.to ?? "",
          deadlineFrom: q.deadlineFrom ?? "",
          deadlineTo: q.deadlineTo ?? "",
          department: q.department ?? "",
          limit: q.limit ?? "",
          hide_completed: q.hide_completed ?? false,
          hide_inprogress: q.hide_inprogress ?? false,
          hide_pending: q.hide_pending ?? false,
          assignedToId: q.assignedToId ?? "",
          createdById: q.createdById ?? "",
          priorityFilter: q.priorityFilter ?? "",
        })}`,
      providesTags: (result) => {
        const items = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.tasks)
          ? result.tasks
          : [];
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
      query: (id) => ({ url: `tasks/task/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Task", id }],
    }),

    /* ------------------------- STATUS UPDATE (PUT) ---------------------- */
    updateTaskStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `tasks/${id}/updateTaskStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
        { type: "TaskStats", id: "SUMMARY" },
      ],
    }),

    /* ------------------------------ UPDATE ------------------------------ */
    updateTask: builder.mutation({
      query: ({ id, body }) => {
        const q = { url: `tasks/task/${id}`, method: "PUT", body };
        if (typeof FormData !== "undefined" && body instanceof FormData) {
          q.headers = undefined; // let browser set multipart headers
        }
        return q;
      },
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
        { type: "TaskStats", id: "SUMMARY" },
      ],
    }),

    /* ------------------------------ DELETE ------------------------------ */
    deleteTask: builder.mutation({
      query: (id) => ({ url: `tasks/task/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Task", id },
        { type: "Tasks", id: "LIST" },
        { type: "TaskStats", id: "SUMMARY" },
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
      query: ({ department = "" } = {}) => ({
        url: `all-user?department=${department}`,
        method: "GET",
      }),
      providesTags: [{ type: "Users", id: "LIST" }],
    }),

    getAllDept: builder.query({
      query: () => ({ url: "all-dept", method: "GET" }),
      providesTags: [{ type: "Depts", id: "LIST" }],
    }),

    createSubTask: builder.mutation({
      query: ({ taskId, body }) => {
        const q = { url: `tasks/subtask/${taskId}`, method: "PUT", body };
        if (typeof FormData !== "undefined" && body instanceof FormData)
          q.headers = undefined;
        return q;
      },
      invalidatesTags: (_res, _err, { taskId }) => [
        { type: "Task", id: taskId },
        { type: "Tasks", id: "LIST" },
        { type: "TaskStats", id: "SUMMARY" },
      ],
    }),

    /* --------------------------- DASHBOARD STATS ------------------------ */
    getTaskStats: builder.query({
      query: (params = {}) => ({
        url: `tasks/taskcards${buildQS(params)}`,
        method: "GET",
      }),
      providesTags: [{ type: "TaskStats", id: "SUMMARY" }],
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
  useCreateSubTaskMutation,
  useGetTaskStatsQuery,
} = GlobalTaskApi;
