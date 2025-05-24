import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://dev.api.slnkoprotrac.com/v1/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token); // ✅ Match backend expectation
    }
    return headers;
  },
});
export const engsApi = createApi({
  reducerPath: "engsApi",
  baseQuery,
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

