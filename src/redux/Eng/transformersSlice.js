import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsTransformerApi = createApi({
  reducerPath: "engsTransformerApi",
    baseQuery,
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

