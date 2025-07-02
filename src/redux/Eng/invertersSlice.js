import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsInverterApi = createApi({
  reducerPath: "engsInverterApi",
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
  tagTypes: ["Inverter"],
  endpoints: (builder) => ({
    getInverters: builder.query({
      query: () => "get-master-inverter",
      providesTags: ["Inverter"],
      
    }),
    addInverter: builder.mutation({
      query: (addInverter) => ({
        url: "/add-inveter-master",
        method: "POST",
        body: addInverter,
      }),
      invalidatesTags: ["Inverter"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddInverterMutation,
useGetInvertersQuery
} = engsInverterApi;

