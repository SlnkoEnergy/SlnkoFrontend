import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsBOSApi = createApi({
  reducerPath: "engsBOSApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["BOS"],
  endpoints: (builder) => ({
    getBOS: builder.query({
      query: () => "get-bos-master",
      providesTags: ["BOS"],
      
    }),
    addBOS: builder.mutation({
      query: (addBOS) => ({
        url: "/add-bos-master",
        method: "POST",
        body: addBOS,
      }),
      invalidatesTags: ["BOS"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddBOSMutation,
useGetBOSQuery
} = engsBOSApi;

