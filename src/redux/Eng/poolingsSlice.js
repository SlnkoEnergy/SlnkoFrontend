import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsPoolingApi = createApi({
  reducerPath: "engsPoolingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Pooling"],
  endpoints: (builder) => ({
    getPoolings: builder.query({
      query: () => "/get-pooling",
      providesTags: ["Pooling"],
      
    }),
    addPooling: builder.mutation({
      query: (addPooling) => ({
        url: "/add-pooling-master",
        method: "POST",
        body: addPooling,
      }),
      invalidatesTags: ["Pooling"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddPoolingMutation,
useGetPoolingsQuery
} = engsPoolingApi;

