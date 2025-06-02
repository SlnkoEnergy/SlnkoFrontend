import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsDcCableApi = createApi({
  reducerPath: "engsDcCableApi",
    baseQuery,
  tagTypes: ["DcCable"],
  endpoints: (builder) => ({
    getDcCable: builder.query({
      query: () => "get-dc-cabel-master",
      providesTags: ["DcCable"],
      
    }),
    addDcCable: builder.mutation({
      query: (addDcCable) => ({
        url: "/add-dc-cabel-master",
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

