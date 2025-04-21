import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsApi = createApi({
  reducerPath: "engsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Eng"],
  endpoints: (builder) => ({
    // getEngs: builder.query({
    //   query: () => "get-all-task",
    //   providesTags: ["Eng"],
      
    // }),
    addEng: builder.mutation({
      query: (addBOM) => ({
        url: "/add-bom-master",
        method: "POST",
        body: addBOM,
      }),
      invalidatesTags: ["Eng"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddEngMutation
} = engsApi;

