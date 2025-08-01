import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsHTPanelApi = createApi({
  reducerPath: "engsHTPanelApi",
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
  tagTypes: ["HTPanel"],
  endpoints: (builder) => ({
    getHTPanels: builder.query({
      query: () => "get-htpanel-master",
      providesTags: ["HTPanel"],
      
    }),
    addHTPanel: builder.mutation({
      query: (addHTPanel) => ({
        url: "/add-htpanel-master",
        method: "POST",
        body: addHTPanel,
      }),
      invalidatesTags: ["HTPanel"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddHTPanelMutation,
useGetHTPanelsQuery
} = engsHTPanelApi;

