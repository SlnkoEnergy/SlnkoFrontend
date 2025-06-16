import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsModuleApi = createApi({
  reducerPath: "engsModuleApi",
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
  tagTypes: ["Module"],
  endpoints: (builder) => ({
    getModules: builder.query({
      query: () => "get-module-master",
      providesTags: ["Module"],
      
    }),
    addModule: builder.mutation({
      query: (addModule) => ({
        url: "/add-module-master",
        method: "POST",
        body: addModule,
      }),
      invalidatesTags: ["Module"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddModuleMutation,
useGetModulesQuery
} = engsModuleApi;

