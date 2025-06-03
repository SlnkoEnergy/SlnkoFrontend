import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsPoolingApi = createApi({
  reducerPath: "engsPoolingApi",
    baseQuery,
  tagTypes: ["Pooling"],
  endpoints: (builder) => ({
    getPoolings: builder.query({
      query: () => "get-pooling-station-master",
      providesTags: ["Pooling"],
    }),
    addPooling: builder.mutation({
      query: (addPooling) => ({
        url: "add-pooling-station-master",
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

export const { useAddPoolingMutation, useGetPoolingsQuery } = engsPoolingApi;
