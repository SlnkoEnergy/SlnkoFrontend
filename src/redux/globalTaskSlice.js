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
    createTask: builder.mutation({
      query: ({ payload, team }) => ({
        url: `tasks/create-task${team ? `?team=${team}` : ""}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["GlobalTask"],
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

export const { useCreateTaskMutation, useGetAllUserQuery, useGetAllDeptQuery } = GlobalTaskApi;
