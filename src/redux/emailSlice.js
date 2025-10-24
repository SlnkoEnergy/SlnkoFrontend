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
      query: ({ page = 1, search = "", limit = 10, status, tags }) =>
        `?page=${page}&search=${search}&limit=${limit}&status=${status}&tags=${tags}`,
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
    getUniqueTags: builder.query({
      query: () => "/tags",
      providesTags: (result, error, id) => [{ type: "Email", id }],
    }),

    //Templates
    getEmailTemplate: builder.query({
      query: ({ page = 1, search = "", limit = 10, tags }) =>
        `/template?page=${page}&search=${search}&limit=${limit}&tags=${tags}`,
      transformResponse: (response) => ({
        data: response.data || [],
        pagination: response?.pagination || {},
      }),
      providesTags: () => [{ type: "Email", id: "LIST" }],
    }),
    createEmailTemplate: builder.mutation({
      query: (data) => ({
        url: `/template`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Email", id: "LIST" }],
    }),
    getEmailTemplateById: builder.query({
      query: (id) => `/template/${id}`,
      providesTags: (result, error, id) => [{ type: "Email", id }],
    }),
    updateEmailTemplate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/template/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Email", id },
        { type: "Email", id: "LIST" },
      ],
    }),
    updateEmailTemplateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/template/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Email", id },
        { type: "Email", id: "LIST" },
      ],
    }),
    getTemplateUniqueTags: builder.query({
      query: () => `/template/tags`,
      providesTags: (result, error, id) => [{ type: "Email", id }],
    }),
  }),
});

export const {
  useGetEmailQuery,
  useGetEmailByIdQuery,
  useUpdateEmailStatusMutation,
  useGetUniqueTagsQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useGetEmailTemplateByIdQuery,
  useUpdateEmailTemplateMutation,
  useUpdateEmailTemplateStatusMutation,
  useGetTemplateUniqueTagsQuery,
} = emailApi;
