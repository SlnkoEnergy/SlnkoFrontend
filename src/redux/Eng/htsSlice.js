import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsHTPanelApi = createApi({
  reducerPath: "engsHTPanelApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
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

