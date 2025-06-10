import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsTransformerApi = createApi({
  reducerPath: "engsTransformerApi",
    baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Transformer"],
  endpoints: (builder) => ({
    getTransformers: builder.query({
      query: () => "get-transformer",
      providesTags: ["Transformer"],
      
    }),
    addTransformer: builder.mutation({
      query: (addTransformer) => ({
        url: "/add-transformer-master",
        method: "POST",
        body: addTransformer,
      }),
      invalidatesTags: ["Transformer"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddTransformerMutation,
useGetTransformersQuery
} = engsTransformerApi;

