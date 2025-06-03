import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsAcCableApi = createApi({
  reducerPath: "engsAcCableApi",
    baseQuery,
  tagTypes: ["AcCable"],
  endpoints: (builder) => ({
    getAcCable: builder.query({
      query: () => "get-accabel-master",
      providesTags: ["AcCable"],
      
    }),
    addAcCable: builder.mutation({
      query: (addAcCable) => ({
        url: "add-accabel-master",
        method: "POST",
        body: addAcCable,
      }),
      invalidatesTags: ["AcCable"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddAcCableMutation,
useGetAcCableQuery
} = engsAcCableApi;

