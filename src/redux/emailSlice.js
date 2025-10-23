import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/email`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const emailApi = createApi({
  reducerPath: "emailApi",
  baseQuery,
  tagTypes: ["Email"],
  endpoints: (builder) => ({
    getEmail: builder.query({
      query: ({ page = 1, search = "", limit = 10, status }) =>
        `?page=${page}&search=${search}&limit=${limit}&status=${status}`,
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response?.pagination || {},
      }),
      providesTags: () => [{ type: "Email", id: "LIST" }],
    }),
    getEmailById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Email", id }],
    }),
    updateEmailStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Email", id },
        { type: "Email", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmailQuery,
  useGetEmailByIdQuery,
  useUpdateEmailStatusMutation,
} = emailApi;
