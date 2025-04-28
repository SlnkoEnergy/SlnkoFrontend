import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsDcCableApi = createApi({
  reducerPath: "engsDcCableApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["DcCable"],
  endpoints: (builder) => ({
    getDcCable: builder.query({
      query: () => "get-dccable-master",
      providesTags: ["DcCable"],
      
    }),
    addDcCable: builder.mutation({
      query: (addDcCable) => ({
        url: "/add-dccabel-master",
        method: "POST",
        body: addDcCable,
      }),
      invalidatesTags: ["DcCable"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddDcCableMutation,
useGetDcCableQuery
} = engsDcCableApi;

