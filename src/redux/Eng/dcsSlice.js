import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsDcCableApi = createApi({
  reducerPath: "engsDcCableApi",
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

