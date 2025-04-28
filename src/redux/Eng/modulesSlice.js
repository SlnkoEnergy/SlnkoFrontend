import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsModuleApi = createApi({
  reducerPath: "engsModuleApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
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

