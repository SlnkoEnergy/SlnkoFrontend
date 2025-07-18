import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";

export const engsLTPanelApi = createApi({
  reducerPath: "engsLTPanelApi",
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
  tagTypes: ["LTPanel"],
  endpoints: (builder) => ({
    getLTPanels: builder.query({
      query: () => "get-ltpanel-master",
      providesTags: ["LTPanel"],
      
    }),
    addLTPanel: builder.mutation({
      query: (addLTPanel) => ({
        url: "/add-ltpanel-master",
        method: "POST",
        body: addLTPanel,
      }),
      invalidatesTags: ["LTPanel"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddLTPanelMutation,
useGetLTPanelsQuery
} = engsLTPanelApi;

