// src/redux/postsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) headers.set("x-auth-token", token);
      return headers;
    },
  }),
  tagTypes: ["Posts"],

  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ project_id }) => `/posts/post?project_id=${project_id}`,
      providesTags: (_result, _err, { project_id }) => [
        { type: "Posts", id: project_id },
      ],
    }),
    updatePost: builder.mutation({
      query: ({ project_id, formData }) => ({
        url: `/posts/post?project_id=${project_id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_res, _err, { project_id }) => [
        { type: "Posts", id: project_id },
      ],
    }),

    follow: builder.mutation({
      query: ({ project_id, followers }) => ({
        url: `/posts/follow?project_id=${project_id}`,
        method: "PUT",
        body: { followers },
      }),
      invalidatesTags: (_res, _err, { project_id }) => [
        { type: "Posts", id: project_id },
      ],
    }),
    unfollow: builder.mutation({
      query: ({ project_id, followers }) => ({
        url: `/posts/unfollow?project_id=${project_id}`,
        method: "PUT",
        body: { followers },
      }),
      invalidatesTags: (_res, _err, { project_id }) => [
        { type: "Posts", id: project_id },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useUpdatePostMutation,
  useFollowMutation,
  useUnfollowMutation
} = postsApi;
