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
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `create-task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const { useCreateTaskMutation } = taskApi;
