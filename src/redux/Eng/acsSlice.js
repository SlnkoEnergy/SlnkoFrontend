import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsAcCableApi = createApi({
  reducerPath: "engsAcCableApi",
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

