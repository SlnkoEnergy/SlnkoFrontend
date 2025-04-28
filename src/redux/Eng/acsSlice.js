import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsAcCableApi = createApi({
  reducerPath: "engsAcCableApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["AcCable"],
  endpoints: (builder) => ({
    getAcCable: builder.query({
      query: () => "get-accable-master",
      providesTags: ["AcCable"],
      
    }),
    addAcCable: builder.mutation({
      query: (addAcCable) => ({
        url: "/add-accabel-master",
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

